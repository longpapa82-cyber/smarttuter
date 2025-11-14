'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { LearningSession } from '@/lib/utils/learningData';

interface PerformanceTrendChartProps {
  sessions: LearningSession[];
  days?: number;
}

export function PerformanceTrendChart({ sessions, days = 7 }: PerformanceTrendChartProps) {
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
        mathScore: null as number | null,
        englishScore: null as number | null,
        mathCount: 0,
        englishCount: 0,
        mathSum: 0,
        englishSum: 0,
      };
    });

    // Aggregate performance data
    sessions.forEach((session) => {
      const sessionDate = new Date(session.date).toISOString().split('T')[0];
      const dayData = daysData.find((d) => d.date === sessionDate);

      if (dayData && session.performance) {
        if (session.subject === 'math') {
          dayData.mathSum += session.performance;
          dayData.mathCount++;
        } else if (session.subject === 'english') {
          dayData.englishSum += session.performance;
          dayData.englishCount++;
        }
      }
    });

    // Calculate averages
    daysData.forEach((day) => {
      if (day.mathCount > 0) {
        day.mathScore = Math.round(day.mathSum / day.mathCount);
      }
      if (day.englishCount > 0) {
        day.englishScore = Math.round(day.englishSum / day.englishCount);
      }
    });

    return daysData;
  }, [sessions, days]);

  const trends = useMemo(() => {
    const validMathScores = chartData.filter((d) => d.mathScore !== null).map((d) => d.mathScore!);
    const validEnglishScores = chartData.filter((d) => d.englishScore !== null).map((d) => d.englishScore!);

    const calculateTrend = (scores: number[]) => {
      if (scores.length < 2) return 0;
      const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
      const secondHalf = scores.slice(Math.floor(scores.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      return secondAvg - firstAvg;
    };

    return {
      math: calculateTrend(validMathScores),
      english: calculateTrend(validEnglishScores),
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => {
          if (entry.value === null) return null;
          return (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {entry.name === 'mathScore' ? '수학' : '영어'}:
                </span>
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {entry.value}점
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
    >
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        📈 성과 추이
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="mathGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id="englishGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3"/>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
          <XAxis
            dataKey="dateLabel"
            stroke="#9ca3af"
            style={{ fontSize: '12px', fontWeight: 500 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            stroke="#9ca3af"
            style={{ fontSize: '12px', fontWeight: 500 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            label={{ value: '점수', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#6b7280' } }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(139, 92, 246, 0.2)', strokeWidth: 2 }} />
          <Legend
            wrapperStyle={{ fontSize: '14px', fontWeight: 600 }}
            formatter={(value) => {
              if (value === 'mathScore') return '수학';
              if (value === 'englishScore') return '영어';
              return value;
            }}
          />
          <ReferenceLine
            y={70}
            stroke="#10b981"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{ value: '목표', position: 'right', fill: '#10b981', fontWeight: 600 }}
          />
          <Line
            type="monotone"
            dataKey="mathScore"
            stroke="url(#mathGradient)"
            strokeWidth={4}
            dot={{ fill: '#8b5cf6', r: 5, strokeWidth: 2, stroke: '#fff', filter: 'url(#shadow)' }}
            activeDot={{ r: 8, fill: '#7c3aed', stroke: '#fff', strokeWidth: 3 }}
            connectNulls
            animationDuration={1500}
            animationBegin={0}
          />
          <Line
            type="monotone"
            dataKey="englishScore"
            stroke="url(#englishGradient)"
            strokeWidth={4}
            dot={{ fill: '#ec4899', r: 5, strokeWidth: 2, stroke: '#fff', filter: 'url(#shadow)' }}
            activeDot={{ r: 8, fill: '#db2777', stroke: '#fff', strokeWidth: 3 }}
            connectNulls
            animationDuration={1500}
            animationBegin={200}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              수학 추세
            </span>
            {trends.math > 0 ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : trends.math < 0 ? (
              <TrendingDown className="w-5 h-5 text-red-600" />
            ) : null}
          </div>
          <p className={`text-2xl font-bold ${
            trends.math > 0 ? 'text-green-600' : trends.math < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trends.math > 0 ? '+' : ''}{trends.math.toFixed(1)}점
          </p>
        </div>

        <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-pink-700 dark:text-pink-300">
              영어 추세
            </span>
            {trends.english > 0 ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : trends.english < 0 ? (
              <TrendingDown className="w-5 h-5 text-red-600" />
            ) : null}
          </div>
          <p className={`text-2xl font-bold ${
            trends.english > 0 ? 'text-green-600' : trends.english < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trends.english > 0 ? '+' : ''}{trends.english.toFixed(1)}점
          </p>
        </div>
      </div>
    </motion.div>
  );
}
