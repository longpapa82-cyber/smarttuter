'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/gamification/store';
import EmotionEnhancedChat from './EmotionEnhancedChat';

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
  const [isReady, setIsReady] = useState(false);

  const storeProfile = useUserStore((state) => state.profile);
  const profile = isMounted ? storeProfile : null;

  useEffect(() => {
    setIsMounted(true);
    // Give store a moment to hydrate, then proceed regardless
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isMounted && isReady && !profile) {
      router.push('/onboarding');
    }
  }, [isMounted, isReady, profile, router]);

  if (!isMounted || !isReady) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return <LoadingSpinner />;
  }

  return (
    <EmotionEnhancedChat
      subject="math"
      gradeLevel={profile.gradeLevel}
    />
  );
}
