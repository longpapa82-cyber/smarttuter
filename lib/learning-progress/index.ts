/**
 * Learning Progress Tracking System
 * 학습 진행도 추적 시스템
 * 
 * Phase 6 구현: Redis 기반 학습 진행 추적, 개념 마스터리, 약점 감지, 적응형 난이도
 */

// Export all types
export * from './types';

// Export mastery calculator
export {
  calculateMasteryLevel,
  calculateConfidence,
  updateConceptMastery,
  identifyConceptGaps,
  createConceptMastery,
  masteryLevelToScore,
  shouldAdvanceDifficulty,
  needsMorePractice,
} from './mastery-calculator';

// Export weakness detector
export {
  detectWeaknesses,
  calculateSeverity,
  generateRecommendations,
  trackImprovementProgress,
} from './weakness-detector';

// Export difficulty adjuster
export {
  calculateRecommendedDifficulty,
  shouldAdjustDifficulty,
  getDifficultyMultiplier,
  generateAdjustmentExplanation,
} from './difficulty-adjuster';

// Export progress tracker
export {
  trackLearningEvent,
  getLearningProgressSummary,
  getRecommendedNextConcepts,
} from './progress-tracker';
