/**
 * Learning Progress Weakness Detection System
 * 학습 약점 감지 및 분석 시스템
 *
 * Analyzes concept mastery data to identify weakness areas,
 * calculate severity, generate recommendations, and track improvement progress.
 */

import type { ConceptMastery, ConceptError, WeaknessArea, WeaknessIndicator } from './types';
import type { GradeLevel } from '@/types/tutor';

// ============================================================================
// Constants and Thresholds
// ============================================================================

/**
 * Success rate thresholds for weakness detection
 * 성공률 임계값
 */
export const SUCCESS_RATE_THRESHOLD = 0.5;

/**
 * Hint usage ratio threshold (hints per attempt)
 * 힌트 사용 비율 임계값
 */
export const HINT_USAGE_THRESHOLD = 0.5;

/**
 * Repeated error threshold (same error type count)
 * 반복 오류 임계값
 */
export const REPEATED_ERROR_THRESHOLD = 3;

/**
 * Expected response times by grade level (in seconds)
 * 학교급별 예상 응답 시간
 */
export const EXPECTED_RESPONSE_TIME: Record<GradeLevel, number> = {
  elementary: 60,  // 초등: 60초
  middle: 45,      // 중등: 45초
  high: 30,        // 고등: 30초
  university: 20,  // 대학: 20초
};

/**
 * Response time multiplier for slow response detection
 * 느린 응답 감지용 배수
 */
export const SLOW_RESPONSE_MULTIPLIER = 1.5;

/**
 * Severity calculation thresholds
 * 심각도 계산 임계값
 */
export const SEVERITY_THRESHOLDS = {
  critical: 4,  // 4개 이상의 지표
  high: 3,      // 3개의 지표
  medium: 2,    // 2개의 지표
  low: 1,       // 1개의 지표
} as const;

/**
 * Minimum attempts required for reliable weakness detection
 * 신뢰할 수 있는 약점 감지를 위한 최소 시도 횟수
 */
export const MIN_ATTEMPTS_FOR_DETECTION = 3;

// ============================================================================
// Main Detection Function
// ============================================================================

/**
 * Detects weakness areas from concept mastery data
 * 개념 숙달 데이터에서 약점 영역 감지
 *
 * @param conceptMasteries - Array of concept mastery records
 * @param userId - User identifier
 * @returns Array of detected weakness areas
 *
 * @example
 * ```typescript
 * const weaknesses = detectWeaknesses(masteryData, 'user123');
 * console.log(weaknesses); // [{ conceptId: 'calc-1', severity: 'high', ... }]
 * ```
 */
export function detectWeaknesses(
  conceptMasteries: ConceptMastery[],
  userId: string
): WeaknessArea[] {
  const weaknesses: WeaknessArea[] = [];

  for (const mastery of conceptMasteries) {
    // Skip if not enough attempts for reliable detection
    if (mastery.totalAttempts < MIN_ATTEMPTS_FOR_DETECTION) {
      continue;
    }

    const indicators = detectWeaknessIndicators(mastery);

    // Only create weakness area if indicators found
    if (indicators.length > 0) {
      const severity = calculateSeverity(indicators);
      const recommendations = generateRecommendations({
        conceptId: mastery.conceptId,
        conceptName: mastery.conceptName,
        subject: mastery.subject,
        severity,
        indicators,
        recommendedActions: [],
        relatedConcepts: [],
        detectedDate: new Date(),
        improvementProgress: 0,
      });

      const relatedConcepts = identifyRelatedConcepts(mastery, conceptMasteries);

      weaknesses.push({
        conceptId: mastery.conceptId,
        conceptName: mastery.conceptName,
        subject: mastery.subject,
        severity,
        indicators,
        recommendedActions: recommendations,
        relatedConcepts,
        detectedDate: new Date(),
        improvementProgress: 0,
      });
    }
  }

  // Sort by severity (critical → low)
  return weaknesses.sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
}

/**
 * Detects specific weakness indicators for a concept
 * 특정 개념에 대한 약점 지표 감지
 */
function detectWeaknessIndicators(mastery: ConceptMastery): WeaknessIndicator[] {
  const indicators: WeaknessIndicator[] = [];
  const successRate = mastery.totalAttempts > 0
    ? mastery.successfulAttempts / mastery.totalAttempts
    : 0;

  // 1. Low success rate indicator
  if (successRate < SUCCESS_RATE_THRESHOLD) {
    indicators.push({
      type: 'low_success_rate',
      value: successRate,
      threshold: SUCCESS_RATE_THRESHOLD,
      description: `성공률이 낮습니다 (${(successRate * 100).toFixed(1)}%)`,
    });
  }

  // 2. High hint usage indicator
  const hintUsageRate = mastery.totalAttempts > 0
    ? mastery.hintsUsed / mastery.totalAttempts
    : 0;

  if (hintUsageRate > HINT_USAGE_THRESHOLD) {
    indicators.push({
      type: 'high_hint_usage',
      value: hintUsageRate,
      threshold: HINT_USAGE_THRESHOLD,
      description: `힌트를 자주 사용합니다 (${(hintUsageRate * 100).toFixed(1)}%)`,
    });
  }

  // 3. Slow response indicator
  const expectedTime = EXPECTED_RESPONSE_TIME[mastery.gradeLevel];
  const slowThreshold = expectedTime * SLOW_RESPONSE_MULTIPLIER;

  if (mastery.averageResponseTime > slowThreshold) {
    indicators.push({
      type: 'slow_response',
      value: mastery.averageResponseTime,
      threshold: slowThreshold,
      description: `응답 시간이 깁니다 (평균 ${mastery.averageResponseTime.toFixed(1)}초)`,
    });
  }

  // 4. Repeated errors indicator
  const repeatedErrors = mastery.errors.filter(
    error => error.count >= REPEATED_ERROR_THRESHOLD
  );

  if (repeatedErrors.length > 0) {
    const totalRepeatedErrors = repeatedErrors.reduce((sum, err) => sum + err.count, 0);
    indicators.push({
      type: 'repeated_errors',
      value: totalRepeatedErrors,
      threshold: REPEATED_ERROR_THRESHOLD,
      description: `반복적인 오류가 있습니다 (${repeatedErrors.length}가지 유형)`,
    });
  }

  // 5. Concept gap indicator (based on mastery level)
  if (mastery.masteryLevel === 'struggling' || mastery.masteryLevel === 'not_started') {
    indicators.push({
      type: 'concept_gap',
      value: 0,
      threshold: 1,
      description: `개념 이해에 어려움이 있습니다 (${getMasteryLevelKorean(mastery.masteryLevel)})`,
    });
  }

  return indicators;
}

// ============================================================================
// Severity Calculation
// ============================================================================

/**
 * Calculates severity level based on weakness indicators
 * 약점 지표를 기반으로 심각도 계산
 *
 * @param indicators - Array of weakness indicators
 * @returns Severity level: 'low' | 'medium' | 'high' | 'critical'
 *
 * Logic:
 * - critical: 4+ indicators OR has concept_gap + 2 other indicators
 * - high: 3 indicators OR has low_success_rate + repeated_errors
 * - medium: 2 indicators
 * - low: 1 indicator
 */
export function calculateSeverity(
  indicators: WeaknessIndicator[]
): 'low' | 'medium' | 'high' | 'critical' {
  const indicatorCount = indicators.length;
  const indicatorTypes = indicators.map(ind => ind.type);

  // Critical conditions
  if (indicatorCount >= SEVERITY_THRESHOLDS.critical) {
    return 'critical';
  }

  // Concept gap with multiple other indicators is critical
  if (
    indicatorTypes.includes('concept_gap') &&
    indicatorCount >= 3
  ) {
    return 'critical';
  }

  // High conditions
  if (indicatorCount >= SEVERITY_THRESHOLDS.high) {
    return 'high';
  }

  // Low success rate + repeated errors = high severity
  if (
    indicatorTypes.includes('low_success_rate') &&
    indicatorTypes.includes('repeated_errors')
  ) {
    return 'high';
  }

  // Medium conditions
  if (indicatorCount >= SEVERITY_THRESHOLDS.medium) {
    return 'medium';
  }

  // Low (single indicator)
  return 'low';
}

// ============================================================================
// Recommendation Generation
// ============================================================================

/**
 * Generates actionable recommendations for a weakness area
 * 약점 영역에 대한 실행 가능한 권장사항 생성
 *
 * @param weakness - Weakness area data
 * @returns Array of specific, actionable recommendations
 */
export function generateRecommendations(weakness: WeaknessArea): string[] {
  const recommendations: string[] = [];
  const indicatorTypes = weakness.indicators.map(ind => ind.type);

  // Severity-based recommendations
  if (weakness.severity === 'critical' || weakness.severity === 'high') {
    recommendations.push('🔴 이 개념은 즉시 복습이 필요합니다');
  }

  // Indicator-specific recommendations
  if (indicatorTypes.includes('concept_gap')) {
    recommendations.push('📚 선행 개념부터 다시 학습하는 것을 권장합니다');
    recommendations.push('👨‍🏫 기초 개념 설명을 차근차근 읽어보세요');
  }

  if (indicatorTypes.includes('low_success_rate')) {
    const successIndicator = weakness.indicators.find(ind => ind.type === 'low_success_rate');
    if (successIndicator && successIndicator.value < 0.3) {
      recommendations.push('🎯 기초 단계 문제부터 시작해보세요');
    } else {
      recommendations.push('💪 더 많은 연습 문제를 풀어보세요');
    }
  }

  if (indicatorTypes.includes('high_hint_usage')) {
    recommendations.push('🧠 힌트 없이 혼자 풀어보는 연습을 해보세요');
    recommendations.push('📝 문제 풀이 과정을 스스로 설명해보세요');
  }

  if (indicatorTypes.includes('slow_response')) {
    recommendations.push('⏱️ 시간을 재면서 연습하면 속도가 향상됩니다');
    recommendations.push('🔢 기본 개념을 암기하면 풀이가 빨라집니다');
  }

  if (indicatorTypes.includes('repeated_errors')) {
    const errorIndicator = weakness.indicators.find(ind => ind.type === 'repeated_errors');
    recommendations.push('⚠️ 자주 틀리는 유형의 문제를 집중 연습하세요');
    recommendations.push('🔍 오답 노트를 만들어 실수 패턴을 파악해보세요');
  }

  // Subject-specific recommendations
  if (weakness.subject === 'math') {
    recommendations.push('📐 공식을 외우는 것보다 원리를 이해하는 것이 중요합니다');
    if (indicatorTypes.includes('repeated_errors')) {
      recommendations.push('✏️ 문제를 풀 때 단계별로 검산하는 습관을 들이세요');
    }
  }

  if (weakness.subject === 'english') {
    recommendations.push('📖 관련 영어 표현을 반복해서 읽고 써보세요');
    if (indicatorTypes.includes('slow_response')) {
      recommendations.push('🗣️ 소리 내어 읽으면 학습 효과가 높아집니다');
    }
  }

  // General motivation
  if (weakness.severity === 'low' || weakness.severity === 'medium') {
    recommendations.push('✨ 꾸준히 연습하면 곧 실력이 향상될 거예요');
  }

  return recommendations;
}

// ============================================================================
// Improvement Progress Tracking
// ============================================================================

/**
 * Tracks improvement progress for a weakness area
 * 약점 영역의 개선 진행 상황 추적
 *
 * @param weakness - Original weakness area
 * @param recentMastery - Recent concept mastery updates
 * @returns Improvement progress score (0-1)
 *
 * Progress indicators:
 * - Success rate improvement
 * - Reduced hint usage
 * - Faster response times
 * - Fewer repeated errors
 * - Mastery level advancement
 */
export function trackImprovementProgress(
  weakness: WeaknessArea,
  recentMastery: ConceptMastery[]
): number {
  // Find the concept's recent mastery data
  const currentMastery = recentMastery.find(
    m => m.conceptId === weakness.conceptId
  );

  if (!currentMastery) {
    return weakness.improvementProgress; // No new data, return existing progress
  }

  // Check if enough time has passed for meaningful progress (at least 1 day)
  const daysSinceDetection = Math.floor(
    (new Date().getTime() - weakness.detectedDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceDetection < 1) {
    return 0; // Too early to measure progress
  }

  let progressScore = 0;
  let totalChecks = 0;

  // Check improvement for each indicator type
  for (const indicator of weakness.indicators) {
    totalChecks++;

    switch (indicator.type) {
      case 'low_success_rate': {
        const currentRate = currentMastery.totalAttempts > 0
          ? currentMastery.successfulAttempts / currentMastery.totalAttempts
          : 0;

        // Improved if current rate > threshold or significantly improved
        if (currentRate >= SUCCESS_RATE_THRESHOLD) {
          progressScore += 1;
        } else if (currentRate > indicator.value * 1.2) {
          progressScore += 0.5; // Partial credit for improvement
        }
        break;
      }

      case 'high_hint_usage': {
        const currentHintRate = currentMastery.totalAttempts > 0
          ? currentMastery.hintsUsed / currentMastery.totalAttempts
          : 0;

        if (currentHintRate <= HINT_USAGE_THRESHOLD) {
          progressScore += 1;
        } else if (currentHintRate < indicator.value * 0.8) {
          progressScore += 0.5;
        }
        break;
      }

      case 'slow_response': {
        const expectedTime = EXPECTED_RESPONSE_TIME[currentMastery.gradeLevel];
        const slowThreshold = expectedTime * SLOW_RESPONSE_MULTIPLIER;

        if (currentMastery.averageResponseTime <= slowThreshold) {
          progressScore += 1;
        } else if (currentMastery.averageResponseTime < indicator.value * 0.9) {
          progressScore += 0.5;
        }
        break;
      }

      case 'repeated_errors': {
        const currentRepeatedErrors = currentMastery.errors.filter(
          err => err.count >= REPEATED_ERROR_THRESHOLD
        );

        // Compare with original indicator value
        if (currentRepeatedErrors.length === 0) {
          progressScore += 1;
        } else if (currentRepeatedErrors.length < indicator.value / 2) {
          progressScore += 0.5;
        }
        break;
      }

      case 'concept_gap': {
        // Check mastery level advancement
        const masteryLevels = ['not_started', 'struggling', 'learning', 'proficient', 'mastered'];
        const currentLevel = masteryLevels.indexOf(currentMastery.masteryLevel);

        if (currentLevel >= 3) { // proficient or mastered
          progressScore += 1;
        } else if (currentLevel >= 2) { // learning
          progressScore += 0.5;
        }
        break;
      }
    }
  }

  // Calculate normalized progress (0-1)
  const normalizedProgress = totalChecks > 0 ? progressScore / totalChecks : 0;

  // Ensure progress doesn't decrease (can only improve or stay same)
  return Math.max(weakness.improvementProgress, normalizedProgress);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Identifies related concepts that may be prerequisites or connected topics
 * 선행 학습이나 관련 주제인 개념들을 식별
 */
function identifyRelatedConcepts(
  mastery: ConceptMastery,
  allMasteries: ConceptMastery[]
): string[] {
  const related: string[] = [];

  // Find concepts in same subject with similar patterns
  const sameSuject = allMasteries.filter(
    m => m.subject === mastery.subject && m.conceptId !== mastery.conceptId
  );

  // Add concepts with low mastery that might be prerequisites
  const weakPrerequisites = sameSuject.filter(
    m => (m.masteryLevel === 'struggling' || m.masteryLevel === 'not_started') &&
         m.gradeLevel === mastery.gradeLevel
  );

  related.push(...weakPrerequisites.map(m => m.conceptId));

  // Limit to top 5 most relevant
  return related.slice(0, 5);
}

/**
 * Converts mastery level to Korean description
 * 숙달 수준을 한국어로 변환
 */
function getMasteryLevelKorean(level: string): string {
  const translations: Record<string, string> = {
    not_started: '시작 전',
    struggling: '어려움',
    learning: '학습 중',
    proficient: '능숙',
    mastered: '숙달',
  };
  return translations[level] || level;
}

// ============================================================================
// Exports
// ============================================================================

export type {
  ConceptMastery,
  ConceptError,
  WeaknessArea,
  WeaknessIndicator,
};
