/**
 * Learning Goals System Types
 *
 * Inspired by Duolingo, Khan Academy, and Coursera
 * Helps students set and track their learning objectives
 */

/**
 * Goal period type
 */
export type GoalPeriod = 'daily' | 'weekly' | 'monthly';

/**
 * Goal metric type - what the user is trying to achieve
 */
export type GoalMetric =
  | 'study_time'        // Total minutes of study
  | 'sessions'          // Number of learning sessions
  | 'conversations'     // Number of tutor conversations
  | 'concepts'          // Number of concepts mastered
  | 'accuracy'          // Average accuracy percentage
  | 'streak_days';      // Consecutive study days

/**
 * Goal status
 */
export type GoalStatus = 'active' | 'completed' | 'failed' | 'cancelled';

/**
 * Subject filter for goals
 */
export type GoalSubject = 'all' | 'english' | 'math' | 'science' | 'social' | 'korean';

/**
 * Learning goal definition
 */
export interface LearningGoal {
  id: string;
  userId: string;

  // Goal configuration
  metric: GoalMetric;
  targetValue: number;
  period: GoalPeriod;
  subject: GoalSubject;

  // Timing
  startDate: string;      // ISO date (YYYY-MM-DD)
  endDate: string;        // ISO date (YYYY-MM-DD)

  // Progress
  currentValue: number;
  progressPercentage: number;

  // Status
  status: GoalStatus;
  completedAt?: string;   // ISO timestamp

  // Metadata
  createdAt: string;      // ISO timestamp
  updatedAt: string;      // ISO timestamp

  // Rewards
  xpReward: number;       // XP earned upon completion
  badgeId?: string;       // Optional badge unlock
}

/**
 * Goal progress snapshot
 */
export interface GoalProgress {
  goalId: string;
  date: string;           // ISO date (YYYY-MM-DD)
  value: number;
  progressPercentage: number;
}

/**
 * Weekly/Monthly report data
 */
export interface ProgressReport {
  userId: string;
  period: GoalPeriod;
  startDate: string;
  endDate: string;

  // Goals summary
  totalGoals: number;
  completedGoals: number;
  activeGoals: number;
  failedGoals: number;
  completionRate: number; // percentage

  // Metrics by subject
  subjects: {
    [subject: string]: {
      studyTime: number;          // minutes
      sessions: number;
      conversations: number;
      conceptsMastered: number;
      averageAccuracy: number;    // percentage
    };
  };

  // Achievements
  badges: string[];           // Badge IDs earned this period
  xpEarned: number;
  levelProgress: {
    startLevel: number;
    endLevel: number;
    levelsGained: number;
  };

  // Streak
  longestStreak: number;
  currentStreak: number;

  // Generated timestamp
  generatedAt: string;        // ISO timestamp
}

/**
 * Goal template for quick setup
 */
export interface GoalTemplate {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  icon: string;

  // Default values
  metric: GoalMetric;
  period: GoalPeriod;
  suggestedValues: {
    elementary: number;
    middle: number;
    high: number;
    university: number;
  };

  category: 'consistency' | 'mastery' | 'engagement';
}

/**
 * Calculate XP reward for goal completion
 */
export function calculateGoalXPReward(goal: Partial<LearningGoal>): number {
  const baseReward = {
    daily: 50,
    weekly: 200,
    monthly: 1000,
  }[goal.period || 'weekly'];

  const metricMultiplier = {
    study_time: 1.0,
    sessions: 1.2,
    conversations: 1.1,
    concepts: 1.5,
    accuracy: 1.3,
    streak_days: 1.4,
  }[goal.metric || 'study_time'];

  return Math.round(baseReward * metricMultiplier);
}

/**
 * Get goal end date based on period
 */
export function calculateGoalEndDate(startDate: string, period: GoalPeriod): string {
  const start = new Date(startDate);

  switch (period) {
    case 'daily':
      start.setDate(start.getDate() + 1);
      break;
    case 'weekly':
      start.setDate(start.getDate() + 7);
      break;
    case 'monthly':
      start.setMonth(start.getMonth() + 1);
      break;
  }

  return start.toISOString().split('T')[0];
}

/**
 * Check if goal is still active (not expired)
 */
export function isGoalActive(goal: LearningGoal): boolean {
  if (goal.status !== 'active') return false;

  const now = new Date();
  const endDate = new Date(goal.endDate);

  return now <= endDate;
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
}

/**
 * Predefined goal templates
 */
export const GOAL_TEMPLATES: GoalTemplate[] = [
  // Consistency goals
  {
    id: 'daily_study_time',
    name: 'Daily Study Time',
    nameKo: 'Daily Study Time',
    description: 'Study for a set amount of time each day',
    descriptionKo: 'Study for a set amount of time each day',
    icon: '⏰',
    metric: 'study_time',
    period: 'daily',
    suggestedValues: {
      elementary: 15,
      middle: 30,
      high: 45,
      university: 60,
    },
    category: 'consistency',
  },
  {
    id: 'weekly_study_time',
    name: 'Weekly Study Time',
    nameKo: 'Weekly Study Time',
    description: 'Total study time for the week',
    descriptionKo: 'Total study time for the week',
    icon: '📅',
    metric: 'study_time',
    period: 'weekly',
    suggestedValues: {
      elementary: 120,      // 2 hours
      middle: 240,          // 4 hours
      high: 360,            // 6 hours
      university: 480,      // 8 hours
    },
    category: 'consistency',
  },
  {
    id: 'weekly_streak',
    name: 'Weekly Streak',
    nameKo: 'Weekly Streak',
    description: 'Study every day this week',
    descriptionKo: 'Study every day this week',
    icon: '🔥',
    metric: 'streak_days',
    period: 'weekly',
    suggestedValues: {
      elementary: 5,
      middle: 6,
      high: 7,
      university: 7,
    },
    category: 'consistency',
  },
  // Mastery goals
  {
    id: 'weekly_concepts',
    name: 'Weekly Concepts',
    nameKo: 'Weekly Concepts',
    description: 'Master a set number of concepts',
    descriptionKo: 'Master a set number of concepts',
    icon: '🎯',
    metric: 'concepts',
    period: 'weekly',
    suggestedValues: {
      elementary: 3,
      middle: 5,
      high: 7,
      university: 10,
    },
    category: 'mastery',
  },
  {
    id: 'weekly_accuracy',
    name: 'Weekly Accuracy',
    nameKo: 'Weekly Accuracy',
    description: 'Maintain high accuracy',
    descriptionKo: 'Maintain high accuracy',
    icon: '🎯',
    metric: 'accuracy',
    period: 'weekly',
    suggestedValues: {
      elementary: 70,
      middle: 75,
      high: 80,
      university: 85,
    },
    category: 'mastery',
  },
  // Engagement goals
  {
    id: 'weekly_sessions',
    name: 'Weekly Sessions',
    nameKo: 'Weekly Sessions',
    description: 'Complete study sessions',
    descriptionKo: 'Complete study sessions',
    icon: '📚',
    metric: 'sessions',
    period: 'weekly',
    suggestedValues: {
      elementary: 5,
      middle: 7,
      high: 10,
      university: 14,
    },
    category: 'engagement',
  },
  {
    id: 'weekly_conversations',
    name: 'Weekly Conversations',
    nameKo: 'Weekly Conversations',
    description: 'Have conversations with AI tutor',
    descriptionKo: 'Have conversations with AI tutor',
    icon: '💬',
    metric: 'conversations',
    period: 'weekly',
    suggestedValues: {
      elementary: 20,
      middle: 30,
      high: 50,
      university: 70,
    },
    category: 'engagement',
  },
];
