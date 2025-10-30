'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore, useUserStoreHydration } from '@/lib/gamification/store';
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
  const hydrated = useUserStoreHydration();

  // Always call the hook, but only use the value if mounted
  const storeProfile = useUserStore((state) => state.profile);
  const profile = isMounted ? storeProfile : null;

  // Set mounted flag
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect to onboarding if no profile after hydration
  useEffect(() => {
    if (isMounted && hydrated && !profile) {
      router.push('/onboarding');
    }
  }, [isMounted, hydrated, profile, router]);

  // Show loading spinner until mounted, hydrated and profile is available
  if (!isMounted || !hydrated || !profile) {
    return <LoadingSpinner />;
  }

  return <MathTutorWithImage />;
}
