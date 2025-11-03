// lib/microlearning/modules-data.ts - Sample Microlearning Modules

import type { MicrolearningModule, LearningPath } from '@/types/microlearning';

/**
 * 수학 마이크로러닝 모듈 (샘플)
 */
export const MATH_MODULES: MicrolearningModule[] = [
  // 대수 - 기초
  {
    id: 'math-algebra-001',
    title: '일차방정식의 기초',
    description: '일차방정식의 개념과 풀이 방법을 배웁니다.',
    subject: 'math',
    topic: 'algebra',
    type: 'concept',
    difficulty: 'beginner',
    estimatedMinutes: 7,
    contents: [
      {
        type: 'text',
        content: '# 일차방정식이란?\n\n일차방정식은 미지수가 1차인 방정식입니다. 예: 2x + 3 = 7',
      },
      {
        type: 'equation',
        content: 'ax + b = c',
        caption: '일차방정식의 일반형',
      },
      {
        type: 'text',
        content: '## 풀이 방법\n\n1. 좌변에 x를 모으고, 우변에 상수를 모읍니다.\n2. x의 계수로 양변을 나눕니다.',
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: '2x + 5 = 13을 풀면?',
        options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
        correctAnswer: 1,
        explanation: '2x = 13 - 5 = 8, x = 4',
        points: 10,
      },
      {
        id: 'q2',
        question: '3x - 7 = 8을 풀면?',
        options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
        correctAnswer: 2,
        explanation: '3x = 8 + 7 = 15, x = 5',
        points: 10,
      },
    ],
    learningObjectives: [
      '일차방정식의 개념을 이해한다',
      '일차방정식을 풀 수 있다',
      '실생활 문제를 방정식으로 나타낼 수 있다',
    ],
    xpReward: 50,
    thumbnail: '📐',
    tags: ['기초', '방정식', '대수'],
  },

  // 기하 - 기초
  {
    id: 'math-geometry-001',
    title: '삼각형의 넓이',
    description: '다양한 삼각형의 넓이를 구하는 방법을 학습합니다.',
    subject: 'math',
    topic: 'geometry',
    type: 'concept',
    difficulty: 'beginner',
    estimatedMinutes: 6,
    contents: [
      {
        type: 'text',
        content: '# 삼각형의 넓이 공식\n\n삼각형의 넓이는 (밑변 × 높이) ÷ 2 입니다.',
      },
      {
        type: 'equation',
        content: 'S = \\frac{1}{2} × b × h',
        caption: '삼각형 넓이 공식',
      },
      {
        type: 'text',
        content: '## 예제\n\n밑변이 6cm, 높이가 4cm인 삼각형의 넓이는?\n\nS = (6 × 4) ÷ 2 = 12 cm²',
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: '밑변 10cm, 높이 8cm인 삼각형의 넓이는?',
        options: ['30 cm²', '40 cm²', '50 cm²', '60 cm²'],
        correctAnswer: 1,
        explanation: '(10 × 8) ÷ 2 = 40 cm²',
        points: 10,
      },
    ],
    learningObjectives: [
      '삼각형 넓이 공식을 이해한다',
      '주어진 밑변과 높이로 넓이를 계산할 수 있다',
    ],
    xpReward: 50,
    thumbnail: '📐',
    tags: ['기하', '넓이', '삼각형'],
  },

  // 미적분 - 중급
  {
    id: 'math-calculus-001',
    title: '도함수의 의미',
    description: '도함수가 무엇인지, 어떻게 구하는지 배웁니다.',
    subject: 'math',
    topic: 'calculus',
    type: 'concept',
    difficulty: 'intermediate',
    estimatedMinutes: 10,
    contents: [
      {
        type: 'text',
        content: '# 도함수란?\n\n도함수는 함수의 순간변화율을 나타냅니다.',
      },
      {
        type: 'equation',
        content: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
        caption: '도함수의 정의',
      },
      {
        type: 'text',
        content: '## 기본 미분 공식\n\n- x^n의 도함수: nx^(n-1)\n- 상수의 도함수: 0',
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'f(x) = x²의 도함수는?',
        options: ['x', '2x', 'x²', '2'],
        correctAnswer: 1,
        explanation: 'x^2의 도함수는 2x^(2-1) = 2x',
        points: 15,
      },
    ],
    learningObjectives: [
      '도함수의 개념을 이해한다',
      '기본 미분 공식을 적용할 수 있다',
    ],
    prerequisites: ['math-algebra-001'],
    xpReward: 100,
    thumbnail: '📈',
    tags: ['미적분', '도함수', '미분'],
  },
];

/**
 * 영어 마이크로러닝 모듈 (샘플)
 */
export const ENGLISH_MODULES: MicrolearningModule[] = [
  // 문법 - 기초
  {
    id: 'eng-grammar-001',
    title: '현재시제 완벽 정복',
    description: '현재시제의 다양한 형태와 용법을 학습합니다.',
    subject: 'english',
    topic: 'grammar',
    type: 'concept',
    difficulty: 'beginner',
    estimatedMinutes: 8,
    contents: [
      {
        type: 'text',
        content: '# 현재시제 (Present Tense)\n\n현재의 사실, 습관, 일반적 진리를 나타냅니다.',
      },
      {
        type: 'text',
        content: '## 현재시제의 형태\n\n- 주어 + 동사원형 (3인칭 단수는 -s)\n- I/You/We/They play\n- He/She/It plays',
      },
      {
        type: 'text',
        content: '## 예문\n\n- I study English every day. (습관)\n- The sun rises in the east. (일반적 진리)\n- She likes chocolate. (현재의 사실)',
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: '다음 중 올바른 문장은?',
        options: [
          'He play soccer.',
          'He plays soccer.',
          'He playing soccer.',
          'He is play soccer.',
        ],
        correctAnswer: 1,
        explanation: '3인칭 단수 주어 뒤에는 동사에 -s를 붙입니다.',
        points: 10,
      },
      {
        id: 'q2',
        question: '"나는 매일 아침 커피를 마신다"를 영어로?',
        options: [
          'I drinks coffee every morning.',
          'I drink coffee every morning.',
          'I am drink coffee every morning.',
          'I drinking coffee every morning.',
        ],
        correctAnswer: 1,
        explanation: 'I/You/We/They 뒤에는 동사원형을 사용합니다.',
        points: 10,
      },
    ],
    learningObjectives: [
      '현재시제의 개념을 이해한다',
      '3인칭 단수 규칙을 적용할 수 있다',
      '현재시제로 문장을 만들 수 있다',
    ],
    xpReward: 50,
    thumbnail: '📝',
    tags: ['문법', '시제', '기초'],
  },

  // 어휘 - 기초
  {
    id: 'eng-vocab-001',
    title: '일상 생활 필수 동사 20개',
    description: '가장 자주 쓰이는 일상 동사를 배웁니다.',
    subject: 'english',
    topic: 'vocabulary',
    type: 'practice',
    difficulty: 'beginner',
    estimatedMinutes: 5,
    contents: [
      {
        type: 'text',
        content: '# 필수 동사 20개\n\n1. eat (먹다)\n2. drink (마시다)\n3. sleep (자다)\n4. wake (일어나다)\n5. go (가다)\n6. come (오다)\n7. walk (걷다)\n8. run (달리다)\n9. talk (말하다)\n10. listen (듣다)\n\n11. see (보다)\n12. look (보다 - 의도적)\n13. read (읽다)\n14. write (쓰다)\n15. study (공부하다)\n16. work (일하다)\n17. play (놀다)\n18. buy (사다)\n19. sell (팔다)\n20. give (주다)',
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: '"I ___ breakfast at 7am." 빈칸에 들어갈 동사는?',
        options: ['drink', 'eat', 'sleep', 'walk'],
        correctAnswer: 1,
        explanation: '아침식사를 먹다 = eat breakfast',
        points: 5,
      },
      {
        id: 'q2',
        question: '"She ___ to school every day." 빈칸에 들어갈 동사는?',
        options: ['comes', 'goes', 'walks', 'runs'],
        correctAnswer: 1,
        explanation: 'go to school = 학교에 가다',
        points: 5,
      },
    ],
    learningObjectives: [
      '일상 생활 필수 동사 20개를 암기한다',
      '각 동사를 문장에서 활용할 수 있다',
    ],
    xpReward: 50,
    thumbnail: '📚',
    tags: ['어휘', '동사', '기초'],
  },

  // 회화 - 중급
  {
    id: 'eng-speaking-001',
    title: '식당에서 주문하기',
    description: '레스토랑에서 사용하는 실용 표현을 배웁니다.',
    subject: 'english',
    topic: 'speaking',
    type: 'interactive',
    difficulty: 'intermediate',
    estimatedMinutes: 7,
    contents: [
      {
        type: 'text',
        content: '# 식당 주문 표현\n\n## 테이블 예약\n- "I\'d like to make a reservation for 4 people at 7pm."\n- "Do you have a table for two?"\n\n## 주문하기\n- "Can I see the menu, please?"\n- "I\'ll have the steak, medium rare."\n- "Could I get a glass of water?"\n\n## 계산하기\n- "Check, please."\n- "Can we split the bill?"',
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: '식당에서 메뉴를 보고 싶을 때?',
        options: [
          'Give me menu.',
          'I want menu.',
          'Can I see the menu, please?',
          'Menu please.',
        ],
        correctAnswer: 2,
        explanation: '정중하게 "Can I see the menu, please?" 라고 말합니다.',
        points: 10,
      },
    ],
    learningObjectives: [
      '식당 예약 표현을 익힌다',
      '주문 표현을 자연스럽게 사용한다',
      '계산 요청 표현을 익힌다',
    ],
    prerequisites: ['eng-grammar-001'],
    xpReward: 75,
    thumbnail: '🍽️',
    tags: ['회화', '식당', '실용'],
  },
];

/**
 * 모든 모듈
 */
export const ALL_MODULES = [...MATH_MODULES, ...ENGLISH_MODULES];

/**
 * 학습 경로 (샘플)
 */
export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'path-math-algebra-basics',
    title: '대수학 기초 마스터',
    description: '방정식과 식의 계산을 완벽하게 이해합니다.',
    subject: 'math',
    difficulty: 'beginner',
    moduleIds: ['math-algebra-001'],
    totalMinutes: 7,
    totalXP: 50,
    thumbnail: '📐',
    goals: [
      '일차방정식을 자유자재로 풀 수 있다',
      '실생활 문제를 방정식으로 표현할 수 있다',
    ],
  },
  {
    id: 'path-english-conversation',
    title: '영어 회화 입문',
    description: '일상 회화에 필요한 기본 표현을 배웁니다.',
    subject: 'english',
    difficulty: 'beginner',
    moduleIds: ['eng-grammar-001', 'eng-vocab-001', 'eng-speaking-001'],
    totalMinutes: 20,
    totalXP: 175,
    thumbnail: '💬',
    goals: [
      '기본 문법을 이해하고 사용한다',
      '일상 대화에 필요한 어휘를 익힌다',
      '실용 회화 표현을 자연스럽게 사용한다',
    ],
  },
];

/**
 * 모듈 ID로 모듈 찾기
 */
export function getModuleById(id: string): MicrolearningModule | undefined {
  return ALL_MODULES.find((module) => module.id === id);
}

/**
 * 과목별 모듈 가져오기
 */
export function getModulesBySubject(subject: 'math' | 'english'): MicrolearningModule[] {
  return ALL_MODULES.filter((module) => module.subject === subject);
}

/**
 * 난이도별 모듈 가져오기
 */
export function getModulesByDifficulty(
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
): MicrolearningModule[] {
  return ALL_MODULES.filter((module) => module.difficulty === difficulty);
}

/**
 * 학습 경로 ID로 경로 찾기
 */
export function getPathById(id: string): LearningPath | undefined {
  return LEARNING_PATHS.find((path) => path.id === id);
}
