import { render, screen, fireEvent, waitFor } from '@/utils/test-utils';
import { AccessibilitySettings } from '../AccessibilitySettings';
import { setupKeyboardDetection } from '@/utils/accessibility/keyboard';
import { announce } from '@/utils/accessibility/announcer';

// Mock dependencies
jest.mock('@/utils/accessibility/keyboard', () => ({
  setupKeyboardDetection: jest.fn(),
}));

jest.mock('@/utils/accessibility/announcer', () => ({
  announce: jest.fn(),
}));

// Mock hooks
jest.mock('@/hooks/accessibility/useI18n', () => ({
  useI18n: jest.fn().mockReturnValue({
    language: 'en',
    setLanguage: jest.fn(),
    t: jest.fn((key) => key),
  }),
}));

jest.mock('../RTLProvider', () => ({
  useRTL: jest.fn().mockReturnValue({
    direction: 'ltr',
    toggleDirection: jest.fn(),
  }),
}));

describe('AccessibilitySettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock window.localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
    
    // Mock document methods
    document.documentElement.style.fontSize = '';
    document.documentElement.setAttribute = jest.fn();
    document.documentElement.removeAttribute = jest.fn();
  });

  it('renders the accessibility button correctly', () => {
    render(<AccessibilitySettings />);
    
    // Button should be rendered
    const button = screen.getByRole('button', { name: /accessibility/i });
    expect(button).toBeInTheDocument();
  });
  
  it('opens settings panel when button is clicked', async () => {
    render(<AccessibilitySettings />);
    
    // Click the button
    const button = screen.getByRole('button', { name: /accessibility/i });
    fireEvent.click(button);
    
    // Settings panel should appear
    await waitFor(() => {
      expect(screen.getByText('Accessibility Settings')).toBeInTheDocument();
    });
  });
  
  it('renders different sections in the settings panel', async () => {
    render(<AccessibilitySettings />);
    
    // Open settings panel
    const button = screen.getByRole('button', { name: /accessibility/i });
    fireEvent.click(button);
    
    // Check for sections
    await waitFor(() => {
      expect(screen.getByText('Language & Direction')).toBeInTheDocument();
      expect(screen.getByText('Motion & Animation')).toBeInTheDocument();
      expect(screen.getByText('Text & Display')).toBeInTheDocument();
      expect(screen.getByText('Keyboard Navigation')).toBeInTheDocument();
    });
  });
  
  it('changes font size when a font size button is clicked', async () => {
    render(<AccessibilitySettings />);
    
    // Open settings panel
    const button = screen.getByRole('button', { name: /accessibility/i });
    fireEvent.click(button);
    
    // Click on a font size button
    await waitFor(() => {
      const fontSizeButton = screen.getByText('150%');
      fireEvent.click(fontSizeButton);
    });
    
    // Font size should be updated
    expect(document.documentElement.style.fontSize).toBe('150%');
    
    // Should announce the change
    expect(announce).toHaveBeenCalledWith('Font size set to 150 percent', 'polite');
  });
  
  it('toggles high contrast mode when the switch is toggled', async () => {
    render(<AccessibilitySettings />);
    
    // Open settings panel
    const button = screen.getByRole('button', { name: /accessibility/i });
    fireEvent.click(button);
    
    // Toggle high contrast mode
    await waitFor(() => {
      const switch_elem = screen.getByRole('switch', { name: /high contrast mode/i });
      fireEvent.click(switch_elem);
    });
    
    // High contrast attribute should be set
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-high-contrast', 'true');
    
    // Should announce the change
    expect(announce).toHaveBeenCalledWith('High contrast mode enabled', 'polite');
  });
  
  it('sets up keyboard detection on mount', () => {
    render(<AccessibilitySettings />);
    
    // setupKeyboardDetection should have been called
    expect(setupKeyboardDetection).toHaveBeenCalled();
  });
  
  it('does not set up keyboard detection when disableKeyboardDetection is true', () => {
    render(<AccessibilitySettings disableKeyboardDetection={true} />);
    
    // setupKeyboardDetection should not have been called
    expect(setupKeyboardDetection).not.toHaveBeenCalled();
  });
  
  it('renders with different button variants', () => {
    // Test icon variant
    const { rerender } = render(<AccessibilitySettings buttonVariant="icon" />);
    
    // Should have icon but no text
    const iconButton = screen.getByRole('button', { name: /accessibility/i });
    expect(iconButton).toBeInTheDocument();
    expect(iconButton.textContent).not.toContain('Accessibility');
    
    // Test text variant
    rerender(<AccessibilitySettings buttonVariant="text" />);
    
    // Should have text but no icon
    const textButton = screen.getByRole('button', { name: /accessibility/i });
    expect(textButton).toBeInTheDocument();
    expect(textButton.textContent).toBe('Accessibility');
    
    // Test both variant
    rerender(<AccessibilitySettings buttonVariant="both" />);
    
    // Should have both icon and text
    const bothButton = screen.getByRole('button', { name: /accessibility/i });
    expect(bothButton).toBeInTheDocument();
    expect(bothButton.textContent).toBe('Accessibility');
  });
  
  it('sets up Alt+Shift+A keyboard shortcut to open panel', () => {
    // Mock Event constructor and addEventListener
    const addEventListener = jest.spyOn(window, 'addEventListener');
    
    render(<AccessibilitySettings />);
    
    // addEventListener should have been called with 'keydown'
    expect(addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    
    // Simulate pressing Alt+Shift+A
    const handler = addEventListener.mock.calls.find(
      call => call[0] === 'keydown'
    )?.[1] as Function;
    
    if (handler) {
      handler({ key: 'a', altKey: true, shiftKey: true, preventDefault: jest.fn() });
      
      // Panel should be opened
      expect(screen.getByText('Accessibility Settings')).toBeInTheDocument();
      
      // Should announce the panel opening
      expect(announce).toHaveBeenCalledWith('Accessibility settings panel opened', 'assertive');
    }
  });
});