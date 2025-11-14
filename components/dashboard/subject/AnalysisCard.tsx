import { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Award, Target } from "lucide-react";
import type { LearningAnalysis } from "@/types/learning-stats";

interface AnalysisCardProps {
  title: string;
  analysis?: LearningAnalysis;
  tutorLink: string;
  highlightColor: string;
}

export const AnalysisCard = memo(function AnalysisCard({
  title,
  analysis,
  tutorLink,
  highlightColor,
}: AnalysisCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      role="region"
      aria-labelledby="analysis-title"
      className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <motion.h3
        id="analysis-title"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4"
      >
        {title}
      </motion.h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"
            >
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
            </motion.div>
            <h4 className="text-sm sm:text-base font-semibold text-gray-900">강점</h4>
          </div>
          <ul className="space-y-1.5 sm:space-y-2" role="list" aria-label="강점 목록">
            {analysis?.strengths && analysis.strengths.length > 0 ? (
              analysis.strengths.map((strength, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className="flex items-start gap-2 text-xs sm:text-sm text-gray-700"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.1 }}
                    className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 mt-1.5"
                  />
                  <span className="flex-1">{strength}</span>
                </motion.li>
              ))
            ) : (
              <li className="text-xs sm:text-sm text-gray-500">학습 데이터가 쌓이면 분석이 표시됩니다</li>
            )}
          </ul>
        </motion.div>

        {/* Weaknesses */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0"
            >
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />
            </motion.div>
            <h4 className="text-sm sm:text-base font-semibold text-gray-900">약점 (개선 필요)</h4>
          </div>
          <ul className="space-y-1.5 sm:space-y-2" role="list" aria-label="약점 목록">
            {analysis?.weaknesses && analysis.weaknesses.length > 0 ? (
              analysis.weaknesses.map((weakness, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.65 + i * 0.05 }}
                  className="flex items-start gap-2 text-xs sm:text-sm text-gray-700"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.1 }}
                    className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0 mt-1.5"
                  />
                  <span className="flex-1">{weakness}</span>
                </motion.li>
              ))
            ) : (
              <li className="text-xs sm:text-sm text-gray-500">학습 데이터가 쌓이면 분석이 표시됩니다</li>
            )}
          </ul>
        </motion.div>
      </div>

      {/* Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200"
      >
        <div className={`relative overflow-hidden bg-${highlightColor}-50 rounded-lg p-3 sm:p-4`}>
          {/* Background shimmer */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          />

          <p className={`relative z-10 text-xs sm:text-sm font-medium text-${highlightColor}-900 mb-1`}>💡 AI 추천</p>
          <p className={`relative z-10 text-xs sm:text-sm text-${highlightColor}-700 leading-relaxed`}>
            {analysis?.aiRecommendation || '학습을 시작하면 AI 추천이 표시됩니다'}
          </p>
          {analysis?.weaknesses && analysis.weaknesses.length > 0 && (
            <motion.div
              whileHover="hover"
              className="relative z-10 inline-block"
            >
              <Link
                href={tutorLink}
                className={`inline-flex items-center gap-1 mt-2 sm:mt-3 text-xs sm:text-sm font-semibold text-${highlightColor}-600 hover:text-${highlightColor}-800 transition-colors touch-manipulation min-h-[44px]`}
              >
                <span>약점 보완 학습 시작</span>
                <motion.span
                  variants={{
                    hover: { x: 3 }
                  }}
                  transition={{ duration: 0.2, repeat: Infinity, repeatType: "reverse" }}
                >
                  →
                </motion.span>
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
});
