/**
 * Amazon Notifications API Module
 * 
 * Implements the Amazon SP-API Notifications API functionality.
 * This module handles subscription to Amazon notifications like order updates, inventory changes, etc.
 */

import { BaseApiModule, ApiRequestOptions, ApiResponse } from '../core/api-module';
import { AmazonErrorUtil, AmazonErrorCode } from '../utils/amazon-error';

/**
 * Notification type
 */
export enum NotificationType {
  // Order Notifications
  ORDER_CHANGE = 'ORDER_CHANGE',
  FULFILLMENT_ORDER_STATUS = 'FULFILLMENT_ORDER_STATUS',
  
  // Listing Notifications
  LISTING_CHANGE = 'LISTING_CHANGE',
  ITEM_PRODUCT_TYPE_CHANGE = 'ITEM_PRODUCT_TYPE_CHANGE',
  ITEM_OFFER_UPDATE = 'ITEM_OFFER_UPDATE',
  
  // Inventory Notifications
  FBA_INVENTORY_AVAILABILITY_CHANGE = 'FBA_INVENTORY_AVAILABILITY_CHANGE',
  FBA_OUTBOUND_SHIPMENT_STATUS = 'FBA_OUTBOUND_SHIPMENT_STATUS',
  
  // Report Notifications
  REPORT_PROCESSING_FINISHED = 'REPORT_PROCESSING_FINISHED',
  
  // Feed Notifications
  FEED_PROCESSING_FINISHED = 'FEED_PROCESSING_FINISHED',
  
  // Account Notifications
  ACCOUNT_STATUS_CHANGED = 'ACCOUNT_STATUS_CHANGED',
  
  // Adjustment Notifications
  ADJUSTMENT_NEW = 'ADJUSTMENT_NEW',
  
  // Vendor Notifications
  VENDOR_ORDER_STATUS = 'VENDOR_ORDER_STATUS',
  VENDOR_PO_CONFIRMATION = 'VENDOR_PO_CONFIRMATION',
  VENDOR_SHIPMENT_CONFIRMATION = 'VENDOR_SHIPMENT_CONFIRMATION',
}

/**
 * Notification destination type
 */
export enum DestinationType {
  SQS = 'SQS',
  EVENT_BRIDGE = 'EVENT_BRIDGE',
  SNS = 'SNS',
}

/**
 * Destination parameters
 */
export interface DestinationParams {
  name: string;
  type: DestinationType;
  arn?: string;
  url?: string;
  credential?: {
    accessKeyId?: string;
    secretAccessKey?: string;
  };
}

/**
 * Subscription parameters
 */
export interface SubscriptionParams {
  /**
   * The type of notification to subscribe to
   */
  notificationType: NotificationType;
  
  /**
   * The ID of the destination where notifications will be delivered
   */
  destinationId: string;
  
  /**
   * Processing directive for the subscription
   */
  processingDirective?: {
    eventFilter?: {
      eventFilterType: string;
      marketplaceIds?: string[];
    };
  };
}

/**
 * Implementation of the Amazon Notifications API
 */
export class NotificationsModule extends BaseApiModule {
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
    super('notifications', apiVersion, makeApiRequest, marketplaceId);
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
   * Get a list of all available notification types
   * @returns List of notification types
   */
  public async getNotificationTypes(): Promise<ApiResponse<{
    notificationTypes: {
      name: string;
      description: string;
      marketplaceIds?: string[];
    }[];
  }>> {
    try {
      return await this.makeRequest<{
        notificationTypes: {
          name: string;
          description: string;
          marketplaceIds?: string[];
        }[];
      }>({
        method: 'GET',
        path: '/notificationTypes'
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.getNotificationTypes`
      );
    }
  }
  
  /**
   * Get a list of all notification destinations
   * @returns List of notification destinations
   */
  public async getDestinations(): Promise<ApiResponse<{
    destinations: {
      destinationId: string;
      name: string;
      resource: {
        sqs?: {
          arn: string;
        };
        eventBridge?: {
          region: string;
          accountId: string;
        };
      };
    }[];
  }>> {
    try {
      return await this.makeRequest<{
        destinations: {
          destinationId: string;
          name: string;
          resource: {
            sqs?: {
              arn: string;
            };
            eventBridge?: {
              region: string;
              accountId: string;
            };
          };
        }[];
      }>({
        method: 'GET',
        path: '/destinations'
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.getDestinations`
      );
    }
  }
  
  /**
   * Create a notification destination
   * @param params Destination parameters
   * @returns Created destination
   */
  public async createDestination(
    params: DestinationParams
  ): Promise<ApiResponse<{
    destinationId: string;
    name: string;
    resource: any;
  }>> {
    if (!params.name || !params.type) {
      throw AmazonErrorUtil.createError(
        'Destination name and type are required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Build the resource object based on the destination type
    const resource: any = {};
    
    switch (params.type) {
      case DestinationType.SQS:
        if (!params.arn) {
          throw AmazonErrorUtil.createError(
            'ARN is required for SQS destinations',
            AmazonErrorCode.INVALID_INPUT
          );
        }
        resource.sqs = { arn: params.arn };
        break;
      
      case DestinationType.EVENT_BRIDGE:
        resource.eventBridge = {};
        break;
      
      case DestinationType.SNS:
        if (!params.arn) {
          throw AmazonErrorUtil.createError(
            'ARN is required for SNS destinations',
            AmazonErrorCode.INVALID_INPUT
          );
        }
        resource.sns = { 
          arn: params.arn,
          ...(params.credential && { 
            credentials: params.credential 
          })
        };
        break;
      
      default:
        throw AmazonErrorUtil.createError(
          `Unsupported destination type: ${params.type}`,
          AmazonErrorCode.INVALID_INPUT
        );
    }
    
    try {
      return await this.makeRequest<{
        destinationId: string;
        name: string;
        resource: any;
      }>({
        method: 'POST',
        path: '/destinations',
        data: {
          name: params.name,
          resource
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.createDestination`
      );
    }
  }
  
  /**
   * Get a destination by ID
   * @param destinationId Destination ID
   * @returns Destination details
   */
  public async getDestination(
    destinationId: string
  ): Promise<ApiResponse<{
    destinationId: string;
    name: string;
    resource: any;
  }>> {
    if (!destinationId) {
      throw AmazonErrorUtil.createError(
        'Destination ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<{
        destinationId: string;
        name: string;
        resource: any;
      }>({
        method: 'GET',
        path: `/destinations/${destinationId}`
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.getDestination`
      );
    }
  }
  
  /**
   * Delete a destination
   * @param destinationId Destination ID
   * @returns Success status
   */
  public async deleteDestination(
    destinationId: string
  ): Promise<ApiResponse<void>> {
    if (!destinationId) {
      throw AmazonErrorUtil.createError(
        'Destination ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<void>({
        method: 'DELETE',
        path: `/destinations/${destinationId}`
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.deleteDestination`
      );
    }
  }
  
  /**
   * Get all subscriptions
   * @returns List of subscriptions
   */
  public async getSubscriptions(): Promise<ApiResponse<{
    subscriptions: {
      subscriptionId: string;
      payloadVersion: string;
      destinationId: string;
      notificationType: string;
      processingDirective?: any;
    }[];
  }>> {
    try {
      return await this.makeRequest<{
        subscriptions: {
          subscriptionId: string;
          payloadVersion: string;
          destinationId: string;
          notificationType: string;
          processingDirective?: any;
        }[];
      }>({
        method: 'GET',
        path: '/subscriptions'
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.getSubscriptions`
      );
    }
  }
  
  /**
   * Create a subscription
   * @param params Subscription parameters
   * @returns Created subscription
   */
  public async createSubscription(
    params: SubscriptionParams
  ): Promise<ApiResponse<{
    subscriptionId: string;
    payloadVersion: string;
    destinationId: string;
    notificationType: string;
    processingDirective?: any;
  }>> {
    if (!params.notificationType || !params.destinationId) {
      throw AmazonErrorUtil.createError(
        'Notification type and destination ID are required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<{
        subscriptionId: string;
        payloadVersion: string;
        destinationId: string;
        notificationType: string;
        processingDirective?: any;
      }>({
        method: 'POST',
        path: '/subscriptions',
        data: {
          notificationType: params.notificationType,
          destinationId: params.destinationId,
          processingDirective: params.processingDirective
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.createSubscription`
      );
    }
  }
  
  /**
   * Get a subscription by ID
   * @param subscriptionId Subscription ID
   * @returns Subscription details
   */
  public async getSubscription(
    subscriptionId: string
  ): Promise<ApiResponse<{
    subscriptionId: string;
    payloadVersion: string;
    destinationId: string;
    notificationType: string;
    processingDirective?: any;
  }>> {
    if (!subscriptionId) {
      throw AmazonErrorUtil.createError(
        'Subscription ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<{
        subscriptionId: string;
        payloadVersion: string;
        destinationId: string;
        notificationType: string;
        processingDirective?: any;
      }>({
        method: 'GET',
        path: `/subscriptions/${subscriptionId}`
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.getSubscription`
      );
    }
  }
  
  /**
   * Delete a subscription
   * @param subscriptionId Subscription ID
   * @returns Success status
   */
  public async deleteSubscription(
    subscriptionId: string
  ): Promise<ApiResponse<void>> {
    if (!subscriptionId) {
      throw AmazonErrorUtil.createError(
        'Subscription ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<void>({
        method: 'DELETE',
        path: `/subscriptions/${subscriptionId}`
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.deleteSubscription`
      );
    }
  }
  
  /**
   * Create or update a subscription for order updates
   * @param destinationId Destination ID to receive notifications
   * @param marketplaceIds Optional list of marketplace IDs to filter notifications (default: current marketplace)
   * @returns Created subscription
   */
  public async subscribeToOrderUpdates(
    destinationId: string,
    marketplaceIds?: string[]
  ): Promise<ApiResponse<{
    subscriptionId: string;
    payloadVersion: string;
    destinationId: string;
    notificationType: string;
    processingDirective?: any;
  }>> {
    // Ensure we have marketplace IDs
    const markets = marketplaceIds || [this.marketplaceId];
    
    // Create the subscription
    return this.createSubscription({
      notificationType: NotificationType.ORDER_CHANGE,
      destinationId,
      processingDirective: {
        eventFilter: {
          eventFilterType: 'MARKETPLACE_ID',
          marketplaceIds: markets
        }
      }
    });
  }
  
  /**
   * Create or update a subscription for inventory changes
   * @param destinationId Destination ID to receive notifications
   * @param marketplaceIds Optional list of marketplace IDs to filter notifications (default: current marketplace)
   * @returns Created subscription
   */
  public async subscribeToInventoryChanges(
    destinationId: string,
    marketplaceIds?: string[]
  ): Promise<ApiResponse<{
    subscriptionId: string;
    payloadVersion: string;
    destinationId: string;
    notificationType: string;
    processingDirective?: any;
  }>> {
    // Ensure we have marketplace IDs
    const markets = marketplaceIds || [this.marketplaceId];
    
    // Create the subscription
    return this.createSubscription({
      notificationType: NotificationType.FBA_INVENTORY_AVAILABILITY_CHANGE,
      destinationId,
      processingDirective: {
        eventFilter: {
          eventFilterType: 'MARKETPLACE_ID',
          marketplaceIds: markets
        }
      }
    });
  }
  
  /**
   * Test a destination by sending a test notification
   * @param destinationId Destination ID to test
   * @returns Test result
   */
  public async testDestination(
    destinationId: string
  ): Promise<ApiResponse<{
    testNotificationType: string;
    destinationId: string;
    payload: string;
    status: string;
  }>> {
    if (!destinationId) {
      throw AmazonErrorUtil.createError(
        'Destination ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<{
        testNotificationType: string;
        destinationId: string;
        payload: string;
        status: string;
      }>({
        method: 'POST',
        path: '/destinations/test',
        data: {
          destinationId
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.testDestination`
      );
    }
  }
}