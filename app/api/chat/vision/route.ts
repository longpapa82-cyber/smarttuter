import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

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
    const { imageData, gradeLevel, conversationHistory } = await req.json();

    if (!imageData) {
      return new Response(
        JSON.stringify({ error: "Image data is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({
          message:
            "API 키가 설정되지 않았습니다.\n\n.env.local 파일에 ANTHROPIC_API_KEY를 추가해주세요.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get grade level prompt
    const gradeLevelKey = gradeLevelMap[gradeLevel] || "elementary";
    const gradeLevelInstruction = gradeLevelPrompts[gradeLevelKey];

    // Enhanced system prompt for vision-based math problem solving
    const systemPrompt = `당신은 이미지 속 수학 문제를 분석하고 해결하는 전문 수학 튜터입니다.

역할과 원칙:
1. ${gradeLevelInstruction} 설명합니다
2. 이미지 속 수학 문제를 정확하게 읽고 파악합니다
3. 문제 풀이는 단계별로 상세하게 설명합니다
4. 각 단계의 이유와 수학적 원리를 명확히 합니다
5. 필요한 경우 그림이나 도표를 텍스트로 설명합니다
6. 손글씨나 인쇄된 문제 모두 정확하게 인식합니다
7. 답을 확인하고 검증 과정을 제시합니다

응답 형식:
1. **문제 파악**: 이미지 속 문제를 정확하게 기술
2. **해결 전략**: 어떤 방법으로 풀 것인지 설명
3. **단계별 풀이**:
   - 1단계: [설명]
   - 2단계: [설명]
   - ...
4. **답 검증**: 답이 맞는지 확인
5. **유사 문제**: 연습할 수 있는 비슷한 문제 제안

응답 스타일:
- 친근하고 격려하는 톤 사용
- 이모지를 적절히 사용 (📐, 📊, ✅, 💡 등)
- 복잡한 개념은 실생활 예시로 설명
- 항상 학생이 스스로 생각할 수 있도록 유도

주의사항:
- 이미지가 명확하지 않으면 어떤 부분이 불명확한지 알려주세요
- 여러 문제가 있으면 하나씩 차례대로 풀어주세요
- 손글씨가 읽기 어려우면 해석을 도와주세요`;

    // Extract base64 data from data URL
    const base64Match = imageData.match(/^data:image\/\w+;base64,(.+)$/);
    const base64Data = base64Match ? base64Match[1] : imageData;

    // Determine image type
    const imageTypeMatch = imageData.match(/^data:image\/(\w+);base64,/);
    const mediaType = imageTypeMatch
      ? (`image/${imageTypeMatch[1]}` as "image/jpeg" | "image/png" | "image/gif" | "image/webp")
      : "image/jpeg";

    // Prepare messages for Claude API
    const messages: Anthropic.MessageParam[] = [];

    // Add conversation history (limit to last 5 messages for context)
    const recentHistory = conversationHistory?.slice(-5) || [];
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      });
    }

    // Add current image message
    messages.push({
      role: "user",
      content: [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: mediaType,
            data: base64Data,
          },
        },
        {
          type: "text",
          text: "이 이미지 속 수학 문제를 분석하고 단계별로 풀이해주세요.",
        },
      ],
    });

    // Create streaming response
    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages,
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              const text = chunk.delta.text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
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
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    console.error("Error in vision chat API:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return new Response(
      JSON.stringify({
        error: "Failed to process image",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
