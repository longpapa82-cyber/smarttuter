'use client';

import { motion } from 'framer-motion';
import {
  DifficultyLevel,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  XP_MULTIPLIERS,
} from '@/lib/adaptive-learning/types';

interface DifficultyIndicatorProps {
  difficulty: DifficultyLevel;
  showMultiplier?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function DifficultyIndicator({
  difficulty,
  showMultiplier = false,
  size = 'md',
}: DifficultyIndicatorProps) {
  const label = DIFFICULTY_LABELS[difficulty];
  const color = DIFFICULTY_COLORS[difficulty];
  const multiplier = XP_MULTIPLIERS[difficulty];

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSize = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-2"
    >
      <div
        className={`rounded-full font-semibold ${sizeClasses[size]} flex items-center gap-1.5`}
        style={{
          backgroundColor: `${color}20`,
          color: color,
          border: `2px solid ${color}`,
        }}
      >
        {/* Difficulty stars */}
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              width={iconSize[size]}
              height={iconSize[size]}
              viewBox="0 0 20 20"
              fill={i < difficulty ? color : 'none'}
              stroke={color}
              strokeWidth="1.5"
            >
              <path d="M10 2l2.5 6.5H19l-5.5 4 2 6.5L10 15l-5.5 4 2-6.5-5.5-4h6.5z" />
            </svg>
          ))}
        </div>
        <span>{label}</span>
      </div>

      {showMultiplier && (
        <motion.div
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-xs font-medium text-gray-600 dark:text-gray-400"
        >
          XP {multiplier}x
        </motion.div>
      )}
    </motion.div>
  );
}
