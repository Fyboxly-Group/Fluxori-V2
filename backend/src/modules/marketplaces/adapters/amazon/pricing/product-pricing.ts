/**
 * Amazon Product Pricing API Module
 * 
 * Implements the Amazon SP-API Product Pricing API functionality.
 * This module handles product pricing information and competitive price analysis.
 */

import { ApiModule, ApiRequestFunction, ApiResponse } from '../core/api-module';
import { AmazonErrorHandler, AmazonErrorCode } from '../utils/amazon-error';
import { BatchProcessor } from '../utils/batch-processor';

/**
 * Item identifiers for product pricing
 */
export interface PricingItemIdentifier {
  /**
   * Type of identifier
   */
  type: 'ASIN' | 'SellerSKU';
  
  /**
   * Identifier value
   */
  value: string;
}

/**
 * Pricing condition type
 */
export type ConditionType = 
  | 'New'
  | 'Used'
  | 'Collectible'
  | 'Refurbished'
  | 'Club';

/**
 * Offer type for pricing
 */
export type OfferType = 'B2C' | 'B2B';

/**
 * Get pricing parameters
 */
export interface GetPricingParams {
  /**
   * Marketplace ID for pricing information
   */
  marketplaceId?: string;
  
  /**
   * Item identifiers to get pricing for
   */
  itemIdentifiers: PricingItemIdentifier[];
  
  /**
   * Item condition to filter by
   */
  itemCondition?: ConditionType;
  
  /**
   * Type of offer to get pricing for
   */
  offerType?: OfferType;
}

/**
 * Money type for representing prices
 */
export interface Money {
  /**
   * The numerical value of the price
   */
  amount: number;

  /**
   * The currency code (ISO 4217 format)
   */
  currencyCode: string;
}

/**
 * Price type for representing product prices
 */
export interface Price {
  /**
   * Listing price of the product
   */
  listingPrice: Money;

  /**
   * Shipping price of the product
   */
  shippingPrice?: Money;

  /**
   * Points awarded for purchasing this product (Amazon points)
   */
  points?: {
    pointsNumber: number;
    pointsMonetaryValue: Money;
  };
}

/**
 * Competitive price information
 */
export interface CompetitivePrice {
  /**
   * Competitive price ID (1 = buy box price)
   */
  competitivePriceId: string;

  /**
   * Price information
   */
  price: Price;

  /**
   * Condition of the product
   */
  condition?: string;

  /**
   * Subcondition of the product
   */
  subcondition?: string;

  /**
   * Whether this price belongs to the requester
   */
  belongsToRequester: boolean;
}

/**
 * Competitive pricing information for an ASIN
 */
export interface CompetitivePriceInfo {
  /**
   * The ASIN of the product
   */
  asin: string;

  /**
   * List of competitive prices
   */
  competitivePrices: CompetitivePrice[];

  /**
   * The lowest price found among competitive prices
   */
  lowestPrice?: number;

  /**
   * The buy box price if available
   */
  buyBoxPrice?: number;
}

/**
 * Price comparison for a SKU
 */
export interface PriceComparison {
  /**
   * The SKU of the product
   */
  sku: string;

  /**
   * The ASIN of the product
   */
  asin?: string;

  /**
   * The seller's price for this SKU
   */
  yourPrice?: number;

  /**
   * The lowest price available for this product
   */
  lowestPrice?: number;

  /**
   * The buy box price for this product
   */
  buyBoxPrice?: number;

  /**
   * The difference between your price and the lowest price
   */
  priceDifference?: number;

  /**
   * Whether the seller is the buy box winner
   */
  isBuyBoxWinner?: boolean;
}

/**
 * Price trends data for historical analysis
 */
export interface PriceTrends {
  /**
   * The ASIN of the product
   */
  asin: string;

  /**
   * Dates for the price points
   */
  dates: string[];

  /**
   * Lowest prices over time
   */
  lowestPrices: number[];

  /**
   * Buy box prices over time
   */
  buyBoxPrices: number[];

  /**
   * Your prices over time, if available
   */
  yourPrices?: number[];
}

/**
 * Namespace for Amazon SP-API Product Pricing response types
 */
export namespace AmazonSPApi {
  /**
   * Product Pricing API namespace
   */
  export namespace ProductPricing {
    /**
     * Base product identifier type (common to all responses)
     */
    export interface ProductIdentifier {
      marketplaceId: string;
      asin?: string;
      sellerId?: string;
      skuType?: string;
      sellerSKU?: string;
    }

    /**
     * Response for get pricing API
     */
    export interface GetPricingResponse {
      payload: Array<{
        /**
         * Status of the pricing request for this item
         */
        status: 'Success' | 'ClientError' | 'ServiceError';
        
        /**
         * Product pricing information
         */
        product?: {
          /**
           * Product identifiers
           */
          identifiers: {
            marketplaceASIN?: {
              marketplaceId: string;
              asin: string;
            };
            sellerSKU?: {
              marketplaceId: string;
              sellerId: string;
              sellerSKU: string;
            };
          };
          
          /**
           * Competitive pricing information
           */
          competitivePricing?: {
            competitivePrices: CompetitivePrice[];
            numberOfOfferListings: Array<{
              condition: string;
              count: number;
            }>;
            tradeInValue?: Money;
          };
          
          /**
           * Product offers
           */
          offers?: Array<{
            buyingPrice: Price;
            regularPrice?: Money;
            fulfillmentChannel?: string;
            itemCondition?: string;
            itemSubCondition?: string;
            sellerSKU?: string;
          }>;
          
          /**
           * Sales rankings
           */
          salesRankings?: Array<{
            productCategoryId: string;
            rank: number;
          }>;
        };
        
        /**
         * Error information if status is not Success
         */
        error?: {
          code: string;
          message: string;
          details?: string;
        };
      }>;
    }
  }
}

/**
 * Implementation of the Amazon Product Pricing API
 */
export class ProductPricingModule extends ApiModule {
  /**
   * Module identifier
   */
  readonly moduleId = 'productPricing';
  
  /**
   * Human-readable module name
   */
  readonly moduleName = 'Product Pricing API';
  
  /**
   * API version for this module
   */
  readonly apiVersion: string;
  
  /**
   * Base path for API requests
   */
  readonly basePath: string;
  
  /**
   * Batch processor for handling multiple items
   */
  private batchProcessor: BatchProcessor;

  /**
   * Constructor
   * @param apiVersion API version
   * @param apiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   */
  constructor(
    apiVersion: string, 
    apiRequest: ApiRequestFunction,
    marketplaceId: string
  ) {
    super(apiRequest, marketplaceId, {});
    
    this.apiVersion = apiVersion;
    this.basePath = `/products/pricing/${apiVersion}`;
    this.batchProcessor = new BatchProcessor(20); // Process items in batches of 20
  }

  /**
   * Get pricing information for items
   * @param params Parameters for getting pricing information
   * @returns Pricing information
   */
  public async getPricing(params: GetPricingParams): Promise<ApiResponse<AmazonSPApi.ProductPricing.GetPricingResponse>> {
    if (!params.itemIdentifiers || params.itemIdentifiers.length === 0) {
      throw AmazonErrorHandler.createError(
        'At least one item identifier is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const queryParams: Record<string, any> = {};
    
    // Ensure we have a marketplace ID
    const marketplaceId = params.marketplaceId || this.marketplaceId;
    if (!marketplaceId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required for pricing information',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    queryParams.MarketplaceId = marketplaceId;
    
    // Add item condition if provided
    if (params.itemCondition) {
      queryParams.ItemCondition = params.itemCondition;
    }
    
    // Add offer type if provided
    if (params.offerType) {
      queryParams.OfferType = params.offerType;
    }
    
    // Determine which API endpoint to use based on identifier type
    const identifierType = params.itemIdentifiers[0].type;
    let endpoint = '';
    
    if (identifierType === 'ASIN') {
      endpoint = 'competitive-pricing/v0/items';
      queryParams.Asins = params.itemIdentifiers.map(id => id.value).join(',');
    } else {
      endpoint = 'listings/pricing/v0/items';
      queryParams.SellerSKUs = params.itemIdentifiers.map(id => id.value).join(',');
    }
    
    try {
      return await this.request<AmazonSPApi.ProductPricing.GetPricingResponse>(
        endpoint,
        'GET',
        undefined,
        { params: queryParams }
      );
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getPricing`);
    }
  }
  
  /**
   * Get pricing information for ASINs
   * @param asins ASINs to get pricing for
   * @param itemCondition Item condition
   * @param offerType Offer type
   * @returns Pricing information
   */
  public async getPricingForAsins(
    asins: string[],
    itemCondition?: ConditionType,
    offerType?: OfferType
  ): Promise<ApiResponse<AmazonSPApi.ProductPricing.GetPricingResponse>> {
    if (!asins || asins.length === 0) {
      throw AmazonErrorHandler.createError(
        'At least one ASIN is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.getPricing({
      itemIdentifiers: asins.map(asin => ({ type: 'ASIN', value: asin })),
      itemCondition,
      offerType
    });
  }
  
  /**
   * Get pricing information for SKUs
   * @param skus SKUs to get pricing for
   * @param itemCondition Item condition
   * @param offerType Offer type
   * @returns Pricing information
   */
  public async getPricingForSkus(
    skus: string[],
    itemCondition?: ConditionType,
    offerType?: OfferType
  ): Promise<ApiResponse<AmazonSPApi.ProductPricing.GetPricingResponse>> {
    if (!skus || skus.length === 0) {
      throw AmazonErrorHandler.createError(
        'At least one SKU is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.getPricing({
      itemIdentifiers: skus.map(sku => ({ type: 'SellerSKU', value: sku })),
      itemCondition,
      offerType
    });
  }
  
  /**
   * Get competitive pricing for ASINs
   * @param asins ASINs to get competitive pricing for
   * @returns Competitive pricing information
   */
  public async getCompetitivePricingForAsins(asins: string[]): Promise<CompetitivePriceInfo[]> {
    if (!asins || asins.length === 0) {
      throw AmazonErrorHandler.createError(
        'At least one ASIN is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Process ASINs in batches to avoid hitting API limits
    const results: CompetitivePriceInfo[] = [];
    
    // Use batch processor to handle large numbers of ASINs
    await this.batchProcessor.processBatch(asins, async (batchAsins) => {
      try {
        // Get pricing information for this batch
        const response = await this.getPricingForAsins(batchAsins);
        
        // Process response
        if (response.data && response.data.payload) {
          for (const item of response.data.payload) {
            if (item.status !== 'Success' || !item.product) {
              continue;
            }
            
            // Get ASIN from identifiers
            const asin = item.product.identifiers.marketplaceASIN?.asin;
            if (!asin) continue;
            
            // Extract competitive prices
            const competitivePrices = item.product.competitivePricing?.competitivePrices || [];
            
            // Find lowest price
            let lowestPrice: number | undefined = undefined;
            for (const price of competitivePrices) {
              const totalPrice = (price.price.listingPrice.amount || 0) + 
                                (price.price.shippingPrice?.amount || 0);
              
              if (lowestPrice === undefined || totalPrice < lowestPrice) {
                lowestPrice = totalPrice;
              }
            }
            
            // Find buy box price (competitivePriceId = 1)
            const buyBoxPrice = competitivePrices.find(p => 
              p.competitivePriceId === '1')?.price.listingPrice.amount;
            
            results.push({
              asin,
              competitivePrices,
              lowestPrice,
              buyBoxPrice
            });
          }
        }
      } catch (error) {
        console.error(`Error processing batch of ASINs:`, error);
        // Continue processing other batches despite errors
      }
    });
    
    return results;
  }
  
  /**
   * Get price comparison for a SKU
   * @param sku SKU to get price comparison for
   * @returns Price comparison information
   */
  public async getPriceComparisonForSku(sku: string): Promise<PriceComparison | null> {
    if (!sku) {
      throw AmazonErrorHandler.createError(
        'SKU is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      // Get pricing information for the SKU
      const response = await this.getPricingForSkus([sku]);
      
      // Process response
      if (!response.data || 
          !response.data.payload || 
          response.data.payload.length === 0 || 
          response.data.payload[0].status !== 'Success' ||
          !response.data.payload[0].product) {
        return null;
      }
      
      const item = response.data.payload[0];
      const product = item.product;
      
      // Get ASIN
      const asin = product.identifiers.marketplaceASIN?.asin;
      
      // Get your price
      const yourPrice = product.offers?.[0]?.buyingPrice.listingPrice.amount || 0;
      
      // Extract competitive prices
      const competitivePrices = product.competitivePricing?.competitivePrices || [];
      
      // Find lowest price
      let lowestPrice: number | undefined = undefined;
      for (const price of competitivePrices) {
        const totalPrice = (price.price.listingPrice.amount || 0) + 
                        (price.price.shippingPrice?.amount || 0);
        
        if (lowestPrice === undefined || totalPrice < lowestPrice) {
          lowestPrice = totalPrice;
        }
      }
      
      // Find buy box price (competitivePriceId = 1)
      const buyBoxPrice = competitivePrices.find(p => 
        p.competitivePriceId === '1')?.price.listingPrice.amount;
      
      // Calculate price difference
      const priceDifference = yourPrice && lowestPrice ? yourPrice - lowestPrice : undefined;
      
      // Determine if you are the buy box winner
      const isBuyBoxWinner = competitivePrices.some(p => 
        p.competitivePriceId === '1' && p.belongsToRequester === true);
      
      return {
        sku,
        asin,
        yourPrice,
        lowestPrice,
        buyBoxPrice,
        priceDifference,
        isBuyBoxWinner
      };
    } catch (error) {
      console.error(`Failed to get price comparison for SKU ${sku}:`, error);
      return null;
    }
  }
  
  /**
   * Get price trends (historical pricing data)
   * This is a simulated function since the SP-API doesn't provide direct historical data
   * In a real implementation, this would use report data or external storage
   * @param asin ASIN to get price trends for
   * @param days Number of days of history to retrieve
   * @returns Historical pricing data
   */
  public async getPriceTrends(asin: string, days: number = 30): Promise<PriceTrends> {
    if (!asin) {
      throw AmazonErrorHandler.createError(
        'ASIN is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // This is a simulated function for demonstration purposes
    // In a real implementation, this would retrieve historical data from reports or databases
    
    // Get current pricing as a starting point
    try {
      const pricingData = await this.getCompetitivePricingForAsins([asin]);
      
      if (pricingData.length === 0) {
        throw AmazonErrorHandler.createError(
          `No pricing data available for ASIN ${asin}`,
          AmazonErrorCode.RESOURCE_NOT_FOUND
        );
      }
      
      const currentData = pricingData[0];
      const currentLowestPrice = currentData.lowestPrice || 10.0;
      const currentBuyBoxPrice = currentData.buyBoxPrice || currentLowestPrice;
      
      // Generate simulated historical data
      const dates: string[] = [];
      const lowestPrices: number[] = [];
      const buyBoxPrices: number[] = [];
      
      const today = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
        
        // Generate realistic price fluctuations
        const randomFactor = 0.9 + (Math.random() * 0.2); // between 0.9 and 1.1
        const dayLowestPrice = parseFloat((currentLowestPrice * randomFactor).toFixed(2));
        lowestPrices.push(dayLowestPrice);
        
        // Buy box price is usually slightly higher
        const buyBoxFactor = 1.0 + (Math.random() * 0.1); // between 1.0 and 1.1
        const dayBuyBoxPrice = parseFloat((dayLowestPrice * buyBoxFactor).toFixed(2));
        buyBoxPrices.push(dayBuyBoxPrice);
      }
      
      return {
        asin,
        dates,
        lowestPrices,
        buyBoxPrices
      };
    } catch (error) {
      console.error(`Failed to get price trends for ASIN ${asin}:`, error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
}