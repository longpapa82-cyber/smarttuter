'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useInteractiveLearning } from '@/lib/interactive-learning/store';
import { FlashcardScheduler } from '@/lib/interactive-learning/flashcard-scheduler';
import FlashcardReview from '@/components/interactive-learning/FlashcardReview';
import { Subject } from '@/lib/interactive-learning/types';

export default function FlashcardsPage() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<'math' | 'english' | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);

  const { flashcards, createFlashcard, getDueFlashcards, getFlashcardsBySubject } =
    useInteractiveLearning();

  const dueCards = getDueFlashcards();
  const allFlashcards = flashcards;

  const schedule = FlashcardScheduler.getReviewSchedule(allFlashcards);

  const handleCreateFlashcard = () => {
    if (!front || !back || !selectedSubject) return;

    createFlashcard(
      front,
      back,
      selectedSubject,
      `manual-${Date.now()}`,
      difficulty
    );

    // Reset form
    setFront('');
    setBack('');
    setDifficulty(3);
    setShowCreateForm(false);
    alert('플래시카드가 생성되었습니다!');
  };

  const handleStartReview = () => {
    setIsReviewing(true);
  };

  const handleReviewComplete = () => {
    setIsReviewing(false);
    alert('복습을 완료했습니다! 🎉');
  };

  // Review View
  if (isReviewing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <button
            onClick={() => setIsReviewing(false)}
            className="mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
          >
            ← 뒤로 가기
          </button>
          <FlashcardReview cards={dueCards} onComplete={handleReviewComplete} />
        </div>
      </div>
    );
  }

  // Main View
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
          >
            ← 대시보드로 돌아가기
          </button>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            스마트 플래시카드
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            SM-2 알고리즘으로 최적화된 간격 반복 학습
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
              {schedule.due.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">복습 필요</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
              {schedule.upcoming.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">곧 복습</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {schedule.mastered.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">숙달</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {schedule.learning.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">학습 중</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Review Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              오늘의 복습
            </h2>

            {schedule.due.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  오늘 복습할 카드가 없습니다!
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {FlashcardScheduler.getOptimalReviewTime(schedule)}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {schedule.due.length}개 카드 복습하기
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {FlashcardScheduler.getOptimalReviewTime(schedule)}
                  </p>
                </div>

                <button
                  onClick={handleStartReview}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg font-bold text-lg hover:shadow-lg transition-shadow"
                >
                  🚀 복습 시작하기
                </button>

                <div className="mt-6 space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    복습 예정 카드 (상위 5개):
                  </p>
                  {schedule.due.slice(0, 5).map((card) => (
                    <div
                      key={card.id}
                      className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {card.front}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        숙달도: {Math.round(card.masteryScore * 100)}% •{' '}
                        {'⭐'.repeat(card.difficulty)}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Create/Manage Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              플래시카드 관리
            </h2>

            {!showCreateForm ? (
              <>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold text-lg hover:shadow-lg transition-shadow mb-6"
                >
                  ➕ 새 플래시카드 만들기
                </button>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      카드 현황
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          전체 카드
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {allFlashcards.length}개
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          숙달한 카드
                        </span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {schedule.mastered.length}개
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          학습 중인 카드
                        </span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {schedule.learning.length}개
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>💡 SM-2 알고리즘이란?</strong>
                      <br />
                      기억의 망각 곡선을 고려하여 복습 간격을 자동으로 조정하는 과학적
                      학습법입니다. 잘 기억할수록 복습 간격이 길어집니다.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    과목 선택
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'math', label: '수학', icon: '📐' },
                      { value: 'english', label: '영어', icon: '📚' },
                    ].map((subject) => (
                      <button
                        key={subject.value}
                        onClick={() => setSelectedSubject(subject.value as 'math' | 'english')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedSubject === subject.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-xl mb-1">{subject.icon}</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {subject.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    앞면 (질문)
                  </label>
                  <input
                    type="text"
                    value={front}
                    onChange={(e) => setFront(e.target.value)}
                    placeholder="예: What is the capital of France?"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    뒷면 (답변)
                  </label>
                  <input
                    type="text"
                    value={back}
                    onChange={(e) => setBack(e.target.value)}
                    placeholder="예: Paris"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    난이도: {'⭐'.repeat(difficulty)}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={difficulty}
                    onChange={(e) => setDifficulty(parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCreateFlashcard}
                    disabled={!front || !back || !selectedSubject}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
                  >
                    생성하기
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setFront('');
                      setBack('');
                      setDifficulty(3);
                    }}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
