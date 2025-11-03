import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useState, useEffect } from 'react';
import {
  UserProfile,
  SessionRecord,
  UserPoints,
  StreakData,
  calculateLevel,
  XP_REWARDS,
  ACHIEVEMENTS,
} from './types';
import { differenceInDays, isToday, parseISO } from 'date-fns';
import {
  updateStreak as updateStreakLogic,
  getMilestoneReward,
} from './streak-system';
import {
  initializeDailyGoals,
  updateGoalProgress as updateGoalProgressLogic,
  type DailyGoalsProgress,
  type GoalType,
} from './daily-goals';

interface UserStore {
  profile: UserProfile | null;

  // Actions
  initializeProfile: (username: string, gradeLevel: string) => void;
  addXP: (amount: number, reason: string) => void;
  recordSession: (session: Omit<SessionRecord, 'id' | 'date'>) => void;
  updateStreak: () => void;
  checkAchievements: () => void;
  unlockAchievement: (achievementId: string) => void;
  updateGoalProgress: (goalType: GoalType, increment?: number) => void;
  initializeTodayGoals: () => void;
  resetProfile: () => void;
}

const DEFAULT_PROFILE: Omit<UserProfile, 'id' | 'username' | 'gradeLevel'> = {
  avatar: '🎓',
  createdAt: new Date().toISOString(),
  points: {
    totalXP: 0,
    level: 1,
    currentLevelXP: 0,
    nextLevelXP: 100,
  },
  achievements: [],
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: '',
    freezeTokens: 3,
    totalStudyDays: 0,
    streakMilestones: [],
  },
  dailyGoals: initializeDailyGoals(),
  sessions: [],
  totalStudyTime: 0,
  subjectProgress: {
    english: 0,
    math: 0,
  },
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: null,

      initializeProfile: (username, gradeLevel) => {
        set({
          profile: {
            ...DEFAULT_PROFILE,
            id: `user_${Date.now()}`,
            username,
            gradeLevel,
          },
        });
      },

      addXP: (amount, reason) => {
        const { profile } = get();
        if (!profile) return;

        const newTotalXP = profile.points.totalXP + amount;
        const newPoints = calculateLevel(newTotalXP);
        const leveledUp = newPoints.level > profile.points.level;

        set({
          profile: {
            ...profile,
            points: newPoints,
          },
        });

        // Update XP daily goal automatically
        get().updateGoalProgress('xp', amount);

        // Show level up notification if leveled up
        if (leveledUp && typeof window !== 'undefined') {
          // Trigger confetti animation (will be handled by UI component)
          window.dispatchEvent(new CustomEvent('levelup', {
            detail: { newLevel: newPoints.level }
          }));
        }

        console.log(`+${amount} XP: ${reason}`);
      },

      recordSession: (sessionData) => {
        const { profile } = get();
        if (!profile) return;

        const session: SessionRecord = {
          ...sessionData,
          id: `session_${Date.now()}`,
          date: new Date().toISOString(),
        };

        // Calculate subject progress
        const subjectSessions = [...profile.sessions, session].filter(
          s => s.subject === session.subject
        );
        const subjectProgress = Math.min(
          100,
          (subjectSessions.length / 50) * 100 // 50 sessions = 100%
        );

        set({
          profile: {
            ...profile,
            sessions: [...profile.sessions, session],
            totalStudyTime: profile.totalStudyTime + session.duration,
            subjectProgress: {
              ...profile.subjectProgress,
              [session.subject]: Math.round(subjectProgress),
            },
          },
        });

        // Update streak
        get().updateStreak();

        // Update daily goals - tutor session and study time
        get().updateGoalProgress('tutor', 1);
        get().updateGoalProgress('studyTime', session.duration);

        // Check achievements
        get().checkAchievements();

        // Add session completion XP
        get().addXP(XP_REWARDS.sessionComplete, 'Session completed');
      },

      updateStreak: () => {
        const { profile } = get();
        if (!profile) return;

        // Use the enhanced streak system
        const result = updateStreakLogic(profile.streak, new Date());

        // Update profile with new streak data
        set({
          profile: {
            ...profile,
            streak: result.streakData,
          },
        });

        // Handle milestone achievement
        if (result.newMilestone) {
          const reward = getMilestoneReward(result.newMilestone);

          // Dispatch milestone animation event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('milestone', {
                detail: { milestone: result.newMilestone, reward },
              })
            );
          }

          // Add milestone bonus XP
          get().addXP(100, reward.message);
        }

        // Add daily streak bonus XP if streak continued
        if (result.streakChanged && !result.streakBroken) {
          get().addXP(
            XP_REWARDS.dailyStreak,
            `${result.streakData.currentStreak} day streak!`
          );
        }

        // Show streak broken notification
        if (result.streakBroken && typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('streakBroken', {
              detail: { previousStreak: profile.streak.currentStreak },
            })
          );
        }
      },

      checkAchievements: () => {
        const { profile } = get();
        if (!profile) return;

        const totalSessions = profile.sessions.length;
        const mathSessions = profile.sessions.filter(s => s.subject === 'math').length;
        const englishSessions = profile.sessions.filter(s => s.subject === 'english').length;
        const currentStreak = profile.streak.currentStreak;

        ACHIEVEMENTS.forEach((achievement) => {
          // Skip if already unlocked
          if (profile.achievements.includes(achievement.id)) return;

          let shouldUnlock = false;

          switch (achievement.id) {
            case 'first_chat':
            case 'chat_10':
            case 'chat_50':
            case 'chat_100':
              shouldUnlock = totalSessions >= achievement.requirement;
              break;

            case 'math_novice':
            case 'math_expert':
              shouldUnlock = mathSessions >= achievement.requirement;
              break;

            case 'english_novice':
            case 'english_expert':
              shouldUnlock = englishSessions >= achievement.requirement;
              break;

            case 'streak_3':
            case 'streak_7':
            case 'streak_30':
            case 'streak_100':
              shouldUnlock = currentStreak >= achievement.requirement;
              break;
          }

          if (shouldUnlock) {
            get().unlockAchievement(achievement.id);
          }
        });
      },

      unlockAchievement: (achievementId) => {
        const { profile } = get();
        if (!profile) return;

        if (profile.achievements.includes(achievementId)) return;

        set({
          profile: {
            ...profile,
            achievements: [...profile.achievements, achievementId],
          },
        });

        // Show achievement notification
        if (typeof window !== 'undefined') {
          const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
          if (achievement) {
            window.dispatchEvent(new CustomEvent('achievement', {
              detail: { achievement }
            }));
          }
        }

        // Award bonus XP for achievement
        get().addXP(100, `Achievement unlocked: ${achievementId}`);
      },

      initializeTodayGoals: () => {
        const { profile } = get();
        if (!profile) return;

        const todayGoals = initializeDailyGoals();
        set({
          profile: {
            ...profile,
            dailyGoals: todayGoals,
          },
        });
      },

      updateGoalProgress: (goalType: GoalType, increment: number = 1) => {
        const { profile } = get();
        if (!profile) return;

        // Initialize daily goals if not present or outdated
        if (!profile.dailyGoals) {
          get().initializeTodayGoals();
          return;
        }

        // Update goal progress with the enhanced logic
        const result = updateGoalProgressLogic(
          profile.dailyGoals,
          goalType,
          increment
        );

        set({
          profile: {
            ...profile,
            dailyGoals: result.progress,
          },
        });

        // Handle newly completed goals
        if (result.newlyCompleted.length > 0) {
          result.newlyCompleted.forEach((goal) => {
            // Award XP for completing the goal
            get().addXP(goal.xpReward, `목표 달성: ${goal.title}`);

            // Dispatch custom event for UI animation
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('goalCompleted', {
                  detail: { goal },
                })
              );
            }
          });
        }

        // Check if all goals completed
        if (result.allCompleted && typeof window !== 'undefined') {
          // Bonus XP for completing all daily goals
          get().addXP(200, '모든 일일 목표 달성! 🎉');

          window.dispatchEvent(
            new CustomEvent('allGoalsCompleted', {
              detail: { date: result.progress.date },
            })
          );
        }
      },

      resetProfile: () => {
        set({ profile: null });
      },
    }),
    {
      name: 'smarttuter-user-profile',
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
      onRehydrateStorage: () => (state) => {
        // Rehydration complete callback
        if (typeof window !== 'undefined') {
          userStoreHydrated = true;
        }
      },
    }
  )
);

// Track hydration status
let userStoreHydrated = false;

export const isUserStoreHydrated = () => userStoreHydrated;

// Helper hook for components to wait for hydration
export const useUserStoreHydration = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Check if already hydrated
    if (userStoreHydrated) {
      setHydrated(true);
      return;
    }

    // Wait for hydration by polling
    const checkHydration = setInterval(() => {
      if (userStoreHydrated) {
        setHydrated(true);
        clearInterval(checkHydration);
      }
    }, 50);

    // Timeout after 2 seconds
    const timeout = setTimeout(() => {
      clearInterval(checkHydration);
      setHydrated(true); // Proceed anyway
    }, 2000);

    return () => {
      clearInterval(checkHydration);
      clearTimeout(timeout);
    };
  }, []);

  return hydrated;
};
