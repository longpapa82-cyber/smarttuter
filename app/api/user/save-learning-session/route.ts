import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getAuthDb } from '@/lib/auth/db-redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface LearningSessionData {
  subject: 'english' | 'math' | 'science' | 'social-studies';
  gradeLevel: string;
  duration: number; // minutes
  messageCount: number;
  topicsDiscussed: string[];
  performance: number; // 0-100
  startTime: string; // ISO string
  endTime: string; // ISO string
}

/**
 * POST /api/user/save-learning-session
 * 학습 세션 종료 시 Redis에 데이터 저장
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
    const sessionData: LearningSessionData = await request.json();

    // 필수 필드 검증
    if (!sessionData.subject || !sessionData.duration || sessionData.duration <= 0) {
      return NextResponse.json(
        { success: false, error: '필수 데이터가 누락되었습니다' },
        { status: 400 }
      );
    }

    // Redis 키 구조: user:{email}:learning:{subject}
    const learningKey = `user:${userId}:learning:${sessionData.subject}`;

    // 기존 학습 데이터 가져오기
    const existingData = await db.get(learningKey);
    let learningStats: any = existingData
      ? JSON.parse(String(existingData))
      : {
          totalHours: 0,
          totalSessions: 0,
          lastSession: null,
          completedTopics: [],
          mastery: {},
          weaknesses: [],
        };

    // 학습 시간 누적
    learningStats.totalHours += sessionData.duration / 60; // 분 → 시간
    learningStats.totalSessions += 1;

    // 마지막 세션 정보 업데이트
    learningStats.lastSession = {
      topic: sessionData.topicsDiscussed[0] || '일반 학습',
      date: sessionData.endTime,
      duration: sessionData.duration,
    };

    // 완료 주제 추가 (중복 제거)
    const newTopics = sessionData.topicsDiscussed.filter(
      (topic) => !learningStats.completedTopics.includes(topic)
    );
    learningStats.completedTopics.push(...newTopics);

    // 영어 과목: 4대 영역 마스터리 업데이트
    if (sessionData.subject === 'english') {
      if (!learningStats.mastery.listening) {
        learningStats.mastery = {
          listening: 0,
          speaking: 0,
          reading: 0,
          writing: 0,
        };
      }

      // 성과 점수에 따라 마스터리 증가 (점진적)
      const improvement = Math.min(sessionData.performance / 20, 5); // 최대 5점 증가
      learningStats.mastery.speaking = Math.min(
        100,
        (learningStats.mastery.speaking || 0) + improvement
      );
      learningStats.mastery.listening = Math.min(
        100,
        (learningStats.mastery.listening || 0) + improvement * 0.8
      );
    }

    // 수학 과목: 단원 진행도 업데이트
    if (sessionData.subject === 'math') {
      if (!learningStats.chapters) {
        learningStats.chapters = [];
      }

      // 주제별 챕터로 변환
      sessionData.topicsDiscussed.forEach((topic) => {
        const existingChapter = learningStats.chapters.find(
          (ch: any) => ch.name === topic
        );

        if (existingChapter) {
          // 기존 챕터 진행도 증가
          existingChapter.progress = Math.min(
            100,
            existingChapter.progress + sessionData.performance / 5
          );
          if (existingChapter.progress >= 100) {
            existingChapter.status = 'completed';
          }
        } else {
          // 새 챕터 추가
          learningStats.chapters.push({
            name: topic,
            progress: Math.min(100, sessionData.performance / 2),
            status: sessionData.performance >= 80 ? 'completed' : 'in_progress',
          });
        }
      });
    }

    // 과학 과목: 개념 진행도 업데이트
    if (sessionData.subject === 'science') {
      if (!learningStats.concepts) {
        learningStats.concepts = [];
      }

      // 주제별 개념으로 변환
      sessionData.topicsDiscussed.forEach((topic) => {
        const existingConcept = learningStats.concepts.find(
          (c: any) => c.name === topic
        );

        if (existingConcept) {
          // 기존 개념 진행도 증가
          existingConcept.progress = Math.min(
            100,
            existingConcept.progress + sessionData.performance / 5
          );
          if (existingConcept.progress >= 100) {
            existingConcept.status = 'completed';
          }
        } else {
          // 새 개념 추가
          learningStats.concepts.push({
            name: topic,
            progress: Math.min(100, sessionData.performance / 2),
            status: sessionData.performance >= 80 ? 'completed' : 'in_progress',
          });
        }
      });
    }

    // 사회 과목: 시대별/지역별 진행도 업데이트
    if (sessionData.subject === 'social-studies') {
      if (!learningStats.periods) {
        learningStats.periods = [];
      }

      // 주제별 시대/지역으로 변환
      sessionData.topicsDiscussed.forEach((topic) => {
        const existingPeriod = learningStats.periods.find(
          (p: any) => p.name === topic
        );

        if (existingPeriod) {
          // 기존 시대/지역 진행도 증가
          existingPeriod.progress = Math.min(
            100,
            existingPeriod.progress + sessionData.performance / 5
          );
          if (existingPeriod.progress >= 100) {
            existingPeriod.status = 'completed';
          }
        } else {
          // 새 시대/지역 추가
          learningStats.periods.push({
            name: topic,
            progress: Math.min(100, sessionData.performance / 2),
            status: sessionData.performance >= 80 ? 'completed' : 'in_progress',
          });
        }
      });
    }

    // 약점 분석 (성과 50 미만일 경우)
    if (sessionData.performance < 50 && sessionData.topicsDiscussed.length > 0) {
      learningStats.weaknesses = [
        ...new Set([
          ...learningStats.weaknesses,
          ...sessionData.topicsDiscussed,
        ]),
      ].slice(0, 5); // 최대 5개 유지
    }

    // Redis에 저장
    await db.set(learningKey, JSON.stringify(learningStats));

    // 통계 캐시 무효화 (다음 조회 시 새 데이터 반영)
    await db.del(`user:${userId}:learning-stats`);

    return NextResponse.json({
      success: true,
      message: '학습 세션이 저장되었습니다',
      stats: {
        totalHours: Math.round(learningStats.totalHours * 10) / 10,
        totalSessions: learningStats.totalSessions,
        lastTopic: learningStats.lastSession?.topic,
      },
    });
  } catch (error) {
    console.error('Error saving learning session:', error);
    return NextResponse.json(
      {
        success: false,
        error: '학습 데이터 저장 중 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}
