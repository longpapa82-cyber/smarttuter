import { NextRequest, NextResponse } from 'next/server';
import { getLearningProgressSummary } from '@/lib/learning-progress/progress-tracker';
import { getUserProfile } from '@/lib/user-profile';

/**
 * GET /api/progress/summary
 *
 * Fetches learning progress summary for the current user
 *
 * Query params:
 * - userId: string (required)
 *
 * Returns:
 * - LearningProgressSummary object with all progress metrics
 * - null if no progress data exists yet
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get user profile for grade level
    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Fetch progress summary from Redis
    const progressSummary = await getLearningProgressSummary(
      userId,
      userProfile.gradeLevel
    );

    if (!progressSummary) {
      // No progress data yet - return empty state
      return NextResponse.json({
        hasData: false,
        message: 'No learning progress data yet. Start learning to see your progress!',
      });
    }

    // Return progress summary
    return NextResponse.json({
      hasData: true,
      data: progressSummary,
    });

  } catch (error) {
    console.error('Error fetching progress summary:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch progress summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
