'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Users, Clock, Star, TrendingUp } from 'lucide-react';

interface StatItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  delay: number;
}

function StatItem({ icon, value, label, delay }: StatItemProps) {
  const [count, setCount] = useState(0);
  const targetValue = parseInt(value.replace(/[^0-9]/g, ''));
  const suffix = value.replace(/[0-9]/g, '');

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = targetValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetValue) {
        setCount(targetValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [targetValue]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col items-center gap-2 p-4 sm:p-6"
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
        {icon}
      </div>
      <div className="text-center">
        <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          {count.toLocaleString()}{suffix}
        </div>
        <div className="text-sm sm:text-base text-gray-600 font-medium mt-1">
          {label}
        </div>
      </div>
    </motion.div>
  );
}

export function StatisticsBar() {
  const stats = [
    {
      icon: <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />,
      value: '50000+',
      label: '누적 학습자',
    },
    {
      icon: <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-white" />,
      value: '2000000+',
      label: '총 학습 시간 (분)',
    },
    {
      icon: <Star className="w-6 h-6 sm:w-7 sm:h-7 text-white" />,
      value: '98%',
      label: '학습자 만족도',
    },
    {
      icon: <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />,
      value: '85%',
      label: '학습 성취도 향상',
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/2 left-1/2 w-64 h-64 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
            AI Park과 함께하는 학습 여정
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            전 세계 수많은 학습자들이 AI Park과 함께 성장하고 있습니다
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 sm:mt-16 text-center"
        >
          <p className="text-sm sm:text-base text-gray-500 mb-4">
            전 세계 학교와 교육기관에서 신뢰하는 AI 학습 플랫폼
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12 opacity-60">
            {/* Placeholder for partner logos - replace with actual logos */}
            <div className="text-gray-400 font-semibold text-sm sm:text-base">초등학교</div>
            <div className="text-gray-400 font-semibold text-sm sm:text-base">중학교</div>
            <div className="text-gray-400 font-semibold text-sm sm:text-base">고등학교</div>
            <div className="text-gray-400 font-semibold text-sm sm:text-base">대학교</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
