/**
 * Amazon Fulfillment Inbound API Module
 * 
 * Implements the Amazon SP-API Fulfillment Inbound API functionality.
 * This module handles creating and managing inbound shipment plans to Amazon FBA.
 */

import { BaseApiModule, ApiRequestOptions, ApiResponse } from '../../core/api-module';
import { AmazonErrorUtil, AmazonErrorCode } from '../../utils/amazon-error';
import { AmazonSPApi } from '../../schemas/amazon.generated';

/**
 * Address information
 */
export type Address = AmazonSPApi.FulfillmentInbound.Address;

/**
 * Inbound item information
 */
export type InboundShipmentItem = AmazonSPApi.FulfillmentInbound.InboundShipmentItem;

/**
 * Create inbound shipment plan request
 */
export type CreateInboundShipmentPlanRequest = AmazonSPApi.FulfillmentInbound.CreateInboundShipmentPlanRequest;

/**
 * Create inbound shipment plan result item
 */
export type InboundShipmentPlanItem = AmazonSPApi.FulfillmentInbound.InboundShipmentPlanItem;

/**
 * Inbound shipment plan
 */
export type InboundShipmentPlan = AmazonSPApi.FulfillmentInbound.InboundShipmentPlan;

/**
 * Create inbound shipment request
 */
export type CreateInboundShipmentRequest = AmazonSPApi.FulfillmentInbound.CreateInboundShipmentRequest;

/**
 * Update inbound shipment request
 */
export type UpdateInboundShipmentRequest = AmazonSPApi.FulfillmentInbound.UpdateInboundShipmentRequest;

/**
 * Inbound shipment information
 */
export type InboundShipmentInfo = AmazonSPApi.FulfillmentInbound.InboundShipmentInfo;

/**
 * Get shipments filter
 */
export type GetShipmentsFilter = AmazonSPApi.FulfillmentInbound.GetShipmentsFilter;

/**
 * Shipment item information
 */
export type ShipmentItem = AmazonSPApi.FulfillmentInbound.ShipmentItem;

/**
 * Shipment information
 */
export type Shipment = AmazonSPApi.FulfillmentInbound.Shipment;

/**
 * Shipment status type
 */
export type ShipmentStatus = AmazonSPApi.FulfillmentInbound.ShipmentStatus;

/**
 * Implementation of the Amazon Fulfillment Inbound API
 */
export class FulfillmentInboundModule extends BaseApiModule {
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
    super('fulfillmentInbound', apiVersion, makeApiRequest, marketplaceId);
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
   * Create an inbound shipment plan
   * @param request Create inbound shipment plan request
   * @returns Inbound shipment plans
   */
  public async createInboundShipmentPlan(
    request: CreateInboundShipmentPlanRequest
  ): Promise<ApiResponse<AmazonSPApi.FulfillmentInbound.CreateInboundShipmentPlanResponse>> {
    try {
      return await this.makeRequest<AmazonSPApi.FulfillmentInbound.CreateInboundShipmentPlanResponse>({
        method: 'POST',
        path: '/plans',
        data: request
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.createInboundShipmentPlan`);
    }
  }

  /**
   * Create an inbound shipment
   * @param request Create inbound shipment request
   * @returns Inbound shipment
   */
  public async createInboundShipment(
    request: CreateInboundShipmentRequest
  ): Promise<ApiResponse<AmazonSPApi.FulfillmentInbound.CreateInboundShipmentResponse>> {
    if (!request.shipmentId) {
      throw AmazonErrorUtil.createError('Shipment ID is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    try {
      return await this.makeRequest<AmazonSPApi.FulfillmentInbound.CreateInboundShipmentResponse>({
        method: 'POST',
        path: `/shipments/${request.shipmentId}`,
        data: request
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.createInboundShipment`);
    }
  }

  /**
   * Update an inbound shipment
   * @param shipmentId Shipment ID
   * @param request Update inbound shipment request
   * @returns Inbound shipment
   */
  public async updateInboundShipment(
    shipmentId: string,
    request: UpdateInboundShipmentRequest
  ): Promise<ApiResponse<AmazonSPApi.FulfillmentInbound.UpdateInboundShipmentResponse>> {
    if (!shipmentId) {
      throw AmazonErrorUtil.createError('Shipment ID is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    try {
      return await this.makeRequest<AmazonSPApi.FulfillmentInbound.UpdateInboundShipmentResponse>({
        method: 'PUT',
        path: `/shipments/${shipmentId}`,
        data: request
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.updateInboundShipment`);
    }
  }

  /**
   * Get shipments
   * @param filter Filter for shipments
   * @param nextToken Token for pagination
   * @param marketplaceId Marketplace ID
   * @returns Shipment information
   */
  public async getShipments(
    filter: GetShipmentsFilter = {},
    nextToken?: string,
    marketplaceId?: string
  ): Promise<ApiResponse<AmazonSPApi.FulfillmentInbound.GetShipmentsResponse>> {
    const queryParams: Record<string, any> = {};
    
    // Add filter parameters
    if (filter.shipmentStatusList && filter.shipmentStatusList.length > 0) {
      for (let i = 0; i < filter.shipmentStatusList.length; i++) {
        queryParams[`ShipmentStatusList.member.${i + 1}`] = filter.shipmentStatusList[i];
      }
    }
    
    if (filter.shipmentIdList && filter.shipmentIdList.length > 0) {
      for (let i = 0; i < filter.shipmentIdList.length; i++) {
        queryParams[`ShipmentIdList.member.${i + 1}`] = filter.shipmentIdList[i];
      }
    }
    
    if (filter.lastUpdatedAfter) {
      queryParams.LastUpdatedAfter = filter.lastUpdatedAfter.toISOString();
    }
    
    if (filter.lastUpdatedBefore) {
      queryParams.LastUpdatedBefore = filter.lastUpdatedBefore.toISOString();
    }
    
    // Add pagination token if provided
    if (nextToken) {
      queryParams.NextToken = nextToken;
    }
    
    // Add marketplace ID
    queryParams.MarketplaceId = marketplaceId || this.marketplaceId;
    
    try {
      return await this.makeRequest<AmazonSPApi.FulfillmentInbound.GetShipmentsResponse>({
        method: 'GET',
        path: '/shipments',
        params: queryParams
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getShipments`);
    }
  }

  /**
   * Get shipment items
   * @param shipmentId Shipment ID
   * @param nextToken Token for pagination
   * @param marketplaceId Marketplace ID
   * @returns Shipment items
   */
  public async getShipmentItems(
    shipmentId: string,
    nextToken?: string,
    marketplaceId?: string
  ): Promise<ApiResponse<AmazonSPApi.FulfillmentInbound.GetShipmentItemsResponse>> {
    if (!shipmentId) {
      throw AmazonErrorUtil.createError('Shipment ID is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    const queryParams: Record<string, any> = {
      ShipmentId: shipmentId,
      MarketplaceId: marketplaceId || this.marketplaceId
    };
    
    // Add pagination token if provided
    if (nextToken) {
      queryParams.NextToken = nextToken;
    }
    
    try {
      return await this.makeRequest<AmazonSPApi.FulfillmentInbound.GetShipmentItemsResponse>({
        method: 'GET',
        path: '/shipment-items',
        params: queryParams
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getShipmentItems`);
    }
  }

  /**
   * Get all shipments (handles pagination)
   * @param filter Filter for shipments
   * @param marketplaceId Marketplace ID
   * @param maxPages Maximum number of pages to retrieve (default: 10)
   * @returns All shipments
   */
  public async getAllShipments(
    filter: GetShipmentsFilter = {},
    marketplaceId?: string,
    maxPages = 10
  ): Promise<Shipment[]> {
    let currentPage = 1;
    let nextToken: string | undefined = undefined;
    const allShipments: Shipment[] = [];
    
    do {
      // Get a page of shipments
      const response = await this.getShipments(filter, nextToken, marketplaceId);
      
      // Add shipments to our collection
      if (response.data.payload.shipmentData && response.data.payload.shipmentData.length > 0) {
        allShipments.push(...response.data.payload.shipmentData);
      }
      
      // Get next token for pagination
      nextToken = response.data.payload.nextToken;
      currentPage++;
      
      // Stop if we've reached the max pages or there are no more pages
    } while (nextToken && currentPage <= maxPages);
    
    return allShipments;
  }
  
  /**
   * Get recent shipments
   * @param days Number of days to look back (default: 30)
   * @param statuses Shipment statuses to include (default: all)
   * @param marketplaceId Marketplace ID
   * @returns Recent shipments
   */
  public async getRecentShipments(
    days = 30,
    statuses?: ShipmentStatus[],
    marketplaceId?: string
  ): Promise<Shipment[]> {
    // Calculate the start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get all shipments updated after the start date
    return this.getAllShipments({
      lastUpdatedAfter: startDate,
      shipmentStatusList: statuses
    }, marketplaceId);
  }
  
  /**
   * Get pending shipments (working or shipped)
   * @param marketplaceId Marketplace ID
   * @returns Pending shipments
   */
  public async getPendingShipments(marketplaceId?: string): Promise<Shipment[]> {
    return this.getAllShipments({
      shipmentStatusList: ['WORKING', 'SHIPPED', 'IN_TRANSIT']
    }, marketplaceId);
  }
  
  /**
   * Create and submit a complete inbound shipment
   * @param shipItems Items to ship
   * @param shipFromAddress Ship from address
   * @param shipmentName Shipment name
   * @param marketplaceId Marketplace ID
   * @returns Shipment creation result
   */
  public async createAndSubmitShipment(
    shipItems: Array<{
      sellerSKU: string;
      quantity: number;
      quantityInCase?: number;
    }>,
    shipFromAddress: Address,
    shipmentName: string,
    marketplaceId?: string
  ): Promise<{
    shipmentId: string;
    destinationFulfillmentCenterId: string;
    labelPrepType: string;
    items: InboundShipmentPlanItem[];
  }> {
    if (!shipItems || shipItems.length === 0) {
      throw AmazonErrorUtil.createError('At least one item is required for shipment', AmazonErrorCode.INVALID_INPUT);
    }
    
    if (!shipFromAddress) {
      throw AmazonErrorUtil.createError('Ship from address is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    // Step 1: Create inbound shipment plan
    const inboundItems: InboundShipmentItem[] = shipItems.map((item: any) => ({
      sellerSKU: item.sellerSKU,
      quantity: item.quantity,
      quantityInCase: item.quantityInCase
    }));
    
    const planRequest: CreateInboundShipmentPlanRequest = {
      shipFromAddress: shipFromAddress,
      labelPrepPreference: 'SELLER_LABEL',
      inboundShipmentItems: inboundItems
    };
    
    const planResponse = await this.createInboundShipmentPlan(planRequest);
    
    if (!planResponse.data.payload.inboundShipmentPlans || planResponse.data.payload.inboundShipmentPlans.length === 0) {
      throw AmazonErrorUtil.createError('No shipment plans were created', AmazonErrorCode.INVALID_INPUT);
    }
    
    // Get the first plan (in a real implementation, we might handle multiple plans)
    const plan = planResponse.data.payload.inboundShipmentPlans[0];
    
    // Step 2: Create the shipment
    const shipmentRequest: CreateInboundShipmentRequest = {
      shipmentId: plan.shipmentId,
      shipmentName: shipmentName || `Shipment ${plan.shipmentId}`,
      shipFromAddress,
      destinationFulfillmentCenterId: plan.destinationFulfillmentCenterId,
      labelPrepPreference: 'SELLER_LABEL',
      inboundShipmentItems: inboundItems,
      shipmentStatus: 'WORKING'
    };
    
    await this.createInboundShipment(shipmentRequest);
    
    // Step 3: Update the shipment to SHIPPED status
    await this.updateInboundShipment(plan.shipmentId, {
      shipmentStatus: 'SHIPPED'
    });
    
    return {
      shipmentId: plan.shipmentId,
      destinationFulfillmentCenterId: plan.destinationFulfillmentCenterId,
      labelPrepType: plan.labelPrepType,
      items: plan.items
    };
  }
}