'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Star,
  Quote,
  TrendingUp,
  Award,
  BookOpen,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  grade: string;
  subject: string;
  avatar: string;
  rating: number;
  improvement: string;
  quote: string;
  achievement: string;
  subjectIcon: React.ReactNode;
  gradient: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: '김민준',
    grade: '중학교 2학년',
    subject: 'English',
    avatar: '👨‍🎓',
    rating: 5,
    improvement: '+42점',
    quote:
      'AI Park 덕분에 영어 회화가 정말 편해졌어요! 실시간 발음 교정과 대화 연습이 너무 좋아요. 원어민과 대화하는 것처럼 자연스러워요.',
    achievement: '모의고사 영어 점수 58점 → 92점',
    subjectIcon: <BookOpen className="w-5 h-5" />,
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    id: '2',
    name: '이서윤',
    grade: '고등학교 1학년',
    subject: 'Math',
    avatar: '👩‍🎓',
    rating: 5,
    improvement: '+35점',
    quote:
      '수학 문제 풀이를 단계별로 설명해주니까 이해가 훨씬 잘 돼요. 특히 시각화 기능이 개념 이해에 큰 도움이 되었습니다.',
    achievement: '수학 내신 3등급 → 1등급',
    subjectIcon: <Calculator className="w-5 h-5" />,
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    id: '3',
    name: '박지호',
    grade: '중학교 3학년',
    subject: 'Science',
    avatar: '👨‍🔬',
    rating: 5,
    improvement: '+28점',
    quote:
      '과학 실험 시뮬레이션이 정말 신기해요! 집에서도 실험을 해볼 수 있어서 과학이 재미있어졌어요. AI 선생님이 질문에 바로바로 답해줘서 좋아요.',
    achievement: '과학 경시대회 금상 수상',
    subjectIcon: <BookOpen className="w-5 h-5" />,
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    id: '4',
    name: '최수아',
    grade: '고등학교 2학년',
    subject: 'Korean',
    avatar: '👩‍🎨',
    rating: 5,
    improvement: '+30점',
    quote:
      '문학 작품 해석이 어려웠는데, AI 튜터가 다양한 관점에서 설명해주니까 이해가 쉬워졌어요. 논술 실력도 많이 늘었습니다!',
    achievement: '국어 모의고사 1등급 달성',
    subjectIcon: <BookOpen className="w-5 h-5" />,
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    id: '5',
    name: '정우진',
    grade: '초등학교 6학년',
    subject: 'Math',
    avatar: '👦',
    rating: 5,
    improvement: '+25점',
    quote:
      '게임처럼 재미있게 공부할 수 있어서 매일 하고 싶어요! 레벨업 하는 재미가 있고, 배지 모으는 것도 좋아요. 수학이 이제 제일 좋아하는 과목이에요!',
    achievement: '수학 경시대회 전국 20위',
    subjectIcon: <Calculator className="w-5 h-5" />,
    gradient: 'from-yellow-500 to-orange-600',
  },
  {
    id: '6',
    name: '한지민',
    grade: '고등학교 3학년',
    subject: 'English',
    avatar: '👩‍💼',
    rating: 5,
    improvement: '+38점',
    quote:
      '수능 준비하면서 AI Park으로 영어 공부했는데 정말 효율적이었어요. 특히 듣기와 독해 실력이 많이 늘었습니다. 목표 대학에 합격했어요!',
    achievement: '수능 영어 1등급 / 서울대 합격',
    subjectIcon: <BookOpen className="w-5 h-5" />,
    gradient: 'from-indigo-500 to-blue-600',
  },
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative bg-white rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all group"
    >
      {/* Quote Icon */}
      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
        <Quote className="w-6 h-6 text-white" />
      </div>

      {/* Rating */}
      <div className="flex gap-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        ))}
      </div>

      {/* Quote */}
      <p className="text-gray-700 text-base sm:text-lg mb-6 leading-relaxed italic">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      {/* Achievement Badge */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-green-600" />
          <span className="text-sm font-semibold text-green-700">성취 결과</span>
        </div>
        <p className="text-sm text-green-800 font-medium">{testimonial.achievement}</p>
      </div>

      {/* Author Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-3xl">
            {testimonial.avatar}
          </div>
          <div>
            <div className="font-bold text-gray-900">{testimonial.name}</div>
            <div className="text-sm text-gray-600">{testimonial.grade}</div>
          </div>
        </div>

        {/* Improvement Badge */}
        <div className={`flex flex-col items-end gap-2`}>
          <div
            className={`px-4 py-2 rounded-full bg-gradient-to-r ${testimonial.gradient} text-white font-bold shadow-lg flex items-center gap-2`}
          >
            <TrendingUp className="w-4 h-4" />
            {testimonial.improvement}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            {testimonial.subjectIcon}
            <span>{testimonial.subject}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function SuccessStoriesSection() {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(testimonials.length / itemsPerPage);

  const currentTestimonials = testimonials.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const goToNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />

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
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-bold text-orange-700">실제 학생 후기</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
            학생들의 성공 스토리
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            AI Park과 함께 꿈을 이룬 학생들의 생생한 이야기를 들어보세요
            <br className="hidden sm:block" />
            여러분도 다음 성공 주인공이 될 수 있습니다
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {currentTestimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {/* Pagination Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goToPrevPage}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>

          {/* Page Indicators */}
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentPage === index
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 w-8'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goToNextPage}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
        >
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
            <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">98%</div>
            <div className="text-sm sm:text-base text-gray-600">학습자 만족도</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
            <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">+35점</div>
            <div className="text-sm sm:text-base text-gray-600">평균 성적 향상</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
            <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">85%</div>
            <div className="text-sm sm:text-base text-gray-600">목표 달성률</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl">
            <div className="text-3xl sm:text-4xl font-bold text-orange-600 mb-2">4.9/5</div>
            <div className="text-sm sm:text-base text-gray-600">평균 평점</div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .bg-grid-slate-100 {
          background-image: linear-gradient(to right, rgb(241 245 249) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(241 245 249) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </section>
  );
}
