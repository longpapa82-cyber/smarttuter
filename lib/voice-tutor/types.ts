// Phase 10: Voice Tutor System Types
// Real-time voice conversation for English and Math learning

import { GradeLevel, DifficultyLevel } from '../adaptive-learning/types';

// Re-export for convenience
export type { GradeLevel, DifficultyLevel };

export type TutorSubject = 'english' | 'math';
export type SessionStatus = 'active' | 'paused' | 'completed';
export type MessageRole = 'user' | 'tutor';
export type FeedbackType = 'pronunciation' | 'grammar' | 'concept' | 'encouragement';

// ==================== Voice Tutor Session ====================

export interface VoiceTutorSession {
  id: string;
  userId: string;
  subject: TutorSubject;
  gradeLevel: GradeLevel;

  // Session data
  startTime: Date;
  endTime?: Date;
  status: SessionStatus;
  duration: number;              // seconds

  // Conversation
  messages: TutorMessage[];
  currentTopic?: string;
  currentProblem?: string;

  // English specific
  pronunciationScores?: PronunciationFeedback[];
  grammarCorrections?: GrammarCorrection[];

  // Math specific
  problemsSolved?: number;
  conceptsCovered?: string[];
  hintsGiven?: number;

  // Analytics
  speakingTime: number;          // seconds
  listeningTime: number;         // seconds
  interactionCount: number;
  comprehensionScore?: number;   // 0-100

  // Rewards
  xpEarned: number;
  badgesEarned: string[];
}

export interface TutorMessage {
  id: string;
  role: MessageRole;
  content: string;
  audioUrl?: string;             // for playback
  timestamp: Date;

  // Metadata
  confidence?: number;           // STT confidence (0-1)
  duration?: number;             // seconds

  // Feedback
  feedback?: MessageFeedback;
}

export interface MessageFeedback {
  type: FeedbackType;
  score?: number;                // 0-100
  suggestions?: string[];
  corrections?: string;
  isPositive: boolean;
}

// ==================== English Tutor Specific ====================

export interface PronunciationFeedback {
  word: string;
  expected: string;              // IPA phonetic or plain text
  actual: string;                // what student said
  score: number;                 // 0-100
  suggestions: string[];
  timestamp: Date;
}

export interface GrammarCorrection {
  id: string;
  original: string;
  corrected: string;
  rule: string;
  explanation: string;
  severity: 'minor' | 'moderate' | 'major';
  timestamp: Date;
}

export interface VocabularyAnalysis {
  level: 'elementary' | 'intermediate' | 'advanced';
  appropriateWords: string[];
  challengingWords: string[];
  suggestions: string[];
}

// ==================== Math Tutor Specific ====================

export interface MathProblem {
  id: string;
  question: string;
  difficulty: DifficultyLevel;
  topic: string;
  category: string;              // algebra, geometry, etc.

  // Solution data
  hints: string[];
  solution: string;
  steps: string[];
  explanation: string;

  // Metadata
  knowledgeNodeId?: string;
  createdAt: Date;
}

export interface MathProblemAttempt {
  problemId: string;
  studentAnswer: string;
  isCorrect: boolean;
  hintsUsed: number;
  timeSpent: number;             // seconds
  understanding: 'none' | 'partial' | 'full';
  misconceptions: string[];
  timestamp: Date;
}

// ==================== Tutor Response Analysis ====================

export interface EnglishAnalysis {
  grammarScore: number;          // 0-100
  vocabularyLevel: 'elementary' | 'intermediate' | 'advanced';
  sentenceComplexity: number;    // 0-100
  fluency: number;               // 0-100
  errors: {
    type: 'grammar' | 'vocabulary' | 'structure' | 'pronunciation';
    text: string;
    correction: string;
    explanation: string;
  }[];
  strengths: string[];
}

export interface MathAnalysis {
  isCorrect: boolean;
  understanding: 'none' | 'partial' | 'full';
  conceptGrasped: boolean;
  misconceptions: string[];
  nextHint: string;
  encouragement: string;
  suggestedApproach?: string;
}

// ==================== Session Statistics ====================

export interface SessionStats {
  totalTime: number;             // seconds
  messagesCount: number;
  userMessagesCount: number;
  tutorMessagesCount: number;

  // English stats
  grammarAccuracy?: number;
  vocabularyScore?: number;
  pronunciationScore?: number;
  correctionsCount?: number;

  // Math stats
  problemsAttempted?: number;
  problemsSolved?: number;
  accuracy?: number;
  hintsUsedTotal?: number;
  averageTimePerProblem?: number;

  // Engagement
  responseTime?: number;         // average seconds
  engagementScore?: number;      // 0-100
}

// ==================== XP Rewards ====================

export const VOICE_TUTOR_XP = {
  sessionStart: 10,
  perMinute: 5,
  messageResponse: 2,
  correctPronunciation: 15,
  perfectGrammar: 20,
  problemSolved: 30,
  problemSolvedWithoutHints: 50,
  sessionComplete: 25,
  longSession: 50,               // 15+ minutes
} as const;

// ==================== Conversation Starters ====================

export const CONVERSATION_STARTERS = {
  english: {
    elementary: [
      "Hello! What's your favorite color?",
      "Can you tell me about your family?",
      "What did you do today?",
      "Do you have any pets?",
      "What's your favorite food?",
    ],
    middle: [
      "What are your hobbies?",
      "Can you describe your best friend?",
      "What's your favorite book or movie?",
      "Tell me about a place you'd like to visit.",
      "What did you learn in school recently?",
    ],
    high: [
      "What are your plans for the future?",
      "Can you explain a recent news event?",
      "Discuss a topic you're passionate about.",
      "What challenges are young people facing today?",
      "How has technology changed our lives?",
    ],
    university: [
      "Let's discuss current global issues.",
      "Can you present an argument for or against globalization?",
      "Analyze the impact of social media on society.",
      "What's your perspective on climate change solutions?",
      "How do you think AI will shape the future?",
    ],
  },
  math: {
    elementary: [
      "Let's practice addition and subtraction!",
      "Would you like to solve some word problems?",
      "Let's work on understanding fractions.",
      "Shall we practice multiplication tables?",
    ],
    middle: [
      "Let's explore algebra together.",
      "Want to solve some geometry problems?",
      "Let's work on understanding ratios and proportions.",
      "Shall we practice equations?",
    ],
    high: [
      "Let's tackle some advanced algebra.",
      "Would you like to work on calculus concepts?",
      "Let's explore trigonometry.",
      "Shall we solve complex word problems?",
    ],
    university: [
      "Let's work on advanced calculus.",
      "Want to explore linear algebra?",
      "Let's discuss differential equations.",
      "Shall we analyze complex mathematical proofs?",
    ],
  },
} as const;

// ==================== Prompts ====================

export interface TutorPromptContext {
  subject: TutorSubject;
  gradeLevel: GradeLevel;
  sessionHistory: TutorMessage[];
  currentTopic?: string;
  studentStrengths?: string[];
  studentWeaknesses?: string[];
}
