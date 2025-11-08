"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Link from 'next/link';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
  description?: string;
  ctaButton?: {
    text: string;
    href: string;
  };
}

export function VideoModal({
  isOpen,
  onClose,
  videoUrl,
  title = "AI 튜터 데모 영상",
  description = "실시간 음성/채팅으로 수학과 영어를 배우는 과정을 확인하세요",
  ctaButton = { text: "무료로 시작하기 →", href: "/onboarding/quick" }
}: VideoModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  // 비디오 타입 감지 (YouTube vs 로컬 파일)
  const isYouTubeVideo = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('/embed/');
  };

  const isLocalVideo = !isYouTubeVideo(videoUrl);

  // YouTube URL을 embed URL로 변환
  const getEmbedUrl = (url: string): string => {
    if (!isYouTubeVideo(url)) return url;

    try {
      // YouTube watch URL을 embed URL로 변환
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
        const videoId = urlObj.searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
      }
      // youtu.be 형식
      if (urlObj.hostname.includes('youtu.be')) {
        const videoId = urlObj.pathname.slice(1);
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
      }
      // 이미 embed URL인 경우
      if (url.includes('/embed/')) {
        return url;
      }
      return url;
    } catch {
      return url;
    }
  };

  const embedUrl = isLocalVideo ? videoUrl : getEmbedUrl(videoUrl);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
      setIsLoading(true);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* 모달 */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="video-title"
              aria-describedby="video-description"
            >
              {/* 닫기 버튼 */}
              <div className="flex justify-end p-4 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
                  aria-label="모달 닫기"
                >
                  <X className="w-6 h-6 text-gray-600 group-hover:text-gray-900 transition-colors" />
                </button>
              </div>

              {/* 비디오 플레이어 */}
              <div className="px-4 sm:px-8 pb-6">
                <div className="relative w-full pb-[56.25%] bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                      <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                        <p className="text-white text-sm">비디오 로딩 중...</p>
                      </div>
                    </div>
                  )}

                  {isLocalVideo ? (
                    // 로컬 비디오 파일 재생
                    <video
                      src={embedUrl}
                      className="absolute inset-0 w-full h-full object-contain"
                      controls
                      autoPlay
                      onLoadedData={() => setIsLoading(false)}
                      onError={() => {
                        setIsLoading(false);
                        console.error('비디오 로드 실패:', embedUrl);
                      }}
                    >
                      <source src={embedUrl} type="video/mp4" />
                      <source src={embedUrl} type="video/webm" />
                      <source src={embedUrl} type="video/ogg" />
                      브라우저가 비디오 재생을 지원하지 않습니다.
                    </video>
                  ) : (
                    // YouTube iframe
                    <iframe
                      src={embedUrl}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      onLoad={() => setIsLoading(false)}
                      title="AI 튜터 데모 영상"
                    />
                  )}
                </div>
              </div>

              {/* 정보 섹션 */}
              <div className="px-4 sm:px-8 pb-8 space-y-6">
                {/* 제목 및 설명 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2
                    id="video-title"
                    className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-3"
                  >
                    {title}
                  </h2>
                  <p
                    id="video-description"
                    className="text-gray-600 text-lg leading-relaxed"
                  >
                    {description}
                  </p>
                </motion.div>

                {/* 주요 특징 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    ✨ 주요 기능
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <span className="text-gray-700">
                        <strong>실시간 음성 인식</strong> - 자연스러운 대화로 학습
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <span className="text-gray-700">
                        <strong>AI 개인화 학습</strong> - 학교급별 맞춤 튜터링
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <span className="text-gray-700">
                        <strong>학습 리포트</strong> - 실시간 진도 및 향상도 분석
                      </span>
                    </li>
                  </ul>
                </motion.div>

                {/* CTA 버튼 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <Link
                    href={ctaButton.href}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full font-semibold text-center hover:shadow-2xl hover:scale-105 transition-all"
                  >
                    {ctaButton.text}
                  </Link>
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-full font-semibold hover:border-primary-500 hover:text-primary-600 hover:scale-105 transition-all"
                  >
                    나중에 보기
                  </button>
                </motion.div>

                {/* 추가 정보 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200"
                >
                  <p>🎓 무료 계정으로 모든 기능을 체험해보세요</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  // Portal로 body에 마운트 (클라이언트 사이드에서만)
  if (typeof window === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
