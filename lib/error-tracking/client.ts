/**
 * Error Tracking System - Client-side Helper
 *
 * This module provides client-side error tracking functionality
 * by sending errors to the server-side API.
 */

export interface ClientErrorContext {
  pathname?: string;
  digest?: string;
  componentStack?: string;
}

/**
 * Capture error from client-side and send to server API
 */
export async function captureClientError(
  error: Error,
  context: ClientErrorContext = {}
): Promise<void> {
  try {
    const response = await fetch('/api/errors/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: error.name,
        message: error.message,
        stack: error.stack,
        pathname: context.pathname || window.location.pathname,
        digest: context.digest,
        componentStack: context.componentStack,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      }),
    });

    if (!response.ok) {
      console.error('[ClientErrorTracker] Failed to send error:', response.statusText);
    }
  } catch (err) {
    // Fail silently to not disrupt user experience
    console.error('[ClientErrorTracker] Failed to track error:', err);
  }
}
