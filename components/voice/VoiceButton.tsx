'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'

export interface VoiceButtonProps {
  onTranscript?: (transcript: string) => void
  onError?: (error: string) => void
  language?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'circle' | 'pill'
  showLabel?: boolean
  className?: string
}

type ButtonState = 'idle' | 'listening' | 'processing' | 'error'

/**
 * Voice input button with microphone states and animations
 *
 * States:
 * - Idle: Gray, pulse animation
 * - Listening: Blue, waveform animation
 * - Processing: Purple, spinner
 * - Error: Red, shake animation
 */
export function VoiceButton({
  onTranscript,
  onError,
  language = 'en-US',
  disabled = false,
  size = 'md',
  variant = 'circle',
  showLabel = true,
  className = '',
}: VoiceButtonProps) {
  const [buttonState, setButtonState] = useState<ButtonState>('idle')
  const [isPressed, setIsPressed] = useState(false)

  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error,
  } = useSpeechRecognition({
    language,
    continuous: false,
    interimResults: true,
    onStart: () => {
      setButtonState('listening')
    },
    onEnd: () => {
      setButtonState('processing')
      // Send transcript after a brief delay
      setTimeout(() => {
        if (transcript.trim()) {
          onTranscript?.(transcript.trim())
          resetTranscript()
        }
        setButtonState('idle')
      }, 500)
    },
    onError: (err) => {
      setButtonState('error')
      onError?.(err)
      setTimeout(() => setButtonState('idle'), 2000)
    },
  })

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'w-10 h-10',
      icon: 'w-4 h-4',
      text: 'text-xs',
    },
    md: {
      button: 'w-14 h-14',
      icon: 'w-6 h-6',
      text: 'text-sm',
    },
    lg: {
      button: 'w-16 h-16',
      icon: 'w-8 h-8',
      text: 'text-base',
    },
  }

  const config = sizeConfig[size]

  // State colors and styles
  const stateStyles = {
    idle: {
      bg: 'bg-gray-200 dark:bg-gray-700',
      hover: 'hover:bg-gray-300 dark:hover:bg-gray-600',
      ring: 'ring-gray-300 dark:ring-gray-600',
      text: 'text-gray-600 dark:text-gray-400',
    },
    listening: {
      bg: 'bg-blue-500',
      hover: 'hover:bg-blue-600',
      ring: 'ring-blue-400',
      text: 'text-white',
    },
    processing: {
      bg: 'bg-purple-500',
      hover: 'hover:bg-purple-600',
      ring: 'ring-purple-400',
      text: 'text-white',
    },
    error: {
      bg: 'bg-red-500',
      hover: 'hover:bg-red-600',
      ring: 'ring-red-400',
      text: 'text-white',
    },
  }

  const currentStyle = stateStyles[buttonState]

  // Handle button press (push-to-talk)
  const handleMouseDown = () => {
    if (disabled || !isSupported || buttonState === 'processing') return

    setIsPressed(true)
    startListening()
  }

  const handleMouseUp = () => {
    if (!isPressed) return

    setIsPressed(false)
    if (isListening) {
      stopListening()
    }
  }

  const handleMouseLeave = () => {
    if (isPressed) {
      handleMouseUp()
    }
  }

  // Touch support
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    handleMouseDown()
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    handleMouseUp()
  }

  // Keyboard support (Space key)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' && !isPressed) {
      e.preventDefault()
      handleMouseDown()
    }
  }

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === ' ' && isPressed) {
      e.preventDefault()
      handleMouseUp()
    }
  }

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center gap-2">
        <button
          disabled
          className={`${config.button} ${
            variant === 'circle' ? 'rounded-full' : 'rounded-lg'
          } bg-gray-100 dark:bg-gray-800 flex items-center justify-center cursor-not-allowed opacity-50 ${className}`}
          title="Voice input not supported in this browser"
          aria-label="Voice input not supported"
        >
          <MicOff className={`${config.icon} text-gray-400`} />
        </button>
        {showLabel && (
          <span className={`${config.text} text-gray-400 font-medium`}>
            Not supported
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        disabled={disabled}
        className={`
          ${config.button}
          ${variant === 'circle' ? 'rounded-full' : 'rounded-lg'}
          ${currentStyle.bg}
          ${!disabled && currentStyle.hover}
          ${currentStyle.text}
          flex items-center justify-center
          transition-all duration-200
          focus:outline-none focus:ring-4 ${currentStyle.ring}
          disabled:opacity-50 disabled:cursor-not-allowed
          select-none
          relative overflow-hidden
          ${className}
        `}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        animate={
          buttonState === 'idle' && !isPressed
            ? {
                scale: [1, 1.05, 1],
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }
            : buttonState === 'error'
            ? {
                x: [0, -10, 10, -10, 10, 0],
                transition: {
                  duration: 0.5,
                },
              }
            : {}
        }
        title={
          buttonState === 'idle'
            ? 'Hold to speak'
            : buttonState === 'listening'
            ? 'Listening...'
            : buttonState === 'processing'
            ? 'Processing...'
            : 'Error occurred'
        }
        aria-label={
          buttonState === 'idle'
            ? 'Press and hold to speak'
            : buttonState === 'listening'
            ? 'Listening to your voice'
            : buttonState === 'processing'
            ? 'Processing speech'
            : 'Error in speech recognition'
        }
        aria-pressed={isPressed}
        role="button"
        tabIndex={0}
      >
        {/* Background pulse effect for listening state */}
        {buttonState === 'listening' && (
          <motion.div
            className="absolute inset-0 bg-blue-400 rounded-full"
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{
              opacity: 0,
              scale: 1.5,
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}

        {/* Icon */}
        <AnimatePresence mode="wait">
          {buttonState === 'processing' ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ rotate: { duration: 1, repeat: Infinity, ease: 'linear' } }}
            >
              <Loader2 className={config.icon} />
            </motion.div>
          ) : buttonState === 'error' ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <MicOff className={config.icon} />
            </motion.div>
          ) : (
            <motion.div
              key="mic"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <Mic className={config.icon} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Label */}
      {showLabel && (
        <motion.span
          className={`${config.text} font-medium transition-colors`}
          animate={{
            color:
              buttonState === 'listening'
                ? '#3B82F6'
                : buttonState === 'processing'
                ? '#8B5CF6'
                : buttonState === 'error'
                ? '#EF4444'
                : undefined,
          }}
        >
          {buttonState === 'idle' && 'Hold to speak'}
          {buttonState === 'listening' && 'Listening...'}
          {buttonState === 'processing' && 'Processing...'}
          {buttonState === 'error' && 'Error'}
        </motion.span>
      )}

      {/* Interim transcript display */}
      {interimTranscript && buttonState === 'listening' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-max max-w-xs px-4 py-2 bg-blue-500 text-white text-sm rounded-lg shadow-lg"
        >
          {interimTranscript}
        </motion.div>
      )}

      {/* Error message */}
      {error && buttonState === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-max max-w-xs px-4 py-2 bg-red-500 text-white text-xs rounded-lg shadow-lg"
        >
          {error}
        </motion.div>
      )}
    </div>
  )
}

/**
 * Compact voice button for inline use
 */
export function VoiceButtonCompact({
  onTranscript,
  language = 'en-US',
  className = '',
}: Pick<VoiceButtonProps, 'onTranscript' | 'language' | 'className'>) {
  return (
    <VoiceButton
      onTranscript={onTranscript}
      language={language}
      size="sm"
      variant="circle"
      showLabel={false}
      className={className}
    />
  )
}
