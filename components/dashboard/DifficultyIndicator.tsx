"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { DifficultyLevel } from "@/lib/learning-progress/types";
import { DifficultyLevel as AdaptiveDifficultyLevel, DifficultyLabelKorean, DifficultyColor } from "@/lib/learning/adaptive-difficulty";
import type { Subject } from "@/types/tutor";

interface DifficultyIndicatorProps {
  userId: string;
  subject: Subject;
  className?: string;
}

interface DifficultyData {
  currentDifficulty: DifficultyLevel;
  lastUpdated: string;
}

const DIFFICULTY_CONFIG: Record<DifficultyLevel, {
  label: string;
  description: string;
  color: string;
  bgGradient: string;
  icon: React.ReactNode;
}> = {
  very_easy: {
    label: '매우 쉬움',
    description: '입문 수준 학습',
    color: 'text-emerald-700',
    bgGradient: 'from-emerald-100 to-emerald-50',
    icon: <TrendingDown className="w-5 h-5 text-emerald-600" />,
  },
  easy: {
    label: '쉬움',
    description: '기초 개념 중심 학습',
    color: 'text-green-700',
    bgGradient: 'from-green-100 to-green-50',
    icon: <TrendingDown className="w-5 h-5 text-green-600" />,
  },
  medium: {
    label: '보통',
    description: '표준 난이도 학습',
    color: 'text-blue-700',
    bgGradient: 'from-blue-100 to-blue-50',
    icon: <Minus className="w-5 h-5 text-blue-600" />,
  },
  hard: {
    label: '어려움',
    description: '심화 학습 및 도전',
    color: 'text-purple-700',
    bgGradient: 'from-purple-100 to-purple-50',
    icon: <TrendingUp className="w-5 h-5 text-purple-600" />,
  },
  very_hard: {
    label: '매우 어려움',
    description: '최고 수준 도전 학습',
    color: 'text-pink-700',
    bgGradient: 'from-pink-100 to-pink-50',
    icon: <TrendingUp className="w-5 h-5 text-pink-600" />,
  },
};

export function DifficultyIndicator({ userId, subject, className = '' }: DifficultyIndicatorProps) {
  const [difficultyData, setDifficultyData] = useState<DifficultyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDifficulty() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/difficulty?userId=${encodeURIComponent(userId)}&subject=${subject}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch difficulty');
        }

        const data = await response.json();
        setDifficultyData(data);
      } catch (err) {
        console.error('Error fetching difficulty:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchDifficulty();

      // Auto-refresh every 30 seconds to detect auto-adjustments
      const interval = setInterval(fetchDifficulty, 30000);
      return () => clearInterval(interval);
    }
  }, [userId, subject]);

  if (loading) {
    return (
      <div className={`bg-white rounded-xl p-4 border border-gray-200 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-500">난이도 확인 중...</span>
        </div>
      </div>
    );
  }

  if (error || !difficultyData) {
    return (
      <div className={`bg-yellow-50 rounded-xl p-4 border border-yellow-200 ${className}`}>
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <span className="text-sm text-yellow-700">난이도 정보를 불러올 수 없습니다</span>
        </div>
      </div>
    );
  }

  const config = DIFFICULTY_CONFIG[difficultyData.currentDifficulty];
  const subjectLabel = subject === 'math' ? '수학' : '영어';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`bg-gradient-to-br ${config.bgGradient} border-2 border-${config.color.split('-')[1]}-300 rounded-xl p-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {config.icon}
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600 font-medium">{subjectLabel} 난이도</span>
              <span className="px-2 py-0.5 bg-white/50 rounded-full text-xs font-bold text-gray-700">
                AI 자동 조절
              </span>
            </div>
            <h3 className={`text-lg font-bold ${config.color}`}>
              {config.label}
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              {config.description}
            </p>
          </div>
        </div>

        {/* Difficulty Level Indicator */}
        <div className="flex flex-col items-center">
          <div className="flex space-x-1">
            {(['very_easy', 'easy', 'medium', 'hard', 'very_hard'] as DifficultyLevel[]).map((level) => (
              <div
                key={level}
                className={`w-1.5 h-8 rounded-full transition-all ${
                  level === difficultyData.currentDifficulty
                    ? 'bg-gradient-to-t ' + DIFFICULTY_CONFIG[level].bgGradient.replace('from-', 'from-').replace('to-', 'to-')
                    : 'bg-gray-200'
                }`}
                style={{
                  opacity: level === difficultyData.currentDifficulty ? 1 : 0.3,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 mt-1">레벨</span>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          💡 학습 데이터를 기반으로 자동 조절됩니다 (5회 시도마다 평가)
        </p>
      </div>
    </motion.div>
  );
}
