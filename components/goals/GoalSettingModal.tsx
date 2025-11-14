'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GOAL_TEMPLATES, GoalTemplate, GoalMetric, GoalPeriod, GoalSubject } from '@/lib/goals/types';
import { GoalTemplateCard } from './GoalTemplateCard';

interface GoalSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGoal: (metric: GoalMetric, targetValue: number, period: GoalPeriod, subject: GoalSubject) => Promise<void>;
  gradeLevel: string;
}

export function GoalSettingModal({ isOpen, onClose, onCreateGoal, gradeLevel }: GoalSettingModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);
  const [customTarget, setCustomTarget] = useState<number>(0);
  const [selectedSubject, setSelectedSubject] = useState<GoalSubject>('all');
  const [isCreating, setIsCreating] = useState(false);

  const getSuggestedValue = (template: GoalTemplate) => {
    if (gradeLevel.includes('elementary')) return template.suggestedValues.elementary;
    if (gradeLevel.includes('middle')) return template.suggestedValues.middle;
    if (gradeLevel.includes('high')) return template.suggestedValues.high;
    if (gradeLevel.includes('university')) return template.suggestedValues.university;
    return template.suggestedValues.middle;
  };

  const handleTemplateSelect = (template: GoalTemplate) => {
    setSelectedTemplate(template);
    setCustomTarget(getSuggestedValue(template));
  };

  const handleCreateGoal = async () => {
    if (!selectedTemplate) return;

    setIsCreating(true);
    try {
      await onCreateGoal(
        selectedTemplate.metric,
        customTarget,
        selectedTemplate.period,
        selectedSubject
      );
      onClose();
      setSelectedTemplate(null);
      setCustomTarget(0);
      setSelectedSubject('all');
    } catch (error) {
      console.error('Failed to create goal:', error);
      alert('Failed to create goal. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const categories = [
    { id: 'consistency', name: 'Consistency', icon: '🔥' },
    { id: 'mastery', name: 'Mastery', icon: '🎯' },
    { id: 'engagement', name: 'Engagement', icon: '💬' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="relative z-50">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        />

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Set Learning Goal
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Choose a goal template or customize your own
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {!selectedTemplate ? (
                  <div className="space-y-6">
                    {categories.map((category) => {
                      const templates = GOAL_TEMPLATES.filter((t) => t.category === category.id);
                      if (templates.length === 0) return null;

                      return (
                        <div key={category.id}>
                          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                            <span>{category.icon}</span>
                            {category.name}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {templates.map((template) => (
                              <GoalTemplateCard
                                key={template.id}
                                template={template}
                                gradeLevel={gradeLevel}
                                onSelect={handleTemplateSelect}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Back Button */}
                    <button
                      onClick={() => setSelectedTemplate(null)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      ← Back to templates
                    </button>

                    {/* Selected Template */}
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl">{selectedTemplate.icon}</span>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {selectedTemplate.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {selectedTemplate.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Customization */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Target Value
                        </label>
                        <input
                          type="number"
                          value={customTarget}
                          onChange={(e) => setCustomTarget(Number(e.target.value))}
                          min="1"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Suggested for your level: {getSuggestedValue(selectedTemplate)}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subject (Optional)
                        </label>
                        <select
                          value={selectedSubject}
                          onChange={(e) => setSelectedSubject(e.target.value as GoalSubject)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">All Subjects</option>
                          <option value="english">English</option>
                          <option value="math">Math</option>
                          <option value="science">Science</option>
                          <option value="social">Social Studies</option>
                          <option value="korean">Korean</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {selectedTemplate && (
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Complete this goal to earn <span className="font-bold text-yellow-600">{selectedTemplate.metric && selectedTemplate.period ?
                        Math.round((selectedTemplate.period === 'daily' ? 50 : selectedTemplate.period === 'weekly' ? 200 : 1000) *
                        (selectedTemplate.metric === 'concepts' ? 1.5 : selectedTemplate.metric === 'accuracy' ? 1.3 : 1.0)) : 0} XP</span>!
                    </div>
                    <button
                      onClick={handleCreateGoal}
                      disabled={isCreating || customTarget <= 0}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                    >
                      {isCreating ? 'Creating...' : 'Create Goal'}
                    </button>
                  </div>
                </div>
              )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
