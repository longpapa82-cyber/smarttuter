'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { LearningSession } from '@/lib/utils/learningData';

interface StudyTimeChartProps {
  sessions: LearningSession[];
  days?: number; // Number of days to show (default: 7)
}

export function StudyTimeChart({ sessions, days = 7 }: StudyTimeChartProps) {
  const chartData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate last N days
    const daysData = Array.from({ length: days }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (days - 1 - i));
      return {
        date: date.toISOString().split('T')[0],
        dateLabel: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        math: 0,
        english: 0,
        total: 0,
      };
    });

    // Aggregate session data by date
    sessions.forEach((session) => {
      const sessionDate = new Date(session.date).toISOString().split('T')[0];
      const dayData = daysData.find((d) => d.date === sessionDate);

      if (dayData) {
        const minutes = session.duration;
        if (session.subject === 'math') {
          dayData.math += minutes;
        } else if (session.subject === 'english') {
          dayData.english += minutes;
        }
        dayData.total += minutes;
      }
    });

    return daysData;
  }, [sessions, days]);

  const maxValue = useMemo(() => {
    return Math.max(...chartData.map((d) => d.total), 60); // Minimum 60 for better visualization
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {entry.name === 'math' ? '수학' : entry.name === 'english' ? '영어' : '전체'}:
              </span>
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {Math.round(entry.value)}분
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
    >
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        📊 일별 학습 시간
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorMath" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorEnglish" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
          <XAxis
            dataKey="dateLabel"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickLine={false}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickLine={false}
            label={{ value: '분', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
            domain={[0, maxValue]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '14px' }}
            formatter={(value) => {
              if (value === 'math') return '수학';
              if (value === 'english') return '영어';
              return value;
            }}
          />
          <Area
            type="monotone"
            dataKey="math"
            stackId="1"
            stroke="#8b5cf6"
            fill="url(#colorMath)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="english"
            stackId="1"
            stroke="#ec4899"
            fill="url(#colorEnglish)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">평균 학습 시간</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {Math.round(chartData.reduce((sum, d) => sum + d.total, 0) / days)}분/일
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">최대 학습 시간</p>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {Math.max(...chartData.map((d) => d.total))}분
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">총 학습 시간</p>
          <p className="text-lg font-bold text-pink-600 dark:text-pink-400">
            {Math.round(chartData.reduce((sum, d) => sum + d.total, 0) / 60)}시간
          </p>
        </div>
      </div>
    </motion.div>
  );
}
