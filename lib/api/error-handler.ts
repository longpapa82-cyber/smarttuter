/**
 * API Error Handling Utilities
 * Centralized error handling for API requests
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  code?: string;
  details?: unknown;
}

/**
 * Parse API error response
 */
export async function parseApiError(response: Response): Promise<ApiError> {
  let errorData: Partial<ApiErrorResponse> = {};

  try {
    errorData = await response.json();
  } catch {
    // If response is not JSON, use status text
    errorData = {
      error: response.statusText || 'Unknown Error',
      message: `Request failed with status ${response.status}`,
      statusCode: response.status,
    };
  }

  return new ApiError(
    errorData.message || errorData.error || 'An error occurred',
    errorData.statusCode || response.status,
    errorData.code,
    errorData.details
  );
}

/**
 * Handle API request with error handling
 */
export async function fetchWithErrorHandling<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw await parseApiError(response);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network errors or other exceptions
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error occurred',
      0,
      'NETWORK_ERROR'
    );
  }
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    // Map common API errors to user-friendly messages
    switch (error.statusCode) {
      case 400:
        return '잘못된 요청입니다. 입력 내용을 확인해 주세요.';
      case 401:
        return '인증이 필요합니다. 다시 로그인해 주세요.';
      case 403:
        return '접근 권한이 없습니다.';
      case 404:
        return '요청한 정보를 찾을 수 없습니다.';
      case 409:
        return '중복된 요청입니다.';
      case 429:
        return '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해 주세요.';
      case 500:
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
      case 503:
        return '서비스를 일시적으로 사용할 수 없습니다.';
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '알 수 없는 오류가 발생했습니다.';
}

/**
 * Retry failed request with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry client errors (4xx)
      if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
        throw error;
      }

      // Wait before retry with exponential backoff
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

/**
 * Create standard API error response
 */
export function createErrorResponse(
  message: string,
  statusCode: number,
  code?: string,
  details?: unknown
): Response {
  const errorResponse: ApiErrorResponse = {
    error: message,
    message,
    statusCode,
    code,
    details,
  };

  return new Response(JSON.stringify(errorResponse), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: Record<string, unknown>,
  requiredFields: string[]
): { valid: boolean; missing: string[] } {
  const missing = requiredFields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || value === '';
  });

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Safe JSON parse with error handling
 */
export async function safeJsonParse<T = unknown>(
  request: Request
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await request.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid JSON',
    };
  }
}
