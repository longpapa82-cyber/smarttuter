import type { Metadata } from 'next';
import { HomeClient } from './HomeClient';
import { AllSchemas } from '@/components/seo/StructuredData';

// Homepage-specific metadata
export const metadata: Metadata = {
  title: 'AI Park - AI 기반 맞춤형 학습 플랫폼 | 영어·수학·국어·과학·사회',
  description:
    'AI Park과 함께 학습 성적을 35점 이상 향상시키세요! 초등학교부터 대학교까지 5개 과목 실시간 AI 튜터링. 98% 학생 만족도, 무료 체험 7일. 맞춤형 학습 경로, 게이미피케이션, 실시간 음성 대화로 효과적인 학습을 경험하세요.',
  keywords: [
    'AI 튜터',
    'AI 학습',
    '온라인 교육',
    '맞춤형 학습',
    '영어 튜터',
    '수학 튜터',
    '국어 학습',
    '과학 학습',
    '사회 학습',
    '실시간 튜터링',
    '성적 향상',
    '학습 플랫폼',
    '초등 학습',
    '중등 학습',
    '고등 학습',
    '대학 학습',
    '게이미피케이션',
    'AI 교육',
    '음성 학습',
    '맞춤형 교육',
  ],
  openGraph: {
    title: 'AI Park - 성적 35점↑ AI 맞춤형 학습 | 무료 체험 7일',
    description:
      '98% 학생이 만족하는 AI 튜터와 함께 학습하세요. 영어·수학·국어·과학·사회 5개 과목, 실시간 음성 대화, 게이미피케이션으로 즐겁게 성적 향상!',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Park - AI 기반 맞춤형 학습 플랫폼',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Park - 성적 35점↑ AI 맞춤형 학습',
    description: '98% 학생 만족도! 5개 과목 실시간 AI 튜터링으로 효과적인 학습 경험',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  return (
    <>
      {/* Structured Data (Schema.org JSON-LD) */}
      <AllSchemas />

      {/* Main Homepage Content */}
      <HomeClient />
    </>
  );
}
