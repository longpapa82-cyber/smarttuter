// Voice Tutor API - Request Hint (Math Only)

import { NextRequest, NextResponse } from 'next/server';
import { MathVoiceTutor } from '@/lib/voice-tutor/math-tutor';
import { GradeLevel } from '@/lib/voice-tutor/types';

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
    const { gradeLevel, userId, currentProblem, hintsUsed } = body as {
      gradeLevel: GradeLevel;
      userId: string;
      currentProblem: any;
      hintsUsed: number;
    };

    if (!gradeLevel || !userId || !currentProblem) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create temporary tutor instance
    const tutor = new MathVoiceTutor(gradeLevel, userId);

    // Restore current problem state
    // @ts-ignore - accessing private property
    tutor.currentProblem = currentProblem;
    // @ts-ignore
    tutor.hintsUsed = hintsUsed || 0;

    // Get hint
    const hint = await tutor.giveHint();

    return NextResponse.json({
      success: true,
      hint,
      // @ts-ignore
      hintsUsed: tutor.hintsUsed,
    });
  } catch (error: any) {
    console.error('Error getting hint:', error);
    const message =
      (typeof error?.message === 'string' && error.message) || 'Failed to get hint';
    const status = /apikey|unauthorized|auth|forbidden|permission/i.test(message) ? 401
      : /quota|credit|billing|limit/i.test(message) ? 402
      : /timeout|temporarily|unavailable|upstream|bad gateway|502|503/i.test(message) ? 503
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
