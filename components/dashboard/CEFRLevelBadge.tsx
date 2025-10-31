"use client";

import { motion } from "framer-motion";
import { Award, TrendingUp, ChevronRight } from "lucide-react";
import type { GradeLevel, CEFRLevel } from "@/types/tutor";

interface CEFRLevelBadgeProps {
  gradeLevel: GradeLevel;
  currentLevel?: CEFRLevel;
  progressToNext?: number;
  className?: string;
}

const CEFR_CONFIG: Record<CEFRLevel, {
  name: string;
  description: string;
  color: string;
  bgGradient: string;
  borderColor: string;
}> = {
  A1: {
    name: '초급 (A1)',
    description: '기초 표현과 간단한 문장 이해',
    color: 'text-green-700',
    bgGradient: 'from-green-100 to-green-50',
    borderColor: 'border-green-400',
  },
  A2: {
    name: '초중급 (A2)',
    description: '일상적 주제로 기본 대화 가능',
    color: 'text-lime-700',
    bgGradient: 'from-lime-100 to-lime-50',
    borderColor: 'border-lime-400',
  },
  B1: {
    name: '중급 (B1)',
    description: '익숙한 주제 이해 및 의견 표현',
    color: 'text-yellow-700',
    bgGradient: 'from-yellow-100 to-yellow-50',
    borderColor: 'border-yellow-400',
  },
  B2: {
    name: '중상급 (B2)',
    description: '복잡한 글과 추상적 주제 이해',
    color: 'text-orange-700',
    bgGradient: 'from-orange-100 to-orange-50',
    borderColor: 'border-orange-400',
  },
  C1: {
    name: '고급 (C1)',
    description: '유창하고 자연스러운 표현',
    color: 'text-blue-700',
    bgGradient: 'from-blue-100 to-blue-50',
    borderColor: 'border-blue-400',
  },
  C2: {
    name: '최고급 (C2)',
    description: '원어민 수준의 능숙함',
    color: 'text-purple-700',
    bgGradient: 'from-purple-100 to-purple-50',
    borderColor: 'border-purple-400',
  },
};

const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function getDefaultCEFRLevel(gradeLevel: GradeLevel): CEFRLevel {
  switch (gradeLevel) {
    case 'elementary': return 'A1';
    case 'middle': return 'A2';
    case 'high': return 'B1';
    case 'university': return 'B2';
    default: return 'A1';
  }
}

function getNextLevel(current: CEFRLevel): CEFRLevel | null {
  const idx = CEFR_LEVELS.indexOf(current);
  return idx < CEFR_LEVELS.length - 1 ? CEFR_LEVELS[idx + 1] : null;
}

export function CEFRLevelBadge({
  gradeLevel,
  currentLevel,
  progressToNext = 0.35,
  className = '',
}: CEFRLevelBadgeProps) {
  const level = currentLevel || getDefaultCEFRLevel(gradeLevel);
  const config = CEFR_CONFIG[level];
  const nextLevel = getNextLevel(level);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}
    >
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 text-white">
        <div className="flex items-center space-x-3">
          <Award className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">영어 레벨</h2>
            <p className="text-green-100 text-xs">CEFR 기준 평가</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className={`bg-gradient-to-br ${config.bgGradient} border-2 ${config.borderColor} rounded-xl p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-3xl font-black ${config.color}`}>{level}</div>
              <h3 className={`text-lg font-bold ${config.color}`}>{config.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{config.description}</p>
            </div>
            <Award className={`w-12 h-12 ${config.color}`} />
          </div>
        </div>

        {nextLevel && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">다음 레벨 진행도</span>
              <div className="flex items-center space-x-1 text-xs">
                <span className="font-semibold text-gray-900">{level}</span>
                <ChevronRight className="w-3 h-3 text-gray-400" />
                <span className="font-semibold text-gray-900">{nextLevel}</span>
              </div>
            </div>

            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext * 100}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className={`h-full bg-gradient-to-r ${CEFR_CONFIG[nextLevel].bgGradient}`}
              />
            </div>

            <div className="mt-2 flex items-center space-x-1 text-xs text-gray-600">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span>
                <span className="font-semibold text-gray-900">{CEFR_CONFIG[nextLevel].name}</span> 까지{' '}
                <span className="font-bold text-green-600">{Math.round((1 - progressToNext) * 100)}%</span> 남았습니다
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
