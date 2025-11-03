// components/emotion/EmotionIndicator.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Heart, Sparkles, AlertCircle } from 'lucide-react';
import type { EmotionAnalysis, EmotionCategory } from '@/types/emotion';
import { EMOTION_DISPLAY_CONFIG } from '@/types/emotion';

interface EmotionIndicatorProps {
  /** 감정 분석 결과 */
  emotion: EmotionAnalysis | null;

  /** 표시 모드 */
  mode?: 'compact' | 'detailed' | 'full';

  /** 애니메이션 활성화 */
  animated?: boolean;

  /** 클래스명 */
  className?: string;
}

/**
 * 감정 상태 표시 컴포넌트
 *
 * 실시간 감정 분석 결과를 시각적으로 표시
 */
export function EmotionIndicator({
  emotion,
  mode = 'compact',
  animated = true,
  className = '',
}: EmotionIndicatorProps) {
  if (!emotion) return null;

  const config = EMOTION_DISPLAY_CONFIG[emotion.primary];
  const { emoji, color, gradient, label, animation } = config;

  // 애니메이션 설정
  const animationProps = animated && animation && animation !== 'none' ? getAnimationProps(animation) : {};

  // Compact 모드: 작은 배지
  if (mode === 'compact') {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border-2 shadow-sm ${className}`}
        style={{ borderColor: color }}
        {...animationProps}
      >
        <span className="text-xl">{emoji}</span>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </motion.div>
    );
  }

  // Detailed 모드: 신뢰도 포함
  if (mode === 'detailed') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`bg-white rounded-xl p-4 border-2 shadow-md ${className}`}
        style={{ borderColor: color }}
        {...animationProps}
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{emoji}</span>
          <div className="flex-1">
            <div className="font-bold text-gray-900">{label}</div>
            <div className="text-xs text-gray-600">
              강도: {Math.round(emotion.intensity * 100)}% • 신뢰도:{' '}
              {Math.round(emotion.confidence * 100)}%
            </div>
          </div>
        </div>

        {/* 강도 바 */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${emotion.intensity * 100}%` }}
            className={`h-full bg-gradient-to-r ${gradient}`}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </motion.div>
    );
  }

  // Full 모드: 전체 정보
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: -10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: -10 }}
      className={`bg-white rounded-2xl p-6 border-2 shadow-lg ${className}`}
      style={{ borderColor: color }}
      {...animationProps}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-4xl`}>
          {emoji}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">{label}</h3>
          <p className="text-sm text-gray-600">
            {emotion.source === 'combined' ? '음성 + 텍스트 분석' : '텍스트 분석'}
          </p>
        </div>
        <Brain className="w-6 h-6 text-gray-400" />
      </div>

      {/* 강도 표시 */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-700 font-medium">감정 강도</span>
          <span className="text-gray-900 font-bold">{Math.round(emotion.intensity * 100)}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${emotion.intensity * 100}%` }}
            className={`h-full bg-gradient-to-r ${gradient}`}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* 신뢰도 표시 */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-700 font-medium">분석 신뢰도</span>
          <span className="text-gray-900 font-bold">{Math.round(emotion.confidence * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${emotion.confidence * 100}%` }}
            className="h-full bg-gradient-to-r from-blue-400 to-indigo-500"
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          />
        </div>
      </div>

      {/* 부차적 감정 */}
      {emotion.secondary && emotion.secondary.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-700 font-medium mb-2">부차적 감정</div>
          <div className="flex gap-2">
            {emotion.secondary.map((sec) => {
              const secConfig = EMOTION_DISPLAY_CONFIG[sec];
              return (
                <span
                  key={sec}
                  className="px-3 py-1 rounded-full bg-gray-100 text-sm flex items-center gap-1"
                >
                  <span className="text-base">{secConfig.emoji}</span>
                  <span className="text-gray-700">{secConfig.label}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/**
 * 감정 트렌드 표시 컴포넌트
 */
interface EmotionTrendIndicatorProps {
  /** 트렌드 방향 */
  trend: 'improving' | 'stable' | 'declining';

  /** 주의 필요 여부 */
  needsAttention?: boolean;

  /** 클래스명 */
  className?: string;
}

export function EmotionTrendIndicator({
  trend,
  needsAttention = false,
  className = '',
}: EmotionTrendIndicatorProps) {
  const trendConfig = {
    improving: {
      icon: Sparkles,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      label: '긍정적 변화',
      emoji: '📈',
    },
    stable: {
      icon: Heart,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      label: '안정적',
      emoji: '📊',
    },
    declining: {
      icon: AlertCircle,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      label: '주의 필요',
      emoji: '📉',
    },
  };

  const config = trendConfig[trend];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${config.bg} ${config.border} ${className}`}
    >
      <span className="text-xl">{config.emoji}</span>
      <Icon className={`w-5 h-5 ${config.color}`} />
      <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
      {needsAttention && (
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="ml-2 w-2 h-2 rounded-full bg-red-500"
        />
      )}
    </motion.div>
  );
}

/**
 * 애니메이션 프리셋
 */
function getAnimationProps(animation: 'pulse' | 'bounce' | 'glow') {
  const animations = {
    pulse: {
      animate: {
        scale: [1, 1.05, 1],
      },
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: 'easeInOut',
      },
    },
    bounce: {
      animate: {
        y: [0, -5, 0],
      },
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: 'easeInOut',
      },
    },
    glow: {
      animate: {
        boxShadow: [
          '0 0 0px rgba(59, 130, 246, 0)',
          '0 0 15px rgba(59, 130, 246, 0.5)',
          '0 0 0px rgba(59, 130, 246, 0)',
        ],
      },
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: 'easeInOut',
      },
    },
  };

  return animations[animation] || {};
}
