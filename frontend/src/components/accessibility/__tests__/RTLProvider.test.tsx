import { render, screen } from '@testing-library/react';
import { RTLProvider, useRTL } from '../RTLProvider';
import { useI18n } from '@/hooks/accessibility/useI18n';

// Mock the useI18n hook
jest.mock('@/hooks/accessibility/useI18n', () => ({
  useI18n: jest.fn().mockReturnValue({
    language: 'en',
  }),
}));

// Create a test component that uses the RTL context
const TestComponent = () => {
  const { direction, isRTL, toggleDirection, setDirection } = useRTL();
  return (
    <div>
      <div data-testid="direction">{direction}</div>
      <div data-testid="is-rtl">{isRTL ? 'true' : 'false'}</div>
      <button onClick={toggleDirection} data-testid="toggle-btn">Toggle Direction</button>
      <button onClick={() => setDirection('rtl')} data-testid="set-rtl-btn">Set RTL</button>
      <button onClick={() => setDirection('ltr')} data-testid="set-ltr-btn">Set LTR</button>
    </div>
  );
};

describe('RTLProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('provides default LTR direction', () => {
    render(
      <RTLProvider>
        <TestComponent />
      </RTLProvider>
    );
    
    // Default direction should be LTR
    expect(screen.getByTestId('direction')).toHaveTextContent('ltr');
    expect(screen.getByTestId('is-rtl')).toHaveTextContent('false');
  });
  
  it('accepts initialDirection prop', () => {
    render(
      <RTLProvider initialDirection="rtl">
        <TestComponent />
      </RTLProvider>
    );
    
    // Direction should be RTL
    expect(screen.getByTestId('direction')).toHaveTextContent('rtl');
    expect(screen.getByTestId('is-rtl')).toHaveTextContent('true');
  });
  
  it('toggles direction when toggleDirection is called', () => {
    render(
      <RTLProvider>
        <TestComponent />
      </RTLProvider>
    );
    
    // Initial direction is LTR
    expect(screen.getByTestId('direction')).toHaveTextContent('ltr');
    
    // Toggle direction
    screen.getByTestId('toggle-btn').click();
    
    // Direction should now be RTL
    expect(screen.getByTestId('direction')).toHaveTextContent('rtl');
    expect(screen.getByTestId('is-rtl')).toHaveTextContent('true');
    
    // Toggle again
    screen.getByTestId('toggle-btn').click();
    
    // Direction should be back to LTR
    expect(screen.getByTestId('direction')).toHaveTextContent('ltr');
    expect(screen.getByTestId('is-rtl')).toHaveTextContent('false');
  });
  
  it('sets direction directly when setDirection is called', () => {
    render(
      <RTLProvider>
        <TestComponent />
      </RTLProvider>
    );
    
    // Initial direction is LTR
    expect(screen.getByTestId('direction')).toHaveTextContent('ltr');
    
    // Set to RTL
    screen.getByTestId('set-rtl-btn').click();
    
    // Direction should be RTL
    expect(screen.getByTestId('direction')).toHaveTextContent('rtl');
    
    // Set to LTR
    screen.getByTestId('set-ltr-btn').click();
    
    // Direction should be LTR
    expect(screen.getByTestId('direction')).toHaveTextContent('ltr');
  });
  
  it('responds to language changes from useI18n', () => {
    // Set language to Arabic (RTL)
    (useI18n as jest.Mock).mockReturnValue({
      language: 'ar',
    });
    
    render(
      <RTLProvider>
        <TestComponent />
      </RTLProvider>
    );
    
    // Direction should be RTL for Arabic
    expect(screen.getByTestId('direction')).toHaveTextContent('rtl');
    expect(screen.getByTestId('is-rtl')).toHaveTextContent('true');
    
    // Change language to English (LTR)
    (useI18n as jest.Mock).mockReturnValue({
      language: 'en',
    });
    
    // Re-render with the new language
    render(
      <RTLProvider>
        <TestComponent />
      </RTLProvider>
    );
    
    // Direction should be LTR for English
    expect(screen.getByTestId('direction')).toHaveTextContent('ltr');
    expect(screen.getByTestId('is-rtl')).toHaveTextContent('false');
  });
});