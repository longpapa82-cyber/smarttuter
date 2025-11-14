"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingUp } from "lucide-react";
import type { LearningStats } from "@/types/learning-stats";

interface SubjectComparisonChartProps {
  learningStats: LearningStats | null;
}

export function SubjectComparisonChart({ learningStats }: SubjectComparisonChartProps) {
  // Calculate total hours and percentages for each subject
  const subjects = [
    {
      name: "영어",
      key: "english" as const,
      hours: learningStats?.english?.weeklyHours || 0,
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50",
    },
    {
      name: "수학",
      key: "math" as const,
      hours: learningStats?.math?.weeklyHours || 0,
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-50 to-pink-50",
    },
    {
      name: "과학",
      key: "science" as const,
      hours: learningStats?.science?.weeklyHours || 0,
      gradient: "from-cyan-500 to-blue-600",
      bgGradient: "from-cyan-50 to-blue-50",
    },
    {
      name: "사회",
      key: "social" as const,
      hours: learningStats?.social?.weeklyHours || 0,
      gradient: "from-orange-500 to-amber-600",
      bgGradient: "from-orange-50 to-amber-50",
    },
  ];

  const totalHours = subjects.reduce((sum, subject) => sum + subject.hours, 0);
  const maxHours = Math.max(...subjects.map(s => s.hours), 1); // Prevent division by zero

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            과목별 학습 시간 비교
          </h3>
          <p className="text-sm text-gray-600 mt-1">이번 주 과목별 학습 분포</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{totalHours}h</div>
          <div className="text-xs text-gray-500">총 학습 시간</div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="space-y-4">
        {subjects.map((subject, index) => {
          const percentage = totalHours > 0 ? (subject.hours / totalHours) * 100 : 0;
          const barWidth = maxHours > 0 ? (subject.hours / maxHours) * 100 : 0;

          return (
            <motion.div
              key={subject.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-16 text-sm font-medium text-gray-700">{subject.name}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-10 bg-gray-100 rounded-lg overflow-hidden relative">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${subject.gradient} rounded-lg relative`}
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                      >
                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                          initial={{ x: "-100%" }}
                          animate={{ x: "200%" }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatDelay: 2,
                            delay: 1 + index * 0.1,
                          }}
                        />
                      </motion.div>
                    </div>
                    <div className="w-20 text-right">
                      <span className="text-sm font-semibold text-gray-900">{subject.hours}h</span>
                      <span className="text-xs text-gray-500 ml-1">({percentage.toFixed(0)}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Rings - Alternative Visualization */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <h4 className="text-sm font-semibold text-gray-900">과목별 진행 상황</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {subjects.map((subject, index) => {
            const hasData = learningStats?.[subject.key]?.hasData;
            const percentage = totalHours > 0 ? (subject.hours / totalHours) * 100 : 0;
            const progress = hasData ? percentage : 0;

            return (
              <motion.div
                key={subject.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 1 + index * 0.1 }}
                className={`p-4 bg-gradient-to-br ${subject.bgGradient} rounded-xl`}
              >
                <div className="text-center">
                  {/* Circular Progress */}
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-gray-200"
                      />
                      <motion.circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        className={`text-transparent bg-gradient-to-br ${subject.gradient} bg-clip-text`}
                        style={{ strokeLinecap: "round" }}
                        initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - progress / 100) }}
                        transition={{ duration: 1.5, delay: 1.5 + index * 0.1, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-700">{percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{subject.hours}시간</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* No Data State */}
      {totalHours === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-8"
        >
          <div className="text-4xl mb-3">📊</div>
          <p className="text-gray-600">아직 학습 기록이 없습니다</p>
          <p className="text-sm text-gray-500 mt-1">튜터와 학습을 시작하면 통계가 표시됩니다</p>
        </motion.div>
      )}
    </motion.div>
  );
}
