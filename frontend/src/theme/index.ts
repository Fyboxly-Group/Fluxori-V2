import { MantineThemeOverride } from '@mantine/core';

/**
 * Fluxori-V2 Mantine Theme
 * This defines the visual design system for the application
 */
export const theme: MantineThemeOverride = {
  colorScheme: 'light',
  // Brand colors mapped to Mantine format
  colors: {
    // Primary brand color with 10 shades from lightest to darkest
    brand: [
      '#f0f9ff', // 0: Lightest
      '#e0f2fe', // 1
      '#bae6fd', // 2
      '#7dd3fc', // 3
      '#38bdf8', // 4
      '#0ea5e9', // 5: Base color
      '#0284c7', // 6
      '#0369a1', // 7
      '#075985', // 8
      '#0c4a6e'  // 9: Darkest
    ],
    // Secondary color
    secondary: [
      '#f5f5f5',
      '#e5e5e5',
      '#d4d4d4',
      '#a3a3a3',
      '#737373',
      '#525252',
      '#404040',
      '#262626',
      '#171717',
      '#0a0a0a'
    ],
    // Success color
    success: [
      '#f0fdf4',
      '#dcfce7',
      '#bbf7d0',
      '#86efac',
      '#4ade80',
      '#22c55e',
      '#16a34a',
      '#15803d',
      '#166534',
      '#14532d'
    ],
    // Warning color
    warning: [
      '#fffbeb',
      '#fef3c7',
      '#fde68a',
      '#fcd34d',
      '#fbbf24',
      '#f59e0b',
      '#d97706',
      '#b45309',
      '#92400e',
      '#78350f'
    ],
    // Error color
    error: [
      '#fef2f2',
      '#fee2e2',
      '#fecaca',
      '#fca5a5',
      '#f87171',
      '#ef4444',
      '#dc2626',
      '#b91c1c',
      '#991b1b',
      '#7f1d1d'
    ]
  },
  primaryColor: 'brand',
  // Font settings
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20
  },
  // Heading styles
  headings: {
    fontFamily: 'Lexend, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    sizes: {
      h1: { fontSize: 32, fontWeight: 700, lineHeight: 1.3 },
      h2: { fontSize: 28, fontWeight: 600, lineHeight: 1.35 },
      h3: { fontSize: 24, fontWeight: 600, lineHeight: 1.4 },
      h4: { fontSize: 20, fontWeight: 600, lineHeight: 1.4 },
      h5: { fontSize: 18, fontWeight: 500, lineHeight: 1.45 },
      h6: { fontSize: 16, fontWeight: 500, lineHeight: 1.5 }
    }
  },
  // Border radius settings
  radius: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16
  },
  // Spacing system
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  // Shadow styles
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  // Customize default component styles
  components: {
    Button: {
      defaultProps: {
        size: 'md',
        radius: 'md'
      },
      styles: (theme) => ({
        root: {
          fontWeight: 500,
          '&:focus': {
            outline: `2px solid ${theme.colors.brand[5]}`
          }
        }
      })
    },
    Card: {
      defaultProps: {
        padding: 'lg',
        radius: 'md',
        withBorder: true
      }
    },
    Title: {
      styles: {
        root: {
          '&:not(:last-child)': {
            marginBottom: '0.5em'
          }
        }
      }
    },
    Input: {
      defaultProps: {
        size: 'md'
      },
      styles: (theme) => ({
        input: {
          transition: 'border-color 200ms ease',
          '&:focus': {
            borderColor: theme.colors.brand[5]
          }
        }
      })
    }
  },
  // Other theme properties
  other: {
    // Custom theme properties that can be accessed in components
    transitionTimings: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    maxContentWidth: 1200,
    sidebarWidth: 260
  }
};

export default theme;