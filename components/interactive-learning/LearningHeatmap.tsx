'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  LearningDay,
  HeatmapWeek,
  generateLearningDays,
  groupByWeeks,
  getIntensityColor,
  getMonthLabels,
  weekdayLabels,
  calculateHeatmapStats,
} from '@/lib/interactive-learning/heatmap-data';
import { Calendar, Flame, Award, TrendingUp } from 'lucide-react';

interface LearningHeatmapProps {
  /**
   * Optional: Provide actual learning data
   * If not provided, will generate sample data
   */
  learningDays?: LearningDay[];
  /**
   * Number of days to display (default: 90)
   */
  daysToShow?: number;
  className?: string;
}

export function LearningHeatmap({
  learningDays,
  daysToShow = 90,
  className = '',
}: LearningHeatmapProps) {
  // Use provided data or generate sample data
  const days = learningDays || generateLearningDays(daysToShow);
  const weeks = groupByWeeks(days);
  const monthLabels = getMonthLabels(weeks);
  const stats = calculateHeatmapStats(days);

  // Tooltip state
  const [hoveredDay, setHoveredDay] = useState<LearningDay | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleCellHover = (day: LearningDay | null, event?: React.MouseEvent) => {
    setHoveredDay(day);
    if (event && day) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              학습 히트맵
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              최근 {daysToShow}일간의 학습 활동
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex gap-4">
          <div className="text-center">
            <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
              <Flame className="w-5 h-5" />
              <span className="text-2xl font-bold">{stats.currentStreak}</span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              현재 스트릭
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
              <Award className="w-5 h-5" />
              <span className="text-2xl font-bold">{stats.longestStreak}</span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              최장 스트릭
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <TrendingUp className="w-5 h-5" />
              <span className="text-2xl font-bold">{stats.activeDays}</span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              활동일
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month Labels */}
          <div className="flex mb-2 pl-8">
            {monthLabels.map((label, index) => (
              <div
                key={index}
                className="text-xs font-semibold text-gray-600 dark:text-gray-400"
                style={{
                  marginLeft: index === 0 ? `${label.offset * 14}px` : '0',
                  minWidth: '56px',
                }}
              >
                {label.month}
              </div>
            ))}
          </div>

          {/* Grid Container */}
          <div className="flex gap-1">
            {/* Weekday Labels */}
            <div className="flex flex-col gap-1">
              {weekdayLabels.map((label, index) => (
                <div
                  key={index}
                  className="w-6 h-3 flex items-center justify-end text-xs text-gray-600 dark:text-gray-400"
                >
                  {index % 2 === 1 ? label : ''}
                </div>
              ))}
            </div>

            {/* Heatmap Cells */}
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.days.map((day, dayIndex) => {
                    if (!day) {
                      // Empty cell for padding
                      return (
                        <div
                          key={`${weekIndex}-${dayIndex}`}
                          className="w-3 h-3 rounded-sm bg-transparent"
                        />
                      );
                    }

                    const colors = getIntensityColor(day.intensity);

                    return (
                      <motion.div
                        key={day.date}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          delay: weekIndex * 0.01 + dayIndex * 0.005,
                          type: 'spring',
                          stiffness: 500,
                          damping: 30,
                        }}
                        whileHover={{ scale: 1.3 }}
                        className={`w-3 h-3 rounded-sm cursor-pointer transition-all ${colors.light} ${colors.dark}`}
                        onMouseEnter={(e) => handleCellHover(day, e)}
                        onMouseLeave={() => handleCellHover(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 justify-end">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              적음
            </span>
            {[0, 1, 2, 3, 4].map((level) => {
              const colors = getIntensityColor(level as 0 | 1 | 2 | 3 | 4);
              return (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-sm ${colors.light} ${colors.dark}`}
                />
              );
            })}
            <span className="text-xs text-gray-600 dark:text-gray-400">
              많음
            </span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-lg text-xs">
            <div className="font-semibold mb-1">
              {new Date(hoveredDay.date).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div className="space-y-1">
              <div>📚 플래시카드: {hoveredDay.flashcardsReviewed}개</div>
              <div>📝 퀴즈: {hoveredDay.quizzesTaken}개</div>
              <div>⭐ XP: {hoveredDay.xpEarned}</div>
              <div>⏱️ 학습시간: {hoveredDay.totalMinutes}분</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Additional Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.totalFlashcards}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            총 복습한 카드
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.totalQuizzes}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            총 푼 퀴즈
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalXP.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            총 획득 XP
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {Math.floor(stats.totalMinutes / 60)}h {stats.totalMinutes % 60}m
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            총 학습시간
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🎯</div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white mb-1">
              {stats.currentStreak >= 7
                ? '🔥 놀라운 연속 학습 기록이에요!'
                : stats.currentStreak >= 3
                ? '💪 좋은 학습 습관이 형성되고 있어요!'
                : stats.activeDays > 0
                ? '👍 꾸준히 학습하면 더 큰 발전이 있을 거예요!'
                : '시작이 반이에요! 오늘부터 학습을 시작해보세요!'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stats.currentStreak > 0
                ? `${stats.currentStreak}일 연속 학습 중! 내일도 계속해보세요 🚀`
                : '첫 학습을 시작하면 스트릭이 시작됩니다!'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
