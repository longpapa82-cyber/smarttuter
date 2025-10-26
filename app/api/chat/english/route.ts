import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

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
    if (!process.env.ANTHROPIC_API_KEY) {
      const encoder = new TextEncoder();
      const errorStream = new ReadableStream({
        start(controller) {
          const errorMsg = "I apologize, but I cannot connect to the server right now.\n\n죄송합니다. 현재 서버와 연결할 수 없습니다.\n\nPlease contact the administrator to configure ANTHROPIC_API_KEY.";
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

    // Prepare messages for Claude API
    const messages: Anthropic.MessageParam[] = [];

    // Add conversation history (limit to last 15 messages for context)
    const recentHistory = conversationHistory?.slice(-15) || [];
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      });
    }

    // Add current message
    messages.push({
      role: "user",
      content: message,
    });

    // Create streaming response with better error handling
    const encoder = new TextEncoder();

    try {
      const stream = await anthropic.messages.stream({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 2048,
        system: systemPrompt,
        messages: messages,
      });

      // Create a readable stream for the response
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              if (chunk.type === "content_block_delta" &&
                  chunk.delta.type === "text_delta") {
                const text = chunk.delta.text;
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
      // Handle API-specific errors (credit issues, rate limits, etc.)
      console.error("Anthropic API error:", apiError);

      // Check for credit balance error
      const isCreditError =
        apiError.message?.includes('credit balance') ||
        apiError.message?.includes('insufficient') ||
        apiError.status === 402;

      const errorMsg = isCreditError
        ? "⚠️ API 크레딧이 부족합니다.\n\nAPI credit balance is too low.\n\n관리자에게 문의하여 크레딧을 충전해주세요.\nPlease contact the administrator to add credits.\n\n🔗 https://console.anthropic.com/settings/billing"
        : "죄송합니다. 일시적인 오류가 발생했습니다.\n\nI apologize, but a temporary error occurred.\n\n잠시 후 다시 시도해주세요.\nPlease try again in a moment.";

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
