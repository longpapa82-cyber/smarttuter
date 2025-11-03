'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quiz, QuizQuestion, QuizAnswer, QuizResult } from '@/lib/interactive-learning/types';
import { useUserStore } from '@/lib/gamification/store';
import { useInteractiveLearning } from '@/lib/interactive-learning/store';
import DifficultyIndicator from '@/components/adaptive-learning/DifficultyIndicator';

interface QuizViewProps {
  quiz: Quiz;
  onComplete: (result: QuizResult) => void;
}

export default function QuizView({ quiz, onComplete }: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime] = useState(Date.now());

  const addXP = useUserStore((state) => state.addXP);
  const updateGoalProgress = useUserStore((state) => state.updateGoalProgress);
  const { submitQuizResult } = useInteractiveLearning();

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    const correct =
      currentQuestion.type === 'multiple_choice'
        ? selectedAnswer === currentQuestion.correctAnswer
        : selectedAnswer.toLowerCase().trim() ===
          currentQuestion.correctAnswer.toLowerCase().trim();

    setIsCorrect(correct);
    setShowResult(true);

    const answerRecord: QuizAnswer = {
      questionId: currentQuestion.id,
      userAnswer: selectedAnswer,
      isCorrect: correct,
      timeSpent: Math.floor((Date.now() - startTime) / 1000),
    };

    setAnswers([...answers, answerRecord]);
  };

  const handleNext = () => {
    setShowResult(false);
    setSelectedAnswer('');

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz completed
      const totalTimeSpent = Math.floor((Date.now() - startTime) / 1000);
      const correctAnswers = [...answers, answers[answers.length - 1]].filter(
        (a) => a.isCorrect
      ).length;
      const accuracy = (correctAnswers / quiz.questions.length) * 100;

      const result: QuizResult = {
        id: `result-${Date.now()}`,
        quizId: quiz.id,
        userId: quiz.createdBy,
        answers: [...answers],
        score: Math.round(accuracy),
        totalPoints: quiz.questions.reduce((sum, q) => sum + q.points, 0),
        earnedPoints: [...answers].filter(a => a.isCorrect).reduce((sum, _, i) => sum + quiz.questions[i].points, 0),
        totalQuestions: quiz.questions.length,
        correctAnswers,
        timeSpent: totalTimeSpent,
        xpEarned: quiz.xpReward,
        badgesUnlocked: [],
        weaknessesIdentified: [],
        completedAt: new Date(),
      };

      // Award XP
      addXP(quiz.xpReward, `quiz-${quiz.id}`);

      // Update daily goal - quiz completed
      updateGoalProgress('quiz', 1);

      submitQuizResult(result);
      onComplete(result);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {quiz.title}
          </h1>
          <DifficultyIndicator difficulty={quiz.difficulty} showMultiplier />
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          질문 {currentQuestionIndex + 1} / {quiz.questions.length}
        </p>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6"
        >
          {/* Question */}
          <div className="mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                {currentQuestionIndex + 1}
              </div>
              <div className="flex-1">
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {currentQuestion.question}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {currentQuestion.bloomLevel} • {currentQuestion.points}점
                </p>
              </div>
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.type === 'multiple_choice' &&
            currentQuestion.options ? (
              currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedAnswer === option
                      ? showResult
                        ? isCorrect
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : showResult && option === currentQuestion.correctAnswer
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswer === option
                          ? showResult
                            ? isCorrect
                              ? 'border-green-500 bg-green-500'
                              : 'border-red-500 bg-red-500'
                            : 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {selectedAnswer === option && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-gray-900 dark:text-white">{option}</span>
                  </div>
                </motion.button>
              ))
            ) : (
              <div>
                <textarea
                  value={selectedAnswer}
                  onChange={(e) => handleAnswerSelect(e.target.value)}
                  disabled={showResult}
                  placeholder="답변을 입력하세요..."
                  className="w-full p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                  rows={4}
                />
              </div>
            )}
          </div>

          {/* Explanation (shown after answer) */}
          {showResult && currentQuestion.explanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`mt-4 p-4 rounded-lg ${
                isCorrect
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
              }`}
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                {isCorrect ? '✅ 정답입니다!' : '📝 설명'}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {currentQuestion.explanation}
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        {!showResult ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            답변 제출
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg font-semibold"
          >
            {currentQuestionIndex < quiz.questions.length - 1 ? '다음 질문' : '완료'}
          </motion.button>
        )}
      </div>
    </div>
  );
}
