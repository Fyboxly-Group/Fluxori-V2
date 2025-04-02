import { useState, useEffect, useCallback, useRef } from 'react';

interface KeyboardShortcut {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  scope?: string;
}

interface KeyboardNavigationOptions {
  shortcuts?: KeyboardShortcut[];
  focusableSelector?: string;
  trapFocus?: boolean;
  scope?: string;
  returnFocusOnUnmount?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
  onEscape?: () => void;
}

/**
 * Hook for implementing keyboard navigation and shortcuts
 * 
 * @param options Configuration options for keyboard navigation
 * @returns Object with utility functions and state
 */
export function useKeyboardNavigation({
  shortcuts = [],
  focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  trapFocus = false,
  scope = 'global',
  returnFocusOnUnmount = false,
  initialFocusRef,
  onEscape
}: KeyboardNavigationOptions = {}) {
  const containerRef = useRef<HTMLElement | null>(null);
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);
  const [activeFocusIndex, setActiveFocusIndex] = useState<number>(-1);
  const previousFocusedElement = useRef<HTMLElement | null>(null);
  
  // Store the previously focused element when the hook mounts
  useEffect(() => {
    previousFocusedElement.current = document.activeElement as HTMLElement;
    
    // Return focus to the previous element when unmounting
    return () => {
      if (returnFocusOnUnmount && previousFocusedElement.current) {
        previousFocusedElement.current.focus();
      }
    };
  }, [returnFocusOnUnmount]);
  
  // Set initial focus if provided
  useEffect(() => {
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
    }
  }, [initialFocusRef]);
  
  // Update focusable elements when the container or selector changes
  const updateFocusableElements = useCallback(() => {
    if (!containerRef.current) return;
    
    const elements = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelector)
    ).filter(el => !el.hasAttribute('disabled') && el.getAttribute('tabindex') !== '-1');
    
    setFocusableElements(elements);
  }, [focusableSelector]);
  
  // Set the container ref
  const setContainerRef = useCallback((element: HTMLElement | null) => {
    containerRef.current = element;
    if (element) {
      updateFocusableElements();
    }
  }, [updateFocusableElements]);
  
  // Handle focus movement in the container
  const moveFocus = useCallback((direction: 'next' | 'previous') => {
    if (focusableElements.length === 0) return;
    
    let nextIndex: number;
    
    if (activeFocusIndex === -1) {
      // If no element is focused, start from the beginning or end
      nextIndex = direction === 'next' ? 0 : focusableElements.length - 1;
    } else {
      // Calculate the next index based on direction
      nextIndex = direction === 'next'
        ? (activeFocusIndex + 1) % focusableElements.length
        : (activeFocusIndex - 1 + focusableElements.length) % focusableElements.length;
    }
    
    focusableElements[nextIndex].focus();
    setActiveFocusIndex(nextIndex);
  }, [focusableElements, activeFocusIndex]);
  
  // Handle keydown events for tab trapping and shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Handle tab key for focus trapping
    if (trapFocus && event.key === 'Tab') {
      if (focusableElements.length <= 1) {
        event.preventDefault();
        return;
      }
      
      if (event.shiftKey) {
        // Shift+Tab: move focus to the previous element
        if (document.activeElement === focusableElements[0]) {
          event.preventDefault();
          focusableElements[focusableElements.length - 1].focus();
          setActiveFocusIndex(focusableElements.length - 1);
        }
      } else {
        // Tab: move focus to the next element
        if (document.activeElement === focusableElements[focusableElements.length - 1]) {
          event.preventDefault();
          focusableElements[0].focus();
          setActiveFocusIndex(0);
        }
      }
    }
    
    // Handle Escape key
    if (event.key === 'Escape' && onEscape) {
      event.preventDefault();
      onEscape();
    }
    
    // Handle custom shortcuts
    const shortcut = shortcuts.find(
      s => s.key === event.key &&
           (s.metaKey === undefined || s.metaKey === event.metaKey) &&
           (s.ctrlKey === undefined || s.ctrlKey === event.ctrlKey) &&
           (s.shiftKey === undefined || s.shiftKey === event.shiftKey) &&
           (s.altKey === undefined || s.altKey === event.altKey) &&
           (s.scope === undefined || s.scope === scope)
    );
    
    if (shortcut) {
      event.preventDefault();
      shortcut.action();
    }
  }, [trapFocus, focusableElements, shortcuts, onEscape, scope]);
  
  // Register keyboard event listeners
  useEffect(() => {
    const targetElement = trapFocus ? containerRef.current : document;
    if (!targetElement) return;
    
    targetElement.addEventListener('keydown', handleKeyDown);
    return () => {
      targetElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [trapFocus, handleKeyDown]);
  
  // Monitor focus changes to update the active index
  useEffect(() => {
    const handleFocusChange = () => {
      const focusedElementIndex = focusableElements.findIndex(el => el === document.activeElement);
      if (focusedElementIndex !== -1) {
        setActiveFocusIndex(focusedElementIndex);
      }
    };
    
    document.addEventListener('focusin', handleFocusChange);
    return () => {
      document.removeEventListener('focusin', handleFocusChange);
    };
  }, [focusableElements]);
  
  // Re-calculate focusable elements when children change
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new MutationObserver(updateFocusableElements);
    observer.observe(containerRef.current, { childList: true, subtree: true });
    
    return () => {
      observer.disconnect();
    };
  }, [updateFocusableElements]);
  
  // Focus the first or last element
  const focusFirst = useCallback(() => {
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
      setActiveFocusIndex(0);
    }
  }, [focusableElements]);
  
  const focusLast = useCallback(() => {
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
      setActiveFocusIndex(focusableElements.length - 1);
    }
  }, [focusableElements]);
  
  // Focus a specific element by index
  const focusAt = useCallback((index: number) => {
    if (index >= 0 && index < focusableElements.length) {
      focusableElements[index].focus();
      setActiveFocusIndex(index);
    }
  }, [focusableElements]);
  
  // Get all active shortcuts
  const getActiveShortcuts = useCallback(() => {
    return shortcuts.filter(s => s.scope === undefined || s.scope === scope);
  }, [shortcuts, scope]);
  
  return {
    setContainerRef,
    focusableElements,
    activeFocusIndex,
    moveFocus,
    focusFirst,
    focusLast,
    focusAt,
    getActiveShortcuts,
    updateFocusableElements
  };
}