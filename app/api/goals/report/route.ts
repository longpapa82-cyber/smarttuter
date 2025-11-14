import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { generateProgressReport } from '@/lib/goals/goal-manager';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;
    const { searchParams } = new URL(req.url);
    const periodParam = searchParams.get('period') || 'weekly';

    if (periodParam !== 'weekly' && periodParam !== 'monthly') {
      return NextResponse.json({ error: 'Invalid period' }, { status: 400 });
    }

    const report = await generateProgressReport(userId, periodParam);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
