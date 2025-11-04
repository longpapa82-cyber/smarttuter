'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

export const runtime = 'edge';

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  );
}

// Completely disable SSR for this component
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
