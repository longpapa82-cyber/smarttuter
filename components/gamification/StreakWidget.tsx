'use client';

import { motion } from 'framer-motion';
import { Flame, Award, Shield, TrendingUp } from 'lucide-react';
import type { StreakData } from '@/lib/gamification/streak-system';
import {
  getStreakStatusMessage,
  getMilestoneReward,
} from '@/lib/gamification/streak-system';

interface StreakWidgetProps {
  streakData: StreakData;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export function StreakWidget({
  streakData,
  className = '',
  size = 'medium',
}: StreakWidgetProps) {
  const status = getStreakStatusMessage(streakData);

  const sizeClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  const flameSize = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  const textSize = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-6xl',
  };

  // Get next milestone
  const milestones = [7, 14, 30, 60, 100, 365];
  const nextMilestone =
    milestones.find(
      (m) =>
        m > streakData.currentStreak &&
        !(streakData.streakMilestones || []).includes(m)
    ) || null;

  const progressToNext = nextMilestone
    ? (streakData.currentStreak / nextMilestone) * 100
    : 100;

  return (
    <div className={`${className}`}>
      {/* Main Streak Display */}
      <div
        className={`bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl ${sizeClasses[size]} text-white shadow-xl`}
      >
        <div className="flex items-center gap-4 mb-4">
          {/* Flame Icon with Animation */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Flame className={flameSize[size]} />
          </motion.div>

          <div className="flex-1">
            {/* Streak Number */}
            <motion.div
              key={streakData.currentStreak}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className={`${textSize[size]} font-bold`}
            >
              {streakData.currentStreak}일
            </motion.div>
            <div
              className={`${
                size === 'small' ? 'text-xs' : 'text-sm'
              } opacity-90`}
            >
              연속 학습 중!
            </div>
          </div>

          {/* Freeze Tokens */}
          {streakData.freezeTokens > 0 && (
            <div className="flex flex-col items-center">
              <Shield className="w-6 h-6 mb-1" />
              <div className="text-sm font-bold">{streakData.freezeTokens}</div>
              <div className="text-xs opacity-75">보호권</div>
            </div>
          )}
        </div>

        {/* Status Message */}
        <div
          className={`flex items-center gap-2 ${
            status.urgency === 'critical'
              ? 'bg-red-700/50'
              : status.urgency === 'warning'
              ? 'bg-yellow-600/50'
              : 'bg-white/10'
          } rounded-lg p-3`}
        >
          <span className="text-lg">{status.emoji}</span>
          <p className={`${size === 'small' ? 'text-xs' : 'text-sm'} flex-1`}>
            {status.message}
          </p>
        </div>

        {/* Progress to Next Milestone */}
        {nextMilestone && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`${size === 'small' ? 'text-xs' : 'text-sm'}`}>
                다음 마일스톤: {nextMilestone}일
              </span>
              <span
                className={`${
                  size === 'small' ? 'text-xs' : 'text-sm'
                } opacity-75`}
              >
                {streakData.currentStreak}/{nextMilestone}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="absolute h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>

            {/* Milestone Reward Preview */}
            {nextMilestone && (
              <div className="mt-2 text-xs opacity-75">
                보상: +
                {getMilestoneReward(nextMilestone).freezeTokens} 보호권
              </div>
            )}
          </div>
        )}
      </div>

      {/* Longest Streak & Total Days */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {streakData.longestStreak}
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            최고 기록
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {streakData.totalStudyDays}
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            총 학습일
          </div>
        </div>
      </div>

      {/* Milestones Achieved */}
      {streakData.streakMilestones && streakData.streakMilestones.length > 0 && (
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
          <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            🏆 달성한 마일스톤
          </div>
          <div className="flex flex-wrap gap-2">
            {streakData.streakMilestones
              .sort((a, b) => b - a)
              .map((milestone) => {
                const reward = getMilestoneReward(milestone);
                return (
                  <div
                    key={milestone}
                    className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs font-semibold"
                    title={reward.message}
                  >
                    {reward.badge}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact streak indicator for headers/navigation
 */
interface StreakIndicatorProps {
  currentStreak: number;
  onClick?: () => void;
}

export function StreakIndicator({
  currentStreak,
  onClick,
}: StreakIndicatorProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full shadow-lg"
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      >
        <Flame className="w-5 h-5" />
      </motion.div>
      <span className="font-bold">{currentStreak}</span>
    </motion.button>
  );
}

/**
 * Milestone achievement animation
 */
interface MilestoneAnimationProps {
  milestone: number;
  show: boolean;
  onComplete?: () => void;
}

export function MilestoneAnimation({
  milestone,
  show,
  onComplete,
}: MilestoneAnimationProps) {
  const reward = getMilestoneReward(milestone);

  return show ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md mx-4 shadow-2xl"
      >
        {/* Trophy Icon */}
        <motion.div
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="text-center mb-6"
        >
          <div className="text-8xl">🏆</div>
        </motion.div>

        {/* Milestone Badge */}
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            마일스톤 달성!
          </div>
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xl font-bold">
            {reward.badge}
          </div>
        </div>

        {/* Message */}
        <p className="text-center text-gray-700 dark:text-gray-300 mb-6">
          {reward.message}
        </p>

        {/* Freeze Tokens Display */}
        {reward.freezeTokens > 0 && (
          <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-6">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-blue-600">
                +{reward.freezeTokens}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                스트릭 보호권
              </div>
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onComplete}
          className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
        >
          계속하기
        </button>
      </motion.div>
    </div>
  ) : null;
}
