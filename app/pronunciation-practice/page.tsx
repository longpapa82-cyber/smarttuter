// app/pronunciation-practice/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Trophy, Target } from 'lucide-react';
import Link from 'next/link';
import { PronunciationAnalyzerComponent } from '@/components/pronunciation/PronunciationAnalyzer';
import type { PronunciationAnalysis } from '@/types/pronunciation';

// 연습 문장 데이터
const PRACTICE_SENTENCES = {
  beginner: [
    'Hello, how are you today?',
    'I like to eat apples.',
    'The cat is on the table.',
    'What is your name?',
    'Thank you very much.',
  ],
  intermediate: [
    'I think the weather will be nice tomorrow.',
    'Could you please tell me the way to the station?',
    'She has been studying English for three years.',
    'The book that I bought yesterday was interesting.',
    'Would you mind opening the window?',
  ],
  advanced: [
    'The phenomenon of climate change requires immediate attention.',
    'Through perseverance and dedication, we can achieve remarkable results.',
    'Although the circumstances were challenging, they managed to succeed.',
    'The scientific community has reached a consensus on this matter.',
    'His entrepreneurial spirit led to the creation of a successful business.',
  ],
};

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export default function PronunciationPracticePage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [selectedSentence, setSelectedSentence] = useState<string>(PRACTICE_SENTENCES.beginner[0]);
  const [analyses, setAnalyses] = useState<PronunciationAnalysis[]>([]);
  const [showAnalyzer, setShowAnalyzer] = useState(false);

  const handleAnalysisComplete = (analysis: PronunciationAnalysis) => {
    setAnalyses((prev) => [analysis, ...prev].slice(0, 10)); // 최근 10개만 유지
    setShowAnalyzer(false);
  };

  const averageScore = analyses.length > 0
    ? Math.round(analyses.reduce((sum, a) => sum + a.overallScore, 0) / analyses.length)
    : 0;

  const bestScore = analyses.length > 0
    ? Math.round(Math.max(...analyses.map((a) => a.overallScore)))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/dashboard">
            <motion.button
              whileHover={{ x: -5 }}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>대시보드로 돌아가기</span>
            </motion.button>
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                발음 연습 🎤
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                AI 기반 고급 발음 분석 시스템
              </p>
            </div>
          </div>

          {/* 통계 카드 */}
          {analyses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
            >
              <StatCard
                icon={<Trophy className="w-6 h-6" />}
                title="최고 점수"
                value={bestScore}
                color="yellow"
              />
              <StatCard
                icon={<Target className="w-6 h-6" />}
                title="평균 점수"
                value={averageScore}
                color="blue"
              />
              <StatCard
                icon={<BookOpen className="w-6 h-6" />}
                title="연습 횟수"
                value={analyses.length}
                color="green"
              />
            </motion.div>
          )}
        </div>

        {!showAnalyzer ? (
          <div className="space-y-6">
            {/* 난이도 선택 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                난이도 선택
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {(['beginner', 'intermediate', 'advanced'] as Difficulty[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      setDifficulty(level);
                      setSelectedSentence(PRACTICE_SENTENCES[level][0]);
                    }}
                    className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                      difficulty === level
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {level === 'beginner' && '초급'}
                    {level === 'intermediate' && '중급'}
                    {level === 'advanced' && '고급'}
                  </button>
                ))}
              </div>
            </div>

            {/* 문장 선택 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                연습 문장 선택
              </h2>
              <div className="space-y-3">
                {PRACTICE_SENTENCES[difficulty].map((sentence, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSentence(sentence)}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      selectedSentence === sentence
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-500 shadow-md'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
                    }`}
                  >
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                      문장 {index + 1}
                    </span>
                    <span className="text-base text-gray-900 dark:text-white">
                      {sentence}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 시작 버튼 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAnalyzer(true)}
              className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-shadow"
            >
              선택한 문장으로 연습 시작 🎤
            </motion.button>

            {/* 최근 연습 기록 */}
            {analyses.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  최근 연습 기록
                </h2>
                <div className="space-y-3">
                  {analyses.slice(0, 5).map((analysis, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                    >
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {new Date(analysis.timestamp).toLocaleString('ko-KR')}
                        </p>
                        <p className="text-base text-gray-900 dark:text-white line-clamp-1">
                          {analysis.text}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {Math.round(analysis.overallScore)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          등급: {analysis.grade}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <PronunciationAnalyzerComponent
              targetText={selectedSentence}
              onAnalysisComplete={handleAnalysisComplete}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  color: 'yellow' | 'blue' | 'green';
}) {
  const colorClasses = {
    yellow: 'from-yellow-500 to-orange-500',
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-green-500 to-emerald-500',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 bg-gradient-to-br ${colorClasses[color]} text-white rounded-lg`}>
          {icon}
        </div>
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </h3>
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
