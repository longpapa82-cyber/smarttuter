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
          const errorMsg = "⚠️ API Configuration Error\n\nPlease ask the administrator to set up the API key.\n\n관리자에게 문의하여 API 키를 설정해주세요.";
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

    // Prepare conversation for Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

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

      // Send message and get stream
      const result = await chat.sendMessageStream(systemPrompt + "\n\nUser: " + message);

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
        ? "⏱️ API Rate Limit Reached\n\nPlease try again in a moment.\n\nAPI 요청 한도에 도달했습니다.\n잠시 후 다시 시도해주세요."
        : "⏱️ Temporary Service Error\n\nPlease try again in a moment.\n\n일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.";

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
