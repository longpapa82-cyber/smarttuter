// components/tutor-pages/EmotionEnhancedChat.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, TrendingUp } from 'lucide-react';
import SimpleChatInterface from './SimpleChatInterface';
import { EmotionIndicator, EmotionTrendIndicator } from '@/components/emotion/EmotionIndicator';
import { useEmotionDetection } from '@/hooks/useEmotionDetection';
import type { EmotionAnalysis, EmotionResponseStrategy } from '@/types/emotion';

interface EmotionEnhancedChatProps {
  subject: 'english' | 'math';
  gradeLevel: string;
}

/**
 * 감정 감지 기능이 통합된 채팅 인터페이스
 *
 * SimpleChatInterface를 래핑하여 감정 분석 UI 추가
 */
export default function EmotionEnhancedChat({ subject, gradeLevel }: EmotionEnhancedChatProps) {
  const [isEmotionEnabled, setIsEmotionEnabled] = useState(true);
  const [showEmotionDetails, setShowEmotionDetails] = useState(false);

  const {
    currentEmotion,
    emotionTrend,
    responseStrategy,
    encouragementMessage,
    analyzeEmotion,
    isAnalyzing,
  } = useEmotionDetection({
    enabled: isEmotionEnabled,
    subject,
    difficulty: gradeLevel,
  });

  // 감정 데이터를 글로벌 상태로 노출 (SimpleChatInterface에서 접근)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__emotionData = {
        emotion: currentEmotion,
        strategy: responseStrategy,
      };
    }
  }, [currentEmotion, responseStrategy]);

  // 메시지 감지를 위한 글로벌 이벤트 리스너
  useEffect(() => {
    if (!isEmotionEnabled) return;

    const handleMessageSent = (event: CustomEvent) => {
      const { message, conversationHistory } = event.detail;
      analyzeEmotion(message, conversationHistory);
    };

    window.addEventListener('tutor-message-sent' as any, handleMessageSent);

    return () => {
      window.removeEventListener('tutor-message-sent' as any, handleMessageSent);
    };
  }, [isEmotionEnabled, analyzeEmotion]);

  return (
    <div className="relative h-full">
      {/* 메인 채팅 인터페이스 */}
      <SimpleChatInterface subject={subject} gradeLevel={gradeLevel} />

      {/* 감정 감지 오버레이 */}
      {isEmotionEnabled && (
        <div className="absolute top-4 right-4 z-10 space-y-3">
          {/* 감정 토글 버튼 */}
          <motion.button
            onClick={() => setIsEmotionEnabled(!isEmotionEnabled)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg border-2 border-purple-200 hover:border-purple-400 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Brain className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">감정 분석 ON</span>
          </motion.button>

          {/* 현재 감정 표시 (Compact) */}
          <AnimatePresence>
            {currentEmotion && !showEmotionDetails && (
              <motion.div
                onClick={() => setShowEmotionDetails(true)}
                className="cursor-pointer"
              >
                <EmotionIndicator emotion={currentEmotion} mode="compact" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 감정 트렌드 표시 */}
          <AnimatePresence>
            {emotionTrend && (
              <EmotionTrendIndicator
                trend={emotionTrend.changeRate}
                needsAttention={emotionTrend.needsAttention}
              />
            )}
          </AnimatePresence>

          {/* 격려 메시지 */}
          <AnimatePresence>
            {encouragementMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-4 shadow-lg max-w-xs"
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{encouragementMessage}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 응답 전략 표시 (디버깅용 - 개발 모드에서만) */}
          {process.env.NODE_ENV === 'development' && responseStrategy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-md text-xs border border-gray-200 max-w-xs"
            >
              <div className="font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                응답 전략
              </div>
              <div className="space-y-1 text-gray-600">
                <div>톤: {strategyToneLabels[responseStrategy.tone]}</div>
                <div>상세도: {responseStrategy.explanationDetail}</div>
                {responseStrategy.suggestBreak && (
                  <div className="text-orange-600 font-medium">⚠️ 휴식 권장</div>
                )}
                {responseStrategy.adjustDifficulty && (
                  <div>난이도: {responseStrategy.adjustDifficulty}</div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* 감정 상세 정보 모달 */}
      <AnimatePresence>
        {showEmotionDetails && currentEmotion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEmotionDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full"
            >
              <EmotionIndicator emotion={currentEmotion} mode="full" />

              {/* 닫기 버튼 */}
              <motion.button
                onClick={() => setShowEmotionDetails(false)}
                className="mt-4 w-full py-3 bg-white rounded-xl font-semibold text-gray-700 shadow-md hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                닫기
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 분석 중 표시 */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-24 right-4 z-10 bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
              <Brain className="w-4 h-4" />
            </motion.div>
            <span className="text-sm font-medium">감정 분석 중...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 응답 전략 톤 라벨
const strategyToneLabels: Record<EmotionResponseStrategy['tone'], string> = {
  encouraging: '격려하는',
  supportive: '지지하는',
  energetic: '활기찬',
  calm: '차분한',
  patient: '인내심 있는',
  neutral: '중립적',
};
