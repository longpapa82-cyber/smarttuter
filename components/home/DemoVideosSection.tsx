'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Play, BookOpen, Calculator, Beaker, Landmark, Book } from 'lucide-react';
import { EnhancedVideoCard } from './EnhancedVideoCard';

interface DemoVideo {
  id: string;
  title: string;
  description: string;
  subject: string;
  icon: React.ReactNode;
  gradient: string;
  videoUrl: string;
  thumbnail?: string;
  duration: string;
  badge?: string;
}

const demoVideos: DemoVideo[] = [
  {
    id: 'english-demo',
    title: '영어 AI 튜터 체험',
    description: '실시간 음성 대화로 영어 회화를 배우는 과정',
    subject: 'English',
    icon: <BookOpen className="w-6 h-6" />,
    gradient: 'from-blue-500 to-cyan-600',
    videoUrl: '/videos/english-demo.mp4',
    duration: '2:30',
    badge: 'POPULAR',
  },
  {
    id: 'math-demo',
    title: '수학 문제 풀이',
    description: 'AI가 단계별로 설명하는 수학 문제 해결 과정',
    subject: 'Math',
    icon: <Calculator className="w-6 h-6" />,
    gradient: 'from-green-500 to-emerald-600',
    videoUrl: '/videos/math-demo.mp4',
    duration: '3:15',
    badge: 'HOT',
  },
  {
    id: 'science-demo',
    title: '과학 실험 시뮬레이션',
    description: '인터랙티브 과학 실험과 AI 설명',
    subject: 'Science',
    icon: <Beaker className="w-6 h-6" />,
    gradient: 'from-purple-500 to-pink-600',
    videoUrl: '/videos/science-demo.mp4',
    duration: '2:45',
    badge: 'NEW',
  },
  {
    id: 'social-demo',
    title: '사회 탐구 학습',
    description: 'AI와 함께하는 역사와 지리 탐험',
    subject: 'Social',
    icon: <Landmark className="w-6 h-6" />,
    gradient: 'from-orange-500 to-red-600',
    videoUrl: '/videos/social-demo.mp4',
    duration: '3:00',
  },
  {
    id: 'korean-demo',
    title: '국어 문학 감상',
    description: 'AI와 함께 읽는 문학 작품 해석',
    subject: 'Korean',
    icon: <Book className="w-6 h-6" />,
    gradient: 'from-pink-500 to-rose-600',
    videoUrl: '/videos/korean-demo.mp4',
    duration: '2:20',
  },
];

export function DemoVideosSection() {
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const handleVideoToggle = (videoId: string) => {
    // 다른 비디오가 재생 중이면 중단하고 새 비디오 재생
    setPlayingVideoId(playingVideoId === videoId ? null : videoId);
  };

  return (
    <>
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-secondary-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4 border border-white/20">
              <Play className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-bold text-white">실제 학습 체험</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              AI Park 학습 과정을
              <br />
              직접 확인해보세요
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              실제 학생들이 AI 튜터와 함께 학습하는 모습을 영상으로 체험해보세요
              <br className="hidden sm:block" />
              과목별 맞춤형 학습 방법을 확인할 수 있습니다
            </p>
          </motion.div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {demoVideos.map((video, index) => (
              <EnhancedVideoCard
                key={video.id}
                video={video}
                index={index}
                isPlaying={playingVideoId === video.id}
                onPlayToggle={() => handleVideoToggle(video.id)}
              />
            ))}
          </div>
        </div>

        <style jsx>{`
          .bg-grid-white {
            background-image: linear-gradient(
                to right,
                rgba(255, 255, 255, 0.1) 1px,
                transparent 1px
              ),
              linear-gradient(
                to bottom,
                rgba(255, 255, 255, 0.1) 1px,
                transparent 1px
              );
            background-size: 20px 20px;
          }
        `}</style>
      </section>
    </>
  );
}
