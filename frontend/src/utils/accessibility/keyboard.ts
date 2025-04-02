/**
 * Keyboard navigation utilities for accessibility
 * 
 * This utility provides helper functions for keyboard navigation,
 * focus management, and keyboard shortcuts.
 */

/**
 * Checks if the user is navigating with a keyboard by detecting
 * the Tab key press and adding a class to the body element.
 */
export function setupKeyboardDetection(): void {
  if (typeof window === 'undefined') return;

  function handleFirstTab(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      document.body.classList.add('user-is-tabbing');
      window.removeEventListener('keydown', handleFirstTab);
      window.addEventListener('mousedown', handleMouseDownOnce);
    }
  }

  function handleMouseDownOnce() {
    document.body.classList.remove('user-is-tabbing');
    window.removeEventListener('mousedown', handleMouseDownOnce);
    window.addEventListener('keydown', handleFirstTab);
  }

  window.addEventListener('keydown', handleFirstTab);
}

/**
 * Focus the first focusable element in a container
 */
export function focusFirstElement(container: HTMLElement | null): HTMLElement | null {
  if (!container) return null;

  const focusableElements = getFocusableElements(container);
  if (focusableElements.length > 0) {
    const firstElement = focusableElements[0] as HTMLElement;
    firstElement.focus();
    return firstElement;
  }
  return null;
}

/**
 * Focus the last focusable element in a container
 */
export function focusLastElement(container: HTMLElement | null): HTMLElement | null {
  if (!container) return null;

  const focusableElements = getFocusableElements(container);
  if (focusableElements.length > 0) {
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    lastElement.focus();
    return lastElement;
  }
  return null;
}

/**
 * Get all focusable elements in a container
 */
export function getFocusableElements(
  container: HTMLElement,
  selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
): Element[] {
  return Array.from(container.querySelectorAll(selector))
    .filter(element => {
      // Further filter elements that might be hidden or disabled
      const el = element as HTMLElement;
      return (
        !el.hasAttribute('disabled') &&
        !el.hasAttribute('aria-hidden') &&
        el.style.display !== 'none' &&
        el.style.visibility !== 'hidden'
      );
    });
}

/**
 * Creates a keyboard shortcut handler
 */
interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  handler: (event: KeyboardEvent) => void;
  preventDefault?: boolean;
}

export function setupKeyboardShortcuts(shortcuts: Shortcut[]): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleKeyDown = (event: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      if (
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        (shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey) &&
        (shortcut.altKey === undefined || event.altKey === shortcut.altKey) &&
        (shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey) &&
        (shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey)
      ) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.handler(event);
        break;
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Creates a focus trap within a container
 */
export function createFocusTrap(container: HTMLElement, autoFocus: boolean = true): {
  activate: () => void;
  deactivate: () => void;
} {
  let lastFocusedElement: HTMLElement | null = null;
  let isActive = false;
  let handleKeyDown: ((event: KeyboardEvent) => void) | null = null;

  const activate = () => {
    if (isActive) return;
    
    // Store currently focused element to restore later
    lastFocusedElement = document.activeElement as HTMLElement;
    
    // Setup the keydown listener for trapping focus
    handleKeyDown = (event) => {
      if (event.key !== 'Tab' || !isActive) return;
      
      const focusableElements = getFocusableElements(container);
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (event.shiftKey && document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Auto-focus the first element if requested
    if (autoFocus) {
      focusFirstElement(container);
    }
    
    isActive = true;
  };
  
  const deactivate = () => {
    if (!isActive) return;
    
    if (handleKeyDown) {
      document.removeEventListener('keydown', handleKeyDown);
      handleKeyDown = null;
    }
    
    // Restore focus to the previously focused element
    if (lastFocusedElement && document.body.contains(lastFocusedElement)) {
      lastFocusedElement.focus();
    }
    
    isActive = false;
  };
  
  return { activate, deactivate };
}