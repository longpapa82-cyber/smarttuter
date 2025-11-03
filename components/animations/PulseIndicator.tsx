"use client";

import { motion } from "framer-motion";

interface PulseIndicatorProps {
  color?: "blue" | "green" | "purple" | "orange" | "red";
  size?: "sm" | "md" | "lg";
  label?: string;
  position?: "inline" | "absolute";
}

const colorClasses = {
  blue: {
    dot: "bg-blue-500",
    ring: "bg-blue-400",
  },
  green: {
    dot: "bg-green-500",
    ring: "bg-green-400",
  },
  purple: {
    dot: "bg-purple-500",
    ring: "bg-purple-400",
  },
  orange: {
    dot: "bg-orange-500",
    ring: "bg-orange-400",
  },
  red: {
    dot: "bg-red-500",
    ring: "bg-red-400",
  },
};

const sizeClasses = {
  sm: {
    dot: "w-2 h-2",
    ring: "w-3 h-3",
  },
  md: {
    dot: "w-3 h-3",
    ring: "w-4 h-4",
  },
  lg: {
    dot: "w-4 h-4",
    ring: "w-5 h-5",
  },
};

export function PulseIndicator({
  color = "green",
  size = "md",
  label,
  position = "inline",
}: PulseIndicatorProps) {
  const containerClass = position === "absolute"
    ? "absolute top-0 right-0"
    : "inline-flex items-center gap-2";

  return (
    <div className={containerClass}>
      <div className="relative flex items-center justify-center">
        {/* Outer pulsing ring */}
        <motion.div
          className={`absolute rounded-full ${colorClasses[color].ring} ${sizeClasses[size].ring} opacity-0`}
          animate={{
            scale: [1, 2, 2],
            opacity: [0.8, 0, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />

        {/* Middle pulsing ring */}
        <motion.div
          className={`absolute rounded-full ${colorClasses[color].ring} ${sizeClasses[size].ring} opacity-0`}
          animate={{
            scale: [1, 1.5, 1.5],
            opacity: [0.6, 0, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.2,
          }}
        />

        {/* Center dot */}
        <div className={`rounded-full ${colorClasses[color].dot} ${sizeClasses[size].dot}`} />
      </div>

      {label && (
        <motion.span
          className="text-sm font-medium text-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {label}
        </motion.span>
      )}
    </div>
  );
}
