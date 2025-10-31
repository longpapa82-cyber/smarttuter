/**
 * 고등학교 학습 수준 제약 조건
 * 한국 교육부 2022 개정 교육과정 + CEFR B2-C1
 */

import { GradeLevelConstraints } from '@/types/tutor';

export const highConstraints: Record<string, GradeLevelConstraints> = {
  '1': {
    englishConstraints: {
      cefrLevel: 'B2',
      vocabularyLevel: {
        maxWordCount: 2000,
        allowedTopics: [
          '학술적 주제', '시사', '문학', '과학기술', '사회문제',
          '철학 기초', '경제 기초', '정치 기초', '예술',
          'academic topics', 'current affairs', 'literature',
          'science & technology', 'social issues',
          'basic philosophy', 'basic economics', 'basic politics', 'arts'
        ],
        forbiddenTopics: [
          '대학 전공 수준 전문용어', '고급 학술 이론',
          'university-level specialized terminology',
          'advanced academic theories'
        ]
      },
      grammarComplexity: {
        allowedStructures: [
          '모든 시제', '가정법 모든 형식', '복합 관계사',
          '분사구문', '도치', '강조구문', '생략',
          'all tenses', 'all subjunctive forms',
          'complex relatives', 'participles', 'inversion',
          'emphasis', 'ellipsis'
        ],
        forbiddenStructures: []
      },
      sentenceLength: {
        maxWordsPerSentence: 40,
        readingLevel: '10-11th grade'
      }
    },
    mathConstraints: {
      topicScope: {
        allowedTopics: [
          '다항식', '방정식/부등식', '도형의 방정식',
          '집합과 명제', '함수', '경우의 수',
          'polynomials', 'equations/inequalities',
          'equations of geometric figures', 'sets and propositions',
          'functions', 'permutations and combinations'
        ],
        forbiddenTopics: [
          '대학 미적분 (극한의 엄밀한 정의)', '다변수 미적분',
          '선형대수 심화', '미분방정식',
          'university calculus (rigorous limit definition)',
          'multivariable calculus', 'advanced linear algebra',
          'differential equations'
        ]
      },
      complexityLevel: 4,
      prerequisiteCheck: true
    },
    responseStyle: {
      maxStepsPerExplanation: 7,
      useVisualAids: true,
      gamificationLevel: 'low'
    }
  },

  '2': {
    englishConstraints: {
      cefrLevel: 'B2',
      vocabularyLevel: {
        maxWordCount: 2500,
        allowedTopics: [
          '학술 에세이', '논설문', '문학 분석', '과학',
          '사회과학', '인문학', '대입 수준 주제',
          'academic essays', 'argumentative writing',
          'literary analysis', 'science', 'social sciences',
          'humanities', 'college prep topics'
        ],
        forbiddenTopics: [
          '전문 학술지 수준', '박사 과정 이론',
          'professional journal level', 'doctoral theories'
        ]
      },
      grammarComplexity: {
        allowedStructures: [
          '학술적 글쓰기 구조', '복잡한 논증', '수사적 장치',
          'academic writing structures', 'complex argumentation',
          'rhetorical devices'
        ],
        forbiddenStructures: []
      },
      sentenceLength: {
        maxWordsPerSentence: 45,
        readingLevel: '11-12th grade'
      }
    },
    mathConstraints: {
      topicScope: {
        allowedTopics: [
          '복소수', '이차방정식/함수', '수열',
          '지수/로그함수', '삼각함수', '미분', '적분',
          '확률과 통계',
          'complex numbers', 'quadratic equations/functions',
          'sequences', 'exponential/logarithmic functions',
          'trigonometry', 'differentiation', 'integration',
          'probability and statistics'
        ],
        forbiddenTopics: [
          '다변수 미적분', '벡터 미적분', '편미분',
          '중적분', '선형대수 심화',
          'multivariable calculus', 'vector calculus',
          'partial derivatives', 'multiple integrals',
          'advanced linear algebra'
        ]
      },
      complexityLevel: 5,
      prerequisiteCheck: true
    },
    responseStyle: {
      maxStepsPerExplanation: 8,
      useVisualAids: true,
      gamificationLevel: 'low'
    }
  },

  '3': {
    englishConstraints: {
      cefrLevel: 'C1',
      vocabularyLevel: {
        maxWordCount: 3000,
        allowedTopics: [
          '대학 입시 수준', '학술 논문 독해', '복잡한 논증',
          '전문 분야 입문', '비판적 분석',
          'college entrance level', 'academic paper reading',
          'complex argumentation', 'professional field introduction',
          'critical analysis'
        ],
        forbiddenTopics: []
      },
      grammarComplexity: {
        allowedStructures: [
          '모든 고급 문법', '학술적 표현', '전문적 글쓰기',
          'all advanced grammar', 'academic expressions',
          'professional writing'
        ],
        forbiddenStructures: []
      },
      sentenceLength: {
        maxWordsPerSentence: 50,
        readingLevel: '12th grade / College Prep'
      }
    },
    mathConstraints: {
      topicScope: {
        allowedTopics: [
          '수열의 극한', '미분법', '적분법',
          '이차곡선', '평면벡터', '공간도형과 공간좌표',
          '행렬 기초 (AI 대비)',
          'limits of sequences', 'differentiation methods',
          'integration methods', 'conic sections',
          'plane vectors', 'solid geometry',
          'basic matrices (AI preparation)'
        ],
        forbiddenTopics: [
          '대학 전공 수학', '해석학', '위상수학',
          '추상대수학', '수치해석',
          'university major mathematics', 'analysis',
          'topology', 'abstract algebra', 'numerical analysis'
        ]
      },
      complexityLevel: 5,
      prerequisiteCheck: true
    },
    responseStyle: {
      maxStepsPerExplanation: 10,
      useVisualAids: false,
      gamificationLevel: 'low'
    }
  }
};
