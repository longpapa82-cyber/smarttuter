'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw } from 'lucide-react';
import LevelDashboard from './LevelDashboard';
import type { Message } from '@/types/tutor';
import { detectEnglishLevel, analyzeUserLevel } from '@/lib/adaptive-learning/level-detector';
import { recommendContent } from '@/lib/adaptive-learning/content-recommender';
import type { LearningContent } from '@/lib/adaptive-learning/content-recommender';

interface AdaptiveLearningPanelProps {
  chatHistory: Message[];
  onClose?: () => void;
  onStartContent?: (content: LearningContent) => void;
}

export default function AdaptiveLearningPanel({
  chatHistory,
  onClose,
  onStartContent,
}: AdaptiveLearningPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 사용자 레벨 분석
  const userLevel = detectEnglishLevel(chatHistory);
  const levelAnalysis = analyzeUserLevel(chatHistory);
  const recommendations = recommendContent(userLevel, chatHistory);

  const handleRefresh = async () => {
    setIsAnalyzing(true);
    // 재분석 시뮬레이션 (실제로는 서버 API 호출 가능)
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsAnalyzing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl"
      >
        {/* 헤더 */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                🎯 나의 영어 실력 분석
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                대화 기록을 기반으로 AI가 분석한 결과입니다
              </p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={isAnalyzing}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                title="재분석"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${isAnalyzing ? 'animate-spin' : ''}`} />
              </motion.button>
              {onClose && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="p-6">
          {chatHistory.length < 5 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
                🗨️ 더 정확한 분석을 위해 대화를 계속하세요
              </p>
              <p className="text-sm text-gray-500">
                최소 5번 이상의 대화가 필요합니다 (현재: {chatHistory.filter(m => m.role === 'user').length}회)
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    AI가 대화를 분석하고 있습니다...
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <LevelDashboard
                    userLevel={userLevel}
                    levelAnalysis={levelAnalysis}
                    recommendations={recommendations}
                    onStartContent={onStartContent}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
