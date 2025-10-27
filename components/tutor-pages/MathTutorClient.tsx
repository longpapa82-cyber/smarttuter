'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/gamification/store';
import VoiceTutorInterface from '@/components/voice-tutor/VoiceTutorInterface';

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
  const profile = useUserStore((state) => state.profile);

  // Wait for hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !profile) {
      router.push('/onboarding');
    }
  }, [isHydrated, profile, router]);

  if (!isHydrated || !profile) {
    return <LoadingSpinner />;
  }

  return (
    <VoiceTutorInterface
      subject="math"
      userId={`user-${profile.username}`}
      gradeLevel={profile.gradeLevel as 'elementary' | 'middle' | 'high' | 'university'}
    />
  );
}
