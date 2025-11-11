/**
 * Error Tracking System - Redis Operations
 * @module server-only
 */

import 'server-only';
import { Redis } from '@upstash/redis';
import type { ErrorRecord, ErrorStats, ErrorListQuery } from './types';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Redis Key Generators
const KEYS = {
  error: (id: string) => `errors:${id}`,
  errorList: () => 'errors:list',
  errorCount: () => 'errors:count',
  errorStats: (date: string) => `errors:stats:${date}`,
  errorFingerprint: (fingerprint: string) => `errors:fingerprint:${fingerprint}`,
  errorTimeline: (severity: string) => `errors:timeline:${severity}`,
  alertSent: (fingerprint: string) => `alert:sent:${fingerprint}`,
};

/**
 * Save error record to Redis
 */
export async function saveError(error: ErrorRecord): Promise<void> {
  const dateKey = error.timestamp ? new Date(error.timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

  // Filter out null/undefined values for Upstash Redis compatibility
  const cleanedError = Object.fromEntries(
    Object.entries(error).filter(([_, value]) => value !== null && value !== undefined)
  );

  await redis.pipeline()
    // Store error details
    .hset(KEYS.error(error.id), cleanedError as any)

    // Add to sorted list (by timestamp)
    .zadd(KEYS.errorList(), { score: error.timestamp, member: error.id })

    // Map fingerprint to error ID
    .sadd(KEYS.errorFingerprint(error.fingerprint), error.id)

    // Increment total count
    .incr(KEYS.errorCount())

    // Update daily statistics
    .hincrby(KEYS.errorStats(dateKey), error.severity, 1)

    // Add to severity timeline
    .zadd(KEYS.errorTimeline(error.severity), { score: error.timestamp, member: error.id })

    // Set TTL: 30 days
    .expire(KEYS.error(error.id), 30 * 24 * 60 * 60)

    .exec();
}

/**
 * Get error by ID
 */
export async function getError(errorId: string): Promise<ErrorRecord | null> {
  const error = await redis.hgetall<ErrorRecord>(KEYS.error(errorId));
  return error || null;
}

/**
 * Get recent errors with filtering and pagination
 */
export async function getRecentErrors(query: ErrorListQuery = {}): Promise<ErrorRecord[]> {
  const {
    severity,
    resolved,
    limit = 50,
    offset = 0,
    sortOrder = 'desc',
  } = query;

  // Get error IDs from sorted list
  const errorIds = sortOrder === 'desc'
    ? await redis.zrange<string[]>(KEYS.errorList(), offset, offset + limit - 1, { rev: true })
    : await redis.zrange<string[]>(KEYS.errorList(), offset, offset + limit - 1);

  if (!errorIds || errorIds.length === 0) return [];

  // Fetch error details in parallel
  const errors = await Promise.all(
    errorIds.map(id => redis.hgetall<ErrorRecord>(KEYS.error(id)))
  );

  // Filter out null results and apply filters
  let filteredErrors = errors.filter((e): e is ErrorRecord => e !== null);

  if (severity) {
    filteredErrors = filteredErrors.filter(e => e.severity === severity);
  }

  if (resolved !== undefined) {
    filteredErrors = filteredErrors.filter(e => e.resolved === resolved);
  }

  return filteredErrors;
}

/**
 * Get error IDs by fingerprint
 */
export async function getErrorsByFingerprint(fingerprint: string): Promise<string[]> {
  const errorIds = await redis.smembers<string[]>(KEYS.errorFingerprint(fingerprint));
  return errorIds || [];
}

/**
 * Increment error count (for duplicates)
 */
export async function incrementErrorCount(errorId: string): Promise<void> {
  await redis.pipeline()
    .hincrby(KEYS.error(errorId), 'count', 1)
    .hset(KEYS.error(errorId), { lastSeen: Date.now() })
    .exec();
}

/**
 * Get error statistics
 */
export async function getErrorStats(): Promise<ErrorStats> {
  const now = Date.now();
  const last24Hours = now - 24 * 60 * 60 * 1000;
  const last7Days = now - 7 * 24 * 60 * 60 * 1000;
  const last30Days = now - 30 * 24 * 60 * 60 * 1000;

  // Get total count
  const total = await redis.get<number>(KEYS.errorCount()) || 0;

  // Get today's stats
  const today = new Date().toISOString().split('T')[0];
  const todayStats = await redis.hgetall<Record<string, string>>(KEYS.errorStats(today)) || {};

  // Get counts by severity
  const bySeverity = {
    critical: parseInt(todayStats.critical || '0', 10),
    error: parseInt(todayStats.error || '0', 10),
    warning: parseInt(todayStats.warning || '0', 10),
    info: parseInt(todayStats.info || '0', 10),
  };

  // Get errors in time ranges
  const [last24HoursCount, last7DaysCount, last30DaysCount] = await Promise.all([
    redis.zcount(KEYS.errorList(), last24Hours, now),
    redis.zcount(KEYS.errorList(), last7Days, now),
    redis.zcount(KEYS.errorList(), last30Days, now),
  ]);

  // Get resolved/unresolved counts (need to fetch and count)
  const recentErrors = await getRecentErrors({ limit: 1000 });
  const resolved = recentErrors.filter(e => e.resolved).length;
  const unresolved = recentErrors.filter(e => !e.resolved).length;

  // Get error counts by route
  const byRoute: Record<string, number> = {};
  recentErrors.forEach(error => {
    byRoute[error.routePath] = (byRoute[error.routePath] || 0) + 1;
  });

  return {
    total,
    resolved,
    unresolved,
    bySeverity,
    byRoute,
    last24Hours: last24HoursCount || 0,
    last7Days: last7DaysCount || 0,
    last30Days: last30DaysCount || 0,
  };
}

/**
 * Mark error as resolved
 */
export async function resolveError(
  errorId: string,
  resolvedBy: string,
  notes?: string
): Promise<void> {
  await redis.hset(KEYS.error(errorId), {
    resolved: true,
    resolvedAt: Date.now(),
    resolvedBy,
    notes: notes || '',
  });
}

/**
 * Mark error as unresolved
 */
export async function unresolveError(errorId: string): Promise<void> {
  await redis.hdel(KEYS.error(errorId), 'resolvedAt', 'resolvedBy', 'notes');
  await redis.hset(KEYS.error(errorId), { resolved: false });
}

/**
 * Delete error
 */
export async function deleteError(errorId: string): Promise<void> {
  const error = await getError(errorId);
  if (!error) return;

  await redis.pipeline()
    .del(KEYS.error(errorId))
    .zrem(KEYS.errorList(), errorId)
    .srem(KEYS.errorFingerprint(error.fingerprint), errorId)
    .zrem(KEYS.errorTimeline(error.severity), errorId)
    .exec();
}

/**
 * Check if alert was recently sent for this fingerprint
 */
export async function wasAlertRecentlySent(fingerprint: string): Promise<boolean> {
  const exists = await redis.exists(KEYS.alertSent(fingerprint));
  return exists === 1;
}

/**
 * Mark alert as sent (with 1-minute TTL to prevent spam)
 */
export async function markAlertSent(fingerprint: string, ttlSeconds: number = 60): Promise<void> {
  await redis.setex(KEYS.alertSent(fingerprint), ttlSeconds, '1');
}

/**
 * Get error count for a specific route
 */
export async function getErrorCountByRoute(routePath: string): Promise<number> {
  const errors = await getRecentErrors({ limit: 1000 });
  return errors.filter(e => e.routePath === routePath).length;
}

/**
 * Get most frequent errors (Top N)
 */
export async function getTopErrors(limit: number = 10): Promise<Array<{ error: ErrorRecord; count: number }>> {
  const errors = await getRecentErrors({ limit: 1000 });

  // Group by fingerprint and sum counts
  const errorMap = new Map<string, { error: ErrorRecord; count: number }>();

  errors.forEach(error => {
    const existing = errorMap.get(error.fingerprint);
    if (existing) {
      existing.count += error.count;
    } else {
      errorMap.set(error.fingerprint, { error, count: error.count });
    }
  });

  // Sort by count and return top N
  return Array.from(errorMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Clear all error data (use with caution!)
 */
export async function clearAllErrors(): Promise<void> {
  // This is a dangerous operation, only for development/testing
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot clear errors in production');
  }

  const errorIds = await redis.zrange<string[]>(KEYS.errorList(), 0, -1);
  if (!errorIds || errorIds.length === 0) return;

  const pipeline = redis.pipeline();

  errorIds.forEach(id => {
    pipeline.del(KEYS.error(id));
  });

  pipeline
    .del(KEYS.errorList())
    .del(KEYS.errorCount())
    .exec();
}
