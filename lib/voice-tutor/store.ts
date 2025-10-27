// Phase 10: Voice Tutor Store
// API-based state management for voice tutor sessions

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  VoiceTutorSession,
  TutorSubject,
  SessionStats,
  GradeLevel,
} from './types';

interface VoiceTutorState {
  // Current session
  currentSession: VoiceTutorSession | null;
  currentProblem: any | null; // For math tutor
  hintsUsed: number;

  // Session history
  sessions: VoiceTutorSession[];

  // Actions
  startSession: (subject: TutorSubject, gradeLevel: GradeLevel, userId: string) => Promise<string>;
  sendMessage: (message: string, audioMetadata?: { confidence?: number; duration?: number }) => Promise<{
    response: string;
    xpEarned: number;
  }>;
  endSession: () => VoiceTutorSession | null;
  pauseSession: () => void;
  resumeSession: () => void;

  // Math specific
  requestHint: () => Promise<string>;
  generateProblem: (topic?: string) => Promise<any>;
  showSolution: () => Promise<string>;

  // Session management
  getSessionStats: () => SessionStats | null;
  getSessionHistory: () => VoiceTutorSession[];
  clearHistory: () => void;
}

export const useVoiceTutor = create<VoiceTutorState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSession: null,
      currentProblem: null,
      hintsUsed: 0,
      sessions: [],

      // Start a new session via API
      startSession: async (subject: TutorSubject, gradeLevel: GradeLevel, userId: string) => {
        try {
          const response = await fetch('/api/tutor/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, gradeLevel, userId }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to start session');
          }

          const data = await response.json();

          // Create session object
          const session: VoiceTutorSession = {
            ...data.session,
            startTime: new Date(data.session.startTime),
            endTime: undefined,
            messages: [],
            speakingTime: 0,
            listeningTime: 0,
            interactionCount: 0,
            badgesEarned: [],
          };

          set({
            currentSession: session,
            currentProblem: null,
            hintsUsed: 0,
          });

          return data.greeting;
        } catch (error: any) {
          console.error('Start session error:', error);
          throw error;
        }
      },

      // Send a message to the tutor via API
      sendMessage: async (message: string, audioMetadata?: { confidence?: number; duration?: number }) => {
        const { currentSession } = get();

        if (!currentSession) {
          throw new Error('No active session. Start a session first.');
        }

        try {
          const response = await fetch('/api/tutor/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subject: currentSession.subject,
              gradeLevel: currentSession.gradeLevel,
              userId: currentSession.userId,
              message,
              audioMetadata,
              conversationHistory: currentSession.messages,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to send message');
          }

          const data = await response.json();

          // Update session with new messages
          const updatedSession = {
            ...currentSession,
            messages: data.session.messages,
            duration: data.session.duration,
            interactionCount: (currentSession.interactionCount || 0) + 1,
            xpEarned: (currentSession.xpEarned || 0) + data.xpEarned,
          };

          set({ currentSession: updatedSession });

          return {
            response: data.response,
            xpEarned: data.xpEarned,
          };
        } catch (error: any) {
          console.error('Send message error:', error);
          throw error;
        }
      },

      // End the current session
      endSession: () => {
        const { currentSession, sessions } = get();

        if (!currentSession) return null;

        // Finalize session
        const finalSession: VoiceTutorSession = {
          ...currentSession,
          status: 'completed',
          endTime: new Date(),
          xpEarned: (currentSession.xpEarned || 0) + 50, // Completion bonus
        };

        // Add bonus for long sessions (15+ minutes)
        if (finalSession.duration >= 900) {
          finalSession.xpEarned += 100;
        }

        // Add to history
        set({
          sessions: [...sessions, finalSession],
          currentSession: null,
          currentProblem: null,
          hintsUsed: 0,
        });

        // 🆕 Phase 8 Integration: Update adaptive learning profile
        if (typeof window !== 'undefined') {
          import('../unified-learning/integration-service').then(({ learningIntegrationService }) => {
            learningIntegrationService.onVoiceSessionEnded(finalSession);
          });
        }

        return finalSession;
      },

      // Pause session
      pauseSession: () => {
        const { currentSession } = get();
        if (currentSession) {
          set({
            currentSession: {
              ...currentSession,
              status: 'paused',
            },
          });
        }
      },

      // Resume session
      resumeSession: () => {
        const { currentSession } = get();
        if (currentSession) {
          set({
            currentSession: {
              ...currentSession,
              status: 'active',
            },
          });
        }
      },

      // Request a hint (math only) via API
      requestHint: async () => {
        const { currentSession, currentProblem, hintsUsed } = get();

        if (!currentSession) {
          throw new Error('No active session');
        }

        if (currentSession.subject !== 'math') {
          throw new Error('Hints are only available in math sessions');
        }

        if (!currentProblem) {
          throw new Error('No active problem. Generate a problem first.');
        }

        try {
          const response = await fetch('/api/tutor/hint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              gradeLevel: currentSession.gradeLevel,
              userId: currentSession.userId,
              currentProblem,
              hintsUsed,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get hint');
          }

          const data = await response.json();

          set({ hintsUsed: data.hintsUsed });

          return data.hint;
        } catch (error: any) {
          console.error('Request hint error:', error);
          throw error;
        }
      },

      // Generate math problem (math only) via API
      generateProblem: async (topic?: string) => {
        const { currentSession } = get();

        if (!currentSession) {
          throw new Error('No active session');
        }

        if (currentSession.subject !== 'math') {
          throw new Error('Problem generation is only available in math sessions');
        }

        try {
          const response = await fetch('/api/tutor/problem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              gradeLevel: currentSession.gradeLevel,
              userId: currentSession.userId,
              topic,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate problem');
          }

          const data = await response.json();

          set({
            currentProblem: data.problem,
            hintsUsed: 0,
          });

          return data.problem;
        } catch (error: any) {
          console.error('Generate problem error:', error);
          throw error;
        }
      },

      // Show solution (math only)
      showSolution: async () => {
        const { currentProblem } = get();

        if (!currentProblem) {
          throw new Error('No active problem');
        }

        // Simply return the solution from current problem
        const steps = currentProblem.steps.join('\n');
        const explanation = currentProblem.explanation;

        return `**Solution: ${currentProblem.solution}**\n\n**Steps:**\n${steps}\n\n**Explanation:**\n${explanation}`;
      },

      // Get session statistics
      getSessionStats: () => {
        const { currentSession } = get();

        if (!currentSession) return null;

        const stats: SessionStats = {
          totalTime: currentSession.duration,
          messagesCount: currentSession.messages.length,
          userMessagesCount: currentSession.messages.filter(m => m.role === 'user').length,
          tutorMessagesCount: currentSession.messages.filter(m => m.role === 'tutor').length,
        };

        // Add subject-specific stats
        if (currentSession.subject === 'english') {
          const feedbacks = currentSession.messages
            .filter(m => m.feedback)
            .map(m => m.feedback!);

          const avgGrammarScore = feedbacks.length > 0
            ? feedbacks.reduce((sum, f) => sum + (f.score || 0), 0) / feedbacks.length
            : 0;

          stats.grammarAccuracy = Math.round(avgGrammarScore);
          stats.correctionsCount = currentSession.grammarCorrections?.length || 0;
        } else {
          stats.problemsAttempted = currentSession.messages.filter(
            m => m.role === 'user' && currentSession.currentProblem
          ).length;
          stats.problemsSolved = currentSession.problemsSolved || 0;
          stats.hintsUsedTotal = currentSession.hintsGiven || 0;

          if (stats.problemsAttempted > 0) {
            stats.accuracy = Math.round((stats.problemsSolved / stats.problemsAttempted) * 100);
          }
        }

        return stats;
      },

      // Get session history
      getSessionHistory: () => {
        return get().sessions.sort((a, b) =>
          b.startTime.getTime() - a.startTime.getTime()
        );
      },

      // Clear all history
      clearHistory: () => {
        set({ sessions: [] });
      },
    }),
    {
      name: 'voice-tutor-storage',
      version: 2, // Increment version due to breaking changes
      skipHydration: true,
      partialize: (state) => ({
        sessions: state.sessions,
      }),
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
