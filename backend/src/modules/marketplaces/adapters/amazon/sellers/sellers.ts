/**
 * Amazon Sellers API Module
 * 
 * Implements the Amazon SP-API Sellers API functionality.
 * This module provides access to seller account information and capabilities.
 */

import { ApiModule } from '../core/api-module';
import { ApiRequestFunction, ApiResponse } from '../core/base-module.interface';
import AmazonErrorHandler, { AmazonErrorCode } from '../utils/amazon-error';
import { RequestOptions } from '../core/api-types';

/**
 * Options for SellersModule
 */
export interface SellersModuleOptions {
  /**
   * Automatically include participating marketplaces
   */
  includeParticipatingMarketplaces?: boolean;
  
  /**
   * Cache marketplace participations data
   */
  cacheParticipations?: boolean;
  
  /**
   * Cache duration in milliseconds
   */
  cacheDurationMs?: number;
}

/**
 * Seller participation type (marketplace status)
 */
export type ParticipationStatus = 'ACTIVE' | 'SUSPENDED';

/**
 * Seller account type
 */
export type SellerAccountType = 'SELLER' | 'VENDOR' | 'THIRD_PARTY' | 'RETAIL';

/**
 * Business address information
 */
export interface BusinessAddress {
  /**
   * The first line of the address
   */
  addressLine1?: string;
  
  /**
   * The second line of the address
   */
  addressLine2?: string;
  
  /**
   * The city
   */
  city?: string;
  
  /**
   * The state or region
   */
  stateOrRegion?: string;
  
  /**
   * The postal code
   */
  postalCode?: string;
  
  /**
   * The country code
   */
  countryCode?: string;
}

/**
 * Customer service contact information
 */
export interface CustomerServiceInfo {
  /**
   * The customer service email
   */
  email?: string;
  
  /**
   * The customer service phone number
   */
  phone?: string;
}

/**
 * Participation details for a specific marketplace
 */
export interface ParticipationDetails {
  /**
   * Whether the seller is suspended from selling in this marketplace
   */
  isSuspended: boolean;
  
  /**
   * Whether the seller has registered to sell in this marketplace
   */
  isRegistered: boolean;
  
  /**
   * When the seller's participation was last updated
   */
  lastUpdatedDate?: string;
}

/**
 * Participation type for a marketplace
 */
export interface MarketplaceParticipation {
  /**
   * The marketplace ID
   */
  marketplaceId: string;
  
  /**
   * The marketplace identifier code
   */
  marketplaceCode?: string;
  
  /**
   * The name of the marketplace
   */
  name?: string;
  
  /**
   * The default country code of the marketplace
   */
  countryCode?: string;
  
  /**
   * The default currency code of the marketplace
   */
  currencyCode?: string;
  
  /**
   * The default language code of the marketplace
   */
  languageCode?: string;
  
  /**
   * The domain name of the marketplace
   */
  domainName?: string;
  
  /**
   * The seller's participation status for the marketplace
   */
  status: ParticipationStatus;
  
  /**
   * Additional participation data specific to the marketplace
   */
  participation: ParticipationDetails;
}

/**
 * Get marketplace participations response
 */
export interface GetMarketplaceParticipationsResponse {
  /**
   * The marketplace participations
   */
  participations: MarketplaceParticipation[];
}

/**
 * Seller account information
 */
export interface SellerAccountInfo {
  /**
   * The seller's merchant ID
   */
  sellerId: string;
  
  /**
   * The seller's store name
   */
  storeName: string;
  
  /**
   * The seller account type
   */
  accountType: SellerAccountType;
  
  /**
   * The seller's business address
   */
  businessAddress?: BusinessAddress;
  
  /**
   * The date the seller account was created
   */
  accountCreatedDate?: string;
  
  /**
   * The seller's customer service details
   */
  customerService?: CustomerServiceInfo;
}

/**
 * Get seller account info response
 */
export interface GetSellerAccountInfoResponse {
  /**
   * The seller account information
   */
  accountInfo: SellerAccountInfo;
}

/**
 * Feature access query response
 */
export interface FeatureAccessResponse {
  /**
   * Whether the seller has access to the feature
   */
  hasAccess: boolean;
  
  /**
   * Details about the feature access
   */
  details?: {
    /**
     * The feature name
     */
    featureName: string;
    
    /**
     * The access level
     */
    accessLevel?: string;
    
    /**
     * When the feature access expires
     */
    expiresAt?: string;
  };
}

/**
 * Implementation of the Amazon Sellers API module
 */
export class SellersModule extends ApiModule<SellersModuleOptions> {
  /**
   * The unique identifier for this module
   */
  readonly moduleId: string = 'sellers';
  
  /**
   * The human-readable name of this module
   */
  readonly moduleName: string = 'Sellers';
  
  /**
   * The API version this module uses
   */
  readonly apiVersion: string;
  
  /**
   * The base URL path for API requests
   */
  readonly basePath: string;
  
  /**
   * Cached marketplace participations data
   */
  private cachedParticipations?: GetMarketplaceParticipationsResponse;
  
  /**
   * Timestamp when the cache was last updated
   */
  private cacheTimestamp: number = 0;
  
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
    options: SellersModuleOptions = {}
  ) {
    super(apiRequest, marketplaceId, options);
    this.apiVersion = apiVersion;
    this.basePath = `/sellers/${apiVersion}`;
  }
  
  /**
   * Gets marketplace participation data for the seller
   * @param useCache Whether to use cached data if available
   * @returns The marketplace participations
   */
  public async getMarketplaceParticipations(useCache: boolean = true): Promise<ApiResponse<GetMarketplaceParticipationsResponse>> {
    try {
      // Check if we should use cached data
      if (useCache && 
          this.options.cacheParticipations && 
          this.cachedParticipations && 
          (Date.now() - this.cacheTimestamp) < (this.options.cacheDurationMs || 3600000)) {
        return {
          data: this.cachedParticipations,
          status: 200,
          headers: {}
        };
      }
      
      const response = await this.request<GetMarketplaceParticipationsResponse>(
        'marketplaceParticipations',
        'GET'
      );
      
      // Cache the response if configured
      if (this.options.cacheParticipations) {
        this.cachedParticipations = response.data;
        this.cacheTimestamp = Date.now();
      }
      
      return response;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getMarketplaceParticipations`);
    }
  }
  
  /**
   * Gets detailed seller account information
   * @returns The seller account information
   */
  public async getSellerAccountInfo(): Promise<ApiResponse<GetSellerAccountInfoResponse>> {
    try {
      return await this.request<GetSellerAccountInfoResponse>(
        'accountInfo',
        'GET'
      );
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getSellerAccountInfo`);
    }
  }
  
  /**
   * Checks if the seller is active in a specific marketplace
   * @param targetMarketplaceId The marketplace ID to check
   * @returns True if the seller is active in the marketplace
   */
  public async isActiveInMarketplace(targetMarketplaceId: string): Promise<boolean> {
    if (!targetMarketplaceId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.getMarketplaceParticipations();
      const participation = response.data.participations.find(
        p => p.marketplaceId === targetMarketplaceId
      );
      
      if (!participation) {
        return false;
      }
      
      return participation.status === 'ACTIVE' && !participation.participation.isSuspended;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.isActiveInMarketplace`);
    }
  }
  
  /**
   * Gets all active marketplaces for the seller
   * @returns The active marketplace participations
   */
  public async getActiveMarketplaces(): Promise<MarketplaceParticipation[]> {
    try {
      const response = await this.getMarketplaceParticipations();
      return response.data.participations.filter(p => 
        p.status === 'ACTIVE' && !p.participation.isSuspended
      );
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getActiveMarketplaces`);
    }
  }
  
  /**
   * Gets a specific marketplace participation by ID
   * @param targetMarketplaceId The marketplace ID
   * @returns The marketplace participation, or undefined if not found
   */
  public async getMarketplaceById(targetMarketplaceId: string): Promise<MarketplaceParticipation | undefined> {
    if (!targetMarketplaceId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.getMarketplaceParticipations();
      return response.data.participations.find(p => p.marketplaceId === targetMarketplaceId);
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getMarketplaceById`);
    }
  }
  
  /**
   * Checks if the seller account has access to a specific feature
   * @param featureName The feature name to check
   * @returns True if the seller has access to the feature
   */
  public async hasFeatureAccess(featureName: string): Promise<boolean> {
    if (!featureName) {
      throw AmazonErrorHandler.createError(
        'Feature name is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.request<FeatureAccessResponse>(
        'featureAccess',
        'GET',
        undefined,
        { 
          requestParams: { featureName }
        }
      );
      
      return response.data.hasAccess;
    } catch (error) {
      // If the API is not available or returns an error, assume no access
      if (error.code === AmazonErrorCode.RESOURCE_NOT_FOUND) {
        return false;
      }
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.hasFeatureAccess`);
    }
  }
  
  /**
   * Gets marketplaces by country code
   * @param countryCode The ISO country code to search for
   * @returns Marketplaces matching the country code
   */
  public async getMarketplacesByCountry(countryCode: string): Promise<MarketplaceParticipation[]> {
    if (!countryCode) {
      throw AmazonErrorHandler.createError(
        'Country code is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.getMarketplaceParticipations();
      return response.data.participations.filter(
        p => p.countryCode?.toUpperCase() === countryCode.toUpperCase()
      );
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getMarketplacesByCountry`);
    }
  }
  
  /**
   * Gets seller ID information 
   * @returns The seller's ID
   */
  public async getSellerId(): Promise<string> {
    try {
      const response = await this.getSellerAccountInfo();
      return response.data.accountInfo.sellerId;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getSellerId`);
    }
  }
  
  /**
   * Gets the seller's store name
   * @returns The seller's store name
   */
  public async getStoreName(): Promise<string> {
    try {
      const response = await this.getSellerAccountInfo();
      return response.data.accountInfo.storeName;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getStoreName`);
    }
  }
  
  /**
   * Clears the participations cache
   */
  public clearCache(): void {
    this.cachedParticipations = undefined;
    this.cacheTimestamp = 0;
  }
  
  /**
   * Gets all registered marketplaces (active or suspended)
   * @returns All marketplaces with registered status
   */
  public async getRegisteredMarketplaces(): Promise<MarketplaceParticipation[]> {
    try {
      const response = await this.getMarketplaceParticipations();
      return response.data.participations.filter(p => 
        p.participation.isRegistered === true
      );
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getRegisteredMarketplaces`);
    }
  }
}