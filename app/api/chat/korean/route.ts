import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import { getUserProfile } from "@/lib/user-profile";
import { retrieveVerifiedContent, formatRetrievedContext } from "@/lib/tutor/rag-system";
import { responseCache } from "@/lib/cache/response-cache";
import { quickClassify, apiTracker } from "@/lib/cache/api-optimizer";
import { vertexAIClient } from "@/lib/ai/vertex-client";
import { getCurrentDifficulty, difficultyToPromptGuidance } from "@/lib/learning/difficulty-tracker";
import { classifyQuestion } from "@/lib/tutor/question-classifier";
import { enhancedFilterBySubject, logFilterDecision } from "@/lib/tutor/enhanced-subject-filter";
import { contentLevelDetector } from "@/lib/tutor/content-level-detector";
import { enhancedGradeLevelFilter, logGradeLevelDecision } from "@/lib/tutor/enhanced-grade-level-filter";

// Phase 1: Complexity-Aware System
import { classifyComplexity, getResponseStyle } from "@/lib/tutor/complexity-classifier";
import { generateComplexityAwarePrompt } from "@/lib/tutor/prompt-templates";

// Initialize Gemini client (Fallback)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Check if Vertex AI is enabled
const isVertexAIEnabled = process.env.ENABLE_VERTEX_AI === 'true';

// Grade level specific prompts - 더 세밀한 학년별 맞춤 지도
const getDetailedGradePrompt = (gradeLevel: string, gradeLevelDetail: number | undefined): string => {
  const schoolLevel = gradeLevelMap[gradeLevel] || 'elementary';

  // 초등학교는 학년별로 더 세밀하게 구분
  if (schoolLevel === 'elementary' && gradeLevelDetail) {
    if (gradeLevelDetail <= 2) {
      return `초등 저학년(${gradeLevelDetail}학년) 수준에 맞게:
- 한글 자모음을 정확히 읽을 수 있는 수준
- 한 문장은 5-7단어 이내로 짧게
- 어려운 한자어나 추상적 개념 사용 금지
- 그림이나 이모지로 설명 보조 (예: 🌳, 🏠, 🐶)
- "~해요", "~이에요" 같은 친근한 반말 사용
- 예시는 일상생활에서 볼 수 있는 것으로만`;
    } else if (gradeLevelDetail <= 4) {
      return `초등 중학년(${gradeLevelDetail}학년) 수준에 맞게:
- 기본 문법 용어 사용 가능 (주어, 서술어, 띄어쓰기)
- 한 문장은 8-12단어 정도
- 간단한 설명과 함께 개념 제시
- 학교에서 배우는 내용과 연결
- "~입니다", "~합니다" 존댓말과 "~해요" 반말 적절히 사용`;
    } else {
      return `초등 고학년(${gradeLevelDetail}학년) 수준에 맞게:
- 문법 용어 자유롭게 사용 (품사, 문장성분, 수식어 등)
- 문학 작품 예시 활용 가능
- 개념 설명 후 심화 내용 추가
- 중학교 준비를 위한 용어 미리 소개`;
    }
  }

  return gradeLevelPrompts[schoolLevel] || gradeLevelPrompts.elementary;
};

const gradeLevelPrompts: Record<string, string> = {
  elementary: "초등학생 수준에 맞게 쉬운 단어와 짧은 문장으로",
  middle: "중학생 수준에 맞게 문법 용어를 포함하여 명확하게",
  high: "고등학생 수준에 맞게 문학 이론과 함께 심화된 내용을",
  university: "대학생 수준에 맞게 학술적이고 전문적인 내용을",
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

    // 🚀 Phase 1: Check smart cache first
    const gradeStr = String(userProfile.gradeLevelDetail || '3');
    const cachedAnswer = responseCache.get(message, 'korean', gradeStr);

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
    const complexityAnalysis = classifyComplexity(message, 'korean');
    console.log(`[Complexity] Korean question: "${message.substring(0, 50)}" → ${complexityAnalysis.complexity} (confidence: ${complexityAnalysis.confidence})`);

    // 🚀 Phase 2: Quick keyword-based classification (no API call)
    const quickClassification = quickClassify(message, 'korean');

    if (quickClassification && !quickClassification.isOnTopic) {
      apiTracker.track('quick-classify-redirect');
      const encoder = new TextEncoder();
      const redirectStream = new ReadableStream({
        start(controller) {
          const redirectMsg = `📚 **국어 튜터**에서 도와드려요! 국어 관련 질문을 해주세요.

저는 국어 전문 튜터예요. 읽기, 쓰기, 문법, 문학을 도와드려요! 📖`;
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
        },
      });
    }

    // 🎯 Phase 2-1: Enhanced AI-based Subject Classification with Confidence Threshold
    const classification = await classifyQuestion(message, 'korean');
    const enhancedFilterResult = enhancedFilterBySubject(
      classification,
      quickClassification,
      'korean'
    );

    // Log filter decision with detailed info
    logFilterDecision('korean', message, enhancedFilterResult);

    if (!enhancedFilterResult.shouldRespond) {
      const encoder = new TextEncoder();
      const filterStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: enhancedFilterResult.redirectMessage })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(filterStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Subject-Filter": classification.subject,
          "X-Filter-Confidence": (enhancedFilterResult.confidence * 100).toFixed(1),
          "X-Validation-Method": enhancedFilterResult.validationMethod,
          "X-Filter-Reason": enhancedFilterResult.filterReason,
        },
      });
    }

    // 🎯 Phase 2-2: Enhanced Grade Level Detection with Review Allowance
    const levelCheck = await contentLevelDetector.detect(
      message,
      userProfile.gradeLevel,
      'korean',
      userProfile.gradeLevelDetail
    );

    const gradeLevelResult = enhancedGradeLevelFilter(
      levelCheck,
      userProfile.gradeLevel,
      'korean'
    );

    // Log grade level decision with detailed info
    logGradeLevelDecision('korean', message, userProfile.gradeLevel, gradeLevelResult);

    if (!gradeLevelResult.shouldRespond) {
      const encoder = new TextEncoder();
      const guidanceStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: gradeLevelResult.guidanceMessage })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(guidanceStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Grade-Level-Filter": gradeLevelResult.levelAssessment,
          "X-Grade-Confidence": (gradeLevelResult.confidence * 100).toFixed(1),
          "X-Filter-Reason": gradeLevelResult.filterReason,
        },
      });
    }

    // 🚀 Phase 3: RAG retrieval for verified content
    let ragContext: string | undefined = undefined;
    let ragDirectAnswer: string | undefined = undefined;

    try {
      const retrievedContext = await retrieveVerifiedContent(
        message,
        'korean',
        gradeStr,
        3
      );

      if (retrievedContext.content.length > 0) {
        ragContext = formatRetrievedContext(retrievedContext);

        const avgConfidence = retrievedContext.content.reduce(
          (sum, c) => sum + (c.confidence ?? 1.0),
          0
        ) / retrievedContext.content.length;

        // ✅ RAG Direct ENABLED: Korean content now complete (14 items)
        // High confidence answers served directly from verified content
        if (avgConfidence > 0.9 && retrievedContext.content.length >= 2) {
          ragDirectAnswer = `📚 **검증된 국어 교육 자료를 바탕으로 답변드려요:**

${retrievedContext.content.map(c => c.contentKo || c.content).join('\n\n---\n\n')}

💡 더 궁금한 점이 있으시면 언제든 질문해주세요!`;

          console.log(`[Korean RAG Direct] High confidence (${avgConfidence.toFixed(2)})`);
          responseCache.set(message, 'korean', gradeStr, ragDirectAnswer);

          const encoder = new TextEncoder();
          const ragStream = new ReadableStream({
            start(controller) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: ragDirectAnswer })}\n\n`));
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
            },
          });

          return new Response(ragStream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              "Connection": "keep-alive",
              "X-RAG-Direct": "true",
            },
          });
        }
      }
    } catch (error) {
      console.error('[Korean RAG Error]', error);
    }

    // 🚀 Phase 4: Gemini AI 호출
    const gradeForPrompt = String(userProfile.gradeLevelDetail || '5');

    // Phase 1: Complexity-Aware Prompt Generation (NEW)
    let systemPrompt: string;

    if (complexityAnalysis.complexity === 'simple') {
      // For SIMPLE questions: Use concise prompt template
      console.log('[Prompt] Using CONCISE mode for simple question');
      systemPrompt = generateComplexityAwarePrompt({
        subject: 'korean',
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
      // For INTERMEDIATE/ADVANCED questions: Use standard custom prompt with complexity guidance
      console.log(`[Prompt] Using STANDARD mode for ${complexityAnalysis.complexity} question`);

      const detailedGradePrompt = getDetailedGradePrompt(gradeLevel, undefined);

      // Generate base prompt (keep existing Korean-specific prompt structure)
      const basePrompt = `당신은 학생들의 국어 학습을 돕는 친절한 국어 튜터입니다.

**역할**:
- ${detailedGradePrompt} 설명합니다
- 맞춤법, 띄어쓰기, 문법을 정확하게 가르칩니다
- 문학 작품은 작품의 배경과 함께 설명합니다
- 학생이 이해할 때까지 친절하게 반복 설명합니다

**지침**:
1. 모든 설명은 한국어로만 합니다
2. 어려운 용어는 쉽게 풀어서 설명합니다
3. 예시를 많이 들어 설명합니다
4. 학생의 질문 의도를 정확히 파악합니다
5. 격려와 칭찬을 자주 합니다
6. 한글 쓰기 질문에는 정확한 순서와 방법을 알려줍니다
7. 문법 질문에는 예시를 충분히 들어 설명합니다
8. 문학 질문에는 작품의 배경과 의미를 함께 설명합니다

**금지 사항**:
- 거짓 정보 제공 금지
- 비표준어/은어 사용 금지 (교육 목적 설명 제외)
- 학습과 무관한 대화 금지
- 맞춤법이나 띄어쓰기가 틀린 답변 금지

${ragContext ? `\n**검증된 교육 자료**:\n${ragContext}\n` : ''}

학생의 학년과 수준을 고려하여 친절하고 정확하게 답변해주세요.`;

      // Add complexity-specific guidance
      const responseStyle = getResponseStyle(complexityAnalysis.complexity);
      const complexityGuidance = `\n\n답변 길이 가이드: 최대 ${responseStyle.maxSentences}문장 내로 ${responseStyle.style} 스타일로 작성하세요.`;

      systemPrompt = basePrompt + complexityGuidance;
    }

    const formattedHistory = conversationHistory?.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })) || [];

    let fullResponse = '';
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (isVertexAIEnabled) {
            // Vertex AI streaming
            const historyText = formattedHistory
              .map((m: any) => `${m.role === 'user' ? '학생' : '튜터'}: ${m.parts[0].text}`)
              .join('\n');

            const fullPrompt = historyText
              ? `${historyText}\n학생: ${message}`
              : message;

            const result = await vertexAIClient.generateContentStream(fullPrompt, 'flash', {
              systemInstruction: systemPrompt,
              temperature: 0.7,
              maxTokens: 4096 // Increased from 2048 to allow longer responses
            });

            for await (const chunkText of result) {
              if (chunkText) {
                fullResponse += chunkText;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunkText })}\n\n`));
              }
            }
          } else {
            // Gemini API streaming
            const model = genAI.getGenerativeModel({
              model: "gemini-2.0-flash-exp",
              systemInstruction: systemPrompt
            });

            const chat = model.startChat({
              history: formattedHistory,
              generationConfig: {
                maxOutputTokens: 4096, // Allow longer responses
                temperature: 0.7,
              },
            });

            const result = await chat.sendMessageStream(message);

            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              if (chunkText) {
                fullResponse += chunkText;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunkText })}\n\n`));
              }
            }
          }

          // Cache the response
          responseCache.set(message, 'korean', gradeStr, fullResponse);

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();

          console.log('[Korean Tutor] Response generated successfully');
        } catch (error) {
          console.error('[Korean Streaming Error]', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error('[Korean API Error]', error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
