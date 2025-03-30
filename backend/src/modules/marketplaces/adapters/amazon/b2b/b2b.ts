/**
 * Amazon B2B API Module
 * 
 * Implements the Amazon SP-API B2B functionality.
 * This module enables management of business-to-business operations,
 * including business pricing, quantity discounts, and tax exemption.
 */

import { BaseApiModule, ApiRequestOptions, ApiResponse } from '../core/api-module';
import { AmazonErrorUtil, AmazonErrorCode } from '../utils/amazon-error';

/**
 * Type of quantity discount tier
 */
export type QuantityDiscountType = 'PERCENT_OFF' | 'FIXED_AMOUNT_OFF';

/**
 * Status of a B2B price
 */
export type B2BPriceStatus = 'ACTIVE' | 'INACTIVE';

/**
 * Money value with currency
 */
export interface Money {
  /**
   * The currency code
   */
  currencyCode: string;
  
  /**
   * The monetary value
   */
  amount: number;
}

/**
 * Quantity discount tier
 */
export interface QuantityDiscountTier {
  /**
   * Minimum quantity for this tier
   */
  minimumQuantity: number;
  
  /**
   * Maximum quantity for this tier (optional, no upper limit if not provided)
   */
  maximumQuantity?: number;
  
  /**
   * Type of discount
   */
  discountType: QuantityDiscountType;
  
  /**
   * Discount amount
   */
  discountAmount: number;
}

/**
 * B2B Price
 */
export interface B2BPrice {
  /**
   * The ASIN of the product
   */
  asin?: string;
  
  /**
   * The SKU of the product
   */
  sku?: string;
  
  /**
   * Business price
   */
  businessPrice: Money;
  
  /**
   * Quantity price tiers (optional)
   */
  quantityPriceTiers?: QuantityDiscountTier[];
  
  /**
   * Status of the price
   */
  status: B2BPriceStatus;
  
  /**
   * Whether to allow further discounts
   */
  allowFurtherDiscounts?: boolean;
}

/**
 * Tax exemption certificate
 */
export interface TaxExemptionCertificate {
  /**
   * Certificate ID
   */
  certificateId: string;
  
  /**
   * Business name
   */
  businessName: string;
  
  /**
   * Certificate type
   */
  certificateType: string;
  
  /**
   * Certificate status
   */
  status: 'ACTIVE' | 'INVALID' | 'EXPIRED' | 'REVOKED';
  
  /**
   * Expiry date (ISO8601 format)
   */
  expiryDate: string;
  
  /**
   * Issue date (ISO8601 format)
   */
  issueDate: string;
  
  /**
   * Certificate document URL
   */
  documentUrl?: string;
}

/**
 * B2B order tax exemption information
 */
export interface B2BOrderTaxInfo {
  /**
   * Order ID
   */
  amazonOrderId: string;
  
  /**
   * Certificate ID used for the order
   */
  certificateId?: string;
  
  /**
   * Tax exemption applied
   */
  taxExemptionApplied: boolean;
  
  /**
   * Exemption type
   */
  exemptionType?: string;
  
  /**
   * Exemption amount
   */
  exemptionAmount?: Money;
}

/**
 * Status of a B2B offer
 */
export type B2BOfferStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ENDED';

/**
 * B2B offer
 */
export interface B2BSpecialOffer {
  /**
   * Offer ID
   */
  offerId: string;
  
  /**
   * Seller SKU
   */
  sellerSku: string;
  
  /**
   * ASIN
   */
  asin?: string;
  
  /**
   * Condition
   */
  condition: string;
  
  /**
   * Offer title
   */
  title: string;
  
  /**
   * Offer description
   */
  description?: string;
  
  /**
   * Discounted price
   */
  discountedPrice: Money;
  
  /**
   * Minimum quantity
   */
  minimumQuantity: number;
  
  /**
   * Maximum quantity
   */
  maximumQuantity?: number;
  
  /**
   * Start date (ISO8601 format)
   */
  startDate: string;
  
  /**
   * End date (ISO8601 format)
   */
  endDate?: string;
  
  /**
   * Status of the offer
   */
  status: B2BOfferStatus;
  
  /**
   * Target customer groups
   */
  targetCustomerGroups?: string[];
}

/**
 * B2B Customer group
 */
export interface B2BCustomerGroup {
  /**
   * Group ID
   */
  groupId: string;
  
  /**
   * Group name
   */
  name: string;
  
  /**
   * Group description
   */
  description?: string;
  
  /**
   * Number of customers in the group
   */
  customerCount: number;
  
  /**
   * Creation date (ISO8601 format)
   */
  creationDate: string;
  
  /**
   * Last modified date (ISO8601 format)
   */
  lastModifiedDate: string;
}

/**
 * Response format for getting B2B Prices
 */
export interface GetB2BPricesResponse {
  /**
   * Array of B2B Prices
   */
  prices: B2BPrice[];
  
  /**
   * Token for retrieving the next page
   */
  nextToken?: string;
}

/**
 * Options for getting B2B prices
 */
export interface GetB2BPricesOptions {
  /**
   * List of ASINs to filter by
   */
  asins?: string[];
  
  /**
   * List of SKUs to filter by
   */
  skus?: string[];
  
  /**
   * Whether to include inactive prices
   */
  includeInactive?: boolean;
  
  /**
   * Next token for pagination
   */
  nextToken?: string;
  
  /**
   * Maximum number of results to return
   */
  maxResults?: number;
}

/**
 * Response format for getting tax exemption certificates
 */
export interface GetTaxExemptionCertificatesResponse {
  /**
   * Array of tax exemption certificates
   */
  certificates: TaxExemptionCertificate[];
  
  /**
   * Token for retrieving the next page
   */
  nextToken?: string;
}

/**
 * Options for getting tax exemption certificates
 */
export interface GetTaxExemptionCertificatesOptions {
  /**
   * Customer ID to filter by
   */
  customerId?: string;
  
  /**
   * Status to filter by
   */
  status?: 'ACTIVE' | 'INVALID' | 'EXPIRED' | 'REVOKED';
  
  /**
   * Next token for pagination
   */
  nextToken?: string;
  
  /**
   * Maximum number of results to return
   */
  maxResults?: number;
}

/**
 * Response format for getting B2B offers
 */
export interface GetB2BOffersResponse {
  /**
   * Array of B2B offers
   */
  offers: B2BSpecialOffer[];
  
  /**
   * Token for retrieving the next page
   */
  nextToken?: string;
}

/**
 * Options for getting B2B offers
 */
export interface GetB2BOffersOptions {
  /**
   * Status to filter by
   */
  status?: B2BOfferStatus;
  
  /**
   * List of SKUs to filter by
   */
  skus?: string[];
  
  /**
   * Next token for pagination
   */
  nextToken?: string;
  
  /**
   * Maximum number of results to return
   */
  maxResults?: number;
}

/**
 * Options for creating a B2B price
 */
export interface CreateB2BPriceOptions {
  /**
   * ASIN of the product (required if SKU not provided)
   */
  asin?: string;
  
  /**
   * SKU of the product (required if ASIN not provided)
   */
  sku?: string;
  
  /**
   * Business price
   */
  businessPrice: Money;
  
  /**
   * Quantity price tiers (optional)
   */
  quantityPriceTiers?: QuantityDiscountTier[];
  
  /**
   * Allow further discounts
   */
  allowFurtherDiscounts?: boolean;
}

/**
 * Response format for creating a B2B price
 */
export interface CreateB2BPriceResponse {
  /**
   * ASIN of the product
   */
  asin?: string;
  
  /**
   * SKU of the product
   */
  sku?: string;
  
  /**
   * Status of the price
   */
  status: B2BPriceStatus;
}

/**
 * Options for creating a B2B offer
 */
export interface CreateB2BOfferOptions {
  /**
   * Seller SKU
   */
  sellerSku: string;
  
  /**
   * Offer title
   */
  title: string;
  
  /**
   * Offer description
   */
  description?: string;
  
  /**
   * Discounted price
   */
  discountedPrice: Money;
  
  /**
   * Minimum quantity
   */
  minimumQuantity: number;
  
  /**
   * Maximum quantity
   */
  maximumQuantity?: number;
  
  /**
   * Start date (ISO8601 format)
   */
  startDate: string;
  
  /**
   * End date (ISO8601 format)
   */
  endDate?: string;
  
  /**
   * Target customer groups
   */
  targetCustomerGroups?: string[];
}

/**
 * Response format for creating a B2B offer
 */
export interface CreateB2BOfferResponse {
  /**
   * Offer ID
   */
  offerId: string;
  
  /**
   * Status of the offer
   */
  status: B2BOfferStatus;
}

/**
 * Options for uploading a tax exemption certificate
 */
export interface UploadTaxExemptionCertificateOptions {
  /**
   * Customer ID
   */
  customerId: string;
  
  /**
   * Business name
   */
  businessName: string;
  
  /**
   * Certificate type
   */
  certificateType: string;
  
  /**
   * Expiry date (ISO8601 format)
   */
  expiryDate: string;
  
  /**
   * Certificate document (base64 encoded)
   */
  certificateDocument: string;
}

/**
 * Response format for uploading a tax exemption certificate
 */
export interface UploadTaxExemptionCertificateResponse {
  /**
   * Certificate ID
   */
  certificateId: string;
  
  /**
   * Certificate status
   */
  status: 'ACTIVE' | 'INVALID' | 'EXPIRED' | 'REVOKED';
}

/**
 * Options for getting B2B customer groups
 */
export interface GetB2BCustomerGroupsOptions {
  /**
   * Next token for pagination
   */
  nextToken?: string;
  
  /**
   * Maximum number of results to return
   */
  maxResults?: number;
}

/**
 * Response format for getting B2B customer groups
 */
export interface GetB2BCustomerGroupsResponse {
  /**
   * Array of B2B customer groups
   */
  customerGroups: B2BCustomerGroup[];
  
  /**
   * Token for retrieving the next page
   */
  nextToken?: string;
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
   * @returns Promise<any> that resolves when initialization is complete
   */
  protected async initializeModule(config?: any): Promise<void> {
    // No specific initialization required for this module
    return Promise<any>.resolve();
  }
  
  /**
   * Get B2B prices
   * @param options Options for getting B2B prices
   * @returns B2B prices
   */
  public async getB2BPrices(
    options: GetB2BPricesOptions = {}
  ): Promise<ApiResponse<GetB2BPricesResponse>> {
    const params: Record<string, any> = {
      marketplaceId: this.marketplaceId
    };
    
    if (options.asins && options.asins.length > 0) {
      params.asins = options.asins.join(',');
    }
    
    if (options.skus && options.skus.length > 0) {
      params.skus = options.skus.join(',');
    }
    
    if (options.includeInactive !== undefined) {
      params.includeInactive = options.includeInactive;
    }
    
    if (options.nextToken) {
      params.nextToken = options.nextToken;
    }
    
    if (options.maxResults) {
      params.maxResults = options.maxResults;
    }
    
    try {
      return await this.makeRequest<GetB2BPricesResponse>({
        method: 'GET',
        path: '/prices',
        params
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.getB2BPrices`
      );
    }
  }
  
  /**
   * Create or update a B2B price
   * @param options Options for creating a B2B price
   * @returns B2B price creation response
   */
  public async createB2BPrice(
    options: CreateB2BPriceOptions
  ): Promise<ApiResponse<CreateB2BPriceResponse>> {
    if (!options.asin && !options.sku) {
      throw AmazonErrorUtil.createError(
        'Either ASIN or SKU is required to create a B2B price',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.businessPrice) {
      throw AmazonErrorUtil.createError(
        'Business price is required to create a B2B price',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<CreateB2BPriceResponse>({
        method: 'POST',
        path: '/prices',
        data: {
          asin: options.asin,
          sku: options.sku,
          businessPrice: options.businessPrice,
          quantityPriceTiers: options.quantityPriceTiers,
          allowFurtherDiscounts: options.allowFurtherDiscounts
        },
        params: {
          marketplaceId: this.marketplaceId
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.createB2BPrice`
      );
    }
  }
  
  /**
   * Delete a B2B price
   * @param identifier ASIN or SKU identifier
   * @param identifierType Type of identifier ('ASIN' or 'SKU')
   * @returns Empty response
   */
  public async deleteB2BPrice(
    identifier: string,
    identifierType: 'ASIN' | 'SKU'
  ): Promise<ApiResponse<void>> {
    if (!identifier) {
      throw AmazonErrorUtil.createError(
        'Identifier is required to delete a B2B price',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!identifierType) {
      throw AmazonErrorUtil.createError(
        'Identifier type is required to delete a B2B price',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<void>({
        method: 'DELETE',
        path: '/prices',
        params: {
          marketplaceId: this.marketplaceId,
          [identifierType.toLowerCase()]: identifier
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.deleteB2BPrice`
      );
    }
  }
  
  /**
   * Get tax exemption certificates
   * @param options Options for getting tax exemption certificates
   * @returns Tax exemption certificates
   */
  public async getTaxExemptionCertificates(
    options: GetTaxExemptionCertificatesOptions = {}
  ): Promise<ApiResponse<GetTaxExemptionCertificatesResponse>> {
    const params: Record<string, any> = {
      marketplaceId: this.marketplaceId
    };
    
    if (options.customerId) {
      params.customerId = options.customerId;
    }
    
    if (options.status) {
      params.status = options.status;
    }
    
    if (options.nextToken) {
      params.nextToken = options.nextToken;
    }
    
    if (options.maxResults) {
      params.maxResults = options.maxResults;
    }
    
    try {
      return await this.makeRequest<GetTaxExemptionCertificatesResponse>({
        method: 'GET',
        path: '/tax-exemption/certificates',
        params
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.getTaxExemptionCertificates`
      );
    }
  }
  
  /**
   * Upload a tax exemption certificate
   * @param options Options for uploading a tax exemption certificate
   * @returns Upload response
   */
  public async uploadTaxExemptionCertificate(
    options: UploadTaxExemptionCertificateOptions
  ): Promise<ApiResponse<UploadTaxExemptionCertificateResponse>> {
    if (!options.customerId) {
      throw AmazonErrorUtil.createError(
        'Customer ID is required to upload a tax exemption certificate',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.businessName) {
      throw AmazonErrorUtil.createError(
        'Business name is required to upload a tax exemption certificate',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.certificateType) {
      throw AmazonErrorUtil.createError(
        'Certificate type is required to upload a tax exemption certificate',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.expiryDate) {
      throw AmazonErrorUtil.createError(
        'Expiry date is required to upload a tax exemption certificate',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.certificateDocument) {
      throw AmazonErrorUtil.createError(
        'Certificate document is required to upload a tax exemption certificate',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<UploadTaxExemptionCertificateResponse>({
        method: 'POST',
        path: '/tax-exemption/certificates',
        data: {
          customerId: options.customerId,
          businessName: options.businessName,
          certificateType: options.certificateType,
          expiryDate: options.expiryDate,
          certificateDocument: options.certificateDocument
        },
        params: {
          marketplaceId: this.marketplaceId
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.uploadTaxExemptionCertificate`
      );
    }
  }
  
  /**
   * Get B2B order tax information
   * @param amazonOrderId Amazon order ID
   * @returns B2B order tax information
   */
  public async getB2BOrderTaxInfo(
    amazonOrderId: string
  ): Promise<ApiResponse<B2BOrderTaxInfo>> {
    if (!amazonOrderId) {
      throw AmazonErrorUtil.createError(
        'Amazon order ID is required to get B2B order tax information',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<B2BOrderTaxInfo>({
        method: 'GET',
        path: `/orders/${amazonOrderId}/tax-info`,
        params: {
          marketplaceId: this.marketplaceId
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.getB2BOrderTaxInfo`
      );
    }
  }
  
  /**
   * Get B2B offers
   * @param options Options for getting B2B offers
   * @returns B2B offers
   */
  public async getB2BOffers(
    options: GetB2BOffersOptions = {}
  ): Promise<ApiResponse<GetB2BOffersResponse>> {
    const params: Record<string, any> = {
      marketplaceId: this.marketplaceId
    };
    
    if (options.status) {
      params.status = options.status;
    }
    
    if (options.skus && options.skus.length > 0) {
      params.skus = options.skus.join(',');
    }
    
    if (options.nextToken) {
      params.nextToken = options.nextToken;
    }
    
    if (options.maxResults) {
      params.maxResults = options.maxResults;
    }
    
    try {
      return await this.makeRequest<GetB2BOffersResponse>({
        method: 'GET',
        path: '/offers',
        params
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.getB2BOffers`
      );
    }
  }
  
  /**
   * Create a B2B offer
   * @param options Options for creating a B2B offer
   * @returns B2B offer creation response
   */
  public async createB2BOffer(
    options: CreateB2BOfferOptions
  ): Promise<ApiResponse<CreateB2BOfferResponse>> {
    if (!options.sellerSku) {
      throw AmazonErrorUtil.createError(
        'Seller SKU is required to create a B2B offer',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.title) {
      throw AmazonErrorUtil.createError(
        'Title is required to create a B2B offer',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.discountedPrice) {
      throw AmazonErrorUtil.createError(
        'Discounted price is required to create a B2B offer',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.minimumQuantity) {
      throw AmazonErrorUtil.createError(
        'Minimum quantity is required to create a B2B offer',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.startDate) {
      throw AmazonErrorUtil.createError(
        'Start date is required to create a B2B offer',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<CreateB2BOfferResponse>({
        method: 'POST',
        path: '/offers',
        data: {
          sellerSku: options.sellerSku,
          title: options.title,
          description: options.description,
          discountedPrice: options.discountedPrice,
          minimumQuantity: options.minimumQuantity,
          maximumQuantity: options.maximumQuantity,
          startDate: options.startDate,
          endDate: options.endDate,
          targetCustomerGroups: options.targetCustomerGroups
        },
        params: {
          marketplaceId: this.marketplaceId
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.createB2BOffer`
      );
    }
  }
  
  /**
   * Delete a B2B offer
   * @param offerId Offer ID
   * @returns Empty response
   */
  public async deleteB2BOffer(
    offerId: string
  ): Promise<ApiResponse<void>> {
    if (!offerId) {
      throw AmazonErrorUtil.createError(
        'Offer ID is required to delete a B2B offer',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<void>({
        method: 'DELETE',
        path: `/offers/${offerId}`,
        params: {
          marketplaceId: this.marketplaceId
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.deleteB2BOffer`
      );
    }
  }
  
  /**
   * Get B2B customer groups
   * @param options Options for getting B2B customer groups
   * @returns B2B customer groups
   */
  public async getB2BCustomerGroups(
    options: GetB2BCustomerGroupsOptions = {}
  ): Promise<ApiResponse<GetB2BCustomerGroupsResponse>> {
    const params: Record<string, any> = {
      marketplaceId: this.marketplaceId
    };
    
    if (options.nextToken) {
      params.nextToken = options.nextToken;
    }
    
    if (options.maxResults) {
      params.maxResults = options.maxResults;
    }
    
    try {
      return await this.makeRequest<GetB2BCustomerGroupsResponse>({
        method: 'GET',
        path: '/customer-groups',
        params
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(
        error,
        `${this.moduleName}.getB2BCustomerGroups`
      );
    }
  }
  
  /**
   * Create a tiered pricing structure for a product
   * @param sku Product SKU
   * @param basePrice Base business price
   * @param tiers Array of quantity discount tiers
   * @returns B2B price creation response
   */
  public async createTieredPricing(
    sku: string,
    basePrice: { amount: number, currencyCode: string },
    tiers: Array<{
      minimumQuantity: number,
      discountPercent: number
    }>
  ): Promise<ApiResponse<CreateB2BPriceResponse>> {
    // Convert tiers to the format expected by the API
    const quantityPriceTiers: QuantityDiscountTier[] = tiers.map((tier, index) => {
      return {
        minimumQuantity: tier.minimumQuantity,
        // Set maximum quantity for all tiers except the last one
        maximumQuantity: index < tiers.length - 1 ? tiers[index + 1].minimumQuantity - 1 : undefined,
        discountType: 'PERCENT_OFF',
        discountAmount: tier.discountPercent
      };
    });
    
    // Create the B2B price
    return this.createB2BPrice({
      sku,
      businessPrice: basePrice,
      quantityPriceTiers,
      allowFurtherDiscounts: true
    });
  }
  
  /**
   * Get all B2B prices (handles pagination)
   * @param options Options for getting B2B prices
   * @param maxPages Maximum number of pages to retrieve (default: 10)
   * @returns All B2B prices
   */
  public async getAllB2BPrices(
    options: GetB2BPricesOptions = {},
    maxPages: number = 10
  ): Promise<B2BPrice[]> {
    const allPrices: B2BPrice[] = [];
    let nextToken: string | undefined = options.nextToken;
    let currentPage = 1;
    
    do {
      // Update options with next token
      const pageOptions: GetB2BPricesOptions = {
        ...options,
        nextToken
      };
      
      // Get the current page of prices
      const response = await this.getB2BPrices(pageOptions);
      
      // Add prices to our collection
      if (response.data.prices && response.data.prices.length > 0) {
        allPrices.push(...response.data.prices);
      }
      
      // Update the next token
      nextToken = response.data.nextToken;
      currentPage++;
      
      // Stop if we've reached the maximum number of pages or there are no more pages
    } while (nextToken && currentPage <= maxPages);
    
    return allPrices;
  }
  
  /**
   * Get all tax exemption certificates (handles pagination)
   * @param options Options for getting tax exemption certificates
   * @param maxPages Maximum number of pages to retrieve (default: 10)
   * @returns All tax exemption certificates
   */
  public async getAllTaxExemptionCertificates(
    options: GetTaxExemptionCertificatesOptions = {},
    maxPages: number = 10
  ): Promise<TaxExemptionCertificate[]> {
    const allCertificates: TaxExemptionCertificate[] = [];
    let nextToken: string | undefined = options.nextToken;
    let currentPage = 1;
    
    do {
      // Update options with next token
      const pageOptions: GetTaxExemptionCertificatesOptions = {
        ...options,
        nextToken
      };
      
      // Get the current page of certificates
      const response = await this.getTaxExemptionCertificates(pageOptions);
      
      // Add certificates to our collection
      if (response.data.certificates && response.data.certificates.length > 0) {
        allCertificates.push(...response.data.certificates);
      }
      
      // Update the next token
      nextToken = response.data.nextToken;
      currentPage++;
      
      // Stop if we've reached the maximum number of pages or there are no more pages
    } while (nextToken && currentPage <= maxPages);
    
    return allCertificates;
  }
}