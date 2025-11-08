'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

export const runtime = 'nodejs';

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
    </div>
  );
}

// Disable SSR for tutor client component
const ScienceTutorClient = dynamic(
  () => import('@/components/tutor-pages/ScienceTutorClient'),
  {
    ssr: false,
    loading: () => <LoadingSpinner />
  }
);

export default function ScienceTutorPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ScienceTutorClient />
    </Suspense>
  );
}
