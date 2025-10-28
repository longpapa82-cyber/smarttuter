// Voice Tutor API - Start Session
// Stateless API - returns initial greeting only

import { NextRequest, NextResponse } from 'next/server';
import { TutorSubject, GradeLevel, CONVERSATION_STARTERS } from '@/lib/voice-tutor/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let requestBody: any = null;

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: '⚠️ API 설정 오류: 관리자에게 문의하여 API 키를 설정해주세요.' },
        { status: 503 }
      );
    }
    requestBody = await request.json();
    const { subject, gradeLevel, userId } = requestBody as {
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

    // IMPORTANT: Return 200 with success=true but include warning message
    // This allows the tutor UI to display the message naturally instead of showing error page

    // User-friendly error messages
    let userMessage = message;
    let shouldAllowSession = false;

    if (/apikey|unauthorized|auth|forbidden|permission/i.test(message)) {
      userMessage = '⚠️ API 인증 오류: 관리자에게 문의하여 API 키를 확인해주세요.';
      shouldAllowSession = false;
    } else if (/quota|credit|billing|limit|rate.*limit|balance/i.test(message)) {
      userMessage = '💳 Claude API 크레딧이 부족합니다. 튜터가 안내 메시지를 제공합니다.';
      shouldAllowSession = true; // Allow session to start so tutor can guide user
    } else if (/timeout|temporarily|unavailable|upstream|bad gateway|502|503/i.test(message)) {
      userMessage = '⏱️ 서비스가 일시적으로 응답하지 않습니다. 잠시 후 다시 시도해주세요.';
      shouldAllowSession = false;
    }

    // If credit exhaustion, still create session so tutor can explain
    if (shouldAllowSession && requestBody) {
      const sessionId = `${requestBody.userId || 'anonymous'}-${requestBody.subject || 'english'}-${Date.now()}`;
      const warningGreeting = requestBody.subject === 'english'
        ? `Hello! I'm your English tutor, but I need to let you know something important:\n\n💳 Our AI tutoring service is currently experiencing API credit limitations.\n\nPlease ask your administrator to refill the Claude API credits.\n\nIn the meantime, you can use the Quiz and Flashcard features on the Dashboard!\n\n안녕하세요! API 크레딧이 부족하여 튜터링 서비스를 제공하기 어렵습니다. 관리자에게 크레딧 충전을 요청해주세요. 대시보드의 퀴즈와 플래시카드를 이용해보세요!`
        : `안녕하세요! 수학 튜터입니다. 중요한 안내사항이 있습니다:\n\n💳 현재 AI 튜터링 서비스의 API 크레딧이 부족합니다.\n\n관리자에게 Claude API 크레딧 충전을 요청해주세요.\n\n그동안 대시보드에서 퀴즈와 플래시카드를 이용하실 수 있습니다!\n\nHello! I'm your math tutor. Our AI service is experiencing credit limitations. Please ask your administrator to refill credits. Try Quiz and Flashcards in the meantime!`;

      return NextResponse.json({
        success: true,
        sessionId,
        greeting: warningGreeting,
        session: {
          id: sessionId,
          userId: requestBody.userId || 'anonymous',
          subject: requestBody.subject || 'english',
          gradeLevel: requestBody.gradeLevel || 'middle',
          startTime: new Date().toISOString(),
          status: 'limited', // Special status indicating limited functionality
          duration: 0,
          messages: [],
          xpEarned: 0,
        },
        warning: userMessage,
      });
    }

    // For other errors, return error response
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
