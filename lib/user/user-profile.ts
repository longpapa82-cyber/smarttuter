/**
 * lib/user/user-profile.ts
 * 사용자 프로필 관리 (LocalStorage 기반)
 */

import type { UserProfile, OnboardingProgress, GradeLevel, Subject } from '@/types/user';

// LocalStorage 키 (AI Park 브랜딩)
const PROFILE_KEY = 'aipark_user_profile';
const ONBOARDING_KEY = 'aipark_onboarding_progress';

// 기존 SmartTutor 키 (마이그레이션용)
const LEGACY_PROFILE_KEY = 'smarttutor_user_profile';
const LEGACY_ONBOARDING_KEY = 'smarttutor_onboarding_progress';

// ==================== 프로필 관리 ====================

/**
 * 새 사용자 프로필 생성
 */
export function createUserProfile(data: {
  nickname: string;
  gradeLevel: GradeLevel;
  preferredSubjects: Subject[];
  learningGoals?: string;
  email?: string;
  provider?: 'credentials' | 'google' | 'github' | 'guest';
}): UserProfile {
  const now = new Date();

  return {
    id: generateUserId(),
    nickname: data.nickname,
    gradeLevel: data.gradeLevel,
    preferredSubjects: data.preferredSubjects,
    createdAt: now,
    updatedAt: now,
    learningGoals: data.learningGoals,
    email: data.email,
    provider: data.provider || 'guest',
  };
}

/**
 * 사용자 프로필 저장
 */
export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;

  try {
    const serialized = JSON.stringify({
      ...profile,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    });

    localStorage.setItem(PROFILE_KEY, serialized);
    console.log('✅ 프로필 저장 완료:', profile.nickname);
  } catch (error) {
    console.error('❌ 프로필 저장 실패:', error);
  }
}

/**
 * 사용자 프로필 불러오기 (자동 마이그레이션 포함)
 */
export function getUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;

  try {
    // 1. 새 키로 먼저 확인
    let stored = localStorage.getItem(PROFILE_KEY);

    // 2. 없으면 기존 키 확인 (마이그레이션)
    if (!stored) {
      const legacyStored = localStorage.getItem(LEGACY_PROFILE_KEY);
      if (legacyStored) {
        console.log('🔄 SmartTutor → AI Park 프로필 마이그레이션 중...');
        localStorage.setItem(PROFILE_KEY, legacyStored);
        localStorage.removeItem(LEGACY_PROFILE_KEY);
        stored = legacyStored;
      }
    }

    if (!stored) return null;

    const parsed = JSON.parse(stored);

    return {
      ...parsed,
      createdAt: new Date(parsed.createdAt),
      updatedAt: new Date(parsed.updatedAt),
    };
  } catch (error) {
    console.error('❌ 프로필 불러오기 실패:', error);
    return null;
  }
}

/**
 * 사용자 프로필 업데이트
 */
export function updateUserProfile(updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>): void {
  const current = getUserProfile();
  if (!current) {
    console.warn('⚠️ 업데이트할 프로필이 없습니다.');
    return;
  }

  const updated: UserProfile = {
    ...current,
    ...updates,
    updatedAt: new Date(),
  };

  saveUserProfile(updated);
}

/**
 * 사용자 프로필 삭제
 */
export function deleteUserProfile(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(PROFILE_KEY);
    console.log('✅ 프로필 삭제 완료');
  } catch (error) {
    console.error('❌ 프로필 삭제 실패:', error);
  }
}

/**
 * 프로필 존재 여부 확인
 */
export function hasUserProfile(): boolean {
  return getUserProfile() !== null;
}

// ==================== 온보딩 진행 상황 관리 ====================

/**
 * 온보딩 진행 상황 초기화
 */
export function initializeOnboarding(): OnboardingProgress {
  return {
    currentStep: 0,
    totalSteps: 6,
    completedSteps: [],
    data: {},
  };
}

/**
 * 온보딩 진행 상황 저장
 */
export function saveOnboardingProgress(progress: OnboardingProgress): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('❌ 온보딩 진행 상황 저장 실패:', error);
  }
}

/**
 * 온보딩 진행 상황 불러오기 (자동 마이그레이션 포함)
 */
export function getOnboardingProgress(): OnboardingProgress | null {
  if (typeof window === 'undefined') return null;

  try {
    // 1. 새 키로 먼저 확인
    let stored = localStorage.getItem(ONBOARDING_KEY);

    // 2. 없으면 기존 키 확인 (마이그레이션)
    if (!stored) {
      const legacyStored = localStorage.getItem(LEGACY_ONBOARDING_KEY);
      if (legacyStored) {
        console.log('🔄 SmartTutor → AI Park 온보딩 데이터 마이그레이션 중...');
        localStorage.setItem(ONBOARDING_KEY, legacyStored);
        localStorage.removeItem(LEGACY_ONBOARDING_KEY);
        stored = legacyStored;
      }
    }

    if (!stored) return null;

    return JSON.parse(stored);
  } catch (error) {
    console.error('❌ 온보딩 진행 상황 불러오기 실패:', error);
    return null;
  }
}

/**
 * 온보딩 단계 진행
 */
export function advanceOnboardingStep(data?: Partial<OnboardingProgress['data']>): void {
  let progress = getOnboardingProgress();

  if (!progress) {
    progress = initializeOnboarding();
  }

  // 현재 단계를 완료 목록에 추가
  if (!progress.completedSteps.includes(progress.currentStep)) {
    progress.completedSteps.push(progress.currentStep);
  }

  // 다음 단계로 이동
  progress.currentStep = Math.min(progress.currentStep + 1, progress.totalSteps);

  // 데이터 업데이트
  if (data) {
    progress.data = { ...progress.data, ...data };
  }

  saveOnboardingProgress(progress);
}

/**
 * 온보딩 이전 단계로 되돌리기
 */
export function revertOnboardingStep(): void {
  const progress = getOnboardingProgress();
  if (!progress || progress.currentStep === 0) return;

  progress.currentStep = Math.max(progress.currentStep - 1, 0);
  saveOnboardingProgress(progress);
}

/**
 * 온보딩 완료
 */
export function completeOnboarding(): void {
  const progress = getOnboardingProgress();
  if (!progress) return;

  // 온보딩 데이터를 사용자 프로필로 변환
  if (progress.data.nickname && progress.data.gradeLevel && progress.data.preferredSubjects) {
    const profile = createUserProfile({
      nickname: progress.data.nickname,
      gradeLevel: progress.data.gradeLevel,
      preferredSubjects: progress.data.preferredSubjects,
    });

    saveUserProfile(profile);
  }

  // 온보딩 진행 상황 삭제
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ONBOARDING_KEY);
  }

  console.log('✅ 온보딩 완료');
}

/**
 * 온보딩 진행 상황 리셋
 */
export function resetOnboarding(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(ONBOARDING_KEY);
  console.log('✅ 온보딩 진행 상황 리셋');
}

// ==================== 유틸리티 ====================

/**
 * 사용자 ID 생성 (UUID v4 간단 버전)
 */
function generateUserId(): string {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

/**
 * 닉네임 유효성 검사
 */
export function validateNickname(nickname: string): {
  isValid: boolean;
  error?: string;
} {
  // 빈 문자열 체크
  if (!nickname || nickname.trim().length === 0) {
    return {
      isValid: false,
      error: '닉네임을 입력해주세요.',
    };
  }

  // 길이 체크 (2-20자)
  if (nickname.length < 2 || nickname.length > 20) {
    return {
      isValid: false,
      error: '닉네임은 2-20자 사이여야 합니다.',
    };
  }

  // 특수문자 체크 (일부 허용)
  const allowedPattern = /^[가-힣a-zA-Z0-9_\s]+$/;
  if (!allowedPattern.test(nickname)) {
    return {
      isValid: false,
      error: '닉네임은 한글, 영문, 숫자, 언더스코어(_), 공백만 사용 가능합니다.',
    };
  }

  return { isValid: true };
}

/**
 * 프로필 완성도 계산
 */
export function calculateProfileCompleteness(profile: UserProfile): number {
  let completed = 0;
  const total = 6;

  // 필수 필드 (4개)
  if (profile.nickname) completed++;
  if (profile.gradeLevel) completed++;
  if (profile.preferredSubjects && profile.preferredSubjects.length > 0) completed++;
  if (profile.id) completed++;

  // 선택 필드 (2개)
  if (profile.learningGoals) completed++;
  if (profile.avatar) completed++;

  return Math.round((completed / total) * 100);
}

/**
 * 학습 추천을 위한 프로필 분석
 */
export function analyzeProfileForRecommendations(profile: UserProfile): {
  recommendedSubject: Subject | null;
  recommendedDifficulty: string;
  recommendedFocus: string[];
} {
  // 가장 최근에 선호한 과목
  const recommendedSubject = profile.preferredSubjects[0] || null;

  // 학교급에 따른 난이도
  const difficultyMap: Record<GradeLevel, string> = {
    elementary: 'beginner',
    middle: 'intermediate',
    high: 'advanced',
    university: 'expert',
  };

  const recommendedDifficulty = difficultyMap[profile.gradeLevel];

  // 학교급에 따른 추천 학습 영역
  const focusMap: Record<GradeLevel, string[]> = {
    elementary: ['기초 개념', '흥미 유발', '게임형 학습'],
    middle: ['개념 이해', '문제 풀이', '실전 연습'],
    high: ['심화 학습', '시험 대비', '문제 해결'],
    university: ['전문 지식', '실무 응용', '고급 주제'],
  };

  const recommendedFocus = focusMap[profile.gradeLevel];

  return {
    recommendedSubject,
    recommendedDifficulty,
    recommendedFocus,
  };
}
