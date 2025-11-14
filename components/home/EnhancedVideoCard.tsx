'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Play, Maximize, Minimize } from 'lucide-react';

interface DemoVideo {
  id: string;
  title: string;
  description: string;
  subject: string;
  icon: React.ReactNode;
  gradient: string;
  videoUrl: string;
  duration: string;
  badge?: string;
}

interface EnhancedVideoCardProps {
  video: DemoVideo;
  index: number;
  isPlaying: boolean;
  onPlayToggle: () => void;
}

export function EnhancedVideoCard({
  video,
  index,
  isPlaying,
  onPlayToggle
}: EnhancedVideoCardProps) {
  const [isReady, setIsReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 비디오와 컨테이너 ref
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // isPlaying 상태 변경 시 비디오 재생/일시정지 처리
  useEffect(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.play().catch((error) => {
        console.error('Video play error:', error);
      });
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  // 전체화면 토글
  const toggleFullscreen = async () => {
    if (!videoContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await videoContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  // 카드 애니메이션 variants
  const cardVariants = {
    collapsed: {
      height: 'auto',
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    expanded: {
      height: 'auto',
      scale: 1.02,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  const handleCloseVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsReady(false);
    onPlayToggle();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      variants={cardVariants}
      animate={isPlaying ? 'expanded' : 'collapsed'}
      whileHover={!isPlaying ? { y: -8, scale: 1.02 } : {}}
      transition={{ duration: 0.3 }}
      className="relative group rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl"
      layout
    >
      {/* 비디오 영역 - 고정 높이 유지 */}
      <div
        ref={videoContainerRef}
        className="relative w-full h-64 sm:h-80 md:h-96 aspect-video transition-all duration-300 overflow-hidden"
      >
        {/* 썸네일 뷰 (재생 전) - 항상 렌더링, isPlaying일 때만 숨김 */}
        <div
          className={`absolute inset-0 w-full h-full cursor-pointer group transition-opacity duration-300 ${
            isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          onClick={onPlayToggle}
        >
          {/* 그라디언트 배경 */}
          <div className={`absolute inset-0 bg-gradient-to-br ${video.gradient}`}>
            {/* Glow Effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all duration-500" />
          </div>

          {/* 비디오 첫 프레임 (HTML5 video의 poster처럼 사용) */}
          <video
            src={video.videoUrl}
            className="absolute inset-0 w-full h-full object-cover opacity-80"
            preload="metadata"
            muted
            playsInline
          />

          {/* 그라디언트 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Play Button */}
          <motion.div
            whileHover={{ scale: 1.15 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-3 sm:border-4 border-white/30 group-hover:bg-white/30 transition-all"
          >
            <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-0.5 sm:ml-1" fill="white" />
          </motion.div>

          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 px-2 py-0.5 sm:px-3 sm:py-1 bg-black/50 backdrop-blur-sm rounded-full text-[10px] sm:text-xs font-semibold text-white z-10">
            {video.duration}
          </div>

          {/* Hot Badge */}
          {video.badge && (
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 px-2 py-0.5 sm:px-3 sm:py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] sm:text-xs font-bold text-white flex items-center gap-0.5 sm:gap-1 z-10">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {video.badge}
            </div>
          )}

          {/* Subject Icon */}
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white z-10 scale-90 sm:scale-100">
            {video.icon}
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* 비디오 플레이어 (재생 중) */}
        <div
          className={`absolute inset-0 w-full h-full bg-black transition-opacity duration-300 ${
            isPlaying ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
          }`}
        >
          <video
            ref={videoRef}
            src={video.videoUrl}
            controls
            autoPlay={isPlaying}
            playsInline
            className="absolute inset-0 w-full h-full object-contain"
            onEnded={() => {
              setIsReady(false);
              onPlayToggle();
            }}
            onCanPlay={() => setIsReady(true)}
            onError={(e) => {
              console.error('Video playback error:', e);
              setIsReady(false);
            }}
          />

          {/* Control Buttons */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 flex gap-1.5 sm:gap-2">
            {/* Fullscreen Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              onClick={toggleFullscreen}
              className="p-2 sm:p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all scale-90 sm:scale-100"
              aria-label="전체화면"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              ) : (
                <Maximize className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              )}
            </motion.button>

            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              onClick={handleCloseVideo}
              className="p-2 sm:p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all scale-90 sm:scale-100"
              aria-label="비디오 닫기"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Card Content - 전체 화면 모드에서는 숨김 */}
      <div className={`bg-slate-900/80 backdrop-blur-sm p-4 sm:p-6 border-t-2 border-white/30 shadow-lg ${isFullscreen ? 'hidden' : ''}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`px-2 py-0.5 sm:py-1 rounded-lg bg-gradient-to-r ${video.gradient} text-white text-[10px] sm:text-xs font-semibold`}>
            {video.subject}
          </div>
        </div>
        <h3 className="text-base sm:text-xl font-bold text-white mb-1 sm:mb-2 group-hover:text-primary-400 transition-colors">
          {video.title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-300">{video.description}</p>
      </div>
    </motion.div>
  );
}
