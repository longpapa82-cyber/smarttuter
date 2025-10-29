'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/gamification/store';
import VoiceTutorInterface from '@/components/voice-tutor/VoiceTutorInterface';

export default function EnglishTutorClientSimple() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);

  // Redirect to onboarding if no profile
  useEffect(() => {
    if (profile === null) {
      console.log('[EnglishTutorClient] No profile, redirecting to onboarding');
      router.push('/onboarding');
    }
  }, [profile, router]);

  // Show nothing while profile is null (redirect happening)
  if (profile === null) {
    return null;
  }

  return (
    <VoiceTutorInterface
      subject="english"
      userId={`user-${profile.username}`}
      gradeLevel={profile.gradeLevel as 'elementary' | 'middle' | 'high' | 'university'}
    />
  );
}
