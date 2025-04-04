/**
 * Amazon Notifications API Module
 * 
 * Implements the Amazon SP-API Notifications API functionality.
 * This module enables applications to subscribe to notifications for various
 * Amazon Selling Partner events and manage notification subscriptions.
 */

import { ApiModule } from '../../../core/api-module';
import { ApiRequestFunction, ApiResponse } from '../../../core/base-module.interface';
import AmazonErrorHandler, { AmazonErrorCode } from '../../../utils/amazon-error';

/**
 * Notification subscription status
 */
export type NotificationSubscriptionStatus = 'ENABLED' | 'DISABLED';

/**
 * Notification processing status
 */
export type NotificationProcessingStatus = 'PROCESSED' | 'UNPROCESSED' | 'PROCESSING';

/**
 * Notification destination type
 */
export type DestinationType = 'SQS' | 'EventBridge' | 'SNS';

/**
 * Notification event type
 */
export type NotificationEventType = 
  | 'ORDER_CHANGE'
  | 'FEATURE_MERCHANT_CHANGE'
  | 'REPORT_PROCESSING_FINISHED'
  | 'BRANDED_ITEM_CONTENT_CHANGE'
  | 'FEED_PROCESSING_FINISHED'
  | 'ANY_OFFER_CHANGED'
  | 'ITEM_PRODUCT_TYPE_CHANGE'
  | 'LISTINGS_ITEM_STATUS_CHANGE'
  | 'LISTINGS_ITEM_ISSUES_CHANGE'
  | 'FULFILLMENT_ORDER_STATUS'
  | 'B2B_ANY_OFFER_CHANGED'
  | 'MFN_ORDER_STATUS_CHANGE'
  | 'FBA_INVENTORY_AVAILABILITY_CHANGES'
  | 'FBA_OUTBOUND_SHIPMENT_STATUS';

/**
 * Notification destination
 */
export interface NotificationDestination {
  /**
   * The destination type
   */
  destinationType: DestinationType;
  
  /**
   * The destination ARN
   */
  destinationId: string;
}

/**
 * Notification subscription
 */
export interface NotificationSubscription {
  /**
   * The subscription ID
   */
  subscriptionId: string;
  
  /**
   * The notification event type
   */
  eventType: NotificationEventType;
  
  /**
   * The notification destination
   */
  destination: NotificationDestination;
  
  /**
   * The subscription status
   */
  status: NotificationSubscriptionStatus;
  
  /**
   * The timestamp when the subscription was created
   */
  createdTimestamp: string;
  
  /**
   * The timestamp when the subscription was last updated
   */
  lastUpdatedTimestamp: string;
}

/**
 * Notification received event
 */
export interface NotificationReceivedEvent {
  /**
   * The notification event ID
   */
  eventId: string;
  
  /**
   * The notification event type
   */
  eventType: NotificationEventType;
  
  /**
   * The notification processing status
   */
  processingStatus: NotificationProcessingStatus;
  
  /**
   * The notification event timestamp
   */
  timestamp: string;
}

/**
 * Get notification subscriptions response
 */
export interface GetNotificationSubscriptionsResponse {
  /**
   * The notification subscriptions
   */
  subscriptions: NotificationSubscription[];
  
  /**
   * The next token for pagination
   */
  nextToken?: string;
}

/**
 * Get notification response
 */
export interface GetNotificationResponse {
  /**
   * The notification event
   */
  event: NotificationReceivedEvent;
  
  /**
   * The notification payload
   */
  payload: any;
}

/**
 * Create subscription request
 */
export interface CreateSubscriptionRequest {
  /**
   * The notification event type
   */
  eventType: NotificationEventType;
  
  /**
   * The notification destination
   */
  destination: NotificationDestination;
}

/**
 * Get subscriptions by event type options
 */
export interface GetSubscriptionsByEventTypeOptions {
  /**
   * The event type to filter by
   */
  eventType: NotificationEventType;
  
  /**
   * The next token for pagination
   */
  nextToken?: string;
}

/**
 * List notifications options
 */
export interface ListNotificationsOptions {
  /**
   * The event type to filter by
   */
  eventType?: NotificationEventType;
  
  /**
   * The next token for pagination
   */
  nextToken?: string;
  
  /**
   * The maximum number of notifications to return
   */
  maxResults?: number;
}

/**
 * Create subscription response
 */
export interface CreateSubscriptionResponse {
  /**
   * The subscription ID
   */
  subscriptionId: string;
}

/**
 * List notifications response
 */
export interface ListNotificationsResponse {
  /**
   * The notifications
   */
  notifications: NotificationReceivedEvent[];
  
  /**
   * The next token for pagination
   */
  nextToken?: string;
}

/**
 * Get event types response 
 */
export interface GetEventTypesResponse {
  /**
   * The event types
   */
  eventTypes: string[];
}

/**
 * Options for NotificationsModule
 */
export interface NotificationsModuleOptions {
  /**
   * The AWS region for notifications
   */
  region?: string;
  
  /**
   * Default destination for notifications
   */
  defaultDestination?: NotificationDestination;
  
  /**
   * Maximum pages to retrieve when fetching all items
   */
  maxPages?: number;
}

/**
 * Implementation of the Amazon Notifications API module
 */
export class NotificationsModule extends ApiModule<NotificationsModuleOptions> {
  /**
   * The unique identifier for this module
   */
  readonly moduleId: string = 'notifications';
  
  /**
   * The human-readable name of this module
   */
  readonly moduleName: string = 'Notifications';
  
  /**
   * The API version this module uses
   */
  readonly apiVersion: string;
  
  /**
   * The base URL path for API requests
   */
  readonly basePath: string;
  
  /**
   * Maximum pages to retrieve when fetching all items
   */
  private readonly maxPages: number;
  
  /**
   * Constructor
   * @param apiVersion API version
   * @param apiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param options Module options
   */
  constructor(
    apiVersion: string,
    apiRequest: ApiRequestFunction,
    marketplaceId: string,
    options: NotificationsModuleOptions = {}
  ) {
    super(apiRequest, marketplaceId, options);
    this.apiVersion = apiVersion;
    this.basePath = `/notifications/${apiVersion}`;
    this.maxPages = options.maxPages || 10;
  }
  
  /**
   * Get all notification subscriptions
   * @param nextToken The pagination token
   * @returns The notification subscriptions
   */
  public async getNotificationSubscriptions(nextToken?: string): Promise<GetNotificationSubscriptionsResponse> {
    try {
      const params: Record<string, any> = {};
      
      if (nextToken) {
        params.nextToken = nextToken;
      }
      
      const response = await this.request<GetNotificationSubscriptionsResponse>(
        '/subscriptions',
        'GET',
        params
      );
      
      return response.data;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getNotificationSubscriptions`);
    }
  }
  
  /**
   * Get all notification subscriptions for a specific event type
   * @param options Options for getting subscriptions
   * @returns The notification subscriptions
   */
  public async getSubscriptionsByEventType(options: GetSubscriptionsByEventTypeOptions): Promise<GetNotificationSubscriptionsResponse> {
    if (!options.eventType) {
      throw AmazonErrorHandler.createError(
        'Event type is required to get subscriptions', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const params: Record<string, any> = {};
      
      if (options.nextToken) {
        params.nextToken = options.nextToken;
      }
      
      const response = await this.request<GetNotificationSubscriptionsResponse>(
        `/subscriptions/${options.eventType}`,
        'GET',
        params
      );
      
      return response.data;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getSubscriptionsByEventType`);
    }
  }
  
  /**
   * Create a notification subscription
   * @param request The subscription request
   * @returns The created subscription ID
   */
  public async createSubscription(request: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    if (!request.eventType) {
      throw AmazonErrorHandler.createError(
        'Event type is required to create a subscription', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!request.destination) {
      throw AmazonErrorHandler.createError(
        'Destination is required to create a subscription', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.request<CreateSubscriptionResponse>(
        `/subscriptions/${request.eventType}`,
        'POST',
        {
          destinationType: request.destination.destinationType,
          destinationId: request.destination.destinationId
        }
      );
      
      return response.data;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.createSubscription`);
    }
  }
  
  /**
   * Get a specific notification subscription
   * @param subscriptionId The subscription ID
   * @returns The notification subscription
   */
  public async getSubscription(subscriptionId: string): Promise<NotificationSubscription> {
    if (!subscriptionId) {
      throw AmazonErrorHandler.createError(
        'Subscription ID is required to get a subscription', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.request<NotificationSubscription>(
        `/subscriptions/${subscriptionId}`,
        'GET'
      );
      
      return response.data;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getSubscription`);
    }
  }
  
  /**
   * Delete a notification subscription
   * @param subscriptionId The subscription ID
   * @returns Success indicator
   */
  public async deleteSubscription(subscriptionId: string): Promise<boolean> {
    if (!subscriptionId) {
      throw AmazonErrorHandler.createError(
        'Subscription ID is required to delete a subscription', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      await this.request<void>(
        `/subscriptions/${subscriptionId}`,
        'DELETE'
      );
      
      return true;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.deleteSubscription`);
    }
  }
  
  /**
   * List notifications
   * @param options Options for listing notifications
   * @returns The notifications
   */
  public async listNotifications(options: ListNotificationsOptions = {}): Promise<ListNotificationsResponse> {
    try {
      const params: Record<string, any> = {};
      
      if (options.eventType) {
        params.eventType = options.eventType;
      }
      
      if (options.nextToken) {
        params.nextToken = options.nextToken;
      }
      
      if (options.maxResults) {
        params.maxResults = options.maxResults;
      }
      
      const response = await this.request<ListNotificationsResponse>(
        '/notifications',
        'GET',
        params
      );
      
      return response.data;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.listNotifications`);
    }
  }
  
  /**
   * Get a specific notification
   * @param notificationId The notification ID
   * @returns The notification
   */
  public async getNotification(notificationId: string): Promise<GetNotificationResponse> {
    if (!notificationId) {
      throw AmazonErrorHandler.createError(
        'Notification ID is required to get a notification', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.request<GetNotificationResponse>(
        `/notifications/${notificationId}`,
        'GET'
      );
      
      return response.data;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getNotification`);
    }
  }
  
  /**
   * Mark a notification as processed
   * @param notificationId The notification ID
   * @returns Success indicator
   */
  public async markNotificationAsProcessed(notificationId: string): Promise<boolean> {
    if (!notificationId) {
      throw AmazonErrorHandler.createError(
        'Notification ID is required', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      await this.request<void>(
        `/notifications/${notificationId}/processed`,
        'PUT'
      );
      
      return true;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.markNotificationAsProcessed`);
    }
  }
  
  /**
   * Get all available notification event types
   * @returns The available notification event types
   */
  public async getEventTypes(): Promise<GetEventTypesResponse> {
    try {
      const response = await this.request<GetEventTypesResponse>(
        '/eventTypes',
        'GET'
      );
      
      return response.data;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getEventTypes`);
    }
  }
  
  /**
   * Get all notification subscriptions (handles pagination)
   * @param maxPages Maximum number of pages to retrieve (default: configured maxPages)
   * @returns All notification subscriptions
   */
  public async getAllNotificationSubscriptions(maxPages: number = this.maxPages): Promise<NotificationSubscription[]> {
    const allSubscriptions: NotificationSubscription[] = [];
    let nextToken: string | undefined = undefined;
    let currentPage = 1;
    
    do {
      // Get the current page of subscriptions
      const response = await this.getNotificationSubscriptions(nextToken);
      
      // Add subscriptions to our collection
      if (response.subscriptions && response.subscriptions.length > 0) {
        allSubscriptions.push(...response.subscriptions);
      }
      
      // Update the next token
      nextToken = response.nextToken;
      currentPage++;
      
      // Stop if we've reached the maximum number of pages or there are no more pages
    } while (nextToken && currentPage <= maxPages);
    
    return allSubscriptions;
  }
  
  /**
   * Get all subscriptions for an event type (handles pagination)
   * @param eventType The event type
   * @param maxPages Maximum number of pages to retrieve (default: configured maxPages)
   * @returns All notification subscriptions for the event type
   */
  public async getAllSubscriptionsByEventType(
    eventType: NotificationEventType, 
    maxPages: number = this.maxPages
  ): Promise<NotificationSubscription[]> {
    const allSubscriptions: NotificationSubscription[] = [];
    let nextToken: string | undefined = undefined;
    let currentPage = 1;
    
    do {
      // Get the current page of subscriptions
      const response = await this.getSubscriptionsByEventType({ 
        eventType,
        nextToken
      });
      
      // Add subscriptions to our collection
      if (response.subscriptions && response.subscriptions.length > 0) {
        allSubscriptions.push(...response.subscriptions);
      }
      
      // Update the next token
      nextToken = response.nextToken;
      currentPage++;
      
      // Stop if we've reached the maximum number of pages or there are no more pages
    } while (nextToken && currentPage <= maxPages);
    
    return allSubscriptions;
  }
  
  /**
   * Create a subscription with default options
   * @param eventType The event type to subscribe to
   * @returns The created subscription ID
   */
  public async createDefaultSubscription(eventType: NotificationEventType): Promise<CreateSubscriptionResponse> {
    if (!this.options.defaultDestination) {
      throw AmazonErrorHandler.createError(
        'No default destination configured for notifications. Please set options.defaultDestination or provide destination details.',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.createSubscription({
      eventType,
      destination: this.options.defaultDestination
    });
  }
  
  /**
   * Get all notifications (handles pagination)
   * @param options Options for listing notifications
   * @param maxPages Maximum number of pages to retrieve (default: configured maxPages)
   * @returns All notifications
   */
  public async getAllNotifications(
    options: ListNotificationsOptions = {}, 
    maxPages: number = this.maxPages
  ): Promise<NotificationReceivedEvent[]> {
    const allNotifications: NotificationReceivedEvent[] = [];
    let nextToken: string | undefined = options.nextToken;
    let currentPage = 1;
    
    do {
      // Update options with next token
      const pageOptions: ListNotificationsOptions = {
        ...options,
        nextToken
      };
      
      // Get the current page of notifications
      const response = await this.listNotifications(pageOptions);
      
      // Add notifications to our collection
      if (response.notifications && response.notifications.length > 0) {
        allNotifications.push(...response.notifications);
      }
      
      // Update the next token
      nextToken = response.nextToken;
      currentPage++;
      
      // Stop if we've reached the maximum number of pages or there are no more pages
    } while (nextToken && currentPage <= maxPages);
    
    return allNotifications;
  }
  
  /**
   * Helper method to check if a subscription exists for an event type
   * @param eventType The event type to check
   * @returns Whether a subscription exists for the event type
   */
  public async hasSubscriptionForEventType(eventType: NotificationEventType): Promise<boolean> {
    try {
      const response = await this.getSubscriptionsByEventType({ eventType });
      return response.subscriptions && response.subscriptions.length > 0;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.hasSubscriptionForEventType`);
    }
  }
  
  /**
   * Helper method to get enabled subscriptions only
   * @returns Only enabled notification subscriptions
   */
  public async getEnabledSubscriptions(): Promise<NotificationSubscription[]> {
    const allSubscriptions = await this.getAllNotificationSubscriptions();
    return allSubscriptions.filter(sub => sub.status === 'ENABLED');
  }
  
  /**
   * Helper method to get unprocessed notifications
   * @param eventType Optional event type to filter by
   * @returns Unprocessed notifications
   */
  public async getUnprocessedNotifications(eventType?: NotificationEventType): Promise<NotificationReceivedEvent[]> {
    const options: ListNotificationsOptions = {
      eventType,
      maxResults: 100
    };
    
    const allNotifications = await this.getAllNotifications(options);
    return allNotifications.filter(notification => 
      notification.processingStatus === 'UNPROCESSED'
    );
  }
}