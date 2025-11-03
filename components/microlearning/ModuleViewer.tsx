// components/microlearning/ModuleViewer.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Award, CheckCircle } from 'lucide-react';
import type { MicrolearningModule, QuizQuestion } from '@/types/microlearning';

interface ModuleViewerProps {
  module: MicrolearningModule;
  onClose: () => void;
  onComplete: (score?: number) => void;
}

export function ModuleViewer({ module, onClose, onComplete }: ModuleViewerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const totalSteps = module.contents.length + (module.quiz ? 1 : 0);
  const isQuizStep = currentStep === module.contents.length && module.quiz;
  const isLastStep = currentStep === totalSteps - 1;

  const handleNext = () => {
    if (isLastStep) {
      if (module.quiz && !showResults) {
        // Show quiz results
        setShowResults(true);
      } else {
        // Complete module
        const score = calculateScore();
        onComplete(score);
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      if (showResults) {
        setShowResults(false);
      }
    }
  };

  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const calculateScore = (): number | undefined => {
    if (!module.quiz) return undefined;

    const correctAnswers = module.quiz.filter(
      (q) => quizAnswers[q.id] === q.correctAnswer
    ).length;

    return Math.round((correctAnswers / module.quiz.length) * 100);
  };

  const renderContent = () => {
    if (isQuizStep && module.quiz) {
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🎯</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">퀴즈 타임!</h2>
            <p className="text-gray-600">학습한 내용을 확인해 보세요</p>
          </div>

          {!showResults ? (
            // Quiz Questions
            <div className="space-y-6">
              {module.quiz.map((question, qIndex) => (
                <div key={question.id} className="bg-white rounded-xl p-6 border-2 border-gray-200">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm">
                      {qIndex + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{question.question}</p>
                      <span className="text-xs text-gray-500">+{question.points} points</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => {
                      const isSelected = quizAnswers[question.id] === optIndex;
                      return (
                        <button
                          key={optIndex}
                          onClick={() => handleQuizAnswer(question.id, optIndex)}
                          className={`
                            w-full text-left p-4 rounded-lg border-2 transition-all
                            ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 text-blue-900'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`
                              w-5 h-5 rounded-full border-2 flex items-center justify-center
                              ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}
                            `}
                            >
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <span className="text-gray-900">{option}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Quiz Results
            <div className="space-y-6">
              {module.quiz.map((question, qIndex) => {
                const userAnswer = quizAnswers[question.id];
                const isCorrect = userAnswer === question.correctAnswer;

                return (
                  <div
                    key={question.id}
                    className={`
                      bg-white rounded-xl p-6 border-2
                      ${isCorrect ? 'border-green-300' : 'border-red-300'}
                    `}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm">
                        {qIndex + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-2">{question.question}</p>

                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => {
                            const isUserAnswer = userAnswer === optIndex;
                            const isCorrectAnswer = question.correctAnswer === optIndex;

                            return (
                              <div
                                key={optIndex}
                                className={`
                                  p-3 rounded-lg
                                  ${
                                    isCorrectAnswer
                                      ? 'bg-green-50 border-2 border-green-300'
                                      : isUserAnswer
                                      ? 'bg-red-50 border-2 border-red-300'
                                      : 'bg-gray-50'
                                  }
                                `}
                              >
                                <div className="flex items-center gap-2">
                                  {isCorrectAnswer && (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  )}
                                  {isUserAnswer && !isCorrectAnswer && (
                                    <X className="w-4 h-4 text-red-600" />
                                  )}
                                  <span className="text-sm text-gray-900">{option}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">설명:</span> {question.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Final Score */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
                <div className="text-6xl mb-3">
                  {calculateScore()! >= 80 ? '🎉' : calculateScore()! >= 60 ? '👍' : '💪'}
                </div>
                <h3 className="text-2xl font-bold mb-2">퀴즈 완료!</h3>
                <p className="text-3xl font-bold mb-4">{calculateScore()}점</p>
                <div className="flex items-center justify-center gap-2 text-lg">
                  <Award className="w-6 h-6" />
                  <span>+{module.xpReward} XP 획득!</span>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Learning Content
    const content = module.contents[currentStep];
    if (!content) return null;

    return (
      <div className="prose prose-lg max-w-none">
        {content.type === 'text' && (
          <div
            className="text-gray-800 leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: content.content.replace(/\n/g, '<br />') }}
          />
        )}

        {content.type === 'equation' && (
          <div className="bg-gray-50 rounded-xl p-6 my-6">
            <div className="text-center text-2xl font-mono text-gray-900 mb-2">
              {content.content}
            </div>
            {content.caption && (
              <p className="text-center text-sm text-gray-600">{content.caption}</p>
            )}
          </div>
        )}

        {content.type === 'image' && (
          <div className="my-6">
            <img
              src={content.content}
              alt={content.caption || ''}
              className="rounded-xl w-full"
            />
            {content.caption && (
              <p className="text-center text-sm text-gray-600 mt-2">{content.caption}</p>
            )}
          </div>
        )}
      </div>
    );
  };

  const allQuizAnswered =
    !module.quiz || module.quiz.every((q) => quizAnswers[q.id] !== undefined);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{module.thumbnail}</div>
              <div>
                <h2 className="text-2xl font-bold">{module.title}</h2>
                <p className="text-blue-100 text-sm">{module.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                className="h-full bg-white rounded-full"
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-sm font-medium">
              {currentStep + 1} / {totalSteps}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-gray-200 p-6 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5" />
            이전
          </button>

          <div className="text-sm text-gray-600">
            {module.estimatedMinutes}분 소요 예상
          </div>

          <button
            onClick={handleNext}
            disabled={isQuizStep && !showResults && !allQuizAnswered}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLastStep ? (showResults ? '완료' : '결과 보기') : '다음'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
