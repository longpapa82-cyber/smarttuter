// lib/emotion/emotion-storage.ts

import type {
  EmotionAnalysis,
  EmotionHistory,
  EmotionTrend,
  EmotionCategory,
} from '@/types/emotion';

/**
 * 감정 데이터 로컬 스토리지 관리
 *
 * LocalStorage를 사용한 감정 히스토리 저장 및 조회
 * (추후 Database 통합 준비)
 */

const STORAGE_KEY = 'smarttutor_emotion_history';
const MAX_HISTORY_DAYS = 30; // 최대 30일 히스토리 저장

/**
 * 감정 세션 데이터
 */
export interface EmotionSession {
  sessionId: string;
  userId: string;
  subject: 'math' | 'english';
  gradeLevel: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // seconds
  analyses: EmotionAnalysis[];
  trend: EmotionTrend;
}

/**
 * 감정 통계 (일별)
 */
export interface DailyEmotionStats {
  date: string; // YYYY-MM-DD
  userId: string;
  totalSessions: number;
  totalAnalyses: number;
  emotionCounts: Partial<Record<EmotionCategory, number>>;
  averageIntensity: number;
  mostFrequentEmotion: EmotionCategory;
  positiveRate: number; // 0.0 - 1.0
  needsAttentionCount: number;
}

/**
 * 감정 히스토리 저장
 */
export function saveEmotionSession(session: EmotionSession): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getEmotionHistory(session.userId);
    history.push(session);

    // 30일 이상 오래된 데이터 제거
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MAX_HISTORY_DAYS);

    const filtered = history.filter(
      (s) => new Date(s.startTime).getTime() > cutoffDate.getTime()
    );

    localStorage.setItem(
      `${STORAGE_KEY}_${session.userId}`,
      JSON.stringify(filtered)
    );
  } catch (error) {
    console.error('Failed to save emotion session:', error);
  }
}

/**
 * 감정 히스토리 조회
 */
export function getEmotionHistory(userId: string): EmotionSession[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (!stored) return [];

    const history = JSON.parse(stored);

    // Date 객체 복원
    return history.map((session: any) => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: session.endTime ? new Date(session.endTime) : undefined,
      analyses: session.analyses.map((a: any) => ({
        ...a,
        timestamp: new Date(a.timestamp),
      })),
    }));
  } catch (error) {
    console.error('Failed to load emotion history:', error);
    return [];
  }
}

/**
 * 특정 기간 감정 히스토리 조회
 */
export function getEmotionHistoryByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): EmotionSession[] {
  const history = getEmotionHistory(userId);

  return history.filter((session) => {
    const sessionDate = new Date(session.startTime);
    return sessionDate >= startDate && sessionDate <= endDate;
  });
}

/**
 * 일별 감정 통계 계산
 */
export function calculateDailyStats(
  userId: string,
  date: Date
): DailyEmotionStats | null {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const sessions = getEmotionHistoryByDateRange(userId, startOfDay, endOfDay);

  if (sessions.length === 0) return null;

  // 모든 분석 수집
  const allAnalyses: EmotionAnalysis[] = [];
  sessions.forEach((s) => allAnalyses.push(...s.analyses));

  if (allAnalyses.length === 0) return null;

  // 감정별 카운트
  const emotionCounts: Partial<Record<EmotionCategory, number>> = {};
  allAnalyses.forEach((a) => {
    emotionCounts[a.primary] = (emotionCounts[a.primary] || 0) + 1;
  });

  // 가장 빈번한 감정
  const mostFrequent = (Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    'neutral') as EmotionCategory;

  // 평균 강도
  const averageIntensity =
    allAnalyses.reduce((sum, a) => sum + a.intensity, 0) / allAnalyses.length;

  // 긍정 감정 비율
  const positiveEmotions = ['happy', 'excited', 'confident'];
  const positiveCount = allAnalyses.filter((a) =>
    positiveEmotions.includes(a.primary)
  ).length;
  const positiveRate = positiveCount / allAnalyses.length;

  // 주의 필요 횟수
  const needsAttentionCount = sessions.filter((s) => s.trend.needsAttention).length;

  return {
    date: formatDate(date),
    userId,
    totalSessions: sessions.length,
    totalAnalyses: allAnalyses.length,
    emotionCounts,
    averageIntensity,
    mostFrequentEmotion: mostFrequent,
    positiveRate,
    needsAttentionCount,
  };
}

/**
 * 주간 감정 통계
 */
export function calculateWeeklyStats(
  userId: string,
  weekStartDate: Date
): DailyEmotionStats[] {
  const stats: DailyEmotionStats[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStartDate);
    date.setDate(date.getDate() + i);

    const dailyStat = calculateDailyStats(userId, date);
    if (dailyStat) {
      stats.push(dailyStat);
    }
  }

  return stats;
}

/**
 * 월간 감정 통계
 */
export function calculateMonthlyStats(
  userId: string,
  year: number,
  month: number // 0-11
): DailyEmotionStats[] {
  const stats: DailyEmotionStats[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dailyStat = calculateDailyStats(userId, date);
    if (dailyStat) {
      stats.push(dailyStat);
    }
  }

  return stats;
}

/**
 * 감정 패턴 분석
 */
export interface EmotionPattern {
  /** 학습 시간대별 감정 */
  timeOfDayEmotions: Record<string, EmotionCategory>; // "morning" | "afternoon" | "evening" | "night"

  /** 요일별 감정 트렌드 */
  weekdayTrends: Record<string, EmotionCategory>; // "monday" ~ "sunday"

  /** 과목별 감정 */
  subjectEmotions: Record<'math' | 'english', EmotionCategory>;

  /** 주의가 필요한 패턴 */
  concerningPatterns: string[];

  /** 긍정적 패턴 */
  positivePatterns: string[];
}

/**
 * 감정 패턴 분석
 */
export function analyzeEmotionPatterns(
  userId: string,
  days: number = 30
): EmotionPattern {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const sessions = getEmotionHistoryByDateRange(userId, startDate, endDate);

  // 시간대별 감정
  const timeOfDayEmotions: Record<string, EmotionCategory[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    night: [],
  };

  // 요일별 감정
  const weekdayEmotions: Record<string, EmotionCategory[]> = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  };

  // 과목별 감정
  const subjectEmotionsData: Record<'math' | 'english', EmotionCategory[]> = {
    math: [],
    english: [],
  };

  sessions.forEach((session) => {
    const mostFrequent = session.trend.mostFrequent;
    const hour = new Date(session.startTime).getHours();
    const dayOfWeek = new Date(session.startTime).getDay();

    // 시간대 분류
    let timeOfDay: string;
    if (hour >= 6 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
    else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    timeOfDayEmotions[timeOfDay].push(mostFrequent);

    // 요일 분류
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    weekdayEmotions[dayNames[dayOfWeek]].push(mostFrequent);

    // 과목별
    subjectEmotionsData[session.subject].push(mostFrequent);
  });

  // 가장 빈번한 감정 추출
  const getMostFrequent = (emotions: EmotionCategory[]): EmotionCategory => {
    if (emotions.length === 0) return 'neutral';
    const counts: Record<string, number> = {};
    emotions.forEach((e) => {
      counts[e] = (counts[e] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as EmotionCategory;
  };

  // 패턴 분석
  const concerningPatterns: string[] = [];
  const positivePatterns: string[] = [];

  // 시간대별 부정적 패턴 감지
  Object.entries(timeOfDayEmotions).forEach(([time, emotions]) => {
    const mostFreq = getMostFrequent(emotions);
    if (['frustrated', 'anxious', 'tired'].includes(mostFreq)) {
      concerningPatterns.push(`${time}에 주로 ${mostFreq} 감정을 느낌`);
    }
    if (['happy', 'excited', 'confident'].includes(mostFreq)) {
      positivePatterns.push(`${time}에 학습 효율이 높음`);
    }
  });

  // 과목별 패턴
  Object.entries(subjectEmotionsData).forEach(([subject, emotions]) => {
    const mostFreq = getMostFrequent(emotions);
    if (['frustrated', 'confused'].includes(mostFreq)) {
      concerningPatterns.push(`${subject} 과목에서 어려움을 자주 느낌`);
    }
  });

  return {
    timeOfDayEmotions: Object.fromEntries(
      Object.entries(timeOfDayEmotions).map(([k, v]) => [k, getMostFrequent(v)])
    ),
    weekdayTrends: Object.fromEntries(
      Object.entries(weekdayEmotions).map(([k, v]) => [k, getMostFrequent(v)])
    ),
    subjectEmotions: {
      math: getMostFrequent(subjectEmotionsData.math),
      english: getMostFrequent(subjectEmotionsData.english),
    },
    concerningPatterns,
    positivePatterns,
  };
}

/**
 * 날짜 포맷 (YYYY-MM-DD)
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 감정 히스토리 삭제
 */
export function clearEmotionHistory(userId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${STORAGE_KEY}_${userId}`);
}

/**
 * 감정 데이터 내보내기 (JSON)
 */
export function exportEmotionData(userId: string): string {
  const history = getEmotionHistory(userId);
  return JSON.stringify(history, null, 2);
}
