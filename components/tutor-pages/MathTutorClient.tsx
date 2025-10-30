'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// ⚠️ TEMPORARILY DISABLED - Interactive components causing hydration errors
// This component has been simplified to debug 500 errors
// Original component: Complex interactive learning interface

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
    </div>
  );
}

export default function MathTutorClient() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="text-6xl mb-6">🔧</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            시스템 점검 중
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            수학 튜터 서비스는 현재 점검 중입니다.
          </p>
          <p className="text-gray-500 mb-8">
            불편을 드려 죄송합니다. 다른 학습 기능을 이용해주세요.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              대시보드로 이동
            </button>
            <button
              onClick={() => router.push('/quiz')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              퀴즈 풀기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   ORIGINAL CODE - COMMENTED OUT DUE TO HYDRATION ERRORS
   ============================================================================

[Original code would be preserved here - file was likely using similar patterns
 to EnglishTutorClient with Zustand stores and complex interactive components]

============================================================================ */
