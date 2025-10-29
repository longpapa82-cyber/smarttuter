'use client';

import { useEffect, useState } from 'react';

// Zustand는 사용하지만 API 호출은 없는 테스트
// 목적: Zustand hydration이 문제인지 확인

import { useUserStore } from '@/lib/gamification/store';

export default function MathTest2Page() {
  const [isMounted, setIsMounted] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    try {
      // Zustand store 접근 시도
      const unsubscribe = useUserStore.subscribe((state) => {
        setProfile(state.profile);
      });

      setProfile(useUserStore.getState().profile);

      return () => unsubscribe();
    } catch (err: any) {
      setError(err.message);
    }
  }, [isMounted]);

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-2xl w-full p-8 bg-white rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🧪 Zustand Hydration Test
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-red-800 font-semibold">❌ Error: {error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-700">Mounted:</p>
            <p className="text-gray-900">{isMounted ? '✅ Yes' : '❌ No'}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-700">Profile:</p>
            <pre className="text-sm text-gray-900 mt-2 overflow-auto">
              {JSON.stringify(profile, null, 2) || 'null'}
            </pre>
          </div>

          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <p className="text-green-800">
              {profile ? '✅ Zustand working!' : '⚠️ No profile (onboarding needed)'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
