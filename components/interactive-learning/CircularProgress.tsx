'use client';

import { motion } from 'framer-motion';

interface CircularProgressProps {
  value: number; // 0-100
  size?: number; // diameter in pixels
  strokeWidth?: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'green' | 'blue' | 'purple' | 'gradient';
  className?: string;
}

export function CircularProgress({
  value,
  size = 200,
  strokeWidth = 12,
  label,
  showPercentage = true,
  color = 'gradient',
  className = '',
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value, 0), 100);
  const offset = circumference - (progress / 100) * circumference;

  // Color configurations
  const colorConfig = {
    green: {
      stroke: 'stroke-green-500',
      fill: 'fill-green-500',
      gradient: null,
    },
    blue: {
      stroke: 'stroke-blue-500',
      fill: 'fill-blue-500',
      gradient: null,
    },
    purple: {
      stroke: 'stroke-purple-500',
      fill: 'fill-purple-500',
      gradient: null,
    },
    gradient: {
      stroke: 'stroke-url(#progress-gradient)',
      fill: 'fill-url(#progress-gradient)',
      gradient: (
        <defs>
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      ),
    },
  };

  const currentColor = colorConfig[color];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {currentColor.gradient}

        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={currentColor.stroke}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: 1.5,
            ease: 'easeOut',
          }}
          style={{
            strokeDasharray: circumference,
          }}
        />

        {/* Center text */}
        <g className="transform rotate-90" transform={`translate(${size / 2}, ${size / 2})`}>
          {showPercentage && (
            <text
              x="0"
              y="0"
              textAnchor="middle"
              dominantBaseline="central"
              className="text-4xl font-bold fill-gray-900 dark:fill-white"
            >
              {Math.round(progress)}%
            </text>
          )}
        </g>
      </svg>

      {label && (
        <div className="mt-4 text-center">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</p>
        </div>
      )}
    </div>
  );
}
