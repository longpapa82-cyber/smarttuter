import { useState, useCallback, useEffect, RefObject } from 'react';

interface UseFullscreenReturn {
  isFullscreen: boolean;
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  toggleFullscreen: () => Promise<void>;
  isSupported: boolean;
}

/**
 * useFullscreen Hook
 *
 * 브라우저별 Fullscreen API 호환성을 처리하는 훅입니다.
 *
 * @param elementRef - 전체 화면으로 표시할 요소의 ref
 * @returns 전체 화면 제어 함수들과 상태
 *
 * @example
 * const containerRef = useRef<HTMLDivElement>(null);
 * const { isFullscreen, toggleFullscreen, isSupported } = useFullscreen(containerRef);
 */
export function useFullscreen(elementRef: RefObject<HTMLElement>): UseFullscreenReturn {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen API 지원 여부 확인
  const isSupported = typeof document !== 'undefined' && (
    !!document.fullscreenEnabled ||
    !!(document as any).webkitFullscreenEnabled ||
    !!(document as any).mozFullScreenEnabled ||
    !!(document as any).msFullscreenEnabled
  );

  /**
   * 전체 화면 진입
   */
  const enterFullscreen = useCallback(async () => {
    if (!elementRef.current || !isSupported) {
      console.warn('[useFullscreen] Element ref is null or fullscreen not supported');
      return;
    }

    try {
      const element = elementRef.current;

      // 브라우저별 Fullscreen API 호출
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        // Safari/Chrome (iOS 제외)
        await (element as any).webkitRequestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        // Firefox
        await (element as any).mozRequestFullScreen();
      } else if ((element as any).msRequestFullscreen) {
        // IE11/Edge Legacy
        await (element as any).msRequestFullscreen();
      } else {
        console.warn('[useFullscreen] No fullscreen method available');
        return;
      }

      setIsFullscreen(true);
    } catch (error) {
      console.error('[useFullscreen] Failed to enter fullscreen:', error);

      // 사용자가 거부한 경우 등의 에러는 무시
      if (error instanceof Error && !error.message.includes('request')) {
        throw error;
      }
    }
  }, [elementRef, isSupported]);

  /**
   * 전체 화면 종료
   */
  const exitFullscreen = useCallback(async () => {
    if (!isSupported) {
      console.warn('[useFullscreen] Fullscreen not supported');
      return;
    }

    try {
      // 브라우저별 Fullscreen 종료 API 호출
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }

      setIsFullscreen(false);
    } catch (error) {
      console.error('[useFullscreen] Failed to exit fullscreen:', error);

      // 이미 종료된 경우 등의 에러는 무시
      if (error instanceof Error && !error.message.includes('not in fullscreen')) {
        throw error;
      }
    }
  }, [isSupported]);

  /**
   * 전체 화면 토글
   */
  const toggleFullscreen = useCallback(async () => {
    if (isFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  /**
   * 전체 화면 상태 변경 이벤트 리스너
   */
  useEffect(() => {
    if (!isSupported) return;

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      setIsFullscreen(isCurrentlyFullscreen);
    };

    // 브라우저별 fullscreenchange 이벤트 등록
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [isSupported]);

  /**
   * ESC 키로 전체 화면 종료 시 상태 동기화
   */
  useEffect(() => {
    if (!isSupported) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // F 키로 전체 화면 토글
      if (e.key === 'f' || e.key === 'F') {
        if (isFullscreen) {
          e.preventDefault();
          exitFullscreen();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, exitFullscreen, isSupported]);

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
    isSupported
  };
}
