import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import { getUserProfile } from "@/lib/user-profile";
import { retrieveVerifiedContent, formatRetrievedContext } from "@/lib/tutor/rag-system";
import { responseCache } from "@/lib/cache/response-cache";
import { quickClassify, apiTracker } from "@/lib/cache/api-optimizer";
import { vertexAIClient } from "@/lib/ai/vertex-client";

// Initialize Gemini client (Fallback)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Check if Vertex AI is enabled
const isVertexAIEnabled = process.env.ENABLE_VERTEX_AI === 'true';

// Grade level specific prompts
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
    const systemPrompt = `당신은 학생들의 국어 학습을 돕는 친절한 국어 튜터입니다.

**역할**:
- ${gradeLevelPrompts[gradeLevelMap[gradeLevel] || 'elementary']} 설명합니다
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
            const result = await vertexAIClient.generateContentStream([
              ...formattedHistory.map((m: any) => ({
                role: m.role,
                parts: m.parts
              })),
              { role: 'user', parts: [{ text: message }] }
            ]);

            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
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
              history: formattedHistory
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
