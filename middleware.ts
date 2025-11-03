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

  const isAuthenticated = !!token

  // Define protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/analytics',
    '/tutor',
  ]

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

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

  // Redirect unauthenticated users trying to access protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    // Save the intended destination for redirect after login
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
