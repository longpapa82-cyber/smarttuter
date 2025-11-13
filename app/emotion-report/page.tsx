// app/emotion-report/page.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Download, Brain, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { EmotionTrendChart, EmotionPatternCard } from '@/components/emotion/EmotionTrendChart';
import {
  calculateWeeklyStats,
  calculateMonthlyStats,
  analyzeEmotionPatterns,
  exportEmotionData,
  type DailyEmotionStats,
  type EmotionPattern,
} from '@/lib/emotion/emotion-storage';
import { useAuth } from '@/hooks/useAuth';

type TimePeriod = 'week' | 'month';

export default function EmotionReportPage() {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.email || user?.id || 'guest-user';
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
  const [stats, setStats] = useState<DailyEmotionStats[]>([]);
  const [pattern, setPattern] = useState<EmotionPattern | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 로드
  useEffect(() => {
    setIsLoading(true);

    try {
      let newStats: DailyEmotionStats[];

      if (timePeriod === 'week') {
        // 이번 주 월요일부터
        const today = new Date();
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(today);
        monday.setDate(today.getDate() + mondayOffset);
        monday.setHours(0, 0, 0, 0);

        newStats = calculateWeeklyStats(userId, monday);
      } else {
        // 이번 달
        const today = new Date();
        newStats = calculateMonthlyStats(userId, today.getFullYear(), today.getMonth());
      }

      setStats(newStats);

      // 패턴 분석 (최근 30일)
      const emotionPattern = analyzeEmotionPatterns(userId, 30);
      setPattern(emotionPattern);
    } catch (error) {
      console.error('Failed to load emotion data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [timePeriod, userId]);

  // 요약 통계
  const summary = useMemo(() => {
    if (stats.length === 0) return null;

    const totalAnalyses = stats.reduce((sum, s) => sum + s.totalAnalyses, 0);
    const avgIntensity =
      stats.reduce((sum, s) => sum + s.averageIntensity, 0) / stats.length;
    const avgPositiveRate =
      stats.reduce((sum, s) => sum + s.positiveRate, 0) / stats.length;
    const totalNeedsAttention = stats.reduce((sum, s) => sum + s.needsAttentionCount, 0);

    // 가장 빈번한 감정
    const emotionCounts: Record<string, number> = {};
    stats.forEach((s) => {
      Object.entries(s.emotionCounts).forEach(([emotion, count]) => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + count;
      });
    });
    const mostFrequent = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      'neutral';

    return {
      totalAnalyses,
      avgIntensity,
      avgPositiveRate,
      totalNeedsAttention,
      mostFrequent,
    };
  }, [stats]);

  // 데이터 내보내기
  const handleExport = () => {
    const jsonData = exportEmotionData(userId);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emotion-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Brain className="w-7 h-7 text-purple-600" />
                  감정 분석 리포트
                </h1>
                <p className="text-sm text-gray-600 mt-1">학습 중 감정 변화와 패턴을 분석합니다</p>
              </div>
            </div>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>데이터 내보내기</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* 기간 선택 */}
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-600" />
          <div className="flex gap-2">
            <button
              onClick={() => setTimePeriod('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timePeriod === 'week'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              이번 주
            </button>
            <button
              onClick={() => setTimePeriod('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timePeriod === 'month'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              이번 달
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
          </div>
        ) : stats.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-12 text-center border-2 border-gray-200"
          >
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">아직 데이터가 없습니다</h3>
            <p className="text-gray-600 mb-6">
              튜터와 대화를 시작하면 감정 데이터가 수집됩니다.
            </p>
            <Link
              href="/tutor/english"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              학습 시작하기
            </Link>
          </motion.div>
        ) : (
          <>
            {/* 요약 통계 */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-4 border-2 border-purple-200"
                >
                  <div className="text-sm text-gray-600 mb-1">총 분석 횟수</div>
                  <div className="text-3xl font-bold text-purple-600">
                    {summary.totalAnalyses}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl p-4 border-2 border-blue-200"
                >
                  <div className="text-sm text-gray-600 mb-1">평균 감정 강도</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {(summary.avgIntensity * 100).toFixed(0)}%
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl p-4 border-2 border-green-200"
                >
                  <div className="text-sm text-gray-600 mb-1">긍정 비율</div>
                  <div className="text-3xl font-bold text-green-600 flex items-center gap-2">
                    {(summary.avgPositiveRate * 100).toFixed(0)}%
                    {summary.avgPositiveRate > 0.6 && (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl p-4 border-2 border-orange-200"
                >
                  <div className="text-sm text-gray-600 mb-1">주의 필요</div>
                  <div className="text-3xl font-bold text-orange-600">
                    {summary.totalNeedsAttention}회
                  </div>
                </motion.div>
              </div>
            )}

            {/* 감정 트렌드 차트 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <EmotionTrendChart stats={stats} />
            </motion.div>

            {/* 감정 패턴 분석 */}
            {pattern && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <EmotionPatternCard pattern={pattern} />
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
