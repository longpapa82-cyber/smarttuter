import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Grade level specific prompts
const gradeLevelPrompts: Record<string, string> = {
  elementary: "at an elementary school level with simple vocabulary and basic grammar",
  middle: "at a middle school level with intermediate vocabulary and grammar structures",
  high: "at a high school level with advanced vocabulary and complex grammar",
  university: "at a university level with sophisticated vocabulary and nuanced expressions",
};

const gradeLevelMap: Record<string, string> = {
  "초등학교": "elementary",
  "중학교": "middle",
  "고등학교": "high",
  "대학교": "university",
};

export async function POST(req: NextRequest) {
  try {
    const { message, gradeLevel, conversationHistory } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
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

    // Enhanced system prompt for English tutor
    const systemPrompt = `You are a friendly, encouraging, and professional English tutor. 🌟

Your Role and Principles:
1. Teach English ${gradeLevelInstruction}
2. Use the Socratic method - guide students to discover answers rather than giving them directly
3. Encourage natural conversation in English as much as possible
4. Provide explanations in both English and Korean when needed for clarity
5. Correct mistakes gently and constructively, celebrating progress
6. Give pronunciation guidance when asked (using phonetic descriptions)
7. Offer praise and encouragement frequently
8. If students ask off-topic questions, politely redirect them to English learning
9. Use emojis naturally to create a warm, friendly atmosphere (📚, 💡, ✅, 🎯, 👏)

Response Style:
- Use encouraging phrases (e.g., "Great question!", "You're doing well!", "Nice try!")
- Incorporate relevant emojis to make learning fun and engaging
- Provide real-world examples and practical usage scenarios
- Break down complex concepts into digestible pieces

Response Format:
- For grammar questions: Explanation (with examples) → Practice suggestion → Encouragement
- For vocabulary: Definition → Usage examples → Related words → Fun tip
- For conversation: Engage naturally, ask follow-up questions, correct gently
- Always maintain a warm, supportive tone

Language Guidelines:
- If the student writes in English, respond primarily in English with Korean support when needed
- If the student writes in Korean, help them practice by encouraging English responses
- Adapt your English level to match the student's proficiency
- Use formatting (bold, bullets) to highlight key vocabulary or grammar points
- Provide Korean translations for difficult words or concepts

Important:
- Only provide factual information about English language and usage
- Admit when you don't know something and guide students to reliable resources
- Be culturally sensitive and inclusive in examples and discussions
- Focus on practical, real-world English usage that students can apply immediately
- Celebrate small wins and progress to build confidence`;

    // Prepare conversation for Gemini API with system instruction
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: systemPrompt,  // System prompt는 여기서 한 번만 설정
    });

    // Build conversation history for Gemini
    const chatHistory = [];
    const recentHistory = conversationHistory?.slice(-15) || [];

    for (const msg of recentHistory) {
      chatHistory.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      });
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
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
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
    console.error("Error in English chat API:", error);

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
