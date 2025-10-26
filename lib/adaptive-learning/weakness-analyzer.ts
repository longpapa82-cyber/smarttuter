// Phase 8: Weakness Analysis & Early Warning System
// Based on Georgia State University's 800 risk factors approach (simplified)

import {
  Weakness,
  MasteryLevel,
  SessionRecord,
  Alert,
  Action,
  WEAKNESS_THRESHOLD,
  MASTERY_THRESHOLD,
} from './types';
import { getNodeById, getPrerequisites } from './knowledge-graph';

export class WeaknessAnalyzer {
  /**
   * Identify weaknesses from mastery data
   */
  static identifyWeaknesses(masteryData: MasteryLevel[]): Weakness[] {
    const weaknesses: Weakness[] = [];

    for (const mastery of masteryData) {
      if (mastery.successRate < WEAKNESS_THRESHOLD) {
        const node = getNodeById(mastery.nodeId);
        if (!node) continue;

        const weakness: Weakness = {
          knowledgeNodeId: mastery.nodeId,
          nodeName: node.name,
          severity: this.calculateSeverity(mastery),
          evidence: {
            attemptCount: mastery.attempts,
            successRate: mastery.successRate,
            avgTimeSpent: 0, // Would need session data
            lastAttemptDate: mastery.lastPracticed,
          },
          rootCause: this.diagnoseRootCause(mastery, node.prerequisites),
          remediation: this.generateRemediation(node, mastery),
        };

        weaknesses.push(weakness);
      }
    }

    // Sort by priority (severity + attempt count)
    return weaknesses.sort((a, b) => {
      const priorityA = this.calculatePriority(a);
      const priorityB = this.calculatePriority(b);
      return priorityB - priorityA;
    });
  }

  /**
   * Calculate severity of weakness
   */
  private static calculateSeverity(
    mastery: MasteryLevel
  ): 'minor' | 'moderate' | 'critical' {
    const { successRate, attempts } = mastery;

    if (successRate < 0.3 && attempts > 5) return 'critical';
    if (successRate < 0.5 || attempts > 10) return 'moderate';
    return 'minor';
  }

  /**
   * Diagnose root cause of weakness
   */
  private static diagnoseRootCause(
    mastery: MasteryLevel,
    prerequisites: string[]
  ): Weakness['rootCause'] {
    // Few attempts but low success = too advanced
    if (mastery.attempts < 3 && mastery.successRate < 0.4) {
      return 'too_advanced';
    }

    // Has prerequisites but struggling = prerequisite gap
    if (prerequisites.length > 0) {
      return 'prerequisite_gap';
    }

    // Many attempts, improving but not there yet = practice needed
    if (mastery.attempts > 5 && mastery.successRate > 0.4) {
      return 'practice_needed';
    }

    // Default = concept misunderstanding
    return 'concept_misunderstanding';
  }

  /**
   * Generate remediation plan
   */
  private static generateRemediation(
    node: any,
    mastery: MasteryLevel
  ): Weakness['remediation'] {
    const prerequisites = getPrerequisites(node.id);

    return {
      recommendedContent: [
        node.id,
        ...prerequisites.map(p => p.id).slice(0, 2), // Top 2 prerequisites
      ],
      estimatedTime: node.estimatedTime * 1.5, // Extra time for weakness
      priority: this.calculatePriority({
        knowledgeNodeId: node.id,
        severity: this.calculateSeverity(mastery),
        evidence: {
          attemptCount: mastery.attempts,
          successRate: mastery.successRate,
          avgTimeSpent: 0,
          lastAttemptDate: mastery.lastPracticed,
        },
      } as Weakness),
      prerequisites: prerequisites.map(p => p.id),
    };
  }

  /**
   * Calculate priority score (1-10)
   */
  private static calculatePriority(weakness: Weakness): number {
    let priority = 0;

    // Severity weight
    const severityWeight = {
      critical: 10,
      moderate: 6,
      minor: 3,
    };
    priority += severityWeight[weakness.severity];

    // Recency weight (more recent = higher priority)
    const daysSinceAttempt = Math.floor(
      (Date.now() - weakness.evidence.lastAttemptDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    priority += Math.max(0, 5 - daysSinceAttempt);

    // Attempt count weight (many failed attempts = higher priority)
    priority += Math.min(weakness.evidence.attemptCount / 2, 5);

    return Math.min(priority, 10);
  }

  /**
   * Early Warning System - detect at-risk students
   * Based on Georgia State University's approach
   */
  static detectRisks(
    sessions: SessionRecord[],
    masteryData: MasteryLevel[]
  ): Alert[] {
    const alerts: Alert[] = [];

    // Risk Factor 1: Declining Engagement
    const engagementAlert = this.checkEngagement(sessions);
    if (engagementAlert) alerts.push(engagementAlert);

    // Risk Factor 2: Poor Performance Trend
    const performanceAlert = this.checkPerformanceTrend(sessions);
    if (performanceAlert) alerts.push(performanceAlert);

    // Risk Factor 3: Lack of Progress
    const progressAlert = this.checkProgress(masteryData);
    if (progressAlert) alerts.push(progressAlert);

    // Risk Factor 4: Excessive Hint Usage
    const hintAlert = this.checkHintDependency(sessions);
    if (hintAlert) alerts.push(hintAlert);

    return alerts;
  }

  /**
   * Check engagement levels
   */
  private static checkEngagement(sessions: SessionRecord[]): Alert | null {
    if (sessions.length < 5) return null;

    const recent = sessions.slice(-5);
    const avgDuration = recent.reduce((sum, s) => sum + s.duration, 0) / 5;

    if (avgDuration < 10) {
      // Less than 10 minutes average
      return {
        id: `alert-engagement-${Date.now()}`,
        severity: 'medium',
        type: 'engagement',
        message: '학습 시간이 짧아지고 있습니다. 집중력을 유지하는 데 어려움이 있나요?',
        recommendedActions: [
          {
            id: 'action-break',
            type: 'take_break',
            description: '짧은 휴식 후 다시 시작하세요',
            priority: 8,
          },
          {
            id: 'action-change-subject',
            type: 'change_subject',
            description: '다른 과목으로 전환해보세요',
            priority: 6,
          },
        ],
        createdAt: new Date(),
        dismissed: false,
      };
    }

    return null;
  }

  /**
   * Check performance trend
   */
  private static checkPerformanceTrend(sessions: SessionRecord[]): Alert | null {
    if (sessions.length < 5) return null;

    const recent = sessions.slice(-5);
    const accuracies = recent.map(s => s.performance.accuracy);

    // Check for declining trend
    let declining = true;
    for (let i = 1; i < accuracies.length; i++) {
      if (accuracies[i] >= accuracies[i - 1]) {
        declining = false;
        break;
      }
    }

    if (declining) {
      return {
        id: `alert-performance-${Date.now()}`,
        severity: 'high',
        type: 'performance',
        message: '성과가 계속 낮아지고 있습니다. 기초를 다시 복습하는 것이 좋겠습니다.',
        recommendedActions: [
          {
            id: 'action-review',
            type: 'review_basics',
            description: '기초 개념 복습',
            priority: 10,
          },
          {
            id: 'action-lower-diff',
            type: 'lower_difficulty',
            description: '난이도 낮추기',
            priority: 9,
          },
        ],
        createdAt: new Date(),
        dismissed: false,
      };
    }

    return null;
  }

  /**
   * Check learning progress
   */
  private static checkProgress(masteryData: MasteryLevel[]): Alert | null {
    if (masteryData.length === 0) return null;

    const masteredCount = masteryData.filter(
      m => m.mastery >= MASTERY_THRESHOLD
    ).length;

    const masteryRate = masteredCount / masteryData.length;

    if (masteryRate < 0.3 && masteryData.length > 10) {
      return {
        id: `alert-progress-${Date.now()}`,
        severity: 'medium',
        type: 'performance',
        message: '숙달한 개념이 적습니다. 학습 전략을 조정해보세요.',
        recommendedActions: [
          {
            id: 'action-focus',
            type: 'review_basics',
            description: '한 가지 개념에 집중하기',
            priority: 8,
          },
          {
            id: 'action-hints',
            type: 'provide_hints',
            description: '더 많은 힌트와 예시 제공',
            priority: 7,
          },
        ],
        createdAt: new Date(),
        dismissed: false,
      };
    }

    return null;
  }

  /**
   * Check hint dependency
   */
  private static checkHintDependency(sessions: SessionRecord[]): Alert | null {
    if (sessions.length < 3) return null;

    const recent = sessions.slice(-3);
    const avgHints =
      recent.reduce((sum, s) => sum + s.performance.hintsUsed, 0) / 3;

    if (avgHints > 5) {
      return {
        id: `alert-hints-${Date.now()}`,
        severity: 'low',
        type: 'difficulty',
        message: '힌트를 많이 사용하고 있습니다. 난이도가 너무 높을 수 있습니다.',
        recommendedActions: [
          {
            id: 'action-easier',
            type: 'lower_difficulty',
            description: '더 쉬운 문제부터 시작',
            priority: 7,
          },
        ],
        createdAt: new Date(),
        dismissed: false,
      };
    }

    return null;
  }
}
