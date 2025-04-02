import { useCallback, useEffect, useRef } from 'react';

interface AnnounceOptions {
  politeness?: 'assertive' | 'polite';
  timeout?: number;
}

/**
 * Hook to announce messages to screen readers
 * 
 * @returns Function to announce messages
 */
export function useAnnounce() {
  const ariaLiveRef = useRef<HTMLDivElement | null>(null);
  
  // Create or get the aria-live regions on mount
  useEffect(() => {
    // Check if the regions already exist
    let assertiveRegion = document.getElementById('aria-live-assertive');
    let politeRegion = document.getElementById('aria-live-polite');
    
    // Create regions if they don't exist
    if (!assertiveRegion) {
      assertiveRegion = document.createElement('div');
      assertiveRegion.id = 'aria-live-assertive';
      assertiveRegion.setAttribute('aria-live', 'assertive');
      assertiveRegion.setAttribute('aria-atomic', 'true');
      assertiveRegion.setAttribute('role', 'status');
      assertiveRegion.className = 'sr-only';
      document.body.appendChild(assertiveRegion);
    }
    
    if (!politeRegion) {
      politeRegion = document.createElement('div');
      politeRegion.id = 'aria-live-polite';
      politeRegion.setAttribute('aria-live', 'polite');
      politeRegion.setAttribute('aria-atomic', 'true');
      politeRegion.setAttribute('role', 'status');
      politeRegion.className = 'sr-only';
      document.body.appendChild(politeRegion);
    }
    
    // Add CSS for screen reader only elements if not already present
    if (!document.getElementById('sr-only-style')) {
      const style = document.createElement('style');
      style.id = 'sr-only-style';
      style.textContent = `
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `;
      document.head.appendChild(style);
    }
    
    // Clean up function - we don't remove the regions as they might be used by other components
    return () => {};
  }, []);
  
  /**
   * Announce a message to screen readers
   * 
   * @param message - Message to announce
   * @param options - Options for the announcement
   */
  const announce = useCallback((message: string, options: AnnounceOptions = {}) => {
    const { politeness = 'polite', timeout = 150 } = options;
    
    const region = document.getElementById(
      politeness === 'assertive' ? 'aria-live-assertive' : 'aria-live-polite'
    );
    
    if (!region) return;
    
    // Clear the region first
    region.textContent = '';
    
    // Small delay to ensure the screen reader picks up the new content
    setTimeout(() => {
      region.textContent = message;
      
      // Clear the announcement after a timeout to prevent multiple readings
      if (timeout > 0) {
        setTimeout(() => {
          region.textContent = '';
        }, 3000); // Clear after 3 seconds
      }
    }, timeout);
  }, []);
  
  return { announce };
}