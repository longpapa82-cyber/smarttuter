/**
 * lib/adaptive-learning/content-recommender.ts
 * 적응형 학습 콘텐츠 추천 시스템
 *
 * 사용자 수준에 맞는 학습 콘텐츠를 자동으로 추천
 */

import type { CEFRLevel, UserLevel } from './level-detector';
import type { Message } from '@/types/tutor';

export interface LearningContent {
  id: string;
  type: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'speaking' | 'writing';
  level: CEFRLevel;
  title: string;
  description: string;
  content: string;
  difficulty: number;     // 1-10
  estimatedTime: number;  // minutes
  tags: string[];
  prerequisites?: string[]; // 선수 학습 콘텐츠 ID
}

export interface RecommendationResult {
  immediate: LearningContent[];     // 지금 바로 시작할 콘텐츠
  next: LearningContent[];          // 다음 단계 콘텐츠
  review: LearningContent[];        // 복습 필요 콘텐츠
  challenge: LearningContent[];     // 도전 과제
  reasoning: string;                // 추천 이유
}

/**
 * 사용자 수준에 맞는 학습 콘텐츠 추천
 */
export function recommendContent(
  userLevel: UserLevel,
  chatHistory: Message[] = []
): RecommendationResult {
  const { cefr, vocabulary, grammar, comprehension, pronunciation } = userLevel;

  // 약점 파악
  const weakestSkill = getWeakestSkill({ vocabulary, grammar, comprehension, pronunciation });
  const strongestSkill = getStrongestSkill({ vocabulary, grammar, comprehension, pronunciation });

  // 콘텐츠 풀에서 필터링
  const allContent = getAllContent();

  // 1. 즉시 학습 가능한 콘텐츠 (현재 레벨)
  const immediate = allContent.filter(content =>
    content.level === cefr &&
    content.type === mapSkillToContentType(weakestSkill) &&
    content.difficulty <= 5
  ).slice(0, 3);

  // 2. 다음 단계 콘텐츠 (한 단계 위)
  const nextLevel = getNextCEFRLevel(cefr);
  const next = allContent.filter(content =>
    content.level === nextLevel &&
    content.difficulty <= 3
  ).slice(0, 2);

  // 3. 복습 콘텐츠 (한 단계 아래)
  const prevLevel = getPreviousCEFRLevel(cefr);
  const review = allContent.filter(content =>
    content.level === prevLevel &&
    content.type === mapSkillToContentType(weakestSkill)
  ).slice(0, 2);

  // 4. 도전 과제 (현재 레벨 고난이도)
  const challenge = allContent.filter(content =>
    content.level === cefr &&
    content.type === mapSkillToContentType(strongestSkill) &&
    content.difficulty >= 7
  ).slice(0, 2);

  // 추천 이유 생성
  const reasoning = generateRecommendationReasoning(
    cefr,
    weakestSkill,
    strongestSkill,
    chatHistory.length
  );

  return {
    immediate,
    next,
    review,
    challenge,
    reasoning,
  };
}

/**
 * 가장 약한 영역 찾기
 */
function getWeakestSkill(scores: {
  vocabulary: number;
  grammar: number;
  comprehension: number;
  pronunciation: number;
}): keyof typeof scores {
  const entries = Object.entries(scores) as [keyof typeof scores, number][];
  entries.sort((a, b) => a[1] - b[1]);
  return entries[0][0];
}

/**
 * 가장 강한 영역 찾기
 */
function getStrongestSkill(scores: {
  vocabulary: number;
  grammar: number;
  comprehension: number;
  pronunciation: number;
}): keyof typeof scores {
  const entries = Object.entries(scores) as [keyof typeof scores, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

/**
 * 스킬을 콘텐츠 타입으로 매핑
 */
function mapSkillToContentType(
  skill: 'vocabulary' | 'grammar' | 'comprehension' | 'pronunciation'
): LearningContent['type'] {
  const mapping: Record<typeof skill, LearningContent['type']> = {
    vocabulary: 'vocabulary',
    grammar: 'grammar',
    comprehension: 'reading',
    pronunciation: 'speaking',
  };
  return mapping[skill];
}

/**
 * 다음 CEFR 레벨 반환
 */
function getNextCEFRLevel(current: CEFRLevel): CEFRLevel {
  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const currentIndex = levels.indexOf(current);
  return levels[Math.min(currentIndex + 1, levels.length - 1)];
}

/**
 * 이전 CEFR 레벨 반환
 */
function getPreviousCEFRLevel(current: CEFRLevel): CEFRLevel {
  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const currentIndex = levels.indexOf(current);
  return levels[Math.max(currentIndex - 1, 0)];
}

/**
 * 추천 이유 생성
 */
function generateRecommendationReasoning(
  level: CEFRLevel,
  weakest: string,
  strongest: string,
  messageCount: number
): string {
  const levelNames: Record<CEFRLevel, string> = {
    'A1': '기초',
    'A2': '초급',
    'B1': '중급',
    'B2': '중상급',
    'C1': '고급',
    'C2': '숙련',
  };

  const skillNames: Record<string, string> = {
    vocabulary: '어휘력',
    grammar: '문법',
    comprehension: '이해력',
    pronunciation: '발음',
  };

  return `
현재 ${levelNames[level]} 레벨이시네요! ${messageCount}번의 대화를 분석한 결과입니다.

**강점**: ${skillNames[weakest] || weakest}이 ${skillNames[strongest] || strongest}보다 상대적으로 향상이 필요해 보입니다.

**추천 학습 경로**:
1. **지금 시작**: ${skillNames[weakest] || weakest} 중심의 ${levelNames[level]} 레벨 콘텐츠
2. **다음 단계**: 준비되면 ${levelNames[getNextCEFRLevel(level)]} 레벨로 도전!
3. **복습**: 기초를 다지기 위한 복습 콘텐츠
4. **도전 과제**: 강점인 ${skillNames[strongest] || strongest}을 더 발전시키세요!
  `.trim();
}

/**
 * 전체 학습 콘텐츠 데이터베이스 (실제로는 DB에서 로드)
 */
function getAllContent(): LearningContent[] {
  return CONTENT_DATABASE;
}

/**
 * 학습 콘텐츠 데이터베이스
 * (추후 확장 가능 - JSON 파일, DB 등으로 분리)
 */
const CONTENT_DATABASE: LearningContent[] = [
  // A1 - 기초
  {
    id: 'a1-vocab-greetings',
    type: 'vocabulary',
    level: 'A1',
    title: '기본 인사 표현',
    description: 'Hello, Hi, Good morning 등 기초 인사말 배우기',
    content: 'hello, hi, good morning, good afternoon, good evening, goodbye, bye, see you',
    difficulty: 1,
    estimatedTime: 10,
    tags: ['greetings', 'basic', 'beginner'],
  },
  {
    id: 'a1-grammar-present-simple',
    type: 'grammar',
    level: 'A1',
    title: '현재 시제 (Present Simple)',
    description: 'I am, You are, He is 등 be동사 기초',
    content: 'Subject + be verb (am/is/are) + complement',
    difficulty: 2,
    estimatedTime: 15,
    tags: ['grammar', 'present', 'be-verb'],
  },
  {
    id: 'a1-speaking-introduction',
    type: 'speaking',
    level: 'A1',
    title: '자기소개하기',
    description: '나의 이름, 나이, 출신 소개하기',
    content: 'My name is... I am ... years old. I am from...',
    difficulty: 2,
    estimatedTime: 10,
    tags: ['speaking', 'introduction', 'self'],
  },

  // A2 - 초급
  {
    id: 'a2-vocab-food',
    type: 'vocabulary',
    level: 'A2',
    title: '음식 관련 어휘',
    description: '식당, 식사, 음식 종류 등',
    content: 'restaurant, menu, order, delicious, hungry, thirsty, breakfast, lunch, dinner',
    difficulty: 3,
    estimatedTime: 15,
    tags: ['food', 'restaurant', 'daily-life'],
  },
  {
    id: 'a2-grammar-past-simple',
    type: 'grammar',
    level: 'A2',
    title: '과거 시제 (Past Simple)',
    description: '어제, 지난주 일어난 일 말하기',
    content: 'Subject + verb-ed / irregular verbs (went, saw, did)',
    difficulty: 4,
    estimatedTime: 20,
    tags: ['grammar', 'past', 'tense'],
  },
  {
    id: 'a2-reading-short-story',
    type: 'reading',
    level: 'A2',
    title: '짧은 이야기 읽기',
    description: '간단한 스토리로 읽기 연습',
    content: 'Short story about daily activities',
    difficulty: 3,
    estimatedTime: 12,
    tags: ['reading', 'story', 'comprehension'],
  },

  // B1 - 중급
  {
    id: 'b1-vocab-travel',
    type: 'vocabulary',
    level: 'B1',
    title: '여행 관련 어휘',
    description: '공항, 호텔, 관광지 표현',
    content: 'airport, flight, check-in, passport, boarding, destination, tourist, sightseeing',
    difficulty: 5,
    estimatedTime: 18,
    tags: ['travel', 'airport', 'tourism'],
  },
  {
    id: 'b1-grammar-conditionals',
    type: 'grammar',
    level: 'B1',
    title: '조건문 (If clauses)',
    description: 'If it rains, I will stay home 형태',
    content: 'If + present simple, will + verb (First conditional)',
    difficulty: 6,
    estimatedTime: 25,
    tags: ['grammar', 'conditional', 'if-clause'],
  },
  {
    id: 'b1-writing-email',
    type: 'writing',
    level: 'B1',
    title: '이메일 작성하기',
    description: '격식 있는 이메일 쓰기',
    content: 'Dear..., I am writing to..., Best regards',
    difficulty: 5,
    estimatedTime: 20,
    tags: ['writing', 'email', 'formal'],
  },

  // B2 - 중상급
  {
    id: 'b2-vocab-business',
    type: 'vocabulary',
    level: 'B2',
    title: '비즈니스 영어 기초',
    description: '회의, 프레젠테이션 어휘',
    content: 'meeting, presentation, agenda, deadline, proposal, negotiate, collaborate',
    difficulty: 7,
    estimatedTime: 22,
    tags: ['business', 'professional', 'workplace'],
  },
  {
    id: 'b2-grammar-passive',
    type: 'grammar',
    level: 'B2',
    title: '수동태 (Passive Voice)',
    description: 'The book was written by... 구조',
    content: 'Subject + be verb + past participle (+ by agent)',
    difficulty: 7,
    estimatedTime: 25,
    tags: ['grammar', 'passive', 'voice'],
  },
  {
    id: 'b2-reading-article',
    type: 'reading',
    level: 'B2',
    title: '뉴스 기사 읽기',
    description: '실제 영어 뉴스 이해하기',
    content: 'News article about current events',
    difficulty: 6,
    estimatedTime: 25,
    tags: ['reading', 'news', 'current-events'],
  },

  // C1 - 고급
  {
    id: 'c1-vocab-academic',
    type: 'vocabulary',
    level: 'C1',
    title: '학술 어휘',
    description: '논문, 리포트 작성에 필요한 어휘',
    content: 'hypothesis, methodology, analysis, comprehensive, significant, demonstrate',
    difficulty: 8,
    estimatedTime: 30,
    tags: ['academic', 'research', 'formal'],
  },
  {
    id: 'c1-grammar-advanced',
    type: 'grammar',
    level: 'C1',
    title: '고급 문법 구조',
    description: '분사구문, 도치 구문 등',
    content: 'Participle clauses, Inversion, Cleft sentences',
    difficulty: 9,
    estimatedTime: 30,
    tags: ['grammar', 'advanced', 'complex'],
  },
  {
    id: 'c1-writing-essay',
    type: 'writing',
    level: 'C1',
    title: '에세이 작성',
    description: '논리적인 에세이 쓰기',
    content: 'Argumentative essay structure: Introduction, Body, Conclusion',
    difficulty: 8,
    estimatedTime: 40,
    tags: ['writing', 'essay', 'argumentative'],
  },

  // C2 - 숙련
  {
    id: 'c2-vocab-idioms',
    type: 'vocabulary',
    level: 'C2',
    title: '관용어와 숙어',
    description: '원어민이 자주 쓰는 표현',
    content: 'piece of cake, break the ice, hit the nail on the head, once in a blue moon',
    difficulty: 9,
    estimatedTime: 25,
    tags: ['idioms', 'expressions', 'native'],
  },
  {
    id: 'c2-reading-literature',
    type: 'reading',
    level: 'C2',
    title: '문학 작품 읽기',
    description: '고전 소설, 시 감상',
    content: 'Classic literature analysis',
    difficulty: 10,
    estimatedTime: 45,
    tags: ['literature', 'classic', 'poetry'],
  },
  {
    id: 'c2-speaking-debate',
    type: 'speaking',
    level: 'C2',
    title: '토론하기',
    description: '복잡한 주제로 논쟁하기',
    content: 'Formal debate structure and argumentation',
    difficulty: 10,
    estimatedTime: 35,
    tags: ['debate', 'argumentation', 'speaking'],
  },
];

/**
 * 특정 타입의 콘텐츠 필터링
 */
export function getContentByType(
  type: LearningContent['type'],
  level?: CEFRLevel
): LearningContent[] {
  let filtered = CONTENT_DATABASE.filter(c => c.type === type);

  if (level) {
    filtered = filtered.filter(c => c.level === level);
  }

  return filtered.sort((a, b) => a.difficulty - b.difficulty);
}

/**
 * 레벨별 콘텐츠 통계
 */
export function getContentStatistics() {
  const stats: Record<CEFRLevel, Record<LearningContent['type'], number>> = {
    'A1': { vocabulary: 0, grammar: 0, reading: 0, listening: 0, speaking: 0, writing: 0 },
    'A2': { vocabulary: 0, grammar: 0, reading: 0, listening: 0, speaking: 0, writing: 0 },
    'B1': { vocabulary: 0, grammar: 0, reading: 0, listening: 0, speaking: 0, writing: 0 },
    'B2': { vocabulary: 0, grammar: 0, reading: 0, listening: 0, speaking: 0, writing: 0 },
    'C1': { vocabulary: 0, grammar: 0, reading: 0, listening: 0, speaking: 0, writing: 0 },
    'C2': { vocabulary: 0, grammar: 0, reading: 0, listening: 0, speaking: 0, writing: 0 },
  };

  CONTENT_DATABASE.forEach(content => {
    stats[content.level][content.type]++;
  });

  return stats;
}

/**
 * 사용자 학습 기록 기반 추천 (고급)
 */
export function recommendBasedOnHistory(
  userLevel: UserLevel,
  completedContentIds: string[],
  struggledContentIds: string[]
): LearningContent[] {
  const allContent = getAllContent();

  // 1. 완료하지 않은 콘텐츠
  const uncompleted = allContent.filter(c => !completedContentIds.includes(c.id));

  // 2. 어려워했던 콘텐츠와 유사한 타입 (복습)
  const reviewContent = uncompleted.filter(c =>
    struggledContentIds.some(sid => {
      const struggled = allContent.find(sc => sc.id === sid);
      return struggled && c.type === struggled.type && c.level === struggled.level;
    })
  );

  // 3. 현재 레벨에 맞는 새로운 콘텐츠
  const newContent = uncompleted.filter(c =>
    c.level === userLevel.cefr &&
    !reviewContent.includes(c)
  );

  // 복습 + 새로운 콘텐츠 조합 (70% 새로운, 30% 복습)
  const reviewCount = Math.ceil(reviewContent.length * 0.3);
  const newCount = 10 - reviewCount;

  return [
    ...reviewContent.slice(0, reviewCount),
    ...newContent.slice(0, newCount),
  ];
}
