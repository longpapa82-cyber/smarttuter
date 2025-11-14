"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Calculator, Beaker, Globe, Sparkles, Clock, Target, TrendingUp } from "lucide-react";
import { BetaBadge } from "@/components/common/BetaBadge";

interface EmptySubjectDashboardProps {
  subject: 'english' | 'math' | 'science' | 'social' | 'korean';
  showBeta?: boolean;
}

const subjectConfig = {
  english: {
    name: '영어',
    emoji: '🗣️',
    icon: BookOpen,
    gradient: 'from-blue-500 via-indigo-600 to-purple-600',
    bgGradient: 'from-blue-50 via-indigo-50 to-purple-50',
    tutorPath: '/tutor/english',
    welcomeTitle: '영어 학습을 시작해볼까요?',
    description: 'AI 튜터와 실시간 영어 대화를 시작하면',
    feature: 'CEFR 레벨 평가와 4대 영역 마스터리 분석',
    estimatedTime: '5-10분만 투자하면',
    benefits: [
      { icon: TrendingUp, text: '실시간 학습 진행도 및 시간 추적' },
      { icon: Target, text: 'CEFR 레벨별 맞춤 학습 경로' },
      { icon: Sparkles, text: '듣기/말하기/읽기/쓰기 영역 분석' },
      { icon: Clock, text: 'AI 기반 맞춤형 학습 추천' },
    ],
  },
  math: {
    name: '수학',
    emoji: '📐',
    icon: Calculator,
    gradient: 'from-purple-500 via-pink-600 to-rose-600',
    bgGradient: 'from-purple-50 via-pink-50 to-rose-50',
    tutorPath: '/tutor/math',
    welcomeTitle: '수학 학습을 시작해볼까요?',
    description: 'AI 튜터와 수학 학습을 시작하면',
    feature: '단원별 진행도와 맞춤형 학습 추천',
    estimatedTime: '5-10분만 투자하면',
    benefits: [
      { icon: TrendingUp, text: '단원별 학습 진행도 추적' },
      { icon: Target, text: '취약 개념 맞춤 학습' },
      { icon: Sparkles, text: '문제 풀이 과정 분석' },
      { icon: Clock, text: 'AI 기반 학습 추천' },
    ],
  },
  science: {
    name: '과학',
    emoji: '🔬',
    icon: Beaker,
    gradient: 'from-cyan-500 via-blue-600 to-teal-600',
    bgGradient: 'from-cyan-50 via-blue-50 to-teal-50',
    tutorPath: '/tutor/science',
    welcomeTitle: '과학 학습을 시작해볼까요?',
    description: 'AI 튜터와 과학 학습을 시작하면',
    feature: '개념별 이해도 분석과 실험 추천',
    estimatedTime: '5-10분만 투자하면',
    benefits: [
      { icon: TrendingUp, text: '개념별 이해도 추적' },
      { icon: Target, text: '과학적 사고력 분석' },
      { icon: Sparkles, text: '가상 실험 추천' },
      { icon: Clock, text: 'AI 기반 학습 추천' },
    ],
  },
  social: {
    name: '사회',
    emoji: '🌍',
    icon: Globe,
    gradient: 'from-orange-500 via-amber-600 to-yellow-600',
    bgGradient: 'from-orange-50 via-amber-50 to-yellow-50',
    tutorPath: '/tutor/social-studies',
    welcomeTitle: '사회 학습을 시작해볼까요?',
    description: 'AI 튜터와 사회 학습을 시작하면',
    feature: '시대별/지역별 학습 진행도 분석',
    estimatedTime: '5-10분만 투자하면',
    benefits: [
      { icon: TrendingUp, text: '시대별/지역별 진행도 추적' },
      { icon: Target, text: '역사적 맥락 이해도 분석' },
      { icon: Sparkles, text: '인터랙티브 타임라인' },
      { icon: Clock, text: 'AI 기반 학습 추천' },
    ],
  },
  korean: {
    name: '국어',
    emoji: '📚',
    icon: BookOpen,
    gradient: 'from-orange-500 via-amber-600 to-yellow-600',
    bgGradient: 'from-orange-50 via-amber-50 to-yellow-50',
    tutorPath: '/tutor/korean',
    welcomeTitle: '국어 학습을 시작해볼까요?',
    description: 'AI 튜터와 국어 학습을 시작하면',
    feature: '문법/어휘/독해/작문 마스터리 분석',
    estimatedTime: '5-10분만 투자하면',
    benefits: [
      { icon: TrendingUp, text: '4대 영역 마스터리 추적' },
      { icon: Target, text: '문법/어휘 약점 분석' },
      { icon: Sparkles, text: '독해/작문 실력 향상' },
      { icon: Clock, text: 'AI 기반 학습 추천' },
    ],
  },
};

export function EmptySubjectDashboard({ subject, showBeta = false }: EmptySubjectDashboardProps) {
  const config = subjectConfig[subject];
  const Icon = config.icon;

  const subjectName = subject.charAt(0).toUpperCase() + subject.slice(1);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.bgGradient} flex items-center justify-center p-4 sm:p-6 lg:p-8`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 text-center">
          {/* Beta Badge */}
          {showBeta && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center mb-4"
            >
              <BetaBadge subject={subjectName} />
            </motion.div>
          )}

          {/* Emoji & Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative inline-block mb-6"
          >
            {/* Emoji background */}
            <div className="absolute -top-2 -right-2 text-4xl sm:text-5xl">
              {config.emoji}
            </div>
            {/* Icon circle */}
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
              <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
          </motion.div>

          {/* Empty state message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              {config.welcomeTitle}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mb-2">
              {config.description}
            </p>
            <p className="text-sm sm:text-base text-gray-500 mb-6">
              <strong className="text-gray-700">{config.feature}</strong>을(를) 받아보세요!
            </p>

            {/* Estimated time badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${config.gradient} bg-opacity-10 text-sm font-semibold mb-6`}
            >
              <Clock className="w-4 h-4" />
              <span>{config.estimatedTime} 대시보드가 생성됩니다</span>
            </motion.div>
          </motion.div>

          {/* Benefits list */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 text-left"
          >
            <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-3 sm:mb-4 text-center">
              ✨ 학습을 시작하면 이런 정보를 확인할 수 있어요
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {config.benefits.map((benefit, index) => {
                const BenefitIcon = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-white transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0`}>
                      <BenefitIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-700 leading-relaxed pt-1">{benefit.text}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* CTA Button */}
          <Link href={config.tutorPath}>
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full bg-gradient-to-r ${config.gradient} text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all mb-4 touch-manipulation min-h-[48px]`}
            >
              🚀 {config.name} 학습 시작하기
            </motion.button>
          </Link>

          {/* Secondary CTA */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all touch-manipulation min-h-[44px]"
          >
            ← 대시보드로 돌아가기
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
