/**
 * 초등학교 학습 수준 제약 조건
 * 한국 교육부 2022 개정 교육과정 + CEFR 기준
 */

import { GradeLevelConstraints } from '@/types/tutor';

export const elementaryConstraints: Record<string, GradeLevelConstraints> = {
  '3-4': {
    englishConstraints: {
      cefrLevel: 'A1',
      vocabularyLevel: {
        maxWordCount: 300,
        allowedTopics: [
          '가족', '학교', '동물', '색깔', '숫자', '음식', '장난감',
          '일과', '날씨', '계절', '인사', '감사',
          'family', 'school', 'animals', 'colors', 'numbers',
          'food', 'toys', 'daily routines', 'weather', 'seasons'
        ],
        forbiddenTopics: [
          '정치', '복잡한 사회 이슈', '고급 과학', '철학',
          'politics', 'complex social issues', 'advanced science'
        ]
      },
      grammarComplexity: {
        allowedStructures: [
          'be동사 현재형', '일반동사 현재형', '단순 명령문',
          '기본 의문문 (what, who, where)',
          'present simple', 'present continuous',
          'basic questions', 'simple imperative'
        ],
        forbiddenStructures: [
          '과거완료', '가정법', '수동태', '조건절', '관계절',
          'past perfect', 'subjunctive', 'passive voice',
          'conditional sentences', 'relative clauses'
        ]
      },
      sentenceLength: {
        maxWordsPerSentence: 10,
        readingLevel: '3rd grade'
      }
    },
    mathConstraints: {
      topicScope: {
        allowedTopics: [
          '덧셈', '뺄셈', '곱셈 기초', '나눗셈 기초',
          '분수 기초', '도형 인식', '측정 (길이, 무게)',
          '시간 읽기', '간단한 그래프',
          'addition', 'subtraction', 'multiplication basics',
          'division basics', 'simple fractions', 'shapes',
          'measurement', 'time'
        ],
        forbiddenTopics: [
          '대수', '기하 증명', '삼각함수', '미적분',
          '통계', '확률', '이차방정식',
          'algebra', 'geometry proofs', 'trigonometry',
          'calculus', 'statistics', 'probability',
          'quadratic equations'
        ]
      },
      complexityLevel: 2,
      prerequisiteCheck: true
    },
    responseStyle: {
      maxStepsPerExplanation: 3,
      useVisualAids: true,
      gamificationLevel: 'high'
    }
  },

  '5-6': {
    englishConstraints: {
      cefrLevel: 'A2',
      vocabularyLevel: {
        maxWordCount: 750,
        allowedTopics: [
          '학교생활', '취미', '날씨', '여행', '건강', '스포츠',
          '직업', '교통', '쇼핑', '환경 기초',
          'school life', 'hobbies', 'weather', 'travel',
          'health', 'sports', 'occupations', 'transportation',
          'shopping', 'basic environment'
        ],
        forbiddenTopics: [
          '정치', '경제 이론', '복잡한 과학', '추상적 철학',
          'politics', 'economic theory', 'complex science',
          'abstract philosophy'
        ]
      },
      grammarComplexity: {
        allowedStructures: [
          '과거형', '미래형', '진행형', '조동사 (can, will)',
          '비교급/최상급 기초',
          'past tense', 'future tense', 'progressive',
          'modals (can, will)', 'comparatives/superlatives'
        ],
        forbiddenStructures: [
          '가정법 과거', '관계대명사', '간접화법', '분사구문',
          'past subjunctive', 'relative pronouns',
          'reported speech', 'participle phrases'
        ]
      },
      sentenceLength: {
        maxWordsPerSentence: 15,
        readingLevel: '5th grade'
      }
    },
    mathConstraints: {
      topicScope: {
        allowedTopics: [
          '분수/소수 연산', '비와 비율', '합동과 대칭',
          '넓이', '부피', '평균', '비율 그래프', '간단한 비례식',
          'fractions', 'decimals', 'ratios', 'proportions',
          'congruence', 'symmetry', 'area', 'volume',
          'average', 'graphs', 'simple proportions'
        ],
        forbiddenTopics: [
          '대수방정식', '이차함수', '삼각법', '미적분',
          '행렬', '벡터', '확률분포',
          'algebraic equations', 'quadratic functions',
          'trigonometry', 'calculus', 'matrices', 'vectors',
          'probability distributions'
        ]
      },
      complexityLevel: 3,
      prerequisiteCheck: true
    },
    responseStyle: {
      maxStepsPerExplanation: 4,
      useVisualAids: true,
      gamificationLevel: 'high'
    }
  }
};
