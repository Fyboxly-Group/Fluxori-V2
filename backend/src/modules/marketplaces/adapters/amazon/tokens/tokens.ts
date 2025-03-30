/**
 * Amazon Tokens API Module
 * 
 * Implements the Amazon SP-API Tokens API functionality.
 * This module allows sellers to manage restricted data tokens (RDT)
 * which are used to access restricted information like customer data.
 */

import { BaseApiModule, ApiRequestOptions, ApiResponse } from '../core/api-module';
import { AmazonSPApi } from '../schemas/amazon.generated';
import { AmazonErrorUtil, AmazonErrorCode } from '../utils/amazon-error';

/**
 * Type aliases from the schema
 */
export type RestrictedResource = AmazonSPApi.Tokens.RestrictedResource;
export type HttpMethod = AmazonSPApi.Tokens.HttpMethod;
export type CreateRestrictedDataTokenResponse = AmazonSPApi.Tokens.CreateRestrictedDataTokenResponse;

/**
 * Create restricted data token options
 */
export interface CreateRestrictedDataTokenOptions {
  /**
   * The restricted operations list (paths and methods) for which 
   * the restricted data token is generated
   */
  restrictedResources: RestrictedResource[];
  
  /**
   * The expiration duration in seconds for the restricted data token
   * Default: 3600 seconds (1 hour)
   * Max: 86400 seconds (24 hours)
   * Min: 60 seconds (1 minute)
   */
  expiresIn?: number;
}

/**
 * Implementation of the Amazon Tokens API
 */
export class TokensModule extends BaseApiModule {
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
    super('tokens', apiVersion, makeApiRequest, marketplaceId);
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
   * Create a Restricted Data Token (RDT) for accessing restricted operations
   * @param options Options for creating the token
   * @returns Created token information
   */
  public async createRestrictedDataToken(options: CreateRestrictedDataTokenOptions): Promise<ApiResponse<CreateRestrictedDataTokenResponse>> {
    if (!options.restrictedResources || options.restrictedResources.length === 0) {
      throw AmazonErrorUtil.createError(
        'At least one restricted resource is required to create a restricted data token',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Validate that the resources have valid path and method
    options.restrictedResources.forEach((resource: any) => {
      if (!resource.path) {
        throw AmazonErrorUtil.createError(
          'Path is required for each restricted resource',
          AmazonErrorCode.INVALID_INPUT
        );
      }
      
      if (!resource.method) {
        throw AmazonErrorUtil.createError(
          'Method is required for each restricted resource',
          AmazonErrorCode.INVALID_INPUT
        );
      }
    });

    // Validate expiration time
    if (options.expiresIn) {
      if (options.expiresIn < 60) {
        throw AmazonErrorUtil.createError(
          'Expiration time must be at least 60 seconds',
          AmazonErrorCode.INVALID_INPUT
        );
      }
      
      if (options.expiresIn > 86400) {
        throw AmazonErrorUtil.createError(
          'Expiration time must be no more than 86400 seconds (24 hours)',
          AmazonErrorCode.INVALID_INPUT
        );
      }
    }

    try {
      return await this.makeRequest<CreateRestrictedDataTokenResponse>({
        method: 'POST',
        path: '/restrictedDataToken',
        data: {
          restrictedResources: options.restrictedResources,
          expiresIn: options.expiresIn || 3600 // Default to 1 hour
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.createRestrictedDataToken`);
    }
  }

  /**
   * Create a restricted data token for a specific API path
   * @param path API path to create token for
   * @param method HTTP method for the API path
   * @param expiresIn Token expiration in seconds (default: 3600)
   * @returns Created token information
   */
  public async createTokenForPath(
    path: string,
    method: HttpMethod,
    expiresIn: number = 3600
  ): Promise<ApiResponse<CreateRestrictedDataTokenResponse>> {
    return this.createRestrictedDataToken({
      restrictedResources: [
        { path, method }
      ],
      expiresIn
    });
  }
  
  /**
   * Create a restricted data token for accessing customer PII data
   * @param orderIds List of order IDs to access PII data for
   * @param expiresIn Token expiration in seconds (default: 3600)
   * @returns Created token information
   */
  public async createTokenForCustomerPII(
    orderIds: string[],
    expiresIn: number = 3600
  ): Promise<ApiResponse<CreateRestrictedDataTokenResponse>> {
    if (!orderIds || orderIds.length === 0) {
      throw AmazonErrorUtil.createError(
        'At least one order ID is required to create a token for customer PII',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const restrictedResources: RestrictedResource[] = orderIds.map((orderId: any) => ({
      path: `/orders/v0/orders/${orderId}`,
      method: 'GET',
      dataElements: ['buyerInfo', 'shippingAddress']
    }));
    
    return this.createRestrictedDataToken({
      restrictedResources,
      expiresIn
    });
  }
  
  /**
   * Create a restricted data token for accessing order buyer information
   * @param orderId Order ID to access buyer information for
   * @param expiresIn Token expiration in seconds (default: 3600)
   * @returns Created token and restricted information
   */
  public async getBuyerInfoWithToken(
    orderId: string,
    expiresIn: number = 3600
  ): Promise<{
    token: string;
    expiresIn: number;
  }> {
    if (!orderId) {
      throw AmazonErrorUtil.createError(
        'Order ID is required to get buyer information',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const response = await this.createTokenForCustomerPII([orderId], expiresIn);
    
    return {
      token: response.data.restrictedDataToken,
      expiresIn: expiresIn
    };
  }
  
  /**
   * Create a restricted data token for accessing the messaging API
   * @param orderIds List of order IDs to send messages for
   * @param expiresIn Token expiration in seconds (default: 3600)
   * @returns Created token information for messaging
   */
  public async createTokenForMessaging(
    orderIds: string[],
    expiresIn: number = 3600
  ): Promise<ApiResponse<CreateRestrictedDataTokenResponse>> {
    if (!orderIds || orderIds.length === 0) {
      throw AmazonErrorUtil.createError(
        'At least one order ID is required to create a token for messaging',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const restrictedResources: RestrictedResource[] = [];
    
    // Add GET resources for getting messaging actions
    orderIds.forEach((orderId: any) => {
      restrictedResources.push({
        path: `/messaging/v1/orders/${orderId}/messaging`,
        method: 'GET'
      });
    });

    // Add POST resources for sending messages
    orderIds.forEach((orderId: any) => {
      restrictedResources.push({
        path: `/messaging/v1/orders/${orderId}/messages`,
        method: 'POST'
      });
    });

    return this.createRestrictedDataToken({
      restrictedResources,
      expiresIn
    });
  }
}