// ⚠️ COMPONENT TEMPORARILY DISABLED
// This component causes hydration errors in production
// Temporarily returning a simple fallback
// Original code backed up in VoiceTutorInterface.tsx.backup

'use client';

import { TutorSubject } from '@/lib/voice-tutor/types';

interface VoiceTutorInterfaceProps {
  subject: TutorSubject;
  userId: string;
  gradeLevel: 'elementary' | 'middle' | 'high' | 'university';
}

export default function VoiceTutorInterface({
  subject,
  userId,
  gradeLevel,
}: VoiceTutorInterfaceProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-6">🔧</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          서비스 점검 중
        </h2>
        <p className="text-gray-600 mb-4">
          {subject === 'english' ? '영어' : '수학'} 튜터 서비스는 현재 점검 중입니다.
        </p>
        <p className="text-sm text-gray-500">
          불편을 드려 죄송합니다. 다른 학습 기능을 이용해주세요.
        </p>
      </div>
    </div>
  );
}
