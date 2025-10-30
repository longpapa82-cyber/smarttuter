// Voice Tutor API - Handle Message
// Processes user messages and returns AI tutor responses

import { NextRequest, NextResponse } from 'next/server';
import { EnglishVoiceTutor } from '@/lib/voice-tutor/english-tutor';
import { MathVoiceTutor } from '@/lib/voice-tutor/math-tutor';
import { TutorSubject, GradeLevel } from '@/lib/voice-tutor/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check if at least one LLM provider is configured
    if (!process.env.GEMINI_API_KEY && !process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Service unavailable: No LLM provider is configured' },
        { status: 503 }
      );
    }
    const body = await request.json();
    const {
      subject,
      gradeLevel,
      userId,
      message,
      audioMetadata,
      conversationHistory,
    } = body as {
      subject: TutorSubject;
      gradeLevel: GradeLevel;
      userId: string;
      message: string;
      audioMetadata?: { confidence?: number; duration?: number };
      conversationHistory?: any[];
    };

    // Validate inputs
    if (!subject || !gradeLevel || !userId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create temporary tutor instance for this request
    const tutor = subject === 'english'
      ? new EnglishVoiceTutor(gradeLevel, userId)
      : new MathVoiceTutor(gradeLevel, userId);

    // Restore conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      // @ts-ignore - accessing protected property for state restoration
      tutor.conversationHistory = conversationHistory.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    }

    // Process message
    const result = await tutor.converse(message, audioMetadata);

    return NextResponse.json({
      success: true,
      response: result.response,
      feedback: result.feedback,
      xpEarned: result.xpEarned,
      session: tutor.getSession(),
    });
  } catch (error: any) {
    console.error('Error processing tutor message:', error);
    const message = (typeof error?.message === 'string' && error.message) || 'Failed to process message';

    // User-friendly error messages
    let userMessage = message;
    if (/apikey|unauthorized|auth|forbidden|permission/i.test(message)) {
      userMessage = '⚠️ API 인증 오류: 관리자에게 문의하여 API 키를 확인해주세요.';
    } else if (/quota|credit|billing|limit|rate.*limit/i.test(message)) {
      userMessage = '💳 Claude API 크레딧이 부족합니다. 관리자에게 크레딧 충전을 요청해주세요.';
    } else if (/timeout|temporarily|unavailable|upstream|bad gateway|502|503/i.test(message)) {
      userMessage = '⏱️ 서비스가 일시적으로 응답하지 않습니다. 잠시 후 다시 시도해주세요.';
    }

    const status = /apikey|unauthorized|auth|forbidden|permission/i.test(message) ? 401
      : /quota|credit|billing|limit/i.test(message) ? 402
      : /timeout|temporarily|unavailable|upstream|bad gateway|502|503/i.test(message) ? 503
      : 500;
    return NextResponse.json({ error: userMessage }, { status });
  }
}
