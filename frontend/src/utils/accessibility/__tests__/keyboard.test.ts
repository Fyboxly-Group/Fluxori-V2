/**
 * Tests for keyboard accessibility utilities
 */

import {
  setupKeyboardDetection,
  focusFirstElement,
  focusLastElement,
  getFocusableElements,
  setupKeyboardShortcuts,
  createFocusTrap,
} from '../keyboard';

describe('Keyboard Utilities', () => {
  // Create a DOM structure for testing
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="container">
        <button id="btn1">Button 1</button>
        <input id="input1" type="text" />
        <a id="link1" href="#">Link 1</a>
        <button id="btn2" disabled>Button 2</button>
        <div tabindex="0" id="div1">Div with tabindex</div>
        <div id="div2">Div without tabindex</div>
      </div>
    `;
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });
  
  describe('setupKeyboardDetection', () => {
    it('adds user-is-tabbing class when Tab key is pressed', () => {
      // Setup the event listener
      setupKeyboardDetection();
      
      // Simulate a Tab keydown event
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
      document.dispatchEvent(tabEvent);
      
      // Body should have the class
      expect(document.body.classList.contains('user-is-tabbing')).toBe(true);
    });
    
    it('removes user-is-tabbing class when mouse is used', () => {
      // Setup the event listener
      setupKeyboardDetection();
      
      // First add the class with Tab
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
      document.dispatchEvent(tabEvent);
      
      // Then simulate a mousedown event
      const mouseEvent = new MouseEvent('mousedown', { bubbles: true });
      document.dispatchEvent(mouseEvent);
      
      // Class should be removed
      expect(document.body.classList.contains('user-is-tabbing')).toBe(false);
    });
    
    it('does nothing when a key other than Tab is pressed', () => {
      // Setup the event listener
      setupKeyboardDetection();
      
      // Simulate a non-Tab keydown event
      const keyEvent = new KeyboardEvent('keydown', { key: 'A', bubbles: true });
      document.dispatchEvent(keyEvent);
      
      // Class should not be added
      expect(document.body.classList.contains('user-is-tabbing')).toBe(false);
    });
  });
  
  describe('getFocusableElements', () => {
    it('returns all focusable elements in the container', () => {
      const container = document.getElementById('container')!;
      const focusableElements = getFocusableElements(container);
      
      // Should include buttons, inputs, links, and elements with tabindex
      expect(focusableElements.length).toBe(4); // Excluding disabled button
      expect(focusableElements[0].id).toBe('btn1');
      expect(focusableElements[1].id).toBe('input1');
      expect(focusableElements[2].id).toBe('link1');
      expect(focusableElements[3].id).toBe('div1');
    });
    
    it('excludes disabled elements', () => {
      const container = document.getElementById('container')!;
      const focusableElements = getFocusableElements(container);
      
      // Should exclude disabled button
      const disabledIds = focusableElements.map(el => el.id);
      expect(disabledIds).not.toContain('btn2');
    });
    
    it('honors custom selector', () => {
      const container = document.getElementById('container')!;
      const focusableElements = getFocusableElements(container, 'button');
      
      // Should only include buttons (excluding disabled ones)
      expect(focusableElements.length).toBe(1);
      expect(focusableElements[0].id).toBe('btn1');
    });
  });
  
  describe('focusFirstElement and focusLastElement', () => {
    it('focuses the first focusable element', () => {
      const container = document.getElementById('container')!;
      const firstButton = document.getElementById('btn1')!;
      
      // Mock the focus method
      firstButton.focus = jest.fn();
      
      // Call the function
      focusFirstElement(container);
      
      // First button should be focused
      expect(firstButton.focus).toHaveBeenCalled();
    });
    
    it('focuses the last focusable element', () => {
      const container = document.getElementById('container')!;
      const divWithTabindex = document.getElementById('div1')!;
      
      // Mock the focus method
      divWithTabindex.focus = jest.fn();
      
      // Call the function
      focusLastElement(container);
      
      // Div with tabindex should be focused (last focusable element)
      expect(divWithTabindex.focus).toHaveBeenCalled();
    });
    
    it('returns null when no focusable elements exist', () => {
      const emptyContainer = document.createElement('div');
      document.body.appendChild(emptyContainer);
      
      // Call the functions
      const firstResult = focusFirstElement(emptyContainer);
      const lastResult = focusLastElement(emptyContainer);
      
      // Both should return null
      expect(firstResult).toBeNull();
      expect(lastResult).toBeNull();
    });
  });
  
  describe('setupKeyboardShortcuts', () => {
    it('registers keyboard shortcuts with the specified keys', () => {
      const shortcut1Handler = jest.fn();
      const shortcut2Handler = jest.fn();
      
      // Setup shortcuts
      const cleanup = setupKeyboardShortcuts([
        { key: 'a', ctrlKey: true, handler: shortcut1Handler },
        { key: 'b', shiftKey: true, handler: shortcut2Handler },
      ]);
      
      // Simulate a Ctrl+A keydown event
      const ctrlAEvent = new KeyboardEvent('keydown', {
        key: 'a',
        ctrlKey: true,
        bubbles: true,
      });
      document.dispatchEvent(ctrlAEvent);
      
      // Simulate a Shift+B keydown event
      const shiftBEvent = new KeyboardEvent('keydown', {
        key: 'b',
        shiftKey: true,
        bubbles: true,
      });
      document.dispatchEvent(shiftBEvent);
      
      // Both handlers should have been called
      expect(shortcut1Handler).toHaveBeenCalledTimes(1);
      expect(shortcut2Handler).toHaveBeenCalledTimes(1);
      
      // Cleanup should be a function
      expect(typeof cleanup).toBe('function');
      
      // Call cleanup
      cleanup();
      
      // Reset mocks
      shortcut1Handler.mockClear();
      shortcut2Handler.mockClear();
      
      // Simulate events again after cleanup
      document.dispatchEvent(ctrlAEvent);
      document.dispatchEvent(shiftBEvent);
      
      // Handlers should not be called after cleanup
      expect(shortcut1Handler).not.toHaveBeenCalled();
      expect(shortcut2Handler).not.toHaveBeenCalled();
    });
    
    it('prevents default behavior when preventDefault is not false', () => {
      const shortcutHandler = jest.fn();
      const preventDefault = jest.fn();
      
      // Setup shortcut
      setupKeyboardShortcuts([
        { key: 'a', handler: shortcutHandler },
      ]);
      
      // Simulate a keydown event with preventDefault method
      const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
      Object.defineProperty(event, 'preventDefault', {
        value: preventDefault,
      });
      document.dispatchEvent(event);
      
      // preventDefault should have been called
      expect(preventDefault).toHaveBeenCalled();
    });
    
    it('does not prevent default behavior when preventDefault is false', () => {
      const shortcutHandler = jest.fn();
      const preventDefault = jest.fn();
      
      // Setup shortcut with preventDefault: false
      setupKeyboardShortcuts([
        { key: 'a', handler: shortcutHandler, preventDefault: false },
      ]);
      
      // Simulate a keydown event with preventDefault method
      const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
      Object.defineProperty(event, 'preventDefault', {
        value: preventDefault,
      });
      document.dispatchEvent(event);
      
      // preventDefault should not have been called
      expect(preventDefault).not.toHaveBeenCalled();
    });
  });
  
  describe('createFocusTrap', () => {
    it('creates a focus trap with activate and deactivate methods', () => {
      const container = document.getElementById('container')!;
      const focusTrap = createFocusTrap(container);
      
      // Should return an object with activate and deactivate methods
      expect(typeof focusTrap.activate).toBe('function');
      expect(typeof focusTrap.deactivate).toBe('function');
    });
    
    it('focuses the first element when activated with autoFocus=true', () => {
      const container = document.getElementById('container')!;
      const firstButton = document.getElementById('btn1')!;
      
      // Mock the focus method
      firstButton.focus = jest.fn();
      
      // Create and activate the focus trap
      const focusTrap = createFocusTrap(container, true);
      focusTrap.activate();
      
      // First button should be focused
      expect(firstButton.focus).toHaveBeenCalled();
    });
    
    it('does not auto-focus when autoFocus=false', () => {
      const container = document.getElementById('container')!;
      const firstButton = document.getElementById('btn1')!;
      
      // Mock the focus method
      firstButton.focus = jest.fn();
      
      // Create and activate the focus trap with autoFocus=false
      const focusTrap = createFocusTrap(container, false);
      focusTrap.activate();
      
      // First button should not be focused
      expect(firstButton.focus).not.toHaveBeenCalled();
    });
    
    it('restores focus to the previously focused element when deactivated', () => {
      // Focus an element before creating the trap
      const link = document.getElementById('link1')!;
      link.focus = jest.fn();
      document.activeElement = link;
      
      const container = document.getElementById('container')!;
      
      // Create and activate the focus trap
      const focusTrap = createFocusTrap(container);
      focusTrap.activate();
      
      // Clear mock to check if it's called on deactivate
      (link.focus as jest.Mock).mockClear();
      
      // Deactivate the trap
      focusTrap.deactivate();
      
      // The previously focused element should receive focus again
      expect(link.focus).toHaveBeenCalled();
    });
  });
});