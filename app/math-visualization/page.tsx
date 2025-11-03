// app/math-visualization/page.tsx
'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Calculator, Sparkles } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { VariableSlider } from '@/types/math-visualization';

// Dynamic import for heavy chart component
const InteractiveFunctionGraph = dynamic(
  () => import('@/components/math/InteractiveFunctionGraph').then(mod => ({ default: mod.InteractiveFunctionGraph })),
  {
    loading: () => (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-600 dark:text-gray-400">그래프를 불러오는 중...</p>
          </div>
        </div>
      </div>
    ),
    ssr: false, // Chart libraries often need window object
  }
);

// 수학 예제 데이터
const MATH_EXAMPLES = {
  linear: {
    title: '일차함수',
    description: 'y = ax + b 형태의 직선 그래프',
    expression: 'a * x + b',
    sliders: [
      {
        variable: 'a',
        label: '기울기 (a)',
        min: -5,
        max: 5,
        step: 0.1,
        defaultValue: 1,
        value: 1,
      },
      {
        variable: 'b',
        label: 'y절편 (b)',
        min: -10,
        max: 10,
        step: 0.5,
        defaultValue: 0,
        value: 0,
      },
    ] as VariableSlider[],
    questions: [
      'a 값을 변경하면 그래프의 기울기가 어떻게 변하나요?',
      'b 값을 변경하면 그래프가 어느 방향으로 이동하나요?',
      'a가 음수일 때와 양수일 때 그래프의 차이는?',
    ],
  },
  quadratic: {
    title: '이차함수',
    description: 'y = ax² + bx + c 형태의 포물선 그래프',
    expression: 'a * x^2 + b * x + c',
    sliders: [
      {
        variable: 'a',
        label: '이차항 계수 (a)',
        min: -3,
        max: 3,
        step: 0.1,
        defaultValue: 1,
        value: 1,
      },
      {
        variable: 'b',
        label: '일차항 계수 (b)',
        min: -5,
        max: 5,
        step: 0.5,
        defaultValue: 0,
        value: 0,
      },
      {
        variable: 'c',
        label: '상수항 (c)',
        min: -5,
        max: 5,
        step: 0.5,
        defaultValue: 0,
        value: 0,
      },
    ] as VariableSlider[],
    questions: [
      'a 값의 절댓값이 커지면 그래프가 어떻게 변하나요?',
      'a가 양수일 때와 음수일 때의 차이는?',
      '꼭짓점의 위치는 어떤 계수에 영향을 받나요?',
    ],
  },
  cubic: {
    title: '삼차함수',
    description: 'y = ax³ + bx² + cx + d 형태의 곡선 그래프',
    expression: 'a * x^3 + b * x^2 + c * x + d',
    sliders: [
      {
        variable: 'a',
        label: '삼차항 계수 (a)',
        min: -2,
        max: 2,
        step: 0.1,
        defaultValue: 1,
        value: 1,
      },
      {
        variable: 'b',
        label: '이차항 계수 (b)',
        min: -3,
        max: 3,
        step: 0.5,
        defaultValue: 0,
        value: 0,
      },
      {
        variable: 'c',
        label: '일차항 계수 (c)',
        min: -3,
        max: 3,
        step: 0.5,
        defaultValue: 0,
        value: 0,
      },
      {
        variable: 'd',
        label: '상수항 (d)',
        min: -5,
        max: 5,
        step: 0.5,
        defaultValue: 0,
        value: 0,
      },
    ] as VariableSlider[],
    questions: [
      'a 값이 양수일 때와 음수일 때 그래프의 모양은?',
      '변곡점은 어디에 위치하나요?',
      '삼차함수의 대칭성은 어떻게 나타나나요?',
    ],
  },
  sin: {
    title: '삼각함수 (사인)',
    description: 'y = a × sin(bx + c) 형태의 주기 함수',
    expression: 'a * sin(b * x + c)',
    sliders: [
      {
        variable: 'a',
        label: '진폭 (a)',
        min: 0.1,
        max: 5,
        step: 0.1,
        defaultValue: 1,
        value: 1,
      },
      {
        variable: 'b',
        label: '주기 계수 (b)',
        min: 0.1,
        max: 3,
        step: 0.1,
        defaultValue: 1,
        value: 1,
      },
      {
        variable: 'c',
        label: '위상 (c)',
        min: -3.14,
        max: 3.14,
        step: 0.1,
        defaultValue: 0,
        value: 0,
      },
    ] as VariableSlider[],
    questions: [
      'a 값이 커지면 그래프가 어떻게 변하나요?',
      'b 값이 주기에 어떤 영향을 주나요?',
      'c 값은 그래프를 어느 방향으로 이동시키나요?',
    ],
  },
  exponential: {
    title: '지수함수',
    description: 'y = a × b^x 형태의 지수 성장/감소 그래프',
    expression: 'a * b^x',
    sliders: [
      {
        variable: 'a',
        label: '초기값 (a)',
        min: 0.1,
        max: 5,
        step: 0.1,
        defaultValue: 1,
        value: 1,
      },
      {
        variable: 'b',
        label: '밑 (b)',
        min: 0.1,
        max: 3,
        step: 0.1,
        defaultValue: 2,
        value: 2,
      },
    ] as VariableSlider[],
    config: {
      yMin: -2,
      yMax: 20,
    },
    questions: [
      'b > 1일 때와 0 < b < 1일 때의 차이는?',
      'a 값이 그래프에 어떤 영향을 주나요?',
      '지수함수의 점근선은 어디인가요?',
    ],
  },
};

type ExampleKey = keyof typeof MATH_EXAMPLES;

export default function MathVisualizationPage() {
  const [selectedExample, setSelectedExample] = useState<ExampleKey>('quadratic');
  const example = MATH_EXAMPLES[selectedExample];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/dashboard">
            <motion.button
              whileHover={{ x: -5 }}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>대시보드로 돌아가기</span>
            </motion.button>
          </Link>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl">
              <Calculator className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                인터랙티브 수학 시각화 🔢
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                슬라이더로 함수를 조작하며 수학 개념을 탐구하세요
              </p>
            </div>
          </div>
        </div>

        {/* 예제 선택 */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              함수 유형 선택
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {(Object.keys(MATH_EXAMPLES) as ExampleKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedExample(key)}
                  className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                    selectedExample === key
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {MATH_EXAMPLES[key].title}
                </button>
              ))}
            </div>

            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {example.description}
              </p>
            </div>
          </div>
        </div>

        {/* 인터랙티브 그래프 */}
        <motion.div
          key={selectedExample}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <InteractiveFunctionGraph
            title={example.title}
            expression={example.expression}
            sliders={example.sliders}
          />
        </motion.div>

        {/* 탐구 질문 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              탐구해보세요!
            </h3>
          </div>

          <div className="space-y-3">
            {example.questions.map((question, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl"
              >
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <p className="text-gray-700 dark:text-gray-300">{question}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 학습 팁 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <h3 className="text-xl font-bold mb-3">💡 학습 팁</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>슬라이더를 천천히 움직이며 그래프의 변화를 관찰하세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>극단적인 값 (최소값, 최대값)을 시도해보세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>0을 기준으로 양수와 음수를 비교해보세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>확대/축소 버튼으로 그래프의 세부 모양을 탐구하세요</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
