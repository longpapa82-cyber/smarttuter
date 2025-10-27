'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useUserStore } from '@/lib/gamification/store';
import VoiceTutorInterface from '@/components/voice-tutor/VoiceTutorInterface';

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
    </div>
  );
}

function MathTutorContent() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for client-side hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Check profile only after hydration completes
  useEffect(() => {
    if (!isHydrated) return; // Skip during SSR and initial hydration

    if (!profile) {
      router.push('/onboarding');
    }
  }, [isHydrated, profile, router]);

  // Show loading during hydration OR when no profile
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

function ForceDynamic() {
  useSearchParams();
  return null;
}

export default function MathTutorPage() {
  return (
    <>
      <Suspense fallback={null}>
        <ForceDynamic />
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <MathTutorContent />
      </Suspense>
    </>
  );
}
