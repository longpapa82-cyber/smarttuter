// Gamification System Type Definitions

export interface UserPoints {
  totalXP: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string; // ISO date string (YYYY-MM-DD)
  freezeTokens: number; // 스트릭 보호권
  totalStudyDays: number;
  streakMilestones: number[]; // 달성한 마일스톤 [7, 14, 30, 60, 100, 365]
}

export interface Achievement {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  icon: string;
  requirement: number;
  category: 'engagement' | 'mastery' | 'consistency';
  unlocked: boolean;
  unlockedAt?: string;
}

export interface SessionRecord {
  id: string;
  date: string; // ISO date string
  subject: 'english' | 'math';
  duration: number; // minutes
  turnsCompleted: number;
  xpEarned: number;
  topicsCovered: string[];
}

export interface WeeklyStats {
  totalTime: number; // minutes
  sessionsCompleted: number;
  topicsStudied: string[];
  avgAccuracy: number; // percentage
}

export interface SubjectProgress {
  english: number; // 0-100
  math: number; // 0-100
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  createdAt: string;

  // Gamification data
  points: UserPoints;
  achievements: string[]; // achievement IDs
  streak: StreakData;
  dailyGoals?: import('./daily-goals').DailyGoalsProgress; // Daily goals tracking

  // Learning records
  sessions: SessionRecord[];
  totalStudyTime: number; // minutes

  // Grade level
  gradeLevel: string;
  subjectProgress: SubjectProgress;
}

// XP Rewards Configuration
export const XP_REWARDS = {
  chatTurn: 5,
  problemSolved: 20,
  dailyStreak: 50,
  voiceUsed: 10,
  imageUploaded: 15,
  sessionComplete: 30,
} as const;

// Level calculation
export function calculateLevel(totalXP: number): UserPoints {
  // Level formula: XP needed = 100 * level^1.5
  let level = 1;
  let xpForNextLevel = 100;
  let xpAccumulated = 0;

  while (totalXP >= xpAccumulated + xpForNextLevel) {
    xpAccumulated += xpForNextLevel;
    level++;
    xpForNextLevel = Math.floor(100 * Math.pow(level, 1.5));
  }

  return {
    totalXP,
    level,
    currentLevelXP: totalXP - xpAccumulated,
    nextLevelXP: xpForNextLevel,
  };
}

// Achievement definitions
export const ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  // Engagement badges
  {
    id: 'first_chat',
    name: 'First Chat',
    nameKo: '첫 대화',
    description: 'Complete your first conversation',
    descriptionKo: '첫 대화를 완료하세요',
    icon: '💬',
    requirement: 1,
    category: 'engagement',
  },
  {
    id: 'chat_10',
    name: 'Chatty',
    nameKo: '수다쟁이',
    description: 'Complete 10 conversations',
    descriptionKo: '10번의 대화를 완료하세요',
    icon: '🗨️',
    requirement: 10,
    category: 'engagement',
  },
  {
    id: 'chat_50',
    name: 'Conversation Master',
    nameKo: '대화왕',
    description: 'Complete 50 conversations',
    descriptionKo: '50번의 대화를 완료하세요',
    icon: '🗣️',
    requirement: 50,
    category: 'engagement',
  },
  {
    id: 'chat_100',
    name: 'Communication Expert',
    nameKo: '소통 달인',
    description: 'Complete 100 conversations',
    descriptionKo: '100번의 대화를 완료하세요',
    icon: '👑',
    requirement: 100,
    category: 'engagement',
  },

  // Mastery badges
  {
    id: 'math_novice',
    name: 'Math Novice',
    nameKo: '수학 입문',
    description: 'Complete 10 math sessions',
    descriptionKo: '10번의 수학 학습을 완료하세요',
    icon: '🔢',
    requirement: 10,
    category: 'mastery',
  },
  {
    id: 'math_expert',
    name: 'Math Expert',
    nameKo: '수학 달인',
    description: 'Complete 50 math sessions',
    descriptionKo: '50번의 수학 학습을 완료하세요',
    icon: '🧮',
    requirement: 50,
    category: 'mastery',
  },
  {
    id: 'english_novice',
    name: 'English Novice',
    nameKo: '영어 입문',
    description: 'Complete 10 English sessions',
    descriptionKo: '10번의 영어 학습을 완료하세요',
    icon: '📖',
    requirement: 10,
    category: 'mastery',
  },
  {
    id: 'english_expert',
    name: 'English Expert',
    nameKo: '영어 달인',
    description: 'Complete 50 English sessions',
    descriptionKo: '50번의 영어 학습을 완료하세요',
    icon: '📚',
    requirement: 50,
    category: 'mastery',
  },
  {
    id: 'korean_novice',
    name: 'Korean Novice',
    nameKo: '국어 입문',
    description: 'Complete 10 Korean sessions',
    descriptionKo: '10번의 국어 학습을 완료하세요',
    icon: '🇰🇷',
    requirement: 10,
    category: 'mastery',
  },
  {
    id: 'korean_expert',
    name: 'Korean Expert',
    nameKo: '국어 달인',
    description: 'Complete 50 Korean sessions',
    descriptionKo: '50번의 국어 학습을 완료하세요',
    icon: '📜',
    requirement: 50,
    category: 'mastery',
  },
  {
    id: 'science_novice',
    name: 'Science Novice',
    nameKo: '과학 입문',
    description: 'Complete 10 Science sessions',
    descriptionKo: '10번의 과학 학습을 완료하세요',
    icon: '🔬',
    requirement: 10,
    category: 'mastery',
  },
  {
    id: 'science_expert',
    name: 'Science Expert',
    nameKo: '과학 달인',
    description: 'Complete 50 Science sessions',
    descriptionKo: '50번의 과학 학습을 완료하세요',
    icon: '🧪',
    requirement: 50,
    category: 'mastery',
  },
  {
    id: 'social_novice',
    name: 'Social Studies Novice',
    nameKo: '사회 입문',
    description: 'Complete 10 Social Studies sessions',
    descriptionKo: '10번의 사회 학습을 완료하세요',
    icon: '🌍',
    requirement: 10,
    category: 'mastery',
  },
  {
    id: 'social_expert',
    name: 'Social Studies Expert',
    nameKo: '사회 달인',
    description: 'Complete 50 Social Studies sessions',
    descriptionKo: '50번의 사회 학습을 완료하세요',
    icon: '🗺️',
    requirement: 50,
    category: 'mastery',
  },
  {
    id: 'all_subjects',
    name: 'All-Rounder',
    nameKo: '전과목 마스터',
    description: 'Complete 10 sessions in all subjects',
    descriptionKo: '모든 과목에서 10번씩 학습하세요',
    icon: '🌟',
    requirement: 50,
    category: 'mastery',
  },

  // Consistency badges
  {
    id: 'streak_3',
    name: '3 Day Streak',
    nameKo: '3일 연속',
    description: 'Study for 3 days in a row',
    descriptionKo: '3일 연속 학습하세요',
    icon: '🔥',
    requirement: 3,
    category: 'consistency',
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    nameKo: '일주일 연속',
    description: 'Study for 7 days in a row',
    descriptionKo: '7일 연속 학습하세요',
    icon: '💪',
    requirement: 7,
    category: 'consistency',
  },
  {
    id: 'streak_30',
    name: 'Month Master',
    nameKo: '한 달 연속',
    description: 'Study for 30 days in a row',
    descriptionKo: '30일 연속 학습하세요',
    icon: '🏆',
    requirement: 30,
    category: 'consistency',
  },
  {
    id: 'streak_100',
    name: 'Century Champion',
    nameKo: '100일 연속',
    description: 'Study for 100 days in a row',
    descriptionKo: '100일 연속 학습하세요',
    icon: '👑',
    requirement: 100,
    category: 'consistency',
  },
];
