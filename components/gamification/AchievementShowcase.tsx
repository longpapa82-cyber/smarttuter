'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Award, Lock, Star, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
  progress?: { current: number; target: number };
}

interface AchievementShowcaseProps {
  achievements: Achievement[];
  lockedAchievements?: Achievement[];
  className?: string;
}

const RARITY_CONFIG = {
  common: {
    color: 'gray',
    gradient: 'from-gray-400 to-gray-600',
    border: 'border-gray-400',
    glow: 'shadow-gray-400/50',
  },
  rare: {
    color: 'blue',
    gradient: 'from-blue-400 to-blue-600',
    border: 'border-blue-400',
    glow: 'shadow-blue-400/50',
  },
  epic: {
    color: 'purple',
    gradient: 'from-purple-400 to-purple-600',
    border: 'border-purple-400',
    glow: 'shadow-purple-400/50',
  },
  legendary: {
    color: 'yellow',
    gradient: 'from-yellow-400 to-orange-600',
    border: 'border-yellow-400',
    glow: 'shadow-yellow-400/50',
  },
};

export function AchievementShowcase({
  achievements,
  lockedAchievements = [],
  className = '',
}: AchievementShowcaseProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // Sort achievements by rarity and date
  const sortedAchievements = [...achievements].sort((a, b) => {
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
    const rarityDiff = rarityOrder[a.rarity] - rarityOrder[b.rarity];
    if (rarityDiff !== 0) return rarityDiff;

    if (a.unlockedAt && b.unlockedAt) {
      return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
    }
    return 0;
  });

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            🏆 성취 뱃지
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {achievements.length}개 획득 / {achievements.length + lockedAchievements.length}개 전체
          </p>
        </div>

        {/* Completion Percentage */}
        <div className="text-right">
          <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            {Math.round((achievements.length / (achievements.length + lockedAchievements.length)) * 100)}%
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">완성도</div>
        </div>
      </div>

      {/* Unlocked Achievements Grid */}
      {achievements.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            획득한 뱃지
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {sortedAchievements.map((achievement, index) => {
              const config = RARITY_CONFIG[achievement.rarity];
              return (
                <motion.button
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, type: 'spring' }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedAchievement(achievement)}
                  className={`relative aspect-square rounded-xl bg-gradient-to-br ${config.gradient} p-3 shadow-lg ${config.glow} hover:shadow-xl transition-shadow`}
                >
                  {/* Icon */}
                  <div className="text-4xl text-white filter drop-shadow-lg">
                    {achievement.icon}
                  </div>

                  {/* Rarity Indicator */}
                  <div className="absolute top-1 right-1">
                    <Star className="w-3 h-3 text-white fill-white" />
                  </div>

                  {/* Shine Effect */}
                  <motion.div
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    style={{ width: '50%' }}
                  />
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            잠긴 뱃지
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {lockedAchievements.map((achievement, index) => (
              <motion.button
                key={achievement.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedAchievement(achievement)}
                className="relative aspect-square rounded-xl bg-gray-200 dark:bg-gray-700 p-3 opacity-50 hover:opacity-70 transition-opacity"
              >
                {/* Locked Icon */}
                <div className="text-4xl filter grayscale">
                  {achievement.icon}
                </div>

                {/* Lock Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl backdrop-blur-[1px]">
                  <Lock className="w-5 h-5 text-white" />
                </div>

                {/* Progress Bar if available */}
                {achievement.progress && (
                  <div className="absolute bottom-1 left-1 right-1 h-1 bg-gray-400 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${(achievement.progress.current / achievement.progress.target) * 100}%`,
                      }}
                    />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAchievement(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              {/* Achievement Icon */}
              <div className={`relative mx-auto w-32 h-32 rounded-2xl bg-gradient-to-br ${
                RARITY_CONFIG[selectedAchievement.rarity].gradient
              } flex items-center justify-center shadow-xl mb-4`}>
                <div className="text-7xl filter drop-shadow-lg">
                  {selectedAchievement.icon}
                </div>

                {/* Rarity Stars */}
                <div className="absolute -top-2 -right-2 flex gap-1">
                  {Array.from({ length: selectedAchievement.rarity === 'legendary' ? 3 : selectedAchievement.rarity === 'epic' ? 2 : 1 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                {selectedAchievement.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                {selectedAchievement.description}
              </p>

              {/* Rarity Badge */}
              <div className="flex justify-center mb-4">
                <span className={`px-4 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${
                  RARITY_CONFIG[selectedAchievement.rarity].gradient
                }`}>
                  {selectedAchievement.rarity.toUpperCase()}
                </span>
              </div>

              {/* Unlocked Date or Progress */}
              {selectedAchievement.unlockedAt ? (
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  {new Date(selectedAchievement.unlockedAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}에 획득
                </div>
              ) : selectedAchievement.progress ? (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>진행도</span>
                    <span>
                      {selectedAchievement.progress.current} / {selectedAchievement.progress.target}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${RARITY_CONFIG[selectedAchievement.rarity].gradient}`}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(selectedAchievement.progress.current / selectedAchievement.progress.target) * 100}%`,
                      }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              ) : null}

              {/* Close Button */}
              <button
                onClick={() => setSelectedAchievement(null)}
                className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                닫기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
