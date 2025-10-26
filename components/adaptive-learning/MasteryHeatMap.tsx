'use client';

import { motion } from 'framer-motion';
import { CategoryMastery } from '@/lib/adaptive-learning/types';

interface MasteryHeatMapProps {
  categories: CategoryMastery[];
}

export default function MasteryHeatMap({ categories }: MasteryHeatMapProps) {
  const getMasteryColor = (mastery: number): string => {
    if (mastery >= 80) return 'bg-green-500';
    if (mastery >= 60) return 'bg-blue-500';
    if (mastery >= 40) return 'bg-yellow-500';
    if (mastery >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getMasteryLabel = (mastery: number): string => {
    if (mastery >= 80) return '우수';
    if (mastery >= 60) return '양호';
    if (mastery >= 40) return '보통';
    if (mastery >= 20) return '부족';
    return '매우 부족';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        📊 영역별 숙달도
      </h3>

      <div className="grid gap-3">
        {categories.map((category, index) => (
          <motion.div
            key={category.category}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group"
          >
            {/* Category Name */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium text-gray-900 dark:text-white">
                  {category.category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {category.masteredCount}/{category.nodeCount}
                </span>
                <span className={`
                  px-2 py-0.5 text-xs font-bold rounded-full
                  ${category.mastery >= 80
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : category.mastery >= 60
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : category.mastery >= 40
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  }
                `}>
                  {getMasteryLabel(category.mastery)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${category.mastery}%` }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`h-full ${getMasteryColor(category.mastery)} relative`}
              >
                {/* Mastery Percentage */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-sm drop-shadow-lg">
                    {category.mastery}%
                  </span>
                </div>
              </motion.div>

              {/* Background Percentage (when bar is too small) */}
              {category.mastery < 20 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-600 dark:text-gray-400 font-bold text-sm">
                    {category.mastery}%
                  </span>
                </div>
              )}
            </div>

            {/* Details on Hover */}
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              whileHover={{ height: 'auto', opacity: 1 }}
              className="overflow-hidden"
            >
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium">숙달:</span> {category.masteredCount}개
                  </div>
                  <div>
                    <span className="font-medium">진행중:</span> {category.inProgressCount}개
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-red-500 rounded" />
          <span className="text-xs text-gray-600 dark:text-gray-400">0-19%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-orange-500 rounded" />
          <span className="text-xs text-gray-600 dark:text-gray-400">20-39%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-yellow-500 rounded" />
          <span className="text-xs text-gray-600 dark:text-gray-400">40-59%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-blue-500 rounded" />
          <span className="text-xs text-gray-600 dark:text-gray-400">60-79%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span className="text-xs text-gray-600 dark:text-gray-400">80-100%</span>
        </div>
      </div>
    </div>
  );
}
