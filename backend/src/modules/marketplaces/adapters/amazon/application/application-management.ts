/**
 * Amazon Application Management API Module
 * 
 * Implements the Amazon SP-API Application Management API functionality.
 * This module enables applications to monitor and manage their API usage,
 * set notifications, and optimize performance.
 */

import { ApiModule } from '../core/api-module';
import { ApiResponse, BaseModule } from '../core/base-module.interface';
import AmazonErrorHandler, { AmazonErrorCode } from '../utils/amazon-error';

/**
 * API Request options
 */
export interface ApiRequestOptions {
  /**
   * HTTP method for the request
   */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  
  /**
   * Path component of the URL
   */
  path: string;
  
  /**
   * Query parameters
   */
  params?: Record<string, any>;
  
  /**
   * Request body
   */
  data?: any;
  
  /**
   * Additional headers
   */
  headers?: Record<string, string>;
}

/**
 * Usage plan tier
 */
export type UsagePlanTier = 'STANDARD' | 'PREMIUM';

/**
 * API status
 */
export type ApiStatus = 'ENABLED' | 'DISABLED' | 'DEPRECATED';

/**
 * The rate limit that applies to the resource
 */
export interface RateLimit {
  /**
   * Rate limit value
   */
  rateLimit: number;
  
  /**
   * Burst limit value
   */
  burstLimit: number;
  
  /**
   * The period of time for which the rate limit applies (in seconds)
   */
  periodInSeconds: number;
  
  /**
   * The type of rate limit (e.g., 'REQUEST_RATE' or 'TOKEN_RATE')
   */
  limitType: string;
}

/**
 * Application usage plan
 */
export interface UsagePlan {
  /**
   * Tier of the usage plan
   */
  tier: UsagePlanTier;
  
  /**
   * The rate limits that apply to the usage plan
   */
  rateLimits: RateLimit[];
  
  /**
   * The quotas that apply to the usage plan
   */
  quotas: {
    /**
     * The number of requests allowed by the quota
     */
    limit: number;
    
    /**
     * The period of time for which the quota applies (in seconds)
     */
    periodInSeconds: number;
  }[];
}

/**
 * API Usage record
 */
export interface ApiUsageRecord {
  /**
   * The operation that was called
   */
  operation: string;
  
  /**
   * The resource path that was accessed
   */
  path: string;
  
  /**
   * The HTTP method that was used
   */
  method: string;
  
  /**
   * The timestamp of the API call
   */
  timestamp: string;
  
  /**
   * The application identifier
   */
  applicationId: string;
}

/**
 * API usage response
 */
export interface GetApiUsageResponse {
  /**
   * The list of API usage records
   */
  records: ApiUsageRecord[];
  
  /**
   * Token for retrieving the next page
   */
  nextToken?: string;
}

/**
 * Response from GetApiStatus 
 */
export interface GetApiStatusResponse {
  /**
   * The name of the API
   */
  apiName: string;
  
  /**
   * The current status of the API
   */
  status: ApiStatus;
  
  /**
   * The date when the API status was last updated
   */
  lastUpdated: string;
  
  /**
   * Additional information about the API
   */
  notes?: string;
}

/**
 * Response from GetApplicationUsagePlans
 */
export interface GetApplicationUsagePlansResponse {
  /**
   * List of usage plans
   */
  usagePlans: UsagePlan[];
}

/**
 * Notification subscription
 */
export interface NotificationSubscription {
  /**
   * The notification type
   */
  notificationType: string;
  
  /**
   * The destination for the notification (e.g., email address, SNS topic ARN)
   */
  destination: string;
  
  /**
   * The format of the notification
   */
  format: 'JSON' | 'XML';
  
  /**
   * The ID of the subscription
   */
  subscriptionId: string;
  
  /**
   * The status of the subscription
   */
  status: 'ACTIVE' | 'PENDING' | 'DELETED';
}

/**
 * Response from GetNotificationSubscriptions
 */
export interface GetNotificationSubscriptionsResponse {
  /**
   * List of notification subscriptions
   */
  subscriptions: NotificationSubscription[];
  
  /**
   * Token for retrieving the next page
   */
  nextToken?: string;
}

/**
 * Options for GetApiUsage
 */
export interface GetApiUsageOptions {
  /**
   * Start date for filtering API usage records (ISO 8601 format)
   */
  startTime: string;
  
  /**
   * End date for filtering API usage records (ISO 8601 format)
   */
  endTime: string;
  
  /**
   * Specific operations to filter by
   */
  operations?: string[];
  
  /**
   * Specific HTTP methods to filter by
   */
  methods?: string[];
  
  /**
   * Resource paths to filter by
   */
  paths?: string[];
  
  /**
   * Maximum number of records to return
   */
  maxResults?: number;
  
  /**
   * Token for pagination
   */
  nextToken?: string;
}

/**
 * Options for GetNotificationSubscriptions
 */
export interface GetNotificationSubscriptionsOptions {
  /**
   * Specific notification types to filter by
   */
  notificationTypes?: string[];
  
  /**
   * Maximum number of records to return
   */
  maxResults?: number;
  
  /**
   * Token for pagination
   */
  nextToken?: string;
}

/**
 * Options for CreateNotificationSubscription
 */
export interface CreateNotificationSubscriptionOptions {
  /**
   * The notification type
   */
  notificationType: string;
  
  /**
   * The destination for the notification (e.g., email address, SNS topic ARN)
   */
  destination: string;
  
  /**
   * The format of the notification (defaults to JSON)
   */
  format?: 'JSON' | 'XML';
}

/**
 * Type definition for API request function
 */
export type ApiRequestFunction = <T = any>(path: string, method: string, data?: any) => Promise<ApiResponse<T>>;

/**
 * Options for ApplicationManagementModule
 */
export interface ApplicationManagementModuleOptions {
  // Add any module-specific options here if needed
}

/**
 * Implementation of the Amazon Application Management API
 */
export class ApplicationManagementModule implements BaseModule<ApplicationManagementModuleOptions> {
  /**
   * The unique identifier for this module
   */
  public readonly moduleId: string = 'applicationManagement';
  
  /**
   * The human-readable name of this module
   */
  public readonly moduleName: string = 'Application Management';
  
  /**
   * The API version this module uses
   */
  public readonly apiVersion: string;
  
  /**
   * The base URL path for API requests
   */
  public readonly basePath: string;
  
  /**
   * The API request function used by this module
   */
  public readonly apiRequest: ApiRequestFunction;
  
  /**
   * The marketplace ID this module is associated with
   */
  public readonly marketplaceId: string;
  
  /**
   * Module options
   */
  public readonly options: ApplicationManagementModuleOptions;
  
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
    options: ApplicationManagementModuleOptions = {}
  ) {
    this.apiVersion = apiVersion;
    this.apiRequest = apiRequest;
    this.marketplaceId = marketplaceId;
    this.options = options;
    this.basePath = `/application-management/${apiVersion}`;
  }
  
  
  /**
   * Get the current usage plans for the application
   * @returns The application usage plans
   */
  public async getApplicationUsagePlans(): Promise<ApiResponse<GetApplicationUsagePlansResponse>> {
    try {
      return await this.makeApiCall<GetApplicationUsagePlansResponse>({
        method: 'GET',
        path: '/usagePlans'
      });
    } catch(error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getApplicationUsagePlans`);
    }
  }
  
  /**
   * Get API usage records for the application
   * @param options Options for filtering API usage records
   * @returns API usage records
   */
  public async getApiUsage(options: GetApiUsageOptions): Promise<ApiResponse<GetApiUsageResponse>> {
    if (!options.startTime) {
      throw AmazonErrorHandler.createError('Start time is required to get API usage', AmazonErrorCode.INVALID_INPUT);
    }
    
    if (!options.endTime) {
      throw AmazonErrorHandler.createError('End time is required to get API usage', AmazonErrorCode.INVALID_INPUT);
    }
    
    const params: Record<string, any> = {
      startTime: options.startTime,
      endTime: options.endTime
    };
    
    if (options.operations && options.operations.length > 0) {
      params.operations = options.operations.join(',');
    }
    
    if (options.methods && options.methods.length > 0) {
      params.methods = options.methods.join(',');
    }
    
    if (options.paths && options.paths.length > 0) {
      params.paths = options.paths.join(',');
    }
    
    if (options.maxResults) {
      params.maxResults = options.maxResults;
    }
    
    if (options.nextToken) {
      params.nextToken = options.nextToken;
    }
    
    try {
      return await this.makeApiCall<GetApiUsageResponse>({
        method: 'GET',
        path: '/usage',
        params
      });
    } catch(error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getApiUsage`);
    }
  }
  
  /**
   * Get the status of a specific API
   * @param apiName The name of the API
   * @returns The API status
   */
  public async getApiStatus(apiName: string): Promise<ApiResponse<GetApiStatusResponse>> {
    if (!apiName) {
      throw AmazonErrorHandler.createError('API name is required to get API status', AmazonErrorCode.INVALID_INPUT);
    }
    
    try {
      return await this.makeApiCall<GetApiStatusResponse>({
        method: 'GET',
        path: `/apis/${apiName}/status`
      });
    } catch(error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getApiStatus`);
    }
  }
  
  /**
   * Get notification subscriptions for the application
   * @param options Options for filtering notification subscriptions
   * @returns Notification subscriptions
   */
  public async getNotificationSubscriptions(options: GetNotificationSubscriptionsOptions = {}): Promise<ApiResponse<GetNotificationSubscriptionsResponse>> {
    const params: Record<string, any> = {};
    
    if (options.notificationTypes && options.notificationTypes.length > 0) {
      params.notificationTypes = options.notificationTypes.join(',');
    }
    
    if (options.maxResults) {
      params.maxResults = options.maxResults;
    }
    
    if (options.nextToken) {
      params.nextToken = options.nextToken;
    }
    
    try {
      return await this.makeApiCall<GetNotificationSubscriptionsResponse>({
        method: 'GET',
        path: '/notifications/subscriptions',
        params
      });
    } catch(error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getNotificationSubscriptions`);
    }
  }
  
  /**
   * Create a notification subscription
   * @param options Options for creating a notification subscription
   * @returns The created notification subscription
   */
  public async createNotificationSubscription(options: CreateNotificationSubscriptionOptions): Promise<ApiResponse<{ subscriptionId: string }>> {
    if (!options.notificationType) {
      throw AmazonErrorHandler.createError('Notification type is required to create a subscription', AmazonErrorCode.INVALID_INPUT);
    }
    
    if (!options.destination) {
      throw AmazonErrorHandler.createError('Destination is required to create a subscription', AmazonErrorCode.INVALID_INPUT);
    }
    
    try {
      return await this.makeApiCall<{ subscriptionId: string }>({
        method: 'POST',
        path: '/notifications/subscriptions',
        data: {
          notificationType: options.notificationType,
          destination: options.destination,
          format: options.format || 'JSON'
        }
      });
    } catch(error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.createNotificationSubscription`);
    }
  }
  
  /**
   * Delete a notification subscription
   * @param subscriptionId The ID of the subscription to delete
   * @returns Empty response
   */
  public async deleteNotificationSubscription(subscriptionId: string): Promise<ApiResponse<void>> {
    if (!subscriptionId) {
      throw AmazonErrorHandler.createError('Subscription ID is required to delete a subscription', AmazonErrorCode.INVALID_INPUT);
    }
    
    try {
      return await this.makeApiCall<void>({
        method: 'DELETE',
        path: `/notifications/subscriptions/${subscriptionId}`
      });
    } catch(error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.deleteNotificationSubscription`);
    }
  }
  
  /**
   * Get all API usage records (handles pagination)
   * @param options Options for filtering API usage records
   * @param maxPages Maximum number of pages to retrieve (default: 10)
   * @returns All API usage records
   */
  public async getAllApiUsage(options: GetApiUsageOptions, maxPages: number = 10): Promise<ApiUsageRecord[]> {
    const allRecords: ApiUsageRecord[] = [];
    let nextToken: string | undefined = options.nextToken;
    let currentPage = 1;
    
    do {
      // Update options with next token
      const pageOptions: GetApiUsageOptions = {
        ...options,
        nextToken
      };
      
      // Get the current page of records
      const response = await this.getApiUsage(pageOptions);
      
      // Add records to our collection
      if (response.data.records && response.data.records.length > 0) {
        allRecords.push(...response.data.records);
      }
      
      // Update the next token
      nextToken = response.data.nextToken;
      currentPage++;
      
      // Stop if we've reached the maximum number of pages or there are no more pages
    } while (nextToken && currentPage <= maxPages);
    
    return allRecords;
  }
  
  /**
   * Get all notification subscriptions (handles pagination)
   * @param options Options for filtering notification subscriptions
   * @param maxPages Maximum number of pages to retrieve (default: 10)
   * @returns All notification subscriptions
   */
  public async getAllNotificationSubscriptions(options: GetNotificationSubscriptionsOptions = {}, maxPages: number = 10): Promise<NotificationSubscription[]> {
    const allSubscriptions: NotificationSubscription[] = [];
    let nextToken: string | undefined = options.nextToken;
    let currentPage = 1;
    
    do {
      // Update options with next token
      const pageOptions: GetNotificationSubscriptionsOptions = {
        ...options,
        nextToken
      };
      
      // Get the current page of subscriptions
      const response = await this.getNotificationSubscriptions(pageOptions);
      
      // Add subscriptions to our collection
      if (response.data.subscriptions && response.data.subscriptions.length > 0) {
        allSubscriptions.push(...response.data.subscriptions);
      }
      
      // Update the next token
      nextToken = response.data.nextToken;
      currentPage++;
      
      // Stop if we've reached the maximum number of pages or there are no more pages
    } while (nextToken && currentPage <= maxPages);
    
    return allSubscriptions;
  }
  
  /**
   * Get API usage statistics for a specified period
   * @param startTime Start time for the period (ISO 8601 format)
   * @param endTime End time for the period (ISO 8601 format)
   * @returns API usage statistics
   */
  public async getApiUsageStatistics(startTime: string, endTime: string): Promise<{
    totalCalls: number;
    operationCounts: Record<string, number>;
    methodCounts: Record<string, number>;
  }> {
    // Get all API usage records for the period
    const records = await this.getAllApiUsage({ 
      startTime, 
      endTime 
    });
    
    // Calculate statistics
    const operationCounts: Record<string, number> = {};
    const methodCounts: Record<string, number> = {};
    
    for (const record of records) {
      // Count by operation
      operationCounts[record.operation] = (operationCounts[record.operation] || 0) + 1;
      
      // Count by method
      methodCounts[record.method] = (methodCounts[record.method] || 0) + 1;
    }
    
    return {
      totalCalls: records.length,
      operationCounts,
      methodCounts
    };
  }
  
  /**
   * Check if you are approaching rate limits based on recent usage
   * @param thresholdPercentage Percentage threshold for warnings (default: 80)
   * @returns Warning information if approaching limits
   */
  public async checkRateLimitApproach(thresholdPercentage: number = 80): Promise<{
    approaching: boolean;
    warnings: Array<{
      operation: string;
      usagePercentage: number;
    }>;
  }> {
    // Get current usage plans to know the limits
    const usagePlansResponse = await this.getApplicationUsagePlans();
    const usagePlans = usagePlansResponse.data.usagePlans;
    
    if (!usagePlans || usagePlans.length === 0) {
      return {
        approaching: false,
        warnings: []
      };
    }
    
    // Get recent API usage (last hour)
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recentUsage = await this.getAllApiUsage({
      startTime: oneHourAgo.toISOString(),
      endTime: now.toISOString()
    });
    
    // Group by operation
    const operationCounts: Record<string, number> = {};
    for (const record of recentUsage) {
      operationCounts[record.operation] = (operationCounts[record.operation] || 0) + 1;
    }
    
    // Check against rate limits in the usage plan
    const warnings: Array<{
      operation: string;
      usagePercentage: number;
    }> = [];
    
    // Use the first usage plan (typically there's only one active plan)
    const usagePlan = usagePlans[0];
    
    // For simplicity, we'll look at the most restrictive rate limit (smallest period)
    const limits = usagePlan.rateLimits.sort((a, b) => a.periodInSeconds - b.periodInSeconds);
    
    if (limits.length > 0) {
      const hourlyLimit = limits[0].rateLimit * (3600 / limits[0].periodInSeconds);
      
      // Check each operation against this hourly limit
      for (const [operation, count] of Object.entries(operationCounts)) {
        const usagePercentage = (count / hourlyLimit) * 100;
        
        if (usagePercentage >= thresholdPercentage) {
          warnings.push({ 
            operation, 
            usagePercentage 
          });
        }
      }
    }
    
    return {
      approaching: warnings.length > 0,
      warnings
    };
  }
  
  /**
   * Helper method to make API requests
   * 
   * @param options Request options
   * @returns Promise resolving to the API response
   */
  private async makeApiCall<T>(options: ApiRequestOptions): Promise<ApiResponse<T>> {
    const { method, path, params, data } = options;
    
    // Construct full path with proper URL handling
    const fullPath = path.startsWith('/')
      ? `${this.basePath}${path}`
      : `${this.basePath}/${path}`;
    
    try {
      return await this.apiRequest<T>(fullPath, method, {
        ...data,
        _params: params,
        _marketplaceId: this.marketplaceId
      });
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.${method} ${path}`);
    }
  }
}