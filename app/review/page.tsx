// app/review/page.tsx

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Home,
  Brain,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  BookOpen,
  Calculator,
  Play,
  Filter,
} from 'lucide-react';
import { ReviewSession } from '@/components/spaced-repetition/ReviewSession';
import { initializeUserCards } from '@/lib/spaced-repetition/sample-cards';
import { isDueToday, isOverdue, calculatePriority } from '@/lib/spaced-repetition/sm2-engine';
import type { ReviewCard, ReviewSession as ReviewSessionType } from '@/types/spaced-repetition';

export default function ReviewPage() {
  // Mock user ID (실제로는 auth에서 가져와야 함)
  const userId = 'demo-user';

  // Initialize cards
  const [allCards] = useState<ReviewCard[]>(() => initializeUserCards(userId));
  const [filterSubject, setFilterSubject] = useState<'all' | 'math' | 'english'>('all');
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Filter due cards
  const dueCards = useMemo(() => {
    return allCards.filter((card) => {
      const isDue = isDueToday(card);
      const matchesFilter =
        filterSubject === 'all' || card.subject === filterSubject;
      return isDue && matchesFilter;
    });
  }, [allCards, filterSubject]);

  // Sort by priority
  const sortedDueCards = useMemo(() => {
    return [...dueCards].sort((a, b) => {
      const priorityA = calculatePriority(a);
      const priorityB = calculatePriority(b);
      return priorityB - priorityA; // 높은 우선순위 먼저
    });
  }, [dueCards]);

  // Calculate stats
  const overdueCards = allCards.filter((card) => isOverdue(card));
  const newCards = allCards.filter((c) => c.status === 'new');
  const learningCards = allCards.filter((c) => c.status === 'learning');
  const masteredCards = allCards.filter((c) => c.status === 'mastered');

  const mathCards = dueCards.filter((c) => c.subject === 'math');
  const englishCards = dueCards.filter((c) => c.subject === 'english');

  const handleSessionComplete = async (session: ReviewSessionType) => {
    console.log('Session completed:', session);

    // Save session to database
    try {
      const response = await fetch('/api/user/save-review-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(session),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Review session saved:', result.stats);
        // Show success message with stats
        alert(
          `복습 완료! +${session.earnedXP} XP 획득\n` +
          `전체 정확도: ${result.stats.overallAccuracy}%\n` +
          `연속 학습: ${result.stats.currentStreak}일`
        );
      } else {
        console.error('❌ Failed to save review session:', result.error);
        alert(`복습 완료! +${session.earnedXP} XP 획득\n(데이터 저장 실패)`);
      }
    } catch (error) {
      console.error('Error saving review session:', error);
      alert(`복습 완료! +${session.earnedXP} XP 획득\n(데이터 저장 오류)`);
    }

    setIsSessionActive(false);
  };

  if (isSessionActive && sortedDueCards.length > 0) {
    return (
      <ReviewSession
        cards={sortedDueCards}
        onComplete={handleSessionComplete}
        onClose={() => setIsSessionActive(false)}
      />
    );
  }

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
                간격 반복 복습 🧠
              </h1>
            </div>
            <div className="px-3 py-1 bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-full text-xs font-bold">
              Phase 11 NEW
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-3">오늘의 복습 🎯</h2>
              <p className="text-lg text-white/90 mb-4">
                SM-2 알고리즘이 최적화한 복습 일정입니다
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/20 rounded-xl px-4 py-2 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{dueCards.length}</div>
                  <div className="text-sm text-white/80">복습 대기</div>
                </div>
                <div className="bg-white/20 rounded-xl px-4 py-2 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{overdueCards.length}</div>
                  <div className="text-sm text-white/80">지연됨</div>
                </div>
                <div className="bg-white/20 rounded-xl px-4 py-2 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{masteredCards.length}</div>
                  <div className="text-sm text-white/80">마스터</div>
                </div>
              </div>
            </div>
            <div className="text-8xl">🧠</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{newCards.length}</div>
                <div className="text-sm text-gray-600">새 카드</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Brain className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{learningCards.length}</div>
                <div className="text-sm text-gray-600">학습 중</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{masteredCards.length}</div>
                <div className="text-sm text-gray-600">마스터</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{allCards.length}</div>
                <div className="text-sm text-gray-600">전체</div>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Filter */}
        <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
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
                전체 ({dueCards.length})
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
                수학 ({mathCards.length})
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
                영어 ({englishCards.length})
              </button>
            </div>
          </div>
        </div>

        {/* Start Review Button */}
        {sortedDueCards.length > 0 ? (
          <div className="mb-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsSessionActive(true)}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-2xl p-8 font-bold text-2xl shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center gap-4"
            >
              <Play className="w-8 h-8" />
              <span>복습 시작하기 ({sortedDueCards.length}장)</span>
            </motion.button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center mb-8 border border-gray-200">
            <div className="text-7xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">복습할 카드가 없습니다!</h3>
            <p className="text-gray-600 mb-6">
              오늘의 복습을 모두 완료했거나, 아직 복습할 시간이 아닙니다.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/microlearning"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                마이크로러닝 하러가기
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                대시보드로 돌아가기
              </Link>
            </div>
          </div>
        )}

        {/* Due Cards Preview */}
        {sortedDueCards.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">복습 예정 카드</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedDueCards.slice(0, 6).map((card) => (
                <motion.div
                  key={card.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-indigo-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
                      {card.subject === 'math' ? '📐 수학' : '📝 영어'}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        card.status === 'new'
                          ? 'bg-blue-100 text-blue-700'
                          : card.status === 'learning'
                          ? 'bg-yellow-100 text-yellow-700'
                          : card.status === 'relearning'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {card.status === 'new' && '🆕 새 카드'}
                      {card.status === 'learning' && '📚 학습 중'}
                      {card.status === 'review' && '🔄 복습'}
                      {card.status === 'relearning' && '⚠️ 재학습'}
                      {card.status === 'mastered' && '🏆 마스터'}
                    </span>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{card.front}</h4>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {isOverdue(card) ? (
                        <span className="text-red-600 font-medium">지연됨</span>
                      ) : (
                        '오늘'
                      )}
                    </span>
                  </div>

                  {card.totalReviews > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                      {card.totalReviews}회 복습 ·{' '}
                      {Math.round((card.correctReviews / card.totalReviews) * 100)}% 정답
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {sortedDueCards.length > 6 && (
              <div className="mt-4 text-center text-gray-600">
                +{sortedDueCards.length - 6}개 카드 더 있습니다
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            SM-2 간격 반복 알고리즘이란?
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              • <strong>과학적 학습법</strong>: 1년 후 80% 기억 유지율 달성
            </p>
            <p>
              • <strong>개인화 학습</strong>: 당신의 학습 패턴에 자동으로 적응
            </p>
            <p>
              • <strong>효율적 복습</strong>: 최소한의 시간으로 최대 효과
            </p>
            <p>
              • <strong>장기 기억</strong>: 단기 기억을 장기 기억으로 전환
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
