'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useInteractiveLearning } from '@/lib/interactive-learning/store';
import { useAdaptiveLearning } from '@/lib/adaptive-learning/store';
import QuizView from '@/components/interactive-learning/QuizView';
import { Quiz, QuizResult, Subject } from '@/lib/interactive-learning/types';

export default function QuizPage() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [questionCount, setQuestionCount] = useState(5);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const { generateQuiz, getQuizHistory } = useInteractiveLearning();
  const { profile } = useAdaptiveLearning();

  const recentQuizzes = getQuizHistory().slice(0, 5);

  const handleGenerateQuiz = async () => {
    if (!selectedSubject || !selectedTopic) return;

    setIsGenerating(true);
    try {
      const quiz = await generateQuiz(
        selectedSubject,
        selectedTopic,
        selectedDifficulty,
        questionCount
      );
      setCurrentQuiz(quiz);
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      alert('퀴즈 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuizComplete = (result: QuizResult) => {
    setQuizResult(result);
    setShowResult(true);
  };

  const handleStartNew = () => {
    setCurrentQuiz(null);
    setShowResult(false);
    setQuizResult(null);
    setSelectedSubject(null);
    setSelectedTopic('');
  };

  // Quiz Result View
  if (showResult && quizResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center"
          >
            <div className="text-6xl mb-6">
              {quizResult.score >= 80 ? '🎉' : quizResult.score >= 60 ? '👍' : '💪'}
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {quizResult.score >= 80
                ? '훌륭합니다!'
                : quizResult.score >= 60
                ? '잘했어요!'
                : '계속 노력하세요!'}
            </h2>

            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-8">
              {quizResult.score}점
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {quizResult.correctAnswers}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">정답</div>
              </div>

              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {quizResult.totalQuestions - quizResult.correctAnswers}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">오답</div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.floor(quizResult.timeSpent / 60)}분
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">소요 시간</div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg mb-8">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                +{quizResult.xpEarned} XP 획득!
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleStartNew}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
              >
                새 퀴즈 시작
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                대시보드로
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Quiz Taking View
  if (currentQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <QuizView quiz={currentQuiz} onComplete={handleQuizComplete} />
      </div>
    );
  }

  // Quiz Setup View
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
          >
            ← 대시보드로 돌아가기
          </button>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            AI 퀴즈 생성
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            주제와 난이도를 선택하면 AI가 맞춤형 퀴즈를 생성합니다
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Quiz Generator */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              퀴즈 설정
            </h2>

            <div className="space-y-6">
              {/* Subject Selection */}
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
                      onClick={() => setSelectedSubject(subject.value as Subject)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedSubject === subject.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-2xl mb-1">{subject.icon}</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {subject.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  학습 주제
                </label>
                <input
                  type="text"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  placeholder="예: 이차방정식, 현재완료 시제"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  난이도: {'⭐'.repeat(selectedDifficulty)}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>쉬움</span>
                  <span>어려움</span>
                </div>
              </div>

              {/* Question Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  문항 수: {questionCount}개
                </label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateQuiz}
                disabled={!selectedSubject || !selectedTopic || isGenerating}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
              >
                {isGenerating ? '생성 중...' : '🎯 퀴즈 생성하기'}
              </button>
            </div>
          </div>

          {/* Recent Quizzes */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              최근 퀴즈
            </h2>

            {recentQuizzes.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">📝</div>
                <p>아직 풀어본 퀴즈가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentQuizzes.map((result) => (
                  <div
                    key={result.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {result.score}점
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          result.score >= 80
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : result.score >= 60
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}
                      >
                        {result.correctAnswers}/{result.totalQuestions}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(result.completedAt).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
