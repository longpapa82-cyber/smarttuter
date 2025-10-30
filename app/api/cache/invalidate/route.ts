import { NextRequest } from 'next/server';
import { invalidateCachePattern } from '@/lib/cache/redis';

export async function POST(req: NextRequest) {
  try {
    const { pattern } = await req.json();

    if (!pattern) {
      return new Response(
        JSON.stringify({ error: 'Pattern is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const deletedCount = await invalidateCachePattern(pattern);

    return new Response(
      JSON.stringify({
        success: true,
        deletedCount,
        message: `Invalidated ${deletedCount} cache entries matching pattern: ${pattern}`,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error invalidating cache:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to invalidate cache',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
