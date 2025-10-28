// Phase 9: Interactive Learning Store
// Zustand state management with LocalStorage persistence

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Quiz,
  QuizResult,
  Flashcard,
  Challenge,
  LearningNote,
  InteractiveLearningProfile,
  Subject,
} from './types';
import { QuizGenerator } from './quiz-generator';
import { FlashcardScheduler } from './flashcard-scheduler';

interface InteractiveLearningState {
  // Profile
  profile: InteractiveLearningProfile | null;

  // Quizzes
  quizzes: Quiz[];
  quizResults: QuizResult[];

  // Flashcards
  flashcards: Flashcard[];

  // Challenges
  challenges: Challenge[];

  // Notes
  notes: LearningNote[];

  // Actions - Profile
  initializeProfile: (userId: string) => void;

  // Actions - Quizzes
  generateQuiz: (
    subject: Subject,
    topic: string,
    difficulty: 1 | 2 | 3 | 4 | 5,
    questionCount: number
  ) => Promise<Quiz>;
  submitQuizResult: (result: QuizResult) => void;
  getQuizzesBySubject: (subject: Subject) => Quiz[];
  getQuizHistory: () => QuizResult[];

  // Actions - Flashcards
  createFlashcard: (
    front: string,
    back: string,
    subject: 'math' | 'english',
    knowledgeNodeId: string,
    difficulty: 1 | 2 | 3 | 4 | 5
  ) => void;
  reviewFlashcard: (cardId: string, quality: 0 | 1 | 2 | 3 | 4 | 5, responseTime: number) => void;
  getDueFlashcards: () => Flashcard[];
  getFlashcardsBySubject: (subject: 'math' | 'english') => Flashcard[];

  // Actions - Challenges
  createChallenge: (challenge: Challenge) => void;
  completeChallenge: (challengeId: string, xpEarned: number) => void;
  getActiveChallenges: () => Challenge[];

  // Actions - Notes
  createNote: (note: LearningNote) => void;
  updateNote: (noteId: string, updates: Partial<LearningNote>) => void;
  deleteNote: (noteId: string) => void;
  getNotesBySubject: (subject: Subject) => LearningNote[];
}

export const useInteractiveLearning = create<InteractiveLearningState>()(
  persist(
    (set, get) => ({
      // Initial State
      profile: null,
      quizzes: [],
      quizResults: [],
      flashcards: [],
      challenges: [],
      notes: [],

      // Initialize Profile
      initializeProfile: (userId: string) => {
        const existingProfile = get().profile;
        if (existingProfile) return;

        const newProfile: InteractiveLearningProfile = {
          userId,
          totalQuizzesTaken: 0,
          totalFlashcardsReviewed: 0,
          challengesCompleted: 0,
          notesCreated: 0,
          quizStreak: 0,
          flashcardStreak: 0,
          lastQuizDate: undefined,
          lastFlashcardReview: undefined,
          createdAt: new Date(),
        };

        set({ profile: newProfile });
      },

      // Quiz Actions
      generateQuiz: async (
        subject: Subject,
        topic: string,
        difficulty: 1 | 2 | 3 | 4 | 5,
        questionCount: number
      ) => {
        const quiz = await QuizGenerator.generateQuiz({
          subject,
          gradeLevel: 'middle', // Default to middle school
          difficulty,
          questionCount,
        });

        set((state) => ({
          quizzes: [...state.quizzes, quiz],
        }));

        return quiz;
      },

      submitQuizResult: (result: QuizResult) => {
        set((state) => {
          const now = new Date();
          const lastQuizDate = state.profile?.lastQuizDate;

          // Calculate streak
          let newStreak = state.profile?.quizStreak || 0;
          if (lastQuizDate) {
            const daysSinceLastQuiz = Math.floor(
              (now.getTime() - lastQuizDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (daysSinceLastQuiz === 1) {
              newStreak += 1; // Consecutive day
            } else if (daysSinceLastQuiz > 1) {
              newStreak = 1; // Reset streak
            }
            // Same day doesn't change streak
          } else {
            newStreak = 1; // First quiz
          }

          return {
            quizResults: [...state.quizResults, result],
            profile: state.profile
              ? {
                  ...state.profile,
                  totalQuizzesTaken: state.profile.totalQuizzesTaken + 1,
                  quizStreak: newStreak,
                  lastQuizDate: now,
                }
              : null,
          };
        });

        // 🆕 Phase 8 Integration: Update adaptive learning profile
        if (typeof window !== 'undefined') {
          const quiz = get().quizzes.find(q => q.id === result.quizId);
          if (quiz) {
            import('../unified-learning/integration-service').then(({ learningIntegrationService }) => {
              learningIntegrationService.onQuizCompleted(result, { subject: quiz.subject, difficulty: quiz.difficulty, title: quiz.title });
            });
          }
        }
      },

      getQuizzesBySubject: (subject: Subject) => {
        return get().quizzes.filter((quiz) => quiz.subject === subject);
      },

      getQuizHistory: () => {
        return get().quizResults.sort(
          (a, b) => b.completedAt.getTime() - a.completedAt.getTime()
        );
      },

      // Flashcard Actions
      createFlashcard: (
        front: string,
        back: string,
        subject: 'math' | 'english',
        knowledgeNodeId: string,
        difficulty: 1 | 2 | 3 | 4 | 5
      ) => {
        const card = FlashcardScheduler.createFlashcard(
          front,
          back,
          subject,
          knowledgeNodeId,
          difficulty
        );

        set((state) => ({
          flashcards: [...state.flashcards, card],
          profile: state.profile
            ? {
                ...state.profile,
                notesCreated: state.profile.notesCreated + 1,
              }
            : null,
        }));
      },

      reviewFlashcard: (cardId: string, quality: 0 | 1 | 2 | 3 | 4 | 5, responseTime: number) => {
        set((state) => {
          const cardIndex = state.flashcards.findIndex((c) => c.id === cardId);
          if (cardIndex === -1) return state;

          const card = state.flashcards[cardIndex];
          const updatedCard = FlashcardScheduler.recordReview(card, quality, responseTime);

          const newFlashcards = [...state.flashcards];
          newFlashcards[cardIndex] = updatedCard;

          const now = new Date();
          const lastReviewDate = state.profile?.lastFlashcardReview;

          // Calculate streak
          let newStreak = state.profile?.flashcardStreak || 0;
          if (lastReviewDate) {
            const daysSinceLastReview = Math.floor(
              (now.getTime() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (daysSinceLastReview === 1) {
              newStreak += 1;
            } else if (daysSinceLastReview > 1) {
              newStreak = 1;
            }
          } else {
            newStreak = 1;
          }

          return {
            flashcards: newFlashcards,
            profile: state.profile
              ? {
                  ...state.profile,
                  totalFlashcardsReviewed: state.profile.totalFlashcardsReviewed + 1,
                  flashcardStreak: newStreak,
                  lastFlashcardReview: now,
                }
              : null,
          };
        });

        // 🆕 Phase 8 Integration: Update mastery
        if (typeof window !== 'undefined') {
          import('../unified-learning/integration-service').then(({ learningIntegrationService }) => {
            learningIntegrationService.onFlashcardReviewed(cardId, quality, responseTime);
          });
        }
      },

      getDueFlashcards: () => {
        const now = new Date();
        return get().flashcards.filter((card) => card.nextReview <= now);
      },

      getFlashcardsBySubject: (subject: 'math' | 'english') => {
        return get().flashcards.filter((card) => card.subject === subject);
      },

      // Challenge Actions
      createChallenge: (challenge: Challenge) => {
        set((state) => ({
          challenges: [...state.challenges, challenge],
        }));
      },

      completeChallenge: (challengeId: string, xpEarned: number) => {
        set((state) => {
          const challengeIndex = state.challenges.findIndex(
            (c) => c.id === challengeId
          );
          if (challengeIndex === -1) return state;

          const newChallenges = [...state.challenges];
          newChallenges[challengeIndex] = {
            ...newChallenges[challengeIndex],
            status: 'completed',
            goal: {
              ...newChallenges[challengeIndex].goal,
              current: newChallenges[challengeIndex].goal.target,
            },
          };

          return {
            challenges: newChallenges,
            profile: state.profile
              ? {
                  ...state.profile,
                  challengesCompleted: state.profile.challengesCompleted + 1,
                }
              : null,
          };
        });
      },

      getActiveChallenges: () => {
        return get().challenges.filter((c) => c.status === 'active');
      },

      // Note Actions
      createNote: (note: LearningNote) => {
        set((state) => ({
          notes: [...state.notes, note],
          profile: state.profile
            ? {
                ...state.profile,
                notesCreated: state.profile.notesCreated + 1,
              }
            : null,
        }));
      },

      updateNote: (noteId: string, updates: Partial<LearningNote>) => {
        set((state) => {
          const noteIndex = state.notes.findIndex((n) => n.id === noteId);
          if (noteIndex === -1) return state;

          const newNotes = [...state.notes];
          newNotes[noteIndex] = {
            ...newNotes[noteIndex],
            ...updates,
            updatedAt: new Date(),
          };

          return { notes: newNotes };
        });
      },

      deleteNote: (noteId: string) => {
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== noteId),
        }));
      },

      getNotesBySubject: (subject: Subject) => {
        return get().notes.filter((note) => note.subject === subject);
      },
    }),
    {
      name: 'interactive-learning-storage',
      version: 1,
      
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
