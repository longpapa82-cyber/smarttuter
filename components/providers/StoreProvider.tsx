'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/lib/gamification/store';
import { useAdaptiveLearning } from '@/lib/adaptive-learning/store';
import { useInteractiveLearning } from '@/lib/interactive-learning/store';
import { useVoiceTutor } from '@/lib/voice-tutor/store';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Manual rehydration of all persisted stores on client mount
    // This is required because we use skipHydration: true for SSR safety
    useUserStore.persist.rehydrate();
    useAdaptiveLearning.persist.rehydrate();
    useInteractiveLearning.persist.rehydrate();
    useVoiceTutor.persist.rehydrate();
  }, []);

  return <>{children}</>;
}
