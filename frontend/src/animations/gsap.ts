import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Business Plan plugins - these will be loaded dynamically in browser
// to avoid bundling issues with server-side rendering
let SplitText: any;
let DrawSVG: any;
let MorphSVG: any;

/**
 * Initialize GSAP and its premium plugins
 * This supports both client and server-side rendering
 */
export const initGSAP = () => {
  if (typeof window !== 'undefined') {
    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);
    
    // Load GSAP Business license
    try {
      // This is dynamically imported to avoid bundling issues
      // and to ensure the license is only loaded in the browser
      import('../lib/gsap/gsapLicense.js')
        .then(() => {
          console.log('GSAP Business license loaded');
          
          // Load premium plugins after license is loaded
          Promise.all([
            import('gsap/SplitText').then(module => {
              SplitText = module.SplitText;
              gsap.registerPlugin(SplitText);
              console.log('SplitText plugin loaded');
            }),
            import('gsap/DrawSVG').then(module => {
              DrawSVG = module.DrawSVG;
              gsap.registerPlugin(DrawSVG);
              console.log('DrawSVG plugin loaded');
            }),
            import('gsap/MorphSVG').then(module => {
              MorphSVG = module.MorphSVG;
              gsap.registerPlugin(MorphSVG);
              console.log('MorphSVG plugin loaded');
            })
          ]).catch(error => {
            console.warn('Error loading GSAP premium plugins:', error);
          });
        })
        .catch(error => {
          console.warn('Error loading GSAP Business license:', error);
        });
    } catch (error) {
      console.warn('Failed to initialize GSAP Business:', error);
    }
  }
};

/**
 * Check if GSAP Business plugins are available
 * @param plugin The plugin name to check
 * @returns boolean indicating if the plugin is available
 */
export const isGSAPPluginAvailable = (plugin: 'SplitText' | 'DrawSVG' | 'MorphSVG'): boolean => {
  switch (plugin) {
    case 'SplitText':
      return typeof SplitText !== 'undefined';
    case 'DrawSVG':
      return typeof DrawSVG !== 'undefined';
    case 'MorphSVG':
      return typeof MorphSVG !== 'undefined';
    default:
      return false;
  }
};

/**
 * Standard entrance animation - fade in from bottom
 */
export const fadeInUp = (
  element: HTMLElement | string, 
  options: { 
    delay?: number; 
    duration?: number; 
    y?: number; 
    ease?: string;
    stagger?: number;
    onComplete?: () => void;
  } = {}
) => {
  const {
    delay = 0,
    duration = 0.6,
    y = 20,
    ease = 'power2.out',
    stagger = 0,
    onComplete
  } = options;

  return gsap.fromTo(
    element,
    { opacity: 0, y },
    { 
      opacity: 1, 
      y: 0, 
      duration, 
      delay, 
      ease,
      stagger,
      clearProps: 'all',
      onComplete
    }
  );
};

/**
 * Standard exit animation - fade out to bottom
 */
export const fadeOutDown = (
  element: HTMLElement | string,
  options: {
    delay?: number;
    duration?: number;
    y?: number;
    ease?: string;
    onComplete?: () => void;
  } = {}
) => {
  const {
    delay = 0,
    duration = 0.5,
    y = 20,
    ease = 'power2.in',
    onComplete
  } = options;

  return gsap.to(element, {
    opacity: 0,
    y,
    duration,
    delay,
    ease,
    onComplete
  });
};

/**
 * Fade in animation
 */
export const fadeIn = (
  element: HTMLElement | string,
  options: {
    delay?: number;
    duration?: number;
    ease?: string;
    onComplete?: () => void;
  } = {}
) => {
  const {
    delay = 0,
    duration = 0.5,
    ease = 'power1.out',
    onComplete
  } = options;

  return gsap.fromTo(
    element,
    { opacity: 0 },
    { 
      opacity: 1, 
      duration, 
      delay, 
      ease, 
      clearProps: 'opacity',
      onComplete
    }
  );
};

/**
 * Scale in animation (with optional fade)
 */
export const scaleIn = (
  element: HTMLElement | string,
  options: {
    delay?: number;
    duration?: number;
    fade?: boolean;
    from?: number;
    ease?: string;
    onComplete?: () => void;
  } = {}
) => {
  const {
    delay = 0,
    duration = 0.5,
    fade = true,
    from = 0.95,
    ease = 'power2.out',
    onComplete
  } = options;

  return gsap.fromTo(
    element,
    { 
      scale: from,
      opacity: fade ? 0 : 1 
    },
    { 
      scale: 1,
      opacity: 1,
      duration,
      delay,
      ease,
      clearProps: 'all',
      onComplete
    }
  );
};

/**
 * Reveal text animation (letter by letter)
 * Uses SplitText from GSAP Business when available
 */
export const revealText = (
  element: HTMLElement | string,
  options: {
    delay?: number;
    duration?: number;
    stagger?: number;
    ease?: string;
    onComplete?: () => void;
  } = {}
) => {
  const {
    delay = 0,
    duration = 0.8,
    stagger = 0.02,
    ease = 'power2.out',
    onComplete
  } = options;

  // Check if SplitText is available
  if (isGSAPPluginAvailable('SplitText')) {
    const splitText = new SplitText(element, { type: 'chars' });
    
    return gsap.fromTo(
      splitText.chars,
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration, 
        delay, 
        stagger, 
        ease,
        onComplete: () => {
          // Revert the split text when animation completes
          splitText.revert();
          if (onComplete) onComplete();
        }
      }
    );
  } else {
    // Fallback for when SplitText is not available
    console.log('SplitText not available, using fallback animation');
    return fadeInUp(element, { delay, duration, onComplete });
  }
};

/**
 * Draw SVG path animation
 * Uses DrawSVG from GSAP Business when available
 */
export const drawSVG = (
  element: HTMLElement | string,
  options: {
    delay?: number;
    duration?: number;
    ease?: string;
    from?: string;
    to?: string;
    onComplete?: () => void;
  } = {}
) => {
  const {
    delay = 0,
    duration = 1,
    ease = 'power2.inOut',
    from = '0%',
    to = '100%',
    onComplete
  } = options;

  // Check if DrawSVG is available
  if (isGSAPPluginAvailable('DrawSVG')) {
    return gsap.fromTo(
      element,
      { drawSVG: from },
      { 
        drawSVG: to, 
        duration, 
        delay, 
        ease,
        onComplete
      }
    );
  } else {
    // Fallback for when DrawSVG is not available
    console.log('DrawSVG not available, using fallback animation');
    return gsap.fromTo(
      element,
      { opacity: 0 },
      { 
        opacity: 1, 
        duration, 
        delay, 
        ease: 'power1.inOut',
        onComplete
      }
    );
  }
};

/**
 * Morph SVG shapes
 * Uses MorphSVG from GSAP Business when available
 */
export const morphSVG = (
  element: HTMLElement | string,
  target: string,
  options: {
    delay?: number;
    duration?: number;
    ease?: string;
    onComplete?: () => void;
  } = {}
) => {
  const {
    delay = 0,
    duration = 1,
    ease = 'power2.inOut',
    onComplete
  } = options;

  // Check if MorphSVG is available
  if (isGSAPPluginAvailable('MorphSVG')) {
    return gsap.to(element, { 
      morphSVG: target, 
      duration, 
      delay, 
      ease,
      onComplete
    });
  } else {
    // Fallback for when MorphSVG is not available
    console.log('MorphSVG not available, using fallback animation');
    return gsap.to(element, { 
      opacity: 0, 
      duration: duration / 2, 
      delay, 
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });
  }
};

/**
 * Create a scroll-triggered animation
 */
export const scrollTrigger = (
  element: HTMLElement | string,
  animation: gsap.core.Timeline | gsap.core.Tween,
  options: {
    trigger?: HTMLElement | string;
    start?: string;
    end?: string;
    scrub?: boolean | number;
    markers?: boolean;
    toggleActions?: string;
    pin?: boolean | string;
    anticipatePin?: boolean;
    onEnter?: () => void;
    onLeave?: () => void;
    onEnterBack?: () => void;
    onLeaveBack?: () => void;
  } = {}
) => {
  const {
    trigger = element,
    start = 'top bottom',
    end = 'bottom top',
    scrub = false,
    markers = false,
    toggleActions = 'play none none none',
    pin = false,
    anticipatePin = false,
    onEnter,
    onLeave,
    onEnterBack,
    onLeaveBack
  } = options;

  return ScrollTrigger.create({
    trigger,
    start,
    end,
    scrub,
    markers,
    toggleActions,
    pin,
    anticipatePin,
    animation,
    onEnter,
    onLeave,
    onEnterBack,
    onLeaveBack
  });
};

/**
 * Create a staggered animation for a list of elements
 */
export const staggerElements = (
  elements: HTMLElement[] | string,
  animation: 'fadeInUp' | 'scaleIn' | 'fadeIn',
  options: {
    stagger?: number;
    delay?: number;
    duration?: number;
    onComplete?: () => void;
  } = {}
) => {
  const {
    stagger = 0.08,
    delay = 0,
    duration = 0.5,
    onComplete
  } = options;

  const animationMap = {
    fadeInUp: (el: HTMLElement | string) => fadeInUp(el, { duration }),
    scaleIn: (el: HTMLElement | string) => scaleIn(el, { duration }),
    fadeIn: (el: HTMLElement | string) => fadeIn(el, { duration })
  };

  const timeline = gsap.timeline({ 
    delay,
    onComplete
  });

  timeline.add(
    animationMap[animation](elements),
    0
  );

  return timeline;
};

export default {
  initGSAP,
  isGSAPPluginAvailable,
  fadeInUp,
  fadeOutDown,
  fadeIn,
  scaleIn,
  revealText,
  drawSVG,
  morphSVG,
  scrollTrigger,
  staggerElements
};