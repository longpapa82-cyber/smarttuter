/**
 * Profile Synchronization Hook
 * Syncs user profile between server and localStorage
 */

'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { saveUserProfile } from '@/lib/user/user-profile';
import { fetchWithErrorHandling, getErrorMessage } from '@/lib/api/error-handler';
import type { UserProfile } from '@/types/user';

interface ProfileResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string | null;
    gradeLevel: string | null;
    preferredSubjects: string[] | null;
    createdAt: string;
    updatedAt: string;
  };
}

export function useProfileSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Only sync for authenticated users
    if (status !== 'authenticated' || !session?.user?.email) {
      return;
    }

    // Fetch profile from server
    const syncProfile = async () => {
      try {
        const data = await fetchWithErrorHandling<ProfileResponse>('/api/user/profile');

        if (data.success && data.user) {
          const serverUser = data.user;

          // Check if server has profile data
          if (serverUser.gradeLevel && serverUser.preferredSubjects) {
            // Create UserProfile format for localStorage
            const localProfile: UserProfile = {
              id: serverUser.id,
              nickname: serverUser.name || '사용자',
              email: serverUser.email,
              gradeLevel: serverUser.gradeLevel as 'elementary' | 'middle' | 'high' | 'university',
              preferredSubjects: serverUser.preferredSubjects as ('english' | 'math')[],
              createdAt: new Date(serverUser.createdAt),
              updatedAt: new Date(serverUser.updatedAt),
              provider: 'credentials',
            };

            // Save to localStorage
            saveUserProfile(localProfile);
            console.log('✅ Profile synced from server to localStorage');
          }
        }
      } catch (error) {
        // Log error but don't block the app
        const errorMessage = getErrorMessage(error);
        console.error('Profile sync error:', errorMessage);

        // Silently fail - profile sync is not critical for app functionality
        // User can still use the app with localStorage data or create new profile
      }
    };

    syncProfile();
  }, [session, status]);
}
