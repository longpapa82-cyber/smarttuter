"use client";

import { motion } from "framer-motion";
import { Calculator } from "lucide-react";
import type { GradeLevel } from "@/types/tutor";

interface TopicData {
  name: string;
  progress: number;
  status?: 'completed' | 'in_progress' | 'not_started';
}

interface MathTopicProgressProps {
  gradeLevel: GradeLevel;
  topics?: TopicData[]; // Optional: real data from Redis
  className?: string;
}

const TOPIC_CONFIG: Record<GradeLevel, { name: string; topics: string[] }> = {
  elementary: {
    name: '초등학교',
    topics: ['기초연산', '도형', '측정', '자료와 가능성'],
  },
  middle: {
    name: '중학교',
    topics: ['대수', '기하', '함수', '확률과 통계'],
  },
  high: {
    name: '고등학교',
    topics: ['미적분', '확률통계', '기하', '벡터'],
  },
  university: {
    name: '대학교',
    topics: ['선형대수', '미적분학', '확률론', '이산수학'],
  },
};

const MASTERY_COLORS = {
  low: { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-700' },
  medium: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-700' },
  high: { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-700' },
  mastered: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700' },
};

export function MathTopicProgress({ gradeLevel, topics, className = '' }: MathTopicProgressProps) {
  const config = TOPIC_CONFIG[gradeLevel];

  // Use real data if available, otherwise show default topics with 0% progress
  const topicProgress = topics && topics.length > 0
    ? topics.map(topic => {
        // Determine mastery level based on progress
        const mastery =
          topic.progress >= 90 ? 'mastered' :
          topic.progress >= 70 ? 'high' :
          topic.progress >= 40 ? 'medium' :
          'low';

        return {
          name: topic.name,
          progress: topic.progress,
          mastery: mastery as keyof typeof MASTERY_COLORS,
        };
      })
    : config.topics.map(topic => ({
        name: topic,
        progress: 0,
        mastery: 'low' as keyof typeof MASTERY_COLORS,
      }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}
    >
      <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
        <div className="flex items-center space-x-3">
          <Calculator className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">수학 주제별 진행도</h2>
            <p className="text-green-100 text-sm">{config.name} 학습 현황</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {topicProgress.map((topic, idx) => {
            const colors = MASTERY_COLORS[topic.mastery];
            return (
              <motion.div
                key={topic.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className={`${colors.bg} ${colors.border} border-2 rounded-xl p-4 text-center`}
              >
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-gray-200"
                    />
                    <motion.circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 35}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 35 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 35 * (1 - topic.progress / 100) }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className={colors.text}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-lg font-bold ${colors.text}`}>
                      {Math.round(topic.progress)}%
                    </span>
                  </div>
                </div>
                <h3 className={`font-bold ${colors.text}`}>{topic.name}</h3>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span className="text-gray-600">어려움</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span className="text-gray-600">학습중</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="text-gray-600">숙련</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span className="text-gray-600">마스터</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
