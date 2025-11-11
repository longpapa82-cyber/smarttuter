/**
 * Error Tracking System - Type Definitions
 */

export type ErrorSeverity = 'critical' | 'error' | 'warning' | 'info';

export type RouteType = 'render' | 'route' | 'action' | 'middleware';

export interface ErrorContext {
  // Request Info
  path: string;
  method: string;
  userAgent: string;

  // Next.js Context
  routePath: string;
  routeType: RouteType;
  renderSource: string;

  // User Context
  sessionId: string;
  userId?: string;

  // Additional Context
  revalidateReason?: 'on-demand' | 'stale';
  renderType?: 'dynamic' | 'dynamic-resume';
}

export interface ErrorRecord {
  // Identity
  id: string;
  fingerprint: string;

  // Error Details
  message: string;
  stack: string;
  name: string;

  // Metadata
  timestamp: number;
  severity: ErrorSeverity;

  // Context
  userId?: string; // Anonymized if student
  sessionId: string;

  // Request Info
  path: string;
  method: string;
  userAgent: string;

  // Next.js Context
  routePath: string;
  routeType: RouteType;
  renderSource: string;

  // Deduplication
  count: number;
  firstSeen: number;
  lastSeen: number;

  // Status
  resolved: boolean;
  resolvedAt?: number;
  resolvedBy?: string;
  notes?: string;

  // Index signature for Redis compatibility
  [key: string]: string | number | boolean | undefined;
}

export interface ErrorStats {
  // Total counts
  total: number;
  resolved: number;
  unresolved: number;

  // By severity
  bySeverity: {
    critical: number;
    error: number;
    warning: number;
    info: number;
  };

  // By route
  byRoute: Record<string, number>;

  // Trends
  last24Hours: number;
  last7Days: number;
  last30Days: number;
}

export interface ErrorListQuery {
  // Filtering
  severity?: ErrorSeverity;
  resolved?: boolean;
  route?: string;

  // Pagination
  limit?: number;
  offset?: number;

  // Sorting
  sortBy?: 'timestamp' | 'count' | 'severity';
  sortOrder?: 'asc' | 'desc';
}

export interface WebhookPayload {
  severity: ErrorSeverity;
  message: string;
  path: string;
  timestamp: string;
  dashboardUrl: string;
  count: number;
  firstSeen: string;
}
