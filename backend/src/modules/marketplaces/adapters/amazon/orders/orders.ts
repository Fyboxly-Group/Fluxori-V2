/**
 * Amazon Orders API Module
 * 
 * Implements the Amazon SP-API Orders API functionality.
 * This module handles order retrieval, management, and fulfillment operations.
 */

import { ApiModule, ApiRequestFunction, ApiResponse } from '../core/api-module';
import { AmazonErrorHandler, AmazonErrorCode } from '../utils/amazon-error';
import { BatchProcessor } from '../utils/batch-processor';

/**
 * Order status types
 */
export enum OrderStatus {
  PENDING = 'Pending',
  UNSHIPPED = 'Unshipped',
  PARTIALLY_SHIPPED = 'PartiallyShipped',
  SHIPPED = 'Shipped',
  CANCELED = 'Canceled',
  UNFULFILLABLE = 'Unfulfillable',
  INVOICE_UNCONFIRMED = 'InvoiceUnconfirmed',
  PENDING_AVAILABILITY = 'PendingAvailability'
}

/**
 * Order fulfillment channel
 */
export enum FulfillmentChannel {
  MFN = 'MFN', // Merchant Fulfilled Network (seller fulfilled)
  AFN = 'AFN'  // Amazon Fulfilled Network (FBA)
}

/**
 * Payment method for the order
 */
export enum PaymentMethod {
  COD = 'COD',                     // Cash On Delivery
  CVS = 'CVS',                     // Convenience Store
  OTHER = 'Other'                  // Any other payment method
}

/**
 * Order address details
 */
export interface Address {
  /**
   * Name of the person
   */
  name: string;
  
  /**
   * First line of the address
   */
  addressLine1?: string;
  
  /**
   * Second line of the address
   */
  addressLine2?: string;
  
  /**
   * Third line of the address
   */
  addressLine3?: string;
  
  /**
   * City of the address
   */
  city?: string;
  
  /**
   * County of the address
   */
  county?: string;
  
  /**
   * District of the address
   */
  district?: string;
  
  /**
   * State or region of the address
   */
  stateOrRegion?: string;
  
  /**
   * Municipality of the address
   */
  municipality?: string;
  
  /**
   * Postal code of the address
   */
  postalCode?: string;
  
  /**
   * Country code of the address (ISO 3166-1 alpha-2 format)
   */
  countryCode?: string;
  
  /**
   * Phone number of the address
   */
  phone?: string;
  
  /**
   * Address type
   */
  addressType?: string;
}

/**
 * Money value with currency
 */
export interface Money {
  /**
   * Currency code (ISO 4217 format)
   */
  currencyCode: string;
  
  /**
   * Monetary value
   */
  amount: string;
}

/**
 * Tax collection model
 */
export enum TaxCollectionModel {
  MARKETPLACE = 'MarketplaceFacilitator',
  SELLER = 'Standard'
}

/**
 * Parameters for getting orders
 */
export interface GetOrdersParams {
  /**
   * Filter by created after timestamp (ISO 8601 format)
   */
  createdAfter?: string;
  
  /**
   * Filter by created before timestamp (ISO 8601 format)
   */
  createdBefore?: string;
  
  /**
   * Filter by last updated after timestamp (ISO 8601 format)
   */
  lastUpdatedAfter?: string;
  
  /**
   * Filter by last updated before timestamp (ISO 8601 format)
   */
  lastUpdatedBefore?: string;
  
  /**
   * Filter by order statuses
   */
  orderStatuses?: OrderStatus[];
  
  /**
   * Filter by marketplace IDs
   */
  marketplaceIds?: string[];
  
  /**
   * Filter by fulfillment channels
   */
  fulfillmentChannels?: FulfillmentChannel[];
  
  /**
   * Filter by payment methods
   */
  paymentMethods?: PaymentMethod[];
  
  /**
   * Filter by buyer email
   */
  buyerEmail?: string;
  
  /**
   * Filter by seller order ID
   */
  sellerOrderId?: string;
  
  /**
   * Maximum number of results to return
   */
  maxResultsPerPage?: number;
  
  /**
   * For pagination - token to retrieve the next page of results
   */
  nextToken?: string;
  
  /**
   * Filter by Amazon order IDs
   */
  amazonOrderIds?: string[];
  
  /**
   * Include additional data sets in the response
   */
  dataElements?: Array<'buyerInfo' | 'shippingAddress' | 'orderItems'>;
}

/**
 * Order item input for creating shipment
 */
export interface OrderItemInput {
  /**
   * Order item ID
   */
  orderItemId: string;
  
  /**
   * Quantity to ship
   */
  quantity: number;
}

/**
 * Parameters for creating a shipment
 */
export interface CreateShipmentParams {
  /**
   * Amazon order ID
   */
  amazonOrderId: string;
  
  /**
   * Items to include in the shipment
   */
  items: OrderItemInput[];
  
  /**
   * Shipping service used
   */
  shippingServiceId: string;
  
  /**
   * Tracking number(s) for the shipment
   */
  trackingNumber?: string;
  
  /**
   * Tracking URL for the shipment
   */
  trackingUrl?: string;
  
  /**
   * Multiple tracking numbers (if applicable)
   */
  trackingNumbers?: string[];
  
  /**
   * Ship date (ISO 8601 format)
   */
  shipDate?: string;
  
  /**
   * Shipping notes
   */
  shippingNote?: string;
}

/**
 * Order item buy request
 */
export interface OrderItemBuyerInfo {
  /**
   * Order item ID
   */
  orderItemId: string;
  
  /**
   * Buyer customization
   */
  buyerCustomization?: {
    customizationLabel?: string;
    customizationValue?: string;
  };
  
  /**
   * Gift wrap price
   */
  giftWrapPrice?: Money;
  
  /**
   * Gift message text
   */
  giftMessageText?: string;
  
  /**
   * Gift wrap level
   */
  giftWrapLevel?: string;
}

/**
 * Product information for order item
 */
export interface ProductInfo {
  /**
   * Product name
   */
  productName?: string;
  
  /**
   * Product codes
   */
  productCodes?: Array<{
    /**
     * Type of product code
     */
    productCodeType: 'ASIN' | 'ISBN' | 'UPC' | 'EAN' | 'GTIN' | 'GCID';
    
    /**
     * Product code value
     */
    productCodeValue: string;
  }>;
  
  /**
   * Number of items
   */
  numberOfItems?: number;
}

/**
 * Order item details
 */
export interface OrderItem {
  /**
   * ASIN of the item
   */
  ASIN: string;
  
  /**
   * Seller SKU of the item
   */
  SellerSKU?: string;
  
  /**
   * Order item ID
   */
  OrderItemId: string;
  
  /**
   * Title of the item
   */
  Title?: string;
  
  /**
   * Quantity ordered
   */
  QuantityOrdered: number;
  
  /**
   * Quantity shipped
   */
  QuantityShipped?: number;
  
  /**
   * Product information
   */
  ProductInfo?: ProductInfo;
  
  /**
   * Item price
   */
  ItemPrice?: Money;
  
  /**
   * Item tax
   */
  ItemTax?: Money;
  
  /**
   * Shipping price
   */
  ShippingPrice?: Money;
  
  /**
   * Shipping tax
   */
  ShippingTax?: Money;
  
  /**
   * Shipping discount
   */
  ShippingDiscount?: Money;
  
  /**
   * Shipping discount tax
   */
  ShippingDiscountTax?: Money;
  
  /**
   * Promotion discount
   */
  PromotionDiscount?: Money;
  
  /**
   * Promotion discount tax
   */
  PromotionDiscountTax?: Money;
  
  /**
   * Condition note from the seller
   */
  ConditionNote?: string;
  
  /**
   * Condition ID of the item
   */
  ConditionId?: string;
  
  /**
   * Condition of the item
   */
  ConditionSubtypeId?: string;
  
  /**
   * Schedule delivery start date
   */
  ScheduledDeliveryStartDate?: string;
  
  /**
   * Schedule delivery end date
   */
  ScheduledDeliveryEndDate?: string;
  
  /**
   * Buyer info
   */
  BuyerInfo?: OrderItemBuyerInfo;
  
  /**
   * Tax collection for this item
   */
  TaxCollection?: {
    /**
     * Model of tax collection
     */
    Model: TaxCollectionModel;
    
    /**
     * Party responsible for tax collection
     */
    ResponsibleParty: string;
  };
}

/**
 * Order details
 */
export interface Order {
  /**
   * Amazon-defined order identifier in 3-7-7 format
   */
  AmazonOrderId: string;
  
  /**
   * Merchant-defined order identifier
   */
  SellerOrderId?: string;
  
  /**
   * When the order was placed (ISO 8601 format)
   */
  PurchaseDate: string;
  
  /**
   * When the order was last updated (ISO 8601 format)
   */
  LastUpdateDate: string;
  
  /**
   * Current status of the order
   */
  OrderStatus: OrderStatus;
  
  /**
   * How the order was fulfilled
   */
  FulfillmentChannel?: FulfillmentChannel;
  
  /**
   * Channel where the order was placed
   */
  SalesChannel?: string;
  
  /**
   * How the order was shipped
   */
  ShipServiceLevel?: string;
  
  /**
   * Order price amount with currency code
   */
  OrderTotal?: Money;
  
  /**
   * Number of items in the order
   */
  NumberOfItemsShipped?: number;
  
  /**
   * Number of items not yet shipped
   */
  NumberOfItemsUnshipped?: number;
  
  /**
   * Details about payment method
   */
  PaymentMethodDetails?: string[];
  
  /**
   * Payment method used
   */
  PaymentMethod?: PaymentMethod;
  
  /**
   * Marketplace where the order was placed
   */
  MarketplaceId?: string;
  
  /**
   * Shipping address
   */
  ShippingAddress?: Address;
  
  /**
   * Billing address
   */
  BillingAddress?: Address;
  
  /**
   * Buyer information
   */
  BuyerInfo?: {
    /**
     * Email address of the buyer
     */
    BuyerEmail?: string;
    
    /**
     * Name of the buyer
     */
    BuyerName?: string;
    
    /**
     * County of the buyer
     */
    BuyerCounty?: string;
    
    /**
     * Tax information of the buyer
     */
    BuyerTaxInfo?: {
      /**
       * Tax classification of the buyer
       */
      TaxClassifications?: Array<{
        /**
         * Type of tax classification
         */
        Name?: string;
        
        /**
         * Value of tax classification
         */
        Value?: string;
      }>;
      
      /**
       * Type of tax information
       */
      CompanyLegalName?: string;
      
      /**
       * Tax registration ID
       */
      TaxingRegion?: string;
    };
    
    /**
     * Purchase order number
     */
    PurchaseOrderNumber?: string;
  };
  
  /**
   * Whether the order is premium order
   */
  IsReplacementOrder?: boolean;
  
  /**
   * Replaced order ID if this is a replacement
   */
  ReplacedOrderId?: string;
  
  /**
   * Promise response date by which order must be shipped (ISO 8601 format)
   */
  PromiseResponseDueDate?: string;
  
  /**
   * Promised delivery date (ISO 8601 format)
   */
  PromisedDeliveryDate?: string;
  
  /**
   * Earliest delivery date (ISO 8601 format)
   */
  EarliestDeliveryDate?: string;
  
  /**
   * Latest delivery date (ISO 8601 format)
   */
  LatestDeliveryDate?: string;
  
  /**
   * Earliest ship date (ISO 8601 format)
   */
  EarliestShipDate?: string;
  
  /**
   * Latest ship date (ISO 8601 format)
   */
  LatestShipDate?: string;
  
  /**
   * Whether order is a business order
   */
  IsBusinessOrder?: boolean;
  
  /**
   * Whether order is from Amazon Prime
   */
  IsPrime?: boolean;
  
  /**
   * Whether order is a premium order
   */
  IsPremiumOrder?: boolean;
  
  /**
   * Whether order was shipped globally
   */
  IsGlobalExpressEnabled?: boolean;
  
  /**
   * Tax collection model
   */
  TaxCollection?: {
    /**
     * Model of tax collection
     */
    Model: TaxCollectionModel;
    
    /**
     * Party responsible for tax collection
     */
    ResponsibleParty: string;
  };
}

/**
 * Namespace for Amazon SP-API Orders API response types
 */
export namespace AmazonSPApi {
  /**
   * Orders API namespace
   */
  export namespace Orders {
    /**
     * Response for get orders API
     */
    export interface GetOrdersResponse {
      /**
       * List of orders
       */
      Orders: Order[];
      
      /**
       * Token for retrieving the next page of results
       */
      NextToken?: string;
      
      /**
       * Time when the response was generated (ISO 8601 format)
       */
      LastUpdatedBefore?: string;
      
      /**
       * Time the search criteria uses for selecting orders (ISO 8601 format)
       */
      CreatedBefore?: string;
    }
    
    /**
     * Response for get order API
     */
    export interface GetOrderResponse {
      /**
       * Order details
       */
      Order: Order;
    }
    
    /**
     * Response for get order items API
     */
    export interface GetOrderItemsResponse {
      /**
       * Order item details
       */
      OrderItems: OrderItem[];
      
      /**
       * Amazon-defined order identifier
       */
      AmazonOrderId: string;
      
      /**
       * Token for retrieving the next page of results
       */
      NextToken?: string;
    }
    
    /**
     * Response for create shipment API
     */
    export interface CreateShipmentResponse {
      /**
       * Shipment details
       */
      Shipment: {
        /**
         * Shipment ID
         */
        ShipmentId: string;
        
        /**
         * Amazon order ID
         */
        AmazonOrderId: string;
        
        /**
         * Shipping service ID
         */
        ShippingServiceId: string;
        
        /**
         * Tracking information
         */
        TrackingInformation?: {
          /**
           * Tracking number
           */
          TrackingNumber?: string;
          
          /**
           * Multiple tracking numbers if applicable
           */
          TrackingNumbers?: string[];
          
          /**
           * URL for tracking the shipment
           */
          TrackingUrl?: string;
        };
        
        /**
         * Items included in this shipment
         */
        Items: Array<{
          /**
           * Order item ID
           */
          OrderItemId: string;
          
          /**
           * Quantity shipped
           */
          Quantity: number;
        }>;
        
        /**
         * When the shipment was created (ISO 8601 format)
         */
        ShipDate?: string;
        
        /**
         * Additional notes for the shipment
         */
        ShippingNote?: string;
        
        /**
         * When the shipment was last updated (ISO 8601 format)
         */
        LastUpdatedDate?: string;
      };
    }
  }
}

/**
 * Implementation of the Amazon Orders API
 */
export class OrdersModule extends ApiModule {
  /**
   * Module identifier
   */
  readonly moduleId = 'orders';
  
  /**
   * Human-readable module name
   */
  readonly moduleName = 'Orders API';
  
  /**
   * API version for this module
   */
  readonly apiVersion: string;
  
  /**
   * Base path for API requests
   */
  readonly basePath: string;
  
  /**
   * Batch processor for handling multiple orders
   */
  private batchProcessor: BatchProcessor;

  /**
   * Constructor
   * @param apiVersion API version
   * @param apiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   */
  constructor(
    apiVersion: string, 
    apiRequest: ApiRequestFunction,
    marketplaceId: string
  ) {
    super(apiRequest, marketplaceId, {});
    
    this.apiVersion = apiVersion;
    this.basePath = `/orders/${apiVersion}`;
    this.batchProcessor = new BatchProcessor(20); // Process items in batches of 20
  }

  /**
   * Get orders based on specified criteria
   * @param params Parameters for filtering orders
   * @returns List of orders matching the criteria
   */
  public async getOrders(params: GetOrdersParams = {}): Promise<ApiResponse<AmazonSPApi.Orders.GetOrdersResponse>> {
    try {
      const queryParams: Record<string, any> = {
        MarketplaceIds: params.marketplaceIds || [this.marketplaceId]
      };
      
      // Add optional parameters if provided
      if (params.createdAfter) queryParams.CreatedAfter = params.createdAfter;
      if (params.createdBefore) queryParams.CreatedBefore = params.createdBefore;
      if (params.lastUpdatedAfter) queryParams.LastUpdatedAfter = params.lastUpdatedAfter;
      if (params.lastUpdatedBefore) queryParams.LastUpdatedBefore = params.lastUpdatedBefore;
      if (params.orderStatuses && params.orderStatuses.length > 0) queryParams.OrderStatuses = params.orderStatuses;
      if (params.fulfillmentChannels && params.fulfillmentChannels.length > 0) queryParams.FulfillmentChannels = params.fulfillmentChannels;
      if (params.paymentMethods && params.paymentMethods.length > 0) queryParams.PaymentMethods = params.paymentMethods;
      if (params.buyerEmail) queryParams.BuyerEmail = params.buyerEmail;
      if (params.sellerOrderId) queryParams.SellerOrderId = params.sellerOrderId;
      if (params.maxResultsPerPage) queryParams.MaxResultsPerPage = params.maxResultsPerPage;
      if (params.nextToken) queryParams.NextToken = params.nextToken;
      if (params.amazonOrderIds && params.amazonOrderIds.length > 0) queryParams.AmazonOrderIds = params.amazonOrderIds;
      
      return await this.request<AmazonSPApi.Orders.GetOrdersResponse>(
        'orders',
        'GET',
        undefined,
        { params: queryParams }
      );
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getOrders`);
    }
  }
  
  /**
   * Get a specific order by ID
   * @param orderId Amazon order ID
   * @returns Order details
   */
  public async getOrder(orderId: string): Promise<ApiResponse<AmazonSPApi.Orders.GetOrderResponse>> {
    if (!orderId) {
      throw AmazonErrorHandler.createError(
        'Order ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.request<AmazonSPApi.Orders.GetOrderResponse>(
        `orders/${orderId}`,
        'GET'
      );
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getOrder`);
    }
  }
  
  /**
   * Get multiple orders by their IDs
   * @param orderIds Array of Amazon order IDs
   * @returns Map of order IDs to order details
   */
  public async getOrdersByIds(orderIds: string[]): Promise<Map<string, Order>> {
    if (!orderIds || orderIds.length === 0) {
      throw AmazonErrorHandler.createError(
        'At least one Order ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const result = new Map<string, Order>();
    
    // Process order IDs in batches to avoid hitting API limits
    await this.batchProcessor.processBatch(orderIds, async (batchOrderIds) => {
      try {
        // First attempt to get orders in a batch
        const ordersResponse = await this.getOrders({
          amazonOrderIds: batchOrderIds
        });
        
        // Process the response
        if (ordersResponse.data.Orders) {
          for (const order of ordersResponse.data.Orders) {
            result.set(order.AmazonOrderId, order);
          }
        }
        
        // Check if any orders were not found in the batch response
        const foundOrderIds = new Set(
          (ordersResponse.data.Orders || []).map(order => order.AmazonOrderId)
        );
        
        // For any orders not found in the batch, try to get them individually
        const missingOrderIds = batchOrderIds.filter(id => !foundOrderIds.has(id));
        
        if (missingOrderIds.length > 0) {
          // Use Promise.all for parallel processing but catch errors individually
          await Promise.all(
            missingOrderIds.map(async (orderId) => {
              try {
                const orderResponse = await this.getOrder(orderId);
                if (orderResponse.data.Order) {
                  result.set(orderId, orderResponse.data.Order);
                }
              } catch (error) {
                // Log the error but continue processing
                console.error(`Error getting order ${orderId}:`, error);
              }
            })
          );
        }
      } catch (error) {
        console.error('Error processing batch of orders:', error);
        // Continue with other batches despite errors
      }
    });
    
    return result;
  }
  
  /**
   * Get items for a specific order
   * @param orderId Amazon order ID
   * @param nextToken Token for retrieving the next page of results
   * @returns Order items
   */
  public async getOrderItems(
    orderId: string, 
    nextToken?: string
  ): Promise<ApiResponse<AmazonSPApi.Orders.GetOrderItemsResponse>> {
    if (!orderId) {
      throw AmazonErrorHandler.createError(
        'Order ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const queryParams: Record<string, any> = {};
      if (nextToken) queryParams.NextToken = nextToken;
      
      return await this.request<AmazonSPApi.Orders.GetOrderItemsResponse>(
        `orders/${orderId}/orderItems`,
        'GET',
        undefined,
        { params: queryParams }
      );
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getOrderItems`);
    }
  }
  
  /**
   * Get all items for a specific order (handles pagination automatically)
   * @param orderId Amazon order ID
   * @returns All order items
   */
  public async getAllOrderItems(orderId: string): Promise<OrderItem[]> {
    if (!orderId) {
      throw AmazonErrorHandler.createError(
        'Order ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const allItems: OrderItem[] = [];
    let nextToken: string | undefined;
    
    try {
      do {
        const response = await this.getOrderItems(orderId, nextToken);
        
        if (response.data.OrderItems) {
          allItems.push(...response.data.OrderItems);
        }
        
        nextToken = response.data.NextToken;
      } while (nextToken);
      
      return allItems;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getAllOrderItems`);
    }
  }
  
  /**
   * Get all items for multiple orders
   * @param orderIds Amazon order IDs
   * @returns Map of order IDs to their order items
   */
  public async getItemsForOrders(orderIds: string[]): Promise<Map<string, OrderItem[]>> {
    if (!orderIds || orderIds.length === 0) {
      throw AmazonErrorHandler.createError(
        'At least one Order ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const result = new Map<string, OrderItem[]>();
    
    // Process order IDs in batches to avoid hitting API limits
    await this.batchProcessor.processBatch(orderIds, async (batchOrderIds) => {
      // Use Promise.all for parallel processing but catch errors individually
      await Promise.all(
        batchOrderIds.map(async (orderId) => {
          try {
            const items = await this.getAllOrderItems(orderId);
            result.set(orderId, items);
          } catch (error) {
            // Log the error but continue processing
            console.error(`Error getting items for order ${orderId}:`, error);
          }
        })
      );
    });
    
    return result;
  }
  
  /**
   * Create a shipment for a specific order
   * @param params Shipment creation parameters
   * @returns Shipment details
   */
  public async createShipment(
    params: CreateShipmentParams
  ): Promise<ApiResponse<AmazonSPApi.Orders.CreateShipmentResponse>> {
    if (!params.amazonOrderId) {
      throw AmazonErrorHandler.createError(
        'Amazon Order ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!params.items || params.items.length === 0) {
      throw AmazonErrorHandler.createError(
        'At least one order item is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!params.shippingServiceId) {
      throw AmazonErrorHandler.createError(
        'Shipping service ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const requestBody = {
        marketplaceId: this.marketplaceId,
        amazonOrderId: params.amazonOrderId,
        itemList: params.items.map(item => ({
          orderItemId: item.orderItemId,
          quantity: item.quantity
        })),
        shippingServiceId: params.shippingServiceId
      };
      
      // Add optional fields if provided
      if (params.trackingNumber) requestBody['trackingNumber'] = params.trackingNumber;
      if (params.trackingUrl) requestBody['trackingUrl'] = params.trackingUrl;
      if (params.trackingNumbers) requestBody['trackingNumbers'] = params.trackingNumbers;
      if (params.shipDate) requestBody['shipDate'] = params.shipDate;
      if (params.shippingNote) requestBody['shippingNote'] = params.shippingNote;
      
      return await this.request<AmazonSPApi.Orders.CreateShipmentResponse>(
        'shipment',
        'POST',
        requestBody
      );
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.createShipment`);
    }
  }
  
  /**
   * Get recent orders (orders updated within the last 24 hours)
   * @param maxResults Maximum number of results to return
   * @returns Recent orders
   */
  public async getRecentOrders(maxResults = 100): Promise<Order[]> {
    // Calculate timestamp for 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    try {
      const response = await this.getOrders({
        lastUpdatedAfter: twentyFourHoursAgo.toISOString(),
        maxResultsPerPage: maxResults,
        marketplaceIds: [this.marketplaceId]
      });
      
      return response.data.Orders || [];
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getRecentOrders`);
    }
  }
  
  /**
   * Get orders by date range
   * @param startDate Start date (ISO 8601 format)
   * @param endDate End date (ISO 8601 format)
   * @param maxResults Maximum number of results to return
   * @returns Orders within the specified date range
   */
  public async getOrdersByDateRange(
    startDate: string,
    endDate: string,
    maxResults = 100
  ): Promise<Order[]> {
    if (!startDate || !endDate) {
      throw AmazonErrorHandler.createError(
        'Start date and end date are required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.getOrders({
        createdAfter: startDate,
        createdBefore: endDate,
        maxResultsPerPage: maxResults,
        marketplaceIds: [this.marketplaceId]
      });
      
      return response.data.Orders || [];
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getOrdersByDateRange`);
    }
  }
}

/**
 * Order utility functions
 */
export const OrderUtils = {
  /**
   * Calculate total order value
   * @param order Order object
   * @returns Total value including taxes and shipping
   */
  calculateTotalValue(order: Order): number {
    if (order.OrderTotal) {
      return parseFloat(order.OrderTotal.amount);
    }
    return 0;
  },
  
  /**
   * Calculate total order items (shipped and unshipped)
   * @param order Order object
   * @returns Total number of items
   */
  calculateTotalItems(order: Order): number {
    return (order.NumberOfItemsShipped || 0) + (order.NumberOfItemsUnshipped || 0);
  },
  
  /**
   * Format order status for display
   * @param status Order status enum value
   * @returns Human-readable status
   */
  formatStatus(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pending';
      case OrderStatus.UNSHIPPED:
        return 'Awaiting Shipment';
      case OrderStatus.PARTIALLY_SHIPPED:
        return 'Partially Shipped';
      case OrderStatus.SHIPPED:
        return 'Shipped';
      case OrderStatus.CANCELED:
        return 'Canceled';
      case OrderStatus.UNFULFILLABLE:
        return 'Cannot Fulfill';
      case OrderStatus.INVOICE_UNCONFIRMED:
        return 'Invoice Pending';
      case OrderStatus.PENDING_AVAILABILITY:
        return 'Awaiting Stock';
      default:
        return status;
    }
  },
  
  /**
   * Format fulfillment channel for display
   * @param channel Fulfillment channel enum value
   * @returns Human-readable channel
   */
  formatFulfillmentChannel(channel: FulfillmentChannel): string {
    switch (channel) {
      case FulfillmentChannel.MFN:
        return 'Seller Fulfilled';
      case FulfillmentChannel.AFN:
        return 'Amazon Fulfilled (FBA)';
      default:
        return channel;
    }
  },
  
  /**
   * Group orders by status
   * @param orders List of orders
   * @returns Map of status to orders
   */
  groupByStatus(orders: Order[]): Map<OrderStatus, Order[]> {
    const result = new Map<OrderStatus, Order[]>();
    
    for (const order of orders) {
      const status = order.OrderStatus;
      if (!result.has(status)) {
        result.set(status, []);
      }
      result.get(status)?.push(order);
    }
    
    return result;
  },
  
  /**
   * Group orders by marketplace
   * @param orders List of orders
   * @returns Map of marketplace ID to orders
   */
  groupByMarketplace(orders: Order[]): Map<string, Order[]> {
    const result = new Map<string, Order[]>();
    
    for (const order of orders) {
      if (!order.MarketplaceId) continue;
      
      const marketplaceId = order.MarketplaceId;
      if (!result.has(marketplaceId)) {
        result.set(marketplaceId, []);
      }
      result.get(marketplaceId)?.push(order);
    }
    
    return result;
  },
  
  /**
   * Format currency for display
   * @param amount Amount as string
   * @param currencyCode Currency code
   * @returns Formatted currency string
   */
  formatCurrency(amount: string, currencyCode: string): string {
    const numericAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode
    }).format(numericAmount);
  },
  
  /**
   * Format address for display
   * @param address Address object
   * @returns Formatted address string
   */
  formatAddress(address: Address): string {
    if (!address) return '';
    
    const parts = [
      address.name,
      address.addressLine1,
      address.addressLine2,
      address.addressLine3,
      [address.city, address.stateOrRegion, address.postalCode].filter(Boolean).join(', '),
      address.countryCode
    ].filter(Boolean);
    
    return parts.join('\n');
  },
  
  /**
   * Check if order is fulfilled by Amazon
   * @param order Order object
   * @returns True if FBA, false otherwise
   */
  isFBA(order: Order): boolean {
    return order.FulfillmentChannel === FulfillmentChannel.AFN;
  },
  
  /**
   * Check if order is overdue for shipment
   * @param order Order object
   * @returns True if overdue, false otherwise
   */
  isOverdueForShipment(order: Order): boolean {
    if (order.OrderStatus !== OrderStatus.UNSHIPPED || !order.LatestShipDate) {
      return false;
    }
    
    const latestShipDate = new Date(order.LatestShipDate);
    const now = new Date();
    
    return latestShipDate < now;
  }
};

// Default export
export default OrderUtils;