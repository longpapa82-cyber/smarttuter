import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getUserGoals } from '@/lib/goals/goal-manager';
import type { GoalStatus } from '@/lib/goals/types';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');

    let status: GoalStatus | undefined;
    if (statusParam) {
      const validStatuses: GoalStatus[] = ['active', 'completed', 'failed', 'cancelled'];
      if (!validStatuses.includes(statusParam as GoalStatus)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      status = statusParam as GoalStatus;
    }

    const goals = await getUserGoals(userId, status);

    return NextResponse.json({
      success: true,
      goals,
      count: goals.length,
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}
