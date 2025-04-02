import React, { useEffect, useRef, useState } from 'react';
import { Box, BoxProps } from '@mantine/core';
import gsap from 'gsap';
import { useIntersection } from '@mantine/hooks';

export type MotionType = 
  | 'fade-in' 
  | 'fade-up' 
  | 'fade-down' 
  | 'fade-left' 
  | 'fade-right' 
  | 'zoom-in' 
  | 'zoom-out' 
  | 'flip' 
  | 'rotate' 
  | 'bounce'
  | 'reveal'
  | 'text-reveal';

export interface TriggerMotionProps extends BoxProps {
  /** Children to animate */
  children: React.ReactNode;
  /** Type of animation */
  type?: MotionType;
  /** Duration of the animation in seconds */
  duration?: number;
  /** Delay before animation starts in seconds */
  delay?: number;
  /** Animation easing */
  ease?: string;
  /** Whether to stagger child elements */
  stagger?: boolean;
  /** Stagger amount in seconds */
  staggerAmount?: number;
  /** Stagger from direction */
  staggerFrom?: 'start' | 'end' | 'center' | 'edges' | 'random';
  /** Amount of motion (distance in pixels for translations) */
  amount?: number;
  /** Threshold for intersection observer (0 to 1) */
  threshold?: number;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Whether to animate once or every time element enters viewport */
  once?: boolean;
  /** Whether animation is disabled */
  disabled?: boolean;
  /** Additional CSS for the container */
  containerStyle?: React.CSSProperties;
}

/**
 * Component that triggers animations when elements enter the viewport
 * Uses GSAP and Intersection Observer for performant animations
 */
export const TriggerMotion: React.FC<TriggerMotionProps> = ({
  children,
  type = 'fade-up',
  duration = 0.6,
  delay = 0,
  ease = 'power2.out',
  stagger = false,
  staggerAmount = 0.1,
  staggerFrom = 'start',
  amount = 40,
  threshold = 0.1,
  rootMargin = '0px',
  once = true,
  disabled = false,
  containerStyle,
  ...boxProps
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Set up intersection observer
  const { ref, entry } = useIntersection({
    threshold,
    rootMargin,
  });
  
  // Combine refs
  const setRefs = (node: HTMLDivElement | null) => {
    containerRef.current = node;
    ref(node);
  };
  
  // Set initial styles
  useEffect(() => {
    if (!containerRef.current || disabled || (once && hasAnimated)) return;
    
    const container = containerRef.current;
    const elements = stagger
      ? Array.from(container.children)
      : [container];
    
    // Set initial styles based on animation type
    switch (type) {
      case 'fade-in':
        gsap.set(elements, { opacity: 0 });
        break;
      case 'fade-up':
        gsap.set(elements, { opacity: 0, y: amount });
        break;
      case 'fade-down':
        gsap.set(elements, { opacity: 0, y: -amount });
        break;
      case 'fade-left':
        gsap.set(elements, { opacity: 0, x: amount });
        break;
      case 'fade-right':
        gsap.set(elements, { opacity: 0, x: -amount });
        break;
      case 'zoom-in':
        gsap.set(elements, { opacity: 0, scale: 0.5 });
        break;
      case 'zoom-out':
        gsap.set(elements, { opacity: 0, scale: 1.5 });
        break;
      case 'flip':
        gsap.set(elements, { opacity: 0, rotationX: 90, perspective: 500 });
        break;
      case 'rotate':
        gsap.set(elements, { opacity: 0, rotation: -15 });
        break;
      case 'bounce':
        gsap.set(elements, { opacity: 0, y: amount });
        break;
      case 'reveal':
        // Set up clip-path for reveal animation
        gsap.set(elements, { 
          clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)', 
          opacity: 1 
        });
        break;
      case 'text-reveal':
        // Handle text animation
        elements.forEach(el => {
          // Wrap text in spans for character animation
          if (el.nodeType === Node.ELEMENT_NODE) {
            const textNodes = Array.from(el.childNodes).filter(
              node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
            );
            
            textNodes.forEach(textNode => {
              const text = textNode.textContent || '';
              const parent = textNode.parentNode;
              
              if (parent) {
                const wrapper = document.createElement('span');
                wrapper.style.display = 'inline-block';
                wrapper.style.overflow = 'hidden';
                
                const innerSpan = document.createElement('span');
                innerSpan.style.display = 'inline-block';
                innerSpan.textContent = text;
                
                wrapper.appendChild(innerSpan);
                parent.replaceChild(wrapper, textNode);
                
                gsap.set(innerSpan, { 
                  opacity: 0, 
                  y: 30 
                });
              }
            });
          }
        });
        break;
    }
  }, [type, amount, once, hasAnimated, disabled, stagger]);
  
  // Handle animation when element enters viewport
  useEffect(() => {
    if (!containerRef.current || disabled || (once && hasAnimated)) return;
    
    const isInView = entry?.isIntersecting;
    if (!isInView) return;
    
    const container = containerRef.current;
    
    // Kill any existing animation
    if (animationRef.current) {
      animationRef.current.kill();
    }
    
    // Determine animation targets
    const elements = stagger
      ? Array.from(container.children)
      : [container];
    
    // Create animation timeline
    const tl = gsap.timeline({
      delay,
      onComplete: () => {
        if (once) {
          setHasAnimated(true);
        }
      },
    });
    
    // Special case for text reveal animation
    if (type === 'text-reveal') {
      const textElements: HTMLElement[] = [];
      
      // Find all wrapped text spans
      elements.forEach(el => {
        if (el.nodeType === Node.ELEMENT_NODE) {
          const wrappers = el.querySelectorAll('span > span');
          wrappers.forEach(wrapper => {
            textElements.push(wrapper as HTMLElement);
          });
        }
      });
      
      // Animate each character with stagger
      tl.to(textElements, {
        opacity: 1,
        y: 0,
        duration,
        stagger: {
          amount: staggerAmount * 3, // More pronounced stagger for text
          from: staggerFrom
        },
        ease
      });
      
      animationRef.current = tl;
      return;
    }
    
    // Configure animation based on type
    const getAnimation = () => {
      switch (type) {
        case 'fade-in':
          return { opacity: 1, duration, ease };
        case 'fade-up':
          return { opacity: 1, y: 0, duration, ease };
        case 'fade-down':
          return { opacity: 1, y: 0, duration, ease };
        case 'fade-left':
          return { opacity: 1, x: 0, duration, ease };
        case 'fade-right':
          return { opacity: 1, x: 0, duration, ease };
        case 'zoom-in':
          return { opacity: 1, scale: 1, duration, ease };
        case 'zoom-out':
          return { opacity: 1, scale: 1, duration, ease };
        case 'flip':
          return { opacity: 1, rotationX: 0, duration, ease };
        case 'rotate':
          return { opacity: 1, rotation: 0, duration, ease };
        case 'bounce':
          return { 
            opacity: 1, 
            y: 0, 
            duration, 
            ease: 'elastic.out(1, 0.5)'
          };
        case 'reveal':
          return { 
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', 
            duration, 
            ease: 'power4.inOut'
          };
        default:
          return { opacity: 1, duration, ease };
      }
    };
    
    const animation = getAnimation();
    
    // Apply animation with or without stagger
    if (stagger && elements.length > 1) {
      tl.to(elements, {
        ...animation,
        stagger: {
          amount: staggerAmount,
          from: staggerFrom
        }
      });
    } else {
      tl.to(elements, animation);
    }
    
    animationRef.current = tl;
    
    // Clean up
    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [
    entry, 
    type, 
    duration, 
    delay, 
    ease, 
    stagger, 
    staggerAmount, 
    staggerFrom, 
    amount, 
    once, 
    hasAnimated, 
    disabled
  ]);
  
  return (
    <Box
      ref={setRefs}
      style={{
        willChange: 'transform, opacity',
        position: 'relative',
        ...containerStyle
      }}
      {...boxProps}
    >
      {children}
    </Box>
  );
};

export default TriggerMotion;