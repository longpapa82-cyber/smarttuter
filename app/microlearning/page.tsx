// app/microlearning/page.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Home,
  BookOpen,
  Calculator,
  Filter,
  Search,
  Clock,
  Award,
  TrendingUp,
} from 'lucide-react';
import { ModuleCard } from '@/components/microlearning/ModuleCard';
import { ModuleViewer } from '@/components/microlearning/ModuleViewer';
import { ALL_MODULES, LEARNING_PATHS } from '@/lib/microlearning/modules-data';
import type {
  MicrolearningModule,
  ModuleStatus,
  Subject,
  DifficultyLevel,
} from '@/types/microlearning';

export default function MicrolearningPage() {
  const [selectedModule, setSelectedModule] = useState<MicrolearningModule | null>(null);
  const [filterSubject, setFilterSubject] = useState<Subject | 'all'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock user progress (실제로는 Zustand store나 API에서 가져와야 함)
  const [moduleProgress] = useState<Record<string, { status: ModuleStatus; progress: number }>>({
    'math-algebra-001': { status: 'completed', progress: 100 },
    'math-geometry-001': { status: 'in_progress', progress: 60 },
    'eng-grammar-001': { status: 'completed', progress: 100 },
    'eng-vocab-001': { status: 'available', progress: 0 },
    'eng-speaking-001': { status: 'available', progress: 0 },
    'math-calculus-001': { status: 'locked', progress: 0 },
  });

  // Filter modules
  const filteredModules = ALL_MODULES.filter((module) => {
    const matchesSubject = filterSubject === 'all' || module.subject === filterSubject;
    const matchesDifficulty =
      filterDifficulty === 'all' || module.difficulty === filterDifficulty;
    const matchesSearch =
      searchQuery === '' ||
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSubject && matchesDifficulty && matchesSearch;
  });

  // Calculate stats
  const totalCompleted = Object.values(moduleProgress).filter(
    (p) => p.status === 'completed' || p.status === 'mastered'
  ).length;
  const totalInProgress = Object.values(moduleProgress).filter(
    (p) => p.status === 'in_progress'
  ).length;
  const totalAvailable = Object.values(moduleProgress).filter(
    (p) => p.status === 'available'
  ).length;
  const totalXP = ALL_MODULES.filter(
    (m) =>
      moduleProgress[m.id]?.status === 'completed' ||
      moduleProgress[m.id]?.status === 'mastered'
  ).reduce((sum, m) => sum + m.xpReward, 0);

  const handleModuleComplete = (moduleId: string, score?: number) => {
    console.log(`Module ${moduleId} completed with score: ${score}`);
    // TODO: Update progress in store/API
    setSelectedModule(null);
  };

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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                마이크로러닝 🎯
              </h1>
            </div>
            <div className="px-3 py-1 bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-full text-xs font-bold">
              Phase 10 NEW
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-3">5-10분 집중 학습 💡</h2>
              <p className="text-lg text-white/90 mb-4">
                짧고 강력한 학습 모듈로 매일 성장하세요!
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/20 rounded-xl px-4 py-2 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{totalCompleted}</div>
                  <div className="text-sm text-white/80">완료 모듈</div>
                </div>
                <div className="bg-white/20 rounded-xl px-4 py-2 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{totalInProgress}</div>
                  <div className="text-sm text-white/80">진행 중</div>
                </div>
                <div className="bg-white/20 rounded-xl px-4 py-2 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{totalXP}</div>
                  <div className="text-sm text-white/80">획득 XP</div>
                </div>
              </div>
            </div>
            <div className="text-8xl">📚</div>
          </div>
        </div>

        {/* Learning Paths */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            추천 학습 경로
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LEARNING_PATHS.map((path) => (
              <motion.div
                key={path.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-indigo-300 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{path.thumbnail}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-900 mb-1">{path.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{path.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        {path.totalMinutes}분
                      </span>
                      <span className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                        <Award className="w-3 h-3" />
                        {path.totalXP} XP
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {path.moduleIds.length}개 모듈
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="모듈 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Subject Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterSubject('all')}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all
                  ${
                    filterSubject === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                전체
              </button>
              <button
                onClick={() => setFilterSubject('math')}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                  ${
                    filterSubject === 'math'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <Calculator className="w-4 h-4" />
                수학
              </button>
              <button
                onClick={() => setFilterSubject('english')}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                  ${
                    filterSubject === 'english'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <BookOpen className="w-4 h-4" />
                영어
              </button>
            </div>

            {/* Difficulty Filter */}
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value as DifficultyLevel | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">모든 난이도</option>
              <option value="beginner">초급</option>
              <option value="intermediate">중급</option>
              <option value="advanced">고급</option>
              <option value="expert">전문가</option>
            </select>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => {
            const progress = moduleProgress[module.id] || {
              status: 'available' as ModuleStatus,
              progress: 0,
            };

            return (
              <ModuleCard
                key={module.id}
                module={module}
                status={progress.status}
                progress={progress.progress}
                onClick={() => {
                  if (progress.status !== 'locked') {
                    setSelectedModule(module);
                  }
                }}
              />
            );
          })}
        </div>

        {filteredModules.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-600">다른 키워드나 필터로 다시 검색해 보세요</p>
          </div>
        )}
      </main>

      {/* Module Viewer Modal */}
      {selectedModule && (
        <ModuleViewer
          module={selectedModule}
          onClose={() => setSelectedModule(null)}
          onComplete={(score) => handleModuleComplete(selectedModule.id, score)}
        />
      )}
    </div>
  );
}
