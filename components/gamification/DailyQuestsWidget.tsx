'use client';

import { motion } from 'framer-motion';
import {
  Clock,
  MessageSquare,
  BookOpen,
  Zap,
  CheckCircle2,
  Circle,
  Gift,
  Sparkles,
} from 'lucide-react';
import type { DailyGoalsProgress } from '@/lib/gamification/daily-goals';

interface DailyQuestsWidgetProps {
  goals: DailyGoalsProgress;
  className?: string;
}

const QUEST_CONFIG = {
  xp: {
    icon: Zap,
    color: 'yellow',
    gradient: 'from-yellow-400 to-orange-500',
    title: 'XP 획득',
    unit: 'XP',
  },
  sessions: {
    icon: MessageSquare,
    color: 'blue',
    gradient: 'from-blue-400 to-indigo-500',
    title: '학습 세션',
    unit: '회',
  },
  studyTime: {
    icon: Clock,
    color: 'purple',
    gradient: 'from-purple-400 to-pink-500',
    title: '학습 시간',
    unit: '분',
  },
  perfectAnswers: {
    icon: BookOpen,
    color: 'green',
    gradient: 'from-green-400 to-emerald-500',
    title: '완벽한 답변',
    unit: '개',
  },
};

export function DailyQuestsWidget({ goals, className = '' }: DailyQuestsWidgetProps) {
  // Use goals.goals array instead of treating goals as an object
  const dailyGoals = goals.goals || [];
  const completedCount = dailyGoals.filter((goal) => goal.completed).length;
  const totalCount = dailyGoals.length;
  const allCompleted = completedCount === totalCount;

  // Calculate overall progress
  const overallProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            📋 오늘의 퀘스트
            {allCompleted && (
              <motion.span
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring' }}
              >
                🎉
              </motion.span>
            )}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {completedCount}/{totalCount} 완료
          </p>
        </div>

        {/* Reward Chest Icon */}
        <motion.div
          animate={allCompleted ? {
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          } : {}}
          transition={{
            duration: 0.6,
            repeat: allCompleted ? Infinity : 0,
            repeatDelay: 2,
          }}
          className="relative"
        >
          <Gift className={`w-10 h-10 ${
            allCompleted
              ? 'text-yellow-500'
              : 'text-gray-400 dark:text-gray-600'
          }`} />
          {allCompleted && (
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-30"
            />
          )}
        </motion.div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="absolute h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />

          {/* Sparkle Effect when completed */}
          {allCompleted && (
            <motion.div
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
              style={{ width: '50%' }}
            />
          )}
        </div>
      </div>

      {/* Quest List */}
      <div className="space-y-3">
        {dailyGoals.map((quest, index) => {
          const config = QUEST_CONFIG[quest.type as keyof typeof QUEST_CONFIG];
          if (!config) return null; // Skip if no config found
          const Icon = config.icon;
          const progress = Math.min((quest.current / quest.target) * 100, 100);
          const isCompleted = quest.completed;

          return (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative group ${
                isCompleted
                  ? 'bg-gradient-to-r ' + config.gradient + ' bg-opacity-10'
                  : 'bg-gray-50 dark:bg-gray-900'
              } rounded-xl p-4 transition-all hover:shadow-md`}
            >
              {/* Checkmark or Circle */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <CheckCircle2 className={`w-6 h-6 text-${config.color}-500`} />
                    </motion.div>
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400 dark:text-gray-600" />
                  )}

                  {/* Pulsing Effect for Active Quests */}
                  {!isCompleted && progress > 0 && (
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className={`absolute inset-0 bg-${config.color}-400 rounded-full blur-md`}
                    />
                  )}
                </div>

                <div className="flex-1">
                  {/* Quest Title */}
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-5 h-5 ${
                      isCompleted
                        ? `text-${config.color}-600 dark:text-${config.color}-400`
                        : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <span className={`font-semibold ${
                      isCompleted
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {config.title}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {quest.current} / {quest.target} {config.unit}
                    </span>
                    <span className={`text-sm font-semibold ${
                      isCompleted
                        ? `text-${config.color}-600 dark:text-${config.color}-400`
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {Math.round(progress)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className={`absolute h-full bg-gradient-to-r ${config.gradient} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
                    />
                  </div>

                  {/* Completion Badge */}
                  {isCompleted && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-white/50 dark:bg-gray-800/50 rounded-full text-xs font-semibold"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>완료!</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* All Completed Celebration */}
      {allCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl text-white text-center"
        >
          <div className="text-3xl mb-2">🎉</div>
          <div className="font-bold text-lg mb-1">오늘의 퀘스트 완료!</div>
          <div className="text-sm opacity-90">
            모든 퀘스트를 완료했습니다. 보상을 받으세요!
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-3 px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold text-sm shadow-lg"
          >
            보상 받기 🎁
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Compact daily quests indicator for headers
 */
interface QuestsIndicatorProps {
  completed: number;
  total: number;
  onClick?: () => void;
}

export function QuestsIndicator({ completed, total, onClick }: QuestsIndicatorProps) {
  const allCompleted = completed === total;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-md ${
        allCompleted
          ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      }`}
    >
      <span className="text-lg">{allCompleted ? '🎉' : '📋'}</span>
      <span className="font-semibold text-sm">
        {completed}/{total}
      </span>
    </motion.button>
  );
}
