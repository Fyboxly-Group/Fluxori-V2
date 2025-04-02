/**
 * Error monitoring and reporting utilities
 * 
 * This module provides a unified interface for error reporting that could be 
 * connected to services like Sentry, LogRocket, or custom monitoring.
 */
import { AppError, shouldReportError } from './error.utils';
import { config } from '@/config';


// App configuration interface
interface AppConfig {
  monitoring?: {
    enabled: boolean;
    level: string;
    endpoint?: string;
  };
  [key: string]: any;
}

// Error category type
type ErrorCategory = 'api' | 'validation' | 'auth' | 'network' | 'unexpected';
// Track if monitoring is initialized
let isInitialized = false;

/**
 * Initialize error monitoring
 */
export function initializeMonitoring(): void {
  if (isInitialized) return;
  
  // Only initialize in production or if explicitly enabled
  if (process.env.NODE_ENV !== 'production' && !(config?.monitoring?.forceEnable)) {
    console.info('Error monitoring disabled in development. Set config.monitoring || {} || {} || {}.forceEnable = true to enable.');
    return;
  }
  
  // Would initialize monitoring service here, e.g.:
  // Sentry.init({
  //   dsn: config.monitoring || {} || {} || {}.sentryDsn,
  //   environment: config.monitoring || {} || {} || {}.environment,
  //   release: config.monitoring || {} || {} || {}.release,
  // });
  
  isInitialized = true;
  
  // Add global error handlers
  setupGlobalErrorHandlers();
}

/**
 * Setup global error handlers
 */
function setupGlobalErrorHandlers(): void {
  // Handle uncaught errors
  window.addEventListener('error', (event: any) => {
    captureException({
      message: event.message || 'Uncaught error',
      category: 'unexpected',
      timestamp: new Date(),
      originalError: event.error,
      technicalMessage: event.error?.stack,
    });
  });
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event: any) => {
    captureException({
      message: event.reason?.message || 'Unhandled promise rejection',
      category: 'unexpected',
      timestamp: new Date(),
      originalError: event.reason,
      technicalMessage: event.reason?.stack,
    });
  });
}

/**
 * Capture and report an exception to monitoring service
 */
export function captureException(error: AppError | Error | any, context?: Record<string, any>): void {
  // Convert to AppError if it's not already
  const appError = error.category 
    ? error as AppError
    : {
        message: error.message || 'Unknown error',
        category: 'unexpected',
        timestamp: new Date(),
        originalError: error,
        technicalMessage: error.stack,
      };
    
  // Check if this error should be reported
  if (!shouldReportError(appError)) {
    // Just log to console but don't send to monitoring
    console.warn('Error not reported to monitoring (filtered):', appError);
    return;
  }
  
  // In development, just log to console
  if (process.env.NODE_ENV !== 'production' && !(config?.monitoring?.forceEnable)) {
    console.error('Error would be reported to monitoring:', appError);
    return;
  }
  
  // Prepare context data
  const errorContext = {
    ...context,
    url: window.location.href,
    timestamp: appError.timestamp.toISOString(),
    category: appError.category,
    statusCode: appError.statusCode,
    code: appError.code,
  };
  
  // Would send to monitoring service here, e.g.:
  // Sentry.captureException(appError.originalError || appError, {
  //   tags: {
  //     category: appError.category,
  //     statusCode: appError.statusCode,
  //   },
  //   extra: errorContext,
  // });
  
  // For now, just log to console
  console.error('Error reported to monitoring:', {
    error: appError,
    context: errorContext,
  });
}

/**
 * Set user context for error reporting
 */
export function setUserContext(user: { id: string; email?: string; role?: string }): void {
  if (!isInitialized) return;
  
  // Would set user context in monitoring service here, e.g.:
  // Sentry.setUser({
  //   id: user.id,
  //   email: user.email,
  //   role: user.role,
  // });
}

/**
 * Clear user context for error reporting (e.g. on logout)
 */
export function clearUserContext(): void {
  if (!isInitialized) return;
  
  // Would clear user context in monitoring service here, e.g.:
  // Sentry.setUser(null);
}

export default {
  initializeMonitoring,
  captureException,
  setUserContext,
  clearUserContext,
};