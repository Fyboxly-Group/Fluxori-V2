/**
 * Amazon Solicitations API Module
 * 
 * Implements the Amazon SP-API Solicitations API functionality.
 * This module allows sellers to request reviews and feedback from buyers
 * within Amazon's terms of service and policies.
 */

import { BaseApiModule, ApiRequestOptions, ApiResponse } from '../core/api-module';
import { AmazonSPApi } from '../schemas/amazon.generated';
import { AmazonErrorUtil, AmazonErrorCode } from '../utils/amazon-error';

/**
 * Type aliases from schema
 */
export type SolicitationType = AmazonSPApi.Solicitations.SolicitationType;
export type SolicitationAction = AmazonSPApi.Solicitations.SolicitationAction;

/**
 * Eligibility options
 */
export interface GetSolicitationActionsOptions {
  /**
   * Marketplace ID where the order was placed
   */
  marketplaceId: string;
}

/**
 * Send solicitation options
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
 * Implementation of the Amazon Solicitations API
 */
export class SolicitationsModule extends BaseApiModule {
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
    super('solicitations', apiVersion, makeApiRequest, marketplaceId);
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
   * Get available solicitation actions for an order
   * @param amazonOrderId Amazon order ID
   * @param options Options for getting available actions
   * @returns Available solicitation actions
   */
  public async getSolicitationActions(
    amazonOrderId: string,
    options: GetSolicitationActionsOptions
  ): Promise<ApiResponse<AmazonSPApi.Solicitations.GetSolicitationActionsForOrderResponse>> {
    if (!amazonOrderId) {
      throw AmazonErrorUtil.createError(
        'Amazon Order ID is required to get solicitation actions',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.marketplaceId) {
      throw AmazonErrorUtil.createError(
        'Marketplace ID is required to get solicitation actions',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<AmazonSPApi.Solicitations.GetSolicitationActionsForOrderResponse>({
        method: 'GET',
        path: `/orders/${amazonOrderId}/solicitations`,
        params: {
          marketplaceIds: options.marketplaceId
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getSolicitationActions`);
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
  ): Promise<ApiResponse<AmazonSPApi.Solicitations.CreateProductReviewAndSellerFeedbackSolicitationResponse>> {
    if (!amazonOrderId) {
      throw AmazonErrorUtil.createError(
        'Amazon Order ID is required to send solicitation',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.marketplaceId) {
      throw AmazonErrorUtil.createError(
        'Marketplace ID is required to send solicitation',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.solicitationType) {
      throw AmazonErrorUtil.createError(
        'Solicitation type is required to send solicitation',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<AmazonSPApi.Solicitations.CreateProductReviewAndSellerFeedbackSolicitationResponse>({
        method: 'POST',
        path: `/orders/${amazonOrderId}/solicitations/${options.solicitationType.toLowerCase()}`,
        params: {
          marketplaceIds: options.marketplaceId
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.sendSolicitation`);
    }
  }

  /**
   * Request a product review for an order
   * @param amazonOrderId Amazon order ID
   * @param marketplaceId Marketplace ID
   * @returns Response indicating success
   */
  public async requestProductReview(
    amazonOrderId: string,
    marketplaceId?: string
  ): Promise<ApiResponse<AmazonSPApi.Solicitations.CreateProductReviewAndSellerFeedbackSolicitationResponse>> {
    const mktId = marketplaceId || this.marketplaceId;
    
    if (!mktId) {
      throw AmazonErrorUtil.createError(
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
   * @param marketplaceId Marketplace ID
   * @returns Response indicating success
   */
  public async requestSellerFeedback(
    amazonOrderId: string,
    marketplaceId?: string
  ): Promise<ApiResponse<AmazonSPApi.Solicitations.CreateProductReviewAndSellerFeedbackSolicitationResponse>> {
    const mktId = marketplaceId || this.marketplaceId;
    
    if (!mktId) {
      throw AmazonErrorUtil.createError(
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
   * @param marketplaceId Marketplace ID
   * @returns Whether the solicitation can be sent
   */
  public async isSolicitationAllowed(
    amazonOrderId: string,
    solicitationType: SolicitationType,
    marketplaceId?: string
  ): Promise<boolean> {
    const mktId = marketplaceId || this.marketplaceId;
    
    if (!mktId) {
      throw AmazonErrorUtil.createError(
        'Marketplace ID is required to check if solicitation is allowed',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.getSolicitationActions(amazonOrderId, {
        marketplaceId: mktId
      });

      // Check if the solicitation type is in the allowed actions
      return response.data.payload.some((action: any) => 
        action.solicitationType === solicitationType.toLowerCase() && 
        action.isAllowed
      );
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error(`Error checking if solicitation is allowed for order ${amazonOrderId}:`, error);
      return false;
    }
  }

  /**
   * Check if a product review solicitation is allowed
   * @param amazonOrderId Amazon order ID
   * @param marketplaceId Marketplace ID
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
   * @param marketplaceId Marketplace ID
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
   * @param marketplaceId Marketplace ID
   * @returns Reason why the solicitation is not allowed, or null if it is allowed
   */
  public async getSolicitationDisallowedReason(
    amazonOrderId: string,
    solicitationType: SolicitationType,
    marketplaceId?: string
  ): Promise<string | null> {
    const mktId = marketplaceId || this.marketplaceId;
    
    if (!mktId) {
      throw AmazonErrorUtil.createError(
        'Marketplace ID is required to get solicitation disallowed reason',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.getSolicitationActions(amazonOrderId, {
        marketplaceId: mktId
      });

      // Find the specified solicitation action
      const action = response.data.payload.find((action: any) => 
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
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error(`Error getting solicitation disallowed reason for order ${amazonOrderId}:`, error);
      return 'Error retrieving solicitation status';
    }
  }
}