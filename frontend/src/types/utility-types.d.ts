/**
 * Utility types for TypeScript
 */

/**
 * Makes all properties of T optional
 */
type Partial<T> = {
  [P in keyof T]?: T[P];
};

/**
 * Makes all properties of T required
 */
type Required<T> = {
  [P in keyof T]-?: T[P];
};

/**
 * Makes all properties of T readonly
 */
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

/**
 * Picks only the specified properties from T
 */
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

/**
 * Omits the specified properties from T
 */
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

/**
 * Makes a type that requires at least one of the properties of T
 */
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> 
  & {
      [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
    }[Keys];

/**
 * Makes a type that requires exactly one of the properties of T
 */
type RequireExactlyOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> 
  & {
      [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>
    }[Keys];

/**
 * Returns a record type with the keys of K and values of type T
 */
type Record<K extends keyof any, T> = {
  [P in K]: T;
};

/**
 * Makes properties specified by K optional in type T
 */
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Deep partial type that makes all nested properties optional
 */
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

/**
 * Makes properties specifid by K required in type T
 */
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Makes properties specifid by K nullable in type T
 */
type Nullable<T> = { [P in keyof T]: T[P] | null };

/**
 * Makes type T or null
 */
type OrNull<T> = T | null;

/**
 * Makes type T or undefined
 */
type OrUndefined<T> = T | undefined;

/**
 * Makes type T or null or undefined
 */
type OrNullable<T> = T | null | undefined;

/**
 * Creates a type for responsive values in Chakra UI
 */
type ResponsiveValue<T> = T | Record<string, T>;

/**
 * Creates a type for responsive style props
 */
type StyleProps = {
  m?: ResponsiveValue<string | number>;
  mt?: ResponsiveValue<string | number>;
  mr?: ResponsiveValue<string | number>;
  mb?: ResponsiveValue<string | number>;
  ml?: ResponsiveValue<string | number>;
  mx?: ResponsiveValue<string | number>;
  my?: ResponsiveValue<string | number>;
  p?: ResponsiveValue<string | number>;
  pt?: ResponsiveValue<string | number>;
  pr?: ResponsiveValue<string | number>;
  pb?: ResponsiveValue<string | number>;
  pl?: ResponsiveValue<string | number>;
  px?: ResponsiveValue<string | number>;
  py?: ResponsiveValue<string | number>;
  width?: ResponsiveValue<string | number>;
  height?: ResponsiveValue<string | number>;
  minWidth?: ResponsiveValue<string | number>;
  maxWidth?: ResponsiveValue<string | number>;
  minHeight?: ResponsiveValue<string | number>;
  maxHeight?: ResponsiveValue<string | number>;
  [key: string]: any;
};