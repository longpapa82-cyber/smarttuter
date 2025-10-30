'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore, userStoreRehydrated } from '@/lib/gamification/store';
import MathTutorWithImage from './MathTutorWithImage';

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
    </div>
  );
}

export default function MathTutorClient() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [profile, setProfile] = useState<ReturnType<typeof useUserStore.getState>['profile']>(null);

  // Wait for client-side mount to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Wait for store hydration promise to resolve
  useEffect(() => {
    if (!isMounted) return;

    let mounted = true;

    // Wait for rehydration to complete
    userStoreRehydrated.then(() => {
      if (!mounted) return;

      // Get profile after rehydration is complete
      const currentProfile = useUserStore.getState().profile;
      setProfile(currentProfile);
      setIsHydrated(true);

      // Subscribe to future changes
      const unsubscribe = useUserStore.subscribe((state) => {
        if (mounted) {
          setProfile(state.profile);
        }
      });

      return () => {
        unsubscribe();
      };
    });

    return () => {
      mounted = false;
    };
  }, [isMounted]);

  // Redirect to onboarding if no profile after hydration
  useEffect(() => {
    if (isHydrated && !profile) {
      router.push('/onboarding');
    }
  }, [isHydrated, profile, router]);

  // Always show loading spinner until fully mounted and hydrated
  if (!isMounted || !isHydrated || !profile) {
    return <LoadingSpinner />;
  }

  return <MathTutorWithImage />;
}
