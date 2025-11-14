"use client";

import { motion } from "framer-motion";
import { Clock, BookOpen, Award, TrendingUp } from "lucide-react";
import { AnimatedCounter } from "@/components/animations";
import type { LearningStats } from "@/types/learning-stats";

interface OverallStatsCardProps {
  learningStats: LearningStats | null;
}

export function OverallStatsCard({ learningStats }: OverallStatsCardProps) {
  // Calculate total stats
  const totalWeeklyHours = [
    learningStats?.english?.weeklyHours || 0,
    learningStats?.math?.weeklyHours || 0,
    learningStats?.science?.weeklyHours || 0,
    learningStats?.social?.weeklyHours || 0,
  ].reduce((sum, hours) => sum + hours, 0);

  const totalSessions = [
    learningStats?.english?.completedUnits || 0,
    learningStats?.math?.completedUnits || 0,
    learningStats?.science?.completedUnits || 0,
    learningStats?.social?.completedUnits || 0,
  ].reduce((sum, count) => sum + count, 0);

  const hasAnyData = totalWeeklyHours > 0 || totalSessions > 0;

  const stats = [
    {
      label: "이번 주 학습 시간",
      value: totalWeeklyHours,
      suffix: "시간",
      icon: <Clock className="w-6 h-6" />,
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50",
    },
    {
      label: "완료한 학습",
      value: totalSessions,
      suffix: "개",
      icon: <BookOpen className="w-6 h-6" />,
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-50 to-pink-50",
    },
    {
      label: "학습 과목",
      value: [
        learningStats?.english?.hasData,
        learningStats?.math?.hasData,
        learningStats?.science?.hasData,
        learningStats?.social?.hasData,
      ].filter(Boolean).length,
      suffix: "과목",
      icon: <Award className="w-6 h-6" />,
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50",
    },
    {
      label: "평균 성취도",
      value: hasAnyData && totalSessions > 0 ? Math.round((totalWeeklyHours / totalSessions) * 20) : 0,
      suffix: "%",
      icon: <TrendingUp className="w-6 h-6" />,
      gradient: "from-orange-500 to-red-600",
      bgGradient: "from-orange-50 to-red-50",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          전체 학습 통계
        </h3>
        <p className="text-sm text-gray-600 mt-1">모든 과목의 통합 학습 현황</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`bg-gradient-to-br ${stat.bgGradient} rounded-xl p-6 border border-gray-200`}
          >
            {/* Icon */}
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white mb-4`}>
              {stat.icon}
            </div>

            {/* Value */}
            <div className="mb-2">
              <div className="flex items-baseline gap-1">
                <AnimatedCounter
                  value={stat.value}
                  duration={1.5}
                  delay={0.3 + index * 0.1}
                  className="text-3xl font-bold text-gray-900"
                />
                <span className="text-lg font-semibold text-gray-600">{stat.suffix}</span>
              </div>
            </div>

            {/* Label */}
            <div className="text-sm font-medium text-gray-700">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {!hasAnyData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center py-4 bg-blue-50 rounded-xl"
        >
          <p className="text-sm text-blue-700">
            튜터와 학습을 시작하면 통계가 업데이트됩니다! 🚀
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
