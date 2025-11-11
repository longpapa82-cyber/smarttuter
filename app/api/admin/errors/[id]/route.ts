import { NextRequest, NextResponse } from 'next/server';
import { ErrorTracker } from '@/lib/error-tracking';

/**
 * GET /api/admin/errors/[id] - Get single error details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const error = await ErrorTracker.getError(id);

    if (!error) {
      return NextResponse.json(
        { success: false, error: 'Error not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      error,
    });
  } catch (error) {
    console.error('[Admin API] Failed to get error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch error details' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/errors/[id] - Delete error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await ErrorTracker.deleteError(id);

    return NextResponse.json({
      success: true,
      message: 'Error deleted successfully',
    });
  } catch (error) {
    console.error('[Admin API] Failed to delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/errors/[id] - Update error (resolve/unresolve)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { resolved, resolvedBy, notes } = body;

    if (resolved === true) {
      await ErrorTracker.resolveError(id, resolvedBy || 'admin', notes);
    } else if (resolved === false) {
      await ErrorTracker.unresolveError(id);
    }

    return NextResponse.json({
      success: true,
      message: 'Error updated successfully',
    });
  } catch (error) {
    console.error('[Admin API] Failed to update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update error' },
      { status: 500 }
    );
  }
}
