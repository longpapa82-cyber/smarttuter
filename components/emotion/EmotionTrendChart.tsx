// components/emotion/EmotionTrendChart.tsx

'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Calendar, Clock, BookOpen } from 'lucide-react';
import type { DailyEmotionStats, EmotionPattern } from '@/lib/emotion/emotion-storage';
import type { EmotionCategory } from '@/types/emotion';
import { EMOTION_DISPLAY_CONFIG } from '@/types/emotion';

interface EmotionTrendChartProps {
  stats: DailyEmotionStats[];
  className?: string;
}

/**
 * 감정 트렌드 차트 컴포넌트
 *
 * 일별/주간/월간 감정 데이터 시각화
 */
export function EmotionTrendChart({ stats, className = '' }: EmotionTrendChartProps) {
  if (stats.length === 0) {
    return (
      <div
        className={`bg-white rounded-2xl p-8 border-2 border-gray-200 text-center ${className}`}
      >
        <p className="text-gray-500">감정 데이터가 아직 없습니다.</p>
        <p className="text-sm text-gray-400 mt-2">학습을 시작하면 데이터가 쌓입니다.</p>
      </div>
    );
  }

  // 최대값 계산 (정규화용)
  const maxAnalyses = Math.max(...stats.map((s) => s.totalAnalyses));
  const maxIntensity = Math.max(...stats.map((s) => s.averageIntensity));

  return (
    <div className={`bg-white rounded-2xl p-6 border-2 border-gray-200 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">감정 트렌드</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{stats.length}일 데이터</span>
        </div>
      </div>

      {/* 차트 */}
      <div className="space-y-4">
        {stats.map((stat, index) => {
          const config = EMOTION_DISPLAY_CONFIG[stat.mostFrequentEmotion];
          const heightPercentage = (stat.totalAnalyses / maxAnalyses) * 100;
          const intensityPercentage = (stat.averageIntensity / maxIntensity) * 100;

          return (
            <motion.div
              key={stat.date}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              {/* 날짜 및 요약 */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-24 text-sm font-medium text-gray-700">{formatDateKo(stat.date)}</div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{config.emoji}</span>
                  <span className="text-sm text-gray-600">{config.label}</span>
                </div>
                <div className="flex-1" />
                <div className="text-xs text-gray-500">{stat.totalAnalyses}회 분석</div>
              </div>

              {/* 바 차트 */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                  {/* 분석 횟수 바 */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${heightPercentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className={`h-full bg-gradient-to-r ${config.gradient} opacity-70`}
                  />

                  {/* 강도 표시 (오버레이) */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${intensityPercentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 + 0.2 }}
                    className="absolute top-0 left-0 h-1 bg-gray-800"
                  />

                  {/* 호버 툴팁 */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white text-xs px-2">
                    <div className="text-center">
                      <div>평균 강도: {(stat.averageIntensity * 100).toFixed(0)}%</div>
                      <div>긍정 비율: {(stat.positiveRate * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </div>

                {/* 긍정 비율 아이콘 */}
                <div className="w-12 text-center">
                  {stat.positiveRate > 0.6 ? (
                    <TrendingUp className="w-5 h-5 text-green-500 mx-auto" />
                  ) : stat.positiveRate < 0.4 ? (
                    <TrendingDown className="w-5 h-5 text-red-500 mx-auto" />
                  ) : (
                    <Minus className="w-5 h-5 text-gray-400 mx-auto" />
                  )}
                </div>
              </div>

              {/* 주의 필요 표시 */}
              {stat.needsAttentionCount > 0 && (
                <div className="mt-1 ml-28 text-xs text-orange-600">
                  ⚠️ 주의 필요: {stat.needsAttentionCount}회
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded" />
            <span>막대 너비 = 분석 횟수</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-gray-800 rounded" />
            <span>검은 선 = 감정 강도</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 감정 패턴 카드 컴포넌트
 */
interface EmotionPatternCardProps {
  pattern: EmotionPattern;
  className?: string;
}

export function EmotionPatternCard({ pattern, className = '' }: EmotionPatternCardProps) {
  return (
    <div className={`bg-white rounded-2xl p-6 border-2 border-gray-200 ${className}`}>
      <h3 className="text-xl font-bold text-gray-900 mb-6">감정 패턴 분석</h3>

      {/* 시간대별 감정 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-indigo-600" />
          <h4 className="font-semibold text-gray-800">시간대별 감정</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(pattern.timeOfDayEmotions).map(([time, emotion]) => {
            const config = EMOTION_DISPLAY_CONFIG[emotion];
            const timeLabels: Record<string, string> = {
              morning: '오전',
              afternoon: '오후',
              evening: '저녁',
              night: '밤',
            };

            return (
              <div
                key={time}
                className={`p-3 rounded-lg border-2 bg-gradient-to-br ${config.gradient} bg-opacity-10`}
                style={{ borderColor: config.color }}
              >
                <div className="text-sm font-medium text-gray-700 mb-1">{timeLabels[time]}</div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{config.emoji}</span>
                  <span className="text-sm text-gray-600">{config.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 과목별 감정 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <h4 className="font-semibold text-gray-800">과목별 감정</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(pattern.subjectEmotions).map(([subject, emotion]) => {
            const config = EMOTION_DISPLAY_CONFIG[emotion];
            const subjectLabels: Record<string, string> = {
              math: '수학',
              english: '영어',
            };

            return (
              <div
                key={subject}
                className={`p-3 rounded-lg border-2 bg-gradient-to-br ${config.gradient} bg-opacity-10`}
                style={{ borderColor: config.color }}
              >
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {subjectLabels[subject]}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{config.emoji}</span>
                  <span className="text-sm text-gray-600">{config.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 주의가 필요한 패턴 */}
      {pattern.concerningPatterns.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
            ⚠️ 주의가 필요한 패턴
          </h4>
          <ul className="space-y-1">
            {pattern.concerningPatterns.map((p, i) => (
              <li key={i} className="text-sm text-gray-700 pl-4">
                • {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 긍정적 패턴 */}
      {pattern.positivePatterns.length > 0 && (
        <div>
          <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
            ✨ 긍정적 패턴
          </h4>
          <ul className="space-y-1">
            {pattern.positivePatterns.map((p, i) => (
              <li key={i} className="text-sm text-gray-700 pl-4">
                • {p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * 날짜 한글 포맷
 */
function formatDateKo(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];

  return `${month}/${day}(${dayOfWeek})`;
}
