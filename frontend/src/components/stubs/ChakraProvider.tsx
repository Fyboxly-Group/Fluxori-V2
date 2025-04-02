'use client';

/**
 * Chakra Provider Wrapper for V3
 * This component serves as a wrapper around Chakra UI V3 to avoid circular dependencies.
 */
import React from 'react';

// Create a simple stub theme for use with the provider
const defaultTheme = {
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    transparent: 'transparent',
    brand: {
      50: '#E6FFFA',
      100: '#B2F5EA',
      500: '#319795',
      600: '#2C7A7B',
      900: '#1D4044',
    },
  },
  components: {},
  styles: {
    global: {
      body: {
        bg: 'white',
        color: 'gray.800',
      },
    },
  },
};

// Mock ChakraProvider for when imports are problematic
export function ChakraProvider({ 
  children, 
  theme = defaultTheme 
}: { 
  children: React.ReactNode,
  theme?: any
}) {
  return (
    <div data-chakra-provider>
      {children}
    </div>
  );
}