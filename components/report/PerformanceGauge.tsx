"use client";

import { motion } from "framer-motion";

interface PerformanceGaugeProps {
  score: number; // 0-100
  label: string;
}

export function PerformanceGauge({ score, label }: PerformanceGaugeProps) {
  const getColor = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-500";
    if (score >= 60) return "from-blue-500 to-cyan-500";
    if (score >= 40) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  const getEmoji = (score: number) => {
    if (score >= 80) return "🌟";
    if (score >= 60) return "😊";
    if (score >= 40) return "🙂";
    return "💪";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress Circle */}
          <motion.circle
            cx="64"
            cy="64"
            r="56"
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDasharray: "0 352" }}
            animate={{
              strokeDasharray: `${(score / 100) * 352} 352`,
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className="text-primary-500" stopColor="currentColor" />
              <stop offset="100%" className="text-secondary-500" stopColor="currentColor" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="text-3xl mb-1"
          >
            {getEmoji(score)}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-2xl font-bold text-gray-800"
          >
            {score}
          </motion.div>
        </div>
      </div>

      <div className="mt-3 text-sm font-semibold text-gray-600">{label}</div>
    </div>
  );
}
