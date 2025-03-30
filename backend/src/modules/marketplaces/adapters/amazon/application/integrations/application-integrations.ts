/**
 * Amazon Application Integrations API Module
 * 
 * Implements the Amazon SP-API Application Integrations API functionality.
 * This module enables management of application integrations and connections to Amazon services.
 */

import { BaseApiModule, ApiRequestOptions, ApiResponse } from '../../core/api-module';
import { AmazonErrorUtil, AmazonErrorCode } from '../../utils/amazon-error';

/**
 * The status of an integration
 */
export type IntegrationStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'DELETED';

/**
 * Connection type
 */
export type ConnectionType = 'OAUTH' | 'API_KEY' | 'SERVICE_ACCOUNT';

/**
 * Integration type
 */
export type IntegrationType = 'FULFILLMENT' | 'INVENTORY' | 'ORDERS' | 'REPORTS' | 'CATALOG';

/**
 * The region of an integration
 */
export type IntegrationRegion = 'NA' | 'EU' | 'FE';

/**
 * Connection data for an integration
 */
export interface ConnectionData {
  /**
   * Type of connection
   */
  type: ConnectionType;
  
  /**
   * OAuth client ID
   */
  oauthClientId?: string;
  
  /**
   * OAuth client secret
   */
  oauthClientSecret?: string;
  
  /**
   * API key
   */
  apiKey?: string;
  
  /**
   * Service account credentials
   */
  serviceAccountCredentials?: string;
}

/**
 * Integration configuration
 */
export interface IntegrationConfig {
  /**
   * Type of integration
   */
  type: IntegrationType;
  
  /**
   * Region of the integration
   */
  region: IntegrationRegion;
  
  /**
   * Name of the integration
   */
  name: string;
  
  /**
   * Description of the integration
   */
  description?: string;
  
  /**
   * Connection data for the integration
   */
  connectionData: ConnectionData;
  
  /**
   * Integration-specific settings
   */
  settings?: Record<string, string>;
}

/**
 * Integration detailed information
 */
export interface Integration {
  /**
   * ID of the integration
   */
  integrationId: string;
  
  /**
   * Type of the integration
   */
  type: IntegrationType;
  
  /**
   * Region of the integration
   */
  region: IntegrationRegion;
  
  /**
   * Name of the integration
   */
  name: string;
  
  /**
   * Description of the integration
   */
  description?: string;
  
  /**
   * Status of the integration
   */
  status: IntegrationStatus;
  
  /**
   * Integration-specific settings
   */
  settings?: Record<string, string>;
  
  /**
   * Connection type
   */
  connectionType: ConnectionType;
  
  /**
   * Creation timestamp
   */
  createdTime: string;
  
  /**
   * Last update timestamp
   */
  lastUpdatedTime: string;
}

/**
 * Response for creating an integration
 */
export interface CreateIntegrationResponse {
  /**
   * ID of the created integration
   */
  integrationId: string;
}

/**
 * Response for getting integrations
 */
export interface GetIntegrationsResponse {
  /**
   * List of integrations
   */
  integrations: Integration[];
  
  /**
   * Token for the next page of results
   */
  nextToken?: string;
}

/**
 * Options for getting integrations
 */
export interface GetIntegrationsOptions {
  /**
   * Type of integration to filter by
   */
  type?: IntegrationType;
  
  /**
   * Region to filter by
   */
  region?: IntegrationRegion;
  
  /**
   * Status to filter by
   */
  status?: IntegrationStatus;
  
  /**
   * Maximum number of results to return
   */
  maxResults?: number;
  
  /**
   * Token for pagination
   */
  nextToken?: string;
}

/**
 * Options for updating an integration
 */
export interface UpdateIntegrationOptions {
  /**
   * New name for the integration (optional)
   */
  name?: string;
  
  /**
   * New description for the integration (optional)
   */
  description?: string;
  
  /**
   * New status for the integration (optional)
   */
  status?: IntegrationStatus;
  
  /**
   * New connection data for the integration (optional)
   */
  connectionData?: ConnectionData;
  
  /**
   * New settings for the integration (optional)
   */
  settings?: Record<string, string>;
}

/**
 * Implementation of the Amazon Application Integrations API
 */
export class ApplicationIntegrationsModule extends BaseApiModule {
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
    super('applicationIntegrations', apiVersion, makeApiRequest, marketplaceId);
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
   * Create a new integration
   * @param config Integration configuration
   * @returns The created integration's ID
   */
  public async createIntegration(
    config: IntegrationConfig
  ): Promise<ApiResponse<CreateIntegrationResponse>> {
    if (!config.type) {
      throw AmazonErrorUtil.createError(
        'Integration type is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!config.region) {
      throw AmazonErrorUtil.createError(
        'Integration region is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!config.name) {
      throw AmazonErrorUtil.createError(
        'Integration name is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!config.connectionData || !config.connectionData.type) {
      throw AmazonErrorUtil.createError(
        'Connection data and type are required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<CreateIntegrationResponse>({
        method: 'POST',
        path: '/integrations',
        data: config
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.createIntegration`
      );
    }
  }
  
  /**
   * Get integrations with optional filtering
   * @param options Options for filtering integrations
   * @returns List of integrations
   */
  public async getIntegrations(
    options: GetIntegrationsOptions = {}
  ): Promise<ApiResponse<GetIntegrationsResponse>> {
    const params: Record<string, any> = {};
    
    if (options.type) {
      params.type = options.type;
    }
    
    if (options.region) {
      params.region = options.region;
    }
    
    if (options.status) {
      params.status = options.status;
    }
    
    if (options.maxResults) {
      params.maxResults = options.maxResults;
    }
    
    if (options.nextToken) {
      params.nextToken = options.nextToken;
    }
    
    try {
      return await this.makeRequest<GetIntegrationsResponse>({
        method: 'GET',
        path: '/integrations',
        params
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.getIntegrations`
      );
    }
  }
  
  /**
   * Get a specific integration by ID
   * @param integrationId ID of the integration to get
   * @returns The integration
   */
  public async getIntegration(
    integrationId: string
  ): Promise<ApiResponse<Integration>> {
    if (!integrationId) {
      throw AmazonErrorUtil.createError(
        'Integration ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<Integration>({
        method: 'GET',
        path: `/integrations/${integrationId}`
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.getIntegration`
      );
    }
  }
  
  /**
   * Update an integration
   * @param integrationId ID of the integration to update
   * @param options Update options
   * @returns The updated integration
   */
  public async updateIntegration(
    integrationId: string,
    options: UpdateIntegrationOptions
  ): Promise<ApiResponse<Integration>> {
    if (!integrationId) {
      throw AmazonErrorUtil.createError(
        'Integration ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<Integration>({
        method: 'PATCH',
        path: `/integrations/${integrationId}`,
        data: options
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.updateIntegration`
      );
    }
  }
  
  /**
   * Delete an integration
   * @param integrationId ID of the integration to delete
   * @returns Empty response
   */
  public async deleteIntegration(
    integrationId: string
  ): Promise<ApiResponse<void>> {
    if (!integrationId) {
      throw AmazonErrorUtil.createError(
        'Integration ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<void>({
        method: 'DELETE',
        path: `/integrations/${integrationId}`
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.deleteIntegration`
      );
    }
  }
  
  /**
   * Get all integrations (handles pagination)
   * @param options Options for filtering integrations
   * @param maxPages Maximum number of pages to retrieve (default: 10)
   * @returns All integrations
   */
  public async getAllIntegrations(
    options: GetIntegrationsOptions = {},
    maxPages: number = 10
  ): Promise<Integration[]> {
    const allIntegrations: Integration[] = [];
    let nextToken: string | undefined = options.nextToken;
    let currentPage = 1;
    
    do {
      // Update options with next token
      const pageOptions: GetIntegrationsOptions = {
        ...options,
        nextToken
      };
      
      // Get the current page of integrations
      const response = await this.getIntegrations(pageOptions);
      
      // Add integrations to our collection
      if (response.data.integrations && response.data.integrations.length > 0) {
        allIntegrations.push(...response.data.integrations);
      }
      
      // Update the next token
      nextToken = response.data.nextToken;
      currentPage++;
      
      // Stop if we've reached the maximum number of pages or there are no more pages
    } while (nextToken && currentPage <= maxPages);
    
    return allIntegrations;
  }
  
  /**
   * Create an OAuth integration
   * @param name Name of the integration
   * @param type Type of the integration
   * @param region Region of the integration
   * @param oauthClientId OAuth client ID
   * @param oauthClientSecret OAuth client secret
   * @param description Optional description of the integration
   * @param settings Optional settings for the integration
   * @returns The created integration's ID
   */
  public async createOAuthIntegration(
    name: string,
    type: IntegrationType,
    region: IntegrationRegion,
    oauthClientId: string,
    oauthClientSecret: string,
    description?: string,
    settings?: Record<string, string>
  ): Promise<ApiResponse<CreateIntegrationResponse>> {
    return this.createIntegration({
      name,
      type,
      region,
      description,
      connectionData: {
        type: 'OAUTH',
        oauthClientId,
        oauthClientSecret
      },
      settings
    });
  }
  
  /**
   * Create an API key integration
   * @param name Name of the integration
   * @param type Type of the integration
   * @param region Region of the integration
   * @param apiKey API key
   * @param description Optional description of the integration
   * @param settings Optional settings for the integration
   * @returns The created integration's ID
   */
  public async createApiKeyIntegration(
    name: string,
    type: IntegrationType,
    region: IntegrationRegion,
    apiKey: string,
    description?: string,
    settings?: Record<string, string>
  ): Promise<ApiResponse<CreateIntegrationResponse>> {
    return this.createIntegration({
      name,
      type,
      region,
      description,
      connectionData: {
        type: 'API_KEY',
        apiKey
      },
      settings
    });
  }
  
  /**
   * Create a service account integration
   * @param name Name of the integration
   * @param type Type of the integration
   * @param region Region of the integration
   * @param serviceAccountCredentials Service account credentials
   * @param description Optional description of the integration
   * @param settings Optional settings for the integration
   * @returns The created integration's ID
   */
  public async createServiceAccountIntegration(
    name: string,
    type: IntegrationType,
    region: IntegrationRegion,
    serviceAccountCredentials: string,
    description?: string,
    settings?: Record<string, string>
  ): Promise<ApiResponse<CreateIntegrationResponse>> {
    return this.createIntegration({
      name,
      type,
      region,
      description,
      connectionData: {
        type: 'SERVICE_ACCOUNT',
        serviceAccountCredentials
      },
      settings
    });
  }
  
  /**
   * Activate an integration
   * @param integrationId ID of the integration to activate
   * @returns The updated integration
   */
  public async activateIntegration(
    integrationId: string
  ): Promise<ApiResponse<Integration>> {
    return this.updateIntegration(integrationId, {
      status: 'ACTIVE'
    });
  }
  
  /**
   * Deactivate an integration
   * @param integrationId ID of the integration to deactivate
   * @returns The updated integration
   */
  public async deactivateIntegration(
    integrationId: string
  ): Promise<ApiResponse<Integration>> {
    return this.updateIntegration(integrationId, {
      status: 'INACTIVE'
    });
  }
  
  /**
   * Get active integrations of a specific type
   * @param type Type of integration to filter by
   * @returns List of active integrations of the specified type
   */
  public async getActiveIntegrationsByType(
    type: IntegrationType
  ): Promise<Integration[]> {
    return this.getAllIntegrations({
      type,
      status: 'ACTIVE'
    });
  }
}