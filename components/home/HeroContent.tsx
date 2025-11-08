'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export function HeroContent() {
  const { isAuthenticated, isLoading } = useAuth();

  const handleCTAClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // 로그아웃 상태: 로그인 페이지로 이동
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    // 로그인 상태: 프로필 확인
    if (typeof window !== 'undefined') {
      const hasProfile = localStorage.getItem('aipark_user_profile');
      // 프로필 없으면 온보딩, 있으면 대시보드
      window.location.href = hasProfile ? '/dashboard' : '/onboarding/quick';
    }
  };

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-white">
        {/* Badge */}
        <div className="inline-block mb-4 sm:mb-6 animate-fade-in">
          <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-xs sm:text-sm font-semibold">
            ✨ AI 기반 개인 맞춤 학습
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-4 sm:mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          당신만의 튜터 AI Park과 함께
          <br />
          <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            스마트하게 학습하세요
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-xl lg:text-2xl mb-6 sm:mb-8 text-white/90 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          초등학교부터 대학교까지, 수학과 영어를 실시간 음성 및 채팅으로 배우는
          <br className="hidden sm:block" />
          차세대 학습 플랫폼입니다.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <Link
            href="/onboarding/quick"
            onClick={handleCTAClick}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full font-semibold text-base sm:text-lg hover:shadow-2xl hover:scale-105 transform transition-all"
          >
            {isLoading ? '로딩 중...' : '무료로 시작하기 →'}
          </Link>
          <button
            onClick={scrollToFeatures}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-white/20 backdrop-blur-md border-2 border-white/50 text-white rounded-full font-semibold text-base sm:text-lg hover:bg-white/30 hover:scale-105 transition-all"
          >
            더 알아보기
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <div className="text-white">
            <div className="text-2xl sm:text-3xl font-bold">10,000+</div>
            <div className="text-xs sm:text-sm text-white/80">활성 학습자</div>
          </div>
          <div className="text-white">
            <div className="text-2xl sm:text-3xl font-bold">50,000+</div>
            <div className="text-xs sm:text-sm text-white/80">해결된 문제</div>
          </div>
          <div className="text-white">
            <div className="text-2xl sm:text-3xl font-bold">4.9/5</div>
            <div className="text-xs sm:text-sm text-white/80">만족도</div>
          </div>
        </div>
      </div>
    </div>
  );
}
