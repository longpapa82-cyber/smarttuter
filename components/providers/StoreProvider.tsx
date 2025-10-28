'use client';

// StoreProvider is now a simple pass-through component
// Zustand handles hydration automatically without skipHydration
export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
