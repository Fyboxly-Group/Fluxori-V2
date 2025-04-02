/**
 * Motion preferences utilities for respecting user's prefers-reduced-motion settings
 * and providing options to customize animation preferences.
 */

export type MotionPreference = 'full' | 'reduced' | 'none';

// Store the user's preference (defaulting to system preference)
let currentPreference: MotionPreference = 'full';
let systemPreference: MotionPreference = 'full';

// Cached media query to avoid recreating it
let mediaQuery: MediaQueryList | null = null;

/**
 * Initialize the motion preference system
 */
export function initializeMotionPreferences(): MotionPreference {
  if (typeof window === 'undefined') {
    return 'full';
  }
  
  // Check for stored user preference
  const storedPreference = localStorage.getItem('motion-preference');
  if (storedPreference && ['full', 'reduced', 'none'].includes(storedPreference)) {
    currentPreference = storedPreference as MotionPreference;
  }
  
  // Check system preference
  mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  systemPreference = mediaQuery.matches ? 'reduced' : 'full';
  
  // If no stored preference, use the system preference
  if (!storedPreference) {
    currentPreference = systemPreference;
  }
  
  // Listen for changes to the system preference
  mediaQuery.addEventListener('change', handleMotionPreferenceChange);
  
  // Apply the current preference
  applyMotionPreference(currentPreference);
  
  return currentPreference;
}

/**
 * Handle changes to the system's prefers-reduced-motion setting
 */
function handleMotionPreferenceChange(event: MediaQueryListEvent) {
  systemPreference = event.matches ? 'reduced' : 'full';
  
  // Only update if we're following the system preference (no user override)
  if (!localStorage.getItem('motion-preference')) {
    currentPreference = systemPreference;
    applyMotionPreference(currentPreference);
  }
}

/**
 * Set the user's motion preference
 * 
 * @param preference - The motion preference to set
 * @param persist - Whether to save the preference to localStorage
 */
export function setMotionPreference(preference: MotionPreference, persist: boolean = true): void {
  if (currentPreference === preference) return;
  
  currentPreference = preference;
  
  if (persist && typeof window !== 'undefined') {
    localStorage.setItem('motion-preference', preference);
  }
  
  applyMotionPreference(preference);
}

/**
 * Reset to the system's motion preference
 */
export function resetMotionPreference(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('motion-preference');
  currentPreference = systemPreference;
  applyMotionPreference(currentPreference);
}

/**
 * Get the current motion preference
 */
export function getMotionPreference(): MotionPreference {
  return currentPreference;
}

/**
 * Check if animations should be shown based on the current preference
 * 
 * @param type - The type of animation to check for
 * @returns Whether the animation should be shown
 */
export function shouldAnimate(type: 'essential' | 'decorative' | 'any' = 'any'): boolean {
  switch (currentPreference) {
    case 'none':
      return false;
    case 'reduced':
      return type === 'essential';
    case 'full':
    default:
      return true;
  }
}

/**
 * Apply the motion preference to the document
 * 
 * @param preference - The motion preference to apply
 */
function applyMotionPreference(preference: MotionPreference): void {
  if (typeof document === 'undefined') return;
  
  // Add a data attribute to the document for CSS targeting
  document.documentElement.setAttribute('data-motion', preference);
  
  // Dispatch an event for components to listen to
  const event = new CustomEvent('motionpreference', { detail: { preference } });
  document.dispatchEvent(event);
}

/**
 * Clean up motion preference listeners
 */
export function cleanupMotionPreferences(): void {
  if (mediaQuery && typeof window !== 'undefined') {
    mediaQuery.removeEventListener('change', handleMotionPreferenceChange);
  }
}