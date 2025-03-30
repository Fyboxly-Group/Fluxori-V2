/**
 * Amazon Replenishment API Module
 * 
 * Implements the Amazon SP-API Replenishment API functionality.
 * This module provides operations for automated inventory planning and replenishment.
 */

import { BaseApiModule, ApiRequestOptions, ApiResponse } from '../core/api-module';
import { AmazonErrorUtil, AmazonErrorCode } from '../utils/amazon-error';

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
 * Implementation of the Amazon Replenishment API
 */
export class ReplenishmentModule extends BaseApiModule {
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
    super('replenishment', apiVersion, makeApiRequest, marketplaceId);
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
   * Get replenishment programs
   * @param options Options for getting replenishment programs
   * @returns List of replenishment programs
   */
  public async getReplenishmentPrograms(options: GetReplenishmentProgramsOptions = {}): Promise<ApiResponse<GetReplenishmentProgramsResponse>> {
    const params: Record<string, any> = {};
    
    if (options.nextToken) {
      params.nextToken = options.nextToken;
    }
    
    try {
      return await this.makeRequest<GetReplenishmentProgramsResponse>({
        method: 'GET',
        path: '/programs',
        params
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getReplenishmentPrograms`);
    }
  }

  /**
   * Get replenishment recommendations
   * @param options Options for getting replenishment recommendations
   * @returns List of replenishment recommendations
   */
  public async getReplenishmentRecommendations(options: GetReplenishmentRecommendationsOptions = {}): Promise<ApiResponse<GetReplenishmentRecommendationsResponse>> {
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
      return await this.makeRequest<GetReplenishmentRecommendationsResponse>({
        method: 'GET',
        path: '/recommendations',
        params
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getReplenishmentRecommendations`);
    }
  }

  /**
   * Get a specific replenishment recommendation by ID
   * @param recommendationId ID of the recommendation to get
   * @returns Replenishment recommendation
   */
  public async getReplenishmentRecommendation(recommendationId: string): Promise<ApiResponse<ReplenishmentRecommendation>> {
    if (!recommendationId) {
      throw AmazonErrorUtil.createError(
        'Recommendation ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<ReplenishmentRecommendation>({
        method: 'GET',
        path: `/recommendations/${recommendationId}`
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getReplenishmentRecommendation`);
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
  ): Promise<ApiResponse<ReplenishmentRecommendation>> {
    if (!recommendationId) {
      throw AmazonErrorUtil.createError(
        'Recommendation ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.status) {
      throw AmazonErrorUtil.createError(
        'Status is required to update recommendation',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Rejection reason is required if status is REJECTED
    if (options.status === 'REJECTED' && !options.rejectionReason) {
      throw AmazonErrorUtil.createError(
        'Rejection reason is required when rejecting a recommendation',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<ReplenishmentRecommendation>({
        method: 'PATCH',
        path: `/recommendations/${recommendationId}`,
        data: {
          status: options.status,
          rejectionReason: options.rejectionReason,
          notes: options.notes
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.updateReplenishmentRecommendation`);
    }
  }

  /**
   * Get time series data for a SKU
   * @param options Options for getting time series data
   * @returns Time series data
   */
  public async getTimeSeriesData(options: GetTimeSeriesDataOptions): Promise<ApiResponse<TimeSeriesData>> {
    if (!options.sellerSku) {
      throw AmazonErrorUtil.createError(
        'Seller SKU is required to get time series data',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.startDate) {
      throw AmazonErrorUtil.createError(
        'Start date is required to get time series data',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.endDate) {
      throw AmazonErrorUtil.createError(
        'End date is required to get time series data',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.granularity) {
      throw AmazonErrorUtil.createError(
        'Granularity is required to get time series data',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.dataType) {
      throw AmazonErrorUtil.createError(
        'Data type is required to get time series data',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<TimeSeriesData>({
        method: 'GET',
        path: '/timeSeries',
        params: {
          sellerSku: options.sellerSku,
          startDate: options.startDate,
          endDate: options.endDate,
          granularity: options.granularity,
          dataType: options.dataType
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getTimeSeriesData`);
    }
  }

  /**
   * Accept a replenishment recommendation
   * @param recommendationId ID of the recommendation to accept
   * @param notes Optional notes on the acceptance
   * @returns Updated recommendation
   */
  public async acceptRecommendation(
    recommendationId: string,
    notes?: string
  ): Promise<ApiResponse<ReplenishmentRecommendation>> {
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
  public async rejectRecommendation(
    recommendationId: string,
    rejectionReason: string,
    notes?: string
  ): Promise<ApiResponse<ReplenishmentRecommendation>> {
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
  public async getAllReplenishmentPrograms(
    options: GetReplenishmentProgramsOptions = {},
    maxPages: number = 10
  ): Promise<ReplenishmentProgram[]> {
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
      if (response.data.replenishmentPrograms && response.data.replenishmentPrograms.length > 0) {
        allPrograms.push(...response.data.replenishmentPrograms);
      }
      
      // Update the next token
      nextToken = response.data.nextToken;
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
  public async getAllReplenishmentRecommendations(
    options: GetReplenishmentRecommendationsOptions = {},
    maxPages: number = 10
  ): Promise<ReplenishmentRecommendation[]> {
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
      if (response.data.recommendations && response.data.recommendations.length > 0) {
        allRecommendations.push(...response.data.recommendations);
      }
      
      // Update the next token
      nextToken = response.data.nextToken;
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
    return recommendations.filter((recommendation: any) => {
      return recommendation.lineItems.some((lineItem: any) => lineItem.urgency === 'HIGH');
    });
  }
}