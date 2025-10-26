// Phase 9: Interactive Learning System Types
// Inspired by Quizlet, Anki, Kahoot, Quizizz

import { Subject, GradeLevel, DifficultyLevel } from '../adaptive-learning/types';

// Re-export for convenience
export type { Subject, GradeLevel, DifficultyLevel };

// ==================== Quiz System ====================

export type QuestionType = 'multiple_choice' | 'short_answer' | 'true_false';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];           // For multiple_choice
  correctAnswer: string;
  explanation: string;
  points: number;
  bloomLevel?: string;          // Bloom's taxonomy level
  knowledgeNodeId?: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject: Subject;
  difficulty: DifficultyLevel;
  questions: QuizQuestion[];
  timeLimit?: number;           // seconds
  passingScore: number;         // percentage (70)
  createdAt: Date;
  createdBy: string;            // userId
  knowledgeNodeIds: string[];   // Related concepts
  xpReward: number;             // XP earned for completing
  bloomLevel?: string;          // Overall Bloom's taxonomy level
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;            // seconds
}

export interface QuizResult {
  id: string;
  quizId: string;
  userId: string;
  answers: QuizAnswer[];
  score: number;                // percentage
  totalPoints: number;
  earnedPoints: number;
  totalQuestions: number;       // total number of questions
  correctAnswers: number;       // number of correct answers
  completedAt: Date;
  timeSpent: number;            // total seconds

  // Rewards
  xpEarned: number;
  badgesUnlocked: string[];

  // Analytics
  weaknessesIdentified: string[]; // knowledge node IDs
}

export interface QuizGenerationRequest {
  subject: Subject;
  gradeLevel: GradeLevel;
  difficulty: DifficultyLevel;
  knowledgeNodeId?: string;
  questionCount: number;        // default 5
  questionTypes?: QuestionType[];
  timeLimit?: number;
}

// ==================== Flashcard System ====================

export interface Flashcard {
  id: string;
  front: string;                // Question/Term
  back: string;                 // Answer/Definition
  subject: Subject;
  knowledgeNodeId: string;
  difficulty: DifficultyLevel;

  // SM-2 Algorithm parameters
  easeFactor: number;           // default 2.5
  interval: number;             // days until next review
  repetitions: number;          // consecutive correct answers
  lastReviewed?: Date;
  nextReview: Date;

  // User performance
  reviewHistory: ReviewRecord[];
  masteryScore: number;         // 0-1

  // Metadata
  createdAt: Date;
  createdFrom?: 'manual' | 'ai_session' | 'ai_note';
}

export interface ReviewRecord {
  reviewedAt: Date;
  quality: 0 | 1 | 2 | 3 | 4 | 5; // 0=complete blackout, 5=perfect
  responseTime: number;         // seconds
}

export interface ReviewSchedule {
  due: Flashcard[];             // Cards due for review
  upcoming: Flashcard[];        // Cards due soon (within 3 days)
  mastered: Flashcard[];        // Cards with high mastery
  learning: Flashcard[];        // New or difficult cards
}

// ==================== Challenge System ====================

export type ChallengeType = 'daily' | 'weekly' | 'special';
export type ChallengeGoalType =
  | 'quiz_score'
  | 'flashcard_review'
  | 'streak_maintain'
  | 'xp_earn'
  | 'weakness_overcome';

export interface Challenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  difficulty: DifficultyLevel;

  // Goal
  goal: {
    type: ChallengeGoalType;
    target: number;
    current: number;
  };

  // Rewards
  rewards: {
    xp: number;
    badge?: string;
    unlock?: string;            // Unlock content
  };

  // Duration
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'expired';
}

// ==================== Learning Notes ====================

export interface LearningNote {
  id: string;
  title: string;
  subject: Subject;
  knowledgeNodeId?: string;

  // Content
  content: string;              // Markdown
  summary?: string;             // AI-generated summary
  keyPoints: string[];          // Key concepts

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  sessionId?: string;           // Linked learning session

  // Conversions
  flashcardIds: string[];       // Generated flashcards
  quizIds: string[];            // Generated quizzes
}

// ==================== XP Rewards ====================

export const QUIZ_XP_REWARDS = {
  completion: 50,
  perfectScore: 100,
  firstTry: 30,
  speedBonus: 20,
  weaknessOvercome: 50,
} as const;

export const FLASHCARD_XP_REWARDS = {
  0: 5,    // 완전히 잊음
  1: 10,   // 틀림
  2: 20,   // 어려움
  3: 30,   // 맞음 (힌트 필요)
  4: 40,   // 맞음 (약간 어려움)
  5: 50,   // 완벽
} as const;

export const FLASHCARD_BONUS_XP = {
  perfectRecall: 10,
  masteryAchieved: 50,
  dailyGoal: 30,                // 20 cards reviewed
} as const;

export const CHALLENGE_XP_BASE = {
  daily: 100,
  weekly: 300,
  special: 500,
} as const;

// ==================== Bloom's Taxonomy ====================

export const BLOOM_LEVELS = {
  1: 'Remember',    // Define, List, Recall
  2: 'Understand',  // Explain, Summarize, Describe
  3: 'Apply',       // Calculate, Use, Solve
  4: 'Analyze',     // Compare, Classify, Examine
  5: 'Evaluate',    // Judge, Critique, Assess
  6: 'Create',      // Design, Construct, Develop
} as const;

export const DIFFICULTY_BLOOM_MAP: Record<DifficultyLevel, number[]> = {
  1: [1, 2],        // Beginner: Remember, Understand
  2: [2, 3],        // Elementary: Understand, Apply
  3: [3, 4],        // Intermediate: Apply, Analyze
  4: [4, 5],        // Advanced: Analyze, Evaluate
  5: [5, 6],        // Expert: Evaluate, Create
};

// ==================== SM-2 Algorithm Constants ====================

export const SM2_DEFAULTS = {
  INITIAL_EASE_FACTOR: 2.5,
  MIN_EASE_FACTOR: 1.3,
  INITIAL_INTERVAL: 1,
  SECOND_INTERVAL: 6,
  PASSING_QUALITY: 3,         // Quality >= 3 is passing
} as const;

// ==================== Stats ====================

export interface InteractiveLearningStats {
  // Quiz stats
  quizzesTaken: number;
  quizzesPassedCount: number;
  averageQuizScore: number;
  perfectScores: number;

  // Flashcard stats
  flashcardsCreated: number;
  flashcardsReviewed: number;
  flashcardsMastered: number;
  averageRecallQuality: number;

  // Challenge stats
  challengesCompleted: number;
  activeChallenges: number;

  // Notes stats
  notesCreated: number;
  totalStudyTime: number;      // minutes
}

// ==================== Profile ====================

export interface InteractiveLearningProfile {
  userId: string;
  totalQuizzesTaken: number;
  totalFlashcardsReviewed: number;
  challengesCompleted: number;
  notesCreated: number;
  quizStreak: number;
  flashcardStreak: number;
  lastQuizDate?: Date;
  lastFlashcardReview?: Date;
  createdAt: Date;
}
