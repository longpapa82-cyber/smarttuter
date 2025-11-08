'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

export const runtime = 'nodejs';

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
    </div>
  );
}

// Disable SSR for tutor client component
const SocialTutorClient = dynamic(
  () => import('@/components/tutor-pages/SocialTutorClient'),
  {
    ssr: false,
    loading: () => <LoadingSpinner />
  }
);

export default function SocialStudiesTutorPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SocialTutorClient />
    </Suspense>
  );
}
