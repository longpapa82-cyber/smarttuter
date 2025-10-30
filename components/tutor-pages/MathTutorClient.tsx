'use client';

import { useEffect } from 'react';
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
  const hydrated = useUserStoreHydration();
  const profile = useUserStore((state) => state.profile);

  // Redirect to onboarding if no profile after hydration
  useEffect(() => {
    if (hydrated && !profile) {
      router.push('/onboarding');
    }
  }, [hydrated, profile, router]);

  // Show loading spinner until hydrated and profile is available
  if (!hydrated || !profile) {
    return <LoadingSpinner />;
  }

  return <MathTutorWithImage />;
}
