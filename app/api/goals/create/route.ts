import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createGoal } from '@/lib/goals/goal-manager';
import type { GoalMetric, GoalPeriod, GoalSubject } from '@/lib/goals/types';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;
    const body = await req.json();
    const { metric, targetValue, period, subject = 'all' } = body;

    if (!metric || !targetValue || !period) {
      return NextResponse.json(
        { error: 'Missing required fields: metric, targetValue, period' },
        { status: 400 }
      );
    }

    const validMetrics: GoalMetric[] = ['study_time', 'sessions', 'conversations', 'concepts', 'accuracy', 'streak_days'];
    if (!validMetrics.includes(metric)) {
      return NextResponse.json({ error: 'Invalid metric' }, { status: 400 });
    }

    const validPeriods: GoalPeriod[] = ['daily', 'weekly', 'monthly'];
    if (!validPeriods.includes(period)) {
      return NextResponse.json({ error: 'Invalid period' }, { status: 400 });
    }

    const validSubjects: GoalSubject[] = ['all', 'english', 'math', 'science', 'social', 'korean'];
    if (!validSubjects.includes(subject)) {
      return NextResponse.json({ error: 'Invalid subject' }, { status: 400 });
    }

    if (typeof targetValue !== 'number' || targetValue <= 0) {
      return NextResponse.json({ error: 'Invalid target value' }, { status: 400 });
    }

    const goal = await createGoal(userId, metric, targetValue, period, subject);

    return NextResponse.json({
      success: true,
      goal,
      message: 'Goal created successfully',
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}
