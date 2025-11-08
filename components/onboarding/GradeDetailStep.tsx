"use client";

import { motion } from "framer-motion";
import type { GradeLevel } from "@/types/user";

interface GradeDetailOption {
  gradeLevel: GradeLevel;
  label: string;
  options: string[];
}

const GRADE_DETAIL_OPTIONS: GradeDetailOption[] = [
  {
    gradeLevel: 'elementary',
    label: '초등학교',
    options: ['1학년', '2학년', '3학년', '4학년', '5학년', '6학년']
  },
  {
    gradeLevel: 'middle',
    label: '중학교',
    options: ['1학년', '2학년', '3학년']
  },
  {
    gradeLevel: 'high',
    label: '고등학교',
    options: ['1학년', '2학년', '3학년']
  },
  {
    gradeLevel: 'university',
    label: '대학교',
    options: ['1학년', '2학년', '3학년', '4학년', '대학원']
  }
];

interface GradeDetailStepProps {
  gradeLevel: GradeLevel;
  onSelect: (detail: string) => void;
}

export function GradeDetailStep({ gradeLevel, onSelect }: GradeDetailStepProps) {
  const config = GRADE_DETAIL_OPTIONS.find(g => g.gradeLevel === gradeLevel);

  if (!config) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">올바르지 않은 학교급입니다.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-6xl mb-4"
        >
          📚
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3"
        >
          {config.label} 몇 학년이신가요?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-gray-600"
        >
          학년에 맞는 맞춤형 학습 콘텐츠를 제공해드립니다
        </motion.p>
      </div>

      {/* Grade Options Grid */}
      <div className={`grid gap-4 ${config.options.length <= 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'}`}>
        {config.options.map((option, index) => (
          <motion.button
            key={option}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(option)}
            className="group relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
          >
            {/* Gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Content */}
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2 text-gray-900 group-hover:text-white transition-colors">
                {option}
              </div>
              <div className="text-sm text-gray-600 group-hover:text-white/80 transition-colors">
                {config.label}
              </div>
            </div>

            {/* Decorative element */}
            <motion.div
              className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.button>
        ))}
      </div>

      {/* Help text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="mt-8 text-center text-sm text-gray-500"
      >
        💡 학년에 맞는 난이도와 학습 주제가 자동으로 설정됩니다
      </motion.div>
    </motion.div>
  );
}

// Helper function to get Korean grade level name
export function getGradeLevelKorean(gradeLevel: GradeLevel): string {
  const map: Record<GradeLevel, string> = {
    elementary: '초등학교',
    middle: '중학교',
    high: '고등학교',
    university: '대학교',
  };
  return map[gradeLevel] || gradeLevel;
}
