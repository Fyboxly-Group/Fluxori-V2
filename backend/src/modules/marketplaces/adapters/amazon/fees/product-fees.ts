/**
 * Amazon Product Fees API Module
 * 
 * Implements the Amazon SP-API Product Fees API functionality.
 * This module handles retrieving and calculating fee estimates for products.
 */

import { ApiRequestFunction, ApiResponse, BaseModule } from '../../../core/base-module.interface';
import AmazonErrorHandler, { AmazonErrorCode } from '../../../utils/amazon-error';

/**
 * Fee type enumeration
 */
export enum FeeType {
  REFERRAL_FEE = 'ReferralFee',
  VARIABLE_CLOSING_FEE = 'VariableClosingFee',
  PER_ITEM_FEE = 'PerItemFee',
  FBA_FEES = 'FBAFees',
  FBA_STORAGE_FEE = 'FBAStorageFee',
  FBA_FULFILLMENT_FEE = 'FBAFulfillmentFee'
}

/**
 * Fee request item identifier
 */
export interface FeeRequestIdentifier {
  /**
   * ASIN to get fees for
   */
  asin?: string;
  
  /**
   * SKU to get fees for
   */
  sku?: string;
}

/**
 * Price to apply to the fee request
 */
export interface FeeRequestPrice {
  /**
   * Listing price amount
   */
  listingPrice: {
    /**
     * Price amount
     */
    amount: number;
    
    /**
     * Currency code
     */
    currencyCode: string;
  };
  
  /**
   * Shipping price amount
   */
  shipping?: {
    /**
     * Price amount
     */
    amount: number;
    
    /**
     * Currency code
     */
    currencyCode: string;
  };
}

/**
 * Optional fulfillment program type
 */
export type FulfillmentProgramType = 'FBA_CORE' | 'FBA_SNL' | 'FBA_EFN';

/**
 * Product fee request
 */
export interface FeeRequest {
  /**
   * Marketplace ID
   */
  marketplaceId?: string;
  
  /**
   * Item identifier (ASIN or SKU)
   */
  identifier: FeeRequestIdentifier;
  
  /**
   * Whether to check if the product is eligible for FBA
   */
  isAmazonFulfilled?: boolean;
  
  /**
   * Price to use for fee calculation
   */
  price?: FeeRequestPrice;
  
  /**
   * Optional fee types to include
   */
  optionalFulfillmentProgram?: FulfillmentProgramType;
}

/**
 * Money amount with currency
 */
export interface MoneyAmount {
  /**
   * Amount value
   */
  amount: number;
  
  /**
   * Currency code
   */
  currencyCode: string;
}

/**
 * Included fee detail
 */
export interface IncludedFeeDetail {
  /**
   * Fee type
   */
  feeType: string;
  
  /**
   * Fee amount
   */
  feeAmount: MoneyAmount;
}

/**
 * Fee detail
 */
export interface FeeDetail {
  /**
   * Fee type
   */
  feeType: string;
  
  /**
   * Fee amount
   */
  feeAmount: MoneyAmount;
  
  /**
   * Fee promotion
   */
  feePromotion?: MoneyAmount;
  
  /**
   * Final fee
   */
  finalFee: MoneyAmount;
  
  /**
   * Additional details
   */
  includedFeeDetailList?: IncludedFeeDetail[];
}

/**
 * Fee estimate
 */
export interface FeeEstimate {
  /**
   * Time of the estimate
   */
  timeOfFeesEstimation: string;
  
  /**
   * Total fee estimate
   */
  totalFeesEstimate: MoneyAmount;
  
  /**
   * Fee detail list
   */
  feeDetailList: FeeDetail[];
}

/**
 * Error in the API response
 */
export interface AmazonError {
  /**
   * Error code
   */
  code: string;
  
  /**
   * Error message
   */
  message: string;
  
  /**
   * Error details
   */
  details?: string;
}

/**
 * Fee estimate response status
 */
export type FeeEstimateStatus = 'Success' | 'ClientError' | 'ServiceError';

/**
 * Fee estimate response
 */
export interface FeeEstimateResponse {
  /**
   * Fee estimate
   */
  feeEstimate?: FeeEstimate;
  
  /**
   * Status
   */
  status?: FeeEstimateStatus;
  
  /**
   * Error
   */
  error?: AmazonError;
}

/**
 * Fee estimate batch response
 */
export interface FeeEstimateBatchResponse {
  /**
   * Response payload
   */
  payload: FeeEstimateResponse[];
}

/**
 * Profit estimate result
 */
export interface ProfitEstimate {
  /**
   * Selling price
   */
  price: number;
  
  /**
   * Product cost
   */
  cost: number;
  
  /**
   * Total fees
   */
  totalFees: number;
  
  /**
   * Profit amount
   */
  profit: number;
  
  /**
   * Profit margin percentage
   */
  profitMargin: number;
  
  /**
   * Return on investment percentage
   */
  roi: number;
  
  /**
   * Breakdown of individual fees
   */
  feeBreakdown: Record<string, number>;
}

/**
 * Product fees module options
 */
export interface ProductFeesModuleOptions {
  /**
   * Default currency code to use if not specified
   */
  defaultCurrencyCode?: string;
  
  /**
   * Maximum batch size for fee requests
   */
  maxBatchSize?: number;
}

/**
 * Implementation of the Amazon Product Fees API
 */
export class ProductFeesModule implements BaseModule<ProductFeesModuleOptions> {
  /**
   * The unique identifier for this module
   */
  public readonly moduleId: string = 'productFees';
  
  /**
   * The human-readable name of this module
   */
  public readonly moduleName: string = 'Product Fees';
  
  /**
   * The base URL path for API requests
   */
  public readonly basePath: string = '/products/fees/v0';
  
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
  public readonly options: ProductFeesModuleOptions = {
    defaultCurrencyCode: 'USD',
    maxBatchSize: 20
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
    options?: ProductFeesModuleOptions
  ) {
    this.apiVersion = apiVersion;
    this.apiRequest = apiRequest;
    this.marketplaceId = marketplaceId;
    
    if (options) {
      this.options = {
        ...this.options,
        ...options
      };
    }
  }
  
  /**
   * Get fee estimates for a list of products
   * @param feeRequests List of fee requests
   * @returns Fee estimates
   */
  public async getFeeEstimates(
    feeRequests: FeeRequest[]
  ): Promise<FeeEstimateResponse[]> {
    if (!feeRequests || feeRequests.length === 0) {
      throw AmazonErrorHandler.createError(
        'At least one fee request is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Ensure each fee request has a marketplace ID
    const requestsWithMarketplace = feeRequests.map(request => ({
      ...request,
      marketplaceId: request.marketplaceId || this.marketplaceId
    }));
    
    // Split requests into batches of maxBatchSize
    const maxBatchSize = this.options.maxBatchSize || 20;
    const batches: FeeRequest[][] = [];
    
    for (let i = 0; i < requestsWithMarketplace.length; i += maxBatchSize) {
      batches.push(requestsWithMarketplace.slice(i, i + maxBatchSize));
    }
    
    try {
      // Process each batch and collect results
      const results: FeeEstimateResponse[] = [];
      
      for (const batch of batches) {
        const response = await this.apiRequest<FeeEstimateBatchResponse>(
          `${this.basePath}/feesEstimate`,
          'POST',
          {
            FeesEstimateRequest: batch
          }
        );
        
        if (response.data?.payload) {
          results.push(...response.data.payload);
        }
      }
      
      return results;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED) 
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Get fee estimate for a single product by ASIN
   * @param asin ASIN of the product
   * @param price Price to use for fee calculation
   * @param isAmazonFulfilled Whether the product is fulfilled by Amazon
   * @param marketplaceId Marketplace ID (defaults to the current marketplace)
   * @returns Fee estimate
   */
  public async getFeeEstimateByAsin(
    asin: string, 
    price: number, 
    isAmazonFulfilled = true, 
    marketplaceId?: string
  ): Promise<FeeEstimateResponse> {
    if (!asin) {
      throw AmazonErrorHandler.createError(
        'ASIN is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (price <= 0) {
      throw AmazonErrorHandler.createError(
        'Price must be greater than 0',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Create a fee request for the ASIN
    const feeRequest: FeeRequest = {
      marketplaceId: marketplaceId || this.marketplaceId,
      identifier: { asin },
      isAmazonFulfilled,
      price: {
        listingPrice: {
          amount: price,
          currencyCode: this.options.defaultCurrencyCode || 'USD'
        }
      }
    };
    
    // Get the fee estimate
    const response = await this.getFeeEstimates([feeRequest]);
    
    // Return the first (and only) fee estimate
    return response[0] || {
      status: 'ClientError',
      error: {
        code: 'NOT_FOUND',
        message: 'No fee estimate returned'
      }
    };
  }
  
  /**
   * Get fee estimate for a single product by SKU
   * @param sku SKU of the product
   * @param price Price to use for fee calculation
   * @param isAmazonFulfilled Whether the product is fulfilled by Amazon
   * @param marketplaceId Marketplace ID (defaults to the current marketplace)
   * @returns Fee estimate
   */
  public async getFeeEstimateBySku(
    sku: string, 
    price: number, 
    isAmazonFulfilled = true, 
    marketplaceId?: string
  ): Promise<FeeEstimateResponse> {
    if (!sku) {
      throw AmazonErrorHandler.createError(
        'SKU is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (price <= 0) {
      throw AmazonErrorHandler.createError(
        'Price must be greater than 0',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Create a fee request for the SKU
    const feeRequest: FeeRequest = {
      marketplaceId: marketplaceId || this.marketplaceId,
      identifier: { sku },
      isAmazonFulfilled,
      price: {
        listingPrice: {
          amount: price,
          currencyCode: this.options.defaultCurrencyCode || 'USD'
        }
      }
    };
    
    // Get the fee estimate
    const response = await this.getFeeEstimates([feeRequest]);
    
    // Return the first (and only) fee estimate
    return response[0] || {
      status: 'ClientError',
      error: {
        code: 'NOT_FOUND',
        message: 'No fee estimate returned'
      }
    };
  }
  
  /**
   * Get fee estimates for multiple products by ASIN
   * @param asinPriceMap Map of ASIN to price
   * @param isAmazonFulfilled Whether the products are fulfilled by Amazon
   * @param marketplaceId Marketplace ID (defaults to the current marketplace)
   * @returns Map of ASIN to fee estimate
   */
  public async getFeeEstimatesForAsins(
    asinPriceMap: Record<string, number>, 
    isAmazonFulfilled = true, 
    marketplaceId?: string
  ): Promise<Record<string, FeeEstimateResponse>> {
    const asins = Object.keys(asinPriceMap);
    
    if (asins.length === 0) {
      throw AmazonErrorHandler.createError(
        'At least one ASIN is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Create fee requests for each ASIN
    const feeRequests: FeeRequest[] = asins.map(asin => ({
      marketplaceId: marketplaceId || this.marketplaceId,
      identifier: { asin },
      isAmazonFulfilled,
      price: {
        listingPrice: {
          amount: asinPriceMap[asin],
          currencyCode: this.options.defaultCurrencyCode || 'USD'
        }
      }
    }));
    
    // Get fee estimates
    const response = await this.getFeeEstimates(feeRequests);
    
    // Map the responses to ASINs
    const resultMap: Record<string, FeeEstimateResponse> = {};
    
    response.forEach((estimate, index) => {
      const asin = asins[index];
      resultMap[asin] = estimate;
    });
    
    return resultMap;
  }
  
  /**
   * Get fee estimates for multiple products by SKU
   * @param skuPriceMap Map of SKU to price
   * @param isAmazonFulfilled Whether the products are fulfilled by Amazon
   * @param marketplaceId Marketplace ID (defaults to the current marketplace)
   * @returns Map of SKU to fee estimate
   */
  public async getFeeEstimatesForSkus(
    skuPriceMap: Record<string, number>, 
    isAmazonFulfilled = true, 
    marketplaceId?: string
  ): Promise<Record<string, FeeEstimateResponse>> {
    const skus = Object.keys(skuPriceMap);
    
    if (skus.length === 0) {
      throw AmazonErrorHandler.createError(
        'At least one SKU is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Create fee requests for each SKU
    const feeRequests: FeeRequest[] = skus.map(sku => ({
      marketplaceId: marketplaceId || this.marketplaceId,
      identifier: { sku },
      isAmazonFulfilled,
      price: {
        listingPrice: {
          amount: skuPriceMap[sku],
          currencyCode: this.options.defaultCurrencyCode || 'USD'
        }
      }
    }));
    
    // Get fee estimates
    const response = await this.getFeeEstimates(feeRequests);
    
    // Map the responses to SKUs
    const resultMap: Record<string, FeeEstimateResponse> = {};
    
    response.forEach((estimate, index) => {
      const sku = skus[index];
      resultMap[sku] = estimate;
    });
    
    return resultMap;
  }
  
  /**
   * Calculate the estimated profit for a product
   * @param price Selling price
   * @param cost Product cost
   * @param feeEstimate Fee estimate response
   * @returns Profit estimate
   */
  public calculateEstimatedProfit(
    price: number, 
    cost: number, 
    feeEstimate: FeeEstimateResponse
  ): ProfitEstimate {
    // If fee estimate is not available, return zeroes
    if (!feeEstimate.feeEstimate) {
      return {
        price,
        cost,
        totalFees: 0,
        profit: price - cost,
        profitMargin: ((price - cost) / price) * 100,
        roi: ((price - cost) / cost) * 100,
        feeBreakdown: {}
      };
    }
    
    // Calculate total fees
    const totalFees = feeEstimate.feeEstimate.totalFeesEstimate.amount;
    
    // Calculate profit
    const profit = price - cost - totalFees;
    
    // Calculate profit margin
    const profitMargin = (profit / price) * 100;
    
    // Calculate ROI
    const roi = (profit / cost) * 100;
    
    // Build fee breakdown
    const feeBreakdown: Record<string, number> = {};
    
    if (feeEstimate.feeEstimate.feeDetailList) {
      for (const fee of feeEstimate.feeEstimate.feeDetailList) {
        feeBreakdown[fee.feeType] = fee.finalFee.amount;
      }
    }
    
    return {
      price,
      cost,
      totalFees,
      profit,
      profitMargin,
      roi,
      feeBreakdown
    };
  }
  
  /**
   * Find the optimal price point for maximum profit
   * @param asin ASIN of the product
   * @param minPrice Minimum price to consider
   * @param maxPrice Maximum price to consider
   * @param cost Product cost
   * @param steps Number of price points to check
   * @param isAmazonFulfilled Whether the product is fulfilled by Amazon
   * @returns Optimal price and profit information
   */
  public async findOptimalPricePoint(
    asin: string,
    minPrice: number,
    maxPrice: number,
    cost: number,
    steps = 10,
    isAmazonFulfilled = true
  ): Promise<{ price: number; profitEstimate: ProfitEstimate }> {
    if (!asin) {
      throw AmazonErrorHandler.createError(
        'ASIN is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (minPrice <= 0 || maxPrice <= 0 || minPrice >= maxPrice) {
      throw AmazonErrorHandler.createError(
        'Price range is invalid',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (cost <= 0) {
      throw AmazonErrorHandler.createError(
        'Cost must be greater than 0',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Generate price points to check
    const priceStepSize = (maxPrice - minPrice) / (steps - 1);
    const pricePoints: number[] = [];
    
    for (let i = 0; i < steps; i++) {
      pricePoints.push(minPrice + i * priceStepSize);
    }
    
    // Create a map of price points to ASINs (same ASIN with different prices)
    const testPriceMap: Record<string, number> = {};
    
    pricePoints.forEach((price, index) => {
      testPriceMap[`${asin}_${index}`] = price;
    });
    
    // Create fee requests for each price point
    const feeRequests: FeeRequest[] = pricePoints.map((price, index) => ({
      marketplaceId: this.marketplaceId,
      identifier: { asin },
      isAmazonFulfilled,
      price: {
        listingPrice: {
          amount: price,
          currencyCode: this.options.defaultCurrencyCode || 'USD'
        }
      }
    }));
    
    // Get fee estimates for all price points
    const responses = await this.getFeeEstimates(feeRequests);
    
    // Calculate profit for each price point
    const profitResults: Array<{ price: number; profitEstimate: ProfitEstimate }> = [];
    
    responses.forEach((response, index) => {
      const price = pricePoints[index];
      const profitEstimate = this.calculateEstimatedProfit(price, cost, response);
      profitResults.push({ price, profitEstimate });
    });
    
    // Find the price point with maximum profit
    let maxProfitResult = profitResults[0];
    
    for (let i = 1; i < profitResults.length; i++) {
      if (profitResults[i].profitEstimate.profit > maxProfitResult.profitEstimate.profit) {
        maxProfitResult = profitResults[i];
      }
    }
    
    return maxProfitResult;
  }
  
  /**
   * Calculate breakeven price
   * @param asin ASIN of the product
   * @param cost Product cost
   * @param isAmazonFulfilled Whether the product is fulfilled by Amazon
   * @param maxIterations Maximum iterations for binary search
   * @returns Breakeven price
   */
  public async calculateBreakenPrice(
    asin: string,
    cost: number,
    isAmazonFulfilled = true,
    maxIterations = 10
  ): Promise<number> {
    if (!asin) {
      throw AmazonErrorHandler.createError(
        'ASIN is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (cost <= 0) {
      throw AmazonErrorHandler.createError(
        'Cost must be greater than 0',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Initial price range for binary search
    let minPrice = cost;
    let maxPrice = cost * 2;
    
    // Perform binary search to find the breakeven price
    for (let i = 0; i < maxIterations; i++) {
      const midPrice = (minPrice + maxPrice) / 2;
      
      // Get fee estimate for the current price
      const feeEstimate = await this.getFeeEstimateByAsin(
        asin,
        midPrice,
        isAmazonFulfilled
      );
      
      // Calculate profit
      const profit = this.calculateEstimatedProfit(
        midPrice,
        cost,
        feeEstimate
      );
      
      // Adjust search range based on profit
      if (Math.abs(profit.profit) < 0.01) {
        // Found breakeven price (profit very close to zero)
        return midPrice;
      } else if (profit.profit > 0) {
        // Price is too high, search lower
        maxPrice = midPrice;
      } else {
        // Price is too low, search higher
        minPrice = midPrice;
      }
    }
    
    // Return the last midpoint as the approximate breakeven price
    return (minPrice + maxPrice) / 2;
  }
}