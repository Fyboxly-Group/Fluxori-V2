import { useCallback, useEffect, useRef } from 'react';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { useAnnounce } from './useAnnounce';

interface AnimationA11yOptions {
  animationType?: 'enter' | 'exit' | 'update' | 'transition';
  announcementEnter?: string;
  announcementExit?: string;
  announcementUpdate?: string;
  announceAnimations?: boolean;
  applyAriaAttributes?: boolean;
}

/**
 * Hook to make animations accessible by managing ARIA attributes
 * and screen reader announcements
 * 
 * @param options - Configuration options
 * @returns Object with accessibility utilities
 */
export function useAnimationA11y({
  animationType = 'enter',
  announcementEnter = 'Content has appeared',
  announcementExit = 'Content has disappeared',
  announcementUpdate = 'Content has updated',
  announceAnimations = true,
  applyAriaAttributes = true
}: AnimationA11yOptions = {}) {
  const elementRef = useRef<HTMLElement | null>(null);
  const isAnimating = useRef<boolean>(false);
  const { motionPreference } = useMotionPreference();
  const { announce } = useAnnounce();
  
  /**
   * Set the ref to the element to add accessibility attributes
   */
  const setRef = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
    
    // Set initial ARIA attributes
    if (element && applyAriaAttributes) {
      // For elements that will be animated on mount
      if (animationType === 'enter') {
        element.setAttribute('aria-hidden', 'true');
      }
    }
  }, [applyAriaAttributes, animationType]);
  
  /**
   * Update ARIA attributes based on animation state
   */
  const updateAccessibility = useCallback((state: 'start' | 'complete') => {
    const element = elementRef.current;
    if (!element) return;
    
    if (state === 'start') {
      isAnimating.current = true;
      
      if (applyAriaAttributes) {
        // Add busy state for longer animations
        if (motionPreference === 'full') {
          element.setAttribute('aria-busy', 'true');
        }
        
        // Update visibility based on animation type
        if (animationType === 'enter') {
          element.setAttribute('aria-hidden', 'true');
        }
        
        // Add a live region attribute for important updates
        if (animationType === 'update') {
          element.setAttribute('aria-live', 'polite');
        }
      }
    } else if (state === 'complete') {
      isAnimating.current = false;
      
      if (applyAriaAttributes) {
        // Remove busy state
        element.removeAttribute('aria-busy');
        
        // Update visibility based on animation type
        if (animationType === 'enter') {
          element.removeAttribute('aria-hidden');
        } else if (animationType === 'exit') {
          element.setAttribute('aria-hidden', 'true');
        }
        
        // Make announcements if enabled
        if (announceAnimations && motionPreference !== 'minimal') {
          switch (animationType) {
            case 'enter':
              announce(announcementEnter, { politeness: 'polite' });
              break;
            case 'exit':
              announce(announcementExit, { politeness: 'polite' });
              break;
            case 'update':
              announce(announcementUpdate, { politeness: 'polite' });
              break;
          }
        }
      }
    }
  }, [
    applyAriaAttributes, 
    animationType, 
    motionPreference, 
    announceAnimations, 
    announce, 
    announcementEnter, 
    announcementExit, 
    announcementUpdate
  ]);
  
  /**
   * Cleans up ARIA attributes when the component unmounts
   */
  useEffect(() => {
    return () => {
      // If the element reference exists, clean up ARIA attributes
      const element = elementRef.current;
      if (element && applyAriaAttributes) {
        element.removeAttribute('aria-busy');
        if (animationType === 'enter') {
          element.removeAttribute('aria-hidden');
        }
      }
    };
  }, [applyAriaAttributes, animationType]);
  
  return {
    ref: setRef,
    onAnimationStart: () => updateAccessibility('start'),
    onAnimationComplete: () => updateAccessibility('complete'),
    isAnimating: () => isAnimating.current
  };
}