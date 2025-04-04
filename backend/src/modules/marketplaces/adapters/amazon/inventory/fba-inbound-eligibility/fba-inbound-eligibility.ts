/**
 * Amazon FBA Inbound Eligibility API Module
 * 
 * Implements the Amazon SP-API FBA Inbound Eligibility API functionality.
 * This module provides operations for checking FBA inbound eligibility for items.
 */

import { ApiModule } from '../../../core/api-module';
import { ApiRequestFunction, ApiResponse } from '../../../core/base-module.interface';
import AmazonErrorHandler, { AmazonErrorCode } from '../../../utils/amazon-error';

/**
 * Inbound eligibility status values
 */
export type EligibilityStatus = 'ELIGIBLE' | 'INELIGIBLE' | 'NOT_APPLICABLE';

/**
 * Program eligibility reason codes
 */
export type ReasonCode = 'FBA_INB_0004' | 'FBA_INB_0006' | 'FBA_INB_0007' | 
  'FBA_INB_0008' | 'FBA_INB_0009' | 'FBA_INB_0010' | 'FBA_INB_0011' | 
  'FBA_INB_0012' | 'FBA_INB_0013' | 'FBA_INB_0014' | 'FBA_INB_0015' | 
  'FBA_INB_0016' | 'FBA_INB_0017' | 'FBA_INB_0018' | 'FBA_INB_0019' | 
  'FBA_INB_0034' | 'FBA_INB_0035' | 'FBA_INB_0036' | 'FBA_INB_0037' | 
  'FBA_INB_0038' | 'FBA_INB_0050' | 'FBA_INB_0051' | 'FBA_INB_0053' | 
  'FBA_INB_0055' | 'FBA_INB_0056' | 'FBA_INB_0059' | 'FBA_INB_0065' | 
  'FBA_INB_0066' | 'FBA_INB_0067' | 'FBA_INB_0068' | 'FBA_INB_0095' | 
  'FBA_INB_0097' | 'FBA_INB_0098' | 'FBA_INB_0099' | 'FBA_INB_0100' | 
  'FBA_INB_0103' | 'FBA_INB_0104';

/**
 * Inbound eligibility request for a single item
 */
export interface InboundEligibilityRequest {
  /**
   * ASIN to check
   */
  asin?: string;
  
  /**
   * Seller SKU to check
   */
  sellerSKU?: string;
  
  /**
   * Marketplace ID to check in
   */
  marketplaceIds: string[];
  
  /**
   * Program to check eligibility for (currently only "INBOUND" is supported)
   */
  program?: string;
}

/**
 * Inbound eligibility reason
 */
export interface EligibilityReason {
  /**
   * Reason code
   */
  reasonCode: ReasonCode;
  
  /**
   * Translated description of the reason
   */
  translatedDescription?: string;
}

/**
 * Inbound eligibility response for a single item
 */
export interface InboundEligibilityResult {
  /**
   * ASIN of the item
   */
  asin?: string;
  
  /**
   * Seller SKU of the item
   */
  sellerSKU?: string;
  
  /**
   * Marketplace ID for this result
   */
  marketplaceId: string;
  
  /**
   * Program eligibility was checked for
   */
  program: string;
  
  /**
   * Whether the item is eligible for the program
   */
  isEligibleForProgram: boolean;
  
  /**
   * Eligibility status
   */
  eligibilityStatus?: EligibilityStatus;
  
  /**
   * List of reasons for the eligibility status
   */
  eligibilityReasons?: EligibilityReason[];
}

/**
 * Get inbound eligibility response
 */
export interface GetInboundEligibilityResponse {
  /**
   * List of eligibility results
   */
  payload: InboundEligibilityResult[];
}

/**
 * Interface for FBA inbound eligibility module options
 */
export interface FBAInboundEligibilityModuleOptions {
  // Optional configuration specific to FBA inbound eligibility module
}

/**
 * Implementation of the Amazon FBA Inbound Eligibility API
 */
export class FBAInboundEligibilityModule extends ApiModule<FBAInboundEligibilityModuleOptions> {
  /**
   * The unique identifier for this module
   */
  readonly moduleId: string = 'fbaInboundEligibility';
  
  /**
   * The human-readable name of this module
   */
  readonly moduleName: string = 'FBA Inbound Eligibility';
  
  /**
   * The API version this module uses
   */
  readonly apiVersion: string;
  
  /**
   * The base URL path for API requests
   */
  readonly basePath: string;
  
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
    options: FBAInboundEligibilityModuleOptions = {}
  ) {
    super(apiRequest, marketplaceId, options);
    this.apiVersion = apiVersion;
    this.basePath = `/fba/inbound/${apiVersion}/eligibility`;
  }
  
  /**
   * Get inbound eligibility for a list of items
   * @param requests List of inbound eligibility requests
   * @returns List of inbound eligibility results
   */
  public async getInboundEligibility(
    requests: InboundEligibilityRequest[]
  ): Promise<InboundEligibilityResult[]> {
    if (!requests || requests.length === 0) {
      throw AmazonErrorHandler.createError(
        'At least one eligibility request is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      // Process requests in batches of 10 (Amazon limitation)
      const batchSize = 10;
      const results: InboundEligibilityResult[] = [];
      
      for (let i = 0; i < requests.length; i += batchSize) {
        const batch = requests.slice(i, i + batchSize);
        
        // Process each batch
        for (const request of batch) {
          // Validate required parameters
          if (!request.marketplaceIds || request.marketplaceIds.length === 0) {
            throw AmazonErrorHandler.createError(
              'At least one marketplace ID is required',
              AmazonErrorCode.INVALID_INPUT
            );
          }
          
          // Either ASIN or sellerSKU must be provided
          if (!request.asin && !request.sellerSKU) {
            throw AmazonErrorHandler.createError(
              'Either ASIN or sellerSKU must be provided',
              AmazonErrorCode.INVALID_INPUT
            );
          }
          
          // Build query parameters
          const queryParams: Record<string, any> = {};
          
          // Add marketplaceIds as an array
          queryParams.marketplaceIds = request.marketplaceIds;
          
          // Add asin or sellerSKU
          if (request.asin) {
            queryParams.asin = request.asin;
          }
          
          if (request.sellerSKU) {
            queryParams.sellerSKU = request.sellerSKU;
          }
          
          // Add program (default to INBOUND)
          queryParams.program = request.program || 'INBOUND';
          
          // Make the API request
          const response = await this.request<GetInboundEligibilityResponse>(
            '',
            'GET',
            queryParams
          );
          
          if (response.data.payload && response.data.payload.length > 0) {
            results.push(...response.data.payload);
          }
        }
      }
      
      return results;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getInboundEligibility`);
    }
  }
  
  /**
   * Get inbound eligibility for a single item by ASIN
   * @param asin ASIN to check
   * @param marketplaceIds Marketplace IDs to check in
   * @returns Inbound eligibility results
   */
  public async getInboundEligibilityByAsin(
    asin: string,
    marketplaceIds?: string[]
  ): Promise<InboundEligibilityResult[]> {
    if (!asin) {
      throw AmazonErrorHandler.createError(
        'ASIN is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.getInboundEligibility([{
        asin,
        marketplaceIds: marketplaceIds || [this.marketplaceId],
        program: 'INBOUND'
      }]);
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getInboundEligibilityByAsin`);
    }
  }
  
  /**
   * Get inbound eligibility for a single item by SKU
   * @param sku Seller SKU to check
   * @param marketplaceIds Marketplace IDs to check in
   * @returns Inbound eligibility results
   */
  public async getInboundEligibilityBySku(
    sku: string,
    marketplaceIds?: string[]
  ): Promise<InboundEligibilityResult[]> {
    if (!sku) {
      throw AmazonErrorHandler.createError(
        'SKU is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.getInboundEligibility([{
        sellerSKU: sku,
        marketplaceIds: marketplaceIds || [this.marketplaceId],
        program: 'INBOUND'
      }]);
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getInboundEligibilityBySku`);
    }
  }
  
  /**
   * Check if an item is eligible for inbound by ASIN
   * @param asin ASIN to check
   * @param marketplaceId Marketplace ID to check in
   * @returns Whether the item is eligible for inbound
   */
  public async isEligibleForInboundByAsin(
    asin: string,
    marketplaceId?: string
  ): Promise<boolean> {
    try {
      const results = await this.getInboundEligibilityByAsin(
        asin,
        marketplaceId ? [marketplaceId] : [this.marketplaceId]
      );
      
      // Return true if any result indicates eligibility
      return results.some(result => result.isEligibleForProgram);
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.isEligibleForInboundByAsin`);
    }
  }
  
  /**
   * Check if an item is eligible for inbound by SKU
   * @param sku Seller SKU to check
   * @param marketplaceId Marketplace ID to check in
   * @returns Whether the item is eligible for inbound
   */
  public async isEligibleForInboundBySku(
    sku: string,
    marketplaceId?: string
  ): Promise<boolean> {
    try {
      const results = await this.getInboundEligibilityBySku(
        sku, 
        marketplaceId ? [marketplaceId] : [this.marketplaceId]
      );
      
      // Return true if any result indicates eligibility
      return results.some(result => result.isEligibleForProgram);
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.isEligibleForInboundBySku`);
    }
  }
  
  /**
   * Get ineligibility reasons for an ASIN
   * @param asin ASIN to check
   * @param marketplaceId Marketplace ID to check in
   * @returns List of ineligibility reasons, or empty array if eligible
   */
  public async getIneligibilityReasonsByAsin(
    asin: string,
    marketplaceId?: string
  ): Promise<EligibilityReason[]> {
    try {
      const results = await this.getInboundEligibilityByAsin(
        asin,
        marketplaceId ? [marketplaceId] : [this.marketplaceId]
      );
      
      // Find the result for the specified marketplace
      const result = results.find(r => 
        r.marketplaceId === (marketplaceId || this.marketplaceId)
      );
      
      // Return reasons if item is ineligible
      if (result && !result.isEligibleForProgram && result.eligibilityReasons) {
        return result.eligibilityReasons;
      }
      
      return [];
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getIneligibilityReasonsByAsin`);
    }
  }
  
  /**
   * Get ineligibility reasons for a SKU
   * @param sku Seller SKU to check
   * @param marketplaceId Marketplace ID to check in
   * @returns List of ineligibility reasons, or empty array if eligible
   */
  public async getIneligibilityReasonsBySku(
    sku: string,
    marketplaceId?: string
  ): Promise<EligibilityReason[]> {
    try {
      const results = await this.getInboundEligibilityBySku(
        sku,
        marketplaceId ? [marketplaceId] : [this.marketplaceId]
      );
      
      // Find the result for the specified marketplace
      const result = results.find(r => 
        r.marketplaceId === (marketplaceId || this.marketplaceId)
      );
      
      // Return reasons if item is ineligible
      if (result && !result.isEligibleForProgram && result.eligibilityReasons) {
        return result.eligibilityReasons;
      }
      
      return [];
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getIneligibilityReasonsBySku`);
    }
  }
  
  /**
   * Get eligibility status for a list of items
   * @param items List of items to check (can be mix of ASINs and SKUs)
   * @param marketplaceId Marketplace ID to check in
   * @returns Map of item identifier to eligibility result
   */
  public async batchCheckEligibility(
    items: Array<{ asin?: string; sku?: string }>,
    marketplaceId?: string
  ): Promise<Map<string, boolean>> {
    if (!items || items.length === 0) {
      throw AmazonErrorHandler.createError(
        'At least one item is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      // Create requests for each item
      const requests: InboundEligibilityRequest[] = items.map(item => ({
        asin: item.asin,
        sellerSKU: item.sku,
        marketplaceIds: [marketplaceId || this.marketplaceId],
        program: 'INBOUND'
      }));
      
      // Get eligibility for all items
      const results = await this.getInboundEligibility(requests);
      
      // Create a map of item identifier to eligibility status
      const eligibilityMap = new Map<string, boolean>();
      
      results.forEach(result => {
        const identifier = result.asin || result.sellerSKU;
        if (identifier) {
          eligibilityMap.set(identifier, result.isEligibleForProgram);
        }
      });
      
      return eligibilityMap;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.batchCheckEligibility`);
    }
  }
}