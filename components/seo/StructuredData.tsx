import Script from 'next/script';

/**
 * Organization Schema - AI Park 조직 정보
 */
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AI Park',
    alternateName: 'Smart Tutor',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    logo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/og-image.png`,
    description: 'AI 기반 개인 맞춤형 학습 플랫폼 - 초등학교부터 대학교까지 5개 과목 실시간 튜터링',
    foundingDate: '2024',
    sameAs: [
      'https://twitter.com/smarttuter',
      // 추가 소셜 미디어 링크
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@aipark.com',
      availableLanguage: ['Korean', 'English'],
    },
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * WebSite Schema - AI Park 웹사이트 정보
 */
export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AI Park',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    description: '초등학교부터 대학교까지 AI 튜터와 함께하는 맞춤형 학습 플랫폼',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'ko-KR',
  };

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * FAQPage Schema - 자주 묻는 질문 페이지
 */
export function FAQPageSchema() {
  const faqs = [
    {
      question: 'AI Park은 어떤 서비스인가요?',
      answer:
        'AI Park은 인공지능 기반 개인 맞춤형 학습 플랫폼입니다. 초등학교부터 대학교까지, 영어·수학·과학·사회·국어 5개 과목을 실시간 음성 및 채팅으로 배울 수 있습니다. AI 튜터가 학생의 수준과 학습 패턴을 분석하여 최적화된 학습 경로를 제공합니다.',
    },
    {
      question: '무료로 이용할 수 있나요?',
      answer:
        '네! 7일간 무료 체험이 가능합니다. 신용카드 등록 없이 바로 시작할 수 있으며, 체험 기간 동안 모든 기능을 제한 없이 사용하실 수 있습니다. 체험 후 만족하시면 유료 플랜으로 전환하실 수 있습니다.',
    },
    {
      question: '어떤 기능들이 있나요?',
      answer:
        'AI 튜터와의 실시간 대화, 맞춤형 AI 퀴즈, 플래시카드 학습, 간격 반복 학습, 발음 연습, 수학 시각화, 감정 분석, 마이크로러닝, 게이미피케이션 시스템 등 다양한 기능을 제공합니다. 모든 기능은 과학적 학습 이론을 기반으로 설계되었습니다.',
    },
    {
      question: '어떤 학년이 이용할 수 있나요?',
      answer:
        '초등학교, 중학교, 고등학교, 대학교 전 학년이 이용 가능합니다. AI가 각 학생의 학년과 수준에 맞춰 학습 내용과 난이도를 자동으로 조절합니다. 온보딩 과정에서 학년과 목표를 설정하면 맞춤형 학습이 시작됩니다.',
    },
    {
      question: '가격은 어떻게 되나요?',
      answer:
        '무료 체험 후 월 9,900원부터 시작하는 다양한 플랜이 있습니다. 학생 플랜, 가족 플랜(최대 4명), 프리미엄 플랜 등 필요에 맞는 플랜을 선택하실 수 있습니다. 연간 결제 시 최대 30% 할인이 적용됩니다.',
    },
    {
      question: '실제로 성적이 오르나요?',
      answer:
        '네! 평균적으로 3개월 사용 시 35점 이상의 성적 향상을 보입니다. 98%의 학생이 만족하며, 85%가 목표를 달성했습니다. 개인차는 있지만, 꾸준히 사용하실 경우 확실한 효과를 경험하실 수 있습니다.',
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * EducationalOrganization Schema - 교육 기관으로서의 AI Park
 */
export function EducationalOrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'AI Park',
    description: 'AI 기반 개인 맞춤형 학습 플랫폼',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    sameAs: ['https://twitter.com/smarttuter'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'AI Park 학습 과목',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Course',
            name: 'English (영어)',
            description: '실시간 음성 기반 영어 튜터링 - 발음 연습, 회화, 문법',
            provider: {
              '@type': 'Organization',
              name: 'AI Park',
            },
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Course',
            name: 'Math (수학)',
            description: '개념 설명, 문제 풀이, 시각화를 통한 수학 학습',
            provider: {
              '@type': 'Organization',
              name: 'AI Park',
            },
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Course',
            name: 'Korean (국어)',
            description: '문학 해석, 논술, 독해 능력 향상',
            provider: {
              '@type': 'Organization',
              name: 'AI Park',
            },
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Course',
            name: 'Science (과학)',
            description: '실험 시뮬레이션, 개념 설명, 과학적 사고력 향상',
            provider: {
              '@type': 'Organization',
              name: 'AI Park',
            },
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Course',
            name: 'Social (사회)',
            description: '역사, 지리, 사회 문화 학습',
            provider: {
              '@type': 'Organization',
              name: 'AI Park',
            },
          },
        },
      ],
    },
  };

  return (
    <Script
      id="educational-organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * SoftwareApplication Schema - AI Park 앱/플랫폼 정보
 */
export function SoftwareApplicationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AI Park',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '9900',
      priceCurrency: 'KRW',
      priceValidUntil: '2025-12-31',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '10000',
      bestRating: '5',
      worstRating: '1',
    },
    description: 'AI 기반 개인 맞춤형 학습 플랫폼 - 영어, 수학, 국어, 과학, 사회 5개 과목 실시간 튜터링',
    featureList: [
      '실시간 AI 튜터 대화',
      '맞춤형 AI 퀴즈',
      '플래시카드 학습',
      '간격 반복 학습',
      '발음 연습',
      '수학 시각화',
      '감정 분석',
      '게이미피케이션',
    ],
  };

  return (
    <Script
      id="software-application-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * All Schemas - 홈페이지에 모든 구조화된 데이터 포함
 */
export function AllSchemas() {
  return (
    <>
      <OrganizationSchema />
      <WebSiteSchema />
      <FAQPageSchema />
      <EducationalOrganizationSchema />
      <SoftwareApplicationSchema />
    </>
  );
}
