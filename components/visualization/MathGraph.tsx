'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ZoomIn, ZoomOut, Maximize2, Download } from 'lucide-react'

interface Point {
  x: number
  y: number
}

interface MathGraphProps {
  equation?: string
  points?: Point[]
  lines?: { start: Point; end: Point; color?: string }[]
  width?: number
  height?: number
  xRange?: [number, number]
  yRange?: [number, number]
  showGrid?: boolean
  showAxes?: boolean
  title?: string
}

export function MathGraph({
  equation,
  points = [],
  lines = [],
  width = 600,
  height = 400,
  xRange = [-10, 10],
  yRange = [-10, 10],
  showGrid = true,
  showAxes = true,
  title,
}: MathGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = width
    canvas.height = height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Calculate scales with zoom and pan
    const xScale = (width / (xRange[1] - xRange[0])) * zoom
    const yScale = (height / (yRange[1] - yRange[0])) * zoom

    const toCanvasX = (x: number) =>
      ((x - xRange[0]) * xScale) + pan.x + (width * (1 - zoom) / 2)
    const toCanvasY = (y: number) =>
      height - ((y - yRange[0]) * yScale) - pan.y - (height * (1 - zoom) / 2)

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1

      // Vertical grid lines
      for (let x = Math.ceil(xRange[0]); x <= xRange[1]; x++) {
        const canvasX = toCanvasX(x)
        if (canvasX >= 0 && canvasX <= width) {
          ctx.beginPath()
          ctx.moveTo(canvasX, 0)
          ctx.lineTo(canvasX, height)
          ctx.stroke()
        }
      }

      // Horizontal grid lines
      for (let y = Math.ceil(yRange[0]); y <= yRange[1]; y++) {
        const canvasY = toCanvasY(y)
        if (canvasY >= 0 && canvasY <= height) {
          ctx.beginPath()
          ctx.moveTo(0, canvasY)
          ctx.lineTo(width, canvasY)
          ctx.stroke()
        }
      }
    }

    // Draw axes
    if (showAxes) {
      ctx.strokeStyle = '#374151'
      ctx.lineWidth = 2

      // X-axis
      const yAxisPos = toCanvasY(0)
      if (yAxisPos >= 0 && yAxisPos <= height) {
        ctx.beginPath()
        ctx.moveTo(0, yAxisPos)
        ctx.lineTo(width, yAxisPos)
        ctx.stroke()

        // X-axis labels
        ctx.fillStyle = '#374151'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        for (let x = Math.ceil(xRange[0]); x <= xRange[1]; x++) {
          if (x === 0) continue
          const canvasX = toCanvasX(x)
          if (canvasX >= 0 && canvasX <= width) {
            ctx.fillText(x.toString(), canvasX, yAxisPos + 15)
          }
        }
      }

      // Y-axis
      const xAxisPos = toCanvasX(0)
      if (xAxisPos >= 0 && xAxisPos <= width) {
        ctx.beginPath()
        ctx.moveTo(xAxisPos, 0)
        ctx.lineTo(xAxisPos, height)
        ctx.stroke()

        // Y-axis labels
        ctx.textAlign = 'right'
        for (let y = Math.ceil(yRange[0]); y <= yRange[1]; y++) {
          if (y === 0) continue
          const canvasY = toCanvasY(y)
          if (canvasY >= 0 && canvasY <= height) {
            ctx.fillText(y.toString(), xAxisPos - 10, canvasY + 4)
          }
        }
      }
    }

    // Draw equation (if provided)
    if (equation) {
      try {
        ctx.strokeStyle = '#3B82F6'
        ctx.lineWidth = 3
        ctx.beginPath()

        let firstPoint = true
        for (let px = 0; px <= width; px++) {
          const x = xRange[0] + ((px - pan.x - (width * (1 - zoom) / 2)) / xScale)
          // Simple evaluation - in production, use a proper math parser
          const y = evaluateEquation(equation, x)

          if (!isNaN(y) && isFinite(y)) {
            const canvasY = toCanvasY(y)
            if (firstPoint) {
              ctx.moveTo(px, canvasY)
              firstPoint = false
            } else {
              ctx.lineTo(px, canvasY)
            }
          }
        }
        ctx.stroke()
      } catch (error) {
        console.error('Error drawing equation:', error)
      }
    }

    // Draw lines
    lines.forEach(line => {
      ctx.strokeStyle = line.color || '#8B5CF6'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(toCanvasX(line.start.x), toCanvasY(line.start.y))
      ctx.lineTo(toCanvasX(line.end.x), toCanvasY(line.end.y))
      ctx.stroke()
    })

    // Draw points
    points.forEach(point => {
      const canvasX = toCanvasX(point.x)
      const canvasY = toCanvasY(point.y)

      // Point circle
      ctx.fillStyle = '#EF4444'
      ctx.beginPath()
      ctx.arc(canvasX, canvasY, 5 * zoom, 0, Math.PI * 2)
      ctx.fill()

      // Point outline
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 2
      ctx.stroke()

      // Point label
      ctx.fillStyle = '#374151'
      ctx.font = `${12 * zoom}px sans-serif`
      ctx.textAlign = 'left'
      ctx.fillText(`(${point.x}, ${point.y})`, canvasX + 10, canvasY - 10)
    })
  }, [equation, points, lines, width, height, xRange, yRange, showGrid, showAxes, zoom, pan])

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 5))
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.5))
  const handleReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `graph-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="space-y-3">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      )}

      <div className="relative inline-block">
        <motion.canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="border-2 border-gray-200 dark:border-gray-700 rounded-xl cursor-move shadow-lg"
          whileHover={{ scale: 1.01 }}
        />

        {/* Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleZoomIn}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleZoomOut}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleReset}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDownload}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            title="Download Image"
          >
            <Download className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </motion.button>
        </div>

        {/* Zoom indicator */}
        <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {(zoom * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {equation && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm font-mono text-blue-900 dark:text-blue-100">
            y = {equation}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Simple equation evaluator
 * In production, use a proper math parser like math.js
 */
function evaluateEquation(equation: string, x: number): number {
  try {
    // Replace x with the value and evaluate
    // This is a simple implementation - use a proper parser in production
    const expression = equation
      .replace(/x/g, `(${x})`)
      .replace(/\^/g, '**')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/abs/g, 'Math.abs')
      .replace(/log/g, 'Math.log')

    // eslint-disable-next-line no-eval
    return eval(expression)
  } catch (error) {
    return NaN
  }
}
