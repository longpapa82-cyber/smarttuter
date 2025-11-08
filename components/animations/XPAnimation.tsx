'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, TrendingUp } from 'lucide-react';

interface XPAnimationProps {
  /**
   * XP amount to display
   */
  xp: number;
  /**
   * Whether to show the animation
   */
  show: boolean;
  /**
   * Callback when animation completes
   */
  onComplete?: () => void;
  /**
   * Position of the animation (default: center)
   */
  position?: 'center' | 'top' | 'bottom';
  /**
   * Quality level (0-5) for confetti trigger
   * Confetti shows for quality >= 4
   */
  quality?: number;
}

export function XPAnimation({
  xp,
  show,
  onComplete,
  position = 'center',
  quality = 0,
}: XPAnimationProps) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setVisible(true);

      // Trigger confetti for high quality (4 or 5)
      if (quality >= 4) {
        triggerConfetti();
      }

      // Auto-hide after animation
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, quality, onComplete]);

  const triggerConfetti = () => {
    const count = quality === 5 ? 200 : 100;
    const spread = quality === 5 ? 100 : 70;

    confetti({
      particleCount: count,
      spread: spread,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'],
    });

    // Second burst for quality 5
    if (quality === 5) {
      setTimeout(() => {
        confetti({
          particleCount: 150,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#10b981', '#3b82f6', '#8b5cf6'],
        });
      }, 200);

      setTimeout(() => {
        confetti({
          particleCount: 150,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#f59e0b', '#ec4899', '#10b981'],
        });
      }, 400);
    }
  };

  const positionClasses = {
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    top: 'top-20 left-1/2 -translate-x-1/2',
    bottom: 'bottom-20 left-1/2 -translate-x-1/2',
  };

  return (
    <AnimatePresence>
      {visible && (
        <div
          className={`fixed ${positionClasses[position]} z-50 pointer-events-none`}
        >
          {/* Main XP Badge */}
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: -50 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 25,
            }}
            className="relative"
          >
            {/* Glow Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* XP Badge */}
            <div className="relative bg-gradient-to-r from-green-500 to-blue-600 rounded-full px-8 py-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-yellow-300" />
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.2,
                      type: 'spring',
                      stiffness: 300,
                    }}
                    className="text-4xl font-bold text-white"
                  >
                    +{xp}
                  </motion.div>
                  <div className="text-sm font-semibold text-green-100">
                    XP
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-300" />
              </div>
            </div>

            {/* Sparkle Particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                }}
                animate={{
                  x: [0, Math.cos((i * Math.PI) / 4) * 100],
                  y: [0, Math.sin((i * Math.PI) / 4) * 100],
                  opacity: [1, 0],
                  scale: [1, 0],
                }}
                transition={{
                  duration: 1,
                  delay: 0.2,
                  ease: 'easeOut',
                }}
              />
            ))}
          </motion.div>

          {/* Quality-based message */}
          {quality >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-center"
            >
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl px-6 py-3 shadow-lg">
                <div className="text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent">
                  {quality === 5 ? '🏆 완벽해요!' : '⭐ 훌륭해요!'}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * Floating XP indicator for smaller incremental gains
 */
interface FloatingXPProps {
  xp: number;
  show: boolean;
  onComplete?: () => void;
}

export function FloatingXP({ xp, show, onComplete }: FloatingXPProps) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 1, y: -50, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
          }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full px-4 py-2 shadow-lg">
            <span className="text-lg font-bold">+{xp} XP</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Level up animation
 */
interface LevelUpAnimationProps {
  newLevel: number;
  show: boolean;
  onComplete?: () => void;
}

export function LevelUpAnimation({
  newLevel,
  show,
  onComplete,
}: LevelUpAnimationProps) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setVisible(true);

      // Massive confetti burst
      confetti({
        particleCount: 300,
        spread: 180,
        origin: { y: 0.5 },
        colors: ['#fbbf24', '#f59e0b', '#d97706', '#b45309'],
      });

      setTimeout(() => {
        confetti({
          particleCount: 200,
          angle: 90,
          spread: 100,
          origin: { x: 0.5, y: 0.3 },
          colors: ['#10b981', '#059669', '#047857'],
        });
      }, 300);

      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
            }}
            className="relative"
          >
            {/* Radial glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-radial from-yellow-400/50 to-transparent rounded-full blur-3xl"
              animate={{
                scale: [1, 2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />

            {/* Level badge */}
            <div className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-full p-2 shadow-2xl">
              <div className="bg-white dark:bg-gray-900 rounded-full px-12 py-10">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.3,
                      type: 'spring',
                      stiffness: 300,
                    }}
                  >
                    <div className="text-6xl mb-4">🎉</div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent mb-2">
                      레벨 업!
                    </div>
                    <div className="text-5xl font-bold text-gray-900 dark:text-white">
                      Lv. {newLevel}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Rotating stars */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-4xl"
                style={{
                  top: '50%',
                  left: '50%',
                }}
                animate={{
                  x: [0, Math.cos((i * Math.PI) / 6) * 150],
                  y: [0, Math.sin((i * Math.PI) / 6) * 150],
                  opacity: [0, 1, 0],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  ease: 'easeOut',
                }}
              >
                ⭐
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
