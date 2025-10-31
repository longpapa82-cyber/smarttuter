"use client";

import dynamic from 'next/dynamic';
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Calculator, BarChart3, Trophy, Target, TrendingUp, Award, Clock, Star, Zap, Home } from "lucide-react";
import { useUserStore } from "@/lib/gamification/store";
import { useAdaptiveLearning } from "@/lib/adaptive-learning/store";
import { useInteractiveLearning } from "@/lib/interactive-learning/store";
import { LevelProgress } from "@/components/gamification/LevelProgress";
import { StreakDisplay } from "@/components/gamification/StreakDisplay";
import { WeeklyStats } from "@/components/gamification/WeeklyStats";
import { AchievementBadges } from "@/components/gamification/AchievementBadges";

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const initializeProfile = useUserStore((state) => state.initializeProfile);
  const initializeAdaptiveProfile = useAdaptiveLearning((state) => state.initializeProfile);
  const initializeInteractiveProfile = useInteractiveLearning((state) => state.initializeProfile);

  // Initialize stores from onboarding data if available
  useEffect(() => {
    if (!profile && typeof window !== 'undefined') {
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
        } catch (error) {
          console.error('Failed to initialize from onboarding data:', error);
          router.push("/onboarding");
        }
      } else {
        // No onboarding data, redirect to onboarding
        router.push("/onboarding");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  if (!profile) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="text-sm font-medium">홈</span>
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                내 대시보드
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{profile.avatar}</span>
              <div>
                <p className="font-semibold text-gray-900">{profile.username}</p>
                <p className="text-sm text-gray-600">{profile.gradeLevel}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Top Section: Level & Streak */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LevelProgress />
            <StreakDisplay />
          </div>

          {/* Weekly Stats */}
          <WeeklyStats />

          {/* Achievement Badges */}
          <AchievementBadges />

          {/* Analytics Link */}
          <Link href="/analytics" className="mt-16">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <BarChart3 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">학습 분석</h4>
                    <p className="text-sm text-white/80">
                      AI 기반 개인화 진단 및 학습 경로 추천
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/60 mb-1">Phase 8</div>
                  <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                    NEW ✨
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              학습 시작하기
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/tutor/english">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">영어 튜터</h4>
                      <p className="text-sm text-white/80">
                        영어 대화 연습 시작하기
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Link>

              <Link href="/tutor/math">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Calculator className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">수학 튜터</h4>
                      <p className="text-sm text-white/80">
                        수학 문제 풀이 시작하기
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </div>
          </div>

          {/* Phase 9: Interactive Learning */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                인터랙티브 학습
              </h3>
              <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs font-bold">
                NEW 🚀
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/quiz">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl">
                      🎯
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">AI 퀴즈</h4>
                      <p className="text-sm text-white/80">
                        맞춤형 퀴즈로 실력 테스트
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Link>

              <Link href="/flashcards">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl">
                      🗂️
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">스마트 플래시카드</h4>
                      <p className="text-sm text-white/80">
                        SM-2 알고리즘 기반 복습
                      </p>
                    </div>
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
      <Suspense fallback={<LoadingSpinner />}>
        <DashboardContent />
      </Suspense>
    </>
  );
}
