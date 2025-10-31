/**
 * Redis Schema and Key Patterns for Learning Progress Tracking
 *
 * This file defines the Redis data structures and key naming conventions
 * used throughout the learning progress tracking system.
 */

import type { GradeLevel, Subject } from '@/types/tutor';
import type {
  LearningEvent,
  ConceptMastery,
  WeaknessArea,
  DifficultyAdjustment,
  LearningProgressSummary,
} from './types';

// ============================================================================
// Redis Key Patterns
// ============================================================================

export const REDIS_KEYS = {
  // Learning Progress Summary (cached, TTL: 1 hour)
  progressSummary: (userId: string) => `user:${userId}:progress:summary`,

  // Learning Events (raw events, TTL: 30 days)
  events: (userId: string) => `user:${userId}:events`,
  eventById: (userId: string, eventId: string) => `user:${userId}:event:${eventId}`,

  // Concept Mastery (per concept, no TTL)
  conceptMastery: (userId: string, conceptId: string) => `user:${userId}:concept:${conceptId}:mastery`,
  allConceptMastery: (userId: string) => `user:${userId}:concepts:mastery`,

  // Weaknesses (cached, TTL: 6 hours)
  weaknesses: (userId: string) => `user:${userId}:weaknesses`,

  // Difficulty Settings (per subject, no TTL)
  difficulty: (userId: string, subject: Subject) => `user:${userId}:difficulty:${subject}`,
  difficultyHistory: (userId: string, subject: Subject) => `user:${userId}:difficulty:${subject}:history`,

  // Session Data (TTL: 7 days)
  currentSession: (userId: string) => `user:${userId}:session:current`,
  sessionHistory: (userId: string) => `user:${userId}:sessions`,

  // Statistics (aggregated, TTL: 24 hours)
  dailyStats: (userId: string, date: string) => `user:${userId}:stats:daily:${date}`,
  weeklyStats: (userId: string, weekStart: string) => `user:${userId}:stats:weekly:${weekStart}`,

  // Recommended Concepts (cached, TTL: 12 hours)
  recommendations: (userId: string, subject: Subject) => `user:${userId}:recommendations:${subject}`,
} as const;

// ============================================================================
// TTL Constants (in seconds)
// ============================================================================

export const REDIS_TTL = {
  PROGRESS_SUMMARY: 3600,        // 1 hour
  EVENTS: 2592000,                // 30 days
  WEAKNESSES: 21600,              // 6 hours
  SESSION: 604800,                // 7 days
  DAILY_STATS: 86400,             // 24 hours
  WEEKLY_STATS: 604800,           // 7 days
  RECOMMENDATIONS: 43200,         // 12 hours
  CONCEPT_MASTERY: -1,            // No expiration
  DIFFICULTY: -1,                 // No expiration
} as const;

// ============================================================================
// Data Structure Helpers
// ============================================================================

/**
 * Serialize learning event for Redis storage
 */
export function serializeEvent(event: LearningEvent): string {
  return JSON.stringify({
    ...event,
    timestamp: event.timestamp.toISOString(),
  });
}

/**
 * Deserialize learning event from Redis
 */
export function deserializeEvent(data: string): LearningEvent {
  const parsed = JSON.parse(data);
  return {
    ...parsed,
    timestamp: new Date(parsed.timestamp),
  };
}

/**
 * Serialize concept mastery for Redis storage
 */
export function serializeConceptMastery(mastery: ConceptMastery): string {
  return JSON.stringify({
    ...mastery,
    lastAttemptDate: mastery.lastAttemptDate.toISOString(),
    firstAttemptDate: mastery.firstAttemptDate.toISOString(),
  });
}

/**
 * Deserialize concept mastery from Redis
 */
export function deserializeConceptMastery(data: string): ConceptMastery {
  const parsed = JSON.parse(data);
  return {
    ...parsed,
    lastAttemptDate: new Date(parsed.lastAttemptDate),
    firstAttemptDate: new Date(parsed.firstAttemptDate),
  };
}

/**
 * Serialize progress summary for Redis storage
 */
export function serializeProgressSummary(summary: LearningProgressSummary): string {
  return JSON.stringify({
    ...summary,
    lastUpdated: summary.lastUpdated.toISOString(),
    subjects: {
      math: {
        ...summary.subjects.math,
        lastActivityDate: summary.subjects.math.lastActivityDate?.toISOString(),
      },
      english: {
        ...summary.subjects.english,
        lastActivityDate: summary.subjects.english.lastActivityDate?.toISOString(),
      },
    },
  });
}

/**
 * Deserialize progress summary from Redis
 */
export function deserializeProgressSummary(data: string): LearningProgressSummary {
  const parsed = JSON.parse(data);
  return {
    ...parsed,
    lastUpdated: new Date(parsed.lastUpdated),
    subjects: {
      math: {
        ...parsed.subjects.math,
        lastActivityDate: parsed.subjects.math.lastActivityDate
          ? new Date(parsed.subjects.math.lastActivityDate)
          : undefined,
      },
      english: {
        ...parsed.subjects.english,
        lastActivityDate: parsed.subjects.english.lastActivityDate
          ? new Date(parsed.subjects.english.lastActivityDate)
          : undefined,
      },
    },
  };
}

/**
 * Serialize difficulty adjustment for Redis storage
 */
export function serializeDifficultyAdjustment(adjustment: DifficultyAdjustment): string {
  return JSON.stringify({
    ...adjustment,
    timestamp: adjustment.timestamp.toISOString(),
  });
}

/**
 * Deserialize difficulty adjustment from Redis
 */
export function deserializeDifficultyAdjustment(data: string): DifficultyAdjustment {
  const parsed = JSON.parse(data);
  return {
    ...parsed,
    timestamp: new Date(parsed.timestamp),
  };
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Generate event ID from timestamp and userId
 */
export function generateEventId(userId: string, timestamp: Date): string {
  return `${userId}_${timestamp.getTime()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get date key for daily stats (YYYY-MM-DD)
 */
export function getDailyStatsKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get week start key for weekly stats (YYYY-Wxx)
 */
export function getWeeklyStatsKey(date: Date): string {
  const year = date.getFullYear();
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

// ============================================================================
// Index Patterns for Queries
// ============================================================================

/**
 * Get all events for a user within a time range
 * Uses sorted set with timestamp scores
 */
export function getEventRangeKey(userId: string): string {
  return `user:${userId}:events:timeline`;
}

/**
 * Get events by concept ID
 * Uses set for fast lookup
 */
export function getEventsByConceptKey(userId: string, conceptId: string): string {
  return `user:${userId}:events:concept:${conceptId}`;
}

/**
 * Get events by subject
 * Uses set for fast lookup
 */
export function getEventsBySubjectKey(userId: string, subject: Subject): string {
  return `user:${userId}:events:subject:${subject}`;
}

// ============================================================================
// Cleanup Utilities
// ============================================================================

/**
 * Get pattern for cleaning up expired user data
 */
export function getUserDataPattern(userId: string): string {
  return `user:${userId}:*`;
}

/**
 * Get pattern for cleaning up all caches
 */
export function getCachePattern(): string {
  return `user:*:progress:summary`;
}
