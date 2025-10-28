'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/gamification/store';
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

  // Properly handle Zustand hydration to avoid hydration mismatch
  useEffect(() => {
    if (!isMounted) return;

    // Wait for next tick to ensure store is ready
    const timer = setTimeout(() => {
      // Manually hydrate the Zustand store
      useUserStore.persist.rehydrate();

      // Subscribe to store changes
      const unsubscribe = useUserStore.subscribe((state) => {
        setProfile(state.profile);
      });

      // Get initial profile value
      setProfile(useUserStore.getState().profile);

      // Set hydration flag after profile is loaded
      setIsHydrated(true);

      return () => unsubscribe();
    }, 0);

    return () => clearTimeout(timer);
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
