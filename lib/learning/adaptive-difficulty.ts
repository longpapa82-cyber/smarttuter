/**
 * Adaptive Difficulty Engine
 *
 * 학생의 실시간 성취도를 기반으로 문제 난이도를 자동 조절하는 시스템
 *
 * 참고:
 * - Squirrel AI: 학생 정확도 78% → 93% 향상 사례
 * - Zone of Proximal Development (ZPD) 이론 기반
 * - 너무 쉽지도, 어렵지도 않은 적절한 도전 과제 제공
 */

/**
 * 난이도 레벨 정의 (기존 시스템과 호환)
 * @see lib/learning-progress/types.ts
 */
export type DifficultyLevel = 'very_easy' | 'easy' | 'medium' | 'hard' | 'very_hard';

/**
 * 난이도 레벨 숫자 매핑 (내부 계산용)
 */
export const DifficultyLevelNumeric: Record<DifficultyLevel, number> = {
  'very_easy': 1,
  'easy': 2,
  'medium': 3,
  'hard': 4,
  'very_hard': 5,
};

/**
 * 숫자를 난이도 레벨로 변환
 */
export function numericToDifficultyLevel(numeric: number): DifficultyLevel {
  const levels: DifficultyLevel[] = ['very_easy', 'easy', 'medium', 'hard', 'very_hard'];
  const index = Math.max(0, Math.min(4, Math.round(numeric) - 1));
  return levels[index];
}

/**
 * 난이도 레벨 한글 표시
 */
export const DifficultyLabelKorean: Record<DifficultyLevel, string> = {
  'very_easy': '입문',
  'easy': '쉬움',
  'medium': '보통',
  'hard': '어려움',
  'very_hard': '전문가',
};

/**
 * 난이도 레벨 색상
 */
export const DifficultyColor: Record<DifficultyLevel, string> = {
  'very_easy': 'text-green-600 bg-green-50 border-green-200',
  'easy': 'text-blue-600 bg-blue-50 border-blue-200',
  'medium': 'text-yellow-600 bg-yellow-50 border-yellow-200',
  'hard': 'text-orange-600 bg-orange-50 border-orange-200',
  'very_hard': 'text-red-600 bg-red-50 border-red-200',
};

/**
 * 질문/문제 이력
 */
export interface QuestionHistory {
  questionId: string;
  difficulty: DifficultyLevel;
  isCorrect: boolean;
  responseTimeMs: number;     // 답변 소요 시간 (밀리초)
  hintsUsed: number;          // 사용한 힌트 개수
  attempts: number;           // 시도 횟수
  timestamp: Date;
}

/**
 * 학습 성과 메트릭
 */
export interface PerformanceMetrics {
  accuracy: number;           // 정확도 (0-1)
  avgResponseTime: number;    // 평균 응답 시간 (초)
  hintsUsedRate: number;      // 힌트 사용률 (0-1)
  questionsAttempted: number; // 시도한 문제 수
  currentDifficulty: DifficultyLevel;
}

/**
 * 난이도 조절 결과
 */
export interface DifficultyAdjustment {
  previousDifficulty: DifficultyLevel;
  newDifficulty: DifficultyLevel;
  reason: string;             // 조절 이유 (사용자에게 표시)
  shouldNotify: boolean;      // 사용자에게 알림 표시 여부
}

/**
 * 적응형 난이도 조절 엔진
 */
export class AdaptiveDifficultyEngine {
  private readonly MIN_QUESTIONS_FOR_ADJUSTMENT = 3;  // 난이도 조절 최소 문제 수
  private readonly HIGH_ACCURACY_THRESHOLD = 0.85;     // 난이도 상승 기준
  private readonly LOW_ACCURACY_THRESHOLD = 0.60;      // 난이도 하락 기준
  private readonly IDEAL_RESPONSE_TIME_MULTIPLIER = 1.5; // 이상적 응답 시간 배율

  /**
   * 최근 N개 문제의 정확도 계산
   */
  private getRecentAccuracy(history: QuestionHistory[], count: number): number {
    const recentQuestions = history.slice(-count);
    if (recentQuestions.length === 0) return 0;

    const correctCount = recentQuestions.filter(q => q.isCorrect).length;
    return correctCount / recentQuestions.length;
  }

  /**
   * 최근 N개 문제의 평균 응답 시간 계산 (초)
   */
  private getAvgResponseTime(history: QuestionHistory[], count: number): number {
    const recentQuestions = history.slice(-count);
    if (recentQuestions.length === 0) return 0;

    const totalTime = recentQuestions.reduce((sum, q) => sum + q.responseTimeMs, 0);
    return totalTime / recentQuestions.length / 1000; // 밀리초 → 초
  }

  /**
   * 최근 N개 문제의 힌트 사용률 계산
   */
  private getHintsUsedRate(history: QuestionHistory[], count: number): number {
    const recentQuestions = history.slice(-count);
    if (recentQuestions.length === 0) return 0;

    const totalHints = recentQuestions.reduce((sum, q) => sum + q.hintsUsed, 0);
    return totalHints / recentQuestions.length;
  }

  /**
   * 현재 난이도의 목표 응답 시간 계산 (초)
   */
  private getTargetResponseTime(difficulty: DifficultyLevel): number {
    // 난이도별 기본 목표 시간
    const baseTime: Record<DifficultyLevel, number> = {
      'very_easy': 30,
      'easy': 60,
      'medium': 90,
      'hard': 120,
      'very_hard': 180,
    };

    return baseTime[difficulty] * this.IDEAL_RESPONSE_TIME_MULTIPLIER;
  }

  /**
   * 성과 메트릭 계산
   */
  calculatePerformanceMetrics(history: QuestionHistory[]): PerformanceMetrics {
    const recentCount = Math.min(5, history.length);

    return {
      accuracy: this.getRecentAccuracy(history, recentCount),
      avgResponseTime: this.getAvgResponseTime(history, recentCount),
      hintsUsedRate: this.getHintsUsedRate(history, recentCount),
      questionsAttempted: history.length,
      currentDifficulty: history.length > 0
        ? history[history.length - 1].difficulty
        : 'medium' as DifficultyLevel,
    };
  }

  /**
   * 다음 문제의 난이도 계산
   */
  calculateNextDifficulty(history: QuestionHistory[]): DifficultyAdjustment {
    // 최소 문제 수 미달 시 현재 난이도 유지
    if (history.length < this.MIN_QUESTIONS_FOR_ADJUSTMENT) {
      const currentDifficulty = history.length > 0
        ? history[history.length - 1].difficulty
        : 'medium' as DifficultyLevel;

      return {
        previousDifficulty: currentDifficulty,
        newDifficulty: currentDifficulty,
        reason: '학습 초기 단계입니다. 조금 더 풀어보면 적절한 난이도로 조절됩니다.',
        shouldNotify: false,
      };
    }

    const metrics = this.calculatePerformanceMetrics(history);
    const currentDifficulty = metrics.currentDifficulty;
    const targetTime = this.getTargetResponseTime(currentDifficulty);
    const currentNumeric = DifficultyLevelNumeric[currentDifficulty];

    // 난이도 상승 조건: 높은 정확도 + 빠른 응답 시간 + 힌트 적게 사용
    if (
      metrics.accuracy >= this.HIGH_ACCURACY_THRESHOLD &&
      metrics.avgResponseTime < targetTime &&
      metrics.hintsUsedRate < 1.0 &&
      currentNumeric < 5  // very_hard보다 낮으면
    ) {
      const newDifficulty = numericToDifficultyLevel(currentNumeric + 1);
      return {
        previousDifficulty: currentDifficulty,
        newDifficulty,
        reason: `정확도 ${Math.round(metrics.accuracy * 100)}%! 아주 잘하고 있어요. 조금 더 어려운 문제에 도전해볼까요?`,
        shouldNotify: true,
      };
    }

    // 난이도 하락 조건: 낮은 정확도 OR 너무 느린 응답 시간 OR 힌트 많이 사용
    if (
      (metrics.accuracy < this.LOW_ACCURACY_THRESHOLD ||
       metrics.avgResponseTime > targetTime * 1.5 ||
       metrics.hintsUsedRate > 2.0) &&
      currentNumeric > 1  // very_easy보다 높으면
    ) {
      const newDifficulty = numericToDifficultyLevel(currentNumeric - 1);
      return {
        previousDifficulty: currentDifficulty,
        newDifficulty,
        reason: '조금 쉬운 문제로 기본을 다지고 다시 도전해봐요!',
        shouldNotify: true,
      };
    }

    // 현재 난이도 유지
    return {
      previousDifficulty: currentDifficulty,
      newDifficulty: currentDifficulty,
      reason: '현재 난이도가 딱 맞아요. 이대로 계속 연습해봐요!',
      shouldNotify: false,
    };
  }

  /**
   * 난이도 조절 추천 메시지 생성
   */
  generateFeedbackMessage(adjustment: DifficultyAdjustment): string {
    const { previousDifficulty, newDifficulty, reason } = adjustment;

    if (newDifficulty > previousDifficulty) {
      return `🎉 레벨 업! ${DifficultyLabelKorean[previousDifficulty]} → ${DifficultyLabelKorean[newDifficulty]}\n\n${reason}`;
    } else if (newDifficulty < previousDifficulty) {
      return `🎯 난이도 조절: ${DifficultyLabelKorean[previousDifficulty]} → ${DifficultyLabelKorean[newDifficulty]}\n\n${reason}`;
    }

    return reason;
  }

  /**
   * 학생 이력 기반 초기 난이도 추천
   */
  recommendInitialDifficulty(
    gradeLevel: string,
    previousPerformance?: PerformanceMetrics
  ): DifficultyLevel {
    // 이전 성과 데이터가 있으면 그것을 기반으로
    if (previousPerformance) {
      return previousPerformance.currentDifficulty;
    }

    // 학년별 기본 난이도
    const gradeDifficultyMap: Record<string, DifficultyLevel> = {
      '초등학교': 'very_easy',
      '중학교': 'easy',
      '고등학교': 'medium',
      '대학교': 'hard',
    };

    return gradeDifficultyMap[gradeLevel] || 'medium';
  }
}

/**
 * 싱글톤 인스턴스
 */
export const adaptiveDifficultyEngine = new AdaptiveDifficultyEngine();
