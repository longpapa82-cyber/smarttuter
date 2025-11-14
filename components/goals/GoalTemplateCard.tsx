'use client';

import { GoalTemplate } from '@/lib/goals/types';
import { motion } from 'framer-motion';

interface GoalTemplateCardProps {
  template: GoalTemplate;
  gradeLevel: string;
  onSelect: (template: GoalTemplate) => void;
}

export function GoalTemplateCard({ template, gradeLevel, onSelect }: GoalTemplateCardProps) {
  // Determine suggested value based on grade level
  const getSuggestedValue = () => {
    if (gradeLevel.includes('elementary')) return template.suggestedValues.elementary;
    if (gradeLevel.includes('middle')) return template.suggestedValues.middle;
    if (gradeLevel.includes('high')) return template.suggestedValues.high;
    if (gradeLevel.includes('university')) return template.suggestedValues.university;
    return template.suggestedValues.middle; // default
  };

  const suggestedValue = getSuggestedValue();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'consistency':
        return 'from-blue-500 to-blue-600';
      case 'mastery':
        return 'from-purple-500 to-purple-600';
      case 'engagement':
        return 'from-green-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <motion.button
      onClick={() => onSelect(template)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full p-4 text-left bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br ${getCategoryColor(template.category)} flex items-center justify-center text-2xl`}>
          {template.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1">
            {template.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {template.description}
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
              {template.period}
            </span>
            <span className="text-sm font-semibold text-gray-900">
              Target: {suggestedValue}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
