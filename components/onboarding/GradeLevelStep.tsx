'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { GRADE_LEVEL_OPTIONS, type GradeLevel } from '@/types/user';

interface GradeLevelStepProps {
  onNext: (gradeLevel: GradeLevel) => void;
}

export default function GradeLevelStep({ onNext }: GradeLevelStepProps) {
  const [selectedLevel, setSelectedLevel] = useState<GradeLevel | null>(null);

  const handleSelect = (level: GradeLevel) => {
    setSelectedLevel(level);
    // 0.5초 후 자동으로 다음 단계로
    setTimeout(() => {
      onNext(level);
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex flex-col items-center justify-center min-h-[600px] px-6"
    >
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold mb-3 text-gray-900">
          어떤 학습자이신가요?
        </h2>
        <p className="text-lg text-gray-600">
          학습 수준에 맞는 콘텐츠를 제공해드립니다
        </p>
      </motion.div>

      {/* Grade Level Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl w-full">
        {GRADE_LEVEL_OPTIONS.map((option, index) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(option.value)}
            className={`
              p-6 rounded-2xl border-2 transition-all text-left
              ${
                selectedLevel === option.value
                  ? 'border-purple-600 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl'
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-lg'
              }
            `}
          >
            <div className="flex items-start gap-4">
              <div className="text-5xl">{option.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {option.label}
                  </h3>
                  {selectedLevel === option.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </div>
                <p className="text-gray-600 mb-1">{option.description}</p>
                <p className="text-sm text-gray-500">{option.ageRange}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
