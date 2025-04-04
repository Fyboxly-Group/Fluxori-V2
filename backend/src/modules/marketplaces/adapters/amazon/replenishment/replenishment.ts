/**
 * Amazon Replenishment API Module
 * 
 * Implements the Amazon SP-API Replenishment API functionality.
 * This module provides operations for automated inventory planning and replenishment.
 */

import { ApiRequestFunction, ApiResponse, BaseModule } from '../core/base-module.interface';
import AmazonErrorHandler, { AmazonErrorCode } from '../utils/amazon-error';

/**
 * Replenishment recommendation status 
 */
export type RecommendationStatus = 'NEW' | 'ACCEPTED' | 'REJECTED' | 'AUTO_ACCEPTED';

/**
 * Recommendation type
 */
export type RecommendationType = 'PURCHASE_ORDER';

/**
 * Recommendation urgency
 */
export type RecommendationUrgency = 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Time series granularity
 */
export type TimeSeriesGranularity = 'DAILY' | 'WEEKLY' | 'MONTHLY';

/**
 * Time series data type
 */
export type TimeSeriesDataType = 'DEMAND_FORECAST' | 'HISTORICAL_DEMAND' | 'INVENTORY_PROJECTION' | 'LEAD_TIME_FORECAST';

/**
 * Unit of measure
 */
export type UnitOfMeasure = 'EACH' | 'CASE';

/**
 * Options for getting replenishment recommendations
 */
export interface GetReplenishmentRecommendationsOptions {
  /**
   * Seller SKUs to filter by
   */
  sellerSkus?: string[];
  
  /**
   * ASINs to filter by
   */
  asins?: string[];
  
  /**
   * List of recommendation statuses to filter by
   */
  recommendationStatuses?: RecommendationStatus[];
  
  /**
   * List of recommendation types to filter by
   */
  recommendationTypes?: RecommendationType[];
  
  /**
   * Recommendation creation date range start
   */
  recommendationCreationDateFrom?: string;
  
  /**
   * Recommendation creation date range end
   */
  recommendationCreationDateTo?: string;
  
  /**
   * Maximum number of results to return
   */
  maxResults?: number;
  
  /**
   * Next token for pagination
   */
  nextToken?: string;
  
  /**
   * Sort field for recommendations
   */
  sortField?: 'URGENCY' | 'CREATION_DATE';
  
  /**
   * Sort order for recommendations
   */
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Options for getting time series data
 */
export interface GetTimeSeriesDataOptions {
  /**
   * SKU to get time series data for
   */
  sellerSku: string;
  
  /**
   * Start date of time series data
   */
  startDate: string;
  
  /**
   * End date of time series data
   */
  endDate: string;
  
  /**
   * Granularity of time series data
   */
  granularity: TimeSeriesGranularity;
  
  /**
   * Type of time series data
   */
  dataType: TimeSeriesDataType;
}

/**
 * Options for getting replenishment programs
 */
export interface GetReplenishmentProgramsOptions {
  /**
   * Next token for pagination
   */
  nextToken?: string;
}

/**
 * Options for updating a replenishment recommendation
 */
export interface UpdateReplenishmentRecommendationOptions {
  /**
   * New status for the recommendation
   */
  status: RecommendationStatus;
  
  /**
   * Reason for rejection (required if status is REJECTED)
   */
  rejectionReason?: string;
  
  /**
   * Notes for accepting/rejecting the recommendation
   */
  notes?: string;
}

/**
 * Replenishment program 
 */
export interface ReplenishmentProgram {
  /**
   * The ID of the replenishment program
   */
  programId: string;
  
  /**
   * The name of the replenishment program
   */
  name: string;
  
  /**
   * The description of the replenishment program
   */
  description: string;
  
  /**
   * The status of the replenishment program
   */
  status: 'ACTIVE' | 'INACTIVE';
}

/**
 * Response for getting replenishment programs
 */
export interface GetReplenishmentProgramsResponse {
  /**
   * List of replenishment programs
   */
  replenishmentPrograms: ReplenishmentProgram[];
  
  /**
   * Next token for pagination
   */
  nextToken?: string;
}

/**
 * Time series data point
 */
export interface TimeSeriesDataPoint {
  /**
   * The date for this data point
   */
  date: string;
  
  /**
   * The value for this data point
   */
  value: number;
}

/**
 * Time series data
 */
export interface TimeSeriesData {
  /**
   * The SKU for this time series data
   */
  sellerSku: string;
  
  /**
   * The type of time series data
   */
  dataType: TimeSeriesDataType;
  
  /**
   * The granularity of the time series data
   */
  granularity: TimeSeriesGranularity;
  
  /**
   * The unit of measure for the values
   */
  unitOfMeasure: UnitOfMeasure;
  
  /**
   * The time series data points
   */
  dataPoints: TimeSeriesDataPoint[];
}

/**
 * Line item in a recommendation
 */
export interface RecommendationLineItem {
  /**
   * The SKU for this line item
   */
  sellerSku: string;
  
  /**
   * The ASIN for this line item
   */
  asin?: string;
  
  /**
   * The recommended quantity to order
   */
  recommendedQuantity: number;
  
  /**
   * The unit of measure for the quantity
   */
  unitOfMeasure: UnitOfMeasure;
  
  /**
   * The urgency of this recommendation
   */
  urgency: RecommendationUrgency;
  
  /**
   * The expected time to stock out without replenishment
   */
  expectedStockoutTime?: string;
  
  /**
   * Additional attributes for this line item
   */
  attributes?: Record<string, string>;
}

/**
 * Replenishment recommendation
 */
export interface ReplenishmentRecommendation {
  /**
   * The ID of the recommendation
   */
  recommendationId: string;
  
  /**
   * The ID of the replenishment program that created this recommendation
   */
  programId: string;
  
  /**
   * The type of recommendation
   */
  recommendationType: RecommendationType;
  
  /**
   * The current status of the recommendation
   */
  status: RecommendationStatus;
  
  /**
   * The date when the recommendation was created
   */
  creationDate: string;
  
  /**
   * The list of line items in this recommendation
   */
  lineItems: RecommendationLineItem[];
  
  /**
   * The date when the recommendation was last updated
   */
  lastUpdatedDate?: string;
  
  /**
   * The reason for rejection if the recommendation was rejected
   */
  rejectionReason?: string;
  
  /**
   * Notes associated with this recommendation
   */
  notes?: string;
  
  /**
   * Additional attributes for this recommendation
   */
  attributes?: Record<string, string>;
}

/**
 * Response for getting replenishment recommendations
 */
export interface GetReplenishmentRecommendationsResponse {
  /**
   * List of replenishment recommendations
   */
  recommendations: ReplenishmentRecommendation[];
  
  /**
   * Next token for pagination
   */
  nextToken?: string;
}

/**
 * Interface for replenishment module options
 */
export interface ReplenishmentModuleOptions {
  // Optional configuration specific to replenishment module
}

/**
 * Implementation of the Amazon Replenishment API
 */
export class ReplenishmentModule implements BaseModule<ReplenishmentModuleOptions> {
  /**
   * The unique identifier for this module
   */
  public readonly moduleId: string = 'replenishment';
  
  /**
   * The human-readable name of this module
   */
  public readonly moduleName: string = 'Amazon Replenishment';
  
  /**
   * The base URL path for API requests
   */
  public readonly basePath: string = '/replenishment';
  
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
  public readonly options: ReplenishmentModuleOptions = {};
  
  /**
   * The API request function used by this module
   */
  public readonly apiRequest: ApiRequestFunction;
  
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
    this.apiVersion = apiVersion;
    this.apiRequest = apiRequest;
    this.marketplaceId = marketplaceId;
  }
  
  /**
   * Get replenishment programs
   * @param options Options for getting replenishment programs
   * @returns List of replenishment programs
   */
  public async getReplenishmentPrograms(options: GetReplenishmentProgramsOptions = {}): Promise<GetReplenishmentProgramsResponse> {
    const params: Record<string, any> = {};
    
    if (options.nextToken) {
      params.nextToken = options.nextToken;
    }
    
    try {
      const response = await this.apiRequest(
        `${this.basePath}/programs`,
        'GET',
        params
      );
      
      return response.data as GetReplenishmentProgramsResponse;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Get replenishment recommendations
   * @param options Options for getting replenishment recommendations
   * @returns List of replenishment recommendations
   */
  public async getReplenishmentRecommendations(options: GetReplenishmentRecommendationsOptions = {}): Promise<GetReplenishmentRecommendationsResponse> {
    const params: Record<string, any> = {};
    
    if (options.sellerSkus && options.sellerSkus.length > 0) {
      params.sellerSkus = options.sellerSkus.join(',');
    }
    
    if (options.asins && options.asins.length > 0) {
      params.asins = options.asins.join(',');
    }
    
    if (options.recommendationStatuses && options.recommendationStatuses.length > 0) {
      params.recommendationStatuses = options.recommendationStatuses.join(',');
    }
    
    if (options.recommendationTypes && options.recommendationTypes.length > 0) {
      params.recommendationTypes = options.recommendationTypes.join(',');
    }
    
    if (options.recommendationCreationDateFrom) {
      params.recommendationCreationDateFrom = options.recommendationCreationDateFrom;
    }
    
    if (options.recommendationCreationDateTo) {
      params.recommendationCreationDateTo = options.recommendationCreationDateTo;
    }
    
    if (options.maxResults) {
      params.maxResults = options.maxResults;
    }
    
    if (options.nextToken) {
      params.nextToken = options.nextToken;
    }
    
    if (options.sortField) {
      params.sortField = options.sortField;
    }
    
    if (options.sortOrder) {
      params.sortOrder = options.sortOrder;
    }
    
    try {
      const response = await this.apiRequest(
        `${this.basePath}/recommendations`,
        'GET',
        params
      );
      
      return response.data as GetReplenishmentRecommendationsResponse;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Get a specific replenishment recommendation by ID
   * @param recommendationId ID of the recommendation to get
   * @returns Replenishment recommendation
   */
  public async getReplenishmentRecommendation(recommendationId: string): Promise<ReplenishmentRecommendation> {
    if (!recommendationId) {
      throw AmazonErrorHandler.createError(
        'Recommendation ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.apiRequest(
        `${this.basePath}/recommendations/${recommendationId}`,
        'GET'
      );
      
      return response.data as ReplenishmentRecommendation;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Update a replenishment recommendation
   * @param recommendationId ID of the recommendation to update
   * @param options Update options
   * @returns Updated recommendation
   */
  public async updateReplenishmentRecommendation(
    recommendationId: string,
    options: UpdateReplenishmentRecommendationOptions
  ): Promise<ReplenishmentRecommendation> {
    if (!recommendationId) {
      throw AmazonErrorHandler.createError(
        'Recommendation ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.status) {
      throw AmazonErrorHandler.createError(
        'Status is required to update recommendation',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Rejection reason is required if status is REJECTED
    if (options.status === 'REJECTED' && !options.rejectionReason) {
      throw AmazonErrorHandler.createError(
        'Rejection reason is required when rejecting a recommendation',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.apiRequest(
        `${this.basePath}/recommendations/${recommendationId}`,
        'PATCH',
        {
          status: options.status,
          rejectionReason: options.rejectionReason,
          notes: options.notes
        }
      );
      
      return response.data as ReplenishmentRecommendation;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Get time series data for a SKU
   * @param options Options for getting time series data
   * @returns Time series data
   */
  public async getTimeSeriesData(options: GetTimeSeriesDataOptions): Promise<TimeSeriesData> {
    if (!options.sellerSku) {
      throw AmazonErrorHandler.createError(
        'Seller SKU is required to get time series data',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.startDate) {
      throw AmazonErrorHandler.createError(
        'Start date is required to get time series data',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.endDate) {
      throw AmazonErrorHandler.createError(
        'End date is required to get time series data',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.granularity) {
      throw AmazonErrorHandler.createError(
        'Granularity is required to get time series data',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.dataType) {
      throw AmazonErrorHandler.createError(
        'Data type is required to get time series data',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.apiRequest(
        `${this.basePath}/timeSeries`,
        'GET',
        {
          sellerSku: options.sellerSku,
          startDate: options.startDate,
          endDate: options.endDate,
          granularity: options.granularity,
          dataType: options.dataType
        }
      );
      
      return response.data as TimeSeriesData;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Accept a replenishment recommendation
   * @param recommendationId ID of the recommendation to accept
   * @param notes Optional notes on the acceptance
   * @returns Updated recommendation
   */
  public async acceptRecommendation(recommendationId: string, notes?: string): Promise<ReplenishmentRecommendation> {
    return this.updateReplenishmentRecommendation(recommendationId, {
      status: 'ACCEPTED',
      notes
    });
  }
  
  /**
   * Reject a replenishment recommendation
   * @param recommendationId ID of the recommendation to reject
   * @param rejectionReason Reason for rejection
   * @param notes Optional notes on the rejection
   * @returns Updated recommendation
   */
  public async rejectRecommendation(recommendationId: string, rejectionReason: string, notes?: string): Promise<ReplenishmentRecommendation> {
    return this.updateReplenishmentRecommendation(recommendationId, {
      status: 'REJECTED',
      rejectionReason,
      notes
    });
  }
  
  /**
   * Get all replenishment programs (handles pagination)
   * @param options Options for getting replenishment programs
   * @param maxPages Maximum number of pages to retrieve (default: 10)
   * @returns All replenishment programs
   */
  public async getAllReplenishmentPrograms(options: GetReplenishmentProgramsOptions = {}, maxPages: number = 10): Promise<ReplenishmentProgram[]> {
    const allPrograms: ReplenishmentProgram[] = [];
    let nextToken: string | undefined = options.nextToken;
    let currentPage = 1;
    
    do {
      // Update options with next token
      const pageOptions: GetReplenishmentProgramsOptions = {
        ...options,
        nextToken
      };
      
      // Get the current page of programs
      const response = await this.getReplenishmentPrograms(pageOptions);
      
      // Add programs to our collection
      if (response.replenishmentPrograms && response.replenishmentPrograms.length > 0) {
        allPrograms.push(...response.replenishmentPrograms);
      }
      
      // Update the next token
      nextToken = response.nextToken;
      currentPage++;
      
      // Stop if we've reached the maximum number of pages or there are no more pages
    } while (nextToken && currentPage <= maxPages);
    
    return allPrograms;
  }
  
  /**
   * Get all replenishment recommendations (handles pagination)
   * @param options Options for getting replenishment recommendations
   * @param maxPages Maximum number of pages to retrieve (default: 10)
   * @returns All replenishment recommendations
   */
  public async getAllReplenishmentRecommendations(options: GetReplenishmentRecommendationsOptions = {}, maxPages: number = 10): Promise<ReplenishmentRecommendation[]> {
    const allRecommendations: ReplenishmentRecommendation[] = [];
    let nextToken: string | undefined = options.nextToken;
    let currentPage = 1;
    
    do {
      // Update options with next token
      const pageOptions: GetReplenishmentRecommendationsOptions = {
        ...options,
        nextToken
      };
      
      // Get the current page of recommendations
      const response = await this.getReplenishmentRecommendations(pageOptions);
      
      // Add recommendations to our collection
      if (response.recommendations && response.recommendations.length > 0) {
        allRecommendations.push(...response.recommendations);
      }
      
      // Update the next token
      nextToken = response.nextToken;
      currentPage++;
      
      // Stop if we've reached the maximum number of pages or there are no more pages
    } while (nextToken && currentPage <= maxPages);
    
    return allRecommendations;
  }
  
  /**
   * Get new replenishment recommendations that require action
   * @returns New replenishment recommendations
   */
  public async getNewRecommendations(): Promise<ReplenishmentRecommendation[]> {
    return this.getAllReplenishmentRecommendations({
      recommendationStatuses: ['NEW'],
      sortField: 'URGENCY',
      sortOrder: 'DESC'
    });
  }
  
  /**
   * Get high urgency replenishment recommendations
   * @returns High urgency replenishment recommendations
   */
  public async getHighUrgencyRecommendations(): Promise<ReplenishmentRecommendation[]> {
    const recommendations = await this.getAllReplenishmentRecommendations({
      recommendationStatuses: ['NEW'],
      sortField: 'URGENCY',
      sortOrder: 'DESC'
    });
    
    // Filter recommendations to include only those with high urgency line items
    return recommendations.filter((recommendation) => {
      return recommendation.lineItems.some((lineItem) => lineItem.urgency === 'HIGH');
    });
  }
}