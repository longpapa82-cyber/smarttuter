'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

export const runtime = 'edge';

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
    </div>
  );
}

// Completely disable SSR for this component
const SocialStudiesTutorClient = dynamic(
  () => import('@/components/tutor-pages/SocialStudiesTutorClient'),
  {
    ssr: false,
    loading: () => <LoadingSpinner />
  }
);

export default function SocialStudiesTutorPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SocialStudiesTutorClient />
    </Suspense>
  );
}
