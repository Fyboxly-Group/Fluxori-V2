/**
 * Amazon Fulfillment Outbound API Module
 * 
 * Implements the Amazon SP-API Fulfillment Outbound API functionality.
 * This module handles creating and managing outbound shipments from Amazon FBA.
 */

import { ApiRequestFunction, ApiResponse, BaseModule } from '../core/base-module.interface';
import AmazonErrorHandler, { AmazonErrorCode } from '../utils/amazon-error';

/**
 * Shipping speed categories
 */
export type ShippingSpeedCategory = 'Standard' | 'Expedited' | 'Priority' | 'ScheduledDelivery';

/**
 * Fulfillment action types
 */
export type FulfillmentAction = 'Ship' | 'Hold';

/**
 * Fulfillment order status types
 */
export enum FulfillmentOrderStatus {
  RECEIVED = 'RECEIVED',
  INVALID = 'INVALID',
  PLANNING = 'PLANNING',
  PROCESSING = 'PROCESSING',
  CANCELLED = 'CANCELLED',
  COMPLETE = 'COMPLETE',
  COMPLETE_PARTIALLED = 'COMPLETE_PARTIALLED',
  UNFULFILLABLE = 'UNFULFILLABLE'
}

/**
 * Address information
 */
export interface Address {
  /**
   * Name
   */
  name: string;
  
  /**
   * Address line 1
   */
  addressLine1: string;
  
  /**
   * Address line 2
   */
  addressLine2?: string;
  
  /**
   * Address line 3
   */
  addressLine3?: string;
  
  /**
   * City
   */
  city: string;
  
  /**
   * District or county
   */
  districtOrCounty?: string;
  
  /**
   * State or province code
   */
  stateOrProvinceCode?: string;
  
  /**
   * Country code
   */
  countryCode: string;
  
  /**
   * Postal code
   */
  postalCode: string;
  
  /**
   * Phone number
   */
  phoneNumber?: string;
}

/**
 * Money value
 */
export interface Money {
  /**
   * Currency code
   */
  currencyCode: string;
  
  /**
   * Amount
   */
  amount: string;
}

/**
 * Create fulfillment order item
 */
export interface CreateFulfillmentOrderItem {
  /**
   * Seller SKU
   */
  sellerSku: string;
  
  /**
   * Seller fulfillment order item ID
   */
  sellerFulfillmentOrderItemId: string;
  
  /**
   * Quantity to ship
   */
  quantity: number;
  
  /**
   * Gift message
   */
  giftMessage?: string;
  
  /**
   * Display comment
   */
  displayableComment?: string;
  
  /**
   * Fulfillment network SKU
   */
  fulfillmentNetworkSku?: string;
  
  /**
   * Per unit declared value
   */
  perUnitDeclaredValue?: Money;
  
  /**
   * Per unit price
   */
  perUnitPrice?: Money;
}

/**
 * Delivery window
 */
export interface DeliveryWindow {
  /**
   * Start date
   */
  startDate: Date;
  
  /**
   * End date
   */
  endDate: Date;
}

/**
 * COD settings
 */
export interface CODSettings {
  /**
   * Whether COD is required
   */
  isCodRequired: boolean;
  
  /**
   * COD charge
   */
  codCharge?: Money;
  
  /**
   * COD charge tax
   */
  codChargeTax?: Money;
  
  /**
   * Shipping charge
   */
  shippingCharge?: Money;
  
  /**
   * Shipping charge tax
   */
  shippingChargeTax?: Money;
}

/**
 * Feature constraint
 */
export interface FeatureConstraint {
  /**
   * Feature name
   */
  featureName: string;
  
  /**
   * Whether the fulfillment policy is enabled
   */
  fulfillmentPolicyEnabled: boolean;
}

/**
 * Create fulfillment order request
 */
export interface CreateFulfillmentOrderRequest {
  /**
   * Seller fulfillment order ID
   */
  sellerFulfillmentOrderId: string;
  
  /**
   * Fulfillment action (Ship or Hold)
   */
  fulfillmentAction?: FulfillmentAction;
  
  /**
   * Display order ID
   */
  displayableOrderId: string;
  
  /**
   * Display order date
   */
  displayableOrderDate?: Date;
  
  /**
   * Display order comment
   */
  displayableOrderComment?: string;
  
  /**
   * Shipping speed category
   */
  shippingSpeedCategory: ShippingSpeedCategory;
  
  /**
   * Delivery window
   */
  deliveryWindow?: DeliveryWindow;
  
  /**
   * Destination address
   */
  destinationAddress: Address;
  
  /**
   * Fulfillment order items
   */
  items: CreateFulfillmentOrderItem[];
  
  /**
   * Delivery instructions
   */
  deliveryInstructions?: string;
  
  /**
   * COD settings
   */
  codSettings?: CODSettings;
  
  /**
   * Ship from country code
   */
  shipFromCountryCode?: string;
  
  /**
   * Notification emails
   */
  notificationEmails?: string[];
  
  /**
   * Feature constraints
   */
  featureConstraints?: FeatureConstraint[];
}

/**
 * Update fulfillment order request
 */
export interface UpdateFulfillmentOrderRequest {
  /**
   * Fulfillment action (Ship or Hold)
   */
  fulfillmentAction?: FulfillmentAction;
  
  /**
   * Display order ID
   */
  displayableOrderId?: string;
  
  /**
   * Display order date
   */
  displayableOrderDate?: Date;
  
  /**
   * Display order comment
   */
  displayableOrderComment?: string;
  
  /**
   * Shipping speed category
   */
  shippingSpeedCategory?: ShippingSpeedCategory;
  
  /**
   * Destination address
   */
  destinationAddress?: Address;
  
  /**
   * Fulfillment order items
   */
  items?: CreateFulfillmentOrderItem[];
  
  /**
   * Delivery instructions
   */
  deliveryInstructions?: string;
  
  /**
   * Notification emails
   */
  notificationEmails?: string[];
  
  /**
   * Feature constraints
   */
  featureConstraints?: FeatureConstraint[];
}

/**
 * Fulfillment order item
 */
export interface FulfillmentOrderItem {
  /**
   * Seller SKU
   */
  sellerSku: string;
  
  /**
   * Seller fulfillment order item ID
   */
  sellerFulfillmentOrderItemId: string;
  
  /**
   * Quantity
   */
  quantity: number;
  
  /**
   * Gift message
   */
  giftMessage?: string;
  
  /**
   * Displayable comment
   */
  displayableComment?: string;
  
  /**
   * Fulfillment network SKU
   */
  fulfillmentNetworkSku?: string;
  
  /**
   * Order item disposition
   */
  orderItemDisposition?: string;
  
  /**
   * Cancelled quantity
   */
  cancelledQuantity?: number;
  
  /**
   * Unfulfillable quantity
   */
  unfulfillableQuantity?: number;
  
  /**
   * Estimated ship date
   */
  estimatedShipDate?: string;
  
  /**
   * Estimated arrival date
   */
  estimatedArrivalDate?: string;
  
  /**
   * Per unit price
   */
  perUnitPrice?: Money;
  
  /**
   * Per unit tax
   */
  perUnitTax?: Money;
  
  /**
   * Per unit declared value
   */
  perUnitDeclaredValue?: Money;
}

/**
 * Fulfillment shipment item
 */
export interface FulfillmentShipmentItem {
  /**
   * Seller SKU
   */
  sellerSku: string;
  
  /**
   * Seller fulfillment order item ID
   */
  sellerFulfillmentOrderItemId: string;
  
  /**
   * Quantity
   */
  quantity: number;
  
  /**
   * Package number
   */
  packageNumber?: number;
  
  /**
   * Serial number
   */
  serialNumber?: string;
}

/**
 * Fulfillment shipment package
 */
export interface FulfillmentShipmentPackage {
  /**
   * Package number
   */
  packageNumber: number;
  
  /**
   * Carrier code
   */
  carrierCode: string;
  
  /**
   * Tracking number
   */
  trackingNumber: string;
  
  /**
   * Estimated arrival date
   */
  estimatedArrivalDate?: string;
}

/**
 * Fulfillment shipment
 */
export interface FulfillmentShipment {
  /**
   * Amazon shipment ID
   */
  amazonShipmentId: string;
  
  /**
   * Fulfillment center ID
   */
  fulfillmentCenterId: string;
  
  /**
   * Fulfillment shipment status
   */
  fulfillmentShipmentStatus: string;
  
  /**
   * Shipping date
   */
  shippingDate?: string;
  
  /**
   * Estimated arrival date
   */
  estimatedArrivalDate?: string;
  
  /**
   * Shipping notes
   */
  shippingNotes?: string[];
  
  /**
   * Fulfillment shipment items
   */
  fulfillmentShipmentItem: FulfillmentShipmentItem[];
  
  /**
   * Fulfillment shipment packages
   */
  fulfillmentShipmentPackage?: FulfillmentShipmentPackage[];
}

/**
 * Return item
 */
export interface ReturnItem {
  /**
   * Seller return item ID
   */
  sellerReturnItemId: string;
  
  /**
   * Seller fulfillment order item ID
   */
  sellerFulfillmentOrderItemId: string;
  
  /**
   * Amazon shipment ID
   */
  amazonShipmentId: string;
  
  /**
   * Seller return reason code
   */
  sellerReturnReasonCode?: string;
  
  /**
   * Return comment
   */
  returnComment?: string;
  
  /**
   * Return status
   */
  returnStatus: string;
  
  /**
   * Return authorization ID
   */
  returnAuthorizationId?: string;
  
  /**
   * Return received condition
   */
  returnReceivedCondition?: string;
  
  /**
   * Fulfillment center ID
   */
  fulfillmentCenterId?: string;
}

/**
 * Return authorization
 */
export interface ReturnAuthorization {
  /**
   * Return authorization ID
   */
  returnAuthorizationId: string;
  
  /**
   * Fulfillment center ID
   */
  fulfillmentCenterId: string;
  
  /**
   * Return to address
   */
  returnToAddress: Address;
  
  /**
   * Amazon RMA ID
   */
  amazonRmaId?: string;
  
  /**
   * RMA page URL
   */
  rmaPageUrl?: string;
}

/**
 * Fulfillment order
 */
export interface FulfillmentOrder {
  /**
   * Seller fulfillment order ID
   */
  sellerFulfillmentOrderId: string;
  
  /**
   * Marketplace ID
   */
  marketplaceId: string;
  
  /**
   * Display order ID
   */
  displayableOrderId: string;
  
  /**
   * Display order date
   */
  displayableOrderDate?: string;
  
  /**
   * Display order comment
   */
  displayableOrderComment?: string;
  
  /**
   * Shipping speed category
   */
  shippingSpeedCategory: string;
  
  /**
   * Fulfillment action
   */
  fulfillmentAction?: string;
  
  /**
   * Fulfillment policy
   */
  fulfillmentPolicy?: string;
  
  /**
   * Received date
   */
  receivedDate: string;
  
  /**
   * Fulfillment order status
   */
  fulfillmentOrderStatus: string;
  
  /**
   * Status updated date
   */
  statusUpdatedDate: string;
  
  /**
   * Notification emails
   */
  notificationEmails?: string[];
  
  /**
   * Destination address
   */
  destinationAddress: Address;
}

/**
 * Get fulfillment order response
 */
export interface GetFulfillmentOrderResponse {
  /**
   * Fulfillment order
   */
  fulfillmentOrder: FulfillmentOrder;
  
  /**
   * Fulfillment order items
   */
  fulfillmentOrderItems: FulfillmentOrderItem[];
  
  /**
   * Fulfillment shipments
   */
  fulfillmentShipments?: FulfillmentShipment[];
  
  /**
   * Return items
   */
  returnItems?: ReturnItem[];
  
  /**
   * Return authorizations
   */
  returnAuthorizations?: ReturnAuthorization[];
}

/**
 * Tracking event
 */
export interface TrackingEvent {
  /**
   * Event date
   */
  eventDate: string;
  
  /**
   * Event address
   */
  eventAddress: Address;
  
  /**
   * Event code
   */
  eventCode: string;
  
  /**
   * Event description
   */
  eventDescription: string;
}

/**
 * Package tracking details
 */
export interface PackageTrackingDetails {
  /**
   * Package number
   */
  packageNumber: string;
  
  /**
   * Tracking number
   */
  trackingNumber: string;
  
  /**
   * Carrier code
   */
  carrierCode: string;
  
  /**
   * Carrier URL
   */
  carrierUrl?: string;
  
  /**
   * Carrier phone number
   */
  carrierPhoneNumber?: string;
  
  /**
   * Carrier email address
   */
  carrierEmailAddress?: string;
  
  /**
   * Ship date
   */
  shipDate?: string;
  
  /**
   * Estimated arrival date
   */
  estimatedArrivalDate?: string;
  
  /**
   * Ship to address
   */
  shipToAddress: Address;
  
  /**
   * Current status
   */
  currentStatus: string;
  
  /**
   * Current status description
   */
  currentStatusDescription?: string;
  
  /**
   * Signed for by
   */
  signedForBy?: string;
  
  /**
   * Additional location info
   */
  additionalLocationInfo?: string;
  
  /**
   * Tracking events
   */
  trackingEvents?: TrackingEvent[];
}

/**
 * Get fulfillment orders parameters
 */
export interface GetFulfillmentOrdersParams {
  /**
   * Query start date
   */
  queryStartDate?: Date;
  
  /**
   * Next token for pagination
   */
  nextToken?: string;
}

/**
 * List fulfillment orders response
 */
export interface ListFulfillmentOrdersResponse {
  /**
   * Fulfillment orders
   */
  fulfillmentOrders: FulfillmentOrder[];
  
  /**
   * Next token for pagination
   */
  nextToken?: string;
}

/**
 * Error response
 */
export interface ErrorResponse {
  /**
   * Error list
   */
  errors?: {
    /**
     * Error code
     */
    code: string;
    
    /**
     * Error message
     */
    message: string;
    
    /**
     * Error details
     */
    details?: string;
  }[];
}

/**
 * Multi-channel fulfillment order request item
 */
export interface MCFOrderItem {
  /**
   * Seller SKU
   */
  sellerSku: string;
  
  /**
   * Quantity
   */
  quantity: number;
  
  /**
   * Comment
   */
  comment?: string;
}

/**
 * Multi-channel fulfillment order result
 */
export interface MCFOrderResult {
  /**
   * Success flag
   */
  success: boolean;
  
  /**
   * Result message
   */
  message: string;
  
  /**
   * Fulfillment order ID
   */
  fulfillmentOrderId: string;
}

/**
 * Fulfillment outbound module options
 */
export interface FulfillmentOutboundModuleOptions {
  /**
   * Default shipping speed category
   */
  defaultShippingSpeedCategory?: ShippingSpeedCategory;
  
  /**
   * Default fulfillment action
   */
  defaultFulfillmentAction?: FulfillmentAction;
  
  /**
   * Default page size for listing
   */
  defaultPageSize?: number;
  
  /**
   * Maximum pages to retrieve for paginated requests
   */
  maxPaginationPages?: number;
}

/**
 * Implementation of the Amazon Fulfillment Outbound API
 */
export class FulfillmentOutboundModule implements BaseModule<FulfillmentOutboundModuleOptions> {
  /**
   * The unique identifier for this module
   */
  public readonly moduleId: string = 'fulfillmentOutbound';
  
  /**
   * The human-readable name of this module
   */
  public readonly moduleName: string = 'Fulfillment Outbound';
  
  /**
   * The base URL path for API requests
   */
  public readonly basePath: string;
  
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
  public readonly options: FulfillmentOutboundModuleOptions = {
    defaultShippingSpeedCategory: 'Standard',
    defaultFulfillmentAction: 'Ship',
    defaultPageSize: 10,
    maxPaginationPages: 10
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
    options?: FulfillmentOutboundModuleOptions
  ) {
    this.apiVersion = apiVersion;
    this.apiRequest = apiRequest;
    this.marketplaceId = marketplaceId;
    this.basePath = `/fba/outbound/${apiVersion}`;
    
    if (options) {
      this.options = {
        ...this.options,
        ...options
      };
    }
  }
  
  /**
   * Create a fulfillment order
   * @param request Create fulfillment order request
   * @returns Fulfillment order
   */
  public async createFulfillmentOrder(request: CreateFulfillmentOrderRequest): Promise<ApiResponse<void>> {
    if (!request.sellerFulfillmentOrderId) {
      throw AmazonErrorHandler.createError(
        'Seller fulfillment order ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      // Prepare request body
      const requestBody: CreateFulfillmentOrderRequest = {
        ...request
      };
      
      // Convert dates to ISO strings
      if (requestBody.displayableOrderDate && requestBody.displayableOrderDate instanceof Date) {
        requestBody.displayableOrderDate = new Date(requestBody.displayableOrderDate.toISOString());
      }
      
      if (requestBody.deliveryWindow) {
        if (requestBody.deliveryWindow.startDate instanceof Date) {
          requestBody.deliveryWindow.startDate = new Date(requestBody.deliveryWindow.startDate.toISOString());
        }
        if (requestBody.deliveryWindow.endDate instanceof Date) {
          requestBody.deliveryWindow.endDate = new Date(requestBody.deliveryWindow.endDate.toISOString());
        }
      }
      
      return await this.apiRequest(
        'POST',
        `${this.basePath}/fulfillmentOrders`,
        requestBody
      );
    } catch (error) {
      throw error instanceof Error
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED, error)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Update a fulfillment order
   * @param sellerFulfillmentOrderId Seller fulfillment order ID
   * @param request Update fulfillment order request
   * @returns Fulfillment order
   */
  public async updateFulfillmentOrder(
    sellerFulfillmentOrderId: string,
    request: UpdateFulfillmentOrderRequest
  ): Promise<ApiResponse<void>> {
    if (!sellerFulfillmentOrderId) {
      throw AmazonErrorHandler.createError(
        'Seller fulfillment order ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      // Prepare request body
      const requestBody: UpdateFulfillmentOrderRequest = {
        ...request
      };
      
      // Convert dates to ISO strings
      if (requestBody.displayableOrderDate && requestBody.displayableOrderDate instanceof Date) {
        requestBody.displayableOrderDate = new Date(requestBody.displayableOrderDate.toISOString());
      }
      
      return await this.apiRequest(
        'PUT',
        `${this.basePath}/fulfillmentOrders/${encodeURIComponent(sellerFulfillmentOrderId)}`,
        requestBody
      );
    } catch (error) {
      throw error instanceof Error
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED, error)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Get a fulfillment order
   * @param sellerFulfillmentOrderId Seller fulfillment order ID
   * @returns Fulfillment order
   */
  public async getFulfillmentOrder(sellerFulfillmentOrderId: string): Promise<ApiResponse<{ payload: GetFulfillmentOrderResponse }>> {
    if (!sellerFulfillmentOrderId) {
      throw AmazonErrorHandler.createError(
        'Seller fulfillment order ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.apiRequest(
        'GET',
        `${this.basePath}/fulfillmentOrders/${encodeURIComponent(sellerFulfillmentOrderId)}`
      );
    } catch (error) {
      throw error instanceof Error
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED, error)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Get fulfillment orders
   * @param params Parameters for getting fulfillment orders
   * @returns Fulfillment orders
   */
  public async listFulfillmentOrders(
    params: GetFulfillmentOrdersParams = {}
  ): Promise<ApiResponse<{ payload: ListFulfillmentOrdersResponse }>> {
    const queryParams: Record<string, string> = {};
    
    // Add query parameters
    if (params.queryStartDate) {
      queryParams.queryStartDate = params.queryStartDate.toISOString();
    }
    
    if (params.nextToken) {
      queryParams.nextToken = params.nextToken;
    }
    
    try {
      return await this.apiRequest(
        'GET',
        `${this.basePath}/fulfillmentOrders`,
        { params: queryParams }
      );
    } catch (error) {
      throw error instanceof Error
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED, error)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Cancel a fulfillment order
   * @param sellerFulfillmentOrderId Seller fulfillment order ID
   * @returns Cancellation status
   */
  public async cancelFulfillmentOrder(sellerFulfillmentOrderId: string): Promise<ApiResponse<void>> {
    if (!sellerFulfillmentOrderId) {
      throw AmazonErrorHandler.createError(
        'Seller fulfillment order ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.apiRequest(
        'PUT',
        `${this.basePath}/fulfillmentOrders/${encodeURIComponent(sellerFulfillmentOrderId)}/cancel`
      );
    } catch (error) {
      throw error instanceof Error
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED, error)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Get tracking information for a package
   * @param packageNumber Package number
   * @returns Tracking information
   */
  public async getPackageTrackingDetails(
    packageNumber: string
  ): Promise<ApiResponse<{ payload: PackageTrackingDetails }>> {
    if (!packageNumber) {
      throw AmazonErrorHandler.createError(
        'Package number is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.apiRequest(
        'GET',
        `${this.basePath}/tracking`,
        { params: { packageNumber } }
      );
    } catch (error) {
      throw error instanceof Error
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED, error)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Get all fulfillment orders with pagination handling
   * @param queryStartDate Start date for the query
   * @param maxPages Maximum number of pages to retrieve
   * @returns All fulfillment orders
   */
  public async getAllFulfillmentOrders(
    queryStartDate?: Date,
    maxPages: number = this.options.maxPaginationPages || 10
  ): Promise<FulfillmentOrder[]> {
    let currentPage = 1;
    let nextToken: string | undefined = undefined;
    const allFulfillmentOrders: FulfillmentOrder[] = [];
    
    do {
      // Get a page of fulfillment orders
      const response = await this.listFulfillmentOrders({
        queryStartDate,
        nextToken
      });
      
      // Add fulfillment orders to our collection
      if (response.data.payload.fulfillmentOrders && response.data.payload.fulfillmentOrders.length > 0) {
        allFulfillmentOrders.push(...response.data.payload.fulfillmentOrders);
      }
      
      // Get next token for pagination
      nextToken = response.data.payload.nextToken;
      currentPage++;
      
      // Stop if we've reached the max pages or there are no more pages
    } while (nextToken && currentPage <= maxPages);
    
    return allFulfillmentOrders;
  }
  
  /**
   * Get recent fulfillment orders
   * @param days Number of days to look back
   * @returns Recent fulfillment orders
   */
  public async getRecentFulfillmentOrders(days: number = 30): Promise<FulfillmentOrder[]> {
    // Calculate the start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get all fulfillment orders created after the start date
    return this.getAllFulfillmentOrders(startDate);
  }
  
  /**
   * Create a multi-channel fulfillment order
   * @param orderId Order ID
   * @param shipToAddress Ship to address
   * @param items Items to ship
   * @param shippingSpeedCategory Shipping speed category
   * @returns Fulfillment order result
   */
  public async createMultiChannelFulfillmentOrder(
    orderId: string,
    shipToAddress: Address,
    items: MCFOrderItem[],
    shippingSpeedCategory: ShippingSpeedCategory = this.options.defaultShippingSpeedCategory || 'Standard'
  ): Promise<MCFOrderResult> {
    if (!orderId) {
      throw AmazonErrorHandler.createError(
        'Order ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!shipToAddress) {
      throw AmazonErrorHandler.createError(
        'Ship to address is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!items || items.length === 0) {
      throw AmazonErrorHandler.createError(
        'At least one item is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Create fulfillment order items
    const fulfillmentOrderItems: CreateFulfillmentOrderItem[] = items.map((item, index) => ({
      sellerSku: item.sellerSku,
      sellerFulfillmentOrderItemId: `${orderId}-${index + 1}`,
      quantity: item.quantity,
      displayableComment: item.comment || ''
    }));
    
    // Create fulfillment order
    const fulfillmentOrderId = `MCF-${orderId}-${Date.now()}`;
    
    const request: CreateFulfillmentOrderRequest = {
      sellerFulfillmentOrderId: fulfillmentOrderId,
      displayableOrderId: orderId,
      displayableOrderDate: new Date(),
      displayableOrderComment: 'Multi-channel fulfillment order',
      shippingSpeedCategory,
      destinationAddress: shipToAddress,
      items: fulfillmentOrderItems
    };
    
    try {
      await this.createFulfillmentOrder(request);
      
      return {
        success: true,
        message: 'Fulfillment order created successfully',
        fulfillmentOrderId
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Failed to create fulfillment order: ${errorMessage}`,
        fulfillmentOrderId
      };
    }
  }
  
  /**
   * Get fulfillment orders by status
   * @param status Status to filter by
   * @param maxPages Maximum number of pages to retrieve
   * @returns Filtered fulfillment orders
   */
  public async getFulfillmentOrdersByStatus(
    status: FulfillmentOrderStatus,
    maxPages: number = this.options.maxPaginationPages || 10
  ): Promise<FulfillmentOrder[]> {
    const orders = await this.getAllFulfillmentOrders(undefined, maxPages);
    return orders.filter(order => order.fulfillmentOrderStatus === status);
  }
  
  /**
   * Get detailed information for multiple fulfillment orders
   * @param orderIds Array of fulfillment order IDs
   * @returns Detailed fulfillment order information
   */
  public async getDetailedFulfillmentOrders(
    orderIds: string[]
  ): Promise<Map<string, GetFulfillmentOrderResponse>> {
    const result = new Map<string, GetFulfillmentOrderResponse>();
    
    for (const orderId of orderIds) {
      try {
        const response = await this.getFulfillmentOrder(orderId);
        result.set(orderId, response.data.payload);
      } catch (error) {
        console.error(`Error fetching fulfillment order ${orderId}:`, error);
        // Continue with other orders even if one fails
      }
    }
    
    return result;
  }
  
  /**
   * Check if a fulfillment order exists
   * @param orderId Fulfillment order ID
   * @returns Whether the order exists
   */
  public async doesFulfillmentOrderExist(orderId: string): Promise<boolean> {
    try {
      await this.getFulfillmentOrder(orderId);
      return true;
    } catch (error) {
      // If it's a 404 error, the order doesn't exist
      if (error instanceof Error && 
          error.message.includes('404') || 
          error.message.includes('not found') || 
          error.message.includes('does not exist')) {
        return false;
      }
      // Rethrow any other error
      throw error;
    }
  }
  
  /**
   * Get unfulfillable orders
   * @param maxPages Maximum number of pages to retrieve
   * @returns Unfulfillable orders
   */
  public async getUnfulfillableOrders(
    maxPages: number = this.options.maxPaginationPages || 10
  ): Promise<FulfillmentOrder[]> {
    return this.getFulfillmentOrdersByStatus(FulfillmentOrderStatus.UNFULFILLABLE, maxPages);
  }
}