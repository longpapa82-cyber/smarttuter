'use client';

import { motion } from 'framer-motion';

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export default function DashboardSection({
  title,
  subtitle,
  icon,
  children,
  className = '',
}: DashboardSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`mb-12 ${className}`}
    >
      {/* Section Header */}
      <div className="flex items-center gap-4 mb-6">
        {icon && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-4xl"
          >
            {icon}
          </motion.div>
        )}
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      </div>

      {/* Divider */}
      <div className="border-b-2 border-gray-200 mb-8" />

      {/* Section Content */}
      {children}
    </motion.section>
  );
}
