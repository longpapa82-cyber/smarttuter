import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import { generateCacheKey, getCachedResponse, setCachedResponse } from "@/lib/cache/redis";
import { getUserProfile } from "@/lib/user-profile";
import { generateSystemPrompt } from "@/lib/tutor/system-prompt-generator";
import { generateEnhancedSystemPrompt } from "@/lib/tutor/enhanced-system-prompt";
import { contentLevelDetector } from "@/lib/tutor/content-level-detector";
import { getRandomGuidanceMessage } from "@/lib/tutor/guidance-messages";
import { trackLearningEvent } from "@/lib/learning-progress/progress-tracker";
import type { LearningEvent } from "@/lib/learning-progress/types";
import { classifyQuestion, isObviouslyOffTopic } from "@/lib/tutor/question-classifier";
import { filterBySubject } from "@/lib/tutor/response-filter";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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

    // 🎯 Week 1: Subject Classification - Quick pre-filter
    if (isObviouslyOffTopic(message, 'math')) {
      const encoder = new TextEncoder();
      const quickFilterStream = new ReadableStream({
        start(controller) {
          const redirectMsg = `🔢 수학 관련 질문은 **Math Park**에서 도와드릴 수 있어요!

저는 수학 전문 튜터예요. 수학 계산, 문제 풀이, 개념 설명을 도와드려요! 🧮`;
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

    // 🎯 Week 1: AI-based Subject Classification
    const classification = await classifyQuestion(message, 'math');
    const filterResult = filterBySubject(classification, 'math');

    if (!filterResult.shouldRespond) {
      const encoder = new TextEncoder();
      const filterStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: filterResult.redirectMessage })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      // Log filter event
      console.log('[Subject Filter] Math Tutor:', {
        message: message.substring(0, 50),
        detected: classification.subject,
        confidence: classification.confidence,
        filtered: true
      });

      return new Response(filterStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Subject-Filter": classification.subject,
          "X-Filter-Confidence": classification.confidence.toString(),
        },
      });
    }

    // Content level detection
    const levelCheck = await contentLevelDetector.detect(
      message,
      userProfile.gradeLevel,
      'math',
      userProfile.gradeLevelDetail
    );

    // If out of scope, return guidance message
    if (levelCheck.outOfScope && levelCheck.confidence > 0.7) {
      const guidanceMsg = getRandomGuidanceMessage(
        userProfile.gradeLevel,
        'math',
        {
          '학생 이름': userId,
          '현재 학년 적절한 개념': '현재 배우고 있는 내용',
          '관련된 기초 개념': '기초 개념',
        }
      );

      const encoder = new TextEncoder();
      const guidanceStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: guidanceMsg })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(guidanceStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Out-Of-Scope": "true",
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
      'math',
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

    // Generate enhanced system prompt (Week 4: Integrates all accuracy systems)
    const systemPrompt = generateEnhancedSystemPrompt({
      subject: 'math',
      grade: userProfile.gradeLevelDetail || '5',
      schoolLevel: userProfile.gradeLevel,
      studentName: userId,
      includeChainOfThought: true,
      includeRAGContext: false, // Will be enabled in P1-1
      ragContext: undefined
    });

    // Prepare conversation for Gemini API with system instruction
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: systemPrompt,  // System prompt는 여기서 한 번만 설정
    });

    // Build conversation history for Gemini
    const chatHistory = [];
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
      // Start chat with history
      const chat = model.startChat({
        history: chatHistory,
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7,
        },
      });

      // Send message and get stream (system prompt는 이미 모델에 설정됨)
      const result = await chat.sendMessageStream(message);

      // Create a readable stream for the response
      let fullResponse = ''; // Collect full response for caching
      const startTime = Date.now(); // Track response time
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) {
                fullResponse += text; // Accumulate for caching
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();

            // Cache the complete response (fire and forget)
            if (fullResponse.trim()) {
              setCachedResponse(cacheKey, fullResponse, 3600).catch(err => {
                console.error('Failed to cache response:', err);
              });
            }

            // Track learning event (Phase 8: Progress tracking integration)
            const responseTime = Math.round((Date.now() - startTime) / 1000); // seconds
            const learningEvent: LearningEvent = {
              userId,
              eventType: 'question_attempt',
              subject: 'math',
              conceptId: `math_concept_${Date.now()}`, // TODO: Extract concept from message
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

            trackLearningEvent(learningEvent).catch(err => {
              console.error('Failed to track learning event:', err);
            });
          } catch (error) {
            console.error("Streaming error:", error);
            controller.error(error);
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
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
    console.error("Error in math chat API:", error);

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
