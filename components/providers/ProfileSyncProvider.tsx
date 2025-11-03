/**
 * Profile Sync Provider
 * Automatically syncs user profile from server to localStorage on login
 */

'use client';

import { useProfileSync } from '@/hooks/useProfileSync';

export function ProfileSyncProvider({ children }: { children: React.ReactNode }) {
  useProfileSync();
  return <>{children}</>;
}
