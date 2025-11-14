'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/gamification/store';
import { useAuth } from '@/hooks/useAuth';
import EmotionEnhancedChat from './EmotionEnhancedChat';

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
    </div>
  );
}

export default function ScienceTutorClient() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const storeProfile = useUserStore((state) => state.profile);
  const profile = isMounted ? storeProfile : null;

  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Authentication check: redirect to login if not authenticated
  useEffect(() => {
    if (isMounted && isReady && !authLoading && !isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', '/tutor/science');
      router.push('/login');
    }
  }, [isMounted, isReady, authLoading, isAuthenticated, router]);

  // Profile check: redirect to onboarding if authenticated but no profile
  useEffect(() => {
    if (isMounted && isReady && !authLoading && isAuthenticated && !profile) {
      router.push('/onboarding');
    }
  }, [isMounted, isReady, authLoading, isAuthenticated, profile, router]);

  if (!isMounted || !isReady || authLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !profile) {
    return <LoadingSpinner />;
  }

  return (
    <EmotionEnhancedChat
      subject="science"
      gradeLevel={profile.gradeLevel}
    />
  );
}
