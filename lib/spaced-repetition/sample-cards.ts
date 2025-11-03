// lib/spaced-repetition/sample-cards.ts - Sample Review Cards

import type { ReviewCard } from '@/types/spaced-repetition';

/**
 * 수학 복습 카드 샘플
 */
export const MATH_REVIEW_CARDS: Omit<ReviewCard, 'userId' | 'createdAt' | 'updatedAt'>[] = [
  // 대수학
  {
    id: 'math-card-001',
    front: '일차방정식 2x + 5 = 13을 풀면?',
    back: 'x = 4\n\n풀이:\n2x = 13 - 5\n2x = 8\nx = 4',
    subject: 'math',
    topic: 'algebra',
    moduleId: 'math-algebra-001',
    easinessFactor: 2.5,
    interval: 0,
    repetitions: 0,
    status: 'new',
    nextReviewDate: new Date(),
    totalReviews: 0,
    correctReviews: 0,
    averageRating: 0,
  },
  {
    id: 'math-card-002',
    front: '피타고라스 정리는?',
    back: 'a² + b² = c²\n\n직각삼각형에서 빗변의 제곱은 다른 두 변의 제곱의 합과 같다.',
    subject: 'math',
    topic: 'geometry',
    easinessFactor: 2.5,
    interval: 0,
    repetitions: 0,
    status: 'new',
    nextReviewDate: new Date(),
    totalReviews: 0,
    correctReviews: 0,
    averageRating: 0,
  },
  {
    id: 'math-card-003',
    front: '삼각형의 넓이 공식은?',
    back: 'S = (밑변 × 높이) ÷ 2\n\n또는\nS = ½ × b × h',
    subject: 'math',
    topic: 'geometry',
    moduleId: 'math-geometry-001',
    easinessFactor: 2.5,
    interval: 0,
    repetitions: 0,
    status: 'new',
    nextReviewDate: new Date(),
    totalReviews: 0,
    correctReviews: 0,
    averageRating: 0,
  },
  {
    id: 'math-card-004',
    front: '도함수의 정의는?',
    back: "f'(x) = lim(h→0) [f(x+h) - f(x)] / h\n\n함수의 순간변화율을 나타낸다.",
    subject: 'math',
    topic: 'calculus',
    moduleId: 'math-calculus-001',
    easinessFactor: 2.5,
    interval: 0,
    repetitions: 0,
    status: 'new',
    nextReviewDate: new Date(),
    totalReviews: 0,
    correctReviews: 0,
    averageRating: 0,
  },
  {
    id: 'math-card-005',
    front: 'x²의 도함수는?',
    back: "2x\n\n풀이:\nx^n의 도함수는 n·x^(n-1)\n따라서 x²의 도함수는 2·x^(2-1) = 2x",
    subject: 'math',
    topic: 'calculus',
    easinessFactor: 2.5,
    interval: 0,
    repetitions: 0,
    status: 'new',
    nextReviewDate: new Date(),
    totalReviews: 0,
    correctReviews: 0,
    averageRating: 0,
  },
];

/**
 * 영어 복습 카드 샘플
 */
export const ENGLISH_REVIEW_CARDS: Omit<ReviewCard, 'userId' | 'createdAt' | 'updatedAt'>[] = [
  // 문법
  {
    id: 'eng-card-001',
    front: '현재시제: 3인칭 단수 주어 뒤에 동사는?',
    back: '동사원형 + s/es\n\n예:\n- He plays soccer.\n- She watches TV.\n- It runs fast.',
    subject: 'english',
    topic: 'grammar',
    moduleId: 'eng-grammar-001',
    easinessFactor: 2.5,
    interval: 0,
    repetitions: 0,
    status: 'new',
    nextReviewDate: new Date(),
    totalReviews: 0,
    correctReviews: 0,
    averageRating: 0,
  },
  {
    id: 'eng-card-002',
    front: '"나는 매일 영어를 공부한다"를 영어로?',
    back: 'I study English every day.\n\n주어: I\n동사: study (원형)\n목적어: English\n시간: every day',
    subject: 'english',
    topic: 'grammar',
    easinessFactor: 2.5,
    interval: 0,
    repetitions: 0,
    status: 'new',
    nextReviewDate: new Date(),
    totalReviews: 0,
    correctReviews: 0,
    averageRating: 0,
  },
  // 어휘
  {
    id: 'eng-card-003',
    front: '"eat"의 의미와 예문은?',
    back: '의미: 먹다\n\n예문:\n- I eat breakfast at 7am.\n- She eats an apple.\n- They eat dinner together.',
    subject: 'english',
    topic: 'vocabulary',
    moduleId: 'eng-vocab-001',
    easinessFactor: 2.5,
    interval: 0,
    repetitions: 0,
    status: 'new',
    nextReviewDate: new Date(),
    totalReviews: 0,
    correctReviews: 0,
    averageRating: 0,
  },
  {
    id: 'eng-card-004',
    front: '"study"의 의미와 예문은?',
    back: '의미: 공부하다\n\n예문:\n- I study English every day.\n- He studies math.\n- They study hard.',
    subject: 'english',
    topic: 'vocabulary',
    easinessFactor: 2.5,
    interval: 0,
    repetitions: 0,
    status: 'new',
    nextReviewDate: new Date(),
    totalReviews: 0,
    correctReviews: 0,
    averageRating: 0,
  },
  // 회화
  {
    id: 'eng-card-005',
    front: '식당에서 메뉴를 보고 싶을 때?',
    back: 'Can I see the menu, please?\n\n또는:\n- May I have the menu?\n- Could I see the menu?\n- Menu, please.',
    subject: 'english',
    topic: 'speaking',
    moduleId: 'eng-speaking-001',
    easinessFactor: 2.5,
    interval: 0,
    repetitions: 0,
    status: 'new',
    nextReviewDate: new Date(),
    totalReviews: 0,
    correctReviews: 0,
    averageRating: 0,
  },
  {
    id: 'eng-card-006',
    front: '식당에서 계산할 때?',
    back: 'Check, please.\n\n또는:\n- Bill, please.\n- Can I get the check?\n- Could we have the bill?',
    subject: 'english',
    topic: 'speaking',
    easinessFactor: 2.5,
    interval: 0,
    repetitions: 0,
    status: 'new',
    nextReviewDate: new Date(),
    totalReviews: 0,
    correctReviews: 0,
    averageRating: 0,
  },
];

/**
 * 모든 샘플 카드
 */
export const ALL_SAMPLE_CARDS = [...MATH_REVIEW_CARDS, ...ENGLISH_REVIEW_CARDS];

/**
 * 사용자별 카드 초기화
 *
 * @param userId 사용자 ID
 * @returns 사용자용 카드 배열
 */
export function initializeUserCards(userId: string): ReviewCard[] {
  const now = new Date();

  return ALL_SAMPLE_CARDS.map((card) => ({
    ...card,
    userId,
    createdAt: now,
    updatedAt: now,
    nextReviewDate: new Date(now), // 모두 오늘 복습 가능하도록
  }));
}

/**
 * 과목별 카드 가져오기
 *
 * @param subject 과목
 * @returns 카드 배열
 */
export function getCardsBySubject(
  subject: 'math' | 'english'
): Omit<ReviewCard, 'userId' | 'createdAt' | 'updatedAt'>[] {
  return ALL_SAMPLE_CARDS.filter((card) => card.subject === subject);
}

/**
 * 토픽별 카드 가져오기
 *
 * @param topic 토픽
 * @returns 카드 배열
 */
export function getCardsByTopic(
  topic: string
): Omit<ReviewCard, 'userId' | 'createdAt' | 'updatedAt'>[] {
  return ALL_SAMPLE_CARDS.filter((card) => card.topic === topic);
}
