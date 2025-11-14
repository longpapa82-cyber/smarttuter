'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { CheckCircle, X } from 'lucide-react';
import { LearningGoal } from '@/lib/goals/types';

interface GoalCompletionCelebrationProps {
  goal: LearningGoal | null;
  onClose: () => void;
}

export function GoalCompletionCelebration({ goal, onClose }: GoalCompletionCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (goal) {
      setShowConfetti(true);
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      // Stop confetti after 5 seconds
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [goal]);

  if (!goal) return null;

  return (
    <AnimatePresence>
      <div className="relative z-50">
        {/* Confetti */}
        {showConfetti && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
          />
        )}

        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-gradient-to-br from-yellow-50 via-white to-green-50 rounded-3xl shadow-2xl p-8 relative overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50 transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>

            {/* Success icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <CheckCircle className="w-24 h-24 text-green-500 fill-green-500" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="absolute inset-0 bg-green-400 rounded-full opacity-20"
                />
              </div>
            </motion.div>

            {/* Content */}
            <div className="text-center space-y-4">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-gray-900"
              >
                Goal Completed! 🎉
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-gray-700"
              >
                Congratulations on completing your goal!
              </motion.p>

              {/* XP Reward */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg"
              >
                <span className="text-2xl">⭐</span>
                <span className="text-2xl font-bold text-white">
                  +{goal.xpReward} XP
                </span>
              </motion.div>

              {/* Goal details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="p-4 bg-white/80 rounded-xl border border-green-200"
              >
                <p className="text-sm text-gray-600 mb-1">You achieved:</p>
                <p className="text-lg font-semibold text-gray-900">
                  {goal.currentValue} / {goal.targetValue}
                </p>
                <p className="text-sm text-gray-500 capitalize">
                  {goal.period} {goal.metric.replace('_', ' ')}
                </p>
              </motion.div>

              {/* Continue button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
              >
                Continue Learning
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
