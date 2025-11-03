'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Clock, Award } from 'lucide-react';
import { useEffect } from 'react';

interface FlashcardPreview {
  front: string;
  back: string;
  difficulty: number;
}

interface QuizPreview {
  topic: string;
  difficulty: number;
  questionCount: number;
  estimatedMinutes: number;
  estimatedXP: number;
}

interface InstantStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
  type: 'flashcard' | 'quiz';
  flashcardPreview?: FlashcardPreview;
  quizPreview?: QuizPreview;
}

export function InstantStartModal({
  isOpen,
  onClose,
  onStart,
  type,
  flashcardPreview,
  quizPreview,
}: InstantStartModalProps) {
  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // 배경 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleStart = () => {
    onStart();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>

            {/* Content */}
            <div className="p-8">
              {type === 'flashcard' && flashcardPreview && (
                <>
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        플래시카드가 생성되었습니다!
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        바로 복습을 시작하시겠어요?
                      </p>
                    </div>
                  </div>

                  {/* Card Preview */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 mb-6">
                    <div className="mb-4">
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
                        앞면
                      </span>
                      <p className="mt-2 text-gray-900 dark:text-white font-medium">
                        {flashcardPreview.front}
                      </p>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-500 to-transparent mb-4" />
                    <div>
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
                        뒷면
                      </span>
                      <p className="mt-2 text-gray-900 dark:text-white font-medium">
                        {flashcardPreview.back}
                      </p>
                    </div>

                    {/* Difficulty */}
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">난이도:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`w-2 h-4 rounded-full ${
                              level <= flashcardPreview.difficulty
                                ? 'bg-gradient-to-t from-green-500 to-emerald-400'
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {type === 'quiz' && quizPreview && (
                <>
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        퀴즈가 생성되었습니다!
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        지금 바로 도전해보시겠어요?
                      </p>
                    </div>
                  </div>

                  {/* Quiz Info */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                          주제
                        </span>
                        <p className="mt-1 text-gray-900 dark:text-white font-medium">
                          {quizPreview.topic}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                          난이도
                        </span>
                        <div className="mt-1 flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`w-2 h-4 rounded-full ${
                                level <= quizPreview.difficulty
                                  ? 'bg-gradient-to-t from-purple-500 to-pink-400'
                                  : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-purple-200 dark:border-gray-500">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {quizPreview.questionCount}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            문항
                          </div>
                        </div>
                        <div className="text-center flex flex-col items-center">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {quizPreview.estimatedMinutes}
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            분
                          </div>
                        </div>
                        <div className="text-center flex flex-col items-center">
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {quizPreview.estimatedXP}
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            XP
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStart}
                  className={`flex-1 py-4 rounded-xl font-semibold text-white shadow-lg transition-all ${
                    type === 'flashcard'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                      : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
                  }`}
                  autoFocus
                >
                  {type === 'flashcard' ? '🚀 바로 복습 시작하기' : '🎮 지금 바로 시작하기'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-6 py-4 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  나중에
                </motion.button>
              </div>

              {/* Tip */}
              <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
                💡 Tip: ESC 키를 눌러도 닫을 수 있어요
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
