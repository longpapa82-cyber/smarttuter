// types/spaced-repetition.ts - Spaced Repetition System (SM-2 Algorithm)

/**
 * SM-2 알고리즘 (SuperMemo 2)
 *
 * 복습 간격을 자동으로 조정하여 장기 기억을 최적화하는 알고리즘
 * - 1년 후 80% retention 달성
 * - 개인별 학습 패턴 적응
 * - 효율적인 복습 스케줄링
 */

/**
 * 복습 카드 상태
 */
export type ReviewStatus =
  | 'new'          // 새로운 카드 (아직 학습 안함)
  | 'learning'     // 학습 중 (단기 기억)
  | 'review'       // 복습 대기
  | 'relearning'   // 재학습 필요
  | 'mastered';    // 마스터 (장기 기억)

/**
 * 난이도 평가 (사용자 입력)
 */
export type DifficultyRating =
  | 0  // Complete blackout (완전 기억 안남)
  | 1  // Incorrect response (오답)
  | 2  // Incorrect but remembered (오답이지만 기억남)
  | 3  // Correct with difficulty (정답이지만 어려웠음)
  | 4  // Correct with hesitation (정답, 약간 망설임)
  | 5; // Perfect response (완벽한 정답)

/**
 * 복습 카드 (Flashcard)
 */
export interface ReviewCard {
  id: string;
  userId: string;

  // 카드 내용
  front: string;        // 앞면 (질문)
  back: string;         // 뒷면 (답)
  subject: 'math' | 'english';
  topic: string;

  // 관련 모듈/컨텐츠
  moduleId?: string;
  lessonId?: string;

  // SM-2 알고리즘 파라미터
  easinessFactor: number;  // 난이도 계수 (1.3 ~ 2.5, 초기값 2.5)
  interval: number;        // 복습 간격 (일 단위)
  repetitions: number;     // 연속 성공 횟수

  // 상태
  status: ReviewStatus;

  // 다음 복습 날짜
  nextReviewDate: Date;

  // 마지막 복습 정보
  lastReviewDate?: Date;
  lastRating?: DifficultyRating;

  // 통계
  totalReviews: number;
  correctReviews: number;
  averageRating: number;

  // 생성/수정 시간
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 복습 세션
 */
export interface ReviewSession {
  id: string;
  userId: string;

  // 세션 정보
  startTime: Date;
  endTime?: Date;
  duration?: number;  // 초

  // 복습한 카드
  cardIds: string[];
  totalCards: number;

  // 결과
  completedCards: number;
  correctCards: number;
  averageRating: number;

  // XP 보상
  earnedXP: number;
}

/**
 * 복습 통계
 */
export interface ReviewStats {
  userId: string;

  // 전체 통계
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
  masteredCards: number;

  // 오늘의 복습
  todayDue: number;        // 오늘 복습해야 할 카드 수
  todayCompleted: number;  // 오늘 완료한 카드 수
  todayNew: number;        // 오늘 학습한 새 카드 수

  // 이번 주
  weeklyReviews: number;
  weeklyAccuracy: number;  // 0-100

  // 전체 기간
  totalReviews: number;
  overallAccuracy: number;  // 0-100

  // 연속 일수
  currentStreak: number;
  longestStreak: number;

  // 과목별 통계
  subjectStats: {
    math: {
      totalCards: number;
      masteredCards: number;
      accuracy: number;
    };
    english: {
      totalCards: number;
      masteredCards: number;
      accuracy: number;
    };
  };

  // 일별 활동 (최근 30일)
  dailyActivity: {
    date: string;  // YYYY-MM-DD
    reviews: number;
    newCards: number;
    accuracy: number;
  }[];
}

/**
 * SM-2 계산 결과
 */
export interface SM2Result {
  // 업데이트된 파라미터
  easinessFactor: number;
  interval: number;
  repetitions: number;

  // 다음 복습 날짜
  nextReviewDate: Date;

  // 새로운 상태
  status: ReviewStatus;
}

/**
 * 복습 설정
 */
export interface ReviewSettings {
  userId: string;

  // 일일 목표
  dailyNewCards: number;      // 하루에 학습할 새 카드 수 (기본: 20)
  dailyReviewCards: number;   // 하루에 복습할 카드 수 (기본: 100)

  // 난이도 설정
  easyBonus: number;          // 쉬움 선택 시 간격 배수 (기본: 1.3)
  hardInterval: number;       // 어려움 선택 시 간격 배수 (기본: 1.2)

  // 알림 설정
  notificationsEnabled: boolean;
  notificationTime: string;   // HH:MM (예: "09:00")

  // 학습 순서
  reviewOrder: 'due_date' | 'random' | 'difficulty';
  newCardOrder: 'added' | 'random';
}

/**
 * 복습 대기열
 */
export interface ReviewQueue {
  userId: string;
  date: string;  // YYYY-MM-DD

  // 대기 중인 카드
  newCards: string[];       // 새 카드 ID
  learningCards: string[];  // 학습 중 카드 ID
  reviewCards: string[];    // 복습 카드 ID

  // 우선순위 정렬된 카드
  priorityCards: {
    cardId: string;
    priority: number;  // 높을수록 우선순위 높음
    dueDate: Date;
    overdue: boolean;
  }[];
}

/**
 * 복습 알림
 */
export interface ReviewNotification {
  id: string;
  userId: string;

  // 알림 내용
  title: string;
  message: string;

  // 복습 정보
  dueCards: number;
  overdueCards: number;

  // 알림 시간
  scheduledTime: Date;
  sentAt?: Date;

  // 상태
  read: boolean;
  clicked: boolean;
}

/**
 * 학습 커브 데이터
 */
export interface LearningCurve {
  userId: string;
  cardId: string;

  // 복습 이력
  reviews: {
    date: Date;
    rating: DifficultyRating;
    interval: number;
    easinessFactor: number;
    timeSpent: number;  // 초
  }[];

  // 망각 곡선 예측
  forgettingCurve: {
    day: number;
    retention: number;  // 0-1 (예상 기억 유지율)
  }[];
}

/**
 * 복습 추천
 */
export interface ReviewRecommendation {
  // 추천 시간
  optimalTime: Date;

  // 추천 카드 수
  recommendedNewCards: number;
  recommendedReviewCards: number;

  // 예상 소요 시간 (분)
  estimatedDuration: number;

  // 추천 이유
  reason: string;

  // 우선순위 카드
  priorityCards: ReviewCard[];
}
