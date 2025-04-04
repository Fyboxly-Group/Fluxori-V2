/**
 * Amazon Listings API Module
 * 
 * Implements the Amazon SP-API Listings API functionality.
 * This module handles product listings management.
 */

import { ApiRequestFunction, ApiResponse, BaseModule } from '../../../core/base-module.interface';
import AmazonErrorHandler, { AmazonErrorCode } from '../../../utils/amazon-error';

/**
 * Listing status values
 */
export type ListingStatus = 'ACTIVE' | 'INACTIVE' | 'INCOMPLETE' | 'DELETED' | 'SUPPRESSED';

/**
 * Listing issue severity
 */
export type IssueSeverity = 'ERROR' | 'WARNING' | 'INFO';

/**
 * Pagination information
 */
export interface Pagination {
  /**
   * Next token for pagination
   */
  nextToken?: string;
}

/**
 * Issue with a listing
 */
export interface ListingIssue {
  /**
   * Code for the issue
   */
  code: string;
  
  /**
   * Message describing the issue
   */
  message: string;
  
  /**
   * Severity of the issue
   */
  severity: IssueSeverity;
  
  /**
   * Attribute affected by the issue
   */
  attributeNames?: string[];
}

/**
 * Summary of a listing
 */
export interface ListingSummary {
  /**
   * Seller SKU
   */
  sku: string;
  
  /**
   * Current status of the listing
   */
  status: ListingStatus;
  
  /**
   * ASIN associated with the listing
   */
  asin?: string;
  
  /**
   * Product type of the listing
   */
  productType?: string;
  
  /**
   * Condition of the listing
   */
  condition?: string;
  
  /**
   * Issues with the listing
   */
  issues?: ListingIssue[];
  
  /**
   * Offer details
   */
  offer?: Record<string, any>;
  
  /**
   * Fulfillment availability
   */
  fulfillmentAvailability?: Record<string, any>[];
}

/**
 * Listing attributes
 */
export interface ListingAttributes {
  /**
   * Listing attributes for the product
   */
  [key: string]: any;
}

/**
 * Full listing information
 */
export interface Listing {
  /**
   * Seller SKU
   */
  sku: string;
  
  /**
   * Current status of the listing
   */
  status: ListingStatus;
  
  /**
   * Issues with the listing
   */
  issues?: ListingIssue[];
  
  /**
   * Offer details
   */
  offer?: Record<string, any>;
  
  /**
   * Fulfillment availability
   */
  fulfillmentAvailability?: Record<string, any>[];
  
  /**
   * Attributes for the listing
   */
  attributes?: ListingAttributes;
  
  /**
   * Last updated time
   */
  lastUpdatedDate?: string;
}

/**
 * Get listings response
 */
export interface GetListingsResponse {
  /**
   * List of listings
   */
  listings: ListingSummary[];
  
  /**
   * Pagination information
   */
  pagination?: Pagination;
}

/**
 * Parameters for getting listings
 */
export interface GetListingsParams {
  /**
   * Marketplace ID for listings
   */
  marketplaceId?: string;
  
  /**
   * Seller SKUs to filter by
   */
  sellerSkus?: string[];
  
  /**
   * Listing statuses to filter by
   */
  statuses?: ListingStatus[];
  
  /**
   * Issue severities to filter by
   */
  issueSeverities?: IssueSeverity[];
  
  /**
   * Token for pagination
   */
  nextToken?: string;
  
  /**
   * Page size for pagination
   */
  pageSize?: number;
}

/**
 * Listing attribute patch operation
 */
export type PatchOperation = 'add' | 'replace' | 'delete';

/**
 * Listing attribute patch
 */
export interface AttributePatch {
  /**
   * Operation to perform
   */
  operation: PatchOperation;
  
  /**
   * Path to the attribute
   */
  path: string;
  
  /**
   * Value to set (not required for delete)
   */
  value?: any;
}

/**
 * Interface for listings module options
 */
export interface ListingsModuleOptions {
  /**
   * Default page size for listing requests
   */
  defaultPageSize?: number;
  
  /**
   * Maximum pages to retrieve in getAllListings
   */
  maxPages?: number;
}

/**
 * Implementation of the Amazon Listings API
 */
export class ListingsModule implements BaseModule<ListingsModuleOptions> {
  /**
   * The unique identifier for this module
   */
  public readonly moduleId: string = 'listingsItems';
  
  /**
   * The human-readable name of this module
   */
  public readonly moduleName: string = 'Listings Items';
  
  /**
   * The base URL path for API requests
   */
  public readonly basePath: string = '/listings/2021-08-01';
  
  /**
   * API version
   */
  public readonly apiVersion: string;
  
  /**
   * Marketplace ID
   */
  public readonly marketplaceId: string;
  
  /**
   * Additional configuration options for this module
   */
  public readonly options: ListingsModuleOptions = {
    defaultPageSize: 10,
    maxPages: 10
  };
  
  /**
   * The API request function used by this module
   */
  public readonly apiRequest: ApiRequestFunction;
  
  /**
   * Constructor
   * @param apiVersion API version
   * @param apiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param options Optional module-specific configuration
   */
  constructor(
    apiVersion: string,
    apiRequest: ApiRequestFunction,
    marketplaceId: string,
    options?: ListingsModuleOptions
  ) {
    this.apiVersion = apiVersion;
    this.apiRequest = apiRequest;
    this.marketplaceId = marketplaceId;
    
    if (options) {
      this.options = {
        ...this.options,
        ...options
      };
    }
  }
  
  /**
   * Get listings from Amazon
   * @param params Parameters for getting listings
   * @returns Listings response
   */
  public async getListings(params: GetListingsParams = {}): Promise<GetListingsResponse> {
    const queryParams: Record<string, string | number> = {};
    
    // Ensure we have a marketplace ID
    const marketplaceId = params.marketplaceId || this.marketplaceId;
    if (!marketplaceId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required for getting listings',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    queryParams.marketplaceIds = marketplaceId;
    
    // Add seller SKUs filter
    if (params.sellerSkus && params.sellerSkus.length > 0) {
      queryParams.sellerSkus = params.sellerSkus.join(',');
    }
    
    // Add statuses filter
    if (params.statuses && params.statuses.length > 0) {
      queryParams.statuses = params.statuses.join(',');
    }
    
    // Add issue severities filter
    if (params.issueSeverities && params.issueSeverities.length > 0) {
      queryParams.issueSeverities = params.issueSeverities.join(',');
    }
    
    // Add pagination parameters
    if (params.nextToken) {
      queryParams.nextToken = params.nextToken;
    }
    
    if (params.pageSize) {
      queryParams.pageSize = params.pageSize;
    } else if (this.options.defaultPageSize) {
      queryParams.pageSize = this.options.defaultPageSize;
    }
    
    try {
      const response = await this.apiRequest<{ payload: GetListingsResponse }>(
        `${this.basePath}/items`,
        'GET',
        { params: queryParams }
      );
      
      return response.data?.payload || { listings: [] };
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED) 
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Get a listing by seller SKU
   * @param sku Seller SKU to get
   * @param marketplaceId Marketplace ID (optional, uses default if not provided)
   * @returns Listing
   */
  public async getListingBySku(sku: string, marketplaceId?: string): Promise<Listing> {
    if (!sku) {
      throw AmazonErrorHandler.createError(
        'Seller SKU is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Ensure we have a marketplace ID
    marketplaceId = marketplaceId || this.marketplaceId;
    if (!marketplaceId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required for getting a listing',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.apiRequest<{ payload: Listing }>(
        `${this.basePath}/items/${encodeURIComponent(sku)}`,
        'GET',
        { 
          params: {
            marketplaceIds: marketplaceId
          }
        }
      );
      
      return response.data?.payload || { 
        sku,
        status: 'DELETED' as ListingStatus 
      };
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED) 
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Update a listing
   * @param sku Seller SKU of the listing to update
   * @param attributes Listing attributes to update
   * @param marketplaceId Marketplace ID (optional, uses default if not provided)
   * @returns Update response
   */
  public async updateListing(
    sku: string, 
    attributes: Record<string, any>, 
    marketplaceId?: string
  ): Promise<boolean> {
    if (!sku) {
      throw AmazonErrorHandler.createError(
        'Seller SKU is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!attributes || Object.keys(attributes).length === 0) {
      throw AmazonErrorHandler.createError(
        'Listing attributes are required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Ensure we have a marketplace ID
    marketplaceId = marketplaceId || this.marketplaceId;
    if (!marketplaceId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required for updating a listing',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.apiRequest<{ status: string }>(
        `${this.basePath}/items/${encodeURIComponent(sku)}`,
        'PUT',
        {
          params: {
            marketplaceIds: marketplaceId
          },
          data: {
            attributes: attributes
          }
        }
      );
      
      return response.status === 200;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED) 
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Patch a listing (partial update)
   * @param sku Seller SKU of the listing to update
   * @param patches Attribute patches to apply
   * @param marketplaceId Marketplace ID (optional, uses default if not provided)
   * @returns Patch response
   */
  public async patchListing(
    sku: string, 
    patches: AttributePatch[], 
    marketplaceId?: string
  ): Promise<boolean> {
    if (!sku) {
      throw AmazonErrorHandler.createError(
        'Seller SKU is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!patches || patches.length === 0) {
      throw AmazonErrorHandler.createError(
        'Listing patches are required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Ensure we have a marketplace ID
    marketplaceId = marketplaceId || this.marketplaceId;
    if (!marketplaceId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required for patching a listing',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.apiRequest<{ status: string }>(
        `${this.basePath}/items/${encodeURIComponent(sku)}`,
        'PATCH',
        {
          params: {
            marketplaceIds: marketplaceId
          },
          data: patches
        }
      );
      
      return response.status === 200;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED) 
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Delete a listing
   * @param sku Seller SKU of the listing to delete
   * @param marketplaceId Marketplace ID (optional, uses default if not provided)
   * @returns Delete response
   */
  public async deleteListing(sku: string, marketplaceId?: string): Promise<boolean> {
    if (!sku) {
      throw AmazonErrorHandler.createError(
        'Seller SKU is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Ensure we have a marketplace ID
    marketplaceId = marketplaceId || this.marketplaceId;
    if (!marketplaceId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required for deleting a listing',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.apiRequest<{ status: string }>(
        `${this.basePath}/items/${encodeURIComponent(sku)}`,
        'DELETE',
        {
          params: {
            marketplaceIds: marketplaceId
          }
        }
      );
      
      return response.status === 200;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED) 
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Create a new listing
   * @param sku Seller SKU for the new listing
   * @param attributes Listing attributes
   * @param marketplaceId Marketplace ID (optional, uses default if not provided)
   * @returns Create response
   */
  public async createListing(
    sku: string, 
    attributes: Record<string, any>, 
    marketplaceId?: string
  ): Promise<boolean> {
    if (!sku) {
      throw AmazonErrorHandler.createError(
        'Seller SKU is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!attributes || Object.keys(attributes).length === 0) {
      throw AmazonErrorHandler.createError(
        'Listing attributes are required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Ensure we have a marketplace ID
    marketplaceId = marketplaceId || this.marketplaceId;
    if (!marketplaceId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required for creating a listing',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.apiRequest<{ status: string }>(
        `${this.basePath}/items/${encodeURIComponent(sku)}`,
        'PUT',
        {
          params: {
            marketplaceIds: marketplaceId
          },
          data: {
            attributes: attributes
          }
        }
      );
      
      return response.status === 200;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED) 
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Get all listings (handles pagination)
   * @param params Parameters for getting listings
   * @returns All listings that match the parameters
   */
  public async getAllListings(params: GetListingsParams = {}): Promise<ListingSummary[]> {
    let currentPage = 1;
    let nextToken: string | undefined = undefined;
    const allListings: ListingSummary[] = [];
    const maxPages = this.options.maxPages || 10;
    
    do {
      // Update params with next token if available
      const pageParams: GetListingsParams = {
        ...params,
        nextToken
      };
      
      const response = await this.getListings(pageParams);
      
      // Add listings to our collection
      if (response.listings && response.listings.length > 0) {
        allListings.push(...response.listings);
      }
      
      // Get next token for pagination
      nextToken = response.pagination?.nextToken;
      currentPage++;
      
      // Stop if we've reached the max pages or there are no more pages
    } while (nextToken && currentPage <= maxPages);
    
    return allListings;
  }
  
  /**
   * Get active listings
   * @param marketplaceId Marketplace ID (optional, uses default if not provided)
   * @returns Active listings
   */
  public async getActiveListings(marketplaceId?: string): Promise<ListingSummary[]> {
    return this.getAllListings({ 
      marketplaceId: marketplaceId, 
      statuses: ['ACTIVE']
    });
  }
  
  /**
   * Get inactive listings
   * @param marketplaceId Marketplace ID (optional, uses default if not provided)
   * @returns Inactive listings
   */
  public async getInactiveListings(marketplaceId?: string): Promise<ListingSummary[]> {
    return this.getAllListings({ 
      marketplaceId: marketplaceId, 
      statuses: ['INACTIVE']
    });
  }
  
  /**
   * Get incomplete listings
   * @param marketplaceId Marketplace ID (optional, uses default if not provided)
   * @returns Incomplete listings
   */
  public async getIncompleteListings(marketplaceId?: string): Promise<ListingSummary[]> {
    return this.getAllListings({ 
      marketplaceId: marketplaceId, 
      statuses: ['INCOMPLETE']
    });
  }
  
  /**
   * Get suppressed listings
   * @param marketplaceId Marketplace ID (optional, uses default if not provided)
   * @returns Suppressed listings
   */
  public async getSuppressedListings(marketplaceId?: string): Promise<ListingSummary[]> {
    return this.getAllListings({ 
      marketplaceId: marketplaceId, 
      statuses: ['SUPPRESSED']
    });
  }
  
  /**
   * Get listings with issues
   * @param severities Issue severities to filter by (default: all severities)
   * @param marketplaceId Marketplace ID (optional, uses default if not provided)
   * @returns Listings with issues
   */
  public async getListingsWithIssues(
    severities: IssueSeverity[] = ['ERROR', 'WARNING', 'INFO'],
    marketplaceId?: string
  ): Promise<ListingSummary[]> {
    return this.getAllListings({ 
      marketplaceId: marketplaceId, 
      issueSeverities: severities
    });
  }
  
  /**
   * Update listing status
   * @param sku Seller SKU of the listing to update
   * @param status New status for the listing
   * @param marketplaceId Marketplace ID (optional, uses default if not provided)
   * @returns Update response
   */
  public async updateListingStatus(
    sku: string, 
    status: 'ACTIVE' | 'INACTIVE', 
    marketplaceId?: string
  ): Promise<boolean> {
    if (!sku) {
      throw AmazonErrorHandler.createError(
        'Seller SKU is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!status) {
      throw AmazonErrorHandler.createError(
        'Status is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Create a patch to update the status
    const patches: AttributePatch[] = [
      {
        operation: 'replace',
        path: '/status',
        value: status
      }
    ];
    
    return this.patchListing(sku, patches, marketplaceId);
  }
  
  /**
   * Get listings by ASIN
   * @param asin ASIN to search for
   * @param marketplaceId Marketplace ID (optional, uses default if not provided)
   * @returns Listings that match the ASIN
   */
  public async getListingsByAsin(asin: string, marketplaceId?: string): Promise<ListingSummary[]> {
    if (!asin) {
      throw AmazonErrorHandler.createError(
        'ASIN is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Get all listings and filter by ASIN
    const allListings = await this.getAllListings({ marketplaceId });
    
    return allListings.filter(listing => listing.asin === asin);
  }
  
  /**
   * Get listings by product type
   * @param productType Product type to filter by
   * @param marketplaceId Marketplace ID (optional, uses default if not provided)
   * @returns Listings that match the product type
   */
  public async getListingsByProductType(
    productType: string, 
    marketplaceId?: string
  ): Promise<ListingSummary[]> {
    if (!productType) {
      throw AmazonErrorHandler.createError(
        'Product type is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Get all listings and filter by product type
    const allListings = await this.getAllListings({ marketplaceId });
    
    return allListings.filter(listing => listing.productType === productType);
  }
  
  /**
   * Get listings by condition
   * @param condition Condition to filter by
   * @param marketplaceId Marketplace ID (optional, uses default if not provided)
   * @returns Listings that match the condition
   */
  public async getListingsByCondition(
    condition: string, 
    marketplaceId?: string
  ): Promise<ListingSummary[]> {
    if (!condition) {
      throw AmazonErrorHandler.createError(
        'Condition is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Get all listings and filter by condition
    const allListings = await this.getAllListings({ marketplaceId });
    
    return allListings.filter(listing => listing.condition === condition);
  }
  
  /**
   * Get listings with specific issue code
   * @param issueCode Issue code to filter by
   * @param marketplaceId Marketplace ID (optional, uses default if not provided)
   * @returns Listings that have the specified issue
   */
  public async getListingsByIssueCode(
    issueCode: string, 
    marketplaceId?: string
  ): Promise<ListingSummary[]> {
    if (!issueCode) {
      throw AmazonErrorHandler.createError(
        'Issue code is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Get all listings with issues
    const listingsWithIssues = await this.getListingsWithIssues(
      ['ERROR', 'WARNING', 'INFO'], 
      marketplaceId
    );
    
    // Filter by issue code
    return listingsWithIssues.filter(listing => 
      listing.issues?.some(issue => issue.code === issueCode)
    );
  }
}