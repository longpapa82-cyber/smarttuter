'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/gamification/store';
import { useAdaptiveLearning } from '@/lib/adaptive-learning/store';
import { ProgressCalculator } from '@/lib/adaptive-learning/progress-calculator';
import { PathGenerator } from '@/lib/adaptive-learning/path-generator';
import { WeaknessAnalyzer } from '@/lib/adaptive-learning/weakness-analyzer';
import { Subject, ProgressAnalytics, LearningPathway } from '@/lib/adaptive-learning/types';
import MasteryHeatMap from '@/components/adaptive-learning/MasteryHeatMap';
import WeaknessReport from '@/components/adaptive-learning/WeaknessReport';
import LearningPathView from '@/components/adaptive-learning/LearningPathView';
import DifficultyIndicator from '@/components/adaptive-learning/DifficultyIndicator';
import {
  ArrowLeft,
  Brain,
  TrendingUp,
  Target,
  Clock,
  Zap,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';

export default function AnalyticsPage() {
  const router = useRouter();
  const userProfile = useUserStore(state => state.profile);
  const adaptiveProfile = useAdaptiveLearning(state => state.profile);
  const setCurrentPath = useAdaptiveLearning(state => state.setCurrentPath);

  const [selectedSubject, setSelectedSubject] = useState<Subject>('math');
  const [analytics, setAnalytics] = useState<ProgressAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userProfile || !adaptiveProfile) {
      router.push('/');
      return;
    }

    calculateAnalytics();
    setIsLoading(false);
  }, [userProfile, adaptiveProfile, selectedSubject]);

  const calculateAnalytics = () => {
    if (!adaptiveProfile) return;

    const result = ProgressCalculator.calculateAnalytics(
      selectedSubject,
      adaptiveProfile.knowledgeState.masteredNodes,
      adaptiveProfile.history.sessions.filter(s => s.subject === selectedSubject),
      adaptiveProfile.learningPath.current?.subject === selectedSubject
        ? adaptiveProfile.learningPath.current
        : undefined
    );

    setAnalytics(result);
  };

  const handleGeneratePath = () => {
    if (!adaptiveProfile) return;

    const weaknesses = WeaknessAnalyzer.identifyWeaknesses(
      adaptiveProfile.knowledgeState.masteredNodes
    );

    const newPath = PathGenerator.generatePath(
      selectedSubject,
      adaptiveProfile.gradeLevel,
      adaptiveProfile.knowledgeState.masteredNodes,
      weaknesses
    );

    setCurrentPath(newPath);
    calculateAnalytics();
  };

  const handleRemediationClick = (weakness: any) => {
    if (!adaptiveProfile) return;

    const remediationPath = PathGenerator.generateRemediationPath(
      weakness,
      adaptiveProfile.knowledgeState.masteredNodes
    );

    setCurrentPath(remediationPath);
    router.push('/tutor/' + selectedSubject);
  };

  if (isLoading || !userProfile || !adaptiveProfile || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">분석 중...</p>
        </div>
      </div>
    );
  }

  const currentPath = adaptiveProfile.learningPath.current;
  const weaknesses = adaptiveProfile.diagnosis.weaknesses.filter(
    w => w.knowledgeNodeId.startsWith(selectedSubject)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>대시보드로</span>
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedSubject('math')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedSubject === 'math'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              수학
            </button>
            <button
              onClick={() => setSelectedSubject('english')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedSubject === 'english'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              영어
            </button>
          </div>
        </div>

        {/* Title */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            📊 학습 분석
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI 기반 개인화 학습 진단 및 추천
          </p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-8 h-8 text-purple-600" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                전체 숙달도
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {analytics.masteryMap.overallMastery}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {analytics.masteryMap.masteredNodes}/{analytics.masteryMap.totalNodes} 개념
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-8 h-8 text-yellow-600" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                학습 속도
              </div>
            </div>
            <div className="text-3xl font-bold text-yellow-600">
              {analytics.learningVelocity.conceptsPerWeek}
            </div>
            <div className="text-xs text-gray-500 mt-1">개념/주</div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                효율성
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {analytics.timeAnalytics.efficiencyScore}
            </div>
            <div className="text-xs text-gray-500 mt-1">XP 효율 점수</div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-8 h-8 text-blue-600" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                총 학습 시간
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {Math.floor(analytics.timeAnalytics.totalLearningTime / 60)}
            </div>
            <div className="text-xs text-gray-500 mt-1">시간</div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Mastery & Weaknesses */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mastery Heat Map */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
            >
              <MasteryHeatMap categories={analytics.masteryMap.categories} />
            </motion.div>

            {/* Weaknesses */}
            {weaknesses.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
              >
                <WeaknessReport
                  weaknesses={weaknesses}
                  onRemediationClick={handleRemediationClick}
                />
              </motion.div>
            )}

            {/* Strengths */}
            {analytics.strengthsWeaknesses.topStrengths.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  강점 영역
                </h3>
                <div className="grid gap-3">
                  {analytics.strengthsWeaknesses.topStrengths.map((node, index) => (
                    <div
                      key={node.id}
                      className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {node.name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {node.category}
                        </div>
                      </div>
                      <DifficultyIndicator difficulty={node.difficulty} size="sm" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Learning Path & Predictions */}
          <div className="space-y-8">
            {/* Predictions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-xl shadow-lg text-white"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI 예측 & 추천
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm opacity-90 mb-1">권장 학습 속도</div>
                  <div className="text-2xl font-bold">
                    {analytics.predictions.recommendedPace === 'faster'
                      ? '빠르게 🚀'
                      : analytics.predictions.recommendedPace === 'slower'
                      ? '천천히 🐢'
                      : '현재 유지 ⚖️'}
                  </div>
                </div>
                <div>
                  <div className="text-sm opacity-90 mb-1">위험 수준</div>
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                      analytics.predictions.riskLevel === 'low'
                        ? 'bg-green-500'
                        : analytics.predictions.riskLevel === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                  >
                    {analytics.predictions.riskLevel === 'low'
                      ? '낮음 ✓'
                      : analytics.predictions.riskLevel === 'medium'
                      ? '중간 ⚠️'
                      : '높음 ⚠️⚠️'}
                  </div>
                </div>
                {analytics.predictions.nextMilestone && (
                  <div>
                    <div className="text-sm opacity-90 mb-1">다음 목표</div>
                    <div className="font-medium">
                      {analytics.predictions.nextMilestone}
                    </div>
                    {analytics.predictions.estimatedAchievementDate && (
                      <div className="text-xs opacity-75 mt-1">
                        예상: {analytics.predictions.estimatedAchievementDate.toLocaleDateString('ko-KR')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Learning Path */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
            >
              {currentPath && currentPath.subject === selectedSubject ? (
                <LearningPathView pathway={currentPath} />
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    학습 경로 없음
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    AI가 최적화된 학습 경로를 생성합니다
                  </p>
                  <button
                    onClick={handleGeneratePath}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
                  >
                    학습 경로 생성
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
