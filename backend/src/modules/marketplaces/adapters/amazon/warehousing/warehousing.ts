import { ApiRequestFunction, ApiResponse, BaseModule } from '../core/base-module.interface';
import AmazonErrorHandler, { AmazonErrorCode } from '../utils/amazon-error';

/**
 * Interface for warehouse inventory item
 */
export interface WarehouseInventoryItem {
  /**
   * The SKU of the item
   */
  sellerSku: string;

  /**
   * ASIN of the item
   */
  asin?: string;

  /**
   * Condition of the item
   */
  condition?: string;

  /**
   * Total quantity available
   */
  totalQuantity: number;

  /**
   * Location details
   */
  location?: {
    /**
     * Warehouse ID
     */
    warehouseId: string;

    /**
     * Warehouse name
     */
    warehouseName?: string;
  };
}

/**
 * Interface for warehouse details
 */
export interface WarehouseDetails {
  /**
   * Warehouse ID
   */
  warehouseId: string;

  /**
   * Warehouse name
   */
  name: string;

  /**
   * Address of the warehouse
   */
  address?: {
    /**
     * Street address
     */
    addressLine1?: string;

    /**
     * Optional second line for street address
     */
    addressLine2?: string;

    /**
     * City
     */
    city?: string;

    /**
     * State or province
     */
    stateOrProvince?: string;

    /**
     * Postal code
     */
    postalCode?: string;

    /**
     * Country code
     */
    countryCode: string;
  };

  /**
   * Status of the warehouse
   */
  status?: string;

  /**
   * Features available at this warehouse
   */
  features?: string[];
}

/**
 * Interface for inventory query parameters
 */
export interface InventoryQueryParams {
  /**
   * List of seller SKUs to filter by
   */
  sellerSkus?: string[];

  /**
   * List of warehouse IDs to filter by
   */
  warehouseIds?: string[];

  /**
   * Pagination token
   */
  nextToken?: string;

  /**
   * Maximum number of results to return
   */
  maxResults?: number;
}

/**
 * Interface for inventory response
 */
export interface InventoryResponse {
  /**
   * List of inventory items
   */
  inventoryItems: WarehouseInventoryItem[];

  /**
   * Pagination token for the next set of results
   */
  nextToken?: string;
}

/**
 * Interface for warehouse query parameters
 */
export interface WarehouseQueryParams {
  /**
   * List of warehouse IDs to filter by
   */
  warehouseIds?: string[];

  /**
   * Pagination token
   */
  nextToken?: string;

  /**
   * Maximum number of results to return
   */
  maxResults?: number;
}

/**
 * Interface for warehouses response
 */
export interface WarehousesResponse {
  /**
   * List of warehouses
   */
  warehouses: WarehouseDetails[];

  /**
   * Pagination token for the next set of results
   */
  nextToken?: string;
}

/**
 * Interface for warehousing module options
 */
export interface WarehousingModuleOptions {
  // Optional configuration specific to warehousing module
}

/**
 * Module for interacting with Amazon Warehousing and Distribution API
 */
export class WarehousingModule implements BaseModule<WarehousingModuleOptions> {
  /**
   * The unique identifier for this module
   */
  public readonly moduleId: string = 'warehousing';
  
  /**
   * The human-readable name of this module
   */
  public readonly moduleName: string = 'Amazon Warehousing and Distribution';
  
  /**
   * The base URL path for API requests
   */
  public readonly basePath: string = '/warehousing';
  
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
  public readonly options: WarehousingModuleOptions = {};
  
  /**
   * The API request function used by this module
   */
  public readonly apiRequest: ApiRequestFunction;
  
  /**
   * Create a new WarehousingModule
   * @param apiVersion API version
   * @param apiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   */
  constructor(
    apiVersion: string,
    apiRequest: ApiRequestFunction,
    marketplaceId: string
  ) {
    this.apiVersion = apiVersion;
    this.apiRequest = apiRequest;
    this.marketplaceId = marketplaceId;
  }
  
  /**
   * Get inventory data for warehouse items
   * @param params Query parameters
   * @returns Inventory response with items
   */
  public async getInventory(params: InventoryQueryParams = {}): Promise<InventoryResponse> {
    try {
      const response = await this.apiRequest(
        `${this.basePath}/inventory`,
        'GET',
        params
      );
      
      return response.data as InventoryResponse;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Get details for all available warehouses
   * @param params Query parameters
   * @returns Warehouse response with details
   */
  public async getWarehouses(params: WarehouseQueryParams = {}): Promise<WarehousesResponse> {
    try {
      const response = await this.apiRequest(
        `${this.basePath}/warehouses`,
        'GET',
        params
      );
      
      return response.data as WarehousesResponse;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Get details for a specific warehouse
   * @param warehouseId ID of the warehouse to retrieve
   * @returns Warehouse details
   */
  public async getWarehouse(warehouseId: string): Promise<WarehouseDetails> {
    if (!warehouseId) {
      throw AmazonErrorHandler.createError(
        'Warehouse ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.apiRequest(
        `${this.basePath}/warehouses/${warehouseId}`,
        'GET'
      );
      
      return response.data as WarehouseDetails;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Get inventory details for a specific SKU
   * @param sellerSku The seller SKU to get inventory for
   * @param warehouseId Optional warehouse ID to filter by
   * @returns Inventory details for the SKU
   */
  public async getInventoryBySku(sellerSku: string, warehouseId?: string): Promise<WarehouseInventoryItem[]> {
    if (!sellerSku) {
      throw AmazonErrorHandler.createError(
        'Seller SKU is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const params: InventoryQueryParams = { 
        sellerSkus: [sellerSku]
      };
      
      if (warehouseId) {
        params.warehouseIds = [warehouseId];
      }
      
      const response = await this.apiRequest(
        `${this.basePath}/inventory`,
        'GET',
        params
      );
      
      const inventoryResponse = response.data as InventoryResponse;
      return inventoryResponse.inventoryItems || [];
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
}