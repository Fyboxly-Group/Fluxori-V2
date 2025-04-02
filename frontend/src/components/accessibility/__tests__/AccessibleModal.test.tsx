import { render, screen, fireEvent, waitFor } from '@/utils/test-utils';
import { AccessibleModal } from '../AccessibleModal';
import { announce } from '@/utils/accessibility/announcer';
import { useFocusTrap } from '@/hooks/accessibility/useFocusTrap';
import { useAnimation } from '@/hooks/useAnimation';
import { useAnimationA11y } from '@/hooks/accessibility/useAnimationA11y';

// Mock the dependencies
jest.mock('@/utils/accessibility/announcer', () => ({
  announce: jest.fn(),
}));

jest.mock('@/hooks/accessibility/useFocusTrap', () => ({
  useFocusTrap: jest.fn().mockReturnValue({
    trapFocus: jest.fn(),
    releaseFocus: jest.fn(),
  }),
}));

jest.mock('@/hooks/useAnimation', () => ({
  useAnimation: jest.fn().mockReturnValue({
    animationRef: { current: null },
    animate: jest.fn(),
  }),
}));

jest.mock('@/hooks/accessibility/useAnimationA11y', () => ({
  useAnimationA11y: jest.fn().mockReturnValue({
    setAriaAttributes: jest.fn(),
  }),
}));

// Mock useRTL hook
jest.mock('../RTLProvider', () => ({
  useRTL: jest.fn().mockReturnValue({
    direction: 'ltr',
  }),
}));

describe('AccessibleModal', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders correctly when open', () => {
    render(
      <AccessibleModal isOpen={true} onClose={jest.fn()} title="Test Modal">
        <div>Modal content</div>
      </AccessibleModal>
    );
    
    // Modal title should be rendered
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    
    // Modal content should be rendered
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });
  
  it('does not render when closed', () => {
    render(
      <AccessibleModal isOpen={false} onClose={jest.fn()} title="Test Modal">
        <div>Modal content</div>
      </AccessibleModal>
    );
    
    // Modal content should not be rendered
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });
  
  it('calls trap focus when opened', () => {
    // Mock implementation of useFocusTrap
    const trapFocusMock = jest.fn();
    (useFocusTrap as jest.Mock).mockReturnValue({
      trapFocus: trapFocusMock,
      releaseFocus: jest.fn(),
    });
    
    render(
      <AccessibleModal isOpen={true} onClose={jest.fn()} title="Test Modal">
        <div>Modal content</div>
      </AccessibleModal>
    );
    
    // trapFocus should have been called
    expect(trapFocusMock).toHaveBeenCalled();
  });
  
  it('announces to screen readers when opened', () => {
    render(
      <AccessibleModal isOpen={true} onClose={jest.fn()} title="Test Modal">
        <div>Modal content</div>
      </AccessibleModal>
    );
    
    // announce should have been called with the modal title
    expect(announce).toHaveBeenCalledWith(
      expect.stringContaining('Test Modal'),
      'assertive'
    );
  });
  
  it('calls onClose when close button is clicked', async () => {
    const onCloseMock = jest.fn();
    
    render(
      <AccessibleModal isOpen={true} onClose={onCloseMock} title="Test Modal">
        <div>Modal content</div>
      </AccessibleModal>
    );
    
    // Find and click close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    // onClose should have been called
    expect(onCloseMock).toHaveBeenCalled();
  });
  
  it('uses custom announcement text when provided', () => {
    render(
      <AccessibleModal 
        isOpen={true} 
        onClose={jest.fn()} 
        title="Test Modal"
        customOpenAnnouncement="Custom announcement"
      >
        <div>Modal content</div>
      </AccessibleModal>
    );
    
    // announce should have been called with the custom text
    expect(announce).toHaveBeenCalledWith(
      'Custom announcement',
      'assertive'
    );
  });
  
  it('does not announce when announceOnOpen is false', () => {
    render(
      <AccessibleModal 
        isOpen={true} 
        onClose={jest.fn()} 
        title="Test Modal"
        announceOnOpen={false}
      >
        <div>Modal content</div>
      </AccessibleModal>
    );
    
    // announce should not have been called
    expect(announce).not.toHaveBeenCalled();
  });
  
  it('calls useAnimation.animate when opened', () => {
    const animateMock = jest.fn();
    (useAnimation as jest.Mock).mockReturnValue({
      animationRef: { current: null },
      animate: animateMock,
    });
    
    render(
      <AccessibleModal isOpen={true} onClose={jest.fn()} title="Test Modal">
        <div>Modal content</div>
      </AccessibleModal>
    );
    
    // animate should have been called
    expect(animateMock).toHaveBeenCalled();
  });
  
  it('uses ariaLabel or title for accessibility', () => {
    render(
      <AccessibleModal 
        isOpen={true} 
        onClose={jest.fn()} 
        title="Test Modal"
        ariaLabel="Accessible Modal Label"
      >
        <div>Modal content</div>
      </AccessibleModal>
    );
    
    // The modal should have the aria-label attribute
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-label', 'Accessible Modal Label');
  });
});