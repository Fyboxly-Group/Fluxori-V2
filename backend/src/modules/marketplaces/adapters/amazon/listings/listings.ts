/**
 * Amazon Listings API Module
 * 
 * Implements the Amazon SP-API Listings API functionality.
 * This module handles product listings management.
 */

import { BaseApiModule, ApiRequestOptions, ApiResponse } from '../core/api-module';
import { AmazonSPApi } from '../schemas/amazon.generated';
import { AmazonErrorUtil, AmazonErrorCode } from '../utils/amazon-error';

/**
 * Listing status values
 */
export type ListingStatus = 
  | 'ACTIVE'
  | 'INACTIVE'
  | 'INCOMPLETE'
  | 'DELETED'
  | 'SUPPRESSED';

/**
 * Listing issue severity
 */
export type IssueSeverity = 'ERROR' | 'WARNING' | 'INFO';

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
 * Implementation of the Amazon Listings API
 */
export class ListingsModule extends BaseApiModule {
  /**
   * Constructor
   * @param apiVersion API version
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   */
  constructor(
    apiVersion: string,
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string
  ) {
    super('listingsItems', apiVersion, makeApiRequest, marketplaceId);
  }
  
  /**
   * Initialize the module
   * @param config Module-specific configuration
   * @returns Promise<any> that resolves when initialization is complete
   */
  protected async initializeModule(config?: any): Promise<void> {
    // No specific initialization required for this module
    return Promise<any>.resolve();
  }
  
  /**
   * Get listings from Amazon
   * @param params Parameters for getting listings
   * @returns Listings response
   */
  public async getListings(
    params: GetListingsParams = {}
  ): Promise<ApiResponse<AmazonSPApi.Listings.GetListingsResponse>> {
    const queryParams: Record<string, any> = {};
    
    // Ensure we have a marketplace ID
    const marketplaceId = params.marketplaceId || this.marketplaceId;
    if (!marketplaceId) {
      throw AmazonErrorUtil.createError(
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
    }
    
    try {
      return await this.makeRequest<AmazonSPApi.Listings.GetListingsResponse>({
        method: 'GET',
        path: '/items',
        params: queryParams
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.getListings`
      );
    }
  }
  
  /**
   * Get a listing by seller SKU
   * @param sku Seller SKU to get
   * @param marketplaceId Marketplace ID (optional, uses default if not provided)
   * @returns Listing
   */
  public async getListingBySku(
    sku: string,
    marketplaceId?: string
  ): Promise<ApiResponse<AmazonSPApi.Listings.Listing>> {
    if (!sku) {
      throw AmazonErrorUtil.createError(
        'Seller SKU is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Ensure we have a marketplace ID
    marketplaceId = marketplaceId || this.marketplaceId;
    if (!marketplaceId) {
      throw AmazonErrorUtil.createError(
        'Marketplace ID is required for getting a listing',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<AmazonSPApi.Listings.Listing>({
        method: 'GET',
        path: `/items/${sku}`,
        params: {
          marketplaceIds: marketplaceId
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.getListingBySku`
      );
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
  ): Promise<ApiResponse<any>> {
    if (!sku) {
      throw AmazonErrorUtil.createError(
        'Seller SKU is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!attributes || Object.keys(attributes).length === 0) {
      throw AmazonErrorUtil.createError(
        'Listing attributes are required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Ensure we have a marketplace ID
    marketplaceId = marketplaceId || this.marketplaceId;
    if (!marketplaceId) {
      throw AmazonErrorUtil.createError(
        'Marketplace ID is required for updating a listing',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<any>({
        method: 'PUT',
        path: `/items/${sku}`,
        params: {
          marketplaceIds: marketplaceId
        },
        data: {
          attributes: attributes
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.updateListing`
      );
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
  ): Promise<ApiResponse<any>> {
    if (!sku) {
      throw AmazonErrorUtil.createError(
        'Seller SKU is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!patches || patches.length === 0) {
      throw AmazonErrorUtil.createError(
        'Listing patches are required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Ensure we have a marketplace ID
    marketplaceId = marketplaceId || this.marketplaceId;
    if (!marketplaceId) {
      throw AmazonErrorUtil.createError(
        'Marketplace ID is required for patching a listing',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<any>({
        method: 'PATCH',
        path: `/items/${sku}`,
        params: {
          marketplaceIds: marketplaceId
        },
        data: patches
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.patchListing`
      );
    }
  }
  
  /**
   * Delete a listing
   * @param sku Seller SKU of the listing to delete
   * @param marketplaceId Marketplace ID (optional, uses default if not provided)
   * @returns Delete response
   */
  public async deleteListing(
    sku: string,
    marketplaceId?: string
  ): Promise<ApiResponse<any>> {
    if (!sku) {
      throw AmazonErrorUtil.createError(
        'Seller SKU is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Ensure we have a marketplace ID
    marketplaceId = marketplaceId || this.marketplaceId;
    if (!marketplaceId) {
      throw AmazonErrorUtil.createError(
        'Marketplace ID is required for deleting a listing',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<any>({
        method: 'DELETE',
        path: `/items/${sku}`,
        params: {
          marketplaceIds: marketplaceId
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.deleteListing`
      );
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
  ): Promise<ApiResponse<any>> {
    if (!sku) {
      throw AmazonErrorUtil.createError(
        'Seller SKU is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!attributes || Object.keys(attributes).length === 0) {
      throw AmazonErrorUtil.createError(
        'Listing attributes are required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Ensure we have a marketplace ID
    marketplaceId = marketplaceId || this.marketplaceId;
    if (!marketplaceId) {
      throw AmazonErrorUtil.createError(
        'Marketplace ID is required for creating a listing',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<any>({
        method: 'PUT',
        path: `/items/${sku}`,
        params: {
          marketplaceIds: marketplaceId
        },
        data: {
          attributes: attributes
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.createListing`
      );
    }
  }
  
  /**
   * Get all listings (handles pagination)
   * @param params Parameters for getting listings
   * @param maxPages Maximum number of pages to retrieve (default: 10)
   * @returns All listings that match the parameters
   */
  public async getAllListings(
    params: GetListingsParams = {},
    maxPages: number = 10
  ): Promise<AmazonSPApi.Listings.Listing[]> {
    let currentPage = 1;
    let nextToken: string | undefined = undefined;
    const allListings: AmazonSPApi.Listings.Listing[] = [];
    
    do {
      // Update params with next token if available
      const pageParams: GetListingsParams = {
        ...params,
        nextToken
      };
      
      const response = await this.getListings(pageParams);
      
      // Add listings to our collection
      if (response.data.listings && response.data.listings.length > 0) {
        allListings.push(...response.data.listings);
      }
      
      // Get next token for pagination
      nextToken = response.data.pagination?.nextToken;
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
  public async getActiveListings(
    marketplaceId?: string
  ): Promise<AmazonSPApi.Listings.Listing[]> {
    return this.getAllListings({
      marketplaceId,
      statuses: ['ACTIVE']
    });
  }
  
  /**
   * Get inactive listings
   * @param marketplaceId Marketplace ID (optional, uses default if not provided)
   * @returns Inactive listings
   */
  public async getInactiveListings(
    marketplaceId?: string
  ): Promise<AmazonSPApi.Listings.Listing[]> {
    return this.getAllListings({
      marketplaceId,
      statuses: ['INACTIVE']
    });
  }
  
  /**
   * Get incomplete listings
   * @param marketplaceId Marketplace ID (optional, uses default if not provided)
   * @returns Incomplete listings
   */
  public async getIncompleteListings(
    marketplaceId?: string
  ): Promise<AmazonSPApi.Listings.Listing[]> {
    return this.getAllListings({
      marketplaceId,
      statuses: ['INCOMPLETE']
    });
  }
  
  /**
   * Get suppressed listings
   * @param marketplaceId Marketplace ID (optional, uses default if not provided)
   * @returns Suppressed listings
   */
  public async getSuppressedListings(
    marketplaceId?: string
  ): Promise<AmazonSPApi.Listings.Listing[]> {
    return this.getAllListings({
      marketplaceId,
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
  ): Promise<AmazonSPApi.Listings.Listing[]> {
    return this.getAllListings({
      marketplaceId,
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
  ): Promise<ApiResponse<any>> {
    if (!sku) {
      throw AmazonErrorUtil.createError(
        'Seller SKU is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!status) {
      throw AmazonErrorUtil.createError(
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
}