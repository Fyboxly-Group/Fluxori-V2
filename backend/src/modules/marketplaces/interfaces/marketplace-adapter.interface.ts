/**
 * Marketplace Adapter Interface
 * 
 * This interface defines the contract for all marketplace adapters.
 */

export interface MarketplaceCredentials {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  [key: string]: any;
}

export interface MarketplaceProduct {
  id: string;
  title: string;
  description?: string;
  price: number;
  inventory?: number;
  images?: string[];
  [key: string]: any;
}

export interface MarketplaceOrder {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    [key: string]: any;
  };
  items: {
    productId: string;
    quantity: number;
    price: number;
    [key: string]: any;
  }[];
  total: number;
  status: string;
  createdAt: Date;
  [key: string]: any;
}

export interface MarketplaceAdapterInterface {
  /**
   * Connect to the marketplace API
   */
  connect(credentials: MarketplaceCredentials): Promise<boolean>;
  
  /**
   * Get products from the marketplace
   */
  getProducts(options?: any): Promise<MarketplaceProduct[]>;
  
  /**
   * Get a product by ID
   */
  getProduct(id: string): Promise<MarketplaceProduct | null>;
  
  /**
   * Create a product in the marketplace
   */
  createProduct(product: Partial<MarketplaceProduct>): Promise<MarketplaceProduct>;
  
  /**
   * Update a product in the marketplace
   */
  updateProduct(id: string, updates: Partial<MarketplaceProduct>): Promise<MarketplaceProduct>;
  
  /**
   * Delete a product from the marketplace
   */
  deleteProduct(id: string): Promise<boolean>;
  
  /**
   * Get orders from the marketplace
   */
  getOrders(options?: any): Promise<MarketplaceOrder[]>;
  
  /**
   * Get an order by ID
   */
  getOrder(id: string): Promise<MarketplaceOrder | null>;
  
  /**
   * Update inventory for a product
   */
  updateInventory(productId: string, quantity: number): Promise<boolean>;
  
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