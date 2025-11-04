"use client";

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Calculator, Beaker, Landmark, BarChart3, Trophy, Target, TrendingUp, Award, Clock, Star, Zap, Home, Flame } from "lucide-react";
import { useUserStore } from "@/lib/gamification/store";
import { useAdaptiveLearning } from "@/lib/adaptive-learning/store";
import { useInteractiveLearning } from "@/lib/interactive-learning/store";
import { LevelProgress } from "@/components/gamification/LevelProgress";
import { StreakDisplay } from "@/components/gamification/StreakDisplay";
import { StreakWidget } from "@/components/gamification/StreakWidget";
import { DailyGoalsWidget } from "@/components/gamification/DailyGoalsWidget";
import { WeeklyStats } from "@/components/gamification/WeeklyStats";
import { AchievementBadges } from "@/components/gamification/AchievementBadges";
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
          router.push("/onboarding");
          return false;
        }
      } else if (!isAuthenticated) {
        // No onboarding data and not authenticated, redirect to onboarding
        router.push("/onboarding");
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

  if (!profile) {
    return <LoadingDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                전체 대시보드
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

          {/* English & Math Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* English Summary */}
            <Link href="/dashboard/english">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">영어 학습</h3>
                      <p className="text-sm text-white/80">English Dashboard</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">A2</div>
                    <div className="text-xs text-white/80">CEFR Level</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/80 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        이번 주 학습 시간
                      </span>
                      <span className="text-sm font-semibold flex items-center gap-1">
                        <AnimatedCounter value={12} duration={1.5} delay={0.4} className="font-bold" />
                        <span className="text-white/60">/</span>
                        <span>20시간</span>
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        className="h-full bg-white rounded-full relative shadow-lg"
                        initial={{ width: 0 }}
                        animate={{ width: '60%' }}
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
                        value={80}
                        suffix="%"
                        duration={1.5}
                        delay={0.6}
                        className="text-lg font-bold"
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-white/70 mb-1">Speaking</div>
                      <AnimatedCounter
                        value={60}
                        suffix="%"
                        duration={1.5}
                        delay={0.7}
                        className="text-lg font-bold"
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-white/70 mb-1">Reading</div>
                      <AnimatedCounter
                        value={100}
                        suffix="%"
                        duration={1.5}
                        delay={0.8}
                        className="text-lg font-bold"
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-white/70 mb-1">Writing</div>
                      <AnimatedCounter
                        value={40}
                        suffix="%"
                        duration={1.5}
                        delay={0.9}
                        className="text-lg font-bold"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Math Summary */}
            <Link href="/dashboard/math">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-gradient-to-br from-purple-500 via-pink-600 to-rose-600 rounded-2xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Calculator className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">수학 학습</h3>
                      <p className="text-sm text-white/80">Math Dashboard</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">중2</div>
                    <div className="text-xs text-white/80">Grade Level</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/80 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        이번 주 학습 시간
                      </span>
                      <span className="text-sm font-semibold flex items-center gap-1">
                        <AnimatedCounter value={8} duration={1.5} delay={0.5} className="font-bold" />
                        <span className="text-white/60">/</span>
                        <span>15시간</span>
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        className="h-full bg-white rounded-full relative shadow-lg"
                        initial={{ width: 0 }}
                        animate={{ width: '53%' }}
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
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <motion.div
                      className="bg-white/10 rounded-lg p-3 backdrop-blur-sm"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7, duration: 0.3 }}
                    >
                      <div className="flex items-center gap-1.5 text-xs text-white/70 mb-1.5">
                        <PulseIndicator color="green" size="sm" />
                        완료한 단원
                      </div>
                      <div className="text-lg font-bold flex items-baseline gap-1">
                        <AnimatedCounter value={2} duration={1.2} delay={0.9} />
                        <span className="text-sm text-white/60">/</span>
                        <span className="text-sm">5</span>
                      </div>
                    </motion.div>
                    <motion.div
                      className="bg-white/10 rounded-lg p-3 backdrop-blur-sm"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8, duration: 0.3 }}
                    >
                      <div className="flex items-center gap-1.5 text-xs text-white/70 mb-1.5">
                        <PulseIndicator color="blue" size="sm" />
                        학습 중
                      </div>
                      <motion.div
                        className="text-sm font-bold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.3 }}
                      >
                        이차방정식
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>

          {/* Quick Start Section - Continue Learning */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              빠른 시작
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Continue English */}
              <Link href="/tutor/english">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-1">영어 튜터 계속하기</h4>
                        <p className="text-sm text-white/80">
                          마지막 주제: &ldquo;Daily Conversation&rdquo;
                        </p>
                      </div>
                    </div>
                    <div className="text-2xl">→</div>
                  </div>
                </motion.div>
              </Link>

              {/* Continue Math */}
              <Link href="/tutor/math">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Calculator className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-1">수학 튜터 계속하기</h4>
                        <p className="text-sm text-white/80">
                          마지막 주제: &ldquo;이차방정식 풀이&rdquo;
                        </p>
                      </div>
                    </div>
                    <div className="text-2xl">→</div>
                  </div>
                </motion.div>
              </Link>

              {/* Continue Science */}
              <Link href="/tutor/science">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Beaker className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-1">과학 튜터 계속하기</h4>
                        <p className="text-sm text-white/80">
                          마지막 주제: &ldquo;물질의 상태&rdquo;
                        </p>
                      </div>
                    </div>
                    <div className="text-2xl">→</div>
                  </div>
                </motion.div>
              </Link>

              {/* Continue Social Studies */}
              <Link href="/tutor/social-studies">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Landmark className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-1">사회 튜터 계속하기</h4>
                        <p className="text-sm text-white/80">
                          마지막 주제: &ldquo;세계 지리&rdquo;
                        </p>
                      </div>
                    </div>
                    <div className="text-2xl">→</div>
                  </div>
                </motion.div>
              </Link>
            </div>
          </motion.div>

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
                <MathTopicProgress gradeLevel={(profile.gradeLevel as any) || 'elementary'} />

                {/* Weakness Analysis */}
                <WeaknessAnalysis
                  weaknesses={progressData.weaknesses || []}
                  gradeLevel={(profile.gradeLevel as any) || 'elementary'}
                />
              </>
            )}
          </div>

          {/* Supplementary Learning Activities */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-600" />
              보조 학습 활동
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <div className="mt-3 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">
                    Phase 10 🎤
                  </div>
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
                  <div className="mt-3 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">
                    Phase 10 📊
                  </div>
                </motion.div>
              </Link>
            </div>
          </div>

          {/* Analytics & Reports */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              학습 분석 및 리포트
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
