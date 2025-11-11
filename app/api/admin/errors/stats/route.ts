import { NextResponse } from 'next/server';
import { ErrorTracker } from '@/lib/error-tracking';

/**
 * GET /api/admin/errors/stats - Get error statistics
 */
export async function GET() {
  try {
    const stats = await ErrorTracker.getStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('[Admin API] Failed to get error stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch error statistics' },
      { status: 500 }
    );
  }
}
