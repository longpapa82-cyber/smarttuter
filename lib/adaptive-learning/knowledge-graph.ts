// Phase 8: Knowledge Graph for Adaptive Learning
// Granular knowledge decomposition inspired by Squirrel AI

import { KnowledgeNode, GradeLevel, Subject, DifficultyLevel } from './types';

// Math Knowledge Graph
export const MATH_KNOWLEDGE_GRAPH: KnowledgeNode[] = [
  // Elementary - Basic Arithmetic
  {
    id: 'math-elem-addition',
    name: '덧셈',
    subject: 'math',
    category: '산술 > 기초 연산',
    gradeLevel: 'elementary',
    difficulty: 1,
    estimatedTime: 20,
    prerequisites: [],
    description: '한 자리, 두 자리 수의 덧셈',
    tags: ['arithmetic', 'addition', 'basic'],
  },
  {
    id: 'math-elem-subtraction',
    name: '뺄셈',
    subject: 'math',
    category: '산술 > 기초 연산',
    gradeLevel: 'elementary',
    difficulty: 1,
    estimatedTime: 20,
    prerequisites: ['math-elem-addition'],
    description: '한 자리, 두 자리 수의 뺄셈',
    tags: ['arithmetic', 'subtraction', 'basic'],
  },
  {
    id: 'math-elem-multiplication',
    name: '곱셈',
    subject: 'math',
    category: '산술 > 기초 연산',
    gradeLevel: 'elementary',
    difficulty: 2,
    estimatedTime: 30,
    prerequisites: ['math-elem-addition'],
    description: '구구단과 곱셈 원리',
    tags: ['arithmetic', 'multiplication', 'times-table'],
  },
  {
    id: 'math-elem-division',
    name: '나눗셈',
    subject: 'math',
    category: '산술 > 기초 연산',
    gradeLevel: 'elementary',
    difficulty: 2,
    estimatedTime: 30,
    prerequisites: ['math-elem-multiplication'],
    description: '나눗셈의 원리와 계산',
    tags: ['arithmetic', 'division'],
  },
  {
    id: 'math-elem-fractions',
    name: '분수',
    subject: 'math',
    category: '산술 > 분수와 소수',
    gradeLevel: 'elementary',
    difficulty: 3,
    estimatedTime: 40,
    prerequisites: ['math-elem-division'],
    description: '분수의 개념과 기본 연산',
    tags: ['fractions', 'rational-numbers'],
  },

  // Middle School - Algebra & Geometry
  {
    id: 'math-middle-integers',
    name: '정수',
    subject: 'math',
    category: '대수 > 수와 연산',
    gradeLevel: 'middle',
    difficulty: 2,
    estimatedTime: 25,
    prerequisites: ['math-elem-subtraction'],
    description: '양수, 음수, 0의 개념과 연산',
    tags: ['integers', 'negative-numbers'],
  },
  {
    id: 'math-middle-linear-eq',
    name: '일차방정식',
    subject: 'math',
    category: '대수 > 방정식',
    gradeLevel: 'middle',
    difficulty: 3,
    estimatedTime: 45,
    prerequisites: ['math-middle-integers'],
    description: 'ax + b = c 형태의 방정식 풀이',
    tags: ['algebra', 'equations', 'linear'],
  },
  {
    id: 'math-middle-linear-ineq',
    name: '일차부등식',
    subject: 'math',
    category: '대수 > 부등식',
    gradeLevel: 'middle',
    difficulty: 3,
    estimatedTime: 40,
    prerequisites: ['math-middle-linear-eq'],
    description: '일차부등식의 풀이와 수직선 표현',
    tags: ['algebra', 'inequalities'],
  },
  {
    id: 'math-middle-functions',
    name: '함수의 개념',
    subject: 'math',
    category: '대수 > 함수',
    gradeLevel: 'middle',
    difficulty: 3,
    estimatedTime: 50,
    prerequisites: ['math-middle-linear-eq'],
    description: '함수의 정의, 정의역, 치역',
    tags: ['functions', 'domain', 'range'],
  },
  {
    id: 'math-middle-geometry-basic',
    name: '기초 기하학',
    subject: 'math',
    category: '기하 > 평면도형',
    gradeLevel: 'middle',
    difficulty: 2,
    estimatedTime: 35,
    prerequisites: [],
    description: '점, 선, 면, 각도의 개념',
    tags: ['geometry', 'basic', 'shapes'],
  },

  // High School - Advanced Algebra & Calculus
  {
    id: 'math-high-quadratic',
    name: '이차방정식',
    subject: 'math',
    category: '대수 > 방정식',
    gradeLevel: 'high',
    difficulty: 4,
    estimatedTime: 60,
    prerequisites: ['math-middle-linear-eq', 'math-elem-multiplication'],
    description: 'ax² + bx + c = 0 형태의 방정식과 근의 공식',
    tags: ['algebra', 'quadratic', 'equations'],
  },
  {
    id: 'math-high-polynomials',
    name: '다항식',
    subject: 'math',
    category: '대수 > 다항식',
    gradeLevel: 'high',
    difficulty: 4,
    estimatedTime: 55,
    prerequisites: ['math-high-quadratic'],
    description: '다항식의 연산과 인수분해',
    tags: ['polynomials', 'factoring'],
  },
  {
    id: 'math-high-exponential',
    name: '지수와 로그',
    subject: 'math',
    category: '대수 > 지수·로그',
    gradeLevel: 'high',
    difficulty: 4,
    estimatedTime: 60,
    prerequisites: ['math-high-polynomials'],
    description: '지수법칙과 로그의 성질',
    tags: ['exponents', 'logarithms'],
  },
  {
    id: 'math-high-trigonometry',
    name: '삼각함수',
    subject: 'math',
    category: '대수 > 삼각함수',
    gradeLevel: 'high',
    difficulty: 5,
    estimatedTime: 70,
    prerequisites: ['math-middle-functions', 'math-middle-geometry-basic'],
    description: 'sin, cos, tan과 삼각함수의 성질',
    tags: ['trigonometry', 'sine', 'cosine'],
  },
  {
    id: 'math-high-limits',
    name: '극한',
    subject: 'math',
    category: '미적분 > 극한',
    gradeLevel: 'high',
    difficulty: 5,
    estimatedTime: 80,
    prerequisites: ['math-high-polynomials', 'math-middle-functions'],
    description: '함수의 극한과 연속성',
    tags: ['calculus', 'limits', 'continuity'],
  },

  // University - Calculus & Linear Algebra
  {
    id: 'math-uni-derivatives',
    name: '미분',
    subject: 'math',
    category: '미적분 > 미분',
    gradeLevel: 'university',
    difficulty: 5,
    estimatedTime: 90,
    prerequisites: ['math-high-limits'],
    description: '도함수와 미분법칙',
    tags: ['calculus', 'derivatives', 'differentiation'],
  },
  {
    id: 'math-uni-integrals',
    name: '적분',
    subject: 'math',
    category: '미적분 > 적분',
    gradeLevel: 'university',
    difficulty: 5,
    estimatedTime: 90,
    prerequisites: ['math-uni-derivatives'],
    description: '부정적분과 정적분',
    tags: ['calculus', 'integrals', 'integration'],
  },
  {
    id: 'math-uni-linear-algebra',
    name: '선형대수',
    subject: 'math',
    category: '대수 > 선형대수',
    gradeLevel: 'university',
    difficulty: 5,
    estimatedTime: 100,
    prerequisites: ['math-high-quadratic'],
    description: '벡터, 행렬, 행렬식',
    tags: ['linear-algebra', 'vectors', 'matrices'],
  },
];

// English Knowledge Graph
export const ENGLISH_KNOWLEDGE_GRAPH: KnowledgeNode[] = [
  // Elementary - Basic Grammar & Vocabulary
  {
    id: 'eng-elem-alphabet',
    name: '알파벳',
    subject: 'english',
    category: '기초 > 알파벳',
    gradeLevel: 'elementary',
    difficulty: 1,
    estimatedTime: 15,
    prerequisites: [],
    description: '알파벳 대소문자 인식과 발음',
    tags: ['alphabet', 'basic', 'pronunciation'],
  },
  {
    id: 'eng-elem-phonics',
    name: '파닉스',
    subject: 'english',
    category: '기초 > 발음',
    gradeLevel: 'elementary',
    difficulty: 1,
    estimatedTime: 30,
    prerequisites: ['eng-elem-alphabet'],
    description: '글자와 소리의 관계',
    tags: ['phonics', 'sounds', 'reading'],
  },
  {
    id: 'eng-elem-basic-vocab',
    name: '기초 어휘',
    subject: 'english',
    category: '어휘 > 일상',
    gradeLevel: 'elementary',
    difficulty: 1,
    estimatedTime: 25,
    prerequisites: ['eng-elem-phonics'],
    description: '일상 생활 기본 단어 100개',
    tags: ['vocabulary', 'basic', 'daily-life'],
  },
  {
    id: 'eng-elem-simple-sentences',
    name: '간단한 문장',
    subject: 'english',
    category: '문법 > 문장 구조',
    gradeLevel: 'elementary',
    difficulty: 2,
    estimatedTime: 30,
    prerequisites: ['eng-elem-basic-vocab'],
    description: '주어 + 동사 형태의 간단한 문장',
    tags: ['grammar', 'sentences', 'basic'],
  },
  {
    id: 'eng-elem-present-tense',
    name: '현재시제',
    subject: 'english',
    category: '문법 > 시제',
    gradeLevel: 'elementary',
    difficulty: 2,
    estimatedTime: 35,
    prerequisites: ['eng-elem-simple-sentences'],
    description: '현재시제의 형태와 용법',
    tags: ['grammar', 'tenses', 'present'],
  },

  // Middle School - Grammar & Reading
  {
    id: 'eng-middle-past-tense',
    name: '과거시제',
    subject: 'english',
    category: '문법 > 시제',
    gradeLevel: 'middle',
    difficulty: 3,
    estimatedTime: 40,
    prerequisites: ['eng-elem-present-tense'],
    description: '과거시제와 불규칙 동사',
    tags: ['grammar', 'tenses', 'past', 'irregular-verbs'],
  },
  {
    id: 'eng-middle-future-tense',
    name: '미래시제',
    subject: 'english',
    category: '문법 > 시제',
    gradeLevel: 'middle',
    difficulty: 3,
    estimatedTime: 40,
    prerequisites: ['eng-middle-past-tense'],
    description: 'will, be going to를 사용한 미래 표현',
    tags: ['grammar', 'tenses', 'future'],
  },
  {
    id: 'eng-middle-articles',
    name: '관사',
    subject: 'english',
    category: '문법 > 품사',
    gradeLevel: 'middle',
    difficulty: 3,
    estimatedTime: 35,
    prerequisites: ['eng-elem-simple-sentences'],
    description: 'a, an, the의 사용법',
    tags: ['grammar', 'articles'],
  },
  {
    id: 'eng-middle-prepositions',
    name: '전치사',
    subject: 'english',
    category: '문법 > 품사',
    gradeLevel: 'middle',
    difficulty: 3,
    estimatedTime: 45,
    prerequisites: ['eng-middle-articles'],
    description: '시간, 장소, 방향의 전치사',
    tags: ['grammar', 'prepositions'],
  },
  {
    id: 'eng-middle-reading-comp',
    name: '독해 기초',
    subject: 'english',
    category: '독해 > 기본',
    gradeLevel: 'middle',
    difficulty: 3,
    estimatedTime: 50,
    prerequisites: ['eng-middle-past-tense', 'eng-middle-prepositions'],
    description: '짧은 지문 읽고 이해하기',
    tags: ['reading', 'comprehension'],
  },

  // High School - Advanced Grammar & Writing
  {
    id: 'eng-high-conditionals',
    name: '조건문',
    subject: 'english',
    category: '문법 > 조건문',
    gradeLevel: 'high',
    difficulty: 4,
    estimatedTime: 60,
    prerequisites: ['eng-middle-future-tense'],
    description: 'if 조건문의 4가지 형태',
    tags: ['grammar', 'conditionals', 'if-clauses'],
  },
  {
    id: 'eng-high-passive-voice',
    name: '수동태',
    subject: 'english',
    category: '문법 > 태',
    gradeLevel: 'high',
    difficulty: 4,
    estimatedTime: 55,
    prerequisites: ['eng-middle-past-tense'],
    description: '수동태의 형태와 용법',
    tags: ['grammar', 'passive-voice'],
  },
  {
    id: 'eng-high-relative-clauses',
    name: '관계절',
    subject: 'english',
    category: '문법 > 복문',
    gradeLevel: 'high',
    difficulty: 4,
    estimatedTime: 60,
    prerequisites: ['eng-middle-reading-comp'],
    description: '관계대명사와 관계부사',
    tags: ['grammar', 'relative-clauses', 'complex-sentences'],
  },
  {
    id: 'eng-high-essay-writing',
    name: '에세이 쓰기',
    subject: 'english',
    category: '작문 > 에세이',
    gradeLevel: 'high',
    difficulty: 5,
    estimatedTime: 80,
    prerequisites: ['eng-high-relative-clauses', 'eng-middle-reading-comp'],
    description: '논리적 에세이 구조와 작성법',
    tags: ['writing', 'essay', 'composition'],
  },
  {
    id: 'eng-high-advanced-vocab',
    name: '고급 어휘',
    subject: 'english',
    category: '어휘 > 학술',
    gradeLevel: 'high',
    difficulty: 4,
    estimatedTime: 60,
    prerequisites: ['eng-middle-reading-comp'],
    description: '학술 및 고급 어휘 500개',
    tags: ['vocabulary', 'advanced', 'academic'],
  },

  // University - Academic English
  {
    id: 'eng-uni-academic-writing',
    name: '학술 작문',
    subject: 'english',
    category: '작문 > 학술',
    gradeLevel: 'university',
    difficulty: 5,
    estimatedTime: 90,
    prerequisites: ['eng-high-essay-writing', 'eng-high-advanced-vocab'],
    description: '논문 및 학술 보고서 작성',
    tags: ['writing', 'academic', 'research'],
  },
  {
    id: 'eng-uni-critical-reading',
    name: '비판적 독해',
    subject: 'english',
    category: '독해 > 비판적 사고',
    gradeLevel: 'university',
    difficulty: 5,
    estimatedTime: 85,
    prerequisites: ['eng-high-essay-writing', 'eng-middle-reading-comp'],
    description: '학술 텍스트 분석과 비평',
    tags: ['reading', 'critical-thinking', 'analysis'],
  },
  {
    id: 'eng-uni-presentation',
    name: '프레젠테이션',
    subject: 'english',
    category: '말하기 > 발표',
    gradeLevel: 'university',
    difficulty: 5,
    estimatedTime: 70,
    prerequisites: ['eng-high-essay-writing'],
    description: '효과적인 영어 발표 기법',
    tags: ['speaking', 'presentation', 'public-speaking'],
  },
];

// Combined knowledge graph
export const KNOWLEDGE_GRAPH = [
  ...MATH_KNOWLEDGE_GRAPH,
  ...ENGLISH_KNOWLEDGE_GRAPH,
];

// Helper functions
export function getNodeById(nodeId: string): KnowledgeNode | undefined {
  return KNOWLEDGE_GRAPH.find(node => node.id === nodeId);
}

export function getNodesBySubject(subject: Subject): KnowledgeNode[] {
  return KNOWLEDGE_GRAPH.filter(node => node.subject === subject);
}

export function getNodesByGradeLevel(gradeLevel: GradeLevel): KnowledgeNode[] {
  return KNOWLEDGE_GRAPH.filter(node => node.gradeLevel === gradeLevel);
}

export function getNodesByDifficulty(difficulty: DifficultyLevel): KnowledgeNode[] {
  return KNOWLEDGE_GRAPH.filter(node => node.difficulty === difficulty);
}

export function getPrerequisites(nodeId: string): KnowledgeNode[] {
  const node = getNodeById(nodeId);
  if (!node) return [];

  return node.prerequisites
    .map(prereqId => getNodeById(prereqId))
    .filter((node): node is KnowledgeNode => node !== undefined);
}

export function getDependents(nodeId: string): KnowledgeNode[] {
  return KNOWLEDGE_GRAPH.filter(node =>
    node.prerequisites.includes(nodeId)
  );
}

export function findLearningPath(
  startNodeId: string,
  endNodeId: string
): KnowledgeNode[] {
  // Simple BFS pathfinding
  const visited = new Set<string>();
  const queue: Array<{ nodeId: string; path: string[] }> = [
    { nodeId: startNodeId, path: [startNodeId] },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.nodeId === endNodeId) {
      return current.path
        .map(id => getNodeById(id))
        .filter((node): node is KnowledgeNode => node !== undefined);
    }

    if (visited.has(current.nodeId)) continue;
    visited.add(current.nodeId);

    const dependents = getDependents(current.nodeId);
    for (const dep of dependents) {
      queue.push({
        nodeId: dep.id,
        path: [...current.path, dep.id],
      });
    }
  }

  return [];
}
