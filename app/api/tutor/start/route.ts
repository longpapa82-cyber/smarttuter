// Voice Tutor API - Start Session
// Stateless API - returns initial greeting only

import { NextRequest, NextResponse } from 'next/server';
import { TutorSubject, GradeLevel, CONVERSATION_STARTERS } from '@/lib/voice-tutor/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: '⚠️ API 설정 오류: 관리자에게 문의하여 API 키를 설정해주세요.' },
        { status: 503 }
      );
    }
    const body = await request.json();
    const { subject, gradeLevel, userId } = body as {
      subject: TutorSubject;
      gradeLevel: GradeLevel;
      userId: string;
    };

    // Validate inputs
    if (!subject || !gradeLevel || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, gradeLevel, userId' },
        { status: 400 }
      );
    }

    // Get appropriate greeting
    const greeting = getGreeting(subject, gradeLevel);

    // Create session ID
    const sessionId = `${userId}-${subject}-${Date.now()}`;

    return NextResponse.json({
      success: true,
      sessionId,
      greeting,
      session: {
        id: sessionId,
        userId,
        subject,
        gradeLevel,
        startTime: new Date().toISOString(),
        status: 'active',
        duration: 0,
        messages: [],
        xpEarned: 10, // Session start XP
      },
    });
  } catch (error: any) {
    console.error('Error starting voice tutor session:', error);
    const message = (typeof error?.message === 'string' && error.message) || 'Failed to start session';

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

function getGreeting(subject: TutorSubject, gradeLevel: GradeLevel): string {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning!" : hour < 18 ? "Good afternoon!" : "Good evening!";

  if (subject === 'english') {
    const starters = CONVERSATION_STARTERS.english[gradeLevel];
    const starter = starters[Math.floor(Math.random() * starters.length)];
    return `${timeGreeting} I'm your English speaking tutor. ${starter}`;
  } else {
    const starters = CONVERSATION_STARTERS.math[gradeLevel];
    const starter = starters[Math.floor(Math.random() * starters.length)];
    return `Hi! I'm your math tutor. ${starter} I'll guide you step-by-step using questions, so you can discover the solution yourself!`;
  }
}
