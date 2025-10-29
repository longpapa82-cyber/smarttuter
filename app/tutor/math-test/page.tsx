'use client';

// 최소한의 테스트 페이지 - Zustand 없이
// 목적: hydration 에러가 Zustand 때문인지 확인

export default function MathTestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50">
      <div className="max-w-2xl w-full p-8 bg-white rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ✅ Math Tutor Test Page
        </h1>
        <p className="text-gray-600 mb-6">
          이 페이지가 정상적으로 표시된다면:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Next.js 앱 자체는 정상 작동</li>
          <li>문제는 Zustand hydration 또는 API 호출</li>
          <li>NotificationProvider/StoreProvider 관련 이슈</li>
        </ul>
        <div className="mt-8 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <p className="text-green-800 font-semibold">
            🎯 이 페이지가 보인다면 기본 React/Next.js는 문제 없음
          </p>
        </div>
      </div>
    </div>
  );
}
