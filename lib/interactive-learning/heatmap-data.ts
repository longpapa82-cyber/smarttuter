/**
 * Learning Heatmap Data Generator
 *
 * GitHub contributions 스타일의 학습 히트맵 데이터 생성
 * 최근 90일간의 학습 활동을 시각화
 */

export interface LearningDay {
  date: string; // YYYY-MM-DD
  flashcardsReviewed: number;
  quizzesTaken: number;
  xpEarned: number;
  totalMinutes: number;
  intensity: 0 | 1 | 2 | 3 | 4; // 0: 없음, 1-4: 낮음-매우높음
}

export interface HeatmapWeek {
  days: (LearningDay | null)[]; // null for padding
}

/**
 * 최근 N일간의 학습 데이터 생성
 */
export function generateLearningDays(days: number = 90): LearningDay[] {
  const learningDays: LearningDay[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // 실제 데이터는 localStorage나 DB에서 가져와야 함
    // 현재는 예시 데이터 생성
    const dateStr = date.toISOString().split('T')[0];

    learningDays.push({
      date: dateStr,
      flashcardsReviewed: 0,
      quizzesTaken: 0,
      xpEarned: 0,
      totalMinutes: 0,
      intensity: 0,
    });
  }

  return learningDays;
}

/**
 * 학습량에 따른 강도 계산
 */
export function calculateIntensity(
  flashcardsReviewed: number,
  quizzesTaken: number,
  totalMinutes: number
): 0 | 1 | 2 | 3 | 4 {
  const totalActivity = flashcardsReviewed + quizzesTaken * 3;

  if (totalActivity === 0 && totalMinutes === 0) return 0;
  if (totalActivity <= 5 || totalMinutes <= 10) return 1;
  if (totalActivity <= 15 || totalMinutes <= 30) return 2;
  if (totalActivity <= 30 || totalMinutes <= 60) return 3;
  return 4;
}

/**
 * 일별 데이터를 주별로 그룹화
 */
export function groupByWeeks(days: LearningDay[]): HeatmapWeek[] {
  if (days.length === 0) return [];

  const weeks: HeatmapWeek[] = [];
  let currentWeek: (LearningDay | null)[] = [];

  // 첫 날의 요일 확인 (0 = 일요일)
  const firstDate = new Date(days[0].date);
  const firstDayOfWeek = firstDate.getDay();

  // 첫 주 패딩 추가
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }

  // 데이터 추가
  days.forEach((day) => {
    currentWeek.push(day);

    // 주가 완성되면 (일요일~토요일 7일)
    if (currentWeek.length === 7) {
      weeks.push({ days: currentWeek });
      currentWeek = [];
    }
  });

  // 마지막 주 패딩 추가
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push({ days: currentWeek });
  }

  return weeks;
}

/**
 * 강도별 색상 클래스 반환
 */
export function getIntensityColor(intensity: 0 | 1 | 2 | 3 | 4): {
  light: string;
  dark: string;
} {
  switch (intensity) {
    case 0:
      return {
        light: 'bg-gray-100 hover:bg-gray-200',
        dark: 'dark:bg-gray-800 dark:hover:bg-gray-700',
      };
    case 1:
      return {
        light: 'bg-green-200 hover:bg-green-300',
        dark: 'dark:bg-green-900/40 dark:hover:bg-green-900/60',
      };
    case 2:
      return {
        light: 'bg-green-400 hover:bg-green-500',
        dark: 'dark:bg-green-700/60 dark:hover:bg-green-700/80',
      };
    case 3:
      return {
        light: 'bg-green-600 hover:bg-green-700',
        dark: 'dark:bg-green-600/80 dark:hover:bg-green-600',
      };
    case 4:
      return {
        light: 'bg-green-800 hover:bg-green-900',
        dark: 'dark:bg-green-500 dark:hover:bg-green-400',
      };
  }
}

/**
 * 요일 레이블
 */
export const weekdayLabels = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * 월 레이블 계산
 */
export function getMonthLabels(weeks: HeatmapWeek[]): Array<{
  month: string;
  offset: number;
}> {
  if (weeks.length === 0) return [];

  const monthLabels: Array<{ month: string; offset: number }> = [];
  let currentMonth = '';

  weeks.forEach((week, weekIndex) => {
    const firstDay = week.days.find((d) => d !== null);
    if (!firstDay) return;

    const date = new Date(firstDay.date);
    const month = date.toLocaleString('ko-KR', { month: 'short' });

    if (month !== currentMonth) {
      monthLabels.push({ month, offset: weekIndex });
      currentMonth = month;
    }
  });

  return monthLabels;
}

/**
 * 연속 학습 일수 (스트릭) 계산
 */
export function calculateStreak(days: LearningDay[]): {
  current: number;
  longest: number;
} {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // 최신 날부터 역순으로 확인
  const sortedDays = [...days].reverse();

  for (let i = 0; i < sortedDays.length; i++) {
    const day = sortedDays[i];

    if (day.intensity > 0) {
      tempStreak++;
      if (i === 0 || sortedDays[i - 1]?.intensity > 0) {
        currentStreak = tempStreak;
      }
    } else {
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      tempStreak = 0;
      if (i === 0) {
        currentStreak = 0;
      }
    }
  }

  if (tempStreak > longestStreak) {
    longestStreak = tempStreak;
  }

  return { current: currentStreak, longest: Math.max(longestStreak, currentStreak) };
}

/**
 * 학습 통계 계산
 */
export function calculateHeatmapStats(days: LearningDay[]) {
  const totalFlashcards = days.reduce((sum, day) => sum + day.flashcardsReviewed, 0);
  const totalQuizzes = days.reduce((sum, day) => sum + day.quizzesTaken, 0);
  const totalXP = days.reduce((sum, day) => sum + day.xpEarned, 0);
  const totalMinutes = days.reduce((sum, day) => sum + day.totalMinutes, 0);
  const activeDays = days.filter((day) => day.intensity > 0).length;
  const streak = calculateStreak(days);

  return {
    totalFlashcards,
    totalQuizzes,
    totalXP,
    totalMinutes,
    activeDays,
    totalDays: days.length,
    currentStreak: streak.current,
    longestStreak: streak.longest,
    averageFlashcardsPerDay: Math.round(totalFlashcards / Math.max(activeDays, 1)),
    averageMinutesPerDay: Math.round(totalMinutes / Math.max(activeDays, 1)),
  };
}
