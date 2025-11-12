/**
 * AI Park - Tutor System Type Definitions
 * 학교급별 맞춤형 튜터링 시스템의 핵심 타입 정의
 */

// ============================================================================
// User Profile Types
// ============================================================================

export type GradeLevel = 'elementary' | 'middle' | 'high' | 'university';
export type Subject = 'english' | 'math' | 'science' | 'social-studies' | 'korean';
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface GradeLevelDetail {
  elementary?: '1-2' | '3-4' | '5-6';
  middle?: '1' | '2' | '3';
  high?: '1' | '2' | '3';
  university?: {
    year: number;
    major?: string;
  };
}

export interface UserProfile {
  userId: string;
  gradeLevel: GradeLevel;
  gradeLevelDetail?: GradeLevelDetail;
  subjects: Subject[];
  learningGoals?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Grade Level Constraints
// ============================================================================

export interface VocabularyLevel {
  maxWordCount: number;
  allowedTopics: string[];
  forbiddenTopics: string[];
}

export interface GrammarComplexity {
  allowedStructures: string[];
  forbiddenStructures: string[];
}

export interface SentenceComplexity {
  maxWordsPerSentence: number;
  readingLevel: string;
}

export interface EnglishConstraints {
  cefrLevel: CEFRLevel;
  vocabularyLevel: VocabularyLevel;
  grammarComplexity: GrammarComplexity;
  sentenceLength: SentenceComplexity;
}

export interface MathTopicScope {
  allowedTopics: string[];
  forbiddenTopics: string[];
}

export interface MathConstraints {
  topicScope: MathTopicScope;
  complexityLevel: 1 | 2 | 3 | 4 | 5;
  prerequisiteCheck: boolean;
}

export interface ResponseStyle {
  maxStepsPerExplanation: number;
  useVisualAids: boolean;
  gamificationLevel: 'high' | 'medium' | 'low';
}

export interface GradeLevelConstraints {
  englishConstraints?: EnglishConstraints;
  mathConstraints?: MathConstraints;
  responseStyle: ResponseStyle;
}

// ============================================================================
// Educational Guardrails
// ============================================================================

export interface HintBasedLearning {
  enabled: boolean;
  maxHintsBeforeAnswer: number;
  hintProgression: 'gentle' | 'socratic';
  neverGiveDirectAnswer: boolean;
}

export interface ContentLevelGuard {
  enabled: boolean;
  detectionMethod: 'keyword' | 'semantic' | 'hybrid';
  outOfScopeResponse: string;
}

export interface SafetyFilter {
  enabled: boolean;
  moderationLevel: 'strict' | 'moderate';
  parentalNotification: boolean;
}

export interface DependencyPrevention {
  enabled: boolean;
  encourageSelfExplanation: boolean;
  limitConsecutiveHelp: number;
  reflectionPrompts: boolean;
}

export interface EducationalGuardrails {
  hintBasedLearning: HintBasedLearning;
  contentLevelGuard: ContentLevelGuard;
  safetyFilter: SafetyFilter;
  dependencyPrevention: DependencyPrevention;
}

// ============================================================================
// Tutor System Prompt
// ============================================================================

export type PedagogicalStrategy =
  | 'visual-concrete'      // 초등: 시각적, 구체적
  | 'guided-discovery'     // 중등: 안내된 발견 학습
  | 'socratic-inquiry'     // 고등: 소크라테스식 질문
  | 'collaborative-expert'; // 대학: 협력적 전문가

export interface TutorSystemPrompt {
  role: string;
  gradeLevel: GradeLevel;
  subject: Subject;
  constraints: GradeLevelConstraints;
  guardrails: EducationalGuardrails;
  pedagogicalApproach: PedagogicalStrategy;
  customInstructions?: string;
}

// ============================================================================
// Content Level Detection
// ============================================================================

export interface ContentLevelDetection {
  outOfScope: boolean;
  confidence: number; // 0-1
  detectedKeywords?: string[];
  suggestedLevel?: string;
  reason?: string;
  detectionMethod?: 'keyword' | 'semantic' | 'hybrid';
}

// ============================================================================
// Learning Progress Tracking
// ============================================================================

export interface LearningProgress {
  userId: string;
  gradeLevel: GradeLevel;
  subject: Subject;

  // Session info
  sessionId: string;
  timestamp: Date;

  // Question/Response
  question: string;
  response: string;

  // Assessment
  assessedDifficulty: number; // 1-5
  wasCorrect?: boolean;
  hintsGiven: number;
  timeSpent: number; // seconds

  // Concept tracking
  conceptsCovered: string[];
  misconceptions?: string[];
  masteryLevel?: number; // 0-100
}

export interface WeaknessArea {
  concept: string;
  subject: Subject;
  accuracy: number; // 0-100
  attemptCount: number;
  lastAttempt: Date;
  recommendedPractice: string;
}

export interface ProgressMetrics {
  userId: string;
  gradeLevel: GradeLevel;
  subject: Subject;

  // Overall metrics
  totalSessions: number;
  totalTimeSpent: number; // seconds
  averageAccuracy: number; // 0-100

  // Progress indicators
  currentCEFRLevel?: CEFRLevel; // for English
  currentMathTopic?: string;
  masteryPercentage: number; // 0-100

  // Weakness tracking
  weaknessAreas: WeaknessArea[];

  // Engagement
  streakDays: number;
  lastActiveDate: Date;
}

// ============================================================================
// Adaptive Learning
// ============================================================================

export interface AssessmentMetrics {
  responseAccuracy: number;
  problemSolvingSpeed: number;
  conceptMastery: number;
  errorPatterns: string[];
}

export interface AdjustmentTrigger {
  consecutiveCorrect: number;
  consecutiveWrong: number;
}

export interface AssessmentEngine {
  continuousEvaluation: boolean;
  metrics: AssessmentMetrics;
  adjustmentTrigger: AdjustmentTrigger;
}

export interface Personalization {
  dynamicDifficultyAdjustment: boolean;
  weaknessIdentification: boolean;
  customHintGeneration: boolean;
}

export interface AdaptiveLearning {
  assessmentEngine: AssessmentEngine;
  personalization: Personalization;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface TutorChatRequest {
  message: string;
  userId: string;
  sessionId?: string;
  context?: {
    previousMessages?: Array<{
      role: 'user' | 'assistant';
      content: string;
    }>;
  };
}

export interface TutorChatResponse {
  response: string;
  metadata: {
    outOfScope: boolean;
    gradeLevel: GradeLevel;
    detectedLevel?: string;
    reason?: string;
    hintsGiven?: number;
    conceptsCovered?: string[];
  };
  sessionId: string;
}

// ============================================================================
// Guidance Messages
// ============================================================================

export interface GuidanceMessageTemplate {
  tooAdvanced: {
    math: string[];
    english: string[];
    korean?: string[];
    science?: string[];
    'social-studies'?: string[];
  };
  outOfExpertise?: {
    honest: string[];
  };
}

export type GuidanceMessages = {
  [key in GradeLevel]: GuidanceMessageTemplate;
};

// ============================================================================
// Configuration
// ============================================================================

export interface TutorConfig {
  maxTokens: number;
  temperature: number;
  model: string;
  enableCaching: boolean;
  cacheTTL: number; // seconds
}

export const DEFAULT_TUTOR_CONFIG: TutorConfig = {
  maxTokens: 2048,
  temperature: 0.7,
  model: 'claude-3-5-sonnet-20241022',
  enableCaching: true,
  cacheTTL: 3600, // 1 hour
};

// ============================================================================
// Message Types
// ============================================================================

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}
