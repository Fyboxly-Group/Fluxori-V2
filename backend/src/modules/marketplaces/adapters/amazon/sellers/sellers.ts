/**
 * Amazon Sellers API Module
 * 
 * Implements the Amazon SP-API Sellers API functionality.
 * This module provides information about seller accounts and marketplaces.
 */

import { BaseApiModule, ApiRequestOptions, ApiResponse } from '../core/api-module';
import { AmazonSPApi } from '../schemas/amazon.generated';
import { AmazonErrorUtil, AmazonErrorCode } from '../utils/amazon-error';

/**
 * Marketplace details
 */
export type MarketplaceDetails = AmazonSPApi.Sellers.MarketplaceDetails;

/**
 * Marketplace participation
 */
export type MarketplaceParticipation = AmazonSPApi.Sellers.MarketplaceParticipation;

/**
 * Implementation of the Amazon Sellers API
 */
export class SellersModule extends BaseApiModule {
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
    super('sellers', apiVersion, makeApiRequest, marketplaceId);
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
   * Get marketplace participations for the seller
   * @returns List of marketplace participations
   */
  public async getMarketplaceParticipations(): Promise<ApiResponse<AmazonSPApi.Sellers.GetMarketplaceParticipationsResponse>> {
    try {
      return await this.makeRequest<AmazonSPApi.Sellers.GetMarketplaceParticipationsResponse>({
        method: 'GET',
        path: '/marketplaceParticipations'
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getMarketplaceParticipations`);
    }
  }

  /**
   * Get the seller account type
   * @returns Seller account type
   */
  public async getSellerAccountType(): Promise<string> {
    try {
      const response = await this.makeRequest<AmazonSPApi.Sellers.GetSellerAccountInfoResponse>({
        method: 'GET',
        path: '/account'
      });
      return response.data.payload?.accountType || 'Unknown';
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error('Failed to get seller account type:', error);
      return 'Unknown';
    }
  }

  /**
   * Check if the seller is participating in a specific marketplace
   * @param marketplaceId Marketplace ID to check
   * @returns Whether the seller is participating in the marketplace
   */
  public async isParticipatingInMarketplace(marketplaceId: string): Promise<boolean> {
    if (!marketplaceId) {
      throw AmazonErrorUtil.createError(
        'Marketplace ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const participations = await this.getMarketplaceParticipations();
      
      // Find the marketplace in the participations
      const participation = participations.data.payload.find((p: any) => p.marketplace.id === marketplaceId);
      
      // Return whether the seller is participating
      return participation?.participation.isParticipating || false;
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error('Failed to check marketplace participation:', error);
      return false;
    }
  }

  /**
   * Get all marketplaces where the seller is participating
   * @returns List of participating marketplaces
   */
  public async getParticipatingMarketplaces(): Promise<MarketplaceDetails[]> {
    try {
      const participations = await this.getMarketplaceParticipations();
      
      // Filter for participating marketplaces
      return participations.data.payload
        .filter((p: any) => p.participation.isParticipating)
        .map((p: any) => p.marketplace);
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error('Failed to get participating marketplaces:', error);
      return [];
    }
  }

  /**
   * Get marketplace details by ID
   * @param marketplaceId Marketplace ID
   * @returns Marketplace details or null if not found
   */
  public async getMarketplaceById(marketplaceId: string): Promise<MarketplaceDetails | null> {
    if (!marketplaceId) {
      throw AmazonErrorUtil.createError(
        'Marketplace ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const participations = await this.getMarketplaceParticipations();
      
      // Find the marketplace in the participations
      const participation = participations.data.payload.find((p: any) => p.marketplace.id === marketplaceId);
      
      return participation?.marketplace || null;
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error('Failed to get marketplace details:', error);
      return null;
    }
  }

  /**
   * Get marketplace details by country code
   * @param countryCode Country code (e.g., 'US', 'UK', 'CA')
   * @returns Marketplace details or null if not found
   */
  public async getMarketplaceByCountryCode(countryCode: string): Promise<MarketplaceDetails | null> {
    if (!countryCode) {
      throw AmazonErrorUtil.createError(
        'Country code is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const participations = await this.getMarketplaceParticipations();
      
      // Find the marketplace in the participations
      const participation = participations.data.payload.find((p: any) => p.marketplace.countryCode.toUpperCase() === countryCode.toUpperCase()
      );
      
      return participation?.marketplace || null;
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error('Failed to get marketplace by country code:', error);
      return null;
    }
  }

  /**
   * Get all available marketplaces
   * @returns List of all marketplaces
   */
  public async getAllMarketplaces(): Promise<MarketplaceDetails[]> {
    try {
      const participations = await this.getMarketplaceParticipations();
      return participations.data.payload.map((p: any) => p.marketplace);
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error('Failed to get all marketplaces:', error);
      return [];
    }
  }

  /**
   * Get a marketplace's currency by ID
   * @param marketplaceId Marketplace ID
   * @returns Currency code or null if not found
   */
  public async getMarketplaceCurrencyById(marketplaceId: string): Promise<string | null> {
    try {
      const marketplace = await this.getMarketplaceById(marketplaceId);
      return marketplace?.defaultCurrencyCode || null;
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error('Failed to get marketplace currency:', error);
      return null;
    }
  }
}