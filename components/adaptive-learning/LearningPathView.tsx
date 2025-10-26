'use client';

import { motion } from 'framer-motion';
import { LearningPathway, PathStep } from '@/lib/adaptive-learning/types';
import { CheckCircle2, Circle, Lock, Target } from 'lucide-react';
import DifficultyIndicator from './DifficultyIndicator';

interface LearningPathViewProps {
  pathway: LearningPathway;
  onStepClick?: (step: PathStep) => void;
}

export default function LearningPathView({
  pathway,
  onStepClick,
}: LearningPathViewProps) {
  const completedSteps = pathway.steps.filter(s => s.completed).length;
  const progress = (completedSteps / pathway.steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {pathway.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {pathway.goal}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(progress)}%
          </div>
          <div className="text-xs text-gray-500">
            {completedSteps} / {pathway.steps.length} 완료
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full"
        />
      </div>

      {/* Estimated Time */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Target className="w-4 h-4" />
        <span>예상 소요 시간: {pathway.estimatedCompletion}분</span>
      </div>

      {/* Path Steps */}
      <div className="space-y-3">
        {pathway.steps.map((step, index) => {
          const isLocked =
            index > 0 && !pathway.steps[index - 1].completed && !step.completed;
          const isCurrent = !step.completed && (index === 0 || pathway.steps[index - 1].completed);

          return (
            <motion.div
              key={step.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => !isLocked && onStepClick?.(step)}
              className={`
                relative p-4 rounded-xl border-2 transition-all
                ${step.completed
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                  : isCurrent
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 shadow-lg'
                  : isLocked
                  ? 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-50'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                }
                ${!isLocked && 'cursor-pointer hover:shadow-lg'}
              `}
            >
              <div className="flex items-center gap-4">
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {step.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : isLocked ? (
                    <Lock className="w-6 h-6 text-gray-400" />
                  ) : (
                    <Circle className="w-6 h-6 text-purple-600" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500">
                      {index + 1}단계
                    </span>
                    <DifficultyIndicator difficulty={step.difficulty} size="sm" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {step.nodeName}
                  </h4>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                    <span>⏱️ {step.estimatedTime}분</span>
                    {step.masteryAchieved && (
                      <span className="text-green-600 font-medium">
                        ✓ 숙달 완료
                      </span>
                    )}
                  </div>
                </div>

                {/* Current Indicator */}
                {isCurrent && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="flex-shrink-0 px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full"
                  >
                    현재
                  </motion.div>
                )}
              </div>

              {/* Connector Line */}
              {index < pathway.steps.length - 1 && (
                <div
                  className={`absolute left-7 top-full h-3 w-0.5 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Milestones */}
      {pathway.milestones.length > 0 && (
        <div className="mt-8 space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            🏆 마일스톤
          </h4>
          <div className="grid gap-3">
            {pathway.milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  p-3 rounded-lg border
                  ${milestone.achieved
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {milestone.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {milestone.description}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-purple-600">
                      +{milestone.xpReward} XP
                    </div>
                    {milestone.achieved && (
                      <div className="text-xs text-green-600 mt-0.5">
                        ✓ 달성
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
