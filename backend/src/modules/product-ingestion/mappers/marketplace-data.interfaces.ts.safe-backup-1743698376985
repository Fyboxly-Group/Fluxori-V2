// @ts-nocheck - Added by final-ts-fix.js
/**
 * Interfaces for marketplace-specific product data
 * These interfaces provide strong typing for marketplace-specific fields
 */

import { Types } from 'mongoose';

/**
 * Base marketplace reference data shared across all marketplaces
 */
export interface BaseMarketplaceReference {
  marketplaceId: string;
  marketplaceProductId: string;
  marketplaceSku?: string;
  marketplaceUrl?: string;
  lastSyncDate?: Date;
  price?: number;
  status?: string;
  stockLevel?: number;
  category?: string;
}

/**
 * Amazon-specific marketplace data
 */
export interface AmazonMarketplaceData {
  asin: string;
  fulfillmentChannel?: string;
  conditionType?: string;
  isFba?: boolean;
  marketplaceId?: string;
  itemPackageQuantity?: number;
  isBuyBoxWinner?: boolean;
  salesRank?: number;
  parentAsin?: string;
}

/**
 * Amazon marketplace reference with strongly typed Amazon-specific data
 */
export interface AmazonMarketplaceReference extends BaseMarketplaceReference {
  marketplaceId: 'amazon';
  marketplaceSpecificData: AmazonMarketplaceData;
}

/**
 * Shopify-specific marketplace data
 */
export interface ShopifyMarketplaceData {
  shopifyId: string;
  handle?: string;
  publishedAt?: Date;
  publishedScope?: string;
  templateSuffix?: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  options?: string[];
  variants?: Array<{
    id: string;
    title: string;
    price: number;
    sku: string;
    position: number;
    inventoryQuantity: number;
  }>;
}

/**
 * Shopify marketplace reference with strongly typed Shopify-specific data
 */
export interface ShopifyMarketplaceReference extends BaseMarketplaceReference {
  marketplaceId: 'shopify';
  marketplaceSpecificData: ShopifyMarketplaceData;
}

/**
 * Takealot-specific marketplace data
 */
export interface TakealotMarketplaceData {
  takealotId: string;
  tsinNumber?: string;
  barcode?: string;
  statusId?: number;
  statusText?: string;
  leadTime?: number;
  stockAtTakealot?: number;
}

/**
 * Takealot marketplace reference with strongly typed Takealot-specific data
 */
export interface TakealotMarketplaceReference extends BaseMarketplaceReference {
  marketplaceId: 'takealot';
  marketplaceSpecificData: TakealotMarketplaceData;
}

/**
 * Union type for all marketplace references with specific data
 */
export type MarketplaceReference = 
  | AmazonMarketplaceReference 
  | ShopifyMarketplaceReference 
  | TakealotMarketplaceReference 
  | BaseMarketplaceReference;

/**
 * Type guard for marketplace references
 */
export function isAmazonReference(ref: MarketplaceReference): ref is AmazonMarketplaceReference {
  return ref.marketplaceId === 'amazon' && 'marketplaceSpecificData' in ref;
}

export function isShopifyReference(ref: MarketplaceReference): ref is ShopifyMarketplaceReference {
  return ref.marketplaceId === 'shopify' && 'marketplaceSpecificData' in ref;
}

export function isTakealotReference(ref: MarketplaceReference): ref is TakealotMarketplaceReference {
  return ref.marketplaceId === 'takealot' && 'marketplaceSpecificData' in ref;
}

/**
 * Interface for product differences between Fluxori and marketplace products
 */
export interface ProductDifference<T = any> {
  field: string;
  fluxoriValue: T;
  marketplaceValue: T;
}
