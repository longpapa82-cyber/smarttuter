/**
 * Error Tracking System - Utility Functions
 * @module server-only
 */

import 'server-only';
import crypto from 'crypto';
import type { ErrorSeverity, ErrorContext } from './types';

/**
 * Generate error fingerprint for deduplication
 * Based on error name, message, and stack trace
 */
export function generateFingerprint(
  error: Error,
  context: ErrorContext
): string {
  // Extract first 3 lines of stack trace (most relevant)
  const stackLines = error.stack?.split('\n').slice(0, 3).join('') || '';

  // Normalize error signature
  const signature = [
    error.name,
    error.message,
    stackLines,
    context.routePath,
  ].join(':');

  // Generate MD5 hash
  return crypto.createHash('md5').update(signature).digest('hex');
}

/**
 * Anonymize user ID for privacy protection
 * Uses SHA-256 hash to make it irreversible
 */
export function anonymizeUserId(userId: string): string {
  return crypto
    .createHash('sha256')
    .update(userId)
    .digest('hex')
    .substring(0, 16);
}

/**
 * Mask sensitive data in error messages and stack traces
 */
export function maskSensitiveData(text: string): string {
  if (!text) return text;

  return text
    // Mask email addresses
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]')
    // Mask passwords
    .replace(/password[=:]\s*\S+/gi, 'password=[REDACTED]')
    // Mask tokens
    .replace(/token[=:]\s*\S+/gi, 'token=[REDACTED]')
    // Mask API keys
    .replace(/api[_-]?key[=:]\s*\S+/gi, 'apiKey=[REDACTED]')
    // Mask JWT tokens
    .replace(/Bearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/gi, 'Bearer [REDACTED]')
    // Mask credit cards
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD_REDACTED]');
}

/**
 * Classify error severity based on error type and context
 */
export function classifyErrorSeverity(
  error: Error,
  context: ErrorContext
): ErrorSeverity {
  const errorMessage = error.message.toLowerCase();
  const errorName = error.name;

  // Critical: System-wide impact
  if (errorMessage.includes('redis') && errorMessage.includes('failed')) {
    return 'critical';
  }
  if (errorMessage.includes('database') && errorMessage.includes('connection')) {
    return 'critical';
  }
  if (errorName === 'OutOfMemoryError') {
    return 'critical';
  }
  if (errorMessage.includes('econnrefused')) {
    return 'critical';
  }

  // Error: User functionality affected
  if (errorName === 'TypeError') {
    return 'error';
  }
  if (errorName === 'ReferenceError') {
    return 'error';
  }
  if (errorName === 'SyntaxError') {
    return 'error';
  }
  if (context.routeType === 'route') {
    return 'error';
  }

  // Warning: User experience degraded
  if (errorMessage.includes('timeout')) {
    return 'warning';
  }
  if (errorMessage.includes('rate limit')) {
    return 'warning';
  }
  if (errorMessage.includes('network')) {
    return 'warning';
  }

  // Info: Informational
  return 'info';
}

/**
 * Get date key for daily statistics (YYYY-MM-DD format)
 */
export function getDateKey(timestamp?: number): string {
  const date = timestamp ? new Date(timestamp) : new Date();
  return date.toISOString().split('T')[0];
}

/**
 * Format timestamp to readable string
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

/**
 * Sanitize error record for display (remove sensitive data)
 */
export function sanitizeErrorRecord(error: any): any {
  return {
    ...error,
    message: maskSensitiveData(error.message),
    stack: maskSensitiveData(error.stack),
    userId: error.userId ? '***ANONYMIZED***' : undefined,
  };
}

/**
 * Calculate Mean Time To Resolution (MTTR) in minutes
 */
export function calculateMTTR(errors: Array<{ firstSeen: number; resolvedAt?: number }>): number {
  const resolvedErrors = errors.filter(e => e.resolvedAt);

  if (resolvedErrors.length === 0) return 0;

  const totalResolutionTime = resolvedErrors.reduce((sum, error) => {
    return sum + (error.resolvedAt! - error.firstSeen);
  }, 0);

  // Convert to minutes
  return Math.round(totalResolutionTime / resolvedErrors.length / 1000 / 60);
}

/**
 * Truncate long error messages
 */
export function truncateMessage(message: string, maxLength: number = 200): string {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + '...';
}

/**
 * Extract error name from stack trace if not provided
 */
export function extractErrorName(error: Error): string {
  if (error.name && error.name !== 'Error') {
    return error.name;
  }

  // Try to extract from stack trace
  const firstLine = error.stack?.split('\n')[0];
  if (firstLine) {
    const match = firstLine.match(/^(\w+Error):/);
    if (match) return match[1];
  }

  return 'Error';
}
