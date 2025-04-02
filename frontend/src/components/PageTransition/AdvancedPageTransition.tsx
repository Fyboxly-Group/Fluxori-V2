import React, { useEffect, useRef, useState } from 'react';
import { Box, useMantineTheme } from '@mantine/core';
import { gsap } from 'gsap';
import { useRouter } from 'next/router';
import { useMotionPreference } from '@/hooks/useMotionPreference';

export type TransitionEffect = 
  'fade' | 
  'slideUp' | 
  'slideDown' | 
  'slideLeft' | 
  'slideRight' | 
  'scale' | 
  'flip' | 
  'rotate' | 
  'wipe' | 
  'reveal';

export interface AdvancedPageTransitionProps {
  /** The content to be animated */
  children: React.ReactNode;
  /** The type of transition effect */
  effect?: TransitionEffect;
  /** Duration of the transition in seconds */
  duration?: number;
  /** Whether to skip exit animations (useful for initial page load) */
  skipExit?: boolean;
  /** Custom easing function for the transition */
  easing?: string;
  /** Whether to track route changes for exit animations */
  trackRouteChanges?: boolean;
  /** Callback when enter animation starts */
  onEnterStart?: () => void;
  /** Callback when enter animation completes */
  onEnterComplete?: () => void;
  /** Callback when exit animation starts */
  onExitStart?: () => void;
  /** Callback when exit animation completes */
  onExitComplete?: () => void;
}

/**
 * Advanced page transition component with configurable effects
 * Handles both enter and exit animations with Next.js router integration
 */
export const AdvancedPageTransition: React.FC<AdvancedPageTransitionProps> = ({
  children,
  effect = 'fade',
  duration = 0.5,
  skipExit = false,
  easing = 'power2.inOut',
  trackRouteChanges = true,
  onEnterStart,
  onEnterComplete,
  onExitStart,
  onExitComplete
}) => {
  const theme = useMantineTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter ? useRouter() : null;
  const { motionPreference } = useMotionPreference();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Skip animations if reduced motion is preferred
  const reduceMotion = motionPreference.reduced || motionPreference.level === 'minimal';
  const animationDuration = reduceMotion ? 0.15 : duration;
  
  // Create a timeline for enter animations
  const createEnterAnimation = () => {
    if (!containerRef.current) return null;
    
    const timeline = gsap.timeline({
      paused: true,
      onStart: onEnterStart,
      onComplete: onEnterComplete
    });
    
    const target = containerRef.current;
    
    // Apply different entrance animations based on the effect
    switch (effect) {
      case 'fade':
        timeline.fromTo(
          target,
          { opacity: 0 },
          { opacity: 1, duration: animationDuration, ease: easing }
        );
        break;
        
      case 'slideUp':
        timeline.fromTo(
          target,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: animationDuration, ease: easing }
        );
        break;
        
      case 'slideDown':
        timeline.fromTo(
          target,
          { opacity: 0, y: -50 },
          { opacity: 1, y: 0, duration: animationDuration, ease: easing }
        );
        break;
        
      case 'slideLeft':
        timeline.fromTo(
          target,
          { opacity: 0, x: 50 },
          { opacity: 1, x: 0, duration: animationDuration, ease: easing }
        );
        break;
        
      case 'slideRight':
        timeline.fromTo(
          target,
          { opacity: 0, x: -50 },
          { opacity: 1, x: 0, duration: animationDuration, ease: easing }
        );
        break;
        
      case 'scale':
        timeline.fromTo(
          target,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: animationDuration, ease: easing }
        );
        break;
        
      case 'flip':
        if (reduceMotion) {
          timeline.fromTo(
            target,
            { opacity: 0 },
            { opacity: 1, duration: animationDuration, ease: easing }
          );
        } else {
          timeline.fromTo(
            target,
            { opacity: 0, rotationX: 90, transformPerspective: 600 },
            { 
              opacity: 1, 
              rotationX: 0, 
              duration: animationDuration, 
              ease: easing 
            }
          );
        }
        break;
        
      case 'rotate':
        if (reduceMotion) {
          timeline.fromTo(
            target,
            { opacity: 0 },
            { opacity: 1, duration: animationDuration, ease: easing }
          );
        } else {
          timeline.fromTo(
            target,
            { opacity: 0, rotation: -5, scale: 0.95 },
            { 
              opacity: 1, 
              rotation: 0, 
              scale: 1, 
              duration: animationDuration, 
              ease: easing 
            }
          );
        }
        break;
        
      case 'wipe':
        if (reduceMotion) {
          timeline.fromTo(
            target,
            { opacity: 0 },
            { opacity: 1, duration: animationDuration, ease: easing }
          );
        } else {
          // Create a wipe effect using clipPath
          timeline.fromTo(
            target,
            { 
              clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
              opacity: 1 
            },
            { 
              clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
              duration: animationDuration,
              ease: easing
            }
          );
        }
        break;
      
      case 'reveal':
        if (reduceMotion) {
          timeline.fromTo(
            target,
            { opacity: 0 },
            { opacity: 1, duration: animationDuration, ease: easing }
          );
        } else {
          // Add a reveal mask
          const mask = document.createElement('div');
          mask.style.position = 'absolute';
          mask.style.top = '0';
          mask.style.left = '0';
          mask.style.width = '100%';
          mask.style.height = '100%';
          mask.style.backgroundColor = theme.colorScheme === 'dark' 
            ? theme.colors.dark[4] 
            : theme.colors.gray[0];
          mask.style.zIndex = '1';
          
          if (containerRef.current) {
            containerRef.current.style.position = 'relative';
            containerRef.current.appendChild(mask);
          }
          
          timeline
            .set(target, { opacity: 1 })
            .to(mask, { 
              scaleX: 0, 
              transformOrigin: 'right', 
              duration: animationDuration,
              ease: easing,
              onComplete: () => {
                if (containerRef.current && containerRef.current.contains(mask)) {
                  containerRef.current.removeChild(mask);
                }
              }
            });
        }
        break;
      
      default:
        timeline.fromTo(
          target,
          { opacity: 0 },
          { opacity: 1, duration: animationDuration, ease: easing }
        );
    }
    
    return timeline;
  };
  
  // Create a timeline for exit animations
  const createExitAnimation = () => {
    if (!containerRef.current) return null;
    
    const timeline = gsap.timeline({
      paused: true,
      onStart: onExitStart,
      onComplete: onExitComplete
    });
    
    const target = containerRef.current;
    
    // Apply different exit animations based on the effect
    switch (effect) {
      case 'fade':
        timeline.to(
          target,
          { opacity: 0, duration: animationDuration, ease: easing }
        );
        break;
        
      case 'slideUp':
        timeline.to(
          target,
          { opacity: 0, y: -50, duration: animationDuration, ease: easing }
        );
        break;
        
      case 'slideDown':
        timeline.to(
          target,
          { opacity: 0, y: 50, duration: animationDuration, ease: easing }
        );
        break;
        
      case 'slideLeft':
        timeline.to(
          target,
          { opacity: 0, x: -50, duration: animationDuration, ease: easing }
        );
        break;
        
      case 'slideRight':
        timeline.to(
          target,
          { opacity: 0, x: 50, duration: animationDuration, ease: easing }
        );
        break;
        
      case 'scale':
        timeline.to(
          target,
          { opacity: 0, scale: 0.9, duration: animationDuration, ease: easing }
        );
        break;
        
      case 'flip':
        if (reduceMotion) {
          timeline.to(
            target,
            { opacity: 0, duration: animationDuration, ease: easing }
          );
        } else {
          timeline.to(
            target,
            { 
              opacity: 0, 
              rotationX: -90, 
              transformPerspective: 600, 
              duration: animationDuration, 
              ease: easing 
            }
          );
        }
        break;
        
      case 'rotate':
        if (reduceMotion) {
          timeline.to(
            target,
            { opacity: 0, duration: animationDuration, ease: easing }
          );
        } else {
          timeline.to(
            target,
            { 
              opacity: 0, 
              rotation: 5, 
              scale: 0.95, 
              duration: animationDuration, 
              ease: easing 
            }
          );
        }
        break;
        
      case 'wipe':
        if (reduceMotion) {
          timeline.to(
            target,
            { opacity: 0, duration: animationDuration, ease: easing }
          );
        } else {
          // Create a wipe effect using clipPath
          timeline.to(
            target,
            { 
              clipPath: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)',
              duration: animationDuration,
              ease: easing
            }
          );
        }
        break;
      
      case 'reveal':
        if (reduceMotion) {
          timeline.to(
            target,
            { opacity: 0, duration: animationDuration, ease: easing }
          );
        } else {
          // Add a reveal mask
          const mask = document.createElement('div');
          mask.style.position = 'absolute';
          mask.style.top = '0';
          mask.style.left = '0';
          mask.style.width = '0%';
          mask.style.height = '100%';
          mask.style.backgroundColor = theme.colorScheme === 'dark' 
            ? theme.colors.dark[4] 
            : theme.colors.gray[0];
          mask.style.zIndex = '1';
          mask.style.transformOrigin = 'left';
          
          if (containerRef.current) {
            containerRef.current.style.position = 'relative';
            containerRef.current.appendChild(mask);
          }
          
          timeline.to(mask, { 
            scaleX: 100, 
            duration: animationDuration,
            ease: easing
          });
        }
        break;
      
      default:
        timeline.to(
          target,
          { opacity: 0, duration: animationDuration, ease: easing }
        );
    }
    
    return timeline;
  };
  
  // Perform enter animation on mount
  useEffect(() => {
    const enterTimeline = createEnterAnimation();
    
    if (enterTimeline) {
      enterTimeline.play();
    }
    
    setIsLoaded(true);
    
    return () => {
      // Clean up any animations
      if (enterTimeline) {
        enterTimeline.kill();
      }
    };
  }, []);
  
  // Set up route change listener for exit animations (if enabled and router is available)
  useEffect(() => {
    if (!trackRouteChanges || !router || !isLoaded) return;
    
    const handleRouteChangeStart = () => {
      // Create and play exit animation
      const exitTimeline = createExitAnimation();
      
      if (exitTimeline && !skipExit) {
        exitTimeline.play();
      }
    };
    
    // Register event listeners
    router.events.on('routeChangeStart', handleRouteChangeStart);
    
    return () => {
      // Clean up event listeners
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [router, trackRouteChanges, isLoaded, skipExit]);
  
  return (
    <Box 
      ref={containerRef}
      sx={{ 
        opacity: reduceMotion ? 1 : 0, // Start hidden if animations enabled
        height: '100%'
      }}
    >
      {children}
    </Box>
  );
};

export default AdvancedPageTransition;