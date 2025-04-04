/**
 * Amazon Authorization API Module
 * 
 * Implements the Amazon SP-API Authorization functionality.
 * This module allows managing authorization for Amazon Selling Partner API,
 * including checking authorization status and managing scopes.
 */

import { BaseApiModule } from '../core/api-module';
import { AmazonErrorUtil } from '../utils/amazon-error';
import { PaginatedResponse } from '../core/api-types';

/**
 * Scope authorization status
 */
export interface ScopeAuthorization {
  /**
   * The scope for which authorization status is returned
   */
  scope: string;

  /**
   * Whether the selling partner is authorized against the scope
   */
  sellingPartnerAuthorized: boolean;
}

/**
 * Response for getting authorization scopes
 */
export interface GetAuthorizationScopesResponse {
  /**
   * Array of scope authorization statuses
   */
  scopesAuthorizations: ScopeAuthorization[];
}

/**
 * Status of authorization code by selling partner
 */
export interface AuthorizationCode {
  /**
   * The authorization code used to authorize access to a selling partner's data
   */
  authorizationCode: string;

  /**
   * The developer ID from developing partner's LWA application
   */
  developerId: string;

  /**
   * The selling partner ID
   */
  sellingPartnerId: string;

  /**
   * Timestamp when the authorization code was created
   */
  createdTime: string;

  /**
   * Timestamp when the authorization code expires
   */
  expiresTime: string;
}

/**
 * Parameters for getting authorization codes
 */
export interface GetAuthorizationCodeParams {
  /**
   * The developer ID from your LWA application
   */
  developerId?: string;

  /**
   * The selling partner ID (MWS account ID)
   */
  sellingPartnerId?: string;

  /**
   * List of scopes to filter by
   */
  scopes?: string[];

  /**
   * The pagination token to retrieve the next page
   */
  nextToken?: string;

  /**
   * The maximum number of authorization codes to return per page
   */
  maxResults?: number;
}

/**
 * Parameters for requesting authorization scopes approval
 */
export interface RequestAuthorizationApprovalParams {
  /**
   * List of scopes to request approval for
   */
  scopes: string[];

  /**
   * The selling partner ID for which to request approval
   */
  sellingPartnerId: string;

  /**
   * The developer ID to associate with the approval
   */
  developerId: string;

  /**
   * Custom notes about the approval request
   */
  notes?: string;

  /**
   * Landing page URL after approval
   */
  redirectUri?: string;
}

/**
 * Response for requesting authorization scope approval
 */
export interface RequestAuthorizationApprovalResponse {
  /**
   * Status of the approval request
   */
  status: string;
  
  /**
   * URL that the seller needs to visit to approve the request
   */
  approvalUrl?: string;
  
  /**
   * Unique identifier for the approval request
   */
  requestId?: string;
}

/**
 * Scope configuration for LWA application
 */
export interface ScopeConfig {
  /**
   * The scope name
   */
  scope: string;

  /**
   * The seller-facing name of the scope
   */
  sellerFacingName: string;

  /**
   * The seller-facing description of the scope
   */
  sellerFacingDescription: string;

  /**
   * Whether the scope requires selling partner approval
   */
  requiresSellerApproval: boolean;
}

/**
 * Implementation of the Amazon Authorization API
 */
export class AuthorizationModule extends BaseApiModule {
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
    super('authorization', apiVersion, makeApiRequest, marketplaceId);
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
   * Get authorization status for scopes
   * @param scopes List of scopes to check authorization for
   * @returns Authorization status for each scope
   */
  public async getAuthorizationScopes(
    scopes: string[]
  ): Promise<GetAuthorizationScopesResponse> {
    try {
      if (!scopes || scopes.length === 0) {
        throw AmazonErrorUtil.createError(
          'At least one scope is required',
          'INVALID_INPUT'
        );
      }

      const response = await this.makeRequest<GetAuthorizationScopesResponse>({
        method: 'GET',
        path: '/scopes',
        params: {
          scopes: scopes.join(',')
        }
      });
      
      return response.data;
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getAuthorizationScopes`);
    }
  }
  
  /**
   * Get authorization codes for a selling partner
   * @param params Parameters to filter authorization codes
   * @returns List of authorization codes matching the criteria
   */
  public async getAuthorizationCodes(
    params: GetAuthorizationCodeParams = {}
  ): Promise<PaginatedResponse<AuthorizationCode>> {
    try {
      const queryParams: Record<string, any> = {};
      
      if (params.developerId) {
        queryParams.developerId = params.developerId;
      }
      
      if (params.sellingPartnerId) {
        queryParams.sellingPartnerId = params.sellingPartnerId;
      }
      
      if (params.scopes && params.scopes.length > 0) {
        queryParams.scopes = params.scopes.join(',');
      }
      
      if (params.nextToken) {
        queryParams.nextToken = params.nextToken;
      }
      
      if (params.maxResults) {
        queryParams.maxResults = params.maxResults;
      }

      const response = await this.makeRequest<{
        authorizationCodes: AuthorizationCode[];
        nextToken?: string;
      }>({
        method: 'GET',
        path: '/authorizationCodes',
        params: queryParams
      });
      
      return {
        items: response.data.authorizationCodes || [],
        nextToken: response.data.nextToken,
        pageNumber: 1,
        pageSize: (params.maxResults || 10).toString(),
        hasMore: !!response.data.nextToken
      };
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getAuthorizationCodes`);
    }
  }
  
  /**
   * Request approval for authorization scopes from a selling partner
   * @param params Parameters for the approval request
   * @returns Response with approval URL and status
   */
  public async requestAuthorizationApproval(
    params: RequestAuthorizationApprovalParams
  ): Promise<RequestAuthorizationApprovalResponse> {
    try {
      if (!params.scopes || params.scopes.length === 0) {
        throw AmazonErrorUtil.createError(
          'At least one scope is required',
          'INVALID_INPUT'
        );
      }
      
      if (!params.sellingPartnerId) {
        throw AmazonErrorUtil.createError(
          'Selling partner ID is required',
          'INVALID_INPUT'
        );
      }
      
      if (!params.developerId) {
        throw AmazonErrorUtil.createError(
          'Developer ID is required',
          'INVALID_INPUT'
        );
      }

      const data: Record<string, any> = {
        scopes: params.scopes,
        sellingPartnerId: params.sellingPartnerId,
        developerId: params.developerId
      };
      
      if (params.notes) {
        data.notes = params.notes;
      }
      
      if (params.redirectUri) {
        data.redirectUri = params.redirectUri;
      }

      const response = await this.makeRequest<RequestAuthorizationApprovalResponse>({
        method: 'POST',
        path: '/authorizations/approvals',
        data
      });
      
      return response.data;
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.requestAuthorizationApproval`);
    }
  }
  
  /**
   * Get configurations for available API scopes
   * @returns List of scope configurations
   */
  public async getScopeConfigurations(): Promise<ScopeConfig[]> {
    try {
      const response = await this.makeRequest<{
        scopeConfigurations: ScopeConfig[];
      }>({
        method: 'GET',
        path: '/scopeConfigurations'
      });
      
      return response.data.scopeConfigurations || [];
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getScopeConfigurations`);
    }
  }
  
  /**
   * Check if the application is authorized for specific scopes
   * @param scopes List of scopes to check
   * @returns Boolean indicating if all scopes are authorized
   */
  public async checkScopesAuthorization(
    scopes: string[]
  ): Promise<boolean> {
    try {
      const authResponse = await this.getAuthorizationScopes(scopes);
      
      // Only return true if all requested scopes are authorized
      return authResponse.scopesAuthorizations.every(
        scopeAuth => scopeAuth.sellingPartnerAuthorized
      );
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.checkScopesAuthorization`);
    }
  }
  
  /**
   * Get all authorization codes (handles pagination)
   * @param params Parameters to filter authorization codes
   * @param maxPages Maximum number of pages to retrieve (default: 10)
   * @returns All authorization codes matching the criteria
   */
  public async getAllAuthorizationCodes(
    params: GetAuthorizationCodeParams = {},
    maxPages: number = 10
  ): Promise<AuthorizationCode[]> {
    let currentPage = 1;
    let nextToken: string | undefined = undefined;
    const allCodes: AuthorizationCode[] = [];
    
    do {
      // Get a page of authorization codes
      const response = await this.getAuthorizationCodes({
        ...params,
        nextToken
      });
      
      // Add codes to our collection
      if (response.items && response.items.length > 0) {
        allCodes.push(...response.items);
      }
      
      // Get next token for pagination
      nextToken = response.nextToken;
      currentPage++;
      
      // Stop if we've reached the max pages or there are no more pages
    } while (nextToken && currentPage <= maxPages);
    
    return allCodes;
  }
}

export default AuthorizationModule;