// Voice Tutor API - Generate Problem (Math Only)

import { NextRequest, NextResponse } from 'next/server';
import { MathVoiceTutor } from '@/lib/voice-tutor/math-tutor';
import { GradeLevel } from '@/lib/voice-tutor/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
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
    return NextResponse.json(
      { error: error.message || 'Failed to generate problem' },
      { status: 500 }
    );
  }
}
