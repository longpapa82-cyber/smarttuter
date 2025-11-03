// components/spaced-repetition/FlashCard.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, ThumbsDown, ThumbsUp, Brain } from 'lucide-react';
import type { ReviewCard, DifficultyRating } from '@/types/spaced-repetition';

interface FlashCardProps {
  card: ReviewCard;
  onRate: (rating: DifficultyRating) => void;
  showAnswer?: boolean;
}

const RATING_CONFIG: Record<
  DifficultyRating,
  { label: string; color: string; emoji: string; description: string }
> = {
  0: {
    label: '기억 안남',
    color: 'bg-red-600 hover:bg-red-700',
    emoji: '❌',
    description: '완전히 기억이 안남',
  },
  1: {
    label: '틀림',
    color: 'bg-orange-600 hover:bg-orange-700',
    emoji: '😓',
    description: '답이 틀렸음',
  },
  2: {
    label: '어렵게 맞힘',
    color: 'bg-yellow-600 hover:bg-yellow-700',
    emoji: '🤔',
    description: '기억은 나는데 어려웠음',
  },
  3: {
    label: '맞힘 (어려움)',
    color: 'bg-lime-600 hover:bg-lime-700',
    emoji: '😊',
    description: '맞혔지만 조금 어려웠음',
  },
  4: {
    label: '맞힘 (쉬움)',
    color: 'bg-green-600 hover:bg-green-700',
    emoji: '😄',
    description: '약간 망설였지만 쉬웠음',
  },
  5: {
    label: '완벽',
    color: 'bg-blue-600 hover:bg-blue-700',
    emoji: '🎉',
    description: '완벽하게 기억함',
  },
};

export function FlashCard({ card, onRate, showAnswer: initialShowAnswer = false }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(initialShowAnswer);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRate = (rating: DifficultyRating) => {
    onRate(rating);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Flashcard */}
      <motion.div
        className="relative h-80 mb-6 cursor-pointer"
        onClick={!isFlipped ? handleFlip : undefined}
        style={{ perspective: 1000 }}
      >
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            // Front Side
            <motion.div
              key="front"
              initial={{ rotateY: 0 }}
              exit={{ rotateY: 90 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 flex flex-col items-center justify-center text-white shadow-2xl"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {/* Subject Badge */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                  {card.subject === 'math' ? '📐 수학' : '📝 영어'}
                </span>
              </div>

              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                  {card.status === 'new' && '🆕 새 카드'}
                  {card.status === 'learning' && '📚 학습 중'}
                  {card.status === 'review' && '🔄 복습'}
                  {card.status === 'relearning' && '⚠️ 재학습'}
                  {card.status === 'mastered' && '🏆 마스터'}
                </span>
              </div>

              {/* Question */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 leading-relaxed whitespace-pre-wrap">
                  {card.front}
                </h2>
              </div>

              {/* Flip Instruction */}
              <div className="absolute bottom-8 flex items-center gap-2 text-white/80">
                <RotateCw className="w-5 h-5 animate-spin-slow" />
                <span className="text-sm">클릭하여 답 보기</span>
              </div>
            </motion.div>
          ) : (
            // Back Side
            <motion.div
              key="back"
              initial={{ rotateY: -90 }}
              animate={{ rotateY: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-8 flex flex-col text-white shadow-2xl overflow-y-auto"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {/* Subject Badge */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                  {card.subject === 'math' ? '📐 수학' : '📝 영어'}
                </span>
              </div>

              {/* Stats */}
              {card.totalReviews > 0 && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                    {card.totalReviews}회 복습
                  </span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                    {Math.round((card.correctReviews / card.totalReviews) * 100)}% 정답
                  </span>
                </div>
              )}

              {/* Answer */}
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-xl">
                  <div className="text-2xl font-bold mb-6 leading-relaxed whitespace-pre-wrap">
                    {card.back}
                  </div>
                </div>
              </div>

              {/* Difficulty Indicator */}
              {card.repetitions > 0 && (
                <div className="text-center text-sm text-white/70 mt-4">
                  난이도: {card.easinessFactor.toFixed(2)} | 연속 성공: {card.repetitions}회
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Rating Buttons */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-3"
          >
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center justify-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                얼마나 잘 기억하셨나요?
              </h3>
              <p className="text-sm text-gray-600">답변 평가에 따라 복습 일정이 자동 조정됩니다</p>
            </div>

            {/* Quick Buttons (Mobile-friendly) */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRate(1)}
                className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <ThumbsDown className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-bold">틀림</div>
                  <div className="text-xs opacity-90">다시 학습</div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRate(5)}
                className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <ThumbsUp className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-bold">완벽</div>
                  <div className="text-xs opacity-90">쉬웠어요</div>
                </div>
              </motion.button>
            </div>

            {/* Detailed Rating Buttons */}
            <details className="bg-gray-50 rounded-xl p-4">
              <summary className="cursor-pointer text-sm text-gray-600 font-medium hover:text-gray-900 transition-colors">
                세부 평가 옵션 보기
              </summary>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                {(Object.entries(RATING_CONFIG) as [string, typeof RATING_CONFIG[0]][]).map(
                  ([rating, config]) => (
                    <motion.button
                      key={rating}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRate(parseInt(rating) as DifficultyRating)}
                      className={`${config.color} text-white p-3 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg`}
                    >
                      <div className="text-2xl mb-1">{config.emoji}</div>
                      <div className="font-bold">{config.label}</div>
                      <div className="text-xs opacity-80 mt-1">{config.description}</div>
                    </motion.button>
                  )
                )}
              </div>
            </details>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
