"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { BookOpen, TrendingUp, Target, Award, Book, Gamepad2, FileEdit, Languages } from "lucide-react";
import { useUserStore } from "@/lib/gamification/store";
import { useAuth } from "@/hooks/useAuth";
import { SubjectBreadcrumb } from "@/components/dashboard/Breadcrumb";
import {
  DashboardSkeleton,
  LoadingSpinner,
  SubjectHeader,
  TutorCTA,
  SupplementaryLearningCard,
  AnalysisCard
} from "@/components/dashboard/subject";
import type { KoreanDetailedStats } from "@/types/learning-stats";

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

function KoreanDashboardContent() {
  const { isAuthenticated, user } = useAuth();
  const profile = useUserStore((state) => state.profile);
  const [stats, setStats] = useState<KoreanDetailedStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Korean learning stats from API
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
        const response = await fetch('/api/user/learning-stats?subject=korean');

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
        console.error('Error loading Korean stats:', error);
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
    stats.topics.length > 0
  );

  if (!hasData) {
    return <EmptySubjectDashboard subject="korean" />;
  }

  // Data exists - render dashboard with real data
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 sm:py-8 lg:py-10">
        {/* Breadcrumb */}
        <SubjectBreadcrumb
          subject="korean"
          icon={<BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />}
        />

        {/* Header */}
        <SubjectHeader
          icon={<BookOpen className="w-8 h-8 text-orange-600" />}
          title="Korean DashBoard"
          subject="Korean"
          username={profile?.username}
          description="국어 학습 현황과 추천 활동"
        />

        <div className="space-y-8">
          {/* Main Learning Section - 국어 튜터 계속하기 */}
          <TutorCTA
            subject="korean"
            icon={<BookOpen className="w-8 h-8" />}
            title="국어 튜터와 대화 계속하기"
            subtitle="AI 튜터와 실시간 국어 학습"
            tutorLink="/tutor/korean"
            gradientFrom="orange-600"
            gradientVia="amber-600"
            gradientTo="yellow-600"
            lastSession={stats.lastSession}
            nextTopic={stats.nextTopic}
          />

          {/* Progress Section - Korean Specific */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-orange-600" />
              국어 학습 진행도
            </h3>

            <div className="space-y-6">
              {/* Grade Progress */}
              {stats.gradeProgress && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">학년별 진행도</span>
                    <span className="text-sm text-gray-600">{stats.gradeProgress.level}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-amber-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${stats.gradeProgress.progress}%` }}
                    />
                  </div>
                  <div className="text-right mt-1">
                    <span className="text-xs font-semibold text-orange-600">{stats.gradeProgress.progress}%</span>
                  </div>
                </div>
              )}

              {/* Monthly Hours */}
              {stats.monthlyHours && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">이번 달 학습 시간</span>
                    <span className="text-sm text-gray-600">{stats.monthlyHours.current}시간 / 목표 {stats.monthlyHours.target}시간</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((stats.monthlyHours.current / stats.monthlyHours.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">완료한 주제</p>
                  <p className="text-2xl font-bold text-gray-900">{(stats.topics || []).filter(t => t.status === 'completed').length}개</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">진행 중인 주제</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(stats.topics || []).filter(t => t.status === 'in_progress').length > 0 ? (
                      (stats.topics || []).filter(t => t.status === 'in_progress').map((topic, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {topic.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">학습을 시작하면 표시됩니다</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Topics Progress Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-orange-600" />
              학습 주제 진행 상황
            </h3>

            <div className="space-y-4">
              {(stats.topics || []).length > 0 ? (
                (stats.topics || []).map((topic, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">{topic.name}</span>
                        {topic.status === 'completed' && <Award className="w-4 h-4 text-yellow-500" />}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{topic.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          topic.status === 'completed' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                          topic.status === 'in_progress' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                          'bg-gradient-to-r from-gray-400 to-gray-600'
                        }`}
                        style={{ width: `${topic.progress}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">학습을 시작하면 주제별 진행 상황이 표시됩니다</p>
              )}
            </div>
          </motion.div>

          {/* Supplementary Learning Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              <span className="leading-tight">보조 학습 (국어)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {/* Hanja Learning */}
              <SupplementaryLearningCard
                href="/hanja-practice"
                icon={<Languages className="w-6 h-6" />}
                title="한자 학습"
                description="한자 읽기 및 쓰기"
                badge="AI 기반 📝"
                gradientFrom="red-500"
                gradientTo="rose-600"
              />

              {/* Vocabulary */}
              <SupplementaryLearningCard
                href="/flashcards"
                icon={<Book className="w-6 h-6" />}
                title="어휘 암기"
                description="간격 반복 플래시카드"
                badge="SM-2 알고리즘"
                gradientFrom="purple-500"
                gradientTo="pink-600"
              />

              {/* Grammar Quiz */}
              <SupplementaryLearningCard
                href="/quiz"
                icon={<Gamepad2 className="w-6 h-6" />}
                title="문법 퀴즈"
                description="게임형 학습"
                badge="AI 맞춤형"
                gradientFrom="indigo-500"
                gradientTo="blue-600"
              />

              {/* Writing Practice */}
              <SupplementaryLearningCard
                href="/microlearning"
                icon={<FileEdit className="w-6 h-6" />}
                title="맞춤법 연습"
                description="AI 첨삭 피드백"
                badge="5-10분 학습"
                gradientFrom="orange-500"
                gradientTo="amber-600"
              />
            </div>
          </motion.div>

          {/* Analysis Section */}
          <AnalysisCard
            title="국어 학습 분석"
            analysis={stats.analysis}
            tutorLink="/tutor/korean"
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
              subject="korean"
              subjectColor="orange"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function KoreanDashboardPage() {
  return (
    <Suspense fallback={
      <DashboardSkeleton
        gradientFrom="orange-50"
        gradientVia="amber-50"
        gradientTo="yellow-50"
      />
    }>
      <KoreanDashboardContent />
    </Suspense>
  );
}
