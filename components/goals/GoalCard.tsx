'use client';

import { LearningGoal } from '@/lib/goals/types';
import { motion, useSpring, useTransform } from 'framer-motion';
import { X, Check, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GoalCardProps {
  goal: LearningGoal;
  onCancel?: (goalId: string) => void;
}

const METRIC_LABELS: Record<string, { name: string; unit: string; icon: string }> = {
  study_time: { name: 'Study Time', unit: 'min', icon: '⏰' },
  sessions: { name: 'Sessions', unit: 'sessions', icon: '📚' },
  conversations: { name: 'Conversations', unit: 'chats', icon: '💬' },
  concepts: { name: 'Concepts', unit: 'concepts', icon: '🎯' },
  accuracy: { name: 'Accuracy', unit: '%', icon: '🎯' },
  streak_days: { name: 'Streak', unit: 'days', icon: '🔥' },
};

const PERIOD_LABELS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  active: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  completed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  failed: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  cancelled: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
};

export function GoalCard({ goal, onCancel }: GoalCardProps) {
  const metricInfo = METRIC_LABELS[goal.metric] || { name: goal.metric, unit: '', icon: '📊' };
  const periodLabel = PERIOD_LABELS[goal.period] || goal.period;
  const statusColor = STATUS_COLORS[goal.status] || STATUS_COLORS.active;

  const progressPercentage = Math.min(goal.progressPercentage, 100);
  const isCompleted = goal.status === 'completed';
  const isActive = goal.status === 'active';
  const isNearCompletion = progressPercentage >= 90 && isActive;

  // Animated counter for current value
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / 1000, 1); // 1 second duration

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(goal.currentValue * easeOutQuart));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(goal.currentValue);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [goal.currentValue]);

  // Spring animation for progress bar
  const spring = useSpring(progressPercentage, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        boxShadow: isNearCompletion
          ? '0 0 20px rgba(59, 130, 246, 0.5)'
          : undefined
      }}
      whileHover={{
        y: -4,
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative p-4 rounded-xl border-2 ${statusColor.border} ${statusColor.bg} shadow-sm hover:shadow-lg transition-shadow`}
    >
      {/* Near completion pulse effect */}
      {isNearCompletion && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-blue-400"
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{metricInfo.icon}</span>
          <div>
            <h3 className="font-semibold text-gray-900">
              {metricInfo.name} Goal
            </h3>
            <p className="text-sm text-gray-500">{periodLabel}</p>
          </div>
        </div>

        {isActive && onCancel && (
          <button
            onClick={() => onCancel(goal.id)}
            className="p-1 rounded-lg hover:bg-white/50 transition-colors"
            aria-label="Cancel goal"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}

        {isCompleted && (
          <div className="p-1 rounded-full bg-green-500">
            <Check className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <motion.span
              key={displayValue}
              initial={{ scale: 1.2, color: '#3b82f6' }}
              animate={{ scale: 1, color: '#374151' }}
              className="text-sm font-bold text-gray-700"
            >
              {displayValue}
            </motion.span>
            <span className="text-sm text-gray-500">/ {goal.targetValue} {metricInfo.unit}</span>
          </div>
          <div className="flex items-center gap-1">
            {isNearCompletion && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-blue-500"
              >
                <TrendingUp className="w-4 h-4" />
              </motion.div>
            )}
            <motion.span
              key={progressPercentage}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="text-sm font-bold text-gray-900"
            >
              {Math.round(progressPercentage)}%
            </motion.span>
          </div>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden relative">
          <motion.div
            style={{ width: spring.get() + '%' }}
            className={`h-full relative ${
              isCompleted
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : progressPercentage >= 75
                ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                : progressPercentage >= 50
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                : 'bg-gradient-to-r from-orange-500 to-red-500'
            }`}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {goal.subject === 'all' ? 'All Subjects' : goal.subject.charAt(0).toUpperCase() + goal.subject.slice(1)}
        </span>
        {isActive && (
          <span className="flex items-center gap-1">
            <span>⭐</span>
            <span className="font-semibold text-yellow-600">{goal.xpReward} XP</span>
          </span>
        )}
        {isCompleted && goal.completedAt && (
          <span className="text-green-600 font-medium">
            Completed {new Date(goal.completedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* End Date Warning */}
      {isActive && new Date(goal.endDate) < new Date(Date.now() + 24 * 60 * 60 * 1000) && (
        <div className="mt-2 p-2 bg-orange-100 border border-orange-300 rounded-lg">
          <p className="text-xs text-orange-800 font-medium">
            ⚠️ Ends {new Date(goal.endDate).toLocaleDateString()}
          </p>
        </div>
      )}
    </motion.div>
  );
}
