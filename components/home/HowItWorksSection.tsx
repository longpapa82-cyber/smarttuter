'use client';

import { useState } from 'react';
import Link from 'next/link';

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

            {/* Right: Visual Placeholder */}
            <div className="relative">
              <div
                className={`w-full h-80 bg-gradient-to-br ${steps[activeStep - 1].bgGradient} rounded-2xl flex items-center justify-center overflow-hidden group`}
              >
                {/* Animated Icon */}
                <div className="text-9xl opacity-20 group-hover:opacity-30 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                  {steps[activeStep - 1].icon}
                </div>

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
            href="/login"
            className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full font-semibold text-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300 group"
          >
            <span>지금 무료로 시작하기</span>
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
