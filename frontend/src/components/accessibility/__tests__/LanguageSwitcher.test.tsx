import { render, screen, fireEvent, waitFor } from '@/utils/test-utils';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { supportedLocales } from '@/utils/accessibility/i18n';

// Mock the useI18n hook
jest.mock('@/hooks/accessibility/useI18n', () => ({
  useI18n: jest.fn().mockReturnValue({
    language: 'en',
    setLanguage: jest.fn(),
    t: jest.fn((key) => key),
    formatDate: jest.fn(),
    formatNumber: jest.fn(),
    formatCurrency: jest.fn(),
  }),
}));

// Import the mocked useI18n for controlling its behavior in tests
import { useI18n } from '@/hooks/accessibility/useI18n';

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    (useI18n as jest.Mock).mockImplementation(() => ({
      language: 'en',
      setLanguage: jest.fn(),
      t: jest.fn((key) => key),
      formatDate: jest.fn(),
      formatNumber: jest.fn(),
      formatCurrency: jest.fn(),
    }));
  });

  it('renders correctly with default props', () => {
    render(<LanguageSwitcher />);
    
    // Check that the button is rendered
    const button = screen.getByRole('button', { name: /change language/i });
    expect(button).toBeInTheDocument();
    
    // Button should show English by default
    expect(button).toHaveTextContent('English');
  });
  
  it('opens dropdown when clicked', async () => {
    render(<LanguageSwitcher />);
    
    // Click the button
    const button = screen.getByRole('button', { name: /change language/i });
    fireEvent.click(button);
    
    // Dropdown menu should appear
    await waitFor(() => {
      // Look for all supported languages in the dropdown
      Object.values(supportedLocales).forEach(languageName => {
        expect(screen.getByText(languageName)).toBeInTheDocument();
      });
    });
  });
  
  it('calls setLanguage when a language is selected', async () => {
    const mockSetLanguage = jest.fn();
    (useI18n as jest.Mock).mockImplementation(() => ({
      language: 'en',
      setLanguage: mockSetLanguage,
      t: jest.fn((key) => key),
      formatDate: jest.fn(),
      formatNumber: jest.fn(),
      formatCurrency: jest.fn(),
    }));
    
    render(<LanguageSwitcher />);
    
    // Click the button to open the dropdown
    const button = screen.getByRole('button', { name: /change language/i });
    fireEvent.click(button);
    
    // Click the Spanish option
    await waitFor(() => {
      const spanishOption = screen.getByText(supportedLocales.es);
      fireEvent.click(spanishOption);
    });
    
    // Check if setLanguage was called with the correct language code
    expect(mockSetLanguage).toHaveBeenCalledWith('es');
  });
  
  it('renders with buttons variant', () => {
    render(<LanguageSwitcher variant="buttons" />);
    
    // Should render buttons for all supported languages
    Object.entries(supportedLocales).forEach(([code, name]) => {
      const button = screen.getByText(name);
      expect(button).toBeInTheDocument();
    });
  });
  
  it('renders with dropdown variant', () => {
    render(<LanguageSwitcher variant="dropdown" />);
    
    // Should render a single button with the current language
    const button = screen.getByRole('button', { name: /change language/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('English');
  });
  
  it('supports showing only icon', () => {
    render(<LanguageSwitcher showLabel={false} />);
    
    // Should show the flag emoji only
    const button = screen.getByRole('button', { name: /change language/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toHaveTextContent('English');
    // Should show the flag emoji (🇺🇸 for English)
    expect(button).toHaveTextContent('🇺🇸');
  });
});