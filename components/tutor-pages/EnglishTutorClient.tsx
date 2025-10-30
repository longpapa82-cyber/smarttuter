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

  return (
    <VoiceTutorInterface
      subject="english"
      userId={`user-${profile.username}`}
      gradeLevel={profile.gradeLevel as 'elementary' | 'middle' | 'high' | 'university'}
    />
  );
}
