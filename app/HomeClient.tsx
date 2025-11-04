'use client'

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export function HomeClient() {
  const { isAuthenticated, isLoading, navigateProtected } = useAuth();

  const handleCTAClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // 비로그인 상태: 빠른 온보딩으로 바로 이동 (게스트 모드)
    if (!isAuthenticated) {
      window.location.href = '/onboarding/quick';
      return;
    }

    // 로그인 상태: 프로필 확인
    if (typeof window !== 'undefined') {
      const hasProfile = localStorage.getItem('aipark_user_profile');
      window.location.href = hasProfile ? '/dashboard' : '/onboarding/quick';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-block">
                <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                  ✨ AI 기반 개인 맞춤 학습
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight" style={{ color: '#111827' }}>
                당신만의 AI 튜터와
                <br />
                <span className="gradient-text">스마트하게 학습하세요</span>
              </h1>

              <p className="text-xl leading-relaxed" style={{ color: '#374151' }}>
                초등학교부터 대학교까지, 수학과 영어를 실시간 음성 및 채팅으로 배우는
                차세대 학습 플랫폼입니다.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/onboarding/quick"
                  onClick={handleCTAClick}
                  className="px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full font-semibold text-lg hover:shadow-2xl hover:scale-105 transform transition-all text-center"
                >
                  {isLoading ? "로딩 중..." : "무료로 시작하기 →"}
                </Link>
                <a href="#how-it-works" className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-full font-semibold text-lg hover:border-primary-500 hover:text-primary-600 transition-all text-center">
                  데모 영상 보기 ▶
                </a>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-primary-600">10,000+</div>
                  <div className="text-sm" style={{ color: '#4B5563' }}>활성 학습자</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-secondary-600">50,000+</div>
                  <div className="text-sm" style={{ color: '#4B5563' }}>해결된 문제</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent-600">4.9/5</div>
                  <div className="text-sm" style={{ color: '#4B5563' }}>만족도</div>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image/Animation */}
            <div className="relative">
              <div className="relative w-full h-[500px] bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-3xl flex items-center justify-center animate-float">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl opacity-10 blur-3xl"></div>
                <div className="relative text-center space-y-6 p-8">
                  <div className="text-8xl animate-bounce-slow">🤖</div>
                  <div className="text-2xl font-bold" style={{ color: '#1F2937' }}>AI 튜터가 함께합니다</div>
                  <div className="flex justify-center space-x-4">
                    <div className="px-4 py-2 bg-white rounded-full shadow-lg" style={{ color: '#111827' }}>📚 수학</div>
                    <div className="px-4 py-2 bg-white rounded-full shadow-lg" style={{ color: '#111827' }}>🗣️ 영어</div>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-10 -right-10 w-48 p-4 bg-white rounded-2xl shadow-xl animate-float" style={{ animationDelay: "0.5s" }}>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    ✅
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: '#111827' }}>정답률</div>
                    <div className="text-2xl font-bold text-green-600">95%</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-10 -left-10 w-48 p-4 bg-white rounded-2xl shadow-xl animate-float" style={{ animationDelay: "1s" }}>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    ⚡
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: '#111827' }}>학습 시간</div>
                    <div className="text-2xl font-bold text-blue-600">2.5h</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="gradient-text">핵심 기능</span>
            </h2>
            <p className="text-xl text-gray-600">
              전 세계 최고의 튜터링 서비스 기능을 한곳에
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-gradient-to-br from-primary-50 to-white rounded-2xl hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                🎙️
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">실시간 음성 대화</h3>
              <p className="text-gray-700 leading-relaxed">
                자연스러운 음성 대화로 영어 회화를 연습하고 발음 교정을 받으세요.
                저지연 음성 인식 기술로 실시간 피드백을 제공합니다.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-gradient-to-br from-secondary-50 to-white rounded-2xl hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-secondary-500 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                📐
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">수학 문제 풀이</h3>
              <p className="text-gray-700 leading-relaxed">
                문제를 촬영하거나 입력하면 단계별 풀이 과정을 설명해드립니다.
                개념 이해부터 응용까지 체계적으로 학습하세요.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-gradient-to-br from-accent-50 to-white rounded-2xl hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-accent-500 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                🎯
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">맞춤형 학습</h3>
              <p className="text-gray-700 leading-relaxed">
                학교급과 현재 수준에 맞는 개인화된 학습 경로를 제공합니다.
                AI가 취약점을 분석하고 최적의 학습 콘텐츠를 추천합니다.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 bg-gradient-to-br from-green-50 to-white rounded-2xl hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                📊
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">학습 분석 리포트</h3>
              <p className="text-gray-700 leading-relaxed">
                일일, 주간, 월간 학습 리포트로 성장을 확인하세요.
                시각화된 데이터로 학습 패턴과 향상도를 한눈에 파악합니다.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 bg-gradient-to-br from-pink-50 to-white rounded-2xl hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-pink-500 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                🏆
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">게이미피케이션</h3>
              <p className="text-gray-700 leading-relaxed">
                레벨 시스템, 배지, 학습 스트릭으로 동기부여를 유지하세요.
                재미있게 학습하면서 목표를 달성하세요.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 bg-gradient-to-br from-orange-50 to-white rounded-2xl hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                ⚡
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">즉각적인 피드백</h3>
              <p className="text-gray-700 leading-relaxed">
                질문에 대한 즉시 답변과 정확한 설명을 제공합니다.
                24/7 언제든지 학습할 수 있는 AI 튜터가 대기 중입니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="gradient-text">사용 방법</span>
            </h2>
            <p className="text-xl text-gray-600">
              3단계로 시작하는 간단한 학습
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">학교급 및 과목 선택</h3>
              <p className="text-gray-700">
                초등학교부터 대학교까지 학교급을 선택하고,
                수학 또는 영어 과목을 선택하세요.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">AI 튜터와 대화</h3>
              <p className="text-gray-700">
                음성 또는 채팅으로 질문하고,
                AI 튜터의 맞춤형 설명을 받으세요.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-accent-500 to-primary-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">성장 확인</h3>
              <p className="text-gray-700">
                학습 리포트로 진도와 향상도를 확인하고,
                다음 학습 목표를 설정하세요.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              onClick={handleCTAClick}
              className="inline-block px-10 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full font-semibold text-lg hover:shadow-2xl hover:scale-105 transform transition-all"
            >
              {isLoading ? "로딩 중..." : isAuthenticated ? "대시보드로 이동 →" : "지금 시작하기 →"}
            </Link>
          </div>
        </div>
      </section>

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
              <h4 className="font-semibold mb-4">서비스</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/tutor/english" className="hover:text-white">English Park</Link></li>
                <li><Link href="/tutor/math" className="hover:text-white">Math Park</Link></li>
                <li><Link href="/analytics" className="hover:text-white">학습 리포트</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">회사</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">소개</a></li>
                <li><a href="#" className="hover:text-white">블로그</a></li>
                <li><a href="#" className="hover:text-white">채용</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">지원</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">도움말</a></li>
                <li><a href="#" className="hover:text-white">문의</a></li>
                <li><a href="#" className="hover:text-white">개인정보처리방침</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AI Park. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
