// Types for Buy Box Monitoring Dashboard

/**
 * Marketplace enum type
 */
export type Marketplace = 'amazon' | 'takealot' | 'shopify' | 'other';

/**
 * Repricing strategy enum type
 */
export type RepricingStrategy = 'match' | 'beat' | 'percentage' | 'dynamic' | 'margin';

/**
 * Condition for rule application
 */
export type RuleCondition = 'all' | 'category' | 'tag' | 'sku';

/**
 * Schedule frequency enum
 */
export type ScheduleFrequency = 'hourly' | 'daily' | 'weekly' | 'custom';

/**
 * Repricing Rule definition
 */
export interface RepricingRule {
  id: string;
  name: string;
  strategy: RepricingStrategy;
  marketplace: Marketplace;
  condition: RuleCondition;
  conditionValue?: string;
  minimumPrice?: number;
  maximumPrice?: number;
  strategyValue?: number;
  schedule: ScheduleFrequency;
  scheduleDetails?: string;
  active: boolean;
  priority: number;
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

/**
 * Price history data point
 */
export interface PricePoint {
  /** Timestamp for price point */
  timestamp: Date;
  /** Your price */
  yourPrice: number;
  /** Buy Box price */
  buyBoxPrice: number;
  /** Lowest price from any seller */
  lowestPrice: number;
  /** Highest price from any seller */
  highestPrice: number;
  /** Whether you had the Buy Box at this time */
  hadBuyBox: boolean;
}

/**
 * Competitor information
 */
export interface Competitor {
  id: string;
  name: string;
  rating?: number;
  price: number;
  shipping?: number;
  hasBuyBox: boolean;
  fulfillmentType?: 'FBA' | 'FBM' | string;
  offerCount?: number;
  condition?: string;
  arrivalDate?: Date;
}

/**
 * Repricing event
 */
export interface RepricingEvent {
  id: string;
  timestamp: Date;
  ruleId: string;
  ruleName: string;
  productId: string;
  productName: string;
  marketplace: Marketplace;
  previousPrice: number;
  newPrice: number;
  buyBoxPrice: number;
  buyBoxWon: boolean;
  status: 'success' | 'failed' | 'skipped';
  reason?: string;
  creditsUsed: number;
}

/**
 * Product with Buy Box information
 */
export interface BuyBoxProduct {
  id: string;
  sku: string;
  name: string;
  marketplace: Marketplace;
  price: number;
  previousPrice?: number;
  buyBoxPrice: number;
  lowestPrice: number;
  highestPrice: number;
  hasBuyBox: boolean;
  buyBoxWinRate: number;
  ruleId?: string;
  ruleName?: string;
  lastPriceChange?: Date;
  imageUrl?: string;
  category?: string;
  brand?: string;
  competitors: Competitor[];
  priceHistory: PricePoint[];
  suggestedPrice?: number;
  profitMargin?: number;
  estimatedSales?: number;
  isMonitored: boolean;
}

/**
 * Buy Box Dashboard Analytics
 */
export interface BuyBoxAnalytics {
  totalProducts: number;
  monitoredProducts: number;
  buyBoxWinRate: number;
  averageBuyBoxPrice: number;
  totalRules: number;
  activeRules: number;
  lastDayEvents: number;
  lastDayWins: number;
  marketplaceDistribution: {
    marketplace: Marketplace;
    count: number;
    winRate: number;
  }[];
  topPerformingProducts: {
    id: string;
    name: string;
    winRate: number;
    marketplace: Marketplace;
  }[];
  recentEvents: RepricingEvent[];
}