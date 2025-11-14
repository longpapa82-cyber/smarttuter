"use client";

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Calculator, Beaker, Landmark, BarChart3, Trophy, Target, TrendingUp, Award, Clock, Star, Zap, Home, Flame, BookMarked } from "lucide-react";

// Helper function to convert gradeLevel to Korean
function getKoreanGradeLevel(gradeLevel: string | undefined | null): string {
  if (!gradeLevel) return 'N/A';

  const gradeMap: Record<string, string> = {
    'elementary': '초등',
    'middle': '중등',
    'high': '고등',
    'university': '대학',
  };

  return gradeMap[gradeLevel.toLowerCase()] || gradeLevel;
}
import { useUserStore } from "@/lib/gamification/store";
import { useAdaptiveLearning } from "@/lib/adaptive-learning/store";
import { useInteractiveLearning } from "@/lib/interactive-learning/store";
import { LevelProgress } from "@/components/gamification/LevelProgress";
import { StreakDisplay } from "@/components/gamification/StreakDisplay";
import { StreakWidget } from "@/components/gamification/StreakWidget";
import { DailyGoalsWidget } from "@/components/gamification/DailyGoalsWidget";
import { WeeklyStats } from "@/components/gamification/WeeklyStats";
import { AchievementBadges } from "@/components/gamification/AchievementBadges";
import { GoalsWidget } from "@/components/goals/GoalsWidget";
import { GoalTimeline } from "@/components/goals/GoalTimeline";
import { AnimatedProgressBar, AnimatedCounter, PulseIndicator, LiveStats } from "@/components/animations";
import {
  LearningProgressOverview,
  CEFRLevelBadge,
  MathTopicProgress,
  WeaknessAnalysis,
  DifficultyIndicator
} from "@/components/dashboard";
import type { LearningProgressSummary } from "@/lib/learning-progress/types";
import { useAuth } from "@/hooks/useAuth";
import { SkeletonDashboard } from "@/components/ui/Skeleton";
import { EmptyLearningCard } from "@/components/dashboard/EmptyLearningCard";
import type { LearningStats } from "@/types/learning-stats";
// Phase 2: New Total Dashboard Components
import { OverallStatsCard } from "@/components/dashboard/total/OverallStatsCard";
import { SubjectComparisonChart } from "@/components/dashboard/total/SubjectComparisonChart";
import { RecentActivitySummary } from "@/components/dashboard/total/RecentActivitySummary";

function LoadingDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <SkeletonDashboard />
      </div>
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const profile = useUserStore((state) => state.profile);
  const initializeProfile = useUserStore((state) => state.initializeProfile);
  const initializeAdaptiveProfile = useAdaptiveLearning((state) => state.initializeProfile);
  const initializeInteractiveProfile = useInteractiveLearning((state) => state.initializeProfile);

  // Phase 8: Real-time progress data loading
  const [progressData, setProgressData] = useState<LearningProgressSummary | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [profileComplete, setProfileComplete] = useState<number>(0);

  // P0: Guest mode detection
  const [isGuestMode, setIsGuestMode] = useState(false);

  // Learning stats for all subjects
  const [learningStats, setLearningStats] = useState<LearningStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Initialize stores from database (authenticated) or localStorage (onboarding)
  useEffect(() => {
    if (profile) return; // Already initialized
    if (typeof window === 'undefined') return; // Server-side, skip

    async function initializeFromDatabase() {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const { user: dbUser } = await response.json();

          if (dbUser.gradeLevel && dbUser.gradeDetail) {
            // User has completed onboarding, initialize from database
            const userId = user?.email || `user-${Date.now()}`;
            initializeProfile(dbUser.name || 'User', dbUser.gradeLevel);
            initializeAdaptiveProfile(userId, dbUser.gradeLevel);
            initializeInteractiveProfile(userId);

            // Calculate profile completion
            const completionFields = [dbUser.name, dbUser.gradeLevel, dbUser.gradeDetail, dbUser.email];
            const completed = completionFields.filter(f => f !== null).length;
            setProfileComplete(Math.round((completed / completionFields.length) * 100));

            console.log('✅ Dashboard initialized from database');
            return true;
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile from database:', error);
      }
      return false;
    }

    function initializeFromLocalStorage() {
      const onboardingData = localStorage.getItem('onboarding_data');
      if (onboardingData) {
        try {
          const data = JSON.parse(onboardingData);

          // Initialize all stores
          initializeProfile(data.username, data.gradeLevel);
          initializeAdaptiveProfile(data.userId, data.gradeLevel);
          initializeInteractiveProfile(data.userId);

          // Clear onboarding data after initialization
          localStorage.removeItem('onboarding_data');

          console.log('✅ Dashboard initialized from localStorage');
          return true;
        } catch (error) {
          console.error('Failed to initialize from onboarding data:', error);
          router.push("/onboarding/quick");
          return false;
        }
      } else if (!isAuthenticated) {
        // No onboarding data and not authenticated, redirect to quick onboarding
        router.push("/onboarding/quick");
        return false;
      }
      return false;
    }

    // Run initialization
    if (isAuthenticated && user) {
      initializeFromDatabase().then(success => {
        if (!success) {
          // If database init failed, try localStorage
          initializeFromLocalStorage();
        }
        // Authenticated users are not guests
        setIsGuestMode(false);
      });
    } else {
      // Not authenticated - check if guest profile exists
      const guestProfile = localStorage.getItem('aipark_user_profile');
      if (guestProfile) {
        setIsGuestMode(true);
      }
      initializeFromLocalStorage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, isAuthenticated, user]);

  // Phase 8: Load learning progress data from API
  useEffect(() => {
    async function loadProgressData() {
      if (!profile?.username) return;

      try {
        setProgressLoading(true);
        setProgressError(null);

        const response = await fetch(`/api/progress/summary?userId=${encodeURIComponent(profile.username)}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to load progress data');
        }

        if (result.hasData) {
          setProgressData(result.data);
        } else {
          // No data yet - use null to show empty state
          setProgressData(null);
        }
      } catch (error) {
        console.error('Error loading progress data:', error);
        setProgressError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setProgressLoading(false);
      }
    }

    loadProgressData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadProgressData, 30000);
    return () => clearInterval(interval);
  }, [profile?.username]);

  // Fetch learning stats data from API
  useEffect(() => {
    async function loadLearningStats() {
      if (!isAuthenticated || !user) {
        // Guest mode - show empty state
        setLearningStats(null);
        setStatsLoading(false);
        return;
      }

      try {
        setStatsLoading(true);
        const response = await fetch('/api/user/learning-stats');

        if (!response.ok) {
          throw new Error('Failed to fetch learning stats');
        }

        const result = await response.json();

        if (result.success && result.data) {
          setLearningStats(result.data);
        } else {
          setLearningStats(null);
        }
      } catch (error) {
        console.error('Error loading learning stats:', error);
        setLearningStats(null);
      } finally {
        setStatsLoading(false);
      }
    }

    loadLearningStats();

    // Auto-refresh every 60 seconds
    const interval = setInterval(loadLearningStats, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  if (!profile) {
    return <LoadingDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Main Content */}
      <main className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 sm:py-8 lg:py-10">
        <div className="space-y-8">
          {/* P0: Guest Mode Banner */}
          {isGuestMode && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Star className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">게스트 모드로 이용 중입니다</h3>
                    <p className="text-sm text-white/90 mt-1">
                      회원가입하고 학습 기록을 저장하세요! 모든 진도와 성취가 사라질 수 있습니다.
                    </p>
                  </div>
                </div>
                <Link
                  href="/signup"
                  className="px-6 py-3 bg-white text-orange-600 rounded-full font-semibold hover:shadow-xl transition-all whitespace-nowrap"
                >
                  지금 가입하기 →
                </Link>
              </div>
            </motion.div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                DashBoard
              </h1>
              <p className="mt-2 text-gray-600">
                {profile.username}님의 학습 현황과 추천 활동
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{profile.avatar}</span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{profile.username}</p>
                  {isAuthenticated && profileComplete < 100 && (
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      프로필 {profileComplete}%
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{profile.gradeLevel}</p>
              </div>
            </div>
          </div>

          {/* Phase 2: Overall Stats Card */}
          <OverallStatsCard learningStats={learningStats} />

          {/* All Subjects Summary Cards - Hidden */}
          {false && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 xl:gap-8" style={{ gridAutoRows: '480px' }}>
            {/* English Summary - Show empty state if no data */}
            {!learningStats?.english?.hasData ? (
              <EmptyLearningCard
                subject="영어"
                subjectKey="english"
                icon={<BookOpen className="w-6 h-6" />}
                gradient="from-blue-500 via-indigo-600 to-purple-600"
              />
            ) : (
              <Link href="/dashboard/english" className="h-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="h-full bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl p-4 sm:p-5 md:p-6 lg:p-7 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold truncate">영어 학습</h3>
                        <p className="text-xs sm:text-sm text-white/80 truncate">English Dashboard</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold whitespace-nowrap">{learningStats?.english.cefrLevel || 'N/A'}</div>
                      <div className="text-xs text-white/80 whitespace-nowrap">CEFR Level</div>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0">
                  <div className="h-[180px] space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <span className="text-xs sm:text-sm text-white/80 flex items-center gap-1.5 flex-shrink-0">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">이번 주 학습 시간</span>
                        </span>
                        <span className="text-xs sm:text-sm font-semibold flex items-center gap-0.5 sm:gap-1 flex-shrink-0 whitespace-nowrap">
                          <AnimatedCounter value={learningStats?.english.weeklyHours ?? 0} duration={1.5} delay={0.4} className="font-bold" />
                          <span className="text-white/60">/</span>
                          <span>{learningStats?.english.weeklyGoal ?? 0}시간</span>
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          className="h-full bg-white rounded-full relative shadow-lg"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(((learningStats?.english.weeklyHours ?? 0) / (learningStats?.english.weeklyGoal ?? 1)) * 100, 100)}%` }}
                          transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                            initial={{ x: "-100%" }}
                            animate={{ x: "200%" }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              repeatDelay: 2,
                              delay: 0.5,
                            }}
                          />
                        </motion.div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 pt-2">
                      <div className="text-center">
                        <div className="text-xs text-white/70 mb-1">Listening</div>
                        <AnimatedCounter
                          value={learningStats?.english.skills?.listening || 0}
                          suffix="%"
                          duration={1.5}
                          delay={0.6}
                          className="text-lg font-bold"
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-white/70 mb-1">Speaking</div>
                        <AnimatedCounter
                          value={learningStats?.english.skills?.speaking || 0}
                          suffix="%"
                          duration={1.5}
                          delay={0.7}
                          className="text-lg font-bold"
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-white/70 mb-1">Reading</div>
                        <AnimatedCounter
                          value={learningStats?.english.skills?.reading || 0}
                          suffix="%"
                          duration={1.5}
                          delay={0.8}
                          className="text-lg font-bold"
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-white/70 mb-1">Writing</div>
                        <AnimatedCounter
                          value={learningStats?.english.skills?.writing || 0}
                          suffix="%"
                          duration={1.5}
                          delay={0.9}
                          className="text-lg font-bold"
                        />
                      </div>
                    </div>
                  </div>
                  </div>

                  {/* 학습 시작하기 버튼 */}
                  <div className="mt-auto pt-4 border-t border-white/20">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full font-semibold transition-all"
                    >
                      영어 학습 시작하기 →
                    </motion.button>
                  </div>
                </motion.div>
              </Link>
            )}

            {/* Math Summary - Show empty state if no data */}
            {!learningStats?.math?.hasData ? (
              <EmptyLearningCard
                subject="수학"
                subjectKey="math"
                icon={<Calculator className="w-6 h-6" />}
                gradient="from-purple-500 via-pink-600 to-rose-600"
              />
            ) : (
              <Link href="/dashboard/math" className="h-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="h-full bg-gradient-to-br from-purple-500 via-pink-600 to-rose-600 rounded-2xl p-4 sm:p-5 md:p-6 lg:p-7 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                        <Calculator className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold truncate">수학 학습</h3>
                        <p className="text-xs sm:text-sm text-white/80 truncate">Math Dashboard</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold whitespace-nowrap">{getKoreanGradeLevel(learningStats.math.gradeLevel || profile?.gradeLevel)}</div>
                      <div className="text-xs text-white/80 whitespace-nowrap">학년</div>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0">
                  <div className="h-[180px] space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <span className="text-xs sm:text-sm text-white/80 flex items-center gap-1.5 flex-shrink-0">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">이번 주 학습 시간</span>
                        </span>
                        <span className="text-xs sm:text-sm font-semibold flex items-center gap-0.5 sm:gap-1 flex-shrink-0 whitespace-nowrap">
                          <AnimatedCounter value={learningStats.math.weeklyHours} duration={1.5} delay={0.5} className="font-bold" />
                          <span className="text-white/60">/</span>
                          <span>{learningStats.math.weeklyGoal}시간</span>
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          className="h-full bg-white rounded-full relative shadow-lg"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((learningStats.math.weeklyHours / learningStats.math.weeklyGoal) * 100, 100)}%` }}
                          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                            initial={{ x: "-100%" }}
                            animate={{ x: "200%" }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              repeatDelay: 2,
                              delay: 0.6,
                            }}
                          />
                        </motion.div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 pt-2">
                      <div className="text-center">
                        <div className="text-xs text-white/70 mb-1">완료</div>
                        <AnimatedCounter
                          value={learningStats.math.completedUnits || 0}
                          duration={1.5}
                          delay={0.6}
                          className="text-lg font-bold"
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-white/70 mb-1">총</div>
                        <AnimatedCounter
                          value={learningStats.math.totalUnits || 0}
                          duration={1.5}
                          delay={0.7}
                          className="text-lg font-bold"
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-white/70 mb-1">진도율</div>
                        <AnimatedCounter
                          value={learningStats.math.totalUnits > 0 ? Math.round((learningStats.math.completedUnits / learningStats.math.totalUnits) * 100) : 0}
                          suffix="%"
                          duration={1.5}
                          delay={0.8}
                          className="text-lg font-bold"
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-white/70 mb-1">레벨</div>
                        <div className="text-lg font-bold">{learningStats.math.gradeLevel || '초등 1학년'}</div>
                      </div>
                    </div>
                  </div>
                  </div>

                  {/* 학습 시작하기 버튼 */}
                  <div className="mt-auto pt-4 border-t border-white/20">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full font-semibold transition-all"
                    >
                      수학 학습 시작하기 →
                    </motion.button>
                  </div>
                </motion.div>
              </Link>
            )}

            {/* Science Summary - Show empty state if no data */}
            {!learningStats?.science?.hasData ? (
              <EmptyLearningCard
                subject="과학"
                subjectKey="science"
                icon={<Beaker className="w-6 h-6" />}
                gradient="from-cyan-500 via-blue-600 to-indigo-600"
              />
            ) : (
              <Link href="/dashboard/science" className="h-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="h-full bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 rounded-2xl p-4 sm:p-5 md:p-6 lg:p-7 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                        <Beaker className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold truncate">과학 학습</h3>
                        <p className="text-xs sm:text-sm text-white/80 truncate">Science Dashboard</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold whitespace-nowrap">{getKoreanGradeLevel(learningStats.science.gradeLevel || profile?.gradeLevel)}</div>
                      <div className="text-xs text-white/80 whitespace-nowrap">학년</div>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0">
                  <div className="h-[180px] space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <span className="text-xs sm:text-sm text-white/80 flex items-center gap-1.5 flex-shrink-0">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">이번 주 학습 시간</span>
                        </span>
                        <span className="text-xs sm:text-sm font-semibold flex items-center gap-0.5 sm:gap-1 flex-shrink-0 whitespace-nowrap">
                          <AnimatedCounter value={learningStats.science.weeklyHours} duration={1.5} delay={0.6} className="font-bold" />
                          <span className="text-white/60">/</span>
                          <span>{learningStats.science.weeklyGoal}시간</span>
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          className="h-full bg-white rounded-full relative shadow-lg"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((learningStats.science.weeklyHours / learningStats.science.weeklyGoal) * 100, 100)}%` }}
                          transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                            initial={{ x: "-100%" }}
                            animate={{ x: "200%" }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              repeatDelay: 2,
                              delay: 0.7,
                            }}
                          />
                        </motion.div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <motion.div
                        className="bg-white/10 rounded-lg p-3 backdrop-blur-sm"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9, duration: 0.3 }}
                      >
                        <div className="flex items-center gap-1.5 text-xs text-white/70 mb-1.5">
                          <PulseIndicator color="green" size="sm" />
                          완료한 단원
                        </div>
                        <div className="text-lg font-bold flex items-baseline gap-1">
                          <AnimatedCounter value={learningStats.science.completedUnits || 0} duration={1.2} delay={1.1} />
                          <span className="text-sm text-white/60">/</span>
                          <span className="text-sm">{learningStats.science.totalUnits || 0}</span>
                        </div>
                      </motion.div>
                      <motion.div
                        className="bg-white/10 rounded-lg p-3 backdrop-blur-sm"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.0, duration: 0.3 }}
                      >
                        <div className="flex items-center gap-1.5 text-xs text-white/70 mb-1.5">
                          <PulseIndicator color="blue" size="sm" />
                          학습 중
                        </div>
                        <motion.div
                          className="text-sm font-bold"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.2, duration: 0.3 }}
                        >
                          {learningStats.science.currentTopic || '주제 없음'}
                        </motion.div>
                      </motion.div>
                    </div>
                  </div>
                  </div>

                  {/* 학습 시작하기 버튼 */}
                  <div className="mt-auto pt-4 border-t border-white/20">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full font-semibold transition-all"
                    >
                      과학 학습 시작하기 →
                    </motion.button>
                  </div>
                </motion.div>
              </Link>
            )}

            {/* Social Studies Summary - Show empty state if no data */}
            {!learningStats?.social?.hasData ? (
              <EmptyLearningCard
                subject="사회"
                subjectKey="social-studies"
                icon={<Landmark className="w-6 h-6" />}
                gradient="from-orange-500 via-amber-600 to-yellow-600"
              />
            ) : (
              <Link href="/dashboard/social" className="h-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="h-full bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 rounded-2xl p-4 sm:p-5 md:p-6 lg:p-7 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                        <Landmark className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold truncate">사회 학습</h3>
                        <p className="text-xs sm:text-sm text-white/80 truncate">Social Studies Dashboard</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold whitespace-nowrap">{getKoreanGradeLevel(learningStats.social.gradeLevel || profile?.gradeLevel)}</div>
                      <div className="text-xs text-white/80 whitespace-nowrap">학년</div>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0">
                  <div className="h-[180px] space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <span className="text-xs sm:text-sm text-white/80 flex items-center gap-1.5 flex-shrink-0">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">이번 주 학습 시간</span>
                        </span>
                        <span className="text-xs sm:text-sm font-semibold flex items-center gap-0.5 sm:gap-1 flex-shrink-0 whitespace-nowrap">
                          <AnimatedCounter value={learningStats.social.weeklyHours} duration={1.5} delay={0.7} className="font-bold" />
                          <span className="text-white/60">/</span>
                          <span>{learningStats.social.weeklyGoal}시간</span>
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          className="h-full bg-white rounded-full relative shadow-lg"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((learningStats.social.weeklyHours / learningStats.social.weeklyGoal) * 100, 100)}%` }}
                          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                            initial={{ x: "-100%" }}
                            animate={{ x: "200%" }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              repeatDelay: 2,
                              delay: 0.8,
                            }}
                          />
                        </motion.div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <motion.div
                        className="bg-white/10 rounded-lg p-3 backdrop-blur-sm"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.0, duration: 0.3 }}
                      >
                        <div className="flex items-center gap-1.5 text-xs text-white/70 mb-1.5">
                          <PulseIndicator color="green" size="sm" />
                          완료한 단원
                        </div>
                        <div className="text-lg font-bold flex items-baseline gap-1">
                          <AnimatedCounter value={learningStats.social.completedUnits || 0} duration={1.2} delay={1.2} />
                          <span className="text-sm text-white/60">/</span>
                          <span className="text-sm">{learningStats.social.totalUnits || 0}</span>
                        </div>
                      </motion.div>
                      <motion.div
                        className="bg-white/10 rounded-lg p-3 backdrop-blur-sm"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.1, duration: 0.3 }}
                      >
                        <div className="flex items-center gap-1.5 text-xs text-white/70 mb-1.5">
                          <PulseIndicator color="blue" size="sm" />
                          학습 중
                        </div>
                        <motion.div
                          className="text-sm font-bold"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.3, duration: 0.3 }}
                        >
                          {learningStats.social.currentTopic || '주제 없음'}
                        </motion.div>
                      </motion.div>
                    </div>
                  </div>
                  </div>

                  {/* 학습 시작하기 버튼 */}
                  <div className="mt-auto pt-4 border-t border-white/20">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full font-semibold transition-all"
                    >
                      사회 학습 시작하기 →
                    </motion.button>
                  </div>
                </motion.div>
              </Link>
            )}

            {/* Korean Summary - Show empty state for now */}
            <EmptyLearningCard
              subject="국어"
              subjectKey="korean"
              icon={<BookMarked className="w-6 h-6" />}
              gradient="from-pink-500 via-rose-600 to-red-600"
            />
          </div>)}

          {/* Phase 2: Subject Comparison Chart - Hidden */}
          {false && (<SubjectComparisonChart learningStats={learningStats} />)}

          {/* Phase 2: Recent Activity Summary - Hidden */}
          {false && (<RecentActivitySummary learningStats={learningStats} maxItems={3} />)}

          {/* Quick Start Section - Continue Learning - Hidden */}
          {false && (<motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
              빠른 시작
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6 lg:gap-8 auto-rows-fr">
              {/* Continue English */}
              <Link href="/dashboard/english" className="h-full">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-1">
                          {learningStats?.english?.detailed?.lastSession
                            ? '영어 튜터 계속하기'
                            : '영어 튜터 시작하기'}
                        </h4>
                        {learningStats?.english?.detailed?.lastSession ? (
                          <p className="text-sm text-white/80">
                            마지막 주제: &ldquo;{learningStats?.english.detailed.lastSession.topic}&rdquo;
                          </p>
                        ) : (
                          <p className="text-sm text-white/80">
                            AI와 실시간 영어 대화
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-2xl">→</div>
                  </div>
                </motion.div>
              </Link>

              {/* Continue Math */}
              <Link href="/dashboard/math" className="h-full">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Calculator className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-1">
                          {learningStats?.math?.detailed?.lastSession
                            ? '수학 튜터 계속하기'
                            : '수학 튜터 시작하기'}
                        </h4>
                        {learningStats?.math?.detailed?.lastSession ? (
                          <p className="text-sm text-white/80">
                            마지막 주제: &ldquo;{learningStats.math.detailed.lastSession.topic}&rdquo;
                          </p>
                        ) : (
                          <p className="text-sm text-white/80">
                            AI와 수학 문제 풀이
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-2xl">→</div>
                  </div>
                </motion.div>
              </Link>

              {/* Continue Science */}
              <Link href="/dashboard/science" className="h-full">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Beaker className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-1">
                          {learningStats?.science?.currentTopic
                            ? '과학 튜터 계속하기'
                            : '과학 튜터 시작하기'}
                        </h4>
                        {learningStats?.science?.currentTopic ? (
                          <p className="text-sm text-white/80">
                            마지막 주제: &ldquo;{learningStats.science.currentTopic}&rdquo;
                          </p>
                        ) : (
                          <p className="text-sm text-white/80">
                            AI와 과학 학습
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-2xl">→</div>
                  </div>
                </motion.div>
              </Link>

              {/* Continue Social Studies */}
              <Link href="/dashboard/social" className="h-full">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-full bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Landmark className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-1">
                          {learningStats?.social?.currentTopic
                            ? '사회 튜터 계속하기'
                            : '사회 튜터 시작하기'}
                        </h4>
                        {learningStats?.social?.currentTopic ? (
                          <p className="text-sm text-white/80">
                            마지막 주제: &ldquo;{learningStats.social.currentTopic}&rdquo;
                          </p>
                        ) : (
                          <p className="text-sm text-white/80">
                            AI와 사회 학습
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-2xl">→</div>
                  </div>
                </motion.div>
              </Link>

              {/* NEW: Korean Tutor */}
              <Link href="/dashboard/korean" className="h-full">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-full bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-1">
                          국어 튜터 시작하기 📚
                        </h4>
                        <p className="text-sm text-white/80">
                          읽기, 쓰기, 문법, 문학
                        </p>
                      </div>
                    </div>
                    <div className="text-2xl">→</div>
                  </div>
                </motion.div>
              </Link>
            </div>
          </motion.div>)}

          {/* Top Section: Level & Streak */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LevelProgress />
            {profile.streak && (
              <StreakWidget streakData={profile.streak} size="medium" />
            )}
          </div>

          {/* Daily Goals Section */}
          {profile.dailyGoals && (
            <DailyGoalsWidget goalsProgress={profile.dailyGoals} size="medium" />
          )}

          {/* Learning Goals Section */}
          <GoalsWidget gradeLevel={profile?.gradeLevel || 'middle'} userId={user?.email} />

          {/* Goal Achievement Timeline */}
          <GoalTimeline userId={user?.email} />

          {/* Weekly Stats */}
          <WeeklyStats />

          {/* Achievement Badges */}
          <AchievementBadges />

          {/* Phase 7 & 8: Learning Progress Visualization (Real-time Data) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                학습 진행도
              </h2>
              <div className="flex items-center gap-2">
                {progressLoading && (
                  <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                )}
                <div className="px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full text-xs font-bold">
                  Phase 8 🔥
                </div>
              </div>
            </div>

            {progressError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                <p className="font-semibold">데이터 로딩 오류</p>
                <p className="text-sm mt-1">{progressError}</p>
              </div>
            )}

            {!progressLoading && !progressError && !progressData && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">
                  아직 학습 데이터가 없습니다
                </h3>
                <p className="text-blue-700">
                  수학 또는 영어 튜터와 대화를 시작하면 학습 진행도가 표시됩니다!
                </p>
              </div>
            )}

            {progressData && (
              <>
                {/* Learning Progress Overview */}
                <LearningProgressOverview progressData={progressData} />

                {/* Adaptive Difficulty Indicators - Phase 8 Auto-Adjustment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DifficultyIndicator userId={profile.username} subject="math" />
                  <DifficultyIndicator userId={profile.username} subject="english" />
                </div>

                {/* Math Topic Progress */}
                <MathTopicProgress
                  gradeLevel={(profile.gradeLevel as any) || 'elementary'}
                  topics={learningStats?.math?.detailed?.chapters}
                />

                {/* Weakness Analysis */}
                <WeaknessAnalysis
                  weaknesses={progressData.weaknesses || []}
                  gradeLevel={(profile.gradeLevel as any) || 'elementary'}
                />
              </>
            )}
          </div>

          {/* Supplementary Learning Activities - Hidden */}
          {false && (<div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-600" />
              보조 학습 활동
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {/* Microlearning */}
              <Link href="/microlearning">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h4 className="text-lg font-bold mb-2">마이크로러닝</h4>
                  <p className="text-sm text-white/80">5-10분 집중 학습</p>
                </motion.div>
              </Link>

              {/* Quiz */}
              <Link href="/quiz">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">AI 퀴즈</h4>
                  <p className="text-sm text-white/80">맞춤형 퀴즈 테스트</p>
                </motion.div>
              </Link>

              {/* Flashcards */}
              <Link href="/flashcards">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <span className="text-2xl">🗂️</span>
                  </div>
                  <h4 className="text-lg font-bold mb-2">플래시카드</h4>
                  <p className="text-sm text-white/80">SM-2 알고리즘 복습</p>
                </motion.div>
              </Link>

              {/* Review */}
              <Link href="/review">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <h4 className="text-lg font-bold mb-2">간격 반복</h4>
                  <p className="text-sm text-white/80">체계적 복습</p>
                </motion.div>
              </Link>

              {/* Pronunciation Practice */}
              <Link href="/pronunciation-practice">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold mb-2">발음 연습</h4>
                  <p className="text-sm text-white/80">AI 발음 분석</p>
                </motion.div>
              </Link>

              {/* Math Visualization */}
              <Link href="/math-visualization">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-orange-600 to-amber-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">수학 시각화</h4>
                  <p className="text-sm text-white/80">인터랙티브 그래프</p>
                </motion.div>
              </Link>
            </div>
          </div>)}

          {/* Analytics & Reports */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              학습 분석 및 리포트
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {/* Learning Report */}
              <Link href="/learning-report">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">학습 리포트</h4>
                  <p className="text-sm text-white/80">일별/주간 학습 기록 및 성과 분석</p>
                  <div className="mt-3 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">
                    Phase 8.5 📊
                  </div>
                </motion.div>
              </Link>

              {/* Analytics */}
              <Link href="/analytics">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-purple-600 to-pink-700 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <Target className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">학습 분석</h4>
                  <p className="text-sm text-white/80">AI 기반 개인화 진단 및 추천</p>
                  <div className="mt-3 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">
                    Phase 8 ✨
                  </div>
                </motion.div>
              </Link>

              {/* Emotion Report */}
              <Link href="/emotion-report">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-pink-600 to-rose-700 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold mb-2">감정 분석</h4>
                  <p className="text-sm text-white/80">학습 감정 트렌드 및 패턴</p>
                  <div className="mt-3 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">
                    Phase 12 🎭
                  </div>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 브랜드 */}
            <div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                AI Park
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                AI 기반 개인 맞춤형 학습 플랫폼으로 영어, 수학, 과학, 사회, 국어를 효과적으로 학습하세요.
              </p>
              <div className="mt-4 flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center">
                  <span className="text-sm">📘</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center">
                  <span className="text-sm">🐦</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center">
                  <span className="text-sm">📸</span>
                </a>
              </div>
            </div>

            {/* 서비스 */}
            <div>
              <h4 className="font-semibold mb-4">서비스</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard/english" className="text-gray-400 hover:text-white transition-colors text-sm">
                    영어 튜터
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/math" className="text-gray-400 hover:text-white transition-colors text-sm">
                    수학 튜터
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/science" className="text-gray-400 hover:text-white transition-colors text-sm">
                    과학 튜터
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/social" className="text-gray-400 hover:text-white transition-colors text-sm">
                    사회 튜터
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/korean" className="text-gray-400 hover:text-white transition-colors text-sm">
                    국어 튜터
                  </Link>
                </li>
              </ul>
            </div>

            {/* 대시보드 */}
            <div>
              <h4 className="font-semibold mb-4">대시보드</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
                    전체 대시보드
                  </Link>
                </li>
                <li>
                  <Link href="/learning-report" className="text-gray-400 hover:text-white transition-colors text-sm">
                    학습 리포트
                  </Link>
                </li>
                <li>
                  <Link href="/analytics" className="text-gray-400 hover:text-white transition-colors text-sm">
                    학습 분석
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="text-gray-400 hover:text-white transition-colors text-sm">
                    프로필 설정
                  </Link>
                </li>
              </ul>
            </div>

            {/* 지원 */}
            <div>
              <h4 className="font-semibold mb-4">지원</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/help" className="text-gray-400 hover:text-white transition-colors text-sm">
                    도움말
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">
                    자주 묻는 질문
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                    문의하기
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                    개인정보처리방침
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 AI Park. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ForceDynamic() {
  useSearchParams();
  return null;
}

export default function DashboardPage() {
  return (
    <>
      <Suspense fallback={null}>
        <ForceDynamic />
      </Suspense>
      <Suspense fallback={<LoadingDashboard />}>
        <DashboardContent />
      </Suspense>
    </>
  );
}
