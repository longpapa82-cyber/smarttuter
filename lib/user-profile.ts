/**
 * 사용자 프로필 관리
 * 학년 정보 저장 및 로드
 */

import { UserProfile, GradeLevel, Subject, GradeLevelDetail } from '@/types/tutor';

// 임시: localStorage 기반 (추후 DB로 확장 가능)
const PROFILE_STORAGE_KEY = 'smarttuter_user_profile';

/**
 * 사용자 프로필 가져오기
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    // 브라우저 환경에서만 실행
    if (typeof window === 'undefined') {
      return getDefaultProfile(userId);
    }

    const stored = localStorage.getItem(`${PROFILE_STORAGE_KEY}_${userId}`);
    if (!stored) {
      return getDefaultProfile(userId);
    }

    const profile = JSON.parse(stored);
    return {
      ...profile,
      createdAt: new Date(profile.createdAt),
      updatedAt: new Date(profile.updatedAt),
    };
  } catch (error) {
    console.error('Error loading user profile:', error);
    return getDefaultProfile(userId);
  }
}

/**
 * 사용자 프로필 저장
 */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    if (typeof window === 'undefined') {
      return;
    }

    const toSave = {
      ...profile,
      updatedAt: new Date(),
    };

    localStorage.setItem(
      `${PROFILE_STORAGE_KEY}_${profile.userId}`,
      JSON.stringify(toSave)
    );
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
}

/**
 * 사용자 프로필 업데이트
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  const existing = await getUserProfile(userId);
  const updated = {
    ...existing,
    ...updates,
    userId, // 보장
    updatedAt: new Date(),
  } as UserProfile;

  await saveUserProfile(updated);
  return updated;
}

/**
 * 기본 프로필 생성
 */
function getDefaultProfile(userId: string): UserProfile {
  return {
    userId,
    gradeLevel: 'middle' as GradeLevel,
    gradeLevelDetail: {
      middle: '1',
    },
    subjects: ['math', 'english'] as Subject[],
    learningGoals: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * 온보딩 완료 여부 확인
 */
export async function isOnboardingComplete(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  return profile !== null && profile.gradeLevel !== undefined;
}

/**
 * 온보딩 데이터로 프로필 생성
 */
export async function createProfileFromOnboarding(
  userId: string,
  gradeLevel: GradeLevel,
  gradeLevelDetail: GradeLevelDetail,
  subjects: Subject[],
  learningGoals?: string[]
): Promise<UserProfile> {
  const profile: UserProfile = {
    userId,
    gradeLevel,
    gradeLevelDetail,
    subjects,
    learningGoals: learningGoals || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await saveUserProfile(profile);
  return profile;
}
