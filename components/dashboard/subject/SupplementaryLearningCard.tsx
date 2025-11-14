import { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface SupplementaryLearningCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge: string;
  gradientFrom: string;
  gradientTo: string;
}

export const SupplementaryLearningCard = memo(function SupplementaryLearningCard({
  href,
  icon,
  title,
  description,
  badge,
  gradientFrom,
  gradientTo,
}: SupplementaryLearningCardProps) {
  return (
    <Link href={href} aria-label={`${title} - ${description}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover="hover"
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          variants={{
            hover: { scale: 1.03, y: -6 }
          }}
          transition={{ duration: 0.3 }}
          role="article"
          className={`relative overflow-hidden bg-gradient-to-br from-${gradientFrom} to-${gradientTo} rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 text-white cursor-pointer shadow-lg hover:shadow-2xl transition-shadow touch-manipulation min-h-[160px] sm:min-h-[180px] flex flex-col`}
        >
          {/* Background shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          />

          {/* Icon with rotation animation */}
          <motion.div
            variants={{
              hover: { rotate: 360, scale: 1.1 }
            }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 sm:mb-4 flex-shrink-0"
          >
            {icon}
          </motion.div>

          {/* Title with slide animation */}
          <motion.h4
            variants={{
              hover: { x: 3 }
            }}
            transition={{ duration: 0.2 }}
            className="relative z-10 text-base sm:text-lg font-bold mb-1.5 sm:mb-2 leading-tight"
          >
            {title}
          </motion.h4>

          <p className="relative z-10 text-xs sm:text-sm text-white/80 flex-1">{description}</p>

          {/* Badge with shimmer */}
          <motion.div
            variants={{
              hover: { scale: 1.05 }
            }}
            transition={{ duration: 0.2 }}
            className="relative z-10 mt-3 sm:mt-4 text-[10px] sm:text-xs bg-white/20 rounded-full px-2.5 sm:px-3 py-1 inline-block self-start overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear", delay: 0.5 }}
            />
            <span className="relative">{badge}</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </Link>
  );
});
