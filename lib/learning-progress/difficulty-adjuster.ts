/**
 * Adaptive Difficulty Adjuster
 * 학습자의 성과에 따른 난이도 자동 조정 시스템
 *
 * @module difficulty-adjuster
 * @description Adjusts difficulty levels based on student performance using educational psychology principles
 *
 * @remarks
 * Based on Zone of Proximal Development (Vygotsky) and Flow Theory (Csikszentmihalyi):
 * - Optimal challenge: Success rate 70-85% (Flow state)
 * - Too easy: Success rate >90% (Boredom)
 * - Too hard: Success rate <50% (Frustration)
 */

import type {
  ConceptMastery,
  DifficultyLevel,
  DifficultyAdjustment,
  AdjustmentFactor,
} from './types';
import type { Subject } from '@/types/tutor';
import { masteryLevelToScore } from './mastery-calculator';

// ============================================================================
// Constants - Educational Psychology Thresholds
// ============================================================================

/**
 * Success rate thresholds based on Flow Theory
 * Optimal learning occurs when challenge matches ability (70-85% success)
 */
const SUCCESS_RATE_THRESHOLDS = {
  EXCELLENT: 0.9, // Too easy, increase difficulty
  GOOD: 0.85, // Good performance, consider increase
  OPTIMAL: 0.7, // Optimal learning zone (Flow state)
  STRUGGLING: 0.5, // Below this, decrease difficulty
  CRITICAL: 0.4, // Severe difficulty, immediate decrease needed
} as const;

/**
 * Mastery level thresholds for difficulty progression
 * Based on Bloom's Taxonomy progression
 */
const MASTERY_THRESHOLDS = {
  PROFICIENT_RATIO: 0.7, // 70% of concepts should be proficient/mastered
  MASTERED_RATIO: 0.5, // 50% mastered for advanced progression
  STRUGGLING_RATIO: 0.3, // If >30% struggling, decrease difficulty
} as const;

/**
 * Hint usage thresholds (scaffolding indicators)
 * High hint usage suggests too difficult for independent work
 */
const HINT_USAGE_THRESHOLDS = {
  LOW: 0.2, // <20% hints, student is independent
  MODERATE: 0.4, // 20-40% hints, appropriate scaffolding
  HIGH: 0.6, // >40% hints, too difficult
} as const;

/**
 * Response time thresholds (cognitive load indicators)
 * Fast consistent responses suggest low cognitive load
 */
const RESPONSE_TIME_THRESHOLDS = {
  VERY_FAST: 15, // <15 seconds, potentially too easy
  FAST: 30, // 15-30 seconds, good pace
  MODERATE: 60, // 30-60 seconds, appropriate challenge
  SLOW: 120, // >60 seconds, may be too difficult
} as const;

/**
 * Consecutive attempt requirements for difficulty changes
 * Prevents premature adjustments based on insufficient data
 */
const CONSECUTIVE_REQUIREMENTS = {
  INCREASE: 5, // Need 5 consecutive good attempts to increase
  DECREASE: 3, // Need 3 consecutive poor attempts to decrease
} as const;

/**
 * Confidence thresholds for adjustment decisions
 * Only adjust when confidence in recommendation is high
 */
const CONFIDENCE_THRESHOLD = 0.7;

/**
 * Factor weights for difficulty calculation
 * Total must equal 1.0 for weighted average
 */
const FACTOR_WEIGHTS = {
  SUCCESS_RATE: 0.35, // Primary indicator of appropriate difficulty
  MASTERY_DISTRIBUTION: 0.25, // Overall learning progress
  HINT_USAGE: 0.15, // Scaffolding dependency
  RESPONSE_TIME: 0.15, // Cognitive load indicator
  WEAKNESS_SEVERITY: 0.1, // Critical gaps in understanding
} as const;

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Internal calculation result for difficulty adjustment
 */
interface DifficultyScore {
  score: number; // -1 to +1 (-1 = decrease, 0 = maintain, +1 = increase)
  factors: AdjustmentFactor[];
  confidence: number; // 0-1 scale
}

// ============================================================================
// Main Difficulty Calculation
// ============================================================================

/**
 * Calculates recommended difficulty level based on student performance
 *
 * @param userId - Student identifier
 * @param subject - Subject area (math or english)
 * @param recentMastery - Recent concept mastery records (last 10 recommended)
 * @param currentDifficulty - Current difficulty level
 * @returns DifficultyAdjustment with recommended level and supporting factors
 *
 * @example
 * ```typescript
 * const adjustment = calculateRecommendedDifficulty(
 *   'user-123',
 *   'math',
 *   recentMasteryRecords,
 *   'medium'
 * );
 *
 * if (shouldAdjustDifficulty(adjustment)) {
 *   console.log(adjustment.recommendedDifficulty); // 'hard'
 *   console.log(generateAdjustmentExplanation(adjustment));
 * }
 * ```
 *
 * @remarks
 * Uses multi-factor analysis weighted by educational importance:
 * - Success Rate (35%): Primary indicator of appropriate challenge
 * - Mastery Distribution (25%): Overall learning progression
 * - Hint Usage (15%): Scaffolding dependency
 * - Response Time (15%): Cognitive load
 * - Weakness Severity (10%): Critical learning gaps
 */
export function calculateRecommendedDifficulty(
  userId: string,
  subject: Subject,
  recentMastery: ConceptMastery[],
  currentDifficulty: DifficultyLevel
): DifficultyAdjustment {
  // Validation
  if (recentMastery.length === 0) {
    return {
      userId,
      subject,
      currentDifficulty,
      recommendedDifficulty: currentDifficulty,
      reason: '충분한 학습 데이터가 없어 현재 난이도를 유지합니다.',
      factors: [],
      timestamp: new Date(),
      applied: false,
    };
  }

  // Calculate difficulty score from multiple factors
  const difficultyScore = calculateDifficultyScore(recentMastery);

  // Determine recommended difficulty based on score
  const recommendedDifficulty = determineRecommendedDifficulty(
    currentDifficulty,
    difficultyScore.score,
    recentMastery
  );

  // Generate human-readable reason
  const reason = generateReasonText(
    currentDifficulty,
    recommendedDifficulty,
    difficultyScore.factors
  );

  return {
    userId,
    subject,
    currentDifficulty,
    recommendedDifficulty,
    reason,
    factors: difficultyScore.factors,
    timestamp: new Date(),
    applied: false,
  };
}

// ============================================================================
// Factor Analysis Functions
// ============================================================================

/**
 * Calculates overall difficulty score from multiple weighted factors
 */
function calculateDifficultyScore(recentMastery: ConceptMastery[]): DifficultyScore {
  const factors: AdjustmentFactor[] = [];

  // Factor 1: Success Rate Analysis (Weight: 0.35)
  const successRateFactor = analyzeSuccessRate(recentMastery);
  factors.push(successRateFactor);

  // Factor 2: Mastery Distribution Analysis (Weight: 0.25)
  const masteryFactor = analyzeMasteryDistribution(recentMastery);
  factors.push(masteryFactor);

  // Factor 3: Hint Usage Analysis (Weight: 0.15)
  const hintFactor = analyzeHintUsage(recentMastery);
  factors.push(hintFactor);

  // Factor 4: Response Time Analysis (Weight: 0.15)
  const timeFactor = analyzeResponseTime(recentMastery);
  factors.push(timeFactor);

  // Factor 5: Weakness Severity Analysis (Weight: 0.10)
  const weaknessFactor = analyzeWeaknessSeverity(recentMastery);
  factors.push(weaknessFactor);

  // Calculate weighted average score
  const weightedScore = factors.reduce((sum, factor) => {
    const impact = factor.impact === 'increase' ? 1 : factor.impact === 'decrease' ? -1 : 0;
    return sum + factor.weight * factor.value * impact;
  }, 0);

  // Calculate confidence based on data consistency
  const confidence = calculateAdjustmentConfidence(factors, recentMastery.length);

  return {
    score: Math.max(-1, Math.min(1, weightedScore)), // Clamp to [-1, 1]
    factors,
    confidence,
  };
}

/**
 * Analyzes success rate trend
 * Factor Weight: 0.35 (Primary indicator)
 */
function analyzeSuccessRate(recentMastery: ConceptMastery[]): AdjustmentFactor {
  const totalAttempts = recentMastery.reduce((sum, m) => sum + m.totalAttempts, 0);
  const successfulAttempts = recentMastery.reduce((sum, m) => sum + m.successfulAttempts, 0);

  const successRate = totalAttempts > 0 ? successfulAttempts / totalAttempts : 0;

  let impact: 'increase' | 'decrease' | 'maintain' = 'maintain';
  let value = 0.5; // Neutral
  let description = '';

  if (successRate >= SUCCESS_RATE_THRESHOLDS.EXCELLENT) {
    impact = 'increase';
    value = 0.9;
    description = `성공률 ${(successRate * 100).toFixed(0)}% - 매우 우수한 성과`;
  } else if (successRate >= SUCCESS_RATE_THRESHOLDS.GOOD) {
    impact = 'increase';
    value = 0.7;
    description = `성공률 ${(successRate * 100).toFixed(0)}% - 우수한 성과`;
  } else if (successRate >= SUCCESS_RATE_THRESHOLDS.OPTIMAL) {
    impact = 'maintain';
    value = 0.5;
    description = `성공률 ${(successRate * 100).toFixed(0)}% - 최적 학습 구간`;
  } else if (successRate >= SUCCESS_RATE_THRESHOLDS.STRUGGLING) {
    impact = 'decrease';
    value = 0.7;
    description = `성공률 ${(successRate * 100).toFixed(0)}% - 난이도 조정 필요`;
  } else {
    impact = 'decrease';
    value = 0.9;
    description = `성공률 ${(successRate * 100).toFixed(0)}% - 기초 연습 필요`;
  }

  return {
    name: '성공률',
    weight: FACTOR_WEIGHTS.SUCCESS_RATE,
    value,
    impact,
    description,
  };
}

/**
 * Analyzes mastery level distribution
 * Factor Weight: 0.25 (Overall progress indicator)
 */
function analyzeMasteryDistribution(recentMastery: ConceptMastery[]): AdjustmentFactor {
  const total = recentMastery.length;
  const masteredCount = recentMastery.filter(m => m.masteryLevel === 'mastered').length;
  const proficientCount = recentMastery.filter(m => m.masteryLevel === 'proficient').length;
  const strugglingCount = recentMastery.filter(m => m.masteryLevel === 'struggling').length;

  const masteredRatio = masteredCount / total;
  const proficientRatio = (masteredCount + proficientCount) / total;
  const strugglingRatio = strugglingCount / total;

  // Calculate average mastery score
  const avgMasteryScore = recentMastery.reduce(
    (sum, m) => sum + masteryLevelToScore(m.masteryLevel),
    0
  ) / total / 4; // Normalize to 0-1

  let impact: 'increase' | 'decrease' | 'maintain' = 'maintain';
  let value = avgMasteryScore;
  let description = '';

  if (masteredRatio >= MASTERY_THRESHOLDS.MASTERED_RATIO) {
    impact = 'increase';
    value = 0.9;
    description = `${(masteredRatio * 100).toFixed(0)}% 완전 숙달 - 도전 과제 준비됨`;
  } else if (proficientRatio >= MASTERY_THRESHOLDS.PROFICIENT_RATIO) {
    impact = 'increase';
    value = 0.7;
    description = `${(proficientRatio * 100).toFixed(0)}% 숙련 수준 - 진전 중`;
  } else if (strugglingRatio >= MASTERY_THRESHOLDS.STRUGGLING_RATIO) {
    impact = 'decrease';
    value = 0.8;
    description = `${(strugglingRatio * 100).toFixed(0)}% 어려움 겪음 - 기초 강화 필요`;
  } else {
    impact = 'maintain';
    value = 0.5;
    description = '균형잡힌 학습 진행 중';
  }

  return {
    name: '숙련도 분포',
    weight: FACTOR_WEIGHTS.MASTERY_DISTRIBUTION,
    value,
    impact,
    description,
  };
}

/**
 * Analyzes hint usage patterns
 * Factor Weight: 0.15 (Scaffolding dependency indicator)
 */
function analyzeHintUsage(recentMastery: ConceptMastery[]): AdjustmentFactor {
  const totalAttempts = recentMastery.reduce((sum, m) => sum + m.totalAttempts, 0);
  const totalHints = recentMastery.reduce((sum, m) => sum + m.hintsUsed, 0);

  const hintRatio = totalAttempts > 0 ? totalHints / totalAttempts : 0;

  let impact: 'increase' | 'decrease' | 'maintain' = 'maintain';
  let value = 0.5;
  let description = '';

  if (hintRatio <= HINT_USAGE_THRESHOLDS.LOW) {
    impact = 'increase';
    value = 0.8;
    description = `힌트 사용 ${(hintRatio * 100).toFixed(0)}% - 독립적 문제 해결`;
  } else if (hintRatio <= HINT_USAGE_THRESHOLDS.MODERATE) {
    impact = 'maintain';
    value = 0.5;
    description = `힌트 사용 ${(hintRatio * 100).toFixed(0)}% - 적절한 안내 수준`;
  } else if (hintRatio <= HINT_USAGE_THRESHOLDS.HIGH) {
    impact = 'decrease';
    value = 0.7;
    description = `힌트 사용 ${(hintRatio * 100).toFixed(0)}% - 높은 안내 필요`;
  } else {
    impact = 'decrease';
    value = 0.9;
    description = `힌트 사용 ${(hintRatio * 100).toFixed(0)}% - 과도한 도움 의존`;
  }

  return {
    name: '힌트 사용',
    weight: FACTOR_WEIGHTS.HINT_USAGE,
    value,
    impact,
    description,
  };
}

/**
 * Analyzes response time patterns
 * Factor Weight: 0.15 (Cognitive load indicator)
 */
function analyzeResponseTime(recentMastery: ConceptMastery[]): AdjustmentFactor {
  const avgResponseTime = recentMastery.reduce(
    (sum, m) => sum + m.averageResponseTime,
    0
  ) / recentMastery.length;

  let impact: 'increase' | 'decrease' | 'maintain' = 'maintain';
  let value = 0.5;
  let description = '';

  if (avgResponseTime <= RESPONSE_TIME_THRESHOLDS.VERY_FAST) {
    impact = 'increase';
    value = 0.8;
    description = `평균 ${avgResponseTime.toFixed(0)}초 - 매우 빠른 반응`;
  } else if (avgResponseTime <= RESPONSE_TIME_THRESHOLDS.FAST) {
    impact = 'increase';
    value = 0.6;
    description = `평균 ${avgResponseTime.toFixed(0)}초 - 빠른 이해`;
  } else if (avgResponseTime <= RESPONSE_TIME_THRESHOLDS.MODERATE) {
    impact = 'maintain';
    value = 0.5;
    description = `평균 ${avgResponseTime.toFixed(0)}초 - 적절한 사고 시간`;
  } else {
    impact = 'decrease';
    value = 0.7;
    description = `평균 ${avgResponseTime.toFixed(0)}초 - 높은 인지 부담`;
  }

  return {
    name: '응답 시간',
    weight: FACTOR_WEIGHTS.RESPONSE_TIME,
    value,
    impact,
    description,
  };
}

/**
 * Analyzes weakness severity in recent attempts
 * Factor Weight: 0.10 (Critical gap indicator)
 */
function analyzeWeaknessSeverity(recentMastery: ConceptMastery[]): AdjustmentFactor {
  const criticalWeaknesses = recentMastery.filter(m =>
    m.masteryLevel === 'struggling' && m.errors.length > 0
  ).length;

  const weaknessRatio = criticalWeaknesses / recentMastery.length;

  let impact: 'increase' | 'decrease' | 'maintain' = 'maintain';
  let value = 1 - weaknessRatio; // Inverse: high weakness = low value
  let description = '';

  if (weaknessRatio === 0) {
    impact = 'maintain';
    value = 1;
    description = '약점 없음 - 견고한 이해';
  } else if (weaknessRatio < 0.2) {
    impact = 'maintain';
    value = 0.8;
    description = `약점 ${criticalWeaknesses}개 - 관리 가능`;
  } else if (weaknessRatio < 0.4) {
    impact = 'decrease';
    value = 0.6;
    description = `약점 ${criticalWeaknesses}개 - 보완 필요`;
  } else {
    impact = 'decrease';
    value = 0.9;
    description = `약점 ${criticalWeaknesses}개 - 집중 복습 필요`;
  }

  return {
    name: '약점 심각도',
    weight: FACTOR_WEIGHTS.WEAKNESS_SEVERITY,
    value,
    impact,
    description,
  };
}

/**
 * Calculates confidence in adjustment recommendation
 * Higher confidence with more data and consistent factor agreement
 */
function calculateAdjustmentConfidence(
  factors: AdjustmentFactor[],
  dataPoints: number
): number {
  // Data volume confidence (more data = higher confidence)
  const dataVolumeConfidence = Math.min(dataPoints / 10, 1.0);

  // Factor agreement confidence (all factors agree = higher confidence)
  const increaseFactors = factors.filter(f => f.impact === 'increase').length;
  const decreaseFactors = factors.filter(f => f.impact === 'decrease').length;
  const maintainFactors = factors.filter(f => f.impact === 'maintain').length;

  const maxAgreement = Math.max(increaseFactors, decreaseFactors, maintainFactors);
  const agreementConfidence = maxAgreement / factors.length;

  // Combined confidence (average of both components)
  return (dataVolumeConfidence + agreementConfidence) / 2;
}

// ============================================================================
// Difficulty Level Determination
// ============================================================================

/**
 * Difficulty level progression order
 */
const DIFFICULTY_ORDER: DifficultyLevel[] = [
  'very_easy',
  'easy',
  'medium',
  'hard',
  'very_hard',
];

/**
 * Determines recommended difficulty based on score and current level
 */
function determineRecommendedDifficulty(
  currentDifficulty: DifficultyLevel,
  score: number,
  recentMastery: ConceptMastery[]
): DifficultyLevel {
  const currentIndex = DIFFICULTY_ORDER.indexOf(currentDifficulty);

  // Strong increase signal (score > 0.5)
  if (score > 0.5 && currentIndex < DIFFICULTY_ORDER.length - 1) {
    // Verify consecutive success before increasing
    const recentSuccessRate = calculateRecentSuccessRate(recentMastery, CONSECUTIVE_REQUIREMENTS.INCREASE);
    if (recentSuccessRate >= SUCCESS_RATE_THRESHOLDS.GOOD) {
      return DIFFICULTY_ORDER[currentIndex + 1];
    }
  }

  // Strong decrease signal (score < -0.5)
  if (score < -0.5 && currentIndex > 0) {
    // Verify consecutive struggles before decreasing
    const recentSuccessRate = calculateRecentSuccessRate(recentMastery, CONSECUTIVE_REQUIREMENTS.DECREASE);
    if (recentSuccessRate <= SUCCESS_RATE_THRESHOLDS.STRUGGLING) {
      return DIFFICULTY_ORDER[currentIndex - 1];
    }
  }

  // Maintain current difficulty
  return currentDifficulty;
}

/**
 * Calculates success rate for recent N attempts
 */
function calculateRecentSuccessRate(recentMastery: ConceptMastery[], count: number): number {
  const recent = recentMastery.slice(-count);
  const totalAttempts = recent.reduce((sum, m) => sum + m.totalAttempts, 0);
  const successfulAttempts = recent.reduce((sum, m) => sum + m.successfulAttempts, 0);

  return totalAttempts > 0 ? successfulAttempts / totalAttempts : 0;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Determines if difficulty should be adjusted based on recommendation
 *
 * @param adjustment - DifficultyAdjustment object
 * @returns Boolean indicating if adjustment should be applied
 *
 * @example
 * ```typescript
 * if (shouldAdjustDifficulty(adjustment)) {
 *   applyDifficultyChange(adjustment.recommendedDifficulty);
 * }
 * ```
 *
 * @remarks
 * Only adjusts if:
 * - Recommended difficulty differs from current
 * - Confidence in recommendation is high (>70%)
 */
export function shouldAdjustDifficulty(adjustment: DifficultyAdjustment): boolean {
  return (
    adjustment.currentDifficulty !== adjustment.recommendedDifficulty &&
    adjustment.factors.length > 0 &&
    calculateAdjustmentConfidence(adjustment.factors, 10) >= CONFIDENCE_THRESHOLD
  );
}

/**
 * Gets difficulty multiplier for time limits and complexity
 *
 * @param difficulty - DifficultyLevel
 * @returns Multiplier value (0.5 - 2.0)
 *
 * @example
 * ```typescript
 * const baseTime = 60; // seconds
 * const multiplier = getDifficultyMultiplier('hard');
 * const adjustedTime = baseTime * multiplier; // 90 seconds
 * ```
 *
 * @remarks
 * Multipliers:
 * - very_easy: 0.5x (half the time/complexity)
 * - easy: 0.75x
 * - medium: 1.0x (baseline)
 * - hard: 1.5x
 * - very_hard: 2.0x (double the time/complexity)
 */
export function getDifficultyMultiplier(difficulty: DifficultyLevel): number {
  const multipliers: Record<DifficultyLevel, number> = {
    very_easy: 0.5,
    easy: 0.75,
    medium: 1.0,
    hard: 1.5,
    very_hard: 2.0,
  };

  return multipliers[difficulty];
}

/**
 * Generates human-readable explanation for difficulty adjustment
 *
 * @param adjustment - DifficultyAdjustment object
 * @returns Korean explanation of the adjustment reasoning
 *
 * @example
 * ```typescript
 * const explanation = generateAdjustmentExplanation(adjustment);
 * console.log(explanation);
 * // "최근 학습 성과가 우수하여 난이도를 '중급'에서 '상급'으로 올립니다."
 * ```
 */
export function generateAdjustmentExplanation(adjustment: DifficultyAdjustment): string {
  const difficultyNames: Record<DifficultyLevel, string> = {
    very_easy: '매우 쉬움',
    easy: '쉬움',
    medium: '중급',
    hard: '상급',
    very_hard: '매우 어려움',
  };

  const currentName = difficultyNames[adjustment.currentDifficulty];
  const recommendedName = difficultyNames[adjustment.recommendedDifficulty];

  if (adjustment.currentDifficulty === adjustment.recommendedDifficulty) {
    return `현재 '${currentName}' 난이도가 적절합니다. ${adjustment.reason}`;
  }

  const direction = DIFFICULTY_ORDER.indexOf(adjustment.recommendedDifficulty) >
    DIFFICULTY_ORDER.indexOf(adjustment.currentDifficulty)
    ? '올립니다'
    : '낮춥니다';

  const mainFactors = adjustment.factors
    .filter(f => f.value > 0.7)
    .map(f => f.description)
    .slice(0, 2)
    .join(', ');

  return `${mainFactors}. 난이도를 '${currentName}'에서 '${recommendedName}'으로 ${direction}.`;
}

/**
 * Generates reason text based on difficulty change
 */
function generateReasonText(
  current: DifficultyLevel,
  recommended: DifficultyLevel,
  factors: AdjustmentFactor[]
): string {
  if (current === recommended) {
    return '현재 난이도가 학습자의 수준에 적합합니다';
  }

  const isIncrease = DIFFICULTY_ORDER.indexOf(recommended) > DIFFICULTY_ORDER.indexOf(current);

  if (isIncrease) {
    return '최근 학습 성과가 우수하여 더 도전적인 내용을 학습할 준비가 되었습니다';
  } else {
    return '더 기초적인 연습을 통해 탄탄한 이해를 쌓을 필요가 있습니다';
  }
}

// ============================================================================
// Exports
// ============================================================================

export {
  SUCCESS_RATE_THRESHOLDS,
  MASTERY_THRESHOLDS,
  HINT_USAGE_THRESHOLDS,
  RESPONSE_TIME_THRESHOLDS,
  CONSECUTIVE_REQUIREMENTS,
  CONFIDENCE_THRESHOLD,
  FACTOR_WEIGHTS,
};
