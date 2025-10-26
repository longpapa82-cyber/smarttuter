// Unified Learning Integration Service
// Connects Phase 8 (Adaptive), Phase 9 (Interactive), Phase 10 (Voice)

import { useAdaptiveLearning } from '../adaptive-learning/store';
import { useInteractiveLearning } from '../interactive-learning/store';
import { useVoiceTutor } from '../voice-tutor/store';
import { useUserStore } from '../gamification/store';
import { Subject, DifficultyLevel } from '../adaptive-learning/types';
import { QuizResult } from '../interactive-learning/types';
import { VoiceTutorSession } from '../voice-tutor/types';
import {
  IntegrationEvent,
  QuizCompletedEvent,
  VoiceSessionEndedEvent,
  IntegrationConfig,
  DEFAULT_INTEGRATION_CONFIG,
} from './types';

/**
 * Integration Service - Central hub for cross-phase coordination
 *
 * Responsibilities:
 * 1. Listen to events from Phase 9 (quiz, flashcard) and Phase 10 (voice)
 * 2. Update Phase 8 (adaptive learning) based on performance
 * 3. Trigger content generation based on weaknesses
 * 4. Coordinate difficulty adjustments
 */
export class LearningIntegrationService {
  private config: IntegrationConfig = DEFAULT_INTEGRATION_CONFIG;
  private eventQueue: IntegrationEvent[] = [];

  // ============================================================================
  // Quiz Integration (Phase 9 → Phase 8)
  // ============================================================================

  /**
   * Process quiz completion and update adaptive learning profile
   */
  async onQuizCompleted(quizResult: QuizResult, quiz?: { subject: Subject; difficulty: DifficultyLevel; title: string }): Promise<void> {
    if (!quiz) {
      console.warn('[Integration] Quiz metadata not provided');
      return;
    }

    const adaptiveLearning = useAdaptiveLearning.getState();

    // 1. Record session in Phase 8
    const sessionId = adaptiveLearning.startSession(
      quiz.subject,
      quiz.difficulty
    );

    // Calculate performance metrics
    const correctAnswers = quizResult.answers.filter(a => a.isCorrect).length;
    const totalQuestions = quizResult.answers.length;
    const accuracy = correctAnswers / totalQuestions;
    const avgTimePerQuestion =
      quizResult.answers.reduce((sum, a) => sum + a.timeSpent, 0) / totalQuestions;

    // 2. End session with performance data
    adaptiveLearning.endSession(sessionId, {
      xpEarned: quizResult.xpEarned,
      performance: {
        accuracy,
        responseTime: avgTimePerQuestion,
        hintsUsed: 0,
        
        skipped: 0, // QuizAnswer doesn't track skipped
      },
      topicsCovered: [quiz.title],
      conceptsMastered: quizResult.answers
        .filter(a => a.isCorrect)
        .map(a => a.questionId),
      weaknessesIdentified: quizResult.answers
        .filter(a => !a.isCorrect)
        .map(a => a.questionId),
    });

    // 3. Update mastery for each question
    for (const answer of quizResult.answers) {
      if (true) {
        adaptiveLearning.updateMastery(
          answer.questionId,
          answer.isCorrect,
          answer.timeSpent
        );

        // 4. Record interaction
        adaptiveLearning.recordInteraction({
          timestamp: new Date(),
          type: 'answer',
          knowledgeNodeId: answer.questionId,
          difficulty: quiz.difficulty,
          success: answer.isCorrect,
          timeSpent: answer.timeSpent,
          metadata: {
            subject: quiz.subject,
            quizTitle: quiz.title,
          },
        });
      }
    }

    // 5. Detect weaknesses and add alerts
    await this.detectWeaknessesFromQuiz(quizResult, quiz);

    // 6. Check if difficulty should be adjusted
    this.adjustDifficultyIfNeeded(quiz.subject);
  }

  /**
   * Detect weaknesses from quiz performance
   */
  private async detectWeaknessesFromQuiz(
    quizResult: QuizResult,
    quiz: { subject: Subject; difficulty: DifficultyLevel; title: string }
  ): Promise<void> {
    const adaptiveLearning = useAdaptiveLearning.getState();
    const incorrectAnswers = quizResult.answers.filter(a => !a.isCorrect);

    for (const answer of incorrectAnswers) {
      // Check if this is a repeated failure
      const mastery = adaptiveLearning.getMasteryLevel(answer.questionId);
      const consecutiveFailures = mastery
        ? mastery.attempts - mastery.successRate * mastery.attempts
        : 1;

      if (
        consecutiveFailures >= this.config.weaknessDetection.consecutiveFailuresRequired ||
        (mastery && mastery.successRate <= this.config.weaknessDetection.quizFailureThreshold)
      ) {
        // Add as weakness
        adaptiveLearning.addWeakness({
          knowledgeNodeId: answer.questionId,
          nodeName: quiz.title,
          severity: this.calculateSeverity(mastery?.successRate || 0),
          evidence: {
            attemptCount: mastery?.attempts || 1,
            successRate: mastery?.successRate || 0,
            avgTimeSpent: answer.timeSpent,
            lastAttemptDate: new Date(),
          },
          rootCause: (mastery?.successRate ?? 0) < 0.3 ? 'concept_misunderstanding' : 'practice_needed',
          remediation: {
            recommendedContent: ['Review fundamentals', 'Practice similar problems'],
            estimatedTime: 30,
            priority: (mastery?.successRate ?? 0) < 0.3 ? 10 : 5,
            prerequisites: [],
          },
        });

        // Add alert if severity is high
        if (mastery && mastery.successRate < 0.3) {
          adaptiveLearning.addAlert({
            id: `alert-${Date.now()}-${answer.questionId}`,
            type: 'performance',
            severity: 'high',
            message: `Struggling with ${quiz.title}: You've answered incorrectly ${Math.floor(
              consecutiveFailures
            )} times. Let's practice this concept more.`,
            recommendedActions: [
              {
                id: `action-${Date.now()}`,
                type: 'review_basics',
                description: `Review fundamentals and practice ${quiz.title}`,
                priority: 10,
              },
            ],
            createdAt: new Date(),
            dismissed: false,
          });

          // Auto-generate flashcard if enabled
          if (this.config.autoGenerateFlashcards) {
            // This will be implemented in content-generator.ts
            console.log(
              `[Integration] Auto-generating flashcard for weakness: ${answer.questionId}`
            );
          }
        }
      }
    }
  }

  /**
   * Calculate weakness severity based on success rate
   */
  private calculateSeverity(successRate: number): 'minor' | 'moderate' | 'critical' {
    if (successRate < 0.4) return 'critical';
    if (successRate < 0.7) return 'moderate';
    return 'minor';
  }

  // ============================================================================
  // Voice Session Integration (Phase 10 → Phase 8)
  // ============================================================================

  /**
   * Process voice session completion and update adaptive learning
   */
  async onVoiceSessionEnded(session: VoiceTutorSession): Promise<void> {
    const adaptiveLearning = useAdaptiveLearning.getState();

    // 1. Record session
    const sessionId = adaptiveLearning.startSession(
      session.subject as Subject,
      2 as DifficultyLevel // Default difficulty for voice sessions
    );

    // Calculate performance based on subject
    let performance = 0;
    if (session.subject === 'english') {
      // Average grammar score from messages with feedback
      const grammarScores = session.messages
        .filter(m => m.feedback && m.feedback.score !== undefined)
        .map(m => m.feedback!.score!);

      performance = grammarScores.length > 0
        ? grammarScores.reduce((sum, score) => sum + score, 0) / grammarScores.length / 100
        : 0.5;
    } else if (session.subject === 'math') {
      // Problem solving rate (estimate from messages)
      const solved = session.problemsSolved || 0;
      const totalMessages = session.messages.length;
      // Estimate: assume 1 problem per 5 messages
      const estimatedAttempted = Math.ceil(totalMessages / 5);
      performance = estimatedAttempted > 0 ? solved / estimatedAttempted : 0.5;
    }

    // 2. End session with performance
    adaptiveLearning.endSession(sessionId, {
      duration: Math.floor(session.duration / 60), // Convert seconds to minutes
      xpEarned: session.xpEarned,
      performance: {
        accuracy: performance,
        responseTime: session.duration / session.messages.length,
        hintsUsed: session.hintsGiven || 0,
        
        skipped: 0,
      },
      topicsCovered: session.subject === 'math' ? ['problem-solving'] : ['conversation'],
      conceptsMastered: [],
      weaknessesIdentified: [],
    });

    // 3. Record interaction
    adaptiveLearning.recordInteraction({
      timestamp: session.endTime || new Date(),
      type: 'complete',
      knowledgeNodeId: session.subject === 'math' ? 'math-problem-solving' : 'english-conversation',
      difficulty: 2 as DifficultyLevel,
      success: performance > 0.6,
      timeSpent: session.duration,
      metadata: {
        subject: session.subject,
        sessionType: 'voice-tutor',
        messageCount: session.messages.length,
      },
    });

    // 4. Detect weaknesses from voice session
    if (session.subject === 'english' && session.grammarCorrections) {
      await this.detectWeaknessesFromVoiceSession(session);
    }

    // 5. Adjust difficulty
    this.adjustDifficultyIfNeeded(session.subject as Subject);
  }

  /**
   * Detect weaknesses from voice session
   */
  private async detectWeaknessesFromVoiceSession(
    session: VoiceTutorSession
  ): Promise<void> {
    const adaptiveLearning = useAdaptiveLearning.getState();

    // TODO: Implement grammar correction weakness detection once GrammarCorrection type is defined
    console.log('[Integration] Voice session weakness detection - to be implemented');
  }

  // ============================================================================
  // Difficulty Adjustment
  // ============================================================================

  /**
   * Check recent performance and adjust difficulty if needed
   */
  private adjustDifficultyIfNeeded(subject: Subject): void {
    const adaptiveLearning = useAdaptiveLearning.getState();
    const profile = adaptiveLearning.profile;

    if (!profile) return;

    const recentSessions = profile.history.sessions
      .filter(s => s.subject === subject)
      .slice(-this.config.difficultyAdjustment.minSessionsRequired);

    if (recentSessions.length < this.config.difficultyAdjustment.minSessionsRequired) {
      return; // Not enough data
    }

    const avgAccuracy =
      recentSessions.reduce((sum, s) => sum + s.performance.accuracy, 0) /
      recentSessions.length;

    const currentDifficulty = adaptiveLearning.getCurrentDifficulty(subject);

    // Adjust difficulty based on performance
    if (avgAccuracy > this.config.difficultyAdjustment.increaseThreshold) {
      // Increase difficulty
      const newDifficulty = Math.min(5, currentDifficulty + 1) as DifficultyLevel;
      adaptiveLearning.setDifficulty(subject, newDifficulty);

      adaptiveLearning.addRecommendation({
        id: `rec-difficulty-up-${Date.now()}`,
        type: 'difficulty',
        title: `Great progress in ${subject}!`,
        description: `Your accuracy is ${Math.round(avgAccuracy * 100)}%. Let's try harder questions.`,
        confidence: 0.85,
        action: {
          type: 'increase_difficulty',
          params: { subject, newDifficulty },
        },
        reasoning: `Based on ${avgAccuracy * 100}% accuracy over recent sessions`,
        expectedBenefit: `Improved challenge level and faster mastery progression`,
      });
    } else if (avgAccuracy < this.config.difficultyAdjustment.decreaseThreshold) {
      // Decrease difficulty
      const newDifficulty = Math.max(1, currentDifficulty - 1) as DifficultyLevel;
      adaptiveLearning.setDifficulty(subject, newDifficulty);

      adaptiveLearning.addRecommendation({
        id: `rec-difficulty-down-${Date.now()}`,
        type: 'difficulty',
        title: `Let's adjust ${subject} difficulty`,
        description: `Your accuracy is ${Math.round(avgAccuracy * 100)}%. Let's practice at an easier level first.`,
        confidence: 0.9,
        action: {
          type: 'decrease_difficulty',
          params: { subject, newDifficulty },
        },
        reasoning: `Accuracy below ${this.config.difficultyAdjustment.decreaseThreshold * 100}% threshold indicates difficulty too high`,
        expectedBenefit: `Build confidence and foundational understanding before advancing`,
      });
    }
  }

  // ============================================================================
  // Flashcard Integration (Phase 9 → Phase 8)
  // ============================================================================

  /**
   * Update mastery when flashcard is reviewed
   */
  onFlashcardReviewed(flashcardId: string, quality: 0 | 1 | 2 | 3 | 4 | 5, responseTime: number): void {
    const interactiveLearning = useInteractiveLearning.getState();
    const flashcard = interactiveLearning.flashcards.find(f => f.id === flashcardId);

    if (!flashcard) return;

    const adaptiveLearning = useAdaptiveLearning.getState();

    // Quality >= 3 means success
    const success = quality >= 3;

    // Update mastery
    adaptiveLearning.updateMastery(flashcard.knowledgeNodeId, success, responseTime);

    // Record interaction
    adaptiveLearning.recordInteraction({
      timestamp: new Date(),
      type: 'answer',
      knowledgeNodeId: flashcard.knowledgeNodeId,
      difficulty: flashcard.difficulty,
      success,
      timeSpent: responseTime,
      metadata: {
        subject: flashcard.subject,
        reviewType: 'flashcard',
        quality,
      },
    });

    // Remove weakness if mastered
    if (quality === 5) {
      adaptiveLearning.removeWeakness(flashcard.knowledgeNodeId);
    }
  }

  // ============================================================================
  // Configuration
  // ============================================================================

  setConfig(config: Partial<IntegrationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): IntegrationConfig {
    return { ...this.config };
  }
}

// Singleton instance
export const learningIntegrationService = new LearningIntegrationService();
