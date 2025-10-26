'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/gamification/store';
import VoiceTutorInterface from '@/components/voice-tutor/VoiceTutorInterface';

export default function EnglishTutorPage() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if user has profile
    if (!profile) {
      router.push('/onboarding');
      return;
    }

    setIsReady(true);
  }, [profile, router]);

  if (!isReady || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <VoiceTutorInterface
      subject="english"
      userId={`user-${profile.username}`}
      gradeLevel={profile.gradeLevel as 'elementary' | 'middle' | 'high' | 'university'}
    />
  );
}
