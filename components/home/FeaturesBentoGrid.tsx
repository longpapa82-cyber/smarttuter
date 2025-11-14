'use client';

import { motion } from 'framer-motion';
import {
  BookOpen,
  Calculator,
  Beaker,
  Landmark,
  Target,
  Zap,
  Brain,
  Mic,
  BarChart3,
  Trophy,
  Clock,
  Heart,
  Sparkles,
} from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  size: 'small' | 'medium' | 'large';
  badge?: string;
}

function FeatureCard({ title, description, icon, gradient, size, badge }: FeatureCardProps) {
  const sizeClasses = {
    small: 'md:col-span-1 md:row-span-1',
    medium: 'md:col-span-1 md:row-span-2',
    large: 'md:col-span-2 md:row-span-1',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -100px 0px' }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative group ${sizeClasses[size]} min-h-[200px] rounded-3xl p-6 sm:p-8 ${gradient} overflow-hidden shadow-lg hover:shadow-2xl`}
    >
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all duration-500"></div>

        {/* Badge */}
        {badge && (
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-white flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {badge}
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
              {icon}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
              {title}
            </h3>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed">
              {description}
            </p>
          </div>

        </div>
      </motion.div>
  );
}

export function FeaturesBentoGrid() {
  const features = [
    {
      title: 'AI 튜터 (5과목)',
      description: '영어, 수학, 과학, 사회, 국어 - 실시간 음성/채팅으로 개인 맞춤형 학습',
      icon: <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-white" />,
      gradient: 'bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600',
      size: 'small' as const,
      badge: 'CORE',
    },
    {
      title: '마이크로러닝',
      description: '5-10분 집중 학습으로 효율적인 시간 활용',
      icon: <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-white" />,
      gradient: 'bg-gradient-to-br from-purple-500 to-pink-600',
      size: 'small' as const,
      badge: 'NEW',
    },
    {
      title: 'AI 퀴즈',
      description: '맞춤형 문제 생성과 즉각적인 피드백',
      icon: <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-white" />,
      gradient: 'bg-gradient-to-br from-indigo-500 to-blue-600',
      size: 'small' as const,
      badge: 'HOT',
    },
    {
      title: '플래시카드',
      description: 'SM-2 알고리즘 기반 효율적인 암기 학습',
      icon: <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-white" />,
      gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      size: 'small' as const,
    },
    {
      title: '간격 반복 학습',
      description: '과학적으로 입증된 장기 기억 강화 시스템',
      icon: <Target className="w-7 h-7 sm:w-8 sm:h-8 text-white" />,
      gradient: 'bg-gradient-to-br from-orange-500 to-red-600',
      size: 'small' as const,
    },
    {
      title: '감정 분석',
      description: '학습 감정 트렌드 분석으로 최적의 학습 환경 조성',
      icon: <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-white" />,
      gradient: 'bg-gradient-to-br from-pink-500 to-rose-600',
      size: 'small' as const,
      badge: 'AI',
    },
    {
      title: '발음 연습',
      description: 'AI 음성 인식으로 정확한 발음 교정',
      icon: <Mic className="w-7 h-7 sm:w-8 sm:h-8 text-white" />,
      gradient: 'bg-gradient-to-br from-green-500 to-emerald-600',
      size: 'small' as const,
    },
    {
      title: '수학 시각화',
      description: '인터랙티브 그래프로 개념 이해도 향상',
      icon: <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 text-white" />,
      gradient: 'bg-gradient-to-br from-orange-500 to-amber-600',
      size: 'small' as const,
    },
    {
      title: '게이미피케이션',
      description: '레벨, 배지, 리더보드로 동기부여 극대화',
      icon: <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-white" />,
      gradient: 'bg-gradient-to-br from-yellow-500 via-yellow-600 to-orange-600',
      size: 'small' as const,
      badge: 'POPULAR',
    },
  ];

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
            모든 학습 도구가 한곳에
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            AI Park은 최신 AI 기술과 검증된 학습 방법론을 결합하여<br className="hidden sm:block" />
            당신의 학습 목표 달성을 돕습니다
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 auto-rows-[minmax(200px,auto)]">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
