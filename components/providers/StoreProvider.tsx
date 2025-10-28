'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/lib/gamification/store';
import { useAdaptiveLearning } from '@/lib/adaptive-learning/store';
import { useInteractiveLearning } from '@/lib/interactive-learning/store';
import { useVoiceTutor } from '@/lib/voice-tutor/store';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Manual rehydration of all persisted stores on client mount
    // This is required because we use skipHydration: true for SSR safety
    useUserStore.persist.rehydrate();
    useAdaptiveLearning.persist.rehydrate();
    useInteractiveLearning.persist.rehydrate();
    useVoiceTutor.persist.rehydrate();

    // Mark as hydrated after stores are ready
    setIsHydrated(true);
  }, []);

  // Don't render children until stores are hydrated
  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}
