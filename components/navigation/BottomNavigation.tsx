'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, GraduationCap, LayoutDashboard, BarChart3, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { QuickSwitch } from './QuickSwitch'

export interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  route: string
  badge?: number
}

const navigationItems: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    route: '/',
  },
  {
    id: 'tutor',
    label: 'Tutor',
    icon: GraduationCap,
    route: '/tutor',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    route: '/dashboard',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    route: '/analytics',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    route: '/profile',
  },
]

export function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [showQuickSwitch, setShowQuickSwitch] = useState(false)
  const [currentSubject, setCurrentSubject] = useState<'math' | 'english' | null>(null)

  // Detect current subject from pathname
  useEffect(() => {
    if (pathname.includes('/tutor/math')) {
      setCurrentSubject('math')
    } else if (pathname.includes('/tutor/english')) {
      setCurrentSubject('english')
    } else {
      setCurrentSubject(null)
    }
  }, [pathname])

  const isActive = (item: NavItem) => {
    if (item.id === 'tutor') {
      return pathname.startsWith('/tutor')
    }
    return pathname === item.route
  }

  const handleNavClick = (item: NavItem) => {
    if (item.id === 'tutor') {
      // If already on tutor page, show quick switch
      if (pathname.startsWith('/tutor')) {
        setShowQuickSwitch(!showQuickSwitch)
      } else {
        // Navigate to last used tutor or default to math
        const lastSubject = currentSubject || 'math'
        router.push(`/tutor/${lastSubject}`)
      }
    } else {
      router.push(item.route)
      setShowQuickSwitch(false)
    }
  }

  const handleSubjectSwitch = (subject: 'math' | 'english') => {
    router.push(`/tutor/${subject}`)
    setShowQuickSwitch(false)
  }

  // Close quick switch when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-quick-switch]') && !target.closest('[data-tutor-nav]')) {
        setShowQuickSwitch(false)
      }
    }

    if (showQuickSwitch) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showQuickSwitch])

  return (
    <>
      {/* Quick Switch Menu */}
      {showQuickSwitch && (
        <QuickSwitch
          currentSubject={currentSubject}
          onSubjectSelect={handleSubjectSwitch}
          onSelectSubject={() => {
            router.push('/')
            setShowQuickSwitch(false)
          }}
        />
      )}

      {/* Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl safe-area-bottom"
        role="navigation"
        aria-label="Primary navigation"
      >
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center justify-around h-16 sm:h-18 md:h-20">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item)

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  data-tutor-nav={item.id === 'tutor' ? 'true' : undefined}
                  className={`
                    relative flex flex-col items-center justify-center
                    w-full h-full px-2 transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
                    ${
                      active
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }
                  `}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                >
                  {/* Active Indicator */}
                  {active && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-white" />
                  )}

                  {/* Icon */}
                  <Icon
                    className={`
                      w-6 h-6 mb-1 transition-transform duration-150
                      ${active ? 'scale-110' : 'group-hover:scale-105'}
                    `}
                    aria-hidden="true"
                  />

                  {/* Label */}
                  <span
                    className={`
                      text-xs transition-all duration-150
                      ${active ? 'font-semibold' : 'font-normal'}
                    `}
                  >
                    {item.label}
                  </span>

                  {/* Badge (for notifications) */}
                  {item.badge && item.badge > 0 && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Safe area padding for iOS devices */}
      <style jsx global>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }

        @supports (padding: max(0px)) {
          .safe-area-bottom {
            padding-bottom: max(16px, env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </>
  )
}
