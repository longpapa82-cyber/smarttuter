import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { LastSession } from "@/types/learning-stats";

interface TutorCTAProps {
  subject: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tutorLink: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  lastSession: LastSession | null;
  nextTopic: string | null;
}

export function TutorCTA({
  subject,
  icon,
  title,
  subtitle,
  tutorLink,
  gradientFrom,
  gradientVia,
  gradientTo,
  lastSession,
  nextTopic,
}: TutorCTAProps) {
  const getSubjectName = () => {
    const names: Record<string, string> = {
      english: '영어',
      math: '수학',
      science: '과학',
      social: '사회',
      korean: '국어',
    };
    return names[subject] || subject;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover="hover"
    >
      <Link
        href={tutorLink}
        aria-label={`${getSubjectName()} 튜터와 학습 시작하기${lastSession ? `, 마지막 주제: ${lastSession.topic}` : ''}`}
      >
        <motion.div
          variants={{
            hover: { scale: 1.02 }
          }}
          transition={{ duration: 0.3 }}
          role="article"
          aria-labelledby={`tutor-title-${subject}`}
          className={`relative overflow-hidden bg-gradient-to-r from-${gradientFrom} via-${gradientVia} to-${gradientTo} rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-white cursor-pointer shadow-lg hover:shadow-2xl active:scale-[0.98] transition-shadow duration-300 touch-manipulation`}
        >
          {/* Animated background shimmer */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Main Content */}
            <div className="flex-1">
              {/* Title Section */}
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <motion.div
                  variants={{
                    hover: { rotate: 360, scale: 1.1 }
                  }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0"
                >
                  {icon}
                </motion.div>
                <div className="min-w-0">
                  <motion.h2
                    id={`tutor-title-${subject}`}
                    variants={{
                      hover: { x: 5 }
                    }}
                    transition={{ duration: 0.2 }}
                    className="text-xl sm:text-2xl font-bold leading-tight truncate"
                  >
                    {title}
                  </motion.h2>
                  <p className="text-xs sm:text-sm text-white/80" role="doc-subtitle">{subtitle}</p>
                </div>
              </div>

              {/* Session Info */}
              <div className="space-y-2 ml-0 sm:ml-16 md:ml-20">
                {lastSession && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-start sm:items-center gap-2"
                  >
                    <span className="text-xs sm:text-sm text-white/70 flex-shrink-0">마지막 주제:</span>
                    <span className="text-sm sm:text-base font-semibold line-clamp-1">&ldquo;{lastSession.topic}&rdquo;</span>
                  </motion.div>
                )}
                {nextTopic && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-start sm:items-center gap-2"
                  >
                    <span className="text-xs sm:text-sm text-white/70 flex-shrink-0">다음 추천:</span>
                    <span className="text-sm sm:text-base font-semibold line-clamp-1">&ldquo;{nextTopic}&rdquo;</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* CTA Button */}
            <motion.div
              variants={{
                hover: { x: 5 }
              }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center gap-2 sm:flex-shrink-0 mt-2 sm:mt-0 min-h-[44px]"
            >
              <span className="text-base sm:text-lg font-bold">학습 시작</span>
              <motion.div
                variants={{
                  hover: { x: 3 }
                }}
                transition={{ duration: 0.2, repeat: Infinity, repeatType: "reverse" }}
              >
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
