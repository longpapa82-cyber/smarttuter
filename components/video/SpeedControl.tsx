'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Gauge, ChevronUp } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface SpeedControlProps {
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
  className?: string;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

/**
 * SpeedControl Component
 *
 * 비디오 재생 속도 조절 컴포넌트
 *
 * @param currentSpeed - 현재 재생 속도
 * @param onSpeedChange - 속도 변경 콜백
 * @param className - 추가 CSS 클래스
 */
export function SpeedControl({
  currentSpeed,
  onSpeedChange,
  className = ''
}: SpeedControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      {/* Speed Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`
          p-3 rounded-full
          bg-black/50 hover:bg-black/70
          backdrop-blur-sm
          transition-all duration-200
          group
          relative
        `}
        aria-label="재생 속도 조절"
        title={`재생 속도 (현재: ${currentSpeed}x)`}
      >
        <Gauge className="w-5 h-5 text-white group-hover:text-primary-400 transition-colors" />

        {/* Speed Indicator */}
        {currentSpeed !== 1 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
          >
            {currentSpeed}x
          </motion.span>
        )}
      </motion.button>

      {/* Speed Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-white/10"
          >
            {/* Menu Header */}
            <div className="px-4 py-2 bg-white/5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-primary-400" />
                <span className="text-sm font-semibold text-white">재생 속도</span>
              </div>
            </div>

            {/* Speed Options */}
            <div className="py-1">
              {SPEED_OPTIONS.map((speed) => (
                <motion.button
                  key={speed}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSpeedChange(speed);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-4 py-2.5 text-left
                    transition-colors duration-150
                    flex items-center justify-between gap-4
                    ${currentSpeed === speed ? 'bg-primary-500/20 text-primary-400' : 'text-white'}
                  `}
                >
                  <span className="text-sm font-medium min-w-[60px]">
                    {speed === 1 ? '보통' : `${speed}x`}
                  </span>
                  {currentSpeed === speed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-1.5 h-1.5 rounded-full bg-primary-400"
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Keyboard Hint */}
            <div className="px-4 py-2 bg-white/5 border-t border-white/10">
              <p className="text-[10px] text-gray-400 flex items-center gap-1">
                <ChevronUp className="w-3 h-3" />
                <span>Shift + &gt; / &lt; 로도 조절 가능</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
