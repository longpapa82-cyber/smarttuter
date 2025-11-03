"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "./AnimatedCounter";
import { PulseIndicator } from "./PulseIndicator";
import { LucideIcon } from "lucide-react";

interface LiveStatsProps {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  color?: "blue" | "green" | "purple" | "orange" | "pink";
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  isLive?: boolean;
  delay?: number;
}

const colorClasses = {
  blue: "from-blue-500 to-indigo-600",
  green: "from-green-500 to-emerald-600",
  purple: "from-purple-500 to-pink-600",
  orange: "from-orange-500 to-amber-600",
  pink: "from-pink-500 to-rose-600",
};

const trendColors = {
  up: "text-green-600",
  down: "text-red-600",
  neutral: "text-gray-600",
};

const trendSymbols = {
  up: "↑",
  down: "↓",
  neutral: "→",
};

export function LiveStats({
  icon: Icon,
  label,
  value,
  suffix = "",
  prefix = "",
  color = "blue",
  trend = "neutral",
  trendValue,
  isLive = false,
  delay = 0,
}: LiveStatsProps) {
  return (
    <motion.div
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      {/* Background gradient effect */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full blur-2xl`} />

      {/* Live indicator */}
      {isLive && (
        <div className="absolute top-4 right-4">
          <PulseIndicator color="green" size="sm" />
        </div>
      )}

      <div className="relative">
        {/* Icon */}
        <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} bg-opacity-10 mb-4`}>
          <Icon className={`w-6 h-6 bg-gradient-to-br ${colorClasses[color]} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent' }} />
        </div>

        {/* Label */}
        <div className="text-sm text-gray-600 mb-2">{label}</div>

        {/* Value with animation */}
        <div className="flex items-baseline gap-2">
          <AnimatedCounter
            value={value}
            suffix={suffix}
            prefix={prefix}
            duration={2}
            delay={delay + 0.3}
            className="text-3xl font-bold text-gray-900"
          />

          {/* Trend indicator */}
          {trendValue && (
            <motion.span
              className={`text-sm font-semibold ${trendColors[trend]}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.6, duration: 0.3 }}
            >
              {trendSymbols[trend]} {trendValue}
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
