// components/spaced-repetition/ReviewSession.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { FlashCard } from './FlashCard';
import { calculateSM2 } from '@/lib/spaced-repetition/sm2-engine';
import type { ReviewCard, DifficultyRating, ReviewSession as ReviewSessionType } from '@/types/spaced-repetition';

interface ReviewSessionProps {
  cards: ReviewCard[];
  onComplete: (session: ReviewSessionType) => void;
  onClose: () => void;
}

export function ReviewSession({ cards, onComplete, onClose }: ReviewSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCards, setCompletedCards] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<string, DifficultyRating>>({});
  const [startTime] = useState(new Date());
  const [showResults, setShowResults] = useState(false);

  const currentCard = cards[currentIndex];
  const totalCards = cards.length;
  const progress = (completedCards.length / totalCards) * 100;

  const handleRate = (rating: DifficultyRating) => {
    if (!currentCard) return;

    // Save rating
    setRatings((prev) => ({
      ...prev,
      [currentCard.id]: rating,
    }));

    // Mark as completed
    setCompletedCards((prev) => [...prev, currentCard.id]);

    // Move to next card or show results
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // All cards reviewed
      setShowResults(true);
    }
  };

  const handleFinish = () => {
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    // Calculate statistics
    const correctCards = Object.entries(ratings).filter(([_, rating]) => rating >= 3).length;
    const averageRating =
      Object.values(ratings).reduce((sum, r) => sum + r, 0 as number) / Object.values(ratings).length;

    // Calculate XP (10 XP per card + bonus for high ratings)
    const baseXP = totalCards * 10;
    const bonusXP = Object.values(ratings).filter((r) => r >= 4).length * 5;
    const earnedXP = baseXP + bonusXP;

    const session: ReviewSessionType = {
      id: `session-${Date.now()}`,
      userId: currentCard.userId,
      startTime,
      endTime,
      duration,
      cardIds: cards.map((c) => c.id),
      totalCards,
      completedCards: completedCards.length,
      correctCards,
      averageRating,
      earnedXP,
    };

    onComplete(session);
  };

  if (showResults) {
    const correctCards = Object.entries(ratings).filter(([_, rating]) => rating >= 3).length;
    const accuracy = Math.round((correctCards / totalCards) * 100);
    const averageRating =
      Object.values(ratings).reduce((sum, r) => sum + r, 0 as number) / Object.values(ratings).length;
    const duration = Math.floor((new Date().getTime() - startTime.getTime()) / 1000 / 60);

    // Calculate XP
    const baseXP = totalCards * 10;
    const bonusXP = Object.values(ratings).filter((r) => r >= 4).length * 5;
    const earnedXP = baseXP + bonusXP;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-7xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">복습 완료!</h2>
            <p className="text-gray-600">오늘도 열심히 학습하셨네요!</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{totalCards}</div>
              <div className="text-sm text-gray-600">복습 카드</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{accuracy}%</div>
              <div className="text-sm text-gray-600">정확도</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">평균 평가</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">{duration}분</div>
              <div className="text-sm text-gray-600">소요 시간</div>
            </div>
          </div>

          {/* XP Reward */}
          <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-2xl p-6 text-white text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Award className="w-8 h-8" />
              <span className="text-3xl font-bold">+{earnedXP} XP</span>
            </div>
            <p className="text-sm text-white/90">
              기본 {baseXP} XP + 보너스 {bonusXP} XP
            </p>
          </div>

          {/* Performance Analysis */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              학습 분석
            </h3>
            <div className="space-y-3">
              {accuracy >= 80 && (
                <div className="flex items-start gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">훌륭한 성과!</p>
                    <p className="text-gray-600">
                      {accuracy}%의 높은 정확도를 보이셨습니다. 이 속도라면 곧 마스터하실 거예요!
                    </p>
                  </div>
                </div>
              )}
              {accuracy >= 60 && accuracy < 80 && (
                <div className="flex items-start gap-3 text-sm">
                  <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">좋은 진전!</p>
                    <p className="text-gray-600">
                      꾸준히 복습하시면 더 좋은 결과를 얻으실 수 있습니다.
                    </p>
                  </div>
                </div>
              )}
              {accuracy < 60 && (
                <div className="flex items-start gap-3 text-sm">
                  <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">더 많은 연습이 필요해요</p>
                    <p className="text-gray-600">
                      어려운 카드는 더 자주 복습하게 조정되었습니다. 꾸준히 학습해 보세요!
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 text-sm">
                <Award className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">다음 복습 일정</p>
                  <p className="text-gray-600">
                    SM-2 알고리즘이 당신의 학습 패턴에 맞춰 최적의 복습 일정을 계획했습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-semibold transition-colors"
            >
              닫기
            </button>
            <button
              onClick={handleFinish}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              완료
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 z-50 overflow-y-auto"
    >
      <div className="min-h-screen p-4 md:p-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">복습 세션</h1>
              <p className="text-gray-600">
                {currentIndex + 1} / {totalCards} 카드
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="bg-white/50 backdrop-blur-sm rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Current Card */}
        <AnimatePresence mode="wait">
          {currentCard && (
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <FlashCard card={currentCard} onRate={handleRate} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Session Info */}
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  시작: {startTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>완료: {completedCards.length}개</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
