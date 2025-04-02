/**
 * Chakra UI utilities to help with type checking
 */

/**
 * Creates a responsive object type for Chakra UI
 * @example
 * // Use like:
 * const marginX = responsive<string>({ base: '1rem', md: '2rem' });
 */
export type ResponsiveValue<T> = T | Record<string, T>;

/**
 * Helper for creating toaster instances
 * This is used in multiple places and needs to have a consistent signature
 */
export const createToaster = () => {
  // This is placeholder implementation
  // In a real app this would connect to your notification system
  return (options: any) => {
    console.log('Toast:', options);
    // Return a mock toast ID
    return 'toast-id';
  };
};

/**
 * Type for template columns in Grid
 */
export interface GridTemplateColumns {
  base?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
  [key: string]: string | undefined;
}

/**
 * Type for layout directions
 */
export interface LayoutDirection {
  base?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
  [key: string]: string | undefined;
}

/**
 * Type for responsive spacing
 */
export interface ResponsiveSpacing {
  base?: number | string;
  sm?: number | string;
  md?: number | string;
  lg?: number | string;
  xl?: number | string;
  '2xl'?: number | string;
  [key: string]: number | string | undefined;
}

/**
 * Type for responsive font sizes
 */
export interface ResponsiveFontSize {
  base?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
  [key: string]: string | undefined;
}

/**
 * Type for responsive width/height
 */
export interface ResponsiveSize {
  base?: string | number;
  sm?: string | number;
  md?: string | number;
  lg?: string | number;
  xl?: string | number;
  '2xl'?: string | number;
  [key: string]: string | number | undefined;
}

/**
 * Type for grid props
 */
export interface GridProps {
  templateColumns?: GridTemplateColumns | string;
  templateRows?: ResponsiveValue<string>;
  templateAreas?: ResponsiveValue<string>;
  gap?: ResponsiveSpacing;
  rowGap?: ResponsiveSpacing;
  columnGap?: ResponsiveSpacing;
  autoFlow?: ResponsiveValue<string>;
  autoRows?: ResponsiveValue<string>;
  autoColumns?: ResponsiveValue<string>;
  [key: string]: any;
}

/**
 * Type for flex props
 */
export interface FlexProps {
  direction?: LayoutDirection | string;
  wrap?: ResponsiveValue<string>;
  align?: ResponsiveValue<string>;
  justify?: ResponsiveValue<string>;
  basis?: ResponsiveValue<string>;
  grow?: ResponsiveValue<string | number>;
  shrink?: ResponsiveValue<string | number>;
  [key: string]: any;
}
