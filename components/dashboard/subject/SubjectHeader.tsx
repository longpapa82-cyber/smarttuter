import { motion } from "framer-motion";
import { BetaBadge } from "@/components/common/BetaBadge";

interface SubjectHeaderProps {
  icon: React.ReactNode;
  title: string;
  subject: string;
  username?: string | null;
  description: string;
}

export function SubjectHeader({
  icon,
  title,
  subject,
  username,
  description,
}: SubjectHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6 sm:mb-8"
    >
      <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4 mb-3 sm:mb-4">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3"
        >
          <motion.span
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center"
          >
            {icon}
          </motion.span>
          <span className="leading-tight">{title}</span>
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <BetaBadge subject={subject} />
        </motion.div>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-sm sm:text-base text-gray-600"
      >
        {username || '학습자'}님의 {description}
      </motion.p>
    </motion.div>
  );
}
