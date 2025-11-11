/**
 * API Route: Track Client-side Errors
 * POST /api/errors/track
 */

import { NextRequest, NextResponse } from 'next/server';
import { ErrorTracker } from '@/lib/error-tracking';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      message,
      stack,
      pathname,
      digest,
      componentStack,
      userAgent,
      timestamp,
    } = body;

    // Create Error object from client data
    const error = new Error(message);
    error.name = name || 'ClientError';
    error.stack = stack || '';

    // Track the error
    const errorId = await ErrorTracker.captureError(error, {
      path: pathname || '/unknown',
      method: 'CLIENT',
      userAgent: userAgent || request.headers.get('user-agent') || 'unknown',
      routePath: pathname || '/unknown',
      routeType: 'render',
      renderSource: 'react-server-components',
      sessionId: request.cookies.get('sessionId')?.value || 'anonymous',
      userId: undefined,
    });

    return NextResponse.json({
      success: true,
      errorId
    });
  } catch (error) {
    console.error('[API] Failed to track error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track error' },
      { status: 500 }
    );
  }
}
