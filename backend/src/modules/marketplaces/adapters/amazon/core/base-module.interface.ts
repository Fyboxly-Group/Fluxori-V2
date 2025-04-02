/**
 * Base interface for all Amazon API modules
 */
export interface BaseModule {
  /**
   * Unique identifier for the module
   */
  readonly id: string;
  
  /**
   * API version of the module
   */
  readonly version: string;
  
  /**
   * Module name
   */
  readonly name: string;
  
  /**
   * Marketplace ID
   */
  readonly marketplaceId: string;
}

/**
 * Interface for module factory constructor functions
 */
export interface ModuleConstructor<T extends BaseModule> {
  new (version: string, makeApiRequest: ApiRequestFunction, marketplaceId: string): T;
}

/**
 * Type for API request function that all modules use
 */
export type ApiRequestFunction = <T = any>(
  method: string,
  endpoint: string,
  options?: any
) => Promise<ApiResponse<T>>;

/**
 * Common API response interface
 */
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
}
