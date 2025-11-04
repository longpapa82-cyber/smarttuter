/**
 * API Stats Endpoint
 * 캐시 통계 및 API 사용량 정보 제공
 */

import { NextRequest, NextResponse } from 'next/server';
import { responseCache } from '@/lib/cache/response-cache';
import { apiTracker } from '@/lib/cache/api-optimizer';

export async function GET(req: NextRequest) {
  try {
    const cacheStats = responseCache.getStats();
    const apiStats = apiTracker.getStats();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      cache: {
        size: responseCache.size(),
        totalRequests: cacheStats.totalRequests,
        cacheHits: cacheStats.cacheHits,
        cacheMisses: cacheStats.cacheMisses,
        hitRate: cacheStats.hitRate.toFixed(2) + '%',
        apiCallsSaved: cacheStats.apiCallsSaved,
      },
      api: {
        used24h: apiStats.last24h,
        used1h: apiStats.last1h,
        remaining: apiStats.remaining,
        limit: 50,
        resetTime: 'Daily at 09:00 KST',
      },
      optimization: {
        estimatedQueriesPerDay: Math.floor((50 * 4) / (1 - cacheStats.hitRate / 100)),
        effectiveMultiplier: (4 / (1 - Math.min(cacheStats.hitRate, 80) / 100)).toFixed(1) + 'x',
      }
    });
  } catch (error) {
    console.error('Failed to get stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve stats' },
      { status: 500 }
    );
  }
}
