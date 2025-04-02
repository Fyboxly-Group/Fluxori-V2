/**
 * Utility types for Chakra UI components
 */

// Type for responsive values
export type ResponsiveValue<T> = T | Record<string, T>;

// Type for style props
export interface StyleProps {
  margin?: ResponsiveValue<string | number>;
  m?: ResponsiveValue<string | number>;
  marginTop?: ResponsiveValue<string | number>;
  mt?: ResponsiveValue<string | number>;
  marginRight?: ResponsiveValue<string | number>;
  mr?: ResponsiveValue<string | number>;
  marginBottom?: ResponsiveValue<string | number>;
  mb?: ResponsiveValue<string | number>;
  marginLeft?: ResponsiveValue<string | number>;
  ml?: ResponsiveValue<string | number>;
  marginX?: ResponsiveValue<string | number>;
  mx?: ResponsiveValue<string | number>;
  marginY?: ResponsiveValue<string | number>;
  my?: ResponsiveValue<string | number>;
  
  padding?: ResponsiveValue<string | number>;
  p?: ResponsiveValue<string | number>;
  paddingTop?: ResponsiveValue<string | number>;
  pt?: ResponsiveValue<string | number>;
  paddingRight?: ResponsiveValue<string | number>;
  pr?: ResponsiveValue<string | number>;
  paddingBottom?: ResponsiveValue<string | number>;
  pb?: ResponsiveValue<string | number>;
  paddingLeft?: ResponsiveValue<string | number>;
  pl?: ResponsiveValue<string | number>;
  paddingX?: ResponsiveValue<string | number>;
  px?: ResponsiveValue<string | number>;
  paddingY?: ResponsiveValue<string | number>;
  py?: ResponsiveValue<string | number>;
  
  width?: ResponsiveValue<string | number>;
  w?: ResponsiveValue<string | number>;
  height?: ResponsiveValue<string | number>;
  h?: ResponsiveValue<string | number>;
  
  color?: ResponsiveValue<string>;
  bg?: ResponsiveValue<string>;
  backgroundColor?: ResponsiveValue<string>;
  
  display?: ResponsiveValue<string>;
  flex?: ResponsiveValue<string | number>;
  flexDirection?: ResponsiveValue<string>;
  alignItems?: ResponsiveValue<string>;
  justifyContent?: ResponsiveValue<string>;
  gap?: ResponsiveValue<string | number>;
}

// Type for grid template columns
export interface GridTemplateColumns {
  base?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
  [key: string]: string | undefined;
}

// Type for responsive flex props
export interface FlexProps extends StyleProps {
  direction?: ResponsiveValue<string>;
  wrap?: ResponsiveValue<string>;
  basis?: ResponsiveValue<string | number>;
  grow?: ResponsiveValue<string | number>;
  shrink?: ResponsiveValue<string | number>;
}
