/**
 * Amazon Orders API Module
 * 
 * Implements the Amazon SP-API Orders API functionality.
 * This module handles order retrieval, management and processing.
 */

import { BaseApiModule, ApiRequestOptions, ApiResponse } from '../core/api-module';
import { AmazonSPApi } from '../schemas/amazon.generated';
import { AmazonErrorUtil, AmazonErrorCode } from '../utils/amazon-error';

/**
 * Order status values
 */
export type OrderStatus = 
  | 'Pending'
  | 'Unshipped'
  | 'PartiallyShipped'
  | 'Shipped'
  | 'Canceled'
  | 'Unfulfillable'
  | 'InvoiceUnconfirmed'
  | 'PendingAvailability';

/**
 * Fulfillment channel values
 */
export type FulfillmentChannel = 'MFN' | 'AFN';

/**
 * Payment method values
 */
export type PaymentMethod = 
  | 'COD'
  | 'CVS'
  | 'Other';

/**
 * Parameters for getting orders
 */
export interface GetOrdersParams {
  /**
   * Marketplace ID to get orders from
   */
  marketplaceId?: string;
  
  /**
   * Created after date
   */
  createdAfter?: Date;
  
  /**
   * Created before date
   */
  createdBefore?: Date;
  
  /**
   * Last updated after date
   */
  lastUpdatedAfter?: Date;
  
  /**
   * Last updated before date
   */
  lastUpdatedBefore?: Date;
  
  /**
   * Order statuses to include
   */
  orderStatuses?: OrderStatus[];
  
  /**
   * Fulfillment channels to include
   */
  fulfillmentChannels?: FulfillmentChannel[];
  
  /**
   * Payment methods to include
   */
  paymentMethods?: PaymentMethod[];
  
  /**
   * Amazon order IDs to include
   */
  amazonOrderIds?: string[];
  
  /**
   * Token for pagination
   */
  nextToken?: string;
  
  /**
   * Maximum number of results to return
   */
  maxResultsPerPage?: number;
  
  /**
   * Whether to return order items with orders
   */
  includeOrderItems?: boolean;
}

/**
 * Implementation of the Amazon Orders API
 */
export class OrdersModule extends BaseApiModule {
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
    super('orders', apiVersion, makeApiRequest, marketplaceId);
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
   * Get orders from Amazon
   * @param params Parameters for getting orders
   * @returns Orders response
   */
  public async getOrders(
    params: GetOrdersParams = {}
  ): Promise<ApiResponse<AmazonSPApi.Orders.GetOrdersResponse>> {
    const queryParams: Record<string, any> = {};
    
    // Add date filters
    if (params.createdAfter) {
      queryParams.CreatedAfter = params.createdAfter.toISOString();
    }
    
    if (params.createdBefore) {
      queryParams.CreatedBefore = params.createdBefore.toISOString();
    }
    
    if (params.lastUpdatedAfter) {
      queryParams.LastUpdatedAfter = params.lastUpdatedAfter.toISOString();
    }
    
    if (params.lastUpdatedBefore) {
      queryParams.LastUpdatedBefore = params.lastUpdatedBefore.toISOString();
    }
    
    // Add filters
    if (params.orderStatuses && params.orderStatuses.length > 0) {
      queryParams.OrderStatuses = params.orderStatuses.join(',');
    }
    
    if (params.fulfillmentChannels && params.fulfillmentChannels.length > 0) {
      queryParams.FulfillmentChannels = params.fulfillmentChannels.join(',');
    }
    
    if (params.paymentMethods && params.paymentMethods.length > 0) {
      queryParams.PaymentMethods = params.paymentMethods.join(',');
    }
    
    if (params.amazonOrderIds && params.amazonOrderIds.length > 0) {
      queryParams.AmazonOrderIds = params.amazonOrderIds.join(',');
    }
    
    // Add pagination
    if (params.nextToken) {
      queryParams.NextToken = params.nextToken;
    }
    
    if (params.maxResultsPerPage) {
      queryParams.MaxResultsPerPage = params.maxResultsPerPage;
    }
    
    // Ensure we have a marketplace ID
    const marketplaceId = params.marketplaceId || this.marketplaceId;
    if (!marketplaceId) {
      throw AmazonErrorUtil.createError(
        'Marketplace ID is required to get orders',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    queryParams.MarketplaceIds = marketplaceId;
    
    try {
      // Get orders
      const ordersResponse = await this.makeRequest<AmazonSPApi.Orders.GetOrdersResponse>({
        method: 'GET',
        path: '/orders',
        params: queryParams
      });
      
      // If we need to include order items, get them for each order
      if (params.includeOrderItems && ordersResponse.data.payload.Orders.length > 0) {
        await this.addOrderItemsToOrders(ordersResponse.data.payload.Orders);
      }
      
      return ordersResponse;
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.getOrders`
      );
    }
  }
  
  /**
   * Get a single order by Amazon order ID
   * @param orderId Amazon order ID
   * @param includeOrderItems Whether to include order items
   * @returns Order response
   */
  public async getOrder(
    orderId: string,
    includeOrderItems: boolean = false
  ): Promise<ApiResponse<AmazonSPApi.Orders.GetOrderResponse>> {
    if (!orderId) {
      throw AmazonErrorUtil.createError(
        'Order ID is required to get order',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const orderResponse = await this.makeRequest<AmazonSPApi.Orders.GetOrderResponse>({
        method: 'GET',
        path: `/orders/${orderId}`
      });
      
      // If we need to include order items, get them for the order
      if (includeOrderItems && orderResponse.data.payload.Orders.length > 0) {
        await this.addOrderItemsToOrders(orderResponse.data.payload.Orders);
      }
      
      return orderResponse;
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.getOrder`
      );
    }
  }
  
  /**
   * Get order items for an order
   * @param orderId Amazon order ID
   * @returns Order items response
   */
  public async getOrderItems(
    orderId: string
  ): Promise<ApiResponse<AmazonSPApi.Orders.GetOrderItemsResponse>> {
    if (!orderId) {
      throw AmazonErrorUtil.createError(
        'Order ID is required to get order items',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<AmazonSPApi.Orders.GetOrderItemsResponse>({
        method: 'GET',
        path: `/orders/${orderId}/orderItems`
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.getOrderItems`
      );
    }
  }
  
  /**
   * Get all pages of order items for an order
   * @param orderId Amazon order ID
   * @returns All order items
   */
  public async getAllOrderItems(
    orderId: string
  ): Promise<AmazonSPApi.Orders.OrderItem[]> {
    if (!orderId) {
      throw AmazonErrorUtil.createError(
        'Order ID is required to get order items',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    let allItems: AmazonSPApi.Orders.OrderItem[] = [];
    let nextToken: string | undefined = undefined;
    
    do {
      // Build the params with the next token if we have one
      const params: Record<string, any> = {};
      if (nextToken) {
        params.NextToken = nextToken;
      }
      
      // Get a page of order items
      const response = await this.makeRequest<AmazonSPApi.Orders.GetOrderItemsResponse>({
        method: 'GET',
        path: `/orders/${orderId}/orderItems`,
        params
      });
      
      // Add the items to our collection
      allItems = [...allItems, ...response.data.payload.OrderItems];
      
      // Get the next token for pagination
      nextToken = response.data.payload.NextToken;
      
      // Continue until we have no more pages
    } while (nextToken);
    
    return allItems;
  }
  
  /**
   * Get all orders that match the given parameters (handles pagination)
   * @param params Parameters for getting orders
   * @param maxPages Maximum number of pages to retrieve (default: 10)
   * @returns All orders that match the parameters
   */
  public async getAllOrders(
    params: GetOrdersParams = {},
    maxPages: number = 10
  ): Promise<AmazonSPApi.Orders.Order[]> {
    let currentPage = 1;
    let nextToken: string | undefined = undefined;
    const allOrders: AmazonSPApi.Orders.Order[] = [];
    
    do {
      // Update params with next token if available
      const pageParams: GetOrdersParams = {
        ...params,
        nextToken
      };
      
      const response = await this.getOrders(pageParams);
      
      // Add orders to our collection
      if (response.data.payload.Orders && response.data.payload.Orders.length > 0) {
        allOrders.push(...response.data.payload.Orders);
      }
      
      // Get next token for pagination
      nextToken = response.data.payload.NextToken;
      currentPage++;
      
      // Stop if we've reached the max pages or there are no more pages
    } while (nextToken && currentPage <= maxPages);
    
    return allOrders;
  }
  
  /**
   * Get recent orders
   * @param days Number of days to look back (default: 7)
   * @param includeOrderItems Whether to include order items (default: false)
   * @returns Recent orders
   */
  public async getRecentOrders(
    days: number = 7,
    includeOrderItems: boolean = false
  ): Promise<AmazonSPApi.Orders.Order[]> {
    // Calculate the start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get all orders created after the start date
    return this.getAllOrders({
      createdAfter: startDate,
      includeOrderItems
    });
  }
  
  /**
   * Get orders updated since a specified date
   * @param updatedSince Date to get updates since
   * @param includeOrderItems Whether to include order items (default: false)
   * @returns Orders updated since the specified date
   */
  public async getOrdersUpdatedSince(
    updatedSince: Date,
    includeOrderItems: boolean = false
  ): Promise<AmazonSPApi.Orders.Order[]> {
    return this.getAllOrders({
      lastUpdatedAfter: updatedSince,
      includeOrderItems
    });
  }
  
  /**
   * Add order items to each order in a list
   * @param orders Orders to add items to
   */
  private async addOrderItemsToOrders(
    orders: AmazonSPApi.Orders.Order[]
  ): Promise<void> {
    // Add a property to hold order items
    for (const order of orders) {
      (order as any).OrderItems = [];
    }
    
    // Get order items for each order in parallel
    await Promise.all<any>(
      orders.map(async (order: any) => {
        try {
          const items = await this.getAllOrderItems(order.amazonOrderId);
          (order as any).OrderItems = items;
        } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
          console.warn(
            `Failed to get order items for order ${order.amazonOrderId}:`,
            error
          );
        }
      })
    );
  }
}