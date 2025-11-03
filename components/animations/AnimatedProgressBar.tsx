"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedProgressBarProps {
  progress: number; // 0-100
  color?: "blue" | "purple" | "green" | "orange" | "pink";
  height?: "sm" | "md" | "lg";
  showLabel?: boolean;
  delay?: number;
  duration?: number;
}

const colorClasses = {
  blue: "from-blue-500 to-indigo-600",
  purple: "from-purple-500 to-pink-600",
  green: "from-green-500 to-emerald-600",
  orange: "from-orange-500 to-amber-600",
  pink: "from-pink-500 to-rose-600",
};

const heightClasses = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

export function AnimatedProgressBar({
  progress,
  color = "blue",
  height = "md",
  showLabel = false,
  delay = 0,
  duration = 1.5,
}: AnimatedProgressBarProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [progress, delay]);

  return (
    <div className="w-full space-y-1">
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">진행도</span>
          <motion.span
            className="font-semibold text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.5, duration: 0.3 }}
          >
            {Math.round(displayProgress)}%
          </motion.span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClasses[height]}`}>
        <motion.div
          className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full relative`}
          initial={{ width: 0 }}
          animate={{ width: `${displayProgress}%` }}
          transition={{
            delay,
            duration,
            ease: "easeOut",
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{
              delay: delay + 0.2,
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
