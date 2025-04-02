/**
 * Buy Box Types
 */

/**
 * Buy Box ownership status
 */
export enum BuyBoxOwnershipStatus {
  OWNED = 'owned',
  NOT_OWNED = 'not_owned',
  SHARED = 'shared',
  NO_BUY_BOX = 'no_buy_box',
  UNKNOWN = 'unknown'
}

/**
 * Competitor information
 */
export interface Competitor {
  name: string;
  isCurrentBuyBoxWinner: boolean;
  price: number;
  priceWithShipping?: number;
  fulfillmentType?: string; // For Amazon: 'FBA', 'FBM', etc. For Takealot: 'Direct', 'Marketplace', etc.
  rating?: number;
  reviewCount?: number;
  shippingTime?: string;
  stockStatus?: string;
  isOfficialStore?: boolean;
  isPrime?: boolean; // Amazon-specific
  leadTime?: number;  // Takealot-specific
  badges?: string[];  // e.g., 'Prime', 'Free Shipping', etc.
  additionalInfo?: Record<string, any>;
}

/**
 * Buy Box snapshot
 */
export interface BuyBoxSnapshot {
  timestamp: {
    toDate: () => Date;
  };
  ownBuyBoxStatus: BuyBoxOwnershipStatus;
  ownSellerPrice: number;
  ownSellerPriceWithShipping?: number;
  buyBoxPrice?: number;
  buyBoxPriceWithShipping?: number;
  priceDifferencePercentage?: number;
  priceDifferenceAmount?: number;
  competitorCount: number;
  competitors: Competitor[];
  hasPricingOpportunity: boolean;
  suggestedPrice?: number;
  suggestedPriceReason?: string;
  lastChecked: {
    toDate: () => Date;
  };
}

/**
 * Buy Box history for a specific marketplace listing 
 */
export interface BuyBoxHistory {
  id: string; // Usually productId_marketplaceId
  userId: string;
  orgId: string;
  sku: string;
  productId: string;
  marketplaceId: string; // 'amazon', 'takealot', etc.
  marketplaceProductId: string;
  lastSnapshot: BuyBoxSnapshot;
  isMonitoring: boolean;
  monitoringFrequency: number; // In minutes
  snapshots: BuyBoxSnapshot[];
  lastBuyBoxLoss?: {
    timestamp: {
      toDate: () => Date;
    };
    reason?: string;
    previousPrice?: number;
    competitorPrice?: number;
  };
  lastBuyBoxWin?: {
    timestamp: {
      toDate: () => Date;
    };
    reason?: string;
    previousPrice?: number;
    competitorPrice?: number;
  };
  buyBoxWinPercentage?: number; // Over the last 30 days
  averagePriceDifference?: number; // Average price differential to win Buy Box
  lowestPriceToWin?: number; // Lowest price needed to win Buy Box
  createdAt: {
    toDate: () => Date;
  };
  updatedAt: {
    toDate: () => Date;
  };
}

/**
 * Repricing strategy
 */
export enum RepricingStrategy {
  MATCH_BUY_BOX = 'match_buy_box',
  BEAT_BUY_BOX = 'beat_buy_box',
  FIXED_PERCENTAGE = 'fixed_percentage',
  DYNAMIC_PRICING = 'dynamic_pricing',
  MAINTAIN_MARGIN = 'maintain_margin'
}

/**
 * Repricing rule
 */
export interface RepricingRule {
  id: string;
  userId: string;
  orgId: string;
  name: string;
  description?: string;
  active: boolean;
  strategy: RepricingStrategy;
  parameters: {
    minPrice?: number;
    maxPrice?: number;
    targetMargin?: number;
    priceDifferenceAmount?: number;
    priceDifferencePercentage?: number;
    competitorMatchStrategy?: string; // e.g., 'match_all', 'match_fba_only', etc.
  };
  productFilter?: {
    categories?: string[];
    tags?: string[];
    skus?: string[];
    excludedSkus?: string[];
    minPrice?: number;
    maxPrice?: number;
  };
  marketplaces: string[]; // Which marketplaces this rule applies to
  updateFrequency: number; // In minutes
  priority: number; // Higher number = higher priority
  lastRun?: {
    toDate: () => Date;
  };
  nextRun?: {
    toDate: () => Date;
  };
  createdAt: {
    toDate: () => Date;
  };
  updatedAt: {
    toDate: () => Date;
  };
}