"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calculator, ArrowRight, TrendingUp, Target, Award, BarChart3, BookOpen, Gamepad2, FileEdit } from "lucide-react";
import { useUserStore } from "@/lib/gamification/store";

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
    </div>
  );
}

function MathDashboardContent() {
  const profile = useUserStore((state) => state.profile);
  const [lastSession, setLastSession] = useState({
    topic: "이차방정식 풀이",
    date: "2024-01-15",
    duration: 20
  });
  const [nextTopic, setNextTopic] = useState("이차함수 그래프");
  const [gradeProgress, setGradeProgress] = useState({ level: "중2 수학", progress: 68 });
  const [monthlyHours, setMonthlyHours] = useState({ current: 8, target: 15 });

  // Chapter Progress
  const [chapters, setChapters] = useState([
    { name: "일차방정식", progress: 100, status: "completed" as const },
    { name: "일차함수", progress: 100, status: "completed" as const },
    { name: "이차방정식", progress: 65, status: "in_progress" as const },
    { name: "이차함수", progress: 0, status: "not_started" as const },
    { name: "통계", progress: 0, status: "not_started" as const },
  ]);

  // Strengths and weaknesses
  const strengths = ["계산 능력", "기본 개념 이해", "공식 암기"];
  const weaknesses = ["복잡한 응용문제", "기하학적 직관", "문제 해석"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calculator className="w-8 h-8 text-purple-600" />
            수학 학습 허브
          </h1>
          <p className="mt-2 text-gray-600">
            {profile?.username || '학습자'}님의 수학 학습 현황과 추천 활동
          </p>
        </div>

        <div className="space-y-8">
          {/* Main Learning Section - 수학 튜터 계속하기 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link href="/tutor/math">
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-3xl p-8 text-white cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Calculator className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">수학 튜터와 학습 계속하기</h2>
                        <p className="text-sm text-white/80">AI 튜터와 수학 문제 풀이</p>
                      </div>
                    </div>
                    <div className="space-y-2 ml-20">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/70">마지막 주제:</span>
                        <span className="font-semibold">&ldquo;{lastSession.topic}&rdquo;</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/70">다음 추천:</span>
                        <span className="font-semibold">&ldquo;{nextTopic}&rdquo;</span>
                      </div>
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
              <TrendingUp className="w-6 h-6 text-purple-600" />
              수학 학습 진행도
            </h3>

            <div className="space-y-6">
              {/* Grade Level Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">학년별 진행도</span>
                  <span className="text-sm text-gray-600">{gradeProgress.level} 완료</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${gradeProgress.progress}%` }}
                  />
                </div>
                <div className="text-right mt-1">
                  <span className="text-xs font-semibold text-purple-600">{gradeProgress.progress}%</span>
                </div>
              </div>

              {/* Monthly Hours */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">이번 달 학습 시간</span>
                  <span className="text-sm text-gray-600">{monthlyHours.current}시간 / 목표 {monthlyHours.target}시간</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(monthlyHours.current / monthlyHours.target) * 100}%` }}
                  />
                </div>
              </div>

              {/* Chapter Progress */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">마스터한 단원</p>
                <div className="space-y-2">
                  {chapters.map((chapter, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {chapter.status === 'completed' && (
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                        {chapter.status === 'in_progress' && (
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          </div>
                        )}
                        {chapter.status === 'not_started' && (
                          <div className="w-5 h-5 rounded-full bg-gray-300" />
                        )}
                        <span className={`text-sm ${
                          chapter.status === 'completed' ? 'text-green-700 font-medium' :
                          chapter.status === 'in_progress' ? 'text-blue-700 font-medium' :
                          'text-gray-500'
                        }`}>
                          {chapter.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{chapter.progress}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Supplementary Learning Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-purple-600" />
              보조 학습 (수학)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Math Visualization */}
              <Link href="/math-visualization">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">그래프 시각화</h4>
                  <p className="text-sm text-white/80">인터랙티브 그래프 탐구</p>
                  <div className="mt-4 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">
                    Phase 10 📊
                  </div>
                </motion.div>
              </Link>

              {/* Problem Solving */}
              <Link href="/quiz">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">문제 풀이</h4>
                  <p className="text-sm text-white/80">단계별 풀이 연습</p>
                  <div className="mt-4 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">
                    AI 맞춤형
                  </div>
                </motion.div>
              </Link>

              {/* Formula Flashcards */}
              <Link href="/flashcards">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">공식 암기</h4>
                  <p className="text-sm text-white/80">플래시카드 복습</p>
                  <div className="mt-4 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">
                    SM-2 알고리즘
                  </div>
                </motion.div>
              </Link>

              {/* Application Problems */}
              <Link href="/microlearning">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <FileEdit className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">응용문제</h4>
                  <p className="text-sm text-white/80">실생활 적용 연습</p>
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
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">수학 학습 분석</h3>

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
                  {strengths.map((strength, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {strength}
                    </li>
                  ))}
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
                  {weaknesses.map((weakness, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommendation */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm font-medium text-purple-900 mb-1">💡 AI 추천</p>
                <p className="text-sm text-purple-700">
                  시각화 도구로 기하학 개념을 익히면 공간 감각이 향상됩니다. 이차함수 그래프를 직접 조작하며 배워보세요.
                </p>
                <Link
                  href="/math-visualization"
                  className="inline-block mt-3 text-sm font-semibold text-purple-600 hover:text-purple-800"
                >
                  그래프 시각화 시작하기 →
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function MathDashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MathDashboardContent />
    </Suspense>
  );
}
