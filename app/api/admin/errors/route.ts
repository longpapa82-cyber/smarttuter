import { NextRequest, NextResponse } from 'next/server';
import { ErrorTracker } from '@/lib/error-tracking';

/**
 * GET /api/admin/errors - Get error list with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.url ? new URL(request.url) : { searchParams: new URLSearchParams() };

    const severity = searchParams.get('severity') as 'critical' | 'error' | 'warning' | 'info' | null;
    const resolved = searchParams.get('resolved') === 'true' ? true : searchParams.get('resolved') === 'false' ? false : undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const errors = await ErrorTracker.getRecentErrors(limit);

    // Apply filters
    let filteredErrors = errors;
    if (severity) {
      filteredErrors = filteredErrors.filter(e => e.severity === severity);
    }
    if (resolved !== undefined) {
      filteredErrors = filteredErrors.filter(e => e.resolved === resolved);
    }

    // Apply pagination
    const paginatedErrors = filteredErrors.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      errors: paginatedErrors,
      total: filteredErrors.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[Admin API] Failed to get errors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch errors' },
      { status: 500 }
    );
  }
}
