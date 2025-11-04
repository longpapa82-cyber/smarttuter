/**
 * types/user.ts
 * 사용자 프로필 및 온보딩 관련 타입 정의
 */

export type GradeLevel = 'elementary' | 'middle' | 'high' | 'university';

export type Subject = 'english' | 'math' | 'science';

export type AuthProvider = 'credentials' | 'google' | 'github' | 'guest';

export interface UserProfile {
  id: string;
  nickname: string;
  gradeLevel: GradeLevel;
  preferredSubjects: Subject[];
  createdAt: Date;
  updatedAt: Date;

  // 선택 사항
  learningGoals?: string;
  avatar?: string;
  email?: string;
  provider?: AuthProvider;
}

export interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  data: {
    gradeLevel?: GradeLevel;
    preferredSubjects?: Subject[];
    nickname?: string;
    hasExperienced?: boolean;
  };
}

export interface GradeLevelOption {
  value: GradeLevel;
  label: string;
  emoji: string;
  description: string;
  ageRange: string;
}

export interface SubjectOption {
  value: Subject;
  label: string;
  emoji: string;
  description: string;
  color: string;
}

// 학교급 옵션
export const GRADE_LEVEL_OPTIONS: GradeLevelOption[] = [
  {
    value: 'elementary',
    label: '초등학생',
    emoji: '🎒',
    description: '초등학교 1~6학년',
    ageRange: '8-13세',
  },
  {
    value: 'middle',
    label: '중학생',
    emoji: '📖',
    description: '중학교 1~3학년',
    ageRange: '14-16세',
  },
  {
    value: 'high',
    label: '고등학생',
    emoji: '📘',
    description: '고등학교 1~3학년',
    ageRange: '17-19세',
  },
  {
    value: 'university',
    label: '대학생/성인',
    emoji: '🎓',
    description: '대학생 및 성인 학습자',
    ageRange: '20세 이상',
  },
];

// 과목 옵션
export const SUBJECT_OPTIONS: SubjectOption[] = [
  {
    value: 'english',
    label: '영어',
    emoji: '📚',
    description: 'AI와 함께하는 맞춤형 영어학습',
    color: 'from-blue-600 via-indigo-600 to-purple-600',
  },
  {
    value: 'math',
    label: '수학',
    emoji: '🔢',
    description: '개념부터 문제풀이까지 완벽 학습',
    color: 'from-purple-600 via-pink-600 to-rose-600',
  },
  {
    value: 'science',
    label: '과학',
    emoji: '🔬',
    description: '생물·화학·물리·지구과학 체계적 학습',
    color: 'from-cyan-600 via-blue-600 to-indigo-600',
  },
];

// 학교급 레이블 가져오기
export function getGradeLevelLabel(level: GradeLevel): string {
  const option = GRADE_LEVEL_OPTIONS.find((opt) => opt.value === level);
  return option?.label || level;
}

// 과목 레이블 가져오기
export function getSubjectLabel(subject: Subject): string {
  const option = SUBJECT_OPTIONS.find((opt) => opt.value === subject);
  return option?.label || subject;
}
