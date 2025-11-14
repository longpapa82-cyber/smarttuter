'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GoalProgress } from '@/lib/goals/types';

interface GoalProgressChartProps {
  goalId: string;
  days?: number;
}

export function GoalProgressChart({ goalId, days = 7 }: GoalProgressChartProps) {
  const [history, setHistory] = useState<GoalProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/goals/history?goalId=${goalId}&days=${days}`);
      const data = await response.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Failed to load goal history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [goalId, days]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No progress data yet</p>
      </div>
    );
  }

  const maxValue = Math.max(...history.map((h) => h.value));
  const chartHeight = 200;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress History</h3>

      <div className="relative" style={{ height: chartHeight }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue / 2)}</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div className="ml-12 h-full flex items-end gap-2">
          {history.map((point, index) => {
            const heightPercent = maxValue > 0 ? (point.value / maxValue) * 100 : 0;

            return (
              <div key={point.date} className="flex-1 flex flex-col items-center gap-2">
                {/* Bar */}
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: `${heightPercent}%`, opacity: 1 }}
                  transition={{
                    height: { duration: 0.6, delay: index * 0.08, ease: 'easeOut' },
                    opacity: { duration: 0.3, delay: index * 0.08 }
                  }}
                  whileHover={{
                    scale: 1.1,
                    filter: 'brightness(1.2)',
                    transition: { duration: 0.2 }
                  }}
                  className="w-full bg-gradient-to-t from-blue-500 via-purple-500 to-pink-500 rounded-t-lg relative group cursor-pointer shadow-lg"
                  style={{ minHeight: heightPercent > 0 ? '8px' : '0' }}
                >
                  {/* Animated glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-t-lg bg-gradient-to-t from-blue-400 to-purple-400 opacity-0 group-hover:opacity-50"
                    animate={{
                      opacity: [0, 0.3, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <motion.div
                      initial={{ y: 10, scale: 0.8 }}
                      whileHover={{ y: 0, scale: 1 }}
                      className="bg-gradient-to-r from-gray-900 to-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap"
                    >
                      <div className="font-bold">{point.value}</div>
                      <div className="text-gray-300">({point.progressPercentage}%)</div>
                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Date label */}
                <span className="text-xs text-gray-500 -rotate-45 origin-top-left mt-2">
                  {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
