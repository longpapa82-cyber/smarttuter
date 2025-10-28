import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

interface UserStore {
  profile: UserProfile | null;

  // Actions
  initializeProfile: (username: string, gradeLevel: string) => void;
  addXP: (amount: number, reason: string) => void;
  recordSession: (session: Omit<SessionRecord, 'id' | 'date'>) => void;
  updateStreak: () => void;
  checkAchievements: () => void;
  unlockAchievement: (achievementId: string) => void;
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
    freezeCount: 3,
  },
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

        // Check achievements
        get().checkAchievements();

        // Add session completion XP
        get().addXP(XP_REWARDS.sessionComplete, 'Session completed');
      },

      updateStreak: () => {
        const { profile } = get();
        if (!profile) return;

        const now = new Date();
        const lastStudy = profile.streak.lastStudyDate
          ? parseISO(profile.streak.lastStudyDate)
          : null;

        if (!lastStudy) {
          // First time studying
          set({
            profile: {
              ...profile,
              streak: {
                ...profile.streak,
                currentStreak: 1,
                longestStreak: 1,
                lastStudyDate: now.toISOString(),
              },
            },
          });
          return;
        }

        // Check if already studied today
        if (isToday(lastStudy)) {
          return; // No update needed
        }

        const daysDiff = differenceInDays(now, lastStudy);

        if (daysDiff === 1) {
          // Consecutive day
          const newStreak = profile.streak.currentStreak + 1;
          const newLongest = Math.max(newStreak, profile.streak.longestStreak);

          set({
            profile: {
              ...profile,
              streak: {
                ...profile.streak,
                currentStreak: newStreak,
                longestStreak: newLongest,
                lastStudyDate: now.toISOString(),
              },
            },
          });

          // Add streak bonus XP
          get().addXP(XP_REWARDS.dailyStreak, `${newStreak} day streak!`);
        } else if (daysDiff > 1 && profile.streak.freezeCount > 0) {
          // Use freeze to maintain streak
          set({
            profile: {
              ...profile,
              streak: {
                ...profile.streak,
                freezeCount: profile.streak.freezeCount - 1,
                lastStudyDate: now.toISOString(),
              },
            },
          });
        } else {
          // Streak broken
          set({
            profile: {
              ...profile,
              streak: {
                ...profile.streak,
                currentStreak: 1,
                lastStudyDate: now.toISOString(),
              },
            },
          });
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
    }
  )
);
