'use client'

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { VideoModal } from "@/components/demo/VideoModal";
import { HeroVideoSection } from "@/components/home/HeroVideoSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { AIDifferentiationSection } from "@/components/home/AIDifferentiationSection";

export function HomeClient() {
  const { isAuthenticated, isLoading, navigateProtected } = useAuth();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <main>
        {/* NEW: Hero Video Section */}
        <HeroVideoSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* AI Differentiation Section */}
        <AIDifferentiationSection />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🎓</span>
                </div>
                <span className="text-xl font-bold">AI Park</span>
              </div>
              <p className="text-gray-400">
                AI 기반 개인 맞춤형 학습 플랫폼
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm">서비스</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/dashboard/english" className="hover:text-white transition-colors">
                    English
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/math" className="hover:text-white transition-colors">
                    Math
                  </Link>
                </li>
                <li>
                  <Link href="/tutor/korean" className="hover:text-white transition-colors">
                    Korean 📚
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/science" className="hover:text-white transition-colors">
                    Science
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/social" className="hover:text-white transition-colors">
                    Social
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm">대시보드</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    전체 대시보드
                  </Link>
                </li>
                <li>
                  <Link href="/learning-report" className="hover:text-white transition-colors">
                    학습 리포트
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    홈으로
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm">지원</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/onboarding/quick" className="hover:text-white transition-colors">
                    퀵 온보딩
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    도움말
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    개인정보처리방침
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AI Park. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* 비디오 모달 */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl="/videos/demo.mp4"
        title="AI 튜터와 스마트 학습 체험"
        description="실시간 음성/채팅으로 수학과 영어를 배우는 과정을 확인하세요"
        ctaButton={{
          text: "무료로 시작하기 →",
          href: "/onboarding/quick"
        }}
      />
    </div>
  );
}
