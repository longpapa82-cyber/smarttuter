// components/microlearning/ModuleCard.tsx

'use client';

import { motion } from 'framer-motion';
import { Clock, Award, BookOpen, Lock, CheckCircle, PlayCircle } from 'lucide-react';
import type { MicrolearningModule, ModuleStatus } from '@/types/microlearning';

interface ModuleCardProps {
  module: MicrolearningModule;
  status: ModuleStatus;
  progress?: number;
  onClick?: () => void;
}

const STATUS_CONFIG = {
  locked: {
    icon: Lock,
    color: 'text-gray-400',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    label: '잠김',
  },
  available: {
    icon: PlayCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    label: '시작하기',
  },
  in_progress: {
    icon: BookOpen,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    label: '진행 중',
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    label: '완료',
  },
  mastered: {
    icon: Award,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    label: '숙달',
  },
};

const DIFFICULTY_CONFIG = {
  beginner: {
    label: '초급',
    color: 'bg-green-100 text-green-800',
  },
  intermediate: {
    label: '중급',
    color: 'bg-yellow-100 text-yellow-800',
  },
  advanced: {
    label: '고급',
    color: 'bg-orange-100 text-orange-800',
  },
  expert: {
    label: '전문가',
    color: 'bg-red-100 text-red-800',
  },
};

const TYPE_CONFIG = {
  concept: { label: '개념', emoji: '📖' },
  practice: { label: '연습', emoji: '✏️' },
  quiz: { label: '퀴즈', emoji: '🎯' },
  video: { label: '비디오', emoji: '🎥' },
  interactive: { label: '인터랙티브', emoji: '🎮' },
  reading: { label: '읽기', emoji: '📚' },
};

export function ModuleCard({ module, status, progress = 0, onClick }: ModuleCardProps) {
  const statusConfig = STATUS_CONFIG[status];
  const difficultyConfig = DIFFICULTY_CONFIG[module.difficulty];
  const typeConfig = TYPE_CONFIG[module.type];
  const StatusIcon = statusConfig.icon;

  const isLocked = status === 'locked';
  const isClickable = !isLocked && onClick;

  return (
    <motion.div
      whileHover={isClickable ? { scale: 1.02, y: -2 } : undefined}
      whileTap={isClickable ? { scale: 0.98 } : undefined}
      onClick={isClickable ? onClick : undefined}
      className={`
        relative overflow-hidden rounded-2xl border-2 p-6 transition-all
        ${statusConfig.borderColor} ${statusConfig.bgColor}
        ${isClickable ? 'cursor-pointer hover:shadow-lg' : 'cursor-default opacity-75'}
      `}
    >
      {/* Progress Bar */}
      {status === 'in_progress' && progress > 0 && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{module.thumbnail}</div>
          <div>
            <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
              {module.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {module.description}
            </p>
          </div>
        </div>

        {/* Status Icon */}
        <div className={`p-2 rounded-full ${statusConfig.bgColor}`}>
          <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
        </div>
      </div>

      {/* Meta Information */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Difficulty */}
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyConfig.color}`}>
          {difficultyConfig.label}
        </span>

        {/* Type */}
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {typeConfig.emoji} {typeConfig.label}
        </span>

        {/* Duration */}
        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          <Clock className="w-3 h-3" />
          {module.estimatedMinutes}분
        </span>

        {/* XP Reward */}
        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <Award className="w-3 h-3" />
          +{module.xpReward} XP
        </span>
      </div>

      {/* Learning Objectives */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">학습 목표</h4>
        <ul className="space-y-1">
          {module.learningObjectives.slice(0, 2).map((objective, index) => (
            <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
              <span className="text-blue-500 mt-0.5">•</span>
              <span className="line-clamp-1">{objective}</span>
            </li>
          ))}
          {module.learningObjectives.length > 2 && (
            <li className="text-xs text-gray-500 italic">
              +{module.learningObjectives.length - 2}개 더
            </li>
          )}
        </ul>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex gap-1">
          {module.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 rounded text-xs bg-white/50 text-gray-600"
            >
              #{tag}
            </span>
          ))}
        </div>

        <span className={`text-xs font-semibold ${statusConfig.color}`}>
          {statusConfig.label}
        </span>
      </div>

      {/* Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] flex items-center justify-center">
          <div className="bg-white rounded-xl px-4 py-2 shadow-lg flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              선행 학습 필요
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
