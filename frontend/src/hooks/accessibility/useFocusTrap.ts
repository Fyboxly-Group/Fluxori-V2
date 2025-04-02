import { useEffect, useRef } from 'react';

interface FocusTrapOptions {
  active?: boolean;
  initialFocus?: boolean | (() => HTMLElement);
  returnFocusOnDeactivate?: boolean;
  escapeDeactivates?: boolean;
  onDeactivate?: () => void;
}

/**
 * Hook to trap focus within a container for accessibility
 * 
 * @param options - Configuration options for the focus trap
 * @returns Object with focus trap ref
 */
export function useFocusTrap({
  active = true,
  initialFocus = true,
  returnFocusOnDeactivate = true,
  escapeDeactivates = true,
  onDeactivate
}: FocusTrapOptions = {}) {
  const containerRef = useRef<HTMLElement | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  
  // Handle trapping focus when active
  useEffect(() => {
    if (!active || !containerRef.current) return;
    
    // Store previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;
    
    // Get all focusable elements
    const focusableElements = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.hasAttribute('disabled') && el.getAttribute('tabindex') !== '-1');
    
    if (focusableElements.length === 0) {
      console.warn('Focus trap container has no focusable elements');
      return;
    }
    
    // Set initial focus if requested
    if (initialFocus) {
      let elementToFocus: HTMLElement | null = null;
      
      if (typeof initialFocus === 'function') {
        elementToFocus = initialFocus();
      } else {
        // Focus the first focusable element
        elementToFocus = focusableElements[0];
      }
      
      if (elementToFocus) {
        // Small delay to ensure focus works in all browsers
        setTimeout(() => elementToFocus?.focus(), 0);
      }
    }
    
    // Handle keydown events
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Escape key
      if (escapeDeactivates && event.key === 'Escape') {
        event.preventDefault();
        onDeactivate?.();
        return;
      }
      
      // Handle Tab key for focus trapping
      if (event.key === 'Tab') {
        // If there's only one focusable element, prevent tabbing
        if (focusableElements.length === 1) {
          event.preventDefault();
          return;
        }
        
        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];
        
        // Shift+Tab from first element should loop to last element
        if (event.shiftKey && document.activeElement === firstFocusableElement) {
          event.preventDefault();
          lastFocusableElement.focus();
        } 
        // Tab from last element should loop to first element
        else if (!event.shiftKey && document.activeElement === lastFocusableElement) {
          event.preventDefault();
          firstFocusableElement.focus();
        }
      }
    };
    
    // Listen for keydown events
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Return focus to the element that was focused before the trap was activated
      if (returnFocusOnDeactivate && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [active, initialFocus, returnFocusOnDeactivate, escapeDeactivates, onDeactivate]);
  
  return {
    ref: containerRef
  };
}