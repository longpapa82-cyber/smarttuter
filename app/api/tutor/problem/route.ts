// Voice Tutor API - Generate Problem (Math Only)

import { NextRequest, NextResponse } from 'next/server';
import { MathVoiceTutor } from '@/lib/voice-tutor/math-tutor';
import { GradeLevel } from '@/lib/voice-tutor/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Service unavailable: ANTHROPIC_API_KEY is not configured' },
        { status: 503 }
      );
    }
    const body = await request.json();
    const { gradeLevel, userId, topic } = body as {
      gradeLevel: GradeLevel;
      userId: string;
      topic?: string;
    };

    if (!gradeLevel || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create temporary tutor instance
    const tutor = new MathVoiceTutor(gradeLevel, userId);

    // Generate problem
    const problem = await tutor.generateProblem(topic);

    return NextResponse.json({
      success: true,
      problem,
    });
  } catch (error: any) {
    console.error('Error generating problem:', error);
    const message =
      (typeof error?.message === 'string' && error.message) || 'Failed to generate problem';
    const status = /apikey|unauthorized|auth|forbidden|permission/i.test(message) ? 401
      : /quota|credit|billing|limit/i.test(message) ? 402
      : /timeout|temporarily|unavailable|upstream|bad gateway|502|503/i.test(message) ? 503
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
