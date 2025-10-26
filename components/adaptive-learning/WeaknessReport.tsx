'use client';

import { motion } from 'framer-motion';
import { Weakness } from '@/lib/adaptive-learning/types';
import { AlertTriangle, Clock, Target, TrendingUp } from 'lucide-react';

interface WeaknessReportProps {
  weaknesses: Weakness[];
  onRemediationClick?: (weakness: Weakness) => void;
}

export default function WeaknessReport({
  weaknesses,
  onRemediationClick,
}: WeaknessReportProps) {
  if (weaknesses.length === 0) {
    return (
      <div className="text-center py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
        >
          <div className="w-20 h-20 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-green-600" />
          </div>
        </motion.div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          약점 없음!
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          현재 모든 영역에서 우수한 성과를 보이고 있습니다.
        </p>
      </div>
    );
  }

  const getSeverityColor = (severity: Weakness['severity']) => {
    switch (severity) {
      case 'critical':
        return 'red';
      case 'moderate':
        return 'orange';
      case 'minor':
        return 'yellow';
    }
  };

  const getSeverityLabel = (severity: Weakness['severity']) => {
    switch (severity) {
      case 'critical':
        return '매우 중요';
      case 'moderate':
        return '중요';
      case 'minor':
        return '경미';
    }
  };

  const getRootCauseLabel = (rootCause: Weakness['rootCause']) => {
    switch (rootCause) {
      case 'prerequisite_gap':
        return '선행 지식 부족';
      case 'concept_misunderstanding':
        return '개념 오해';
      case 'practice_needed':
        return '연습 부족';
      case 'too_advanced':
        return '난이도 높음';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          약점 분석
        </h3>
        <span className="ml-auto text-sm text-gray-500">
          {weaknesses.length}개 발견
        </span>
      </div>

      <div className="space-y-3">
        {weaknesses.map((weakness, index) => {
          const severityColor = getSeverityColor(weakness.severity);
          const successPercentage = Math.round(
            weakness.evidence.successRate * 100
          );

          return (
            <motion.div
              key={weakness.knowledgeNodeId}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 text-xs font-bold rounded-full bg-${severityColor}-100 text-${severityColor}-700 dark:bg-${severityColor}-900/20 dark:text-${severityColor}-400`}
                    >
                      {getSeverityLabel(weakness.severity)}
                    </span>
                    <span className="text-xs text-gray-500">
                      우선순위: {weakness.remediation.priority}/10
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {weakness.nodeName}
                  </h4>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">
                    {successPercentage}%
                  </div>
                  <div className="text-xs text-gray-500">성공률</div>
                </div>
              </div>

              {/* Evidence */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Target className="w-4 h-4" />
                  <span>{weakness.evidence.attemptCount}회 시도</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>
                    {Math.floor(
                      (Date.now() - weakness.evidence.lastAttemptDate.getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}
                    일 전
                  </span>
                </div>
              </div>

              {/* Root Cause */}
              <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  원인 분석
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {getRootCauseLabel(weakness.rootCause)}
                </div>
              </div>

              {/* Remediation Plan */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  개선 계획
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>예상 소요: {weakness.remediation.estimatedTime}분</span>
                </div>
                {weakness.remediation.prerequisites &&
                  weakness.remediation.prerequisites.length > 0 && (
                    <div className="text-xs text-gray-500">
                      선행 학습 {weakness.remediation.prerequisites.length}개 필요
                    </div>
                  )}

                {onRemediationClick && (
                  <button
                    onClick={() => onRemediationClick(weakness)}
                    className="w-full mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    약점 극복 시작
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          <strong>총 {weaknesses.length}개 약점</strong> 중{' '}
          <strong className="text-red-600">
            {weaknesses.filter(w => w.severity === 'critical').length}개 긴급
          </strong>
          ,{' '}
          <strong className="text-orange-600">
            {weaknesses.filter(w => w.severity === 'moderate').length}개 중요
          </strong>
          ,{' '}
          <strong className="text-yellow-600">
            {weaknesses.filter(w => w.severity === 'minor').length}개 경미
          </strong>
        </div>
      </div>
    </div>
  );
}
