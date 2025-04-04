/**
 * Amazon Catalog Module
 * 
 * This module combines catalog-related functionality for Amazon's SP-API.
 * It defines types and utilities for working with Amazon catalog data.
 */

import { IncludedData } from './catalog-items';

/**
 * Amazon Catalog Category
 */
export interface CatalogCategory {
  /**
   * Display name of the category
   */
  displayName: string;
  
  /**
   * Category identifier
   */
  id: string;
  
  /**
   * Parent category ID (if any)
   */
  parentId?: string;
  
  /**
   * Full path of the category
   */
  path?: string[];
}

/**
 * Amazon Product Image
 */
export interface ProductImage {
  /**
   * URL of the image
   */
  url: string;
  
  /**
   * Height of the image in pixels
   */
  height?: number;
  
  /**
   * Width of the image in pixels
   */
  width?: number;
  
  /**
   * Image variant (e.g., MAIN, PT01, PT02, etc.)
   */
  variant?: string;
}

/**
 * Amazon Product Sales Rank
 */
export interface ProductSalesRank {
  /**
   * Category ID
   */
  categoryId: string;
  
  /**
   * Display name of category
   */
  title: string;
  
  /**
   * Sales rank
   */
  rank: number;
  
  /**
   * Link to category page
   */
  link?: string;
}

/**
 * Product Dimensions
 */
export interface ProductDimensions {
  /**
   * Height
   */
  height?: {
    value: number;
    unit: string;
  };
  
  /**
   * Length
   */
  length?: {
    value: number;
    unit: string;
  };
  
  /**
   * Width
   */
  width?: {
    value: number;
    unit: string;
  };
  
  /**
   * Weight
   */
  weight?: {
    value: number;
    unit: string;
  };
}

/**
 * Amazon Product Summary
 */
export interface ProductSummary {
  /**
   * Product title
   */
  title: string;
  
  /**
   * Product description
   */
  description?: string;
  
  /**
   * Brand name
   */
  brand?: string;
  
  /**
   * Manufacturer
   */
  manufacturer?: string;
  
  /**
   * Color
   */
  color?: string;
  
  /**
   * Size
   */
  size?: string;
  
  /**
   * Item dimensions
   */
  dimensions?: ProductDimensions;
}

/**
 * Amazon Catalog API utilities
 */
export const CatalogUtils = {
  /**
   * Get default included data fields for catalog item requests
   * @returns Array of included data fields
   */
  getDefaultIncludedData(): IncludedData[] {
    return [
      'identifiers',
      'images',
      'productTypes',
      'salesRanks',
      'summaries',
      'variations'
    ];
  },
  
  /**
   * Group catalog items by brand
   * @param items Array of catalog items
   * @returns Map of brand name to array of items
   */
  groupItemsByBrand<T extends { summary?: { brand?: string } }>(
    items: T[]
  ): Map<string, T[]> {
    const groupedItems = new Map<string, T[]>();
    
    for (const item of items) {
      const brand = item.summary?.brand || 'Unknown';
      
      if (!groupedItems.has(brand)) {
        groupedItems.set(brand, []);
      }
      
      groupedItems.get(brand)?.push(item);
    }
    
    return groupedItems;
  },
  
  /**
   * Extract all unique categories from sales ranks
   * @param items Array of catalog items with sales ranks
   * @returns Array of unique category objects
   */
  extractCategories<T extends { salesRanks?: Array<{ categoryId: string; title: string }> }>(
    items: T[]
  ): CatalogCategory[] {
    const categoryMap = new Map<string, CatalogCategory>();
    
    for (const item of items) {
      if (item.salesRanks) {
        for (const rank of item.salesRanks) {
          if (!categoryMap.has(rank.categoryId)) {
            categoryMap.set(rank.categoryId, {
              id: rank.categoryId,
              displayName: rank.title
            });
          }
        }
      }
    }
    
    return Array.from(categoryMap.values());
  }
};

export default CatalogUtils;