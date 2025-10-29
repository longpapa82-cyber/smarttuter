'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/gamification/store';
import MathTutorWithImage from './MathTutorWithImage';

export default function MathTutorClientSimple() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);

  // Redirect to onboarding if no profile
  useEffect(() => {
    if (profile === null) {
      console.log('[MathTutorClient] No profile, redirecting to onboarding');
      router.push('/onboarding');
    }
  }, [profile, router]);

  // Show nothing while profile is null (redirect happening)
  if (profile === null) {
    return null;
  }

  return <MathTutorWithImage />;
}
