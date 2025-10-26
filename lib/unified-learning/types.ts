// Unified Learning Types
// Integration layer for Phase 8 (Adaptive), Phase 9 (Interactive), Phase 10 (Voice)

import { Subject, GradeLevel, DifficultyLevel } from '../adaptive-learning/types';
import { AbilityScore, Weakness, Recommendation } from '../adaptive-learning/types';
import { QuizResult } from '../interactive-learning/types';
import { VoiceTutorSession } from '../voice-tutor/types';

// ============================================================================
// Unified Learning Report
// ============================================================================

export interface UnifiedLearningReport {
  // Basic Information
  userId: string;
  period: {
    start: Date;
    end: Date;
  };
  generatedAt: Date;

  // Phase 7: Gamification Summary
  gamification: {
    totalXP: number;
    level: number;
    achievements: string[];
    currentStreak: number;
    longestStreak: number;
    totalStudyTime: number; // in minutes
  };

  // Phase 8: Adaptive Learning Summary
  adaptiveLearning: {
    currentAbility: {
      math: AbilityScore;
      english: AbilityScore;
    };
    weaknesses: Weakness[];
    recommendations: Recommendation[];
    sessionsCompleted: number;
  };

  // Phase 9: Interactive Learning Summary
  interactiveLearning: {
    quizzes: {
      total: number;
      avgScore: number;
      avgTimePerQuestion: number; // seconds
      byDifficulty: Record<DifficultyLevel, { taken: number; avgScore: number }>;
    };
    flashcards: {
      total: number;
      avgRetention: number; // 0-1
      dueToday: number;
      masteryDistribution: {
        learning: number;
        reviewing: number;
        mastered: number;
      };
    };
    challenges: {
      total: number;
      completed: number;
      active: number;
    };
    notes: {
      total: number;
      bySubject: Record<Subject, number>;
    };
  };

  // Phase 10: Voice Tutor Summary
  voiceTutor: {
    totalSessions: number;
    totalTime: number; // in minutes
    english: {
      sessions: number;
      avgGrammarScore: number; // 0-100
      totalCorrections: number;
      avgVocabularyLevel: 'elementary' | 'intermediate' | 'advanced';
    };
    math: {
      sessions: number;
      problemsSolved: number;
      problemsAttempted: number;
      avgHintsUsed: number;
      solvingRate: number; // 0-100%
    };
  };

  // Unified Insights (AI-generated)
  insights: {
    strongestSkills: Array<{
      subject: Subject;
      topic: string;
      masteryLevel: number; // 0-100
    }>;
    areasToImprove: Array<{
      subject: Subject;
      topic: string;
      priority: 'high' | 'medium' | 'low';
      suggestedAction: string;
    }>;
    learningStyle: {
      preferredMode: 'quiz' | 'flashcard' | 'voice';
      bestTimeOfDay: string;
      avgSessionLength: number; // minutes
    };
    progressEstimate: {
      overall: number; // 0-100%
      math: number;
      english: number;
    };
    nextSteps: string[]; // AI-generated recommendations
  };
}

// ============================================================================
// Integration Events
// ============================================================================

export type IntegrationEvent =
  | QuizCompletedEvent
  | FlashcardReviewedEvent
  | VoiceSessionEndedEvent
  | WeaknessDetectedEvent
  | MasteryAchievedEvent;

export interface QuizCompletedEvent {
  type: 'quiz_completed';
  timestamp: Date;
  userId: string;
  quizResult: QuizResult;
  // Will trigger: weakness detection, mastery update
}

export interface FlashcardReviewedEvent {
  type: 'flashcard_reviewed';
  timestamp: Date;
  userId: string;
  flashcardId: string;
  quality: 0 | 1 | 2 | 3 | 4 | 5;
  responseTime: number;
  // Will trigger: mastery update
}

export interface VoiceSessionEndedEvent {
  type: 'voice_session_ended';
  timestamp: Date;
  userId: string;
  session: VoiceTutorSession;
  // Will trigger: ability update, weakness detection
}

export interface WeaknessDetectedEvent {
  type: 'weakness_detected';
  timestamp: Date;
  userId: string;
  weakness: Weakness;
  // Will trigger: content generation (quiz, flashcard)
}

export interface MasteryAchievedEvent {
  type: 'mastery_achieved';
  timestamp: Date;
  userId: string;
  subject: Subject;
  topic: string;
  masteryLevel: number;
  // Will trigger: difficulty increase
}

// ============================================================================
// Content Generation Requests
// ============================================================================

export interface ContentGenerationRequest {
  userId: string;
  subject: Subject;
  gradeLevel: GradeLevel;
  source: 'weakness' | 'voice_session' | 'manual';
  targetDifficulty?: DifficultyLevel;
}

export interface QuizGenerationRequest extends ContentGenerationRequest {
  topic: string;
  questionCount: number;
  focusAreas?: string[]; // Specific knowledge nodes to focus on
}

export interface FlashcardGenerationRequest extends ContentGenerationRequest {
  concept: string;
  context?: string; // From voice session or notes
}

// ============================================================================
// Unified Learning Profile
// ============================================================================

export interface UnifiedLearningProfile {
  userId: string;
  gradeLevel: GradeLevel;

  // Cross-phase statistics
  totalSessions: number;
  totalStudyTime: number; // minutes
  lastActiveDate: Date;

  // Learning preferences (learned from behavior)
  preferences: {
    preferredSubject: Subject | null;
    preferredLearningMode: 'quiz' | 'flashcard' | 'voice' | null;
    optimalDifficulty: {
      math: DifficultyLevel;
      english: DifficultyLevel;
    };
    studyTimePreference: {
      avgSessionLength: number; // minutes
      peakHours: number[]; // 0-23
    };
  };

  // Integrated goals
  goals: {
    dailyStudyTarget: number; // minutes
    weeklyQuizTarget: number;
    flashcardReviewTarget: number;
    voiceSessionTarget: number;
  };

  // Performance summary
  performance: {
    lastWeek: {
      studyTime: number;
      quizzesTaken: number;
      flashcardsReviewed: number;
      voiceSessions: number;
      xpEarned: number;
    };
    lastMonth: {
      studyTime: number;
      quizzesTaken: number;
      flashcardsReviewed: number;
      voiceSessions: number;
      xpEarned: number;
    };
  };
}

// ============================================================================
// Integration Configuration
// ============================================================================

export interface IntegrationConfig {
  // Auto-content generation
  autoGenerateFlashcards: boolean;
  autoGenerateQuizzes: boolean;

  // Weakness detection thresholds
  weaknessDetection: {
    quizFailureThreshold: number; // 0-1 (e.g., 0.5 = 50% or less)
    consecutiveFailuresRequired: number;
    voiceSessionErrorThreshold: number;
  };

  // Difficulty adjustment
  difficultyAdjustment: {
    increaseThreshold: number; // 0-1 (e.g., 0.85 = 85% success)
    decreaseThreshold: number; // 0-1 (e.g., 0.60 = 60% success)
    minSessionsRequired: number;
  };

  // Report generation
  reportGeneration: {
    includePeriods: ('daily' | 'weekly' | 'monthly')[];
    includeInsights: boolean;
    includeRecommendations: boolean;
  };
}

export const DEFAULT_INTEGRATION_CONFIG: IntegrationConfig = {
  autoGenerateFlashcards: true,
  autoGenerateQuizzes: true,

  weaknessDetection: {
    quizFailureThreshold: 0.5,
    consecutiveFailuresRequired: 2,
    voiceSessionErrorThreshold: 3,
  },

  difficultyAdjustment: {
    increaseThreshold: 0.85,
    decreaseThreshold: 0.60,
    minSessionsRequired: 5,
  },

  reportGeneration: {
    includePeriods: ['daily', 'weekly', 'monthly'],
    includeInsights: true,
    includeRecommendations: true,
  },
};
