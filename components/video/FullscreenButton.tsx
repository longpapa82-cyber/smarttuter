'use client';

import { motion } from 'framer-motion';
import { Maximize, Minimize } from 'lucide-react';

interface FullscreenButtonProps {
  isFullscreen: boolean;
  onClick: () => void;
  isSupported?: boolean;
  className?: string;
}

/**
 * FullscreenButton Component
 *
 * 전체 화면 진입/종료 버튼 컴포넌트
 *
 * @param isFullscreen - 현재 전체 화면 상태
 * @param onClick - 클릭 핸들러
 * @param isSupported - 브라우저가 전체 화면을 지원하는지 여부
 * @param className - 추가 CSS 클래스
 */
export function FullscreenButton({
  isFullscreen,
  onClick,
  isSupported = true,
  className = ''
}: FullscreenButtonProps) {
  // 브라우저가 전체 화면을 지원하지 않으면 렌더링하지 않음
  if (!isSupported) {
    return null;
  }

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        e.stopPropagation(); // 부모 요소 클릭 이벤트 전파 방지
        onClick();
      }}
      className={`
        p-3 rounded-full
        bg-black/50 hover:bg-black/70
        backdrop-blur-sm
        transition-all duration-200
        group
        ${className}
      `}
      aria-label={isFullscreen ? "전체 화면 종료" : "전체 화면"}
      title={isFullscreen ? "전체 화면 종료 (ESC)" : "전체 화면 (F)"}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isFullscreen ? 90 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {isFullscreen ? (
          <Minimize className="w-5 h-5 text-white group-hover:text-primary-400 transition-colors" />
        ) : (
          <Maximize className="w-5 h-5 text-white group-hover:text-primary-400 transition-colors" />
        )}
      </motion.div>
    </motion.button>
  );
}
