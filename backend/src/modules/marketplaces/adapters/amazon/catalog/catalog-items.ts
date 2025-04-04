/**
 * Amazon Catalog Items API Module
 * 
 * Implements the Amazon SP-API Catalog Items API functionality.
 * This module handles product catalog information retrieval and searching.
 */

import { ApiModule } from '../core/api-module';
import { ApiRequestFunction, ApiResponse } from '../core/base-module.interface';
import { AmazonSPApi } from '../schemas/amazon.generated';
import { AmazonErrorHandler, AmazonErrorCode } from '../utils/amazon-error';

/**
 * Identifier types for catalog items
 */
export type IdentifierType = 'ASIN' | 'EAN' | 'GTIN' | 'ISBN' | 'JAN' | 'MINSAN' | 'SKU' | 'UPC';

/**
 * Sort order for search results
 */
export type SortOrder = 'ASC' | 'DESC';

/**
 * Included data fields for catalog items
 */
export type IncludedData = 
  | 'identifiers'
  | 'images'
  | 'productTypes'
  | 'salesRanks'
  | 'summaries'
  | 'variations'
  | 'vendorDetails';

/**
 * Search parameters for catalog items
 */
export interface CatalogSearchParams {
  /**
   * Keywords to search for
   */
  keywords?: string;
  
  /**
   * Marketplace ID to search in
   */
  marketplaceId?: string;
  
  /**
   * Product identifiers to search for
   */
  identifiers?: {
    /**
     * Type of identifier
     */
    identifierType: IdentifierType;
    
    /**
     * List of identifier values
     */
    identifiers: string[];
  };
  
  /**
   * Brand names to include in search
   */
  brandNames?: string[];
  
  /**
   * Classification ID to filter by
   */
  classificationId?: string;
  
  /**
   * Page token for pagination
   */
  pageToken?: string;
  
  /**
   * Maximum number of items to return per page
   */
  pageSize?: number;
  
  /**
   * Filter items by included data
   */
  includedData?: IncludedData[];
  
  /**
   * Sort order for results
   */
  sortBy?: {
    /**
     * Sort field
     */
    attribute: string;
    
    /**
     * Sort order
     */
    order: SortOrder;
  };
}

/**
 * Options for getting a catalog item
 */
export interface GetCatalogItemOptions {
  /**
   * Marketplace ID to get the item from
   */
  marketplaceId?: string;
  
  /**
   * Filter items by included data
   */
  includedData?: IncludedData[];
}

/**
 * Configuration options for the CatalogItemsModule
 */
export interface CatalogItemsModuleOptions {
  /**
   * Default included data fields to use when not specified
   */
  defaultIncludedData?: IncludedData[];
  
  /**
   * Default page size for search results
   */
  defaultPageSize?: number;
}

/**
 * Implementation of the Amazon Catalog Items API
 */
export class CatalogItemsModule extends ApiModule<CatalogItemsModuleOptions> {
  /**
   * The unique identifier for this module
   */
  readonly moduleId: string = 'catalogItems';
  
  /**
   * The human-readable name of this module
   */
  readonly moduleName: string = 'Amazon Catalog Items';
  
  /**
   * The API version this module uses
   */
  readonly apiVersion: string;
  
  /**
   * The base URL path for API requests
   */
  readonly basePath: string;
  
  /**
   * Constructor
   * @param apiVersion API version
   * @param apiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param options Module-specific options
   */
  constructor(
    apiVersion: string, 
    apiRequest: ApiRequestFunction,
    marketplaceId: string,
    options: CatalogItemsModuleOptions = {}
  ) {
    super(apiRequest, marketplaceId, options);
    this.apiVersion = apiVersion;
    this.basePath = `/catalog/${apiVersion}`;
  }
  
  /**
   * Search the catalog for items
   * @param params Search parameters
   * @returns Search results
   */
  public async searchCatalogItems(
    params: CatalogSearchParams
  ): Promise<ApiResponse<AmazonSPApi.CatalogItems.SearchCatalogResponse>> {
    const searchParams: Record<string, string> = {};
    
    // Add search parameters
    if (params.keywords) {
      searchParams.keywords = params.keywords;
    }
    
    if (params.identifiers) {
      searchParams.identifiersType = params.identifiers.identifierType;
      searchParams.identifiers = params.identifiers.identifiers.join(',');
    }
    
    if (params.brandNames && params.brandNames.length > 0) {
      searchParams.brandNames = params.brandNames.join(',');
    }
    
    if (params.classificationId) {
      searchParams.classificationIds = params.classificationId;
    }
    
    if (params.pageToken) {
      searchParams.pageToken = params.pageToken;
    }
    
    if (params.pageSize) {
      searchParams.pageSize = params.pageSize.toString();
    } else if (this.options.defaultPageSize) {
      searchParams.pageSize = this.options.defaultPageSize.toString();
    }
    
    if (params.includedData && params.includedData.length > 0) {
      searchParams.includedData = params.includedData.join(',');
    } else if (this.options.defaultIncludedData && this.options.defaultIncludedData.length > 0) {
      searchParams.includedData = this.options.defaultIncludedData.join(',');
    }
    
    if (params.sortBy) {
      searchParams.sortBy = `${params.sortBy.attribute}:${params.sortBy.order}`;
    }
    
    // Ensure we have a marketplace ID
    const marketplaceId = params.marketplaceId || this.marketplaceId;
    if (!marketplaceId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required for catalog search',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    searchParams.marketplaceIds = marketplaceId;
    
    try {
      return await this.request<AmazonSPApi.CatalogItems.SearchCatalogResponse>(
        'items',
        'GET',
        undefined,
        { params: searchParams }
      );
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.searchCatalogItems`);
    }
  }

  /**
   * Get a catalog item by ASIN
   * @param asin ASIN of the item to get
   * @param options Options for getting the item
   * @returns Catalog item
   */
  public async getCatalogItem(
    asin: string,
    options: GetCatalogItemOptions = {}
  ): Promise<ApiResponse<AmazonSPApi.CatalogItems.GetCatalogItemResponse>> {
    if (!asin) {
      throw AmazonErrorHandler.createError(
        'ASIN is required to get catalog item',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const params: Record<string, string> = {};
    
    // Add options
    if (options.includedData && options.includedData.length > 0) {
      params.includedData = options.includedData.join(',');
    } else if (this.options.defaultIncludedData && this.options.defaultIncludedData.length > 0) {
      params.includedData = this.options.defaultIncludedData.join(',');
    }
    
    // Ensure we have a marketplace ID
    const marketplaceId = options.marketplaceId || this.marketplaceId;
    if (!marketplaceId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required to get catalog item',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    params.marketplaceIds = marketplaceId;
    
    try {
      return await this.request<AmazonSPApi.CatalogItems.GetCatalogItemResponse>(
        `items/${asin}`,
        'GET',
        undefined,
        { params }
      );
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getCatalogItem`);
    }
  }

  /**
   * Get multiple catalog items by ASINs
   * @param asins ASINs of the items to get
   * @param options Options for getting the items
   * @returns Map of ASINs to catalog items
   */
  public async getCatalogItems(
    asins: string[],
    options: GetCatalogItemOptions = {}
  ): Promise<Map<string, AmazonSPApi.CatalogItems.Item>> {
    if (!asins || asins.length === 0) {
      throw AmazonErrorHandler.createError(
        'At least one ASIN is required to get catalog items',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Get each item individually (Amazon doesn't provide a batch endpoint)
    const itemPromises = asins.map(asin => 
      this.getCatalogItem(asin, options)
        .then(response => ({ asin, item: response.data.item }))
        .catch(error => {
          console.warn(`Failed to get catalog item for ASIN ${asin}:`, error);
          return { asin, item: null };
        })
    );
    
    const results = await Promise.all(itemPromises);
    
    // Build a map of ASIN to item
    const itemMap = new Map<string, AmazonSPApi.CatalogItems.Item>();
    results.forEach(result => {
      if (result.item) {
        itemMap.set(result.asin, result.item);
      }
    });
    
    return itemMap;
  }
  
  /**
   * Get a catalog item by seller SKU
   * @param sellerSku Seller SKU of the item to get
   * @param options Options for getting the item
   * @returns Catalog item
   */
  public async getCatalogItemBySku(
    sellerSku: string,
    options: GetCatalogItemOptions = {}
  ): Promise<ApiResponse<AmazonSPApi.CatalogItems.Item | null>> {
    if (!sellerSku) {
      throw AmazonErrorHandler.createError(
        'Seller SKU is required to get catalog item',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // First, search for the item by SKU
    const searchResult = await this.searchCatalogItems({
      identifiers: {
        identifierType: 'SKU',
        identifiers: [sellerSku]
      },
      marketplaceId: options.marketplaceId,
      includedData: options.includedData
    });
    
    // If we found an item, return it
    if (searchResult.data.items && searchResult.data.items.length > 0) {
      const item = searchResult.data.items[0];
      return {
        data: item,
        status: searchResult.status,
        headers: searchResult.headers
      };
    }
    
    // If we didn't find an item, return null
    return {
      data: null,
      status: searchResult.status,
      headers: searchResult.headers
    };
  }
  
  /**
   * Search catalog by keywords
   * @param keywords Keywords to search for
   * @param options Additional search options
   * @returns Search results
   */
  public async searchByKeywords(
    keywords: string,
    options: Omit<CatalogSearchParams, 'keywords'> = {}
  ): Promise<ApiResponse<AmazonSPApi.CatalogItems.SearchCatalogResponse>> {
    if (!keywords) {
      throw AmazonErrorHandler.createError(
        'Keywords are required for keyword search',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.searchCatalogItems({
      ...options,
      keywords
    });
  }
  
  /**
   * Get catalog items in a specific category (classification)
   * @param classificationId Classification ID
   * @param options Additional search options
   * @returns Search results
   */
  public async getItemsByClassification(
    classificationId: string,
    options: Omit<CatalogSearchParams, 'classificationId'> = {}
  ): Promise<ApiResponse<AmazonSPApi.CatalogItems.SearchCatalogResponse>> {
    if (!classificationId) {
      throw AmazonErrorHandler.createError(
        'Classification ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.searchCatalogItems({
      ...options,
      classificationId
    });
  }
  
  /**
   * Get all pages of search results
   * @param searchParams Initial search parameters
   * @param maxPages Maximum number of pages to retrieve (default: 10)
   * @returns All items from all pages
   */
  public async getAllSearchPages(
    searchParams: CatalogSearchParams,
    maxPages = 10
  ): Promise<AmazonSPApi.CatalogItems.Item[]> {
    let currentPage = 1;
    let nextToken: string | undefined = undefined;
    const allItems: AmazonSPApi.CatalogItems.Item[] = [];
    
    do {
      // Update search params with next token if available
      const params: CatalogSearchParams = {
        ...searchParams,
        pageToken: nextToken
      };
      
      const response = await this.searchCatalogItems(params);
      
      // Add items to our collection
      if (response.data.items && response.data.items.length > 0) {
        allItems.push(...response.data.items);
      }
      
      // Get next token for pagination
      nextToken = response.data.pagination?.nextToken;
      currentPage++;
      
      // Stop if we've reached the max pages or there are no more pages
    } while (nextToken && currentPage <= maxPages);
    
    return allItems;
  }
}