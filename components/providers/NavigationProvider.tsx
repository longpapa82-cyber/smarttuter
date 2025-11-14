'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * NavigationProvider
 *
 * Simplified after UI/UX improvement:
 * - Bottom navigation bar removed
 * - All navigation consolidated into TopNavigation (in layout.tsx)
 * - Phase 2 of navigation improvement plan (2025-11-01)
 * - Scroll reset on route change (2025-11-14)
 */
export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Reset scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return <>{children}</>
}
