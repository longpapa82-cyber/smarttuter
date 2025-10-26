// Phase 8: Learning Path Generator
// Based on optimal path algorithms and prerequisite chains

import {
  LearningPathway,
  PathStep,
  Milestone,
  MasteryLevel,
  Weakness,
  Subject,
  GradeLevel,
  KnowledgeNode,
} from './types';
import {
  getNodesBySubject,
  getNodesByGradeLevel,
  getNodeById,
  getPrerequisites,
  getDependents,
} from './knowledge-graph';

export class PathGenerator {
  /**
   * Generate personalized learning path
   * Considers: current mastery, weaknesses, grade level, goals
   */
  static generatePath(
    subject: Subject,
    gradeLevel: GradeLevel,
    currentMastery: MasteryLevel[],
    weaknesses: Weakness[],
    goal?: string
  ): LearningPathway {
    // Get all relevant nodes
    const subjectNodes = getNodesBySubject(subject);
    const gradeLevelNodes = getNodesByGradeLevel(gradeLevel);
    const relevantNodes = subjectNodes.filter(node =>
      gradeLevelNodes.includes(node)
    );

    // Identify unmastered nodes
    const masteredNodeIds = new Set(
      currentMastery
        .filter(m => m.mastery >= 0.8)
        .map(m => m.nodeId)
    );

    const unmasteredNodes = relevantNodes.filter(
      node => !masteredNodeIds.has(node.id)
    );

    // Prioritize weak nodes
    const weakNodeIds = new Set(weaknesses.map(w => w.knowledgeNodeId));
    const weakNodes = unmasteredNodes.filter(node => weakNodeIds.has(node.id));

    // Build optimal sequence
    const pathNodes = this.buildOptimalSequence(
      weakNodes.length > 0 ? weakNodes : unmasteredNodes,
      currentMastery
    );

    // Create path steps
    const steps: PathStep[] = pathNodes.map((node, index) => ({
      id: `step-${node.id}`,
      nodeId: node.id,
      nodeName: node.name,
      difficulty: node.difficulty,
      estimatedTime: node.estimatedTime,
      completed: false,
      masteryAchieved: false,
      order: index,
    }));

    // Create milestones
    const milestones = this.createMilestones(pathNodes, subject);

    // Calculate total time
    const estimatedCompletion = pathNodes.reduce(
      (sum, node) => sum + node.estimatedTime,
      0
    );

    return {
      id: `pathway-${Date.now()}`,
      name: goal || `${subject === 'math' ? '수학' : '영어'} 학습 경로`,
      subject,
      goal: goal || '학년 수준 숙달',
      steps,
      estimatedCompletion,
      milestones,
      createdAt: new Date(),
      status: 'active',
      progress: 0,
    };
  }

  /**
   * Build optimal learning sequence
   * Ensures prerequisites are met and cognitive load is minimized
   */
  private static buildOptimalSequence(
    nodes: KnowledgeNode[],
    currentMastery: MasteryLevel[]
  ): KnowledgeNode[] {
    const sequence: KnowledgeNode[] = [];
    const visited = new Set<string>();
    const masteredIds = new Set(
      currentMastery.filter(m => m.mastery >= 0.8).map(m => m.nodeId)
    );

    // Topological sort with difficulty consideration
    const queue = [...nodes].sort((a, b) => {
      // Prioritize by difficulty (easier first)
      if (a.difficulty !== b.difficulty) {
        return a.difficulty - b.difficulty;
      }
      // Then by prerequisite count (fewer prerequisites first)
      return a.prerequisites.length - b.prerequisites.length;
    });

    for (const node of queue) {
      this.addNodeWithPrerequisites(
        node,
        sequence,
        visited,
        masteredIds
      );
    }

    return sequence;
  }

  /**
   * Recursively add node and its prerequisites
   */
  private static addNodeWithPrerequisites(
    node: KnowledgeNode,
    sequence: KnowledgeNode[],
    visited: Set<string>,
    masteredIds: Set<string>
  ): void {
    if (visited.has(node.id)) return;
    visited.add(node.id);

    // Add prerequisites first
    const prerequisites = getPrerequisites(node.id);
    for (const prereq of prerequisites) {
      if (!masteredIds.has(prereq.id)) {
        this.addNodeWithPrerequisites(
          prereq,
          sequence,
          visited,
          masteredIds
        );
      }
    }

    // Add current node
    if (!sequence.find(n => n.id === node.id)) {
      sequence.push(node);
    }
  }

  /**
   * Create milestones for path
   */
  private static createMilestones(
    pathNodes: KnowledgeNode[],
    subject: Subject
  ): Milestone[] {
    const milestones: Milestone[] = [];
    const totalNodes = pathNodes.length;

    // Milestone at 25%
    if (totalNodes >= 4) {
      const quarterIndex = Math.floor(totalNodes * 0.25);
      milestones.push({
        id: `milestone-25-${Date.now()}`,
        name: '기초 완성',
        description: `${pathNodes[quarterIndex].name} 숙달`,
        achieved: false,
        xpReward: 100,
      });
    }

    // Milestone at 50%
    if (totalNodes >= 2) {
      const halfIndex = Math.floor(totalNodes * 0.5);
      milestones.push({
        id: `milestone-50-${Date.now()}`,
        name: '중간 달성',
        description: `${pathNodes[halfIndex].name} 숙달`,
        achieved: false,
        xpReward: 200,
      });
    }

    // Milestone at 75%
    if (totalNodes >= 4) {
      const threeQuarterIndex = Math.floor(totalNodes * 0.75);
      milestones.push({
        id: `milestone-75-${Date.now()}`,
        name: '거의 완성',
        description: `${pathNodes[threeQuarterIndex].name} 숙달`,
        achieved: false,
        xpReward: 300,
      });
    }

    // Final milestone
    milestones.push({
      id: `milestone-100-${Date.now()}`,
      name: '학습 경로 완료',
      description: `${subject === 'math' ? '수학' : '영어'} 학습 경로 완료!`,
      achieved: false,
      xpReward: 500,
    });

    return milestones;
  }

  /**
   * Generate weakness-focused remediation path
   */
  static generateRemediationPath(
    weakness: Weakness,
    currentMastery: MasteryLevel[]
  ): LearningPathway {
    const weakNode = getNodeById(weakness.knowledgeNodeId);
    if (!weakNode) {
      throw new Error('Weakness node not found');
    }

    // Get prerequisites chain
    const prerequisites = getPrerequisites(weakNode.id);

    // Include prerequisites that aren't mastered
    const masteredIds = new Set(
      currentMastery.filter(m => m.mastery >= 0.8).map(m => m.nodeId)
    );

    const pathNodes = [
      ...prerequisites.filter(p => !masteredIds.has(p.id)),
      weakNode,
    ];

    // Create steps
    const steps: PathStep[] = pathNodes.map((node, index) => ({
      id: `step-${node.id}`,
      nodeId: node.id,
      nodeName: node.name,
      difficulty: node.difficulty,
      estimatedTime: node.estimatedTime * 1.5, // Extra time for review
      completed: false,
      masteryAchieved: false,
      order: index,
    }));

    return {
      id: `remediation-${Date.now()}`,
      name: `${weakness.nodeName} 집중 복습`,
      subject: weakNode.subject,
      goal: `${weakness.nodeName} 약점 극복`,
      steps,
      estimatedCompletion: steps.reduce((sum, s) => sum + s.estimatedTime, 0),
      milestones: [
        {
          id: `milestone-remediation-${Date.now()}`,
          name: '약점 극복',
          description: `${weakness.nodeName} 숙달 달성`,
          achieved: false,
          xpReward: 150,
        },
      ],
      createdAt: new Date(),
      status: 'active',
      progress: 0,
    };
  }

  /**
   * Generate quick review path for maintaining mastery
   */
  static generateReviewPath(
    subject: Subject,
    currentMastery: MasteryLevel[]
  ): LearningPathway {
    // Find nodes that need review (mastered but long time ago)
    const needsReview = currentMastery.filter(m => m.needsReview);

    const reviewNodes = needsReview
      .map(m => getNodeById(m.nodeId))
      .filter((node): node is KnowledgeNode => node !== undefined)
      .slice(0, 5); // Max 5 review items

    const steps: PathStep[] = reviewNodes.map((node, index) => ({
      id: `step-${node.id}`,
      nodeId: node.id,
      nodeName: node.name,
      difficulty: node.difficulty,
      estimatedTime: Math.floor(node.estimatedTime * 0.5), // Quicker review
      completed: false,
      masteryAchieved: false,
      order: index,
    }));

    return {
      id: `review-${Date.now()}`,
      name: '복습 경로',
      subject,
      goal: '이전 학습 내용 복습',
      steps,
      estimatedCompletion: steps.reduce((sum, s) => sum + s.estimatedTime, 0),
      milestones: [
        {
          id: `milestone-review-${Date.now()}`,
          name: '복습 완료',
          description: '모든 복습 항목 완료',
          achieved: false,
          xpReward: 100,
        },
      ],
      createdAt: new Date(),
      status: 'active',
      progress: 0,
    };
  }

  /**
   * Get next recommended node based on current progress
   */
  static getNextRecommendation(
    pathway: LearningPathway,
    currentMastery: MasteryLevel[]
  ): KnowledgeNode | null {
    // Find first incomplete step
    const nextStep = pathway.steps.find(step => !step.completed);
    if (!nextStep) return null;

    const node = getNodeById(nextStep.nodeId);
    return node || null;
  }

  /**
   * Estimate completion date based on learning velocity
   */
  static estimateCompletion(
    pathway: LearningPathway,
    avgSessionTime: number
  ): Date {
    const remainingTime = pathway.steps
      .filter(s => !s.completed)
      .reduce((sum, s) => sum + s.estimatedTime, 0);

    const sessionsNeeded = Math.ceil(remainingTime / avgSessionTime);

    // Assume 3 sessions per week
    const weeksNeeded = Math.ceil(sessionsNeeded / 3);

    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + weeksNeeded * 7);

    return completionDate;
  }
}
