/**
 * Monitoring service for Fluxori-V2 Frontend
 * 
 * This service integrates:
 * - Error reporting
 * - Performance monitoring
 * - User behavior tracking
 * - Health checking
 */

import errorReporting from './errorReporting';
import performanceMonitoring from './performanceMonitoring';

// Monitoring configuration
export interface MonitoringConfig {
  // General
  enabled?: boolean;
  environment?: 'development' | 'staging' | 'production';
  release?: string;
  
  // Error reporting
  errorEndpoint?: string;
  captureUnhandledErrors?: boolean;
  errorSamplingRate?: number;
  
  // Performance monitoring
  performanceEndpoint?: string;
  performanceSamplingRate?: number;
  metricsSendInterval?: number;
  
  // User information
  userId?: string;
  sessionId?: string;
  featureFlags?: Record<string, boolean>;
}

// Default configuration
const DEFAULT_CONFIG: MonitoringConfig = {
  enabled: process.env.NODE_ENV === 'production',
  environment: (process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV) as 'development' | 'staging' | 'production',
  captureUnhandledErrors: true,
  errorSamplingRate: 1.0,  // 100%
  performanceSamplingRate: 0.1,  // 10%
  metricsSendInterval: 10000, // 10 seconds
};

let isInitialized = false;
let currentConfig: MonitoringConfig = { ...DEFAULT_CONFIG };
let sessionStartTime: number = 0;
let heartbeatInterval: NodeJS.Timeout | null = null;

/**
 * Initialize the monitoring service
 */
export function initMonitoring(config: MonitoringConfig = {}): void {
  if (isInitialized || typeof window === 'undefined') {
    return;
  }

  // Merge configs
  currentConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  // Don't initialize if disabled
  if (!currentConfig.enabled) {
    console.log('Monitoring is disabled');
    return;
  }

  try {
    // Record session start time
    sessionStartTime = Date.now();
    
    // Initialize error reporting
    errorReporting.initErrorReporting();
    
    // Add initial breadcrumbs
    errorReporting.addBreadcrumb('Session started', 'session', 'info', {
      url: window.location.href,
      referrer: document.referrer,
    });
    
    // Initialize performance monitoring
    performanceMonitoring.initPerformanceMonitoring({
      forceEnable: Math.random() < (currentConfig.performanceSamplingRate || 0.1),
      sendIntervalMs: currentConfig.metricsSendInterval,
    });
    
    // Track page views
    trackPageView();
    
    // Set up page change tracking for SPAs
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      const result = originalPushState.apply(this, args);
      trackPageView();
      return result;
    };
    
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        errorReporting.addBreadcrumb('Page became visible', 'visibility', 'info');
      } else {
        errorReporting.addBreadcrumb('Page became hidden', 'visibility', 'info');
      }
    });
    
    // Set up heartbeat to track session duration
    heartbeatInterval = setInterval(() => {
      const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
      performanceMonitoring.reportPerformanceMetric({
        name: 'session.duration',
        value: sessionDuration,
        rating: 'good'
      });
    }, 60000); // Send every minute

    // Log successful initialization
    errorReporting.addBreadcrumb('Monitoring initialized', 'monitoring', 'info', {
      environment: currentConfig.environment,
      release: currentConfig.release,
    });
    
    isInitialized = true;
  } catch (err) {
    console.error('Failed to initialize monitoring:', err);
  }
}

/**
 * Clean up monitoring service
 */
export function cleanupMonitoring(): void {
  if (!isInitialized) {
    return;
  }

  try {
    // Clear heartbeat
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
    
    // Clean up performance monitoring
    performanceMonitoring.cleanupPerformanceMonitoring();
    
    isInitialized = false;
  } catch (err) {
    console.error('Error during monitoring cleanup:', err);
  }
}

/**
 * Track a page view
 */
function trackPageView(): void {
  if (!isInitialized) return;
  
  try {
    const url = window.location.href;
    const path = window.location.pathname;
    
    // Add breadcrumb for error context
    errorReporting.addBreadcrumb('Page view', 'navigation', 'info', {
      url,
      path,
      referrer: document.referrer
    });
    
    // Start performance measurement for page render
    performanceMonitoring.markPerformanceStart(`pageRender:${path}`);
    
    // Wait for page to finish rendering
    setTimeout(() => {
      performanceMonitoring.markPerformanceEnd(`pageRender:${path}`, {
        reportNow: true,
        category: 'navigation'
      });
    }, 1000);
  } catch (err) {
    console.error('Error tracking page view:', err);
  }
}

/**
 * Set user information
 */
export function setUserInfo(userId: string, additionalInfo: Record<string, any> = {}): void {
  if (!isInitialized) return;
  
  try {
    // Update config
    currentConfig.userId = userId;
    
    // Add breadcrumb
    errorReporting.addBreadcrumb('User identified', 'user', 'info', {
      userId,
      ...additionalInfo
    });
  } catch (err) {
    console.error('Error setting user info:', err);
  }
}

/**
 * Set feature flags
 */
export function setFeatureFlags(flags: Record<string, boolean>): void {
  if (!isInitialized) return;
  
  try {
    // Update config
    currentConfig.featureFlags = flags;
    
    // Add breadcrumb
    errorReporting.addBreadcrumb('Feature flags updated', 'feature', 'info', {
      flags
    });
  } catch (err) {
    console.error('Error setting feature flags:', err);
  }
}

/**
 * Add a custom breadcrumb
 */
export function addBreadcrumb(
  message: string,
  category: string = 'custom',
  level: 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, any>
): void {
  if (!isInitialized) return;
  
  errorReporting.addBreadcrumb(message, category, level, data);
}

/**
 * Manually report an error
 */
export function reportError(
  error: Error | string,
  options: {
    severity?: 'fatal' | 'error' | 'warning' | 'info';
    context?: Record<string, any>;
    silent?: boolean;
  } = {}
): void {
  if (!isInitialized) return;
  
  errorReporting.reportError(error, options);
}

/**
 * Start measuring a performance metric
 */
export function startMeasure(name: string): void {
  if (!isInitialized) return;
  
  performanceMonitoring.markPerformanceStart(name);
}

/**
 * End measuring a performance metric
 */
export function endMeasure(
  name: string,
  options: {
    reportNow?: boolean;
    category?: string;
  } = {}
): number | null {
  if (!isInitialized) return null;
  
  return performanceMonitoring.markPerformanceEnd(name, options);
}

/**
 * Report a custom performance metric
 */
export function reportMetric(
  name: string,
  value: number,
  rating: 'good' | 'needs-improvement' | 'poor' = 'good'
): void {
  if (!isInitialized) return;
  
  performanceMonitoring.reportPerformanceMetric({
    name,
    value,
    rating
  });
}

/**
 * Start monitoring FPS for animations
 */
export function startPerformanceTracking(): void {
  if (!isInitialized) return;
  
  performanceMonitoring.startFpsMonitoring();
}

/**
 * Stop monitoring FPS
 */
export function stopPerformanceTracking(): void {
  if (!isInitialized) return;
  
  performanceMonitoring.stopFpsMonitoring();
}

/**
 * Get current performance metrics
 */
export function getPerformanceMetrics(): any {
  if (!isInitialized) return {};
  
  return performanceMonitoring.getAnimationMetrics();
}

/**
 * Create a function with error reporting
 */
export function withErrorHandling<T extends Function>(
  fn: T,
  options: {
    name?: string;
    context?: Record<string, any>;
    severity?: 'fatal' | 'error' | 'warning' | 'info';
  } = {}
): T {
  if (!isInitialized) return fn;
  
  return errorReporting.withErrorReporting(fn, options);
}

/**
 * Create a component with performance tracking
 */
export function withPerformanceTracking<T extends React.ComponentType<any>>(
  Component: T,
  options: {
    componentName?: string;
    reportThreshold?: number;
  } = {}
): T {
  if (!isInitialized) return Component;
  
  return performanceMonitoring.withPerformanceTracking(Component, options);
}

// Export individual services for advanced usage
export { errorReporting, performanceMonitoring };

// Default export with all essential functions
export default {
  init: initMonitoring,
  cleanup: cleanupMonitoring,
  setUserInfo,
  setFeatureFlags,
  addBreadcrumb,
  reportError,
  startMeasure,
  endMeasure,
  reportMetric,
  startPerformanceTracking,
  stopPerformanceTracking,
  getPerformanceMetrics,
  withErrorHandling,
  withPerformanceTracking
};