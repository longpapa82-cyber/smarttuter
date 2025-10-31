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

/**
 * Health Check Endpoint
 * Used for monitoring, deployment validation, and automatic rollback triggers
 */
export async function GET() {
  const startTime = Date.now()
  const checks: Record<string, { status: 'ok' | 'error'; latency?: number; error?: string }> = {}

  // 1. Redis Connection Check
  if (redis) {
    try {
      const redisStart = Date.now()
      await redis.ping()
      checks.redis = {
        status: 'ok',
        latency: Date.now() - redisStart,
      }
    } catch (error) {
      checks.redis = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  } else {
    checks.redis = {
      status: 'error',
      error: 'Redis not configured',
    }
  }

  // 2. Environment Variables Check
  const requiredEnvVars = ['GEMINI_API_KEY', 'UPSTASH_REDIS_REST_URL']
  const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key])

  checks.environment = {
    status: missingEnvVars.length === 0 ? 'ok' : 'error',
    error: missingEnvVars.length > 0 ? `Missing: ${missingEnvVars.join(', ')}` : undefined,
  }

  // 3. API Keys Validation (without calling external APIs)
  checks.apiKeys = {
    status: process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 0 ? 'ok' : 'error',
    error: !process.env.GEMINI_API_KEY ? 'GEMINI_API_KEY not configured' : undefined,
  }

  // Overall health status
  const allOk = Object.values(checks).every((check) => check.status === 'ok')
  const totalLatency = Date.now() - startTime

  const response = {
    status: allOk ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local',
    environment: process.env.VERCEL_ENV || 'development',
    checks,
    performance: {
      totalLatency,
    },
  }

  return NextResponse.json(response, {
    status: allOk ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}
