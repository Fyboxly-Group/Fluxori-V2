/**
 * Error reporting service for Fluxori-V2 Frontend
 * 
 * This service provides:
 * - Error capturing and processing
 * - Categorization of errors
 * - Standardized error formatting
 * - Integration with analytics
 * - Error sampling for high-frequency issues
 * - Breadcrumb tracking for error context
 */

type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info';

interface ErrorContext {
  userId?: string;
  component?: string;
  route?: string;
  action?: string;
  additionalData?: Record<string, any>;
}

interface ErrorReport {
  message: string;
  stack?: string;
  type: string;
  severity: ErrorSeverity;
  timestamp: string;
  userAgent: string;
  url: string;
  context: ErrorContext;
  breadcrumbs: Breadcrumb[];
}

interface Breadcrumb {
  message: string;
  timestamp: string;
  category: string;
  level: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}

// Configuration
const MAX_BREADCRUMBS = 20;
const SAMPLING_RATE = 1.0; // 1.0 = 100% of errors are reported
const ERROR_ENDPOINT = process.env.NEXT_PUBLIC_ERROR_ENDPOINT || '/api/errors';

// Global state
let breadcrumbs: Breadcrumb[] = [];
let errorCount = 0;
let lastErrorTimestamp = 0;
let isInitialized = false;

/**
 * Initialize the error reporting service
 */
export function initErrorReporting(): void {
  if (isInitialized || typeof window === 'undefined') {
    return;
  }

  // Set up global error handler
  const originalOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    if (originalOnError) {
      originalOnError.call(window, message, source, lineno, colno, error);
    }

    handleError(error || new Error(message as string), {
      severity: 'error',
    });

    return false;
  };

  // Set up unhandled promise rejection handler
  const originalOnUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = (event) => {
    if (originalOnUnhandledRejection) {
      originalOnUnhandledRejection.call(window, event);
    }

    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(`Unhandled Promise rejection: ${String(event.reason)}`);
    
    handleError(error, {
      severity: 'error',
      context: {
        additionalData: { unhandledRejection: true }
      }
    });
  };

  isInitialized = true;
  addBreadcrumb('Error reporting initialized', 'system', 'info');
}

/**
 * Add a breadcrumb to provide context for future errors
 */
export function addBreadcrumb(
  message: string, 
  category: string = 'general', 
  level: 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, any>
): void {
  breadcrumbs.push({
    message,
    timestamp: new Date().toISOString(),
    category,
    level,
    data,
  });

  // Limit the number of breadcrumbs
  if (breadcrumbs.length > MAX_BREADCRUMBS) {
    breadcrumbs = breadcrumbs.slice(-MAX_BREADCRUMBS);
  }
}

/**
 * Clear all breadcrumbs
 */
export function clearBreadcrumbs(): void {
  breadcrumbs = [];
}

/**
 * Manually report an error
 */
export function reportError(
  error: Error | string,
  options: {
    severity?: ErrorSeverity;
    context?: ErrorContext;
    silent?: boolean;
  } = {}
): void {
  const errorObj = typeof error === 'string' ? new Error(error) : error;
  handleError(errorObj, options);
}

/**
 * Main error handler
 */
function handleError(
  error: Error,
  options: {
    severity?: ErrorSeverity;
    context?: ErrorContext;
    silent?: boolean;
  } = {}
): void {
  // Apply rate limiting and sampling to avoid flooding
  const now = Date.now();
  errorCount++;

  // If we had more than 10 errors in the last 10 seconds, start sampling
  if (now - lastErrorTimestamp < 10000 && errorCount > 10) {
    // Sample errors based on sampling rate
    if (Math.random() > SAMPLING_RATE) {
      return;
    }
  } else if (now - lastErrorTimestamp >= 10000) {
    // Reset counter after 10 seconds
    errorCount = 1;
  }

  lastErrorTimestamp = now;

  // Log to console if not silenced
  if (!options.silent) {
    console.error('Error captured:', error);
  }

  // Prepare error report
  const errorReport: ErrorReport = {
    message: error.message,
    stack: error.stack,
    type: error.name || 'Error',
    severity: options.severity || 'error',
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    context: {
      ...getCurrentContext(),
      ...options.context,
    },
    breadcrumbs: [...breadcrumbs],
  };

  // Send to error tracking service
  sendErrorReport(errorReport);

  // Track in analytics if available
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', 'error', {
      'event_category': errorReport.type,
      'event_label': errorReport.message,
      'value': 1
    });
  }
}

/**
 * Get current context information
 */
function getCurrentContext(): ErrorContext {
  if (typeof window === 'undefined') {
    return {};
  }

  // Try to get user ID from local storage
  let userId: string | undefined;
  try {
    const user = localStorage.getItem('user');
    if (user) {
      userId = JSON.parse(user).id;
    }
  } catch (e) {
    // Ignore storage errors
  }

  return {
    userId,
    route: window.location.pathname,
  };
}

/**
 * Send error report to backend
 */
async function sendErrorReport(report: ErrorReport): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const response = await fetch(ERROR_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(report),
      // Use keepalive to ensure the request completes even if the page is unloading
      keepalive: true,
    });

    if (!response.ok) {
      console.error('Failed to send error report:', await response.text());
    }
  } catch (e) {
    // Don't report errors from the error reporter to avoid infinite loops
    console.error('Error reporting failed:', e);
  }
}

/**
 * Create a wrapped version of a function that reports errors
 */
export function withErrorReporting<T extends Function>(
  fn: T,
  options: {
    name?: string;
    context?: ErrorContext;
    severity?: ErrorSeverity;
  } = {}
): T {
  const wrappedFn = function (this: any, ...args: any[]) {
    try {
      return fn.apply(this, args);
    } catch (error) {
      reportError(error as Error, {
        severity: options.severity || 'error',
        context: {
          ...options.context,
          action: options.name || fn.name,
          additionalData: { arguments: args.map(sanitizeArgument) }
        }
      });
      throw error; // Re-throw to preserve original behavior
    }
  } as any;

  return wrappedFn as T;
}

/**
 * Sanitize argument for logging (to avoid sensitive data)
 */
function sanitizeArgument(arg: any): any {
  if (arg === null || arg === undefined) {
    return arg;
  }

  // Don't include DOM elements or functions
  if (typeof arg === 'function' || (typeof Element !== 'undefined' && arg instanceof Element)) {
    return `[${typeof arg}]`;
  }

  // For objects, create a sanitized copy
  if (typeof arg === 'object') {
    // Avoid circular references and huge objects
    try {
      const sanitized = { ...arg };
      
      // Remove potentially sensitive fields
      const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
      for (const key in sanitized) {
        if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
          sanitized[key] = '[Object]';
        }
      }
      
      return sanitized;
    } catch (e) {
      return '[Complex Object]';
    }
  }

  return arg;
}

/**
 * Create an async error boundary that executes the function and catches errors
 */
export async function asyncErrorBoundary<T>(
  fn: () => Promise<T>,
  options: {
    fallback?: T;
    context?: ErrorContext;
    severity?: ErrorSeverity;
    rethrow?: boolean;
  } = {}
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    reportError(error as Error, {
      severity: options.severity || 'error',
      context: options.context
    });
    
    if (options.rethrow) {
      throw error;
    }
    
    return options.fallback as T;
  }
}

export default {
  initErrorReporting,
  reportError,
  addBreadcrumb,
  clearBreadcrumbs,
  withErrorReporting,
  asyncErrorBoundary
};