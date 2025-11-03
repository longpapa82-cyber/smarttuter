/**
 * lib/recommendations/learning-recommendations.ts
 * 학습 추천 시스템 (Phase 12 감정 분석 통합)
 */

import { analyzeEmotionPatterns, getEmotionHistoryByDateRange } from '@/lib/emotion/emotion-storage';
import type { EmotionCategory } from '@/types/emotion';

export interface LearningRecommendation {
  type: 'action' | 'warning' | 'encouragement' | 'break';
  priority: 'high' | 'medium' | 'low';
  icon: string;
  title: string;
  message: string;
  actionText?: string;
  actionHref?: string;
}

export interface DashboardStats {
  totalLearningTime: number; // minutes
  thisWeekTime: number; // minutes
  averageScore: number; // 0-100
  reviewPendingCount: number;
  lastLearningDate: Date | null;
  consecutiveDays: number;
}

/**
 * 사용자의 학습 추천 항목 생성
 */
export function generateRecommendations(
  userId: string,
  stats: DashboardStats
): LearningRecommendation[] {
  const recommendations: LearningRecommendation[] = [];

  // 1. 감정 기반 추천
  const emotionRecommendations = getEmotionBasedRecommendations(userId);
  recommendations.push(...emotionRecommendations);

  // 2. 학습 활동 기반 추천
  const activityRecommendations = getActivityBasedRecommendations(stats);
  recommendations.push(...activityRecommendations);

  // 3. 복습 필요 항목
  if (stats.reviewPendingCount > 0) {
    recommendations.push({
      type: 'action',
      priority: 'high',
      icon: '🔄',
      title: '복습이 필요해요',
      message: `${stats.reviewPendingCount}개의 플래시카드가 복습을 기다리고 있습니다.`,
      actionText: '복습하러 가기',
      actionHref: '/review',
    });
  }

  // 4. 연속 학습일 격려
  if (stats.consecutiveDays >= 3) {
    recommendations.push({
      type: 'encouragement',
      priority: 'medium',
      icon: '🔥',
      title: '대단해요!',
      message: `${stats.consecutiveDays}일 연속 학습 중입니다. 계속 유지해보세요!`,
    });
  }

  // 우선순위 정렬 (high → medium → low)
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * 감정 기반 추천 (Phase 12 통합)
 */
export function getEmotionBasedRecommendations(userId: string): LearningRecommendation[] {
  const recommendations: LearningRecommendation[] = [];

  try {
    // 최근 7일간의 감정 패턴 분석
    const patterns = analyzeEmotionPatterns(userId, 7);

    // 부정적 패턴 감지
    if (patterns.concerningPatterns.length > 0) {
      patterns.concerningPatterns.forEach((pattern) => {
        if (pattern.includes('frustrated') || pattern.includes('anxious')) {
          recommendations.push({
            type: 'break',
            priority: 'high',
            icon: '🧘',
            title: '휴식이 필요해요',
            message: '최근 학습에서 스트레스가 감지되었습니다. 잠시 쉬어가는 건 어떨까요?',
            actionText: '학습 팁 보기',
            actionHref: '/tips/stress-management',
          });
        }

        if (pattern.includes('confused')) {
          recommendations.push({
            type: 'action',
            priority: 'high',
            icon: '📚',
            title: '개념 복습을 추천해요',
            message: '최근 학습에서 혼란스러움이 감지되었습니다. 기본 개념부터 다시 확인해보세요.',
            actionText: '개념 복습하기',
            actionHref: '/review?type=concept',
          });
        }

        if (pattern.includes('bored')) {
          recommendations.push({
            type: 'action',
            priority: 'medium',
            icon: '🎮',
            title: '새로운 학습 방법 시도',
            message: '학습이 지루하신가요? 게임형 학습이나 대화형 학습을 시도해보세요.',
            actionText: '체험해보기',
            actionHref: '/interactive',
          });
        }
      });
    }

    // 긍정적 패턴 유지
    if (patterns.positivePatterns.length > 0 && patterns.concerningPatterns.length === 0) {
      recommendations.push({
        type: 'encouragement',
        priority: 'low',
        icon: '✨',
        title: '좋은 학습 패턴이에요!',
        message: '현재의 학습 패턴을 계속 유지해보세요. 잘하고 있습니다!',
      });
    }

    // 시간대별 패턴 활용
    const now = new Date();
    const currentHour = now.getHours();
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';

    if (currentHour >= 6 && currentHour < 12) timeOfDay = 'morning';
    else if (currentHour >= 12 && currentHour < 18) timeOfDay = 'afternoon';
    else if (currentHour >= 18 && currentHour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    const bestTimeEmotions = patterns.timeOfDayEmotions[timeOfDay];
    if (bestTimeEmotions) {
      const positiveEmotions = ['happy', 'excited', 'confident'];
      const bestEmotion = Object.entries(bestTimeEmotions).reduce((best, [emotion, count]) => {
        const numCount = typeof count === 'number' ? count : 0;
        if (positiveEmotions.includes(emotion) && numCount > best[1]) {
          return [emotion, numCount] as [string, number];
        }
        return best;
      }, ['', 0] as [string, number]);

      if (bestEmotion[1] > 5) {
        // 5회 이상
        const timeLabels = {
          morning: '아침',
          afternoon: '오후',
          evening: '저녁',
          night: '밤',
        };

        recommendations.push({
          type: 'action',
          priority: 'low',
          icon: '⏰',
          title: `${timeLabels[timeOfDay]} 학습이 효과적이에요`,
          message: `당신은 ${timeLabels[timeOfDay]} 시간대에 가장 집중력이 높습니다.`,
        });
      }
    }
  } catch (error) {
    console.error('감정 기반 추천 생성 실패:', error);
  }

  return recommendations;
}

/**
 * 학습 활동 기반 추천
 */
export function getActivityBasedRecommendations(stats: DashboardStats): LearningRecommendation[] {
  const recommendations: LearningRecommendation[] = [];

  // 미접속 기간 체크
  if (stats.lastLearningDate) {
    const daysSinceLastLearning = Math.floor(
      (Date.now() - stats.lastLearningDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastLearning >= 3) {
      recommendations.push({
        type: 'warning',
        priority: 'high',
        icon: '⚠️',
        title: `${daysSinceLastLearning}일간 학습하지 않았어요`,
        message: '꾸준한 학습이 중요합니다. 오늘 다시 시작해볼까요?',
        actionText: '학습 시작하기',
        actionHref: '/dashboard',
      });
    }
  }

  // 이번 주 학습 시간 체크
  if (stats.thisWeekTime === 0) {
    recommendations.push({
      type: 'action',
      priority: 'high',
      icon: '📅',
      title: '이번 주 첫 학습을 시작하세요',
      message: '주간 목표를 달성하려면 지금 시작하는 것이 좋습니다.',
      actionText: '영어 학습',
      actionHref: '/tutor/english',
    });
  } else if (stats.thisWeekTime < 60) {
    // 1시간 미만
    recommendations.push({
      type: 'action',
      priority: 'medium',
      icon: '⏱️',
      title: '주간 목표까지 조금 더!',
      message: `이번 주 ${stats.thisWeekTime}분 학습하셨습니다. 목표 달성까지 ${
        60 - stats.thisWeekTime
      }분 남았어요.`,
    });
  }

  // 평균 점수 기반 추천
  if (stats.averageScore < 60) {
    recommendations.push({
      type: 'action',
      priority: 'medium',
      icon: '📖',
      title: '기초 개념 복습이 필요해요',
      message: '평균 점수가 낮습니다. 기본 개념부터 다시 학습해보세요.',
      actionText: '기초 개념 학습',
      actionHref: '/tutor/math?difficulty=beginner',
    });
  } else if (stats.averageScore >= 80) {
    recommendations.push({
      type: 'encouragement',
      priority: 'low',
      icon: '🎉',
      title: '훌륭한 성적이에요!',
      message: `평균 ${stats.averageScore}점을 유지하고 있습니다. 심화 학습에 도전해보세요!`,
      actionText: '심화 학습',
      actionHref: '/tutor/math?difficulty=advanced',
    });
  }

  return recommendations;
}

/**
 * 사용자의 최근 학습 활동 날짜 가져오기
 */
export function getLastLearningDate(userId: string): Date | null {
  if (typeof window === 'undefined') return null;

  try {
    const key = `learning_activity_${userId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    return new Date(parsed.lastActivity);
  } catch (error) {
    console.error('최근 학습 날짜 가져오기 실패:', error);
    return null;
  }
}

/**
 * 학습 활동 기록 업데이트
 */
export function updateLearningActivity(userId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const key = `learning_activity_${userId}`;
    const now = new Date();

    // 기존 데이터 가져오기
    const stored = localStorage.getItem(key);
    let data = stored ? JSON.parse(stored) : { consecutiveDays: 0, lastActivity: null };

    // 연속 학습일 계산
    if (data.lastActivity) {
      const lastDate = new Date(data.lastActivity);
      const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // 하루 차이 = 연속
        data.consecutiveDays += 1;
      } else if (daysDiff > 1) {
        // 1일 이상 차이 = 끊김
        data.consecutiveDays = 1;
      }
      // daysDiff === 0 (같은 날) = 유지
    } else {
      // 첫 학습
      data.consecutiveDays = 1;
    }

    data.lastActivity = now.toISOString();
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('학습 활동 업데이트 실패:', error);
  }
}

/**
 * 연속 학습일 가져오기
 */
export function getConsecutiveDays(userId: string): number {
  if (typeof window === 'undefined') return 0;

  try {
    const key = `learning_activity_${userId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return 0;

    const parsed = JSON.parse(stored);
    return parsed.consecutiveDays || 0;
  } catch (error) {
    console.error('연속 학습일 가져오기 실패:', error);
    return 0;
  }
}
