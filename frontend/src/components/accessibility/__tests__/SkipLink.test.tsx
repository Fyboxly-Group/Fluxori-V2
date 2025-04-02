import { render, screen, fireEvent } from '@/utils/test-utils';
import { SkipLink } from '../SkipLink';

// Mock document functions
const focusMock = jest.fn();
const removeAttributeMock = jest.fn();

describe('SkipLink', () => {
  beforeEach(() => {
    // Set up mocks
    focusMock.mockClear();
    removeAttributeMock.mockClear();
    
    // Create target element in the DOM
    const targetElement = document.createElement('div');
    targetElement.id = 'test-target';
    targetElement.focus = focusMock;
    targetElement.removeAttribute = removeAttributeMock;
    document.body.appendChild(targetElement);
    
    // Mock setTimeout
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    // Clean up
    document.body.innerHTML = '';
    jest.useRealTimers();
  });
  
  it('renders correctly', () => {
    render(<SkipLink targetId="test-target" />);
    
    // Skip link should be in the document
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#test-target');
  });
  
  it('accepts custom label', () => {
    render(<SkipLink targetId="test-target" label="Skip to content" />);
    
    // Skip link should have custom label
    expect(screen.getByText('Skip to content')).toBeInTheDocument();
  });
  
  it('focuses on target element when clicked', () => {
    render(<SkipLink targetId="test-target" />);
    
    // Click the skip link
    const skipLink = screen.getByText('Skip to main content');
    fireEvent.click(skipLink);
    
    // Check if target was focused
    expect(focusMock).toHaveBeenCalledTimes(1);
    
    // Check if timeout was set to remove tabIndex
    jest.runAllTimers();
    expect(removeAttributeMock).toHaveBeenCalledTimes(1);
    expect(removeAttributeMock).toHaveBeenCalledWith('tabindex');
  });
  
  it('focuses on target element when pressing Enter', () => {
    render(<SkipLink targetId="test-target" />);
    
    // Press Enter on the skip link
    const skipLink = screen.getByText('Skip to main content');
    fireEvent.keyDown(skipLink, { key: 'Enter', code: 'Enter' });
    
    // Check if target was focused
    expect(focusMock).toHaveBeenCalledTimes(1);
    
    // Check if timeout was set to remove tabIndex
    jest.runAllTimers();
    expect(removeAttributeMock).toHaveBeenCalledTimes(1);
    expect(removeAttributeMock).toHaveBeenCalledWith('tabindex');
  });
  
  it('focuses on target element when pressing Space', () => {
    render(<SkipLink targetId="test-target" />);
    
    // Press Space on the skip link
    const skipLink = screen.getByText('Skip to main content');
    fireEvent.keyDown(skipLink, { key: ' ', code: 'Space' });
    
    // Check if target was focused
    expect(focusMock).toHaveBeenCalledTimes(1);
    
    // Check if timeout was set to remove tabIndex
    jest.runAllTimers();
    expect(removeAttributeMock).toHaveBeenCalledTimes(1);
    expect(removeAttributeMock).toHaveBeenCalledWith('tabindex');
  });
});