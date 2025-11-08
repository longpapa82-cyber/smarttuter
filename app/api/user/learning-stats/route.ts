/**
 * Learning Stats API
 * 사용자의 학습 통계 데이터 조회
 * Query params:
 * - subject: 'english' | 'math' | 'science' | 'social' (optional, for detailed stats)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createErrorResponse } from '@/lib/api/error-handler';
import { getAuthDb } from '@/lib/auth/db-redis';
import type { LearningStats, EnglishDetailedStats, MathDetailedStats, ScienceDetailedStats, SocialDetailedStats } from '@/types/learning-stats';

// GET /api/user/learning-stats - Get user's learning statistics
// GET /api/user/learning-stats?subject=english - Get detailed English stats
// GET /api/user/learning-stats?subject=math - Get detailed Math stats
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check for session and user identifier (email or id)
    if (!session?.user) {
      return createErrorResponse('인증이 필요합니다', 401, 'UNAUTHORIZED');
    }

    // Use email as primary identifier, fallback to user ID
    const userId = session.user.email || session.user.id;

    if (!userId) {
      return createErrorResponse('사용자 식별자를 찾을 수 없습니다', 401, 'NO_USER_ID');
    }
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const db = await getAuthDb();

    // Subject-specific detailed stats
    if (subject === 'english') {
      // Redis에서 영어 학습 데이터 조회
      const learningKey = `user:${userId}:learning:english`;
      const learningData = await db.get(learningKey);
      const parsedData = learningData ? JSON.parse(String(learningData)) : null;
      const englishStats: EnglishDetailedStats = {
        lastSession: parsedData?.lastSession || null,
        nextTopic: parsedData?.nextTopic || null,
        cefrLevel: parsedData?.cefrLevel || null,
        monthlyHours: {
          current: Math.round((parsedData?.totalHours || 0) * 10) / 10,
          target: 20,
        },
        completedTopics: parsedData?.completedTopics?.length || 0,
        masteredGrammar: parsedData?.masteredGrammar || [],
        mastery: parsedData?.mastery || {
          listening: 0,
          speaking: 0,
          reading: 0,
          writing: 0,
        },
        analysis: {
          strengths: parsedData?.strengths || [],
          weaknesses: parsedData?.weaknesses || [],
          aiRecommendation:
            parsedData?.totalSessions > 0
              ? '지속적인 학습으로 실력이 향상되고 있습니다!'
              : '영어 튜터와 대화를 시작하여 학습 분석을 받아보세요!',
        },
      };

      return NextResponse.json({
        success: true,
        data: englishStats,
      });
    }

    if (subject === 'math') {
      // Redis에서 수학 학습 데이터 조회
      const learningKey = `user:${userId}:learning:math`;
      const learningData = await db.get(learningKey);
      const parsedData = learningData ? JSON.parse(String(learningData)) : null;

      const mathStats: MathDetailedStats = {
        lastSession: parsedData?.lastSession || null,
        nextTopic: parsedData?.nextTopic || null,
        gradeProgress: parsedData?.gradeProgress || null,
        monthlyHours: {
          current: Math.round((parsedData?.totalHours || 0) * 10) / 10,
          target: 15,
        },
        chapters: parsedData?.chapters || [],
        analysis: {
          strengths: parsedData?.strengths || [],
          weaknesses: parsedData?.weaknesses || [],
          aiRecommendation:
            parsedData?.totalSessions > 0
              ? '꾸준한 연습으로 수학 실력이 향상되고 있습니다!'
              : '수학 튜터와 학습을 시작하여 진행도 분석을 받아보세요!',
        },
      };

      return NextResponse.json({
        success: true,
        data: mathStats,
      });
    }

    if (subject === 'science') {
      // Redis에서 과학 학습 데이터 조회
      const learningKey = `user:${userId}:learning:science`;
      const learningData = await db.get(learningKey);
      const parsedData = learningData ? JSON.parse(String(learningData)) : null;

      const scienceStats: ScienceDetailedStats = {
        lastSession: parsedData?.lastSession || null,
        nextTopic: parsedData?.nextTopic || null,
        gradeProgress: parsedData?.gradeProgress || null,
        monthlyHours: {
          current: Math.round((parsedData?.totalHours || 0) * 10) / 10,
          target: 12,
        },
        concepts: parsedData?.concepts || [],
        analysis: {
          strengths: parsedData?.strengths || [],
          weaknesses: parsedData?.weaknesses || [],
          aiRecommendation:
            parsedData?.totalSessions > 0
              ? '체계적인 학습으로 과학 개념이 향상되고 있습니다!'
              : '과학 튜터와 학습을 시작하여 진행도 분석을 받아보세요!',
        },
      };

      return NextResponse.json({
        success: true,
        data: scienceStats,
      });
    }

    if (subject === 'social' || subject === 'social-studies') {
      // Redis에서 사회 학습 데이터 조회
      const learningKey = `user:${userId}:learning:social-studies`;
      const learningData = await db.get(learningKey);
      const parsedData = learningData ? JSON.parse(String(learningData)) : null;

      const socialStats: SocialDetailedStats = {
        lastSession: parsedData?.lastSession || null,
        nextTopic: parsedData?.nextTopic || null,
        gradeProgress: parsedData?.gradeProgress || null,
        monthlyHours: {
          current: Math.round((parsedData?.totalHours || 0) * 10) / 10,
          target: 12,
        },
        periods: parsedData?.periods || [],
        analysis: {
          strengths: parsedData?.strengths || [],
          weaknesses: parsedData?.weaknesses || [],
          aiRecommendation:
            parsedData?.totalSessions > 0
              ? '지속적인 학습으로 사회 이해력이 향상되고 있습니다!'
              : '사회 튜터와 학습을 시작하여 진행도 분석을 받아보세요!',
        },
      };

      return NextResponse.json({
        success: true,
        data: socialStats,
      });
    }

    // Overall stats for main dashboard
    // Redis에서 각 과목별 데이터 조회
    const englishKey = `user:${userId}:learning:english`;
    const mathKey = `user:${userId}:learning:math`;
    const scienceKey = `user:${userId}:learning:science`;
    const socialKey = `user:${userId}:learning:social-studies`;

    const [englishData, mathData, scienceData, socialData] = await Promise.all([
      db.get(englishKey),
      db.get(mathKey),
      db.get(scienceKey),
      db.get(socialKey),
    ]);

    const englishParsed = englishData ? JSON.parse(String(englishData)) : null;
    const mathParsed = mathData ? JSON.parse(String(mathData)) : null;
    const scienceParsed = scienceData ? JSON.parse(String(scienceData)) : null;
    const socialParsed = socialData ? JSON.parse(String(socialData)) : null;

    const stats: LearningStats = {
      english: {
        weeklyHours: Math.round((englishParsed?.totalHours || 0) * 10) / 10,
        weeklyGoal: 20,
        hasData: englishParsed?.totalSessions > 0,
        cefrLevel: englishParsed?.cefrLevel || null,
        skills: englishParsed?.mastery || {
          listening: 0,
          speaking: 0,
          reading: 0,
          writing: 0,
        },
        detailed: {
          lastSession: englishParsed?.lastSession || null,
          nextTopic: englishParsed?.nextTopic || null,
          cefrLevel: englishParsed?.cefrLevel || null,
          monthlyHours: {
            current: Math.round((englishParsed?.totalHours || 0) * 10) / 10,
            target: 20
          },
          completedTopics: englishParsed?.completedTopics?.length || 0,
          masteredGrammar: englishParsed?.masteredGrammar || [],
          mastery: englishParsed?.mastery || { listening: 0, speaking: 0, reading: 0, writing: 0 },
          analysis: {
            strengths: englishParsed?.strengths || [],
            weaknesses: englishParsed?.weaknesses || [],
            aiRecommendation: englishParsed?.totalSessions > 0
              ? '지속적인 학습으로 실력이 향상되고 있습니다!'
              : '영어 튜터와 대화를 시작하여 학습 분석을 받아보세요!',
          },
        }
      },
      math: {
        weeklyHours: Math.round((mathParsed?.totalHours || 0) * 10) / 10,
        weeklyGoal: 15,
        hasData: mathParsed?.totalSessions > 0,
        gradeLevel: mathParsed?.gradeLevel || null,
        completedUnits: mathParsed?.chapters?.filter((ch: any) => ch.status === 'completed').length || 0,
        totalUnits: mathParsed?.chapters?.length || 0,
        currentTopic: mathParsed?.lastSession?.topic || null,
        detailed: {
          lastSession: mathParsed?.lastSession || null,
          nextTopic: mathParsed?.nextTopic || null,
          gradeProgress: mathParsed?.gradeProgress || null,
          monthlyHours: {
            current: Math.round((mathParsed?.totalHours || 0) * 10) / 10,
            target: 15
          },
          chapters: mathParsed?.chapters || [],
          analysis: {
            strengths: mathParsed?.strengths || [],
            weaknesses: mathParsed?.weaknesses || [],
            aiRecommendation: mathParsed?.totalSessions > 0
              ? '꾸준한 연습으로 수학 실력이 향상되고 있습니다!'
              : '수학 튜터와 학습을 시작하여 진행도 분석을 받아보세요!',
          },
        }
      },
      science: {
        weeklyHours: Math.round((scienceParsed?.totalHours || 0) * 10) / 10,
        weeklyGoal: 12,
        hasData: scienceParsed?.totalSessions > 0,
        gradeLevel: scienceParsed?.gradeLevel || null,
        completedUnits: scienceParsed?.concepts?.filter((c: any) => c.status === 'completed').length || 0,
        totalUnits: scienceParsed?.concepts?.length || 0,
        currentTopic: scienceParsed?.lastSession?.topic || null,
        detailed: {
          lastSession: scienceParsed?.lastSession || null,
          nextTopic: scienceParsed?.nextTopic || null,
          gradeProgress: scienceParsed?.gradeProgress || null,
          monthlyHours: {
            current: Math.round((scienceParsed?.totalHours || 0) * 10) / 10,
            target: 12
          },
          concepts: scienceParsed?.concepts || [],
          analysis: {
            strengths: scienceParsed?.strengths || [],
            weaknesses: scienceParsed?.weaknesses || [],
            aiRecommendation: scienceParsed?.totalSessions > 0
              ? '체계적인 학습으로 과학 개념이 향상되고 있습니다!'
              : '과학 튜터와 학습을 시작하여 진행도 분석을 받아보세요!',
          },
        }
      },
      social: {
        weeklyHours: Math.round((socialParsed?.totalHours || 0) * 10) / 10,
        weeklyGoal: 12,
        hasData: socialParsed?.totalSessions > 0,
        gradeLevel: socialParsed?.gradeLevel || null,
        completedUnits: socialParsed?.periods?.filter((p: any) => p.status === 'completed').length || 0,
        totalUnits: socialParsed?.periods?.length || 0,
        currentTopic: socialParsed?.lastSession?.topic || null,
        detailed: {
          lastSession: socialParsed?.lastSession || null,
          nextTopic: socialParsed?.nextTopic || null,
          gradeProgress: socialParsed?.gradeProgress || null,
          monthlyHours: {
            current: Math.round((socialParsed?.totalHours || 0) * 10) / 10,
            target: 12
          },
          periods: socialParsed?.periods || [],
          analysis: {
            strengths: socialParsed?.strengths || [],
            weaknesses: socialParsed?.weaknesses || [],
            aiRecommendation: socialParsed?.totalSessions > 0
              ? '지속적인 학습으로 사회 이해력이 향상되고 있습니다!'
              : '사회 튜터와 학습을 시작하여 진행도 분석을 받아보세요!',
          },
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Learning stats fetch error:', error);
    return createErrorResponse(
      '학습 통계를 가져오는 중 오류가 발생했습니다',
      500,
      'INTERNAL_ERROR',
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}
