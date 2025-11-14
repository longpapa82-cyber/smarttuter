'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trophy } from 'lucide-react';
import { GoalCard } from './GoalCard';
import { GoalSettingModal } from './GoalSettingModal';
import { LearningGoal, GoalMetric, GoalPeriod, GoalSubject } from '@/lib/goals/types';

interface GoalsWidgetProps {
  gradeLevel: string;
  userId?: string;
}

export function GoalsWidget({ gradeLevel, userId }: GoalsWidgetProps) {
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    loadGoals();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadGoals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/goals/list?status=${activeTab}`);
      const data = await response.json();
      if (data.success) {
        setGoals(data.goals);
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async (
    metric: GoalMetric,
    targetValue: number,
    period: GoalPeriod,
    subject: GoalSubject
  ) => {
    try {
      const response = await fetch('/api/goals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metric, targetValue, period, subject }),
      });

      const data = await response.json();
      if (data.success) {
        await loadGoals();
      } else {
        throw new Error(data.error || 'Failed to create goal');
      }
    } catch (error) {
      console.error('Failed to create goal:', error);
      throw error;
    }
  };

  const handleCancelGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to cancel this goal?')) return;

    try {
      const response = await fetch('/api/goals/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId }),
      });

      const data = await response.json();
      if (data.success) {
        await loadGoals();
      }
    } catch (error) {
      console.error('Failed to cancel goal:', error);
    }
  };

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Learning Goals</h2>
            <p className="text-sm text-gray-600">Track your progress and stay motivated</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'active'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Active ({activeGoals.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'completed'
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Completed ({completedGoals.length})
        </button>
      </div>

      {/* Goals List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : goals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {activeTab === 'active' ? 'No Active Goals' : 'No Completed Goals Yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {activeTab === 'active'
              ? 'Set a learning goal to stay motivated and track your progress!'
              : 'Complete your active goals to see them here.'}
          </p>
          {activeTab === 'active' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              Set Your First Goal
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onCancel={activeTab === 'active' ? handleCancelGoal : undefined}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <GoalSettingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateGoal={handleCreateGoal}
        gradeLevel={gradeLevel}
      />
    </div>
  );
}
