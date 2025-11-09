'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Feature {
  id: string;
  subject: 'english' | 'math' | 'science' | 'social' | 'korean' | 'all';
  icon: string;
  title: string;
  description: string;
  highlights: string[];
  link: string;
  colorFrom: string;
  colorTo: string;
  textColor: string;
  bgColor: string;
}

const features: Feature[] = [
  {
    id: 'english-voice',
    subject: 'english',
    icon: '🎙️',
    title: '실시간 음성 대화',
    description: 'AI 튜터와 자연스러운 영어 대화를 나누세요. 저지연 음성 인식 기술로 실시간 발음 교정과 표현 피드백을 받을 수 있습니다.',
    highlights: ['실시간 발음 분석', '문맥 기반 표현 추천'],
    link: '/tutor/english',
    colorFrom: 'from-primary-400',
    colorTo: 'to-primary-600',
    textColor: 'text-primary-600',
    bgColor: 'bg-primary-50',
  },
  {
    id: 'math-solving',
    subject: 'math',
    icon: '📐',
    title: 'AI 수학 문제 풀이',
    description: '사진 촬영만으로 문제를 인식하고 단계별 풀이 과정을 제공합니다. 그래프, 도형, 함수를 시각화하여 개념을 쉽게 이해하세요.',
    highlights: ['손글씨 인식 OCR', '인터랙티브 그래프'],
    link: '/tutor/math',
    colorFrom: 'from-secondary-400',
    colorTo: 'to-secondary-600',
    textColor: 'text-secondary-600',
    bgColor: 'bg-secondary-50',
  },
  {
    id: 'science-lab',
    subject: 'science',
    icon: '🔬',
    title: '과학 실험 시뮬레이션',
    description: '가상 실험실에서 물리, 화학, 생물 실험을 안전하게 수행하세요. 3D 시각화로 복잡한 과학 개념을 직관적으로 이해할 수 있습니다.',
    highlights: ['인터랙티브 3D 모델', '가상 실험 환경'],
    link: '/tutor/science',
    colorFrom: 'from-accent-400',
    colorTo: 'to-accent-600',
    textColor: 'text-accent-600',
    bgColor: 'bg-accent-50',
  },
  {
    id: 'social-explore',
    subject: 'social',
    icon: '🌍',
    title: '사회 탐구 학습',
    description: '역사, 지리, 정치, 경제를 스토리텔링 방식으로 학습하세요. 인터랙티브 지도와 타임라인으로 세계를 이해합니다.',
    highlights: ['역사 타임라인', '인터랙티브 지도'],
    link: '/tutor/social-studies',
    colorFrom: 'from-social-400',
    colorTo: 'to-social-600',
    textColor: 'text-social-600',
    bgColor: 'bg-social-50',
  },
  {
    id: 'korean-writing',
    subject: 'korean',
    icon: '📚',
    title: '국어 독해 및 작문',
    description: '한글 읽기, 쓰기, 문법, 문학을 체계적으로 학습하세요. AI가 맞춤법을 교정하고 논리적인 글쓰기를 도와드립니다.',
    highlights: ['맞춤법 자동 교정', '작문 피드백'],
    link: '/tutor/korean',
    colorFrom: 'from-korean-400',
    colorTo: 'to-korean-600',
    textColor: 'text-korean-600',
    bgColor: 'bg-korean-50',
  },
  {
    id: 'learning-report',
    subject: 'all',
    icon: '📊',
    title: 'AI 학습 분석 리포트',
    description: '일일, 주간, 월간 학습 데이터를 시각화하여 제공합니다. 강점과 약점을 파악하고 맞춤형 학습 계획을 수립하세요.',
    highlights: ['실시간 대시보드', '성장 추이 분석'],
    link: '/learning-report',
    colorFrom: 'from-green-400',
    colorTo: 'to-emerald-600',
    textColor: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 'gamification',
    subject: 'all',
    icon: '🏆',
    title: '게이미피케이션 시스템',
    description: '레벨, 배지, 학습 스트릭으로 동기부여를 유지하세요. 목표를 달성하고 보상을 획득하며 성장하세요.',
    highlights: ['일일 퀘스트', '업적 시스템'],
    link: '/dashboard#achievements',
    colorFrom: 'from-pink-400',
    colorTo: 'to-rose-600',
    textColor: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
  {
    id: 'instant-feedback',
    subject: 'all',
    icon: '⚡',
    title: '24/7 즉각 피드백',
    description: '언제 어디서나 AI 튜터에게 질문하고 즉시 답변을 받으세요. 시간과 장소에 구애받지 않는 학습이 가능합니다.',
    highlights: ['무제한 질문', '실시간 응답'],
    link: '/dashboard',
    colorFrom: 'from-orange-400',
    colorTo: 'to-amber-600',
    textColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

const subjects = [
  { id: 'all', label: '전체', color: 'from-primary-500 to-secondary-500' },
  { id: 'english', label: '영어', color: 'from-primary-500 to-primary-600' },
  { id: 'math', label: '수학', color: 'from-secondary-500 to-secondary-600' },
  { id: 'science', label: '과학', color: 'from-accent-500 to-accent-600' },
  { id: 'social', label: '사회', color: 'from-social-500 to-social-600' },
  { id: 'korean', label: '국어', color: 'from-korean-500 to-korean-600' },
];

export function FeaturesSection() {
  const [activeSubject, setActiveSubject] = useState<string>('all');

  const filteredFeatures = activeSubject === 'all'
    ? features
    : features.filter(f => f.subject === activeSubject || f.subject === 'all');

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* AI Background Effect */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        {/* AI Grid Pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridFloat 20s linear infinite',
          }}
        />

        {/* Glow Orbs */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-gradient-to-br from-accent-500/20 to-social-500/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-gradient-to-br from-korean-500/20 to-pink-500/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-full text-sm font-semibold text-primary-600 mb-4">
            ✨ AI-Powered Learning
          </span>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
              5개 과목 통합
            </span>
            <br />
            <span className="text-gray-900">차세대 학습 경험</span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            영어, 수학, 과학, 사회, 국어를 AI 튜터와 함께 학습하세요.
            <br className="hidden sm:block" />
            실시간 피드백과 개인화된 학습 경로를 제공합니다.
          </p>
        </div>

        {/* Subject Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => setActiveSubject(subject.id)}
              className={`
                px-6 py-3 rounded-full font-semibold transition-all duration-300
                ${activeSubject === subject.id
                  ? `bg-gradient-to-r ${subject.color} text-white shadow-lg scale-105`
                  : 'bg-white text-gray-600 hover:bg-gray-100 hover:scale-105 border border-gray-200'
                }
              `}
            >
              {subject.label}
            </button>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredFeatures.map((feature, index) => (
            <div
              key={feature.id}
              className={`
                relative p-8 bg-white rounded-3xl transition-all duration-500 border border-gray-200/50 hover:shadow-2xl hover:-translate-y-2 group overflow-hidden
                animate-fade-in-up
              `}
              style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.colorFrom} ${feature.colorTo} opacity-0 group-hover:opacity-10 transition-opacity rounded-3xl`} />

              {/* Icon */}
              <div className="relative mb-6">
                <div className={`w-20 h-20 bg-gradient-to-br ${feature.colorFrom} ${feature.colorTo} rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl`}>
                  <span className="text-4xl">{feature.icon}</span>
                </div>
              </div>

              {/* Subject Tag */}
              {feature.subject !== 'all' && (
                <span className={`inline-block px-3 py-1 ${feature.bgColor} rounded-full text-xs font-semibold ${feature.textColor} mb-3`}>
                  {subjects.find(s => s.id === feature.subject)?.label}
                </span>
              )}

              {/* Title */}
              <h3 className={`text-2xl font-bold mb-3 text-gray-900 group-hover:${feature.textColor} transition-colors`}>
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed mb-4">
                {feature.description}
              </p>

              {/* Highlights */}
              <ul className="space-y-2 text-sm text-gray-500 mb-6">
                {feature.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Link */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={feature.link} className={`inline-flex items-center ${feature.textColor} font-semibold hover:gap-3 transition-all`}>
                  시작하기
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes gridFloat {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
      `}</style>
    </section>
  );
}
