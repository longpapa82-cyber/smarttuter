'use client';

import { motion } from 'framer-motion';

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[600px] text-center px-6"
    >
      {/* Logo/Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="mb-8"
      >
        <div className="w-32 h-32 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-3xl flex items-center justify-center shadow-2xl">
          <span className="text-6xl">🎓</span>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent"
      >
        AI Park에
        <br />
        오신 것을 환영합니다!
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xl text-gray-600 mb-4 max-w-md"
      >
        AI 튜터와 함께하는
        <br />
        개인화된 영어/수학 학습
      </motion.p>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-3xl"
      >
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
          <div className="text-3xl mb-2">🤖</div>
          <div className="font-semibold text-gray-800 mb-1">AI 튜터</div>
          <div className="text-sm text-gray-600">24/7 실시간 학습 지원</div>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
          <div className="text-3xl mb-2">📊</div>
          <div className="font-semibold text-gray-800 mb-1">맞춤형 학습</div>
          <div className="text-sm text-gray-600">나에게 맞는 학습 경로</div>
        </div>
        <div className="p-4 bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl">
          <div className="text-3xl mb-2">🎯</div>
          <div className="font-semibold text-gray-800 mb-1">실시간 피드백</div>
          <div className="text-sm text-gray-600">즉각적인 학습 분석</div>
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        className="px-12 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white text-lg font-bold rounded-full shadow-xl hover:shadow-2xl transition-all"
      >
        시작하기 →
      </motion.button>
    </motion.div>
  );
}
