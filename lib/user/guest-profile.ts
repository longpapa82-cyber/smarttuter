/**
 * Guest Profile Management System
 *
 * Provides temporary profile management for users who want to try the service
 * without creating an account. Guest data is stored in localStorage.
 */

export interface GuestProfile {
  id: string;
  gradeLevel: string; // e.g., "초등학교 3학년", "중학교 1학년"
  subjects: string[]; // Selected subjects to try
  createdAt: number; // Timestamp
  lastActive: number; // Timestamp
  sessionCount: number; // Number of learning sessions
}

const GUEST_PROFILE_KEY = 'aipark_guest_profile';
const GUEST_SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Create a new guest profile
 */
export function createGuestProfile(gradeLevel: string, subjects: string[]): GuestProfile {
  const profile: GuestProfile = {
    id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    gradeLevel,
    subjects,
    createdAt: Date.now(),
    lastActive: Date.now(),
    sessionCount: 0,
  };

  // Save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profile));
    console.log('✅ Guest profile created:', profile.id);
  }

  return profile;
}

/**
 * Get current guest profile from localStorage
 */
export function getGuestProfile(): GuestProfile | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(GUEST_PROFILE_KEY);
    if (!stored) return null;

    const profile: GuestProfile = JSON.parse(stored);

    // Check if profile is expired (7 days)
    const age = Date.now() - profile.createdAt;
    if (age > GUEST_SESSION_DURATION) {
      console.log('⚠️ Guest profile expired, clearing...');
      clearGuestProfile();
      return null;
    }

    return profile;
  } catch (error) {
    console.error('❌ Error loading guest profile:', error);
    return null;
  }
}

/**
 * Update guest profile activity
 */
export function updateGuestActivity(): void {
  const profile = getGuestProfile();
  if (!profile) return;

  profile.lastActive = Date.now();
  profile.sessionCount += 1;

  if (typeof window !== 'undefined') {
    localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profile));
    console.log('✅ Guest activity updated:', profile.sessionCount, 'sessions');
  }
}

/**
 * Check if user is a guest
 */
export function isGuest(): boolean {
  return getGuestProfile() !== null;
}

/**
 * Clear guest profile (used when user signs up)
 */
export function clearGuestProfile(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(GUEST_PROFILE_KEY);
    console.log('✅ Guest profile cleared');
  }
}

/**
 * Get guest profile age in days
 */
export function getGuestProfileAge(): number {
  const profile = getGuestProfile();
  if (!profile) return 0;

  const ageMs = Date.now() - profile.createdAt;
  return Math.floor(ageMs / (24 * 60 * 60 * 1000));
}

/**
 * Check if guest should be prompted to sign up
 * Returns true after 3 sessions or 2 days
 */
export function shouldPromptSignup(): boolean {
  const profile = getGuestProfile();
  if (!profile) return false;

  const sessionThreshold = 3;
  const ageThresholdDays = 2;

  return (
    profile.sessionCount >= sessionThreshold ||
    getGuestProfileAge() >= ageThresholdDays
  );
}

/**
 * Get formatted grade level for display
 */
export function getFormattedGradeLevel(gradeLevel: string): string {
  // Extract school type and grade
  const match = gradeLevel.match(/(초등학교|중학교|고등학교|대학교)\s*(\d+)?/);
  if (!match) return gradeLevel;

  const schoolType = match[1];
  const grade = match[2];

  // Map to short form
  const schoolTypeMap: Record<string, string> = {
    '초등학교': '초등',
    '중학교': '중등',
    '고등학교': '고등',
    '대학교': '대학',
  };

  const shortType = schoolTypeMap[schoolType] || schoolType;
  return grade ? `${shortType} ${grade}학년` : shortType;
}

/**
 * Convert guest data to user profile format
 * Used when guest converts to registered user
 */
export function convertGuestToUserData(guestProfile: GuestProfile) {
  return {
    gradeLevel: guestProfile.gradeLevel,
    subjects: guestProfile.subjects,
    sessionCount: guestProfile.sessionCount,
    accountAge: getGuestProfileAge(),
  };
}
