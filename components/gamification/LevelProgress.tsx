"use client";

import { motion } from "framer-motion";
import { useUserStore } from "@/lib/gamification/store";
import { Trophy } from "lucide-react";

export function LevelProgress() {
  const profile = useUserStore((state) => state.profile);

  if (!profile) return null;

  const { points } = profile;
  const progress = (points.currentLevelXP / points.nextLevelXP) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl p-6 border border-purple-500/20"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              레벨 {points.level}
            </h3>
            <p className="text-sm text-gray-600">
              {points.totalXP.toLocaleString()} Total XP
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Next Level</p>
          <p className="text-lg font-semibold text-gray-900">
            {points.currentLevelXP}/{points.nextLevelXP} XP
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-white drop-shadow-lg">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}
