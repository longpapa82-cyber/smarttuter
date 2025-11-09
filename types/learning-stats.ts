/**
 * 학습 통계 데이터 타입 정의
 */

export interface SubjectStats {
  weeklyHours: number;
  weeklyGoal: number;
  hasData: boolean;
}

// 세션 정보
export interface LastSession {
  topic: string;
  date: string;
  duration: number;
}

// 강점/약점 분석
export interface LearningAnalysis {
  strengths: string[];
  weaknesses: string[];
  aiRecommendation: string;
}

// 영어 상세 통계
export interface EnglishDetailedStats {
  lastSession: LastSession | null;
  nextTopic: string | null;
  cefrLevel: {
    current: string;
    target: string;
    progress: number;
  } | null;
  monthlyHours: {
    current: number;
    target: number;
  };
  completedTopics: number;
  masteredGrammar: string[];
  mastery: {
    listening: number;
    speaking: number;
    reading: number;
    writing: number;
  };
  analysis: LearningAnalysis;
}

// 수학 챕터 진행도
export interface MathChapter {
  name: string;
  progress: number;
  status: 'completed' | 'in_progress' | 'not_started';
}

// 수학 상세 통계
export interface MathDetailedStats {
  lastSession: LastSession | null;
  nextTopic: string | null;
  gradeProgress: {
    level: string;
    progress: number;
  } | null;
  monthlyHours: {
    current: number;
    target: number;
  };
  chapters: MathChapter[];
  analysis: LearningAnalysis;
}

// 기존 인터페이스 (메인 대시보드용)
export interface EnglishStats extends SubjectStats {
  cefrLevel: string | null;
  skills: {
    listening: number;
    speaking: number;
    reading: number;
    writing: number;
  };
  // 상세 통계 (옵셔널)
  detailed?: EnglishDetailedStats;
}

export interface MathStats extends SubjectStats {
  gradeLevel: string | null;
  completedUnits: number;
  totalUnits: number;
  currentTopic: string | null;
  // 상세 통계 (옵셔널)
  detailed?: MathDetailedStats;
}

// 과학 상세 통계
export interface ScienceDetailedStats {
  lastSession: LastSession | null;
  nextTopic: string | null;
  gradeProgress: {
    level: string;
    progress: number;
  } | null;
  monthlyHours: {
    current: number;
    target: number;
  };
  concepts: {
    name: string;
    progress: number;
    status: 'completed' | 'in_progress' | 'not_started';
  }[];
  analysis: LearningAnalysis;
}

// 사회 상세 통계
export interface SocialDetailedStats {
  lastSession: LastSession | null;
  nextTopic: string | null;
  gradeProgress: {
    level: string;
    progress: number;
  } | null;
  monthlyHours: {
    current: number;
    target: number;
  };
  periods: {
    name: string;
    progress: number;
    status: 'completed' | 'in_progress' | 'not_started';
  }[];
  analysis: LearningAnalysis;
}

export interface ScienceStats extends SubjectStats {
  gradeLevel: string | null;
  completedUnits: number;
  totalUnits: number;
  currentTopic: string | null;
  detailed?: ScienceDetailedStats;
}

export interface SocialStats extends SubjectStats {
  gradeLevel: string | null;
  completedUnits: number;
  totalUnits: number;
  currentTopic: string | null;
  detailed?: SocialDetailedStats;
}

// 국어 상세 통계
export interface KoreanDetailedStats {
  lastSession: LastSession | null;
  nextTopic: string | null;
  gradeProgress: {
    level: string;
    progress: number;
  } | null;
  monthlyHours: {
    current: number;
    target: number;
  };
  topics: {
    name: string;
    progress: number;
    status: 'completed' | 'in_progress' | 'not_started';
  }[];
  analysis: LearningAnalysis;
}

export interface KoreanStats extends SubjectStats {
  gradeLevel: string | null;
  completedUnits: number;
  totalUnits: number;
  currentTopic: string | null;
  detailed?: KoreanDetailedStats;
}

export interface LearningStats {
  english: EnglishStats;
  math: MathStats;
  science: ScienceStats;
  social: SocialStats;
  korean: KoreanStats;
}
