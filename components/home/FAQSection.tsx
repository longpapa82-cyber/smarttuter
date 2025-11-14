'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'pricing' | 'features' | 'technical';
}

const faqs: FAQItem[] = [
  {
    id: '1',
    question: 'AI Park은 어떤 서비스인가요?',
    answer:
      'AI Park은 인공지능 기반 개인 맞춤형 학습 플랫폼입니다. 초등학교부터 대학교까지, 영어·수학·과학·사회·국어 5개 과목을 실시간 음성 및 채팅으로 배울 수 있습니다. AI 튜터가 학생의 수준과 학습 패턴을 분석하여 최적화된 학습 경로를 제공합니다.',
    category: 'general',
  },
  {
    id: '2',
    question: '무료로 이용할 수 있나요?',
    answer:
      '네! 7일간 무료 체험이 가능합니다. 신용카드 등록 없이 바로 시작할 수 있으며, 체험 기간 동안 모든 기능을 제한 없이 사용하실 수 있습니다. 체험 후 만족하시면 유료 플랜으로 전환하실 수 있습니다.',
    category: 'pricing',
  },
  {
    id: '3',
    question: '어떤 기능들이 있나요?',
    answer:
      'AI 튜터와의 실시간 대화, 맞춤형 AI 퀴즈, 플래시카드 학습, 간격 반복 학습, 발음 연습, 수학 시각화, 감정 분석, 마이크로러닝, 게이미피케이션 시스템 등 다양한 기능을 제공합니다. 모든 기능은 과학적 학습 이론을 기반으로 설계되었습니다.',
    category: 'features',
  },
  {
    id: '4',
    question: '어떤 학년이 이용할 수 있나요?',
    answer:
      '초등학교, 중학교, 고등학교, 대학교 전 학년이 이용 가능합니다. AI가 각 학생의 학년과 수준에 맞춰 학습 내용과 난이도를 자동으로 조절합니다. 온보딩 과정에서 학년과 목표를 설정하면 맞춤형 학습이 시작됩니다.',
    category: 'general',
  },
  {
    id: '5',
    question: '음성 인식은 어떻게 작동하나요?',
    answer:
      '최신 AI 음성 인식 기술을 사용하여 학생의 발음과 억양을 실시간으로 분석합니다. 영어 발음 연습 시 정확한 피드백을 제공하며, 한국어로도 자연스러운 대화가 가능합니다. 마이크만 있으면 즉시 이용 가능합니다.',
    category: 'technical',
  },
  {
    id: '6',
    question: '학습 진도는 어떻게 관리되나요?',
    answer:
      '대시보드에서 실시간으로 학습 진도를 확인할 수 있습니다. 학습 시간, 완료한 문제 수, 정답률, 취약 영역 등을 한눈에 볼 수 있으며, 주간/월간 리포트도 제공됩니다. AI가 자동으로 다음 학습 계획을 추천해드립니다.',
    category: 'features',
  },
  {
    id: '7',
    question: '오프라인에서도 사용할 수 있나요?',
    answer:
      '일부 기능은 오프라인에서도 사용 가능합니다. 플래시카드와 다운로드된 학습 자료는 인터넷 연결 없이 이용할 수 있습니다. 다만 AI 튜터와의 실시간 대화, 음성 인식 등은 인터넷 연결이 필요합니다.',
    category: 'technical',
  },
  {
    id: '8',
    question: '가격은 어떻게 되나요?',
    answer:
      '무료 체험 후 월 9,900원부터 시작하는 다양한 플랜이 있습니다. 학생 플랜, 가족 플랜(최대 4명), 프리미엄 플랜 등 필요에 맞는 플랜을 선택하실 수 있습니다. 연간 결제 시 최대 30% 할인이 적용됩니다.',
    category: 'pricing',
  },
  {
    id: '9',
    question: '데이터는 안전하게 보호되나요?',
    answer:
      '네, 모든 개인정보와 학습 데이터는 암호화되어 안전하게 보호됩니다. 개인정보보호법을 준수하며, 학생의 데이터는 학습 개선 목적 외에는 절대 사용되지 않습니다. 언제든지 데이터 삭제를 요청하실 수 있습니다.',
    category: 'technical',
  },
  {
    id: '10',
    question: '실제로 성적이 오르나요?',
    answer:
      '네! 평균적으로 3개월 사용 시 35점 이상의 성적 향상을 보입니다. 98%의 학생이 만족하며, 85%가 목표를 달성했습니다. 개인차는 있지만, 꾸준히 사용하실 경우 확실한 효과를 경험하실 수 있습니다.',
    category: 'general',
  },
];

const categories = {
  all: '전체',
  general: '일반',
  pricing: '가격',
  features: '기능',
  technical: '기술',
};

function FAQItemComponent({ faq, isOpen, onToggle }: { faq: FAQItem; isOpen: boolean; onToggle: () => void }) {
  const contentId = `faq-content-${faq.id}`;
  const buttonId = `faq-button-${faq.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden"
    >
      <button
        id={buttonId}
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0"
          aria-hidden="true"
        >
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={contentId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | FAQItem['category']>('all');

  const filteredFaqs = selectedCategory === 'all' ? faqs : faqs.filter((faq) => faq.category === selectedCategory);

  return (
    <section
      className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden"
      aria-labelledby="faq-heading"
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,white,transparent)] opacity-50 pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full mb-4">
            <HelpCircle className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span className="text-sm font-bold text-blue-700">자주 묻는 질문</span>
          </div>
          <h2
            id="faq-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent"
          >
            궁금한 것이 있으신가요?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            AI Park에 대해 자주 묻는 질문들을 모았습니다
            <br className="hidden sm:block" />
            원하는 답을 찾지 못하셨다면 언제든 문의해주세요
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
          role="group"
          aria-label="FAQ 카테고리 필터"
        >
          {Object.entries(categories).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key as any)}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                selectedCategory === key
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
              }`}
              aria-pressed={selectedCategory === key}
            >
              {label}
            </button>
          ))}
        </motion.div>

        {/* FAQ List */}
        <div className="space-y-4 mb-12">
          {filteredFaqs.map((faq) => (
            <FAQItemComponent
              key={faq.id}
              faq={faq}
              isOpen={openId === faq.id}
              onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
            />
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center p-8 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 rounded-3xl shadow-2xl"
        >
          <Sparkles className="w-12 h-12 text-white mx-auto mb-4" />
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            더 궁금한 것이 있으신가요?
          </h3>
          <p className="text-white/90 mb-6 max-w-lg mx-auto">
            고객 지원팀이 24/7 대기하고 있습니다
            <br className="hidden sm:block" />
            언제든지 편하게 문의해주세요
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.a
              href="/onboarding/quick"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-primary-600 font-bold rounded-full shadow-xl hover:shadow-2xl transition-all inline-block"
            >
              무료로 시작하기 →
            </motion.a>
            <motion.a
              href="mailto:support@aipark.com"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white/20 backdrop-blur-sm border-2 border-white text-white font-bold rounded-full hover:bg-white/30 transition-all inline-block"
            >
              문의하기
            </motion.a>
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
