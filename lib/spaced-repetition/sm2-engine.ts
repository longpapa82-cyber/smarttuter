// lib/spaced-repetition/sm2-engine.ts - SM-2 Algorithm Engine

import type {
  ReviewCard,
  DifficultyRating,
  SM2Result,
  ReviewStatus,
} from '@/types/spaced-repetition';

/**
 * SM-2 알고리즘 핵심 엔진
 *
 * SuperMemo 2 알고리즘 구현
 * 참고: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 *
 * 핵심 공식:
 * - EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
 * - Interval:
 *   - I(1) = 1 day
 *   - I(2) = 6 days
 *   - I(n) = I(n-1) * EF
 */

const DEFAULT_EASINESS_FACTOR = 2.5;
const MIN_EASINESS_FACTOR = 1.3;

/**
 * SM-2 알고리즘으로 다음 복습 일정 계산
 *
 * @param card 현재 카드 상태
 * @param rating 사용자 난이도 평가 (0-5)
 * @returns 업데이트된 카드 파라미터
 */
export function calculateSM2(card: ReviewCard, rating: DifficultyRating): SM2Result {
  let easinessFactor = card.easinessFactor;
  let interval = card.interval;
  let repetitions = card.repetitions;
  let status: ReviewStatus = card.status;

  // EF 계산 (난이도 계수)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const efDelta = 0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02);
  easinessFactor = Math.max(MIN_EASINESS_FACTOR, easinessFactor + efDelta);

  // rating < 3이면 처음부터 다시 시작
  if (rating < 3) {
    repetitions = 0;
    interval = 0;
    status = 'relearning';
  } else {
    // 성공적인 복습
    repetitions += 1;

    // Interval 계산
    if (repetitions === 1) {
      interval = 1; // 첫 복습: 1일 후
    } else if (repetitions === 2) {
      interval = 6; // 두 번째 복습: 6일 후
    } else {
      // 세 번째 이후: 이전 간격 * EF
      interval = Math.round(interval * easinessFactor);
    }

    // 상태 업데이트
    if (repetitions === 1) {
      status = 'learning';
    } else if (repetitions >= 3 && easinessFactor >= 2.0) {
      status = 'mastered';
    } else {
      status = 'review';
    }
  }

  // 다음 복습 날짜 계산
  const nextReviewDate = new Date();
  if (interval === 0) {
    // 즉시 재학습 (10분 후)
    nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 10);
  } else {
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  }

  return {
    easinessFactor,
    interval,
    repetitions,
    nextReviewDate,
    status,
  };
}

/**
 * 복습 우선순위 계산
 *
 * @param card 카드
 * @param currentDate 현재 날짜
 * @returns 우선순위 점수 (높을수록 우선)
 */
export function calculatePriority(card: ReviewCard, currentDate: Date = new Date()): number {
  const daysOverdue = Math.max(
    0,
    Math.floor((currentDate.getTime() - card.nextReviewDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  // 우선순위 계산 요소:
  // 1. 지연 일수 (매우 중요)
  // 2. 난이도 (어려운 카드 우선)
  // 3. 상태 (재학습 > 학습 중 > 복습)

  let priority = 0;

  // 지연 일수 (가장 큰 가중치)
  priority += daysOverdue * 10;

  // 난이도 (EF가 낮을수록 어려움)
  const difficultyScore = (3.0 - card.easinessFactor) * 5;
  priority += Math.max(0, difficultyScore);

  // 상태별 가중치
  const statusWeight = {
    new: 5,
    learning: 8,
    review: 6,
    relearning: 10, // 재학습 카드는 최우선
    mastered: 3,
  };
  priority += statusWeight[card.status];

  // 최근에 복습한 카드는 우선순위 낮춤
  if (card.lastReviewDate) {
    const daysSinceLastReview = Math.floor(
      (currentDate.getTime() - card.lastReviewDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastReview < 1) {
      priority -= 5;
    }
  }

  return Math.max(0, priority);
}

/**
 * 오늘 복습해야 할 카드인지 확인
 *
 * @param card 카드
 * @param currentDate 현재 날짜
 * @returns 복습 필요 여부
 */
export function isDueToday(card: ReviewCard, currentDate: Date = new Date()): boolean {
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(card.nextReviewDate);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate <= today;
}

/**
 * 카드가 지연되었는지 확인
 *
 * @param card 카드
 * @param currentDate 현재 날짜
 * @returns 지연 여부
 */
export function isOverdue(card: ReviewCard, currentDate: Date = new Date()): boolean {
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(card.nextReviewDate);
  dueDate.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return dueDate < yesterday;
}

/**
 * 예상 retention (기억 유지율) 계산
 *
 * 망각 곡선 기반 계산
 * R(t) = e^(-t/S)
 * where:
 *   t = time since last review
 *   S = stability (interval * EF)
 *
 * @param card 카드
 * @param currentDate 현재 날짜
 * @returns 예상 retention (0-1)
 */
export function calculateRetention(card: ReviewCard, currentDate: Date = new Date()): number {
  if (!card.lastReviewDate) {
    return 0; // 아직 복습 안함
  }

  const daysSinceReview = Math.floor(
    (currentDate.getTime() - card.lastReviewDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Stability = interval * EF
  const stability = card.interval * card.easinessFactor;

  // Forgetting curve: R(t) = e^(-t/S)
  const retention = Math.exp(-daysSinceReview / stability);

  return Math.max(0, Math.min(1, retention));
}

/**
 * 카드 묶음의 평균 난이도 계산
 *
 * @param cards 카드 배열
 * @returns 평균 EF (2.5가 기준)
 */
export function calculateAverageDifficulty(cards: ReviewCard[]): number {
  if (cards.length === 0) return DEFAULT_EASINESS_FACTOR;

  const sumEF = cards.reduce((sum, card) => sum + card.easinessFactor, 0);
  return sumEF / cards.length;
}

/**
 * 예상 복습 시간 계산 (분)
 *
 * @param cardCount 카드 수
 * @param averageDifficulty 평균 난이도
 * @returns 예상 시간 (분)
 */
export function estimateReviewTime(cardCount: number, averageDifficulty: number): number {
  // 기본: 카드당 30초
  // 난이도에 따라 조정 (어려울수록 오래 걸림)
  const baseTimePerCard = 0.5; // 0.5분 = 30초
  const difficultyMultiplier = 3.0 - averageDifficulty; // EF 1.3~2.5 → multiplier 0.5~1.7

  const totalMinutes = cardCount * baseTimePerCard * (1 + difficultyMultiplier * 0.3);

  return Math.ceil(totalMinutes);
}

/**
 * 망각 곡선 데이터 생성
 *
 * @param card 카드
 * @param days 예측할 일수
 * @returns 일별 retention 데이터
 */
export function generateForgettingCurve(
  card: ReviewCard,
  days: number = 30
): { day: number; retention: number }[] {
  const stability = card.interval * card.easinessFactor;
  const curve: { day: number; retention: number }[] = [];

  for (let day = 0; day <= days; day++) {
    const retention = Math.exp(-day / stability);
    curve.push({ day, retention });
  }

  return curve;
}

/**
 * 다음 복습 간격 예측
 *
 * @param card 카드
 * @param assumedRating 가정 평가 (3, 4, 5)
 * @returns 예측 간격 (일)
 */
export function predictNextInterval(card: ReviewCard, assumedRating: DifficultyRating): number {
  if (assumedRating < 3) return 0; // 실패하면 즉시 재학습

  const result = calculateSM2(card, assumedRating);
  return result.interval;
}

/**
 * 카드 난이도 분류
 *
 * @param easinessFactor EF 값
 * @returns 난이도 레벨
 */
export function classifyDifficulty(
  easinessFactor: number
): 'very_easy' | 'easy' | 'medium' | 'hard' | 'very_hard' {
  if (easinessFactor >= 2.3) return 'very_easy';
  if (easinessFactor >= 2.0) return 'easy';
  if (easinessFactor >= 1.8) return 'medium';
  if (easinessFactor >= 1.5) return 'hard';
  return 'very_hard';
}
