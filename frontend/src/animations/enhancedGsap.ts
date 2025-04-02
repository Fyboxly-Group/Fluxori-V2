/**
 * Enhanced GSAP Animation System
 * High-performance animation utilities with advanced monitoring and optimization
 */

import gsap from 'gsap';
import { 
  AnimationComplexity, 
  getAdaptiveAnimationConfig, 
  startTrackingAnimation 
} from '@/utils/animationPerformanceMonitor';
import { getDeviceCapabilities } from './optimizedGsap';

// Optimized standard animations with performance tracking
type EnhancedAnimationTarget = gsap.TweenTarget;
type EnhancedAnimationOptions = {
  duration?: number;
  delay?: number;
  ease?: string;
  stagger?: number;
  animationId?: string;
  onComplete?: () => void;
  onStart?: () => void;
  complexity?: AnimationComplexity;
  elements?: number;
  forceGPU?: boolean;
  disableTracking?: boolean;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  useWillChange?: boolean;
};

/**
 * Creates an optimized, tracked animation
 * Automatically monitors performance and adapts based on device capabilities
 */
export function createEnhancedAnimation(
  target: EnhancedAnimationTarget,
  animationType: string,
  options: EnhancedAnimationOptions = {}
): gsap.core.Tween | gsap.core.Timeline {
  const {
    duration,
    delay = 0,
    ease = 'power2.out',
    stagger = 0,
    animationId = `${animationType}-${Date.now()}`,
    onComplete,
    onStart,
    complexity = 'simple',
    elements = Array.isArray(target) ? target.length : 1,
    forceGPU = false,
    disableTracking = false,
    from,
    to,
    useWillChange = true
  } = options;

  // Start performance tracking
  const { endTracking } = !disableTracking 
    ? startTrackingAnimation(animationType, complexity, elements)
    : { endTracking: () => {} };

  // Get device capabilities for adaptive configuration
  const capabilities = getDeviceCapabilities();
  
  // Get optimized configuration based on device capabilities and past performance
  const adaptiveConfig = getAdaptiveAnimationConfig(animationType, complexity, {
    duration,
    delay,
    ease,
    stagger
  });
  
  // Prepare elements for animation (add will-change for GPU acceleration)
  if (useWillChange && (forceGPU || complexity !== 'minimal')) {
    applyWillChange(target, animationType);
  }
  
  // Create the animation
  let animation: gsap.core.Tween | gsap.core.Timeline;
  
  // Common animation complete handler
  const handleComplete = () => {
    // End performance tracking
    endTracking();
    
    // Remove will-change property
    if (useWillChange && (forceGPU || complexity !== 'minimal')) {
      removeWillChange(target);
    }
    
    // Call user-provided onComplete
    if (onComplete) onComplete();
  };
  
  // Common animation start handler
  const handleStart = () => {
    if (onStart) onStart();
  };
  
  // Create animation based on type (from-to or to-only)
  if (from && to) {
    animation = gsap.fromTo(
      target,
      {
        ...from,
        immediateRender: true
      },
      {
        ...to,
        duration: adaptiveConfig.duration,
        delay: adaptiveConfig.delay,
        ease: adaptiveConfig.ease,
        stagger: adaptiveConfig.stagger,
        onComplete: handleComplete,
        onStart: handleStart,
        overwrite: 'auto'
      }
    );
  } else if (to) {
    animation = gsap.to(target, {
      ...to,
      duration: adaptiveConfig.duration,
      delay: adaptiveConfig.delay,
      ease: adaptiveConfig.ease,
      stagger: adaptiveConfig.stagger,
      onComplete: handleComplete,
      onStart: handleStart,
      overwrite: 'auto'
    });
  } else {
    // Default animation if no from/to provided
    animation = gsap.to(target, {
      opacity: 1,
      duration: adaptiveConfig.duration,
      delay: adaptiveConfig.delay,
      ease: adaptiveConfig.ease,
      stagger: adaptiveConfig.stagger,
      onComplete: handleComplete,
      onStart: handleStart,
      overwrite: 'auto'
    });
  }
  
  // Patch kill method to ensure cleanup
  const originalKill = animation.kill;
  animation.kill = function(...args: any[]) {
    removeWillChange(target);
    endTracking();
    return originalKill.apply(this, args);
  };
  
  return animation;
}

// Helper to determine properties for will-change based on animation type
function getWillChangeProps(animationType: string): string {
  if (animationType.includes('fade') && animationType.includes('slide')) {
    return 'transform, opacity';
  } else if (animationType.includes('fade')) {
    return 'opacity';
  } else if (
    animationType.includes('slide') || 
    animationType.includes('scale') || 
    animationType.includes('rotate') || 
    animationType.includes('flip')
  ) {
    return 'transform';
  } else if (animationType.includes('color') || animationType.includes('background')) {
    return 'color, background-color';
  }
  
  // Default for unknown animation types
  return 'transform, opacity';
}

// Apply will-change property to elements
function applyWillChange(target: EnhancedAnimationTarget, animationType: string): void {
  const willChangeValue = getWillChangeProps(animationType);
  const targets = getTargetElements(target);
  
  targets.forEach(el => {
    if (el instanceof HTMLElement || el instanceof SVGElement) {
      el.style.willChange = willChangeValue;
    }
  });
}

// Remove will-change property from elements
function removeWillChange(target: EnhancedAnimationTarget): void {
  const targets = getTargetElements(target);
  
  targets.forEach(el => {
    if (el instanceof HTMLElement || el instanceof SVGElement) {
      el.style.willChange = '';
    }
  });
}

// Get array of elements from GSAP target
function getTargetElements(target: EnhancedAnimationTarget): Element[] {
  if (Array.isArray(target)) {
    return target.filter(el => el instanceof Element) as Element[];
  } else if (target instanceof Element) {
    return [target];
  } else if (typeof target === 'string') {
    return Array.from(document.querySelectorAll(target));
  }
  return [];
}

// Standard animation presets with performance tracking
export function fadeIn(
  target: EnhancedAnimationTarget,
  options: Omit<EnhancedAnimationOptions, 'from' | 'to'> = {}
): gsap.core.Tween | gsap.core.Timeline {
  return createEnhancedAnimation(
    target,
    'fadeIn',
    {
      ...options,
      complexity: options.complexity || 'minimal',
      from: { autoAlpha: 0, immediateRender: true },
      to: { autoAlpha: 1 }
    }
  );
}

export function fadeInUp(
  target: EnhancedAnimationTarget,
  options: Omit<EnhancedAnimationOptions, 'from' | 'to'> & { distance?: number } = {}
): gsap.core.Tween | gsap.core.Timeline {
  const { distance = 20, ...restOptions } = options;
  
  return createEnhancedAnimation(
    target,
    'fadeInUp',
    {
      ...restOptions,
      complexity: options.complexity || 'simple',
      from: { y: distance, autoAlpha: 0, immediateRender: true },
      to: { y: 0, autoAlpha: 1 }
    }
  );
}

export function fadeInDown(
  target: EnhancedAnimationTarget,
  options: Omit<EnhancedAnimationOptions, 'from' | 'to'> & { distance?: number } = {}
): gsap.core.Tween | gsap.core.Timeline {
  const { distance = 20, ...restOptions } = options;
  
  return createEnhancedAnimation(
    target,
    'fadeInDown',
    {
      ...restOptions,
      complexity: options.complexity || 'simple',
      from: { y: -distance, autoAlpha: 0, immediateRender: true },
      to: { y: 0, autoAlpha: 1 }
    }
  );
}

export function fadeInLeft(
  target: EnhancedAnimationTarget,
  options: Omit<EnhancedAnimationOptions, 'from' | 'to'> & { distance?: number } = {}
): gsap.core.Tween | gsap.core.Timeline {
  const { distance = 20, ...restOptions } = options;
  
  return createEnhancedAnimation(
    target,
    'fadeInLeft',
    {
      ...restOptions,
      complexity: options.complexity || 'simple',
      from: { x: -distance, autoAlpha: 0, immediateRender: true },
      to: { x: 0, autoAlpha: 1 }
    }
  );
}

export function fadeInRight(
  target: EnhancedAnimationTarget,
  options: Omit<EnhancedAnimationOptions, 'from' | 'to'> & { distance?: number } = {}
): gsap.core.Tween | gsap.core.Timeline {
  const { distance = 20, ...restOptions } = options;
  
  return createEnhancedAnimation(
    target,
    'fadeInRight',
    {
      ...restOptions,
      complexity: options.complexity || 'simple',
      from: { x: distance, autoAlpha: 0, immediateRender: true },
      to: { x: 0, autoAlpha: 1 }
    }
  );
}

export function scaleIn(
  target: EnhancedAnimationTarget,
  options: Omit<EnhancedAnimationOptions, 'from' | 'to'> & { startScale?: number } = {}
): gsap.core.Tween | gsap.core.Timeline {
  const { startScale = 0.8, ...restOptions } = options;
  
  return createEnhancedAnimation(
    target,
    'scaleIn',
    {
      ...restOptions,
      complexity: options.complexity || 'simple',
      from: { scale: startScale, autoAlpha: 0, immediateRender: true },
      to: { scale: 1, autoAlpha: 1 }
    }
  );
}

export function bounceIn(
  target: EnhancedAnimationTarget,
  options: Omit<EnhancedAnimationOptions, 'from' | 'to' | 'ease'> = {}
): gsap.core.Tween | gsap.core.Timeline {
  return createEnhancedAnimation(
    target,
    'bounceIn',
    {
      ...options,
      complexity: options.complexity || 'moderate',
      ease: 'elastic.out(1, 0.5)',
      from: { scale: 0.3, autoAlpha: 0, immediateRender: true },
      to: { scale: 1, autoAlpha: 1 }
    }
  );
}

export function flipInX(
  target: EnhancedAnimationTarget,
  options: Omit<EnhancedAnimationOptions, 'from' | 'to'> = {}
): gsap.core.Tween | gsap.core.Timeline {
  return createEnhancedAnimation(
    target,
    'flipInX',
    {
      ...options,
      complexity: options.complexity || 'moderate',
      from: { 
        rotationX: 90, 
        autoAlpha: 0, 
        transformPerspective: 800,
        immediateRender: true 
      },
      to: { 
        rotationX: 0, 
        autoAlpha: 1,
        ease: 'back.out(1.7)'
      }
    }
  );
}

export function flipInY(
  target: EnhancedAnimationTarget,
  options: Omit<EnhancedAnimationOptions, 'from' | 'to'> = {}
): gsap.core.Tween | gsap.core.Timeline {
  return createEnhancedAnimation(
    target,
    'flipInY',
    {
      ...options,
      complexity: options.complexity || 'moderate',
      from: { 
        rotationY: 90, 
        autoAlpha: 0, 
        transformPerspective: 800,
        immediateRender: true 
      },
      to: { 
        rotationY: 0, 
        autoAlpha: 1,
        ease: 'back.out(1.7)'
      }
    }
  );
}

export function staggerFromTo(
  targets: EnhancedAnimationTarget,
  fromVars: gsap.TweenVars,
  toVars: gsap.TweenVars,
  options: Omit<EnhancedAnimationOptions, 'from' | 'to'> & { 
    staggerAmount?: number,
    staggerDirection?: 1 | -1
  } = {}
): gsap.core.Timeline {
  const { 
    staggerAmount = 0.1, 
    staggerDirection = 1,
    ...restOptions 
  } = options;
  
  // Count number of elements for complexity estimate
  const elementsCount = Array.isArray(targets) ? targets.length : 1;
  const estimatedComplexity: AnimationComplexity = 
    elementsCount > 20 ? 'complex' :
    elementsCount > 10 ? 'moderate' : 'simple';
  
  return createEnhancedAnimation(
    targets,
    'staggerAnimation',
    {
      ...restOptions,
      complexity: options.complexity || estimatedComplexity,
      elements: elementsCount,
      stagger: {
        amount: staggerAmount,
        from: staggerDirection === 1 ? "start" : "end"
      },
      from: { ...fromVars, immediateRender: true },
      to: toVars
    }
  );
}

// Create a timeline with performance tracking
export function createEnhancedTimeline(options: gsap.TimelineVars = {}): gsap.core.Timeline & {
  addTracker: () => () => void 
} {
  const timeline = gsap.timeline(options);
  
  // Add tracking method to timeline
  (timeline as any).addTracker = function(
    name = 'timeline', 
    complexity: AnimationComplexity = 'moderate', 
    elements = 1
  ) {
    const { endTracking } = startTrackingAnimation(name, complexity, elements);
    
    // Hook into timeline complete event
    const originalCallback = this.eventCallback('onComplete');
    this.eventCallback('onComplete', function() {
      endTracking();
      if (originalCallback) originalCallback.apply(this);
    });
    
    return endTracking;
  };
  
  return timeline as gsap.core.Timeline & { addTracker: () => () => void };
}

export default {
  createEnhancedAnimation,
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  bounceIn,
  flipInX,
  flipInY,
  staggerFromTo,
  createEnhancedTimeline
};