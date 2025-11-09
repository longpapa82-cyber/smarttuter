"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SimpleChatInterface from '@/components/tutor-pages/SimpleChatInterface';

export default function KoreanTutorPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (!response.ok) {
          router.push('/login');
          return;
        }

        const session = await response.json();
        if (!session || !session.user) {
          router.push('/login');
          return;
        }

        setUserProfile(session.user);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">국어 튜터를 준비하고 있어요...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  return (
    <SimpleChatInterface
      subject="korean"
      gradeLevel={userProfile.schoolLevel || '초등학교'}
    />
  );
}
