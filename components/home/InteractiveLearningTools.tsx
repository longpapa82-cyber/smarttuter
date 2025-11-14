'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  Zap,
  Brain,
  Target,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Award,
  Sparkles,
} from 'lucide-react';

interface LearningTool {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  benefits: string[];
  stats: { label: string; value: string }[];
  href: string;
  badge?: string;
}

const learningTools: LearningTool[] = [
  {
    id: 'microlearning',
    title: '마이크로러닝',
    subtitle: '5-10분 집중 학습',
    description:
      '짧고 강렬한 학습 세션으로 바쁜 일상 속에서도 꾸준히 성장하세요. 과학적으로 검증된 마이크로러닝 방법론으로 학습 효율을 극대화합니다.',
    icon: <Clock className="w-8 h-8 text-white" />,
    gradient: 'from-purple-500 via-purple-600 to-pink-600',
    benefits: [
      '집중력 유지 최적화',
      '바쁜 일상에 완벽 적합',
      '즉각적인 성취감',
      '장기 기억 강화',
    ],
    stats: [
      { label: '평균 완료율', value: '94%' },
      { label: '학습 지속률', value: '3배 증가' },
    ],
    href: '/microlearning',
    badge: 'HOT',
  },
  {
    id: 'quiz',
    title: 'AI 퀴즈',
    subtitle: '맞춤형 문제 생성',
    description:
      'AI가 당신의 학습 수준과 약점을 분석하여 최적화된 문제를 실시간으로 생성합니다. 즉각적인 피드백으로 빠르게 실력을 향상시키세요.',
    icon: <Zap className="w-8 h-8 text-white" />,
    gradient: 'from-indigo-500 via-blue-500 to-cyan-600',
    benefits: [
      '실력 기반 난이도 조절',
      '약점 집중 보완',
      '즉시 피드백 제공',
      '실전 문제 적응',
    ],
    stats: [
      { label: '정답률 향상', value: '+42%' },
      { label: '문제 해결 속도', value: '2배 개선' },
    ],
    href: '/quiz',
    badge: 'AI',
  },
  {
    id: 'flashcards',
    title: '플래시카드',
    subtitle: 'SM-2 알고리즘 기반',
    description:
      '과학적으로 입증된 SM-2 간격 반복 알고리즘으로 효율적인 암기 학습을 경험하세요. 뇌과학 기반 복습 타이밍으로 장기 기억을 형성합니다.',
    icon: <Brain className="w-8 h-8 text-white" />,
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    benefits: [
      '과학 기반 복습 주기',
      '장기 기억 형성',
      '학습 시간 50% 절감',
      '자동 진도 관리',
    ],
    stats: [
      { label: '암기 효율', value: '+85%' },
      { label: '장기 기억률', value: '92%' },
    ],
    href: '/flashcards',
    badge: 'SCIENCE',
  },
  {
    id: 'spaced-repetition',
    title: '간격 반복 학습',
    subtitle: '장기 기억 강화 시스템',
    description:
      '에빙하우스 망각곡선을 극복하는 과학적 복습 시스템입니다. AI가 최적의 복습 타이밍을 계산하여 효율적인 장기 기억 형성을 돕습니다.',
    icon: <Target className="w-8 h-8 text-white" />,
    gradient: 'from-orange-500 via-red-500 to-pink-600',
    benefits: [
      '망각곡선 극복',
      '최적 복습 타이밍',
      '학습 부담 최소화',
      '자동 스케줄링',
    ],
    stats: [
      { label: '복습 효율', value: '+73%' },
      { label: '시험 성적', value: '+35%' },
    ],
    href: '/review',
    badge: 'PROVEN',
  },
];

function ToolTab({
  tool,
  isActive,
  onClick,
}: {
  tool: LearningTool;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative px-4 sm:px-6 py-3 sm:py-4 rounded-2xl transition-all duration-300 ${
        isActive
          ? 'shadow-lg border-2 border-white/30'
          : 'bg-white/50 hover:bg-white/70 border-2 border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className={`absolute inset-0 bg-gradient-to-r ${tool.gradient} rounded-2xl`}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}

      <div className="flex items-center gap-2 sm:gap-3 relative z-10">
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all ${
            isActive
              ? 'bg-white/20 backdrop-blur-sm'
              : 'bg-gray-100'
          }`}
        >
          {tool.icon}
        </div>
        <div className="text-left">
          <div
            className={`text-sm sm:text-base font-bold ${
              isActive ? 'text-white' : 'text-gray-900'
            }`}
          >
            {tool.title}
          </div>
          <div
            className={`text-xs ${
              isActive ? 'text-white/90' : 'text-gray-600'
            }`}
          >
            {tool.subtitle}
          </div>
        </div>
        {tool.badge && (
          <div className="hidden sm:block ml-auto px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-white">
            {tool.badge}
          </div>
        )}
      </div>
    </motion.button>
  );
}

function ToolContent({ tool }: { tool: LearningTool }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="grid md:grid-cols-2 gap-8 md:gap-12"
    >
      {/* Left: Description & Benefits */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-lg`}
            >
              {tool.icon}
            </div>
            {tool.badge && (
              <div className="px-3 py-1 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full text-xs font-bold text-primary-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {tool.badge}
              </div>
            )}
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {tool.title}
          </h3>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            {tool.description}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Award className="w-5 h-5 text-primary-600" />
            핵심 혜택
          </div>
          <div className="grid grid-cols-1 gap-2">
            {tool.benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100"
              >
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm sm:text-base text-gray-700">
                  {benefit}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <Link href={tool.href}>
          <motion.button
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full sm:w-auto px-6 py-3 bg-gradient-to-r ${tool.gradient} text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group`}
          >
            지금 시작하기
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </Link>
      </div>

      {/* Right: Stats & Visual */}
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          {tool.stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="relative p-4 sm:p-6 bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow"
            >
              {/* Gradient overlay on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}
              />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary-600" />
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
                <div
                  className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${tool.gradient} bg-clip-text text-transparent`}
                >
                  {stat.value}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Visual Demo Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className={`relative p-8 bg-gradient-to-br ${tool.gradient} rounded-3xl shadow-2xl overflow-hidden min-h-[250px] flex items-center justify-center`}
        >
          {/* Glow effects */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-white/20 rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative z-10 text-center">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center"
            >
              {tool.icon}
            </motion.div>
            <div className="text-white/90 text-sm sm:text-base font-medium">
              실제 학습 화면 미리보기
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function InteractiveLearningTools() {
  const [activeToolId, setActiveToolId] = useState(learningTools[0].id);
  const activeTool = learningTools.find((tool) => tool.id === activeToolId)!;

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-gray-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-bold text-primary-700">
              과학 기반 학습 도구
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
            당신의 학습을 가속화하는
            <br />
            인터랙티브 도구들
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            뇌과학과 교육학 연구를 바탕으로 설계된 학습 도구로
            <br className="hidden sm:block" />
            효율적이고 즐거운 학습 경험을 제공합니다
          </p>
        </motion.div>

        {/* Tool Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12"
        >
          {learningTools.map((tool) => (
            <ToolTab
              key={tool.id}
              tool={tool}
              isActive={activeToolId === tool.id}
              onClick={() => setActiveToolId(tool.id)}
            />
          ))}
        </motion.div>

        {/* Tool Content */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12"
        >
          <AnimatePresence mode="wait">
            <ToolContent key={activeToolId} tool={activeTool} />
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
