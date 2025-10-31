'use client'

import { usePathname } from 'next/navigation'
import { BottomNavigation } from '@/components/navigation/BottomNavigation'

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Routes where navigation should NOT be shown
  const hideNavigationRoutes = [
    '/onboarding',
    '/login',
    '/signup',
    '/monitoring', // Admin/monitoring pages
  ]

  const shouldShowNavigation = !hideNavigationRoutes.some((route) =>
    pathname.startsWith(route)
  )

  return (
    <>
      {children}
      {shouldShowNavigation && <BottomNavigation />}
    </>
  )
}
