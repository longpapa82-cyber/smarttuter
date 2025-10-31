'use client'

import { motion } from 'framer-motion'
import { Flame, Snowflake, Calendar, TrendingUp } from 'lucide-react'

interface StreakTrackerProps {
  currentStreak: number
  longestStreak: number
  streakFreezes: number
  maxFreezes?: number
  lastActivityDate?: Date
}

export function StreakTracker({
  currentStreak,
  longestStreak,
  streakFreezes,
  maxFreezes = 3,
  lastActivityDate,
}: StreakTrackerProps) {
  const isStreakActive = currentStreak > 0
  const isNewRecord = currentStreak === longestStreak && longestStreak > 0

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
      <div className="flex items-start justify-between mb-6">
        {/* Streak Flame */}
        <div className="relative">
          <motion.div
            animate={
              isStreakActive
                ? {
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }
                : {}
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
              isStreakActive
                ? 'bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/50'
                : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            {isStreakActive ? (
              <Flame className="w-10 h-10 text-white" />
            ) : (
              <Snowflake className="w-10 h-10 text-gray-500" />
            )}
          </motion.div>

          {/* Streak count badge */}
          {isStreakActive && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold text-yellow-900 border-4 border-white dark:border-gray-900 shadow-lg"
            >
              {currentStreak}
            </motion.div>
          )}
        </div>

        {/* Stats */}
        <div className="text-right">
          <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">
            Current Streak
          </p>
          <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-2">
            {currentStreak}
            <span className="text-lg text-orange-600 dark:text-orange-400 ml-1">
              days
            </span>
          </p>
          {isNewRecord && currentStreak > 1 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-400 rounded-full text-xs font-bold text-yellow-900"
            >
              <TrendingUp className="w-3 h-3" />
              New Record!
            </motion.div>
          )}
        </div>
      </div>

      {/* Progress toward milestones */}
      <StreakMilestones currentStreak={currentStreak} />

      {/* Streak Freezes */}
      <div className="mt-6 pt-6 border-t border-orange-200 dark:border-orange-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Snowflake className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
              Streak Freezes
            </span>
          </div>
          <span className="text-sm font-bold text-orange-900 dark:text-orange-100">
            {streakFreezes}/{maxFreezes}
          </span>
        </div>

        {/* Freeze icons */}
        <div className="flex gap-2">
          {[...Array(maxFreezes)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full ${
                i < streakFreezes
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
          Use a freeze to protect your streak when you miss a day
        </p>
      </div>

      {/* Longest streak */}
      <div className="mt-4 pt-4 border-t border-orange-200 dark:border-orange-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">Longest Streak</span>
        </div>
        <span className="text-sm font-bold text-orange-900 dark:text-orange-100">
          {longestStreak} days
        </span>
      </div>
    </div>
  )
}

/**
 * Streak milestone progress indicators
 */
function StreakMilestones({ currentStreak }: { currentStreak: number }) {
  const milestones = [
    { days: 7, label: '1 Week', icon: '🎯' },
    { days: 14, label: '2 Weeks', icon: '🔥' },
    { days: 30, label: '1 Month', icon: '⭐' },
    { days: 100, label: '100 Days', icon: '🏆' },
  ]

  const nextMilestone = milestones.find(m => m.days > currentStreak)

  if (!nextMilestone) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-xl p-3 text-center">
        <p className="text-sm font-bold text-yellow-900 dark:text-yellow-100">
          🏆 Legendary Streak Master! 🏆
        </p>
      </div>
    )
  }

  const progress = (currentStreak / nextMilestone.days) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-orange-700 dark:text-orange-300">
          Next: {nextMilestone.label}
        </span>
        <span className="font-bold text-orange-900 dark:text-orange-100">
          {currentStreak}/{nextMilestone.days}
        </span>
      </div>
      <div className="h-2 bg-orange-200 dark:bg-orange-900 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
        />
      </div>
      <div className="flex gap-1 justify-between">
        {milestones.map(milestone => {
          const isCompleted = currentStreak >= milestone.days
          const isCurrent = milestone.days === nextMilestone?.days

          return (
            <div
              key={milestone.days}
              className={`flex-1 text-center transition-all ${
                isCompleted
                  ? 'opacity-100 scale-110'
                  : isCurrent
                  ? 'opacity-70'
                  : 'opacity-30'
              }`}
            >
              <div className="text-lg">{milestone.icon}</div>
              <div className="text-xs font-medium text-orange-700 dark:text-orange-300">
                {milestone.days}d
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Compact streak display for navigation bar
 */
export function StreakBadge({
  currentStreak,
  size = 'md',
}: {
  currentStreak: number
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const isActive = currentStreak > 0

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full font-bold shadow-lg ${
        isActive
          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
          : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
      } ${sizeClasses[size]}`}
    >
      {isActive ? (
        <Flame className={iconSizes[size]} />
      ) : (
        <Snowflake className={iconSizes[size]} />
      )}
      <span>{currentStreak}</span>
      <span className="opacity-75 text-xs">day{currentStreak !== 1 ? 's' : ''}</span>
    </div>
  )
}
