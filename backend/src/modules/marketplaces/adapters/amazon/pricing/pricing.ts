
/**
 * Amazon Pricing Utilities
 * 
 * Utility functions for working with Amazon pricing data.
 */

import { CompetitivePriceInfo, PriceComparison } from './product-pricing';

/**
 * Price recommendation information
 */
export interface PriceRecommendation {
  /**
   * The ASIN or SKU
   */
  identifier: string;
  
  /**
   * The current price
   */
  currentPrice?: number;
  
  /**
   * The recommended price
   */
  recommendedPrice: number;
  
  /**
   * The minimum price allowed
   */
  minimumPrice?: number;
  
  /**
   * The maximum price allowed
   */
  maximumPrice?: number;
  
  /**
   * The profit margin at the recommended price
   */
  projectedMargin?: number;
  
  /**
   * The reason for the recommendation
   */
  reason: string;
}

/**
 * Pricing strategy types
 */
export enum PricingStrategy {
  /**
   * Match the buy box price
   */
  MATCH_BUY_BOX = 'match_buy_box',
  
  /**
   * Beat the buy box price by a specific amount
   */
  BEAT_BUY_BOX = 'beat_buy_box',
  
  /**
   * Match the lowest price
   */
  MATCH_LOWEST = 'match_lowest',
  
  /**
   * Beat the lowest price by a specific amount
   */
  BEAT_LOWEST = 'beat_lowest',
  
  /**
   * Set price relative to the buy box by a percentage
   */
  RELATIVE_TO_BUY_BOX = 'relative_to_buy_box',
  
  /**
   * Set a fixed price
   */
  FIXED_PRICE = 'fixed_price',
  
  /**
   * Maintain minimum margin
   */
  MINIMUM_MARGIN = 'minimum_margin'
}

/**
 * Price calculation options
 */
export interface PriceCalculationOptions {
  /**
   * Pricing strategy to use
   */
  strategy: PricingStrategy;
  
  /**
   * Value to use with the strategy:
   * - For BEAT_* strategies: the amount to beat by
   * - For RELATIVE_TO_* strategies: the percentage (e.g., 0.9 for 90%)
   * - For FIXED_PRICE: the fixed price
   * - For MINIMUM_MARGIN: the minimum margin percentage
   */
  value: number;
  
  /**
   * Cost of the product (for margin calculations)
   */
  cost?: number;
  
  /**
   * Minimum price allowed
   */
  minPrice?: number;
  
  /**
   * Maximum price allowed
   */
  maxPrice?: number;
}

/**
 * Utility functions for Amazon pricing
 */
export const PricingUtils = {
  /**
   * Calculate a recommended price based on competitive data and a pricing strategy
   * 
   * @param priceInfo Competitive price information
   * @param options Pricing strategy options
   * @returns Price recommendation
   */
  calculateRecommendedPrice(
    priceInfo: CompetitivePriceInfo | PriceComparison,
    options: PriceCalculationOptions
  ): PriceRecommendation {
    const identifier = 'asin' in priceInfo ? priceInfo.asin : priceInfo.sku;
    const currentPrice = 'yourPrice' in priceInfo ? priceInfo.yourPrice : undefined;
    const buyBoxPrice = priceInfo.buyBoxPrice;
    const lowestPrice = priceInfo.lowestPrice;
    
    // Default values
    let recommendedPrice = currentPrice || 0;
    let reason = 'No calculation performed';
    
    // Calculate price based on strategy
    switch (options.strategy) {
      case PricingStrategy.MATCH_BUY_BOX:
        if (buyBoxPrice) {
          recommendedPrice = buyBoxPrice;
          reason = 'Matched buy box price';
        } else {
          reason = 'Buy box price not available';
        }
        break;
      
      case PricingStrategy.BEAT_BUY_BOX:
        if (buyBoxPrice) {
          recommendedPrice = buyBoxPrice - options.value;
          reason = `Beat buy box price by ${options.value}`;
        } else {
          reason = 'Buy box price not available';
        }
        break;
      
      case PricingStrategy.MATCH_LOWEST:
        if (lowestPrice) {
          recommendedPrice = lowestPrice;
          reason = 'Matched lowest price';
        } else {
          reason = 'Lowest price not available';
        }
        break;
      
      case PricingStrategy.BEAT_LOWEST:
        if (lowestPrice) {
          recommendedPrice = lowestPrice - options.value;
          reason = `Beat lowest price by ${options.value}`;
        } else {
          reason = 'Lowest price not available';
        }
        break;
      
      case PricingStrategy.RELATIVE_TO_BUY_BOX:
        if (buyBoxPrice) {
          recommendedPrice = buyBoxPrice * options.value;
          reason = `Set to ${options.value * 100}% of buy box price`;
        } else {
          reason = 'Buy box price not available';
        }
        break;
      
      case PricingStrategy.FIXED_PRICE:
        recommendedPrice = options.value;
        reason = 'Set to fixed price';
        break;
      
      case PricingStrategy.MINIMUM_MARGIN:
        if (options.cost) {
          const minimumPrice = options.cost / (1 - options.value);
          
          if (lowestPrice && lowestPrice > minimumPrice) {
            recommendedPrice = lowestPrice;
            reason = 'Used lowest price while maintaining minimum margin';
          } else {
            recommendedPrice = minimumPrice;
            reason = `Set to minimum price with ${options.value * 100}% margin`;
          }
        } else {
          reason = 'Cost not provided for margin calculation';
        }
        break;
    }
    
    // Apply min/max constraints
    if (options.minPrice && recommendedPrice < options.minPrice) {
      recommendedPrice = options.minPrice;
      reason += ' (minimum price applied)';
    }
    
    if (options.maxPrice && recommendedPrice > options.maxPrice) {
      recommendedPrice = options.maxPrice;
      reason += ' (maximum price applied)';
    }
    
    // Calculate projected margin if cost is known
    let projectedMargin: number | undefined = undefined;
    if (options.cost && recommendedPrice > 0) {
      projectedMargin = (recommendedPrice - options.cost) / recommendedPrice;
    }
    
    // Round to two decimal places
    recommendedPrice = Math.round(recommendedPrice * 100) / 100;
    
    return {
      identifier,
      currentPrice,
      recommendedPrice,
      minimumPrice: options.minPrice,
      maximumPrice: options.maxPrice,
      projectedMargin,
      reason
    };
  },
  
  /**
   * Calculate the minimum profitable price based on cost and required margin
   * 
   * @param cost Product cost
   * @param requiredMargin Minimum margin required (e.g., 0.2 for 20%)
   * @returns Minimum price
   */
  calculateMinimumPrice(cost: number, requiredMargin: number): number {
    if (cost <= 0) {
      throw new Error('Cost must be greater than zero');
    }
    
    if (requiredMargin < 0 || requiredMargin >= 1) {
      throw new Error('Required margin must be between 0 and 1');
    }
    
    return cost / (1 - requiredMargin);
  },
  
  /**
   * Calculate margin at a given price
   * 
   * @param price Selling price
   * @param cost Product cost
   * @returns Profit margin percentage (0-1)
   */
  calculateMargin(price: number, cost: number): number {
    if (price <= 0) {
      throw new Error('Price must be greater than zero');
    }
    
    if (cost <= 0) {
      throw new Error('Cost must be greater than zero');
    }
    
    return (price - cost) / price;
  },
  
  /**
   * Format currency for display
   * 
   * @param amount Amount to format
   * @param currencyCode Currency code (defaults to USD)
   * @returns Formatted currency string
   */
  formatCurrency(amount: number, currencyCode: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode
    }).format(amount);
  },
  
  /**
   * Group price data by margin ranges
   * 
   * @param priceComparisons Array of price comparisons
   * @param costs Map of costs by SKU
   * @returns Grouped price data
   */
  groupByMargin(
    priceComparisons: PriceComparison[],
    costs: Map<string, number>
  ): Map<string, PriceComparison[]> {
    const result = new Map<string, PriceComparison[]>();
    
    // Define margin ranges
    const ranges = [
      { label: 'high_margin', min: 0.3, max: 1.0 },
      { label: 'medium_margin', min: 0.15, max: 0.3 },
      { label: 'low_margin', min: 0.05, max: 0.15 },
      { label: 'unprofitable', min: -1.0, max: 0.05 }
    ];
    
    // Initialize result map
    ranges.forEach(range => {
      result.set(range.label, []);
    });
    
    // Group price comparisons by margin range
    for (const comparison of priceComparisons) {
      if (!comparison.yourPrice) continue;
      
      const cost = costs.get(comparison.sku);
      if (!cost) continue;
      
      const margin = this.calculateMargin(comparison.yourPrice, cost);
      
      // Find the appropriate range
      for (const range of ranges) {
        if (margin >= range.min && margin < range.max) {
          const items = result.get(range.label) || [];
          items.push(comparison);
          result.set(range.label, items);
          break;
        }
      }
    }
    
    return result;
  }
};

// Default export for the utility functions
export default PricingUtils;
