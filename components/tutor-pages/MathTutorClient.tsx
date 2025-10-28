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
  const [isHydrated, setIsHydrated] = useState(false);
  const [profile, setProfile] = useState<ReturnType<typeof useUserStore.getState>['profile']>(null);

  // Properly handle Zustand hydration to avoid hydration mismatch
  useEffect(() => {
    // Manually hydrate the Zustand store
    useUserStore.persist.rehydrate();

    // Set hydration flag and get profile after rehydration
    setIsHydrated(true);

    // Subscribe to store changes
    const unsubscribe = useUserStore.subscribe((state) => {
      setProfile(state.profile);
    });

    // Get initial profile value
    setProfile(useUserStore.getState().profile);

    return () => unsubscribe();
  }, []);

  // Redirect to onboarding if no profile after hydration
  useEffect(() => {
    if (isHydrated && !profile) {
      router.push('/onboarding');
    }
  }, [isHydrated, profile, router]);

  // Always show loading spinner until hydration is complete
  if (!isHydrated || !profile) {
    return <LoadingSpinner />;
  }

  return <MathTutorWithImage />;
}
