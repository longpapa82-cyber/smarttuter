'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Clock, Target, Lightbulb, X, Filter, TrendingUp } from 'lucide-react';
import { allScenarios, categoryInfo, getRecommendedScenarios, type RoleplayScenario, type ScenarioCategory, type CEFRLevel, getScenarioStats } from '@/lib/roleplay/scenarios';

interface RoleplaySelectorProps {
  gradeLevel: string;
  onSelectScenario: (scenario: RoleplayScenario) => void;
  onClose?: () => void;
  currentCEFRLevel?: CEFRLevel; // 적응형 학습 통합
}

export default function RoleplaySelector({ gradeLevel, onSelectScenario, onClose, currentCEFRLevel }: RoleplaySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<ScenarioCategory | 'recommended'>('recommended');
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'all'>('all');
  const [selectedScenario, setSelectedScenario] = useState<RoleplayScenario | null>(null);

  // 추천 시나리오 (CEFR 레벨 우선, 없으면 학년)
  const recommendedScenarios = getRecommendedScenarios(currentCEFRLevel || gradeLevel);

  // 시나리오 통계
  const stats = getScenarioStats();

  // 표시할 시나리오 목록 (카테고리 + 레벨 필터)
  let displayScenarios = selectedCategory === 'recommended'
    ? recommendedScenarios
    : allScenarios.filter(s => s.category === selectedCategory);

  // 레벨 필터 적용
  if (selectedLevel !== 'all') {
    displayScenarios = displayScenarios.filter(s => s.level === selectedLevel);
  }

  // 레벨 색상
  const levelColors: Record<string, string> = {
    A1: 'bg-gray-100 text-gray-700',
    A2: 'bg-blue-100 text-blue-700',
    B1: 'bg-green-100 text-green-700',
    B2: 'bg-yellow-100 text-yellow-700',
    C1: 'bg-orange-100 text-orange-700',
    C2: 'bg-purple-100 text-purple-700',
  };

  // 카테고리 색상
  const getCategoryColor = (category: ScenarioCategory) => {
    const colors = {
      daily: 'from-blue-500 to-cyan-500',
      business: 'from-purple-500 to-pink-500',
      academic: 'from-green-500 to-teal-500',
      travel: 'from-orange-500 to-red-500',
    };
    return colors[category];
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-2xl">🎭</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">롤플레이 시나리오</h3>
            <p className="text-sm text-gray-500">
              실전 영어 회화 연습
              {currentCEFRLevel && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span className="font-medium">현재 레벨: {currentCEFRLevel}</span>
                </span>
              )}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Stats Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 border border-blue-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            📊 총 <span className="font-bold text-gray-900">{stats.total}</span>개 시나리오
          </span>
          <div className="flex gap-3">
            {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map(level => (
              <span key={level} className="text-gray-600">
                <span className={`font-medium ${level === currentCEFRLevel ? 'text-blue-600' : ''}`}>
                  {level}
                </span>
                : {stats.byLevel[level]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Level Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600 font-medium">레벨 필터:</span>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedLevel('all')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              selectedLevel === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map(level => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                selectedLevel === level
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : level === currentCEFRLevel
                  ? 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {level}
              {level === currentCEFRLevel && ' ⭐'}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('recommended')}
          className={`shrink-0 px-4 py-2 rounded-xl font-medium transition-all ${
            selectedCategory === 'recommended'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ⭐ 추천
        </button>
        {(Object.keys(categoryInfo) as ScenarioCategory[]).map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 px-4 py-2 rounded-xl font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {categoryInfo[cat].icon} {categoryInfo[cat].name}
          </button>
        ))}
      </div>

      {/* Scenario List */}
      <div className="grid gap-3 max-h-[60vh] overflow-y-auto">
        {displayScenarios.map(scenario => (
          <motion.button
            key={scenario.id}
            onClick={() => setSelectedScenario(scenario)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-left bg-white rounded-2xl p-4 border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCategoryColor(scenario.category)} flex items-center justify-center text-2xl flex-shrink-0`}>
                {scenario.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-gray-900">{scenario.title}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelColors[scenario.level]}`}>
                    {scenario.level}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{scenario.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {scenario.estimatedDuration}분
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {scenario.objectives.length}개 목표
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
          </motion.button>
        ))}
      </div>

      {displayScenarios.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>해당 카테고리에 시나리오가 없습니다.</p>
        </div>
      )}

      {/* Scenario Detail Modal */}
      <AnimatePresence>
        {selectedScenario && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedScenario(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6"
            >
              {/* Scenario Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getCategoryColor(selectedScenario.category)} flex items-center justify-center text-3xl flex-shrink-0`}>
                  {selectedScenario.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">{selectedScenario.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${levelColors[selectedScenario.level]}`}>
                      {selectedScenario.level}
                    </span>
                  </div>
                  <p className="text-gray-600">{selectedScenario.description}</p>
                </div>
              </div>

              {/* Situation */}
              <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">📖 상황</h4>
                <p className="text-blue-800">{selectedScenario.situation}</p>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">당신의 역할</p>
                    <p className="font-medium text-gray-900">{selectedScenario.yourRole}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">AI 역할</p>
                    <p className="font-medium text-gray-900">{selectedScenario.aiRole}</p>
                  </div>
                </div>
              </div>

              {/* Objectives */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-gray-900">학습 목표</h4>
                </div>
                <ul className="space-y-2">
                  {selectedScenario.objectives.map((obj, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Phrases */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <h4 className="font-semibold text-gray-900">핵심 표현</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedScenario.keyPhrases.map((phrase, index) => (
                    <span key={index} className="px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-900">
                      &quot;{phrase}&quot;
                    </span>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-purple-50 rounded-xl p-4 mb-6 border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">💡 팁</h4>
                <ul className="space-y-1.5">
                  {selectedScenario.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-purple-800 flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Duration */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                <Clock className="w-4 h-4" />
                <span>예상 소요 시간: 약 {selectedScenario.estimatedDuration}분</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedScenario(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    onSelectScenario(selectedScenario);
                    setSelectedScenario(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  시작하기 🚀
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
