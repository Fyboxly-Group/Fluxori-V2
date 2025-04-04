/**
 * Amazon FBA Inventory API Module
 * 
 * Implements the Amazon SP-API FBA Inventory API functionality.
 * This module provides operations for retrieving information about inventory in
 * Amazon's fulfillment network.
 */

import { ApiModule } from '../../core/api-module';
import { ApiRequestFunction, ApiResponse } from '../../core/base-module.interface';
import AmazonErrorHandler, { AmazonErrorCode } from '../../utils/amazon-error';

/**
 * FBA inventory summary condition types
 */
export type ConditionType = 'SELLER_DAMAGED' | 'WAREHOUSE_DAMAGED' | 'DISTRIBUTOR_DAMAGED' | 
  'CUSTOMER_DAMAGED' | 'USED_LIKE_NEW' | 'USED_VERY_GOOD' | 'USED_GOOD' | 'USED_ACCEPTABLE' | 
  'COLLECTIBLE_LIKE_NEW' | 'COLLECTIBLE_VERY_GOOD' | 'COLLECTIBLE_GOOD' | 'COLLECTIBLE_ACCEPTABLE' | 
  'NEW' | 'OPEN_BOX' | 'DEFECTIVE' | 'CLUB';

/**
 * FBA inventory classification types
 */
export type ClassificationType = 'WORKING' | 'NOT_WORKING' | 'EDIBLE' | 'EXPIRED' | 'FLUID_DAMAGED';

/**
 * FBA inventory detail granularity types
 */
export type GranularityType = 'Marketplace' | 'GlobalInventory';

/**
 * FBA inventory filter options for get inventory summary
 */
export interface InventorySummaryFilters {
  /**
   * Granularity of inventory summary data
   */
  granularityType?: GranularityType;
  
  /**
   * Granularity identifier (marketplace ID)
   */
  granularityId?: string;
}

/**
 * FBA inventory query parameters for get inventory
 */
export interface InventoryQueryParams {
  /**
   * List of SKUs to query
   */
  sellerSkus?: string[];
  
  /**
   * List of ASINs to query
   */
  asinList?: string[];
  
  /**
   * Start date for inventory query
   */
  startDateTime?: string;
  
  /**
   * Details level ('All' or 'Basic')
   */
  detailsLevel?: 'All' | 'Basic';
  
  /**
   * Marketplace ID to filter by
   */
  marketplaceIds?: string[];
  
  /**
   * Maximum number of items per page
   */
  maxResultsPerPage?: number;
  
  /**
   * Next token for pagination
   */
  nextToken?: string;
}

/**
 * Inventory summary response item
 */
export interface InventorySummaryItem {
  /**
   * Marketplace ID
   */
  marketplaceId?: string;
  
  /**
   * FNSKU identifier
   */
  fnSku?: string;
  
  /**
   * ASIN identifier
   */
  asin?: string;
  
  /**
   * Product name
   */
  productName?: string;
  
  /**
   * Condition of the product
   */
  condition?: ConditionType;
  
  /**
   * Sales condition of the inventory
   */
  salesChannel?: string;
  
  /**
   * Total units
   */
  totalUnits?: number;
  
  /**
   * Units in inbound shipments
   */
  inboundShippedUnits?: number;
  
  /**
   * Units being received by Amazon
   */
  inboundReceivingUnits?: number;
  
  /**
   * Units in fulfillable inventory
   */
  fulfillableUnits?: number;
  
  /**
   * Units in unfulfillable inventory
   */
  unfulfillableUnits?: number;
  
  /**
   * Units with customer reservations
   */
  reservedUnits?: number;
  
  /**
   * Units pending removal
   */
  pendingRemovalUnits?: number;
  
  /**
   * Research status
   */
  researchingUnits?: {
    /**
     * Units in FC processing
     */
    fcProcessingUnits?: number;
    
    /**
     * Units in FC transfer
     */
    fcTransferUnits?: number;
    
    /**
     * Units in FC research
     */
    fcResearchUnits?: number;
  };
}

/**
 * Inventory summary response
 */
export interface InventorySummaryResponse {
  /**
   * Response payload
   */
  payload: {
    /**
     * List of inventory summaries
     */
    inventorySummaries: InventorySummaryItem[];
    
    /**
     * Next token for pagination
     */
    nextToken?: string;
    
    /**
     * Granularity type
     */
    granularity?: {
      /**
       * Type of granularity
       */
      granularityType: GranularityType;
      
      /**
       * Granularity ID
       */
      granularityId: string;
    };
  };
}

/**
 * Inventory details
 */
export interface InventoryDetails {
  /**
   * Quantity for a specific condition
   */
  quantity?: number;
  
  /**
   * Fulfillable quantity
   */
  fulfillableQuantity?: number;
  
  /**
   * Unfulfillable quantity
   */
  unfulfillableQuantity?: number;
  
  /**
   * Inbound working quantity
   */
  inboundWorkingQuantity?: number;
  
  /**
   * Inbound shipped quantity
   */
  inboundShippedQuantity?: number;
  
  /**
   * Inbound received quantity
   */
  inboundReceivedQuantity?: number;
  
  /**
   * Reserved quantity information
   */
  reservedQuantity?: {
    /**
     * Total reserved
     */
    totalReservedQuantity?: number;
    
    /**
     * Pending customer order quantity
     */
    pendingCustomerOrderQuantity?: number;
    
    /**
     * Pending transshipment quantity
     */
    pendingTransshipmentQuantity?: number;
    
    /**
     * FC processing quantity
     */
    fcProcessingQuantity?: number;
  };
}

/**
 * FBA inventory item
 */
export interface InventoryItem {
  /**
   * Seller SKU
   */
  sellerSku: string;
  
  /**
   * FNSKU identifier
   */
  fnSku?: string;
  
  /**
   * ASIN identifier
   */
  asin?: string;
  
  /**
   * Product name
   */
  productName?: string;
  
  /**
   * Item condition
   */
  condition?: ConditionType;
  
  /**
   * Item inventory details by condition type
   */
  inventoryDetails?: Record<ConditionType, InventoryDetails>;
  
  /**
   * Last updated timestamp
   */
  lastUpdatedTime?: string;
  
  /**
   * Product details
   */
  productDetails?: {
    /**
     * List of dimensions
     */
    dimensions?: {
      /**
       * Height
       */
      height?: {
        /**
         * Value
         */
        value?: number;
        
        /**
         * Unit
         */
        unit?: string;
      };
      
      /**
       * Length
       */
      length?: {
        /**
         * Value
         */
        value?: number;
        
        /**
         * Unit
         */
        unit?: string;
      };
      
      /**
       * Width
       */
      width?: {
        /**
         * Value
         */
        value?: number;
        
        /**
         * Unit
         */
        unit?: string;
      };
      
      /**
       * Weight
       */
      weight?: {
        /**
         * Value
         */
        value?: number;
        
        /**
         * Unit
         */
        unit?: string;
      };
    };
  };
}

/**
 * Inventory response data
 */
export interface InventoryResponse {
  /**
   * Response payload
   */
  payload: {
    /**
     * List of inventory items
     */
    inventory: InventoryItem[];
    
    /**
     * Pagination token
     */
    nextToken?: string;
    
    /**
     * List of marketplace IDs
     */
    marketplaceIds?: string[];
  };
}

/**
 * Interface for FBA inventory module options
 */
export interface FBAInventoryModuleOptions {
  // Optional configuration specific to FBA inventory module
}

/**
 * Implementation of the Amazon FBA Inventory API
 */
export class FBAInventoryModule extends ApiModule<FBAInventoryModuleOptions> {
  /**
   * The unique identifier for this module
   */
  readonly moduleId: string = 'fbaInventory';
  
  /**
   * The human-readable name of this module
   */
  readonly moduleName: string = 'FBA Inventory';
  
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
    options: FBAInventoryModuleOptions = {}
  ) {
    super(apiRequest, marketplaceId, options);
    this.apiVersion = apiVersion;
    this.basePath = `/fba/inventory/${apiVersion}`;
  }
  
  /**
   * Get inventory summary
   * @param filters Optional filters for inventory summary
   * @returns Inventory summary response
   */
  public async getInventorySummary(
    filters?: InventorySummaryFilters
  ): Promise<ApiResponse<InventorySummaryResponse>> {
    try {
      // Build query parameters
      const queryParams: Record<string, any> = {};
      
      if (filters?.granularityType) {
        queryParams.granularityType = filters.granularityType;
      }
      
      if (filters?.granularityId) {
        queryParams.granularityId = filters.granularityId;
      }
      
      // Make the API request
      return await this.request<InventorySummaryResponse>(
        'summaries',
        'GET',
        queryParams
      );
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getInventorySummary`);
    }
  }
  
  /**
   * Get detailed inventory for specified SKUs or ASINs
   * @param params Query parameters for inventory details
   * @returns Detailed inventory information
   */
  public async getInventory(params?: InventoryQueryParams): Promise<ApiResponse<InventoryResponse>> {
    try {
      // Build query parameters
      const queryParams: Record<string, any> = {};
      
      // Add marketplace IDs (default to the module's marketplace ID if not provided)
      const marketplaceIds = params?.marketplaceIds || [this.marketplaceId];
      queryParams.marketplaceIds = marketplaceIds;
      
      // Add optional parameters
      if (params?.detailsLevel) {
        queryParams.details = params.detailsLevel;
      }
      
      if (params?.startDateTime) {
        queryParams.startDateTime = params.startDateTime;
      }
      
      if (params?.sellerSkus && params.sellerSkus.length > 0) {
        queryParams.sellerSkus = params.sellerSkus;
      }
      
      if (params?.asinList && params.asinList.length > 0) {
        queryParams.asinList = params.asinList;
      }
      
      if (params?.maxResultsPerPage) {
        queryParams.maxResultsPerPage = params.maxResultsPerPage;
      }
      
      if (params?.nextToken) {
        queryParams.nextToken = params.nextToken;
      }
      
      // Make the API request
      return await this.request<InventoryResponse>(
        'inventory',
        'GET',
        queryParams
      );
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getInventory`);
    }
  }
  
  /**
   * Get inventory for a specific SKU
   * @param sku Seller SKU to query
   * @param marketplaceIds Optional list of marketplace IDs
   * @returns Inventory information for the specified SKU
   */
  public async getInventoryBySku(
    sku: string,
    marketplaceIds?: string[]
  ): Promise<InventoryItem | null> {
    if (!sku) {
      throw AmazonErrorHandler.createError(
        'SKU is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.getInventory({
        sellerSkus: [sku],
        marketplaceIds: marketplaceIds || [this.marketplaceId],
        detailsLevel: 'All'
      });
      
      return response.data.payload.inventory.length > 0 
        ? response.data.payload.inventory[0] 
        : null;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getInventoryBySku`);
    }
  }
  
  /**
   * Get inventory for a specific ASIN
   * @param asin ASIN to query
   * @param marketplaceIds Optional list of marketplace IDs
   * @returns Inventory information for the specified ASIN
   */
  public async getInventoryByAsin(
    asin: string,
    marketplaceIds?: string[]
  ): Promise<InventoryItem[]> {
    if (!asin) {
      throw AmazonErrorHandler.createError(
        'ASIN is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.getInventory({
        asinList: [asin],
        marketplaceIds: marketplaceIds || [this.marketplaceId],
        detailsLevel: 'All'
      });
      
      return response.data.payload.inventory;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getInventoryByAsin`);
    }
  }
  
  /**
   * Get all inventory items across all pages
   * @param params Query parameters for inventory details
   * @returns All inventory items
   */
  public async getAllInventoryItems(
    params?: Omit<InventoryQueryParams, 'nextToken'>
  ): Promise<InventoryItem[]> {
    let allItems: InventoryItem[] = [];
    let nextToken: string | undefined;
    
    try {
      do {
        const response = await this.getInventory({
          ...params,
          nextToken
        });
        
        if (response.data.payload.inventory && response.data.payload.inventory.length > 0) {
          allItems = [...allItems, ...response.data.payload.inventory];
        }
        
        nextToken = response.data.payload.nextToken;
      } while (nextToken);
      
      return allItems;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getAllInventoryItems`);
    }
  }
  
  /**
   * Get all inventory summaries across all pages
   * @param filters Optional filters for inventory summary
   * @returns All inventory summary items
   */
  public async getAllInventorySummaries(
    filters?: InventorySummaryFilters
  ): Promise<InventorySummaryItem[]> {
    let allSummaries: InventorySummaryItem[] = [];
    let nextToken: string | undefined;
    
    try {
      do {
        const response = await this.getInventorySummary(filters);
        
        if (response.data.payload.inventorySummaries && response.data.payload.inventorySummaries.length > 0) {
          allSummaries = [...allSummaries, ...response.data.payload.inventorySummaries];
        }
        
        nextToken = response.data.payload.nextToken;
      } while (nextToken);
      
      return allSummaries;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getAllInventorySummaries`);
    }
  }
  
  /**
   * Get low stock inventory items (items with fulfillable quantity below threshold)
   * @param threshold Threshold for low stock
   * @param marketplaceIds Optional list of marketplace IDs
   * @returns Low stock inventory items
   */
  public async getLowStockItems(
    threshold: number = 5,
    marketplaceIds?: string[]
  ): Promise<InventoryItem[]> {
    try {
      const allItems = await this.getAllInventoryItems({
        marketplaceIds: marketplaceIds || [this.marketplaceId],
        detailsLevel: 'All'
      });
      
      // Filter for items with fulfillable quantity below threshold
      return allItems.filter(item => {
        if (!item.inventoryDetails) return false;
        
        // Check all condition types for fulfillable quantity
        for (const condition in item.inventoryDetails) {
          const details = item.inventoryDetails[condition as ConditionType];
          if (details && details.fulfillableQuantity !== undefined && 
              details.fulfillableQuantity <= threshold) {
            return true;
          }
        }
        
        return false;
      });
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getLowStockItems`);
    }
  }
  
  /**
   * Get total inventory count across all conditions
   * @param marketplaceIds Optional list of marketplace IDs
   * @returns Total inventory count
   */
  public async getTotalInventoryCount(
    marketplaceIds?: string[]
  ): Promise<number> {
    try {
      const summary = await this.getInventorySummary({
        granularityType: 'Marketplace',
        granularityId: marketplaceIds?.[0] || this.marketplaceId
      });
      
      let totalCount = 0;
      
      // Sum up the total units from all summaries
      summary.data.payload.inventorySummaries.forEach(item => {
        if (item.totalUnits) {
          totalCount += item.totalUnits;
        }
      });
      
      return totalCount;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getTotalInventoryCount`);
    }
  }
}