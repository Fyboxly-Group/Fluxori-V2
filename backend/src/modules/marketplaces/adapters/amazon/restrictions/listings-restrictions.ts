/**
 * Amazon Listings Restrictions API Module
 * 
 * Implements the Amazon SP-API Listings Restrictions API functionality.
 * This module allows sellers to check product listing eligibility based on Amazon's restrictions.
 */

import { ApiRequestFunction, ApiResponse, BaseModule } from '../core/base-module.interface';
import AmazonErrorHandler, { AmazonErrorCode } from '../utils/amazon-error';

/**
 * RestrictionsIdentifierType - Type of identifier for checking restrictions
 */
export type RestrictionsIdentifierType = 'ASIN' | 'SKU' | 'GTIN';

/**
 * Restriction condition
 */
export type ConditionType = 
  'new' | 
  'new_new' | 
  'new_open_box' | 
  'new_oem' | 
  'refurbished_refurbished' | 
  'used_like_new' | 
  'used_very_good' | 
  'used_good' | 
  'used_acceptable' | 
  'collectible_like_new' | 
  'collectible_very_good' | 
  'collectible_good' | 
  'collectible_acceptable' | 
  'club_club';

/**
 * Link object for documentation of a restriction
 */
export interface Link {
  /**
   * Resource URL
   */
  resource: string;
  
  /**
   * Title of the link
   */
  title?: string;
  
  /**
   * Type of link
   */
  type?: string;
}

/**
 * Restriction
 */
export interface Restriction {
  /**
   * Marketplace ID
   */
  marketplaceId: string;
  
  /**
   * Condition type
   */
  conditionType?: string;
  
  /**
   * Reason for the restriction
   */
  reasonCode?: string;
  
  /**
   * Formatted message explaining the restriction
   */
  message?: string;
  
  /**
   * Links to more information about the restriction
   */
  links?: Link[];
}

/**
 * RestrictionList - List of restrictions for a product
 */
export interface RestrictionList {
  /**
   * Array of restrictions
   */
  restrictions: Restriction[];
}

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
  condition?: ConditionType | string;
  
  /**
   * Applicable country for the listing restriction check (useful for cross-border sales)
   */
  reasonLocale?: string;
}

/**
 * ListingsRestrictions module options
 */
export interface ListingsRestrictionsModuleOptions {
  /**
   * Default marketplace ID
   */
  defaultMarketplaceId?: string;
  
  /**
   * Default reason locale
   */
  defaultReasonLocale?: string;
  
  /**
   * Default batch size for batch operations
   */
  batchSize?: number;
}

/**
 * Implementation of the Amazon Listings Restrictions API
 */
export class ListingsRestrictionsModule implements BaseModule<ListingsRestrictionsModuleOptions> {
  /**
   * The unique identifier for this module
   */
  public readonly moduleId: string = 'listingsRestrictions';
  
  /**
   * The human-readable name of this module
   */
  public readonly moduleName: string = 'Listings Restrictions';
  
  /**
   * The base URL path for API requests
   */
  public readonly basePath: string;
  
  /**
   * API version
   */
  public readonly apiVersion: string;
  
  /**
   * Marketplace ID
   */
  public readonly marketplaceId: string;
  
  /**
   * Additional configuration options for this module
   */
  public readonly options: ListingsRestrictionsModuleOptions = {
    defaultReasonLocale: 'en_US',
    batchSize: 20
  };
  
  /**
   * The API request function used by this module
   */
  public readonly apiRequest: ApiRequestFunction;
  
  /**
   * Constructor
   * @param apiVersion API version
   * @param apiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param options Optional module-specific configuration
   */
  constructor(
    apiVersion: string,
    apiRequest: ApiRequestFunction,
    marketplaceId: string,
    options?: ListingsRestrictionsModuleOptions
  ) {
    this.apiVersion = apiVersion;
    this.apiRequest = apiRequest;
    this.marketplaceId = marketplaceId;
    this.basePath = `/listings/restrictions/${apiVersion}`;
    
    if (options) {
      this.options = {
        ...this.options,
        ...options
      };
    }
    
    // Set default marketplace ID if not provided in options
    if (!this.options.defaultMarketplaceId) {
      this.options.defaultMarketplaceId = marketplaceId;
    }
  }
  
  /**
   * Check if a product can be listed on Amazon by ASIN
   * @param asin ASIN to check
   * @param options Options for the restrictions check
   * @returns Restrictions information for the ASIN
   */
  public async checkRestrictionsAsin(
    asin: string, 
    options: Partial<CheckRestrictionsOptions> = {}
  ): Promise<ApiResponse<RestrictionList>> {
    const fullOptions: CheckRestrictionsOptions = {
      marketplaceId: options.marketplaceId || this.options.defaultMarketplaceId || this.marketplaceId,
      condition: options.condition,
      reasonLocale: options.reasonLocale || this.options.defaultReasonLocale
    };
    
    return this.checkRestrictions('ASIN', asin, fullOptions);
  }
  
  /**
   * Check if a product can be listed on Amazon by SKU
   * @param sku Seller SKU to check
   * @param options Options for the restrictions check
   * @returns Restrictions information for the SKU
   */
  public async checkRestrictionsSku(
    sku: string, 
    options: Partial<CheckRestrictionsOptions> = {}
  ): Promise<ApiResponse<RestrictionList>> {
    const fullOptions: CheckRestrictionsOptions = {
      marketplaceId: options.marketplaceId || this.options.defaultMarketplaceId || this.marketplaceId,
      condition: options.condition,
      reasonLocale: options.reasonLocale || this.options.defaultReasonLocale
    };
    
    return this.checkRestrictions('SKU', sku, fullOptions);
  }
  
  /**
   * Check if a product can be listed on Amazon by GTIN (EAN, UPC, ISBN, etc.)
   * @param gtin GTIN to check
   * @param options Options for the restrictions check
   * @returns Restrictions information for the GTIN
   */
  public async checkRestrictionsGtin(
    gtin: string, 
    options: Partial<CheckRestrictionsOptions> = {}
  ): Promise<ApiResponse<RestrictionList>> {
    const fullOptions: CheckRestrictionsOptions = {
      marketplaceId: options.marketplaceId || this.options.defaultMarketplaceId || this.marketplaceId,
      condition: options.condition,
      reasonLocale: options.reasonLocale || this.options.defaultReasonLocale
    };
    
    return this.checkRestrictions('GTIN', gtin, fullOptions);
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
      throw AmazonErrorHandler.createError(
        `${identifierType} is required to check restrictions`,
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.marketplaceId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required to check restrictions',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const params: Record<string, string | string[]> = {
      marketplaceIds: [options.marketplaceId]
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
      return await this.apiRequest(
        'GET',
        `${this.basePath}/restrictions`,
        { params }
      );
    } catch (error) {
      throw error instanceof Error
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED, error)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
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
    options: Partial<CheckRestrictionsOptions> = {}
  ): Promise<Map<string, Restriction[] | Error>> {
    if (!items || items.length === 0) {
      throw AmazonErrorHandler.createError(
        'At least one item is required for batch restriction check',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const fullOptions: CheckRestrictionsOptions = {
      marketplaceId: options.marketplaceId || this.options.defaultMarketplaceId || this.marketplaceId,
      condition: options.condition,
      reasonLocale: options.reasonLocale || this.options.defaultReasonLocale
    };
    
    // Check each item individually (Amazon doesn't provide a batch endpoint)
    const promises = items.map(item => 
      this.checkRestrictions(item.type, item.value, fullOptions)
        .then(response => ({
          value: item.value,
          restrictions: response.data.restrictions
        }))
        .catch(error => ({
          value: item.value,
          error
        }))
    );
    
    const results = await Promise.all(promises);
    
    // Build a map of identifier value to restrictions or error
    const restrictionsMap = new Map<string, Restriction[] | Error>();
    
    results.forEach(result => {
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
    options: Partial<CheckRestrictionsOptions> = {}
  ): Promise<boolean> {
    try {
      const fullOptions: CheckRestrictionsOptions = {
        marketplaceId: options.marketplaceId || this.options.defaultMarketplaceId || this.marketplaceId,
        condition: options.condition,
        reasonLocale: options.reasonLocale || this.options.defaultReasonLocale
      };
      
      const response = await this.checkRestrictions(identifierType, identifierValue, fullOptions);
      
      // If there are no restrictions, the product is eligible
      return response.data.restrictions.length === 0;
    } catch (error) {
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
    options: Partial<CheckRestrictionsOptions> = {}
  ): Promise<string[]> {
    try {
      const fullOptions: CheckRestrictionsOptions = {
        marketplaceId: options.marketplaceId || this.options.defaultMarketplaceId || this.marketplaceId,
        condition: options.condition,
        reasonLocale: options.reasonLocale || this.options.defaultReasonLocale
      };
      
      const response = await this.checkRestrictions(identifierType, identifierValue, fullOptions);
      
      // Extract the reasons from the restrictions
      return response.data.restrictions.map(restriction => {
        // Build a detailed reason string
        let reason = restriction.reasonCode || 'Unknown restriction';
        
        if (restriction.message) {
          reason += `: ${restriction.message}`;
        }
        
        return reason;
      });
    } catch (error) {
      console.error(`Error getting restriction reasons for ${identifierType} ${identifierValue}:`, error);
      return ['Error retrieving restrictions information'];
    }
  }
  
  /**
   * Check eligibility for multiple ASINs
   * @param asins Array of ASINs to check
   * @param options Options for the restrictions check
   * @returns Map of ASINs to eligibility status
   */
  public async checkEligibilityForMultipleAsins(
    asins: string[], 
    options: Partial<CheckRestrictionsOptions> = {}
  ): Promise<Map<string, boolean>> {
    if (!asins || asins.length === 0) {
      throw AmazonErrorHandler.createError(
        'At least one ASIN is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const items = asins.map(asin => ({
      type: 'ASIN' as RestrictionsIdentifierType,
      value: asin
    }));
    
    const restrictionsMap = await this.batchCheckRestrictions(items, options);
    const eligibilityMap = new Map<string, boolean>();
    
    restrictionsMap.forEach((restrictionsOrError, asin) => {
      if (restrictionsOrError instanceof Error) {
        // If there was an error, assume the product is not eligible
        eligibilityMap.set(asin, false);
      } else {
        // If there are no restrictions, the product is eligible
        eligibilityMap.set(asin, restrictionsOrError.length === 0);
      }
    });
    
    return eligibilityMap;
  }
  
  /**
   * Get the most common restriction reasons across multiple products
   * @param items Array of items to check
   * @param options Options for the restrictions check
   * @returns Sorted array of restriction reasons with counts
   */
  public async getCommonRestrictionReasons(
    items: Array<{
      type: RestrictionsIdentifierType;
      value: string;
    }>, 
    options: Partial<CheckRestrictionsOptions> = {}
  ): Promise<Array<{ reason: string; count: number }>> {
    const restrictionsMap = await this.batchCheckRestrictions(items, options);
    const reasonCounts = new Map<string, number>();
    
    // Count occurrences of each reason
    restrictionsMap.forEach((restrictionsOrError, itemValue) => {
      if (!(restrictionsOrError instanceof Error)) {
        restrictionsOrError.forEach(restriction => {
          const reason = restriction.reasonCode || 'Unknown';
          const count = reasonCounts.get(reason) || 0;
          reasonCounts.set(reason, count + 1);
        });
      }
    });
    
    // Convert to array and sort by count (descending)
    return Array.from(reasonCounts.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);
  }
}