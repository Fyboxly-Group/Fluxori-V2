/**
 * Amazon Sellers API Module
 * 
 * Provides access to seller account information and capabilities on Amazon marketplaces.
 * This module allows you to retrieve seller account details, check marketplace participation,
 * and verify feature access across different Amazon marketplaces.
 * 
 * Features:
 * - Get marketplace participation data (active/suspended status)
 * - Retrieve seller account information (ID, store name, business address)
 * - Check if a seller is active in specific marketplaces
 * - Get all marketplaces the seller is registered in
 * - Filter marketplaces by country code
 * - Check feature access for seller account
 * - Cache marketplace data for improved performance
 * 
 * Usage examples:
 * ```typescript
 * // Get all active marketplaces
 * const activeMarketplaces = await amazonClient.sellers.getActiveMarketplaces();
 * 
 * // Check if seller is active in a marketplace
 * const isActive = await amazonClient.sellers.isActiveInMarketplace('A2EUQ1WTGCTBG2');
 * 
 * // Get seller account information
 * const accountInfo = await amazonClient.sellers.getSellerAccountInfo();
 * 
 * // Get marketplaces by country
 * const ukMarketplaces = await amazonClient.sellers.getMarketplacesByCountry('GB');
 * ```
 * 
 * @module sellers
 */

export * from './sellers';
export * from './sellers-factory';