"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { TrendingUp, AlertTriangle, Target, Clock, Award } from "lucide-react";
import type { LearningAnalytics } from "@/lib/analytics/learning-tracker";

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LearningAnalyticsDashboardProps {
  userId: string;
  subject: 'english' | 'math' | 'science' | 'social' | 'korean';
  subjectColor: string; // Tailwind color class (e.g., 'blue', 'purple')
}

export function LearningAnalyticsDashboard({
  userId,
  subject,
  subjectColor,
}: LearningAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: API 엔드포인트 생성 후 연결
      // const response = await fetch(`/api/analytics?userId=${userId}&subject=${subject}`);
      // const data = await response.json();

      // 프로토타입: learning-tracker에서 직접 가져오기
      const { getLearningAnalytics } = await import("@/lib/analytics/learning-tracker");
      const data = await getLearningAnalytics(userId, subject);
      setAnalytics(data);
    } catch (error) {
      console.error('[Dashboard] Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, subject]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // 과목별 색상 매핑
  const subjectColorMap: Record<string, { border: string; bg: string; gradient: string[] }> = {
    english: {
      border: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.2)',
      gradient: ['rgba(96, 165, 250, 0.9)', 'rgba(59, 130, 246, 0.6)', 'rgba(37, 99, 235, 0.2)']
    },
    math: {
      border: '#a855f7',
      bg: 'rgba(168, 85, 247, 0.2)',
      gradient: ['rgba(192, 132, 252, 0.9)', 'rgba(168, 85, 247, 0.6)', 'rgba(147, 51, 234, 0.2)']
    },
    science: {
      border: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.2)',
      gradient: ['rgba(34, 211, 238, 0.9)', 'rgba(6, 182, 212, 0.6)', 'rgba(8, 145, 178, 0.2)']
    },
    social: {
      border: '#f97316',
      bg: 'rgba(249, 115, 22, 0.2)',
      gradient: ['rgba(251, 146, 60, 0.9)', 'rgba(249, 115, 22, 0.6)', 'rgba(234, 88, 12, 0.2)']
    },
    korean: {
      border: '#10b981',
      bg: 'rgba(16, 185, 129, 0.2)',
      gradient: ['rgba(52, 211, 153, 0.9)', 'rgba(16, 185, 129, 0.6)', 'rgba(5, 150, 105, 0.2)']
    }
  };

  const colorConfig = subjectColorMap[subject] || subjectColorMap.english;

  // Chart 데이터 준비 - useMemo로 최적화 (Hooks는 early return 전에 호출)
  const timelineChartData = useMemo(() => {
    if (!analytics) return { labels: [], datasets: [] };
    return {
      labels: analytics.timeline.map(d => {
        const date = new Date(d.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          label: '학습 시간 (분)',
          data: analytics.timeline.map(d => d.minutes),
          borderColor: colorConfig.border,
          backgroundColor: colorConfig.bg,
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: colorConfig.border,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: colorConfig.border,
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 3,
        },
      ],
    };
  }, [analytics, colorConfig]);

  const timelineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: colorConfig.border,
        borderWidth: 2,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context: any) => ` 학습 시간: ${context.parsed.y}분`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            weight: 500,
          },
          color: '#6b7280',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
            weight: 500,
          },
          color: '#6b7280',
          callback: (value: any) => `${value}분`,
        },
      },
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart' as const,
    },
  };

  // 개념 숙달도 차트 데이터 - useMemo로 최적화
  const conceptChartData = useMemo(() => {
    if (!analytics) return { labels: [], datasets: [] };
    return {
      labels: analytics.conceptMastery.map(c => c.concept),
      datasets: [
        {
          label: '정확도',
          data: analytics.conceptMastery.map(c => (c.accuracy * 100).toFixed(1)),
          backgroundColor: analytics.conceptMastery.map(c => {
            if (c.accuracy >= 0.9) return '#22c55e'; // green-500
            if (c.accuracy >= 0.7) return '#3b82f6'; // blue-500
            if (c.accuracy >= 0.5) return '#f97316'; // orange-500
            return '#ef4444'; // red-500
          }),
          borderColor: analytics.conceptMastery.map(c => {
            if (c.accuracy >= 0.9) return '#16a34a'; // green-600
            if (c.accuracy >= 0.7) return '#2563eb'; // blue-600
            if (c.accuracy >= 0.5) return '#ea580c'; // orange-600
            return '#dc2626'; // red-600
          }),
          borderWidth: 2,
          borderRadius: 6,
          barThickness: 24,
        },
      ],
    };
  }, [analytics]);

  // Early returns after hooks
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12 text-gray-500">
        학습 데이터를 불러올 수 없습니다.
      </div>
    );
  }

  const conceptOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderWidth: 2,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context: any) => ` 정확도: ${context.parsed.x}%`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
            weight: 500,
          },
          color: '#6b7280',
          callback: (value: any) => `${value}%`,
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: 600,
          },
          color: '#374151',
        },
      },
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart' as const,
    },
  };

  // 레벨 색상 매핑
  const levelColors: Record<string, string> = {
    expert: 'bg-green-100 text-green-800 border-green-300',
    proficient: 'bg-blue-100 text-blue-800 border-blue-300',
    intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    beginner: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  const levelLabels: Record<string, string> = {
    expert: '전문가',
    proficient: '숙련',
    intermediate: '중급',
    beginner: '초급',
  };

  return (
    <div className="space-y-6">
      {/* 전체 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg bg-${subjectColor}-50`}>
              <Clock className={`w-6 h-6 text-${subjectColor}-600`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">총 학습 시간</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.totalStats.totalMinutes}분
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg bg-${subjectColor}-50`}>
              <Target className={`w-6 h-6 text-${subjectColor}-600`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">평균 정확도</p>
              <p className="text-2xl font-bold text-gray-900">
                {(analytics.totalStats.averageAccuracy * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg bg-${subjectColor}-50`}>
              <TrendingUp className={`w-6 h-6 text-${subjectColor}-600`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">연속 학습</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.totalStats.currentStreak}일
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg bg-${subjectColor}-50`}>
              <Award className={`w-6 h-6 text-${subjectColor}-600`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">학습한 개념</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.totalStats.conceptsCovered}개
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 학습 시간 타임라인 차트 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600" />
          학습 시간 타임라인 (최근 30일)
        </h3>
        <div className="h-64">
          <Line data={timelineChartData} options={timelineOptions} />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 개념별 숙달도 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-gray-600" />
            개념별 숙달도
          </h3>
          <div className="h-80">
            <Bar data={conceptChartData} options={conceptOptions} />
          </div>
        </motion.div>

        {/* 취약 개념 TOP 3 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            집중 학습이 필요한 개념 TOP 3
          </h3>
          <div className="space-y-4">
            {analytics.weakConcepts.map((weak, index) => (
              <div
                key={weak.concept}
                className="p-4 rounded-lg bg-orange-50 border border-orange-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-sm font-bold">
                      {index + 1}
                    </span>
                    <h4 className="font-semibold text-gray-900">{weak.concept}</h4>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    weak.priority === 'high' ? 'bg-red-100 text-red-800' :
                    weak.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {weak.priority === 'high' ? '긴급' : weak.priority === 'medium' ? '중요' : '일반'}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>오답률: <span className="font-semibold text-orange-700">{(weak.failureRate * 100).toFixed(1)}%</span></p>
                  <p>평균 응답 시간: <span className="font-semibold">{Math.round(weak.avgResponseTime)}초</span></p>
                  <p className="mt-2 text-gray-600 italic">💡 {weak.recommendedAction}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI 추천 학습 경로 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className={`bg-gradient-to-r from-${subjectColor}-50 to-${subjectColor}-100 rounded-xl p-6 border border-${subjectColor}-200 shadow-sm`}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          🤖 AI 추천 학습 경로
        </h3>
        <p className="text-gray-700 mb-4">{analytics.recommendedPath.reason}</p>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">다음에 학습하면 좋은 개념:</p>
          <div className="flex flex-wrap gap-2">
            {analytics.recommendedPath.nextConcepts.map((concept) => (
              <span
                key={concept}
                className={`px-3 py-1 rounded-full bg-white border border-${subjectColor}-300 text-${subjectColor}-800 text-sm font-medium`}
              >
                {concept}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            예상 소요 시간: <span className="font-semibold">{analytics.recommendedPath.estimatedTime}분</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
