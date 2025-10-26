// Unified Learning Report Generator
// Generates comprehensive learning reports across all phases

import Anthropic from '@anthropic-ai/sdk';
import { useAdaptiveLearning } from '../adaptive-learning/store';
import { useInteractiveLearning } from '../interactive-learning/store';
import { useVoiceTutor } from '../voice-tutor/store';
import { useUserStore } from '../gamification/store';
import { UnifiedLearningReport } from './types';
import { Subject } from '../adaptive-learning/types';

// Server-side only - will be null in browser
const anthropic = typeof window === 'undefined'
  ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY!,
    })
  : null;

export class UnifiedReportGenerator {
  /**
   * Generate complete learning report for a time period
   */
  async generateReport(
    userId: string,
    periodDays: number = 7
  ): Promise<UnifiedLearningReport> {
    const now = new Date();
    const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

    // Gather data from all stores
    const gamificationProfile = useUserStore.getState().profile;
    const adaptiveProfile = useAdaptiveLearning.getState().profile;
    const interactiveState = useInteractiveLearning.getState();
    const voiceState = useVoiceTutor.getState();

    // Filter data for period
    const periodQuizResults = interactiveState.quizResults.filter(
      r => new Date(r.completedAt) >= startDate
    );
    const periodVoiceSessions = voiceState.sessions.filter(
      s => new Date(s.startTime) >= startDate
    );

    // Calculate statistics
    const report: UnifiedLearningReport = {
      userId,
      period: { start: startDate, end: now },
      generatedAt: now,

      // Phase 7: Gamification
      gamification: {
        totalXP: gamificationProfile?.points.totalXP || 0,
        level: gamificationProfile?.points.level || 1,
        achievements: gamificationProfile?.achievements || [],
        currentStreak: gamificationProfile?.streak.currentStreak || 0,
        longestStreak: gamificationProfile?.streak.longestStreak || 0,
        totalStudyTime: gamificationProfile?.totalStudyTime || 0,
      },

      // Phase 8: Adaptive Learning
      adaptiveLearning: {
        currentAbility: adaptiveProfile?.currentAbility || {
          math: { currentLevel: 5, confidence: 0.5, learningRate: 1.0, retentionRate: 0.8, lastUpdated: now },
          english: { currentLevel: 5, confidence: 0.5, learningRate: 1.0, retentionRate: 0.8, lastUpdated: now },
        },
        weaknesses: adaptiveProfile?.diagnosis.weaknesses || [],
        recommendations: adaptiveProfile?.diagnosis.recommendations || [],
        sessionsCompleted: adaptiveProfile?.history.sessions.length || 0,
      },

      // Phase 9: Interactive Learning
      interactiveLearning: {
        quizzes: this.calculateQuizStats(periodQuizResults),
        flashcards: this.calculateFlashcardStats(interactiveState.flashcards),
        challenges: {
          total: interactiveState.challenges.length,
          completed: interactiveState.challenges.filter(c => c.status === 'completed').length,
          active: interactiveState.challenges.filter(c => c.status === 'active').length,
        },
        notes: {
          total: interactiveState.notes.length,
          bySubject: {
            math: interactiveState.notes.filter(n => n.subject === 'math').length,
            english: interactiveState.notes.filter(n => n.subject === 'english').length,
          },
        },
      },

      // Phase 10: Voice Tutor
      voiceTutor: this.calculateVoiceStats(periodVoiceSessions),

      // AI-generated insights
      insights: {
        strongestSkills: [],
        areasToImprove: [],
        learningStyle: {
          preferredMode: this.detectPreferredMode(periodQuizResults.length, periodVoiceSessions.length),
          bestTimeOfDay: 'Not enough data',
          avgSessionLength: this.calculateAvgSessionLength(periodVoiceSessions),
        },
        progressEstimate: {
          overall: 0,
          math: 0,
          english: 0,
        },
        nextSteps: [],
      },
    };

    // Generate AI insights
    report.insights = await this.generateAIInsights(report);

    return report;
  }

  /**
   * Calculate quiz statistics
   */
  private calculateQuizStats(quizResults: any[]) {
    if (quizResults.length === 0) {
      return {
        total: 0,
        avgScore: 0,
        avgTimePerQuestion: 0,
        byDifficulty: { 1: { taken: 0, avgScore: 0 }, 2: { taken: 0, avgScore: 0 }, 3: { taken: 0, avgScore: 0 }, 4: { taken: 0, avgScore: 0 }, 5: { taken: 0, avgScore: 0 } },
      };
    }

    const avgScore = quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length;
    const totalTime = quizResults.reduce((sum, r) => r.answers.reduce((s: number, a: any) => s + a.timeSpent, 0), 0);
    const totalQuestions = quizResults.reduce((sum, r) => r.answers.length, 0);

    const byDifficulty: any = {};
    for (let diff = 1; diff <= 5; diff++) {
      const diffQuizzes = quizResults.filter(r => r.difficulty === diff);
      byDifficulty[diff] = {
        taken: diffQuizzes.length,
        avgScore: diffQuizzes.length > 0 ? diffQuizzes.reduce((s, r) => s + r.score, 0) / diffQuizzes.length : 0,
      };
    }

    return {
      total: quizResults.length,
      avgScore,
      avgTimePerQuestion: totalQuestions > 0 ? totalTime / totalQuestions : 0,
      byDifficulty,
    };
  }

  /**
   * Calculate flashcard statistics
   */
  private calculateFlashcardStats(flashcards: any[]) {
    const now = new Date();
    const dueToday = flashcards.filter(f => new Date(f.nextReview) <= now).length;

    const masteryDist = {
      learning: flashcards.filter(f => f.repetitions < 2).length,
      reviewing: flashcards.filter(f => f.repetitions >= 2 && f.repetitions < 5).length,
      mastered: flashcards.filter(f => f.repetitions >= 5).length,
    };

    const avgRetention = flashcards.length > 0
      ? flashcards.reduce((sum, f) => sum + (f.easeFactor - 1.3) / 1.5, 0) / flashcards.length
      : 0;

    return {
      total: flashcards.length,
      avgRetention: Math.min(1, Math.max(0, avgRetention)),
      dueToday,
      masteryDistribution: masteryDist,
    };
  }

  /**
   * Calculate voice tutor statistics
   */
  private calculateVoiceStats(sessions: any[]) {
    const englishSessions = sessions.filter(s => s.subject === 'english');
    const mathSessions = sessions.filter(s => s.subject === 'math');

    const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0) / 60; // Convert to minutes

    return {
      totalSessions: sessions.length,
      totalTime,
      english: {
        sessions: englishSessions.length,
        avgGrammarScore: englishSessions.length > 0
          ? englishSessions.reduce((sum, s) => {
              const scores = s.messages.filter((m: any) => m.feedback?.score).map((m: any) => m.feedback.score);
              return sum + (scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 50);
            }, 0) / englishSessions.length
          : 0,
        totalCorrections: englishSessions.reduce((sum, s) => sum + (s.grammarCorrections?.length || 0), 0),
        avgVocabularyLevel: 'intermediate' as const,
      },
      math: {
        sessions: mathSessions.length,
        problemsSolved: mathSessions.reduce((sum, s) => sum + (s.problemsSolved || 0), 0),
        problemsAttempted: mathSessions.reduce((sum, s) => sum + (s.problemsAttempted || 0), 0),
        avgHintsUsed: mathSessions.length > 0
          ? mathSessions.reduce((sum, s) => sum + (s.hintsGiven || 0), 0) / mathSessions.length
          : 0,
        solvingRate: 0,
      },
    };
  }

  /**
   * Detect preferred learning mode
   */
  private detectPreferredMode(quizCount: number, voiceCount: number): 'quiz' | 'flashcard' | 'voice' {
    if (voiceCount > quizCount) return 'voice';
    if (quizCount > 0) return 'quiz';
    return 'flashcard';
  }

  /**
   * Calculate average session length
   */
  private calculateAvgSessionLength(sessions: any[]): number {
    if (sessions.length === 0) return 0;
    return sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length / 60; // minutes
  }

  /**
   * Generate AI insights using Claude
   */
  private async generateAIInsights(report: UnifiedLearningReport): Promise<UnifiedLearningReport['insights']> {
    const prompt = `Analyze this student's learning data and provide insights.

Data Summary:
- Level: ${report.gamification.level}
- Total XP: ${report.gamification.totalXP}
- Streak: ${report.gamification.currentStreak} days
- Quizzes: ${report.interactiveLearning.quizzes.total} (avg score: ${Math.round(report.interactiveLearning.quizzes.avgScore)}%)
- Voice Sessions: ${report.voiceTutor.totalSessions} (${Math.round(report.voiceTutor.totalTime)} min)
- Weaknesses: ${report.adaptiveLearning.weaknesses.length}

Provide:
1. Top 3 strongest skills
2. Top 3 areas to improve (with priority)
3. Progress estimate (0-100%) for math and english
4. 3-5 concrete next steps

Return ONLY JSON:
{
  "strongestSkills": [{"subject": "math", "topic": "algebra", "masteryLevel": 85}],
  "areasToImprove": [{"subject": "english", "topic": "grammar", "priority": "high", "suggestedAction": "practice"}],
  "progressEstimate": {"overall": 65, "math": 70, "english": 60},
  "nextSteps": ["action 1", "action 2"]
}`;

    try {
      if (!anthropic) {
        throw new Error('AI insights generation is only available server-side');
      }

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      });

      const textContent = response.content.find((c) => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content');
      }

      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found');
      }

      const insights = JSON.parse(jsonMatch[0]);

      return {
        strongestSkills: insights.strongestSkills || [],
        areasToImprove: insights.areasToImprove || [],
        learningStyle: report.insights.learningStyle,
        progressEstimate: insights.progressEstimate || { overall: 0, math: 0, english: 0 },
        nextSteps: insights.nextSteps || [],
      };
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      return report.insights; // Return default insights
    }
  }
}

export const unifiedReportGenerator = new UnifiedReportGenerator();
