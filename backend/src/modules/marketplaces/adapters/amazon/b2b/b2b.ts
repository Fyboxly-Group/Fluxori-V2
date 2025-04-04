/**
 * Amazon B2B API Module
 * 
 * Implements the Amazon SP-API B2B functionality.
 * This module enables access to business-to-business specific features available
 * in Amazon Business marketplaces.
 */

import { BaseApiModule } from '../core/api-module';
import { AmazonErrorUtil } from '../utils/amazon-error';
import { PaginatedResponse } from '../core/api-types';

/**
 * Response for B2B pricing tier query
 */
export interface B2BPricingResponse {
  /**
   * Status of the pricing tier query
   */
  status: string;

  /**
   * List of available pricing tiers
   */
  priceTiers: B2BPriceTier[];
}

/**
 * B2B price tier structure for quantity-based discounts
 */
export interface B2BPriceTier {
  /**
   * Tier number (1, 2, 3, etc.)
   */
  tierNumber: number;

  /**
   * Minimum quantity to qualify for this tier
   */
  minimumQuantity: number;

  /**
   * Maximum quantity allowed for this tier (optional)
   */
  maximumQuantity?: number;

  /**
   * Price for this tier
   */
  price: {
    /**
     * Currency code (e.g., "USD")
     */
    currencyCode: string;

    /**
     * Amount as a decimal string
     */
    amount: string;
  };

  /**
   * Discount percentage from standard price (optional)
   */
  discountPercent?: number;
}

/**
 * Response for B2B quantity discount eligibility query
 */
export interface B2BQuantityDiscountEligibilityResponse {
  /**
   * Whether the ASIN is eligible for quantity discounts
   */
  isEligibleForQuantityDiscount: boolean;

  /**
   * List of reasons for ineligibility, if any
   */
  ineligibilityReasons?: string[];
}

/**
 * Response for B2B restricted buying eligibility
 */
export interface B2BRestrictedBuyingResponse {
  /**
   * Whether the ASIN is restricted to specific business customers
   */
  isRestrictedToBusiness: boolean;

  /**
   * List of business types that can purchase this product
   */
  restrictedBusinessTypes?: string[];

  /**
   * Whether the ASIN is restricted to specific business customers
   */
  isRestrictedToBusinessCustomers: boolean;

  /**
   * List of business customer types that can purchase this product
   */
  restrictedCustomerTypes?: string[];
}

/**
 * B2B Order approvals configuration
 */
export interface B2BApprovalSettings {
  /**
   * Whether order approvals are enabled
   */
  isApprovalRequired: boolean;

  /**
   * Approval threshold amount
   */
  approvalThreshold?: {
    /**
     * Currency code (e.g., "USD")
     */
    currencyCode: string;

    /**
     * Amount as a decimal string
     */
    amount: string;
  };

  /**
   * Approvers for this B2B account
   */
  approvers?: B2BApprover[];
}

/**
 * B2B Order approver information
 */
export interface B2BApprover {
  /**
   * Approver ID
   */
  approverId: string;

  /**
   * Approver name
   */
  name: string;

  /**
   * Approver email
   */
  email: string;

  /**
   * Approver role or title
   */
  role?: string;
}

/**
 * Implementation of the Amazon B2B API
 */
export class B2BModule extends BaseApiModule {
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
    super('b2b', apiVersion, makeApiRequest, marketplaceId);
  }
  
  /**
   * Initialize the module
   * @param config Module-specific configuration
   * @returns Promise that resolves when initialization is complete
   */
  protected async initializeModule(config?: any): Promise<void> {
    // No specific initialization required for this module
    return Promise.resolve();
  }
  
  /**
   * Get B2B pricing tiers for a product
   * @param asin Amazon Standard Identification Number
   * @returns Pricing tiers available for the product
   */
  public async getPricingTiers(asin: string): Promise<B2BPricingResponse> {
    try {
      if (!asin) {
        throw AmazonErrorUtil.createError(
          'ASIN is required for getting B2B pricing tiers',
          'INVALID_INPUT'
        );
      }

      const response = await this.makeRequest<B2BPricingResponse>({
        method: 'GET',
        path: `/products/${asin}/pricing-tiers`,
        params: {
          marketplaceId: this.marketplaceId
        }
      });
      
      return response.data;
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getPricingTiers`);
    }
  }
  
  /**
   * Check if a product is eligible for quantity discounts
   * @param asin Amazon Standard Identification Number
   * @returns Eligibility status and reasons if not eligible
   */
  public async checkQuantityDiscountEligibility(
    asin: string
  ): Promise<B2BQuantityDiscountEligibilityResponse> {
    try {
      if (!asin) {
        throw AmazonErrorUtil.createError(
          'ASIN is required for checking quantity discount eligibility',
          'INVALID_INPUT'
        );
      }

      const response = await this.makeRequest<B2BQuantityDiscountEligibilityResponse>({
        method: 'GET',
        path: `/products/${asin}/quantity-discount-eligibility`,
        params: {
          marketplaceId: this.marketplaceId
        }
      });
      
      return response.data;
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.checkQuantityDiscountEligibility`);
    }
  }
  
  /**
   * Check if a product has restricted buying for business customers
   * @param asin Amazon Standard Identification Number
   * @returns Restricted buying status and restrictions if any
   */
  public async checkRestrictedBuying(
    asin: string
  ): Promise<B2BRestrictedBuyingResponse> {
    try {
      if (!asin) {
        throw AmazonErrorUtil.createError(
          'ASIN is required for checking restricted buying status',
          'INVALID_INPUT'
        );
      }

      const response = await this.makeRequest<B2BRestrictedBuyingResponse>({
        method: 'GET',
        path: `/products/${asin}/restricted-buying`,
        params: {
          marketplaceId: this.marketplaceId
        }
      });
      
      return response.data;
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.checkRestrictedBuying`);
    }
  }
  
  /**
   * Get B2B price breaks for a list of ASINs
   * @param asins List of Amazon Standard Identification Numbers
   * @returns Map of ASINs to their pricing tiers
   */
  public async getBulkPricingTiers(
    asins: string[]
  ): Promise<Record<string, B2BPricingResponse>> {
    try {
      if (!asins || asins.length === 0) {
        throw AmazonErrorUtil.createError(
          'At least one ASIN is required for bulk pricing tier lookup',
          'INVALID_INPUT'
        );
      }

      if (asins.length > 20) {
        throw AmazonErrorUtil.createError(
          'Maximum of 20 ASINs allowed per bulk pricing tier request',
          'INVALID_INPUT'
        );
      }

      const response = await this.makeRequest<Record<string, B2BPricingResponse>>({
        method: 'POST',
        path: '/products/pricing-tiers/batch',
        data: {
          asins
        },
        params: {
          marketplaceId: this.marketplaceId
        }
      });
      
      return response.data;
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getBulkPricingTiers`);
    }
  }
  
  /**
   * Get B2B order approval settings
   * @returns Current approval settings for the seller account
   */
  public async getApprovalSettings(): Promise<B2BApprovalSettings> {
    try {
      const response = await this.makeRequest<B2BApprovalSettings>({
        method: 'GET',
        path: '/settings/approvals',
        params: {
          marketplaceId: this.marketplaceId
        }
      });
      
      return response.data;
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getApprovalSettings`);
    }
  }
  
  /**
   * Update B2B order approval settings
   * @param settings New approval settings
   * @returns Updated approval settings
   */
  public async updateApprovalSettings(
    settings: B2BApprovalSettings
  ): Promise<B2BApprovalSettings> {
    try {
      if (!settings) {
        throw AmazonErrorUtil.createError(
          'Approval settings are required',
          'INVALID_INPUT'
        );
      }

      const response = await this.makeRequest<B2BApprovalSettings>({
        method: 'PUT',
        path: '/settings/approvals',
        data: settings,
        params: {
          marketplaceId: this.marketplaceId
        }
      });
      
      return response.data;
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.updateApprovalSettings`);
    }
  }
  
  /**
   * Get a list of pending B2B orders that require approval
   * @param nextToken Token for pagination
   * @param maxResults Maximum number of results to return
   * @returns List of pending orders that require approval
   */
  public async getPendingApprovals(
    nextToken?: string,
    maxResults: number = 10
  ): Promise<PaginatedResponse<any>> {
    try {
      const params: Record<string, any> = {
        marketplaceId: this.marketplaceId,
        maxResults
      };
      
      if (nextToken) {
        params.nextToken = nextToken;
      }

      const response = await this.makeRequest<{
        orders: any[];
        nextToken?: string;
      }>({
        method: 'GET',
        path: '/orders/pending-approvals',
        params
      });
      
      return {
        items: response.data.orders || [],
        nextToken: response.data.nextToken,
        pageNumber: 1,
        pageSize: maxResults.toString(),
        hasMore: !!response.data.nextToken
      };
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getPendingApprovals`);
    }
  }
  
  /**
   * Approve a pending B2B order
   * @param orderId Amazon order ID
   * @param approverNotes Optional notes from the approver
   * @returns Success status
   */
  public async approveOrder(
    orderId: string,
    approverNotes?: string
  ): Promise<{ success: boolean }> {
    try {
      if (!orderId) {
        throw AmazonErrorUtil.createError(
          'Order ID is required for approval',
          'INVALID_INPUT'
        );
      }

      const data: Record<string, any> = {};
      if (approverNotes) {
        data.approverNotes = approverNotes;
      }

      await this.makeRequest<void>({
        method: 'POST',
        path: `/orders/${orderId}/approve`,
        data,
        params: {
          marketplaceId: this.marketplaceId
        }
      });
      
      return { success: true };
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.approveOrder`);
    }
  }
  
  /**
   * Reject a pending B2B order
   * @param orderId Amazon order ID
   * @param rejectionReason Reason for rejecting the order
   * @returns Success status
   */
  public async rejectOrder(
    orderId: string,
    rejectionReason: string
  ): Promise<{ success: boolean }> {
    try {
      if (!orderId) {
        throw AmazonErrorUtil.createError(
          'Order ID is required for rejection',
          'INVALID_INPUT'
        );
      }
      
      if (!rejectionReason) {
        throw AmazonErrorUtil.createError(
          'Rejection reason is required',
          'INVALID_INPUT'
        );
      }

      await this.makeRequest<void>({
        method: 'POST',
        path: `/orders/${orderId}/reject`,
        data: {
          rejectionReason
        },
        params: {
          marketplaceId: this.marketplaceId
        }
      });
      
      return { success: true };
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.rejectOrder`);
    }
  }
}

export default B2BModule;