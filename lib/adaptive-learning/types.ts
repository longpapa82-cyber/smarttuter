// Phase 8: Adaptive Learning System Types
// Research-based design from Khan Academy, Duolingo, Century Tech

export type GradeLevel = 'elementary' | 'middle' | 'high' | 'university';
export type Subject = 'math' | 'english';
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface AbilityScore {
  currentLevel: number;        // 1-10 scale
  confidence: number;          // 0-1 certainty
  learningRate: number;        // concepts per hour
  retentionRate: number;       // 0-1 retention score
  lastUpdated: Date;
}

export interface SessionRecord {
  id: string;
  subject: Subject;
  startTime: Date;
  endTime: Date;
  duration: number;            // minutes
  messageCount: number;
  difficulty: DifficultyLevel;
  xpEarned: number;

  // Performance metrics
  performance: {
    accuracy: number;          // 0-1
    responseTime: number;      // average seconds
    hintsUsed: number;
    skipped: number;
  };

  // Content coverage
  topicsCovered: string[];
  conceptsMastered: string[];
  weaknessesIdentified: string[];
}

export interface InteractionLog {
  timestamp: Date;
  type: 'question' | 'answer' | 'hint' | 'skip' | 'complete';
  knowledgeNodeId?: string;
  difficulty: DifficultyLevel;
  success: boolean;
  timeSpent: number;           // seconds
  metadata?: Record<string, any>;
}

export interface PerformanceMetrics {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;

  // Engagement
  sessionCount: number;
  totalTime: number;           // minutes
  avgSessionTime: number;

  // Achievement
  xpEarned: number;
  conceptsMastered: number;
  weaknessesOvercome: number;

  // Quality
  avgAccuracy: number;
  avgResponseTime: number;
  difficultyProgression: number; // change in difficulty
}

export interface KnowledgeNode {
  id: string;
  name: string;
  subject: Subject;
  category: string;            // e.g., "Algebra > Equations > Linear"
  gradeLevel: GradeLevel;
  difficulty: DifficultyLevel;
  estimatedTime: number;       // minutes to master
  prerequisites: string[];     // prerequisite node IDs
  description: string;
  tags: string[];
}

export interface MasteryLevel {
  nodeId: string;
  mastery: number;             // 0-1 score
  attempts: number;
  successRate: number;         // 0-1
  lastPracticed: Date;
  needsReview: boolean;
  confidence: number;          // 0-1
}

export interface Weakness {
  knowledgeNodeId: string;
  nodeName: string;
  severity: 'minor' | 'moderate' | 'critical';

  evidence: {
    attemptCount: number;
    successRate: number;
    avgTimeSpent: number;
    lastAttemptDate: Date;
  };

  rootCause: 'prerequisite_gap' | 'concept_misunderstanding' | 'practice_needed' | 'too_advanced';

  remediation: {
    recommendedContent: string[];
    estimatedTime: number;     // minutes
    priority: number;          // 1-10
    prerequisites?: string[];
  };
}

export interface LearningPathway {
  id: string;
  name: string;
  subject: Subject;
  goal: string;

  steps: PathStep[];

  estimatedCompletion: number; // minutes
  milestones: Milestone[];

  createdAt: Date;
  status: 'active' | 'completed' | 'paused';
  progress: number;            // 0-1
}

export interface PathStep {
  id: string;
  nodeId: string;
  nodeName: string;
  difficulty: DifficultyLevel;
  estimatedTime: number;
  completed: boolean;
  masteryAchieved: boolean;
  order: number;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate?: Date;
  achieved: boolean;
  achievedDate?: Date;
  xpReward: number;
}

export interface Alert {
  id: string;
  severity: 'low' | 'medium' | 'high';
  type: 'engagement' | 'performance' | 'difficulty' | 'streak';
  message: string;
  recommendedActions: Action[];
  createdAt: Date;
  dismissed: boolean;
}

export interface Action {
  id: string;
  type: 'review_basics' | 'lower_difficulty' | 'provide_hints' | 'take_break' | 'change_subject';
  description: string;
  priority: number;
}

export interface Recommendation {
  id: string;
  type: 'topic' | 'difficulty' | 'pathway' | 'review';
  title: string;
  description: string;
  confidence: number;          // 0-1 AI confidence

  action: {
    type: string;
    params: Record<string, any>;
  };

  reasoning: string;
  expectedBenefit: string;
}

export interface ProgressAnalytics {
  // Overall mastery
  masteryMap: {
    subject: Subject;
    categories: CategoryMastery[];
    overallMastery: number;    // 0-100%
    totalNodes: number;
    masteredNodes: number;
  };

  // Learning velocity
  learningVelocity: {
    xpPerHour: number;
    conceptsPerWeek: number;
    difficultyGrowthRate: number;
    comparisonToPeers?: number; // percentile (future)
  };

  // Strengths & Weaknesses
  strengthsWeaknesses: {
    topStrengths: KnowledgeNode[];
    criticalWeaknesses: Weakness[];
    improvementAreas: string[];
  };

  // Predictions
  predictions: {
    nextMilestone?: string;
    estimatedAchievementDate?: Date;
    recommendedPace: 'slower' | 'maintain' | 'faster';
    riskLevel: 'low' | 'medium' | 'high';
  };

  // Time analytics
  timeAnalytics: {
    totalLearningTime: number; // minutes
    avgSessionTime: number;
    mostProductiveTime?: 'morning' | 'afternoon' | 'evening';
    efficiencyScore: number;   // 0-100
  };
}

export interface CategoryMastery {
  category: string;
  mastery: number;             // 0-100%
  nodeCount: number;
  masteredCount: number;
  inProgressCount: number;
  color?: string;              // for visualization
}

export interface AdaptiveLearningProfile {
  userId: string;
  gradeLevel: GradeLevel;
  createdAt: Date;
  lastUpdated: Date;

  // Ability assessment
  currentAbility: {
    math: AbilityScore;
    english: AbilityScore;
  };

  // Learning history
  history: {
    sessions: SessionRecord[];
    performance: PerformanceMetrics[];
    interactions: InteractionLog[];
  };

  // Knowledge state
  knowledgeState: {
    masteredNodes: MasteryLevel[];
    inProgressNodes: string[];
    weakNodes: Weakness[];
  };

  // Learning paths
  learningPath: {
    current?: LearningPathway;
    recommended: LearningPathway[];
    completed: LearningPathway[];
  };

  // Diagnosis
  diagnosis: {
    lastUpdate: Date;
    weaknesses: Weakness[];
    alerts: Alert[];
    recommendations: Recommendation[];
  };

  // Settings
  settings: {
    targetDifficulty?: DifficultyLevel;
    preferredSessionLength: number; // minutes
    learningGoals: string[];
    adaptiveMode: boolean;
  };
}

// AI Tutor Configuration
export interface AITutorConfig {
  mode: 'adaptive';
  subject: Subject;
  difficulty: DifficultyLevel;
  focusAreas: string[];
  weaknesses: Weakness[];
  learningPath?: LearningPathway;
  currentMastery: MasteryLevel[];
}

// Difficulty Adjustment Context
export interface DifficultyContext {
  recentSessions: SessionRecord[];
  currentMastery: MasteryLevel[];
  weaknesses: Weakness[];
  targetAccuracy: number;      // 0.7-0.9 optimal range
}

// Constants
export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  1: '기초',
  2: '초급',
  3: '중급',
  4: '고급',
  5: '전문가',
};

export const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  1: '#22c55e', // green
  2: '#3b82f6', // blue
  3: '#f59e0b', // amber
  4: '#ef4444', // red
  5: '#a855f7', // purple
};

export const XP_MULTIPLIERS: Record<DifficultyLevel, number> = {
  1: 1.0,
  2: 1.2,
  3: 1.5,
  4: 2.0,
  5: 2.5,
};

export const MASTERY_THRESHOLD = 0.8;      // 80% success rate
export const WEAKNESS_THRESHOLD = 0.6;     // <60% is weakness
export const OPTIMAL_ACCURACY_MIN = 0.70;  // Flow theory
export const OPTIMAL_ACCURACY_MAX = 0.85;
