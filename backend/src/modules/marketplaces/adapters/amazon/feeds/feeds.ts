/**
 * Amazon Feeds API Module
 * 
 * Implements the Amazon SP-API Feeds API functionality.
 * This module handles feed document creation, submission and result checking.
 */

import { BaseApiModule } from '../core/api-module';
import { AmazonErrorUtil, AmazonErrorCode } from '../utils/amazon-error';
import { PaginatedResponse } from '../core/api-types';

/**
 * Feed document API response
 */
export interface FeedDocument {
  /**
   * The identifier of the feed document
   */
  feedDocumentId: string;
  
  /**
   * A presigned URL for the feed document
   */
  url: string;
  
  /**
   * The encryption details required for the feed document
   */
  encryption?: {
    /**
     * Encryption standard to use
     */
    standard: string;
    
    /**
     * Initialization vector for encryption
     */
    initializationVector: string;
    
    /**
     * Encryption key
     */
    key: string;
  };
  
  /**
   * The content type of the feed document
   */
  contentType: string;
  
  /**
   * The compression algorithm to use for the document
   */
  compressionAlgorithm?: 'GZIP';
}

/**
 * Feed types supported by Amazon
 */
export enum FeedType {
  // Inventory Feeds
  INVENTORY_JSON = 'POST_INVENTORY_AVAILABILITY_DATA',
  INVENTORY_XML = 'POST_PRODUCT_DATA',
  
  // Pricing Feeds
  PRICING_JSON = 'POST_PRODUCT_PRICING_DATA',
  
  // Product Feeds
  PRODUCT_JSON = 'POST_PRODUCT_DATA_JSON',
  PRODUCT_XML = 'POST_PRODUCT_DATA',
  
  // Order Fulfillment Feeds
  ORDER_ACKNOWLEDGEMENT = 'POST_ORDER_ACKNOWLEDGEMENT_DATA',
  ORDER_FULFILLMENT = 'POST_ORDER_FULFILLMENT_DATA',
  ORDER_ADJUSTMENT = 'POST_PAYMENT_ADJUSTMENT_DATA',
  
  // FBA Feeds
  FBA_INVENTORY = 'POST_FBA_INBOUND_CARTON_CONTENTS',
  FBA_SHIPMENT = 'POST_FULFILLMENT_ORDER_REQUEST_DATA',
  FBA_REMOVAL = 'POST_REMOVAL_DATA',
  
  // Image Feeds
  PRODUCT_IMAGES = 'POST_PRODUCT_IMAGE_DATA',
  
  // Listings Feeds
  LISTINGS_DATA = 'POST_LISTINGS_ITEMS_DATA_JSON',
  
  // Order Reports
  ORDER_REPORT_ACK_DATA = 'POST_ORDER_REPORT_ACK_DATA',
  
  // Conversion
  FLAT_FILE_LISTINGS = 'POST_FLAT_FILE_LISTINGS_DATA',
  FLAT_FILE_ORDERS = 'POST_FLAT_FILE_ORDER_ACKNOWLEDGEMENT_DATA',
  FLAT_FILE_FULFILLMENT = 'POST_FLAT_FILE_FULFILLMENT_DATA'
}

/**
 * Feed processing status
 */
export enum FeedProcessingStatus {
  /**
   * The feed is being processed
   */
  PROCESSING = 'PROCESSING',
  
  /**
   * The feed has been processed successfully
   */
  DONE = 'DONE',
  
  /**
   * The feed was processed with fatal errors
   */
  FATAL = 'FATAL',
  
  /**
   * The feed processing has been cancelled
   */
  CANCELLED = 'CANCELLED',
  
  /**
   * The feed is awaiting asynchronous processing
   */
  IN_QUEUE = 'IN_QUEUE',
  
  /**
   * The feed is awaiting a key system to become available for processing
   */
  IN_PROGRESS = 'IN_PROGRESS'
}

/**
 * Feed creation request
 */
export interface CreateFeedDocumentRequest {
  /**
   * The content type of the feed document
   */
  contentType: string;
}

/**
 * Interface for a feed submission
 */
export interface Feed {
  /**
   * Feed identifier
   */
  feedId: string;
  
  /**
   * Type of feed
   */
  feedType: string;
  
  /**
   * Document identifier for the feed
   */
  feedDocumentId: string;
  
  /**
   * Current processing status
   */
  processingStatus: FeedProcessingStatus;
  
  /**
   * ISO timestamp when feed was created
   */
  createdTime: string;
  
  /**
   * ISO timestamp when feed processing started
   */
  processingStartTime?: string;
  
  /**
   * ISO timestamp when feed processing ended
   */
  processingEndTime?: string;
  
  /**
   * Feed document identifier for the processing report
   */
  resultFeedDocumentId?: string;
}

/**
 * Feed creation parameters
 */
export interface CreateFeedParams {
  /**
   * Type of feed to create
   */
  feedType: FeedType | string;
  
  /**
   * ID of the feed document associated with the feed
   */
  feedDocumentId: string;
  
  /**
   * Marketplace IDs to process the feed for
   */
  marketplaceIds: string[];
  
  /**
   * Additional options
   */
  options?: {
    /**
     * Time between which feed should be processed
     */
    processingStartTime?: string;
    
    /**
     * Time after which feed should be processed
     */
    processingEndTime?: string;
  };
}

/**
 * Feed list parameters
 */
export interface GetFeedsParams {
  /**
   * Types of feeds to retrieve
   */
  feedTypes?: Array<FeedType | string>;
  
  /**
   * Processing statuses to filter by
   */
  processingStatuses?: FeedProcessingStatus[];
  
  /**
   * Date-time after which feeds were created
   */
  createdSince?: string;
  
  /**
   * Date-time before which feeds were created
   */
  createdUntil?: string;
  
  /**
   * Maximum number of feeds to return
   */
  pageSize?: number;
  
  /**
   * Token for retrieving the next page
   */
  nextToken?: string;
}

/**
 * Implementation of the Amazon Feeds API
 */
export class FeedsModule extends BaseApiModule {
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
    super('feeds', apiVersion, makeApiRequest, marketplaceId);
  }
  
  /**
   * Initialize the module
   * @param config Module-specific configuration
   * @returns Promise that resolves when initialization is complete
   */
  protected async initializeModule(config?: any): Promise<void> {
    // No specific initialization required for this module
    return Promise.resolve();
  }
  
  /**
   * Create a feed document
   * @param contentType Content type of the document
   * @returns Feed document details with upload URL
   */
  public async createFeedDocument(
    contentType: string
  ): Promise<FeedDocument> {
    try {
      const response = await this.makeRequest<FeedDocument>({
        method: 'POST',
        path: '/documents',
        data: { contentType }
      });
      
      return response.data;
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.createFeedDocument`);
    }
  }
  
  /**
   * Get feed document information
   * @param feedDocumentId ID of the feed document
   * @returns Feed document details with download URL
   */
  public async getFeedDocument(
    feedDocumentId: string
  ): Promise<FeedDocument> {
    try {
      const response = await this.makeRequest<FeedDocument>({
        method: 'GET',
        path: `/documents/${feedDocumentId}`
      });
      
      return response.data;
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getFeedDocument`);
    }
  }
  
  /**
   * Create and submit a new feed
   * @param params Feed creation parameters
   * @returns Feed details
   */
  public async createFeed(
    params: CreateFeedParams
  ): Promise<Feed> {
    if (!params.feedType) {
      throw AmazonErrorUtil.createError('Feed type is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    if (!params.feedDocumentId) {
      throw AmazonErrorUtil.createError('Feed document ID is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    if (!params.marketplaceIds || params.marketplaceIds.length === 0) {
      throw AmazonErrorUtil.createError('At least one marketplace ID is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    try {
      const data: any = {
        feedType: params.feedType,
        marketplaceIds: params.marketplaceIds,
        inputFeedDocumentId: params.feedDocumentId
      };
      
      // Add optional parameters
      if (params.options) {
        if (params.options.processingStartTime) {
          data.processingStartTime = params.options.processingStartTime;
        }
        
        if (params.options.processingEndTime) {
          data.processingEndTime = params.options.processingEndTime;
        }
      }
      
      const response = await this.makeRequest<Feed>({
        method: 'POST',
        path: '/2021-06-30/feeds',
        data
      });
      
      return response.data;
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.createFeed`);
    }
  }
  
  /**
   * Get a feed by ID
   * @param feedId ID of the feed to retrieve
   * @returns Feed details
   */
  public async getFeed(
    feedId: string
  ): Promise<Feed> {
    try {
      const response = await this.makeRequest<Feed>({
        method: 'GET',
        path: `/2021-06-30/feeds/${feedId}`
      });
      
      return response.data;
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getFeed`);
    }
  }
  
  /**
   * Get feeds matching the specified criteria
   * @param params Parameters for filtering feeds
   * @returns List of feeds matching criteria
   */
  public async getFeeds(
    params: GetFeedsParams = {}
  ): Promise<PaginatedResponse<Feed>> {
    try {
      const queryParams: Record<string, any> = {};
      
      // Add query parameters if provided
      if (params.feedTypes && params.feedTypes.length > 0) {
        queryParams.feedTypes = params.feedTypes.join(',');
      }
      
      if (params.processingStatuses && params.processingStatuses.length > 0) {
        queryParams.processingStatuses = params.processingStatuses.join(',');
      }
      
      if (params.createdSince) {
        queryParams.createdSince = params.createdSince;
      }
      
      if (params.createdUntil) {
        queryParams.createdUntil = params.createdUntil;
      }
      
      if (params.pageSize) {
        queryParams.pageSize = params.pageSize.toString();
      }
      
      if (params.nextToken) {
        queryParams.nextToken = params.nextToken;
      }
      
      const response = await this.makeRequest<{
        feeds: Feed[];
        nextToken?: string;
      }>({
        method: 'GET',
        path: '/2021-06-30/feeds',
        params: queryParams
      });
      
      return {
        items: response.data.feeds,
        nextToken: response.data.nextToken,
        pageNumber: 1,
        pageSize: params.pageSize?.toString() || '10',
        hasMore: !!response.data.nextToken,
      };
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getFeeds`);
    }
  }
  
  /**
   * Cancel a feed that is being processed
   * @param feedId ID of the feed to cancel
   * @returns True if the feed was cancelled successfully
   */
  public async cancelFeed(
    feedId: string
  ): Promise<boolean> {
    try {
      await this.makeRequest<void>({
        method: 'DELETE',
        path: `/2021-06-30/feeds/${feedId}`
      });
      
      return true;
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.cancelFeed`);
    }
  }
  
  /**
   * Get all feeds matching criteria (handles pagination)
   * @param params Parameters for filtering feeds
   * @param maxPages Maximum number of pages to retrieve (default: 10)
   * @returns All feeds matching criteria
   */
  public async getAllFeeds(
    params: GetFeedsParams = {},
    maxPages: number = 10
  ): Promise<Feed[]> {
    let currentPage = 1;
    let nextToken: string | undefined = undefined;
    const allFeeds: Feed[] = [];
    
    do {
      // Get a page of feeds
      const response = await this.getFeeds({
        ...params,
        nextToken
      });
      
      // Add feeds to our collection
      if (response.items && response.items.length > 0) {
        allFeeds.push(...response.items);
      }
      
      // Get next token for pagination
      nextToken = response.nextToken;
      currentPage++;
      
      // Stop if we've reached the max pages or there are no more pages
    } while (nextToken && currentPage <= maxPages);
    
    return allFeeds;
  }
  
  /**
   * Wait for a feed to complete processing
   * @param feedId ID of the feed to wait for
   * @param maxAttempts Maximum number of polling attempts (default: 60)
   * @param delayMs Delay between polling attempts in milliseconds (default: 5000)
   * @returns The final feed status
   */
  public async waitForFeedProcessing(
    feedId: string,
    maxAttempts: number = 60,
    delayMs: number = 5000
  ): Promise<Feed> {
    let attempts = 0;
    let feed: Feed;
    
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    do {
      feed = await this.getFeed(feedId);
      
      // If the feed is done processing, return it
      if (
        feed.processingStatus === FeedProcessingStatus.DONE ||
        feed.processingStatus === FeedProcessingStatus.FATAL ||
        feed.processingStatus === FeedProcessingStatus.CANCELLED
      ) {
        return feed;
      }
      
      // Wait before next attempt
      await delay(delayMs);
      attempts++;
    } while (attempts < maxAttempts);
    
    // If we reached max attempts, return current status
    return feed!;
  }
  
  /**
   * Complete feed submission flow:
   * 1. Create feed document
   * 2. Upload feed content
   * 3. Create feed with document
   * 4. Wait for processing (optional)
   * 
   * @param feedType Type of feed to submit
   * @param contentType Content type of the feed
   * @param content Feed content (must be formatted according to contentType)
   * @param marketplaceIds Marketplace IDs for the feed
   * @param waitForCompletion Whether to wait for feed processing to complete
   * @returns The created feed with processing results
   */
  public async submitFeed(
    feedType: FeedType | string,
    contentType: string,
    content: string | Buffer,
    marketplaceIds: string[] = [this.marketplaceId],
    waitForCompletion: boolean = false
  ): Promise<Feed> {
    try {
      // Create feed document
      const feedDocument = await this.createFeedDocument(contentType);
      
      // TODO: Implement upload to feedDocument.url
      // This would require a separate HTTP client to upload the content
      
      // Create feed with feed document
      const feed = await this.createFeed({
        feedType,
        feedDocumentId: feedDocument.feedDocumentId,
        marketplaceIds
      });
      
      // Wait for feed processing to complete if requested
      if (waitForCompletion) {
        return this.waitForFeedProcessing(feed.feedId);
      }
      
      return feed;
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.submitFeed`);
    }
  }
}

export default FeedsModule;