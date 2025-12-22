/**
 * Authentication Hook
 * Provides authentication state and helper functions
 *
 * ⚠️ AUTHENTICATION TEMPORARILY DISABLED
 * All users are treated as authenticated (guest mode)
 */

'use client';

import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ⚠️ AUTHENTICATION BYPASS: Always return authenticated
  const isAuthenticated = true; // status === 'authenticated';
  const isLoading = false; // status === 'loading';
  const user = session?.user || { id: 'guest-user', name: '게스트', email: 'guest@aipark.com' };

  /**
   * Sign out and redirect to homepage
   */
  const signOut = useCallback(async () => {
    try {
      // Clear localStorage first
      if (typeof window !== 'undefined') {
        localStorage.removeItem('aipark_user_profile');
        localStorage.removeItem('onboarding_data');

        // Clear guest mode cookie
        document.cookie = 'aipark_guest_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }

      // Sign out from NextAuth (no redirect, we'll handle it manually)
      await nextAuthSignOut({
        redirect: false
      });

      // Force full page reload to clear all client-side state
      window.location.href = '/';
    } catch (error) {
      console.error('로그아웃 실패:', error);
      // Fallback: force redirect anyway
      window.location.href = '/';
    }
  }, []);

  /**
   * Require authentication - redirect to login if not authenticated
   * @param redirectTo - URL to redirect to if not authenticated (default: /login)
   *
   * ⚠️ AUTHENTICATION BYPASS: No-op function (authentication disabled)
   */
  const requireAuth = useCallback((redirectTo: string = '/login') => {
    // Do nothing (authentication disabled)

    /* ORIGINAL CODE (COMMENTED OUT)
    if (status === 'unauthenticated') {
      router.push(redirectTo);
    }
    */
  }, []);

  /**
   * Navigate to a protected route - redirect to login if not authenticated
   * @param path - Path to navigate to
   *
   * ⚠️ AUTHENTICATION BYPASS: Always navigate directly
   */
  const navigateProtected = useCallback((path: string) => {
    // Always navigate directly (authentication disabled)
    router.push(path);

    /* ORIGINAL CODE (COMMENTED OUT)
    if (isAuthenticated) {
      router.push(path);
    } else {
      // Save intended destination for redirect after login
      sessionStorage.setItem('redirectAfterLogin', path);
      router.push('/login');
    }
    */
  }, [router]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    status,

    // Actions
    signOut,
    requireAuth,
    navigateProtected,
  };
}
