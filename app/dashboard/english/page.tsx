"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, ArrowRight, TrendingUp, Target, Award, Mic, Book, Gamepad2, FileEdit } from "lucide-react";
import { useUserStore } from "@/lib/gamification/store";
import { EmptySubjectDashboard } from "@/components/dashboard/EmptySubjectDashboard";
import type { EnglishDetailedStats } from "@/types/learning-stats";

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
    </div>
  );
}

function EnglishDashboardContent() {
  const profile = useUserStore((state) => state.profile);
  const [stats, setStats] = useState<EnglishDetailedStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch English learning stats from API
  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const response = await fetch('/api/user/learning-stats?subject=english');

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
        console.error('Error loading English stats:', error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    }

    loadStats();

    // Auto-refresh every 60 seconds
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  // Loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Empty state - no learning data
  const hasData = stats && (
    stats.lastSession !== null ||
    stats.completedTopics > 0 ||
    stats.mastery.listening > 0 ||
    stats.mastery.speaking > 0 ||
    stats.mastery.reading > 0 ||
    stats.mastery.writing > 0
  );

  if (!hasData) {
    return <EmptySubjectDashboard subject="english" />;
  }

  // Data exists - render dashboard with real data
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            English DashBoard
          </h1>
          <p className="mt-2 text-gray-600">
            {profile?.username || '학습자'}님의 영어 학습 현황과 추천 활동
          </p>
        </div>

        <div className="space-y-8">
          {/* Main Learning Section - 영어 튜터 계속하기 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link href="/tutor/english">
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">영어 튜터와 대화 계속하기</h2>
                        <p className="text-sm text-white/80">AI 튜터와 실시간 영어 대화</p>
                      </div>
                    </div>
                    <div className="space-y-2 ml-20">
                      {stats.lastSession && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white/70">마지막 주제:</span>
                          <span className="font-semibold">&ldquo;{stats.lastSession.topic}&rdquo;</span>
                        </div>
                      )}
                      {stats.nextTopic && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white/70">다음 추천:</span>
                          <span className="font-semibold">&ldquo;{stats.nextTopic}&rdquo;</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">학습 시작</span>
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Progress Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              영어 학습 진행도
            </h3>

            <div className="space-y-6">
              {/* CEFR Level Progress */}
              {stats.cefrLevel && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">CEFR Level</span>
                    <span className="text-sm text-gray-600">{stats.cefrLevel.current} → {stats.cefrLevel.target} 진행 중</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${stats.cefrLevel.progress}%` }}
                    />
                  </div>
                  <div className="text-right mt-1">
                    <span className="text-xs font-semibold text-blue-600">{stats.cefrLevel.progress}%</span>
                  </div>
                </div>
              )}

              {/* Monthly Hours */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">이번 달 학습 시간</span>
                  <span className="text-sm text-gray-600">{stats.monthlyHours.current}시간 / 목표 {stats.monthlyHours.target}시간</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.monthlyHours.current / stats.monthlyHours.target) * 100}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">완료한 주제</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedTopics}개</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">마스터한 문법</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {stats.masteredGrammar.length > 0 ? (
                      stats.masteredGrammar.map((grammar, i) => (
                        <span key={i} className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                          {grammar}
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

          {/* Mastery Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              영어 마스터리
            </h3>

            <div className="space-y-4">
              {Object.entries(stats.mastery).map(([skill, progress]) => (
                <div key={skill}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {skill === 'listening' ? '듣기' :
                         skill === 'speaking' ? '말하기' :
                         skill === 'reading' ? '읽기' : '쓰기'}
                      </span>
                      {progress === 100 && <Award className="w-4 h-4 text-yellow-500" />}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        progress === 100 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                        progress >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                        progress >= 60 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                        'bg-gradient-to-r from-orange-400 to-orange-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">종합 점수</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  {Math.round(Object.values(stats.mastery).reduce((a, b) => a + b, 0) / 4)}%
                </span>
                <span className="text-lg text-gray-600 mb-1">
                  ({Math.round(Object.values(stats.mastery).reduce((a, b) => a + b, 0) / 4) >= 90 ? 'A' :
                    Math.round(Object.values(stats.mastery).reduce((a, b) => a + b, 0) / 4) >= 80 ? 'B+' :
                    Math.round(Object.values(stats.mastery).reduce((a, b) => a + b, 0) / 4) >= 70 ? 'B' :
                    Math.round(Object.values(stats.mastery).reduce((a, b) => a + b, 0) / 4) >= 60 ? 'C+' : 'C'})
                </span>
              </div>
            </div>
          </motion.div>

          {/* Supplementary Learning Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-blue-600" />
              보조 학습 (영어)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pronunciation Practice */}
              <Link href="/pronunciation-practice">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <Mic className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">발음 연습</h4>
                  <p className="text-sm text-white/80">AI 기반 고급 발음 분석</p>
                  <div className="mt-4 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">
                    Phase 10 🎤
                  </div>
                </motion.div>
              </Link>

              {/* Vocabulary */}
              <Link href="/flashcards">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <Book className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">단어 암기</h4>
                  <p className="text-sm text-white/80">간격 반복 플래시카드</p>
                  <div className="mt-4 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">
                    SM-2 알고리즘
                  </div>
                </motion.div>
              </Link>

              {/* Grammar Quiz */}
              <Link href="/quiz">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">문법 퀴즈</h4>
                  <p className="text-sm text-white/80">게임형 학습</p>
                  <div className="mt-4 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">
                    AI 맞춤형
                  </div>
                </motion.div>
              </Link>

              {/* Writing Practice */}
              <Link href="/microlearning">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <FileEdit className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">작문 연습</h4>
                  <p className="text-sm text-white/80">AI 첨삭 피드백</p>
                  <div className="mt-4 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">
                    5-10분 학습
                  </div>
                </motion.div>
              </Link>
            </div>
          </motion.div>

          {/* Analysis Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">영어 학습 분석</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Award className="w-4 h-4 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">강점</h4>
                </div>
                <ul className="space-y-2">
                  {stats.analysis.strengths.length > 0 ? (
                    stats.analysis.strengths.map((strength, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        {strength}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500">학습 데이터가 쌓이면 분석이 표시됩니다</li>
                  )}
                </ul>
              </div>

              {/* Weaknesses */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Target className="w-4 h-4 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">약점 (개선 필요)</h4>
                </div>
                <ul className="space-y-2">
                  {stats.analysis.weaknesses.length > 0 ? (
                    stats.analysis.weaknesses.map((weakness, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        {weakness}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500">학습 데이터가 쌓이면 분석이 표시됩니다</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Recommendation */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-1">💡 AI 추천</p>
                <p className="text-sm text-blue-700">
                  {stats.analysis.aiRecommendation}
                </p>
                {stats.analysis.weaknesses.length > 0 && (
                  <Link
                    href="/tutor/english"
                    className="inline-block mt-3 text-sm font-semibold text-blue-600 hover:text-blue-800"
                  >
                    영어 튜터 시작하기 →
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function EnglishDashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <EnglishDashboardContent />
    </Suspense>
  );
}
