import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getUserProfile, updateUserProfile } from '@/lib/user/user-profile';
import { GradeLevel, GRADE_LEVEL_OPTIONS, type GradeLevelChange } from '@/types/user';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { newGradeLevel } = body as { newGradeLevel: GradeLevel };

    // 유효성 검사
    if (!newGradeLevel || !GRADE_LEVEL_OPTIONS.find(o => o.value === newGradeLevel)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 학년입니다.' },
        { status: 400 }
      );
    }

    const profile = getUserProfile();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: '프로필을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 현재 학년과 동일한지 확인
    if (profile.gradeLevel === newGradeLevel) {
      return NextResponse.json(
        { success: false, error: '현재 학년과 동일합니다.' },
        { status: 400 }
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
          success: false,
          error: '24시간 내 1회만 변경 가능합니다.',
          canRetryAt: nextAvailableAt.toISOString(),
        }, { status: 429 });
      }
    }

    // 변경 이력 생성
    const now = new Date().toISOString();
    const change: GradeLevelChange = {
      fromGrade: profile.gradeLevel,
      toGrade: newGradeLevel,
      changedAt: now,
      reason: 'user_change',
      userAgent: request.headers.get('user-agent') || undefined,
    };

    const newHistory = [
      ...(profile.gradeLevelHistory || []),
      change,
    ];

    // 프로필 업데이트
    updateUserProfile({
      gradeLevel: newGradeLevel,
      gradeLevelLastChangedAt: now,
      gradeLevelHistory: newHistory,
    });

    const updatedProfile = getUserProfile();

    return NextResponse.json({
      success: true,
      message: '학년이 성공적으로 변경되었습니다.',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('[Grade Level API] Update failed:', error);
    return NextResponse.json(
      { success: false, error: '학년 변경에 실패했습니다.' },
      { status: 500 }
    );
  }
}
