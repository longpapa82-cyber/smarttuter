"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Landmark, TrendingUp, Globe, BookOpen, Gamepad2, FileEdit } from "lucide-react";
import { useUserStore } from "@/lib/gamification/store";
import { useAuth } from "@/hooks/useAuth";
import { SubjectBreadcrumb } from "@/components/dashboard/Breadcrumb";
import {
  DashboardSkeleton,
  LoadingSpinner,
  SubjectHeader,
  TutorCTA,
  ProgressCard,
  SkeletonSupplementaryCard,
  SkeletonAnalysisCard
} from "@/components/dashboard/subject";
import type { SocialDetailedStats } from "@/types/learning-stats";

// Dynamic imports for heavy components
const EmptySubjectDashboard = dynamic(
  () => import("@/components/dashboard/EmptySubjectDashboard").then(mod => ({ default: mod.EmptySubjectDashboard })),
  { ssr: false }
);

const LearningAnalyticsDashboard = dynamic(
  () => import("@/components/dashboard/LearningAnalyticsDashboard").then(mod => ({ default: mod.LearningAnalyticsDashboard })),
  {
    loading: () => (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    ),
    ssr: false
  }
);

// Lazy load below-the-fold components
const SupplementaryLearningCard = dynamic(
  () => import("@/components/dashboard/subject").then(mod => ({ default: mod.SupplementaryLearningCard })),
  {
    loading: () => <SkeletonSupplementaryCard />,
    ssr: false
  }
);

const AnalysisCard = dynamic(
  () => import("@/components/dashboard/subject").then(mod => ({ default: mod.AnalysisCard })),
  {
    loading: () => <SkeletonAnalysisCard />,
    ssr: false
  }
);

function SocialDashboardContent() {
  const { isAuthenticated, user } = useAuth();
  const profile = useUserStore((state) => state.profile);
  const [stats, setStats] = useState<SocialDetailedStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Social learning stats from API
  useEffect(() => {
    async function loadStats() {
      // Guest mode or not authenticated - show empty state without API call
      if (!isAuthenticated || !user) {
        setStats(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('/api/user/learning-stats?subject=social');

        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }

        const result = await response.json();

        if (result.success && result.data) {
          setStats(result.data);
        } else {
          setStats(null);
        }
      } catch (error) {
        console.error('Error loading Social stats:', error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    }

    loadStats();

    // Auto-refresh every 60 seconds
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  // Loading state
  if (loading) {
    return (
      <LoadingSpinner
        gradientFrom="orange-50"
        gradientVia="amber-50"
        gradientTo="yellow-50"
      />
    );
  }

  // Empty state - no learning data
  const hasData = stats && (
    stats.lastSession !== null ||
    stats.periods.length > 0 ||
    stats.gradeProgress !== null
  );

  if (!hasData) {
    return <EmptySubjectDashboard subject="social" showBeta={true} />;
  }

  // Data exists - render dashboard with real data
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 sm:py-8 lg:py-10">
        {/* Breadcrumb */}
        <SubjectBreadcrumb
          subject="social"
          icon={<Landmark className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />}
        />

        {/* Header */}
        <SubjectHeader
          icon={<Landmark className="w-8 h-8 text-orange-600" />}
          title="Social DashBoard"
          subject="Social"
          username={profile?.username}
          description="사회 학습 현황과 추천 활동"
        />

        <div className="space-y-8">
          {/* Main Learning Section - 사회 튜터 계속하기 */}
          <TutorCTA
            subject="social"
            icon={<Landmark className="w-8 h-8" />}
            title="사회 튜터와 학습 계속하기"
            subtitle="AI 튜터와 사회 탐구"
            tutorLink="/tutor/social-studies"
            gradientFrom="orange-600"
            gradientVia="amber-600"
            gradientTo="yellow-600"
            lastSession={stats.lastSession}
            nextTopic={stats.nextTopic}
          />

          {/* Progress Section */}
          <ProgressCard
            title="사회 학습 진행도"
            iconColor="orange-600"
            gradeProgress={stats.gradeProgress}
            monthlyHours={stats.monthlyHours}
            progressItems={stats.periods}
            progressLabel="시대별/지역별 진행도"
            gradientFrom="orange-500"
            gradientTo="amber-600"
          />

          {/* Supplementary Learning Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              <span className="leading-tight">보조 학습 (사회)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {/* Historical Timeline */}
              <SupplementaryLearningCard
                href="/timeline"
                icon={<Globe className="w-6 h-6" />}
                title="역사 타임라인"
                description="역사적 사건 흐름 파악"
                badge="Interactive"
                gradientFrom="amber-500"
                gradientTo="orange-600"
              />

              {/* Geography Quiz */}
              <SupplementaryLearningCard
                href="/quiz"
                icon={<Gamepad2 className="w-6 h-6" />}
                title="지리 퀴즈"
                description="지리 지식 확인"
                badge="AI 맞춤형"
                gradientFrom="yellow-500"
                gradientTo="amber-600"
              />

              {/* Historical Events Flashcards */}
              <SupplementaryLearningCard
                href="/flashcards"
                icon={<BookOpen className="w-6 h-6" />}
                title="역사 암기"
                description="주요 사건 복습"
                badge="SM-2 알고리즘"
                gradientFrom="orange-500"
                gradientTo="red-600"
              />

              {/* Essay Practice */}
              <SupplementaryLearningCard
                href="/microlearning"
                icon={<FileEdit className="w-6 h-6" />}
                title="논술 연습"
                description="역사적 사건 분석"
                badge="5-10분 학습"
                gradientFrom="green-500"
                gradientTo="emerald-600"
              />
            </div>
          </motion.div>

          {/* Analysis Section */}
          <AnalysisCard
            title="사회 학습 분석"
            analysis={stats.analysis}
            tutorLink="/tutor/social-studies"
            highlightColor="orange"
          />

          {/* Learning Analytics Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-orange-600" />
                학습 분석 대시보드
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                학습 패턴을 분석하고 효과적인 학습 경로를 추천해드립니다
              </p>
            </div>
            <LearningAnalyticsDashboard
              userId={user?.email || ''}
              subject="social"
              subjectColor="orange"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function SocialDashboardPage() {
  return (
    <Suspense fallback={
      <DashboardSkeleton
        gradientFrom="orange-50"
        gradientVia="amber-50"
        gradientTo="yellow-50"
      />
    }>
      <SocialDashboardContent />
    </Suspense>
  );
}
