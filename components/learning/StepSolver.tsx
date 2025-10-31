'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lightbulb,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react'

export interface Step {
  id: string
  description: string
  formula?: string
  explanation: string
  visual?: string
}

export interface Hint {
  level: 1 | 2 | 3
  type: 'conceptual' | 'strategic' | 'procedural' | 'visual' | 'example'
  content: string
  visual?: string
}

interface StepSolverProps {
  problem: string
  steps: Step[]
  hints: Hint[]
  onHintUsed?: (level: number) => void
  onSolutionRevealed?: () => void
  onStepCompleted?: (stepId: string) => void
}

export function StepSolver({
  problem,
  steps,
  hints,
  onHintUsed,
  onSolutionRevealed,
  onStepCompleted,
}: StepSolverProps) {
  const [currentHintLevel, setCurrentHintLevel] = useState<number>(0)
  const [showSolution, setShowSolution] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [showWork, setShowWork] = useState(false)

  const handleHintRequest = (level: 1 | 2 | 3) => {
    setCurrentHintLevel(level)
    onHintUsed?.(level)
  }

  const handleRevealSolution = () => {
    setShowSolution(true)
    setShowWork(true)
    onSolutionRevealed?.()
  }

  const handleStepComplete = (stepId: string) => {
    const newCompleted = new Set(completedSteps)
    newCompleted.add(stepId)
    setCompletedSteps(newCompleted)
    onStepCompleted?.(stepId)
  }

  const currentHint = hints.find(h => h.level === currentHintLevel)
  const allStepsCompleted = completedSteps.size === steps.length

  return (
    <div className="space-y-6">
      {/* Problem Statement */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-6 border border-blue-100 dark:border-blue-900">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Problem
            </h3>
            <p className="text-lg font-semibold text-blue-950 dark:text-blue-50">
              {problem}
            </p>
          </div>
        </div>
      </div>

      {/* Hint System */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Need help? Try hints first
          </h4>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((level) => (
              <motion.button
                key={level}
                onClick={() => handleHintRequest(level as 1 | 2 | 3)}
                disabled={currentHintLevel >= level}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  currentHintLevel >= level
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Hint {level}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Current Hint Display */}
        <AnimatePresence mode="wait">
          {currentHint && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-amber-900 dark:text-amber-100 uppercase tracking-wide">
                      {currentHint.type} hint
                    </span>
                    <span className="px-2 py-0.5 bg-amber-200 dark:bg-amber-800 rounded text-xs font-medium text-amber-900 dark:text-amber-100">
                      Level {currentHint.level}
                    </span>
                  </div>
                  <p className="text-sm text-amber-950 dark:text-amber-50">
                    {currentHint.content}
                  </p>
                  {currentHint.visual && (
                    <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-amber-200 dark:border-amber-800">
                      <pre className="text-xs font-mono text-amber-900 dark:text-amber-100">
                        {currentHint.visual}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Show Work Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowWork(!showWork)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {showWork ? (
            <>
              <EyeOff className="w-4 h-4" />
              Hide Steps
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Show Steps
            </>
          )}
        </button>

        {!showSolution && (
          <motion.button
            onClick={handleRevealSolution}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white text-sm font-medium transition-all shadow-lg shadow-purple-500/30"
          >
            Show Full Solution
          </motion.button>
        )}
      </div>

      {/* Step-by-Step Solution */}
      <AnimatePresence>
        {showWork && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {steps.map((step, index) => {
              const isCompleted = completedSteps.has(step.id)
              const isRevealed = showSolution || isCompleted

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-white dark:bg-gray-900 rounded-xl p-4 border-2 transition-all ${
                    isCompleted
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                      : isRevealed
                      ? 'border-blue-200 dark:border-blue-800'
                      : 'border-gray-200 dark:border-gray-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Step Number */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      {/* Step Description */}
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {step.description}
                        </p>
                        {!isCompleted && isRevealed && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleStepComplete(step.id)}
                            className="flex-shrink-0 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            Got it!
                          </motion.button>
                        )}
                      </div>

                      {/* Formula (if revealed) */}
                      <AnimatePresence>
                        {isRevealed && step.formula && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800"
                          >
                            <pre className="text-sm font-mono text-blue-900 dark:text-blue-100">
                              {step.formula}
                            </pre>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Explanation (if revealed) */}
                      <AnimatePresence>
                        {isRevealed && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-sm text-gray-600 dark:text-gray-400"
                          >
                            {step.explanation}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      {/* Visual Aid (if available and revealed) */}
                      <AnimatePresence>
                        {isRevealed && step.visual && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800"
                          >
                            <pre className="text-xs font-mono text-purple-900 dark:text-purple-100">
                              {step.visual}
                            </pre>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Progress Indicator */}
                    {!isRevealed && (
                      <div className="flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Celebration */}
      <AnimatePresence>
        {allStepsCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4"
            >
              <CheckCircle2 className="w-8 h-8" />
            </motion.div>
            <h3 className="text-xl font-bold mb-2">Excellent Work!</h3>
            <p className="text-green-100">
              You&apos;ve completed all steps. Great job understanding the solution!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
