'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Home,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  BookOpen,
  Calculator,
  Award,
  Target,
  Lightbulb,
  BarChart3,
  Download,
  RefreshCw,
} from 'lucide-react';
import {
  getTodayReport,
  getWeeklyReport,
  getAllSessions,
  generateDemoData,
  type DailyReport,
  type WeeklyReport,
  type LearningSession,
} from '@/lib/utils/learningData';
import { StudyTimeChart } from '@/components/reports/StudyTimeChart';
import { PerformanceTrendChart } from '@/components/reports/PerformanceTrendChart';
import { SubjectDistributionChart } from '@/components/reports/SubjectDistributionChart';
import { generateLearningReportPDF } from '@/lib/utils/pdf-generator';

export default function LearningReportPage() {
  const router = useRouter();
  const [todayReport, setTodayReport] = useState<DailyReport | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [allSessions, setAllSessions] = useState<LearningSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'today' | 'week'>('today');

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIsLoading(true);
    try {
      const sessions = getAllSessions();

      // Generate demo data if no sessions exist
      if (sessions.length === 0) {
        generateDemoData();
        const demoSessions = getAllSessions();
        setAllSessions(demoSessions);
      } else {
        setAllSessions(sessions);
      }

      const today = getTodayReport();
      const week = getWeeklyReport();

      setTodayReport(today);
      setWeeklyReport(week);
    } catch (error) {
      console.error('Error loading learning data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    }
    return `${mins}분`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const handleDownloadPDF = async () => {
    try {
      const today = new Date();
      const reportDate = today.toISOString().split('T')[0].replace(/-/g, '');
      const userName = '학습자'; // Default username, can be replaced with actual user data

      await generateLearningReportPDF(userName, reportDate);
    } catch (error) {
      console.error('PDF download error:', error);
      alert('PDF 다운로드 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const currentReport = viewMode === 'today' ? todayReport : weeklyReport;
  const hasSessions = allSessions.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="text-sm font-medium">대시보드</span>
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                학습 리포트
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="새로고침"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">PDF 다운로드</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 sm:py-8 lg:py-10">
        {!hasSessions ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              아직 학습 데이터가 없습니다
            </h3>
            <p className="text-gray-600 mb-6">
              수학 또는 영어 튜터와 대화를 시작하면<br />
              학습 리포트가 자동으로 생성됩니다!
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/tutor/english">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  영어 튜터 시작
                </button>
              </Link>
              <Link href="/tutor/math">
                <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                  수학 튜터 시작
                </button>
              </Link>
            </div>
            <button
              onClick={() => {
                generateDemoData();
                loadData();
              }}
              className="mt-6 text-sm text-purple-600 hover:text-purple-800 underline"
            >
              데모 데이터로 미리보기
            </button>
          </div>
        ) : (
          <div id="learning-report-content" className="space-y-6">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-center gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm w-fit mx-auto">
              <button
                onClick={() => setViewMode('today')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'today'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                오늘
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'week'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                이번 주
              </button>
            </div>

            {viewMode === 'today' && todayReport && (
              <TodayReportView report={todayReport} formatMinutes={formatMinutes} />
            )}

            {viewMode === 'week' && weeklyReport && (
              <WeeklyReportView
                report={weeklyReport}
                formatMinutes={formatMinutes}
                formatDate={formatDate}
                sessions={allSessions}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Today Report View Component
function TodayReportView({
  report,
  formatMinutes,
}: {
  report: DailyReport;
  formatMinutes: (minutes: number) => string;
}) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8" />
            <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
              오늘
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{formatMinutes(report.totalTime)}</h3>
          <p className="text-blue-100">총 학습 시간</p>
        </motion.div>

        {/* Sessions Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <MessageSquare className="w-8 h-8" />
            <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
              세션
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{report.sessions.length}회</h3>
          <p className="text-purple-100">학습 세션</p>
        </motion.div>

        {/* Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <Award className="w-8 h-8" />
            <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
              성과
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{report.averagePerformance}점</h3>
          <p className="text-green-100">평균 참여도</p>
        </motion.div>
      </div>

      {/* Subject Breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">과목별 학습 시간</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Calculator className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">수학</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatMinutes(report.subjectBreakdown.math)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">영어</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatMinutes(report.subjectBreakdown.english)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      {report.sessions.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">오늘의 학습 세션</h3>
          <div className="space-y-3">
            {report.sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      session.subject === 'math'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {session.subject === 'math' ? (
                      <Calculator className="w-5 h-5" />
                    ) : (
                      <BookOpen className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {session.subject === 'math' ? '수학' : '영어'} 튜터
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatMinutes(session.duration)} · {session.messageCount}개 메시지
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {session.performance}점
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Weekly Report View Component
function WeeklyReportView({
  report,
  formatMinutes,
  formatDate,
  sessions,
}: {
  report: WeeklyReport;
  formatMinutes: (minutes: number) => string;
  formatDate: (date: string) => string;
  sessions: LearningSession[];
}) {
  // Filter sessions for the last 7 days
  const weekSessions = sessions.filter((s) => {
    const sessionDate = new Date(s.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate >= weekAgo;
  });

  return (
    <div className="space-y-6">
      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StudyTimeChart sessions={weekSessions} days={7} />
        <SubjectDistributionChart sessions={weekSessions} />
      </div>

      <PerformanceTrendChart sessions={weekSessions} days={7} />

      {/* Weekly Summary */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">주간 요약</h3>
          <div className="text-sm text-gray-600">
            {formatDate(report.weekStart)} ~ {formatDate(report.weekEnd)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-blue-900">
              {formatMinutes(report.totalTime)}
            </p>
            <p className="text-sm text-blue-700">총 학습 시간</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-purple-900">
              {report.dailyReports.length}일
            </p>
            <p className="text-sm text-purple-700">학습 참여 일수</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            {report.progressTrend >= 0 ? (
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
            ) : (
              <TrendingDown className="w-8 h-8 mx-auto mb-2 text-red-600" />
            )}
            <p
              className={`text-2xl font-bold ${
                report.progressTrend >= 0 ? 'text-green-900' : 'text-red-900'
              }`}
            >
              {report.progressTrend > 0 ? '+' : ''}
              {report.progressTrend}점
            </p>
            <p
              className={`text-sm ${
                report.progressTrend >= 0 ? 'text-green-700' : 'text-red-700'
              }`}
            >
              진도 추세
            </p>
          </div>
        </div>
      </div>

      {/* Strengths */}
      {report.strengths.length > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">강점</h3>
          </div>
          <ul className="space-y-2">
            {report.strengths.map((strength, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 text-green-800"
              >
                <span className="text-green-600 mt-0.5">✓</span>
                <span>{strength}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {report.weaknesses.length > 0 && (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-900">개선 필요 영역</h3>
          </div>
          <ul className="space-y-2">
            {report.weaknesses.map((weakness, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 text-yellow-800"
              >
                <span className="text-yellow-600 mt-0.5">!</span>
                <span>{weakness}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-purple-900">추천 사항</h3>
          </div>
          <ul className="space-y-3">
            {report.recommendations.map((recommendation, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-white rounded-xl border border-purple-100"
              >
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-gray-800">{recommendation}</span>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Daily Breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">일별 학습 기록</h3>
        <div className="space-y-3">
          {report.dailyReports.map((daily, index) => (
            <motion.div
              key={daily.date}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900">{formatDate(daily.date)}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {formatMinutes(daily.totalTime)}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                    {daily.averagePerformance}점
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>
                  <Calculator className="w-4 h-4 inline mr-1 text-green-600" />
                  수학 {formatMinutes(daily.subjectBreakdown.math)}
                </span>
                <span>
                  <BookOpen className="w-4 h-4 inline mr-1 text-blue-600" />
                  영어 {formatMinutes(daily.subjectBreakdown.english)}
                </span>
                <span className="text-gray-500">· {daily.sessions.length}개 세션</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
