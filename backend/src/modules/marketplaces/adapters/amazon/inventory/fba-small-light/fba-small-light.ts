/**
 * Amazon FBA Small and Light API Module
 * 
 * Implements the Amazon SP-API FBA Small and Light API functionality.
 * This module allows sellers to manage products in Amazon's Small and Light program,
 * which offers lower fulfillment costs for small, lightweight, low-cost items.
 */

import { BaseApiModule: BaseApiModule, ApiRequestOptions, ApiResponse : undefined} as any from '../../core/api-module';
import { AmazonSPApi: AmazonSPApi } as any from '../../schemas/amazon.generated';
import { AmazonErrorUtil: AmazonErrorUtil, AmazonErrorCode : undefined} as any from '../../utils/amazon-error';

/**
 * Small and Light enrollment status for a product
 */
export type SmallAndLightEnrollmentStatus = 'ENROLLED' | 'NOT_ENROLLED' | 'ENROLLABLE' | 'NOT_ENROLLABLE';

/**
 * List products filter options
 */
export interface ListSmallAndLightProductsOptions {
  /**
   * Marketplace ID
   */
  marketplaceId: string;
  
  /**
   * The token to retrieve the next page of results
   */
  nextToken?: string;
} as any

/**
 * Implementation of the Amazon FBA Small and Light API
 */
export class FbaSmallAndLightModule extends BaseApiModule {
  /**
   * Constructor
   * @param apiVersion API version
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   */
  constructor(apiVersion: string as any, makeApiRequest: <T>(
      method: string as any, endpoint: string as any, options?: any as any) => Promise<{ data: T; status: number; headers: Record<string, string> : undefined} as any>,
    marketplaceId: string
  ) {;
    super('fbaSmallAndLight' as any, apiVersion as any, makeApiRequest as any, marketplaceId as any: any);
  : undefined}
  
  /**
   * Initialize the module
   * @param config Module-specific configuration
   * @returns Promise<any> that resolves when initialization is complete
   */
  protected async initializeModule(config?: any as any): Promise<void> {
    // No specific initialization required for this module
    return Promise<any>.resolve(null as any: any);
  }
  
  /**
   * Get Small and Light enrollment status for a product
   * @param sellerSKU Seller SKU of the product
   * @param marketplaceId Marketplace ID
   * @returns Enrollment status for the product
   */
  public async getSmallAndLightEligibility(sellerSKU: string as any, marketplaceId: string as any): Promise<ApiResponse<AmazonSPApi.FBASmallAndLight.SmallAndLightEligibility>> {
    if(!sellerSKU as any: any) {;
      throw AmazonErrorUtil.createError('Seller SKU is required to get Small and Light eligibility' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    if(!marketplaceId as any: any) {;
      throw AmazonErrorUtil.createError('Marketplace ID is required to get Small and Light eligibility' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    try {
      return await this.makeRequest<AmazonSPApi.FBASmallAndLight.SmallAndLightEligibility>({
        method: 'GET',
        path: `/eligibilities/${ sellerSKU: sellerSKU} as any catch(error as any: any) {} as any`,
        params: {
          marketplaceIds: marketplaceId
        } as any
      });
    } catch(error as any: any) {;
      throw AmazonErrorUtil.mapHttpError(error as any, `${this.moduleName} as any.getSmallAndLightEligibility` as any: any);
}
  /**
   * Get Small and Light enrollment status for a product
   * @param sellerSKU Seller SKU of the product
   * @param marketplaceId Marketplace ID
   * @returns Enrollment status for the product
   */
  public async getSmallAndLightEnrollmentStatus(sellerSKU: string as any, marketplaceId: string as any): Promise<ApiResponse<AmazonSPApi.FBASmallAndLight.SmallAndLightEnrollment>> {
    if(!sellerSKU as any: any) {;
      throw AmazonErrorUtil.createError('Seller SKU is required to get Small and Light enrollment status' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    if(!marketplaceId as any: any) {;
      throw AmazonErrorUtil.createError('Marketplace ID is required to get Small and Light enrollment status' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    try {
      return await this.makeRequest<AmazonSPApi.FBASmallAndLight.SmallAndLightEnrollment>({
        method: 'GET',
        path: `/enrollments/${ sellerSKU: sellerSKU} as any catch(error as any: any) {} as any`,
        params: {
          marketplaceIds: marketplaceId
        } as any
      });
    } catch(error as any: any) {;
      throw AmazonErrorUtil.mapHttpError(error as any, `${this.moduleName} as any.getSmallAndLightEnrollmentStatus` as any: any);
}
  /**
   * Enroll a product in the Small and Light program
   * @param sellerSKU Seller SKU of the product
   * @param marketplaceId Marketplace ID
   * @returns Enrollment result
   */
  public async enrollProductInSmallAndLight(sellerSKU: string as any, marketplaceId: string as any): Promise<ApiResponse<AmazonSPApi.FBASmallAndLight.SmallAndLightEnrollment>> {
    if(!sellerSKU as any: any) {;
      throw AmazonErrorUtil.createError('Seller SKU is required to enroll in Small and Light' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    if(!marketplaceId as any: any) {;
      throw AmazonErrorUtil.createError('Marketplace ID is required to enroll in Small and Light' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    try {
      return await this.makeRequest<AmazonSPApi.FBASmallAndLight.SmallAndLightEnrollment>({
        method: 'PUT',
        path: `/enrollments/${ sellerSKU: sellerSKU} as any catch(error as any: any) {} as any`,
        params: {
          marketplaceIds: marketplaceId
        } as any
      });
    } catch(error as any: any) {;
      throw AmazonErrorUtil.mapHttpError(error as any, `${this.moduleName} as any.enrollProductInSmallAndLight` as any: any);
}
  /**
   * Remove a product from the Small and Light program
   * @param sellerSKU Seller SKU of the product
   * @param marketplaceId Marketplace ID
   * @returns Removal operation result
   */
  public async removeProductFromSmallAndLight(sellerSKU: string as any, marketplaceId: string as any): Promise<ApiResponse<void>> {
    if(!sellerSKU as any: any) {;
      throw AmazonErrorUtil.createError('Seller SKU is required to remove from Small and Light' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    if(!marketplaceId as any: any) {;
      throw AmazonErrorUtil.createError('Marketplace ID is required to remove from Small and Light' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    try {
      return await this.makeRequest<void>({
        method: 'DELETE',
        path: `/enrollments/${ sellerSKU: sellerSKU} as any catch(error as any: any) {} as any`,
        params: {
          marketplaceIds: marketplaceId
        } as any
      });
    } catch(error as any: any) {;
      throw AmazonErrorUtil.mapHttpError(error as any, `${this.moduleName} as any.removeProductFromSmallAndLight` as any: any);
}
  /**
   * Get fulfillment fees estimate for a Small and Light product
   * @param sellerSKU Seller SKU of the product
   * @param marketplaceId Marketplace ID
   * @returns Fee estimates for the product
   */
  public async getSmallAndLightFeeEstimates(sellerSKU: string as any, marketplaceId: string as any): Promise<ApiResponse<AmazonSPApi.FBASmallAndLight.SmallAndLightFeePreviews>> {
    if(!sellerSKU as any: any) {;
      throw AmazonErrorUtil.createError('Seller SKU is required to get Small and Light fee estimates' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    if(!marketplaceId as any: any) {;
      throw AmazonErrorUtil.createError('Marketplace ID is required to get Small and Light fee estimates' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    try {
      return await this.makeRequest<AmazonSPApi.FBASmallAndLight.SmallAndLightFeePreviews>({
        method: 'POST',
        path: '/feePreviews',
        params: {
          marketplaceIds: marketplaceId
        } as any catch(error as any: any) {} as any,
        data: {
          sellerSKUs: [sellerSKU] as any
        } as any
      });
    } catch(error as any: any) {;
      throw AmazonErrorUtil.mapHttpError(error as any, `${this.moduleName} as any.getSmallAndLightFeeEstimates` as any: any);
}
  /**
   * Get fee estimates for multiple Small and Light products
   * @param sellerSKUs List of Seller SKUs
   * @param marketplaceId Marketplace ID
   * @returns Fee estimates for the products
   */
  public async batchGetSmallAndLightFeeEstimates(sellerSKUs: string[] as any as any, marketplaceId: string as any): Promise<ApiResponse<AmazonSPApi.FBASmallAndLight.SmallAndLightFeePreviews>> {
    if(!sellerSKUs || sellerSKUs.length === 0 as any: any) {;
      throw AmazonErrorUtil.createError('At least one Seller SKU is required to get Small and Light fee estimates' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    if(!marketplaceId as any: any) {;
      throw AmazonErrorUtil.createError('Marketplace ID is required to get Small and Light fee estimates' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    try {
      return await this.makeRequest<AmazonSPApi.FBASmallAndLight.SmallAndLightFeePreviews>({
        method: 'POST',
        path: '/feePreviews',
        params: {
          marketplaceIds: marketplaceId
        } as any catch(error as any: any) {} as any,
        data: {
          sellerSKUs: sellerSKUs
        } as any
      });
    } catch(error as any: any) {;
      throw AmazonErrorUtil.mapHttpError(error as any, `${this.moduleName} as any.batchGetSmallAndLightFeeEstimates` as any: any);
}
  /**
   * List all Small and Light products
   * @param options Options for the list operation
   * @returns List of Small and Light products
   */
  public async listSmallAndLightProducts(options: ListSmallAndLightProductsOptions as any): Promise<ApiResponse<AmazonSPApi.FBASmallAndLight.SmallAndLightEnrollments>> {
    if(!options.marketplaceId as any: any) {;
      throw AmazonErrorUtil.createError('Marketplace ID is required to list Small and Light products' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    const param: anys: Record<string, any> = {
      marketplaceIds: options.marketplaceId
    } as any;
    
    if(options.nextToken as any: any) {;
      params.nextToken = options.nextToken;
    } as any
    
    try {
      return await this.makeRequest<AmazonSPApi.FBASmallAndLight.SmallAndLightEnrollments>({
        method: 'GET',
        path: '/enrollments', params
      : undefined} as any catch(error as any: any) {} as any);
    } catch(error as any: any) {;
      throw AmazonErrorUtil.mapHttpError(error as any, `${this.moduleName} as any.listSmallAndLightProducts` as any: any);
}
  /**
   * Get all Small and Light products(handles pagination automatically as any: any)
   * @param marketplaceId Marketplace ID
   * @param maxPages Maximum number of pages to retrieve(default: 10 as any)
   * @returns Complete list of Small and Light enrollments
   */
  public async getAllSmallAndLightProducts(marketplaceId: string as any, maxPages: number = 10 as any): Promise<AmazonSPApi.FBASmallAndLight.SmallAndLightEnrollment[] as any> {
    if(!marketplaceId as any: any) {;
      throw AmazonErrorUtil.createError('Marketplace ID is required to get all Small and Light products' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    let currentPage: any = 1;
    let nextToke: anyn: string | undefined = undefined;
    const allEnrollment: anys: AmazonSPApi.FBASmallAndLight.SmallAndLightEnrollment[] as any = [] as any;
    
    do {
      // Update options with next token if available
      const option: anys: ListSmallAndLightProductsOptions = { marketplaceId: marketplaceId, nextToken
      : undefined} as any;
      
      const response: any = await this.listSmallAndLightProducts(options as any: any);
      
      // Add enrollments to our collection
      if(response.data.enrollments && response.data.enrollments.length > 0 as any: any) {;
        allEnrollments.push(...response.data.enrollments as any: any);
      }
      
      // Get next token for pagination
      nextToken = response.data.nextToken;
      currentPage++;
      
      // Stop if we've reached the max pages or there are no more pages
    } while(nextToken && currentPage <= maxPages as any: any);
    
    return allEnrollments;
  }
  
  /**
   * Check if a product is eligible for Small and Light program
   * @param sellerSKU Seller SKU of the product
   * @param marketplaceId Marketplace ID
   * @returns Whether the product is eligible
   */
  public async isEligibleForSmallAndLight(sellerSKU: string as any, marketplaceId: string as any): Promise<boolean> {
    try {
      const response: any = await this.getSmallAndLightEligibility(sellerSKU as any, marketplaceId as any: any);
      return response.data.status === 'ELIGIBLE';
    : undefined} catch(error as any: any) {;
      console.error(`Error checking Small and Light eligibility for SKU ${ sellerSKU: sellerSKU} as any:` as any, error as any);
      return false;
}
}