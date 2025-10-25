"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export function Card({ children, className = "", hover = false, gradient = false }: CardProps) {
  const baseStyles = "rounded-2xl p-6";
  const hoverStyles = hover ? "hover:shadow-xl transition-shadow" : "";
  const gradientStyles = gradient ? "bg-gradient-to-br from-white to-gray-50" : "bg-white";

  return (
    <motion.div
      initial={hover ? { scale: 1 } : {}}
      whileHover={hover ? { scale: 1.02 } : {}}
      className={`${baseStyles} ${hoverStyles} ${gradientStyles} ${className}`}
    >
      {children}
    </motion.div>
  );
}
