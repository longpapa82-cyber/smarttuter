'use client';

import Link from 'next/link';

interface DifferentiationFeature {
  icon: string;
  title: string;
  description: string;
  highlight: string;
}

const features: DifferentiationFeature[] = [
  {
    icon: '🧠',
    title: 'Google Gemini 2.0 Flash',
    description: '최신 AI 모델로 빠르고 정확한 답변',
    highlight: '초저지연 실시간 응답'
  },
  {
    icon: '🎯',
    title: 'RAG 기반 맞춤 학습',
    description: '한국 교육과정 기반 커리큘럼 데이터베이스',
    highlight: '학년별 맞춤 콘텐츠'
  },
  {
    icon: '🔬',
    title: '5개 과목 통합 지원',
    description: '영어, 수학, 과학, 사회, 국어를 하나의 플랫폼에서',
    highlight: '세계 최초 5과목 AI 튜터'
  },
  {
    icon: '🎤',
    title: '실시간 음성 인식',
    description: 'Web Speech API 기반 자연스러운 대화',
    highlight: '발음 교정 & 피드백'
  },
  {
    icon: '📊',
    title: '학습 데이터 분석',
    description: 'Redis 기반 실시간 학습 추적',
    highlight: '개인화 학습 경로'
  },
  {
    icon: '🏆',
    title: '게이미피케이션',
    description: '레벨, 배지, 스트릭으로 동기부여',
    highlight: '지속 가능한 학습'
  }
];

export function AIDifferentiationSection() {
  return (
    <section className="relative py-20 px-4 bg-gradient-to-br from-white via-indigo-50 to-purple-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-secondary-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-block mb-4 px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full">
            <span className="text-white font-semibold text-sm">AI PARK DIFFERENCE</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
              AI Park만의 특별함
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            최신 AI 기술과 교육 전문성이 결합된 차별화된 학습 경험을 제공합니다
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-secondary-500/20 to-accent-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {feature.description}
                </p>

                {/* Highlight Badge */}
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-full border border-primary-200 group-hover:border-primary-400 transition-colors duration-300">
                  <span className="w-2 h-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    {feature.highlight}
                  </span>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <h3 className="text-3xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              AI Park vs 일반 튜터링 서비스
            </span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold">기능</th>
                  <th className="text-center py-4 px-6">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl mb-2">🎓</span>
                      <span className="font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">AI Park</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-6 text-gray-500">일반 서비스</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-700">과목 지원</td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-full text-primary-700 font-semibold">
                      ✓ 5개 과목 통합
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center text-gray-400">1-2개 과목</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-700">응답 속도</td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-full text-primary-700 font-semibold">
                      ✓ 실시간 (1초 이내)
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center text-gray-400">5-10초</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-700">학습 데이터 분석</td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-full text-primary-700 font-semibold">
                      ✓ 실시간 AI 분석
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center text-gray-400">기본 통계만</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-700">음성 인식</td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-full text-primary-700 font-semibold">
                      ✓ 고급 음성 인식
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center text-gray-400">미지원</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-700">가격</td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-full text-primary-700 font-semibold">
                      ✓ 무료 체험
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center text-gray-400">유료만</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <Link
            href="/login"
            className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 text-white rounded-full font-semibold text-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300 group"
          >
            <span>AI Park 무료 체험하기</span>
            <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}
