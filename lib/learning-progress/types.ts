/**
 * Learning Progress Tracking Types
 * 학습 진행도 추적 시스템의 타입 정의
 */

import type { GradeLevel, Subject } from '@/types/tutor';

// ============================================================================
// Concept Mastery Types
// ============================================================================

export type MasteryLevel = 'not_started' | 'struggling' | 'learning' | 'proficient' | 'mastered';

export interface ConceptMastery {
  conceptId: string;
  conceptName: string;
  subject: Subject;
  gradeLevel: GradeLevel;
  masteryLevel: MasteryLevel;
  confidence: number; // 0-1 scale
  totalAttempts: number;
  successfulAttempts: number;
  lastAttemptDate: Date;
  firstAttemptDate: Date;
  averageResponseTime: number; // in seconds
  hintsUsed: number;
  errors: ConceptError[];
}

export interface ConceptError {
  errorType: string;
  count: number;
  lastOccurrence: Date;
  examples: string[];
}

// ============================================================================
// Weakness Detection Types
// ============================================================================

export interface WeaknessArea {
  conceptId: string;
  conceptName: string;
  subject: Subject;
  severity: 'low' | 'medium' | 'high' | 'critical';
  indicators: WeaknessIndicator[];
  recommendedActions: string[];
  relatedConcepts: string[];
  detectedDate: Date;
  improvementProgress: number; // 0-1 scale
}

export interface WeaknessIndicator {
  type: 'low_success_rate' | 'high_hint_usage' | 'slow_response' | 'repeated_errors' | 'concept_gap';
  value: number;
  threshold: number;
  description: string;
}

// ============================================================================
// Adaptive Difficulty Types
// ============================================================================

export type DifficultyLevel = 'very_easy' | 'easy' | 'medium' | 'hard' | 'very_hard';

export interface DifficultyAdjustment {
  userId: string;
  subject: Subject;
  currentDifficulty: DifficultyLevel;
  recommendedDifficulty: DifficultyLevel;
  reason: string;
  factors: AdjustmentFactor[];
  timestamp: Date;
  applied: boolean;
}

export interface AdjustmentFactor {
  name: string;
  weight: number; // 0-1 scale
  value: number;
  impact: 'increase' | 'decrease' | 'maintain';
  description: string;
}

// ============================================================================
// Learning Progress Summary
// ============================================================================

export interface LearningProgressSummary {
  userId: string;
  gradeLevel: GradeLevel;
  subjects: {
    [key in Subject]: SubjectProgress;
  };
  overallProgress: number; // 0-1 scale
  totalStudyTime: number; // in seconds
  totalConcepts: number;
  masteredConcepts: number;
  weaknesses: WeaknessArea[];
  lastUpdated: Date;
}

export interface SubjectProgress {
  subject: Subject;
  totalConcepts: number;
  conceptsByMastery: {
    [key in MasteryLevel]: number;
  };
  averageMastery: number; // 0-1 scale
  studyTime: number; // in seconds
  totalAttempts: number;
  successRate: number; // 0-1 scale
  currentDifficulty: DifficultyLevel;
  recommendedNextConcepts: string[];
  strongAreas: string[];
  weakAreas: string[];
}

// ============================================================================
// Redis Storage Keys
// ============================================================================

export const REDIS_KEYS = {
  CONCEPT_MASTERY: (userId: string, conceptId: string) => `mastery:${userId}:${conceptId}`,
  WEAKNESS_AREAS: (userId: string) => `weakness:${userId}`,
  DIFFICULTY_LEVEL: (userId: string, subject: Subject) => `difficulty:${userId}:${subject}`,
  PROGRESS_SUMMARY: (userId: string) => `progress:${userId}`,
  LEARNING_HISTORY: (userId: string) => `history:${userId}`,
} as const;

// ============================================================================
// Learning Event Types
// ============================================================================

export interface LearningEvent {
  userId: string;
  eventType: 'question_asked' | 'answer_received' | 'hint_requested' | 'concept_mastered' | 'difficulty_adjusted';
  subject: Subject;
  conceptId?: string;
  success: boolean;
  responseTime?: number;
  timestamp: Date;
  metadata: Record<string, any>;
}
