// Phase 8: Difficulty Adjustment Algorithm
// Based on Century Tech's click-level analysis and Flow Theory

import {
  DifficultyLevel,
  DifficultyContext,
  SessionRecord,
  MasteryLevel,
  OPTIMAL_ACCURACY_MIN,
  OPTIMAL_ACCURACY_MAX,
} from './types';

export class DifficultyAdjuster {
  /**
   * Calculate optimal difficulty based on recent performance
   * Flow Theory: Maintain 70-85% accuracy for optimal learning
   */
  static adjustDifficulty(context: DifficultyContext): DifficultyLevel {
    const { recentSessions, currentMastery, targetAccuracy } = context;

    if (recentSessions.length === 0) {
      // Default to medium difficulty
      return 2;
    }

    // Analyze last 5 sessions
    const sessionsToAnalyze = recentSessions.slice(-5);

    // Calculate average accuracy
    const avgAccuracy = this.calculateAverageAccuracy(sessionsToAnalyze);

    // Calculate learning velocity
    const learningVelocity = this.calculateLearningVelocity(sessionsToAnalyze);

    // Get current difficulty
    const currentDifficulty =
      sessionsToAnalyze[sessionsToAnalyze.length - 1].difficulty;

    // Determine adjustment
    return this.determineAdjustment(
      currentDifficulty,
      avgAccuracy,
      learningVelocity,
      targetAccuracy || OPTIMAL_ACCURACY_MIN
    );
  }

  /**
   * Calculate average accuracy from sessions
   */
  private static calculateAverageAccuracy(sessions: SessionRecord[]): number {
    if (sessions.length === 0) return 0.7; // Default assumption

    const totalAccuracy = sessions.reduce(
      (sum, session) => sum + session.performance.accuracy,
      0
    );

    return totalAccuracy / sessions.length;
  }

  /**
   * Calculate learning velocity (improvement rate)
   */
  private static calculateLearningVelocity(sessions: SessionRecord[]): number {
    if (sessions.length < 2) return 0;

    // Compare first half vs second half accuracy
    const midpoint = Math.floor(sessions.length / 2);
    const firstHalf = sessions.slice(0, midpoint);
    const secondHalf = sessions.slice(midpoint);

    const firstHalfAvg = this.calculateAverageAccuracy(firstHalf);
    const secondHalfAvg = this.calculateAverageAccuracy(secondHalf);

    return secondHalfAvg - firstHalfAvg;
  }

  /**
   * Determine difficulty adjustment based on performance
   */
  private static determineAdjustment(
    currentDifficulty: DifficultyLevel,
    avgAccuracy: number,
    learningVelocity: number,
    targetAccuracy: number
  ): DifficultyLevel {
    // Too easy (above optimal range)
    if (avgAccuracy > OPTIMAL_ACCURACY_MAX) {
      // Increase difficulty if learning velocity is positive
      if (learningVelocity > 0.05) {
        return Math.min(currentDifficulty + 1, 5) as DifficultyLevel;
      }
      return currentDifficulty;
    }

    // Too hard (below optimal range)
    if (avgAccuracy < targetAccuracy) {
      // Decrease difficulty to prevent frustration
      return Math.max(currentDifficulty - 1, 1) as DifficultyLevel;
    }

    // Within optimal range - maintain or slight increase
    if (learningVelocity > 0.1 && avgAccuracy > 0.75) {
      // Strong learner - challenge more
      return Math.min(currentDifficulty + 1, 5) as DifficultyLevel;
    }

    // Maintain current difficulty
    return currentDifficulty;
  }

  /**
   * Suggest difficulty for next session based on subject mastery
   */
  static suggestDifficulty(
    currentMastery: MasteryLevel[],
    recentSessions: SessionRecord[]
  ): DifficultyLevel {
    // Calculate overall mastery score
    const masteryScore =
      currentMastery.reduce((sum, m) => sum + m.mastery, 0) /
        currentMastery.length || 0.5;

    // Map mastery to difficulty (0-1 → 1-5)
    const baseDifficulty = Math.ceil(masteryScore * 5);

    // Adjust based on recent performance
    const context: DifficultyContext = {
      recentSessions,
      currentMastery,
      weaknesses: [],
      targetAccuracy: OPTIMAL_ACCURACY_MIN,
    };

    const adjustedDifficulty = this.adjustDifficulty(context);

    // Average the two approaches
    return Math.round((baseDifficulty + adjustedDifficulty) / 2) as DifficultyLevel;
  }

  /**
   * Check if difficulty should be adjusted during session
   * Real-time adjustment like Century Tech
   */
  static shouldAdjustRealtime(
    currentAccuracy: number,
    messageCount: number
  ): { shouldAdjust: boolean; direction: 'up' | 'down' | 'maintain' } {
    // Need at least 5 interactions to judge
    if (messageCount < 5) {
      return { shouldAdjust: false, direction: 'maintain' };
    }

    // Struggling significantly
    if (currentAccuracy < 0.5) {
      return { shouldAdjust: true, direction: 'down' };
    }

    // Excelling significantly
    if (currentAccuracy > 0.9) {
      return { shouldAdjust: true, direction: 'up' };
    }

    return { shouldAdjust: false, direction: 'maintain' };
  }

  /**
   * Calculate confidence in difficulty recommendation
   */
  static calculateConfidence(sessions: SessionRecord[]): number {
    if (sessions.length < 3) return 0.5; // Low confidence with few sessions

    // More sessions = higher confidence
    const sessionFactor = Math.min(sessions.length / 10, 1);

    // Consistency in performance = higher confidence
    const accuracies = sessions.map(s => s.performance.accuracy);
    const variance = this.calculateVariance(accuracies);
    const consistencyFactor = Math.max(0, 1 - variance);

    return (sessionFactor + consistencyFactor) / 2;
  }

  /**
   * Calculate statistical variance
   */
  private static calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance =
      squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;

    return variance;
  }
}
