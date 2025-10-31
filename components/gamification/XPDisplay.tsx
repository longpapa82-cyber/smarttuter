'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, TrendingUp, Award } from 'lucide-react'

interface XPDisplayProps {
  currentXP: number
  currentLevel: number
  xpForNextLevel: number
  recentXPGain?: number
  showAnimation?: boolean
}

export function XPDisplay({
  currentXP,
  currentLevel,
  xpForNextLevel,
  recentXPGain = 0,
  showAnimation = false,
}: XPDisplayProps) {
  const [displayXP, setDisplayXP] = useState(currentXP - recentXPGain)
  const [showGainAnimation, setShowGainAnimation] = useState(false)

  const progress = (currentXP / xpForNextLevel) * 100
  const previousProgress = ((currentXP - recentXPGain) / xpForNextLevel) * 100

  useEffect(() => {
    if (showAnimation && recentXPGain > 0) {
      setShowGainAnimation(true)

      // Animate counter
      const duration = 1000 // 1 second
      const steps = 30
      const increment = recentXPGain / steps
      let currentStep = 0

      const interval = setInterval(() => {
        currentStep++
        setDisplayXP(prev => {
          const newValue = Math.min(prev + increment, currentXP)
          if (currentStep >= steps) {
            clearInterval(interval)
            return currentXP
          }
          return newValue
        })
      }, duration / steps)

      // Hide gain text after animation
      setTimeout(() => setShowGainAnimation(false), 2000)

      return () => clearInterval(interval)
    } else {
      setDisplayXP(currentXP)
    }
  }, [currentXP, recentXPGain, showAnimation])

  return (
    <div className="relative">
      {/* XP Gain Floating Animation */}
      <AnimatePresence>
        {showGainAnimation && recentXPGain > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -40, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.8 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none z-50"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
              <Zap className="w-4 h-4" />
              +{recentXPGain} XP
            </div>
            {/* Particle effects */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  x: (Math.random() - 0.5) * 60,
                  y: -20 - Math.random() * 30,
                }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main XP Display Card */}
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center justify-between mb-3">
          {/* Level Badge */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900 border-2 border-white dark:border-gray-900">
                {currentLevel}
              </div>
            </div>
            <div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Level {currentLevel}
              </p>
              <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                {Math.floor(displayXP).toLocaleString()} XP
              </p>
            </div>
          </div>

          {/* Next Level Info */}
          <div className="text-right">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Next Level
            </p>
            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
              {xpForNextLevel.toLocaleString()} XP
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="h-3 bg-emerald-200 dark:bg-emerald-900 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: `${previousProgress}%` }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full relative overflow-hidden"
            >
              {/* Shimmer effect */}
              <motion.div
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.div>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {progress.toFixed(0)}%
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              {(xpForNextLevel - currentXP).toLocaleString()} to go
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Compact XP display for navigation bar or header
 */
export function XPBadge({
  currentXP,
  currentLevel,
  size = 'md',
}: {
  currentXP: number
  currentLevel: number
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <div
      className={`inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full font-bold shadow-lg ${sizeClasses[size]}`}
    >
      <Award className={iconSizes[size]} />
      <span>Lv.{currentLevel}</span>
      <span className="opacity-75">•</span>
      <Zap className={iconSizes[size]} />
      <span>{currentXP.toLocaleString()}</span>
    </div>
  )
}
