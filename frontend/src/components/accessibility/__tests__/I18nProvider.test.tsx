import { render } from '@testing-library/react';
import { I18nProvider } from '../I18nProvider';
import { useI18n } from '@/hooks/accessibility/useI18n';

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

describe('I18nProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('calls useI18n with the provided messages and initial language', () => {
    // Sample messages
    const messages = {
      common: {
        hello: 'Hello',
        goodbye: 'Goodbye',
      },
    };
    
    // Render the provider with a test child component
    render(
      <I18nProvider messages={messages} initialLang="fr">
        <div>Test Child</div>
      </I18nProvider>
    );
    
    // Check if useI18n was called with the correct parameters
    expect(useI18n).toHaveBeenCalledWith(messages, 'fr');
  });
  
  it('uses default language when initialLang is not provided', () => {
    // Sample messages
    const messages = {
      common: {
        hello: 'Hello',
        goodbye: 'Goodbye',
      },
    };
    
    // Render the provider without initialLang
    render(
      <I18nProvider messages={messages}>
        <div>Test Child</div>
      </I18nProvider>
    );
    
    // Check if useI18n was called with the default language (which is determined within useI18n)
    expect(useI18n).toHaveBeenCalledWith(messages, undefined);
  });
  
  it('renders children correctly', () => {
    // Sample messages
    const messages = {
      common: {
        hello: 'Hello',
        goodbye: 'Goodbye',
      },
    };
    
    // Render the provider with a test child
    const { getByText } = render(
      <I18nProvider messages={messages}>
        <div>Test Child</div>
      </I18nProvider>
    );
    
    // The child should be rendered
    expect(getByText('Test Child')).toBeInTheDocument();
  });
});