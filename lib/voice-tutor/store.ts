// Phase 10: Voice Tutor Store
// State management for voice tutor sessions

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  VoiceTutorSession,
  TutorSubject,
  SessionStats,
  GradeLevel,
} from './types';
import { EnglishVoiceTutor } from './english-tutor';
import { MathVoiceTutor } from './math-tutor';

interface VoiceTutorState {
  // Current session
  currentSession: VoiceTutorSession | null;
  currentTutor: EnglishVoiceTutor | MathVoiceTutor | null;

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
      currentTutor: null,
      sessions: [],

      // Start a new session
      startSession: async (subject: TutorSubject, gradeLevel: GradeLevel, userId: string) => {
        // Create appropriate tutor
        const tutor = subject === 'english'
          ? new EnglishVoiceTutor(gradeLevel, userId)
          : new MathVoiceTutor(gradeLevel, userId);

        // Get initial greeting
        const greeting = await tutor.startConversation();

        // Update state
        set({
          currentTutor: tutor,
          currentSession: tutor.getSession(),
        });

        return greeting;
      },

      // Send a message to the tutor
      sendMessage: async (message: string, audioMetadata?: { confidence?: number; duration?: number }) => {
        const { currentTutor } = get();

        if (!currentTutor) {
          throw new Error('No active session. Start a session first.');
        }

        // Get response from tutor
        const result = await currentTutor.converse(message, audioMetadata);

        // Update current session
        set({
          currentSession: currentTutor.getSession(),
        });

        return {
          response: result.response,
          xpEarned: result.xpEarned,
        };
      },

      // End the current session
      endSession: () => {
        const { currentTutor, sessions } = get();

        if (!currentTutor) return null;

        // Finalize session
        const finalSession = currentTutor.endSession();

        // Add to history
        set({
          sessions: [...sessions, finalSession],
          currentSession: null,
          currentTutor: null,
        });

        return finalSession;
      },

      // Pause session
      pauseSession: () => {
        const { currentTutor } = get();
        if (currentTutor) {
          currentTutor.pauseSession();
          set({ currentSession: currentTutor.getSession() });
        }
      },

      // Resume session
      resumeSession: () => {
        const { currentTutor } = get();
        if (currentTutor) {
          currentTutor.resumeSession();
          set({ currentSession: currentTutor.getSession() });
        }
      },

      // Request a hint (math only)
      requestHint: async () => {
        const { currentTutor } = get();

        if (!currentTutor) {
          throw new Error('No active session');
        }

        if (!(currentTutor instanceof MathVoiceTutor)) {
          throw new Error('Hints are only available in math sessions');
        }

        return await currentTutor.giveHint();
      },

      // Generate math problem (math only)
      generateProblem: async (topic?: string) => {
        const { currentTutor } = get();

        if (!currentTutor) {
          throw new Error('No active session');
        }

        if (!(currentTutor instanceof MathVoiceTutor)) {
          throw new Error('Problem generation is only available in math sessions');
        }

        const problem = await currentTutor.generateProblem(topic);

        set({ currentSession: currentTutor.getSession() });

        return problem;
      },

      // Show solution (math only)
      showSolution: async () => {
        const { currentTutor } = get();

        if (!currentTutor) {
          throw new Error('No active session');
        }

        if (!(currentTutor instanceof MathVoiceTutor)) {
          throw new Error('Solution view is only available in math sessions');
        }

        return await currentTutor.showSolution();
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
      version: 1,
      partialize: (state) => ({
        sessions: state.sessions,
      }),
    }
  )
);
