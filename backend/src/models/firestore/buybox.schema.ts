/**
 * Firestore Buy Box Schema
 * 
 * Defines the schema for Buy Box monitoring data in Firestore database.
 */
import { Timestamp } from 'firebase-admin/firestore';

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
  timestamp: Timestamp;
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
  lastChecked: Timestamp;
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
    timestamp: Timestamp;
    reason?: string;
    previousPrice?: number;
    competitorPrice?: number;
  };
  lastBuyBoxWin?: {
    timestamp: Timestamp;
    reason?: string;
    previousPrice?: number;
    competitorPrice?: number;
  };
  buyBoxWinPercentage?: number; // Over the last 30 days
  averagePriceDifference?: number; // Average price differential to win Buy Box
  lowestPriceToWin?: number; // Lowest price needed to win Buy Box
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Repricing rule
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
  isActive: boolean;
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
  lastRun?: Timestamp;
  nextRun?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Repricing event history
 */
export interface RepricingEvent {
  id: string;
  ruleId: string;
  productId: string;
  sku: string;
  marketplaceId: string;
  timestamp: Timestamp;
  previousPrice: number;
  newPrice: number;
  reason: string;
  buyBoxStatusBefore: BuyBoxOwnershipStatus;
  buyBoxStatusAfter?: BuyBoxOwnershipStatus;
  success: boolean;
  errorMessage?: string;
}

/**
 * Buy Box Alert settings
 */
export interface BuyBoxAlertSettings {
  id: string;
  userId: string;
  orgId: string;
  alertOnBuyBoxLoss: boolean;
  alertOnPriceChange: boolean;
  alertOnCompetitorPriceChange: boolean;
  alertOnRepricingAction: boolean;
  priceChangeThreshold: number; // % threshold to trigger alert
  emailAlerts: boolean;
  emailAddresses: string[];
  inAppNotifications: boolean;
  pushNotifications: boolean;
  smsAlerts: boolean;
  phoneNumbers: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Firestore converters
 */
export const buyBoxHistoryConverter = {
  toFirestore(history: BuyBoxHistory): FirebaseFirestore.DocumentData {
    return {
      userId: history.userId,
      orgId: history.orgId,
      sku: history.sku,
      productId: history.productId,
      marketplaceId: history.marketplaceId,
      marketplaceProductId: history.marketplaceProductId,
      lastSnapshot: history.lastSnapshot,
      isMonitoring: history.isMonitoring,
      monitoringFrequency: history.monitoringFrequency,
      snapshots: history.snapshots,
      lastBuyBoxLoss: history.lastBuyBoxLoss,
      lastBuyBoxWin: history.lastBuyBoxWin,
      buyBoxWinPercentage: history.buyBoxWinPercentage,
      averagePriceDifference: history.averagePriceDifference,
      lowestPriceToWin: history.lowestPriceToWin,
      createdAt: history.createdAt || Timestamp.now(),
      updatedAt: Timestamp.now()
    };
  },
  
  fromFirestore(
    snapshot: FirebaseFirestore.QueryDocumentSnapshot
  ): BuyBoxHistory {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      orgId: data.orgId,
      sku: data.sku,
      productId: data.productId,
      marketplaceId: data.marketplaceId,
      marketplaceProductId: data.marketplaceProductId,
      lastSnapshot: data.lastSnapshot,
      isMonitoring: data.isMonitoring,
      monitoringFrequency: data.monitoringFrequency,
      snapshots: data.snapshots || [],
      lastBuyBoxLoss: data.lastBuyBoxLoss,
      lastBuyBoxWin: data.lastBuyBoxWin,
      buyBoxWinPercentage: data.buyBoxWinPercentage,
      averagePriceDifference: data.averagePriceDifference,
      lowestPriceToWin: data.lowestPriceToWin,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    } as BuyBoxHistory;
  }
};

export const repricingRuleConverter = {
  toFirestore(rule: RepricingRule): FirebaseFirestore.DocumentData {
    return {
      userId: rule.userId,
      orgId: rule.orgId,
      name: rule.name,
      description: rule.description,
      isActive: rule.isActive,
      strategy: rule.strategy,
      parameters: rule.parameters,
      productFilter: rule.productFilter,
      marketplaces: rule.marketplaces,
      updateFrequency: rule.updateFrequency,
      priority: rule.priority,
      lastRun: rule.lastRun,
      nextRun: rule.nextRun,
      createdAt: rule.createdAt || Timestamp.now(),
      updatedAt: Timestamp.now()
    };
  },
  
  fromFirestore(
    snapshot: FirebaseFirestore.QueryDocumentSnapshot
  ): RepricingRule {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      orgId: data.orgId,
      name: data.name,
      description: data.description,
      isActive: data.isActive,
      strategy: data.strategy,
      parameters: data.parameters,
      productFilter: data.productFilter,
      marketplaces: data.marketplaces,
      updateFrequency: data.updateFrequency,
      priority: data.priority,
      lastRun: data.lastRun,
      nextRun: data.nextRun,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    } as RepricingRule;
  }
};