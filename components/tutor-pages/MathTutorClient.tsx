'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore, useUserStoreHydration } from '@/lib/gamification/store';
import SimpleChatInterface from './SimpleChatInterface';

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
    </div>
  );
}

export default function MathTutorClient() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const hydrated = useUserStoreHydration();

  const storeProfile = useUserStore((state) => state.profile);
  const profile = isMounted ? storeProfile : null;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && hydrated && !profile) {
      router.push('/onboarding');
    }
  }, [isMounted, hydrated, profile, router]);

  if (!isMounted || !hydrated) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return <LoadingSpinner />;
  }

  return (
    <SimpleChatInterface
      subject="math"
      gradeLevel={profile.gradeLevel}
    />
  );
}
