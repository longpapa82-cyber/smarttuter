'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface ActionCardProps {
  title: string;
  description: string;
  icon: string;
  gradient: string;
  ctaText: string;
  href: string;
  badge?: {
    text: string;
    color: 'orange' | 'red' | 'green' | 'blue';
  };
  stats?: {
    label: string;
    value: string | number;
  }[];
}

const badgeColors = {
  orange: 'bg-orange-100 text-orange-800',
  red: 'bg-red-100 text-red-800',
  green: 'bg-green-100 text-green-800',
  blue: 'bg-blue-100 text-blue-800',
};

export default function ActionCard({
  title,
  description,
  icon,
  gradient,
  ctaText,
  href,
  badge,
  stats,
}: ActionCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`bg-gradient-to-br ${gradient} rounded-3xl p-8 h-80 flex flex-col justify-between cursor-pointer shadow-xl hover:shadow-2xl transition-all`}
    >
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="text-6xl">{icon}</div>
          {badge && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className={`px-3 py-1 rounded-full text-xs font-medium ${badgeColors[badge.color]}`}
            >
              {badge.text}
            </motion.span>
          )}
        </div>

        <h3 className="text-3xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/90 text-lg">{description}</p>
      </div>

      {/* Stats */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-white/20 backdrop-blur-sm rounded-lg p-3"
            >
              <div className="text-xs text-white/70 mb-1">{stat.label}</div>
              <div className="text-lg font-bold text-white">{stat.value}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* CTA Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-white text-gray-900 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-lg"
      >
        {ctaText}
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </motion.button>
    </motion.div>
  );
}
