'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, Star, TrendingUp } from 'lucide-react';
import { LearningGoal } from '@/lib/goals/types';

interface GoalTimelineProps {
  userId?: string;
}

export function GoalTimeline({ userId }: GoalTimelineProps) {
  const [completedGoals, setCompletedGoals] = useState<LearningGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadCompletedGoals();
  }, [selectedPeriod]);

  const loadCompletedGoals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/goals/list?status=completed`);
      const data = await response.json();
      if (data.success) {
        // Filter by period
        const now = new Date();
        const filtered = data.goals.filter((goal: LearningGoal) => {
          if (!goal.completedAt) return false;
          const completedDate = new Date(goal.completedAt);

          if (selectedPeriod === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return completedDate >= weekAgo;
          } else if (selectedPeriod === 'month') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return completedDate >= monthAgo;
          }
          return true;
        });

        // Sort by completion date (newest first)
        filtered.sort((a: LearningGoal, b: LearningGoal) => {
          return new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime();
        });

        setCompletedGoals(filtered);
      }
    } catch (error) {
      console.error('Failed to load completed goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalXP = completedGoals.reduce((sum, goal) => sum + goal.xpReward, 0);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Achievement Timeline</h2>
            <p className="text-sm text-gray-600">Your completed goals</p>
          </div>
        </div>

        {/* Period Filter */}
        <div className="flex gap-2">
          {(['week', 'month', 'all'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedPeriod === period
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {period === 'week' ? 'Week' : period === 'month' ? 'Month' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      {!isLoading && completedGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-600">Goals</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{completedGoals.length}</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-medium text-yellow-600">Total XP</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalXP}</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-600">Avg XP</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{Math.round(totalXP / completedGoals.length)}</div>
          </div>
        </motion.div>
      )}

      {/* Timeline */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : completedGoals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Completed Goals Yet
          </h3>
          <p className="text-gray-600">
            Complete your first goal to see it here!
          </p>
        </motion.div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>

          {/* Timeline items */}
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {completedGoals.map((goal, index) => {
                const completedDate = new Date(goal.completedAt!);
                const metricLabels: Record<string, { name: string; icon: string }> = {
                  study_time: { name: 'Study Time', icon: '⏰' },
                  sessions: { name: 'Sessions', icon: '📚' },
                  conversations: { name: 'Conversations', icon: '💬' },
                  concepts: { name: 'Concepts', icon: '🎯' },
                  accuracy: { name: 'Accuracy', icon: '✓' },
                  streak_days: { name: 'Streak', icon: '🔥' },
                };

                const metricInfo = metricLabels[goal.metric] || { name: goal.metric, icon: '📊' };

                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.1,
                      type: 'spring',
                      stiffness: 100,
                    }}
                    className="relative pl-16"
                  >
                    {/* Timeline dot */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 200 }}
                      className="absolute left-4 top-4 w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-white shadow-lg z-10"
                    >
                      {/* Pulse effect */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-blue-400"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    </motion.div>

                    {/* Goal card */}
                    <motion.div
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="p-4 bg-gradient-to-br from-white to-blue-50 rounded-xl border-2 border-green-200 shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{metricInfo.icon}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900">{metricInfo.name}</h3>
                            <p className="text-sm text-gray-600">
                              {goal.subject === 'all' ? 'All Subjects' : goal.subject.charAt(0).toUpperCase() + goal.subject.slice(1)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-sm">
                          <Star className="w-4 h-4 text-white" />
                          <span className="text-sm font-bold text-white">+{goal.xpReward} XP</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-green-600">
                          <Trophy className="w-4 h-4" />
                          <span className="font-medium">
                            {goal.currentValue} / {goal.targetValue} completed
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{completedDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
