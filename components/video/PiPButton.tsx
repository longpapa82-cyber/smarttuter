'use client';

import { motion } from 'framer-motion';
import { PictureInPicture2, Minimize2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PiPButtonProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  className?: string;
}

/**
 * PiPButton Component
 *
 * Picture-in-Picture 모드 진입/종료 버튼 컴포넌트
 *
 * @param videoRef - 비디오 엘리먼트 ref
 * @param className - 추가 CSS 클래스
 */
export function PiPButton({ videoRef, className = '' }: PiPButtonProps) {
  const [isPiP, setIsPiP] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // PiP API 지원 여부 확인
    if (typeof document !== 'undefined') {
      const supported = 'pictureInPictureEnabled' in document;
      setIsSupported(supported);

      if (!supported) {
        console.warn('[PiP] Picture-in-Picture not supported in this browser');
        return;
      }

      // PiP 상태 변경 이벤트 리스너
      const handleEnterPiP = () => setIsPiP(true);
      const handleLeavePiP = () => setIsPiP(false);

      if (videoRef.current) {
        videoRef.current.addEventListener('enterpictureinpicture', handleEnterPiP);
        videoRef.current.addEventListener('leavepictureinpicture', handleLeavePiP);
      }

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('enterpictureinpicture', handleEnterPiP);
          videoRef.current.removeEventListener('leavepictureinpicture', handleLeavePiP);
        }
      };
    }
  }, [videoRef]);

  const togglePiP = async () => {
    if (!videoRef.current || !isSupported) return;

    try {
      if (isPiP) {
        // PiP 종료
        await document.exitPictureInPicture();
      } else {
        // PiP 진입
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error('[PiP] Failed to toggle Picture-in-Picture:', error);
    }
  };

  // 브라우저가 PiP를 지원하지 않으면 렌더링하지 않음
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
        e.stopPropagation();
        togglePiP();
      }}
      className={`
        p-3 rounded-full
        bg-black/50 hover:bg-black/70
        backdrop-blur-sm
        transition-all duration-200
        group
        ${className}
      `}
      aria-label={isPiP ? "Picture-in-Picture 종료" : "Picture-in-Picture"}
      title={isPiP ? "PiP 종료 (P)" : "Picture-in-Picture (P)"}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isPiP ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {isPiP ? (
          <Minimize2 className="w-5 h-5 text-white group-hover:text-primary-400 transition-colors" />
        ) : (
          <PictureInPicture2 className="w-5 h-5 text-white group-hover:text-primary-400 transition-colors" />
        )}
      </motion.div>
    </motion.button>
  );
}
