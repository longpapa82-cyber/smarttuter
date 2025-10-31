"use client";

import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Calculator, TrendingUp, Clock, Award } from "lucide-react";
import type { LearningProgressSummary } from "@/lib/learning-progress/types";

interface LearningProgressOverviewProps {
  progressData: LearningProgressSummary;
}

export function LearningProgressOverview({ progressData }: LearningProgressOverviewProps) {
  const mathProgress = progressData.subjects.math;
  const englishProgress = progressData.subjects.english;

  const mathMastered = mathProgress.conceptsByMastery.mastered || 0;
  const mathTotal = mathProgress.totalConcepts;
  const englishMastered = englishProgress.conceptsByMastery.mastered || 0;
  const englishTotal = englishProgress.totalConcepts;

  const mathProgressPercent = mathTotal > 0 ? mathMastered / mathTotal : 0;
  const englishProgressPercent = englishTotal > 0 ? englishMastered / englishTotal : 0;
  const overallProgress = (mathProgressPercent + englishProgressPercent) / 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center space-x-3">
          <GraduationCap className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">학습 진행도 요약</h2>
            <p className="text-blue-100 text-sm">전체 학습 현황을 한눈에 확인하세요</p>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">전체 진행률</span>
          <span className="text-2xl font-bold text-gray-900">{Math.round(overallProgress * 100)}%</span>
        </div>
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress * 100}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
          />
        </div>
      </div>

      {/* Subject Progress Cards */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Math */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Calculator className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-bold text-green-800">수학</h3>
            </div>
            <span className="text-2xl font-bold text-green-700">
              {Math.round(mathProgressPercent * 100)}%
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-700">
              <span>마스터한 개념</span>
              <span className="font-semibold text-green-700">{mathMastered}개</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>학습 중인 개념</span>
              <span className="font-semibold text-yellow-600">{mathProgress.conceptsByMastery.learning || 0}개</span>
            </div>
          </div>
        </motion.div>

        {/* English */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-blue-800">영어</h3>
            </div>
            <span className="text-2xl font-bold text-blue-700">
              {Math.round(englishProgressPercent * 100)}%
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-700">
              <span>마스터한 개념</span>
              <span className="font-semibold text-blue-700">{englishMastered}개</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>학습 중인 개념</span>
              <span className="font-semibold text-yellow-600">{englishProgress.conceptsByMastery.learning || 0}개</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="p-6 bg-gray-50 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">총 학습 시간</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {Math.round(progressData.totalStudyTime / 3600)}시간
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">학습한 개념</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {mathTotal + englishTotal}개
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
            <Award className="w-4 h-4" />
            <span className="text-xs">마스터 개념</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {mathMastered + englishMastered}개
          </div>
        </div>
      </div>
    </motion.div>
  );
}
