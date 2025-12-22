"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SimpleChatInterface from '@/components/tutor-pages/SimpleChatInterface';

export default function KoreanTutorPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ⚠️ AUTHENTICATION BYPASS: Always set guest user profile
    const guestProfile = {
      id: 'guest-user',
      name: '게스트',
      email: 'guest@aipark.com',
      schoolLevel: '초등학교',
      gradeLevel: null,
      gradeDetail: null,
    };

    setUserProfile(guestProfile);
    setIsLoading(false);
  }, []);

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
