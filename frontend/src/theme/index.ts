import { createMultiStyleConfigHelpers } from '@chakra-ui/react/styled-system'
import { ChakraTheme } from '@chakra-ui/react'

// Foundation styles
const foundations = {
  colors: {
    brand: {
      50: '#e6f7ff',
      100: '#b3e0ff',
      200: '#80caff',
      300: '#4db3ff',
      400: '#1a9dff',
      500: '#0080e6',
      600: '#0066b3',
      700: '#004d80',
      800: '#00334d',
      900: '#001a26',
    },
  },
  fonts: {
    body: 'Inter, system-ui, sans-serif',
    heading: 'Inter, system-ui, sans-serif',
    mono: 'Menlo, monospace',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
  },
  space: {
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
  radii: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
}

// Component style overrides
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'md',
    },
    variants: {
      primary: {
        bg: 'brand.500',
        color: 'white',
        _hover: { bg: 'brand.600' },
      },
      secondary: {
        bg: 'gray.200',
        color: 'gray.700',
        _hover: { bg: 'gray.300' },
      },
      outline: {
        border: '1px solid',
        borderColor: 'brand.500',
        color: 'brand.500',
      },
    },
    defaultProps: {
      variant: 'primary',
      size: 'md',
    },
  },
  Card: createMultiStyleConfigHelpers(['container', 'header', 'body', 'footer']).defineMultiStyleConfig({
    baseStyle: {
      container: {
        bg: 'white',
        borderRadius: 'lg',
        boxShadow: 'md',
        overflow: 'hidden',
      },
      header: {
        px: 6,
        py: 4,
        borderBottom: '1px solid',
        borderColor: 'gray.100',
      },
      body: {
        px: 6,
        py: 4,
      },
      footer: {
        px: 6,
        py: 4,
        borderTop: '1px solid',
        borderColor: 'gray.100',
      },
    },
    sizes: {
      sm: {
        container: { maxW: '320px' },
        header: { fontSize: 'sm' },
        body: { fontSize: 'sm' },
        footer: { fontSize: 'sm' },
      },
      md: {
        container: { maxW: '480px' },
      },
      lg: {
        container: { maxW: '640px' },
        header: { fontSize: 'lg' },
        body: { fontSize: 'md' },
        footer: { fontSize: 'md' },
      },
    },
    defaultProps: {
      size: 'md',
    },
  }),
}

// Global styles
const globalStyles = {
  global: (props: { colorMode: 'light' | 'dark' }) => ({
    body: {
      bg: props.colorMode === 'light' ? 'gray.50' : 'gray.800',
      color: props.colorMode === 'light' ? 'gray.800' : 'gray.50',
    },
  }),
}

// Theme config
const config = {
  initialColorMode: 'light' as 'light', // Default for SSR
  useSystemColorMode: true,  // Uses system preference as fallback
  disableTransitionOnChange: false, // Allow smooth transitions between modes
}

// Complete theme object
export const theme: ChakraTheme = {
  ...foundations,
  config,
  components,
  styles: {
    global: globalStyles.global,
  },
}