'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface Step {
  id: number;
  icon: string;
  title: string;
  description: string;
  details: string[];
  color: string;
  bgGradient: string;
  iconBg: string;
}

const steps: Step[] = [
  {
    id: 1,
    icon: '👤',
    title: '회원가입 & 프로필 설정',
    description: '간편한 소셜 로그인으로 시작하세요',
    details: [
      'Google/Kakao 소셜 로그인 지원',
      '학교급(초/중/고/대) 선택',
      '학년 및 학습 목표 설정',
      '관심 과목 선택'
    ],
    color: 'from-primary-500 to-secondary-500',
    bgGradient: 'from-primary-50 to-secondary-50',
    iconBg: 'bg-gradient-to-br from-primary-500 to-secondary-500'
  },
  {
    id: 2,
    icon: '📚',
    title: '과목 선택',
    description: '5개 과목 중 학습할 과목을 선택하세요',
    details: [
      '영어 - 실시간 음성 대화 연습',
      '수학 - 문제 풀이 & 개념 학습',
      '과학 - 실험 원리 & 이론 설명',
      '사회 - 역사/지리 맥락 이해',
      '국어 - 문학/문법 심화 학습'
    ],
    color: 'from-secondary-500 to-accent-500',
    bgGradient: 'from-secondary-50 to-accent-50',
    iconBg: 'bg-gradient-to-br from-secondary-500 to-accent-500'
  },
  {
    id: 3,
    icon: '🤖',
    title: 'AI 튜터와 학습',
    description: '음성 또는 채팅으로 자유롭게 질문하세요',
    details: [
      '24/7 실시간 AI 튜터 답변',
      '음성 인식 & TTS 지원',
      '이미지 업로드 문제 풀이',
      '단계별 맞춤 설명 제공'
    ],
    color: 'from-accent-500 to-social-500',
    bgGradient: 'from-accent-50 to-social-50',
    iconBg: 'bg-gradient-to-br from-accent-500 to-social-500'
  },
  {
    id: 4,
    icon: '🎯',
    title: '학습 데이터 분석',
    description: 'AI가 취약점을 분석하고 맞춤 콘텐츠를 추천합니다',
    details: [
      '실시간 학습 진도 추적',
      '취약 개념 자동 분석',
      '개인화된 학습 경로 생성',
      '학습 패턴 시각화'
    ],
    color: 'from-social-500 to-korean-500',
    bgGradient: 'from-social-50 to-korean-50',
    iconBg: 'bg-gradient-to-br from-social-500 to-korean-500'
  },
  {
    id: 5,
    icon: '📊',
    title: '성장 확인 & 리포트',
    description: '일일/주간/월간 학습 리포트로 성장을 확인하세요',
    details: [
      '시각화된 학습 대시보드',
      '과목별 성취도 분석',
      '레벨업 & 배지 획득',
      '학습 스트릭 관리'
    ],
    color: 'from-korean-500 to-primary-500',
    bgGradient: 'from-korean-50 to-primary-50',
    iconBg: 'bg-gradient-to-br from-korean-500 to-primary-500'
  }
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const { isAuthenticated, isLoading } = useAuth();

  const handleCTAClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // 로그아웃 상태: 게스트 모드로 체험 시작
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

  return (
    <section id="how-it-works" className="relative py-20 px-4 bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 overflow-hidden">
      {/* AI Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            <span className="bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
              사용 방법
            </span>
          </h2>
          <p className="text-xl text-gray-300">
            5단계로 시작하는 스마트 학습 여정
          </p>
        </div>

        {/* Interactive Timeline */}
        <div className="grid lg:grid-cols-5 gap-8 mb-12">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="relative"
              onMouseEnter={() => setActiveStep(step.id)}
            >
              {/* Connection Line (Desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary-500/50 to-secondary-500/50 z-0"></div>
              )}

              {/* Step Card */}
              <div
                className={`relative z-10 transition-all duration-500 ${
                  activeStep === step.id
                    ? 'scale-110 -translate-y-2'
                    : 'scale-100 translate-y-0'
                }`}
              >
                {/* Step Number Circle */}
                <div
                  className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-white text-3xl font-bold transition-all duration-500 ${
                    step.iconBg
                  } ${
                    activeStep === step.id
                      ? 'shadow-2xl ring-4 ring-white/50 animate-glow-pulse'
                      : 'shadow-lg'
                  }`}
                >
                  {step.icon}
                </div>

                {/* Step Title */}
                <h3
                  className={`text-center font-bold mb-2 transition-all duration-300 ${
                    activeStep === step.id
                      ? 'text-white text-xl'
                      : 'text-gray-300 text-lg'
                  }`}
                >
                  {step.title}
                </h3>

                {/* Step Number Badge */}
                <div className="text-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold transition-all duration-300 ${
                      activeStep === step.id
                        ? 'bg-white text-gray-900'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    STEP {step.id}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Active Step Details */}
        <div className="mt-12 bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl animate-fade-in-up">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Description */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-5xl">{steps[activeStep - 1].icon}</span>
                <h3 className="text-3xl font-bold text-white">
                  {steps[activeStep - 1].title}
                </h3>
              </div>
              <p className="text-xl text-gray-300 mb-6">
                {steps[activeStep - 1].description}
              </p>

              {/* Details List */}
              <ul className="space-y-3">
                {steps[activeStep - 1].details.map((detail, index) => (
                  <li
                    key={index}
                    className="flex items-start space-x-3 text-gray-200 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                      ✓
                    </span>
                    <span className="text-lg">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: AI Park UI Mockup */}
            <div className="relative">
              <div
                className={`w-full h-80 bg-gradient-to-br ${steps[activeStep - 1].bgGradient} rounded-2xl flex items-center justify-center overflow-hidden group p-4`}
              >
                {/* Step 1: Login/Signup Screen Mockup */}
                {activeStep === 1 && (
                  <div className="w-full h-full bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 backdrop-blur-sm rounded-xl shadow-2xl flex flex-col items-center justify-center p-6 group-hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-200/30 to-secondary-200/30 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent-200/30 to-primary-200/30 rounded-full blur-2xl"></div>

                    {/* Logo with Animation */}
                    <div className="relative mb-2">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-6 transition-transform duration-300">
                        <span className="text-3xl">🎓</span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-1">AI Park</h3>
                    <p className="text-xs text-gray-500 mb-4">스마트 학습의 시작</p>

                    {/* Social Login Buttons with Icons */}
                    <button className="w-full max-w-[260px] flex items-center justify-center gap-3 px-5 py-3 bg-white border-2 border-gray-200 rounded-xl mb-2 hover:border-primary-300 hover:shadow-md transition-all text-sm font-semibold group/btn">
                      <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">G</span>
                      </div>
                      <span className="text-gray-700 group-hover/btn:text-primary-600 transition-colors">Google로 시작하기</span>
                    </button>
                    <button className="w-full max-w-[260px] flex items-center justify-center gap-3 px-5 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl mb-4 hover:from-yellow-500 hover:to-yellow-600 hover:shadow-md transition-all text-sm font-semibold text-gray-900 group/btn">
                      <div className="w-5 h-5 bg-gray-900 rounded flex items-center justify-center">
                        <span className="text-yellow-400 text-xs font-bold">K</span>
                      </div>
                      <span>Kakao로 시작하기</span>
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 w-full max-w-[260px] my-3">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                      <span className="text-xs text-gray-400 font-medium">또는</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    </div>

                    {/* Email/Password Inputs */}
                    <div className="w-full max-w-[260px] space-y-2">
                      <input
                        type="text"
                        placeholder="이메일 주소"
                        className="w-full px-4 py-2.5 bg-white/80 border-2 border-gray-200 rounded-lg text-sm focus:border-primary-400 focus:outline-none transition-colors"
                        disabled
                      />
                      <input
                        type="password"
                        placeholder="비밀번호"
                        className="w-full px-4 py-2.5 bg-white/80 border-2 border-gray-200 rounded-lg text-sm focus:border-primary-400 focus:outline-none transition-colors"
                        disabled
                      />
                    </div>

                    {/* Login Button */}
                    <button className="w-full max-w-[260px] px-5 py-3 mt-3 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300">
                      로그인하고 시작하기 →
                    </button>
                  </div>
                )}

                {/* Step 2: Subject Selection Screen Mockup */}
                {activeStep === 2 && (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 backdrop-blur-sm rounded-xl shadow-2xl flex flex-col items-center justify-center p-6 group-hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-20 h-20 bg-primary-200/20 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-secondary-200/20 rounded-full blur-2xl"></div>

                    {/* Header */}
                    <div className="text-center mb-4 relative z-10">
                      <h3 className="text-lg font-bold bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent mb-1">
                        어떤 과목을 시작할까요?
                      </h3>
                      <p className="text-xs text-gray-500">관심 있는 과목을 선택해보세요 ✨</p>
                    </div>

                    {/* Subject Grid - 2x2 */}
                    <div className="grid grid-cols-2 gap-3 w-full max-w-[280px] mb-3 relative z-10">
                      {[
                        { icon: '📚', name: '영어', color: 'from-primary-400 to-primary-600', bg: 'from-primary-50 to-primary-100' },
                        { icon: '🔢', name: '수학', color: 'from-secondary-400 to-secondary-600', bg: 'from-secondary-50 to-secondary-100' },
                        { icon: '🔬', name: '과학', color: 'from-accent-400 to-accent-600', bg: 'from-accent-50 to-accent-100' },
                        { icon: '🏛️', name: '사회', color: 'from-social-400 to-social-600', bg: 'from-social-50 to-social-100' },
                      ].map((subject, idx) => (
                        <div
                          key={idx}
                          className={`relative p-4 bg-gradient-to-br ${subject.bg} border-2 border-white/60 rounded-2xl hover:border-white hover:shadow-xl transition-all duration-300 cursor-pointer group/card transform hover:scale-105`}
                          style={{ animationDelay: `${idx * 100}ms` }}
                        >
                          {/* Icon with Glow */}
                          <div className="relative mb-2">
                            <div className={`text-3xl group-hover/card:scale-125 transition-transform duration-300 filter drop-shadow-lg`}>
                              {subject.icon}
                            </div>
                            <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-0 group-hover/card:opacity-20 rounded-full blur-xl transition-opacity duration-300`}></div>
                          </div>

                          {/* Subject Name */}
                          <div className="text-sm font-bold text-gray-700 group-hover/card:text-gray-900 transition-colors">
                            {subject.name}
                          </div>

                          {/* Checkmark on Hover */}
                          <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                            <span className="text-xs">✓</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Korean Subject - Full Width */}
                    <div className="w-full max-w-[280px] p-4 bg-gradient-to-br from-korean-50 to-korean-100 border-2 border-white/60 rounded-2xl hover:border-white hover:shadow-xl transition-all duration-300 cursor-pointer text-center group/card transform hover:scale-105 relative z-10">
                      <div className="flex items-center justify-center gap-3">
                        <div className="relative">
                          <div className="text-3xl group-hover/card:scale-125 transition-transform duration-300 filter drop-shadow-lg">✍️</div>
                          <div className="absolute inset-0 bg-gradient-to-br from-korean-400 to-korean-600 opacity-0 group-hover/card:opacity-20 rounded-full blur-xl transition-opacity duration-300"></div>
                        </div>
                        <div className="text-sm font-bold text-gray-700 group-hover/card:text-gray-900 transition-colors">국어</div>
                      </div>
                      {/* Checkmark on Hover */}
                      <div className="absolute top-3 right-3 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                        <span className="text-xs">✓</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: AI Tutor Chat Interface Mockup */}
                {activeStep === 3 && (
                  <div className="w-full h-full bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl flex flex-col p-4 group-hover:scale-[1.02] transition-all duration-500">
                    {/* Chat Header */}
                    <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                        <span className="text-sm">🤖</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">AI 튜터</div>
                        <div className="text-xs text-green-500 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          온라인
                        </div>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 py-3 space-y-2 overflow-hidden">
                      {/* AI Message */}
                      <div className="flex gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs">🤖</span>
                        </div>
                        <div className="bg-gray-100 rounded-lg rounded-tl-none px-3 py-2 max-w-[70%]">
                          <p className="text-xs text-gray-700">안녕하세요! 어떤 걸 도와드릴까요? 😊</p>
                        </div>
                      </div>

                      {/* User Message */}
                      <div className="flex gap-2 justify-end">
                        <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg rounded-tr-none px-3 py-2 max-w-[70%]">
                          <p className="text-xs text-white">이 수학 문제 풀이 방법을 알려주세요!</p>
                        </div>
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex-shrink-0"></div>
                      </div>

                      {/* AI Response */}
                      <div className="flex gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs">🤖</span>
                        </div>
                        <div className="bg-gray-100 rounded-lg rounded-tl-none px-3 py-2 max-w-[75%]">
                          <p className="text-xs text-gray-700">좋아요! 단계별로 설명해드릴게요 ✨</p>
                        </div>
                      </div>
                    </div>

                    {/* Input Area */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <input
                        type="text"
                        placeholder="메시지를 입력하세요..."
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                        disabled
                      />
                      <button className="px-3 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg">
                        <span className="text-sm">🎤</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Learning Analytics Dashboard Mockup */}
                {activeStep === 4 && (
                  <div className="w-full h-full bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl flex flex-col p-4 group-hover:scale-[1.02] transition-all duration-500 overflow-y-auto">
                    <h3 className="text-sm font-bold text-gray-900 mb-2 flex-shrink-0">학습 분석</h3>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-2 mb-2 flex-shrink-0">
                      <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-2">
                        <div className="text-xs text-primary-600 font-medium mb-0.5">학습 시간</div>
                        <div className="text-base font-bold text-primary-700">12.5h</div>
                      </div>
                      <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-lg p-2">
                        <div className="text-xs text-secondary-600 font-medium mb-0.5">정답률</div>
                        <div className="text-base font-bold text-secondary-700">87%</div>
                      </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-1.5 mb-2 flex-shrink-0">
                      <div>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-gray-600">영어</span>
                          <span className="text-primary-600 font-medium">85%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full" style={{width: '85%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-gray-600">수학</span>
                          <span className="text-secondary-600 font-medium">72%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-secondary-400 to-secondary-600 rounded-full" style={{width: '72%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-gray-600">과학</span>
                          <span className="text-accent-600 font-medium">90%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-accent-400 to-accent-600 rounded-full" style={{width: '90%'}}></div>
                        </div>
                      </div>
                    </div>

                    {/* Weakness Analysis */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 flex-shrink-0">
                      <div className="text-xs font-medium text-orange-700 mb-0.5">💡 개선이 필요한 영역</div>
                      <div className="text-xs text-orange-600">대수학 · 문법 · 화학반응</div>
                    </div>
                  </div>
                )}

                {/* Step 5: Learning Report Mockup */}
                {activeStep === 5 && (
                  <div className="w-full h-full bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl flex flex-col p-4 group-hover:scale-[1.02] transition-all duration-500 overflow-y-auto">
                    {/* Header with Trophy */}
                    <div className="text-center mb-2 flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-1 shadow-lg">
                        <span className="text-2xl">🏆</span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900">이번 주 성과</h3>
                      <p className="text-xs text-gray-500">놀라운 성장이에요!</p>
                    </div>

                    {/* Achievement Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-2 flex-shrink-0">
                      <div className="text-center p-1.5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                        <div className="text-xl mb-0.5">🔥</div>
                        <div className="text-xs font-bold text-purple-700">7일</div>
                        <div className="text-xs text-purple-600">연속</div>
                      </div>
                      <div className="text-center p-1.5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                        <div className="text-xl mb-0.5">⭐</div>
                        <div className="text-xs font-bold text-blue-700">4</div>
                        <div className="text-xs text-blue-600">레벨업</div>
                      </div>
                      <div className="text-center p-1.5 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                        <div className="text-xl mb-0.5">🎯</div>
                        <div className="text-xs font-bold text-green-700">95%</div>
                        <div className="text-xs text-green-600">달성률</div>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-2 mb-2 flex-shrink-0">
                      <div className="text-xs font-medium text-indigo-700 mb-1.5">🎖️ 획득한 배지</div>
                      <div className="flex gap-1.5 flex-wrap">
                        <div className="px-2 py-0.5 bg-white rounded-full text-xs shadow-sm">🌟 일주일 달인</div>
                        <div className="px-2 py-0.5 bg-white rounded-full text-xs shadow-sm">📚 독서왕</div>
                        <div className="px-2 py-0.5 bg-white rounded-full text-xs shadow-sm">🧮 수학천재</div>
                      </div>
                    </div>

                    {/* CTA */}
                    <button className="w-full px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium text-xs shadow-md hover:shadow-lg transition-shadow flex-shrink-0">
                      상세 리포트 보기 →
                    </button>
                  </div>
                )}

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>

              {/* Floating Step Number */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl animate-bounce-horizontal">
                {activeStep}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <Link
            href="/onboarding/quick"
            onClick={handleCTAClick}
            className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full font-semibold text-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300 group"
          >
            <span>{isLoading ? '로딩 중...' : '지금 무료로 시작하기'}</span>
            <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Link>
          <p className="mt-4 text-gray-400 text-sm">
            신용카드 필요 없음 • 언제든지 취소 가능
          </p>
        </div>
      </div>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}
