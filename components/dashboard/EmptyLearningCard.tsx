"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface EmptyLearningCardProps {
  subject: string;
  subjectKey: 'english' | 'math' | 'science' | 'social-studies';
  icon: React.ReactNode;
  gradient: string;
}

export function EmptyLearningCard({ subject, subjectKey, icon, gradient }: EmptyLearningCardProps) {
  const tutorPath = subjectKey === 'social-studies' ? 'social-studies' : subjectKey;

  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between h-full`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-bold">{subject} 학습</h3>
            <p className="text-sm text-white/80">{subject} Dashboard</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">📚</div>
          <h4 className="text-lg font-bold mb-2">아직 학습 기록이 없습니다</h4>
          <p className="text-sm text-white/80 mb-6">
            {subject} 튜터와 대화를 시작하면 학습 진행도가 표시됩니다!
          </p>
          <Link href={`/tutor/${tutorPath}`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full font-semibold transition-all"
            >
              {subject} 학습 시작하기 →
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
