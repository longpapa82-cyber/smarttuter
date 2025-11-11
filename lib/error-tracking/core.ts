/**
 * Error Tracking System - Core Error Tracker
 * @module server-only
 */

import 'server-only';
import crypto from 'crypto';
import type { ErrorContext, ErrorRecord, WebhookPayload } from './types';
import {
  generateFingerprint,
  anonymizeUserId,
  maskSensitiveData,
  classifyErrorSeverity,
  formatTimestamp,
  extractErrorName,
} from './utils';
import {
  saveError,
  getErrorsByFingerprint,
  incrementErrorCount,
  wasAlertRecentlySent,
  markAlertSent,
  getRecentErrors,
  getErrorStats,
  getError,
  resolveError,
  unresolveError,
  deleteError,
  getTopErrors,
} from './redis';

export class ErrorTracker {
  /**
   * Capture and track an error
   */
  static async captureError(
    error: Error,
    context: ErrorContext
  ): Promise<string> {
    try {
      // 1. Generate fingerprint for deduplication
      const fingerprint = generateFingerprint(error, context);

      // 2. Check for existing errors with same fingerprint
      const existingErrorIds = await getErrorsByFingerprint(fingerprint);

      if (existingErrorIds && existingErrorIds.length > 0) {
        // Duplicate error - increment count
        const existingId = existingErrorIds[0];
        await incrementErrorCount(existingId);

        console.log(`[ErrorTracker] Duplicate error detected: ${existingId}`);
        return existingId;
      }

      // 3. Create new error record
      const errorId = crypto.randomUUID();
      const severity = classifyErrorSeverity(error, context);

      const errorRecord: ErrorRecord = {
        // Identity
        id: errorId,
        fingerprint,

        // Error Details
        message: maskSensitiveData(error.message),
        stack: maskSensitiveData(error.stack || ''),
        name: extractErrorName(error),

        // Metadata
        timestamp: Date.now(),
        severity,

        // Context (anonymize user data for privacy)
        userId: context.userId ? anonymizeUserId(context.userId) : undefined,
        sessionId: context.sessionId,

        // Request Info
        path: context.path,
        method: context.method,
        userAgent: context.userAgent,

        // Next.js Context
        routePath: context.routePath,
        routeType: context.routeType,
        renderSource: context.renderSource,

        // Deduplication
        count: 1,
        firstSeen: Date.now(),
        lastSeen: Date.now(),

        // Status
        resolved: false,
      };

      // 4. Save to Redis
      await saveError(errorRecord);

      console.log(`[ErrorTracker] New error captured: ${errorId} (${severity})`);

      // 5. Send alert if critical or error
      if (severity === 'critical' || severity === 'error') {
        await this.sendAlert(errorRecord);
      }

      return errorId;
    } catch (err) {
      // Fail silently to not break the application
      console.error('[ErrorTracker] Failed to capture error:', err);
      return 'error-tracking-failed';
    }
  }

  /**
   * Send alert via webhook
   */
  private static async sendAlert(error: ErrorRecord): Promise<void> {
    try {
      // Check webhook URL
      const webhookUrl = process.env.ERROR_ALERT_WEBHOOK_URL;
      if (!webhookUrl) {
        console.log('[ErrorTracker] No webhook URL configured, skipping alert');
        return;
      }

      // Rate limiting: don't send duplicate alerts within 1 minute
      const alreadySent = await wasAlertRecentlySent(error.fingerprint);
      if (alreadySent) {
        console.log(`[ErrorTracker] Alert already sent for ${error.fingerprint}`);
        return;
      }

      // Prepare webhook payload
      const dashboardUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/errors/${error.id}`;

      const payload: WebhookPayload = {
        severity: error.severity,
        message: error.message,
        path: error.path,
        timestamp: formatTimestamp(error.timestamp),
        dashboardUrl,
        count: error.count,
        firstSeen: formatTimestamp(error.firstSeen),
      };

      // Send webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error('[ErrorTracker] Webhook failed:', response.statusText);
        return;
      }

      // Mark alert as sent (with 60 second TTL)
      await markAlertSent(error.fingerprint, 60);

      console.log(`[ErrorTracker] Alert sent for ${error.id}`);
    } catch (err) {
      console.error('[ErrorTracker] Failed to send alert:', err);
    }
  }

  /**
   * Get recent errors
   */
  static async getRecentErrors(limit: number = 50) {
    return getRecentErrors({ limit, sortOrder: 'desc' });
  }

  /**
   * Get error statistics
   */
  static async getStats() {
    return getErrorStats();
  }

  /**
   * Get single error by ID
   */
  static async getError(errorId: string) {
    return getError(errorId);
  }

  /**
   * Resolve an error
   */
  static async resolveError(errorId: string, resolvedBy: string, notes?: string) {
    return resolveError(errorId, resolvedBy, notes);
  }

  /**
   * Unresolve an error
   */
  static async unresolveError(errorId: string) {
    return unresolveError(errorId);
  }

  /**
   * Delete an error
   */
  static async deleteError(errorId: string) {
    return deleteError(errorId);
  }

  /**
   * Get top errors by frequency
   */
  static async getTopErrors(limit: number = 10) {
    return getTopErrors(limit);
  }
}

// Export for convenience
export { getRecentErrors, getErrorStats, getError };
