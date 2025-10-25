"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅 (프로덕션에서는 에러 모니터링 서비스로 전송)
    console.error("Application error:", error);
  }, [error]);

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
          문제가 발생했습니다
        </h1>
        <p className="text-gray-600 mb-8">
          일시적인 오류가 발생했습니다.
          <br />
          잠시 후 다시 시도해주세요.
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

        {/* Helpful Text */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            문제가 계속되면 새로고침하거나
            <br />
            다른 브라우저를 사용해보세요.
          </p>
        </div>
      </div>
    </div>
  );
}
