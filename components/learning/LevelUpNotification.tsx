'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Award, Target, Sparkles } from 'lucide-react';
import { CEFRLevel } from '@/lib/learning/level-detector';
import { DifficultyAdjustmentResult } from '@/lib/learning/adaptive-learning';

interface LevelUpNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  adjustmentResult: DifficultyAdjustmentResult;
  fromLevel: CEFRLevel;
  toLevel: CEFRLevel;
}

const LEVEL_COLORS: Record<CEFRLevel, { bg: string; text: string; glow: string }> = {
  A1: { bg: 'from-green-400 to-emerald-500', text: 'text-green-600', glow: 'shadow-green-500/50' },
  A2: { bg: 'from-blue-400 to-cyan-500', text: 'text-blue-600', glow: 'shadow-blue-500/50' },
  B1: { bg: 'from-purple-400 to-violet-500', text: 'text-purple-600', glow: 'shadow-purple-500/50' },
  B2: { bg: 'from-pink-400 to-rose-500', text: 'text-pink-600', glow: 'shadow-pink-500/50' },
  C1: { bg: 'from-orange-400 to-amber-500', text: 'text-orange-600', glow: 'shadow-orange-500/50' },
  C2: { bg: 'from-yellow-400 to-yellow-500', text: 'text-yellow-600', glow: 'shadow-yellow-500/50' },
};

const LEVEL_DESCRIPTIONS: Record<CEFRLevel, string> = {
  A1: '기초 입문',
  A2: '초급',
  B1: '중급 1',
  B2: '중급 2',
  C1: '고급 1',
  C2: '고급 2 (원어민)',
};

export default function LevelUpNotification({
  isOpen,
  onClose,
  adjustmentResult,
  fromLevel,
  toLevel,
}: LevelUpNotificationProps) {
  const isLevelUp = adjustmentResult.isLevelUp;
  const isLevelDown = adjustmentResult.isLevelDown;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header with Close Button */}
            <div className="relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-700/80 hover:bg-white dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Animated Background */}
              <div className={`relative h-48 bg-gradient-to-br ${LEVEL_COLORS[toLevel].bg} overflow-hidden`}>
                {/* Floating Particles */}
                {isLevelUp && (
                  <>
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white rounded-full"
                        initial={{
                          x: Math.random() * 400,
                          y: 200,
                          opacity: 0
                        }}
                        animate={{
                          y: -50,
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 2 + Math.random() * 2,
                          repeat: Infinity,
                          delay: Math.random() * 2,
                        }}
                      />
                    ))}
                  </>
                )}

                {/* Main Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
                    className="relative"
                  >
                    {isLevelUp && (
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        <Award className="w-24 h-24 text-white drop-shadow-2xl" />
                      </motion.div>
                    )}
                    {isLevelDown && (
                      <TrendingUp className="w-24 h-24 text-white drop-shadow-2xl opacity-70" />
                    )}
                    {!isLevelUp && !isLevelDown && (
                      <Target className="w-24 h-24 text-white drop-shadow-2xl" />
                    )}

                    {/* Sparkles for level up */}
                    {isLevelUp && (
                      <>
                        <motion.div
                          className="absolute -top-4 -left-4"
                          animate={{
                            scale: [0, 1, 0],
                            rotate: [0, 180, 360],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: 0,
                          }}
                        >
                          <Sparkles className="w-8 h-8 text-yellow-300" />
                        </motion.div>
                        <motion.div
                          className="absolute -bottom-4 -right-4"
                          animate={{
                            scale: [0, 1, 0],
                            rotate: [0, -180, -360],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: 0.5,
                          }}
                        >
                          <Sparkles className="w-8 h-8 text-yellow-300" />
                        </motion.div>
                      </>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-6"
              >
                <h2 className={`text-3xl font-bold mb-2 ${LEVEL_COLORS[toLevel].text}`}>
                  {isLevelUp && '🎉 레벨업!'}
                  {isLevelDown && '📘 레벨 조정'}
                  {!isLevelUp && !isLevelDown && '✅ 레벨 유지'}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  {adjustmentResult.reason}
                </p>
              </motion.div>

              {/* Level Transition */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-4 mb-6"
              >
                {/* From Level */}
                <div className="text-center">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${LEVEL_COLORS[fromLevel].bg} flex items-center justify-center mb-2 shadow-lg`}>
                    <span className="text-3xl font-bold text-white">{fromLevel}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {LEVEL_DESCRIPTIONS[fromLevel]}
                  </p>
                </div>

                {/* Arrow */}
                <motion.div
                  animate={isLevelUp ? { x: [0, 10, 0] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </motion.div>

                {/* To Level */}
                <div className="text-center">
                  <motion.div
                    animate={isLevelUp ? {
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        '0 10px 30px rgba(0,0,0,0.2)',
                        '0 15px 40px rgba(0,0,0,0.3)',
                        '0 10px 30px rgba(0,0,0,0.2)',
                      ],
                    } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${LEVEL_COLORS[toLevel].bg} flex items-center justify-center mb-2 shadow-lg ${LEVEL_COLORS[toLevel].glow}`}
                  >
                    <span className="text-3xl font-bold text-white">{toLevel}</span>
                  </motion.div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {LEVEL_DESCRIPTIONS[toLevel]}
                  </p>
                </div>
              </motion.div>

              {/* Assessment Info */}
              {adjustmentResult.assessment && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    📊 평가 결과
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">종합 점수:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {adjustmentResult.assessment.assessmentDetails.overallScore}점
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">신뢰도:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {adjustmentResult.assessment.confidence}%
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="text-center p-2 bg-white dark:bg-gray-600 rounded-lg">
                        <div className="text-xs text-gray-500 dark:text-gray-400">어휘</div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          {adjustmentResult.assessment.assessmentDetails.vocabularyLevel}
                        </div>
                      </div>
                      <div className="text-center p-2 bg-white dark:bg-gray-600 rounded-lg">
                        <div className="text-xs text-gray-500 dark:text-gray-400">문법</div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          {adjustmentResult.assessment.assessmentDetails.grammarLevel}
                        </div>
                      </div>
                      <div className="text-center p-2 bg-white dark:bg-gray-600 rounded-lg">
                        <div className="text-xs text-gray-500 dark:text-gray-400">복잡도</div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          {adjustmentResult.assessment.assessmentDetails.sentenceComplexity}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Next Steps (for level up only) */}
              {isLevelUp && adjustmentResult.assessment && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6"
                >
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    다음 목표
                  </h3>
                  <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                    {adjustmentResult.assessment.nextSteps.slice(0, 3).map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                onClick={onClose}
                className={`w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r ${LEVEL_COLORS[toLevel].bg} hover:shadow-xl transition-all transform hover:scale-105`}
              >
                {isLevelUp && '계속 학습하기 →'}
                {isLevelDown && '다시 시작하기'}
                {!isLevelUp && !isLevelDown && '확인'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
