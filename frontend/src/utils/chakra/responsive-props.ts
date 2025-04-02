/**
 * Helpers for working with Chakra UI responsive props
 */

/**
 * Type for breakpoints in Chakra UI
 */
export type ChakraBreakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Create a responsive value for Chakra UI
 */
export function responsive<T>(values: Record<ChakraBreakpoint, T>): Record<string, T> {
  return values;
}

/**
 * Create a responsive object that can be safely passed to templateColumns
 */
export function responsiveGrid(values: Record<ChakraBreakpoint, string>): any {
  return values;
}

/**
 * Create a responsive object that can be safely passed to direction
 */
export function responsiveDirection(values: Record<ChakraBreakpoint, string>): any {
  return values;
}

/**
 * Create a responsive object that can be safely passed to fontSize
 */
export function responsiveFontSize(values: Record<ChakraBreakpoint, string>): any {
  return values;
}

/**
 * Create a responsive object that can be safely passed to spacing props
 */
export function responsiveSpacing(values: Record<ChakraBreakpoint, number | string>): any {
  return values;
}
