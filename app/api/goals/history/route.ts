import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getGoalProgressHistory } from '@/lib/goals/goal-manager';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const goalId = searchParams.get('goalId');
    const daysParam = searchParams.get('days');

    if (!goalId) {
      return NextResponse.json({ error: 'Missing required parameter: goalId' }, { status: 400 });
    }

    let days = 30;
    if (daysParam) {
      const parsedDays = parseInt(daysParam, 10);
      if (isNaN(parsedDays) || parsedDays <= 0 || parsedDays > 365) {
        return NextResponse.json({ error: 'Days must be between 1 and 365' }, { status: 400 });
      }
      days = parsedDays;
    }

    const history = await getGoalProgressHistory(goalId, days);

    return NextResponse.json({
      success: true,
      goalId,
      days,
      history,
      count: history.length,
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
