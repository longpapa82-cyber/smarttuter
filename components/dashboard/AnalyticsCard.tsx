'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface AnalyticsCardProps {
  title: string;
  description: string;
  icon: string;
  gradient: string;
  href: string;
  stats?: {
    label: string;
    value: string | number;
  }[];
  badge?: string;
}

export default function AnalyticsCard({
  title,
  description,
  icon,
  gradient,
  href,
  stats,
  badge,
}: AnalyticsCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 h-56 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all cursor-pointer`}
      >
        {/* Header */}
        <div>
          <div className="flex items-start justify-between mb-3">
            <div className="text-4xl">{icon}</div>
            {badge && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white"
              >
                {badge}
              </motion.span>
            )}
          </div>
          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          <p className="text-white/80 text-sm">{description}</p>
        </div>

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="space-y-1 mb-2">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex justify-between text-sm"
              >
                <span className="text-white/70">{stat.label}</span>
                <span className="text-white font-medium">{stat.value}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Link */}
        <div className="text-white text-sm flex items-center gap-1 font-medium">
          보기
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </motion.div>
    </Link>
  );
}
