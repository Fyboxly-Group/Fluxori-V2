/**
 * Base module implementation for Amazon API modules
 */
import { BaseModule, ApiRequestFunction, ApiResponse } from './base-module.interface';
import { RequestOptions } from './api-types';

/**
 * Abstract base class for all Amazon API modules
 * Provides common functionality and enforces the BaseModule interface
 */
export abstract class ApiModule<T = any> implements BaseModule<T> {
  /**
   * The unique identifier for this module
   */
  abstract readonly moduleId: string;
  
  /**
   * The human-readable name of this module
   */
  abstract readonly moduleName: string;
  
  /**
   * The API version this module uses
   */
  abstract readonly apiVersion: string;
  
  /**
   * The base URL path for API requests
   */
  abstract readonly basePath: string;
  
  /**
   * The marketplace ID this module is associated with
   */
  readonly marketplaceId: string;
  
  /**
   * Additional configuration options for this module
   */
  readonly options: T;
  
  /**
   * The API request function used by this module
   */
  readonly apiRequest: ApiRequestFunction;
  
  /**
   * Creates a new API module
   * 
   * @param apiRequest - The API request function to use
   * @param marketplaceId - The Amazon marketplace ID
   * @param options - Additional configuration options
   */
  constructor(apiRequest: ApiRequestFunction, marketplaceId: string, options: T) {
    this.apiRequest = apiRequest;
    this.marketplaceId = marketplaceId;
    this.options = options;
  }
  
  /**
   * Helper method to make API requests with proper typing
   * 
   * @param path - The API path to request
   * @param method - The HTTP method to use
   * @param data - Optional request data
   * @param requestOptions - Optional request configuration
   * @returns Promise resolving to the API response
   */
  protected async request<R = any>(
    path: string,
    method: string,
    data?: any,
    requestOptions?: RequestOptions
  ): Promise<ApiResponse<R>> {
    const fullPath = `${this.basePath}/${path}`.replace(/\/+/g, '/');
    
    // Merge request options with default options
    const options = {
      marketplaceId: this.marketplaceId,
      ...(requestOptions || {})
    };
    
    // Add options to request data
    const requestData = {
      ...data,
      _options: options
    };
    
    return this.apiRequest<R>(fullPath, method, requestData);
  }
}
