/**
 * Screen reader announcement utility
 * 
 * This utility creates and manages ARIA live regions for making
 * announcements to screen readers. It handles creating the DOM
 * elements when needed and ensures proper cleanup.
 */

type AriaLive = 'polite' | 'assertive' | 'off';

let liveRegions: { [key in Exclude<AriaLive, 'off'>]?: HTMLElement } = {};

/**
 * Creates a live region element for screen reader announcements
 */
function createLiveRegion(politeness: Exclude<AriaLive, 'off'> = 'polite'): HTMLElement {
  const existingRegion = liveRegions[politeness];
  if (existingRegion && document.body.contains(existingRegion)) {
    return existingRegion;
  }

  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', politeness);
  liveRegion.setAttribute('aria-relevant', 'additions');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.setAttribute('role', 'status');
  // Hide visually but keep available to screen readers
  Object.assign(liveRegion.style, {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0',
  });

  document.body.appendChild(liveRegion);
  liveRegions[politeness] = liveRegion;
  return liveRegion;
}

/**
 * Announces a message to screen readers
 * 
 * @param message - The message to announce
 * @param politeness - The politeness level (polite, assertive, or off)
 */
export function announce(message: string, politeness: AriaLive = 'polite'): void {
  if (politeness === 'off' || typeof window === 'undefined') {
    return;
  }

  const liveRegion = createLiveRegion(politeness);

  // Clear previous announcements
  liveRegion.textContent = '';

  // Use setTimeout to ensure the clear has time to be announced
  setTimeout(() => {
    liveRegion.textContent = message;
  }, 50);
}

/**
 * Cleans up the live regions when no longer needed
 */
export function cleanupAnnouncer(): void {
  Object.values(liveRegions).forEach(region => {
    if (region && document.body.contains(region)) {
      document.body.removeChild(region);
    }
  });
  liveRegions = {};
}

// Reset live regions on page changes (for SPA navigation)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupAnnouncer);
}