/**
 * Performance monitoring service for Fluxori-V2 Frontend
 * 
 * This service provides:
 * - Web Vitals tracking
 * - Custom performance marking and measuring
 * - Component render timing
 * - Animation performance tracking
 * - Resource timing analysis
 * - User-centric performance metrics
 */

import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

type MetricName = 
  | 'CLS'   // Cumulative Layout Shift
  | 'FID'   // First Input Delay
  | 'LCP'   // Largest Contentful Paint
  | 'FCP'   // First Contentful Paint
  | 'TTFB'  // Time to First Byte
  | 'TTI'   // Time to Interactive
  | 'TBT'   // Total Blocking Time
  | 'FPS'   // Frames Per Second
  | 'custom'; // Custom metric

export interface PerformanceMetric {
  name: MetricName | string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id?: string;
  navigationType?: 'navigate' | 'reload' | 'back-forward';
}

interface PerformanceMarks {
  [key: string]: number;
}

interface AnimationMetrics {
  totalAnimations: number;
  slowAnimations: number;
  averageFps: number;
  lastFrameTime: number;
  worstFrameTime: number;
}

// Configuration
const PERFORMANCE_ENDPOINT = process.env.NEXT_PUBLIC_PERFORMANCE_ENDPOINT || '/api/performance';
const FPS_THRESHOLD = 30; // FPS below this threshold is considered slow
const SAMPLE_RATE = 0.1; // Only sample 10% of users for detailed performance monitoring

// Internal state
let marks: PerformanceMarks = {};
let isInitialized = false;
let isEnabled = false;
let metricQueue: PerformanceMetric[] = [];
let sendInterval: NodeJS.Timeout | null = null;
let animationMetrics: AnimationMetrics = {
  totalAnimations: 0,
  slowAnimations: 0,
  averageFps: 60,
  lastFrameTime: 0,
  worstFrameTime: 0
};

// FPS monitoring
let frameCount = 0;
let lastFrameTimestamp = 0;
let frameTimes: number[] = [];
let fpsMonitoringActive = false;
let rafId: number | null = null;

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring(options: { 
  forceEnable?: boolean;
  sendIntervalMs?: number;
} = {}): void {
  if (isInitialized || typeof window === 'undefined') {
    return;
  }

  // Use sampling to only enable for some users
  if (options.forceEnable || Math.random() < SAMPLE_RATE) {
    isEnabled = true;
  } else {
    return;
  }

  // Initialize Web Vitals monitoring
  getCLS(handleWebVital);
  getFID(handleWebVital);
  getLCP(handleWebVital);
  getFCP(handleWebVital);
  getTTFB(handleWebVital);

  // Set up metric sending interval
  const sendIntervalMs = options.sendIntervalMs || 10000; // Default: send every 10 seconds
  sendInterval = setInterval(() => {
    flushMetrics();
  }, sendIntervalMs);

  // Set up PerformanceObserver for resource timing
  if ('PerformanceObserver' in window) {
    try {
      // Monitor resource loading
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            analyzeResourceTiming(entry as PerformanceResourceTiming);
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });

      // Monitor long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          reportPerformanceMetric({
            name: 'TBT',
            value: entry.duration,
            rating: entry.duration > 100 ? 'poor' : entry.duration > 50 ? 'needs-improvement' : 'good'
          });
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });

      // Monitor navigation timing
      const navigationObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            analyzeNavigationTiming(entry as PerformanceNavigationTiming);
          }
        });
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
    } catch (e) {
      console.error('PerformanceObserver error:', e);
    }
  }

  isInitialized = true;
}

/**
 * Clean up performance monitoring
 */
export function cleanupPerformanceMonitoring(): void {
  if (!isInitialized) {
    return;
  }

  if (sendInterval) {
    clearInterval(sendInterval);
    sendInterval = null;
  }

  stopFpsMonitoring();
  flushMetrics();
  isInitialized = false;
}

/**
 * Handle Web Vitals metrics
 */
function handleWebVital(metric: any): void {
  if (!isEnabled) return;

  // Transform to our standard format
  const standardMetric: PerformanceMetric = {
    name: metric.name as MetricName,
    value: metric.value,
    rating: getRating(metric.name, metric.value),
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType
  };

  reportPerformanceMetric(standardMetric);
}

/**
 * Get rating based on metric name and value
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  // Thresholds based on Web Vitals recommendations
  switch (name) {
    case 'CLS':
      return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
    case 'LCP':
      return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
    case 'FID':
      return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
    case 'FCP':
      return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
    case 'TTFB':
      return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
    case 'TTI':
      return value <= 3800 ? 'good' : value <= 7300 ? 'needs-improvement' : 'poor';
    case 'TBT':
      return value <= 200 ? 'good' : value <= 600 ? 'needs-improvement' : 'poor';
    case 'FPS':
      return value >= 50 ? 'good' : value >= 30 ? 'needs-improvement' : 'poor';
    default:
      return 'good'; // Default for custom metrics
  }
}

/**
 * Mark the start of a performance measurement
 */
export function markPerformanceStart(markName: string): void {
  if (!isEnabled) return;

  marks[markName] = performance.now();
  
  // Also use the native Performance API if available
  if (performance && performance.mark) {
    performance.mark(`${markName}:start`);
  }
}

/**
 * Mark the end of a performance measurement and record the duration
 */
export function markPerformanceEnd(
  markName: string, 
  options: { 
    reportNow?: boolean,
    category?: string
  } = {}
): number | null {
  if (!isEnabled) return null;

  const startTime = marks[markName];
  if (startTime === undefined) {
    console.warn(`No start mark found for "${markName}"`);
    return null;
  }

  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // Use the native Performance API if available
  if (performance && performance.mark && performance.measure) {
    performance.mark(`${markName}:end`);
    try {
      performance.measure(markName, `${markName}:start`, `${markName}:end`);
    } catch (e) {
      // Some browsers might throw if the marks don't exist
      console.warn(`Failed to measure "${markName}":`, e);
    }
  }
  
  // Clean up the mark
  delete marks[markName];
  
  // Report as a custom metric
  const metric: PerformanceMetric = {
    name: options.category ? `${options.category}.${markName}` : markName,
    value: duration,
    rating: duration < 100 ? 'good' : duration < 300 ? 'needs-improvement' : 'poor'
  };
  
  if (options.reportNow) {
    sendMetricImmediately(metric);
  } else {
    reportPerformanceMetric(metric);
  }
  
  return duration;
}

/**
 * Start monitoring FPS for animations
 */
export function startFpsMonitoring(): void {
  if (!isEnabled || fpsMonitoringActive || typeof window === 'undefined') {
    return;
  }
  
  fpsMonitoringActive = true;
  frameCount = 0;
  lastFrameTimestamp = performance.now();
  frameTimes = [];
  
  function frameCallback(timestamp: number) {
    if (!fpsMonitoringActive) return;
    
    // Calculate time since last frame
    const deltaTime = timestamp - lastFrameTimestamp;
    lastFrameTimestamp = timestamp;
    
    // Track frame times for the last 60 frames
    frameTimes.push(deltaTime);
    if (frameTimes.length > 60) {
      frameTimes.shift();
    }
    
    // Update metrics
    frameCount++;
    animationMetrics.lastFrameTime = deltaTime;
    animationMetrics.worstFrameTime = Math.max(animationMetrics.worstFrameTime, deltaTime);
    
    // Calculate current FPS every second
    if (frameCount % 60 === 0) {
      const avgFrameTime = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
      const currentFps = 1000 / avgFrameTime;
      
      // Update animation metrics
      animationMetrics.totalAnimations++;
      if (currentFps < FPS_THRESHOLD) {
        animationMetrics.slowAnimations++;
      }
      
      // Exponential moving average for FPS (alpha = 0.3)
      animationMetrics.averageFps = 0.3 * currentFps + 0.7 * animationMetrics.averageFps;
      
      // Report FPS as a metric
      reportPerformanceMetric({
        name: 'FPS',
        value: currentFps,
        rating: getRating('FPS', currentFps)
      });
    }
    
    // Continue monitoring
    rafId = requestAnimationFrame(frameCallback);
  }
  
  // Start the loop
  rafId = requestAnimationFrame(frameCallback);
}

/**
 * Stop monitoring FPS
 */
export function stopFpsMonitoring(): void {
  fpsMonitoringActive = false;
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

/**
 * Get current animation performance metrics
 */
export function getAnimationMetrics(): AnimationMetrics {
  return { ...animationMetrics };
}

/**
 * Analyze resource timing data
 */
function analyzeResourceTiming(entry: PerformanceResourceTiming): void {
  if (!isEnabled) return;
  
  // Extract the file extension and resource type
  const url = new URL(entry.name);
  const pathname = url.pathname;
  const fileExtension = pathname.split('.').pop() || '';
  
  // Categorize the resource
  let resourceCategory = 'other';
  if (/js$/.test(fileExtension)) {
    resourceCategory = 'script';
  } else if (/css$/.test(fileExtension)) {
    resourceCategory = 'style';
  } else if (/png|jpg|jpeg|gif|webp|svg/.test(fileExtension)) {
    resourceCategory = 'image';
  } else if (/woff|woff2|ttf|otf/.test(fileExtension)) {
    resourceCategory = 'font';
  }
  
  // Calculate key timings
  const dnsTime = entry.domainLookupEnd - entry.domainLookupStart;
  const connectionTime = entry.connectEnd - entry.connectStart;
  const ttfb = entry.responseStart - entry.requestStart;
  const downloadTime = entry.responseEnd - entry.responseStart;
  const totalTime = entry.responseEnd - entry.startTime;
  
  // Only report resources that take a significant amount of time
  if (totalTime > 500) {
    reportPerformanceMetric({
      name: `resource.${resourceCategory}.total`,
      value: totalTime,
      rating: totalTime > 1000 ? 'poor' : totalTime > 500 ? 'needs-improvement' : 'good'
    });
    
    // Log slow resources for debugging
    console.debug(`Slow resource load (${Math.round(totalTime)}ms): ${pathname}`);
  }
  
  // Report TTFB for key resources
  if ((resourceCategory === 'script' || resourceCategory === 'style') && ttfb > 300) {
    reportPerformanceMetric({
      name: `resource.${resourceCategory}.ttfb`,
      value: ttfb,
      rating: ttfb > 500 ? 'poor' : ttfb > 300 ? 'needs-improvement' : 'good'
    });
  }
}

/**
 * Analyze navigation timing data
 */
function analyzeNavigationTiming(entry: PerformanceNavigationTiming): void {
  if (!isEnabled) return;
  
  // Calculate key navigation timings
  const dnsTime = entry.domainLookupEnd - entry.domainLookupStart;
  const connectionTime = entry.connectEnd - entry.connectStart;
  const ttfb = entry.responseStart - entry.requestStart;
  const domProcessingTime = entry.domComplete - entry.responseEnd;
  const loadEventTime = entry.loadEventEnd - entry.loadEventStart;
  
  // Report important navigation metrics
  reportPerformanceMetric({
    name: 'navigation.ttfb',
    value: ttfb,
    rating: getRating('TTFB', ttfb)
  });
  
  reportPerformanceMetric({
    name: 'navigation.domProcessing',
    value: domProcessingTime,
    rating: domProcessingTime > 1000 ? 'poor' : domProcessingTime > 500 ? 'needs-improvement' : 'good'
  });
  
  // Approximation of Time to Interactive (TTI)
  const tti = entry.domInteractive - entry.startTime;
  reportPerformanceMetric({
    name: 'TTI',
    value: tti,
    rating: getRating('TTI', tti)
  });
}

/**
 * Report a performance metric
 */
export function reportPerformanceMetric(metric: PerformanceMetric): void {
  if (!isEnabled) return;
  
  // Add to queue for batch sending
  metricQueue.push(metric);
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.debug(`Performance metric: ${metric.name} = ${metric.value.toFixed(2)}`);
  }
}

/**
 * Send a metric immediately without batching
 */
function sendMetricImmediately(metric: PerformanceMetric): void {
  if (!isEnabled || typeof window === 'undefined') return;
  
  try {
    fetch(PERFORMANCE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metrics: [metric],
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      }),
      keepalive: true
    }).catch(err => {
      console.error('Failed to send performance metric:', err);
    });
  } catch (e) {
    console.error('Error sending performance metric:', e);
  }
}

/**
 * Flush metrics queue and send to server
 */
function flushMetrics(): void {
  if (!isEnabled || metricQueue.length === 0 || typeof window === 'undefined') return;
  
  try {
    fetch(PERFORMANCE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metrics: metricQueue,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      }),
      keepalive: true
    }).catch(err => {
      console.error('Failed to send performance metrics:', err);
    });
  } catch (e) {
    console.error('Error sending performance metrics:', e);
  } finally {
    // Clear the queue
    metricQueue = [];
  }
}

/**
 * Higher-order component that measures render time
 */
export function withPerformanceTracking<T extends React.ComponentType<any>>(
  Component: T,
  options: {
    componentName?: string;
    reportThreshold?: number;
  } = {}
): T {
  const componentName = options.componentName || Component.displayName || Component.name || 'UnnamedComponent';
  const reportThreshold = options.reportThreshold || 50; // ms
  
  // Create the wrapped component
  const WrappedComponent = function(props: any) {
    const startTime = performance.now();
    
    React.useEffect(() => {
      const renderTime = performance.now() - startTime;
      
      // Only report if render time exceeds threshold
      if (renderTime > reportThreshold) {
        reportPerformanceMetric({
          name: `component.${componentName}.renderTime`,
          value: renderTime,
          rating: renderTime > 100 ? 'poor' : renderTime > 50 ? 'needs-improvement' : 'good'
        });
      }
    }, []);
    
    return React.createElement(Component, props);
  };
  
  WrappedComponent.displayName = `withPerformanceTracking(${componentName})`;
  
  return WrappedComponent as T;
}

export default {
  initPerformanceMonitoring,
  cleanupPerformanceMonitoring,
  markPerformanceStart,
  markPerformanceEnd,
  reportPerformanceMetric,
  startFpsMonitoring,
  stopFpsMonitoring,
  getAnimationMetrics,
  withPerformanceTracking
};