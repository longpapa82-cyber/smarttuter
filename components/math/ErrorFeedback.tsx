'use client';

import { motion } from 'framer-motion';
import { ErrorDiagnosisResult, ERROR_CATEGORIES } from '@/lib/math/error-diagnosis';
import { useState } from 'react';

interface ErrorFeedbackProps {
  diagnosis: ErrorDiagnosisResult;
  onRetry?: () => void;
  onClose?: () => void;
}

export default function ErrorFeedback({ diagnosis, onRetry, onClose }: ErrorFeedbackProps) {
  const [showDetails, setShowDetails] = useState(false);
  const categoryInfo = ERROR_CATEGORIES[diagnosis.category];

  const severityColors = {
    low: 'bg-blue-50 border-blue-200 text-blue-900',
    medium: 'bg-amber-50 border-amber-200 text-amber-900',
    high: 'bg-red-50 border-red-200 text-red-900',
  };

  const severityBadgeColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-amber-100 text-amber-800',
    high: 'bg-red-100 text-red-800',
  };

  const severityLabels = {
    low: '가벼운 실수',
    medium: '주의 필요',
    high: '중요 개념',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`rounded-lg border-2 p-6 ${severityColors[diagnosis.severity]}`}
      data-testid="error-feedback"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl" role="img" aria-label={categoryInfo.label}>
            {categoryInfo.icon}
          </span>
          <div>
            <h3 className="text-xl font-bold">{categoryInfo.label}</h3>
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${severityBadgeColors[diagnosis.severity]}`}>
              {severityLabels[diagnosis.severity]}
            </span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="피드백 닫기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Specific Mistake */}
      <div className="mb-4 p-4 bg-white/50 rounded-lg">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <span>🎯</span>
          <span>어디서 틀렸나요?</span>
        </h4>
        <p className="text-sm leading-relaxed">{diagnosis.specificMistake}</p>
      </div>

      {/* Toggle Details Button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full mb-4 p-3 bg-white/70 hover:bg-white rounded-lg transition-colors flex items-center justify-between"
      >
        <span className="font-medium">
          {showDetails ? '상세 정보 숨기기' : '상세 정보 보기'}
        </span>
        <motion.span
          animate={{ rotate: showDetails ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ▼
        </motion.span>
      </button>

      {/* Detailed Information */}
      <motion.div
        initial={false}
        animate={{
          height: showDetails ? 'auto' : 0,
          opacity: showDetails ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="space-y-4">
          {/* Concepts to Review */}
          <div className="p-4 bg-white/50 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>📚</span>
              <span>복습이 필요한 개념</span>
            </h4>
            <ul className="space-y-2">
              {diagnosis.conceptsToReview.map((concept, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2 text-sm"
                >
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{concept}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="p-4 bg-white/50 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>💡</span>
              <span>학습 팁</span>
            </h4>
            <ul className="space-y-2">
              {diagnosis.recommendations.map((rec, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2 text-sm"
                >
                  <span className="text-green-600 mt-1">✓</span>
                  <span>{rec}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Similar Problems */}
          <div className="p-4 bg-white/50 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>🎓</span>
              <span>비슷한 연습 문제</span>
            </h4>
            <ul className="space-y-2">
              {diagnosis.similarProblems.map((problem, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-2 bg-white rounded text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {index + 1}. {problem}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-3">
        {onRetry && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRetry}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
          >
            다시 풀어보기
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowDetails(!showDetails)}
          className="px-4 py-3 bg-white/70 hover:bg-white rounded-lg font-medium transition-colors"
        >
          {showDetails ? '간단히 보기' : '자세히 보기'}
        </motion.button>
      </div>

      {/* Encouragement Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 p-3 bg-white/50 rounded-lg text-center"
      >
        <p className="text-sm text-gray-700">
          {diagnosis.severity === 'low' && '💪 조금만 더 신경 쓰면 완벽해질 거예요!'}
          {diagnosis.severity === 'medium' && '📖 개념을 한 번 더 복습하면 금방 이해될 거예요!'}
          {diagnosis.severity === 'high' && '🌟 이 개념을 잘 익히면 실력이 크게 늘 거예요!'}
        </p>
      </motion.div>
    </motion.div>
  );
}
