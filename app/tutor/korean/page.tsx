"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SimpleChatInterface from '@/components/tutor-pages/SimpleChatInterface';
import { TopNavigation } from '@/components/navigation/TopNavigation';

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <TopNavigation />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            📚 국어 튜터
          </h1>
          <p className="text-gray-600">
            읽기, 쓰기, 문법, 문학을 함께 공부해요
          </p>
        </div>

        {/* Chat Interface */}
        <SimpleChatInterface
          subject="korean"
          gradeLevel={userProfile.schoolLevel || '초등학교'}
          apiEndpoint="/api/chat/korean"
          placeholder="국어 관련 질문을 입력하세요... (예: 띄어쓰기가 뭐예요?, ㅏ와 ㅓ의 차이는?)"
          welcomeMessage={`안녕하세요! 국어 튜터입니다 📚

${userProfile.schoolLevel} ${userProfile.gradeLevelDetail}학년 수준에 맞춰서 설명해드려요.

**도와드릴 수 있는 것들:**
- 📖 한글 읽기와 쓰기 (자음, 모음, 받침)
- ✍️ 맞춤법과 띄어쓰기
- 📝 문법과 문장 성분
- 🎭 문학 작품 이해와 감상
- 💬 글쓰기 도움

궁금한 것을 물어보세요!`}
        />
      </main>
    </div>
  );
}
