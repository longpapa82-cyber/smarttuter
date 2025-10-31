import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

interface MetricData {
  timestamp: number
  value: number
  tags?: Record<string, string>
}

/**
 * Monitoring Dashboard API
 * Provides aggregated metrics for real-time monitoring
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const timeRange = searchParams.get('range') || '1h' // 1h, 6h, 24h, 7d

  try {
    // Calculate time window
    const now = Date.now()
    const timeWindows: Record<string, number> = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
    }
    const windowMs = timeWindows[timeRange] || timeWindows['1h']
    const startTime = now - windowMs

    // Fetch metrics from Redis
    const [apiMetrics, cacheMetrics, learningMetrics, errorMetrics] = await Promise.all([
      getApiMetrics(startTime, now),
      getCacheMetrics(startTime, now),
      getLearningMetrics(startTime, now),
      getErrorMetrics(startTime, now),
    ])

    // Calculate aggregations
    const dashboard = {
      timeRange,
      startTime,
      endTime: now,
      metrics: {
        api: {
          totalRequests: apiMetrics.length,
          averageLatency: calculateAverage(apiMetrics.map((m) => m.value)),
          p95Latency: calculatePercentile(
            apiMetrics.map((m) => m.value),
            95
          ),
          p99Latency: calculatePercentile(
            apiMetrics.map((m) => m.value),
            99
          ),
          errorRate: calculateErrorRate(apiMetrics),
        },
        cache: {
          totalOperations: cacheMetrics.length,
          hitRate: calculateCacheHitRate(cacheMetrics),
          missRate: calculateCacheMissRate(cacheMetrics),
        },
        learning: {
          totalEvents: learningMetrics.length,
          mathEvents: learningMetrics.filter((m) => m.tags?.subject === 'math').length,
          englishEvents: learningMetrics.filter((m) => m.tags?.subject === 'english')
            .length,
          uniqueUsers: countUniqueUsers(learningMetrics),
        },
        errors: {
          totalErrors: errorMetrics.length,
          criticalErrors: errorMetrics.filter((m) => m.tags?.severity === 'critical')
            .length,
          highErrors: errorMetrics.filter((m) => m.tags?.severity === 'high').length,
          errorsByType: groupByType(errorMetrics),
        },
      },
      health: {
        status: determineHealthStatus(errorMetrics, apiMetrics),
        lastChecked: now,
      },
    }

    return NextResponse.json(dashboard, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Helper functions
async function getApiMetrics(startTime: number, endTime: number): Promise<MetricData[]> {
  if (!redis) return []

  try {
    const keys = await redis.keys('metric:api:*')
    const metrics: MetricData[] = []

    for (const key of keys.slice(0, 1000)) {
      // Limit to 1000 recent metrics
      const data = await redis.get(key)
      if (data && typeof data === 'object') {
        const metric = data as MetricData
        if (metric.timestamp >= startTime && metric.timestamp <= endTime) {
          metrics.push(metric)
        }
      }
    }

    return metrics
  } catch {
    return []
  }
}

async function getCacheMetrics(startTime: number, endTime: number): Promise<MetricData[]> {
  if (!redis) return []

  try {
    const keys = await redis.keys('metric:cache:*')
    const metrics: MetricData[] = []

    for (const key of keys.slice(0, 1000)) {
      const data = await redis.get(key)
      if (data && typeof data === 'object') {
        const metric = data as MetricData
        if (metric.timestamp >= startTime && metric.timestamp <= endTime) {
          metrics.push(metric)
        }
      }
    }

    return metrics
  } catch {
    return []
  }
}

async function getLearningMetrics(
  startTime: number,
  endTime: number
): Promise<MetricData[]> {
  if (!redis) return []

  try {
    const keys = await redis.keys('metric:learning:*')
    const metrics: MetricData[] = []

    for (const key of keys.slice(0, 1000)) {
      const data = await redis.get(key)
      if (data && typeof data === 'object') {
        const metric = data as MetricData
        if (metric.timestamp >= startTime && metric.timestamp <= endTime) {
          metrics.push(metric)
        }
      }
    }

    return metrics
  } catch {
    return []
  }
}

async function getErrorMetrics(startTime: number, endTime: number): Promise<MetricData[]> {
  if (!redis) return []

  try {
    const keys = await redis.keys('metric:error:*')
    const metrics: MetricData[] = []

    for (const key of keys.slice(0, 1000)) {
      const data = await redis.get(key)
      if (data && typeof data === 'object') {
        const metric = data as MetricData
        if (metric.timestamp >= startTime && metric.timestamp <= endTime) {
          metrics.push(metric)
        }
      }
    }

    return metrics
  } catch {
    return []
  }
}

function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.ceil((percentile / 100) * sorted.length) - 1
  return sorted[index] || 0
}

function calculateErrorRate(metrics: MetricData[]): number {
  if (metrics.length === 0) return 0
  const errors = metrics.filter((m) => m.tags?.status && Number(m.tags.status) >= 400)
  return (errors.length / metrics.length) * 100
}

function calculateCacheHitRate(metrics: MetricData[]): number {
  if (metrics.length === 0) return 0
  const hits = metrics.filter((m) => m.tags?.result === 'hit')
  return (hits.length / metrics.length) * 100
}

function calculateCacheMissRate(metrics: MetricData[]): number {
  return 100 - calculateCacheHitRate(metrics)
}

function countUniqueUsers(metrics: MetricData[]): number {
  const users = new Set(metrics.map((m) => m.tags?.userId).filter(Boolean))
  return users.size
}

function groupByType(metrics: MetricData[]): Record<string, number> {
  return metrics.reduce(
    (acc, m) => {
      const type = m.tags?.type || 'unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
}

function determineHealthStatus(
  errorMetrics: MetricData[],
  apiMetrics: MetricData[]
): 'healthy' | 'degraded' | 'down' {
  const criticalErrors = errorMetrics.filter((m) => m.tags?.severity === 'critical')
  const errorRate = calculateErrorRate(apiMetrics)

  if (criticalErrors.length > 0 || errorRate > 50) return 'down'
  if (errorRate > 10) return 'degraded'
  return 'healthy'
}
