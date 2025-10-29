'use client';

import dynamicImport from 'next/dynamic';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic';

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
    </div>
  );
}

// Dynamically import with SSR completely disabled
const MathTutorClient = dynamicImport(
  () => import('@/components/tutor-pages/MathTutorWithImage'),
  {
    ssr: false,
    loading: () => <LoadingSpinner />
  }
);

export default function MathTutorPage() {
  return (
    <ErrorBoundary>
      <MathTutorClient />
    </ErrorBoundary>
  );
}
