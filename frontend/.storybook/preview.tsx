import React from 'react';
import type { Preview } from '@storybook/react';
import { MantineProvider, ColorSchemeProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '../src/utils/query-client';
import { I18nProvider } from '../src/components/accessibility/I18nProvider';
import { RTLProvider } from '../src/components/accessibility/RTLProvider';
import theme from '../src/theme';

// Create a fresh query client for Storybook
const queryClient = createQueryClient();

// Default theme context setup
const withThemeContext = (StoryFn, context) => {
  // Access theme parameters from story context
  const { globals } = context;
  const colorScheme = globals.theme || 'light';
  const direction = globals.direction || 'ltr';
  const motionPreference = globals.motionPreference || 'full';
  const language = globals.language || 'en';

  // Mock toggle function
  const toggleColorScheme = () => {
    // This is handled by Storybook globals
  };

  // Get messages based on selected language
  const messages = {
    en: {
      common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        loading: 'Loading...',
      },
      accessibility: {
        skipToContent: 'Skip to main content',
      },
    },
    es: {
      common: {
        save: 'Guardar',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        loading: 'Cargando...',
      },
      accessibility: {
        skipToContent: 'Saltar al contenido principal',
      },
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <I18nProvider messages={messages} initialLang={language}>
          <RTLProvider initialDirection={direction}>
            <MantineProvider
              withGlobalStyles
              withNormalizeCSS
              theme={{
                ...theme,
                colorScheme,
                dir: direction,
              }}
            >
              <ModalsProvider>
                <div 
                  data-motion-preference={motionPreference}
                  style={{ padding: '1rem' }}
                >
                  <StoryFn />
                </div>
              </ModalsProvider>
            </MantineProvider>
          </RTLProvider>
        </I18nProvider>
      </ColorSchemeProvider>
    </QueryClientProvider>
  );
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: 'centered',
    backgrounds: { 
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1b1e' },
        { name: 'gray', value: '#f8f9fa' }, 
      ],
    },
    a11y: {
      config: {
        // axe-core configuration options
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
  decorators: [withThemeContext],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'circlehollow', title: 'Light' },
          { value: 'dark', icon: 'circle', title: 'Dark' },
        ],
        showName: true,
      },
    },
    direction: {
      name: 'Direction',
      description: 'Text direction',
      defaultValue: 'ltr',
      toolbar: {
        icon: 'paragraph',
        items: [
          { value: 'ltr', title: 'Left to Right (LTR)' },
          { value: 'rtl', title: 'Right to Left (RTL)' },
        ],
        showName: true,
      },
    },
    motionPreference: {
      name: 'Motion',
      description: 'Motion preference',
      defaultValue: 'full',
      toolbar: {
        icon: 'play',
        items: [
          { value: 'full', title: 'Full Motion' },
          { value: 'reduced', title: 'Reduced Motion' },
          { value: 'none', title: 'No Motion' },
        ],
        showName: true,
      },
    },
    language: {
      name: 'Language',
      description: 'Content language',
      defaultValue: 'en',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', title: 'English' },
          { value: 'es', title: 'Spanish' },
        ],
        showName: true,
      },
    },
  },
};

export default preview;
