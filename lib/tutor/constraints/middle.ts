/**
 * 중학교 학습 수준 제약 조건
 * 한국 교육부 2022 개정 교육과정 + CEFR B1-B2
 */

import { GradeLevelConstraints } from '@/types/tutor';

export const middleConstraints: Record<string, GradeLevelConstraints> = {
  '1': {
    englishConstraints: {
      cefrLevel: 'B1',
      vocabularyLevel: {
        maxWordCount: 1000,
        allowedTopics: [
          '일상생활', '취미', '학교', '교우관계', '문화',
          '환경', '과학기초', '역사기초', '기술',
          'daily life', 'hobbies', 'school', 'friendships',
          'culture', 'environment', 'basic science',
          'basic history', 'technology'
        ],
        forbiddenTopics: [
          '고급 정치이론', '복잡한 경제학', '전문 학술',
          'advanced political theory', 'complex economics',
          'specialized academic content'
        ]
      },
      grammarComplexity: {
        allowedStructures: [
          '현재완료', 'to부정사', '동명사', '관계대명사 기초',
          '수동태 기초', '비교급/최상급',
          'present perfect', 'infinitives', 'gerunds',
          'basic relative pronouns', 'basic passive voice',
          'comparatives/superlatives'
        ],
        forbiddenStructures: [
          '가정법 과거완료', '복잡한 분사구문', '고급 도치',
          'past perfect subjunctive', 'complex participles',
          'advanced inversion'
        ]
      },
      sentenceLength: {
        maxWordsPerSentence: 20,
        readingLevel: '7th grade'
      }
    },
    mathConstraints: {
      topicScope: {
        allowedTopics: [
          '정수와 유리수', '문자와 식', '일차방정식',
          '좌표평면', '정비례', '반비례', '기본 통계',
          'integers', 'rational numbers', 'linear equations',
          'coordinate plane', 'direct/inverse proportion',
          'basic statistics'
        ],
        forbiddenTopics: [
          '이차함수', '미적분', '삼각함수', '행렬', '벡터',
          '미분방정식',
          'quadratic functions', 'calculus', 'trigonometry',
          'matrices', 'vectors', 'differential equations'
        ]
      },
      complexityLevel: 3,
      prerequisiteCheck: true
    },
    responseStyle: {
      maxStepsPerExplanation: 5,
      useVisualAids: true,
      gamificationLevel: 'medium'
    }
  },

  '2': {
    englishConstraints: {
      cefrLevel: 'B1',
      vocabularyLevel: {
        maxWordCount: 1200,
        allowedTopics: [
          '사회문제 기초', '진로', '문화비교', '과학기술',
          '환경보호', '건강', '미디어',
          'basic social issues', 'career', 'culture comparison',
          'science & technology', 'environmental protection',
          'health', 'media'
        ],
        forbiddenTopics: [
          '전문 학술용어', '고급 철학', '전문 정치/경제',
          'specialized academic terms', 'advanced philosophy',
          'professional politics/economics'
        ]
      },
      grammarComplexity: {
        allowedStructures: [
          '현재완료 진행형', '관계대명사', '간접화법 기초',
          '수동태', '조건절 (1,2형식)',
          'present perfect progressive', 'relative pronouns',
          'basic reported speech', 'passive voice',
          'conditionals (type 1, 2)'
        ],
        forbiddenStructures: [
          '가정법 과거완료', '고급 분사구문', '복잡한 도치구문',
          'past perfect subjunctive', 'advanced participles',
          'complex inversion'
        ]
      },
      sentenceLength: {
        maxWordsPerSentence: 25,
        readingLevel: '8th grade'
      }
    },
    mathConstraints: {
      topicScope: {
        allowedTopics: [
          '연립일차방정식', '부등식', '일차함수',
          '삼각형/사각형 성질', '확률 기초', '통계',
          'systems of linear equations', 'inequalities',
          'linear functions', 'triangle/quadrilateral properties',
          'basic probability', 'statistics'
        ],
        forbiddenTopics: [
          '이차함수', '미적분', '삼각함수', '로그',
          '지수함수', '행렬',
          'quadratic functions', 'calculus', 'trigonometry',
          'logarithms', 'exponential functions', 'matrices'
        ]
      },
      complexityLevel: 4,
      prerequisiteCheck: true
    },
    responseStyle: {
      maxStepsPerExplanation: 5,
      useVisualAids: true,
      gamificationLevel: 'medium'
    }
  },

  '3': {
    englishConstraints: {
      cefrLevel: 'B2',
      vocabularyLevel: {
        maxWordCount: 1500,
        allowedTopics: [
          '사회이슈', '시사', '문학 기초', '과학', '역사',
          '문화', '글로벌 이슈', '진로 탐색',
          'social issues', 'current events', 'basic literature',
          'science', 'history', 'culture', 'global issues',
          'career exploration'
        ],
        forbiddenTopics: [
          '전문 학술논문', '고급 전문용어', '대학 수준 이론',
          'professional academic papers', 'advanced terminology',
          'university-level theories'
        ]
      },
      grammarComplexity: {
        allowedStructures: [
          '가정법 과거', '관계대명사 심화', '간접화법',
          '분사구문 기초', '조건절 (모든 형식)',
          'past subjunctive', 'advanced relative pronouns',
          'reported speech', 'basic participles',
          'all conditional types'
        ],
        forbiddenStructures: [
          '고급 문학적 표현', '전문 학술 문법',
          'advanced literary expressions',
          'professional academic grammar'
        ]
      },
      sentenceLength: {
        maxWordsPerSentence: 30,
        readingLevel: '9th grade'
      }
    },
    mathConstraints: {
      topicScope: {
        allowedTopics: [
          '실수', '제곱근', '다항식', '인수분해',
          '이차방정식', '이차함수', '피타고라스', '원의 성질',
          '확률', '통계',
          'real numbers', 'square roots', 'polynomials',
          'factoring', 'quadratic equations', 'quadratic functions',
          'Pythagorean theorem', 'circle properties',
          'probability', 'statistics'
        ],
        forbiddenTopics: [
          '미적분', '삼각함수', '로그', '지수함수',
          '행렬', '벡터', '미분방정식',
          'calculus', 'trigonometry', 'logarithms',
          'exponential functions', 'matrices', 'vectors',
          'differential equations'
        ]
      },
      complexityLevel: 4,
      prerequisiteCheck: true
    },
    responseStyle: {
      maxStepsPerExplanation: 6,
      useVisualAids: true,
      gamificationLevel: 'medium'
    }
  }
};
