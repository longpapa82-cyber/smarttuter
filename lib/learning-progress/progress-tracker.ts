/**
 * Learning Progress Tracker
 * Phase 6: Redis 기반 학습 진행 추적
 *
 * Complete Redis-based implementation for tracking student learning progress,
 * calculating mastery levels, detecting weaknesses, and providing recommendations.
 */

import { Redis } from '@upstash/redis';
import type { LearningEvent, LearningProgressSummary, ConceptMastery, SubjectProgress, MasteryLevel, DifficultyLevel } from './types';
import type { Subject, GradeLevel } from '@/types/tutor';
import {
  REDIS_KEYS,
  REDIS_TTL,
  serializeEvent,
  deserializeEvent,
  serializeConceptMastery,
  deserializeConceptMastery,
  serializeProgressSummary,
  deserializeProgressSummary,
  generateEventId,
  getEventRangeKey,
  getEventsByConceptKey,
  getEventsBySubjectKey,
} from './redis-schema';
import {
  calculateMasteryLevel,
  calculateConfidence,
  updateConceptMastery,
  identifyConceptGaps,
  createConceptMastery,
  masteryLevelToScore,
} from './mastery-calculator';
import { detectWeaknesses } from './weakness-detector';
import { calculateRecommendedDifficulty } from './difficulty-adjuster';

// ============================================================================
// Redis Client
// ============================================================================

let redis: Redis | null = null;

/**
 * Get Redis client instance
 * Returns null if Redis is not configured
 */
function getRedisClient(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('Redis credentials not configured. Progress tracking will be disabled.');
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

// ============================================================================
// Event Counter for Triggering Analysis
// ============================================================================

const eventCounters = new Map<string, number>();

/**
 * Increment event counter and return current count
 */
function incrementEventCounter(userId: string, subject: Subject): number {
  const key = `${userId}:${subject}`;
  const current = eventCounters.get(key) || 0;
  const next = current + 1;
  eventCounters.set(key, next);
  return next;
}

// ============================================================================
// Track Learning Event
// ============================================================================

/**
 * Track a learning event and update Redis storage
 *
 * @param event - Learning event to track
 *
 * @remarks
 * - Stores event in Redis with 30-day TTL
 * - Indexes by concept and subject for fast queries
 * - Updates concept mastery using mastery calculator
 * - Triggers weakness detection every 10 events
 * - Checks difficulty adjustment every 5 attempts per subject
 * - Uses pipelining for efficient Redis operations
 *
 * @example
 * ```typescript
 * await trackLearningEvent({
 *   userId: 'user-123',
 *   eventType: 'answer_received',
 *   subject: 'math',
 *   conceptId: 'algebra-equations',
 *   success: true,
 *   responseTime: 45.2,
 *   timestamp: new Date(),
 *   metadata: { difficulty: 'medium' }
 * });
 * ```
 */
export async function trackLearningEvent(event: LearningEvent): Promise<void> {
  try {
    const client = getRedisClient();
    if (!client) {
      console.log('Redis not configured - event tracking skipped');
      return;
    }

    const eventId = generateEventId(event.userId, event.timestamp);
    const eventKey = REDIS_KEYS.eventById(event.userId, eventId);
    const timelineKey = getEventRangeKey(event.userId);
    const timestampScore = event.timestamp.getTime();

    // Prepare pipeline for batch operations
    const pipeline = client.pipeline();

    // 1. Store event data with TTL
    pipeline.setex(eventKey, REDIS_TTL.EVENTS, serializeEvent(event));

    // 2. Add to timeline sorted set (for time-based queries)
    pipeline.zadd(timelineKey, { score: timestampScore, member: eventId });
    pipeline.expire(timelineKey, REDIS_TTL.EVENTS);

    // 3. Index by concept if present
    if (event.conceptId) {
      const conceptKey = getEventsByConceptKey(event.userId, event.conceptId);
      pipeline.sadd(conceptKey, eventId);
      pipeline.expire(conceptKey, REDIS_TTL.EVENTS);
    }

    // 4. Index by subject
    const subjectKey = getEventsBySubjectKey(event.userId, event.subject);
    pipeline.sadd(subjectKey, eventId);
    pipeline.expire(subjectKey, REDIS_TTL.EVENTS);

    // Execute pipeline
    await pipeline.exec();

    console.log(`Event tracked: ${event.eventType} for concept ${event.conceptId || 'N/A'}`);

    // 5. Update concept mastery if this is a concept-specific event
    const trackingEventTypes = ['answer_received', 'question_asked', 'question_attempt', 'conversation_turn'];
    if (event.conceptId && trackingEventTypes.includes(event.eventType)) {
      await updateConceptMasteryFromEvent(event);
    }

    // 6. Trigger weakness detection every 10 events
    const eventCount = incrementEventCounter(event.userId, event.subject);
    if (eventCount % 10 === 0) {
      console.log(`[Auto-Detection] Triggering weakness detection for ${event.userId} (${event.subject}) at event #${eventCount}`);
      await triggerWeaknessDetection(event.userId, event.subject);
    }

    // 7. Check difficulty adjustment every 5 attempts
    const difficultyEventTypes = ['answer_received', 'question_attempt', 'conversation_turn'];
    if (difficultyEventTypes.includes(event.eventType) && eventCount % 5 === 0) {
      console.log(`[Auto-Detection] Checking difficulty adjustment for ${event.userId} (${event.subject}) at event #${eventCount}`);
      await checkDifficultyAdjustment(event.userId, event.subject);
    }

    // 8. Invalidate cached progress summary
    await client.del(REDIS_KEYS.progressSummary(event.userId));

  } catch (error) {
    console.error('Error tracking learning event:', error);
    // Don't throw - tracking failure shouldn't break the app
  }
}

// ============================================================================
// Helper: Update Concept Mastery
// ============================================================================

/**
 * Update concept mastery based on learning event
 */
async function updateConceptMasteryFromEvent(event: LearningEvent): Promise<void> {
  try {
    const client = getRedisClient();
    if (!client || !event.conceptId) return;

    const masteryKey = REDIS_KEYS.conceptMastery(event.userId, event.conceptId);

    // Get current mastery or create new
    const currentData = await client.get<string>(masteryKey);
    let currentMastery: ConceptMastery;

    if (currentData) {
      currentMastery = deserializeConceptMastery(currentData);
    } else {
      // Create new mastery record
      const conceptName = event.metadata?.conceptName || event.conceptId;
      const gradeLevel = event.metadata?.gradeLevel || 'middle';
      currentMastery = createConceptMastery(
        event.conceptId,
        conceptName,
        event.subject,
        gradeLevel as GradeLevel
      );
    }

    // Update mastery with new attempt
    const updatedMastery = updateConceptMastery(currentMastery, {
      success: event.success,
      responseTime: event.responseTime || 0,
      hintUsed: event.metadata?.hintUsed || false,
      timestamp: event.timestamp,
      errorType: event.metadata?.errorType,
      errorExample: event.metadata?.errorExample,
    });

    // Save updated mastery (no TTL - permanent)
    await client.set(masteryKey, serializeConceptMastery(updatedMastery));

    // Add to all concepts index
    await client.sadd(REDIS_KEYS.allConceptMastery(event.userId), event.conceptId);

    console.log(`Concept mastery updated: ${event.conceptId} → ${updatedMastery.masteryLevel}`);
  } catch (error) {
    console.error('Error updating concept mastery:', error);
  }
}

// ============================================================================
// Helper: Trigger Weakness Detection
// ============================================================================

/**
 * Run weakness detection and cache results
 */
async function triggerWeaknessDetection(userId: string, subject: Subject): Promise<void> {
  try {
    const client = getRedisClient();
    if (!client) return;

    // Load all concept mastery data
    const masteryData = await loadAllConceptMastery(userId);

    // Filter by subject
    const subjectMastery = masteryData.filter(m => m.subject === subject);

    if (subjectMastery.length === 0) return;

    // Detect weaknesses
    const weaknesses = detectWeaknesses(subjectMastery, userId);

    // Cache weakness data with 6-hour TTL
    if (weaknesses.length > 0) {
      await client.setex(
        REDIS_KEYS.weaknesses(userId),
        REDIS_TTL.WEAKNESSES,
        JSON.stringify(weaknesses)
      );
      console.log(`Detected ${weaknesses.length} weakness areas`);
    }
  } catch (error) {
    console.error('Error in weakness detection:', error);
  }
}

// ============================================================================
// Helper: Check Difficulty Adjustment
// ============================================================================

/**
 * Check if difficulty should be adjusted and cache recommendation
 */
async function checkDifficultyAdjustment(userId: string, subject: Subject): Promise<void> {
  try {
    const client = getRedisClient();
    if (!client) return;

    // Load recent mastery data (last 10 concepts)
    const allMastery = await loadAllConceptMastery(userId);
    const subjectMastery = allMastery.filter(m => m.subject === subject);

    if (subjectMastery.length < 3) return; // Need at least 3 concepts

    // Sort by last attempt date and take recent 10
    const recentMastery = subjectMastery
      .sort((a, b) => b.lastAttemptDate.getTime() - a.lastAttemptDate.getTime())
      .slice(0, 10);

    // Get current difficulty
    const currentDifficultyData = await client.get<string>(REDIS_KEYS.difficulty(userId, subject));
    const currentDifficulty: DifficultyLevel = currentDifficultyData
      ? (currentDifficultyData as DifficultyLevel)
      : 'medium';

    // Calculate recommended difficulty
    const adjustment = calculateRecommendedDifficulty(
      userId,
      subject,
      recentMastery,
      currentDifficulty
    );

    // Cache adjustment recommendation
    await client.set(REDIS_KEYS.difficulty(userId, subject), adjustment.recommendedDifficulty);

    console.log(
      `Difficulty check: ${currentDifficulty} → ${adjustment.recommendedDifficulty} (${adjustment.reason})`
    );
  } catch (error) {
    console.error('Error checking difficulty adjustment:', error);
  }
}

// ============================================================================
// Get Learning Progress Summary
// ============================================================================

/**
 * Get comprehensive learning progress summary
 *
 * @param userId - Student identifier
 * @param gradeLevel - Current grade level
 * @returns Learning progress summary or null if no data
 *
 * @remarks
 * - Checks cache first (1-hour TTL)
 * - Aggregates from events and mastery data if not cached
 * - Calculates per-subject metrics and overall progress
 * - Runs weakness detection on all concepts
 * - Caches result before returning
 *
 * @example
 * ```typescript
 * const summary = await getLearningProgressSummary('user-123', 'middle');
 * if (summary) {
 *   console.log(`Overall progress: ${(summary.overallProgress * 100).toFixed(0)}%`);
 *   console.log(`Math mastery: ${summary.subjects.math.averageMastery}`);
 *   console.log(`Weaknesses: ${summary.weaknesses.length}`);
 * }
 * ```
 */
export async function getLearningProgressSummary(
  userId: string,
  gradeLevel: string
): Promise<LearningProgressSummary | null> {
  try {
    const client = getRedisClient();
    if (!client) {
      console.log('Redis not configured - progress summary unavailable');
      return null;
    }

    // 1. Check cache first
    const cacheKey = REDIS_KEYS.progressSummary(userId);
    const cachedData = await client.get<string>(cacheKey);

    if (cachedData) {
      console.log('Progress summary cache HIT');
      return deserializeProgressSummary(cachedData);
    }

    console.log('Progress summary cache MISS - generating...');

    // 2. Load all concept mastery data
    const allMastery = await loadAllConceptMastery(userId);

    if (allMastery.length === 0) {
      console.log('No mastery data found for user');
      return null;
    }

    // 3. Separate by subject
    const mathMastery = allMastery.filter(m => m.subject === 'math');
    const englishMastery = allMastery.filter(m => m.subject === 'english');
    const scienceMastery = allMastery.filter(m => m.subject === 'science');
    const socialStudiesMastery = allMastery.filter(m => m.subject === 'social-studies');

    // 4. Calculate subject progress
    const mathProgress = calculateSubjectProgress(mathMastery, 'math', userId);
    const englishProgress = calculateSubjectProgress(englishMastery, 'english', userId);
    const scienceProgress = calculateSubjectProgress(scienceMastery, 'science', userId);
    const socialStudiesProgress = calculateSubjectProgress(socialStudiesMastery, 'social-studies', userId);

    // 5. Calculate overall metrics
    const totalConcepts = allMastery.length;
    const masteredConcepts = allMastery.filter(m => m.masteryLevel === 'mastered').length;
    const totalStudyTime = allMastery.reduce((sum, m) => sum + m.averageResponseTime * m.totalAttempts, 0);

    // Calculate overall progress (weighted average of subject progress)
    const overallProgress = totalConcepts > 0
      ? (mathMastery.length * mathProgress.averageMastery + englishMastery.length * englishProgress.averageMastery) / totalConcepts
      : 0;

    // 6. Detect weaknesses across all concepts
    const weaknesses = detectWeaknesses(allMastery, userId);

    // 7. Create summary
    const summary: LearningProgressSummary = {
      userId,
      gradeLevel: gradeLevel as GradeLevel,
      subjects: {
        english: englishProgress,
        math: mathProgress,
        science: scienceProgress,
        'social-studies': socialStudiesProgress,
      },
      overallProgress,
      totalStudyTime,
      totalConcepts,
      masteredConcepts,
      weaknesses,
      lastUpdated: new Date(),
    };

    // 8. Cache the result with 1-hour TTL
    await client.setex(cacheKey, REDIS_TTL.PROGRESS_SUMMARY, serializeProgressSummary(summary));

    console.log(`Progress summary generated: ${totalConcepts} concepts, ${masteredConcepts} mastered`);

    return summary;
  } catch (error) {
    console.error('Error getting progress summary:', error);
    return null;
  }
}

// ============================================================================
// Helper: Calculate Subject Progress
// ============================================================================

/**
 * Calculate progress metrics for a single subject
 */
function calculateSubjectProgress(
  masteryData: ConceptMastery[],
  subject: Subject,
  userId: string
): SubjectProgress {
  if (masteryData.length === 0) {
    return {
      subject,
      totalConcepts: 0,
      conceptsByMastery: {
        not_started: 0,
        struggling: 0,
        learning: 0,
        proficient: 0,
        mastered: 0,
      },
      averageMastery: 0,
      studyTime: 0,
      totalAttempts: 0,
      successRate: 0,
      currentDifficulty: 'medium',
      recommendedNextConcepts: [],
      strongAreas: [],
      weakAreas: [],
    };
  }

  // Count by mastery level
  const conceptsByMastery = {
    not_started: masteryData.filter(m => m.masteryLevel === 'not_started').length,
    struggling: masteryData.filter(m => m.masteryLevel === 'struggling').length,
    learning: masteryData.filter(m => m.masteryLevel === 'learning').length,
    proficient: masteryData.filter(m => m.masteryLevel === 'proficient').length,
    mastered: masteryData.filter(m => m.masteryLevel === 'mastered').length,
  };

  // Calculate average mastery (0-1 scale)
  const totalMasteryScore = masteryData.reduce((sum, m) => sum + masteryLevelToScore(m.masteryLevel), 0);
  const averageMastery = totalMasteryScore / masteryData.length / 4; // Normalize to 0-1

  // Calculate study time (total response time across all attempts)
  const studyTime = masteryData.reduce((sum, m) => sum + m.averageResponseTime * m.totalAttempts, 0);

  // Calculate total attempts and success rate
  const totalAttempts = masteryData.reduce((sum, m) => sum + m.totalAttempts, 0);
  const successfulAttempts = masteryData.reduce((sum, m) => sum + m.successfulAttempts, 0);
  const successRate = totalAttempts > 0 ? successfulAttempts / totalAttempts : 0;

  // Identify strong and weak areas
  const strongAreas = masteryData
    .filter(m => m.masteryLevel === 'mastered' || m.masteryLevel === 'proficient')
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)
    .map(m => m.conceptName);

  const weakAreas = masteryData
    .filter(m => m.masteryLevel === 'struggling' || (m.masteryLevel === 'learning' && m.confidence < 0.5))
    .sort((a, b) => a.confidence - b.confidence)
    .slice(0, 5)
    .map(m => m.conceptName);

  // Find most recent activity date
  const lastActivityDate = masteryData.length > 0
    ? masteryData.reduce((latest, m) =>
        m.lastAttemptDate > latest ? m.lastAttemptDate : latest,
        masteryData[0].lastAttemptDate
      )
    : undefined;

  return {
    subject,
    totalConcepts: masteryData.length,
    conceptsByMastery,
    averageMastery,
    studyTime,
    totalAttempts,
    successRate,
    currentDifficulty: 'medium', // Will be updated from Redis if available
    recommendedNextConcepts: [],
    strongAreas,
    weakAreas,
    lastActivityDate,
  };
}

// ============================================================================
// Helper: Load All Concept Mastery
// ============================================================================

/**
 * Load all concept mastery records for a user
 */
async function loadAllConceptMastery(userId: string): Promise<ConceptMastery[]> {
  try {
    const client = getRedisClient();
    if (!client) return [];

    // Get all concept IDs
    const conceptIds = await client.smembers(REDIS_KEYS.allConceptMastery(userId));

    if (conceptIds.length === 0) return [];

    // Load all mastery data using pipeline
    const pipeline = client.pipeline();
    conceptIds.forEach(conceptId => {
      pipeline.get<string>(REDIS_KEYS.conceptMastery(userId, conceptId));
    });

    const results = await pipeline.exec();

    // Deserialize and filter out null results
    const masteryData: ConceptMastery[] = [];
    for (const result of results) {
      if (result && typeof result === 'string') {
        try {
          masteryData.push(deserializeConceptMastery(result));
        } catch (error) {
          console.error('Error deserializing mastery data:', error);
        }
      }
    }

    return masteryData;
  } catch (error) {
    console.error('Error loading concept mastery:', error);
    return [];
  }
}

// ============================================================================
// Get Recommended Next Concepts
// ============================================================================

/**
 * Get recommended next concepts for learning
 *
 * @param userId - Student identifier
 * @param subject - Subject area
 * @param masteryData - Current concept mastery data
 * @returns Array of recommended concept IDs (top 5)
 *
 * @remarks
 * - Checks cache first (12-hour TTL)
 * - Identifies concepts below proficient level
 * - Uses gap identification to find prerequisites
 * - Sorts by priority:
 *   1. Prerequisite concepts (foundation building)
 *   2. Struggling concepts (for review)
 *   3. Not started concepts (for progression)
 * - Returns top 5 recommendations
 *
 * @example
 * ```typescript
 * const recommendations = await getRecommendedNextConcepts(
 *   'user-123',
 *   'math',
 *   currentMasteryData
 * );
 * console.log(`Recommended: ${recommendations.join(', ')}`);
 * ```
 */
export async function getRecommendedNextConcepts(
  userId: string,
  subject: Subject,
  masteryData: ConceptMastery[]
): Promise<string[]> {
  try {
    const client = getRedisClient();
    if (!client) {
      console.log('Redis not configured - recommendations unavailable');
      return [];
    }

    // 1. Check cache first
    const cacheKey = REDIS_KEYS.recommendations(userId, subject);
    const cachedData = await client.get<string[]>(cacheKey);

    if (cachedData && Array.isArray(cachedData)) {
      console.log('Recommendations cache HIT');
      return cachedData;
    }

    console.log('Recommendations cache MISS - generating...');

    // 2. Filter by subject
    const subjectMastery = masteryData.filter(m => m.subject === subject);

    if (subjectMastery.length === 0) return [];

    // 3. Identify concepts that need work (below proficient)
    const needsWork = subjectMastery.filter(
      m => m.masteryLevel === 'not_started' ||
           m.masteryLevel === 'struggling' ||
           m.masteryLevel === 'learning'
    );

    // 4. Identify prerequisite gaps
    const gradeLevel = subjectMastery[0]?.gradeLevel || 'middle';
    const gaps = identifyConceptGaps(subjectMastery, gradeLevel);

    // 5. Prioritize recommendations
    const recommendations: string[] = [];

    // Priority 1: Missing prerequisites (most important)
    for (const gap of gaps) {
      if (gap.reason === 'prerequisite_missing' || gap.reason === 'advanced_without_foundation') {
        recommendations.push(...gap.missingPrerequisites);
      }
    }

    // Priority 2: Struggling concepts (need review)
    const struggling = needsWork
      .filter(m => m.masteryLevel === 'struggling')
      .sort((a, b) => a.confidence - b.confidence) // Lowest confidence first
      .map(m => m.conceptId);
    recommendations.push(...struggling);

    // Priority 3: Not started concepts (for progression)
    const notStarted = needsWork
      .filter(m => m.masteryLevel === 'not_started')
      .map(m => m.conceptId);
    recommendations.push(...notStarted);

    // 6. Remove duplicates and take top 5
    const uniqueRecommendations = Array.from(new Set(recommendations)).slice(0, 5);

    // 7. Cache results with 12-hour TTL
    if (uniqueRecommendations.length > 0) {
      await client.setex(cacheKey, REDIS_TTL.RECOMMENDATIONS, JSON.stringify(uniqueRecommendations));
    }

    console.log(`Generated ${uniqueRecommendations.length} recommendations for ${subject}`);

    return uniqueRecommendations;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
}
