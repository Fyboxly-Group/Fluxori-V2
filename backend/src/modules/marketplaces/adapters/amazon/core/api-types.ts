/**
 * Re-export of common API types from base-module.interface.ts
 */
export { ApiResponse, ApiRequestFunction } from './base-module.interface';

/**
 * Common error response structure
 */
export interface ErrorResponse {
  code: string;
  message: string;
  details?: string;
}

/**
 * Common paginated response structure
 */
export interface PaginatedResponse<T = any> {
  items: T[];
  nextToken?: string;
  totalCount?: number;
}

/**
 * Common Amazon marketplace identifier
 */
export interface MarketplaceIdentifier {
  marketplaceId: string;
  countryCode?: string;
  name?: string;
}

/**
 * Generic success response
 */
export interface SuccessResponse {
  success: boolean;
  message?: string;
}
