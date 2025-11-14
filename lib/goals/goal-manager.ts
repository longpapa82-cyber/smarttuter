import { Redis } from '@upstash/redis';
import type {
  LearningGoal,
  GoalProgress,
  GoalMetric,
  GoalPeriod,
  GoalSubject,
  GoalStatus,
  ProgressReport,
} from './types';
import {
  calculateGoalXPReward,
  calculateGoalEndDate,
  isGoalActive,
  calculateProgress,
} from './types';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function createGoal(
  userId: string,
  metric: GoalMetric,
  targetValue: number,
  period: GoalPeriod,
  subject: GoalSubject = 'all'
): Promise<LearningGoal> {
  const today = new Date().toISOString().split('T')[0];
  const goalId = 'goal-' + userId + '-' + Date.now();

  const goal: LearningGoal = {
    id: goalId,
    userId,
    metric,
    targetValue,
    period,
    subject,
    startDate: today,
    endDate: calculateGoalEndDate(today, period),
    currentValue: 0,
    progressPercentage: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    xpReward: calculateGoalXPReward({ metric, period }),
  };

  const goalKey = 'goals:' + userId + ':' + goalId;
  await redis.set(goalKey, JSON.stringify(goal));

  const activeGoalsKey = 'goals:active:' + userId;
  await redis.sadd(activeGoalsKey, goalId);

  return goal;
}

export async function getUserGoals(
  userId: string,
  status?: GoalStatus
): Promise<LearningGoal[]> {
  const activeGoalsKey = 'goals:active:' + userId;
  const goalIds = await redis.smembers(activeGoalsKey);

  if (!goalIds || goalIds.length === 0) {
    return [];
  }

  const goals: LearningGoal[] = [];

  for (const goalId of goalIds) {
    const goalKey = 'goals:' + userId + ':' + goalId;
    const goalData = await redis.get(goalKey);

    if (goalData) {
      const goal: LearningGoal = typeof goalData === 'string' ? JSON.parse(goalData) : goalData;

      if (!isGoalActive(goal) && goal.status === 'active') {
        goal.status = 'failed';
        await redis.set(goalKey, JSON.stringify(goal));
      }

      if (!status || goal.status === status) {
        goals.push(goal);
      }
    }
  }

  goals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return goals;
}

export async function updateGoalProgress(
  userId: string,
  metric: GoalMetric,
  incrementValue: number,
  subject?: GoalSubject
): Promise<{
  updatedGoals: LearningGoal[];
  completedGoals: LearningGoal[];
  totalXPEarned: number;
}> {
  const activeGoals = await getUserGoals(userId, 'active');

  const relevantGoals = activeGoals.filter((goal) => {
    const metricMatches = goal.metric === metric;
    const subjectMatches = goal.subject === 'all' || goal.subject === subject;
    return metricMatches && subjectMatches && isGoalActive(goal);
  });

  const updatedGoals: LearningGoal[] = [];
  const completedGoals: LearningGoal[] = [];
  let totalXPEarned = 0;

  for (const goal of relevantGoals) {
    goal.currentValue += incrementValue;
    goal.progressPercentage = calculateProgress(goal.currentValue, goal.targetValue);
    goal.updatedAt = new Date().toISOString();

    if (goal.currentValue >= goal.targetValue && goal.status === 'active') {
      goal.status = 'completed';
      goal.completedAt = new Date().toISOString();
      completedGoals.push(goal);
      totalXPEarned += goal.xpReward;
    }

    const goalKey = 'goals:' + userId + ':' + goal.id;
    await redis.set(goalKey, JSON.stringify(goal));
    updatedGoals.push(goal);

    const today = new Date().toISOString().split('T')[0];
    const progressKey = 'goals:progress:' + goal.id + ':' + today;
    const progressData: GoalProgress = {
      goalId: goal.id,
      date: today,
      value: goal.currentValue,
      progressPercentage: goal.progressPercentage,
    };
    await redis.set(progressKey, JSON.stringify(progressData), { ex: 90 * 24 * 60 * 60 });
  }

  return { updatedGoals, completedGoals, totalXPEarned };
}

export async function cancelGoal(userId: string, goalId: string): Promise<boolean> {
  const goalKey = 'goals:' + userId + ':' + goalId;
  const goalData = await redis.get(goalKey);

  if (!goalData) return false;

  const goal: LearningGoal = typeof goalData === 'string' ? JSON.parse(goalData) : goalData;
  goal.status = 'cancelled';
  goal.updatedAt = new Date().toISOString();

  await redis.set(goalKey, JSON.stringify(goal));

  const activeGoalsKey = 'goals:active:' + userId;
  await redis.srem(activeGoalsKey, goalId);

  return true;
}

export async function getGoalProgressHistory(
  goalId: string,
  days: number = 30
): Promise<GoalProgress[]> {
  const progressData: GoalProgress[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    const progressKey = 'goals:progress:' + goalId + ':' + dateString;
    const data = await redis.get(progressKey);

    if (data) {
      const progress = typeof data === 'string' ? JSON.parse(data) : data;
      progressData.push(progress);
    }
  }

  return progressData.reverse();
}

export async function generateProgressReport(
  userId: string,
  period: 'weekly' | 'monthly'
): Promise<ProgressReport> {
  const endDate = new Date();
  const startDate = new Date();

  if (period === 'weekly') {
    startDate.setDate(endDate.getDate() - 7);
  } else {
    startDate.setMonth(endDate.getMonth() - 1);
  }

  const startDateString = startDate.toISOString().split('T')[0];
  const endDateString = endDate.toISOString().split('T')[0];

  const allGoals = await getUserGoals(userId);
  const periodGoals = allGoals.filter((goal) => {
    return goal.startDate >= startDateString && goal.startDate <= endDateString;
  });

  const totalGoals = periodGoals.length;
  const completedGoals = periodGoals.filter((g) => g.status === 'completed').length;
  const activeGoals = periodGoals.filter((g) => g.status === 'active').length;
  const failedGoals = periodGoals.filter((g) => g.status === 'failed').length;
  const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  const xpEarned = periodGoals
    .filter((g) => g.status === 'completed')
    .reduce((sum, g) => sum + g.xpReward, 0);

  const subjects: ProgressReport['subjects'] = {
    english: { studyTime: 0, sessions: 0, conversations: 0, conceptsMastered: 0, averageAccuracy: 0 },
    math: { studyTime: 0, sessions: 0, conversations: 0, conceptsMastered: 0, averageAccuracy: 0 },
  };

  const report: ProgressReport = {
    userId,
    period,
    startDate: startDateString,
    endDate: endDateString,
    totalGoals,
    completedGoals,
    activeGoals,
    failedGoals,
    completionRate,
    subjects,
    badges: [],
    xpEarned,
    levelProgress: { startLevel: 1, endLevel: 1, levelsGained: 0 },
    longestStreak: 0,
    currentStreak: 0,
    generatedAt: new Date().toISOString(),
  };

  return report;
}

export function getRecommendedGoals(
  gradeLevel: string
): { metric: GoalMetric; period: GoalPeriod; targetValue: number; subject: GoalSubject }[] {
  if (gradeLevel.includes('elementary')) {
    return [
      { metric: 'study_time', period: 'daily', targetValue: 15, subject: 'all' },
      { metric: 'sessions', period: 'weekly', targetValue: 5, subject: 'all' },
      { metric: 'streak_days', period: 'weekly', targetValue: 5, subject: 'all' },
    ];
  } else if (gradeLevel.includes('middle')) {
    return [
      { metric: 'study_time', period: 'daily', targetValue: 30, subject: 'all' },
      { metric: 'sessions', period: 'weekly', targetValue: 7, subject: 'all' },
      { metric: 'concepts', period: 'weekly', targetValue: 5, subject: 'all' },
    ];
  } else {
    return [
      { metric: 'study_time', period: 'daily', targetValue: 45, subject: 'all' },
      { metric: 'sessions', period: 'weekly', targetValue: 10, subject: 'all' },
      { metric: 'concepts', period: 'weekly', targetValue: 7, subject: 'all' },
      { metric: 'accuracy', period: 'weekly', targetValue: 80, subject: 'all' },
    ];
  }
}
