/**
 * Server-only Error Tracking Wrapper
 * This file acts as a dynamic import boundary to prevent client bundling
 */

export async function captureServerError(
  error: Error,
  context: {
    path: string;
    method: string;
    userAgent: string;
    routePath: string;
    routeType: 'render' | 'route' | 'action' | 'middleware';
    renderSource: string;
    sessionId: string;
    userId?: string;
    revalidateReason?: 'on-demand' | 'stale';
    renderType?: 'dynamic' | 'dynamic-resume';
  }
): Promise<string> {
  // Only import and execute on server runtime
  if (typeof window === 'undefined' && process.env.NEXT_RUNTIME === 'nodejs') {
    // Use require to bypass webpack static analysis
    const { ErrorTracker } = require('./core');
    return ErrorTracker.captureError(error, context);
  }

  console.error('[ServerWrapper] Attempted to capture error in non-server environment');
  return 'error-tracking-unavailable';
}
