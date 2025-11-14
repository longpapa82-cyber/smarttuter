import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { cancelGoal } from '@/lib/goals/goal-manager';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;
    const body = await req.json();
    const { goalId } = body;

    if (!goalId) {
      return NextResponse.json({ error: 'Missing required field: goalId' }, { status: 400 });
    }

    const success = await cancelGoal(userId, goalId);

    if (!success) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Goal cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling goal:', error);
    return NextResponse.json({ error: 'Failed to cancel goal' }, { status: 500 });
  }
}
