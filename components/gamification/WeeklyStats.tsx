"use client";

import { motion } from "framer-motion";
import { useUserStore } from "@/lib/gamification/store";
import { Clock, CheckCircle, TrendingUp } from "lucide-react";
import { subDays, isAfter, parseISO } from "date-fns";

export function WeeklyStats() {
  const profile = useUserStore((state) => state.profile);

  if (!profile) return null;

  // Calculate weekly stats
  const weekAgo = subDays(new Date(), 7);
  const weeklySessions = profile.sessions.filter((session) =>
    isAfter(parseISO(session.date), weekAgo)
  );

  const totalTime = weeklySessions.reduce((sum, s) => sum + s.duration, 0);
  const sessionsCompleted = weeklySessions.length;
  const totalXP = weeklySessions.reduce((sum, s) => sum + s.xpEarned, 0);

  const stats = [
    {
      icon: Clock,
      label: "학습 시간",
      value: `${totalTime}분`,
      color: "from-blue-400 to-blue-600",
    },
    {
      icon: CheckCircle,
      label: "완료 세션",
      value: `${sessionsCompleted}개`,
      color: "from-green-400 to-green-600",
    },
    {
      icon: TrendingUp,
      label: "획득 XP",
      value: `${totalXP.toLocaleString()}`,
      color: "from-purple-400 to-purple-600",
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">이번 주 학습 현황</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
