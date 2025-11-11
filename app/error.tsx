"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, RefreshCw, AlertCircle } from "lucide-react";
import { captureClientError } from "@/lib/error-tracking/client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [autoRetryCount, setAutoRetryCount] = useState(0);
  const [showCacheClearHelp, setShowCacheClearHelp] = useState(false);

  useEffect(() => {
    // Send error to Custom Error Tracker
    captureClientError(error, {
      pathname: window.location.pathname,
      digest: error.digest,
    });

    console.error("Application error:", error);

    // Auto-retry once after 2 seconds (for transient errors)
    if (autoRetryCount === 0) {
      const timer = setTimeout(() => {
        console.log("Auto-retrying after error...");
        setAutoRetryCount(1);
        reset();
      }, 2000);

      return () => clearTimeout(timer);
    }

    // If auto-retry failed, show cache clear help after 5 seconds
    if (autoRetryCount === 1) {
      const timer = setTimeout(() => {
        setShowCacheClearHelp(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, reset, autoRetryCount]);

  const handleHardRefresh = () => {
    // Clear localStorage and sessionStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.clear();
        sessionStorage.clear();
        console.log('Storage cleared');
      } catch (e) {
        console.error('Failed to clear storage:', e);
      }
    }

    // Force hard reload
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold gradient-text mb-4">500</div>
          <div className="text-6xl mb-4">😵</div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {autoRetryCount === 0 ? '잠시만 기다려주세요...' : '문제가 발생했습니다'}
        </h1>
        <p className="text-gray-600 mb-8">
          {autoRetryCount === 0 ? (
            <>
              자동으로 복구를 시도하고 있습니다.
              <br />
              <span className="text-sm text-gray-500">({autoRetryCount + 1}/2)</span>
            </>
          ) : (
            <>
              일시적인 오류가 발생했습니다.
              <br />
              아래 버튼을 클릭하여 다시 시도해주세요.
            </>
          )}
        </p>

        {/* Error Details (개발 환경에서만 표시) */}
        {process.env.NODE_ENV === "development" && error && (
          <div className="mb-8 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-left">
            <p className="text-sm font-semibold text-red-800 mb-2">개발자 정보:</p>
            <p className="text-xs text-red-700 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full font-semibold hover:shadow-xl transition-all"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            다시 시도
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-full font-semibold hover:border-primary-500 transition-all"
          >
            <Home className="w-5 h-5 mr-2" />
            홈으로 이동
          </Link>
        </div>

        {/* Cache Clear Help */}
        {showCacheClearHelp && (
          <div className="mt-8 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
            <div className="flex items-start gap-3 text-left">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-yellow-800 mb-2">
                  캐시 문제일 수 있습니다
                </p>
                <p className="text-yellow-700 mb-3">
                  이전 버전이 캐시되어 있을 수 있습니다. 아래 방법을 시도해보세요:
                </p>
                <button
                  onClick={handleHardRefresh}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors"
                >
                  캐시 삭제 후 새로고침
                </button>
                <p className="text-xs text-yellow-600 mt-2">
                  또는 키보드 단축키: <br />
                  <kbd className="px-2 py-1 bg-yellow-100 rounded">Cmd+Shift+R</kbd> (Mac) /
                  <kbd className="px-2 py-1 bg-yellow-100 rounded ml-1">Ctrl+Shift+R</kbd> (Windows)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Helpful Text */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {showCacheClearHelp ? (
              <>
                그래도 문제가 해결되지 않으면
                <br />
                시크릿 모드나 다른 브라우저를 사용해보세요.
              </>
            ) : (
              <>
                문제가 계속되면 새로고침하거나
                <br />
                다른 브라우저를 사용해보세요.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
