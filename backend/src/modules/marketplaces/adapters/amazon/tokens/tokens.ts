/**
 * Amazon Tokens API Module
 * 
 * Implements the Amazon SP-API Tokens API functionality.
 * This module allows sellers to manage restricted data tokens (RDT)
 * which are used to access restricted information like customer data.
 */

import { ApiModule } from '../../../core/api-module';
import { ApiRequestFunction, ApiResponse } from '../../../core/base-module.interface';
import AmazonErrorHandler, { AmazonErrorCode } from '../../../utils/amazon-error';

/**
 * HTTP method for restricted resources
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Restricted resource definition for token creation
 */
export interface RestrictedResource {
  /**
   * The path of the restricted operation
   */
  path: string;
  
  /**
   * The HTTP method of the restricted operation
   */
  method: HttpMethod;
  
  /**
   * The data elements the token should provide access to
   */
  dataElements?: string[];
}

/**
 * Response for creating a restricted data token
 */
export interface CreateRestrictedDataTokenResponse {
  /**
   * The restricted data token that can be used to access restricted operations
   */
  restrictedDataToken: string;
  
  /**
   * The duration in seconds until the token expires
   */
  expiresIn: number;
}

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
 * Token for buyer information result
 */
export interface BuyerInfoTokenResult {
  /**
   * The restricted data token
   */
  token: string;
  
  /**
   * The duration in seconds until the token expires
   */
  expiresIn: number;
}

/**
 * Token module options
 */
export interface TokensModuleOptions {
  /**
   * Default token expiration in seconds
   */
  defaultExpirationSeconds?: number;
  
  /**
   * Default data elements to access
   */
  defaultDataElements?: string[];
  
  /**
   * Auto-refresh tokens when they are close to expiration
   */
  autoRefreshTokens?: boolean;
}

/**
 * Implementation of the Amazon Tokens API
 */
export class TokensModule extends ApiModule<TokensModuleOptions> {
  /**
   * The unique identifier for this module
   */
  readonly moduleId: string = 'tokens';
  
  /**
   * The human-readable name of this module
   */
  readonly moduleName: string = 'Tokens';
  
  /**
   * The API version this module uses
   */
  readonly apiVersion: string;
  
  /**
   * The base URL path for API requests
   */
  readonly basePath: string;
  
  /**
   * The default token expiration in seconds (1 hour)
   */
  private readonly defaultExpiration: number;
  
  /**
   * Constructor
   * @param apiVersion API version
   * @param apiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param options Module-specific options
   */
  constructor(
    apiVersion: string,
    apiRequest: ApiRequestFunction,
    marketplaceId: string,
    options: TokensModuleOptions = {}
  ) {
    super(apiRequest, marketplaceId, options);
    this.apiVersion = apiVersion;
    this.basePath = `/tokens/${apiVersion}`;
    this.defaultExpiration = options.defaultExpirationSeconds || 3600;
  }
  
  /**
   * Create a Restricted Data Token (RDT) for accessing restricted operations
   * @param options Options for creating the token
   * @returns Created token information
   */
  public async createRestrictedDataToken(options: CreateRestrictedDataTokenOptions): Promise<CreateRestrictedDataTokenResponse> {
    try {
      if (!options.restrictedResources || options.restrictedResources.length === 0) {
        throw AmazonErrorHandler.createError(
          'At least one restricted resource is required to create a restricted data token',
          AmazonErrorCode.INVALID_INPUT
        );
      }
      
      // Validate that the resources have valid path and method
      options.restrictedResources.forEach(resource => {
        if (!resource.path) {
          throw AmazonErrorHandler.createError(
            'Path is required for each restricted resource',
            AmazonErrorCode.INVALID_INPUT
          );
        }
        
        if (!resource.method) {
          throw AmazonErrorHandler.createError(
            'Method is required for each restricted resource',
            AmazonErrorCode.INVALID_INPUT
          );
        }
      });
      
      // Validate expiration time
      if (options.expiresIn) {
        if (options.expiresIn < 60) {
          throw AmazonErrorHandler.createError(
            'Expiration time must be at least 60 seconds',
            AmazonErrorCode.INVALID_INPUT
          );
        }
        
        if (options.expiresIn > 86400) {
          throw AmazonErrorHandler.createError(
            'Expiration time must be no more than 86400 seconds (24 hours)',
            AmazonErrorCode.INVALID_INPUT
          );
        }
      }
      
      const response = await this.request<CreateRestrictedDataTokenResponse>(
        '/restrictedDataToken',
        'POST',
        {
          restrictedResources: options.restrictedResources,
          expiresIn: options.expiresIn || this.defaultExpiration
        }
      );
      
      return response.data;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.createRestrictedDataToken`);
    }
  }
  
  /**
   * Create a restricted data token for a specific API path
   * @param path API path to create token for
   * @param method HTTP method for the API path
   * @param expiresIn Token expiration in seconds (default: module default)
   * @returns Created token information
   */
  public async createTokenForPath(
    path: string, 
    method: HttpMethod, 
    expiresIn?: number
  ): Promise<CreateRestrictedDataTokenResponse> {
    if (!path) {
      throw AmazonErrorHandler.createError(
        'Path is required to create a token for a specific path',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!method) {
      throw AmazonErrorHandler.createError(
        'HTTP method is required to create a token for a specific path',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.createRestrictedDataToken({
      restrictedResources: [
        { path, method }
      ],
      expiresIn: expiresIn || this.defaultExpiration
    });
  }
  
  /**
   * Create a restricted data token for accessing customer PII data
   * @param orderIds List of order IDs to access PII data for
   * @param expiresIn Token expiration in seconds (default: module default)
   * @returns Created token information
   */
  public async createTokenForCustomerPII(
    orderIds: string[], 
    expiresIn?: number
  ): Promise<CreateRestrictedDataTokenResponse> {
    if (!orderIds || orderIds.length === 0) {
      throw AmazonErrorHandler.createError(
        'At least one order ID is required to create a token for customer PII',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const restrictedResources: RestrictedResource[] = orderIds.map(orderId => ({
      path: `/orders/v0/orders/${orderId}`,
      method: 'GET',
      dataElements: this.options.defaultDataElements || ['buyerInfo', 'shippingAddress']
    }));
    
    return this.createRestrictedDataToken({
      restrictedResources,
      expiresIn: expiresIn || this.defaultExpiration
    });
  }
  
  /**
   * Create a restricted data token for accessing order buyer information
   * @param orderId Order ID to access buyer information for
   * @param expiresIn Token expiration in seconds (default: module default)
   * @returns Created token and restricted information
   */
  public async getBuyerInfoWithToken(
    orderId: string, 
    expiresIn?: number
  ): Promise<BuyerInfoTokenResult> {
    if (!orderId) {
      throw AmazonErrorHandler.createError(
        'Order ID is required to get buyer information',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const effectiveExpiration = expiresIn || this.defaultExpiration;
    const response = await this.createTokenForCustomerPII([orderId], effectiveExpiration);
    
    return {
      token: response.restrictedDataToken,
      expiresIn: effectiveExpiration
    };
  }
  
  /**
   * Create a restricted data token for accessing the messaging API
   * @param orderIds List of order IDs to send messages for
   * @param expiresIn Token expiration in seconds (default: module default)
   * @returns Created token information for messaging
   */
  public async createTokenForMessaging(
    orderIds: string[], 
    expiresIn?: number
  ): Promise<CreateRestrictedDataTokenResponse> {
    if (!orderIds || orderIds.length === 0) {
      throw AmazonErrorHandler.createError(
        'At least one order ID is required to create a token for messaging',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const restrictedResources: RestrictedResource[] = [];
    
    // Add GET resources for getting messaging actions
    orderIds.forEach(orderId => {
      restrictedResources.push({
        path: `/messaging/v1/orders/${orderId}/messaging`,
        method: 'GET'
      });
    });
    
    // Add POST resources for sending messages
    orderIds.forEach(orderId => {
      restrictedResources.push({
        path: `/messaging/v1/orders/${orderId}/messages`,
        method: 'POST'
      });
    });
    
    return this.createRestrictedDataToken({
      restrictedResources,
      expiresIn: expiresIn || this.defaultExpiration
    });
  }
  
  /**
   * Create a restricted data token for accessing reports
   * @param reportDocumentId The ID of the report document to access
   * @param expiresIn Token expiration in seconds (default: module default)
   * @returns Created token information
   */
  public async createTokenForReport(
    reportDocumentId: string,
    expiresIn?: number
  ): Promise<CreateRestrictedDataTokenResponse> {
    if (!reportDocumentId) {
      throw AmazonErrorHandler.createError(
        'Report document ID is required to create a token for report access',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.createRestrictedDataToken({
      restrictedResources: [
        {
          path: `/reports/2021-06-30/documents/${reportDocumentId}`,
          method: 'GET'
        }
      ],
      expiresIn: expiresIn || this.defaultExpiration
    });
  }
  
  /**
   * Create a restricted data token for accessing feed documents
   * @param feedDocumentId The ID of the feed document to access
   * @param method HTTP method for the feed document (default: GET)
   * @param expiresIn Token expiration in seconds (default: module default)
   * @returns Created token information
   */
  public async createTokenForFeedDocument(
    feedDocumentId: string,
    method: HttpMethod = 'GET',
    expiresIn?: number
  ): Promise<CreateRestrictedDataTokenResponse> {
    if (!feedDocumentId) {
      throw AmazonErrorHandler.createError(
        'Feed document ID is required to create a token for feed access',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.createRestrictedDataToken({
      restrictedResources: [
        {
          path: `/feeds/2021-06-30/documents/${feedDocumentId}`,
          method
        }
      ],
      expiresIn: expiresIn || this.defaultExpiration
    });
  }
  
  /**
   * Create a restricted data token for accessing multiple resources
   * @param resources Array of restricted resources to access
   * @param expiresIn Token expiration in seconds (default: module default)
   * @returns Created token information
   */
  public async createTokenForMultipleResources(
    resources: RestrictedResource[],
    expiresIn?: number
  ): Promise<CreateRestrictedDataTokenResponse> {
    if (!resources || resources.length === 0) {
      throw AmazonErrorHandler.createError(
        'At least one resource is required to create a token for multiple resources',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.createRestrictedDataToken({
      restrictedResources: resources,
      expiresIn: expiresIn || this.defaultExpiration
    });
  }
}