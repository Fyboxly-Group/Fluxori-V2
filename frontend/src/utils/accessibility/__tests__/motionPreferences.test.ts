/**
 * Tests for motion preferences utility
 */

import {
  initializeMotionPreferences,
  setMotionPreference,
  resetMotionPreference,
  getMotionPreference,
  shouldAnimate,
  cleanupMotionPreferences,
  MotionPreference,
} from '../motionPreferences';

describe('Motion Preferences', () => {
  // Mock localStorage and document methods
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  };
  
  // Mock document methods
  const addAttributeMock = jest.fn();
  const dispatchEventMock = jest.fn();
  const matchMediaMock = jest.fn();
  const addEventListenerMock = jest.fn();
  const removeEventListenerMock = jest.fn();
  
  beforeEach(() => {
    // Reset mocks
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    addAttributeMock.mockClear();
    dispatchEventMock.mockClear();
    matchMediaMock.mockClear();
    addEventListenerMock.mockClear();
    removeEventListenerMock.mockClear();
    
    // Mock window and document
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    
    document.documentElement.setAttribute = addAttributeMock;
    document.dispatchEvent = dispatchEventMock;
    
    // Mock matchMedia
    window.matchMedia = matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    });
  });
  
  afterEach(() => {
    jest.resetAllMocks();
  });
  
  describe('initializeMotionPreferences', () => {
    it('checks localStorage for stored preference', () => {
      // Mock stored preference
      localStorageMock.getItem.mockReturnValue('reduced');
      
      // Initialize
      const preference = initializeMotionPreferences();
      
      // Should check localStorage
      expect(localStorageMock.getItem).toHaveBeenCalledWith('motion-preference');
      
      // Should return the stored preference
      expect(preference).toBe('reduced');
      
      // Should set the data attribute
      expect(addAttributeMock).toHaveBeenCalledWith('data-motion', 'reduced');
    });
    
    it('falls back to system preference when no stored preference exists', () => {
      // Mock no stored preference
      localStorageMock.getItem.mockReturnValue(null);
      
      // Mock system preference to prefer reduced motion
      window.matchMedia = matchMediaMock.mockReturnValue({
        matches: true, // prefers-reduced-motion: reduce
        addEventListener: addEventListenerMock,
        removeEventListener: removeEventListenerMock,
      });
      
      // Initialize
      const preference = initializeMotionPreferences();
      
      // Should check localStorage
      expect(localStorageMock.getItem).toHaveBeenCalledWith('motion-preference');
      
      // Should check system preference
      expect(matchMediaMock).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
      
      // Should return the system preference
      expect(preference).toBe('reduced');
      
      // Should set the data attribute
      expect(addAttributeMock).toHaveBeenCalledWith('data-motion', 'reduced');
    });
    
    it('sets up listeners for system preference changes', () => {
      // Initialize
      initializeMotionPreferences();
      
      // Should add event listener for system preference changes
      expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
    });
    
    it('returns full motion when running server-side', () => {
      // Mock window to be undefined to simulate server-side
      const originalWindow = global.window;
      // @ts-ignore - Intentionally setting window to undefined
      global.window = undefined;
      
      // Initialize
      const preference = initializeMotionPreferences();
      
      // Should return full motion
      expect(preference).toBe('full');
      
      // Restore window
      global.window = originalWindow;
    });
  });
  
  describe('setMotionPreference', () => {
    it('updates the current preference', () => {
      // First initialize with a default
      initializeMotionPreferences();
      
      // Set to reduced
      setMotionPreference('reduced');
      
      // Current preference should be updated
      expect(getMotionPreference()).toBe('reduced');
      
      // Should set the data attribute
      expect(addAttributeMock).toHaveBeenCalledWith('data-motion', 'reduced');
      
      // Should dispatch an event
      expect(dispatchEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'motionpreference',
          detail: { preference: 'reduced' },
        })
      );
    });
    
    it('persists the preference to localStorage by default', () => {
      // Set preference
      setMotionPreference('none');
      
      // Should save to localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith('motion-preference', 'none');
    });
    
    it('does not persist when persist is false', () => {
      // Set preference with persist=false
      setMotionPreference('reduced', false);
      
      // Should not save to localStorage
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
    
    it('does nothing when the preference is the same', () => {
      // First initialize with a default
      initializeMotionPreferences();
      const initialPreference = getMotionPreference();
      
      // Set to the same preference
      setMotionPreference(initialPreference);
      
      // Should not set attributes or dispatch events
      expect(addAttributeMock).not.toHaveBeenCalled();
      expect(dispatchEventMock).not.toHaveBeenCalled();
    });
  });
  
  describe('resetMotionPreference', () => {
    it('removes the stored preference', () => {
      // Reset
      resetMotionPreference();
      
      // Should remove from localStorage
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('motion-preference');
    });
    
    it('reverts to system preference', () => {
      // Mock system preference to prefer reduced motion
      window.matchMedia = matchMediaMock.mockReturnValue({
        matches: true, // prefers-reduced-motion: reduce
        addEventListener: addEventListenerMock,
        removeEventListener: removeEventListenerMock,
      });
      
      // Initialize
      initializeMotionPreferences();
      
      // Override with a different preference
      setMotionPreference('none');
      
      // Reset
      resetMotionPreference();
      
      // Should revert to system preference
      expect(getMotionPreference()).toBe('reduced');
      
      // Should update the data attribute
      expect(addAttributeMock).toHaveBeenCalledWith('data-motion', 'reduced');
    });
  });
  
  describe('shouldAnimate', () => {
    it('returns true for any animation when preference is full', () => {
      // Set preference to full
      setMotionPreference('full');
      
      // All types should animate
      expect(shouldAnimate('any')).toBe(true);
      expect(shouldAnimate('essential')).toBe(true);
      expect(shouldAnimate('decorative')).toBe(true);
    });
    
    it('returns true only for essential animations when preference is reduced', () => {
      // Set preference to reduced
      setMotionPreference('reduced');
      
      // Only essential animations should be allowed
      expect(shouldAnimate('essential')).toBe(true);
      expect(shouldAnimate('decorative')).toBe(false);
      expect(shouldAnimate('any')).toBe(false);
    });
    
    it('returns false for all animations when preference is none', () => {
      // Set preference to none
      setMotionPreference('none');
      
      // No animations should be allowed
      expect(shouldAnimate('any')).toBe(false);
      expect(shouldAnimate('essential')).toBe(false);
      expect(shouldAnimate('decorative')).toBe(false);
    });
    
    it('defaults to any when no type is specified', () => {
      // Set preference to full
      setMotionPreference('full');
      
      // Should return true for full motion
      expect(shouldAnimate()).toBe(true);
      
      // Set preference to none
      setMotionPreference('none');
      
      // Should return false for no motion
      expect(shouldAnimate()).toBe(false);
    });
  });
  
  describe('cleanupMotionPreferences', () => {
    it('removes event listeners', () => {
      // Initialize
      initializeMotionPreferences();
      
      // Clean up
      cleanupMotionPreferences();
      
      // Should remove event listener
      expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });
});