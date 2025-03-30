/**
 * Amazon Authorization API Module
 * 
 * Implements the Amazon SP-API Authorization API functionality.
 * This module handles OAuth 2.0 authorization flows, token management,
 * and role-based permissions for secure application access.
 */

import { BaseApiModule, ApiRequestOptions, ApiResponse } from '../core/api-module';
import { AmazonErrorUtil, AmazonErrorCode } from '../utils/amazon-error';

/**
 * Grant type for authorization
 */
export type GrantType = 'authorization_code' | 'refresh_token';

/**
 * Authentication scope
 */
export type AuthScope = 
  | 'sellingpartnerapi::notifications'
  | 'sellingpartnerapi::migration'
  | 'sellingpartnerapi::sales'
  | 'sellingpartnerapi::feeds'
  | 'sellingpartnerapi::orders' 
  | 'sellingpartnerapi::orders:read'
  | 'sellingpartnerapi::orders:write'
  | 'sellingpartnerapi::finances'
  | 'sellingpartnerapi::listings' 
  | 'sellingpartnerapi::listings:read' 
  | 'sellingpartnerapi::listings:write'
  | 'sellingpartnerapi::catalog'
  | 'sellingpartnerapi::messaging'
  | 'sellingpartnerapi::reports'
  | 'sellingpartnerapi::fulfillment-outbound'
  | 'sellingpartnerapi::fulfillment-inbound'
  | 'sellingpartnerapi::shipping'
  | 'sellingpartnerapi::tokens'
  | 'sellingpartnerapi::tokens:read'
  | 'sellingpartnerapi::tokens:write';

/**
 * Token data
 */
export interface TokenData {
  /**
   * Access token used for API authorization
   */
  access_token: string;
  
  /**
   * Token type (typically "bearer")
   */
  token_type: string;
  
  /**
   * Expiration time in seconds
   */
  expires_in: number;
  
  /**
   * Refresh token used to get new access tokens
   */
  refresh_token: string;
}

/**
 * Authorization code exchange request
 */
export interface AuthorizationCodeExchangeRequest {
  /**
   * Authorization code received from OAuth redirect
   */
  authorizationCode: string;
  
  /**
   * Client ID
   */
  clientId: string;
  
  /**
   * Client secret
   */
  clientSecret: string;
  
  /**
   * Redirect URI matching the one used in authorization request
   */
  redirectUri: string;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  /**
   * Refresh token
   */
  refreshToken: string;
  
  /**
   * Client ID
   */
  clientId: string;
  
  /**
   * Client secret
   */
  clientSecret: string;
}

/**
 * User permissions data
 */
export interface UserPermissions {
  /**
   * List of scopes the user has authorized
   */
  authorizedScopes: AuthScope[];
  
  /**
   * The selling partner ID
   */
  sellerId: string;
  
  /**
   * List of marketplace IDs the user has access to
   */
  marketplaceIds: string[];
  
  /**
   * The role of the user
   */
  role?: 'ADMIN' | 'VIEWER' | 'EDITOR';
  
  /**
   * Indicates whether the user has authorized your application with delegated access
   */
  hasDelegatedAccess?: boolean;
}

/**
 * Generate authorization URL options
 */
export interface GenerateAuthorizationUrlOptions {
  /**
   * OAuth client ID
   */
  clientId: string;
  
  /**
   * OAuth redirect URI
   */
  redirectUri: string;
  
  /**
   * OAuth state parameter for security validation
   */
  state?: string;
  
  /**
   * List of OAuth scopes to request
   */
  scopes?: AuthScope[];
  
  /**
   * Whether to enable delegated seller access
   */
  enableDelegatedAccess?: boolean;
  
  /**
   * Amazon environment (sandbox or production)
   */
  environment?: 'SANDBOX' | 'PRODUCTION';
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
   * @returns Promise<any> that resolves when initialization is complete
   */
  protected async initializeModule(config?: any): Promise<void> {
    // No specific initialization required for this module
    return Promise<any>.resolve();
  }
  
  /**
   * Exchange authorization code for tokens
   * @param request Authorization code exchange request
   * @returns Token data
   */
  public async exchangeAuthorizationCode(
    request: AuthorizationCodeExchangeRequest
  ): Promise<ApiResponse<TokenData>> {
    if (!request.authorizationCode) {
      throw AmazonErrorUtil.createError(
        'Authorization code is required to exchange for tokens',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!request.clientId) {
      throw AmazonErrorUtil.createError(
        'Client ID is required to exchange authorization code',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!request.clientSecret) {
      throw AmazonErrorUtil.createError(
        'Client secret is required to exchange authorization code',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!request.redirectUri) {
      throw AmazonErrorUtil.createError(
        'Redirect URI is required to exchange authorization code',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<TokenData>({
        method: 'POST',
        path: '/token',
        directUrl: true,
        data: {
          grant_type: 'authorization_code',
          code: request.authorizationCode,
          client_id: request.clientId,
          client_secret: request.clientSecret,
          redirect_uri: request.redirectUri
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.exchangeAuthorizationCode`
      );
    }
  }
  
  /**
   * Refresh access token using refresh token
   * @param request Refresh token request
   * @returns New token data
   */
  public async refreshAccessToken(
    request: RefreshTokenRequest
  ): Promise<ApiResponse<TokenData>> {
    if (!request.refreshToken) {
      throw AmazonErrorUtil.createError(
        'Refresh token is required to refresh access token',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!request.clientId) {
      throw AmazonErrorUtil.createError(
        'Client ID is required to refresh access token',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!request.clientSecret) {
      throw AmazonErrorUtil.createError(
        'Client secret is required to refresh access token',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<TokenData>({
        method: 'POST',
        path: '/token',
        directUrl: true,
        data: {
          grant_type: 'refresh_token',
          refresh_token: request.refreshToken,
          client_id: request.clientId,
          client_secret: request.clientSecret
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.refreshAccessToken`
      );
    }
  }
  
  /**
   * Get user permissions from access token
   * @param accessToken Access token
   * @returns User permissions
   */
  public async getUserPermissions(
    accessToken: string
  ): Promise<ApiResponse<UserPermissions>> {
    if (!accessToken) {
      throw AmazonErrorUtil.createError(
        'Access token is required to get user permissions',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<UserPermissions>({
        method: 'GET',
        path: '/user/permissions',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.getUserPermissions`
      );
    }
  }
  
  /**
   * Revoke a token
   * @param token The token to revoke
   * @param tokenType The type of token being revoked ('access_token' or 'refresh_token')
   * @param clientId The client ID
   * @param clientSecret The client secret
   * @returns Void response indicating success
   */
  public async revokeToken(
    token: string,
    tokenType: 'access_token' | 'refresh_token',
    clientId: string,
    clientSecret: string
  ): Promise<ApiResponse<void>> {
    if (!token) {
      throw AmazonErrorUtil.createError(
        'Token is required to revoke',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!tokenType) {
      throw AmazonErrorUtil.createError(
        'Token type is required to revoke token',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!clientId) {
      throw AmazonErrorUtil.createError(
        'Client ID is required to revoke token',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!clientSecret) {
      throw AmazonErrorUtil.createError(
        'Client secret is required to revoke token',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<void>({
        method: 'POST',
        path: '/revoke',
        directUrl: true,
        data: {
          token,
          token_type_hint: tokenType,
          client_id: clientId,
          client_secret: clientSecret
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.revokeToken`
      );
    }
  }
  
  /**
   * Check if an access token is valid
   * @param accessToken Access token to check
   * @returns True if token is valid, false otherwise
   */
  public async isAccessTokenValid(
    accessToken: string
  ): Promise<boolean> {
    try {
      await this.getUserPermissions(accessToken);
      return true;
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      return false;
    }
  }
  
  /**
   * Generate authorization URL for OAuth flow
   * @param options Options for generating the authorization URL
   * @returns Authorization URL
   */
  public generateAuthorizationUrl(
    options: GenerateAuthorizationUrlOptions
  ): string {
    if (!options.clientId) {
      throw AmazonErrorUtil.createError(
        'Client ID is required to generate authorization URL',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.redirectUri) {
      throw AmazonErrorUtil.createError(
        'Redirect URI is required to generate authorization URL',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Default scopes if not provided
    const scopes = options.scopes || [
      'sellingpartnerapi::notifications',
      'sellingpartnerapi::orders',
      'sellingpartnerapi::finances',
      'sellingpartnerapi::listings',
      'sellingpartnerapi::catalog',
      'sellingpartnerapi::reports'
    ];
    
    // Determine host based on environment
    const host = options.environment === 'SANDBOX' 
      ? 'https://sellercentral-sandbox.amazon.com' 
      : 'https://sellercentral.amazon.com';
    
    // Build URL with query parameters
    const url = new URL(`${host}/apps/authorize/consent`);
    url.searchParams.append('application_id', options.clientId);
    url.searchParams.append('redirect_uri', options.redirectUri);
    url.searchParams.append('version', '2.0');
    
    // Add state if provided
    if (options.state) {
      url.searchParams.append('state', options.state);
    }
    
    // Add scopes
    if (scopes.length > 0) {
      url.searchParams.append('scope', scopes.join(' '));
    }
    
    // Enable delegated access if requested
    if (options.enableDelegatedAccess) {
      url.searchParams.append('delegated_access', 'true');
    }
    
    return url.toString();
  }
  
  /**
   * Get audit log for a user's API access
   * @param accessToken Access token for the user
   * @param startDate Start date for the audit log (ISO8601 format)
   * @param endDate End date for the audit log (ISO8601 format)
   * @returns Audit log entries
   */
  public async getAuditLog(
    accessToken: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<{
    entries: Array<{
      timestamp: string;
      userId: string;
      action: string;
      resource: string;
      ipAddress: string;
      userAgent: string;
    }>;
  }>> {
    if (!accessToken) {
      throw AmazonErrorUtil.createError(
        'Access token is required to get audit log',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<any>({
        method: 'GET',
        path: '/audit-log',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          startDate,
          endDate
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.getAuditLog`
      );
    }
  }
  
  /**
   * Manage token lifecycle, including refreshing when needed
   * @param refreshToken Refresh token to use
   * @param clientId Client ID
   * @param clientSecret Client secret
   * @param currentAccessToken Current access token (optional)
   * @param tokenExpiry Token expiry timestamp (optional)
   * @returns New token data
   */
  public async manageTokenLifecycle(
    refreshToken: string,
    clientId: string,
    clientSecret: string,
    currentAccessToken?: string,
    tokenExpiry?: number
  ): Promise<TokenData> {
    // Check if current token is still valid
    if (currentAccessToken && tokenExpiry) {
      const currentTime = Math.floor(Date.now() / 1000);
      const bufferTime = 300; // 5 minutes buffer
      
      // Token is still valid and not about to expire
      if (tokenExpiry > currentTime + bufferTime) {
        return {
          access_token: currentAccessToken,
          refresh_token: refreshToken,
          token_type: 'bearer',
          expires_in: tokenExpiry - currentTime
        };
      }
    }
    
    // Token needs to be refreshed
    const response = await this.refreshAccessToken({
      refreshToken,
      clientId,
      clientSecret
    });
    
    return response.data;
  }
  
  /**
   * Create a delegated seller access authorization
   * @param accessToken Primary seller's access token
   * @param delegatedSellerId The seller ID to delegate access to
   * @param scopes List of scopes to delegate
   * @returns Delegated access token data
   */
  public async createDelegatedAccess(
    accessToken: string,
    delegatedSellerId: string,
    scopes: AuthScope[]
  ): Promise<ApiResponse<{
    delegationId: string;
    delegatedScopes: AuthScope[];
    validUntil: string;
  }>> {
    if (!accessToken) {
      throw AmazonErrorUtil.createError(
        'Access token is required to create delegated access',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!delegatedSellerId) {
      throw AmazonErrorUtil.createError(
        'Delegated seller ID is required to create delegated access',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!scopes || scopes.length === 0) {
      throw AmazonErrorUtil.createError(
        'At least one scope is required to create delegated access',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<any>({
        method: 'POST',
        path: '/delegations',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        data: {
          delegatedSellerId,
          scopes
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.createDelegatedAccess`
      );
    }
  }
}