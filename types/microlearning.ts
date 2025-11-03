// types/microlearning.ts - Microlearning System Type Definitions

/**
 * 마이크로러닝 난이도 레벨
 */
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/**
 * 학습 모듈 타입
 */
export type ModuleType =
  | 'concept'        // 개념 학습
  | 'practice'       // 연습 문제
  | 'quiz'           // 퀴즈
  | 'video'          // 비디오 강의
  | 'interactive'    // 인터랙티브 활동
  | 'reading';       // 읽기 자료

/**
 * 학습 주제 (과목별)
 */
export type Subject = 'math' | 'english';

/**
 * 수학 주제
 */
export type MathTopic =
  | 'algebra'           // 대수
  | 'geometry'          // 기하
  | 'calculus'          // 미적분
  | 'statistics'        // 통계
  | 'trigonometry'      // 삼각함수
  | 'arithmetic';       // 산술

/**
 * 영어 주제
 */
export type EnglishTopic =
  | 'grammar'           // 문법
  | 'vocabulary'        // 어휘
  | 'reading'           // 독해
  | 'writing'           // 작문
  | 'speaking'          // 회화
  | 'listening';        // 듣기

/**
 * 학습 모듈 진행 상태
 */
export type ModuleStatus =
  | 'locked'          // 잠김 (선행 학습 필요)
  | 'available'       // 학습 가능
  | 'in_progress'     // 진행 중
  | 'completed'       // 완료
  | 'mastered';       // 숙달

/**
 * 학습 콘텐츠 (텍스트, 이미지, 코드 등)
 */
export interface LearningContent {
  type: 'text' | 'image' | 'code' | 'equation' | 'audio' | 'video';
  content: string;
  caption?: string;
  language?: string; // 코드 언어 (code type)
}

/**
 * 퀴즈 질문
 */
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 정답 인덱스 (0-based)
  explanation: string;
  points: number;
}

/**
 * 마이크로러닝 모듈
 */
export interface MicrolearningModule {
  id: string;
  title: string;
  description: string;
  subject: Subject;
  topic: MathTopic | EnglishTopic;
  type: ModuleType;
  difficulty: DifficultyLevel;

  // 학습 시간 (분)
  estimatedMinutes: number;

  // 학습 콘텐츠
  contents: LearningContent[];

  // 퀴즈 (있는 경우)
  quiz?: QuizQuestion[];

  // 학습 목표
  learningObjectives: string[];

  // 선행 학습 모듈 ID
  prerequisites?: string[];

  // 다음 추천 모듈 ID
  nextModules?: string[];

  // XP 보상
  xpReward: number;

  // 썸네일 이미지 (이모지 또는 URL)
  thumbnail: string;

  // 태그
  tags: string[];
}

/**
 * 사용자 모듈 진행 상태
 */
export interface UserModuleProgress {
  moduleId: string;
  userId: string;
  status: ModuleStatus;

  // 진행도 (0-100)
  progress: number;

  // 완료 시간 (초)
  completionTime?: number;

  // 퀴즈 점수 (있는 경우)
  quizScore?: number;

  // 시작 시간
  startedAt?: Date;

  // 완료 시간
  completedAt?: Date;

  // 마지막 접근 시간
  lastAccessedAt: Date;

  // 재시도 횟수
  attempts: number;
}

/**
 * 학습 경로 (Learning Path)
 */
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  subject: Subject;
  difficulty: DifficultyLevel;

  // 모듈 ID 목록 (순서대로)
  moduleIds: string[];

  // 총 예상 학습 시간 (분)
  totalMinutes: number;

  // 총 XP
  totalXP: number;

  // 썸네일
  thumbnail: string;

  // 학습 목표
  goals: string[];
}

/**
 * 사용자 학습 경로 진행 상태
 */
export interface UserPathProgress {
  pathId: string;
  userId: string;

  // 진행도 (0-100)
  progress: number;

  // 현재 모듈 인덱스
  currentModuleIndex: number;

  // 완료한 모듈 수
  completedModules: number;

  // 총 모듈 수
  totalModules: number;

  // 시작 시간
  startedAt: Date;

  // 예상 완료 시간
  estimatedCompletionDate?: Date;
}

/**
 * 일일 학습 목표
 */
export interface DailyGoal {
  userId: string;
  date: string; // YYYY-MM-DD

  // 목표 (분)
  targetMinutes: number;

  // 달성 (분)
  achievedMinutes: number;

  // 완료한 모듈 수
  completedModules: number;

  // 획득 XP
  earnedXP: number;

  // 목표 달성 여부
  isCompleted: boolean;
}

/**
 * 학습 통계
 */
export interface LearningStats {
  userId: string;

  // 총 학습 시간 (분)
  totalMinutes: number;

  // 완료한 모듈 수
  completedModules: number;

  // 진행 중인 모듈 수
  inProgressModules: number;

  // 평균 퀴즈 점수
  averageQuizScore: number;

  // 연속 학습 일수
  currentStreak: number;

  // 최장 연속 학습 일수
  longestStreak: number;

  // 과목별 통계
  subjectStats: {
    [key in Subject]: {
      completedModules: number;
      totalMinutes: number;
      averageScore: number;
    };
  };

  // 주간 활동 (최근 7일)
  weeklyActivity: {
    date: string; // YYYY-MM-DD
    minutes: number;
    modules: number;
  }[];
}

/**
 * 학습 추천
 */
export interface LearningRecommendation {
  module: MicrolearningModule;
  reason: string;
  priority: 'high' | 'medium' | 'low';

  // 추천 근거
  factors: {
    strengthAlignment: number;    // 0-1 (강점 영역)
    weaknessTargeting: number;    // 0-1 (약점 보완)
    difficultyMatch: number;      // 0-1 (적절한 난이도)
    interestAlignment: number;    // 0-1 (관심 분야)
  };
}

/**
 * 모듈 검색 필터
 */
export interface ModuleFilter {
  subject?: Subject;
  topic?: MathTopic | EnglishTopic;
  type?: ModuleType;
  difficulty?: DifficultyLevel;
  maxMinutes?: number;
  status?: ModuleStatus;
  tags?: string[];
}

/**
 * 모듈 정렬 옵션
 */
export type ModuleSortOption =
  | 'recommended'      // 추천순
  | 'difficulty_asc'   // 난이도 낮은 순
  | 'difficulty_desc'  // 난이도 높은 순
  | 'duration_asc'     // 짧은 순
  | 'duration_desc'    // 긴 순
  | 'newest'           // 최신순
  | 'popular';         // 인기순
