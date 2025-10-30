import { NextRequest } from 'next/server';
import { getCacheStats } from '@/lib/cache/redis';

export async function GET(req: NextRequest) {
  try {
    const stats = await getCacheStats();

    return new Response(
      JSON.stringify(stats),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error getting cache stats:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to get cache stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
