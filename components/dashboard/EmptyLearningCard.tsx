"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface EmptyLearningCardProps {
  subject: string;
  subjectKey: 'english' | 'math' | 'science' | 'social-studies' | 'korean';
  icon: React.ReactNode;
  gradient: string;
}

export function EmptyLearningCard({ subject, subjectKey, icon, gradient }: EmptyLearningCardProps) {
  const tutorPath = subjectKey === 'social-studies' ? 'social-studies' : subjectKey;

  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-4 sm:p-5 md:p-6 lg:p-7 text-white shadow-lg flex flex-col justify-between h-full`}>
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold truncate">{subject} 학습</h3>
            <p className="text-xs sm:text-sm text-white/80 truncate">{subject} Dashboard</p>
          </div>
        </div>
      </div>

      {/* 콘텐츠 영역 - 고정 높이로 학습 내역 있는 카드와 동일 */}
      <div className="flex-1 min-h-0">
        <div className="h-[180px] flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">📚</div>
            <h4 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">아직 학습 기록이 없습니다</h4>
            <p className="text-xs sm:text-sm text-white/80 px-2">
              {subject} 튜터와 대화를 시작하면 학습 진행도가 표시됩니다!
            </p>
          </motion.div>
        </div>
      </div>

      {/* 버튼 독립 영역 - 학습 내역 있는 카드와 동일한 구조 */}
      <div className="mt-auto pt-4 border-t border-white/20">
        <Link href={`/tutor/${tutorPath}`} className="block">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full font-semibold transition-all"
          >
            {subject} 학습 시작하기 →
          </motion.button>
        </Link>
      </div>
    </div>
  );
}
