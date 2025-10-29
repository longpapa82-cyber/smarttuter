'use client';

import dynamic from 'next/dynamic';

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  );
}

// Dynamically import with SSR completely disabled
const EnglishTutorClient = dynamic(
  () => import('@/components/voice-tutor/VoiceTutorInterface').then(mod => {
    // Wrapper component to pass props
    return function EnglishTutorWrapper() {
      return mod.default({
        subject: "english" as const,
        userId: "user-default",
        gradeLevel: "elementary" as const
      });
    };
  }),
  {
    ssr: false,
    loading: () => <LoadingSpinner />
  }
);

export default function EnglishTutorPage() {
  return <EnglishTutorClient />;
}
