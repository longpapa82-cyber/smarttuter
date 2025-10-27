"use client";

import { useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import Confetti from "react-confetti";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Client-side only
    if (typeof window === 'undefined') return;

    // Set window dimensions
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Listen for level up events
    const handleLevelUp = (event: CustomEvent) => {
      const { newLevel } = event.detail;

      // Show confetti
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);

      // Show toast notification
      toast.custom(
        (t) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-2xl p-6 shadow-2xl max-w-md"
          >
            <div className="text-center text-white">
              <div className="text-6xl mb-3">🎉</div>
              <h3 className="text-2xl font-bold mb-2">레벨 업!</h3>
              <p className="text-lg">
                축하합니다! 레벨 {newLevel}에 도달했습니다!
              </p>
            </div>
          </motion.div>
        ),
        {
          duration: 4000,
          position: "top-center",
        }
      );
    };

    // Listen for achievement unlock events
    const handleAchievement = (event: CustomEvent) => {
      const { achievement } = event.detail;

      toast.custom(
        (t) => (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="bg-white rounded-xl p-4 shadow-lg border-2 border-yellow-400 max-w-sm"
          >
            <div className="flex items-center gap-3">
              <div className="text-4xl">{achievement.icon}</div>
              <div>
                <p className="font-semibold text-gray-900">업적 달성!</p>
                <p className="text-sm text-gray-700">{achievement.nameKo}</p>
                <p className="text-xs text-gray-600">
                  {achievement.descriptionKo}
                </p>
              </div>
            </div>
          </motion.div>
        ),
        {
          duration: 3000,
          position: "bottom-right",
        }
      );
    };

    // Add event listeners
    window.addEventListener("levelup" as any, handleLevelUp);
    window.addEventListener("achievement" as any, handleAchievement);

    // Cleanup
    return () => {
      window.removeEventListener("levelup" as any, handleLevelUp);
      window.removeEventListener("achievement" as any, handleAchievement);
    };
  }, []);

  return (
    <>
      {children}
      <Toaster />
      <AnimatePresence>
        {showConfetti && (
          <Confetti
            width={dimensions.width}
            height={dimensions.height}
            recycle={false}
            numberOfPieces={500}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// XP Toast Helper
export function showXPGain(amount: number, reason: string) {
  toast.custom(
    (t) => (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="bg-purple-500 text-white rounded-lg px-4 py-2 shadow-lg font-semibold"
      >
        +{amount} XP - {reason}
      </motion.div>
    ),
    {
      duration: 2000,
      position: "top-right",
    }
  );
}
