"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      aria-label="Breadcrumb"
      className="mb-4 sm:mb-6"
    >
      <ol className="flex items-center flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1 sm:gap-2">
              {index > 0 && (
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
              )}

              {isLast ? (
                // Current page - not clickable
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-1.5 text-gray-900 font-semibold"
                  aria-current="page"
                >
                  {item.icon && (
                    <span className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                      {item.icon}
                    </span>
                  )}
                  <span className="leading-tight">{item.label}</span>
                </motion.span>
              ) : (
                // Parent pages - clickable
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover="hover"
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors group"
                  >
                    {item.icon && (
                      <motion.span
                        variants={{
                          hover: { scale: 1.1 }
                        }}
                        transition={{ duration: 0.2 }}
                        className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center"
                      >
                        {item.icon}
                      </motion.span>
                    )}
                    <motion.span
                      variants={{
                        hover: { x: 2 }
                      }}
                      transition={{ duration: 0.2 }}
                      className="leading-tight"
                    >
                      {item.label}
                    </motion.span>
                  </Link>
                </motion.div>
              )}
            </li>
          );
        })}
      </ol>
    </motion.nav>
  );
}

// Subject-specific breadcrumb helper
export function SubjectBreadcrumb({
  subject,
  icon
}: {
  subject: string;
  icon?: React.ReactNode
}) {
  const subjectLabels: Record<string, string> = {
    english: '영어',
    math: '수학',
    science: '과학',
    social: '사회',
    korean: '국어',
  };

  const items: BreadcrumbItem[] = [
    {
      label: '대시보드',
      href: '/dashboard',
      icon: <Home className="w-4 h-4 sm:w-5 sm:h-5" />
    },
    {
      label: `${subjectLabels[subject] || subject} 대시보드`,
      href: `/dashboard/${subject}`,
      icon: icon
    }
  ];

  return <Breadcrumb items={items} />;
}
