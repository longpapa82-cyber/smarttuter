'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  TrendingUp,
  BookOpen,
  MessageSquare,
  Volume2,
  Target,
  ChevronRight,
  Star,
  Trophy,
  Zap,
} from 'lucide-react';
import type { UserLevel, LevelAnalysis, CEFRLevel } from '@/lib/adaptive-learning/level-detector';
import type { LearningContent, RecommendationResult } from '@/lib/adaptive-learning/content-recommender';
import { CEFR_DESCRIPTIONS } from '@/lib/adaptive-learning/level-detector';

interface LevelDashboardProps {
  userLevel: UserLevel;
  levelAnalysis: LevelAnalysis;
  recommendations: RecommendationResult;
  onStartContent?: (content: LearningContent) => void;
}

export default function LevelDashboard({
  userLevel,
  levelAnalysis,
  recommendations,
  onStartContent,
}: LevelDashboardProps) {
  const cefrInfo = CEFR_DESCRIPTIONS[userLevel.cefr];

  return (
    <div className="space-y-6">
      {/* 헤더 - 현재 레벨 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Trophy className="w-10 h-10 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">CEFR {userLevel.cefr}</h2>
              <p className="text-xl opacity-90">{cefrInfo.name} 레벨</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{userLevel.overall}</div>
            <div className="text-sm opacity-75">종합 점수</div>
          </div>
        </div>

        <p className="text-lg opacity-90 mb-6">{cefrInfo.description}</p>

        {/* 신뢰도 표시 */}
        <div className="flex items-center gap-2 text-sm">
          <div className="flex-1 bg-white/20 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${userLevel.confidence * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="bg-white rounded-full h-full"
            />
          </div>
          <span className="opacity-90">
            분석 신뢰도 {Math.round(userLevel.confidence * 100)}%
          </span>
        </div>
      </motion.div>

      {/* 영역별 점수 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SkillCard
          icon={<BookOpen className="w-6 h-6" />}
          title="어휘력"
          score={userLevel.vocabulary}
          color="blue"
        />
        <SkillCard
          icon={<MessageSquare className="w-6 h-6" />}
          title="문법"
          score={userLevel.grammar}
          color="green"
        />
        <SkillCard
          icon={<Target className="w-6 h-6" />}
          title="이해력"
          score={userLevel.comprehension}
          color="purple"
        />
        <SkillCard
          icon={<Volume2 className="w-6 h-6" />}
          title="발음"
          score={userLevel.pronunciation}
          color="pink"
        />
      </div>

      {/* 강점과 약점 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 강점 */}
        {levelAnalysis.strengths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800"
          >
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-bold text-green-900 dark:text-green-100">
                강점
              </h3>
            </div>
            <ul className="space-y-2">
              {levelAnalysis.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2 text-green-800 dark:text-green-200">
                  <ChevronRight className="w-4 h-4 mt-1 shrink-0" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* 약점 */}
        {levelAnalysis.weaknesses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800"
          >
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-bold text-orange-900 dark:text-orange-100">
                개선 영역
              </h3>
            </div>
            <ul className="space-y-2">
              {levelAnalysis.weaknesses.map((weakness, i) => (
                <li key={i} className="flex items-start gap-2 text-orange-800 dark:text-orange-200">
                  <ChevronRight className="w-4 h-4 mt-1 shrink-0" />
                  <span className="text-sm">{weakness}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      {/* 학습 추천 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6 text-yellow-500" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            AI 추천 학습 경로
          </h3>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-line">
          {recommendations.reasoning}
        </p>

        {/* 추천 콘텐츠 섹션 */}
        <div className="space-y-6">
          {/* 즉시 시작 */}
          {recommendations.immediate.length > 0 && (
            <ContentSection
              title="🎯 지금 바로 시작하세요"
              subtitle="현재 실력에 딱 맞는 콘텐츠"
              content={recommendations.immediate}
              onStart={onStartContent}
              color="blue"
            />
          )}

          {/* 다음 단계 */}
          {recommendations.next.length > 0 && (
            <ContentSection
              title="🚀 다음 단계"
              subtitle="한 단계 더 발전할 준비가 되셨나요?"
              content={recommendations.next}
              onStart={onStartContent}
              color="purple"
            />
          )}

          {/* 복습 */}
          {recommendations.review.length > 0 && (
            <ContentSection
              title="📚 복습 추천"
              subtitle="기초를 다지면 더 빠르게 성장합니다"
              content={recommendations.review}
              onStart={onStartContent}
              color="green"
            />
          )}

          {/* 도전 과제 */}
          {recommendations.challenge.length > 0 && (
            <ContentSection
              title="💪 도전 과제"
              subtitle="강점을 더 발전시켜보세요!"
              content={recommendations.challenge}
              onStart={onStartContent}
              color="orange"
            />
          )}
        </div>
      </motion.div>

      {/* 학습 추천사항 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          💡 {cefrInfo.name} 레벨 학습 포인트
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
              할 수 있는 것:
            </h4>
            <ul className="space-y-1">
              {cefrInfo.canDo.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm">
                  <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 text-indigo-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
              집중 학습 영역:
            </h4>
            <ul className="space-y-1">
              {cefrInfo.studyFocus.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm">
                  <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 text-purple-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="pt-3 border-t border-indigo-200 dark:border-indigo-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ⏱️ 예상 학습 기간: <span className="font-semibold">{levelAnalysis.estimatedStudyTime}</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * 영역별 점수 카드
 */
function SkillCard({
  icon,
  title,
  score,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  score: number;
  color: 'blue' | 'green' | 'purple' | 'pink';
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
  };

  const bgColorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    pink: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      className={`${bgColorClasses[color]} rounded-2xl p-4 border shadow-lg`}
    >
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white mb-3`}>
        {icon}
      </div>
      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</h4>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{score}</span>
        <span className="text-sm text-gray-500">/100</span>
      </div>
      <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className={`bg-gradient-to-r ${colorClasses[color]} rounded-full h-full`}
        />
      </div>
    </motion.div>
  );
}

/**
 * 콘텐츠 섹션
 */
function ContentSection({
  title,
  subtitle,
  content,
  onStart,
  color,
}: {
  title: string;
  subtitle: string;
  content: LearningContent[];
  onStart?: (content: LearningContent) => void;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const borderColors = {
    blue: 'border-blue-200 dark:border-blue-800',
    green: 'border-green-200 dark:border-green-800',
    purple: 'border-purple-200 dark:border-purple-800',
    orange: 'border-orange-200 dark:border-orange-800',
  };

  const buttonColors = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
  };

  return (
    <div className={`border-l-4 ${borderColors[color]} pl-4`}>
      <h4 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{subtitle}</p>
      <div className="space-y-2">
        {content.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ x: 4 }}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
          >
            <div className="flex-1">
              <h5 className="font-medium text-gray-900 dark:text-white text-sm">{item.title}</h5>
              <p className="text-xs text-gray-600 dark:text-gray-400">{item.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full text-gray-700 dark:text-gray-300">
                  {item.type}
                </span>
                <span className="text-xs text-gray-500">⏱️ {item.estimatedTime}분</span>
                <span className="text-xs text-gray-500">난이도 {item.difficulty}/10</span>
              </div>
            </div>
            {onStart && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onStart(item)}
                className={`ml-4 px-4 py-2 ${buttonColors[color]} text-white text-sm rounded-lg font-medium transition-colors`}
              >
                시작하기
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
