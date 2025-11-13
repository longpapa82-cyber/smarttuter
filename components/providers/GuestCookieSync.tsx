'use client';

import { useEffect } from 'react';
import { getGuestProfile } from '@/lib/user/guest-profile';

/**
 * Client component that syncs guest mode cookie on mount
 * This ensures existing guest users get the cookie set properly
 */
export function GuestCookieSync() {
  useEffect(() => {
    // Call getGuestProfile which will automatically sync the cookie if needed
    getGuestProfile();
  }, []);

  return null; // This component renders nothing
}
