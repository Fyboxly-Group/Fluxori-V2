import { useRef, useEffect, useState, useMemo } from 'react';
import gsap from 'gsap';
import { 
  fadeInUp, 
  fadeIn, 
  scaleIn, 
  revealText, 
  drawSVG,
  scrollTrigger,
  isGSAPPluginAvailable
} from '@/animations/gsap';

/**
 * Hook to animate an element on mount
 */
export function useAnimatedMount<T extends HTMLElement = HTMLDivElement>(
  animation: 'fadeInUp' | 'fadeIn' | 'scaleIn' | 'revealText' = 'fadeInUp',
  options: {
    delay?: number;
    duration?: number;
    disabled?: boolean;
    onComplete?: () => void;
  } = {}
) {
  const { delay = 0, duration = 0.6, disabled = false, onComplete } = options;
  const ref = useRef<T>(null);
  
  useEffect(() => {
    if (disabled || !ref.current) return;
    
    let timeline: gsap.core.Timeline | gsap.core.Tween | null = null;
    
    switch (animation) {
      case 'fadeInUp':
        timeline = fadeInUp(ref.current, { delay, duration, onComplete });
        break;
      case 'fadeIn':
        timeline = fadeIn(ref.current, { delay, duration, onComplete });
        break;
      case 'scaleIn':
        timeline = scaleIn(ref.current, { delay, duration, onComplete });
        break;
      case 'revealText':
        timeline = revealText(ref.current, { delay, duration, onComplete });
        break;
    }
    
    return () => {
      if (timeline) {
        timeline.kill();
      }
    };
  }, [animation, delay, duration, disabled, onComplete]);
  
  return ref;
}

/**
 * Hook to animate elements when they enter the viewport
 */
export function useAnimateOnScroll<T extends HTMLElement = HTMLDivElement>(
  animation: 'fadeInUp' | 'fadeIn' | 'scaleIn' | 'revealText' = 'fadeInUp',
  options: {
    threshold?: number;
    duration?: number;
    rootMargin?: string;
    disabled?: boolean;
    start?: string;
    end?: string;
    scrub?: boolean | number;
    pin?: boolean;
    markers?: boolean;
    onEnter?: () => void;
    onLeave?: () => void;
  } = {}
) {
  const { 
    threshold = 0.2, 
    duration = 0.6, 
    rootMargin = '0px', 
    disabled = false,
    start = 'top bottom-=100',
    end = 'bottom top',
    scrub = false,
    pin = false,
    markers = false,
    onEnter,
    onLeave
  } = options;
  
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);
  const [isScrollTriggerSupported, setIsScrollTriggerSupported] = useState(false);
  
  // Check if ScrollTrigger is supported on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsScrollTriggerSupported(true);
    }
  }, []);
  
  useEffect(() => {
    if (disabled || !ref.current) return;
    
    // Use ScrollTrigger if supported, otherwise fallback to IntersectionObserver
    if (isScrollTriggerSupported) {
      // Create animation based on the selected type
      let tl = gsap.timeline({ paused: true });
      
      switch (animation) {
        case 'fadeInUp':
          tl.fromTo(ref.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration });
          break;
        case 'fadeIn':
          tl.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration });
          break;
        case 'scaleIn':
          tl.fromTo(ref.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration });
          break;
        case 'revealText':
          if (isGSAPPluginAvailable('SplitText')) {
            // Will use SplitText if available
            revealText(ref.current, { duration });
          } else {
            tl.fromTo(ref.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration });
          }
          break;
      }
      
      // Create the scroll trigger
      const trigger = scrollTrigger(ref.current, tl, {
        start,
        end,
        scrub,
        pin,
        markers,
        toggleActions: 'play none none none',
        onEnter: () => {
          setIsInView(true);
          if (onEnter) onEnter();
        },
        onLeave: () => {
          if (onLeave) onLeave();
        }
      });
      
      return () => {
        if (trigger) {
          trigger.kill();
        }
      };
    } else {
      // Fallback to IntersectionObserver for browsers that don't support ScrollTrigger
      const element = ref.current;
      let observer: IntersectionObserver;
      
      const handleIntersect = (entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isInView) {
          setIsInView(true);
          
          switch (animation) {
            case 'fadeInUp':
              fadeInUp(element, { duration });
              break;
            case 'fadeIn':
              fadeIn(element, { duration });
              break;
            case 'scaleIn':
              scaleIn(element, { duration });
              break;
            case 'revealText':
              revealText(element, { duration });
              break;
          }
          
          if (onEnter) onEnter();
          // Stop observing once animation has triggered
          observer.unobserve(element);
        }
      };
      
      observer = new IntersectionObserver(handleIntersect, {
        threshold,
        rootMargin
      });
      
      observer.observe(element);
      
      return () => {
        if (element) {
          observer.unobserve(element);
        }
      };
    }
  }, [animation, duration, threshold, rootMargin, disabled, isInView, isScrollTriggerSupported, start, end, scrub, pin, markers, onEnter, onLeave]);
  
  return { ref, isInView };
}

/**
 * Hook to create a staggered animation for multiple children
 */
export function useStaggerAnimation<T extends HTMLElement = HTMLDivElement>(
  options: {
    stagger?: number;
    delay?: number;
    duration?: number;
    disabled?: boolean;
    y?: number;
    onComplete?: () => void;
  } = {}
) {
  const { 
    stagger = 0.08, 
    delay = 0, 
    duration = 0.5, 
    disabled = false,
    y = 20,
    onComplete
  } = options;
  
  const containerRef = useRef<T>(null);
  
  useEffect(() => {
    if (disabled || !containerRef.current) return;
    
    const container = containerRef.current;
    const elements = Array.from(container.children) as HTMLElement[];
    
    if (elements.length === 0) return;
    
    const timeline = gsap.timeline({ 
      delay,
      onComplete
    });
    
    timeline.fromTo(
      elements,
      { opacity: 0, y },
      { 
        opacity: 1, 
        y: 0, 
        duration, 
        stagger, 
        ease: 'power2.out',
        clearProps: 'all'
      }
    );
    
    return () => {
      timeline.kill();
    };
  }, [stagger, delay, duration, disabled, y, onComplete]);
  
  return containerRef;
}

/**
 * Hook to create an SVG drawing animation
 */
export function useDrawSVG<T extends SVGElement = SVGElement>(
  options: {
    delay?: number;
    duration?: number;
    disabled?: boolean;
    from?: string;
    to?: string;
    ease?: string;
    onComplete?: () => void;
  } = {}
) {
  const { 
    delay = 0, 
    duration = 1, 
    disabled = false,
    from = '0%',
    to = '100%',
    ease = 'power2.inOut',
    onComplete
  } = options;
  
  const ref = useRef<T>(null);
  
  useEffect(() => {
    if (disabled || !ref.current) return;
    
    const element = ref.current;
    
    const animation = drawSVG(element, {
      delay,
      duration,
      from,
      to,
      ease,
      onComplete
    });
    
    return () => {
      if (animation) {
        animation.kill();
      }
    };
  }, [delay, duration, disabled, from, to, ease, onComplete]);
  
  return ref;
}

/**
 * Hook to create a text reveal animation with SplitText
 */
export function useTextReveal<T extends HTMLElement = HTMLElement>(
  options: {
    delay?: number;
    duration?: number;
    stagger?: number;
    disabled?: boolean;
    ease?: string;
    onComplete?: () => void;
  } = {}
) {
  const { 
    delay = 0, 
    duration = 0.8, 
    stagger = 0.02,
    disabled = false,
    ease = 'power2.out',
    onComplete
  } = options;
  
  const ref = useRef<T>(null);
  
  useEffect(() => {
    if (disabled || !ref.current) return;
    
    const element = ref.current;
    
    const animation = revealText(element, {
      delay,
      duration,
      stagger,
      ease,
      onComplete
    });
    
    return () => {
      if (animation) {
        animation.kill();
      }
    };
  }, [delay, duration, stagger, disabled, ease, onComplete]);
  
  return ref;
}

export default {
  useAnimatedMount,
  useAnimateOnScroll,
  useStaggerAnimation,
  useDrawSVG,
  useTextReveal
};