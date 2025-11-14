import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getAuthDb } from '@/lib/auth/db-redis';
import type { ReviewSession } from '@/types/spaced-repetition';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/user/save-review-session
 * 복습 세션 완료 시 Redis에 데이터 저장
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check for session and user identifier (email or id)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // Use email as primary identifier, fallback to user ID
    const userId = session.user.email || session.user.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 식별자를 찾을 수 없습니다' },
        { status: 401 }
      );
    }

    const db = await getAuthDb();

    // 요청 데이터 파싱
    const sessionData: ReviewSession = await request.json();

    // 필수 필드 검증
    if (!sessionData.id || !sessionData.totalCards || sessionData.totalCards <= 0) {
      return NextResponse.json(
        { success: false, error: '필수 데이터가 누락되었습니다' },
        { status: 400 }
      );
    }

    // Redis 키 구조: user:{email}:review:sessions
    const sessionsKey = `user:${userId}:review:sessions`;
    const statsKey = `user:${userId}:review:stats`;

    // 기존 세션 데이터 가져오기
    const existingSessions = await db.get(sessionsKey);
    let sessions: ReviewSession[] = existingSessions
      ? JSON.parse(String(existingSessions))
      : [];

    // 새 세션 추가 (최대 30개 유지)
    sessions.unshift(sessionData);
    if (sessions.length > 30) {
      sessions = sessions.slice(0, 30);
    }

    // 통계 업데이트
    const existingStats = await db.get(statsKey);
    let stats: any = existingStats
      ? JSON.parse(String(existingStats))
      : {
          totalSessions: 0,
          totalReviews: 0,
          totalCorrect: 0,
          overallAccuracy: 0,
          totalXP: 0,
          lastSessionDate: null,
          weeklyReviews: 0,
          currentStreak: 0,
          longestStreak: 0,
        };

    // 통계 계산
    stats.totalSessions += 1;
    stats.totalReviews += sessionData.completedCards;
    stats.totalCorrect += sessionData.correctCards;
    stats.overallAccuracy = Math.round((stats.totalCorrect / stats.totalReviews) * 100);
    stats.totalXP += sessionData.earnedXP;
    stats.lastSessionDate = sessionData.endTime || sessionData.startTime;

    // 오늘 날짜 확인하여 스트릭 업데이트
    const today = new Date().toISOString().split('T')[0];
    const lastSessionDate = stats.lastSessionDate
      ? new Date(stats.lastSessionDate).toISOString().split('T')[0]
      : null;

    if (lastSessionDate === today) {
      // 오늘 이미 복습함
      stats.weeklyReviews += sessionData.completedCards;
    } else if (lastSessionDate) {
      const daysDiff = Math.floor(
        (new Date(today).getTime() - new Date(lastSessionDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        // 연속 학습
        stats.currentStreak += 1;
        stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
      } else if (daysDiff > 1) {
        // 스트릭 끊김
        stats.currentStreak = 1;
      }
      stats.weeklyReviews += sessionData.completedCards;
    } else {
      // 첫 세션
      stats.currentStreak = 1;
      stats.longestStreak = 1;
      stats.weeklyReviews = sessionData.completedCards;
    }

    // Redis에 저장
    await db.set(sessionsKey, JSON.stringify(sessions));
    await db.set(statsKey, JSON.stringify(stats));

    // 유저 전체 통계 캐시 무효화
    await db.del(`user:${userId}:learning-stats`);

    // 게이미피케이션: XP 추가
    const xpKey = `user:${userId}:xp`;
    const currentXP = await db.get(xpKey);
    const newXP = (currentXP ? parseInt(String(currentXP)) : 0) + sessionData.earnedXP;
    await db.set(xpKey, newXP.toString());

    return NextResponse.json({
      success: true,
      message: '복습 세션이 저장되었습니다',
      stats: {
        totalSessions: stats.totalSessions,
        overallAccuracy: stats.overallAccuracy,
        currentStreak: stats.currentStreak,
        totalXP: stats.totalXP,
        earnedXP: sessionData.earnedXP,
      },
    });
  } catch (error) {
    console.error('Error saving review session:', error);
    return NextResponse.json(
      {
        success: false,
        error: '복습 세션 저장 중 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}
