/**
 * Difficulty Tracker
 *
 * 사용자별 문제 이력을 추적하고 난이도를 관리하는 시스템
 * Redis 기반 저장소 사용
 */

import {
  type QuestionHistory,
  type DifficultyAdjustment,
  adaptiveDifficultyEngine,
  type DifficultyLevel,
} from './adaptive-difficulty';

/**
 * Redis 키 생성
 */
function getRedisKey(userId: string, subject: 'english' | 'math' | 'science' | 'social-studies' | 'korean'): string {
  return `difficulty:${userId}:${subject}`;
}

/**
 * 사용자의 문제 이력 가져오기
 */
export async function getQuestionHistory(
  userId: string,
  subject: 'english' | 'math' | 'science' | 'social-studies' | 'korean'
): Promise<QuestionHistory[]> {
  try {
    // TODO: Redis에서 실제로 가져오기
    // 현재는 빈 배열 반환 (프로토타입)
    return [];
  } catch (error) {
    console.error('[DifficultyTracker] Error getting history:', error);
    return [];
  }
}

/**
 * 문제 이력 추가
 */
export async function addQuestionHistory(
  userId: string,
  subject: 'english' | 'math' | 'science' | 'social-studies' | 'korean',
  history: QuestionHistory
): Promise<void> {
  try {
    // TODO: Redis에 실제로 저장
    // 현재는 콘솔 로그만 (프로토타입)
    console.log('[DifficultyTracker] Question history added:', {
      userId,
      subject,
      difficulty: history.difficulty,
      isCorrect: history.isCorrect,
      responseTimeMs: history.responseTimeMs,
    });
  } catch (error) {
    console.error('[DifficultyTracker] Error adding history:', error);
  }
}

/**
 * 현재 난이도 가져오기
 */
export async function getCurrentDifficulty(
  userId: string,
  subject: 'english' | 'math' | 'science' | 'social-studies' | 'korean',
  gradeLevel: string
): Promise<DifficultyLevel> {
  try {
    const history = await getQuestionHistory(userId, subject);

    if (history.length === 0) {
      // 이력이 없으면 학년별 초기 난이도 반환
      const initialDifficulty = adaptiveDifficultyEngine.recommendInitialDifficulty(gradeLevel);
      console.log(`[DifficultyTracker] Initial difficulty for ${subject}: ${initialDifficulty} (grade: ${gradeLevel})`);
      return initialDifficulty;
    }

    // 최근 난이도 반환
    const currentDifficulty = history[history.length - 1].difficulty;
    console.log(`[DifficultyTracker] Current difficulty for ${subject}: ${currentDifficulty} (${history.length} history items)`);
    return currentDifficulty;
  } catch (error) {
    console.error('[DifficultyTracker] Error getting difficulty:', error);
    return 'medium';
  }
}

/**
 * 난이도 조절 필요 여부 확인 및 조절
 */
export async function checkAndAdjustDifficulty(
  userId: string,
  subject: 'english' | 'math'
): Promise<DifficultyAdjustment | null> {
  try {
    const history = await getQuestionHistory(userId, subject);

    // 최소 3개 이상 문제를 풀어야 조절 가능
    if (history.length < 3) {
      return null;
    }

    // 난이도 조절 계산
    const adjustment = adaptiveDifficultyEngine.calculateNextDifficulty(history);

    // 난이도가 변경되었으면 알림
    if (adjustment.shouldNotify && adjustment.previousDifficulty !== adjustment.newDifficulty) {
      console.log('[DifficultyTracker] Difficulty adjusted:', {
        userId,
        subject,
        previous: adjustment.previousDifficulty,
        new: adjustment.newDifficulty,
        reason: adjustment.reason,
      });

      return adjustment;
    }

    return null;
  } catch (error) {
    console.error('[DifficultyTracker] Error adjusting difficulty:', error);
    return null;
  }
}

/**
 * 난이도 레벨을 시스템 프롬프트 설명으로 변환
 */
export function difficultyToPromptGuidance(difficulty: DifficultyLevel): string {
  const guidance: Record<DifficultyLevel, string> = {
    'very_easy': '매우 기초적인 수준으로, 간단한 예시와 쉬운 설명을 사용하세요.',
    'easy': '기초 수준으로, 명확하고 단계적인 설명을 제공하세요.',
    'medium': '표준 수준으로, 적절한 깊이의 설명과 예시를 제공하세요.',
    'hard': '심화 수준으로, 깊이 있는 설명과 복잡한 예시를 사용하세요.',
    'very_hard': '전문가 수준으로, 고급 개념과 복잡한 응용을 다루세요.',
  };

  return guidance[difficulty];
}
