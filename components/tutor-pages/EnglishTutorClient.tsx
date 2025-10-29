'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/gamification/store';
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
  const [isHydrated, setIsHydrated] = useState(false);
  const [profile, setProfile] = useState<ReturnType<typeof useUserStore.getState>['profile']>(null);

  // Wait for client-side mount to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Wait for Zustand automatic hydration (skipHydration is removed)
  useEffect(() => {
    if (!isMounted) return;

    // Zustand hydrates automatically, just subscribe to changes
    const unsubscribe = useUserStore.subscribe((state) => {
      setProfile(state.profile);
    });

    // Get initial profile value after automatic hydration
    setProfile(useUserStore.getState().profile);

    // Set hydration flag immediately
    setIsHydrated(true);

    return () => unsubscribe();
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

  return (
    <VoiceTutorInterface
      subject="english"
      userId={`user-${profile.username}`}
      gradeLevel={profile.gradeLevel as 'elementary' | 'middle' | 'high' | 'university'}
    />
  );
}
