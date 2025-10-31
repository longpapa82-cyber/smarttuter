'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export interface VoiceWaveformProps {
  isActive: boolean
  amplitude?: number
  color?: string
  bars?: number
  className?: string
}

/**
 * Real-time audio waveform visualization
 *
 * Features:
 * - 60 FPS smooth animation using Canvas API
 * - Amplitude-reactive bars
 * - Blue-to-purple gradient
 * - Optimized rendering with RAF
 */
export function VoiceWaveform({
  isActive = false,
  amplitude = 0.5,
  color = 'blue',
  bars = 32,
  className = '',
}: VoiceWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const barsDataRef = useRef<number[]>(new Array(bars).fill(0))

  // Color gradients
  const gradients = {
    blue: { start: '#3B82F6', end: '#8B5CF6' },
    green: { start: '#10B981', end: '#14B8A6' },
    purple: { start: '#8B5CF6', end: '#EC4899' },
  }

  const currentGradient = gradients[color as keyof typeof gradients] || gradients.blue

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size (high DPI support)
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const barWidth = width / bars
    const barGap = barWidth * 0.2

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, width, 0)
    gradient.addColorStop(0, currentGradient.start)
    gradient.addColorStop(1, currentGradient.end)

    let phase = 0

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      if (isActive) {
        // Update bars with smooth transitions
        for (let i = 0; i < bars; i++) {
          // Create wave pattern using sine
          const waveOffset = Math.sin(phase + i * 0.5) * 0.3
          const targetHeight = (amplitude + waveOffset) * 0.8

          // Smooth interpolation
          barsDataRef.current[i] += (targetHeight - barsDataRef.current[i]) * 0.15

          // Draw bar
          const x = i * barWidth
          const barHeight = Math.max(
            barsDataRef.current[i] * height * 0.8,
            height * 0.1
          )
          const y = (height - barHeight) / 2

          // Rounded rectangle
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.roundRect(
            x + barGap / 2,
            y,
            barWidth - barGap,
            barHeight,
            barWidth / 4
          )
          ctx.fill()
        }

        phase += 0.1
      } else {
        // Fade out animation
        for (let i = 0; i < bars; i++) {
          barsDataRef.current[i] *= 0.9

          if (barsDataRef.current[i] > 0.01) {
            const x = i * barWidth
            const barHeight = barsDataRef.current[i] * height * 0.8
            const y = (height - barHeight) / 2

            ctx.fillStyle = gradient
            ctx.globalAlpha = barsDataRef.current[i]
            ctx.beginPath()
            ctx.roundRect(
              x + barGap / 2,
              y,
              barWidth - barGap,
              barHeight,
              barWidth / 4
            )
            ctx.fill()
            ctx.globalAlpha = 1
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive, amplitude, bars, currentGradient])

  return (
    <motion.canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0.3 }}
      transition={{ duration: 0.3 }}
      aria-hidden="true"
    />
  )
}

/**
 * Circular waveform visualization (for microphone button)
 */
export function VoiceWaveformCircular({
  isActive = false,
  amplitude = 0.5,
  size = 120,
  className = '',
}: {
  isActive: boolean
  amplitude?: number
  size?: number
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const barsDataRef = useRef<number[]>(new Array(40).fill(0))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const centerX = size / 2
    const centerY = size / 2
    const radius = size * 0.35
    const bars = barsDataRef.current.length

    let phase = 0

    const animate = () => {
      ctx.clearRect(0, 0, size, size)

      if (isActive) {
        for (let i = 0; i < bars; i++) {
          // Wave pattern
          const angle = (i / bars) * Math.PI * 2
          const waveOffset = Math.sin(phase + i * 0.3) * 0.2
          const targetHeight = (amplitude + waveOffset) * 0.6

          // Smooth interpolation
          barsDataRef.current[i] += (targetHeight - barsDataRef.current[i]) * 0.2

          // Calculate bar position
          const barHeight = barsDataRef.current[i] * radius * 0.5
          const innerRadius = radius - barHeight / 2
          const outerRadius = radius + barHeight / 2

          const x1 = centerX + Math.cos(angle) * innerRadius
          const y1 = centerY + Math.sin(angle) * innerRadius
          const x2 = centerX + Math.cos(angle) * outerRadius
          const y2 = centerY + Math.sin(angle) * outerRadius

          // Gradient for each bar
          const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
          gradient.addColorStop(0, '#3B82F6')
          gradient.addColorStop(1, '#8B5CF6')

          // Draw bar
          ctx.strokeStyle = gradient
          ctx.lineWidth = (Math.PI * 2 * radius) / bars * 0.7
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()
        }

        phase += 0.08
      } else {
        // Fade out
        for (let i = 0; i < bars; i++) {
          barsDataRef.current[i] *= 0.85

          if (barsDataRef.current[i] > 0.01) {
            const angle = (i / bars) * Math.PI * 2
            const barHeight = barsDataRef.current[i] * radius * 0.5
            const innerRadius = radius - barHeight / 2
            const outerRadius = radius + barHeight / 2

            const x1 = centerX + Math.cos(angle) * innerRadius
            const y1 = centerY + Math.sin(angle) * innerRadius
            const x2 = centerX + Math.cos(angle) * outerRadius
            const y2 = centerY + Math.sin(angle) * outerRadius

            ctx.strokeStyle = `rgba(59, 130, 246, ${barsDataRef.current[i]})`
            ctx.lineWidth = (Math.PI * 2 * radius) / bars * 0.7
            ctx.lineCap = 'round'
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.stroke()
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive, amplitude, size])

  return (
    <motion.canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`absolute inset-0 ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: isActive ? 1 : 0,
        scale: isActive ? 1 : 0.8,
      }}
      transition={{ duration: 0.3 }}
      aria-hidden="true"
    />
  )
}

/**
 * Audio level meter (for settings/debugging)
 */
export function AudioLevelMeter({
  level = 0,
  className = '',
}: {
  level: number
  className?: string
}) {
  // Clamp level between 0 and 1
  const normalizedLevel = Math.max(0, Math.min(1, level))

  return (
    <div
      className={`relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={normalizedLevel * 100}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Audio input level"
    >
      <motion.div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{
          background: 'linear-gradient(90deg, #10B981 0%, #EF4444 100%)',
        }}
        initial={{ width: 0 }}
        animate={{ width: `${normalizedLevel * 100}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  )
}
