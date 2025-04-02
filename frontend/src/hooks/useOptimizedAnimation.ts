import React, { useRef, useEffect, useState } from 'react';
import { 
  optimizedFadeIn, 
  optimizedFadeInUp, 
  optimizedScaleIn, 
  optimizedAnimation,
  getDeviceCapabilities
} from '@/animations/optimizedGsap';
import { memoryCache } from '@/utils/cache';

// Basic animation types
type AnimationType = 'fadeIn' | 'fadeInUp' | 'scaleIn' | 'slideIn' | 'bounce' | 'drawSVG' | 'textReveal';

// Animation purpose categories for adaptive adjustments
type AnimationPurpose = 'entrance' | 'transition' | 'micro' | 'complex';

// Base options for all animation hooks
interface BaseAnimationOptions {
  duration?: number;
  delay?: number;
  disabled?: boolean;
  onComplete?: () => void;
  disableMonitoring?: boolean;
}

/**
 * Enhanced hook for mount animations with performance optimization
 */
export function useOptimizedMount<T extends HTMLElement = HTMLDivElement>(
  animation: AnimationType = 'fadeInUp',
  options: BaseAnimationOptions & {
    y?: number;
    distance?: number;
    easing?: string;
    animationId?: string;
  } = {}
) {
  const {
    duration,
    delay = 0,
    disabled = false,
    onComplete,
    disableMonitoring = false,
    y = 20,
    distance, // Alias for y
    easing = 'power2.out',
    animationId
  } = options;

  const ref = useRef<T>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const distanceValue = distance ?? y;
  
  // Get device capabilities
  const capabilities = getDeviceCapabilities();
  const { isReducedMotion } = capabilities;

  // Skip animation for reduced motion preference
  const skipAnimation = disabled || isReducedMotion;

  useEffect(() => {
    if (!ref.current || hasAnimated || skipAnimation) return;

    let animation: gsap.core.Tween | gsap.core.Timeline | null = null;
    
    // Use unique ID for monitoring or fall back to a generated one
    const uniqueId = animationId || `mount-${Math.random().toString(36).substr(2, 9)}`;

    switch (animation) {
      case 'fadeIn':
        animation = optimizedFadeIn(ref.current, {
          duration,
          delay,
          ease: easing,
          onComplete: () => {
            setHasAnimated(true);
            if (onComplete) onComplete();
          },
          disableMonitoring
        });
        break;
        
      case 'fadeInUp':
        animation = optimizedFadeInUp(ref.current, {
          duration,
          delay,
          ease: easing,
          distance: distanceValue,
          onComplete: () => {
            setHasAnimated(true);
            if (onComplete) onComplete();
          },
          disableMonitoring
        });
        break;
        
      case 'scaleIn':
        animation = optimizedScaleIn(ref.current, {
          duration,
          delay,
          ease: easing,
          onComplete: () => {
            setHasAnimated(true);
            if (onComplete) onComplete();
          },
          disableMonitoring
        });
        break;
        
      case 'slideIn':
        animation = optimizedAnimation(ref.current, 'slideIn', {
          config: {
            duration,
            delay,
            ease: easing,
            stagger: 0
          },
          animationType: 'entrance',
          onComplete: () => {
            setHasAnimated(true);
            if (onComplete) onComplete();
          },
          disableMonitoring,
          id: uniqueId
        });
        break;
        
      case 'bounce':
        animation = optimizedAnimation(ref.current, 'bounce', {
          config: {
            duration,
            delay,
            ease: 'elastic.out(1, 0.5)',
            stagger: 0
          },
          animationType: 'entrance',
          onComplete: () => {
            setHasAnimated(true);
            if (onComplete) onComplete();
          },
          disableMonitoring,
          id: uniqueId
        });
        break;
        
      default:
        // Default to fadeInUp
        animation = optimizedFadeInUp(ref.current, {
          duration,
          delay,
          ease: easing,
          distance: distanceValue,
          onComplete: () => {
            setHasAnimated(true);
            if (onComplete) onComplete();
          },
          disableMonitoring
        });
    }

    return () => {
      if (animation) {
        animation.kill();
      }
    };
  }, [animation, delay, duration, disabled, isReducedMotion, hasAnimated, onComplete, disableMonitoring, easing, distanceValue, animationId]);

  return ref;
}

/**
 * Enhanced hook for staggered animations with performance optimization
 */
export function useOptimizedStagger<T extends HTMLElement = HTMLDivElement>(
  options: {
    stagger?: number;
    delay?: number;
    duration?: number;
    disabled?: boolean;
    y?: number;
    scale?: number;
    from?: gsap.TweenVars;
    to?: gsap.TweenVars;
    ease?: string;
    animation?: AnimationType;
    onComplete?: () => void;
    disableMonitoring?: boolean;
    animationId?: string;
  } = {}
) {
  const {
    stagger = 0.08,
    delay = 0,
    duration,
    disabled = false,
    y = 20,
    scale,
    from,
    to,
    ease = 'power2.out',
    animation = 'fadeInUp',
    onComplete,
    disableMonitoring = false,
    animationId
  } = options;

  const containerRef = useRef<T>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Get device capabilities
  const capabilities = getDeviceCapabilities();
  const { isReducedMotion, tier } = capabilities;

  // Adjust stagger timing based on device tier
  const adjustedStagger = isReducedMotion ? stagger * 0.5 : 
                         tier === 'low' ? stagger * 0.7 : stagger;

  // Skip animation for reduced motion preference
  const skipAnimation = disabled || isReducedMotion;

  useEffect(() => {
    if (!containerRef.current || hasAnimated || skipAnimation) return;

    const container = containerRef.current;
    const elements = Array.from(container.children) as HTMLElement[];
    
    if (elements.length === 0) return;

    // Use unique ID for monitoring or fall back to a generated one
    const uniqueId = animationId || `stagger-${Math.random().toString(36).substr(2, 9)}`;
    
    let animationObj: gsap.core.Tween | gsap.core.Timeline | null = null;
    
    switch (animation) {
      case 'fadeIn':
        animationObj = optimizedFadeIn(elements, {
          duration,
          delay,
          stagger: adjustedStagger,
          ease,
          ...to,
          onComplete: () => {
            setHasAnimated(true);
            if (onComplete) onComplete();
          },
          disableMonitoring
        });
        break;
        
      case 'fadeInUp':
        animationObj = optimizedFadeInUp(elements, {
          duration,
          delay,
          stagger: adjustedStagger,
          ease,
          distance: y,
          ...to,
          onComplete: () => {
            setHasAnimated(true);
            if (onComplete) onComplete();
          },
          disableMonitoring
        });
        break;
        
      case 'scaleIn':
        animationObj = optimizedScaleIn(elements, {
          duration,
          delay,
          stagger: adjustedStagger,
          ease,
          startScale: scale ?? 0.9,
          ...to,
          onComplete: () => {
            setHasAnimated(true);
            if (onComplete) onComplete();
          },
          disableMonitoring
        });
        break;
        
      default:
        // For custom animations, use optimizedAnimation with from/to
        const fromVars = from ?? { opacity: 0, y };
        const toVars = to ?? { opacity: 1, y: 0 };
        
        animationObj = optimizedAnimation(elements, 'custom', {
          from: fromVars,
          to: toVars,
          config: {
            duration,
            delay,
            stagger: adjustedStagger,
            ease
          },
          animationType: 'entrance',
          onComplete: () => {
            setHasAnimated(true);
            if (onComplete) onComplete();
          },
          id: uniqueId,
          disableMonitoring
        });
    }

    return () => {
      if (animationObj) {
        animationObj.kill();
      }
    };
  }, [animation, delay, duration, disabled, isReducedMotion, tier, adjustedStagger, hasAnimated, y, scale, from, to, ease, onComplete, disableMonitoring, animationId]);

  return containerRef;
}

/**
 * Enhanced hook for scroll-triggered animations with performance optimization
 */
export function useOptimizedScroll<T extends HTMLElement = HTMLDivElement>(
  animation: AnimationType = 'fadeInUp',
  options: BaseAnimationOptions & {
    threshold?: number;
    root?: Element | null;
    rootMargin?: string;
    triggerOnce?: boolean;
    y?: number;
    easing?: string;
    animationId?: string;
  } = {}
) {
  const {
    threshold = 0.2,
    root = null,
    rootMargin = '0px',
    duration,
    delay = 0,
    triggerOnce = true,
    disabled = false,
    onComplete,
    disableMonitoring = false,
    y = 20,
    easing = 'power2.out',
    animationId
  } = options;

  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Get device capabilities
  const capabilities = getDeviceCapabilities();
  const { isReducedMotion } = capabilities;

  // Skip animation for reduced motion preference
  const skipAnimation = disabled || isReducedMotion;

  useEffect(() => {
    if (!ref.current || (triggerOnce && hasAnimated) || skipAnimation) return;

    const element = ref.current;
    let animationObj: gsap.core.Tween | gsap.core.Timeline | null = null;
    let observer: IntersectionObserver;

    // Use unique ID for monitoring or fall back to a generated one
    const uniqueId = animationId || `scroll-${Math.random().toString(36).substr(2, 9)}`;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      
      if (entry.isIntersecting && (!triggerOnce || !hasAnimated)) {
        setIsInView(true);
        
        switch (animation) {
          case 'fadeIn':
            animationObj = optimizedFadeIn(element, {
              duration,
              delay,
              ease: easing,
              onComplete: () => {
                setHasAnimated(true);
                if (onComplete) onComplete();
              },
              disableMonitoring
            });
            break;
            
          case 'fadeInUp':
            animationObj = optimizedFadeInUp(element, {
              duration,
              delay,
              ease: easing,
              distance: y,
              onComplete: () => {
                setHasAnimated(true);
                if (onComplete) onComplete();
              },
              disableMonitoring
            });
            break;
            
          case 'scaleIn':
            animationObj = optimizedScaleIn(element, {
              duration,
              delay,
              ease: easing,
              onComplete: () => {
                setHasAnimated(true);
                if (onComplete) onComplete();
              },
              disableMonitoring
            });
            break;
            
          case 'slideIn':
            animationObj = optimizedAnimation(element, 'slideIn', {
              config: {
                duration,
                delay,
                ease: easing,
                stagger: 0
              },
              animationType: 'entrance',
              onComplete: () => {
                setHasAnimated(true);
                if (onComplete) onComplete();
              },
              disableMonitoring,
              id: uniqueId
            });
            break;
            
          default:
            // Default to fadeInUp
            animationObj = optimizedFadeInUp(element, {
              duration,
              delay,
              ease: easing,
              distance: y,
              onComplete: () => {
                setHasAnimated(true);
                if (onComplete) onComplete();
              },
              disableMonitoring
            });
        }
        
        if (triggerOnce) {
          observer.unobserve(element);
        }
      } else if (!entry.isIntersecting) {
        setIsInView(false);
      }
    };

    observer = new IntersectionObserver(handleIntersection, {
      root,
      rootMargin,
      threshold
    });

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
      if (animationObj) {
        animationObj.kill();
      }
    };
  }, [animation, threshold, root, rootMargin, duration, delay, triggerOnce, disabled, isReducedMotion, hasAnimated, onComplete, disableMonitoring, y, easing, animationId]);

  return { ref, isInView };
}

/**
 * Hook to respect user motion preferences
 */
export function useMotionPreference(): {
  prefersReducedMotion: boolean;
  motionLevel: 'full' | 'moderate' | 'minimal';
  setMotionLevel: (level: 'full' | 'moderate' | 'minimal') => void;
} {
  // Check system preference
  const systemPreference = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
  
  // Try to get user preference from cache/localStorage
  const getUserPreference = (): 'full' | 'moderate' | 'minimal' | null => {
    if (typeof window === 'undefined') return null;
    
    // Check cache first
    const cached = memoryCache.get<'full' | 'moderate' | 'minimal'>('motionPreference');
    if (cached) return cached;
    
    // Try localStorage
    try {
      const stored = localStorage.getItem('motionPreference');
      if (stored && ['full', 'moderate', 'minimal'].includes(stored)) {
        return stored as 'full' | 'moderate' | 'minimal';
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    
    return null;
  };
  
  // Determine initial motion level
  const determineInitialMotionLevel = (): 'full' | 'moderate' | 'minimal' => {
    const userPreference = getUserPreference();
    
    // If user has set a preference, use that
    if (userPreference) return userPreference;
    
    // If system prefers reduced motion, default to minimal
    if (systemPreference) return 'minimal';
    
    // Otherwise, use full motion
    return 'full';
  };
  
  const [motionLevel, setMotionLevelState] = useState<'full' | 'moderate' | 'minimal'>(
    determineInitialMotionLevel()
  );
  
  // Function to update motion level
  const setMotionLevel = (level: 'full' | 'moderate' | 'minimal') => {
    setMotionLevelState(level);
    
    // Save to cache and localStorage
    memoryCache.set('motionPreference', level);
    
    try {
      localStorage.setItem('motionPreference', level);
    } catch (e) {
      // Ignore localStorage errors
    }
  };
  
  return {
    prefersReducedMotion: systemPreference,
    motionLevel,
    setMotionLevel
  };
}

export default {
  useOptimizedMount,
  useOptimizedStagger,
  useOptimizedScroll,
  useMotionPreference
};