"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Home,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Target,
  Award,
  Lightbulb,
  Download,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { WeeklyChart } from "@/components/report/WeeklyChart";
import { PerformanceGauge } from "@/components/report/PerformanceGauge";
import {
  getTodayReport,
  getWeeklyReport,
  generateDemoData,
  type DailyReport,
  type WeeklyReport,
} from "@/lib/utils/learningData";

export default function ReportPage() {
  const [todayReport, setTodayReport] = useState<DailyReport | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [viewMode, setViewMode] = useState<"today" | "week">("today");

  useEffect(() => {
    // 데모 데이터가 없으면 생성
    const sessions = localStorage.getItem("smarttuter_sessions");
    if (!sessions || JSON.parse(sessions).length === 0) {
      generateDemoData();
    }

    // 리포트 로드
    setTodayReport(getTodayReport());
    setWeeklyReport(getWeeklyReport());
  }, []);

  const getTrendIcon = (trend: number) => {
    if (trend > 10) return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (trend < -10) return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-gray-500" />;
  };

  const getTrendText = (trend: number) => {
    if (trend > 10) return "상승 중";
    if (trend < -10) return "하락 중";
    return "유지 중";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <header className="border-b-2 border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </div>
              <span className="text-xl font-bold gradient-text">SmartTuter</span>
            </Link>

            <div className="flex items-center space-x-2 px-4 py-2 bg-secondary-100 rounded-full">
              <Calendar className="w-5 h-5 text-secondary-600" />
              <span className="font-semibold text-secondary-700">학습 리포트</span>
            </div>

            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Home className="w-6 h-6 text-gray-600" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Toggle */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">학습 분석 리포트</h1>

          <div className="flex gap-2">
            <Button
              variant={viewMode === "today" ? "primary" : "outline"}
              size="sm"
              onClick={() => setViewMode("today")}
            >
              오늘
            </Button>
            <Button
              variant={viewMode === "week" ? "primary" : "outline"}
              size="sm"
              onClick={() => setViewMode("week")}
            >
              이번 주
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4 mr-2" />
              다운로드
            </Button>
          </div>
        </div>

        {viewMode === "today" && todayReport && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">총 학습 시간</p>
                    <p className="text-3xl font-bold text-primary-600">
                      {todayReport.totalTime}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">분</p>
                  </div>
                  <Clock className="w-12 h-12 text-primary-200" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">학습 주제</p>
                    <p className="text-3xl font-bold text-secondary-600">
                      {todayReport.topicsCount}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">개</p>
                  </div>
                  <Target className="w-12 h-12 text-secondary-200" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">세션 수</p>
                    <p className="text-3xl font-bold text-accent-600">
                      {todayReport.sessions.length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">회</p>
                  </div>
                  <Award className="w-12 h-12 text-accent-200" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">평균 성과</p>
                    <p className="text-3xl font-bold text-green-600">
                      {todayReport.averagePerformance}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">점</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-200" />
                </div>
              </Card>
            </div>

            {/* Subject Breakdown */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-6">과목별 학습 시간</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">수학</span>
                    <span className="text-primary-600 font-bold">
                      {todayReport.subjectBreakdown.math}분
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 h-4 rounded-full transition-all"
                      style={{
                        width: `${
                          todayReport.totalTime > 0
                            ? (todayReport.subjectBreakdown.math / todayReport.totalTime) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">영어</span>
                    <span className="text-accent-600 font-bold">
                      {todayReport.subjectBreakdown.english}분
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-accent-500 to-primary-500 h-4 rounded-full transition-all"
                      style={{
                        width: `${
                          todayReport.totalTime > 0
                            ? (todayReport.subjectBreakdown.english / todayReport.totalTime) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Session List */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-6">오늘의 학습 세션</h3>
              {todayReport.sessions.length > 0 ? (
                <div className="space-y-4">
                  {todayReport.sessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-4 bg-gray-50 rounded-xl flex justify-between items-center"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            session.subject === "math"
                              ? "bg-primary-100 text-primary-600"
                              : "bg-accent-100 text-accent-600"
                          }`}
                        >
                          {session.subject === "math" ? "📐" : "🗣️"}
                        </div>
                        <div>
                          <div className="font-semibold">
                            {session.subject === "math" ? "수학" : "영어"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(session.startTime).toLocaleTimeString("ko-KR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            - {session.duration}분
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">메시지</div>
                        <div className="font-bold">{session.messageCount}개</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>오늘 학습한 세션이 없습니다.</p>
                  <p className="text-sm mt-2">지금 학습을 시작해보세요!</p>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {viewMode === "week" && weeklyReport && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Weekly Summary */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 col-span-2">
                <h3 className="text-xl font-bold mb-6">주간 학습 시간 추이</h3>
                <WeeklyChart dailyReports={weeklyReport.dailyReports} />
              </Card>

              <div className="space-y-6">
                <Card className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">총 학습 시간</p>
                    <p className="text-4xl font-bold gradient-text">
                      {weeklyReport.totalTime}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">분</p>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">학습 추세</p>
                    {getTrendIcon(weeklyReport.progressTrend)}
                  </div>
                  <p className="text-2xl font-bold">
                    {getTrendText(weeklyReport.progressTrend)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {weeklyReport.progressTrend > 0 ? "+" : ""}
                    {weeklyReport.progressTrend}점
                  </p>
                </Card>
              </div>
            </div>

            {/* Performance Gauge */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-6">주간 평균 성과</h3>
              <div className="flex justify-center">
                <PerformanceGauge
                  score={
                    weeklyReport.dailyReports.length > 0
                      ? Math.round(
                          weeklyReport.dailyReports.reduce(
                            (sum, r) => sum + r.averagePerformance,
                            0
                          ) / weeklyReport.dailyReports.length
                        )
                      : 0
                  }
                  label="이번 주 평균"
                />
              </div>
            </Card>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Award className="w-6 h-6 text-green-500" />
                  <h3 className="text-xl font-bold">강점</h3>
                </div>
                <ul className="space-y-3">
                  {weeklyReport.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                  {weeklyReport.strengths.length === 0 && (
                    <li className="text-gray-500 text-sm">데이터가 충분하지 않습니다</li>
                  )}
                </ul>
              </Card>

              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="w-6 h-6 text-orange-500" />
                  <h3 className="text-xl font-bold">개선 영역</h3>
                </div>
                <ul className="space-y-3">
                  {weeklyReport.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-orange-500 mt-1">!</span>
                      <span className="text-gray-700">{weakness}</span>
                    </li>
                  ))}
                  {weeklyReport.weaknesses.length === 0 && (
                    <li className="text-gray-500 text-sm">개선이 필요한 영역이 없습니다</li>
                  )}
                </ul>
              </Card>
            </div>

            {/* Recommendations */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Lightbulb className="w-6 h-6 text-yellow-500" />
                <h3 className="text-xl font-bold">학습 추천</h3>
              </div>
              <ul className="space-y-3">
                {weeklyReport.recommendations.map((rec, index) => (
                  <li
                    key={index}
                    className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl flex items-start space-x-3"
                  >
                    <span className="text-2xl">{index + 1}.</span>
                    <span className="text-gray-700 pt-1">{rec}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-12">
          <Link href="/tutor/math">
            <Button size="lg">
              📐 수학 학습 시작
            </Button>
          </Link>
          <Link href="/tutor/english">
            <Button size="lg" variant="secondary">
              🗣️ 영어 학습 시작
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
