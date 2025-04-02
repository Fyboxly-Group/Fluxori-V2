import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MantineProvider, ColorSchemeProvider } from '@mantine/core';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from './query-client';
import { I18nProvider } from '@/components/accessibility/I18nProvider';
import { RTLProvider } from '@/components/accessibility/RTLProvider';
import { ModalsProvider } from '@mantine/modals';
import theme from '@/theme';

// Default test messages
const testMessages = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    loading: 'Loading...',
  },
  accessibility: {
    skipToContent: 'Skip to main content',
  },
};

interface AllTheProvidersProps {
  children: ReactNode;
  colorScheme?: 'light' | 'dark';
  messages?: Record<string, any>;
  rtlDirection?: 'ltr' | 'rtl';
}

/**
 * Provider wrapper for testing components with all necessary providers
 */
const AllTheProviders = ({
  children,
  colorScheme = 'light',
  messages = testMessages,
  rtlDirection = 'ltr',
}: AllTheProvidersProps) => {
  // Create a fresh query client for each test
  const queryClient = createQueryClient();
  
  const toggleColorScheme = jest.fn();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <I18nProvider messages={messages} initialLang="en">
          <RTLProvider initialDirection={rtlDirection}>
            <MantineProvider
              withGlobalStyles
              withNormalizeCSS
              theme={{
                ...theme,
                colorScheme,
              }}
            >
              <ModalsProvider>
                {children}
              </ModalsProvider>
            </MantineProvider>
          </RTLProvider>
        </I18nProvider>
      </ColorSchemeProvider>
    </QueryClientProvider>
  );
};

/**
 * Custom render function that includes all necessary providers
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    colorScheme?: 'light' | 'dark';
    messages?: Record<string, any>;
    rtlDirection?: 'ltr' | 'rtl';
  },
) => {
  const {
    colorScheme = 'light',
    messages = testMessages,
    rtlDirection = 'ltr',
    ...renderOptions
  } = options || {};
  
  return render(ui, {
    wrapper: (props) => (
      <AllTheProviders
        colorScheme={colorScheme}
        messages={messages}
        rtlDirection={rtlDirection}
        {...props}
      />
    ),
    ...renderOptions,
  });
};

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };