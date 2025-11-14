/**
 * Phase 3-1: RAG Quality Verification Logging System
 *
 * Provides centralized logging and quality metrics for RAG Direct answers
 * across all subject tutors (Math, English, Science, Social Studies)
 */

import type { Subject } from './rag-system';

export interface RAGQualityMetrics {
  subject: Subject;
  question: string;
  confidence: number;
  contentCount: number;
  ragDirectUsed: boolean;
  timestamp: string;
  gradeLevel: string;
  relevanceScores?: number[];
  apiSaved: boolean;
}

export interface RAGPerformanceStats {
  totalQuestions: number;
  ragDirectAnswers: number;
  apiCalls: number;
  ragDirectRate: number; // percentage
  averageConfidence: number;
  averageContentCount: number;
}

// In-memory storage for RAG metrics (could be extended to database)
const ragMetrics: RAGQualityMetrics[] = [];
const MAX_METRICS_STORED = 1000; // Keep last 1000 metrics

/**
 * Log RAG Direct usage and quality metrics
 */
export function logRAGDirectUsage(metrics: RAGQualityMetrics): void {
  // Add timestamp if not provided
  const metricsWithTimestamp: RAGQualityMetrics = {
    ...metrics,
    timestamp: metrics.timestamp || new Date().toISOString(),
  };

  // Store metrics
  ragMetrics.push(metricsWithTimestamp);

  // Keep only last MAX_METRICS_STORED entries
  if (ragMetrics.length > MAX_METRICS_STORED) {
    ragMetrics.shift();
  }

  // Console logging for development monitoring
  if (process.env.NODE_ENV === 'development') {
    const singleSourceWarning = metrics.ragDirectUsed && metrics.contentCount === 1
      ? '\n⚠️  WARNING: Single-source answer (ideal: 2+ sources for cross-validation)'
      : '';

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RAG QUALITY METRICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subject:         ${metrics.subject}
Grade Level:     ${metrics.gradeLevel}
RAG Direct:      ${metrics.ragDirectUsed ? '✅ YES (API SAVED)' : '❌ NO (API CALL MADE)'}
Confidence:      ${(metrics.confidence * 100).toFixed(1)}%
Content Count:   ${metrics.contentCount}${singleSourceWarning}
Question:        ${metrics.question.substring(0, 100)}${metrics.question.length > 100 ? '...' : ''}
${metrics.relevanceScores ? `Relevance:       ${metrics.relevanceScores.map(s => `${s}%`).join(', ')}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  }
}

/**
 * Get performance statistics for a specific subject
 */
export function getSubjectPerformanceStats(subject: Subject): RAGPerformanceStats {
  const subjectMetrics = ragMetrics.filter(m => m.subject === subject);

  if (subjectMetrics.length === 0) {
    return {
      totalQuestions: 0,
      ragDirectAnswers: 0,
      apiCalls: 0,
      ragDirectRate: 0,
      averageConfidence: 0,
      averageContentCount: 0,
    };
  }

  const ragDirectCount = subjectMetrics.filter(m => m.ragDirectUsed).length;
  const apiCallCount = subjectMetrics.length - ragDirectCount;
  const avgConfidence = subjectMetrics.reduce((sum, m) => sum + m.confidence, 0) / subjectMetrics.length;
  const avgContentCount = subjectMetrics.reduce((sum, m) => sum + m.contentCount, 0) / subjectMetrics.length;

  return {
    totalQuestions: subjectMetrics.length,
    ragDirectAnswers: ragDirectCount,
    apiCalls: apiCallCount,
    ragDirectRate: (ragDirectCount / subjectMetrics.length) * 100,
    averageConfidence: avgConfidence,
    averageContentCount: avgContentCount,
  };
}

/**
 * Get overall performance statistics across all subjects
 */
export function getOverallPerformanceStats(): RAGPerformanceStats {
  if (ragMetrics.length === 0) {
    return {
      totalQuestions: 0,
      ragDirectAnswers: 0,
      apiCalls: 0,
      ragDirectRate: 0,
      averageConfidence: 0,
      averageContentCount: 0,
    };
  }

  const ragDirectCount = ragMetrics.filter(m => m.ragDirectUsed).length;
  const apiCallCount = ragMetrics.length - ragDirectCount;
  const avgConfidence = ragMetrics.reduce((sum, m) => sum + m.confidence, 0) / ragMetrics.length;
  const avgContentCount = ragMetrics.reduce((sum, m) => sum + m.contentCount, 0) / ragMetrics.length;

  return {
    totalQuestions: ragMetrics.length,
    ragDirectAnswers: ragDirectCount,
    apiCalls: apiCallCount,
    ragDirectRate: (ragDirectCount / ragMetrics.length) * 100,
    averageConfidence: avgConfidence,
    averageContentCount: avgContentCount,
  };
}

/**
 * Get detailed metrics breakdown by subject
 */
export function getMetricsBySubject(): Record<Subject, RAGPerformanceStats> {
  const subjects: Subject[] = ['english', 'math', 'science', 'social-studies', 'korean'];

  return subjects.reduce((acc, subject) => {
    acc[subject] = getSubjectPerformanceStats(subject);
    return acc;
  }, {} as Record<Subject, RAGPerformanceStats>);
}

/**
 * Print performance report to console (for debugging)
 */
export function printPerformanceReport(): void {
  const overall = getOverallPerformanceStats();
  const bySubject = getMetricsBySubject();

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║           RAG SYSTEM PERFORMANCE REPORT                   ║
╠═══════════════════════════════════════════════════════════╣
║ OVERALL STATISTICS                                         ║
╠═══════════════════════════════════════════════════════════╣
  Total Questions:       ${overall.totalQuestions}
  RAG Direct Answers:    ${overall.ragDirectAnswers} (${overall.ragDirectRate.toFixed(1)}%)
  API Calls:             ${overall.apiCalls} (${(100 - overall.ragDirectRate).toFixed(1)}%)
  Avg Confidence:        ${(overall.averageConfidence * 100).toFixed(1)}%
  Avg Content Count:     ${overall.averageContentCount.toFixed(1)}
╠═══════════════════════════════════════════════════════════╣
║ BY SUBJECT                                                 ║
╠═══════════════════════════════════════════════════════════╣
  `);

  Object.entries(bySubject).forEach(([subject, stats]) => {
    if (stats.totalQuestions > 0) {
      console.log(`
  📚 ${subject.toUpperCase()}:
     Questions:          ${stats.totalQuestions}
     RAG Direct:         ${stats.ragDirectAnswers} (${stats.ragDirectRate.toFixed(1)}%)
     API Calls:          ${stats.apiCalls}
     Avg Confidence:     ${(stats.averageConfidence * 100).toFixed(1)}%
     Avg Content:        ${stats.averageContentCount.toFixed(1)}
  `);
    }
  });

  console.log(`╚═══════════════════════════════════════════════════════════╝\n`);
}

/**
 * Quality validation thresholds
 *
 * IMPORTANT: MIN_CONTENT_COUNT = 1 allows single-source RAG Direct answers
 * This is a temporary measure until we expand content database (Phase 3-2)
 * Single-source answers are logged with warnings for quality monitoring
 */
export const RAG_QUALITY_THRESHOLDS = {
  MIN_CONFIDENCE: 0.9,        // 90% minimum confidence for RAG Direct
  MIN_CONTENT_COUNT: 1,       // Lowered from 2 to enable more RAG Direct usage
  TARGET_RAG_DIRECT_RATE: 30, // Target 30%+ questions answered via RAG Direct
  IDEAL_CONTENT_COUNT: 2,     // Ideal number for cross-validation
} as const;

/**
 * Validate if RAG system is performing within expected quality thresholds
 */
export function validateRAGQuality(subject?: Subject): {
  isHealthy: boolean;
  issues: string[];
  recommendations: string[];
} {
  const stats = subject ? getSubjectPerformanceStats(subject) : getOverallPerformanceStats();
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check RAG Direct usage rate
  if (stats.ragDirectRate < RAG_QUALITY_THRESHOLDS.TARGET_RAG_DIRECT_RATE) {
    issues.push(`RAG Direct rate (${stats.ragDirectRate.toFixed(1)}%) below target (${RAG_QUALITY_THRESHOLDS.TARGET_RAG_DIRECT_RATE}%)`);
    recommendations.push('Add more verified content to increase RAG Direct coverage');
  }

  // Check average confidence
  if (stats.averageConfidence < RAG_QUALITY_THRESHOLDS.MIN_CONFIDENCE) {
    issues.push(`Average confidence (${(stats.averageConfidence * 100).toFixed(1)}%) below minimum (${RAG_QUALITY_THRESHOLDS.MIN_CONFIDENCE * 100}%)`);
    recommendations.push('Review and improve content matching algorithms');
  }

  // Check average content count
  if (stats.averageContentCount < RAG_QUALITY_THRESHOLDS.MIN_CONTENT_COUNT) {
    issues.push(`Average content count (${stats.averageContentCount.toFixed(1)}) below minimum (${RAG_QUALITY_THRESHOLDS.MIN_CONTENT_COUNT})`);
    recommendations.push('Expand verified content database for better coverage');
  }

  return {
    isHealthy: issues.length === 0,
    issues,
    recommendations,
  };
}

/**
 * Get recent RAG Direct questions (for quality review)
 */
export function getRecentRAGDirectQuestions(limit: number = 10): RAGQualityMetrics[] {
  return ragMetrics
    .filter(m => m.ragDirectUsed)
    .slice(-limit)
    .reverse();
}

/**
 * Get failed RAG Direct attempts (high confidence but didn't meet criteria)
 */
export function getFailedRAGDirectAttempts(minConfidence: number = 0.85): RAGQualityMetrics[] {
  return ragMetrics
    .filter(m => !m.ragDirectUsed && m.confidence >= minConfidence)
    .slice(-20)
    .reverse();
}
