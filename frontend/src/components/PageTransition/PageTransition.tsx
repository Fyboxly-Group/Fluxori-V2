import React, { useEffect, useRef } from 'react';
import { Box, BoxProps } from '@mantine/core';
import gsap from 'gsap';
import { usePathname } from 'next/navigation';

export type TransitionType = 
  | 'fade' 
  | 'slide-up' 
  | 'slide-down' 
  | 'slide-left' 
  | 'slide-right' 
  | 'scale' 
  | 'flip' 
  | 'reveal';

export interface PageTransitionProps extends BoxProps {
  /** Children to render */
  children: React.ReactNode;
  /** Animation type */
  type?: TransitionType;
  /** Animation duration in seconds */
  duration?: number;
  /** Delay before animation starts in seconds */
  delay?: number;
  /** Whether to use ease in/out or custom easing */
  ease?: string;
  /** Whether to disable the transition */
  disabled?: boolean;
}

/**
 * Component to add animated transitions between pages
 * Uses GSAP for smooth, performant animations
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'fade',
  duration = 0.5,
  delay = 0,
  ease = 'power2.out',
  disabled = false,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname(); // Used to trigger animation on route change
  
  // Animation reference to store the timeline
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  
  // Set up initial styles based on animation type
  useEffect(() => {
    if (!containerRef.current || disabled) return;
    
    const element = containerRef.current;
    
    // Set initial styles based on animation type
    switch (type) {
      case 'fade':
        gsap.set(element, { opacity: 0 });
        break;
      case 'slide-up':
        gsap.set(element, { opacity: 0, y: 50 });
        break;
      case 'slide-down':
        gsap.set(element, { opacity: 0, y: -50 });
        break;
      case 'slide-left':
        gsap.set(element, { opacity: 0, x: 50 });
        break;
      case 'slide-right':
        gsap.set(element, { opacity: 0, x: -50 });
        break;
      case 'scale':
        gsap.set(element, { opacity: 0, scale: 0.9 });
        break;
      case 'flip':
        gsap.set(element, { opacity: 0, rotationX: -15, perspective: 600 });
        break;
      case 'reveal':
        // Set up clip-path for reveal animation
        gsap.set(element, { 
          clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)', 
          opacity: 1 
        });
        break;
    }
  }, [type, disabled]);
  
  // Trigger entrance animation
  useEffect(() => {
    if (!containerRef.current || disabled) return;
    
    const element = containerRef.current;
    
    // Kill any existing animation
    if (animationRef.current) {
      animationRef.current.kill();
    }
    
    // Create a new timeline
    const tl = gsap.timeline({
      delay,
      paused: true,
      onComplete: () => {
        // Clean up properties for better performance
        if (type !== 'reveal') {
          gsap.set(element, { clearProps: 'all' });
        }
      }
    });
    
    // Configure animation based on type
    switch (type) {
      case 'fade':
        tl.to(element, { opacity: 1, duration, ease });
        break;
      case 'slide-up':
        tl.to(element, { opacity: 1, y: 0, duration, ease });
        break;
      case 'slide-down':
        tl.to(element, { opacity: 1, y: 0, duration, ease });
        break;
      case 'slide-left':
        tl.to(element, { opacity: 1, x: 0, duration, ease });
        break;
      case 'slide-right':
        tl.to(element, { opacity: 1, x: 0, duration, ease });
        break;
      case 'scale':
        tl.to(element, { opacity: 1, scale: 1, duration, ease });
        break;
      case 'flip':
        tl.to(element, { 
          opacity: 1, 
          rotationX: 0, 
          duration, 
          ease 
        });
        break;
      case 'reveal':
        tl.to(element, { 
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', 
          duration, 
          ease: 'power4.inOut' 
        });
        break;
    }
    
    // Store the animation reference
    animationRef.current = tl;
    
    // Play the animation
    tl.play();
    
    return () => {
      // Clean up by killing the animation
      tl.kill();
    };
  }, [pathname, type, duration, delay, ease, disabled]);
  
  // Trigger exit animation on route change
  const handleExit = () => {
    if (!containerRef.current || disabled) return;
    
    const element = containerRef.current;
    
    // Create exit timeline
    const exitTl = gsap.timeline({
      onComplete: () => {
        // Clean up after exit animation
        gsap.set(element, { clearProps: 'all' });
      },
    });
    
    // Configure exit animation based on type
    switch (type) {
      case 'fade':
        exitTl.to(element, { opacity: 0, duration: duration / 2, ease: 'power2.in' });
        break;
      case 'slide-up':
        exitTl.to(element, { opacity: 0, y: -50, duration: duration / 2, ease: 'power2.in' });
        break;
      case 'slide-down':
        exitTl.to(element, { opacity: 0, y: 50, duration: duration / 2, ease: 'power2.in' });
        break;
      case 'slide-left':
        exitTl.to(element, { opacity: 0, x: -50, duration: duration / 2, ease: 'power2.in' });
        break;
      case 'slide-right':
        exitTl.to(element, { opacity: 0, x: 50, duration: duration / 2, ease: 'power2.in' });
        break;
      case 'scale':
        exitTl.to(element, { opacity: 0, scale: 0.9, duration: duration / 2, ease: 'power2.in' });
        break;
      case 'flip':
        exitTl.to(element, { 
          opacity: 0, 
          rotationX: 15, 
          duration: duration / 2, 
          ease: 'power2.in' 
        });
        break;
      case 'reveal':
        exitTl.to(element, { 
          clipPath: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)', 
          duration: duration / 2, 
          ease: 'power4.inOut' 
        });
        break;
    }
    
    return exitTl;
  };
  
  return (
    <Box
      ref={containerRef}
      style={{
        willChange: 'transform, opacity',
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default PageTransition;