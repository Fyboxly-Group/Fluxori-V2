/**
 * Amazon FBA Inbound Eligibility API Module
 * 
 * Implements the Amazon SP-API FBA Inbound Eligibility API functionality.
 * This module provides operations to check product eligibility for fulfillment by Amazon.
 */

// Define necessary types for TypeScript validation
class BaseApiModule {
  protected moduleName: string;
  protected marketplaceId: string;

  constructor(moduleName: string, apiVersion: string, makeApiRequest: any, marketplaceId: string) {
    this.moduleName = moduleName;
    this.marketplaceId = marketplaceId;
  }

  protected makeRequest<T>(options: any): Promise<ApiResponse<T>> {
    return Promise<any>.resolve({ data: {} as T, status: 200, headers: {} } as ApiResponse<T>);
  }
}

interface ApiRequestOptions {
  method: string;
  path: string;
  data?: any;
  params?: Record<string, any>;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

import { AmazonErrorUtil, AmazonErrorCode } from '../../utils/amazon-error';

/**
 * Eligibility status for FBA inbound
 */
export enum EligibilityStatus {
  ELIGIBLE = 'ELIGIBLE',
  INELIGIBLE = 'INELIGIBLE',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Type for ineligibility reason codes
 */
export type IneligibilityReasonCode = 
  | 'FBA_INB_0004' // ASIN not found
  | 'FBA_INB_0006' // Dangerous goods(hazmat) require Amazon approval
  | 'FBA_INB_0007' // This product requires approval for selling on the marketplace
  | 'FBA_INB_0008' // Hazmat compliance information is missing
  | 'FBA_INB_0009' // This product cannot be inbounded because it has been prohibited by Amazon
  | 'FBA_INB_0010' // This storage type is incompatible or invalid for this product
  | 'FBA_INB_0012' // This is an adult product, and your account is not approved to sell it
  | 'FBA_INB_0013' // This product exceeds FBA product restrictions
  | 'FBA_INB_0014' // This product is an FBA prohibited product
  | 'FBA_INB_0197' // This product is too large for FBA program
  | 'FBA_INB_0201' // Package dimensions exceed maximum allowed
  | 'UNKNOWN';

/**
 * A reason for ineligibility
 */
export interface IneligibilityReason {
  /**
   * A code indicating the reason for ineligibility
   */
  reasonCode: IneligibilityReasonCode;
  
  /**
   * A human-readable description of the reason for ineligibility
   */
  reasonDescription: string;
}

/**
 * Response data for an item's eligibility status
 */
export interface ItemEligibilityResponse {
  /**
   * The identifier for the item (either ASIN or SKU)
   */
  itemIdentifier: string;
  
  /**
   * The program for which eligibility was determined
   */
  program: string;
  
  /**
   * Eligibility status for the item
   */
  eligibilityStatus: EligibilityStatus;
  
  /**
   * Reasons for ineligibility if the item is ineligible
   */
  ineligibilityReasons?: IneligibilityReason[];
}

/**
 * Response wrapper for FBA Inbound Eligibility API
 */
export interface GetItemEligibilityResponse {
  /**
   * The item eligibility response data
   */
  payload: ItemEligibilityResponse;
}

/**
 * Options for checking product eligibility
 */
export interface GetItemEligibilityOptions {
  /**
   * The marketplace identifier for which eligibility status is required
   */
  marketplaceId?: string;
  
  /**
   * The Amazon Standard Identification Number of the item
   */
  asin?: string;
  
  /**
   * The Seller SKU of the item
   */
  sellerSku?: string;
  
  /**
   * The program for which eligibility status is required
   */
  program?: 'INBOUND' | 'COMMINGLING';
}

/**
 * Eligibility result
 */
export interface EligibilityResult {
  /**
   * Whether the item is eligible
   */
  isEligible: boolean;
  
  /**
   * Reasons for ineligibility, if any
   */
  reasons: IneligibilityReason[];
}

/**
 * Implementation of the Amazon FBA Inbound Eligibility API
 */
export class FbaInboundEligibilityModule extends BaseApiModule {
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
    super('fbaInboundEligibility', apiVersion, makeApiRequest, marketplaceId);
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
   * Get the eligibility status of an item for the FBA Inbound program
   * @param options Options for checking product eligibility
   * @returns Eligibility status response
   */
  public async getItemEligibility(options: GetItemEligibilityOptions): Promise<ApiResponse<GetItemEligibilityResponse>> {
    const queryParams: Record<string, any> = {};
    
    // Add marketplace ID
    const marketplaceId = options.marketplaceId || this.marketplaceId;
    if (!marketplaceId) {
      throw AmazonErrorUtil.createError(
        'Marketplace ID is required to check eligibility',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    queryParams.marketplaceIds = marketplaceId;
    
    // Add item identifier (either ASIN or SKU)
    if (options.asin) {
      queryParams.asin = options.asin;
    } else if (options.sellerSku) {
      queryParams.sellerSKU = options.sellerSku;
    } else {
      throw AmazonErrorUtil.createError(
        'Either ASIN or SellerSKU is required to check eligibility',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Add program
    if (options.program) {
      queryParams.program = options.program;
    } else {
      queryParams.program = 'INBOUND';
    }
    
    try {
      return await this.makeRequest<GetItemEligibilityResponse>({
        method: 'GET',
        path: '/items/eligibility',
        params: queryParams
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getItemEligibility`);
    }
  }
  
  /**
   * Check if an item is eligible for FBA inbound by ASIN
   * @param asin ASIN of the item to check
   * @param marketplaceId Optional marketplace ID
   * @returns Eligibility result
   */
  public async isEligibleByAsin(asin: string, marketplaceId?: string): Promise<EligibilityResult> {
    if (!asin) {
      throw AmazonErrorUtil.createError(
        'ASIN is required to check eligibility',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.getItemEligibility({
        asin,
        marketplaceId,
        program: 'INBOUND'
      });
      
      const eligibilityData = response.data.payload;
      
      return {
        isEligible: eligibilityData.eligibilityStatus === EligibilityStatus.ELIGIBLE,
        reasons: eligibilityData.ineligibilityReasons || []
      };
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.isEligibleByAsin`);
    }
  }
  
  /**
   * Check if an item is eligible for FBA inbound by SKU
   * @param sku SKU of the item to check
   * @param marketplaceId Optional marketplace ID
   * @returns Eligibility result
   */
  public async isEligibleBySku(sku: string, marketplaceId?: string): Promise<EligibilityResult> {
    if (!sku) {
      throw AmazonErrorUtil.createError(
        'SKU is required to check eligibility',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.getItemEligibility({
        sellerSku: sku,
        marketplaceId,
        program: 'INBOUND'
      });
      
      const eligibilityData = response.data.payload;
      
      return {
        isEligible: eligibilityData.eligibilityStatus === EligibilityStatus.ELIGIBLE,
        reasons: eligibilityData.ineligibilityReasons || []
      };
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.isEligibleBySku`);
    }
  }
  
  /**
   * Check if an item is eligible for commingling by ASIN
   * @param asin ASIN of the item to check
   * @param marketplaceId Optional marketplace ID
   * @returns Eligibility result
   */
  public async isEligibleForComminglingByAsin(asin: string, marketplaceId?: string): Promise<EligibilityResult> {
    if (!asin) {
      throw AmazonErrorUtil.createError(
        'ASIN is required to check commingling eligibility',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.getItemEligibility({
        asin,
        marketplaceId,
        program: 'COMMINGLING'
      });
      
      const eligibilityData = response.data.payload;
      
      return {
        isEligible: eligibilityData.eligibilityStatus === EligibilityStatus.ELIGIBLE,
        reasons: eligibilityData.ineligibilityReasons || []
      };
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.isEligibleForComminglingByAsin`);
    }
  }
  
  /**
   * Check eligibility for multiple ASINs
   * @param asins Array of ASINs to check
   * @param marketplaceId Optional marketplace ID
   * @returns Map of ASIN to eligibility result
   */
  public async bulkCheckEligibilityByAsins(asins: string[], marketplaceId?: string): Promise<Map<string, EligibilityResult>> {
    if (!asins || asins.length === 0) {
      throw AmazonErrorUtil.createError(
        'At least one ASIN is required for bulk eligibility check',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const results = new Map<string, EligibilityResult>();
    
    // Process in batches to avoid rate limiting
    const batchSize = 20;
    for (let i = 0; i < asins.length; i += batchSize) {
      const batch = asins.slice(i, i + batchSize);
      
      // Process batch in parallel
      const batchPromise<any>s = batch.map((asin: any) => 
        this.isEligibleByAsin(asin, marketplaceId)
          .then(result => ({ asin, result }))
          .catch(error => ({
            asin,
            result: {
              isEligible: false,
              reasons: [{
                reasonCode: 'UNKNOWN' as IneligibilityReasonCode,
                reasonDescription: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) || 'Unknown error occurred'
              }]
            }
          }))
      );
      
      const batchResults = await Promise.all<any>(batchPromise<any>s);
      
      // Add results to the map
      batchResults.forEach(({ asin, result }) => {
        results.set(asin, result);
      });
      
      // Rate limit prevention
      if (i + batchSize < asins.length) {
        await new Promise<any>(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
}