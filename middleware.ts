import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * Middleware for route protection
 * Protects authenticated routes and redirects unauthenticated users to login
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Bypass authentication for E2E tests
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true'
  const isE2ETest = request.headers.get('x-e2e-test') === 'true'

  if (bypassAuth || isE2ETest) {
    return NextResponse.next()
  }

  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Check for guest mode cookie
  const hasGuestProfile = request.cookies.get('aipark_guest_mode')?.value === 'true'

  // User is authenticated if they have either NextAuth token OR guest mode cookie
  const isAuthenticated = !!token || hasGuestProfile

  // Define routes that allow guest access (dashboard and tutor)
  const guestAllowedRoutes = [
    '/dashboard',
    '/tutor',
  ]

  // Define routes that strictly require authentication (no guest access)
  const strictAuthRoutes = [
    '/profile',
    '/analytics',
    '/onboarding',
  ]

  // Check if the current path requires strict authentication (no guest)
  const isStrictAuthRoute = strictAuthRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Check if the current path allows guest access
  const isGuestAllowedRoute = guestAllowedRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Define truly public routes that don't require authentication or redirection
  const trulyPublicRoutes = [
    '/onboarding/quick',  // Guest onboarding for 7-day trial
    '/',  // Homepage
  ]

  const isTrulyPublicRoute = trulyPublicRoutes.some(route =>
    pathname === route || pathname.startsWith(route)
  )

  // Allow truly public routes without any authentication check
  if (isTrulyPublicRoute) {
    return NextResponse.next()
  }

  // Redirect /onboarding to /onboarding/quick to prevent flash
  if (pathname === '/onboarding') {
    return NextResponse.redirect(new URL('/onboarding/quick', request.url))
  }

  // Define public routes that should redirect to dashboard if authenticated
  const publicRoutes = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ]

  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Redirect unauthenticated users trying to access strict auth routes
  // (profile, analytics require real authentication, not guest mode)
  if (isStrictAuthRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // For guest-allowed routes, redirect only if no authentication AND no guest cookie
  if (isGuestAllowedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users trying to access public auth pages
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Allow the request to proceed
  return NextResponse.next()
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
}
