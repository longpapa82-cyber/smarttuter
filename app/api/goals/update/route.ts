import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { updateGoalProgress } from '@/lib/goals/goal-manager';
import type { GoalMetric, GoalSubject } from '@/lib/goals/types';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;
    const body = await req.json();
    const { metric, incrementValue, subject } = body;

    if (!metric || incrementValue === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: metric, incrementValue' },
        { status: 400 }
      );
    }

    const validMetrics: GoalMetric[] = ['study_time', 'sessions', 'conversations', 'concepts', 'accuracy', 'streak_days'];
    if (!validMetrics.includes(metric)) {
      return NextResponse.json({ error: 'Invalid metric' }, { status: 400 });
    }

    if (subject) {
      const validSubjects: GoalSubject[] = ['all', 'english', 'math', 'science', 'social', 'korean'];
      if (!validSubjects.includes(subject)) {
        return NextResponse.json({ error: 'Invalid subject' }, { status: 400 });
      }
    }

    if (typeof incrementValue !== 'number') {
      return NextResponse.json({ error: 'Invalid increment value' }, { status: 400 });
    }

    const result = await updateGoalProgress(userId, metric, incrementValue, subject);

    return NextResponse.json({
      success: true,
      updatedGoals: result.updatedGoals,
      completedGoals: result.completedGoals,
      totalXPEarned: result.totalXPEarned,
      message: result.completedGoals.length > 0
        ? 'Goal completed!'
        : 'Progress updated',
    });
  } catch (error) {
    console.error('Error updating goal progress:', error);
    return NextResponse.json({ error: 'Failed to update goal progress' }, { status: 500 });
  }
}
