import { MantineTheme, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

/**
 * Media breakpoints following Mantine's defaults
 */
export const breakpoints = {
  xs: 576,
  sm: 768,
  md: 992,
  lg: 1200,
  xl: 1400,
};

/**
 * Hook to check if the viewport is mobile size
 */
export function useIsMobile() {
  return useMediaQuery(`(max-width: ${breakpoints.sm - 1}px)`);
}

/**
 * Hook to check if the viewport is tablet size
 */
export function useIsTablet() {
  return useMediaQuery(
    `(min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.md - 1}px)`
  );
}

/**
 * Hook to check if the viewport is desktop size
 */
export function useIsDesktop() {
  return useMediaQuery(`(min-width: ${breakpoints.md}px)`);
}

/**
 * Hook to check if the viewport is a specific size or below
 */
export function useIsBreakpoint(breakpoint: keyof typeof breakpoints) {
  return useMediaQuery(`(max-width: ${breakpoints[breakpoint]}px)`);
}

/**
 * Hook to get all breakpoint statuses
 */
export function useBreakpoints() {
  const theme = useMantineTheme();
  
  return {
    isXs: useMediaQuery(`(max-width: ${theme.breakpoints.xs}px)`),
    isSm: useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`),
    isMd: useMediaQuery(`(max-width: ${theme.breakpoints.md}px)`),
    isLg: useMediaQuery(`(max-width: ${theme.breakpoints.lg}px)`),
    isXl: useMediaQuery(`(max-width: ${theme.breakpoints.xl}px)`),
  };
}

/**
 * Get responsive value based on current viewport size
 */
export function getResponsiveValue<T>(
  theme: MantineTheme,
  values: {
    base: T;
    xs?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
  }
): T {
  const { smallerThan } = theme.fn;
  
  // Use window object only on client side
  if (typeof window === 'undefined') {
    return values.base;
  }
  
  const windowWidth = window.innerWidth;
  
  if (windowWidth <= theme.breakpoints.xs) {
    return values.xs ?? values.base;
  } else if (windowWidth <= theme.breakpoints.sm) {
    return values.sm ?? values.xs ?? values.base;
  } else if (windowWidth <= theme.breakpoints.md) {
    return values.md ?? values.sm ?? values.xs ?? values.base;
  } else if (windowWidth <= theme.breakpoints.lg) {
    return values.lg ?? values.md ?? values.sm ?? values.xs ?? values.base;
  } else {
    return values.xl ?? values.lg ?? values.md ?? values.sm ?? values.xs ?? values.base;
  }
}

/**
 * Hook to get responsive value based on current viewport size
 */
export function useResponsiveValue<T>(values: {
  base: T;
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}): T {
  const theme = useMantineTheme();
  return getResponsiveValue(theme, values);
}

export default {
  breakpoints,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsBreakpoint,
  useBreakpoints,
  getResponsiveValue,
  useResponsiveValue,
};