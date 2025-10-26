"use client";

import { motion } from "framer-motion";
import { useUserStore } from "@/lib/gamification/store";
import { ACHIEVEMENTS } from "@/lib/gamification/types";
import { Lock } from "lucide-react";

export function AchievementBadges() {
  const profile = useUserStore((state) => state.profile);

  if (!profile) return null;

  const unlockedAchievements = ACHIEVEMENTS.filter((achievement) =>
    profile.achievements.includes(achievement.id)
  );

  const lockedAchievements = ACHIEVEMENTS.filter(
    (achievement) => !profile.achievements.includes(achievement.id)
  ).slice(0, 6); // Show first 6 locked achievements

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">업적 배지</h3>
        <span className="text-sm text-gray-600">
          {unlockedAchievements.length}/{ACHIEVEMENTS.length} 달성
        </span>
      </div>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            🏆 획득한 배지
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {unlockedAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-400 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="text-center">
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                    {achievement.icon}
                  </div>
                  <p className="text-xs font-semibold text-gray-900 mb-1">
                    {achievement.nameKo}
                  </p>
                  <p className="text-xs text-gray-600">
                    {achievement.descriptionKo}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements Preview */}
      {lockedAchievements.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            🔒 잠금 해제 가능
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {lockedAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-50 rounded-xl p-4 border-2 border-gray-300 shadow-sm opacity-60 hover:opacity-80 transition-opacity"
              >
                <div className="text-center relative">
                  <div className="text-4xl mb-2 grayscale">
                    {achievement.icon}
                  </div>
                  <Lock className="w-4 h-4 text-gray-500 absolute top-0 right-0" />
                  <p className="text-xs font-semibold text-gray-700 mb-1">
                    {achievement.nameKo}
                  </p>
                  <p className="text-xs text-gray-500">
                    {achievement.descriptionKo}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
