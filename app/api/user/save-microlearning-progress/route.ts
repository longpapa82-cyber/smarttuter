import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getAuthDb } from '@/lib/auth/db-redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface MicrolearningProgressData {
  moduleId: string;
  score: number; // 0-100
  completedAt: string; // ISO string
  timeSpent: number; // seconds
  subject: 'math' | 'english';
}

/**
 * POST /api/user/save-microlearning-progress
 * 마이크로러닝 모듈 완료 시 진행도 저장
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const userId = session.user.email || session.user.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 식별자를 찾을 수 없습니다' },
        { status: 401 }
      );
    }

    const db = await getAuthDb();
    const progressData: MicrolearningProgressData = await request.json();

    // 필수 필드 검증
    if (!progressData.moduleId || typeof progressData.score !== 'number') {
      return NextResponse.json(
        { success: false, error: '필수 데이터가 누락되었습니다' },
        { status: 400 }
      );
    }

    // Redis 키: user:{email}:microlearning:progress
    const progressKey = `user:${userId}:microlearning:progress`;
    const statsKey = `user:${userId}:microlearning:stats`;

    // 기존 진행도 가져오기
    const existingProgress = await db.get(progressKey);
    let progress: Record<string, any> = existingProgress
      ? JSON.parse(String(existingProgress))
      : {};

    // 모듈 진행도 업데이트
    const moduleStatus = progressData.score >= 80 ? 'mastered' : 'completed';
    progress[progressData.moduleId] = {
      status: moduleStatus,
      progress: 100,
      score: progressData.score,
      completedAt: progressData.completedAt,
      timeSpent: progressData.timeSpent,
    };

    // 통계 업데이트
    const existingStats = await db.get(statsKey);
    let stats: any = existingStats
      ? JSON.parse(String(existingStats))
      : {
          totalCompleted: 0,
          totalMastered: 0,
          averageScore: 0,
          totalTimeSpent: 0,
          totalXP: 0,
          bySubject: {
            math: { completed: 0, mastered: 0, averageScore: 0 },
            english: { completed: 0, mastered: 0, averageScore: 0 },
          },
        };

    // 전체 통계 업데이트
    stats.totalCompleted += 1;
    if (moduleStatus === 'mastered') {
      stats.totalMastered += 1;
    }

    // XP 계산 (점수에 비례)
    const earnedXP = Math.round((progressData.score / 100) * 50); // 최대 50 XP
    stats.totalXP += earnedXP;
    stats.totalTimeSpent += progressData.timeSpent;

    // 평균 점수 재계산
    const allScores = Object.values(progress)
      .filter((p: any) => p.score !== undefined)
      .map((p: any) => p.score);
    stats.averageScore = Math.round(
      allScores.reduce((sum: number, score: number) => sum + score, 0) / allScores.length
    );

    // 과목별 통계 업데이트
    const subject = progressData.subject;
    if (stats.bySubject[subject]) {
      stats.bySubject[subject].completed += 1;
      if (moduleStatus === 'mastered') {
        stats.bySubject[subject].mastered += 1;
      }

      // 과목별 평균 점수
      const subjectScores = Object.entries(progress)
        .filter(([id, data]: [string, any]) => id.startsWith(subject))
        .map(([_, data]: [string, any]) => data.score)
        .filter((score: number) => score !== undefined);

      if (subjectScores.length > 0) {
        stats.bySubject[subject].averageScore = Math.round(
          subjectScores.reduce((sum: number, score: number) => sum + score, 0) /
            subjectScores.length
        );
      }
    }

    // Redis에 저장
    await db.set(progressKey, JSON.stringify(progress));
    await db.set(statsKey, JSON.stringify(stats));

    // 유저 전체 통계 캐시 무효화
    await db.del(`user:${userId}:learning-stats`);

    // XP 추가
    const xpKey = `user:${userId}:xp`;
    const currentXP = await db.get(xpKey);
    const newXP = (currentXP ? parseInt(String(currentXP)) : 0) + earnedXP;
    await db.set(xpKey, newXP.toString());

    return NextResponse.json({
      success: true,
      message: '마이크로러닝 진행도가 저장되었습니다',
      data: {
        moduleId: progressData.moduleId,
        status: moduleStatus,
        earnedXP,
        totalCompleted: stats.totalCompleted,
        totalXP: stats.totalXP,
        averageScore: stats.averageScore,
      },
    });
  } catch (error) {
    console.error('Error saving microlearning progress:', error);
    return NextResponse.json(
      {
        success: false,
        error: '진행도 저장 중 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}
