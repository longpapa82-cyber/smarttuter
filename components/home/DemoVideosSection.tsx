'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Play, BookOpen, Calculator, Beaker, Landmark, Book, Sparkles } from 'lucide-react';
import { VideoModal } from '@/components/demo/VideoModal';

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
    videoUrl: '/videos/demo.mp4',
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
    videoUrl: '/videos/demo.mp4',
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
    videoUrl: '/videos/demo.mp4',
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
    videoUrl: '/videos/demo.mp4',
    duration: '3:00',
  },
  {
    id: 'korean-demo',
    title: '국어 문학 감상',
    description: 'AI와 함께 읽는 문학 작품 해석',
    subject: 'Korean',
    icon: <Book className="w-6 h-6" />,
    gradient: 'from-pink-500 to-rose-600',
    videoUrl: '/videos/demo.mp4',
    duration: '2:20',
  },
];

function VideoCard({ video, onClick }: { video: DemoVideo; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="relative group cursor-pointer rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl"
    >
      {/* Video Thumbnail / Gradient Background */}
      <div className={`relative w-full h-64 bg-gradient-to-br ${video.gradient} flex items-center justify-center`}>
        {/* Glow Effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all duration-500" />

        {/* Play Button */}
        <motion.div
          whileHover={{ scale: 1.15 }}
          className="relative z-10 w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-4 border-white/30 group-hover:bg-white/30 transition-all"
        >
          <Play className="w-8 h-8 text-white ml-1" fill="white" />
        </motion.div>

        {/* Duration Badge */}
        <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
          {video.duration}
        </div>

        {/* Hot Badge */}
        {video.badge && (
          <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-white flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {video.badge}
          </div>
        )}

        {/* Subject Icon */}
        <div className="absolute top-4 left-4 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
          {video.icon}
        </div>
      </div>

      {/* Card Content */}
      <div className="bg-white p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className={`px-2 py-1 rounded-lg bg-gradient-to-r ${video.gradient} text-white text-xs font-semibold`}>
            {video.subject}
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
          {video.title}
        </h3>
        <p className="text-sm text-gray-600">{video.description}</p>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
}

export function DemoVideosSection() {
  const [selectedVideo, setSelectedVideo] = useState<DemoVideo | null>(null);

  return (
    <>
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-gray-50 via-white to-indigo-50 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full mb-4">
              <Play className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-bold text-primary-700">실제 학습 체험</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
              AI Park 학습 과정을
              <br />
              직접 확인해보세요
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              실제 학생들이 AI 튜터와 함께 학습하는 모습을 영상으로 체험해보세요
              <br className="hidden sm:block" />
              과목별 맞춤형 학습 방법을 확인할 수 있습니다
            </p>
          </motion.div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {demoVideos.map((video, index) => (
              <VideoCard
                key={video.id}
                video={video}
                onClick={() => setSelectedVideo(video)}
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

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          videoUrl={selectedVideo.videoUrl}
          title={selectedVideo.title}
          description={selectedVideo.description}
          ctaButton={{
            text: '지금 시작하기 →',
            href: '/onboarding/quick',
          }}
        />
      )}
    </>
  );
}
