"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface BetaBadgeProps {
  subject: string;
  size?: 'standard' | 'compact';
  className?: string;
}

export function BetaBadge({ subject, size = 'standard', className = "" }: BetaBadgeProps) {
  // Compact mode for tutor pages (smaller, minimal)
  if (size === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 rounded-full ${className}`}
      >
        <Sparkles className="w-3 h-3 text-primary-600" />
        <span className="text-[11px] font-semibold text-primary-700 uppercase tracking-wide">
          Beta
        </span>
      </motion.div>
    );
  }

  // Standard mode for dashboard pages (original)
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 rounded-full ${className}`}
    >
      <Sparkles className="w-3.5 h-3.5 text-primary-600" />
      <span className="text-xs font-semibold text-primary-700">
        {subject} Beta
      </span>
    </motion.div>
  );
}
