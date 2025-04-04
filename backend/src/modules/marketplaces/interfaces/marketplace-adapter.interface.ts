/**
 * Base marketplace adapter interface
 * Defines the common interface that all marketplace adapters must implement
 */

import { MarketplaceCredentials } from './marketplace-credentials.interface';
import { 
  MarketplaceProduct,
  MarketplaceOrder, 
  MarketplaceOrderStatus, 
  MarketplaceInventoryUpdate,
  MarketplaceCatalogOptions,
  MarketplaceOrderOptions,
  MarketplaceProductOptions,
  MarketplaceWebhookPayload
} from '../types/marketplace.types';

/**
 * Base marketplace adapter interface
 */
export interface IMarketplaceAdapter {
  /**
   * The name of the marketplace (e.g., 'amazon', 'shopify')
   */
  readonly marketplaceName: string;
  
  /**
   * The marketplace connection ID (used for authentication)
   */
  readonly connectionId: string;
  
  /**
   * Gets the current marketplace credentials
   */
  getCredentials(): MarketplaceCredentials;
  
  /**
   * Updates the marketplace credentials
   */
  updateCredentials(credentials: MarketplaceCredentials): Promise<boolean>;
  
  /**
   * Tests the connection to the marketplace
   */
  testConnection(): Promise<boolean>;
  
  /**
   * Gets products from the marketplace
   */
  getProducts(options?: MarketplaceProductOptions): Promise<MarketplaceProduct[]>;
  
  /**
   * Gets a specific product by ID
   */
  getProductById(productId: string): Promise<MarketplaceProduct | null>;
  
  /**
   * Creates a new product on the marketplace
   */
  createProduct(product: MarketplaceProduct): Promise<MarketplaceProduct>;
  
  /**
   * Updates an existing product on the marketplace
   */
  updateProduct(productId: string, product: Partial<MarketplaceProduct>): Promise<MarketplaceProduct>;
  
  /**
   * Uploads product images to the marketplace
   */
  uploadProductImages(productId: string, imageUrls: string[]): Promise<string[]>;
  
  /**
   * Deletes a product from the marketplace
   */
  deleteProduct(productId: string): Promise<boolean>;
  
  /**
   * Gets orders from the marketplace
   */
  getOrders(options?: MarketplaceOrderOptions): Promise<MarketplaceOrder[]>;
  
  /**
   * Gets a specific order by ID
   */
  getOrderById(orderId: string): Promise<MarketplaceOrder | null>;
  
  /**
   * Updates an order's status on the marketplace
   */
  updateOrderStatus(orderId: string, status: MarketplaceOrderStatus): Promise<MarketplaceOrder>;
  
  /**
   * Cancels an order on the marketplace
   */
  cancelOrder(orderId: string, reason?: string): Promise<boolean>;
  
  /**
   * Updates inventory levels on the marketplace
   */
  updateInventory(updates: MarketplaceInventoryUpdate[]): Promise<boolean>;
  
  /**
   * Handles a webhook payload from the marketplace
   */
  handleWebhook(payload: MarketplaceWebhookPayload): Promise<any>;
  
  /**
   * Gets the marketplace catalog (categories, attributes, etc.)
   */
  getCatalog(options?: MarketplaceCatalogOptions): Promise<any>;
  
  /**
   * Fetch orders from the marketplace, designed for incremental updates
   * @param options Options for fetching orders
   * @param options.lastSyncTimestamp Optional timestamp to fetch orders updated since this time
   * @param options.limit Optional limit on number of orders to fetch
   * @returns Promise resolving to an array of marketplace orders
   */
  fetchOrders(options: { lastSyncTimestamp?: Date; limit?: number }): Promise<MarketplaceOrder[]>;
  
  /**
   * Fetch products/inventory information from the marketplace
   * @param options Options for fetching products
   * @param options.lastSyncTimestamp Optional timestamp to fetch products updated since this time
   * @param options.filter Optional filter string to narrow product selection
   * @param options.limit Optional limit on number of products to fetch
   * @returns Promise resolving to an array of marketplace products
   */
  fetchProducts(options: { lastSyncTimestamp?: Date; filter?: string; limit?: number }): Promise<MarketplaceProduct[]>;
}

/**
 * Extended marketplace adapter interface with optional capabilities
 */
export interface IExtendedMarketplaceAdapter extends IMarketplaceAdapter {
  /**
   * Gets the pricing information for a specific product
   */
  getProductPricing?(productId: string): Promise<any>;
  
  /**
   * Gets competitor pricing for a specific product
   */
  getCompetitorPricing?(productId: string): Promise<any[]>;
  
  /**
   * Updates the pricing for a specific product
   */
  updateProductPricing?(productId: string, price: number, salePrice?: number): Promise<boolean>;
  
  /**
   * Gets fulfillment options for a specific order
   */
  getFulfillmentOptions?(orderId: string): Promise<any[]>;
  
  /**
   * Creates a fulfillment for a specific order
   */
  createFulfillment?(orderId: string, items: any[], trackingInfo?: any): Promise<any>;
  
  /**
   * Gets a report from the marketplace
   */
  getReport?(reportType: string, startDate?: Date, endDate?: Date): Promise<any>;
  
  /**
   * Gets advertising data for products
   */
  getAdvertisingData?(productIds: string[]): Promise<any>;
  
  /**
   * Updates advertising settings for products
   */
  updateAdvertising?(productId: string, settings: any): Promise<any>;
}

/**
 * Base abstract class that provides common functionality for marketplace adapters
 */
export abstract class BaseMarketplaceAdapter implements IMarketplaceAdapter {
  private credentials: MarketplaceCredentials;
  
  constructor(
    public readonly marketplaceName: string,
    public readonly connectionId: string,
    credentials: MarketplaceCredentials
  ) {
    this.credentials = credentials;
  }
  
  /**
   * Gets the current marketplace credentials
   */
  getCredentials(): MarketplaceCredentials {
    return this.credentials;
  }
  
  /**
   * Updates the marketplace credentials
   */
  updateCredentials(credentials: MarketplaceCredentials): Promise<boolean> {
    this.credentials = credentials;
    return Promise.resolve(true);
  }
  
  /**
   * Tests the connection to the marketplace
   * This method should be overridden by concrete implementations
   */
  abstract testConnection(): Promise<boolean>;
  
  /**
   * Gets products from the marketplace
   * This method should be overridden by concrete implementations
   */
  abstract getProducts(options?: MarketplaceProductOptions): Promise<MarketplaceProduct[]>;
  
  /**
   * Gets a specific product by ID
   * This method should be overridden by concrete implementations
   */
  abstract getProductById(productId: string): Promise<MarketplaceProduct | null>;
  
  /**
   * Creates a new product on the marketplace
   * This method should be overridden by concrete implementations
   */
  abstract createProduct(product: MarketplaceProduct): Promise<MarketplaceProduct>;
  
  /**
   * Updates an existing product on the marketplace
   * This method should be overridden by concrete implementations
   */
  abstract updateProduct(productId: string, product: Partial<MarketplaceProduct>): Promise<MarketplaceProduct>;
  
  /**
   * Uploads product images to the marketplace
   * This method should be overridden by concrete implementations
   */
  abstract uploadProductImages(productId: string, imageUrls: string[]): Promise<string[]>;
  
  /**
   * Deletes a product from the marketplace
   * This method should be overridden by concrete implementations
   */
  abstract deleteProduct(productId: string): Promise<boolean>;
  
  /**
   * Gets orders from the marketplace
   * This method should be overridden by concrete implementations
   */
  abstract getOrders(options?: MarketplaceOrderOptions): Promise<MarketplaceOrder[]>;
  
  /**
   * Gets a specific order by ID
   * This method should be overridden by concrete implementations
   */
  abstract getOrderById(orderId: string): Promise<MarketplaceOrder | null>;
  
  /**
   * Updates an order's status on the marketplace
   * This method should be overridden by concrete implementations
   */
  abstract updateOrderStatus(orderId: string, status: MarketplaceOrderStatus): Promise<MarketplaceOrder>;
  
  /**
   * Cancels an order on the marketplace
   * This method should be overridden by concrete implementations
   */
  abstract cancelOrder(orderId: string, reason?: string): Promise<boolean>;
  
  /**
   * Updates inventory levels on the marketplace
   * This method should be overridden by concrete implementations
   */
  abstract updateInventory(updates: MarketplaceInventoryUpdate[]): Promise<boolean>;
  
  /**
   * Handles a webhook payload from the marketplace
   * This method should be overridden by concrete implementations
   */
  abstract handleWebhook(payload: MarketplaceWebhookPayload): Promise<any>;
  
  /**
   * Gets the marketplace catalog (categories, attributes, etc.)
   * This method should be overridden by concrete implementations
   */
  abstract getCatalog(options?: MarketplaceCatalogOptions): Promise<any>;
  
  /**
   * Fetch orders from the marketplace
   * This method should be overridden by concrete implementations
   */
  abstract fetchOrders(options: { lastSyncTimestamp?: Date; limit?: number }): Promise<MarketplaceOrder[]>;
  
  /**
   * Fetch products from the marketplace
   * This method should be overridden by concrete implementations
   */
  abstract fetchProducts(options: { lastSyncTimestamp?: Date; filter?: string; limit?: number }): Promise<MarketplaceProduct[]>;
  
  /**
   * Utility method to format error responses consistently
   */
  protected formatError(error: unknown, message = 'Marketplace operation failed'): Error {
    if (error instanceof Error) {
      return new Error(`${message}: ${error.message}`);
    }
    return new Error(`${message}: ${String(error)}`);
  }
}