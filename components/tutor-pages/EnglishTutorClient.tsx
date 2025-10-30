'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore, useUserStoreHydration } from '@/lib/gamification/store';
import VoiceTutorInterface from '@/components/voice-tutor/VoiceTutorInterface';

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  );
}

export default function EnglishTutorClient() {
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

  return (
    <VoiceTutorInterface
      subject="english"
      userId={`user-${profile.username}`}
      gradeLevel={profile.gradeLevel as 'elementary' | 'middle' | 'high' | 'university'}
    />
  );
}
