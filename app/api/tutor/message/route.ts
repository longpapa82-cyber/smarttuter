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
    return NextResponse.json(
      { error: error.message || 'Failed to process message' },
      { status: 500 }
    );
  }
}
