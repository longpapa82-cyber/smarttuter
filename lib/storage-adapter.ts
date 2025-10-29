// SSR-safe storage adapter for Zustand persist middleware
// Prevents hydration mismatches by ensuring consistent behavior

import { StateStorage } from 'zustand/middleware';

/**
 * Creates an SSR-safe storage adapter that:
 * 1. Returns null during SSR (server-side)
 * 2. Uses localStorage only on client-side
 * 3. Prevents hydration mismatches
 */
export function createSSRSafeStorage(): StateStorage {
  return {
    getItem: (name: string): string | null => {
      // During SSR, always return null
      if (typeof window === 'undefined') {
        return null;
      }

      try {
        const value = localStorage.getItem(name);
        return value;
      } catch (error) {
        console.warn(`Error reading from localStorage for key "${name}":`, error);
        return null;
      }
    },

    setItem: (name: string, value: string): void => {
      // Skip during SSR
      if (typeof window === 'undefined') {
        return;
      }

      try {
        localStorage.setItem(name, value);
      } catch (error) {
        console.warn(`Error writing to localStorage for key "${name}":`, error);
      }
    },

    removeItem: (name: string): void => {
      // Skip during SSR
      if (typeof window === 'undefined') {
        return;
      }

      try {
        localStorage.removeItem(name);
      } catch (error) {
        console.warn(`Error removing from localStorage for key "${name}":`, error);
      }
    },
  };
}

/**
 * No-op storage for testing or SSR-only scenarios
 */
export const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};
