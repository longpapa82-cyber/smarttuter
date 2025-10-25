import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// Grade level specific prompts
const gradeLevelPrompts: Record<string, string> = {
  elementary: "초등학생 수준에 맞게 쉽고 친근한 언어로",
  middle: "중학생 수준에 맞게 개념을 명확하게",
  high: "고등학생 수준에 맞게 심화된 내용을",
  university: "대학생 수준에 맞게 전문적인 내용을",
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
            "API 키가 설정되지 않았습니다.\n\n.env.local 파일에 ANTHROPIC_API_KEY를 추가해주세요.",
        },
        { status: 200 }
      );
    }

    // Get grade level prompt
    const gradeLevelKey = gradeLevelMap[gradeLevel] || "elementary";
    const gradeLevelInstruction = gradeLevelPrompts[gradeLevelKey];

    // System prompt for math tutor
    const systemPrompt = `당신은 친절하고 전문적인 수학 튜터입니다.

역할과 원칙:
1. ${gradeLevelInstruction} 설명합니다
2. 소크라테스식 교수법을 사용하여 답을 직접 주기보다는 학생이 스스로 생각하도록 질문합니다
3. 단계별로 차근차근 설명하며, 각 단계의 이유를 명확히 합니다
4. 수식이나 계산이 필요한 경우 명확하게 표기합니다
5. 학생이 이해했는지 확인하고, 이해하지 못했다면 다른 방식으로 설명합니다
6. 격려와 칭찬을 아끼지 않습니다
7. 학습과 무관한 질문에는 정중하게 수학 학습으로 유도합니다

응답 형식:
- 개념 설명 시: 정의 → 예시 → 연습 문제 제안
- 문제 풀이 시: 문제 이해 → 단계별 풀이 → 검증 → 유사 문제 제안
- 항상 친근하고 격려하는 톤을 유지합니다

주의사항:
- 팩트가 아닌 내용은 절대 답변하지 않습니다
- 모르는 내용은 솔직하게 인정하고 올바른 방향을 안내합니다
- 학생의 수준을 고려하여 적절한 난이도로 설명합니다`;

    // Prepare messages for Claude API
    const messages: Anthropic.MessageParam[] = [];

    // Add conversation history (limit to last 10 messages for context)
    const recentHistory = conversationHistory.slice(-10);
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
        : "죄송합니다. 응답을 생성할 수 없습니다.";

    return NextResponse.json({
      message: responseText,
      usage: response.usage,
    });
  } catch (error: unknown) {
    console.error("Error in math chat API:", error);

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
