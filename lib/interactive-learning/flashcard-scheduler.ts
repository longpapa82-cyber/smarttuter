// Phase 9: SM-2 Spaced Repetition Algorithm
// Based on SuperMemo SM-2 algorithm (Piotr Woźniak, 1987)

import { Flashcard, ReviewRecord, ReviewSchedule, SM2_DEFAULTS } from './types';

export class FlashcardScheduler {
  /**
   * Calculate next review date using SM-2 algorithm
   */
  static calculateNextReview(
    card: Flashcard,
    quality: 0 | 1 | 2 | 3 | 4 | 5
  ): {
    easeFactor: number;
    interval: number;
    repetitions: number;
    nextReview: Date;
    masteryScore: number;
  } {
    let { easeFactor, interval, repetitions } = card;

    // 1. Update Ease Factor
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    easeFactor =
      easeFactor +
      (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    // Minimum ease factor is 1.3
    easeFactor = Math.max(SM2_DEFAULTS.MIN_EASE_FACTOR, easeFactor);

    // 2. Update Repetitions & Interval
    if (quality < SM2_DEFAULTS.PASSING_QUALITY) {
      // Failed: Reset
      repetitions = 0;
      interval = SM2_DEFAULTS.INITIAL_INTERVAL;
    } else {
      // Passed: Increase
      repetitions += 1;

      if (repetitions === 1) {
        interval = SM2_DEFAULTS.INITIAL_INTERVAL;
      } else if (repetitions === 2) {
        interval = SM2_DEFAULTS.SECOND_INTERVAL;
      } else {
        interval = Math.round(interval * easeFactor);
      }
    }

    // 3. Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    // 4. Update mastery score (0-1)
    const masteryScore = this.calculateMasteryScore(
      quality,
      repetitions,
      easeFactor
    );

    return {
      easeFactor,
      interval,
      repetitions,
      nextReview,
      masteryScore,
    };
  }

  /**
   * Calculate mastery score (0-1)
   */
  private static calculateMasteryScore(
    quality: number,
    repetitions: number,
    easeFactor: number
  ): number {
    // Factors:
    // - Quality (50%): Recent recall quality
    // - Repetitions (30%): Number of successful reviews
    // - Ease Factor (20%): How easy the card is

    const qualityScore = quality / 5; // 0-1
    const repetitionScore = Math.min(repetitions / 10, 1); // Max at 10 reps
    const easeScore = (easeFactor - 1.3) / (2.5 - 1.3); // Normalize 1.3-2.5 to 0-1

    const mastery =
      qualityScore * 0.5 + repetitionScore * 0.3 + easeScore * 0.2;

    return Math.max(0, Math.min(1, mastery));
  }

  /**
   * Get review schedule
   */
  static getReviewSchedule(cards: Flashcard[]): ReviewSchedule {
    const now = new Date();
    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    const due: Flashcard[] = [];
    const upcoming: Flashcard[] = [];
    const mastered: Flashcard[] = [];
    const learning: Flashcard[] = [];

    for (const card of cards) {
      if (card.nextReview <= now) {
        due.push(card);
      } else if (card.nextReview <= threeDaysLater) {
        upcoming.push(card);
      }

      if (card.masteryScore >= 0.8) {
        mastered.push(card);
      } else if (card.repetitions === 0 || card.masteryScore < 0.5) {
        learning.push(card);
      }
    }

    // Sort by next review date
    due.sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());
    upcoming.sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());

    return { due, upcoming, mastered, learning };
  }

  /**
   * Create new flashcard with default SM-2 parameters
   */
  static createFlashcard(
    front: string,
    back: string,
    subject: 'math' | 'english',
    knowledgeNodeId: string,
    difficulty: 1 | 2 | 3 | 4 | 5
  ): Flashcard {
    const now = new Date();
    const nextReview = new Date(now);
    nextReview.setDate(nextReview.getDate() + 1); // Review tomorrow

    return {
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      front,
      back,
      subject,
      knowledgeNodeId,
      difficulty,
      easeFactor: SM2_DEFAULTS.INITIAL_EASE_FACTOR,
      interval: SM2_DEFAULTS.INITIAL_INTERVAL,
      repetitions: 0,
      nextReview,
      reviewHistory: [],
      masteryScore: 0,
      createdAt: now,
      createdFrom: 'manual',
    };
  }

  /**
   * Record review and update card
   */
  static recordReview(
    card: Flashcard,
    quality: 0 | 1 | 2 | 3 | 4 | 5,
    responseTime: number
  ): Flashcard {
    // Add review record
    const reviewRecord: ReviewRecord = {
      reviewedAt: new Date(),
      quality,
      responseTime,
    };

    // Calculate next review
    const nextReview = this.calculateNextReview(card, quality);

    // Update card
    return {
      ...card,
      easeFactor: nextReview.easeFactor,
      interval: nextReview.interval,
      repetitions: nextReview.repetitions,
      lastReviewed: reviewRecord.reviewedAt,
      nextReview: nextReview.nextReview,
      masteryScore: nextReview.masteryScore,
      reviewHistory: [...card.reviewHistory, reviewRecord],
    };
  }

  /**
   * Get quality label for UI
   */
  static getQualityLabel(quality: 0 | 1 | 2 | 3 | 4 | 5): string {
    const labels = {
      0: '완전히 잊음',
      1: '틀림',
      2: '어려움',
      3: '맞음 (힌트 필요)',
      4: '맞음 (약간 어려움)',
      5: '완벽',
    };
    return labels[quality];
  }

  /**
   * Suggest optimal review time
   */
  static getOptimalReviewTime(schedule: ReviewSchedule): string {
    const dueCount = schedule.due.length;

    if (dueCount === 0) {
      if (schedule.upcoming.length > 0) {
        const nextCard = schedule.upcoming[0];
        const days = Math.ceil(
          (nextCard.nextReview.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        return `${days}일 후에 ${schedule.upcoming.length}개 복습`;
      }
      return '복습할 카드가 없습니다';
    }

    if (dueCount <= 5) {
      return `지금 복습하세요 (${dueCount}개)`;
    } else if (dueCount <= 20) {
      return `복습 권장 (${dueCount}개)`;
    } else {
      return `긴급! ${dueCount}개 밀려있음`;
    }
  }

  /**
   * Format next review time preview
   */
  static formatNextReviewTime(interval: number): string {
    if (interval < 1) {
      return '1분 후';
    } else if (interval === 1) {
      return '내일';
    } else if (interval < 7) {
      return `${interval}일 후`;
    } else if (interval < 30) {
      const weeks = Math.floor(interval / 7);
      return `${weeks}주 후`;
    } else if (interval < 365) {
      const months = Math.floor(interval / 30);
      return `${months}개월 후`;
    } else {
      const years = Math.floor(interval / 365);
      return `${years}년 후`;
    }
  }

  /**
   * Get preview text for each quality option
   */
  static getNextReviewPreview(
    card: Flashcard,
    quality: 0 | 1 | 2 | 3 | 4 | 5
  ): string {
    const preview = this.calculateNextReview(card, quality);
    return this.formatNextReviewTime(preview.interval);
  }
}
