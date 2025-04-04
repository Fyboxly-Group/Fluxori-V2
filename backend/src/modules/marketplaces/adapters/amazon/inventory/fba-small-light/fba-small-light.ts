/**
 * Implementation of the Amazon FBA Small and Light API module
 * 
 * This module provides functionality for managing products in the Small and Light program,
 * which offers lower fulfillment costs for small, lightweight, low-cost items.
 */
import { ApiModule } from '../../../amazon/core/api-module';
import { ApiRequestFunction, ApiResponse } from '../../../amazon/core/base-module.interface';
import { AmazonErrorHandler, AmazonErrorCode } from '../../../amazon/utils/amazon-error';

// Define FBA Small and Light namespace to avoid unknown AmazonSPApi errors
// This is a temporary solution until proper type definitions are available
declare namespace AmazonSPApi {
  export namespace FBASmallAndLight {
    export interface SmallAndLightEligibility {
      sellerSKU: string;
      marketplaceId: string;
      status: string;
      reason?: string;
    }

    export interface SmallAndLightEnrollment {
      sellerSKU: string;
      marketplaceId: string;
      status: string;
      enrollmentDate?: string;
    }

    export interface SmallAndLightEnrollments {
      enrollments?: SmallAndLightEnrollment[];
      nextToken?: string;
    }

    export interface SmallAndLightFeePreview {
      sellerSKU: string;
      status: string;
      feeBreakdown?: {
        feeType: string;
        amount: {
          currencyCode: string;
          value: number;
        };
      }[];
    }

    export interface SmallAndLightFeePreviews {
      feePreviews?: SmallAndLightFeePreview[];
    }
  }
}

/**
 * Options for the FBA Small and Light module
 */
export interface FbaSmallAndLightModuleOptions {
  /**
   * Maximum number of pages to retrieve when listing products
   */
  maxPages?: number;
  
  /**
   * Default page size for listing operations
   */
  pageSize?: number;
}

/**
 * Small and Light enrollment status for a product
 */
export type SmallAndLightEnrollmentStatus = 'ENROLLED' | 'NOT_ENROLLED' | 'PROCESSING' | 'REMOVED';

/**
 * Small and Light eligibility status for a product
 */
export type SmallAndLightEligibilityStatus = 'ELIGIBLE' | 'INELIGIBLE';

/**
 * Options for listing Small and Light products
 */
export interface ListSmallAndLightProductsOptions {
  /**
   * Marketplace ID to check in
   */
  marketplaceId: string;
  
  /**
   * Maximum number of pages to retrieve
   */
  maxPages?: number;
  
  /**
   * Token for pagination
   */
  nextToken?: string;
  
  /**
   * Number of items per page
   */
  pageSize?: number;
}

/**
 * Implementation of the Amazon FBA Small and Light API
 */
export class FbaSmallAndLightModule extends ApiModule<FbaSmallAndLightModuleOptions> {
  /**
   * The unique identifier for this module
   */
  readonly moduleId: string = 'fbaSmallAndLight';
  
  /**
   * The human-readable name of this module
   */
  readonly moduleName: string = 'Amazon FBA Small and Light';
  
  /**
   * The API version this module uses
   */
  readonly apiVersion: string;
  
  /**
   * The base URL path for API requests
   */
  readonly basePath: string;
  
  /**
   * Creates a new FBA Small and Light module
   * 
   * @param apiVersion - The API version to use
   * @param apiRequest - The API request function to use
   * @param marketplaceId - The Amazon marketplace ID
   * @param options - Additional configuration options
   */
  constructor(
    apiVersion: string,
    apiRequest: ApiRequestFunction,
    marketplaceId: string,
    options: FbaSmallAndLightModuleOptions = {}
  ) {
    super(apiRequest, marketplaceId, options);
    this.apiVersion = apiVersion;
    this.basePath = `/fba/small-and-light/${apiVersion}`;
  }
  
  /**
   * Check if a product is eligible for the Small and Light program
   * 
   * @param sellerSKU - The seller SKU to check
   * @param marketplaceId - The marketplace ID to check in
   * @returns Promise resolving to the eligibility response
   */
  public async getSmallAndLightEligibility(
    sellerSKU: string,
    marketplaceId?: string
  ): Promise<ApiResponse<AmazonSPApi.FBASmallAndLight.SmallAndLightEligibility>> {
    if (!sellerSKU) {
      throw AmazonErrorHandler.createError(
        'Seller SKU is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const params = { 
        marketplaceIds: [marketplaceId || this.marketplaceId],
        sellerSKU
      };
      
      return await this.request<AmazonSPApi.FBASmallAndLight.SmallAndLightEligibility>(
        'eligibilities',
        'GET',
        params
      );
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getSmallAndLightEligibility`);
    }
  }
  
  /**
   * Check if a product is enrolled in the Small and Light program
   * 
   * @param sellerSKU - The seller SKU to check
   * @param marketplaceId - The marketplace ID to check in
   * @returns Promise resolving to the enrollment response
   */
  public async getSmallAndLightEnrollmentBySellerSKU(
    sellerSKU: string,
    marketplaceId?: string
  ): Promise<ApiResponse<AmazonSPApi.FBASmallAndLight.SmallAndLightEnrollment>> {
    if (!sellerSKU) {
      throw AmazonErrorHandler.createError(
        'Seller SKU is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const params = { 
        marketplaceIds: [marketplaceId || this.marketplaceId],
        sellerSKU
      };
      
      return await this.request<AmazonSPApi.FBASmallAndLight.SmallAndLightEnrollment>(
        'enrollments',
        'GET',
        params
      );
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getSmallAndLightEnrollmentBySellerSKU`);
    }
  }
  
  /**
   * Enroll a product in the Small and Light program
   * 
   * @param sellerSKU - The seller SKU to enroll
   * @param marketplaceId - The marketplace ID to enroll in
   * @returns Promise resolving to the enrollment response
   */
  public async enrollProduct(
    sellerSKU: string,
    marketplaceId?: string
  ): Promise<ApiResponse<AmazonSPApi.FBASmallAndLight.SmallAndLightEnrollment>> {
    if (!sellerSKU) {
      throw AmazonErrorHandler.createError(
        'Seller SKU is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const params = { 
        marketplaceIds: [marketplaceId || this.marketplaceId],
        sellerSKU
      };
      
      return await this.request<AmazonSPApi.FBASmallAndLight.SmallAndLightEnrollment>(
        'enrollments',
        'PUT',
        params
      );
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.enrollProduct`);
    }
  }
  
  /**
   * Remove a product from the Small and Light program
   * 
   * @param sellerSKU - The seller SKU to remove
   * @param marketplaceId - The marketplace ID to remove from
   * @returns Promise resolving to the removal response
   */
  public async removeProduct(
    sellerSKU: string,
    marketplaceId?: string
  ): Promise<ApiResponse<void>> {
    if (!sellerSKU) {
      throw AmazonErrorHandler.createError(
        'Seller SKU is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const params = { 
        marketplaceIds: [marketplaceId || this.marketplaceId],
        sellerSKU
      };
      
      return await this.request<void>(
        'enrollments',
        'DELETE',
        params
      );
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.removeProduct`);
    }
  }
  
  /**
   * Get fee estimates for Small and Light products
   * 
   * @param sellerSKUs - The seller SKUs to get fee estimates for
   * @param marketplaceId - The marketplace ID to get fee estimates in
   * @returns Promise resolving to the fee preview response
   */
  public async getSmallAndLightFeePreview(
    sellerSKUs: string[],
    marketplaceId?: string
  ): Promise<ApiResponse<AmazonSPApi.FBASmallAndLight.SmallAndLightFeePreviews>> {
    if(!sellerSKUs || sellerSKUs.length === 0) {
      throw AmazonErrorHandler.createError(
        'At least one Seller SKU is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const params = {
        marketplaceIds: [marketplaceId || this.marketplaceId],
        sellerSKUs: sellerSKUs
      };
      
      return await this.request<AmazonSPApi.FBASmallAndLight.SmallAndLightFeePreviews>(
        'feePreviews',
        'POST',
        params
      );
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getSmallAndLightFeePreview`);
    }
  }
  
  /**
   * List all products enrolled in the Small and Light program
   * 
   * @param options - The listing options
   * @returns Promise resolving to the enrolled products
   */
  public async listSmallAndLightProducts(
    options: ListSmallAndLightProductsOptions
  ): Promise<ApiResponse<AmazonSPApi.FBASmallAndLight.SmallAndLightEnrollments>> {
    const params: Record<string, any> = {
      marketplaceIds: [options.marketplaceId || this.marketplaceId]
    };
    
    if(options.nextToken) {
      params.nextToken = options.nextToken;
    }
    
    if(options.pageSize) {
      params.pageSize = options.pageSize;
    }
    
    try {
      return await this.request<AmazonSPApi.FBASmallAndLight.SmallAndLightEnrollments>(
        'enrollments',
        'GET',
        params
      );
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.listSmallAndLightProducts`);
    }
  }
  
  /**
   * Get all Small and Light products with pagination handling
   * 
   * @param marketplaceId - The marketplace ID to get products from
   * @param maxPages - Maximum number of pages to retrieve
   * @returns Promise resolving to an array of all enrolled products
   */
  public async getAllSmallAndLightProducts(
    marketplaceId?: string,
    maxPages?: number
  ): Promise<AmazonSPApi.FBASmallAndLight.SmallAndLightEnrollment[]> {
    const marketId = marketplaceId || this.marketplaceId;
    const pageLimit = maxPages || this.options.maxPages || 10;
    let currentPage = 1;
    let nextToken: string | undefined = undefined;
    const allEnrollments: AmazonSPApi.FBASmallAndLight.SmallAndLightEnrollment[] = [];
    
    do {
      const options: ListSmallAndLightProductsOptions = { 
        marketplaceId: marketId,
        nextToken,
        pageSize: this.options.pageSize
      };
      
      const response = await this.listSmallAndLightProducts(options);
      
      if (response.data.enrollments) {
        allEnrollments.push(...response.data.enrollments);
      }
      
      // Get next token for pagination
      nextToken = response.data.nextToken;
      currentPage++;
      
      // Stop if we've reached the max pages or there are no more pages
    } while(nextToken && currentPage <= pageLimit);
    
    return allEnrollments;
  }
  
  /**
   * Check if a product is eligible for the Small and Light program and return true/false
   * 
   * @param sellerSKU - The seller SKU to check
   * @param marketplaceId - The marketplace ID to check in
   * @returns Promise resolving to a boolean indicating eligibility
   */
  public async isEligibleForSmallAndLight(sellerSKU: string, marketplaceId?: string): Promise<boolean> {
    try {
      const response = await this.getSmallAndLightEligibility(sellerSKU, marketplaceId);
      return response.data.status === 'ELIGIBLE';
    } catch (error) {
      console.error(`Error checking Small and Light eligibility for ${sellerSKU}`, error);
      return false;
    }
  }
}
