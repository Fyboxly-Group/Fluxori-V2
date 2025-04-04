/**
 * Base interface for all Amazon API modules
 */
export interface BaseModule<T = any> {
  /**
   * The unique identifier for this module
   */
  readonly moduleId: string;
  
  /**
   * The human-readable name of this module
   */
  readonly moduleName: string;
  
  /**
   * The API version this module uses
   */
  readonly apiVersion: string;
  
  /**
   * The base URL path for API requests
   */
  readonly basePath: string;
  
  /**
   * The API request function used by this module
   */
  readonly apiRequest: ApiRequestFunction;
  
  /**
   * The marketplace ID this module is associated with
   */
  readonly marketplaceId: string;
  
  /**
   * Additional configuration options for this module
   */
  readonly options: T;
}

/**
 * Type for API request function that all modules use
 */
export type ApiRequestFunction = <T = any>(
  path: string,
  method: string,
  data?: any
) => Promise<ApiResponse<T>>;

/**
 * Common API response interface
 */
export interface ApiResponse<T = any> {
  /**
   * The response data
   */
  data: T;
  
  /**
   * HTTP status code
   */
  status: number;
  
  /**
   * Response headers
   */
  headers: Record<string, string>;
}
