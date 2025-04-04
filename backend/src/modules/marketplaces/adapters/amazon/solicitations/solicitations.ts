/**
 * Amazon Solicitations API Module
 * 
 * Implements the Amazon SP-API Solicitations API functionality.
 * This module allows sellers to request reviews and feedback from buyers
 * within Amazon's terms of service and policies.
 */

import { ApiModule } from '../core/api-module';
import { ApiResponse, ApiRequestFunction } from '../core/base-module.interface';
import AmazonErrorHandler, { AmazonErrorCode } from '../utils/amazon-error';
import { RequestOptions } from '../core/api-types';

/**
 * Solicitation type enum - Defines the types of solicitations that can be sent
 */
export type SolicitationType = 'REQUEST_REVIEW' | 'REQUEST_FEEDBACK';

/**
 * Error details in solicitation responses
 */
export interface SolicitationError {
  /**
   * Error code
   */
  code: string;
  
  /**
   * Error message
   */
  message: string;
  
  /**
   * Additional error details
   */
  details?: string;
}

/**
 * Represents available solicitation actions and their status
 */
export interface SolicitationAction {
  /**
   * Type of solicitation (request_review, request_feedback)
   */
  solicitationType: string;
  
  /**
   * Whether the solicitation is allowed for this order
   */
  isAllowed: boolean;
  
  /**
   * Reason why the solicitation is not allowed (if applicable)
   */
  disallowedReason?: string;
}

/**
 * Response for getting available solicitation actions
 */
export interface GetSolicitationActionsResponse {
  /**
   * List of available solicitation actions
   */
  payload: SolicitationAction[];
}

/**
 * Response when creating a solicitation
 */
export interface CreateSolicitationResponse {
  /**
   * Status of the solicitation request
   */
  status: string;
  
  /**
   * Any errors that occurred when creating the solicitation
   */
  errors?: SolicitationError[];
}

/**
 * Options for getting available solicitation actions
 */
export interface GetSolicitationActionsOptions {
  /**
   * Marketplace ID where the order was placed
   */
  marketplaceId: string;
}

/**
 * Options for sending a solicitation
 */
export interface SendSolicitationOptions {
  /**
   * Marketplace ID where the order was placed
   */
  marketplaceId: string;
  
  /**
   * Type of solicitation to send
   */
  solicitationType: SolicitationType;
}

/**
 * Solicitations module configuration options
 */
export interface SolicitationsModuleOptions {
  /**
   * Log detailed information about solicitation results
   */
  detailedLogging?: boolean;
  
  /**
   * Number of retries for failed requests (0-3)
   */
  maxRetries?: number;
  
  /**
   * Whether to throw errors on failed solicitations
   */
  throwOnFailure?: boolean;
}

/**
 * Implementation of the Amazon Solicitations API
 */
export class SolicitationsModule extends ApiModule<SolicitationsModuleOptions> {
  /**
   * The unique identifier for this module
   */
  readonly moduleId: string = 'solicitations';
  
  /**
   * The human-readable name of this module
   */
  readonly moduleName: string = 'Solicitations';
  
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
   * @param options Module options
   */
  constructor(
    apiVersion: string,
    apiRequest: ApiRequestFunction,
    marketplaceId: string,
    options: SolicitationsModuleOptions = {}
  ) {
    super(apiRequest, marketplaceId, options);
    this.apiVersion = apiVersion;
    this.basePath = `/solicitations/${this.apiVersion}`;
  }
  
  /**
   * Get available solicitation actions for an order
   * @param amazonOrderId Amazon order ID
   * @param options Options for getting available actions
   * @returns Available solicitation actions
   */
  public async getSolicitationActions(
    amazonOrderId: string, 
    options: GetSolicitationActionsOptions
  ): Promise<ApiResponse<GetSolicitationActionsResponse>> {
    if (!amazonOrderId) {
      throw AmazonErrorHandler.createError(
        'Amazon Order ID is required to get solicitation actions',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.marketplaceId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required to get solicitation actions',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const requestOptions: RequestOptions = {
        marketplaceId: options.marketplaceId,
        retry: this.options.maxRetries !== undefined ? this.options.maxRetries > 0 : true
      };
      
      const path = `orders/${amazonOrderId}/solicitations`;
      const queryParams = { marketplaceIds: options.marketplaceId };
      
      return await this.request<GetSolicitationActionsResponse>(
        path,
        'GET',
        { _params: queryParams },
        requestOptions
      );
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getSolicitationActions`);
    }
  }
  
  /**
   * Send a solicitation for an order
   * @param amazonOrderId Amazon order ID
   * @param options Options for sending the solicitation
   * @returns Success response
   */
  public async sendSolicitation(
    amazonOrderId: string, 
    options: SendSolicitationOptions
  ): Promise<ApiResponse<CreateSolicitationResponse>> {
    if (!amazonOrderId) {
      throw AmazonErrorHandler.createError(
        'Amazon Order ID is required to send solicitation',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.marketplaceId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required to send solicitation',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.solicitationType) {
      throw AmazonErrorHandler.createError(
        'Solicitation type is required to send solicitation',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const requestOptions: RequestOptions = {
        marketplaceId: options.marketplaceId,
        retry: this.options.maxRetries !== undefined ? this.options.maxRetries > 0 : true
      };
      
      const path = `orders/${amazonOrderId}/solicitations/${options.solicitationType.toLowerCase()}`;
      const queryParams = { marketplaceIds: options.marketplaceId };
      
      const response = await this.request<CreateSolicitationResponse>(
        path,
        'POST',
        { _params: queryParams },
        requestOptions
      );
      
      // Log detailed information if enabled
      if (this.options.detailedLogging) {
        console.log(`Solicitation ${options.solicitationType} for order ${amazonOrderId}: ${response.data.status}`);
        if (response.data.errors && response.data.errors.length > 0) {
          console.log(`Solicitation errors:`, response.data.errors);
        }
      }
      
      // Check if we should throw an error based on the response
      if (this.options.throwOnFailure && 
          response.data.errors && 
          response.data.errors.length > 0) {
        throw AmazonErrorHandler.createError(
          `Failed to send solicitation: ${response.data.errors[0].message}`,
          AmazonErrorCode.OPERATIONAL_ERROR
        );
      }
      
      return response;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.sendSolicitation`);
    }
  }
  
  /**
   * Request a product review for an order
   * @param amazonOrderId Amazon order ID
   * @param marketplaceId Marketplace ID (optional, defaults to module's marketplace ID)
   * @returns Response indicating success
   */
  public async requestProductReview(
    amazonOrderId: string, 
    marketplaceId?: string
  ): Promise<ApiResponse<CreateSolicitationResponse>> {
    const mktId = marketplaceId || this.marketplaceId;
    
    if (!mktId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required to request product review',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.sendSolicitation(amazonOrderId, {
      marketplaceId: mktId,
      solicitationType: 'REQUEST_REVIEW'
    });
  }
  
  /**
   * Request seller feedback for an order
   * @param amazonOrderId Amazon order ID
   * @param marketplaceId Marketplace ID (optional, defaults to module's marketplace ID)
   * @returns Response indicating success
   */
  public async requestSellerFeedback(
    amazonOrderId: string, 
    marketplaceId?: string
  ): Promise<ApiResponse<CreateSolicitationResponse>> {
    const mktId = marketplaceId || this.marketplaceId;
    
    if (!mktId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required to request seller feedback',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.sendSolicitation(amazonOrderId, {
      marketplaceId: mktId,
      solicitationType: 'REQUEST_FEEDBACK'
    });
  }
  
  /**
   * Check if a solicitation can be sent for a specific order
   * @param amazonOrderId Amazon order ID
   * @param solicitationType Type of solicitation to check
   * @param marketplaceId Marketplace ID (optional, defaults to module's marketplace ID)
   * @returns Whether the solicitation can be sent
   */
  public async isSolicitationAllowed(
    amazonOrderId: string, 
    solicitationType: SolicitationType, 
    marketplaceId?: string
  ): Promise<boolean> {
    const mktId = marketplaceId || this.marketplaceId;
    
    if (!mktId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required to check if solicitation is allowed',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.getSolicitationActions(amazonOrderId, {
        marketplaceId: mktId
      });

      // Check if the solicitation type is in the allowed actions
      return response.data.payload.some(action => 
        action.solicitationType === solicitationType.toLowerCase() && 
        action.isAllowed
      );
    } catch (error) {
      if (this.options.detailedLogging) {
        console.error(`Error checking if solicitation is allowed for order ${amazonOrderId}:`, error);
      }
      return false;
    }
  }
  
  /**
   * Check if a product review solicitation is allowed
   * @param amazonOrderId Amazon order ID
   * @param marketplaceId Marketplace ID (optional, defaults to module's marketplace ID)
   * @returns Whether a product review solicitation is allowed
   */
  public async isProductReviewAllowed(
    amazonOrderId: string, 
    marketplaceId?: string
  ): Promise<boolean> {
    return this.isSolicitationAllowed(amazonOrderId, 'REQUEST_REVIEW', marketplaceId);
  }
  
  /**
   * Check if a seller feedback solicitation is allowed
   * @param amazonOrderId Amazon order ID
   * @param marketplaceId Marketplace ID (optional, defaults to module's marketplace ID)
   * @returns Whether a seller feedback solicitation is allowed
   */
  public async isSellerFeedbackAllowed(
    amazonOrderId: string, 
    marketplaceId?: string
  ): Promise<boolean> {
    return this.isSolicitationAllowed(amazonOrderId, 'REQUEST_FEEDBACK', marketplaceId);
  }
  
  /**
   * Get the reason why a solicitation is not allowed
   * @param amazonOrderId Amazon order ID
   * @param solicitationType Type of solicitation to check
   * @param marketplaceId Marketplace ID (optional, defaults to module's marketplace ID)
   * @returns Reason why the solicitation is not allowed, or null if it is allowed
   */
  public async getSolicitationDisallowedReason(
    amazonOrderId: string, 
    solicitationType: SolicitationType, 
    marketplaceId?: string
  ): Promise<string | null> {
    const mktId = marketplaceId || this.marketplaceId;
    
    if (!mktId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required to get solicitation disallowed reason',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.getSolicitationActions(amazonOrderId, {
        marketplaceId: mktId
      });

      // Find the specified solicitation action
      const action = response.data.payload.find(action => 
        action.solicitationType === solicitationType.toLowerCase()
      );
      
      if (!action) {
        return 'Solicitation type not found';
      }
      
      if (action.isAllowed) {
        return null; // Solicitation is allowed
      }
      
      return action.disallowedReason || 'Unknown reason';
    } catch (error) {
      if (this.options.detailedLogging) {
        console.error(`Error getting solicitation disallowed reason for order ${amazonOrderId}:`, error);
      }
      return 'Error retrieving solicitation status';
    }
  }
  
  /**
   * Get all available solicitation actions for an order
   * @param amazonOrderId Amazon order ID
   * @param marketplaceId Marketplace ID (optional, defaults to module's marketplace ID)
   * @returns All available solicitation actions
   */
  public async getAllSolicitationActions(
    amazonOrderId: string, 
    marketplaceId?: string
  ): Promise<SolicitationAction[]> {
    const mktId = marketplaceId || this.marketplaceId;
    
    if (!mktId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required to get all solicitation actions',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.getSolicitationActions(amazonOrderId, {
        marketplaceId: mktId
      });
      
      return response.data.payload;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getAllSolicitationActions`);
    }
  }
  
  /**
   * Get all allowed solicitation types for an order
   * @param amazonOrderId Amazon order ID
   * @param marketplaceId Marketplace ID (optional, defaults to module's marketplace ID)
   * @returns Array of allowed solicitation types
   */
  public async getAllowedSolicitationTypes(
    amazonOrderId: string, 
    marketplaceId?: string
  ): Promise<SolicitationType[]> {
    const mktId = marketplaceId || this.marketplaceId;
    
    if (!mktId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required to get allowed solicitation types',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const actions = await this.getAllSolicitationActions(amazonOrderId, mktId);
      
      return actions
        .filter(action => action.isAllowed)
        .map(action => action.solicitationType.toUpperCase() as SolicitationType);
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getAllowedSolicitationTypes`);
    }
  }
}