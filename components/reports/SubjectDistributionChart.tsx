'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { Calculator, BookOpen } from 'lucide-react';
import { LearningSession } from '@/lib/utils/learningData';

interface SubjectDistributionChartProps {
  sessions: LearningSession[];
}

const COLORS = {
  math: '#8b5cf6', // Purple
  english: '#ec4899', // Pink
};

const GRADIENT_COLORS = {
  math: ['#a78bfa', '#8b5cf6', '#7c3aed'], // Purple gradient
  english: ['#f472b6', '#ec4899', '#db2777'], // Pink gradient
};

export function SubjectDistributionChart({ sessions }: SubjectDistributionChartProps) {
  const { chartData, stats } = useMemo(() => {
    const mathSessions = sessions.filter((s) => s.subject === 'math');
    const englishSessions = sessions.filter((s) => s.subject === 'english');

    const mathTime = mathSessions.reduce((sum, s) => sum + s.duration, 0);
    const englishTime = englishSessions.reduce((sum, s) => sum + s.duration, 0);
    const totalTime = mathTime + englishTime;

    const chartData = [
      {
        name: '수학',
        value: mathTime,
        percentage: totalTime > 0 ? Math.round((mathTime / totalTime) * 100) : 0,
        sessions: mathSessions.length,
      },
      {
        name: '영어',
        value: englishTime,
        percentage: totalTime > 0 ? Math.round((englishTime / totalTime) * 100) : 0,
        sessions: englishSessions.length,
      },
    ];

    return {
      chartData: chartData.filter((d) => d.value > 0),
      stats: {
        math: {
          time: mathTime,
          sessions: mathSessions.length,
          avgScore: mathSessions.length > 0
            ? Math.round(mathSessions.reduce((sum, s) => sum + (s.performance || 0), 0) / mathSessions.length)
            : 0,
        },
        english: {
          time: englishTime,
          sessions: englishSessions.length,
          avgScore: englishSessions.length > 0
            ? Math.round(englishSessions.reduce((sum, s) => sum + (s.performance || 0), 0) / englishSessions.length)
            : 0,
        },
        total: totalTime,
      },
    };
  }, [sessions]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-semibold text-gray-900 dark:text-white mb-2">{data.name}</p>
        <div className="space-y-1 text-sm">
          <p className="text-gray-600 dark:text-gray-300">
            시간: <span className="font-semibold">{Math.round(data.value)}분</span>
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            비율: <span className="font-semibold">{data.percentage}%</span>
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            세션: <span className="font-semibold">{data.sessions}회</span>
          </p>
        </div>
      </div>
    );
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    }
    return `${mins}분`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
    >
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        🎯 과목별 학습 분포
      </h3>

      {chartData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <defs>
                <linearGradient id="mathPieGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={GRADIENT_COLORS.math[0]} />
                  <stop offset="50%" stopColor={GRADIENT_COLORS.math[1]} />
                  <stop offset="100%" stopColor={GRADIENT_COLORS.math[2]} />
                </linearGradient>
                <linearGradient id="englishPieGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={GRADIENT_COLORS.english[0]} />
                  <stop offset="50%" stopColor={GRADIENT_COLORS.english[1]} />
                  <stop offset="100%" stopColor={GRADIENT_COLORS.english[2]} />
                </linearGradient>
                <filter id="pieShadow">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.3"/>
                </filter>
              </defs>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={{
                  stroke: '#9ca3af',
                  strokeWidth: 2
                }}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={85}
                fill="#8884d8"
                dataKey="value"
                animationDuration={1500}
                animationBegin={0}
                stroke="#fff"
                strokeWidth={3}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.name === '수학' ? 'url(#mathPieGradient)' : 'url(#englishPieGradient)'}
                    filter="url(#pieShadow)"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-6 space-y-4">
            {/* Math Stats */}
            <div className="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                <Calculator className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">수학</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">시간</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatMinutes(stats.math.time)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">세션</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {stats.math.sessions}회
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">평균 점수</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {stats.math.avgScore}점
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* English Stats */}
            <div className="flex items-start gap-4 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
              <div className="p-2 bg-pink-100 dark:bg-pink-800 rounded-lg">
                <BookOpen className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">영어</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">시간</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatMinutes(stats.english.time)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">세션</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {stats.english.sessions}회
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">평균 점수</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {stats.english.avgScore}점
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p className="text-lg">아직 학습 데이터가 없습니다</p>
          <p className="text-sm mt-2">학습을 시작하면 여기에 통계가 표시됩니다</p>
        </div>
      )}
    </motion.div>
  );
}
