'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flashcard } from '@/lib/interactive-learning/types';
import { FlashcardScheduler } from '@/lib/interactive-learning/flashcard-scheduler';
import { useInteractiveLearning } from '@/lib/interactive-learning/store';
import { useUserStore } from '@/lib/gamification/store';
import { FLASHCARD_XP_REWARDS } from '@/lib/interactive-learning/types';
import { XPAnimation, LevelUpAnimation } from '@/components/animations/XPAnimation';

interface FlashcardReviewProps {
  cards: Flashcard[];
  onComplete: () => void;
}

export default function FlashcardReview({ cards, onComplete }: FlashcardReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [startTime] = useState(Date.now());
  const [reviewedCount, setReviewedCount] = useState(0);

  // Animation states
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [currentXP, setCurrentXP] = useState(0);
  const [currentQuality, setCurrentQuality] = useState<number>(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);

  const { reviewFlashcard } = useInteractiveLearning();
  const addXP = useUserStore((state) => state.addXP);
  const updateStreak = useUserStore((state) => state.updateStreak);
  const updateGoalProgress = useUserStore((state) => state.updateGoalProgress);
  const profile = useUserStore((state) => state.profile);

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          복습할 카드가 없습니다!
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          모든 카드를 복습했습니다. 잘하셨어요!
        </p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((reviewedCount) / cards.length) * 100;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleQualitySelect = (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    const responseTime = Math.floor((Date.now() - startTime) / 1000);

    // Review flashcard with SM-2 algorithm
    reviewFlashcard(currentCard.id, quality, responseTime);

    // Award XP based on quality
    const xpReward = FLASHCARD_XP_REWARDS[quality];
    const previousLevel = profile?.points.level || 1;
    addXP(xpReward, `flashcard-${currentCard.id}`);

    // Update streak (will trigger milestone check)
    updateStreak();

    // Update daily goals - flashcards completed
    updateGoalProgress('flashcards', 1);

    // Show XP animation
    setCurrentXP(xpReward);
    setCurrentQuality(quality);
    setShowXPAnimation(true);

    // Check for level up
    const newCurrentLevel = useUserStore.getState().profile?.points.level || 1;
    if (newCurrentLevel > previousLevel) {
      // Delay level up animation after XP animation
      setTimeout(() => {
        setNewLevel(newCurrentLevel);
        setShowLevelUp(true);
      }, 2000);
    }

    // Move to next card or complete (after animation)
    setTimeout(() => {
      setReviewedCount(reviewedCount + 1);
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      } else {
        onComplete();
      }
    }, quality >= 4 ? 2500 : 1500); // Longer delay for high quality (confetti)
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          플래시카드 복습
        </h2>

        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="absolute h-full bg-gradient-to-r from-green-500 to-teal-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {reviewedCount} / {cards.length} 완료
        </p>
      </div>

      {/* Flashcard */}
      <div className="mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="perspective-1000"
          >
            <motion.div
              className="relative w-full h-96 cursor-pointer"
              onClick={handleFlip}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: 'spring' }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(0deg)',
                }}
              >
                <div className="text-sm text-white/80 mb-4">앞면</div>
                <p className="text-2xl font-bold text-white text-center">
                  {currentCard.front}
                </p>
                <div className="mt-8 text-sm text-white/60">클릭하여 뒤집기</div>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div className="text-sm text-white/80 mb-4">뒷면</div>
                <p className="text-2xl font-bold text-white text-center">
                  {currentCard.back}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Card Info */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span>난이도: {'⭐'.repeat(currentCard.difficulty)}</span>
            <span>복습 횟수: {currentCard.repetitions}회</span>
          </div>
          <div>
            숙달도: {Math.round(currentCard.masteryScore * 100)}%
          </div>
        </div>
      </div>

      {/* Quality Rating (shown after flip) */}
      {isFlipped && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <p className="text-center text-gray-700 dark:text-gray-300 font-medium">
            얼마나 잘 기억하셨나요?
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { quality: 5, label: '완벽', color: 'from-green-500 to-teal-600', xp: 50 },
              { quality: 4, label: '맞음 (약간 어려움)', color: 'from-blue-500 to-cyan-600', xp: 40 },
              { quality: 3, label: '맞음 (힌트 필요)', color: 'from-yellow-500 to-orange-500', xp: 30 },
              { quality: 2, label: '어려움', color: 'from-orange-500 to-red-500', xp: 20 },
              { quality: 1, label: '틀림', color: 'from-red-500 to-pink-600', xp: 10 },
              { quality: 0, label: '완전히 잊음', color: 'from-gray-500 to-gray-700', xp: 5 },
            ].map(({ quality, label, color, xp }) => {
              const nextReviewTime = FlashcardScheduler.getNextReviewPreview(
                currentCard,
                quality as 0 | 1 | 2 | 3 | 4 | 5
              );

              return (
                <motion.button
                  key={quality}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleQualitySelect(quality as 0 | 1 | 2 | 3 | 4 | 5)}
                  className={`p-4 bg-gradient-to-r ${color} text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg">{label}</span>
                    <span className="text-xs opacity-80">+{xp} XP</span>
                    <span className="text-xs opacity-70 mt-1">📅 {nextReviewTime}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              💡 <strong>SM-2 알고리즘</strong>: 답변에 따라 다음 복습 일정이 자동으로 조정됩니다.
              잘 기억할수록 복습 간격이 길어집니다!
            </p>
          </div>
        </motion.div>
      )}

      {/* XP Animation */}
      <XPAnimation
        xp={currentXP}
        show={showXPAnimation}
        quality={currentQuality}
        position="center"
        onComplete={() => setShowXPAnimation(false)}
      />

      {/* Level Up Animation */}
      <LevelUpAnimation
        newLevel={newLevel}
        show={showLevelUp}
        onComplete={() => setShowLevelUp(false)}
      />
    </div>
  );
}
