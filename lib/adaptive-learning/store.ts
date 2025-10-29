// Phase 8: Adaptive Learning Zustand Store

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AdaptiveLearningProfile,
  Subject,
  GradeLevel,
  SessionRecord,
  InteractionLog,
  Weakness,
  LearningPathway,
  Alert,
  Recommendation,
  DifficultyLevel,
  MasteryLevel,
  AbilityScore,
} from './types';

interface AdaptiveLearningStore {
  profile: AdaptiveLearningProfile | null;

  // Initialization
  initializeProfile: (userId: string, gradeLevel: GradeLevel) => void;
  resetProfile: () => void;

  // Session Management
  startSession: (subject: Subject, difficulty: DifficultyLevel) => string;
  endSession: (sessionId: string, performance: Partial<SessionRecord>) => void;
  recordInteraction: (interaction: InteractionLog) => void;

  // Knowledge State
  updateMastery: (nodeId: string, success: boolean, timeSpent: number) => void;
  getMasteryLevel: (nodeId: string) => MasteryLevel | undefined;

  // Difficulty Management
  getCurrentDifficulty: (subject: Subject) => DifficultyLevel;
  setDifficulty: (subject: Subject, difficulty: DifficultyLevel) => void;

  // Learning Path
  setCurrentPath: (pathway: LearningPathway) => void;
  updatePathProgress: (stepId: string, completed: boolean) => void;
  addRecommendedPath: (pathway: LearningPathway) => void;

  // Diagnosis
  addWeakness: (weakness: Weakness) => void;
  removeWeakness: (nodeId: string) => void;
  addAlert: (alert: Alert) => void;
  dismissAlert: (alertId: string) => void;
  addRecommendation: (recommendation: Recommendation) => void;

  // Settings
  updateSettings: (settings: Partial<AdaptiveLearningProfile['settings']>) => void;
}

const initialAbilityScore: AbilityScore = {
  currentLevel: 5,
  confidence: 0.5,
  learningRate: 1.0,
  retentionRate: 0.8,
  lastUpdated: new Date(),
};

export const useAdaptiveLearning = create<AdaptiveLearningStore>()(
  persist(
    (set, get) => ({
      profile: null,

      initializeProfile: (userId: string, gradeLevel: GradeLevel) => {
        const now = new Date();
        set({
          profile: {
            userId,
            gradeLevel,
            createdAt: now,
            lastUpdated: now,
            currentAbility: {
              math: { ...initialAbilityScore },
              english: { ...initialAbilityScore },
            },
            history: {
              sessions: [],
              performance: [],
              interactions: [],
            },
            knowledgeState: {
              masteredNodes: [],
              inProgressNodes: [],
              weakNodes: [],
            },
            learningPath: {
              recommended: [],
              completed: [],
            },
            diagnosis: {
              lastUpdate: now,
              weaknesses: [],
              alerts: [],
              recommendations: [],
            },
            settings: {
              preferredSessionLength: 30,
              learningGoals: [],
              adaptiveMode: true,
            },
          },
        });
      },

      resetProfile: () => set({ profile: null }),

      startSession: (subject: Subject, difficulty: DifficultyLevel) => {
        const profile = get().profile;
        if (!profile) return '';

        const sessionId = `session-${Date.now()}`;
        const newSession: SessionRecord = {
          id: sessionId,
          subject,
          startTime: new Date(),
          endTime: new Date(), // Will be updated on end
          duration: 0,
          messageCount: 0,
          difficulty,
          xpEarned: 0,
          performance: {
            accuracy: 0,
            responseTime: 0,
            hintsUsed: 0,
            skipped: 0,
          },
          topicsCovered: [],
          conceptsMastered: [],
          weaknessesIdentified: [],
        };

        set({
          profile: {
            ...profile,
            history: {
              ...profile.history,
              sessions: [...profile.history.sessions, newSession],
            },
            lastUpdated: new Date(),
          },
        });

        return sessionId;
      },

      endSession: (sessionId: string, performance: Partial<SessionRecord>) => {
        const profile = get().profile;
        if (!profile) return;

        const sessions = profile.history.sessions.map(session =>
          session.id === sessionId
            ? {
                ...session,
                ...performance,
                endTime: new Date(),
                duration: Math.round(
                  (new Date().getTime() - session.startTime.getTime()) / 60000
                ),
              }
            : session
        );

        set({
          profile: {
            ...profile,
            history: {
              ...profile.history,
              sessions,
            },
            lastUpdated: new Date(),
          },
        });
      },

      recordInteraction: (interaction: InteractionLog) => {
        const profile = get().profile;
        if (!profile) return;

        set({
          profile: {
            ...profile,
            history: {
              ...profile.history,
              interactions: [...profile.history.interactions, interaction],
            },
            lastUpdated: new Date(),
          },
        });
      },

      updateMastery: (nodeId: string, success: boolean, timeSpent: number) => {
        const profile = get().profile;
        if (!profile) return;

        const existingMastery = profile.knowledgeState.masteredNodes.find(
          m => m.nodeId === nodeId
        );

        let updatedMastery: MasteryLevel;

        if (existingMastery) {
          const newAttempts = existingMastery.attempts + 1;
          const newSuccesses = success
            ? existingMastery.successRate * existingMastery.attempts + 1
            : existingMastery.successRate * existingMastery.attempts;
          const newSuccessRate = newSuccesses / newAttempts;

          updatedMastery = {
            ...existingMastery,
            attempts: newAttempts,
            successRate: newSuccessRate,
            mastery: Math.min(newSuccessRate * 1.2, 1), // Boost mastery slightly
            lastPracticed: new Date(),
            needsReview: newSuccessRate < 0.7,
            confidence: newSuccessRate > 0.8 ? 0.9 : 0.6,
          };
        } else {
          updatedMastery = {
            nodeId,
            mastery: success ? 0.3 : 0.1,
            attempts: 1,
            successRate: success ? 1.0 : 0.0,
            lastPracticed: new Date(),
            needsReview: !success,
            confidence: success ? 0.5 : 0.3,
          };
        }

        const masteredNodes = existingMastery
          ? profile.knowledgeState.masteredNodes.map(m =>
              m.nodeId === nodeId ? updatedMastery : m
            )
          : [...profile.knowledgeState.masteredNodes, updatedMastery];

        set({
          profile: {
            ...profile,
            knowledgeState: {
              ...profile.knowledgeState,
              masteredNodes,
            },
            lastUpdated: new Date(),
          },
        });
      },

      getMasteryLevel: (nodeId: string) => {
        const profile = get().profile;
        if (!profile) return undefined;

        return profile.knowledgeState.masteredNodes.find(
          m => m.nodeId === nodeId
        );
      },

      getCurrentDifficulty: (subject: Subject) => {
        const profile = get().profile;
        if (!profile) return 2;

        // Calculate based on recent performance
        const recentSessions = profile.history.sessions
          .filter(s => s.subject === subject)
          .slice(-5);

        if (recentSessions.length === 0) return 2;

        const avgAccuracy =
          recentSessions.reduce((sum, s) => sum + s.performance.accuracy, 0) /
          recentSessions.length;

        const currentDiff = recentSessions[recentSessions.length - 1].difficulty;

        // Adjust based on accuracy (Flow theory: 70-85% optimal)
        if (avgAccuracy > 0.85) {
          return Math.min(currentDiff + 1, 5) as DifficultyLevel;
        } else if (avgAccuracy < 0.6) {
          return Math.max(currentDiff - 1, 1) as DifficultyLevel;
        }

        return currentDiff;
      },

      setDifficulty: (subject: Subject, difficulty: DifficultyLevel) => {
        const profile = get().profile;
        if (!profile) return;

        set({
          profile: {
            ...profile,
            settings: {
              ...profile.settings,
              targetDifficulty: difficulty,
            },
            lastUpdated: new Date(),
          },
        });
      },

      setCurrentPath: (pathway: LearningPathway) => {
        const profile = get().profile;
        if (!profile) return;

        set({
          profile: {
            ...profile,
            learningPath: {
              ...profile.learningPath,
              current: pathway,
            },
            lastUpdated: new Date(),
          },
        });
      },

      updatePathProgress: (stepId: string, completed: boolean) => {
        const profile = get().profile;
        if (!profile || !profile.learningPath.current) return;

        const updatedSteps = profile.learningPath.current.steps.map(step =>
          step.id === stepId ? { ...step, completed } : step
        );

        const completedSteps = updatedSteps.filter(s => s.completed).length;
        const progress = completedSteps / updatedSteps.length;

        set({
          profile: {
            ...profile,
            learningPath: {
              ...profile.learningPath,
              current: {
                ...profile.learningPath.current,
                steps: updatedSteps,
                progress,
              },
            },
            lastUpdated: new Date(),
          },
        });
      },

      addRecommendedPath: (pathway: LearningPathway) => {
        const profile = get().profile;
        if (!profile) return;

        set({
          profile: {
            ...profile,
            learningPath: {
              ...profile.learningPath,
              recommended: [...profile.learningPath.recommended, pathway],
            },
            lastUpdated: new Date(),
          },
        });
      },

      addWeakness: (weakness: Weakness) => {
        const profile = get().profile;
        if (!profile) return;

        const existingIndex = profile.diagnosis.weaknesses.findIndex(
          w => w.knowledgeNodeId === weakness.knowledgeNodeId
        );

        const weaknesses =
          existingIndex >= 0
            ? profile.diagnosis.weaknesses.map((w, i) =>
                i === existingIndex ? weakness : w
              )
            : [...profile.diagnosis.weaknesses, weakness];

        set({
          profile: {
            ...profile,
            diagnosis: {
              ...profile.diagnosis,
              weaknesses,
              lastUpdate: new Date(),
            },
            lastUpdated: new Date(),
          },
        });
      },

      removeWeakness: (nodeId: string) => {
        const profile = get().profile;
        if (!profile) return;

        set({
          profile: {
            ...profile,
            diagnosis: {
              ...profile.diagnosis,
              weaknesses: profile.diagnosis.weaknesses.filter(
                w => w.knowledgeNodeId !== nodeId
              ),
            },
            lastUpdated: new Date(),
          },
        });
      },

      addAlert: (alert: Alert) => {
        const profile = get().profile;
        if (!profile) return;

        set({
          profile: {
            ...profile,
            diagnosis: {
              ...profile.diagnosis,
              alerts: [...profile.diagnosis.alerts, alert],
            },
            lastUpdated: new Date(),
          },
        });
      },

      dismissAlert: (alertId: string) => {
        const profile = get().profile;
        if (!profile) return;

        set({
          profile: {
            ...profile,
            diagnosis: {
              ...profile.diagnosis,
              alerts: profile.diagnosis.alerts.map(a =>
                a.id === alertId ? { ...a, dismissed: true } : a
              ),
            },
            lastUpdated: new Date(),
          },
        });
      },

      addRecommendation: (recommendation: Recommendation) => {
        const profile = get().profile;
        if (!profile) return;

        set({
          profile: {
            ...profile,
            diagnosis: {
              ...profile.diagnosis,
              recommendations: [
                ...profile.diagnosis.recommendations,
                recommendation,
              ],
            },
            lastUpdated: new Date(),
          },
        });
      },

      updateSettings: (settings: Partial<AdaptiveLearningProfile['settings']>) => {
        const profile = get().profile;
        if (!profile) return;

        set({
          profile: {
            ...profile,
            settings: {
              ...profile.settings,
              ...settings,
            },
            lastUpdated: new Date(),
          },
        });
      },
    }),
    {
      name: 'smarttuter-adaptive-learning',
      skipHydration: true,
      storage: {
        getItem: (name) => {
          if (typeof window === 'undefined') return null;
          const str = localStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return;
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          if (typeof window === 'undefined') return;
          localStorage.removeItem(name);
        },
      },
    }
  )
);

// Hydrate on client-side only
if (typeof window !== 'undefined') {
  useAdaptiveLearning.persist.rehydrate();
}
