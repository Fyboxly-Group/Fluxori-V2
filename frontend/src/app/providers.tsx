'use client';

import React from 'react';
import { MantineProvider, ColorSchemeProvider, ColorScheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, memo } from 'react';
import dynamic from 'next/dynamic';
import theme from '@/theme';
import { createQueryClient } from '@/utils/query-client';
import { refreshDeviceCapabilities } from '@/animations/optimizedGsap';
import { persistentCache } from '@/utils/cache';
import { RTLProvider } from '@/components/accessibility/RTLProvider';
import { I18nProvider } from '@/components/accessibility/I18nProvider';
import { SkipLink } from '@/components/accessibility/SkipLink';
import { KeyboardShortcutsHelp } from '@/components/accessibility/KeyboardShortcutsHelp';
import { initializeMotionPreferences } from '@/utils/accessibility/motionPreferences';
import { setupKeyboardDetection } from '@/utils/accessibility/keyboard';

export interface ProvidersProps {
  children: React.ReactNode;
}

// Default translations for the application
const defaultMessages = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    back: 'Back',
    next: 'Next',
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
  },
  auth: {
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot password?',
    resetPassword: 'Reset password',
  },
  navigation: {
    dashboard: 'Dashboard',
    inventory: 'Inventory',
    orders: 'Orders',
    shipments: 'Shipments',
    reports: 'Reports',
    settings: 'Settings',
    profile: 'Profile',
  },
  accessibility: {
    skipToContent: 'Skip to main content',
    darkMode: 'Dark mode',
    lightMode: 'Light mode',
    highContrast: 'High contrast mode',
    language: 'Language',
    motionPreference: 'Motion preference',
  },
};

// Sample keyboard shortcuts for the application
const shortcuts = [
  {
    key: '?',
    shiftKey: true,
    description: 'Show keyboard shortcuts help',
    category: 'General',
  },
  {
    key: 'a',
    altKey: true,
    shiftKey: true,
    description: 'Open accessibility settings',
    category: 'General',
  },
  {
    key: 'h',
    description: 'Go to home page',
    category: 'Navigation',
  },
  {
    key: 'd',
    description: 'Go to dashboard',
    category: 'Navigation',
  },
  {
    key: 'i',
    description: 'Go to inventory',
    category: 'Navigation',
  },
  {
    key: 'o',
    description: 'Go to orders',
    category: 'Navigation',
  },
  {
    key: 'r',
    description: 'Go to reports',
    category: 'Navigation',
  },
  {
    key: 's',
    description: 'Go to settings',
    category: 'Navigation',
  },
  {
    key: 'p',
    description: 'Go to profile',
    category: 'Navigation',
  },
  {
    key: 'n',
    description: 'Create new item',
    category: 'Actions',
  },
  {
    key: 's',
    ctrlKey: true,
    description: 'Save current form',
    category: 'Actions',
  },
  {
    key: 'f',
    ctrlKey: true,
    description: 'Open search',
    category: 'UI',
  },
  {
    key: 'Escape',
    description: 'Close modal or menu',
    category: 'UI',
  },
];

// Dynamically import PerformanceMonitor to avoid including it in the main bundle
// Only load in development
const PerformanceMonitor = process.env.NODE_ENV === 'development'
  ? dynamic(() => import('@/utils/performance').then(mod => ({ default: mod.PerformanceMonitor })), {
      ssr: false,
    })
  : () => null;

// Memoized providers to prevent unnecessary re-renders
export const Providers = memo(function Providers({ children }: ProvidersProps) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const [queryClient] = useState(() => createQueryClient());
  const [isInitialized, setIsInitialized] = useState(false);

  const toggleColorScheme = (value?: ColorScheme) => {
    const nextColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
    setColorScheme(nextColorScheme);
    
    // Save to both localStorage and persistentCache
    if (typeof window !== 'undefined') {
      persistentCache.set('colorScheme', nextColorScheme, 365 * 24 * 60 * 60 * 1000); // 1 year
      window.localStorage.setItem('color-scheme', nextColorScheme);
    }
  };

  // Effect to initialize app settings on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      // Get color scheme from cache or localStorage
      const cachedColorScheme = persistentCache.get<ColorScheme>('colorScheme');
      const savedColorScheme = window.localStorage.getItem('color-scheme') as ColorScheme | null;
      
      if (cachedColorScheme) {
        setColorScheme(cachedColorScheme);
      } else if (savedColorScheme) {
        setColorScheme(savedColorScheme);
        // Also save to cache for future
        persistentCache.set('colorScheme', savedColorScheme);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Use system preference as fallback
        setColorScheme('dark');
      }
      
      // Update device capabilities for optimized animations
      refreshDeviceCapabilities();
      
      // Initialize accessibility features
      initializeMotionPreferences();
      setupKeyboardDetection();
      
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Add listener for color scheme preference changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        // Only auto-switch if user hasn't explicitly set a preference
        if (!persistentCache.has('colorScheme') && !localStorage.getItem('color-scheme')) {
          setColorScheme(e.matches ? 'dark' : 'light');
        }
      };
      
      // Add listener using the appropriate method
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange);
      }
      
      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleChange);
        } else {
          // Fallback for older browsers
          mediaQuery.removeListener(handleChange);
        }
      };
    }
  }, []);

  // Import GlobalErrorBoundary dynamically to avoid including in initial bundle
  const GlobalErrorBoundary = dynamic(() => import('@/components/ui/GlobalErrorBoundary'), {
    ssr: true,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <I18nProvider messages={defaultMessages} initialLang="en">
          <RTLProvider>
            <MantineProvider
              withGlobalStyles
              withNormalizeCSS
              theme={{
                ...theme,
                colorScheme,
              }}
            >
              <ModalsProvider>
                <Notifications position="top-right" />
                
                {/* Accessibility components */}
                <SkipLink targetId="main-content" />
                <KeyboardShortcutsHelp shortcuts={shortcuts} />
                
                {/* Add an ID to the main content for skip link */}
                <GlobalErrorBoundary>
                  <div id="main-content" tabIndex={-1}>
                    {children}
                  </div>
                </GlobalErrorBoundary>
                
                {/* Add performance monitor in development mode */}
                <PerformanceMonitor visible={process.env.NODE_ENV === 'development'} />
              </ModalsProvider>
            </MantineProvider>
          </RTLProvider>
        </I18nProvider>
      </ColorSchemeProvider>
    </QueryClientProvider>
  );
});

export default Providers;