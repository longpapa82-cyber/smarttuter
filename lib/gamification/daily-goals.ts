// Daily Goals System
// Provides daily learning targets to motivate consistent study habits

import { format, startOfDay, isToday, parseISO } from 'date-fns';

export type GoalType = 'flashcards' | 'quiz' | 'studyTime' | 'xp' | 'tutor';

export interface DailyGoal {
  id: string;
  type: GoalType;
  target: number;
  current: number;
  completed: boolean;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
}

export interface DailyGoalsProgress {
  date: string; // YYYY-MM-DD
  goals: DailyGoal[];
  overallProgress: number; // 0-100
  completedCount: number;
  totalCount: number;
}

// Default daily goals configuration
export const DEFAULT_DAILY_GOALS: Omit<DailyGoal, 'id' | 'current' | 'completed'>[] = [
  {
    type: 'flashcards',
    target: 10,
    title: '플래시카드 10장 복습',
    description: '오늘의 플래시카드를 복습하세요',
    icon: '🃏',
    xpReward: 50,
  },
  {
    type: 'quiz',
    target: 1,
    title: '퀴즈 1회 완료',
    description: 'AI 퀴즈를 한 번 완료하세요',
    icon: '🎯',
    xpReward: 75,
  },
  {
    type: 'studyTime',
    target: 15, // minutes
    title: '15분 이상 학습',
    description: '최소 15분 이상 학습하세요',
    icon: '⏰',
    xpReward: 40,
  },
  {
    type: 'xp',
    target: 100,
    title: '100 XP 획득',
    description: '오늘 100 XP를 획득하세요',
    icon: '⭐',
    xpReward: 30,
  },
  {
    type: 'tutor',
    target: 1,
    title: '튜터 세션 1회',
    description: '영어 또는 수학 튜터와 대화하세요',
    icon: '💬',
    xpReward: 60,
  },
];

/**
 * Initialize daily goals for a new day
 */
export function initializeDailyGoals(): DailyGoalsProgress {
  const today = format(startOfDay(new Date()), 'yyyy-MM-dd');

  const goals: DailyGoal[] = DEFAULT_DAILY_GOALS.map((config, index) => ({
    ...config,
    id: `goal-${today}-${index}`,
    current: 0,
    completed: false,
  }));

  return {
    date: today,
    goals,
    overallProgress: 0,
    completedCount: 0,
    totalCount: goals.length,
  };
}

/**
 * Update progress for a specific goal type
 */
export function updateGoalProgress(
  progress: DailyGoalsProgress,
  type: GoalType,
  increment: number = 1
): {
  progress: DailyGoalsProgress;
  newlyCompleted: DailyGoal[];
  allCompleted: boolean;
} {
  const today = format(startOfDay(new Date()), 'yyyy-MM-dd');

  // Check if goals need to be reset for new day
  if (progress.date !== today) {
    progress = initializeDailyGoals();
  }

  const newlyCompleted: DailyGoal[] = [];
  const updatedGoals = progress.goals.map((goal) => {
    if (goal.type === type && !goal.completed) {
      const newCurrent = Math.min(goal.current + increment, goal.target);
      const nowCompleted = newCurrent >= goal.target;

      // Track newly completed goals
      if (nowCompleted && !goal.completed) {
        newlyCompleted.push({ ...goal, current: newCurrent, completed: true });
      }

      return {
        ...goal,
        current: newCurrent,
        completed: nowCompleted,
      };
    }
    return goal;
  });

  const completedCount = updatedGoals.filter((g) => g.completed).length;
  const overallProgress = Math.round((completedCount / updatedGoals.length) * 100);
  const allCompleted = completedCount === updatedGoals.length;

  return {
    progress: {
      ...progress,
      date: today,
      goals: updatedGoals,
      overallProgress,
      completedCount,
      totalCount: updatedGoals.length,
    },
    newlyCompleted,
    allCompleted,
  };
}

/**
 * Get goal progress for a specific type
 */
export function getGoalProgress(
  progress: DailyGoalsProgress,
  type: GoalType
): DailyGoal | undefined {
  return progress.goals.find((goal) => goal.type === type);
}

/**
 * Check if all goals are completed
 */
export function areAllGoalsCompleted(progress: DailyGoalsProgress): boolean {
  return progress.completedCount === progress.totalCount;
}

/**
 * Calculate total XP reward for completed goals
 */
export function calculateCompletedXP(progress: DailyGoalsProgress): number {
  return progress.goals
    .filter((goal) => goal.completed)
    .reduce((total, goal) => total + goal.xpReward, 0);
}

/**
 * Get motivational message based on progress
 */
export function getMotivationalMessage(progress: DailyGoalsProgress): {
  emoji: string;
  message: string;
  urgency: 'none' | 'low' | 'medium' | 'high';
} {
  const percentage = progress.overallProgress;

  if (percentage === 100) {
    return {
      emoji: '🎉',
      message: '오늘의 목표를 모두 달성했습니다! 대단해요!',
      urgency: 'none',
    };
  } else if (percentage >= 75) {
    return {
      emoji: '🔥',
      message: '거의 다 왔어요! 조금만 더 힘내세요!',
      urgency: 'low',
    };
  } else if (percentage >= 50) {
    return {
      emoji: '💪',
      message: '절반 이상 완료! 계속 좋은 페이스예요!',
      urgency: 'low',
    };
  } else if (percentage >= 25) {
    return {
      emoji: '🚀',
      message: '좋은 시작이에요! 계속 진행하세요!',
      urgency: 'medium',
    };
  } else if (percentage > 0) {
    return {
      emoji: '✨',
      message: '첫 목표를 달성했어요! 멋져요!',
      urgency: 'medium',
    };
  } else {
    return {
      emoji: '🎯',
      message: '오늘의 목표를 시작해볼까요?',
      urgency: 'high',
    };
  }
}

/**
 * Get suggested next action based on incomplete goals
 */
export function getSuggestedAction(progress: DailyGoalsProgress): DailyGoal | null {
  // Find the first incomplete goal with highest XP reward
  const incompleteGoals = progress.goals
    .filter((goal) => !goal.completed)
    .sort((a, b) => b.xpReward - a.xpReward);

  return incompleteGoals[0] || null;
}

/**
 * Get completion streak for daily goals
 */
export interface GoalCompletionHistory {
  date: string;
  completed: boolean;
  completedCount: number;
  totalCount: number;
}

export function calculateGoalStreak(history: GoalCompletionHistory[]): {
  currentStreak: number;
  longestStreak: number;
} {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Sort by date descending (most recent first)
  const sortedHistory = [...history].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate current streak (from today backwards)
  for (const record of sortedHistory) {
    if (record.completed) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate longest streak
  for (const record of sortedHistory) {
    if (record.completed) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return { currentStreak, longestStreak };
}
