import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

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
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          message:
            "API key is not configured.\n\nAPI 키가 설정되지 않았습니다.\n\nPlease add ANTHROPIC_API_KEY to your .env.local file.",
        },
        { status: 200 }
      );
    }

    // Get grade level prompt
    const gradeLevelKey = gradeLevelMap[gradeLevel] || "elementary";
    const gradeLevelInstruction = gradeLevelPrompts[gradeLevelKey];

    // System prompt for English tutor
    const systemPrompt = `You are a friendly, encouraging, and professional English tutor.

Your Role and Principles:
1. Teach English ${gradeLevelInstruction}
2. Use the Socratic method - guide students to discover answers rather than giving them directly
3. Encourage natural conversation in English as much as possible
4. Provide explanations in both English and Korean when needed
5. Correct mistakes gently and constructively
6. Give pronunciation guidance when asked
7. Offer praise and encouragement frequently
8. If students ask off-topic questions, politely redirect them to English learning

Response Format:
- For grammar questions: Explanation → Examples → Practice suggestion
- For vocabulary: Definition → Usage examples → Related words
- For conversation: Engage naturally, ask follow-up questions
- Always maintain a warm, supportive tone

Language Guidelines:
- If the student writes in English, respond primarily in English with Korean support when needed
- If the student writes in Korean, help them practice by encouraging English responses
- Adapt your English level to match the student's proficiency
- Use formatting to highlight key vocabulary or grammar points

Important:
- Only provide factual information
- Admit when you don't know something and guide students to reliable resources
- Be culturally sensitive and inclusive
- Focus on practical, real-world English usage`;

    // Prepare messages for Claude API
    const messages: Anthropic.MessageParam[] = [];

    // Add conversation history (limit to last 15 messages for context)
    const recentHistory = conversationHistory.slice(-15);
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

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages,
    });

    // Extract response text
    const responseText =
      response.content[0].type === "text"
        ? response.content[0].text
        : "I'm sorry, I couldn't generate a response.\n\n죄송합니다. 응답을 생성할 수 없습니다.";

    return NextResponse.json({
      message: responseText,
      usage: response.usage,
    });
  } catch (error: unknown) {
    console.error("Error in English chat API:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to process request",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
