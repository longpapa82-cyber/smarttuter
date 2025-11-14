import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { TrendingUp } from "lucide-react";

interface ProgressItem {
  name: string;
  progress: number;
  status: 'completed' | 'in_progress' | 'not_started';
}

interface ProgressCardProps {
  title: string;
  iconColor: string;
  gradeProgress: {
    level: string;
    progress: number;
  } | null;
  monthlyHours: {
    current: number;
    target: number;
  };
  progressItems: ProgressItem[];
  progressLabel: string;
  gradientFrom: string;
  gradientTo: string;
}

export function ProgressCard({
  title,
  iconColor,
  gradeProgress,
  monthlyHours,
  progressItems,
  progressLabel,
  gradientFrom,
  gradientTo,
}: ProgressCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      role="region"
      aria-labelledby="progress-title"
      className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <motion.h3
        id="progress-title"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className={`text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2`}
      >
        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <TrendingUp className={`w-5 h-5 sm:w-6 sm:h-6 text-${iconColor}`} />
        </motion.div>
        <span className="leading-tight">{title}</span>
      </motion.h3>

      <div className="space-y-4 sm:space-y-6">
        {/* Grade Level Progress */}
        {gradeProgress && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">학년별 진행도</span>
              <span className="text-sm text-gray-600">{gradeProgress.level} 완료</span>
            </div>
            <div
              className="w-full bg-gray-200 rounded-full h-3 overflow-hidden"
              role="progressbar"
              aria-valuenow={gradeProgress.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`학년별 진행도 ${gradeProgress.progress}%`}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={isInView ? { width: `${gradeProgress.progress}%` } : { width: 0 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                className={`bg-gradient-to-r from-${gradientFrom} to-${gradientTo} h-3 rounded-full relative`}
              >
                <motion.div
                  className="absolute inset-0 bg-white/30"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
              </motion.div>
            </div>
            <div className="text-right mt-1">
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, type: "spring" }}
                className={`text-xs font-semibold text-${iconColor}`}
              >
                {gradeProgress.progress}%
              </motion.span>
            </div>
          </motion.div>
        )}

        {/* Monthly Hours */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center justify-between flex-wrap gap-1 mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-700">이번 달 학습 시간</span>
            <span className="text-xs sm:text-sm text-gray-600">{monthlyHours.current}시간 / 목표 {monthlyHours.target}시간</span>
          </div>
          <div
            className="w-full bg-gray-200 rounded-full h-3 overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.min((monthlyHours.current / monthlyHours.target) * 100, 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`이번 달 학습 시간 ${monthlyHours.current}시간 / 목표 ${monthlyHours.target}시간`}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: `${Math.min((monthlyHours.current / monthlyHours.target) * 100, 100)}%` } : { width: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full relative"
            >
              <motion.div
                className="absolute inset-0 bg-white/30"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Progress Items (Chapters/Concepts/Periods) */}
        {progressItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-3 sm:pt-4 border-t border-gray-200"
          >
            <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">{progressLabel}</p>
            <div className="space-y-2">
              {progressItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.05 }}
                  whileHover={{ x: 4, backgroundColor: "rgba(0,0,0,0.02)" }}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {item.status === 'completed' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8 + i * 0.05, type: "spring", stiffness: 200 }}
                        className="w-5 h-5 flex-shrink-0 rounded-full bg-green-500 flex items-center justify-center"
                      >
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1 + i * 0.05 }}
                          className="text-white text-xs"
                        >
                          ✓
                        </motion.span>
                      </motion.div>
                    )}
                    {item.status === 'in_progress' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8 + i * 0.05, type: "spring", stiffness: 200 }}
                        className="w-5 h-5 flex-shrink-0 rounded-full bg-blue-500 flex items-center justify-center"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="w-2 h-2 rounded-full bg-white"
                        />
                      </motion.div>
                    )}
                    {item.status === 'not_started' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8 + i * 0.05, type: "spring", stiffness: 200 }}
                        className="w-5 h-5 flex-shrink-0 rounded-full bg-gray-300"
                      />
                    )}
                    <span className={`text-xs sm:text-sm truncate ${
                      item.status === 'completed' ? 'text-green-700 font-medium' :
                      item.status === 'in_progress' ? 'text-blue-700 font-medium' :
                      'text-gray-500'
                    }`}>
                      {item.name}
                    </span>
                  </div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 + i * 0.05 }}
                    className="text-xs text-gray-500 flex-shrink-0"
                  >
                    {item.progress}%
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
