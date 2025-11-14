'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Calculator,
  Zap,
  Target,
  TrendingUp,
  Users,
  Award,
} from 'lucide-react';

export function HeroContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleCTAClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // 로그아웃 상태: 게스트 모드로 체험 시작 (7일 무료)
    if (!isAuthenticated) {
      window.location.href = '/onboarding/quick';
      return;
    }

    // 로그인 상태: 서버에서 프로필 확인
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const { user } = await response.json();

        // 프로필이 완성되어 있는지 확인 (gradeLevel과 gradeDetail이 모두 있어야 함)
        const hasCompleteProfile = user?.gradeLevel && user?.gradeDetail;
        window.location.href = hasCompleteProfile ? '/dashboard' : '/onboarding/quick';
      } else {
        // API 실패 시 온보딩으로 이동
        window.location.href = '/onboarding/quick';
      }
    } catch (error) {
      console.error('프로필 확인 실패:', error);
      // 에러 발생 시 온보딩으로 이동
      window.location.href = '/onboarding/quick';
    }
  };

  const scrollToFeatures = () => {
    const newsletterSection = document.getElementById('newsletter');
    if (newsletterSection) {
      newsletterSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Mouse tracking for parallax effect with debouncing for better performance (INP optimization)
  useEffect(() => {
    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId !== null) return;

      rafId = requestAnimationFrame(() => {
        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth - 0.5) * 20;
        const y = (clientY / window.innerHeight - 0.5) * 20;
        setMousePosition({ x, y });
        rafId = null;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  // Floating particles
  const particles = [
    { icon: BookOpen, color: 'text-blue-400', delay: 0 },
    { icon: Calculator, color: 'text-green-400', delay: 0.2 },
    { icon: Zap, color: 'text-yellow-400', delay: 0.4 },
    { icon: Target, color: 'text-pink-400', delay: 0.6 },
    { icon: Award, color: 'text-purple-400', delay: 0.8 },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      {/* Floating Particles */}
      {particles.map((particle, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
          }}
          transition={{
            duration: 5 + Math.random() * 3,
            repeat: Infinity,
            delay: particle.delay,
          }}
          style={{
            position: 'absolute',
            left: `${10 + index * 20}%`,
            top: `${20 + index * 15}%`,
            transform: `translate(${mousePosition.x * (index + 1) * 0.1}px, ${mousePosition.y * (index + 1) * 0.1}px)`,
          }}
          className="hidden lg:block"
        >
          <particle.icon className={`w-8 h-8 ${particle.color} drop-shadow-lg`} />
        </motion.div>
      ))}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-white relative">
        {/* Badge with Sparkle */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block mb-4 sm:mb-6"
        >
          <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-xs sm:text-sm font-semibold inline-flex items-center gap-2 border border-white/30 shadow-lg">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            AI 기반 개인 맞춤 학습
          </span>
        </motion.div>

        {/* Main Headline with Motion Typography */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-4 sm:mb-6"
          style={{
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
          }}
        >
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-block"
          >
            당신만의 튜터{' '}
          </motion.span>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="inline-block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-extrabold"
          >
            AI Park
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="inline-block"
          >
            {' '}과 함께
          </motion.span>
          <br />
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent inline-block"
          >
            스마트하게 학습하세요
          </motion.span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="text-base sm:text-xl lg:text-2xl mb-6 sm:mb-8 text-white/90 max-w-3xl mx-auto"
        >
          초등학교부터 대학교까지, 영어·수학·과학·사회·국어를
          <br className="hidden sm:block" />
          실시간 음성 및 채팅으로 배우는 차세대 학습 플랫폼
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12"
        >
          <Link href="/onboarding/quick" onClick={handleCTAClick}>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(99, 102, 241, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full font-semibold text-base sm:text-lg shadow-xl inline-flex items-center gap-2 border-2 border-white/20"
            >
              {isLoading ? '로딩 중...' : '무료로 시작하기'}
              {!isLoading && <TrendingUp className="w-5 h-5" />}
            </motion.button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToFeatures}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-white/20 backdrop-blur-md border-2 border-white/50 text-white rounded-full font-semibold text-base sm:text-lg"
          >
            더 알아보기
          </motion.button>
        </motion.div>

        {/* Enhanced Stats with Icons and Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-8"
        >
          <AnimatedStat
            icon={<Users className="w-5 h-5" />}
            value="50,000+"
            label="누적 학습자"
            delay={1.6}
          />
          <AnimatedStat
            icon={<Target className="w-5 h-5" />}
            value="2M+"
            label="학습 시간(분)"
            delay={1.7}
          />
          <AnimatedStat
            icon={<Award className="w-5 h-5" />}
            value="98%"
            label="만족도"
            delay={1.8}
          />
          <AnimatedStat
            icon={<TrendingUp className="w-5 h-5" />}
            value="85%"
            label="성적 향상"
            delay={1.9}
          />
        </motion.div>
      </div>
    </div>
  );
}

// Animated Stat Component
function AnimatedStat({
  icon,
  value,
  label,
  delay,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1, y: -5 }}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col items-center gap-2 p-3 sm:p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg min-w-[100px] sm:min-w-[120px]"
    >
      <div className="text-white/80">{icon}</div>
      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{value}</div>
      <div className="text-xs sm:text-sm text-white/70">{label}</div>
    </motion.div>
  );
}
