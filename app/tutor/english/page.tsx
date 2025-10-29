'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  );
}

// Dynamically import with SSR disabled - this prevents hydration errors
const EnglishTutorClient = dynamic(
  () => import('@/components/tutor-pages/EnglishTutorClientSimple'),
  {
    ssr: false,
    loading: () => <LoadingSpinner />
  }
);

export default function EnglishTutorPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <LoadingSpinner />;
  }

  return <EnglishTutorClient />;
}
