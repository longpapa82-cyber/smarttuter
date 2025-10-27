'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
    </div>
  );
}

// Dynamically import with SSR disabled - this prevents hydration errors
const MathTutorClient = dynamic(
  () => import('@/components/tutor-pages/MathTutorClient'),
  {
    ssr: false,
    loading: () => <LoadingSpinner />
  }
);

export default function MathTutorPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <LoadingSpinner />;
  }

  return <MathTutorClient />;
}
