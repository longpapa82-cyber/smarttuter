/**
 * Error Tracking System - Server-side Export
 * @module server-only
 *
 * For client-side error tracking, use:
 * import { captureClientError } from '@/lib/error-tracking/client'
 */

import 'server-only';

export { ErrorTracker } from './core';
export * from './types';
export * from './utils';
export * from './redis';
