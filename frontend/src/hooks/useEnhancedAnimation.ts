/**
 * Enhanced Animation Hooks for High-Performance React Components
 * Provides React hooks for optimized GSAP animations with performance monitoring
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useMotionPreference } from './useMotionPreference';
import * as enhancedGsap from '@/animations/enhancedGsap';
import { getDeviceCapabilities } from '@/animations/optimizedGsap';
import { 
  AnimationComplexity, 
  animationMetricsStore, 
  getAdaptiveAnimationConfig
} from '@/utils/animationPerformanceMonitor';
import gsap from 'gsap';

// Type for animation options
interface AnimationOptions {
  duration?: number;
  delay?: number;
  ease?: string;
  disabled?: boolean;
  y?: number;
  x?: number;
  scale?: number;
  opacity?: number;
  rotation?: number;
  stagger?: number;
  onComplete?: () => void;
  clearProps?: string | boolean;
  complexity?: AnimationComplexity;
  disableTracking?: boolean;
  useWillChange?: boolean;
  name?: string;
  fromVars?: gsap.TweenVars;
  toVars?: gsap.TweenVars;
}

/**
 * Hook for creating an element with enhanced entrance animation
 * Automatically tracks performance and optimizes settings
 */
export function useEnhancedMount<T extends HTMLElement = HTMLDivElement>(
  animation: 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn' | 'bounceIn' | 'flipInX' | 'flipInY' = 'fadeInUp',
  options: AnimationOptions = {}
) {
  const ref = useRef<T>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const { motionPreference } = useMotionPreference();
  
  // Skip animation for reduced motion preference
  const disabled = options.disabled || motionPreference.reduced;
  
  // Generate a consistent animation name
  const animationName = useMemo(() => 
    options.name || `${animation}-${Math.floor(Math.random() * 10000)}`,
  [animation, options.name]);
  
  // Default complexity based on animation type
  const complexity: AnimationComplexity = useMemo(() => {
    if (options.complexity) return options.complexity;
    
    switch (animation) {
      case 'fadeIn':
        return 'minimal';
      case 'fadeInUp':
      case 'fadeInDown':
      case 'fadeInLeft':
      case 'fadeInRight':
      case 'scaleIn':
        return 'simple';
      case 'bounceIn':
      case 'flipInX':
      case 'flipInY':
        return 'moderate';
      default:
        return 'simple';
    }
  }, [animation, options.complexity]);
  
  // Execute animation when component mounts
  useEffect(() => {
    if (!ref.current || hasAnimated || disabled) return;
    
    let animationInstance: gsap.core.Tween | gsap.core.Timeline | null = null;
    
    // Get options with proper defaults
    const {
      duration,
      delay = 0,
      ease,
      y = 20,
      x = 0,
      scale,
      onComplete,
      clearProps = true,
      useWillChange = true,
      disableTracking = false,
      fromVars,
      toVars
    } = options;
    
    // Execute the animation based on type
    switch (animation) {
      case 'fadeIn':
        animationInstance = enhancedGsap.fadeIn(ref.current, {
          duration,
          delay,
          ease,
          onComplete: () => {
            setHasAnimated(true);
            if (onComplete) onComplete();
          },
          complexity,
          disableTracking,
          useWillChange,
          animationId: animationName
        });
        break;
        
      case 'fadeInUp':
        animationInstance = enhancedGsap.fadeInUp(ref.current, {
          duration,
          delay,
          ease,
          distance: y,
          onComplete: () => {
            setHasAnimated(true);
            if (onComplete) onComplete();
          },
          complexity,
          disableTracking,
          useWillChange,
          animationId: animationName
        });
        break;
        
      case 'fadeInDown':
        animationInstance = enhancedGsap.fadeInDown(ref.current, {
          duration,
          delay,
          ease,
          distance: y,
          onComplete: () => {
            setHasAnimated(true);
            if (onComplete) onComplete();
          },
          complexity,
          disableTracking,
          useWillChange,
          animationId: animationName
        });
        break;
        
      case 'fadeInLeft':
        animationInstance = enhancedGsap.fadeInLeft(ref.current, {
          duration,
          delay,
          ease,
          distance: x,
          onComplete: () => {
            setHasAnimated(true);
            if (onComplete) onComplete();
          },
          complexity,
          disableTracking,
          useWillChange,
          animationId: animationName
        });
        break;
        
      case 'fadeInRight':
        animationInstance = enhancedGsap.fadeInRight(ref.current, {
          duration,
          delay,
          ease,
          distance: x,
          onComplete: () => {
            setHasAnimated(true);
            if (onComplete) onComplete();
          },
          complexity,
          disableTracking,
          useWillChange,
          animationId: animationName
        });
        break;
        
      case 'scaleIn':
        animationInstance = enhancedGsap.scaleIn(ref.current, {
          duration,
          delay,
          ease,
          startScale: scale,
          onComplete: () => {
            setHasAnimated(true);
            if (onComplete) onComplete();
          },
          complexity,
          disableTracking,
          useWillChange,
          animationId: animationName
        });
        break;
        
      case 'bounceIn':
        animationInstance = enhancedGsap.bounceIn(ref.current, {
          duration,
          delay,
          onComplete: () => {
            setHasAnimated(true);
            if (onComplete) onComplete();
          },
          complexity,
          disableTracking,
          useWillChange,
          animationId: animationName
        });
        break;
        
      case 'flipInX':
        animationInstance = enhancedGsap.flipInX(ref.current, {
          duration,
          delay,
          ease,
          onComplete: () => {
            setHasAnimated(true);
            if (onComplete) onComplete();
          },
          complexity,
          disableTracking,
          useWillChange,
          animationId: animationName
        });
        break;
        
      case 'flipInY':
        animationInstance = enhancedGsap.flipInY(ref.current, {
          duration,
          delay,
          ease,
          onComplete: () => {
            setHasAnimated(true);
            if (onComplete) onComplete();
          },
          complexity,
          disableTracking,
          useWillChange,
          animationId: animationName
        });
        break;
        
      default:
        // Custom animation with fromVars and toVars
        if (fromVars && toVars) {
          animationInstance = enhancedGsap.createEnhancedAnimation(
            ref.current,
            animationName,
            {
              duration,
              delay,
              ease,
              from: fromVars,
              to: toVars,
              onComplete: () => {
                setHasAnimated(true);
                if (onComplete) onComplete();
              },
              complexity,
              disableTracking,
              useWillChange
            }
          );
        }
    }
    
    return () => {
      if (animationInstance) {
        animationInstance.kill();
      }
    };
  }, [
    animation, 
    disabled, 
    hasAnimated, 
    options, 
    complexity, 
    animationName
  ]);
  
  // Function to replay the animation
  const replay = useCallback(() => {
    setHasAnimated(false);
  }, []);
  
  return { ref, hasAnimated, replay };
}

/**
 * Hook for enhanced staggered animations of multiple elements
 * Monitors performance and adapts settings based on device capabilities
 */
export function useEnhancedStagger<T extends HTMLElement = HTMLDivElement>(
  options: AnimationOptions & {
    animation?: 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'scaleIn' | 'custom';
    staggerAmount?: number;
    staggerFrom?: 'start' | 'end' | 'center' | number;
    refreshTrigger?: any;
  } = {}
) {
  const containerRef = useRef<T>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [elementCount, setElementCount] = useState(0);
  const { motionPreference } = useMotionPreference();
  
  // Extract all options with defaults
  const {
    animation = 'fadeInUp',
    staggerAmount = 0.08,
    staggerFrom = 'start',
    duration,
    delay = 0,
    ease = 'power2.out',
    y = 20,
    disabled = false,
    onComplete,
    refreshTrigger,
    complexity: userComplexity,
    name = `stagger-${animation}`,
    disableTracking = false,
    useWillChange = true,
    fromVars,
    toVars
  } = options;
  
  // Skip if reduced motion is enabled
  const skipAnimation = disabled || motionPreference.reduced;
  
  // Adjust stagger timing based on device capabilities
  const capabilities = getDeviceCapabilities();
  const adjustedStagger = useMemo(() => {
    if (capabilities.tier === 'low') {
      return staggerAmount * 0.7;
    } else if (capabilities.tier === 'medium') {
      return staggerAmount * 0.85;
    }
    return staggerAmount;
  }, [staggerAmount, capabilities.tier]);
  
  // Determine complexity based on element count
  useEffect(() => {
    if (containerRef.current) {
      setElementCount(containerRef.current.children.length);
    }
  }, [refreshTrigger]);
  
  const complexity = useMemo((): AnimationComplexity => {
    if (userComplexity) return userComplexity;
    
    if (elementCount > 25) return 'complex';
    if (elementCount > 12) return 'moderate';
    return 'simple';
  }, [userComplexity, elementCount]);
  
  // Run staggered animation
  useEffect(() => {
    if (!containerRef.current || hasAnimated || skipAnimation) return;
    
    const container = containerRef.current;
    const elements = Array.from(container.children) as HTMLElement[];
    
    if (elements.length === 0) return;
    
    let animationInstance: gsap.core.Tween | gsap.core.Timeline | null = null;
    
    // Create animation based on type
    if (animation === 'fadeIn') {
      animationInstance = enhancedGsap.staggerFromTo(
        elements,
        { opacity: 0, immediateRender: true },
        { opacity: 1 },
        {
          duration,
          delay,
          ease,
          staggerAmount: adjustedStagger,
          staggerDirection: staggerFrom === 'end' ? -1 : 1,
          onComplete: () => {
            setHasAnimated(true);
            if (onComplete) onComplete();
          },
          complexity,
          elements: elements.length,
          disableTracking,
          useWillChange,
          animationId: name
        }
      );
    } else if (animation === 'fadeInUp') {
      animationInstance = enhancedGsap.staggerFromTo(
        elements,
        { opacity: 0, y, immediateRender: true },
        { opacity: 1, y: 0 },
        {
          duration,
          delay,
          ease,
          staggerAmount: adjustedStagger,
          staggerDirection: staggerFrom === 'end' ? -1 : 1,
          onComplete: () => {
            setHasAnimated(true);
            if (onComplete) onComplete();
          },
          complexity,
          elements: elements.length,
          disableTracking,
          useWillChange,
          animationId: name
        }
      );
    } else if (animation === 'fadeInDown') {
      animationInstance = enhancedGsap.staggerFromTo(
        elements,
        { opacity: 0, y: -y, immediateRender: true },
        { opacity: 1, y: 0 },
        {
          duration,
          delay,
          ease,
          staggerAmount: adjustedStagger,
          staggerDirection: staggerFrom === 'end' ? -1 : 1,
          onComplete: () => {
            setHasAnimated(true);
            if (onComplete) onComplete();
          },
          complexity,
          elements: elements.length,
          disableTracking,
          useWillChange,
          animationId: name
        }
      );
    } else if (animation === 'scaleIn') {
      animationInstance = enhancedGsap.staggerFromTo(
        elements,
        { opacity: 0, scale: 0.8, immediateRender: true },
        { opacity: 1, scale: 1 },
        {
          duration,
          delay,
          ease,
          staggerAmount: adjustedStagger,
          staggerDirection: staggerFrom === 'end' ? -1 : 1,
          onComplete: () => {
            setHasAnimated(true);
            if (onComplete) onComplete();
          },
          complexity,
          elements: elements.length,
          disableTracking,
          useWillChange,
          animationId: name
        }
      );
    } else if (animation === 'custom' && fromVars && toVars) {
      animationInstance = enhancedGsap.staggerFromTo(
        elements,
        fromVars,
        toVars,
        {
          duration,
          delay,
          ease,
          staggerAmount: adjustedStagger,
          staggerDirection: staggerFrom === 'end' ? -1 : 1,
          onComplete: () => {
            setHasAnimated(true);
            if (onComplete) onComplete();
          },
          complexity,
          elements: elements.length,
          disableTracking,
          useWillChange,
          animationId: name
        }
      );
    }
    
    return () => {
      if (animationInstance) {
        animationInstance.kill();
      }
    };
  }, [
    animation,
    adjustedStagger,
    staggerFrom,
    duration,
    delay,
    ease,
    y,
    skipAnimation,
    hasAnimated,
    onComplete,
    refreshTrigger,
    complexity,
    elementCount,
    disableTracking,
    useWillChange,
    name,
    fromVars,
    toVars
  ]);
  
  // Function to replay the animation
  const replay = useCallback(() => {
    setHasAnimated(false);
  }, []);
  
  return { containerRef, hasAnimated, replay, elementCount };
}

/**
 * Hook to get animation performance recommendations
 * Analyzes animation metrics and provides optimization suggestions
 */
export function useAnimationPerformance() {
  const [recommendations, setRecommendations] = useState<{
    animation: string;
    recommendation: string;
  }[]>([]);
  
  const [animationStats, setAnimationStats] = useState<{
    total: number;
    problematic: number;
    averageDuration: number;
    topAnimations: {name: string, count: number, avgDuration: number}[];
  }>({
    total: 0,
    problematic: 0,
    averageDuration: 0,
    topAnimations: []
  });
  
  // Refresh recommendations and stats
  const refreshAnalysis = useCallback(() => {
    // Get recommendations
    const newRecommendations = animationMetricsStore.getOptimizationRecommendations();
    setRecommendations(newRecommendations);
    
    // Calculate stats
    const animationNames = animationMetricsStore.getTrackedAnimations();
    
    let totalDuration = 0;
    let totalAnimations = 0;
    let problematicCount = 0;
    const animationCounts = new Map<string, {count: number, totalDuration: number}>();
    
    // Process each animation type
    animationNames.forEach(name => {
      const metrics = animationMetricsStore.getMetrics(name);
      totalAnimations += metrics.length;
      
      // Track problematic animations
      metrics.forEach(metric => {
        totalDuration += metric.duration;
        
        // Count as problematic if duration > 50ms or dropped frames > 3
        if (metric.duration > 50 || metric.dropped > 3) {
          problematicCount++;
        }
        
        // Update animation counts
        if (!animationCounts.has(name)) {
          animationCounts.set(name, {count: 0, totalDuration: 0});
        }
        const current = animationCounts.get(name)!;
        animationCounts.set(name, {
          count: current.count + 1,
          totalDuration: current.totalDuration + metric.duration
        });
      });
    });
    
    // Calculate average duration
    const avgDuration = totalAnimations > 0 ? totalDuration / totalAnimations : 0;
    
    // Get top animations by frequency
    const topAnimations = Array.from(animationCounts.entries())
      .map(([name, {count, totalDuration}]) => ({
        name,
        count,
        avgDuration: count > 0 ? totalDuration / count : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Update stats
    setAnimationStats({
      total: totalAnimations,
      problematic: problematicCount,
      averageDuration: avgDuration,
      topAnimations
    });
  }, []);
  
  // Function to clear all metrics
  const clearMetrics = useCallback(() => {
    animationMetricsStore.clearMetrics();
    refreshAnalysis();
  }, [refreshAnalysis]);
  
  // Initialize on mount
  useEffect(() => {
    refreshAnalysis();
    
    // Refresh every 5 seconds if in development
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(refreshAnalysis, 5000);
      return () => clearInterval(interval);
    }
  }, [refreshAnalysis]);
  
  return {
    recommendations,
    stats: animationStats,
    refreshAnalysis,
    clearMetrics
  };
}

/**
 * Enhanced animation hook for micro-interactions
 * Optimized for small, frequent animations like hover effects
 */
export function useEnhancedMicroAnimation<T extends HTMLElement = HTMLDivElement>(
  options: {
    type?: 'scale' | 'pulse' | 'wiggle' | 'shake' | 'highlight' | 'custom';
    intensity?: 'subtle' | 'medium' | 'strong';
    duration?: number;
    ease?: string;
    vars?: gsap.TweenVars;
    disabled?: boolean;
    optimizationLevel?: 'auto' | 'performance' | 'quality';
  } = {}
) {
  const {
    type = 'scale',
    intensity = 'medium',
    duration,
    ease,
    vars,
    disabled = false,
    optimizationLevel = 'auto'
  } = options;
  
  const ref = useRef<T>(null);
  const animRef = useRef<gsap.core.Tween | null>(null);
  const { motionPreference } = useMotionPreference();
  
  // Skip animation for reduced motion preference
  const skipAnimation = disabled || motionPreference.reduced;
  
  // Define intensity scales
  const intensityScales = {
    scale: {
      subtle: 1.03,
      medium: 1.05,
      strong: 1.1
    },
    pulse: {
      subtle: 1.02,
      medium: 1.04,
      strong: 1.07
    },
    wiggle: {
      subtle: 2,
      medium: 5,
      strong: 10
    },
    shake: {
      subtle: 2,
      medium: 4,
      strong: 7
    },
    highlight: {
      subtle: 0.05,
      medium: 0.1,
      strong: 0.2
    }
  };
  
  // Configure default durations based on type
  const defaultDuration = {
    scale: 0.25,
    pulse: 0.3,
    wiggle: 0.3,
    shake: 0.4,
    highlight: 0.4,
    custom: 0.3
  }[type];
  
  // Configure default ease based on type
  const defaultEase = {
    scale: 'power2.out',
    pulse: 'power1.inOut',
    wiggle: 'power2.out',
    shake: 'power2.inOut',
    highlight: 'power1.out',
    custom: 'power2.out'
  }[type];
  
  // Create animation with performance tracking
  const animate = useCallback(() => {
    if (!ref.current || skipAnimation) return;
    
    // Kill any existing animation
    if (animRef.current) {
      animRef.current.kill();
      animRef.current = null;
    }
    
    // Get device capabilities for adaptive configuration
    const capabilities = getDeviceCapabilities();
    
    // Determine performance mode
    const usePerformanceMode = optimizationLevel === 'performance' || 
      (optimizationLevel === 'auto' && capabilities.tier === 'low');
    
    // Optimize animation for performance mode
    const optimizedDuration = usePerformanceMode ? 
      (duration || defaultDuration) * 0.7 : 
      (duration || defaultDuration);
    
    const optimizedEase = usePerformanceMode && (ease || defaultEase).includes('elastic') ? 
      'power2.out' : 
      (ease || defaultEase);
    
    // Get the appropriate intensity scale
    const getScale = () => intensityScales[type]?.[intensity] || 
      (type === 'custom' ? 1 : intensityScales.scale[intensity]);
    
    // Create appropriate animation based on type
    switch (type) {
      case 'scale':
        animRef.current = gsap.to(ref.current, {
          scale: getScale(),
          duration: optimizedDuration,
          ease: optimizedEase,
          ...vars
        });
        break;
        
      case 'pulse':
        animRef.current = gsap.to(ref.current, {
          scale: getScale(),
          duration: optimizedDuration * 0.5,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
          ...vars
        });
        break;
        
      case 'wiggle':
        animRef.current = gsap.to(ref.current, {
          rotation: getScale(),
          duration: optimizedDuration * 0.25,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: 3,
          ...vars
        });
        break;
        
      case 'shake':
        animRef.current = gsap.to(ref.current, {
          x: `random(-${getScale()}, ${getScale()})`,
          y: `random(-${getScale() * 0.5}, ${getScale() * 0.5})`,
          duration: optimizedDuration * 0.1,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: usePerformanceMode ? 3 : 5,
          ...vars
        });
        break;
        
      case 'highlight':
        // Save original background color
        const originalBgColor = window.getComputedStyle(ref.current).backgroundColor;
        const originalColor = window.getComputedStyle(ref.current).color;
        
        // Use GSAP to animate background color
        animRef.current = gsap.to(ref.current, {
          backgroundColor: `rgba(255, 255, 200, ${getScale()})`,
          duration: optimizedDuration * 0.5,
          ease: 'power1.out',
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            // Reset to original background
            gsap.set(ref.current, { 
              backgroundColor: originalBgColor,
              color: originalColor
            });
          },
          ...vars
        });
        break;
        
      case 'custom':
        // For custom animations, just use the provided vars
        if (vars) {
          animRef.current = gsap.to(ref.current, {
            duration: optimizedDuration,
            ease: optimizedEase,
            ...vars
          });
        }
        break;
    }
    
    return () => {
      if (animRef.current) {
        animRef.current.kill();
        animRef.current = null;
      }
    };
  }, [
    type, 
    intensity, 
    duration, 
    ease, 
    vars, 
    skipAnimation, 
    defaultDuration, 
    defaultEase,
    optimizationLevel
  ]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animRef.current) {
        animRef.current.kill();
        animRef.current = null;
      }
    };
  }, []);
  
  return { ref, animate };
}

export default {
  useEnhancedMount,
  useEnhancedStagger,
  useAnimationPerformance,
  useEnhancedMicroAnimation
};