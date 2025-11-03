'use client';

import { motion } from 'framer-motion';
import { Flashcard } from '@/lib/interactive-learning/types';
import {
  calculateMasteryStats,
  getCardsByMasteryLevel,
  getMasteryLevelColor,
  getMasteryLevelName,
  getMasteryLevelDescription,
  estimateTimeToMastery,
  type MasteryLevel,
} from '@/lib/interactive-learning/mastery-calculator';
import { CircularProgress } from './CircularProgress';
import { TrendingUp, Target, Calendar } from 'lucide-react';

interface FlashcardMasteryDashboardProps {
  flashcards: Flashcard[];
  className?: string;
}

export function FlashcardMasteryDashboard({
  flashcards,
  className = '',
}: FlashcardMasteryDashboardProps) {
  const stats = calculateMasteryStats(flashcards);
  const estimatedDays = estimateTimeToMastery(flashcards);

  const masteryLevels: MasteryLevel[] = ['learning', 'proficient', 'mastered'];

  if (flashcards.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            아직 플래시카드가 없어요
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            첫 플래시카드를 만들어 학습을 시작해보세요!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg p-8 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            마스터리 진행 상황
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          총 {stats.total}개 카드의 숙달도를 확인하세요
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Circular Progress */}
        <div className="flex items-center justify-center">
          <CircularProgress
            value={stats.masteryPercentage}
            size={220}
            strokeWidth={16}
            label="전체 숙달도"
            color="gradient"
          />
        </div>

        {/* Right: Mastery Level Cards */}
        <div className="space-y-4">
          {masteryLevels.map((level, index) => {
            const count = stats[level];
            const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            const color = getMasteryLevelColor(level);
            const cards = getCardsByMasteryLevel(flashcards, level);

            return (
              <motion.div
                key={level}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white dark:bg-gray-800 rounded-xl p-5 border-2 ${color.light} ${color.dark} shadow-md hover:shadow-lg transition-all cursor-pointer group`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{color.icon}</div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {getMasteryLevelName(level)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getMasteryLevelDescription(level)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {count}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {percentage}%
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${color.gradient}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
                  />
                </div>

                {/* Sample Cards Preview (on hover) */}
                {cards.length > 0 && (
                  <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      예시 카드:
                    </div>
                    <div className="space-y-1">
                      {cards.slice(0, 2).map((card) => (
                        <div
                          key={card.id}
                          className="text-xs text-gray-700 dark:text-gray-300 truncate bg-gray-50 dark:bg-gray-900/50 px-2 py-1 rounded"
                        >
                          • {card.front}
                        </div>
                      ))}
                      {cards.length > 2 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                          외 {cards.length - 2}개 더...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        {/* Total Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md"
        >
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">전체 카드</div>
            </div>
          </div>
        </motion.div>

        {/* Mastered Percentage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="text-4xl">🏆</div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.mastered}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">완전 숙달</div>
            </div>
          </div>
        </motion.div>

        {/* Estimated Time to Mastery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md"
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {estimatedDays === 0 ? '완료!' : `${estimatedDays}일`}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {estimatedDays === 0 ? '모두 숙달' : '숙달까지 예상'}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Motivational Message */}
      {stats.masteryPercentage < 100 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl"
        >
          <p className="text-center text-gray-800 dark:text-gray-200">
            {stats.masteryPercentage >= 80
              ? '🎉 거의 다 왔어요! 조금만 더 화이팅!'
              : stats.masteryPercentage >= 50
              ? '💪 절반을 넘었네요! 꾸준히 복습하면 곧 마스터!'
              : stats.masteryPercentage >= 25
              ? '📚 좋은 시작이에요! 매일 조금씩 복습해보세요!'
              : '🚀 새로운 시작! 꾸준한 복습이 성공의 열쇠에요!'}
          </p>
        </motion.div>
      )}

      {stats.masteryPercentage === 100 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.7 }}
          className="mt-6 p-6 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl text-center"
        >
          <div className="text-6xl mb-3">🎊</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            완벽한 마스터!
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            모든 카드를 완전히 숙달했어요! 정말 대단해요! 🏆
          </p>
        </motion.div>
      )}
    </div>
  );
}
