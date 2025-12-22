import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import { generateCacheKey, getCachedResponse, setCachedResponse } from "@/lib/cache/redis";
import { getUserProfile } from "@/lib/user-profile";
import { generateSystemPrompt } from "@/lib/tutor/system-prompt-generator";
import { generateEnhancedSystemPrompt } from "@/lib/tutor/enhanced-system-prompt";
import { contentLevelDetector } from "@/lib/tutor/content-level-detector";
import { getRandomGuidanceMessage } from "@/lib/tutor/guidance-messages";
import { enhancedGradeLevelFilter, logGradeLevelDecision } from "@/lib/tutor/enhanced-grade-level-filter";
import { trackLearningEvent } from "@/lib/learning-progress/progress-tracker";
import type { LearningEvent } from "@/lib/learning-progress/types";
import { extractConceptId } from "@/lib/learning/concept-extractor";
import { classifyQuestion, isObviouslyOffTopic } from "@/lib/tutor/question-classifier";
import { filterBySubject } from "@/lib/tutor/response-filter";
import { enhancedFilterBySubject, logFilterDecision } from "@/lib/tutor/enhanced-subject-filter";
import { retrieveVerifiedContent, formatRetrievedContext } from "@/lib/tutor/rag-system";
import { logRAGDirectUsage } from "@/lib/tutor/rag-quality-logger";

import { responseCache } from "@/lib/cache/response-cache";
import { quickClassify, apiTracker } from "@/lib/cache/api-optimizer";
import { vertexAIClient } from "@/lib/ai/vertex-client";
import { intelligentRouter } from "@/lib/ai/intelligent-router";
import { getCurrentDifficulty, difficultyToPromptGuidance } from "@/lib/learning/difficulty-tracker";

// Phase 1: Complexity-Aware System
import { classifyComplexity, getResponseStyle } from "@/lib/tutor/complexity-classifier";
import { generateComplexityAwarePrompt } from "@/lib/tutor/prompt-templates";

// Initialize Gemini client (Fallback)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Check if Vertex AI is enabled
const isVertexAIEnabled = process.env.ENABLE_VERTEX_AI === 'true';

// Grade level specific prompts
const gradeLevelPrompts: Record<string, string> = {
  elementary: "초등학생 수준에 맞게 쉽고 친근한 언어로",
  middle: "중학생 수준에 맞게 개념을 명확하게",
  high: "고등학생 수준에 맞게 심화된 내용을",
  university: "대학교 수준에 맞게 전문적이고 엄밀한 내용을",
};

const gradeLevelMap: Record<string, string> = {
  "초등학교": "elementary",
  "중학교": "middle",
  "고등학교": "high",
  "대학교": "university",
};

export async function POST(req: NextRequest) {
  try {
    const { message, gradeLevel, conversationHistory, userId = 'default' } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Load user profile for grade-level guardrails
    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      return new Response(
        JSON.stringify({ error: "User profile not found. Please complete onboarding." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 🚀 Phase 1: Check smart cache first (saves 4 API calls if hit)
    const gradeStr = String(userProfile.gradeLevelDetail || '5');
    const cachedAnswer = responseCache.get(message, 'social-studies', gradeStr);

    if (cachedAnswer) {
      const encoder = new TextEncoder();
      const cacheStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: cachedAnswer })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      const stats = apiTracker.getStats();
      return new Response(cacheStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Cache-Hit": "smart-cache",
          "X-API-Remaining": stats.remaining.toString(),
        },
      });
    }

    // 🚀 Phase 1: Classify question complexity (NEW - no API call)
    const complexityAnalysis = classifyComplexity(message, 'social-studies');
    console.log(`[Complexity] Social question: "${message.substring(0, 50)}" → ${complexityAnalysis.complexity} (confidence: ${complexityAnalysis.confidence})`);

    // 🚀 Phase 2: Quick keyword-based classification (no API call)
    const quickClassification = quickClassify(message, 'social-studies');

    if (quickClassification && !quickClassification.isOnTopic) {
      apiTracker.track('quick-classify-redirect');
      const encoder = new TextEncoder();
      const redirectStream = new ReadableStream({
        start(controller) {
          const redirectMsg = `🌍 **사회 튜터**에서 도와드려요! 사회 관련 질문을 해주세요.`;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: redirectMsg })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(redirectStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Subject-Filter": "off-topic-quick-no-api",
        },
      });
    }

    // 🎯 Week 1: Subject Classification - Quick pre-filter
    if (isObviouslyOffTopic(message, 'social-studies')) {
      const encoder = new TextEncoder();
      const quickFilterStream = new ReadableStream({
        start(controller) {
          const redirectMsg = `🏛️ 사회 관련 질문은 **Social Studies Hub**에서 도와드릴 수 있어요!

저는 사회 전문 튜터예요. 지리, 역사, 정치, 문화 개념 설명을 도와드려요! 🌍`;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: redirectMsg })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(quickFilterStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Subject-Filter": "off-topic-quick",
        },
      });
    }

    // 🚀 Phase 5: RAG-FIRST Pipeline - Execute RAG retrieval BEFORE Enhanced Filter
    // Rationale: RAG Direct (90%+ confidence) should return immediately without filter overhead
    let ragContext: string | undefined = undefined;
    let ragDirectAnswer: string | undefined = undefined;

    try {
      const gradeStr = String(userProfile.gradeLevelDetail || '5');
      const retrievedContext = await retrieveVerifiedContent(
        message,
        'social-studies',
        gradeStr,
        3 // Max 3 relevant content pieces
      );

      if (retrievedContext.content.length > 0) {
        ragContext = formatRetrievedContext(retrievedContext);

        // If RAG confidence is very high (>90%) and content is comprehensive,
        // we can answer directly without API call OR Enhanced Filter
        const avgConfidence = retrievedContext.content.reduce((sum, c) => sum + (c.confidence ?? 1.0), 0) / retrievedContext.content.length;

        // Phase 5: RAG Direct bypasses Enhanced Filter for high-confidence answers
        if (avgConfidence > 0.9 && retrievedContext.content.length >= 1) {
          // Use Korean content if available, fallback to English
          const contentToUse = retrievedContext.content.map(c => c.contentKo || c.content);

          // Try to construct answer from RAG content only
          ragDirectAnswer = `📚 **검증된 사회 교육 자료를 바탕으로 답변드려요:**

${contentToUse.join('\n\n---\n\n')}

💡 더 궁금한 점이 있으시면 언제든 질문해주세요!`;

          console.log(`[Social Studies RAG Direct KO] High confidence (${avgConfidence.toFixed(2)}) - answering without API or filter`);

          // Cache this RAG-based answer
          responseCache.set(message, 'social-studies', gradeStr, ragDirectAnswer);

          // 📊 Log RAG Direct usage for quality metrics
          logRAGDirectUsage({
            subject: 'social-studies',
            question: message,
            confidence: avgConfidence,
            contentCount: retrievedContext.content.length,
            ragDirectUsed: true,
            timestamp: new Date().toISOString(),
            gradeLevel: gradeStr,
            relevanceScores: retrievedContext.relevanceScores,
            apiSaved: true,
          });

          const encoder = new TextEncoder();
          const ragStream = new ReadableStream({
            start(controller) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: ragDirectAnswer })}\n\n`));
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
            },
          });

          const stats = apiTracker.getStats();
          return new Response(ragStream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              "Connection": "keep-alive",
              "X-RAG-Direct": "true",
              "X-API-Saved": "4",
              "X-API-Remaining": stats.remaining.toString(),
              "X-Filter-Bypassed": "true", // Phase 5: Enhanced Filter bypassed
            },
          });
        } else {
          // RAG content retrieved but didn't meet criteria for RAG Direct
          // 📊 Log for quality metrics and continue to Enhanced Filter
          logRAGDirectUsage({
            subject: 'social-studies',
            question: message,
            confidence: avgConfidence,
            contentCount: retrievedContext.content.length,
            ragDirectUsed: false,
            timestamp: new Date().toISOString(),
            gradeLevel: gradeStr,
            relevanceScores: retrievedContext.relevanceScores,
            apiSaved: false,
          });
          console.log(`[Social Studies RAG] Low confidence (${avgConfidence.toFixed(2)}) - continuing to Enhanced Filter`);
        }
      }
    } catch (error) {
      console.error('[RAG] Failed to retrieve verified content:', error);
      // Continue to Enhanced Filter - graceful degradation
    }

    // 🎯 Phase 2-1: Enhanced AI-based Subject Classification with Confidence Threshold
    // Phase 5: Now only executed if RAG Direct failed
    // ⚠️ ENHANCED FILTER DISABLED: Too strict, causing false negatives on valid Social Studies questions
    /* FILTER DISABLED - ORIGINAL CODE BELOW
    const classification = await classifyQuestion(message, 'social-studies');
    const enhancedFilterResult = enhancedFilterBySubject(
      classification,
      quickClassification,
      'social-studies'
    );

    // Log filter decision with detailed info
    logFilterDecision('social-studies', message, enhancedFilterResult);

    if (!enhancedFilterResult.shouldRespond) {
    */
    // Enhanced Filter bypassed - always allow Social Studies questions
    if (false) { // Filter disabled
      const encoder = new TextEncoder();
      const filterStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: "Filter disabled" })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(filterStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // ⚠️ GRADE LEVEL FILTER DISABLED: Allow all questions
    /* GRADE FILTER DISABLED - ORIGINAL CODE BELOW
    const levelCheck = await contentLevelDetector.detect(
      message,
      userProfile.gradeLevel,
      'social-studies',
      userProfile.gradeLevelDetail
    );

    const gradeLevelResult = enhancedGradeLevelFilter(
      levelCheck,
      userProfile.gradeLevel,
      'social-studies'
    );

    // Log grade level decision with detailed info
    logGradeLevelDecision('social-studies', message, userProfile.gradeLevel, gradeLevelResult);

    if (!gradeLevelResult.shouldRespond) {
    */
    // Grade level filter bypassed
    if (false) { // Filter disabled
      const encoder = new TextEncoder();
      const guidanceStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: "Grade filter disabled" })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(guidanceStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      const encoder = new TextEncoder();
      const errorStream = new ReadableStream({
        start(controller) {
          const errorMsg = `⚠️ API 키가 설정되지 않았습니다

💡 **해결 방법:**

**학생/일반 사용자:**
- 관리자에게 문의하여 API 키를 설정해달라고 요청해주세요

**관리자/개발자:**

1️⃣ **Google AI Studio에서 API 키 발급**
   - https://aistudio.google.com/apikey 접속
   - "Create API Key" 클릭
   - 생성된 키 복사

2️⃣ **환경 변수 설정**
   - 프로젝트 루트에 .env.local 파일 생성
   - GEMINI_API_KEY=your_api_key_here 추가

3️⃣ **Vercel 배포 시 환경 변수 설정**
   - Vercel 대시보드 접속
   - Project Settings → Environment Variables
   - GEMINI_API_KEY 추가 및 배포

📝 Gemini API는 무료 tier에서도 충분한 할당량을 제공합니다!`;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: errorMsg })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });
      return new Response(errorStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Get grade level prompt
    const gradeLevelKey = gradeLevelMap[gradeLevel] || "elementary";
    const gradeLevelInstruction = gradeLevelPrompts[gradeLevelKey];

    // Generate cache key
    const cacheKey = generateCacheKey(
      'social-studies',
      message,
      gradeLevel,
      conversationHistory || []
    );

    // Try to get cached response
    const cachedResponse = await getCachedResponse(cacheKey);
    if (cachedResponse) {
      // Return cached response as stream
      const encoder = new TextEncoder();
      const cachedStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: cachedResponse })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });
      return new Response(cachedStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Cache-Hit": "true",
        },
      });
    }

    // Phase 5: RAG retrieval moved to BEFORE Enhanced Filter (see lines 149-241)
    // ragContext variable is already set from early RAG execution if applicable

    // Get current difficulty level (P0.1: Adaptive Difficulty)
    const currentDifficulty = await getCurrentDifficulty(userId, 'social-studies', userProfile.gradeLevel);
    const difficultyGuidance = difficultyToPromptGuidance(currentDifficulty);

    // Generate enhanced system prompt (Week 4: Integrates all accuracy systems)
    const gradeForPrompt = String(userProfile.gradeLevelDetail || '5');

    // Phase 1: Complexity-Aware Prompt Generation (NEW)
    let systemPrompt: string;

    if (complexityAnalysis.complexity === 'simple') {
      // For SIMPLE questions: Use concise prompt template
      console.log('[Prompt] Using CONCISE mode for simple question');
      systemPrompt = generateComplexityAwarePrompt({
        subject: 'social-studies',
        complexity: 'simple',
        grade: gradeForPrompt,
        schoolLevel: userProfile.gradeLevel,
        question: message
      });

      // Add RAG context if available (for simple questions, RAG can answer directly)
      if (ragContext) {
        systemPrompt += `\n\n참고 자료:\n${ragContext}`;
      }
    } else {
      // For INTERMEDIATE/ADVANCED questions: Use standard enhanced prompt with complexity guidance
      console.log(`[Prompt] Using STANDARD mode for ${complexityAnalysis.complexity} question`);

      // Generate base prompt
      const basePrompt = generateEnhancedSystemPrompt({
        subject: 'social-studies',
        grade: gradeForPrompt,
        schoolLevel: userProfile.gradeLevel,
        studentName: userId,
        includeChainOfThought: complexityAnalysis.complexity === 'advanced', // Only for advanced
        difficultyLevel: currentDifficulty,
        difficultyGuidance: difficultyGuidance,
        includeRAGContext: ragContext !== undefined, // P1-1: Enable RAG
        ragContext
      });

      // Add complexity-specific guidance
      const responseStyle = getResponseStyle(complexityAnalysis.complexity);
      const complexityGuidance = `\n\n답변 길이 가이드: 최대 ${responseStyle.maxSentences}문장 내로 ${responseStyle.style} 스타일로 작성하세요.`;

      systemPrompt = basePrompt + complexityGuidance;
    }

    // Decide which AI service to use
    let modelTier: 'flash' | 'pro' = 'flash'; // Default to flash
    let useVertexAI = isVertexAIEnabled;

    // If Vertex AI is enabled, use intelligent router to decide tier
    if (isVertexAIEnabled) {
      try {
        const routingDecision = await intelligentRouter.routeQuestion(
          message,
          'social-studies',
          gradeStr,
          conversationHistory
        );
        modelTier = routingDecision.tier;
        console.log(`[Intelligent Router] ${routingDecision.model} (${routingDecision.reasoning})`);
      } catch (error) {
        console.error('[Router] Failed to route question:', error);
        // Fallback to flash tier
        modelTier = 'flash';
      }
    }

    // Prepare conversation for Gemini API with system instruction (Fallback)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: systemPrompt,  // System prompt는 여기서 한 번만 설정
    });

    // Build conversation history for Gemini
    const chatHistory: Array<{ role: string; parts: Array<{ text: string }> }> = [];
    const recentHistory = conversationHistory?.slice(-10) || [];

    for (const msg of recentHistory) {
      chatHistory.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      });
    }

    // Ensure chat history starts with 'user' role (Gemini requirement)
    if (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
      // Remove leading model messages
      while (chatHistory.length > 0 && chatHistory[0].role === 'model') {
        chatHistory.shift();
      }
    }

    // Create streaming response with better error handling
    const encoder = new TextEncoder();

    try {
      // Track API call
      apiTracker.track('chat-social');

      // Create a readable stream for the response
      let fullResponse = ''; // Collect full response for caching
      const startTime = Date.now(); // Track response time
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            if (useVertexAI) {
              // ✅ Use Vertex AI (Unlimited Quota)
              console.log(`[Vertex AI] Using ${modelTier} tier for response`);

              const prompt = `${systemPrompt}

**대화 내역:**
${recentHistory.map((msg: { role: string; content: string }) => `${msg.role === 'user' ? '학생' : '튜터'}: ${msg.content}`).join('\n\n')}

**새 질문:**
학생: ${message}

튜터:`;

              const streamIterator = await vertexAIClient.generateContentStream(
                prompt,
                modelTier,
                {
                  temperature: 0.7,
                  maxTokens: 4096, // Increased from 3072 to allow longer responses
                }
              );

              for await (const text of streamIterator) {
                if (text) {
                  fullResponse += text;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                }
              }
            } else {
              // ⚠️  Fallback to Gemini API (50/day limit)
              console.log('[Gemini API] Using fallback (quota limited)');

              const chat = model.startChat({
                history: chatHistory,
                generationConfig: {
                  maxOutputTokens: 4096, // Increased from 2048 to allow longer responses
                  temperature: 0.7,
                },
              });

              const result = await chat.sendMessageStream(message);

              for await (const chunk of result.stream) {
                const text = chunk.text();
                if (text) {
                  fullResponse += text;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                }
              }
            }

            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();

            // Cache the complete response (fire and forget)
            if (fullResponse.trim()) {
              setCachedResponse(cacheKey, fullResponse, 3600).catch(err => {
                console.error('Failed to cache response:', err);
              });

              // Smart cache for similarity matching
              responseCache.set(message, 'social-studies', gradeStr, fullResponse);
            }

            // Track learning event (Phase 8: Progress tracking integration)
            // Extract meaningful concept from the question using AI
            const responseTime = Math.round((Date.now() - startTime) / 1000); // seconds

            extractConceptId(message, 'social-studies', gradeStr)
              .then(conceptId => {
                const learningEvent: LearningEvent = {
                  userId,
                  eventType: 'question_attempt',
                  subject: 'social-studies',
                  conceptId, // AI-extracted concept (e.g., "social-studies_world_war_ii", "social-studies_economics")
                  gradeLevel: userProfile.gradeLevel as any,
                  success: true, // Assume success if we got a response
                  timestamp: new Date(),
                  responseTime,
                  hintsUsed: 0, // TODO: Track hints if system provides them
                  metadata: {
                    question: message.substring(0, 200), // Store truncated question
                    outOfScope: false,
                  },
                };

                return trackLearningEvent(learningEvent);
              })
              .catch(err => {
                console.error('Failed to extract concept or track learning event:', err);
              });
          } catch (error) {
            console.error("Streaming error:", error);
            controller.error(error);
          }
        },
      });

      const stats = apiTracker.getStats();
      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-API-Remaining": stats.remaining.toString(),
          "X-Cache-Stats": JSON.stringify(responseCache.getStats()),
        },
      });
    } catch (apiError: any) {
      // Handle API-specific errors (quota issues, rate limits, etc.)
      console.error("Gemini API error:", apiError);

      // Check for quota/rate limit error
      const isQuotaError =
        apiError.message?.includes('quota') ||
        apiError.message?.includes('rate limit') ||
        apiError.status === 429;

      const errorMsg = isQuotaError
        ? `⏱️ API 요청 한도에 도달했습니다

💡 **해결 방법:**

1️⃣ **잠시 기다렸다가 다시 시도**
   - 약 1분 정도 기다린 후 다시 질문해주세요
   - Rate limit은 보통 몇 분 후 자동으로 해제됩니다

2️⃣ **관리자에게 문의**
   - API 할당량이 소진되었을 수 있습니다
   - 관리자에게 API 키 업그레이드를 요청해주세요

3️⃣ **나중에 다시 시도**
   - 일시적으로 요청이 많은 시간대일 수 있습니다
   - 잠시 후 다시 이용해주세요

📝 불편을 드려 죄송합니다. 곧 다시 이용하실 수 있습니다!`
        : `⚠️ 일시적인 오류가 발생했습니다

💡 **해결 방법:**

1️⃣ **네트워크 연결 확인**
   - 인터넷 연결이 안정적인지 확인해주세요

2️⃣ **다시 시도**
   - 같은 질문을 다시 입력해주세요
   - 대부분의 일시적 오류는 재시도로 해결됩니다

3️⃣ **페이지 새로고침**
   - F5 또는 새로고침 버튼을 눌러주세요

4️⃣ **문제가 계속되면**
   - 관리자에게 문의해주세요
   - 로그를 확인하여 정확한 원인을 파악할 수 있습니다

📝 잠시 후 다시 시도해주세요!`;

      const errorStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: errorMsg })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(errorStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }
  } catch (error: unknown) {
    console.error("Error in social-studies chat API:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return new Response(
      JSON.stringify({
        error: "Failed to process request",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
