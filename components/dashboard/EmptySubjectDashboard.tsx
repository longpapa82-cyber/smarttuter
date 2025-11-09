"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Calculator, Beaker, Globe } from "lucide-react";
import { BetaBadge } from "@/components/common/BetaBadge";

interface EmptySubjectDashboardProps {
  subject: 'english' | 'math' | 'science' | 'social';
  showBeta?: boolean;
}

const subjectConfig = {
  english: {
    name: '영어',
    icon: BookOpen,
    gradient: 'from-blue-500 via-indigo-600 to-purple-600',
    tutorPath: '/tutor/english',
    description: 'AI 튜터와 실시간 영어 대화를 시작하여',
    feature: 'CEFR 레벨 평가와 4대 영역 마스터리 분석',
  },
  math: {
    name: '수학',
    icon: Calculator,
    gradient: 'from-purple-500 via-pink-600 to-rose-600',
    tutorPath: '/tutor/math',
    description: 'AI 튜터와 수학 학습을 시작하여',
    feature: '단원별 진행도와 맞춤형 학습 추천',
  },
  science: {
    name: '과학',
    icon: Beaker,
    gradient: 'from-green-500 via-emerald-600 to-teal-600',
    tutorPath: '/tutor/science',
    description: 'AI 튜터와 과학 학습을 시작하여',
    feature: '개념별 이해도 분석과 실험 추천',
  },
  social: {
    name: '사회',
    icon: Globe,
    gradient: 'from-orange-500 via-amber-600 to-yellow-600',
    tutorPath: '/tutor/social-studies',
    description: 'AI 튜터와 사회 학습을 시작하여',
    feature: '시대별/지역별 학습 진행도 분석',
  },
};

export function EmptySubjectDashboard({ subject, showBeta = false }: EmptySubjectDashboardProps) {
  const config = subjectConfig[subject];
  const Icon = config.icon;

  const subjectName = subject.charAt(0).toUpperCase() + subject.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
          {/* Beta Badge */}
          {showBeta && (
            <div className="flex justify-center mb-4">
              <BetaBadge subject={subjectName} />
            </div>
          )}

          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}
          >
            <Icon className="w-12 h-12 text-white" />
          </motion.div>

          {/* Empty state message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {config.name} 학습 기록이 아직 없습니다
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              {config.description}
            </p>
            <p className="text-base text-gray-500 mb-8">
              <strong>{config.feature}</strong>을(를) 받아보세요!
            </p>
          </motion.div>

          {/* Features list */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-50 rounded-2xl p-6 mb-8 text-left"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">
              학습을 시작하면 다음 정보를 확인할 수 있습니다:
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>실시간 학습 진행도 및 시간 추적</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span>주제별/단원별 완료 현황</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>강점과 약점 분석</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <span>AI 기반 맞춤형 학습 추천</span>
              </li>
            </ul>
          </motion.div>

          {/* CTA Button */}
          <Link href={config.tutorPath}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full bg-gradient-to-r ${config.gradient} text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all`}
            >
              {config.name} 학습 시작하기 →
            </motion.button>
          </Link>

          {/* Back to dashboard link */}
          <Link
            href="/dashboard"
            className="inline-block mt-6 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← 대시보드로 돌아가기
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
