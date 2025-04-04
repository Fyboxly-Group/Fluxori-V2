/**
 * Amazon Supply Sources API Module
 * 
 * Implements the Amazon SP-API Supply Sources API functionality.
 * This module allows sellers to manage their supply sources for inventory.
 */

import { BaseApiModule, ApiRequestOptions, ApiResponse } from '../core/api-module';
import { AmazonErrorUtil, AmazonErrorCode } from '../utils/amazon-error';
import { AmazonSPApi } from '../schemas/amazon.generated';

/**
 * Supply source type
 */
export type SupplySourceType = AmazonSPApi.SupplySources.SupplySourceType;

/**
 * Supply source address
 */
export type SupplySourceAddress = AmazonSPApi.SupplySources.SupplySourceAddress;

/**
 * Supply source contact
 */
export type SupplySourceContact = AmazonSPApi.SupplySources.SupplySourceContact;

/**
 * Options for creating or updating a supply source
 */
export type SupplySourceOptions = AmazonSPApi.SupplySources.SupplySourceOptions;

/**
 * Item supplier relationship
 */
export type ItemSupplierRelationship = AmazonSPApi.SupplySources.ItemSupplierRelationship;

/**
 * Options for getting supply sources
 */
export interface GetSupplySourcesOptions {
  /**
   * Supply source IDs to filter by
   */
  supplySourceIds?: string[];
  
  /**
   * Next token for pagination
   */
  nextToken?: string;
}

/**
 * Supply source data
 */
export type SupplySource = AmazonSPApi.SupplySources.SupplySource;

/**
 * Response for getting supply sources
 */
export type GetSupplySourcesResponse = AmazonSPApi.SupplySources.GetSupplySourcesResponse;

/**
 * Options for getting item supplier relationships
 */
export interface GetItemSupplierRelationshipsOptions {
  /**
   * List of ASINs to filter by
   */
  asins?: string[];
  
  /**
   * List of seller SKUs to filter by
   */
  sellerSkus?: string[];
  
  /**
   * List of supply source IDs to filter by
   */
  supplySourceIds?: string[];
  
  /**
   * Next token for pagination
   */
  nextToken?: string;
}

/**
 * Response for getting item supplier relationships
 */
export type GetItemSupplierRelationshipsResponse = AmazonSPApi.SupplySources.GetItemSupplierRelationshipsResponse;

/**
 * Implementation of the Amazon Supply Sources API
 */
export class SupplySourceModule extends BaseApiModule {
  /**
   * Constructor
   * @param apiVersion API version
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   */
  constructor(
    apiVersion: string,
    makeApiRequest: ApiRequestFunction,
    marketplaceId: string
  ) {
    super('supplySource', apiVersion, makeApiRequest, marketplaceId);
  }
  
  /**
   * Initialize the module
   * @param config Module-specific configuration
   * @returns Promise that resolves when initialization is complete
   */
  protected async initializeModule(config?: any): Promise<void> {
    // No specific initialization required for this module
    return Promise.resolve();
  }
  
  /**
   * Create a new supply source
   * @param options Supply source options
   * @returns Created supply source
   */
  public async createSupplySource(options: SupplySourceOptions): Promise<ApiResponse<AmazonSPApi.SupplySources.CreateSupplySourceResponse>> {
    if (!options.name) {
      throw AmazonErrorUtil.createError('Supply source name is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    if (!options.type) {
      throw AmazonErrorUtil.createError('Supply source type is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    if (!options.address) {
      throw AmazonErrorUtil.createError('Supply source address is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    if (!options.primaryContact) {
      throw AmazonErrorUtil.createError('Supply source primary contact is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    try {
      return await this.makeRequest<AmazonSPApi.SupplySources.CreateSupplySourceResponse>({
        method: 'POST',
        path: '/supplySources',
        data: {
          name: options.name,
          type: options.type,
          address: options.address,
          primaryContact: options.primaryContact,
          secondaryContact: options.secondaryContact,
          isDefault: options.isDefault,
          attributes: options.attributes
        }
      });
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.createSupplySource`);
    }
  }
  
  /**
   * Get supply sources
   * @param options Options for getting supply sources
   * @returns List of supply sources
   */
  public async getSupplySources(options: GetSupplySourcesOptions = {}): Promise<ApiResponse<GetSupplySourcesResponse>> {
    const params: Record<string, any> = {};
    
    if (options.supplySourceIds && options.supplySourceIds.length > 0) {
      params.supplySourceIds = options.supplySourceIds.join(',');
    }
    
    if (options.nextToken) {
      params.nextToken = options.nextToken;
    }
    
    try {
      return await this.makeRequest<GetSupplySourcesResponse>({
        method: 'GET',
        path: '/supplySources',
        params
      });
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getSupplySources`);
    }
  }
  
  /**
   * Get a specific supply source by ID
   * @param supplySourceId Supply source ID
   * @returns Supply source
   */
  public async getSupplySource(supplySourceId: string): Promise<ApiResponse<SupplySource>> {
    if (!supplySourceId) {
      throw AmazonErrorUtil.createError('Supply source ID is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    try {
      return await this.makeRequest<SupplySource>({
        method: 'GET',
        path: `/supplySources/${supplySourceId}`
      });
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getSupplySource`);
    }
  }
  
  /**
   * Update a supply source
   * @param supplySourceId Supply source ID
   * @param options Supply source options
   * @returns Updated supply source
   */
  public async updateSupplySource(supplySourceId: string, options: Partial<SupplySourceOptions>): Promise<ApiResponse<SupplySource>> {
    if (!supplySourceId) {
      throw AmazonErrorUtil.createError('Supply source ID is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    try {
      return await this.makeRequest<SupplySource>({
        method: 'PATCH',
        path: `/supplySources/${supplySourceId}`,
        data: {
          name: options.name,
          type: options.type,
          address: options.address,
          primaryContact: options.primaryContact,
          secondaryContact: options.secondaryContact,
          isDefault: options.isDefault,
          attributes: options.attributes
        }
      });
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.updateSupplySource`);
    }
  }
  
  /**
   * Delete a supply source
   * @param supplySourceId Supply source ID
   * @returns Empty response
   */
  public async deleteSupplySource(supplySourceId: string): Promise<ApiResponse<void>> {
    if (!supplySourceId) {
      throw AmazonErrorUtil.createError('Supply source ID is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    try {
      return await this.makeRequest<void>({
        method: 'DELETE',
        path: `/supplySources/${supplySourceId}`
      });
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.deleteSupplySource`);
    }
  }
  
  /**
   * Create an item supplier relationship
   * @param relationship Item supplier relationship
   * @returns Created relationship ID
   */
  public async createItemSupplierRelationship(relationship: ItemSupplierRelationship): Promise<ApiResponse<AmazonSPApi.SupplySources.CreateItemSupplierRelationshipResponse>> {
    if (!relationship.supplySourceId) {
      throw AmazonErrorUtil.createError('Supply source ID is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    if (!relationship.asin && !relationship.sellerSku) {
      throw AmazonErrorUtil.createError('Either ASIN or seller SKU is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    try {
      return await this.makeRequest<AmazonSPApi.SupplySources.CreateItemSupplierRelationshipResponse>({
        method: 'POST',
        path: '/itemSupplierRelationships',
        data: relationship
      });
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.createItemSupplierRelationship`);
    }
  }
  
  /**
   * Get item supplier relationships
   * @param options Options for getting item supplier relationships
   * @returns List of item supplier relationships
   */
  public async getItemSupplierRelationships(options: GetItemSupplierRelationshipsOptions = {}): Promise<ApiResponse<GetItemSupplierRelationshipsResponse>> {
    const params: Record<string, any> = {};
    
    if (options.asins && options.asins.length > 0) {
      params.asins = options.asins.join(',');
    }
    
    if (options.sellerSkus && options.sellerSkus.length > 0) {
      params.sellerSkus = options.sellerSkus.join(',');
    }
    
    if (options.supplySourceIds && options.supplySourceIds.length > 0) {
      params.supplySourceIds = options.supplySourceIds.join(',');
    }
    
    if (options.nextToken) {
      params.nextToken = options.nextToken;
    }
    
    try {
      return await this.makeRequest<GetItemSupplierRelationshipsResponse>({
        method: 'GET',
        path: '/itemSupplierRelationships',
        params
      });
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getItemSupplierRelationships`);
    }
  }
  
  /**
   * Delete an item supplier relationship
   * @param relationshipId Item supplier relationship ID
   * @returns Empty response
   */
  public async deleteItemSupplierRelationship(relationshipId: string): Promise<ApiResponse<void>> {
    if (!relationshipId) {
      throw AmazonErrorUtil.createError('Item supplier relationship ID is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    try {
      return await this.makeRequest<void>({
        method: 'DELETE',
        path: `/itemSupplierRelationships/${relationshipId}`
      });
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.deleteItemSupplierRelationship`);
    }
  }
  
  /**
   * Get all supply sources (handles pagination)
   * @param options Options for getting supply sources
   * @param maxPages Maximum number of pages to retrieve (default: 10)
   * @returns All supply sources
   */
  public async getAllSupplySources(options: GetSupplySourcesOptions = {}, maxPages = 10): Promise<SupplySource[]> {
    const allSupplySources: SupplySource[] = [];
    let nextToken: string | undefined = options.nextToken;
    let currentPage = 1;
    
    do {
      // Update options with next token
      const pageOptions: GetSupplySourcesOptions = {
        ...options,
        nextToken
      };
      
      // Get the current page of supply sources
      const response = await this.getSupplySources(pageOptions);
      
      // Add supply sources to our collection
      if (response.data.supplySources && response.data.supplySources.length > 0) {
        allSupplySources.push(...response.data.supplySources);
      }
      
      // Update the next token
      nextToken = response.data.nextToken;
      currentPage++;
      
      // Stop if we've reached the maximum number of pages or there are no more pages
    } while (nextToken && currentPage <= maxPages);
    
    return allSupplySources;
  }
  
  /**
   * Get all item supplier relationships (handles pagination)
   * @param options Options for getting item supplier relationships
   * @param maxPages Maximum number of pages to retrieve (default: 10)
   * @returns All item supplier relationships
   */
  public async getAllItemSupplierRelationships(options: GetItemSupplierRelationshipsOptions = {}, maxPages = 10): Promise<ItemSupplierRelationship[]> {
    const allRelationships: ItemSupplierRelationship[] = [];
    let nextToken: string | undefined = options.nextToken;
    let currentPage = 1;
    
    do {
      // Update options with next token
      const pageOptions: GetItemSupplierRelationshipsOptions = {
        ...options,
        nextToken
      };
      
      // Get the current page of relationships
      const response = await this.getItemSupplierRelationships(pageOptions);
      
      // Add relationships to our collection
      if (response.data.itemSupplierRelationships && response.data.itemSupplierRelationships.length > 0) {
        allRelationships.push(...response.data.itemSupplierRelationships);
      }
      
      // Update the next token
      nextToken = response.data.nextToken;
      currentPage++;
      
      // Stop if we've reached the maximum number of pages or there are no more pages
    } while (nextToken && currentPage <= maxPages);
    
    return allRelationships;
  }
  
  /**
   * Get supply sources for a specific item by ASIN
   * @param asin ASIN of the item
   * @returns Supply sources for the item
   */
  public async getSupplySourcesForAsin(asin: string): Promise<SupplySource[]> {
    if (!asin) {
      throw AmazonErrorUtil.createError('ASIN is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    // Get all relationships for this ASIN
    const relationships = await this.getAllItemSupplierRelationships({
      asins: [asin]
    });
    
    if (relationships.length === 0) {
      return [];
    }
    
    // Extract unique supply source IDs
    const supplySourceIdsSet = new Set<string>();
    relationships.forEach(rel => supplySourceIdsSet.add(rel.supplySourceId));
    const supplySourceIds = Array.from(supplySourceIdsSet);
    
    // Get detailed information for each supply source
    const supplySources = await this.getAllSupplySources({ 
      supplySourceIds
    });
    
    return supplySources;
  }
  
  /**
   * Get supply sources for a specific item by SKU
   * @param sku SKU of the item
   * @returns Supply sources for the item
   */
  public async getSupplySourcesForSku(sku: string): Promise<SupplySource[]> {
    if (!sku) {
      throw AmazonErrorUtil.createError('SKU is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    // Get all relationships for this SKU
    const relationships = await this.getAllItemSupplierRelationships({
      sellerSkus: [sku]
    });
    
    if (relationships.length === 0) {
      return [];
    }
    
    // Extract unique supply source IDs
    const supplySourceIdsSet = new Set<string>();
    relationships.forEach(rel => supplySourceIdsSet.add(rel.supplySourceId));
    const supplySourceIds = Array.from(supplySourceIdsSet);
    
    // Get detailed information for each supply source
    const supplySources = await this.getAllSupplySources({ 
      supplySourceIds
    });
    
    return supplySources;
  }
}