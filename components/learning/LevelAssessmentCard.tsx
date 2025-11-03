'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Award, Target, Lightbulb, ChevronRight } from 'lucide-react';
import type { LevelAssessment } from '@/lib/learning/level-detector';

interface LevelAssessmentCardProps {
  assessment: LevelAssessment;
  onClose?: () => void;
}

export default function LevelAssessmentCard({ assessment, onClose }: LevelAssessmentCardProps) {
  const { currentLevel, confidence, strengths, weaknesses, recommendedLevel, assessmentDetails, nextSteps } = assessment;

  // CEFR 레벨 설명
  const levelDescriptions: Record<string, string> = {
    A1: '기초 입문 - 간단한 일상 대화',
    A2: '초급 - 기본적인 의사소통',
    B1: '중급 1 - 일반적인 주제 대화',
    B2: '중급 2 - 유창한 대화',
    C1: '고급 1 - 전문적인 소통',
    C2: '고급 2 - 원어민 수준',
  };

  // 레벨 색상
  const levelColors: Record<string, { bg: string; text: string; border: string }> = {
    A1: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
    A2: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    B1: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
    B2: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
    C1: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
    C2: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  };

  const currentColors = levelColors[currentLevel];
  const recommendedColors = levelColors[recommendedLevel];

  // 신뢰도 색상
  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return 'text-green-600';
    if (conf >= 60) return 'text-blue-600';
    if (conf >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <Award className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg">영어 레벨 평가</h3>
          <p className="text-sm text-gray-500">대화 기반 자동 분석</p>
        </div>
      </div>

      {/* Current Level */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`rounded-2xl p-6 border-2 ${currentColors.border} ${currentColors.bg}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">현재 레벨</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${currentColors.text}`}>{currentLevel}</span>
              <span className="text-sm text-gray-600">{levelDescriptions[currentLevel]}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600 mb-1">신뢰도</p>
            <span className={`text-2xl font-bold ${getConfidenceColor(confidence)}`}>{confidence}%</span>
          </div>
        </div>

        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">종합 점수</span>
            <span className={`font-bold ${currentColors.text}`}>{assessmentDetails.overallScore}/100</span>
          </div>
          <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${assessmentDetails.overallScore}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full`}
            />
          </div>
        </div>
      </motion.div>

      {/* Detailed Assessment */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 mb-2">어휘력</p>
          <div className={`px-3 py-1.5 rounded-lg ${levelColors[assessmentDetails.vocabularyLevel].bg} inline-block`}>
            <span className={`text-sm font-bold ${levelColors[assessmentDetails.vocabularyLevel].text}`}>
              {assessmentDetails.vocabularyLevel}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 mb-2">문법</p>
          <div className={`px-3 py-1.5 rounded-lg ${levelColors[assessmentDetails.grammarLevel].bg} inline-block`}>
            <span className={`text-sm font-bold ${levelColors[assessmentDetails.grammarLevel].text}`}>
              {assessmentDetails.grammarLevel}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 mb-2">문장 구조</p>
          <div className={`px-3 py-1.5 rounded-lg ${levelColors[assessmentDetails.sentenceComplexity].bg} inline-block`}>
            <span className={`text-sm font-bold ${levelColors[assessmentDetails.sentenceComplexity].text}`}>
              {assessmentDetails.sentenceComplexity}
            </span>
          </div>
        </div>
      </div>

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <p className="font-semibold text-green-900">강점</p>
          </div>
          <ul className="space-y-2">
            {strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-green-800">
                <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {weaknesses.length > 0 && (
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-amber-600" />
            <p className="font-semibold text-amber-900">개선 영역</p>
          </div>
          <ul className="space-y-2">
            {weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-amber-800">
                <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Level */}
      {recommendedLevel !== currentLevel && (
        <div className={`rounded-xl p-4 border-2 ${recommendedColors.border} ${recommendedColors.bg}`}>
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-purple-600" />
            <p className="font-semibold text-gray-900">추천 학습 레벨</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${recommendedColors.text}`}>{recommendedLevel}</span>
            <span className="text-sm text-gray-600">{levelDescriptions[recommendedLevel]}</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            현재 레벨에서 한 단계 발전할 준비가 되었습니다!
          </p>
        </div>
      )}

      {/* Next Steps */}
      {nextSteps.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <p className="font-semibold text-blue-900">다음 학습 계획</p>
          </div>
          <ul className="space-y-2">
            {nextSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Confidence Notice */}
      {confidence < 50 && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600">
            💡 <strong>더 정확한 평가를 위해</strong> 튜터와 더 많이 대화해보세요.
            대화 내용이 많을수록 분석이 정확해집니다!
          </p>
        </div>
      )}

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
        >
          확인
        </button>
      )}
    </div>
  );
}
