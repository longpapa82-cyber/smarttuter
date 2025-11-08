'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, Zap, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LevelUpCelebrationProps {
  show: boolean;
  newLevel: number;
  xpEarned: number;
  onComplete?: () => void;
}

export function LevelUpCelebration({
  show,
  newLevel,
  xpEarned,
  onComplete,
}: LevelUpCelebrationProps) {
  const [stage, setStage] = useState<'enter' | 'celebrate' | 'exit'>('enter');

  useEffect(() => {
    if (show) {
      setStage('enter');
      const celebrateTimer = setTimeout(() => setStage('celebrate'), 500);
      const exitTimer = setTimeout(() => {
        setStage('exit');
        if (onComplete) {
          setTimeout(onComplete, 500);
        }
      }, 3500);

      return () => {
        clearTimeout(celebrateTimer);
        clearTimeout(exitTimer);
      };
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
        >
          {/* Animated Background Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{
                  x: '50vw',
                  y: '50vh',
                  scale: 0,
                  opacity: 0,
                }}
                animate={{
                  x: `${Math.random() * 100}vw`,
                  y: `${Math.random() * 100}vh`,
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 2,
                }}
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </motion.div>
            ))}
          </div>

          {/* Main Content Card */}
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-3xl p-10 max-w-md mx-4 shadow-2xl overflow-hidden"
          >
            {/* Glowing Border Effect */}
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 opacity-30 blur-xl"
            />

            {/* Content */}
            <div className="relative z-10">
              {/* Level Up Title */}
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-6"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: 3,
                    repeatDelay: 0.3,
                  }}
                  className="text-6xl mb-4"
                >
                  🎉
                </motion.div>

                <h2 className="text-3xl font-bold text-white mb-2">
                  레벨 업!
                </h2>
                <p className="text-blue-100 text-sm">
                  축하합니다! 새로운 레벨에 도달했습니다
                </p>
              </motion.div>

              {/* New Level Display */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
                className="relative mb-6"
              >
                {/* Level Badge */}
                <div className="relative">
                  {/* Rotating Glow */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-40 h-40 rounded-full bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 blur-xl opacity-50" />
                  </motion.div>

                  {/* Level Number */}
                  <div className="relative bg-white rounded-full w-32 h-32 mx-auto flex items-center justify-center shadow-2xl">
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
                      >
                        {newLevel}
                      </motion.div>
                      <div className="text-xs text-gray-600 font-semibold">
                        LEVEL
                      </div>
                    </div>
                  </div>

                  {/* Orbiting Stars */}
                  {[0, 120, 240].map((rotation, i) => (
                    <motion.div
                      key={i}
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'linear',
                        delay: i * 0.3,
                      }}
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ transform: `rotate(${rotation}deg)` }}
                    >
                      <Star className="w-6 h-6 text-yellow-300 fill-yellow-300 absolute top-0" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* XP Earned */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6"
              >
                <div className="flex items-center justify-center gap-3">
                  <Zap className="w-6 h-6 text-yellow-300" />
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">
                      +{xpEarned} XP
                    </div>
                    <div className="text-sm text-blue-100">획득</div>
                  </div>
                </div>
              </motion.div>

              {/* Unlocked Benefits */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="space-y-3"
              >
                <div className="text-center text-sm text-blue-100 mb-2">
                  🎁 레벨업 보상
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-2xl mb-1">✨</div>
                    <div className="text-xs text-white font-semibold">
                      새로운 배지
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-2xl mb-1">🏆</div>
                    <div className="text-xs text-white font-semibold">
                      특별 칭호
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Continue Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                onClick={onComplete}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full mt-6 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
              >
                계속하기
                <TrendingUp className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Compact level-up notification for non-blocking UX
 */
interface LevelUpToastProps {
  show: boolean;
  newLevel: number;
  onClose?: () => void;
}

export function LevelUpToast({ show, newLevel, onClose }: LevelUpToastProps) {
  useEffect(() => {
    if (show && onClose) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-4 shadow-2xl flex items-center gap-4 min-w-[280px]">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            >
              <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
            </motion.div>

            <div className="flex-1">
              <div className="text-white font-bold text-lg">레벨 업!</div>
              <div className="text-blue-100 text-sm">
                레벨 {newLevel}에 도달했습니다
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
