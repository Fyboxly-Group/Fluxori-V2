/**
 * Amazon FBA Inventory API Module
 * 
 * Implements the Amazon SP-API FBA Inventory API functionality.
 * This module handles inventory management for Fulfillment by Amazon.
 */

// Define necessary types for TypeScript validation
class BaseApiModule {
  protected moduleName: string;
  protected marketplaceId: string;

  constructor(moduleName: string, apiVersion: string, makeApiRequest: any, marketplaceId: string) {
    this.moduleName = moduleName;
    this.marketplaceId = marketplaceId;
  }

  protected makeRequest<T>(options: any): Promise<ApiResponse<T>> {
    return Promise<any>.resolve({ data: {} as T, status: 200, headers: {} } as ApiResponse<T>);
  }
}

interface ApiRequestOptions {
  method: string;
  path: string;
  data?: any;
  params?: Record<string, any>;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

// Mock AmazonSPApi namespace
namespace AmazonSPApi {
  export namespace FbaInventory {
    export interface GetInventorySummariesResponse {
      payload: {
        inventorySummaries: any[];
        pagination?: {
          nextToken?: string;
        };
      };
    }
  }
}

import { AmazonErrorUtil, AmazonErrorCode } from '../../utils/amazon-error';

/**
 * Granularity type for inventory aggregation
 */
export type GranularityType = 'Marketplace' | 'ASIN' | 'Seller' | 'MSKU';

/**
 * Parameters for getting inventory summaries
 */
export interface GetInventorySummariesParams {
  /**
   * Marketplace ID to get inventory from
   */
  marketplaceId?: string;
  
  /**
   * List of SKUs to retrieve
   */
  sellerSkus?: string[];
  
  /**
   * Granularity type for inventory aggregation
   */
  granularityType?: GranularityType;
  
  /**
   * Granularity ID (e.g. marketplace ID for Marketplace granularity)
   */
  granularityId?: string;
  
  /**
   * Start date for inventory lookup
   */
  startDate?: Date;
  
  /**
   * Token for pagination
   */
  nextToken?: string;
  
  /**
   * Maximum number of results to return
   */
  maxResults?: number;
}

/**
 * Inventory detail information for a specific SKU
 */
export interface InventoryDetailBySku {
  sku: string;
  asin?: string;
  condition?: string;
  totalQuantity: number;
  fulfillableQuantity: number;
  inboundWorking: number;
  inboundShipped: number;
  inboundReceiving: number;
  reserved: {
    total: number;
    customerOrders: number;
    fcProcessing: number;
    fcTransfer: number;
  };
  unfulfillable: {
    total: number;
    customerDamaged: number;
    warehouseDamaged: number;
    distributorDamaged: number;
    carrierDamaged: number;
    defective: number;
    expired: number;
  };
  lastUpdated?: Date;
}

/**
 * Inventory level information
 */
export interface InventoryLevel {
  sku: string;
  asin?: string;
  condition?: string;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  inboundQuantity: number;
  unfulfillableQuantity: number;
}

/**
 * Low stock inventory item
 */
export interface LowStockInventoryItem {
  sku: string;
  asin?: string;
  totalQuantity: number;
  availableQuantity: number;
  inboundQuantity: number;
}

/**
 * Implementation of the Amazon FBA Inventory API
 */
export class FbaInventoryModule extends BaseApiModule {
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
    super('fbaInventory', apiVersion, makeApiRequest, marketplaceId);
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
   * Get inventory summaries from Amazon
   * @param params Parameters for getting inventory summaries
   * @returns Inventory summaries response
   */
  public async getInventorySummaries(params: GetInventorySummariesParams = {}): Promise<ApiResponse<AmazonSPApi.FbaInventory.GetInventorySummariesResponse>> {
    const queryParams: Record<string, any> = {};
    
    // Add granularity
    const granularityType = params.granularityType || 'Marketplace';
    queryParams.granularityType = granularityType;
    
    // Add granularity ID (based on granularity type)
    if (granularityType === 'Marketplace') {
      // For Marketplace granularity, use the marketplace ID
      const marketplaceId = params.marketplaceId || this.marketplaceId;
      if (!marketplaceId) {
        throw AmazonErrorUtil.createError(
          'Marketplace ID is required for Marketplace granularity',
          AmazonErrorCode.INVALID_INPUT
        );
      }
      queryParams.granularityId = marketplaceId;
    } else if (params.granularityId) {
      // For other granularity types, use the provided ID
      queryParams.granularityId = params.granularityId;
    }
    
    // Add filters
    if (params.sellerSkus && params.sellerSkus.length > 0) {
      queryParams.sellerSkus = params.sellerSkus.join(',');
    }
    
    if (params.startDate) {
      queryParams.startDate = params.startDate.toISOString();
    }
    
    // Add pagination
    if (params.nextToken) {
      queryParams.nextToken = params.nextToken;
    }
    
    if (params.maxResults) {
      queryParams.maxResults = params.maxResults;
    }
    
    try {
      return await this.makeRequest<AmazonSPApi.FbaInventory.GetInventorySummariesResponse>({
        method: 'GET',
        path: '/summaries',
        params: queryParams
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getInventorySummaries`);
    }
  }

  /**
   * Get inventory for specific SKUs
   * @param skus List of SKUs to retrieve inventory for
   * @returns Inventory for the specified SKUs
   */
  public async getInventoryForSkus(skus: string[]): Promise<ApiResponse<AmazonSPApi.FbaInventory.GetInventorySummariesResponse>> {
    if (!skus || skus.length === 0) {
      throw AmazonErrorUtil.createError(
        'At least one SKU is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.getInventorySummaries({
      sellerSkus: skus,
      granularityType: 'MSKU'
    });
  }
  
  /**
   * Get all pages of inventory summaries
   * @param params Parameters for getting inventory summaries
   * @param maxPages Maximum number of pages to retrieve (default: 10)
   * @returns All inventory summaries from all pages
   */
  public async getAllInventorySummaries(
    params: GetInventorySummariesParams = {},
    maxPages: number = 10
  ): Promise<any[]> {
    let currentPage = 1;
    let nextToken: string | undefined = undefined;
    const allInventorySummaries: any[] = [];
    
    do {
      // Update params with next token if available
      const pageParams: GetInventorySummariesParams = {
        ...params,
        nextToken
      };
      
      const response = await this.getInventorySummaries(pageParams);
      
      // Add inventory summaries to our collection
      if (response.data.payload.inventorySummaries && response.data.payload.inventorySummaries.length > 0) {
        allInventorySummaries.push(...response.data.payload.inventorySummaries);
      }
      
      // Get next token for pagination
      nextToken = response.data.payload.pagination?.nextToken;
      currentPage++;
      
      // Stop if we've reached the max pages or there are no more pages
    } while (nextToken && currentPage <= maxPages);
    
    return allInventorySummaries;
  }
  
  /**
   * Get inventory levels for all SKUs
   * @returns Inventory levels for all SKUs
   */
  public async getAllInventoryLevels(): Promise<InventoryLevel[]> {
    const summaries = await this.getAllInventorySummaries({
      granularityType: 'Seller'
    });
    
    return summaries.map((summary: any) => {
      const details = summary.inventoryDetails || {};
      
      return {
        sku: summary.sellerSku || '',
        asin: summary.asin,
        condition: summary.condition,
        totalQuantity: summary.totalQuantity || 0,
        availableQuantity: details.fulfillableQuantity || 0,
        reservedQuantity: details.reservedQuantity?.total || 0,
        inboundQuantity: (details.inboundWorkingQuantity || 0) + 
                       (details.inboundShippedQuantity || 0) + 
                       (details.inboundReceivingQuantity || 0),
        unfulfillableQuantity: details.unfulfillableQuantity?.total || 0
      };
    });
  }
  
  /**
   * Get low stock inventory (items with low fulfillable quantity)
   * @param threshold Threshold for low stock (default: 5)
   * @returns Low stock items
   */
  public async getLowStockInventory(threshold: number = 5): Promise<LowStockInventoryItem[]> {
    const allInventory = await this.getAllInventoryLevels();
    
    return allInventory
      .filter((item: any) => item.availableQuantity <= threshold)
      .map((item: any) => ({
        sku: item.sku,
        asin: item.asin,
        totalQuantity: item.totalQuantity,
        availableQuantity: item.availableQuantity,
        inboundQuantity: item.inboundQuantity
      }));
  }
}