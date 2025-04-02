import { render, screen, fireEvent } from '@/utils/test-utils';
import { MotionPreferenceSelector } from '../MotionPreferenceSelector';
import * as motionPreferences from '@/utils/accessibility/motionPreferences';

// Mock the motion preferences module
jest.mock('@/utils/accessibility/motionPreferences', () => ({
  getMotionPreference: jest.fn().mockReturnValue('full'),
  setMotionPreference: jest.fn(),
  resetMotionPreference: jest.fn(),
  initializeMotionPreferences: jest.fn(),
}));

// Mock the useI18n hook
jest.mock('@/hooks/accessibility/useI18n', () => ({
  useI18n: jest.fn().mockReturnValue({
    t: jest.fn((key) => key),
  }),
}));

// Mock the announce function
jest.mock('@/utils/accessibility/announcer', () => ({
  announce: jest.fn(),
}));

describe('MotionPreferenceSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the default mock return value
    (motionPreferences.getMotionPreference as jest.Mock).mockReturnValue('full');
  });

  it('renders correctly with the current motion preference', () => {
    render(<MotionPreferenceSelector />);
    
    // SegmentedControl should be rendered
    const segmentedControl = screen.getByRole('group');
    expect(segmentedControl).toBeInTheDocument();
    
    // Full motion should be selected by default
    const fullOption = screen.getByText('Full');
    expect(fullOption.closest('button')).toHaveAttribute('data-active', 'true');
  });
  
  it('calls setMotionPreference when a different option is selected', () => {
    render(<MotionPreferenceSelector />);
    
    // Click the 'Reduced' option
    const reducedOption = screen.getByText('Reduced');
    fireEvent.click(reducedOption);
    
    // Check if setMotionPreference was called
    expect(motionPreferences.setMotionPreference).toHaveBeenCalledWith('reduced');
  });
  
  it('calls resetMotionPreference when the reset button is clicked', () => {
    render(<MotionPreferenceSelector />);
    
    // Click the reset button
    const resetButton = screen.getByText(/Reset to system default/i);
    fireEvent.click(resetButton);
    
    // Check if resetMotionPreference was called
    expect(motionPreferences.resetMotionPreference).toHaveBeenCalled();
  });
  
  it('does not show reset button when showReset is false', () => {
    render(<MotionPreferenceSelector showReset={false} />);
    
    // Reset button should not be in the document
    const resetButton = screen.queryByText(/Reset to system default/i);
    expect(resetButton).not.toBeInTheDocument();
  });
  
  it('renders in compact mode', () => {
    render(<MotionPreferenceSelector compact={true} />);
    
    // Should show icons without text
    const fullButton = screen.getByRole('group').children[0] as HTMLElement;
    const reducedButton = screen.getByRole('group').children[1] as HTMLElement;
    const noneButton = screen.getByRole('group').children[2] as HTMLElement;
    
    // Icons should be rendered
    expect(fullButton.querySelector('svg')).toBeInTheDocument();
    expect(reducedButton.querySelector('svg')).toBeInTheDocument();
    expect(noneButton.querySelector('svg')).toBeInTheDocument();
    
    // Text should not be visible
    expect(screen.queryByText('Full')).not.toBeInTheDocument();
    expect(screen.queryByText('Reduced')).not.toBeInTheDocument();
    expect(screen.queryByText('None')).not.toBeInTheDocument();
  });
  
  it('responds to preferences from the motion preferences system', () => {
    // Set initial preference to 'reduced'
    (motionPreferences.getMotionPreference as jest.Mock).mockReturnValue('reduced');
    
    render(<MotionPreferenceSelector />);
    
    // Reduced motion should be selected
    const reducedOption = screen.getByText('Reduced');
    expect(reducedOption.closest('button')).toHaveAttribute('data-active', 'true');
  });
});