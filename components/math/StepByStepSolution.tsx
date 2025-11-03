'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen, Lightbulb, PlayCircle } from 'lucide-react';
import type { ParsedSolution, MathStep } from '@/lib/math/step-parser';

interface StepByStepSolutionProps {
  solution: ParsedSolution;
}

export default function StepByStepSolution({ solution }: StepByStepSolutionProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!solution.hasSteps || solution.steps.length === 0) {
    return null;
  }

  const totalSteps = solution.steps.length;
  const step = solution.steps[currentStep];

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAutoPlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    setCurrentStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= totalSteps) {
        clearInterval(interval);
        setIsPlaying(false);
        return;
      }
      setCurrentStep(step);
    }, 3000); // 3초마다 다음 단계
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 my-4">
      {/* Problem Statement */}
      {solution.hasProblem && solution.problem && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-lg text-gray-900">문제</h3>
          </div>
          <p className="text-gray-800 bg-white rounded-lg p-4 border border-blue-100">
            {solution.problem}
          </p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            풀이 진행 ({currentStep + 1}/{totalSteps})
          </span>
          <button
            onClick={handleAutoPlay}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              isPlaying
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            {isPlaying ? '정지' : '자동 재생'}
          </button>
        </div>
        <div className="flex gap-1">
          {solution.steps.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`flex-1 h-2 rounded-full cursor-pointer transition-all ${
                index <= currentStep
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  : 'bg-gray-200'
              } ${index === currentStep ? 'h-3' : 'h-2'}`}
            />
          ))}
        </div>
      </div>

      {/* Current Step */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-blue-100 min-h-[200px]"
        >
          {/* Step Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
              {step.stepNumber}
            </div>
            <h4 className="text-xl font-bold text-gray-900">{step.title}</h4>
          </div>

          {/* Step Explanation */}
          {step.explanation && (
            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {step.explanation}
              </p>
            </div>
          )}

          {/* Step Equation */}
          {step.equation && (
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 border border-blue-200">
              <pre className="text-lg font-mono text-gray-900 whitespace-pre-wrap overflow-x-auto">
                {step.equation}
              </pre>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-lg font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
          이전 단계
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-500">단계를 클릭하여 이동하세요</p>
        </div>

        <button
          onClick={handleNext}
          disabled={currentStep === totalSteps - 1}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          다음 단계
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Final Answer */}
      {currentStep === totalSteps - 1 && solution.finalAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-300"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
              ✓
            </div>
            <h4 className="font-bold text-lg text-green-900">최종 답</h4>
          </div>
          <p className="text-xl font-bold text-green-800">{solution.finalAnswer}</p>
        </motion.div>
      )}

      {/* Concept Explanation */}
      {currentStep === totalSteps - 1 && solution.conceptExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-purple-600" />
            <h4 className="font-bold text-gray-900">개념 설명</h4>
          </div>
          <p className="text-gray-700 leading-relaxed">{solution.conceptExplanation}</p>
        </motion.div>
      )}

      {/* Practice Problems */}
      {currentStep === totalSteps - 1 && solution.practiceProblems && solution.practiceProblems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📝</span>
            <h4 className="font-bold text-gray-900">연습 문제</h4>
          </div>
          {solution.practiceProblems.map((problem, index) => (
            <p key={index} className="text-gray-700 leading-relaxed">
              {problem}
            </p>
          ))}
          <p className="text-sm text-gray-500 mt-2">💡 이 문제를 직접 풀어보세요!</p>
        </motion.div>
      )}
    </div>
  );
}
