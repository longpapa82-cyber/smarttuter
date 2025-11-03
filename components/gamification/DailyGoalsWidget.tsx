'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Trophy, Sparkles } from 'lucide-react';
import {
  DailyGoalsProgress,
  DailyGoal,
  getMotivationalMessage,
  getSuggestedAction,
} from '@/lib/gamification/daily-goals';
import { useState, useEffect } from 'react';

interface DailyGoalsWidgetProps {
  goalsProgress: DailyGoalsProgress;
  className?: string;
  size?: 'compact' | 'medium' | 'large';
}

export function DailyGoalsWidget({
  goalsProgress,
  className = '',
  size = 'medium',
}: DailyGoalsWidgetProps) {
  const motivational = getMotivationalMessage(goalsProgress);
  const suggestedAction = getSuggestedAction(goalsProgress);
  const [showCelebration, setShowCelebration] = useState(false);

  // Listen for goal completion events
  useEffect(() => {
    const handleAllGoalsCompleted = () => {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    };

    window.addEventListener(
      'allGoalsCompleted',
      handleAllGoalsCompleted as EventListener
    );

    return () => {
      window.removeEventListener(
        'allGoalsCompleted',
        handleAllGoalsCompleted as EventListener
      );
    };
  }, []);

  const containerSize = {
    compact: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  }[size];

  const titleSize = {
    compact: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl',
  }[size];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg ${containerSize} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`font-bold text-gray-900 dark:text-white ${titleSize}`}>
              오늘의 목표
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {goalsProgress.completedCount} / {goalsProgress.totalCount} 완료
            </p>
          </div>
        </div>

        {/* Overall Progress Circle */}
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <motion.circle
              cx="32"
              cy="32"
              r="28"
              stroke="url(#gradient)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: goalsProgress.overallProgress / 100 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                strokeDasharray: 2 * Math.PI * 28,
              }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {goalsProgress.overallProgress}%
            </span>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      <motion.div
        className={`mb-6 p-4 rounded-xl ${
          motivational.urgency === 'high'
            ? 'bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800'
            : motivational.urgency === 'medium'
            ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800'
            : 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800'
        }`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-xl">{motivational.emoji}</span>
          {motivational.message}
        </p>
      </motion.div>

      {/* Goals List */}
      <div className="space-y-3">
        {goalsProgress.goals.map((goal, index) => (
          <GoalItem key={goal.id} goal={goal} index={index} />
        ))}
      </div>

      {/* Suggested Action */}
      {suggestedAction && goalsProgress.overallProgress < 100 && (
        <motion.div
          className="mt-6 p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">다음 목표 추천</p>
              <p className="text-xs text-white/90 mt-1">
                {suggestedAction.title} ({suggestedAction.xpReward} XP)
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* All Goals Completed Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-purple-500/90 to-pink-600/90 rounded-2xl flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center text-white">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <p className="text-2xl font-bold mb-2">대단해요!</p>
              <p className="text-sm">오늘의 모든 목표를 달성했습니다!</p>
              <p className="text-xs mt-2">+200 Bonus XP</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface GoalItemProps {
  goal: DailyGoal;
  index: number;
}

function GoalItem({ goal, index }: GoalItemProps) {
  const progressPercentage = Math.min((goal.current / goal.target) * 100, 100);

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div
        className={`p-4 rounded-xl border-2 transition-all ${
          goal.completed
            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 flex-1">
            {/* Completion Icon */}
            {goal.completed ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : (
              <Circle className="w-6 h-6 text-gray-400 dark:text-gray-600 flex-shrink-0" />
            )}

            {/* Goal Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">{goal.icon}</span>
                <p
                  className={`text-sm font-semibold ${
                    goal.completed
                      ? 'text-green-900 dark:text-green-100 line-through'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {goal.title}
                </p>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {goal.description}
              </p>
            </div>

            {/* XP Reward */}
            <div className="text-right">
              <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                +{goal.xpReward} XP
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                {goal.current} / {goal.target}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              goal.completed
                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                : 'bg-gradient-to-r from-purple-500 to-pink-600'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// Compact version for headers/sidebars
export function DailyGoalsIndicator({
  goalsProgress,
  onClick,
}: {
  goalsProgress: DailyGoalsProgress;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full px-4 py-2 shadow-lg"
    >
      <Trophy className="w-4 h-4" />
      <span className="text-sm font-semibold">
        {goalsProgress.completedCount}/{goalsProgress.totalCount}
      </span>
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
        <span className="text-xs font-bold">{goalsProgress.overallProgress}%</span>
      </div>
    </motion.button>
  );
}
