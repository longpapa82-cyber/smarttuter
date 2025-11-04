// hooks/useEmotionDetection.ts

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  EmotionAnalysis,
  EmotionCategory,
  EmotionResponseStrategy,
  EmotionHistory,
  EmotionTrend,
} from '@/types/emotion';
import { getVoiceToneAnalyzer } from '@/lib/emotion/voice-tone-analyzer';

interface UseEmotionDetectionOptions {
  /** 감정 감지 활성화 */
  enabled?: boolean;

  /** 자동 분석 간격 (밀리초) */
  analysisInterval?: number;

  /** 음성 톤 분석 포함 */
  includeVoiceTone?: boolean;

  /** 학습 컨텍스트 */
  subject?: 'english' | 'math' | 'science' | 'social-studies';
  difficulty?: string;
}

interface UseEmotionDetectionReturn {
  /** 현재 감정 분석 결과 */
  currentEmotion: EmotionAnalysis | null;

  /** 감정 히스토리 */
  emotionHistory: EmotionHistory | null;

  /** 현재 감정 트렌드 */
  emotionTrend: EmotionTrend | null;

  /** 권장 응답 전략 */
  responseStrategy: EmotionResponseStrategy | null;

  /** 격려 메시지 */
  encouragementMessage: string | null;

  /** 감정 분석 실행 */
  analyzeEmotion: (text: string, conversationContext?: string[]) => Promise<void>;

  /** 음성 톤 분석 시작 */
  startVoiceToneAnalysis: (stream: MediaStream) => Promise<void>;

  /** 음성 톤 분석 중지 */
  stopVoiceToneAnalysis: () => void;

  /** 로딩 상태 */
  isAnalyzing: boolean;

  /** 에러 */
  error: Error | null;
}

/**
 * 감정 감지 Hook
 *
 * 텍스트 및 음성 기반 실시간 감정 분석
 */
export function useEmotionDetection(
  options: UseEmotionDetectionOptions = {}
): UseEmotionDetectionReturn {
  const {
    enabled = true,
    analysisInterval = 5000,
    includeVoiceTone = false,
    subject,
    difficulty,
  } = options;

  const [currentEmotion, setCurrentEmotion] = useState<EmotionAnalysis | null>(null);
  const [emotionHistory, setEmotionHistory] = useState<EmotionHistory | null>(null);
  const [emotionTrend, setEmotionTrend] = useState<EmotionTrend | null>(null);
  const [responseStrategy, setResponseStrategy] = useState<EmotionResponseStrategy | null>(null);
  const [encouragementMessage, setEncouragementMessage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const voiceToneAnalyzerRef = useRef(getVoiceToneAnalyzer());
  const voiceToneIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 감정 분석 실행 (서버 API 호출)
   */
  const analyzeEmotion = useCallback(
    async (text: string, conversationContext?: string[]) => {
      if (!enabled || !text.trim()) return;

      setIsAnalyzing(true);
      setError(null);

      try {
        // 음성 톤 데이터 수집 (활성화된 경우)
        let voiceTone = undefined;
        if (includeVoiceTone) {
          const toneAnalyzer = voiceToneAnalyzerRef.current;
          voiceTone = toneAnalyzer.analyzeTone();
        }

        // 서버 사이드 API로 감정 분석 (보안 강화)
        const response = await fetch('/api/emotion/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            conversationContext,
            voiceTone,
            learningContext: subject
              ? {
                  subject,
                  difficulty: difficulty || 'intermediate',
                }
              : undefined,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Emotion analysis failed');
        }

        const emotion: EmotionAnalysis = await response.json();
        setCurrentEmotion(emotion);

        // 응답 전략 생성 (클라이언트에서 처리)
        const strategy = getResponseStrategyFromEmotion(emotion);
        setResponseStrategy(strategy);

        // 격려 메시지 생성
        if (strategy.includeEncouragement) {
          const message = getEncouragementMessageFromEmotion(emotion.primary);
          setEncouragementMessage(message);
        } else {
          setEncouragementMessage(null);
        }

        // 히스토리 업데이트
        setEmotionHistory((prev) => {
          const now = new Date();
          const newHistory: EmotionHistory = prev
            ? {
                ...prev,
                analyses: [...prev.analyses, emotion],
                lastUpdated: now,
              }
            : {
                sessionId: `session-${Date.now()}`,
                userId: 'current-user',
                analyses: [emotion],
                startTime: now,
                lastUpdated: now,
                trend: calculateTrend([emotion]),
              };

          // 트렌드 업데이트
          const trend = calculateTrend(newHistory.analyses);
          newHistory.trend = trend;
          setEmotionTrend(trend);

          return newHistory;
        });
      } catch (err) {
        console.error('Emotion analysis error:', err);
        setError(err as Error);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [enabled, includeVoiceTone, subject, difficulty]
  );

  /**
   * 음성 톤 분석 시작
   */
  const startVoiceToneAnalysis = useCallback(async (stream: MediaStream) => {
    try {
      const toneAnalyzer = voiceToneAnalyzerRef.current;
      await toneAnalyzer.initialize();
      await toneAnalyzer.connectMicrophone(stream);

      // 주기적 톤 분석 (디버깅/모니터링용)
      voiceToneIntervalRef.current = setInterval(() => {
        const tone = toneAnalyzer.analyzeTone();
        console.log('Voice tone:', tone);
      }, 1000);
    } catch (err) {
      console.error('Voice tone analysis start error:', err);
      setError(err as Error);
    }
  }, []);

  /**
   * 음성 톤 분석 중지
   */
  const stopVoiceToneAnalysis = useCallback(() => {
    if (voiceToneIntervalRef.current) {
      clearInterval(voiceToneIntervalRef.current);
      voiceToneIntervalRef.current = null;
    }
    voiceToneAnalyzerRef.current.cleanup();
  }, []);

  /**
   * 감정 트렌드 계산
   */
  const calculateTrend = (analyses: EmotionAnalysis[]): EmotionTrend => {
    if (analyses.length === 0) {
      return {
        mostFrequent: 'neutral',
        averageIntensity: 0.5,
        changeRate: 'stable',
        needsAttention: false,
      };
    }

    // 가장 빈번한 감정
    const emotionCounts: Partial<Record<EmotionCategory, number>> = {};
    analyses.forEach((a) => {
      emotionCounts[a.primary] = (emotionCounts[a.primary] || 0) + 1;
    });
    const mostFrequent = (Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      'neutral') as EmotionCategory;

    // 평균 감정 강도
    const averageIntensity =
      analyses.reduce((sum, a) => sum + a.intensity, 0) / analyses.length;

    // 감정 변화율 계산 (최근 3개 vs 이전 3개)
    let changeRate: 'improving' | 'stable' | 'declining' = 'stable';
    if (analyses.length >= 6) {
      const recent3 = analyses.slice(-3);
      const previous3 = analyses.slice(-6, -3);

      const recentPositive = recent3.filter((a) =>
        ['happy', 'excited', 'confident'].includes(a.primary)
      ).length;
      const previousPositive = previous3.filter((a) =>
        ['happy', 'excited', 'confident'].includes(a.primary)
      ).length;

      if (recentPositive > previousPositive) changeRate = 'improving';
      else if (recentPositive < previousPositive) changeRate = 'declining';
    }

    // 주의 필요 여부
    const recentNegative = analyses
      .slice(-3)
      .filter((a) => ['frustrated', 'anxious', 'tired'].includes(a.primary)).length;
    const needsAttention = recentNegative >= 2;

    // 권장 액션
    let recommendedAction: EmotionTrend['recommendedAction'] = 'continue';
    if (needsAttention) {
      if (mostFrequent === 'tired') recommendedAction = 'take_break';
      else if (['frustrated', 'anxious'].includes(mostFrequent))
        recommendedAction = 'adjust_difficulty';
      else recommendedAction = 'provide_support';
    }

    return {
      mostFrequent,
      averageIntensity,
      changeRate,
      needsAttention,
      recommendedAction,
    };
  };

  /**
   * 클린업
   */
  useEffect(() => {
    return () => {
      stopVoiceToneAnalysis();
    };
  }, [stopVoiceToneAnalysis]);

  return {
    currentEmotion,
    emotionHistory,
    emotionTrend,
    responseStrategy,
    encouragementMessage,
    analyzeEmotion,
    startVoiceToneAnalysis,
    stopVoiceToneAnalysis,
    isAnalyzing,
    error,
  };
}

/**
 * 감정 기반 응답 전략 생성 (클라이언트 헬퍼)
 */
function getResponseStrategyFromEmotion(emotion: EmotionAnalysis): EmotionResponseStrategy {
  const { EMOTION_RESPONSE_TEMPLATES } = require('@/types/emotion');
  const baseStrategy = EMOTION_RESPONSE_TEMPLATES[emotion.primary];
  const adjustedStrategy: EmotionResponseStrategy = { ...baseStrategy };

  if (emotion.intensity > 0.7) {
    if (['frustrated', 'anxious', 'tired'].includes(emotion.primary)) {
      adjustedStrategy.suggestBreak = true;
      adjustedStrategy.explanationDetail = 'detailed';
    } else if (['excited', 'happy'].includes(emotion.primary)) {
      adjustedStrategy.adjustDifficulty = 'harder';
    }
  } else if (emotion.intensity < 0.3) {
    adjustedStrategy.includeEncouragement = true;
  }

  return adjustedStrategy;
}

/**
 * 감정 기반 격려 메시지 생성 (클라이언트 헬퍼)
 */
function getEncouragementMessageFromEmotion(emotion: EmotionCategory): string {
  const messages: Record<EmotionCategory, string[]> = {
    happy: [
      '좋아요! 이 기세를 이어가봐요! 🎉',
      '정말 잘하고 있어요! 계속해요! 😊',
      '완벽해요! 이대로만 가면 돼요! ✨',
    ],
    excited: [
      '열정이 대단해요! 멋져요! 🔥',
      '이 에너지 정말 좋아요! 🌟',
      '의욕이 넘치네요! 최고예요! 💪',
    ],
    confident: [
      '자신감 있는 모습 멋져요! 👍',
      '이 자신감 그대로 유지해요! 💪',
      '정말 잘 알고 있네요! 👏',
    ],
    neutral: [
      '차근차근 함께 풀어가요 📚',
      '잘 집중하고 있어요 ✍️',
      '좋아요, 계속 진행해봐요 📖',
    ],
    confused: [
      '괜찮아요, 천천히 이해해봐요 🤗',
      '어려울 수 있어요. 함께 다시 살펴볼까요? 💭',
      '좋은 질문이에요! 같이 풀어봐요 🔍',
    ],
    frustrated: [
      '힘들 수 있어요. 잠깐 쉬었다 해도 돼요 🌈',
      '어려운 부분이네요. 다른 방법으로 설명해볼게요 💡',
      '괜찮아요, 천천히 가도 돼요. 함께 해요 🤝',
    ],
    anxious: [
      '걱정하지 마세요. 천천히 해도 돼요 🌟',
      '불안하실 수 있어요. 편하게 질문해요 💙',
      '괜찮아요. 실수해도 괜찮으니 편하게 해요 🌸',
    ],
    bored: [
      '조금 더 재미있는 문제로 가볼까요? 🎯',
      '다른 방식으로 해볼까요? 🎨',
      '새로운 도전을 해봐요! 🚀',
    ],
    tired: [
      '피곤해 보여요. 잠깐 쉬었다 할까요? ☕',
      '무리하지 마세요. 휴식이 필요해 보여요 🛋️',
      '오늘은 여기까지 하고 내일 다시 해도 좋아요 😴',
    ],
  };

  const emotionMessages = messages[emotion];
  return emotionMessages[Math.floor(Math.random() * emotionMessages.length)];
}
