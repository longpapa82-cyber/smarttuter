"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, ArrowRight, BookOpen, Calculator, Beaker, Landmark } from "lucide-react";
import type { LearningStats } from "@/types/learning-stats";

interface RecentActivitySummaryProps {
  learningStats: LearningStats | null;
  maxItems?: number;
}

export function RecentActivitySummary({ learningStats, maxItems = 3 }: RecentActivitySummaryProps) {
  // Collect recent activities from all subjects
  const activities: Array<{
    subject: string;
    subjectKey: string;
    topic: string;
    timestamp: Date;
    icon: React.ReactNode;
    gradient: string;
  }> = [];

  // English
  if (learningStats?.english?.detailed?.lastSession) {
    activities.push({
      subject: "영어",
      subjectKey: "english",
      topic: learningStats.english.detailed.lastSession.topic,
      timestamp: new Date(learningStats.english.detailed.lastSession.date),
      icon: <BookOpen className="w-5 h-5" />,
      gradient: "from-blue-500 to-indigo-600",
    });
  }

  // Math
  if (learningStats?.math?.detailed?.lastSession) {
    activities.push({
      subject: "수학",
      subjectKey: "math",
      topic: learningStats.math.detailed.lastSession.topic,
      timestamp: new Date(learningStats.math.detailed.lastSession.date),
      icon: <Calculator className="w-5 h-5" />,
      gradient: "from-purple-500 to-pink-600",
    });
  }

  // Science
  if (learningStats?.science?.currentTopic) {
    activities.push({
      subject: "과학",
      subjectKey: "science",
      topic: learningStats.science.currentTopic,
      timestamp: new Date(), // Placeholder
      icon: <Beaker className="w-5 h-5" />,
      gradient: "from-cyan-500 to-blue-600",
    });
  }

  // Social
  if (learningStats?.social?.currentTopic) {
    activities.push({
      subject: "사회",
      subjectKey: "social",
      topic: learningStats.social.currentTopic,
      timestamp: new Date(), // Placeholder
      icon: <Landmark className="w-5 h-5" />,
      gradient: "from-orange-500 to-amber-600",
    });
  }

  // Sort by timestamp (most recent first)
  activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Limit to maxItems
  const recentActivities = activities.slice(0, maxItems);

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return `${diffDays}일 전`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-green-600" />
            최근 활동
          </h3>
          <p className="text-sm text-gray-600 mt-1">최근 {maxItems}개 학습 기록</p>
        </div>
      </div>

      {/* Activities List */}
      {recentActivities.length > 0 ? (
        <div className="space-y-3">
          {recentActivities.map((activity, index) => (
            <Link key={index} href={`/dashboard/${activity.subjectKey}`}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all cursor-pointer group"
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${activity.gradient} flex items-center justify-center text-white flex-shrink-0`}>
                  {activity.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">{activity.subject}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                  <p className="text-sm text-gray-700 truncate">&ldquo;{activity.topic}&rdquo;</p>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0">
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            </Link>
          ))}

          {/* View All Link */}
          {activities.length > maxItems && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center pt-2"
            >
              <Link
                href="/learning-report"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                전체 활동 보기
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center py-8"
        >
          <div className="text-4xl mb-3">📝</div>
          <p className="text-gray-600">아직 학습 기록이 없습니다</p>
          <p className="text-sm text-gray-500 mt-1">튜터와 학습을 시작하면 활동이 표시됩니다</p>
        </motion.div>
      )}
    </motion.div>
  );
}
