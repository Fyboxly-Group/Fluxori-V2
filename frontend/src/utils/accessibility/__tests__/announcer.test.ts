/**
 * Tests for screen reader announcer utility
 */

import { announce, cleanupAnnouncer } from '../announcer';

describe('Screen Reader Announcer', () => {
  // Mock document methods
  const appendChildMock = jest.fn();
  const removeChildMock = jest.fn();
  const containsMock = jest.fn().mockReturnValue(true);
  let mockLiveRegion: any;
  
  beforeEach(() => {
    // Reset mocks
    appendChildMock.mockClear();
    removeChildMock.mockClear();
    containsMock.mockClear();
    
    // Create mock DOM elements
    mockLiveRegion = {
      setAttribute: jest.fn(),
      textContent: '',
      style: {},
    };
    
    // Mock document methods
    document.body.appendChild = appendChildMock;
    document.body.removeChild = removeChildMock;
    document.body.contains = containsMock;
    
    // Mock createElement to return our mock region
    document.createElement = jest.fn().mockReturnValue(mockLiveRegion);
    
    // Mock setTimeout
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    // Clean up
    jest.useRealTimers();
    jest.restoreAllMocks();
  });
  
  describe('announce', () => {
    it('creates a live region with the appropriate attributes', () => {
      announce('Test message', 'polite');
      
      // Should create a live region and append it to the body
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(appendChildMock).toHaveBeenCalledWith(mockLiveRegion);
      
      // Should set the correct ARIA attributes
      expect(mockLiveRegion.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
      expect(mockLiveRegion.setAttribute).toHaveBeenCalledWith('aria-relevant', 'additions');
      expect(mockLiveRegion.setAttribute).toHaveBeenCalledWith('aria-atomic', 'true');
      expect(mockLiveRegion.setAttribute).toHaveBeenCalledWith('role', 'status');
    });
    
    it('uses polite announcements by default', () => {
      announce('Test message');
      
      // Should set aria-live to polite
      expect(mockLiveRegion.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
    });
    
    it('supports assertive announcements', () => {
      announce('Test message', 'assertive');
      
      // Should set aria-live to assertive
      expect(mockLiveRegion.setAttribute).toHaveBeenCalledWith('aria-live', 'assertive');
    });
    
    it('does nothing when politeness is off', () => {
      announce('Test message', 'off');
      
      // Should not create or append anything
      expect(document.createElement).not.toHaveBeenCalled();
      expect(appendChildMock).not.toHaveBeenCalled();
    });
    
    it('sets the message text with a delay to ensure it is announced', () => {
      announce('Test message');
      
      // Initially clears the text content
      expect(mockLiveRegion.textContent).toBe('');
      
      // After the timeout, sets the message
      jest.runAllTimers();
      expect(mockLiveRegion.textContent).toBe('Test message');
    });
    
    it('reuses existing live regions of the same politeness', () => {
      // Make first announcement
      announce('First message', 'polite');
      
      // Clear mocks for second call
      appendChildMock.mockClear();
      document.createElement.mockClear();
      
      // Make second announcement of same politeness
      announce('Second message', 'polite');
      
      // Should not create a new region or append to body again
      expect(document.createElement).not.toHaveBeenCalled();
      expect(appendChildMock).not.toHaveBeenCalled();
      
      // Run timers for the message to be set
      jest.runAllTimers();
      expect(mockLiveRegion.textContent).toBe('Second message');
    });
    
    it('creates separate regions for different politeness levels', () => {
      // Create polite region
      announce('Polite message', 'polite');
      
      // Mock a different live region for assertive
      const assertiveLiveRegion = {
        setAttribute: jest.fn(),
        textContent: '',
        style: {},
      };
      document.createElement = jest.fn().mockReturnValue(assertiveLiveRegion);
      
      // Create assertive region
      announce('Assertive message', 'assertive');
      
      // Should create a new element for assertive
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(appendChildMock).toHaveBeenCalledWith(assertiveLiveRegion);
      
      // Run timers for the messages to be set
      jest.runAllTimers();
      expect(mockLiveRegion.textContent).toBe('Polite message');
      expect(assertiveLiveRegion.textContent).toBe('Assertive message');
    });
  });
  
  describe('cleanupAnnouncer', () => {
    it('removes all live regions from the document', () => {
      // Create two different live regions
      announce('Polite message', 'polite');
      
      // Mock a different live region for assertive
      const assertiveLiveRegion = {
        setAttribute: jest.fn(),
        textContent: '',
        style: {},
      };
      document.createElement = jest.fn().mockReturnValue(assertiveLiveRegion);
      announce('Assertive message', 'assertive');
      
      // Clean up
      cleanupAnnouncer();
      
      // Should remove both regions
      expect(removeChildMock).toHaveBeenCalledTimes(2);
      expect(removeChildMock).toHaveBeenCalledWith(mockLiveRegion);
      expect(removeChildMock).toHaveBeenCalledWith(assertiveLiveRegion);
    });
    
    it('does nothing when no live regions exist', () => {
      // Clean up without creating any regions
      cleanupAnnouncer();
      
      // Should not try to remove anything
      expect(removeChildMock).not.toHaveBeenCalled();
    });
    
    it('only removes regions that are still in the document', () => {
      // Create a live region
      announce('Test message');
      
      // Mock that the region is no longer in the document
      containsMock.mockReturnValue(false);
      
      // Clean up
      cleanupAnnouncer();
      
      // Should not try to remove the region
      expect(removeChildMock).not.toHaveBeenCalled();
    });
  });
});