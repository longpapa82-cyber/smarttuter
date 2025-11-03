import { Flashcard } from './types';

/**
 * Mastery Level Calculator
 *
 * Calculates mastery level based on SM-2 algorithm metrics:
 * - repetitions: Number of times card was reviewed
 * - easeFactor: Current ease factor (2.5 is default)
 * - interval: Days until next review
 */

export type MasteryLevel = 'learning' | 'proficient' | 'mastered';

export interface MasteryStats {
  learning: number;
  proficient: number;
  mastered: number;
  total: number;
  masteryPercentage: number;
}

/**
 * Determine mastery level for a single flashcard
 *
 * Criteria:
 * - Learning: repetitions < 3 (still building memory)
 * - Proficient: repetitions >= 3 && interval < 21 (knows it, needs reinforcement)
 * - Mastered: repetitions >= 5 && interval >= 21 (long-term memory)
 */
export function getCardMasteryLevel(card: Flashcard): MasteryLevel {
  const { repetitions, interval } = card;

  // Mastered: 5+ reviews AND 21+ day interval (3 weeks)
  if (repetitions >= 5 && interval >= 21) {
    return 'mastered';
  }

  // Proficient: 3+ reviews but not yet mastered
  if (repetitions >= 3) {
    return 'proficient';
  }

  // Learning: Less than 3 reviews
  return 'learning';
}

/**
 * Calculate overall mastery statistics
 */
export function calculateMasteryStats(flashcards: Flashcard[]): MasteryStats {
  const stats: MasteryStats = {
    learning: 0,
    proficient: 0,
    mastered: 0,
    total: flashcards.length,
    masteryPercentage: 0,
  };

  if (flashcards.length === 0) {
    return stats;
  }

  flashcards.forEach((card) => {
    const level = getCardMasteryLevel(card);
    stats[level]++;
  });

  // Calculate overall mastery percentage
  // Weight: mastered = 100%, proficient = 50%, learning = 0%
  const weightedScore =
    stats.mastered * 100 + stats.proficient * 50 + stats.learning * 0;
  const maxScore = flashcards.length * 100;
  stats.masteryPercentage = Math.round((weightedScore / maxScore) * 100);

  return stats;
}

/**
 * Get cards by mastery level
 */
export function getCardsByMasteryLevel(
  flashcards: Flashcard[],
  level: MasteryLevel
): Flashcard[] {
  return flashcards.filter((card) => getCardMasteryLevel(card) === level);
}

/**
 * Get mastery level color theme
 */
export function getMasteryLevelColor(level: MasteryLevel): {
  light: string;
  dark: string;
  gradient: string;
  icon: string;
} {
  switch (level) {
    case 'learning':
      return {
        light: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        dark: 'dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700',
        gradient: 'from-yellow-400 to-orange-500',
        icon: '📚',
      };
    case 'proficient':
      return {
        light: 'bg-blue-100 text-blue-800 border-blue-300',
        dark: 'dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700',
        gradient: 'from-blue-400 to-cyan-500',
        icon: '💪',
      };
    case 'mastered':
      return {
        light: 'bg-green-100 text-green-800 border-green-300',
        dark: 'dark:bg-green-900/20 dark:text-green-400 dark:border-green-700',
        gradient: 'from-green-400 to-emerald-500',
        icon: '🏆',
      };
  }
}

/**
 * Get mastery level display name
 */
export function getMasteryLevelName(level: MasteryLevel): string {
  switch (level) {
    case 'learning':
      return '학습 중';
    case 'proficient':
      return '숙달 중';
    case 'mastered':
      return '완전 숙달';
  }
}

/**
 * Get mastery level description
 */
export function getMasteryLevelDescription(level: MasteryLevel): string {
  switch (level) {
    case 'learning':
      return '아직 익히는 중이에요';
    case 'proficient':
      return '거의 다 익혔어요';
    case 'mastered':
      return '완벽하게 숙달했어요';
  }
}

/**
 * Calculate estimated time to mastery
 * Returns estimated days until all cards reach mastered level
 */
export function estimateTimeToMastery(
  flashcards: Flashcard[],
  dailyReviewRate: number = 20
): number {
  const stats = calculateMasteryStats(flashcards);
  const cardsToMaster = stats.learning + stats.proficient;

  if (cardsToMaster === 0) {
    return 0;
  }

  // Average time to mastery: ~14 days with daily review
  const avgDaysPerCard = 14;
  const parallelFactor = Math.min(dailyReviewRate / 5, 1); // More reviews = faster mastery
  const estimatedDays = Math.ceil((cardsToMaster * avgDaysPerCard) / dailyReviewRate);

  return estimatedDays;
}
