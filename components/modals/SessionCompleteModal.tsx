"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getSupplementaryRecommendations,
  getRecommendationExplanation,
  type LearningContext,
  type SupplementaryRecommendation,
} from "@/lib/recommendations/supplementary-learning";
import { AnimatedCounter } from "@/components/animations";

interface SessionCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: LearningContext;
  sessionStats?: {
    totalMessages: number;
    correctAnswers?: number;
    totalQuestions?: number;
  };
}

export function SessionCompleteModal({
  isOpen,
  onClose,
  context,
  sessionStats,
}: SessionCompleteModalProps) {
  const [recommendations, setRecommendations] = useState<SupplementaryRecommendation[]>([]);
  const [explanation, setExplanation] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      const recs = getSupplementaryRecommendations(context);
      const exp = getRecommendationExplanation(context);
      setRecommendations(recs);
      setExplanation(exp);
    }
  }, [isOpen, context]);

  const colorClasses = {
    purple: "from-purple-500 to-pink-600",
    blue: "from-indigo-500 to-blue-600",
    green: "from-green-500 to-emerald-600",
    orange: "from-orange-500 to-amber-600",
    pink: "from-pink-500 to-rose-600",
  };

  const accuracy = sessionStats?.totalQuestions
    ? Math.round(((sessionStats.correctAnswers || 0) / sessionStats.totalQuestions) * 100)
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-accent-600 p-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">학습 완료!</h2>
                      <p className="text-white/80 text-sm">훌륭한 학습 세션이었습니다 🎉</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Stats Section */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">세션 통계</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Duration */}
                  <motion.div
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">학습 시간</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <AnimatedCounter
                        value={context.sessionDuration}
                        duration={1.5}
                        delay={0.2}
                        className="text-2xl font-bold text-gray-900"
                      />
                      <span className="text-sm text-gray-600">분</span>
                    </div>
                  </motion.div>

                  {/* Messages */}
                  {sessionStats?.totalMessages && (
                    <motion.div
                      className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-gray-600">대화 횟수</span>
                      </div>
                      <AnimatedCounter
                        value={sessionStats.totalMessages}
                        duration={1.5}
                        delay={0.3}
                        className="text-2xl font-bold text-gray-900"
                      />
                    </motion.div>
                  )}

                  {/* Accuracy */}
                  {accuracy !== null && (
                    <motion.div
                      className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">정답률</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <AnimatedCounter
                          value={accuracy}
                          suffix="%"
                          duration={1.5}
                          delay={0.4}
                          className="text-2xl font-bold text-gray-900"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Recommendations Section */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    다음 추천 학습
                  </h3>
                  <p className="text-sm text-gray-600">{explanation}</p>
                </div>

                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <motion.div
                      key={rec.activity}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <Link href={rec.link}>
                        <div
                          className={`
                            relative bg-gradient-to-r ${colorClasses[rec.color]}
                            rounded-xl p-4 text-white cursor-pointer
                            hover:shadow-lg hover:scale-[1.02] transition-all
                            overflow-hidden
                          `}
                        >
                          {/* Priority badge */}
                          {rec.priority === 'high' && (
                            <div className="absolute top-2 right-2">
                              <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                                추천
                              </span>
                            </div>
                          )}

                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 text-2xl">
                              {rec.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                              <h4 className="font-bold text-lg mb-1">{rec.title}</h4>
                              <p className="text-sm text-white/90 mb-2">{rec.description}</p>
                              <div className="flex items-center gap-4 text-xs text-white/80">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  약 {rec.estimatedDuration}분
                                </span>
                              </div>
                              <p className="text-xs text-white/70 mt-2 italic">{rec.reason}</p>
                            </div>

                            {/* Arrow */}
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <span className="text-lg">→</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-gray-50 rounded-b-3xl">
                <button
                  onClick={onClose}
                  className="w-full py-3 px-6 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
                >
                  나중에 선택하기
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
