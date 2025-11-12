import { Redis } from '@upstash/redis';
import crypto from 'crypto';
import type { Subject } from '@/types/tutor';

// Redis client initialization (requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN)
let redis: Redis | null = null;

function getRedisClient(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('Redis credentials not configured. Caching will be disabled.');
    return null;
  }

  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  return redis;
}

// Generate cache key from conversation context
export function generateCacheKey(
  subject: Subject,
  message: string,
  gradeLevel: string,
  conversationHistory: Array<{ role: string; content: string }>
): string {
  // Create a context string that includes recent conversation
  const recentContext = conversationHistory
    .slice(-3)
    .map((msg) => `${msg.role}:${msg.content}`)
    .join('|');

  const contextString = `${subject}:${gradeLevel}:${message}:${recentContext}`;

  // Generate SHA256 hash for consistent cache keys
  const hash = crypto.createHash('sha256').update(contextString).digest('hex');

  return `tutor:${subject}:${hash}`;
}

// Get cached response
export async function getCachedResponse(cacheKey: string): Promise<string | null> {
  try {
    const client = getRedisClient();
    if (!client) return null;

    const cached = await client.get<string>(cacheKey);
    if (cached) {
      console.log(`Cache HIT for key: ${cacheKey.substring(0, 20)}...`);
    }
    return cached;
  } catch (error) {
    console.error('Redis GET error:', error);
    return null; // Fail gracefully - don't break the app
  }
}

// Set cached response with TTL (default 1 hour)
export async function setCachedResponse(
  cacheKey: string,
  response: string,
  ttlSeconds: number = 3600
): Promise<void> {
  try {
    const client = getRedisClient();
    if (!client) return;

    await client.setex(cacheKey, ttlSeconds, response);
    console.log(`Cache SET for key: ${cacheKey.substring(0, 20)}... (TTL: ${ttlSeconds}s)`);
  } catch (error) {
    console.error('Redis SET error:', error);
    // Don't throw - caching failure shouldn't break the app
  }
}

// Invalidate cache by pattern (useful for clearing user-specific or subject-specific caches)
export async function invalidateCachePattern(pattern: string): Promise<number> {
  try {
    const client = getRedisClient();
    if (!client) return 0;

    // Use SCAN to find matching keys (safer than KEYS for production)
    const keys: string[] = [];
    let cursor = '0';

    do {
      const result = await client.scan(cursor, { match: pattern, count: 100 });
      cursor = result[0];
      keys.push(...result[1]);
    } while (cursor !== '0');

    if (keys.length > 0) {
      await client.del(...keys);
      console.log(`Invalidated ${keys.length} cache keys matching pattern: ${pattern}`);
    }

    return keys.length;
  } catch (error) {
    console.error('Redis invalidation error:', error);
    return 0;
  }
}

// Get cache statistics
export async function getCacheStats(): Promise<{
  enabled: boolean;
  size?: number;
  memory?: string;
}> {
  try {
    const client = getRedisClient();
    if (!client) {
      return { enabled: false };
    }

    const info = await client.dbsize();

    return {
      enabled: true,
      size: info,
    };
  } catch (error) {
    console.error('Redis stats error:', error);
    return { enabled: false };
  }
}
