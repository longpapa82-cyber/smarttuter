'use client';

import { useState } from 'react';
import { ScienceConceptVisualizer } from '@/components/science/ScienceConceptVisualizer';

export default function TestSciencePage() {
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [concept, setConcept] = useState('');

  const concepts = [
    { label: '화학 - 원자 구조', value: '화학 원소' },
    { label: '물리 - 힘과 에너지', value: '물리 에너지' },
    { label: '생물 - 세포', value: '생물 세포' },
    { label: '지구과학 - 물의 순환', value: '지구 날씨' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          🧪 과학 시각화 테스트
        </h1>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            시각화 테스트
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {concepts.map((c) => (
              <button
                key={c.value}
                onClick={() => {
                  setConcept(c.value);
                  setShowVisualizer(true);
                }}
                className="p-6 bg-gradient-to-br from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg"
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-xl">
            <h3 className="font-semibold text-blue-900 mb-2">📝 테스트 방법</h3>
            <ol className="text-sm text-blue-800 space-y-2">
              <li>1. 위 버튼 중 하나를 클릭하세요</li>
              <li>2. 시각화 모달이 나타나면 애니메이션을 확인하세요</li>
              <li>3. X 버튼 또는 배경 클릭으로 모달을 닫을 수 있습니다</li>
            </ol>
          </div>
        </div>
      </div>

      {showVisualizer && (
        <ScienceConceptVisualizer
          concept={concept}
          onClose={() => setShowVisualizer(false)}
        />
      )}
    </div>
  );
}
