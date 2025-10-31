import { NextRequest, NextResponse } from 'next/server';
import { REDIS_KEYS } from '@/lib/learning-progress/redis-schema';
import type { DifficultyLevel } from '@/lib/learning-progress/types';
import type { Subject } from '@/types/tutor';
import { Redis } from '@upstash/redis';

// Redis client initialization (same pattern as progress-tracker)
let redis: Redis | null = null;

function getRedisClient(): Redis | null {
  if (typeof window !== 'undefined') {
    return null;
  }

  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  return redis;
}

/**
 * GET /api/difficulty
 *
 * Fetches current difficulty level for a user and subject
 *
 * Query params:
 * - userId: string (required)
 * - subject: 'math' | 'english' (required)
 *
 * Returns:
 * - Current difficulty level and metadata
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const subject = searchParams.get('subject') as Subject;

    if (!userId || !subject) {
      return NextResponse.json(
        { error: 'userId and subject are required' },
        { status: 400 }
      );
    }

    if (!['math', 'english'].includes(subject)) {
      return NextResponse.json(
        { error: 'subject must be math or english' },
        { status: 400 }
      );
    }

    const client = getRedisClient();
    if (!client) {
      return NextResponse.json(
        { error: 'Redis not configured' },
        { status: 503 }
      );
    }

    // Get current difficulty
    const difficultyData = await client.get<string>(REDIS_KEYS.difficulty(userId, subject));
    const currentDifficulty: DifficultyLevel = difficultyData
      ? (difficultyData as DifficultyLevel)
      : 'medium';

    return NextResponse.json({
      userId,
      subject,
      currentDifficulty,
      lastUpdated: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching difficulty:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch difficulty',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/difficulty
 *
 * Manually set difficulty level (for testing or admin purposes)
 *
 * Body:
 * - userId: string (required)
 * - subject: 'math' | 'english' (required)
 * - difficulty: 'easy' | 'medium' | 'hard' (required)
 *
 * Returns:
 * - Updated difficulty level
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, subject, difficulty } = body;

    if (!userId || !subject || !difficulty) {
      return NextResponse.json(
        { error: 'userId, subject, and difficulty are required' },
        { status: 400 }
      );
    }

    if (!['math', 'english'].includes(subject)) {
      return NextResponse.json(
        { error: 'subject must be math or english' },
        { status: 400 }
      );
    }

    if (!['very_easy', 'easy', 'medium', 'hard', 'very_hard'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'difficulty must be very_easy, easy, medium, hard, or very_hard' },
        { status: 400 }
      );
    }

    const client = getRedisClient();
    if (!client) {
      return NextResponse.json(
        { error: 'Redis not configured' },
        { status: 503 }
      );
    }

    // Set difficulty
    await client.set(REDIS_KEYS.difficulty(userId, subject), difficulty);

    console.log(`[Manual Override] Difficulty set to ${difficulty} for ${userId} (${subject})`);

    return NextResponse.json({
      userId,
      subject,
      difficulty,
      updatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error setting difficulty:', error);
    return NextResponse.json(
      {
        error: 'Failed to set difficulty',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
