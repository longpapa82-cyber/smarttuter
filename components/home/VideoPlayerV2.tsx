'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipForward } from 'lucide-react';

interface VideoState {
  isPlaying: boolean;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  hasError: boolean;
}

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
}

export function VideoPlayer({
  src,
  poster,
  autoPlay = true,
  muted = true,
  loop = true,
  className = '',
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<VideoState>({
    isPlaying: false,
    isMuted: true,
    currentTime: 0,
    duration: 0,
    isLoading: true,
    hasError: false,
  });

  // Toggle functions with useCallback
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (state.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [state.isPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMuted = !state.isMuted;
      videoRef.current.muted = newMuted;
      setState(prev => ({ ...prev, isMuted: newMuted }));

      // 사용자 선호도 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem('aipark_video_muted', String(newMuted));
      }
    }
  }, [state.isMuted]);

  // 자동 재생 시도
  useEffect(() => {
    if (autoPlay && videoRef.current) {
      const playPromise = videoRef.current.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log('Autoplay prevented:', error);
          // 자동재생이 차단된 경우 사용자에게 알림
          setState(prev => ({ ...prev, isPlaying: false }));
        });
      }
    }
  }, [autoPlay]);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 입력 필드에서는 작동하지 않도록
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ': // Space
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleMute]);

  const skipVideo = () => {
    // 다음 섹션으로 스크롤
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`relative w-full h-full group ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ aspectRatio: '16/9' }}
        onPlay={() => setState(prev => ({ ...prev, isPlaying: true }))}
        onPause={() => setState(prev => ({ ...prev, isPlaying: false }))}
        onLoadedMetadata={(e) => {
          const video = e.currentTarget;
          if (video) {
            const videoDuration = video.duration;
            if (typeof videoDuration === 'number' && !isNaN(videoDuration)) {
              setState(prev => ({
                ...prev,
                duration: videoDuration,
                isLoading: false,
              }));
            }
          }
        }}
        onError={() => setState(prev => ({ ...prev, hasError: true, isLoading: false }))}
        onTimeUpdate={(e) => {
          const video = e.currentTarget;
          if (video) {
            const videoTime = video.currentTime;
            if (typeof videoTime === 'number' && !isNaN(videoTime)) {
              setState(prev => ({ ...prev, currentTime: videoTime }));
            }
          }
        }}
        aria-label="AI Park 소개 영상"
      />
      {/* 자막 파일은 추후 추가 가능 */}

      {/* Loading Overlay */}
      {state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white"></div>
        </div>
      )}

      {/* Error State */}
      {state.hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center">
            <p className="text-xl mb-2">영상을 불러올 수 없습니다</p>
            <p className="text-sm text-gray-400">잠시 후 다시 시도해주세요</p>
          </div>
        </div>
      )}

      {/* Custom Controls Overlay - Desktop: hover로 표시, Mobile: 항상 표시 */}
      <div className="absolute inset-0 flex items-end p-4 sm:p-6 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-3 sm:gap-4 w-full">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-white"
            aria-label={state.isPlaying ? '일시정지' : '재생'}
          >
            {state.isPlaying ? (
              <Pause className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            ) : (
              <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5" />
            )}
          </button>

          {/* Mute/Unmute */}
          <button
            onClick={toggleMute}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-white"
            aria-label={state.isMuted ? '음소거 해제' : '음소거'}
          >
            {state.isMuted ? (
              <VolumeX className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            )}
          </button>

          {/* Progress Bar */}
          <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden hidden sm:block">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${state.duration ? (state.currentTime / state.duration) * 100 : 0}%` }}
            />
          </div>

          {/* Skip Video - Desktop */}
          <button
            onClick={skipVideo}
            className="hidden sm:flex px-4 py-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 items-center gap-2 text-white text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="영상 건너뛰기"
          >
            <span className="hidden md:inline">영상 건너뛰기</span>
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Screen Reader Status */}
      <div className="sr-only" role="status" aria-live="polite">
        {state.isPlaying ? '영상이 재생 중입니다' : '영상이 일시정지되었습니다'}
      </div>
    </div>
  );
}
