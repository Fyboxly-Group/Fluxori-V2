/**
 * Amazon Listings Restrictions API Module
 * 
 * Implements the Amazon SP-API Listings Restrictions API functionality.
 * This module allows sellers to check product listing eligibility based on Amazon's restrictions.
 */

import { BaseApiModule, ApiRequestOptions, ApiResponse } from '../core/api-module';
import { AmazonSPApi } from '../schemas/amazon.generated';
import { AmazonErrorUtil, AmazonErrorCode } from '../utils/amazon-error';

/**
 * Type aliases from schema
 */
export type RestrictionsIdentifierType = AmazonSPApi.ListingsRestrictions.RestrictionsIdentifierType;
export type Restriction = AmazonSPApi.ListingsRestrictions.Restriction;
export type RestrictionList = AmazonSPApi.ListingsRestrictions.RestrictionList;

/**
 * Options for checking restrictions
 */
export interface CheckRestrictionsOptions {
  /**
   * Marketplace ID
   */
  marketplaceId: string;
  
  /**
   * The condition of the item that would be listed
   */
  condition?: string;
  
  /**
   * Applicable country for the listing restriction check (useful for cross-border sales)
   */
  reasonLocale?: string;
}

/**
 * Implementation of the Amazon Listings Restrictions API
 */
export class ListingsRestrictionsModule extends BaseApiModule {
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
    super('listingsRestrictions', apiVersion, makeApiRequest, marketplaceId);
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
   * Check if a product can be listed on Amazon by ASIN
   * @param asin ASIN to check
   * @param options Options for the restrictions check
   * @returns Restrictions information for the ASIN
   */
  public async checkRestrictionsAsin(
    asin: string,
    options: CheckRestrictionsOptions
  ): Promise<ApiResponse<RestrictionList>> {
    return this.checkRestrictions('ASIN', asin, options);
  }
  
  /**
   * Check if a product can be listed on Amazon by SKU
   * @param sku Seller SKU to check
   * @param options Options for the restrictions check
   * @returns Restrictions information for the SKU
   */
  public async checkRestrictionsSku(
    sku: string,
    options: CheckRestrictionsOptions
  ): Promise<ApiResponse<RestrictionList>> {
    return this.checkRestrictions('SKU', sku, options);
  }
  
  /**
   * Check if a product can be listed on Amazon by GTIN (EAN, UPC, ISBN, etc.)
   * @param gtin GTIN to check
   * @param options Options for the restrictions check
   * @returns Restrictions information for the GTIN
   */
  public async checkRestrictionsGtin(
    gtin: string,
    options: CheckRestrictionsOptions
  ): Promise<ApiResponse<RestrictionList>> {
    return this.checkRestrictions('GTIN', gtin, options);
  }
  
  /**
   * Check if a product can be listed on Amazon
   * @param identifierType Type of identifier (ASIN, GTIN, or SKU)
   * @param identifierValue Value of the identifier
   * @param options Options for the restrictions check
   * @returns Restrictions information for the product
   */
  private async checkRestrictions(
    identifierType: RestrictionsIdentifierType,
    identifierValue: string,
    options: CheckRestrictionsOptions
  ): Promise<ApiResponse<RestrictionList>> {
    if (!identifierValue) {
      throw AmazonErrorUtil.createError(
        `${identifierType} is required to check restrictions`,
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.marketplaceId) {
      throw AmazonErrorUtil.createError(
        'Marketplace ID is required to check restrictions',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const params: Record<string, any> = {
      marketplaceIds: options.marketplaceId
    };
    
    // Convert identifierType to the format expected by the API
    params[identifierType.toLowerCase()] = identifierValue;
    
    // Add optional parameters
    if (options.condition) {
      params.condition = options.condition;
    }
    
    if (options.reasonLocale) {
      params.reasonLocale = options.reasonLocale;
    }
    
    try {
      return await this.makeRequest<RestrictionList>({
        method: 'GET',
        path: '/restrictions',
        params
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.checkRestrictions`);
    }
  }

  /**
   * Check restrictions for multiple products
   * @param items Array of items to check, with identifier type and value
   * @param options Options for the restrictions check
   * @returns Map of identifier values to restriction information
   */
  public async batchCheckRestrictions(
    items: Array<{
      type: RestrictionsIdentifierType;
      value: string;
    }>,
    options: CheckRestrictionsOptions
  ): Promise<Map<string, Restriction[] | Error>> {
    if (!items || items.length === 0) {
      throw AmazonErrorUtil.createError(
        'At least one item is required for batch restriction check',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Check each item individually (Amazon doesn't provide a batch endpoint)
    const promises = items.map((item: any) => 
      this.checkRestrictions(item.type, item.value, options)
        .then(response => ({
          value: item.value,
          restrictions: response.data.restrictions
        }))
        .catch(error => ({
          value: item.value,
          error
        }))
    );
    
    const results = await Promise.all<any>(promises);
    
    // Build a map of identifier value to restrictions or error
    const restrictionsMap = new Map<string, Restriction[] | Error>();
    
    results.forEach((result: any) => {
      if ('restrictions' in result) {
        restrictionsMap.set(result.value, result.restrictions);
      } else {
        restrictionsMap.set(result.value, result.error);
      }
    });

    return restrictionsMap;
  }
  
  /**
   * Check if a product is eligible for listing
   * @param identifierType Type of identifier (ASIN, GTIN, or SKU)
   * @param identifierValue Value of the identifier
   * @param options Options for the restrictions check
   * @returns Boolean indicating whether the product is eligible for listing
   */
  public async isEligibleForListing(
    identifierType: RestrictionsIdentifierType,
    identifierValue: string,
    options: CheckRestrictionsOptions
  ): Promise<boolean> {
    try {
      const response = await this.checkRestrictions(identifierType, identifierValue, options);
      
      // If there are no restrictions, the product is eligible
      return response.data.restrictions.length === 0;
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      // If there was an error, assume the product is not eligible
      console.error(`Error checking eligibility for ${identifierType} ${identifierValue}:`, error);
      return false;
    }
  }

  /**
   * Get detailed restriction reasons for a product
   * @param identifierType Type of identifier (ASIN, GTIN, or SKU)
   * @param identifierValue Value of the identifier
   * @param options Options for the restrictions check
   * @returns Array of restriction reasons
   */
  public async getRestrictionReasons(
    identifierType: RestrictionsIdentifierType,
    identifierValue: string,
    options: CheckRestrictionsOptions
  ): Promise<string[]> {
    try {
      const response = await this.checkRestrictions(identifierType, identifierValue, options);
      
      // Extract the reasons from the restrictions
      return response.data.restrictions.map((restriction: any) => {
        // Build a detailed reason string
        let reason = restriction.reasonCode || 'Unknown restriction';
        
        if (restriction.message) {
          reason += `: ${restriction.message}`;
        }
        
        return reason;
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error(`Error getting restriction reasons for ${identifierType} ${identifierValue}:`, error);
      return ['Error retrieving restrictions information'];
    }
  }
}