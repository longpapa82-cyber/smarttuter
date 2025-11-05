'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface ExperienceStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export default function ExperienceStep({ onNext, onSkip }: ExperienceStepProps) {
  const router = useRouter();

  const handleTryEnglish = () => {
    // Set guest mode cookie before accessing tutor page
    document.cookie = 'aipark_guest_mode=true; path=/; max-age=31536000; SameSite=Lax';
    router.push('/tutor/english?demo=true');
  };

  const handleTryMath = () => {
    // Set guest mode cookie before accessing tutor page
    document.cookie = 'aipark_guest_mode=true; path=/; max-age=31536000; SameSite=Lax';
    router.push('/tutor/math?demo=true');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex flex-col items-center justify-center min-h-[600px] text-center px-6"
    >
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <h2 className="text-4xl font-bold mb-3 text-gray-900">
          먼저 AI Park를
          <br />
          체험해보세요!
        </h2>
        <p className="text-lg text-gray-600">
          로그인 없이 AI 튜터의 능력을 확인해보세요
        </p>
      </motion.div>

      {/* Experience Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl">
        {/* English Tutor */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05, y: -8 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleTryEnglish}
          className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white rounded-3xl p-8 shadow-2xl text-left h-64 flex flex-col justify-between"
        >
          <div>
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold mb-2">English Park 체험</h3>
            <p className="text-blue-100">
              AI와 대화하며 영어를 배워보세요
            </p>
          </div>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span>체험하기</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </motion.button>

        {/* Math Tutor */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05, y: -8 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleTryMath}
          className="bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 text-white rounded-3xl p-8 shadow-2xl text-left h-64 flex flex-col justify-between"
        >
          <div>
            <div className="text-6xl mb-4">🔢</div>
            <h3 className="text-2xl font-bold mb-2">Math Park 체험</h3>
            <p className="text-purple-100">
              개념부터 문제풀이까지 체험해보세요
            </p>
          </div>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span>체험하기</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </motion.button>
      </div>

      {/* Skip Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={onSkip}
        className="text-gray-600 hover:text-gray-900 font-medium underline"
      >
        건너뛰고 계정 만들기
      </motion.button>
    </motion.div>
  );
}
