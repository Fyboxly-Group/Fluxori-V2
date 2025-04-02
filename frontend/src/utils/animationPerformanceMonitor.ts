/**
 * Enhanced Animation Performance Monitoring System
 * Tracks, analyzes, and optimizes GSAP animations based on device capabilities
 */

import { getDeviceCapabilities } from '@/animations/optimizedGsap';
import { calculateFPS, measureAnimationPerformance } from './performance';

// Animation complexity categories
export type AnimationComplexity = 'minimal' | 'simple' | 'moderate' | 'complex';

// Animation performance data structure
export interface AnimationPerformanceData {
  id: string;
  name: string;
  duration: number;
  targetFPS: number;
  actualFPS: number;
  elements: number;
  complexity: AnimationComplexity;
  timestamp: string;
  dropped: number; // Number of dropped frames
}

// Animation metrics storage
class AnimationMetricsStore {
  private metrics: Map<string, AnimationPerformanceData[]> = new Map();
  private thresholds: Record<AnimationComplexity, number> = {
    minimal: 5,    // Max 5ms for minimal animations
    simple: 16,    // Max 16ms (60fps) for simple animations
    moderate: 33,  // Max 33ms (30fps) for moderate animations
    complex: 50    // Max 50ms for complex animations
  };

  // Add a metric entry
  addMetric(data: AnimationPerformanceData): void {
    // Create category if it doesn't exist
    if (!this.metrics.has(data.name)) {
      this.metrics.set(data.name, []);
    }
    
    // Add to metrics list, limited to 20 entries per animation
    const list = this.metrics.get(data.name)!;
    list.push(data);
    
    if (list.length > 20) {
      list.shift();
    }
    
    // Log if this animation is problematic
    this.checkPerformance(data);
  }
  
  // Check if an animation is performing well
  private checkPerformance(data: AnimationPerformanceData): void {
    const threshold = this.thresholds[data.complexity];
    
    if (data.duration > threshold * 1.5) {
      console.warn(
        `🔶 Performance Issue: Animation "${data.name}" took ${data.duration.toFixed(1)}ms ` + 
        `(threshold: ${threshold}ms, complexity: ${data.complexity})`
      );
    }
    
    if (data.actualFPS < data.targetFPS * 0.7) {
      console.warn(
        `🔶 FPS Drop: Animation "${data.name}" ran at ${data.actualFPS.toFixed(1)}fps ` + 
        `(target: ${data.targetFPS}fps, dropped ${data.dropped} frames)`
      );
    }
  }
  
  // Get optimization recommendations
  getOptimizationRecommendations(): { animation: string; recommendation: string }[] {
    const recommendations: { animation: string; recommendation: string }[] = [];
    
    // Analyze each animation type
    this.metrics.forEach((dataPoints, animationName) => {
      if (dataPoints.length < 3) return; // Need at least 3 data points
      
      // Calculate average duration and FPS
      const avgDuration = dataPoints.reduce((sum, point) => sum + point.duration, 0) / dataPoints.length;
      const avgFPS = dataPoints.reduce((sum, point) => sum + point.actualFPS, 0) / dataPoints.length;
      const avgDropped = dataPoints.reduce((sum, point) => sum + point.dropped, 0) / dataPoints.length;
      const complexity = dataPoints[0].complexity;
      const threshold = this.thresholds[complexity];
      
      // Check for consistent issues
      if (avgDuration > threshold * 1.2) {
        let recommendation = `Animation "${animationName}" consistently takes too long (avg: ${avgDuration.toFixed(1)}ms).`;
        
        // Add specific recommendations
        if (complexity === 'complex' || complexity === 'moderate') {
          recommendation += ' Consider simplifying or breaking into smaller animations.';
        } else {
          recommendation += ' Optimize by reducing elements or simplifying transforms.';
        }
        
        recommendations.push({ animation: animationName, recommendation });
      }
      
      if (avgFPS < 30 && avgDropped > 3) {
        let recommendation = `Animation "${animationName}" consistently drops frames (avg FPS: ${avgFPS.toFixed(1)}).`;
        recommendation += ' Consider using will-change property, reducing DOM operations, or simplifying effects.';
        
        recommendations.push({ animation: animationName, recommendation });
      }
    });
    
    return recommendations;
  }
  
  // Get all metrics for a specific animation
  getMetrics(animationName: string): AnimationPerformanceData[] {
    return this.metrics.get(animationName) || [];
  }
  
  // Get all animation names being tracked
  getTrackedAnimations(): string[] {
    return Array.from(this.metrics.keys());
  }
  
  // Clear all metrics
  clearMetrics(): void {
    this.metrics.clear();
  }
}

// Singleton instance
export const animationMetricsStore = new AnimationMetricsStore();

// Start tracking animation
export const startTrackingAnimation = (
  name: string,
  complexity: AnimationComplexity = 'simple',
  elements: number = 1
): { endTracking: () => void; id: string } => {
  const startTime = performance.now();
  const id = `${name}-${Date.now()}`;
  const startFPS = calculateFPS();
  const deviceCapabilities = getDeviceCapabilities();
  
  // Target FPS based on device capabilities and animation complexity
  let targetFPS = 60;
  if (deviceCapabilities.tier === 'low') {
    targetFPS = complexity === 'complex' ? 30 : 45;
  } else if (deviceCapabilities.tier === 'medium') {
    targetFPS = complexity === 'complex' ? 45 : 60;
  }
  
  // Function to end tracking and record metrics
  const endTracking = () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    const endFPS = calculateFPS();
    const actualFPS = (startFPS + endFPS) / 2; // Approximate average FPS
    
    // Calculate dropped frames (rough approximation)
    const expectedFrames = duration / (1000 / targetFPS);
    const actualFrames = duration / (1000 / actualFPS);
    const droppedFrames = Math.max(0, Math.round(expectedFrames - actualFrames));
    
    // Record metrics
    animationMetricsStore.addMetric({
      id,
      name,
      duration,
      targetFPS,
      actualFPS,
      elements,
      complexity,
      timestamp: new Date().toISOString(),
      dropped: droppedFrames
    });
    
    // Also record with standard performance measure
    measureAnimationPerformance(`${name} (${complexity})`, startTime);
  };
  
  return { endTracking, id };
};

// Adaptive animation configuration based on performance
export const getAdaptiveAnimationConfig = (
  animationName: string,
  complexity: AnimationComplexity = 'simple',
  baseConfig: any = {}
): any => {
  const deviceCapabilities = getDeviceCapabilities();
  const metrics = animationMetricsStore.getMetrics(animationName);
  
  // Start with base configuration
  const config = { ...baseConfig };
  
  // Default configuration for various parameters
  if (!config.duration) {
    config.duration = complexity === 'minimal' ? 0.2 :
                      complexity === 'simple' ? 0.4 :
                      complexity === 'moderate' ? 0.6 : 0.8;
  }
  
  // Apply device tier adjustments
  if (deviceCapabilities.tier === 'low') {
    config.duration *= 0.7; // Faster animations on low-end devices
    
    // Reduce easing complexity on low-end devices
    if (config.ease && (config.ease.includes('elastic') || config.ease.includes('bounce'))) {
      config.ease = 'power2.out';
    }
  } else if (deviceCapabilities.tier === 'medium') {
    config.duration *= 0.85; // Slightly faster on medium devices
  }
  
  // Apply reduced motion preference
  if (deviceCapabilities.isReducedMotion) {
    config.duration *= 0.5; // Half duration for reduced motion
    
    // Simplify animations for reduced motion
    if (config.ease && (config.ease.includes('elastic') || config.ease.includes('bounce'))) {
      config.ease = 'power1.out';
    }
  }
  
  // Performance-based adjustments from historical data
  if (metrics.length > 5) {
    // Calculate average duration
    const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
    const avgDropped = metrics.reduce((sum, m) => sum + m.dropped, 0) / metrics.length;
    
    // If consistently performing poorly, simplify
    if (avgDuration > 50 || avgDropped > 4) {
      // Further reduce duration
      config.duration *= 0.8;
      
      // Simplify easing
      if (config.ease && (
          config.ease.includes('elastic') || 
          config.ease.includes('bounce') || 
          config.ease.includes('back'))) {
        config.ease = 'power2.out';
      }
      
      // Disable additional effects
      if (config.motionPath) delete config.motionPath;
      if (config.morphSVG) delete config.morphSVG;
      if (config.yoyoEase) delete config.yoyoEase;
    }
  }
  
  return config;
};

export default {
  startTrackingAnimation,
  getAdaptiveAnimationConfig,
  animationMetricsStore
};