/**
 * Amazon Fulfillment Inbound API Module
 * 
 * Implements the Amazon SP-API Fulfillment Inbound API functionality.
 * This module handles creating and managing inbound shipment plans to Amazon FBA.
 */

import { ApiModule } from '../../core/api-module';
import { ApiRequestFunction, ApiResponse } from '../../core/base-module.interface';
import { AmazonErrorHandler, AmazonErrorCode } from '../../utils/amazon-error';

/**
 * Address information
 */
export interface Address {
  /**
   * Name of the person or business
   */
  name: string;
  
  /**
   * Street address line 1
   */
  addressLine1: string;
  
  /**
   * Street address line 2 (optional)
   */
  addressLine2?: string;
  
  /**
   * City
   */
  city: string;
  
  /**
   * State or province
   */
  stateOrProvinceCode: string;
  
  /**
   * Postal code
   */
  postalCode: string;
  
  /**
   * Country code
   */
  countryCode: string;
}

/**
 * Inbound item information
 */
export interface InboundShipmentItem {
  /**
   * Seller SKU
   */
  sellerSKU: string;
  
  /**
   * Quantity to ship
   */
  quantity: number;
  
  /**
   * Quantity in case packaging (optional)
   */
  quantityInCase?: number;
  
  /**
   * Prep instruction (optional)
   */
  prepDetails?: PrepDetails;
}

/**
 * Preparation instruction details
 */
export interface PrepDetails {
  /**
   * Type of preparation needed
   */
  prepInstruction: string;
  
  /**
   * Who will be doing the preparation
   */
  prepOwner: string;
}

/**
 * Create inbound shipment plan request
 */
export interface CreateInboundShipmentPlanRequest {
  /**
   * Address from which items will be shipped
   */
  shipFromAddress: Address;
  
  /**
   * Label preparation preference
   */
  labelPrepPreference: LabelPrepPreference;
  
  /**
   * Items to include in the shipment plan
   */
  inboundShipmentItems: InboundShipmentItem[];
}

/**
 * Create inbound shipment plan result item
 */
export interface InboundShipmentPlanItem {
  /**
   * Seller SKU
   */
  sellerSKU: string;
  
  /**
   * Amazon ASIN
   */
  asin?: string;
  
  /**
   * FNSKU
   */
  fulfillmentNetworkSKU?: string;
  
  /**
   * Quantity to ship
   */
  quantity: number;
  
  /**
   * Preparation instructions
   */
  prepDetailsList?: PrepDetails[];
}

/**
 * Inbound shipment plan
 */
export interface InboundShipmentPlan {
  /**
   * Shipment ID
   */
  shipmentId: string;
  
  /**
   * Destination fulfillment center ID
   */
  destinationFulfillmentCenterId: string;
  
  /**
   * Items in the shipment plan
   */
  items: InboundShipmentPlanItem[];
  
  /**
   * Label preparation type
   */
  labelPrepType: string;
}

/**
 * Create inbound shipment plan response
 */
export interface CreateInboundShipmentPlanResponse {
  /**
   * Response payload
   */
  payload: {
    /**
     * Inbound shipment plans
     */
    inboundShipmentPlans: InboundShipmentPlan[];
  };
}

/**
 * Create inbound shipment request
 */
export interface CreateInboundShipmentRequest {
  /**
   * Shipment ID
   */
  shipmentId: string;
  
  /**
   * Shipment name
   */
  shipmentName: string;
  
  /**
   * Address from which items will be shipped
   */
  shipFromAddress: Address;
  
  /**
   * Destination fulfillment center ID
   */
  destinationFulfillmentCenterId: string;
  
  /**
   * Label preparation preference
   */
  labelPrepPreference: LabelPrepPreference;
  
  /**
   * Items in the shipment
   */
  inboundShipmentItems: InboundShipmentItem[];
  
  /**
   * Shipment status
   */
  shipmentStatus: ShipmentStatus;
}

/**
 * Update inbound shipment request
 */
export interface UpdateInboundShipmentRequest {
  /**
   * Shipment name (optional)
   */
  shipmentName?: string;
  
  /**
   * Address from which items will be shipped (optional)
   */
  shipFromAddress?: Address;
  
  /**
   * Destination fulfillment center ID (optional)
   */
  destinationFulfillmentCenterId?: string;
  
  /**
   * Label preparation preference (optional)
   */
  labelPrepPreference?: LabelPrepPreference;
  
  /**
   * Items in the shipment (optional)
   */
  inboundShipmentItems?: InboundShipmentItem[];
  
  /**
   * Shipment status (optional)
   */
  shipmentStatus?: ShipmentStatus;
}

/**
 * Create/update inbound shipment response
 */
export interface CreateInboundShipmentResponse {
  /**
   * Response payload
   */
  payload: {
    /**
     * Shipment ID
     */
    shipmentId: string;
  };
}

/**
 * Update inbound shipment response
 */
export interface UpdateInboundShipmentResponse extends CreateInboundShipmentResponse {}

/**
 * Inbound shipment information
 */
export interface InboundShipmentInfo {
  /**
   * Shipment ID
   */
  shipmentId: string;
  
  /**
   * Shipment name
   */
  shipmentName: string;
  
  /**
   * Shipment status
   */
  shipmentStatus: ShipmentStatus;
  
  /**
   * Label preparation type
   */
  labelPrepType: string;
  
  /**
   * Address from which items will be shipped
   */
  shipFromAddress: Address;
  
  /**
   * Destination fulfillment center ID
   */
  destinationFulfillmentCenterId: string;
  
  /**
   * Box content status
   */
  boxContentsSource?: string;
  
  /**
   * Estimated arrival date
   */
  estimatedBoxContentsFee?: {
    /**
     * Total fee
     */
    totalFee: {
      /**
       * Currency code
       */
      currencyCode: string;
      
      /**
       * Amount
       */
      value: number;
    };
  };
}

/**
 * Get shipments filter
 */
export interface GetShipmentsFilter {
  /**
   * Shipment status list to filter by
   */
  shipmentStatusList?: ShipmentStatus[];
  
  /**
   * Shipment ID list to filter by
   */
  shipmentIdList?: string[];
  
  /**
   * Filter for shipments updated after this date
   */
  lastUpdatedAfter?: Date;
  
  /**
   * Filter for shipments updated before this date
   */
  lastUpdatedBefore?: Date;
}

/**
 * Get shipments response
 */
export interface GetShipmentsResponse {
  /**
   * Response payload
   */
  payload: {
    /**
     * Shipment data
     */
    shipmentData?: Shipment[];
    
    /**
     * Pagination token
     */
    nextToken?: string;
  };
}

/**
 * Shipment item information
 */
export interface ShipmentItem {
  /**
   * Seller SKU
   */
  sellerSKU: string;
  
  /**
   * Quantity shipped
   */
  quantityShipped: number;
  
  /**
   * Quantity received
   */
  quantityReceived?: number;
  
  /**
   * Quantity in case
   */
  quantityInCase?: number;
}

/**
 * Get shipment items response
 */
export interface GetShipmentItemsResponse {
  /**
   * Response payload
   */
  payload: {
    /**
     * Shipment items
     */
    itemData?: ShipmentItem[];
    
    /**
     * Pagination token
     */
    nextToken?: string;
  };
}

/**
 * Shipment information
 */
export interface Shipment {
  /**
   * Shipment ID
   */
  shipmentId: string;
  
  /**
   * Shipment name
   */
  shipmentName: string;
  
  /**
   * Address from which items will be shipped
   */
  shipFromAddress: Address;
  
  /**
   * Destination fulfillment center ID
   */
  destinationFulfillmentCenterId: string;
  
  /**
   * Shipment status
   */
  shipmentStatus: ShipmentStatus;
  
  /**
   * Label preparation type
   */
  labelPrepType: string;
  
  /**
   * Box contents status
   */
  boxContentsSource?: string;
  
  /**
   * Items in the shipment
   */
  items?: ShipmentItem[];
  
  /**
   * Estimated arrival date
   */
  estimatedArrivalDate?: string;
  
  /**
   * Created date
   */
  createdDate?: string;
  
  /**
   * Last updated date
   */
  lastUpdated?: string;
}

/**
 * Shipment status type
 */
export type ShipmentStatus = 
  | 'WORKING' 
  | 'SHIPPED' 
  | 'RECEIVING' 
  | 'CANCELLED' 
  | 'DELETED' 
  | 'CLOSED' 
  | 'ERROR' 
  | 'IN_TRANSIT' 
  | 'DELIVERED' 
  | 'CHECKED_IN';

/**
 * Label preference type
 */
export type LabelPrepPreference = 'SELLER_LABEL' | 'AMAZON_LABEL';

/**
 * Create shipment result
 */
export interface ShipmentCreationResult {
  /**
   * Shipment ID
   */
  shipmentId: string;
  
  /**
   * Destination fulfillment center ID
   */
  destinationFulfillmentCenterId: string;
  
  /**
   * Label preparation type
   */
  labelPrepType: string;
  
  /**
   * Shipment items
   */
  items: InboundShipmentPlanItem[];
}

/**
 * Ship item input
 */
export interface ShipItem {
  /**
   * Seller SKU
   */
  sellerSKU: string;
  
  /**
   * Quantity to ship
   */
  quantity: number;
  
  /**
   * Quantity in case packaging (optional)
   */
  quantityInCase?: number;
}

/**
 * Configuration options for the FulfillmentInboundModule
 */
export interface FulfillmentInboundModuleOptions {
  /**
   * Default label preparation preference
   */
  defaultLabelPrepPreference?: LabelPrepPreference;
}

/**
 * Implementation of the Amazon Fulfillment Inbound API
 */
export class FulfillmentInboundModule extends ApiModule<FulfillmentInboundModuleOptions> {
  /**
   * The unique identifier for this module
   */
  readonly moduleId: string = 'fulfillmentInbound';
  
  /**
   * The human-readable name of this module
   */
  readonly moduleName: string = 'Amazon Fulfillment Inbound';
  
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
    options: FulfillmentInboundModuleOptions = {}
  ) {
    super(apiRequest, marketplaceId, options);
    this.apiVersion = apiVersion;
    this.basePath = `/fba/inbound/${apiVersion}`;
  }
  
  /**
   * Create an inbound shipment plan
   * @param request Create inbound shipment plan request
   * @returns Inbound shipment plans
   */
  public async createInboundShipmentPlan(
    request: CreateInboundShipmentPlanRequest
  ): Promise<ApiResponse<CreateInboundShipmentPlanResponse>> {
    if (!request) {
      throw AmazonErrorHandler.createError(
        'Create inbound shipment plan request is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.request<CreateInboundShipmentPlanResponse>(
        'plans',
        'POST',
        request
      );
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.createInboundShipmentPlan`);
    }
  }

  /**
   * Create an inbound shipment
   * @param request Create inbound shipment request
   * @returns Inbound shipment
   */
  public async createInboundShipment(
    request: CreateInboundShipmentRequest
  ): Promise<ApiResponse<CreateInboundShipmentResponse>> {
    if (!request) {
      throw AmazonErrorHandler.createError(
        'Create inbound shipment request is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!request.shipmentId) {
      throw AmazonErrorHandler.createError(
        'Shipment ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.request<CreateInboundShipmentResponse>(
        `shipments/${request.shipmentId}`,
        'POST',
        request
      );
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.createInboundShipment`);
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
  ): Promise<ApiResponse<UpdateInboundShipmentResponse>> {
    if (!shipmentId) {
      throw AmazonErrorHandler.createError(
        'Shipment ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!request) {
      throw AmazonErrorHandler.createError(
        'Update inbound shipment request is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.request<UpdateInboundShipmentResponse>(
        `shipments/${shipmentId}`,
        'PUT',
        request
      );
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.updateInboundShipment`);
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
  ): Promise<ApiResponse<GetShipmentsResponse>> {
    const requestData: Record<string, any> = {};
    
    // Add filter parameters
    if (filter.shipmentStatusList && filter.shipmentStatusList.length > 0) {
      requestData.ShipmentStatusList = filter.shipmentStatusList;
    }
    
    if (filter.shipmentIdList && filter.shipmentIdList.length > 0) {
      requestData.ShipmentIdList = filter.shipmentIdList;
    }
    
    if (filter.lastUpdatedAfter) {
      requestData.LastUpdatedAfter = filter.lastUpdatedAfter.toISOString();
    }
    
    if (filter.lastUpdatedBefore) {
      requestData.LastUpdatedBefore = filter.lastUpdatedBefore.toISOString();
    }
    
    // Add pagination token if provided
    if (nextToken) {
      requestData.NextToken = nextToken;
    }
    
    try {
      return await this.request<GetShipmentsResponse>(
        'shipments',
        'GET',
        requestData,
        { marketplaceId: marketplaceId || this.marketplaceId }
      );
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getShipments`);
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
  ): Promise<ApiResponse<GetShipmentItemsResponse>> {
    if (!shipmentId) {
      throw AmazonErrorHandler.createError(
        'Shipment ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const requestData: Record<string, any> = {
      ShipmentId: shipmentId
    };
    
    // Add pagination token if provided
    if (nextToken) {
      requestData.NextToken = nextToken;
    }
    
    try {
      return await this.request<GetShipmentItemsResponse>(
        'shipment-items',
        'GET',
        requestData,
        { marketplaceId: marketplaceId || this.marketplaceId }
      );
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getShipmentItems`);
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
      if (response.data.payload?.shipmentData && response.data.payload.shipmentData.length > 0) {
        allShipments.push(...response.data.payload.shipmentData);
      }
      
      // Get next token for pagination
      nextToken = response.data.payload?.nextToken;
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
    shipItems: ShipItem[],
    shipFromAddress: Address,
    shipmentName: string,
    marketplaceId?: string
  ): Promise<ShipmentCreationResult> {
    if (!shipItems || shipItems.length === 0) {
      throw AmazonErrorHandler.createError(
        'At least one item is required for shipment',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!shipFromAddress) {
      throw AmazonErrorHandler.createError(
        'Ship from address is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Step 1: Create inbound shipment plan
    const inboundItems: InboundShipmentItem[] = shipItems.map(item => ({
      sellerSKU: item.sellerSKU,
      quantity: item.quantity,
      quantityInCase: item.quantityInCase
    }));
    
    const planRequest: CreateInboundShipmentPlanRequest = {
      shipFromAddress: shipFromAddress,
      labelPrepPreference: this.options.defaultLabelPrepPreference || 'SELLER_LABEL',
      inboundShipmentItems: inboundItems
    };
    
    const planResponse = await this.createInboundShipmentPlan(planRequest);
    
    if (!planResponse.data.payload.inboundShipmentPlans || planResponse.data.payload.inboundShipmentPlans.length === 0) {
      throw AmazonErrorHandler.createError(
        'No shipment plans were created',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Get the first plan (in a real implementation, we might handle multiple plans)
    const plan = planResponse.data.payload.inboundShipmentPlans[0];
    
    // Step 2: Create the shipment
    const shipmentRequest: CreateInboundShipmentRequest = {
      shipmentId: plan.shipmentId,
      shipmentName: shipmentName || `Shipment ${plan.shipmentId}`,
      shipFromAddress,
      destinationFulfillmentCenterId: plan.destinationFulfillmentCenterId,
      labelPrepPreference: this.options.defaultLabelPrepPreference || 'SELLER_LABEL',
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