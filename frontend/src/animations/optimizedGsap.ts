import gsap from 'gsap';
import { measureAnimationPerformance, calculateFPS } from '@/utils/performance';

/**
 * Optimized GSAP animation utilities with performance monitoring
 * and adaptive complexity based on device capabilities
 */

// Device capability detection
interface DeviceCapabilities {
  isLowPower: boolean;
  isReducedMotion: boolean;
  supportsWebGL: boolean;
  fps: number;
  tier: 'high' | 'medium' | 'low';
}

// Detect device capabilities
export const detectDeviceCapabilities = (): DeviceCapabilities => {
  if (typeof window === 'undefined') {
    // Default to medium tier for SSR
    return {
      isLowPower: false,
      isReducedMotion: false,
      supportsWebGL: false,
      fps: 60,
      tier: 'medium'
    };
  }

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Check for WebGL support
  let supportsWebGL = false;
  try {
    const canvas = document.createElement('canvas');
    supportsWebGL = !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    supportsWebGL = false;
  }

  // Check hardware concurrency and device memory
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  const deviceMemory = (navigator as any).deviceMemory || 4;

  // Calculate device tier
  let tier: 'high' | 'medium' | 'low' = 'medium';
  
  if (
    prefersReducedMotion ||
    hardwareConcurrency <= 2 ||
    deviceMemory <= 2
  ) {
    tier = 'low';
  } else if (
    hardwareConcurrency >= 6 &&
    deviceMemory >= 6 &&
    supportsWebGL
  ) {
    tier = 'high';
  }

  // Get current FPS
  const fps = calculateFPS();

  // Determine if this is a low power device
  const isLowPower = tier === 'low' || fps < 40;

  return {
    isLowPower,
    isReducedMotion: prefersReducedMotion,
    supportsWebGL,
    fps,
    tier
  };
};

// Cache device capabilities
let deviceCapabilities: DeviceCapabilities | null = null;

// Get device capabilities (cached)
export const getDeviceCapabilities = (): DeviceCapabilities => {
  if (!deviceCapabilities) {
    deviceCapabilities = detectDeviceCapabilities();
  }
  return deviceCapabilities;
};

// Refresh device capabilities (call when needed)
export const refreshDeviceCapabilities = (): DeviceCapabilities => {
  deviceCapabilities = detectDeviceCapabilities();
  return deviceCapabilities;
};

// Adaptive animation configuration based on device capabilities
interface AnimationConfig {
  duration: number;
  delay: number;
  ease: string;
  stagger: number;
}

// Get adaptive animation configuration
export const getAdaptiveConfig = (
  baseConfig: Partial<AnimationConfig>,
  animationType: 'entrance' | 'transition' | 'micro' | 'complex' = 'transition'
): AnimationConfig => {
  const capabilities = getDeviceCapabilities();
  const { tier, isReducedMotion } = capabilities;

  // Base durations for different animation types
  const baseDurations = {
    entrance: 0.6,
    transition: 0.4,
    micro: 0.2,
    complex: 0.8
  };

  // Base staggers for different animation types
  const baseStagger = {
    entrance: 0.08,
    transition: 0.05,
    micro: 0.03,
    complex: 0.1
  };

  // Tier multipliers
  const tierMultiplier = {
    high: 1,
    medium: 0.8,
    low: 0.6
  };

  // Reduced motion multipliers
  const motionMultiplier = isReducedMotion ? 0.5 : 1;

  // Calculate adaptive values
  const duration = baseConfig.duration || 
    (baseDurations[animationType] * tierMultiplier[tier] * motionMultiplier);
  
  const delay = baseConfig.delay || 0;
  
  const stagger = baseConfig.stagger || 
    (baseStagger[animationType] * tierMultiplier[tier] * motionMultiplier);
  
  const ease = baseConfig.ease || 'power2.out';

  return {
    duration,
    delay,
    ease,
    stagger
  };
};

// Optimized GSAP animation with performance monitoring
export const optimizedAnimation = <T extends Element>(
  target: T | T[] | gsap.core.Targets,
  animation: 'fadeIn' | 'fadeInUp' | 'scaleIn' | 'slideIn' | 'bounce' | 'custom',
  options: {
    from?: gsap.TweenVars;
    to?: gsap.TweenVars;
    config?: Partial<AnimationConfig>;
    animationType?: 'entrance' | 'transition' | 'micro' | 'complex';
    onComplete?: () => void;
    onStart?: () => void;
    id?: string;
    disableMonitoring?: boolean;
    forceHighPerformance?: boolean;
  } = {}
): gsap.core.Timeline | gsap.core.Tween => {
  const {
    from,
    to,
    config = {},
    animationType = 'transition',
    onComplete,
    onStart,
    id = 'animation',
    disableMonitoring = false,
    forceHighPerformance = false
  } = options;
  
  // Get adaptive configuration
  const adaptiveConfig = getAdaptiveConfig(config, animationType);
  const { duration, delay, ease, stagger } = adaptiveConfig;

  // Track performance
  const startTime = performance.now();
  
  // Track if animation was completed
  let completed = false;
  
  const handleComplete = () => {
    if (!disableMonitoring) {
      measureAnimationPerformance(`${id}:${animation}`, startTime);
    }
    
    completed = true;
    if (onComplete) onComplete();
  };
  
  const handleStart = () => {
    if (onStart) onStart();
  };

  // Create animation
  let tween: gsap.core.Timeline | gsap.core.Tween;

  // Force will-change for high performance animations on capable devices
  const capabilities = getDeviceCapabilities();
  const useWillChange = (forceHighPerformance || capabilities.tier === 'high') && 
                     !capabilities.isReducedMotion;
  
  if (useWillChange && target instanceof Element) {
    target.style.willChange = 'transform, opacity';
  } else if (useWillChange && Array.isArray(target)) {
    target.forEach(el => {
      if (el instanceof Element) {
        el.style.willChange = 'transform, opacity';
      }
    });
  }

  // Apply will-change cleanup after animation
  const cleanupWillChange = () => {
    if (useWillChange && target instanceof Element) {
      target.style.willChange = '';
    } else if (useWillChange && Array.isArray(target)) {
      target.forEach(el => {
        if (el instanceof Element) {
          el.style.willChange = '';
        }
      });
    }
  };

  // Basic animation types
  switch (animation) {
    case 'fadeIn':
      tween = gsap.fromTo(
        target,
        { opacity: 0, ...from },
        { 
          opacity: 1, 
          duration,
          delay,
          ease,
          stagger,
          ...to,
          onComplete: () => {
            cleanupWillChange();
            handleComplete();
          },
          onStart: handleStart
        }
      );
      break;
      
    case 'fadeInUp':
      tween = gsap.fromTo(
        target,
        { opacity: 0, y: 20, ...from },
        { 
          opacity: 1, 
          y: 0,
          duration,
          delay,
          ease,
          stagger,
          ...to,
          onComplete: () => {
            cleanupWillChange();
            handleComplete();
          },
          onStart: handleStart
        }
      );
      break;
      
    case 'scaleIn':
      tween = gsap.fromTo(
        target,
        { opacity: 0, scale: 0.9, ...from },
        { 
          opacity: 1, 
          scale: 1,
          duration,
          delay,
          ease,
          stagger,
          ...to,
          onComplete: () => {
            cleanupWillChange();
            handleComplete();
          },
          onStart: handleStart
        }
      );
      break;
      
    case 'slideIn':
      tween = gsap.fromTo(
        target,
        { opacity: 0, x: -30, ...from },
        { 
          opacity: 1, 
          x: 0,
          duration,
          delay,
          ease,
          stagger,
          ...to,
          onComplete: () => {
            cleanupWillChange();
            handleComplete();
          },
          onStart: handleStart
        }
      );
      break;
      
    case 'bounce':
      tween = gsap.fromTo(
        target,
        { scale: 0.8, ...from },
        { 
          scale: 1,
          duration,
          delay,
          ease: 'elastic.out(1, 0.5)',
          ...to,
          onComplete: () => {
            cleanupWillChange();
            handleComplete();
          },
          onStart: handleStart
        }
      );
      break;
      
    case 'custom':
      // For custom animations, just use from/to if provided
      if (from && to) {
        tween = gsap.fromTo(
          target,
          from,
          { 
            ...to,
            duration,
            delay,
            ease,
            stagger,
            onComplete: () => {
              cleanupWillChange();
              handleComplete();
            },
            onStart: handleStart
          }
        );
      } else {
        // Fallback to to-only animation
        tween = gsap.to(target, { 
          duration,
          delay,
          ease,
          stagger,
          ...to,
          onComplete: () => {
            cleanupWillChange();
            handleComplete();
          },
          onStart: handleStart
        });
      }
      break;
      
    default:
      // Default to fadeIn
      tween = gsap.fromTo(
        target,
        { opacity: 0, ...from },
        { 
          opacity: 1, 
          duration,
          delay,
          ease,
          stagger,
          ...to,
          onComplete: () => {
            cleanupWillChange();
            handleComplete();
          },
          onStart: handleStart
        }
      );
  }

  // Ensure will-change is cleaned up even if animation is killed
  if (tween && typeof tween.eventCallback === 'function') {
    const originalKill = tween.kill;
    tween.kill = function() {
      if (!completed) {
        cleanupWillChange();
      }
      return originalKill.apply(this, arguments as any);
    };
  }

  return tween;
};

// Optimized animations for common use cases
export const optimizedFadeIn = (
  target: gsap.core.Targets,
  options: Partial<gsap.TweenVars> & { 
    duration?: number;
    delay?: number;
    stagger?: number;
    ease?: string;
    onComplete?: () => void;
    disableMonitoring?: boolean;
  } = {}
) => {
  const { 
    duration, 
    delay, 
    stagger, 
    ease = 'power2.out', 
    onComplete,
    disableMonitoring,
    ...rest 
  } = options;
  
  return optimizedAnimation(target, 'fadeIn', {
    config: { 
      duration, 
      delay, 
      stagger, 
      ease 
    },
    to: rest,
    onComplete,
    disableMonitoring,
    id: 'fadeIn'
  });
};

export const optimizedFadeInUp = (
  target: gsap.core.Targets,
  options: Partial<gsap.TweenVars> & { 
    duration?: number;
    delay?: number;
    stagger?: number;
    ease?: string;
    distance?: number;
    onComplete?: () => void;
    disableMonitoring?: boolean;
  } = {}
) => {
  const { 
    duration, 
    delay, 
    stagger, 
    ease = 'power2.out', 
    distance = 20,
    onComplete,
    disableMonitoring,
    ...rest 
  } = options;
  
  return optimizedAnimation(target, 'fadeInUp', {
    from: { y: distance },
    to: { ...rest },
    config: { 
      duration, 
      delay, 
      stagger, 
      ease 
    },
    onComplete,
    disableMonitoring,
    id: 'fadeInUp'
  });
};

export const optimizedScaleIn = (
  target: gsap.core.Targets,
  options: Partial<gsap.TweenVars> & { 
    duration?: number;
    delay?: number;
    stagger?: number;
    ease?: string;
    startScale?: number;
    onComplete?: () => void;
    disableMonitoring?: boolean;
  } = {}
) => {
  const { 
    duration, 
    delay, 
    stagger, 
    ease = 'power2.out', 
    startScale = 0.9,
    onComplete,
    disableMonitoring,
    ...rest 
  } = options;
  
  return optimizedAnimation(target, 'scaleIn', {
    from: { scale: startScale },
    to: { ...rest },
    config: { 
      duration, 
      delay, 
      stagger, 
      ease 
    },
    onComplete,
    disableMonitoring,
    id: 'scaleIn'
  });
};

export default {
  optimizedAnimation,
  optimizedFadeIn,
  optimizedFadeInUp,
  optimizedScaleIn,
  getDeviceCapabilities,
  refreshDeviceCapabilities,
  getAdaptiveConfig
};