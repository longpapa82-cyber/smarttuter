/**
 * Mastery Level Calculator
 * 학습 숙련도 계산 및 개념 이해도 추적 시스템
 *
 * @module mastery-calculator
 * @description Calculates and tracks student mastery levels across concepts
 */

import type { ConceptMastery, MasteryLevel, ConceptError } from './types';
import type { Subject, GradeLevel } from '@/types/tutor';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Attempt data for updating concept mastery
 */
export interface AttemptData {
  success: boolean;
  responseTime: number; // in seconds
  hintUsed: boolean;
  timestamp?: Date;
  errorType?: string;
  errorExample?: string;
}

/**
 * Recent performance tracking (sliding window)
 */
interface RecentPerformance {
  attempts: boolean[]; // true = success, false = failure
  averageSuccessRate: number;
}

/**
 * Concept gap detection result
 */
export interface ConceptGap {
  conceptId: string;
  conceptName: string;
  reason: 'prerequisite_missing' | 'advanced_without_foundation' | 'inconsistent_mastery';
  missingPrerequisites: string[];
  recommendedOrder: string[];
}

// ============================================================================
// Constants
// ============================================================================

const MASTERY_THRESHOLDS = {
  STRUGGLING_SUCCESS_RATE: 0.4,
  STRUGGLING_HINT_RATIO: 0.6,
  LEARNING_SUCCESS_RATE: 0.7,
  PROFICIENT_SUCCESS_RATE: 0.9,
  MINIMUM_ATTEMPTS_FOR_MASTERY: 5,
} as const;

const CONFIDENCE_WEIGHTS = {
  RECENT_PERFORMANCE: 0.7,
  OVERALL_PERFORMANCE: 0.3,
} as const;

const RECENT_ATTEMPTS_WINDOW = 5;

// ============================================================================
// Mastery Level Calculation
// ============================================================================

/**
 * Calculates the mastery level for a concept based on student performance
 *
 * @param conceptId - Unique identifier for the concept
 * @param totalAttempts - Total number of attempts on this concept
 * @param successfulAttempts - Number of successful attempts
 * @param hintsUsed - Number of hints used across all attempts
 * @param averageResponseTime - Average time taken to respond (in seconds)
 * @returns MasteryLevel - Current mastery level classification
 *
 * @example
 * ```typescript
 * const level = calculateMasteryLevel(
 *   'algebra-linear-equations',
 *   10,
 *   8,
 *   2,
 *   45.5
 * );
 * console.log(level); // 'proficient'
 * ```
 *
 * @remarks
 * Mastery levels are determined by:
 * - not_started: No attempts yet
 * - struggling: Success rate < 40% OR hint usage > 60% of attempts
 * - learning: Success rate between 40-69%
 * - proficient: Success rate between 70-89%
 * - mastered: Success rate ≥ 90% AND at least 5 attempts
 */
export function calculateMasteryLevel(
  conceptId: string,
  totalAttempts: number,
  successfulAttempts: number,
  hintsUsed: number,
  averageResponseTime: number
): MasteryLevel {
  // Validation
  if (totalAttempts < 0 || successfulAttempts < 0 || hintsUsed < 0) {
    throw new Error('Attempt counts and hints cannot be negative');
  }

  if (successfulAttempts > totalAttempts) {
    throw new Error('Successful attempts cannot exceed total attempts');
  }

  // No attempts yet
  if (totalAttempts === 0) {
    return 'not_started';
  }

  const successRate = successfulAttempts / totalAttempts;
  const hintRatio = hintsUsed / totalAttempts;

  // Struggling: Low success rate OR excessive hint usage
  if (
    successRate < MASTERY_THRESHOLDS.STRUGGLING_SUCCESS_RATE ||
    hintRatio > MASTERY_THRESHOLDS.STRUGGLING_HINT_RATIO
  ) {
    return 'struggling';
  }

  // Learning: Moderate success rate
  if (successRate < MASTERY_THRESHOLDS.LEARNING_SUCCESS_RATE) {
    return 'learning';
  }

  // Proficient: Good success rate but not yet mastered
  if (successRate < MASTERY_THRESHOLDS.PROFICIENT_SUCCESS_RATE) {
    return 'proficient';
  }

  // Mastered: Excellent success rate with sufficient attempts
  if (
    successRate >= MASTERY_THRESHOLDS.PROFICIENT_SUCCESS_RATE &&
    totalAttempts >= MASTERY_THRESHOLDS.MINIMUM_ATTEMPTS_FOR_MASTERY
  ) {
    return 'mastered';
  }

  // High success rate but not enough attempts yet
  return 'proficient';
}

// ============================================================================
// Confidence Calculation
// ============================================================================

/**
 * Calculates confidence score based on overall and recent performance
 *
 * @param totalAttempts - Total number of attempts
 * @param successfulAttempts - Number of successful attempts overall
 * @param recentPerformance - Last 5 attempts (true = success, false = failure)
 * @returns Confidence score between 0 and 1
 *
 * @example
 * ```typescript
 * const confidence = calculateConfidence(
 *   10,
 *   7,
 *   [true, true, false, true, true]
 * );
 * console.log(confidence); // ~0.78 (weighted average)
 * ```
 *
 * @remarks
 * Confidence is weighted: 70% recent performance, 30% overall performance
 * This emphasizes current ability over historical performance
 */
export function calculateConfidence(
  totalAttempts: number,
  successfulAttempts: number,
  recentPerformance: boolean[]
): number {
  // Validation
  if (totalAttempts < 0 || successfulAttempts < 0) {
    throw new Error('Attempt counts cannot be negative');
  }

  if (successfulAttempts > totalAttempts) {
    throw new Error('Successful attempts cannot exceed total attempts');
  }

  if (totalAttempts === 0) {
    return 0;
  }

  // Calculate overall success rate
  const overallSuccessRate = successfulAttempts / totalAttempts;

  // Calculate recent success rate
  let recentSuccessRate = 0;
  if (recentPerformance.length > 0) {
    const recentSuccesses = recentPerformance.filter(Boolean).length;
    recentSuccessRate = recentSuccesses / recentPerformance.length;
  } else {
    // No recent performance data, use overall
    recentSuccessRate = overallSuccessRate;
  }

  // Weighted average: emphasize recent performance
  const confidence =
    CONFIDENCE_WEIGHTS.RECENT_PERFORMANCE * recentSuccessRate +
    CONFIDENCE_WEIGHTS.OVERALL_PERFORMANCE * overallSuccessRate;

  // Ensure confidence is between 0 and 1
  return Math.max(0, Math.min(1, confidence));
}

// ============================================================================
// Concept Mastery Update
// ============================================================================

/**
 * Updates concept mastery with new attempt data
 *
 * @param current - Current ConceptMastery state
 * @param attemptData - New attempt information
 * @returns Updated ConceptMastery object
 *
 * @example
 * ```typescript
 * const updated = updateConceptMastery(currentMastery, {
 *   success: true,
 *   responseTime: 42.5,
 *   hintUsed: false,
 *   timestamp: new Date()
 * });
 * ```
 *
 * @remarks
 * - Updates all attempt counts and success metrics
 * - Recalculates mastery level and confidence
 * - Maintains sliding window of recent attempts for confidence calculation
 * - Tracks error types and examples when attempts fail
 * - Updates average response time with exponential moving average
 */
export function updateConceptMastery(
  current: ConceptMastery,
  attemptData: AttemptData
): ConceptMastery {
  // Validation
  if (attemptData.responseTime < 0) {
    throw new Error('Response time cannot be negative');
  }

  // Extract recent performance (last 5 attempts) from current state
  const recentAttempts: boolean[] = [];

  // We need to reconstruct recent performance from current data
  // Since we don't store attempt history, we'll use a simplified approach:
  // Calculate implied recent performance based on confidence
  const impliedRecentSuccessRate =
    (current.confidence - CONFIDENCE_WEIGHTS.OVERALL_PERFORMANCE * (current.successfulAttempts / (current.totalAttempts || 1))) /
    CONFIDENCE_WEIGHTS.RECENT_PERFORMANCE;

  // Generate approximate recent attempts based on implied rate
  for (let i = 0; i < Math.min(RECENT_ATTEMPTS_WINDOW - 1, current.totalAttempts); i++) {
    recentAttempts.push(Math.random() < impliedRecentSuccessRate);
  }

  // Add current attempt
  recentAttempts.push(attemptData.success);

  // Keep only last 5 attempts
  const recentPerformance = recentAttempts.slice(-RECENT_ATTEMPTS_WINDOW);

  // Update counts
  const totalAttempts = current.totalAttempts + 1;
  const successfulAttempts = current.successfulAttempts + (attemptData.success ? 1 : 0);
  const hintsUsed = current.hintsUsed + (attemptData.hintUsed ? 1 : 0);

  // Update average response time (exponential moving average)
  const alpha = 0.3; // Weight for new value
  const averageResponseTime =
    current.totalAttempts === 0
      ? attemptData.responseTime
      : alpha * attemptData.responseTime + (1 - alpha) * current.averageResponseTime;

  // Recalculate mastery level
  const masteryLevel = calculateMasteryLevel(
    current.conceptId,
    totalAttempts,
    successfulAttempts,
    hintsUsed,
    averageResponseTime
  );

  // Recalculate confidence
  const confidence = calculateConfidence(
    totalAttempts,
    successfulAttempts,
    recentPerformance
  );

  // Handle errors
  const errors = [...current.errors];
  if (!attemptData.success && attemptData.errorType) {
    const existingError = errors.find(e => e.errorType === attemptData.errorType);

    if (existingError) {
      existingError.count++;
      existingError.lastOccurrence = attemptData.timestamp || new Date();
      if (attemptData.errorExample && !existingError.examples.includes(attemptData.errorExample)) {
        existingError.examples.push(attemptData.errorExample);
        // Keep only last 5 examples
        if (existingError.examples.length > 5) {
          existingError.examples.shift();
        }
      }
    } else {
      errors.push({
        errorType: attemptData.errorType,
        count: 1,
        lastOccurrence: attemptData.timestamp || new Date(),
        examples: attemptData.errorExample ? [attemptData.errorExample] : [],
      });
    }
  }

  return {
    ...current,
    masteryLevel,
    confidence,
    totalAttempts,
    successfulAttempts,
    averageResponseTime,
    hintsUsed,
    lastAttemptDate: attemptData.timestamp || new Date(),
    errors,
  };
}

// ============================================================================
// Concept Gap Identification
// ============================================================================

/**
 * Prerequisite concept mapping by grade level and subject
 * Maps advanced concepts to their prerequisite concepts
 */
const CONCEPT_PREREQUISITES: Record<
  string,
  Record<string, { prerequisites: string[]; conceptName: string }>
> = {
  'math-middle': {
    'algebra-equations': {
      conceptName: 'Linear Equations',
      prerequisites: ['arithmetic-operations', 'arithmetic-order'],
    },
    'algebra-inequalities': {
      conceptName: 'Inequalities',
      prerequisites: ['algebra-equations', 'arithmetic-comparison'],
    },
    'geometry-area': {
      conceptName: 'Area Calculation',
      prerequisites: ['arithmetic-multiplication', 'geometry-basics'],
    },
    'algebra-systems': {
      conceptName: 'Systems of Equations',
      prerequisites: ['algebra-equations', 'algebra-inequalities'],
    },
  },
  'math-high': {
    'calculus-derivatives': {
      conceptName: 'Derivatives',
      prerequisites: ['algebra-functions', 'algebra-limits'],
    },
    'calculus-integrals': {
      conceptName: 'Integrals',
      prerequisites: ['calculus-derivatives', 'algebra-functions'],
    },
    'trigonometry-identities': {
      conceptName: 'Trigonometric Identities',
      prerequisites: ['trigonometry-basics', 'algebra-equations'],
    },
  },
  'english-middle': {
    'grammar-complex-sentences': {
      conceptName: 'Complex Sentences',
      prerequisites: ['grammar-simple-sentences', 'grammar-conjunctions'],
    },
    'grammar-passive-voice': {
      conceptName: 'Passive Voice',
      prerequisites: ['grammar-verb-tenses', 'grammar-simple-sentences'],
    },
  },
  'english-high': {
    'grammar-subjunctive': {
      conceptName: 'Subjunctive Mood',
      prerequisites: ['grammar-verb-tenses', 'grammar-conditionals'],
    },
    'writing-argumentative': {
      conceptName: 'Argumentative Writing',
      prerequisites: ['writing-paragraph', 'grammar-complex-sentences'],
    },
  },
};

/**
 * Identifies concept gaps in student learning progression
 *
 * @param conceptMasteries - Array of concept mastery records
 * @param gradeLevel - Current grade level
 * @returns Array of identified concept gaps with recommendations
 *
 * @example
 * ```typescript
 * const gaps = identifyConceptGaps(masteryRecords, 'middle');
 * // Returns gaps where advanced concepts are attempted without mastering prerequisites
 * ```
 *
 * @remarks
 * Identifies three types of gaps:
 * 1. prerequisite_missing: Advanced concept attempted without prerequisite mastery
 * 2. advanced_without_foundation: Jumping ahead without solid foundation
 * 3. inconsistent_mastery: Mastered advanced but struggling with basics (unusual pattern)
 *
 * Only checks concepts relevant to the student's grade level
 */
export function identifyConceptGaps(
  conceptMasteries: ConceptMastery[],
  gradeLevel: GradeLevel
): ConceptGap[] {
  const gaps: ConceptGap[] = [];

  // Create mastery lookup map
  const masteryMap = new Map<string, ConceptMastery>();
  for (const mastery of conceptMasteries) {
    masteryMap.set(mastery.conceptId, mastery);
  }

  // Check each concept for prerequisite gaps
  for (const mastery of conceptMasteries) {
    const subject = mastery.subject;
    const levelKey = `${subject}-${gradeLevel}`;

    // Get prerequisite map for this grade level and subject
    const prerequisites = CONCEPT_PREREQUISITES[levelKey];
    if (!prerequisites) {
      continue; // No prerequisite data for this level
    }

    const conceptPrereqs = prerequisites[mastery.conceptId];
    if (!conceptPrereqs) {
      continue; // This concept has no prerequisites defined
    }

    // Check if student is working on this concept but missing prerequisites
    if (mastery.totalAttempts > 0) {
      const missingPrerequisites: string[] = [];
      const prerequisiteIds = conceptPrereqs.prerequisites;

      for (const prereqId of prerequisiteIds) {
        const prereqMastery = masteryMap.get(prereqId);

        // Missing prerequisite: not attempted or not mastered
        if (
          !prereqMastery ||
          prereqMastery.totalAttempts === 0 ||
          (prereqMastery.masteryLevel !== 'mastered' && prereqMastery.masteryLevel !== 'proficient')
        ) {
          missingPrerequisites.push(prereqId);
        }
      }

      // Identify gap if prerequisites are missing
      if (missingPrerequisites.length > 0) {
        let reason: ConceptGap['reason'] = 'prerequisite_missing';

        // Check if student is struggling with current concept
        if (mastery.masteryLevel === 'struggling') {
          reason = 'advanced_without_foundation';
        }

        // Check for inconsistent mastery pattern
        if (
          mastery.masteryLevel === 'mastered' &&
          missingPrerequisites.length > 0
        ) {
          reason = 'inconsistent_mastery';
        }

        gaps.push({
          conceptId: mastery.conceptId,
          conceptName: conceptPrereqs.conceptName,
          reason,
          missingPrerequisites,
          recommendedOrder: [...missingPrerequisites, mastery.conceptId],
        });
      }
    }
  }

  // Sort gaps by severity (struggling concepts first)
  gaps.sort((a, b) => {
    const severityOrder = {
      advanced_without_foundation: 1,
      prerequisite_missing: 2,
      inconsistent_mastery: 3,
    };
    return severityOrder[a.reason] - severityOrder[b.reason];
  });

  return gaps;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Creates a new ConceptMastery object with initial values
 *
 * @param conceptId - Unique identifier for the concept
 * @param conceptName - Human-readable name
 * @param subject - Subject area (math or english)
 * @param gradeLevel - Grade level
 * @returns New ConceptMastery object with default values
 */
export function createConceptMastery(
  conceptId: string,
  conceptName: string,
  subject: Subject,
  gradeLevel: GradeLevel
): ConceptMastery {
  const now = new Date();

  return {
    conceptId,
    conceptName,
    subject,
    gradeLevel,
    masteryLevel: 'not_started',
    confidence: 0,
    totalAttempts: 0,
    successfulAttempts: 0,
    lastAttemptDate: now,
    firstAttemptDate: now,
    averageResponseTime: 0,
    hintsUsed: 0,
    errors: [],
  };
}

/**
 * Converts mastery level to numeric score for comparison
 *
 * @param level - MasteryLevel to convert
 * @returns Numeric score (0-4)
 */
export function masteryLevelToScore(level: MasteryLevel): number {
  const scoreMap: Record<MasteryLevel, number> = {
    not_started: 0,
    struggling: 1,
    learning: 2,
    proficient: 3,
    mastered: 4,
  };

  return scoreMap[level];
}

/**
 * Determines if a student should advance to the next difficulty level
 *
 * @param mastery - ConceptMastery object
 * @returns Boolean indicating if student is ready to advance
 */
export function shouldAdvanceDifficulty(mastery: ConceptMastery): boolean {
  return (
    mastery.masteryLevel === 'mastered' &&
    mastery.confidence >= 0.8 &&
    mastery.totalAttempts >= MASTERY_THRESHOLDS.MINIMUM_ATTEMPTS_FOR_MASTERY
  );
}

/**
 * Determines if a student needs additional practice
 *
 * @param mastery - ConceptMastery object
 * @returns Boolean indicating if more practice is needed
 */
export function needsMorePractice(mastery: ConceptMastery): boolean {
  return (
    mastery.masteryLevel === 'struggling' ||
    (mastery.masteryLevel === 'learning' && mastery.confidence < 0.5)
  );
}
