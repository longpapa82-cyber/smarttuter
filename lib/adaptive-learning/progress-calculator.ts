// Phase 8: Progress Analytics Calculator
// Comprehensive progress tracking and prediction

import {
  ProgressAnalytics,
  MasteryLevel,
  SessionRecord,
  Subject,
  CategoryMastery,
  KnowledgeNode,
  LearningPathway,
  XP_MULTIPLIERS,
  MASTERY_THRESHOLD,
} from './types';
import { getNodesBySubject, getNodeById } from './knowledge-graph';

export class ProgressCalculator {
  /**
   * Calculate comprehensive progress analytics
   */
  static calculateAnalytics(
    subject: Subject,
    masteryData: MasteryLevel[],
    sessions: SessionRecord[],
    currentPath?: LearningPathway
  ): ProgressAnalytics {
    const subjectSessions = sessions.filter(s => s.subject === subject);

    return {
      masteryMap: this.calculateMasteryMap(subject, masteryData),
      learningVelocity: this.calculateLearningVelocity(subjectSessions),
      strengthsWeaknesses: this.analyzeStrengthsWeaknesses(masteryData),
      predictions: this.generatePredictions(
        masteryData,
        subjectSessions,
        currentPath
      ),
      timeAnalytics: this.calculateTimeAnalytics(subjectSessions),
    };
  }

  /**
   * Calculate mastery map by category
   */
  private static calculateMasteryMap(
    subject: Subject,
    masteryData: MasteryLevel[]
  ): ProgressAnalytics['masteryMap'] {
    const allNodes = getNodesBySubject(subject);

    // Group by category
    const categoryMap = new Map<string, KnowledgeNode[]>();
    for (const node of allNodes) {
      const category = node.category.split(' > ')[0]; // Top-level category
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(node);
    }

    // Calculate mastery per category
    const categories: CategoryMastery[] = [];
    for (const [category, nodes] of categoryMap.entries()) {
      const nodeIds = nodes.map(n => n.id);
      const masteryInCategory = masteryData.filter(m =>
        nodeIds.includes(m.nodeId)
      );

      const masteredCount = masteryInCategory.filter(
        m => m.mastery >= MASTERY_THRESHOLD
      ).length;

      const inProgressCount = masteryInCategory.filter(
        m => m.mastery > 0 && m.mastery < MASTERY_THRESHOLD
      ).length;

      const mastery =
        masteryInCategory.length > 0
          ? (masteredCount / nodes.length) * 100
          : 0;

      categories.push({
        category,
        mastery: Math.round(mastery),
        nodeCount: nodes.length,
        masteredCount,
        inProgressCount,
        color: this.getCategoryColor(category),
      });
    }

    const totalMasteredNodes = masteryData.filter(
      m => m.mastery >= MASTERY_THRESHOLD
    ).length;

    return {
      subject,
      categories: categories.sort((a, b) => b.mastery - a.mastery),
      overallMastery: Math.round(
        (totalMasteredNodes / allNodes.length) * 100
      ),
      totalNodes: allNodes.length,
      masteredNodes: totalMasteredNodes,
    };
  }

  /**
   * Get category color for visualization
   */
  private static getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      산술: '#10b981', // green
      대수: '#3b82f6', // blue
      기하: '#f59e0b', // amber
      미적분: '#ef4444', // red
      기초: '#22c55e', // light green
      문법: '#3b82f6', // blue
      어휘: '#8b5cf6', // purple
      독해: '#ec4899', // pink
      작문: '#f59e0b', // amber
      말하기: '#06b6d4', // cyan
    };

    return colors[category] || '#6b7280'; // gray default
  }

  /**
   * Calculate learning velocity metrics
   */
  private static calculateLearningVelocity(
    sessions: SessionRecord[]
  ): ProgressAnalytics['learningVelocity'] {
    if (sessions.length === 0) {
      return {
        xpPerHour: 0,
        conceptsPerWeek: 0,
        difficultyGrowthRate: 0,
      };
    }

    // XP per hour
    const totalXP = sessions.reduce((sum, s) => sum + s.xpEarned, 0);
    const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0) / 60;
    const xpPerHour = totalHours > 0 ? Math.round(totalXP / totalHours) : 0;

    // Concepts per week
    const allConcepts = new Set(
      sessions.flatMap(s => s.conceptsMastered)
    ).size;
    const weeksActive = this.calculateWeeksActive(sessions);
    const conceptsPerWeek =
      weeksActive > 0 ? Math.round(allConcepts / weeksActive) : 0;

    // Difficulty growth rate
    const difficultyGrowthRate = this.calculateDifficultyGrowth(sessions);

    return {
      xpPerHour,
      conceptsPerWeek,
      difficultyGrowthRate: Math.round(difficultyGrowthRate * 100) / 100,
    };
  }

  /**
   * Calculate weeks active
   */
  private static calculateWeeksActive(sessions: SessionRecord[]): number {
    if (sessions.length === 0) return 0;

    const firstSession = sessions[0].startTime;
    const lastSession = sessions[sessions.length - 1].startTime;
    const daysDiff =
      (lastSession.getTime() - firstSession.getTime()) / (1000 * 60 * 60 * 24);

    return Math.max(Math.ceil(daysDiff / 7), 1);
  }

  /**
   * Calculate difficulty growth over time
   */
  private static calculateDifficultyGrowth(sessions: SessionRecord[]): number {
    if (sessions.length < 2) return 0;

    const first = sessions[0].difficulty;
    const last = sessions[sessions.length - 1].difficulty;

    return last - first;
  }

  /**
   * Analyze strengths and weaknesses
   */
  private static analyzeStrengthsWeaknesses(
    masteryData: MasteryLevel[]
  ): ProgressAnalytics['strengthsWeaknesses'] {
    // Top strengths (high mastery)
    const topStrengths = masteryData
      .filter(m => m.mastery >= MASTERY_THRESHOLD)
      .sort((a, b) => b.mastery - a.mastery)
      .slice(0, 5)
      .map(m => getNodeById(m.nodeId))
      .filter((node): node is KnowledgeNode => node !== undefined);

    // Critical weaknesses (low success rate)
    const criticalWeaknesses = masteryData
      .filter(m => m.successRate < 0.6)
      .sort((a, b) => a.successRate - b.successRate)
      .slice(0, 5)
      .map(m => {
        const node = getNodeById(m.nodeId);
        return {
          knowledgeNodeId: m.nodeId,
          nodeName: node?.name || 'Unknown',
          severity: m.successRate < 0.3 ? 'critical' : 'moderate',
          evidence: {
            attemptCount: m.attempts,
            successRate: m.successRate,
            avgTimeSpent: 0,
            lastAttemptDate: m.lastPracticed,
          },
          rootCause: m.attempts < 3 ? 'too_advanced' : 'concept_misunderstanding',
          remediation: {
            recommendedContent: [m.nodeId],
            estimatedTime: node?.estimatedTime || 30,
            priority: 10 - Math.floor(m.successRate * 10),
          },
        };
      }) as any[];

    // Improvement areas
    const improvementAreas = masteryData
      .filter(m => m.mastery > 0.3 && m.mastery < MASTERY_THRESHOLD)
      .map(m => {
        const node = getNodeById(m.nodeId);
        return node?.category || 'Unknown';
      })
      .filter((value, index, self) => self.indexOf(value) === index) // Unique
      .slice(0, 3);

    return {
      topStrengths,
      criticalWeaknesses,
      improvementAreas,
    };
  }

  /**
   * Generate predictions
   */
  private static generatePredictions(
    masteryData: MasteryLevel[],
    sessions: SessionRecord[],
    currentPath?: LearningPathway
  ): ProgressAnalytics['predictions'] {
    // Next milestone
    let nextMilestone: string | undefined;
    let estimatedAchievementDate: Date | undefined;

    if (currentPath) {
      const nextMilestoneObj = currentPath.milestones.find(m => !m.achieved);
      if (nextMilestoneObj) {
        nextMilestone = nextMilestoneObj.name;

        // Estimate based on current velocity
        const remainingSteps = currentPath.steps.filter(s => !s.completed);
        const avgSessionTime =
          sessions.length > 0
            ? sessions.reduce((sum, s) => sum + s.duration, 0) /
              sessions.length
            : 30;

        const remainingTime = remainingSteps.reduce(
          (sum, s) => sum + s.estimatedTime,
          0
        );
        const sessionsNeeded = Math.ceil(remainingTime / avgSessionTime);

        estimatedAchievementDate = new Date();
        estimatedAchievementDate.setDate(
          estimatedAchievementDate.getDate() + sessionsNeeded * 2 // Assume 3.5 sessions/week
        );
      }
    }

    // Recommended pace
    const recentSessions = sessions.slice(-5);
    const avgAccuracy =
      recentSessions.length > 0
        ? recentSessions.reduce((sum, s) => sum + s.performance.accuracy, 0) /
          recentSessions.length
        : 0.7;

    const recommendedPace: 'slower' | 'maintain' | 'faster' =
      avgAccuracy < 0.6 ? 'slower' : avgAccuracy > 0.85 ? 'faster' : 'maintain';

    // Risk level
    const riskLevel = this.calculateRiskLevel(masteryData, sessions);

    return {
      nextMilestone,
      estimatedAchievementDate,
      recommendedPace,
      riskLevel,
    };
  }

  /**
   * Calculate risk level
   */
  private static calculateRiskLevel(
    masteryData: MasteryLevel[],
    sessions: SessionRecord[]
  ): 'low' | 'medium' | 'high' {
    let riskScore = 0;

    // Factor 1: Low mastery rate
    const masteryRate =
      masteryData.filter(m => m.mastery >= MASTERY_THRESHOLD).length /
      masteryData.length;
    if (masteryRate < 0.3) riskScore += 3;
    else if (masteryRate < 0.5) riskScore += 1;

    // Factor 2: Declining performance
    const recentSessions = sessions.slice(-5);
    if (recentSessions.length >= 3) {
      const firstHalfAvg =
        recentSessions
          .slice(0, 2)
          .reduce((sum, s) => sum + s.performance.accuracy, 0) / 2;
      const secondHalfAvg =
        recentSessions
          .slice(2)
          .reduce((sum, s) => sum + s.performance.accuracy, 0) /
        (recentSessions.length - 2);

      if (secondHalfAvg < firstHalfAvg) riskScore += 2;
    }

    // Factor 3: Low engagement
    const avgSessionTime =
      sessions.length > 0
        ? sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length
        : 0;
    if (avgSessionTime < 15) riskScore += 2;

    if (riskScore >= 5) return 'high';
    if (riskScore >= 2) return 'medium';
    return 'low';
  }

  /**
   * Calculate time analytics
   */
  private static calculateTimeAnalytics(
    sessions: SessionRecord[]
  ): ProgressAnalytics['timeAnalytics'] {
    if (sessions.length === 0) {
      return {
        totalLearningTime: 0,
        avgSessionTime: 0,
        efficiencyScore: 0,
      };
    }

    const totalLearningTime = sessions.reduce((sum, s) => sum + s.duration, 0);
    const avgSessionTime = Math.round(totalLearningTime / sessions.length);

    // Efficiency score (XP per minute)
    const totalXP = sessions.reduce((sum, s) => sum + s.xpEarned, 0);
    const xpPerMinute = totalXP / totalLearningTime;
    const efficiencyScore = Math.min(Math.round(xpPerMinute * 10), 100);

    // Most productive time (future enhancement with timestamps)
    const mostProductiveTime = this.findMostProductiveTime(sessions);

    return {
      totalLearningTime,
      avgSessionTime,
      mostProductiveTime,
      efficiencyScore,
    };
  }

  /**
   * Find most productive time of day
   */
  private static findMostProductiveTime(
    sessions: SessionRecord[]
  ): 'morning' | 'afternoon' | 'evening' | undefined {
    const timeSlots = {
      morning: [] as number[], // 6-12
      afternoon: [] as number[], // 12-18
      evening: [] as number[], // 18-24
    };

    for (const session of sessions) {
      const hour = session.startTime.getHours();
      const accuracy = session.performance.accuracy;

      if (hour >= 6 && hour < 12) {
        timeSlots.morning.push(accuracy);
      } else if (hour >= 12 && hour < 18) {
        timeSlots.afternoon.push(accuracy);
      } else {
        timeSlots.evening.push(accuracy);
      }
    }

    // Calculate average accuracy per time slot
    const avgMorning =
      timeSlots.morning.length > 0
        ? timeSlots.morning.reduce((a, b) => a + b, 0) / timeSlots.morning.length
        : 0;
    const avgAfternoon =
      timeSlots.afternoon.length > 0
        ? timeSlots.afternoon.reduce((a, b) => a + b, 0) /
          timeSlots.afternoon.length
        : 0;
    const avgEvening =
      timeSlots.evening.length > 0
        ? timeSlots.evening.reduce((a, b) => a + b, 0) / timeSlots.evening.length
        : 0;

    if (avgMorning > avgAfternoon && avgMorning > avgEvening && avgMorning > 0) {
      return 'morning';
    } else if (avgAfternoon > avgEvening && avgAfternoon > 0) {
      return 'afternoon';
    } else if (avgEvening > 0) {
      return 'evening';
    }

    return undefined;
  }

  /**
   * Calculate category-wise progress for visualization
   */
  static getCategoryProgress(
    subject: Subject,
    masteryData: MasteryLevel[]
  ): Array<{ category: string; mastery: number; color: string }> {
    const allNodes = getNodesBySubject(subject);

    const categoryMap = new Map<string, { total: number; mastered: number }>();

    for (const node of allNodes) {
      const category = node.category.split(' > ')[0];
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { total: 0, mastered: 0 });
      }
      const stats = categoryMap.get(category)!;
      stats.total++;

      const mastery = masteryData.find(m => m.nodeId === node.id);
      if (mastery && mastery.mastery >= MASTERY_THRESHOLD) {
        stats.mastered++;
      }
    }

    return Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      mastery: Math.round((stats.mastered / stats.total) * 100),
      color: this.getCategoryColor(category),
    }));
  }
}
