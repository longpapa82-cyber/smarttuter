"use client";

import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, BookOpen, CheckCircle } from "lucide-react";
import type { WeaknessArea } from "@/lib/learning-progress/types";
import type { GradeLevel } from "@/types/tutor";

interface WeaknessAnalysisProps {
  weaknesses: WeaknessArea[];
  gradeLevel: GradeLevel;
  className?: string;
}

const SEVERITY_CONFIG = {
  critical: { icon: '🔴', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
  high: { icon: '🟠', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
  medium: { icon: '🟡', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  low: { icon: '🟢', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-300' },
};

export function WeaknessAnalysis({ weaknesses, gradeLevel, className = '' }: WeaknessAnalysisProps) {
  const hasWeaknesses = weaknesses.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}
    >
      <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">약점 분석</h2>
            <p className="text-orange-100 text-sm">개선이 필요한 영역과 추천 학습</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {!hasWeaknesses ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-8 text-center"
          >
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-800 mb-2">훌륭합니다!</h3>
            <p className="text-green-700">
              현재 발견된 약점이 없습니다. 꾸준히 학습을 이어가세요! 🎉
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {weaknesses.map((weakness, idx) => {
              const severityConfig = SEVERITY_CONFIG[weakness.severity];
              return (
                <motion.div
                  key={weakness.conceptId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className={`${severityConfig.bg} ${severityConfig.border} border-2 rounded-xl p-4`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{severityConfig.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-bold ${severityConfig.color}`}>
                          {weakness.conceptId}
                        </h3>
                        <span className={`text-xs font-semibold ${severityConfig.color} px-2 py-1 rounded-full ${severityConfig.bg}`}>
                          {weakness.severity === 'critical' && '매우 중요'}
                          {weakness.severity === 'high' && '중요'}
                          {weakness.severity === 'medium' && '보통'}
                          {weakness.severity === 'low' && '경미'}
                        </span>
                      </div>

                      {/* Indicators */}
                      <div className="mb-3 flex flex-wrap gap-2">
                        {weakness.indicators.map((indicator, i) => (
                          <span key={i} className="text-xs bg-white px-2 py-1 rounded-full text-gray-600">
                            {indicator.description}
                          </span>
                        ))}
                      </div>

                      {/* Recommended Actions */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <BookOpen className="w-4 h-4 text-gray-600" />
                          <span className="font-semibold text-gray-700">추천 학습</span>
                        </div>
                        <ul className="space-y-1">
                          {weakness.recommendedActions.map((action, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2, delay: idx * 0.1 + i * 0.05 }}
                              className="text-sm text-gray-700 pl-4 relative before:content-['•'] before:absolute before:left-0"
                            >
                              {action}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Improvement Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
        >
          <div className="flex items-start space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">💡 학습 팁</p>
              <p className="text-blue-700">
                약점을 개선하기 위해 매일 15분씩 집중 학습을 시도해보세요.
                규칙적인 복습이 가장 효과적입니다!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
