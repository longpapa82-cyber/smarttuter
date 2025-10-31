/**
 * API Route Wrapper with Metrics Tracking
 * Automatically tracks performance and errors for API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { trackApiLatency, trackError } from './metrics'
import * as Sentry from '@sentry/nextjs'

export type ApiHandler = (
  request: NextRequest,
  context?: any
) => Promise<NextResponse> | NextResponse

export interface ApiWrapperOptions {
  name: string
  requireAuth?: boolean
  rateLimit?: {
    max: number
    windowMs: number
  }
}

/**
 * Wrap API route handler with automatic metrics tracking
 */
export function withMetrics(
  handler: ApiHandler,
  options: ApiWrapperOptions
): ApiHandler {
  return async (request: NextRequest, context?: any) => {
    const startTime = performance.now()
    const endpoint = options.name

    try {
      // Execute handler
      const response = await handler(request, context)

      // Track latency
      const latency = performance.now() - startTime
      trackApiLatency(endpoint, latency, response.status)

      // Track errors based on status code
      if (response.status >= 400) {
        const severity = response.status >= 500 ? 'high' : 'medium'
        trackError(`api.${endpoint}.http_${response.status}`, severity)
      }

      return response
    } catch (error) {
      // Track error
      const latency = performance.now() - startTime
      trackApiLatency(endpoint, latency, 500)
      trackError(`api.${endpoint}.exception`, 'critical')

      // Capture in Sentry
      Sentry.captureException(error, {
        tags: {
          endpoint,
          method: request.method,
        },
        contexts: {
          request: {
            url: request.url,
            method: request.method,
            headers: Object.fromEntries(request.headers.entries()),
          },
        },
      })

      // Return error response
      return NextResponse.json(
        {
          error: 'Internal server error',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Simple success response helper
 */
export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status })
}

/**
 * Simple error response helper
 */
export function errorResponse(
  message: string,
  status = 500,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
    },
    { status }
  )
}

/**
 * Validate request body against schema
 */
export async function validateBody<T>(
  request: NextRequest,
  validator: (body: any) => body is T
): Promise<{ valid: true; data: T } | { valid: false; error: string }> {
  try {
    const body = await request.json()

    if (validator(body)) {
      return { valid: true, data: body }
    }

    return { valid: false, error: 'Invalid request body format' }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to parse body',
    }
  }
}

/**
 * Rate limiting (simple in-memory implementation)
 * For production, use Redis-based rate limiting
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  // No record or expired window
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return {
      allowed: true,
      remaining: max - 1,
      resetTime: now + windowMs,
    }
  }

  // Within window, check limit
  if (record.count < max) {
    record.count++
    return {
      allowed: true,
      remaining: max - record.count,
      resetTime: record.resetTime,
    }
  }

  // Rate limit exceeded
  return {
    allowed: false,
    remaining: 0,
    resetTime: record.resetTime,
  }
}

/**
 * Get client IP from request
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}
