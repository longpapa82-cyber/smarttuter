import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getUserProfile } from '@/lib/user/user-profile';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { canChange: false, reason: 'unauthorized' },
        { status: 401 }
      );
    }

    const profile = getUserProfile();

    if (!profile) {
      return NextResponse.json(
        { canChange: false, reason: 'no_profile' },
        { status: 404 }
      );
    }

    // 24시간 제한 확인
    if (profile.gradeLevelLastChangedAt) {
      const lastChanged = new Date(profile.gradeLevelLastChangedAt);
      const now = new Date();
      const hoursSinceLastChange = (now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastChange < 24) {
        const nextAvailableAt = new Date(lastChanged.getTime() + 24 * 60 * 60 * 1000);

        return NextResponse.json({
          canChange: false,
          reason: 'rate_limited',
          lastChangedAt: profile.gradeLevelLastChangedAt,
          nextAvailableAt: nextAvailableAt.toISOString(),
        });
      }
    }

    return NextResponse.json({
      canChange: true,
      reason: 'ok',
    });
  } catch (error) {
    console.error('[Grade Level API] Eligibility check failed:', error);
    return NextResponse.json(
      { canChange: false, reason: 'server_error' },
      { status: 500 }
    );
  }
}
