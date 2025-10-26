"use client";

import { motion } from "framer-motion";
import { useUserStore } from "@/lib/gamification/store";
import { Flame, Shield } from "lucide-react";

export function StreakDisplay() {
  const profile = useUserStore((state) => state.profile);

  if (!profile) return null;

  const { streak } = profile;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl p-6 border border-orange-500/20"
    >
      <div className="flex items-center gap-4">
        {/* Flame Icon */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg"
        >
          <Flame className="w-8 h-8 text-white" fill="currentColor" />
        </motion.div>

        {/* Streak Info */}
        <div className="flex-1">
          <h3 className="text-3xl font-bold text-gray-900">
            {streak.currentStreak}일 연속
          </h3>
          <p className="text-sm text-gray-600">
            최장 기록: {streak.longestStreak}일
          </p>
        </div>

        {/* Freeze Count */}
        {streak.freezeCount > 0 && (
          <div className="flex flex-col items-center gap-1">
            <Shield className="w-6 h-6 text-blue-500" />
            <span className="text-xs font-semibold text-blue-600">
              ×{streak.freezeCount}
            </span>
            <span className="text-xs text-gray-500">보호권</span>
          </div>
        )}
      </div>

      {/* Motivation Message */}
      {streak.currentStreak > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-3 bg-white/50 rounded-lg"
        >
          <p className="text-sm text-gray-700 text-center">
            {streak.currentStreak >= 30
              ? "🎉 대단해요! 한 달 연속 학습 중!"
              : streak.currentStreak >= 7
              ? "💪 잘하고 있어요! 일주일 연속!"
              : streak.currentStreak >= 3
              ? "🔥 좋아요! 계속 유지하세요!"
              : "🌟 좋은 시작이에요!"}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
