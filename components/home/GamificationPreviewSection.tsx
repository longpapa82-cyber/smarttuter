'use client';

import { motion } from 'framer-motion';
import { Trophy, Star, Target, Zap, Award, Crown, TrendingUp, Flame, Sparkles } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  level: number;
  badge: string;
}

const badges: Badge[] = [
  {
    id: 'first-steps',
    name: '첫 걸음',
    description: '첫 학습 완료',
    icon: <Star className="w-6 h-6" />,
    gradient: 'from-blue-400 to-cyan-500',
    rarity: 'common',
  },
  {
    id: 'week-warrior',
    name: '주간 전사',
    description: '7일 연속 학습',
    icon: <Flame className="w-6 h-6" />,
    gradient: 'from-orange-400 to-red-500',
    rarity: 'rare',
  },
  {
    id: 'problem-solver',
    name: '문제 해결사',
    description: '100문제 달성',
    icon: <Target className="w-6 h-6" />,
    gradient: 'from-green-400 to-emerald-500',
    rarity: 'rare',
  },
  {
    id: 'speed-master',
    name: '속도의 달인',
    description: '10분 안에 10문제',
    icon: <Zap className="w-6 h-6" />,
    gradient: 'from-yellow-400 to-orange-500',
    rarity: 'epic',
  },
  {
    id: 'perfect-score',
    name: '완벽주의자',
    description: '연속 만점 5회',
    icon: <Award className="w-6 h-6" />,
    gradient: 'from-purple-400 to-pink-500',
    rarity: 'epic',
  },
  {
    id: 'legend',
    name: '전설의 학습자',
    description: '레벨 50 달성',
    icon: <Crown className="w-6 h-6" />,
    gradient: 'from-yellow-300 via-yellow-400 to-orange-500',
    rarity: 'legendary',
  },
];

const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: '김수현', avatar: '👑', points: 15420, level: 52, badge: '전설' },
  { rank: 2, name: '이민호', avatar: '🥈', points: 14850, level: 48, badge: '달인' },
  { rank: 3, name: '박서준', avatar: '🥉', points: 13990, level: 45, badge: '전문가' },
  { rank: 4, name: '정해인', avatar: '⭐', points: 12340, level: 42, badge: '고수' },
  { rank: 5, name: '송중기', avatar: '✨', points: 11820, level: 40, badge: '중급자' },
];

function BadgeCard({ badge, delay }: { badge: Badge; delay: number }) {
  const rarityColors = {
    common: 'border-gray-300 bg-gray-50',
    rare: 'border-blue-300 bg-blue-50',
    epic: 'border-purple-300 bg-purple-50',
    legendary: 'border-yellow-300 bg-yellow-50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ duration: 0.4, delay }}
      className={`relative p-6 rounded-2xl border-2 ${rarityColors[badge.rarity]} shadow-lg hover:shadow-xl transition-all group`}
    >
      {/* Glow Effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${badge.gradient} opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity`}
      />

      {/* Badge Icon */}
      <div className={`relative z-10 w-16 h-16 rounded-full bg-gradient-to-br ${badge.gradient} flex items-center justify-center text-white shadow-lg mb-4 mx-auto`}>
        {badge.icon}
      </div>

      {/* Badge Info */}
      <div className="text-center">
        <h3 className="font-bold text-gray-900 mb-1">{badge.name}</h3>
        <p className="text-xs text-gray-600">{badge.description}</p>
      </div>

      {/* Rarity Badge */}
      <div className="absolute top-2 right-2">
        <div
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            badge.rarity === 'legendary'
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
              : badge.rarity === 'epic'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : badge.rarity === 'rare'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-400 text-white'
          }`}
        >
          {badge.rarity.toUpperCase()}
        </div>
      </div>
    </motion.div>
  );
}

function LeaderboardRow({ entry, delay }: { entry: LeaderboardEntry; delay: number }) {
  const rankColors = {
    1: 'from-yellow-400 to-orange-500',
    2: 'from-gray-300 to-gray-400',
    3: 'from-orange-300 to-orange-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow hover:shadow-lg transition-all group"
    >
      {/* Rank */}
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
          entry.rank <= 3
            ? `bg-gradient-to-br ${rankColors[entry.rank as 1 | 2 | 3]}`
            : 'bg-gradient-to-br from-gray-400 to-gray-500'
        }`}
      >
        {entry.rank}
      </div>

      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-2xl">
        {entry.avatar}
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="font-bold text-gray-900">{entry.name}</div>
        <div className="text-sm text-gray-600">Level {entry.level}</div>
      </div>

      {/* Badge */}
      <div className="hidden sm:block px-3 py-1 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full text-xs font-semibold text-primary-700">
        {entry.badge}
      </div>

      {/* Points */}
      <div className="text-right">
        <div className="font-bold text-primary-600">{entry.points.toLocaleString()}</div>
        <div className="text-xs text-gray-500">포인트</div>
      </div>
    </motion.div>
  );
}

export function GamificationPreviewSection() {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full mb-4">
            <Trophy className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-bold text-orange-700">게이미피케이션</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
            게임처럼 재미있는 학습
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            레벨업, 배지 수집, 리더보드 경쟁까지!
            <br className="hidden sm:block" />
            학습이 즐거워지는 동기부여 시스템
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Badges Collection */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">배지 컬렉션</h3>
                  <p className="text-sm text-gray-600">다양한 배지를 수집하세요</p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {badges.map((badge, index) => (
                <BadgeCard key={badge.id} badge={badge} delay={index * 0.1} />
              ))}
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-6 grid grid-cols-3 gap-4"
            >
              <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow">
                <div className="text-2xl font-bold text-yellow-600 mb-1">50+</div>
                <div className="text-xs text-gray-600">배지 종류</div>
              </div>
              <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow">
                <div className="text-2xl font-bold text-purple-600 mb-1">100+</div>
                <div className="text-xs text-gray-600">레벨</div>
              </div>
              <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow">
                <div className="text-2xl font-bold text-pink-600 mb-1">Daily</div>
                <div className="text-xs text-gray-600">도전과제</div>
              </div>
            </motion.div>
          </div>

          {/* Right: Leaderboard */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">실시간 리더보드</h3>
                  <p className="text-sm text-gray-600">친구들과 경쟁하세요</p>
                </div>
              </div>
            </motion.div>

            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <LeaderboardRow key={entry.rank} entry={entry} delay={index * 0.1} />
              ))}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
              <Star className="w-7 h-7 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">경험치 획득</h4>
            <p className="text-sm text-gray-600">학습할수록 레벨업!</p>
          </div>

          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">도전 과제</h4>
            <p className="text-sm text-gray-600">매일 새로운 미션!</p>
          </div>

          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <Flame className="w-7 h-7 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">연속 학습</h4>
            <p className="text-sm text-gray-600">스트릭 유지 보상!</p>
          </div>

          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">리더보드</h4>
            <p className="text-sm text-gray-600">친구와 경쟁!</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
