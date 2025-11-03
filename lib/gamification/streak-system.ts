// Learning Streak System
// Inspired by Duolingo's streak system

import { format, subDays, differenceInDays, startOfDay } from 'date-fns';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string; // YYYY-MM-DD
  freezeTokens: number; // 스트릭 보호권
  totalStudyDays: number;
  streakMilestones: number[]; // 달성한 마일스톤 [7, 30, 100]
}

export interface DailyGoal {
  type: 'flashcards' | 'quizzes' | 'time' | 'xp';
  target: number;
  current: number;
  completed: boolean;
}

export interface StudyActivity {
  date: string; // YYYY-MM-DD
  flashcardsReviewed: number;
  quizzesTaken: number;
  minutesStudied: number;
  xpEarned: number;
}

/**
 * Initialize default streak data
 */
export function initializeStreakData(): StreakData {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: '',
    freezeTokens: 0,
    totalStudyDays: 0,
    streakMilestones: [],
  };
}

/**
 * Update streak based on study activity
 */
export function updateStreak(
  streakData: StreakData,
  studyDate: Date = new Date()
): {
  streakData: StreakData;
  streakChanged: boolean;
  streakBroken: boolean;
  newMilestone: number | null;
} {
  const today = format(startOfDay(studyDate), 'yyyy-MM-dd');
  const currentStreak = { ...streakData };

  // If already studied today, no change
  if (currentStreak.lastStudyDate === today) {
    return {
      streakData: currentStreak,
      streakChanged: false,
      streakBroken: false,
      newMilestone: null,
    };
  }

  const yesterday = format(subDays(startOfDay(studyDate), 1), 'yyyy-MM-dd');
  let streakChanged = false;
  let streakBroken = false;
  let newMilestone: number | null = null;

  // Case 1: Continuing streak (studied yesterday)
  if (currentStreak.lastStudyDate === yesterday) {
    currentStreak.currentStreak += 1;
    currentStreak.longestStreak = Math.max(
      currentStreak.longestStreak,
      currentStreak.currentStreak
    );
    streakChanged = true;

    // Check for milestone
    newMilestone = checkMilestone(
      currentStreak.currentStreak,
      currentStreak.streakMilestones
    );
    if (newMilestone) {
      currentStreak.streakMilestones.push(newMilestone);
    }
  }
  // Case 2: Streak broken (but can use freeze token)
  else if (currentStreak.lastStudyDate !== '') {
    const lastStudyDate = new Date(currentStreak.lastStudyDate);
    const daysSinceLastStudy = differenceInDays(
      startOfDay(studyDate),
      startOfDay(lastStudyDate)
    );

    // Check if freeze token can save the streak
    if (daysSinceLastStudy === 2 && currentStreak.freezeTokens > 0) {
      // 1 day gap - use freeze token
      currentStreak.freezeTokens -= 1;
      currentStreak.currentStreak += 1;
      currentStreak.longestStreak = Math.max(
        currentStreak.longestStreak,
        currentStreak.currentStreak
      );
      streakChanged = true;
    } else {
      // Streak broken
      currentStreak.currentStreak = 1;
      streakBroken = true;
      streakChanged = true;
    }
  }
  // Case 3: First study ever
  else {
    currentStreak.currentStreak = 1;
    streakChanged = true;
  }

  // Update last study date and total study days
  currentStreak.lastStudyDate = today;
  currentStreak.totalStudyDays += 1;

  return {
    streakData: currentStreak,
    streakChanged,
    streakBroken,
    newMilestone,
  };
}

/**
 * Check if current streak reached a milestone
 */
function checkMilestone(
  currentStreak: number,
  achievedMilestones: number[]
): number | null {
  const milestones = [7, 14, 30, 60, 100, 365];

  for (const milestone of milestones) {
    if (
      currentStreak >= milestone &&
      !achievedMilestones.includes(milestone)
    ) {
      return milestone;
    }
  }

  return null;
}

/**
 * Calculate days until streak breaks (without freeze token)
 */
export function getDaysUntilStreakBreak(lastStudyDate: string): number {
  if (!lastStudyDate) return 0;

  const today = startOfDay(new Date());
  const lastStudy = startOfDay(new Date(lastStudyDate));
  const daysSince = differenceInDays(today, lastStudy);

  if (daysSince >= 2) {
    return 0; // Already broken
  } else if (daysSince === 1) {
    return 0; // Must study today
  } else {
    return 1; // Studied today, safe until tomorrow
  }
}

/**
 * Get streak status message
 */
export function getStreakStatusMessage(streakData: StreakData): {
  message: string;
  urgency: 'safe' | 'warning' | 'critical';
  emoji: string;
} {
  const daysUntilBreak = getDaysUntilStreakBreak(streakData.lastStudyDate);

  if (daysUntilBreak === 0 && streakData.currentStreak > 0) {
    if (streakData.freezeTokens > 0) {
      return {
        message: `오늘 학습하지 않으면 스트릭이 끊깁니다! (보호권 ${streakData.freezeTokens}개 보유)`,
        urgency: 'warning',
        emoji: '⚠️',
      };
    } else {
      return {
        message: '오늘 학습하지 않으면 스트릭이 끊깁니다!',
        urgency: 'critical',
        emoji: '🚨',
      };
    }
  } else if (streakData.currentStreak > 0) {
    return {
      message: `${streakData.currentStreak}일 연속 학습 중! 내일도 계속해보세요 🚀`,
      urgency: 'safe',
      emoji: '🔥',
    };
  } else {
    return {
      message: '첫 학습을 시작하면 스트릭이 시작됩니다!',
      urgency: 'safe',
      emoji: '✨',
    };
  }
}

/**
 * Get milestone reward (freeze tokens)
 */
export function getMilestoneReward(milestone: number): {
  freezeTokens: number;
  message: string;
  badge: string;
} {
  const rewards: Record<
    number,
    { freezeTokens: number; message: string; badge: string }
  > = {
    7: {
      freezeTokens: 1,
      message: '7일 연속 학습! 스트릭 보호권 1개 획득!',
      badge: '🔥 7일 연속',
    },
    14: {
      freezeTokens: 1,
      message: '2주 연속 학습! 스트릭 보호권 1개 획득!',
      badge: '💪 2주 연속',
    },
    30: {
      freezeTokens: 2,
      message: '한 달 연속 학습! 스트릭 보호권 2개 획득!',
      badge: '🏆 30일 연속',
    },
    60: {
      freezeTokens: 2,
      message: '두 달 연속 학습! 스트릭 보호권 2개 획득!',
      badge: '⭐ 60일 연속',
    },
    100: {
      freezeTokens: 3,
      message: '100일 연속 학습! 스트릭 보호권 3개 획득!',
      badge: '👑 100일 연속',
    },
    365: {
      freezeTokens: 5,
      message: '1년 연속 학습! 스트릭 보호권 5개 획득!',
      badge: '🌟 1년 연속',
    },
  };

  return (
    rewards[milestone] || {
      freezeTokens: 0,
      message: '마일스톤 달성!',
      badge: '🎉',
    }
  );
}

/**
 * Initialize daily goals
 */
export function initializeDailyGoals(): DailyGoal[] {
  return [
    {
      type: 'flashcards',
      target: 10,
      current: 0,
      completed: false,
    },
    {
      type: 'xp',
      target: 200,
      current: 0,
      completed: false,
    },
  ];
}

/**
 * Update daily goal progress
 */
export function updateDailyGoal(
  goal: DailyGoal,
  increment: number
): DailyGoal {
  const newCurrent = goal.current + increment;
  return {
    ...goal,
    current: newCurrent,
    completed: newCurrent >= goal.target,
  };
}

/**
 * Get daily goal description
 */
export function getDailyGoalDescription(goal: DailyGoal): string {
  const descriptions: Record<DailyGoal['type'], string> = {
    flashcards: '플래시카드 복습',
    quizzes: '퀴즈 풀기',
    time: '분 학습',
    xp: 'XP 획득',
  };

  return `${descriptions[goal.type]} ${goal.current}/${goal.target}`;
}

/**
 * Get daily goal icon
 */
export function getDailyGoalIcon(goal: DailyGoal): string {
  const icons: Record<DailyGoal['type'], string> = {
    flashcards: '🃏',
    quizzes: '📝',
    time: '⏱️',
    xp: '⭐',
  };

  return icons[goal.type];
}

/**
 * Check if all daily goals are completed
 */
export function areAllGoalsCompleted(goals: DailyGoal[]): boolean {
  return goals.every((goal) => goal.completed);
}

/**
 * Get completion percentage for all goals
 */
export function getOverallGoalProgress(goals: DailyGoal[]): number {
  if (goals.length === 0) return 0;

  const totalProgress = goals.reduce((sum, goal) => {
    const progress = Math.min((goal.current / goal.target) * 100, 100);
    return sum + progress;
  }, 0);

  return Math.round(totalProgress / goals.length);
}

/**
 * Record study activity
 */
export function recordStudyActivity(
  date: Date,
  flashcards: number,
  quizzes: number,
  minutes: number,
  xp: number
): StudyActivity {
  return {
    date: format(startOfDay(date), 'yyyy-MM-dd'),
    flashcardsReviewed: flashcards,
    quizzesTaken: quizzes,
    minutesStudied: minutes,
    xpEarned: xp,
  };
}
