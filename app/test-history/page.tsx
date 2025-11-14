'use client';

import { useState } from 'react';
import { HistoryTimeline } from '@/components/social/HistoryTimeline';

export default function TestHistoryPage() {
  const [showTimeline, setShowTimeline] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('고대');

  const periods = ['고대', '중세', '근대', '현대'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          📜 한국사 타임라인 테스트
        </h1>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            시대별 타임라인
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => {
                  setSelectedPeriod(period);
                  setShowTimeline(true);
                }}
                className="p-6 bg-gradient-to-br from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg"
              >
                {period}
              </button>
            ))}
          </div>

          <div className="mt-8">
            <button
              onClick={() => {
                setSelectedPeriod('고대');
                setShowTimeline(true);
              }}
              className="w-full p-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl font-bold text-xl transition-all hover:scale-105 shadow-lg"
            >
              전체 타임라인 보기
            </button>
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-xl">
            <h3 className="font-semibold text-blue-900 mb-2">📝 테스트 방법</h3>
            <ol className="text-sm text-blue-800 space-y-2">
              <li>1. 시대 버튼을 클릭하면 해당 시대부터 타임라인이 열립니다</li>
              <li>2. 타임라인에서 좌우 화살표로 시대 이동 가능</li>
              <li>3. 역사 사건 카드를 클릭하면 상세 정보가 나타납니다</li>
              <li>4. X 버튼 또는 배경 클릭으로 닫을 수 있습니다</li>
            </ol>
          </div>
        </div>
      </div>

      {showTimeline && (
        <HistoryTimeline
          period={selectedPeriod}
          onClose={() => setShowTimeline(false)}
        />
      )}
    </div>
  );
}
