/**
 * Performance Metrics Collection
 * Tracks custom application metrics for monitoring
 */

import * as Sentry from '@sentry/nextjs'

export type MetricType = 'counter' | 'gauge' | 'histogram' | 'distribution'

export interface MetricOptions {
  unit?: string
  tags?: Record<string, string>
}

/**
 * Track custom metric
 */
export function trackMetric(
  name: string,
  value: number,
  type: MetricType = 'counter',
  options?: MetricOptions
) {
  // Capture as breadcrumb in Sentry
  Sentry.addBreadcrumb({
    category: 'metric',
    message: `${name}: ${value}${options?.unit || ''}`,
    level: 'info',
    data: {
      name,
      value,
      type,
      ...options?.tags,
    },
  })

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Metric] ${name}: ${value}${options?.unit || ''}`, options?.tags)
  }
}

/**
 * Track API response time
 */
export function trackApiLatency(endpoint: string, latency: number, status: number) {
  trackMetric('api.latency', latency, 'histogram', {
    unit: 'millisecond',
    tags: {
      endpoint,
      status: String(status),
    },
  })
}

/**
 * Track Redis cache hit/miss
 */
export function trackCacheHit(hit: boolean, operation: string) {
  trackMetric('redis.cache', 1, 'counter', {
    tags: {
      result: hit ? 'hit' : 'miss',
      operation,
    },
  })
}

/**
 * Track learning event
 */
export function trackLearningEvent(
  subject: 'math' | 'english',
  eventType: 'question' | 'hint' | 'answer',
  userId: string
) {
  trackMetric('learning.event', 1, 'counter', {
    tags: {
      subject,
      eventType,
      userId: userId.slice(0, 8), // Anonymize
    },
  })
}

/**
 * Track user session duration
 */
export function trackSessionDuration(subject: 'math' | 'english', duration: number) {
  trackMetric('session.duration', duration, 'histogram', {
    unit: 'second',
    tags: {
      subject,
    },
  })
}

/**
 * Track error rate
 */
export function trackError(
  errorType: string,
  severity: 'low' | 'medium' | 'high' | 'critical'
) {
  trackMetric('error.count', 1, 'counter', {
    tags: {
      type: errorType,
      severity,
    },
  })

  // Also capture in Sentry
  Sentry.captureMessage(`Error: ${errorType}`, {
    level: severity === 'critical' ? 'error' : 'warning',
    tags: {
      errorType,
      severity,
    },
  })
}

/**
 * Track web vitals
 */
export function trackWebVital(metric: {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
}) {
  trackMetric(`webvital.${metric.name.toLowerCase()}`, metric.value, 'distribution', {
    unit: 'millisecond',
    tags: {
      rating: metric.rating,
    },
  })
}

/**
 * Track business metrics
 */
export function trackBusinessMetric(
  metricName: string,
  value: number,
  tags?: Record<string, string>
) {
  trackMetric(`business.${metricName}`, value, 'gauge', {
    tags,
  })
}

/**
 * Performance monitoring decorator
 */
export function withMetrics<T extends (...args: any[]) => any>(
  fn: T,
  metricName: string
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    const start = performance.now()

    try {
      const result = fn(...args)

      // Handle async functions
      if (result instanceof Promise) {
        return result
          .then((value) => {
            trackMetric(metricName, performance.now() - start, 'histogram', {
              unit: 'millisecond',
              tags: { status: 'success' },
            })
            return value
          })
          .catch((error) => {
            trackMetric(metricName, performance.now() - start, 'histogram', {
              unit: 'millisecond',
              tags: { status: 'error' },
            })
            throw error
          }) as ReturnType<T>
      }

      // Handle sync functions
      trackMetric(metricName, performance.now() - start, 'histogram', {
        unit: 'millisecond',
        tags: { status: 'success' },
      })

      return result
    } catch (error) {
      trackMetric(metricName, performance.now() - start, 'histogram', {
        unit: 'millisecond',
        tags: { status: 'error' },
      })
      throw error
    }
  }) as T
}
