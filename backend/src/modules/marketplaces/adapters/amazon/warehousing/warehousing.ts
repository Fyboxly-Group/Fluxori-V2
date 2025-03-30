/**
 * Amazon Warehousing & Distribution API Module
 * 
 * Implements the Amazon SP-API Warehousing & Distribution API functionality.
 * This module allows sellers to manage their inventory stored in Amazon's
 * fulfillment network, plan capacity, and optimize distribution operations.
 */

import { BaseApiModule, ApiRequestOptions, ApiResponse } from '../core/api-module';
import { AmazonSPApi } from '../schemas/amazon.generated';
import { AmazonErrorUtil, AmazonErrorCode } from '../utils/amazon-error';

/**
 * Type aliases for Amazon Warehousing & Distribution API
 */
export type LocationType = AmazonSPApi.WarehouseAndDistribution.LocationType;
export type PeriodGranularity = AmazonSPApi.WarehouseAndDistribution.PeriodGranularity;
export type ShipmentStatus = AmazonSPApi.WarehouseAndDistribution.ShipmentStatus;
export type GetFacilitiesResponse = AmazonSPApi.WarehouseAndDistribution.GetFacilitiesResponse;
export type GetInventoryResponse = AmazonSPApi.WarehouseAndDistribution.GetInventoryResponse;
export type GetFacilityShipmentsResponse = AmazonSPApi.WarehouseAndDistribution.GetFacilityShipmentsResponse;
export type GetFacilityShipmentResponse = AmazonSPApi.WarehouseAndDistribution.GetFacilityShipmentResponse;
export type CreateFacilityShipmentResponse = AmazonSPApi.WarehouseAndDistribution.CreateFacilityShipmentResponse;
export type UpdateFacilityShipmentResponse = AmazonSPApi.WarehouseAndDistribution.UpdateFacilityShipmentResponse;
export type CancelFacilityShipmentResponse = AmazonSPApi.WarehouseAndDistribution.CancelFacilityShipmentResponse;
export type GetProgramCapacityResponse = AmazonSPApi.WarehouseAndDistribution.GetProgramCapacityResponse;
export type GetSellerLocationsResponse = AmazonSPApi.WarehouseAndDistribution.GetSellerLocationsResponse;
export type FacilityShipment = AmazonSPApi.WarehouseAndDistribution.FacilityShipment;

/**
 * Get list of facility shipments options
 */
export interface GetFacilityShipmentsOptions {
  /**
   * Identifies which Seller or Vendor warehouse the shipment is shipped from
   */
  shipFromLocationId?: string;
  
  /**
   * Identifies the warehouse the shipment is being sent to
   */
  warehouseId?: string;
  
  /**
   * Filters shipments by their status
   */
  status?: ShipmentStatus;
  
  /**
   * Sort shipments by field and order
   */
  sort?: {
    field: AmazonSPApi.WarehouseAndDistribution.SortField;
    order: AmazonSPApi.WarehouseAndDistribution.SortOrder;
  };
  
  /**
   * Pagination next token
   */
  nextToken?: string;
}

/**
 * Get Program Capacity options
 */
export interface GetProgramCapacityOptions {
  /**
   * Start date of the period for which capacity is required
   */
  startDate: string;
  
  /**
   * End date of the period for which capacity is required
   */
  endDate: string;
  
  /**
   * Granularity of the period when the capacity has to be reserved
   */
  granularity: PeriodGranularity;
  
  /**
   * Filter the capacity by service
   */
  serviceType?: string;
}

/**
 * Create Shipment options
 */
export interface CreateShipmentOptions {
  /**
   * Identifies which Seller or Vendor warehouse the shipment is shipped from
   */
  shipFromLocationId: string;
  
  /**
   * Identifies which warehouse the shipment is going to
   */
  warehouseId: string;
  
  /**
   * Seller provided reference ID
   */
  clientReferenceId: string;
  
  /**
   * Date when the shipment is expected to be delivered to the warehouse
   */
  estimatedReceivingDate: string;
  
  /**
   * ASINs and quantities to include in the shipment
   */
  items: Array<{
    /**
     * The seller SKU of the item
     */
    sellerSku: string;
    
    /**
     * The quantity of the item
     */
    quantity: number;
  }>;
}

/**
 * Implementation of the Amazon Warehousing & Distribution API
 */
export class WarehousingModule extends BaseApiModule {
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
    super('warehouseAndDistribution', apiVersion, makeApiRequest, marketplaceId);
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
   * Get the list of seller's facilities
   * @returns List of facilities
   */
  public async getFacilities(): Promise<ApiResponse<GetFacilitiesResponse>> {
    try {
      return await this.makeRequest<GetFacilitiesResponse>({
        method: 'GET',
        path: '/facilities'
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getFacilities`);
    }
  }

  /**
   * Get inventory details for a specific inventory ID
   * @param inventoryId Inventory ID
   * @returns Inventory details
   */
  public async getInventory(inventoryId: string): Promise<ApiResponse<GetInventoryResponse>> {
    if (!inventoryId) {
      throw AmazonErrorUtil.createError(
        'Inventory ID is required to get inventory details',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<GetInventoryResponse>({
        method: 'GET',
        path: `/inventory/${inventoryId}`
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getInventory`);
    }
  }

  /**
   * Get a list of all Facility to Facility shipments
   * @param options Options for filtering and sorting
   * @returns List of facility shipments
   */
  public async getFacilityShipments(options: GetFacilityShipmentsOptions = {}): Promise<ApiResponse<GetFacilityShipmentsResponse>> {
    const params: Record<string, any> = {};
    
    if (options.shipFromLocationId) {
      params.shipFromLocationId = options.shipFromLocationId;
    }
    
    if (options.warehouseId) {
      params.warehouseId = options.warehouseId;
    }
    
    if (options.status) {
      params.status = options.status;
    }
    
    if (options.sort) {
      params.sort = `${options.sort.field}:${options.sort.order}`;
    }
    
    if (options.nextToken) {
      params.nextToken = options.nextToken;
    }
    
    try {
      return await this.makeRequest<GetFacilityShipmentsResponse>({
        method: 'GET',
        path: '/facility-shipments',
        params
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getFacilityShipments`);
    }
  }

  /**
   * Get details of a specific facility shipment
   * @param shipmentId Shipment ID
   * @returns Shipment details
   */
  public async getFacilityShipment(shipmentId: string): Promise<ApiResponse<GetFacilityShipmentResponse>> {
    if (!shipmentId) {
      throw AmazonErrorUtil.createError(
        'Shipment ID is required to get shipment details',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<GetFacilityShipmentResponse>({
        method: 'GET',
        path: `/facility-shipments/${shipmentId}`
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getFacilityShipment`);
    }
  }

  /**
   * Create a facility shipment
   * @param options Shipment creation options
   * @returns Created shipment details
   */
  public async createFacilityShipment(options: CreateShipmentOptions): Promise<ApiResponse<CreateFacilityShipmentResponse>> {
    if (!options.shipFromLocationId) {
      throw AmazonErrorUtil.createError(
        'Ship from location ID is required to create shipment',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.warehouseId) {
      throw AmazonErrorUtil.createError(
        'Warehouse ID is required to create shipment',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.clientReferenceId) {
      throw AmazonErrorUtil.createError(
        'Client reference ID is required to create shipment',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.estimatedReceivingDate) {
      throw AmazonErrorUtil.createError(
        'Estimated receiving date is required to create shipment',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.items || options.items.length === 0) {
      throw AmazonErrorUtil.createError(
        'At least one item is required to create shipment',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<CreateFacilityShipmentResponse>({
        method: 'POST',
        path: '/facility-shipments',
        data: {
          shipFromLocationId: options.shipFromLocationId,
          warehouseId: options.warehouseId,
          clientReferenceId: options.clientReferenceId,
          estimatedReceivingDate: options.estimatedReceivingDate,
          items: options.items.map((item: any) => ({
            sellerSku: item.sellerSku,
            quantity: item.quantity
          }))
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.createFacilityShipment`);
    }
  }

  /**
   * Update a facility shipment
   * @param shipmentId Shipment ID
   * @param status New status of the shipment
   * @returns Updated shipment details
   */
  public async updateFacilityShipment(shipmentId: string, status: ShipmentStatus): Promise<ApiResponse<UpdateFacilityShipmentResponse>> {
    if (!shipmentId) {
      throw AmazonErrorUtil.createError(
        'Shipment ID is required to update shipment',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<UpdateFacilityShipmentResponse>({
        method: 'PATCH',
        path: `/facility-shipments/${shipmentId}`,
        data: {
          status
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.updateFacilityShipment`);
    }
  }

  /**
   * Cancel a facility shipment
   * @param shipmentId Shipment ID
   * @returns Cancellation response
   */
  public async cancelFacilityShipment(shipmentId: string): Promise<ApiResponse<CancelFacilityShipmentResponse>> {
    if (!shipmentId) {
      throw AmazonErrorUtil.createError(
        'Shipment ID is required to cancel shipment',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<CancelFacilityShipmentResponse>({
        method: 'DELETE',
        path: `/facility-shipments/${shipmentId}`
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.cancelFacilityShipment`);
    }
  }

  /**
   * Get the available program capacity for a specific period
   * @param options Capacity query options
   * @returns Available capacity
   */
  public async getProgramCapacity(options: GetProgramCapacityOptions): Promise<ApiResponse<GetProgramCapacityResponse>> {
    if (!options.startDate) {
      throw AmazonErrorUtil.createError(
        'Start date is required to get program capacity',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.endDate) {
      throw AmazonErrorUtil.createError(
        'End date is required to get program capacity',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.granularity) {
      throw AmazonErrorUtil.createError(
        'Granularity is required to get program capacity',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const params: Record<string, any> = {
      startDate: options.startDate,
      endDate: options.endDate,
      granularity: options.granularity
    };
    
    if (options.serviceType) {
      params.serviceType = options.serviceType;
    }
    
    try {
      return await this.makeRequest<GetProgramCapacityResponse>({
        method: 'GET',
        path: '/program-capacity',
        params
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getProgramCapacity`);
    }
  }

  /**
   * Get a list of all seller warehouse locations
   * @param locationType Type of location (optional)
   * @returns List of warehouse locations
   */
  public async getSellerLocations(locationType?: LocationType): Promise<ApiResponse<GetSellerLocationsResponse>> {
    const params: Record<string, any> = {};
    
    if (locationType) {
      params.locationType = locationType;
    }
    
    try {
      return await this.makeRequest<GetSellerLocationsResponse>({
        method: 'GET',
        path: '/seller-locations',
        params
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getSellerLocations`);
    }
  }

  /**
   * Get all facility shipments (handles pagination)
   * @param options Options for filtering and sorting
   * @param maxPages Maximum number of pages to retrieve (default: 10)
   * @returns All facility shipments
   */
  public async getAllFacilityShipments(options: GetFacilityShipmentsOptions = {}, maxPages: number = 10): Promise<FacilityShipment[]> {
    const allShipments: FacilityShipment[] = [];
    let nextToken: string | undefined = options.nextToken;
    let currentPage = 1;
    
    do {
      // Update options with next token
      const pageOptions: GetFacilityShipmentsOptions = {
        ...options,
        nextToken
      };
      
      // Get the current page of shipments
      const response = await this.getFacilityShipments(pageOptions);
      
      // Add shipments to our collection
      if (response.data.shipments && response.data.shipments.length > 0) {
        allShipments.push(...response.data.shipments);
      }
      
      // Update the next token
      nextToken = response.data.nextToken;
      currentPage++;
      
      // Stop if we've reached the maximum number of pages or there are no more pages
    } while (nextToken && currentPage <= maxPages);
    
    return allShipments;
  }
  
  /**
   * Create a facility shipment and set it to ready for shipping
   * @param options Shipment creation options
   * @returns Created shipment information
   */
  public async createAndReadyFacilityShipment(options: CreateShipmentOptions): Promise<{
    shipmentId: string;
    status: ShipmentStatus;
  }> {
    // Create the shipment
    const createResponse = await this.createFacilityShipment(options);
    const shipmentId = createResponse.data.shipmentId;
    
    // Set the shipment status to ready for shipping
    await this.updateFacilityShipment(shipmentId, 'READY_TO_SHIP');
    
    // Return the shipment information
    return {
      shipmentId,
      status: 'READY_TO_SHIP'
    };
  }
}