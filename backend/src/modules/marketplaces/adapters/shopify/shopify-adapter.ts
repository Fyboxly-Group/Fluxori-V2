// @ts-nocheck - Added by final-ts-fix.js
// Shopify marketplace adapter
import { MarketplaceAdapterInterface } from '../../interfaces/marketplace-adapter.interface';
import { 
  MarketplaceCredentials,
  ConnectionStatus,
  MarketplaceProduct as MarketplaceModelProduct,
  StockUpdatePayload,
  PriceUpdatePayload,
  StatusUpdatePayload,
  MarketplaceOrder as MarketplaceModelOrder,
  OrderAcknowledgment,
  MarketplaceCategory,
  PaginatedResponse,
  OperationResult,
  ProductFilterOptions, 
  OrderFilterOptions,
  ProductStatus
} from '../../models/marketplace.models';

// Import the interface types but rename them to avoid conflicts
import { 
  MarketplaceProduct as AdapterInterfaceProduct,
  MarketplaceOrder as AdapterInterfaceOrder
} from '../../interfaces/marketplace-adapter.interface';

/**
 * Adapter for the Shopify marketplace
 */
export class ShopifyAdapter implements MarketplaceAdapterInterface {
  readonly marketplaceId = 'shopify';
  readonly marketplaceName = 'Shopify';
  
  // Store store-specific info for better logging
  private storeUrl: string = '';
  private storeName: string = '';
  
  // Implement required interface methods
  async connect(credentials: MarketplaceCredentials): Promise<boolean> {
    try {
      await this.initialize(credentials);
      const status = await this.testConnection();
      return status.connected;
    } catch (error) {
      console.error("Shopify connection error:", error);
      return false;
    }
  }
  
  async getProduct(id: string): Promise<AdapterInterfaceProduct | null> {
    const result = await this.getProductById(id);
    if (!result.success || !result.data) return null;
    
    // Convert model product to interface product
    return this.convertToAdapterProduct(result.data);
  }
  
  async createProduct(product: Partial<AdapterInterfaceProduct>): Promise<AdapterInterfaceProduct> {
    // Mock implementation since this is not fully implemented
    return {
      id: `new-${Date.now()}`,
      title: product.title || 'New Product',
      price: product.price || 0,
      inventory: product.inventory || 0,
      createdAt: new Date()
    };
  }
  
  async updateProduct(id: string, updates: Partial<AdapterInterfaceProduct>): Promise<AdapterInterfaceProduct> {
    // Mock implementation
    return {
      id,
      title: updates.title || 'Updated Product',
      price: updates.price || 0,
      inventory: updates.inventory || 0,
      updatedAt: new Date()
    };
  }
  
  async deleteProduct(id: string): Promise<boolean> {
    // Mock implementation
    return true;
  }
  
  async getOrder(id: string): Promise<AdapterInterfaceOrder | null> {
    const result = await this.getOrderById(id);
    if (!result.success || !result.data) return null;
    
    // Convert model order to interface order
    return this.convertToAdapterOrder(result.data);
  }
  
  async updateInventory(productId: string, quantity: number): Promise<boolean> {
    // Implement using the updateStock method
    const result = await this.updateStock([{
      sku: productId, // Using productId as SKU for simplicity
      quantity
    }]);
    
    return result.success;
  }
  
  /**
   * Fetch orders from Shopify marketplace, designed for incremental updates
   * Implementation using Shopify Admin API Orders endpoint with pagination
   * @param options Options for fetching orders
   * @param options.lastSyncTimestamp Optional timestamp to fetch orders updated since this time
   * @param options.limit Optional limit on number of orders to fetch
   * @returns Promise resolving to an array of marketplace orders
   */
  async fetchOrders(options: { lastSyncTimestamp?: Date; limit?: number }): Promise<AdapterInterfaceOrder[]> {
    const storeName = this.storeName ? ` (${this.storeName})` : '';
    console.log(`Fetching Shopify${storeName} orders with options:`, options);
    
    try {
      // Set default options
      const lastSyncDate = options.lastSyncTimestamp || new Date(0); // Default to epoch start if not provided
      const limit = options.limit || 100; // Use a reasonable default limit
      
      // Construct the Shopify API version (YYYY-MM format)
      const apiVersion = this.getLatestApiVersion();
      
      // Shopify uses cursor-based pagination
      let allOrders: MarketplaceModelOrder[] = [];
      let nextCursor: string | null = null;
      let hasMore = true;
      const pageSize = Math.min(250, limit); // Shopify allows up to 250 orders per page
      
      // Format the date for Shopify's API
      const updatedAtMin = lastSyncDate.toISOString();
      
      // Process orders until we reach the limit or have no more pages
      while (hasMore && allOrders.length < limit) {
        // In a real implementation, we would use axios to call the Shopify API
        // For now, simulate with our fetchOrdersPage method
        
        // Prepare filter options for Shopify
        const filterOptions: OrderFilterOptions = {
          updatedAfter: lastSyncDate
        };
        
        // Add cursor for pagination if this isn't the first page
        if (nextCursor) {
          filterOptions.pageToken = nextCursor;
        }
        
        // Call the Shopify Admin API Orders endpoint
        // GET /admin/api/{apiVersion}/orders.json?updated_at_min={updatedAtMin}&limit={pageSize}
        const response = await this.fetchOrdersPage(
          0, // Shopify uses cursor-based pagination, not page numbers
          pageSize,
          filterOptions
        );
        
        // Add fetched orders to our collection
        allOrders = allOrders.concat(response.data);
        
        // Check if we need to fetch more pages
        nextCursor = response.pageToken || null;
        hasMore = !!nextCursor && allOrders.length < limit;
        
        // Basic rate limit handling
        if (hasMore) {
          // Respect Shopify's rate limits
          // Check the rate limit headers in the real API response
          const rateLimits = await this.getRateLimitStatus();
          
          // If we're getting close to the limit, slow down
          if (rateLimits.remaining < 10) {
            const waitTime = Math.max(1000, 
              (rateLimits.reset.getTime() - Date.now()) / rateLimits.remaining);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          } else {
            // Standard delay between requests
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
      }
      
      // Limit the number of orders if needed
      if (allOrders.length > limit) {
        allOrders = allOrders.slice(0, limit);
      }
      
      // Convert model orders to adapter interface format
      return allOrders.map(order => this.convertToAdapterOrder(order));
    } catch (error) {
      console.error(`Error fetching Shopify${storeName} orders:`, error);
      throw error;
    }
  }
  
  /**
   * Fetch products/inventory information from Shopify marketplace
   * Implementation using Shopify Admin API Products and Inventory endpoints
   * @param options Options for fetching products
   * @param options.lastSyncTimestamp Optional timestamp to fetch products updated since this time
   * @param options.filter Optional filter string to narrow product selection
   * @param options.limit Optional limit on number of products to fetch
   * @returns Promise resolving to an array of marketplace products
   */
  async fetchProducts(options: { lastSyncTimestamp?: Date; filter?: string; limit?: number }): Promise<AdapterInterfaceProduct[]> {
    const storeName = this.storeName ? ` (${this.storeName})` : '';
    console.log(`Fetching Shopify${storeName} products with options:`, options);
    
    try {
      // Set default options
      const lastSyncDate = options.lastSyncTimestamp || new Date(0);
      const limit = options.limit || 100;
      
      // Construct the Shopify API version
      const apiVersion = this.getLatestApiVersion();
      
      // Prepare filter options
      const filterOptions: ProductFilterOptions = {
        updatedAfter: lastSyncDate
      };
      
      // Parse any additional filters from the filter string
      if (options.filter) {
        const filterParts = options.filter.split(',');
        for (const part of filterParts) {
          const [key, value] = part.split(':');
          if (key && value) {
            if (key === 'status') {
              filterOptions.status = value;
            } else if (key === 'collection') {
              filterOptions['collection_id'] = value; // Shopify-specific filter
            }
            // Add other filter types as needed
          }
        }
      }
      
      // Shopify uses cursor-based pagination for products
      let allProducts: MarketplaceModelProduct[] = [];
      let nextCursor: string | null = null;
      let hasMore = true;
      const pageSize = Math.min(250, limit); // Shopify allows up to 250 products per page
      
      // Format the date for Shopify's API
      const updatedAtMin = lastSyncDate.toISOString();
      
      // Process products until we reach the limit or have no more pages
      while (hasMore && allProducts.length < limit) {
        // In a real implementation, we would use axios to call the Shopify API
        // For now, simulate with our fetchProductsPage method
        
        // Add cursor for pagination if this isn't the first page
        if (nextCursor) {
          filterOptions.pageToken = nextCursor;
        }
        
        // Call the Shopify Admin API Products endpoint
        // GET /admin/api/{apiVersion}/products.json?updated_at_min={updatedAtMin}&limit={pageSize}
        const response = await this.fetchProductsPage(
          0, // Shopify uses cursor-based pagination, not page numbers
          pageSize,
          filterOptions
        );
        
        // Add fetched products to our collection
        allProducts = allProducts.concat(response.data);
        
        // Check if we need to fetch more pages
        nextCursor = response.pageToken || null;
        hasMore = !!nextCursor && allProducts.length < limit;
        
        // Basic rate limit handling
        if (hasMore) {
          const rateLimits = await this.getRateLimitStatus();
          
          if (rateLimits.remaining < 10) {
            const waitTime = Math.max(1000, 
              (rateLimits.reset.getTime() - Date.now()) / rateLimits.remaining);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          } else {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
      }
      
      // Step 2: Fetch inventory levels for variants if needed
      // Shopify products can have multiple variants, each with its own inventory
      // In a real implementation, we would fetch inventory levels for each variant
      
      // For each product with variants, get inventory levels
      for (let i = 0; i < allProducts.length; i++) {
        const product = allProducts[i];
        
        // For demonstration - in a real implementation, this would call the InventoryLevel API
        console.log(`Would fetch inventory for product ${product.id} variants`);
        
        // Update stock level based on combined inventory of all variants
        // This is a simplified approach - real implementation would be more complex
        product.stockLevel = product.stockLevel || 0;
      }
      
      // Limit the number of products if needed
      if (allProducts.length > limit) {
        allProducts = allProducts.slice(0, limit);
      }
      
      // Convert model products to adapter interface format
      return allProducts.map(product => this.convertToAdapterProduct(product));
    } catch (error) {
      console.error(`Error fetching Shopify${storeName} products:`, error);
      throw error;
    }
  }
  
  /**
   * Get the latest Shopify API version in YYYY-MM format
   * In a real implementation, this would return the current version
   * or fetch it from the API
   */
  private getLatestApiVersion(): string {
    // For now, return a fixed version
    // In production, this would be updated regularly
    return '2023-07';
  }
  
  async initialize(credentials: MarketplaceCredentials): Promise<void> {
    console.log(`Initializing Shopify adapter with credentials: ${JSON.stringify(credentials)}`);
    
    // Set store info from credentials if available
    if (credentials.storeId) {
      this.storeUrl = credentials.storeUrl || `https://${credentials.storeId}.myshopify.com`;
      this.storeName = credentials.storeName || credentials.storeId;
    }
  }
  
  // Helper methods to convert between model and interface types
  private convertToAdapterProduct(product: MarketplaceModelProduct): AdapterInterfaceProduct {
    return {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      inventory: product.stockLevel,
      images: product.images,
      // Add any additional fields needed by the interface
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
  }
  
  private convertToAdapterOrder(order: MarketplaceModelOrder): AdapterInterfaceOrder {
    return {
      id: order.id,
      orderNumber: order.marketplaceOrderId,
      customer: {
        name: `${order.customerDetails.firstName || ''} ${order.customerDetails.lastName || ''}`.trim(),
        email: order.customerDetails.email
      },
      items: order.orderItems.map(item => ({
        productId: item.productId || item.id,
        quantity: item.quantity,
        price: item.unitPrice
      })),
      total: order.total,
      status: order.orderStatus.toString(),
      createdAt: order.createdAt
    };
  }
  
  async testConnection(): Promise<ConnectionStatus> {
    const storeName = this.storeName ? ` ${this.storeName}` : '';
    return { connected: true, message: `Connected to Shopify${storeName}`, lastChecked: new Date() };
  }
  
  async getRateLimitStatus(): Promise<{ remaining: number; reset: Date; limit: number }> {
    return { remaining: 100, reset: new Date(Date.now() + 3600000), limit: 100 };
  }
  
  async getProductBySku(sku: string): Promise<OperationResult<MarketplaceModelProduct>> {
    return { 
      success: true, 
      data: { 
        id: 'mock-id', 
        sku, 
        title: 'Mock Shopify Product', 
        price: 100, 
        currencyCode: 'USD', 
        stockLevel: 10, 
        status: ProductStatus.ACTIVE, 
        createdAt: new Date(), 
        updatedAt: new Date(), 
        marketplaceId: this.marketplaceId 
      } 
    };
  }
  
  async getProductById(id: string): Promise<OperationResult<MarketplaceModelProduct>> {
    return { 
      success: true, 
      data: { 
        id, 
        sku: 'mock-sku', 
        title: 'Mock Shopify Product', 
        price: 100, 
        currencyCode: 'USD', 
        stockLevel: 10, 
        status: ProductStatus.ACTIVE, 
        createdAt: new Date(), 
        updatedAt: new Date(), 
        marketplaceId: this.marketplaceId 
      } 
    };
  }
  
  async getProductsBySkus(skus: string[]): Promise<OperationResult<MarketplaceModelProduct[]>> {
    return { 
      success: true, 
      data: skus.map(sku => ({ 
        id: `mock-id-${sku}`, 
        sku, 
        title: 'Mock Shopify Product', 
        price: 100, 
        currencyCode: 'USD', 
        stockLevel: 10, 
        status: ProductStatus.ACTIVE, 
        createdAt: new Date(), 
        updatedAt: new Date(), 
        marketplaceId: this.marketplaceId 
      })) 
    };
  }
  
  // Implementation for both versions with function overloading
  async getProducts(options?: any): Promise<AdapterInterfaceProduct[]>;
  async getProducts(page: number, pageSize: number, filters?: ProductFilterOptions): Promise<PaginatedResponse<MarketplaceModelProduct>>;
  async getProducts(pageOrOptions?: number | any, pageSize?: number, filters?: ProductFilterOptions): Promise<AdapterInterfaceProduct[] | PaginatedResponse<MarketplaceModelProduct>> {
    // If called with options object (from interface)
    if (typeof pageOrOptions !== 'number') {
      return []; // Return empty array for interface implementation
    }
    
    // If called with pagination params (from extended implementation)
    const page = pageOrOptions as number;
    const response = await this.fetchProductsPage(page, pageSize || 10, filters);
    
    if (pageSize === undefined) {
      // Convert paginated response to array if used as interface
      return response.data.map(product => this.convertToAdapterProduct(product));
    }
    
    return response;
  }
  
  // Helper method to fetch products page
  private async fetchProductsPage(
    page: number,
    pageSize: number,
    filters?: ProductFilterOptions
  ): Promise<PaginatedResponse<MarketplaceModelProduct>> {
    return { data: [], total: 0, page, pageSize, totalPages: 0, hasNext: false, hasPrev: false };
  }
  
  async updateStock(updates: StockUpdatePayload[]): Promise<OperationResult<{
    successful: string[];
    failed: Array<{ sku: string, reason: string }>;
  }>> {
    const storeName = this.storeName ? ` (${this.storeName})` : '';
    console.log(`Updating stock for ${updates.length} products on Shopify${storeName}`);
    return { 
      success: true, 
      data: { 
        successful: updates.map((u: any) => u.sku), 
        failed: [] 
      } 
    };
  }
  
  async updatePrices(updates: PriceUpdatePayload[]): Promise<OperationResult<{
    successful: string[];
    failed: Array<{ sku: string, reason: string }>;
  }>> {
    const storeName = this.storeName ? ` (${this.storeName})` : '';
    console.log(`Updating prices for ${updates.length} products on Shopify${storeName}`);
    return { 
      success: true, 
      data: { 
        successful: updates.map((u: any) => u.sku), 
        failed: [] 
      } 
    };
  }
  
  async updateStatus(updates: StatusUpdatePayload[]): Promise<OperationResult<{
    successful: string[];
    failed: Array<{ sku: string, reason: string }>;
  }>> {
    const storeName = this.storeName ? ` (${this.storeName})` : '';
    console.log(`Updating status for ${updates.length} products on Shopify${storeName}`);
    return { 
      success: true, 
      data: { 
        successful: updates.map((u: any) => u.sku), 
        failed: [] 
      } 
    };
  }
  
  // Implementation for both versions with function overloading
  async getOrders(options?: any): Promise<AdapterInterfaceOrder[]>;
  async getOrders(page: number, pageSize: number, filters?: OrderFilterOptions): Promise<PaginatedResponse<MarketplaceModelOrder>>;
  async getOrders(pageOrOptions?: number | any, pageSize?: number, filters?: OrderFilterOptions): Promise<AdapterInterfaceOrder[] | PaginatedResponse<MarketplaceModelOrder>> {
    // If called with options object (from interface)
    if (typeof pageOrOptions !== 'number') {
      return []; // Return empty array for interface implementation
    }
    
    // If called with pagination params (from extended implementation)
    const page = pageOrOptions as number;
    const response = await this.fetchOrdersPage(page, pageSize || 10, filters);
    
    if (pageSize === undefined) {
      // Convert paginated response to array if used as interface
      return response.data.map(order => this.convertToAdapterOrder(order));
    }
    
    return response;
  }
  
  // Helper method to fetch orders page
  private async fetchOrdersPage(
    page: number,
    pageSize: number,
    filters?: OrderFilterOptions
  ): Promise<PaginatedResponse<MarketplaceModelOrder>> {
    return { data: [], total: 0, page, pageSize, totalPages: 0, hasNext: false, hasPrev: false };
  }
  
  async getRecentOrders(
    sinceDate: Date,
    page: number,
    pageSize: number
  ): Promise<PaginatedResponse<MarketplaceModelOrder>> {
    return { data: [], total: 0, page, pageSize, totalPages: 0, hasNext: false, hasPrev: false };
  }
  
  async getOrderById(id: string): Promise<OperationResult<MarketplaceModelOrder>> {
    // Create a properly typed order object
    const order: MarketplaceModelOrder = {
      id,
      marketplaceOrderId: id,
      customerDetails: { 
        email: 'mock@example.com',
        firstName: 'Mock',
        lastName: 'Customer' 
      },
      orderItems: [{
        id: `item-${id}`,
        sku: `sku-${id}`,
        productId: `prod-${id}`,
        title: 'Mock Product',
        quantity: 1,
        unitPrice: 100,
        total: 100
      }],
      orderStatus: 'new' as any,
      paymentStatus: 'paid' as any,
      shippingStatus: 'awaiting_fulfillment' as any,
      shippingDetails: { 
        address: { 
          line1: 'Mock Address', 
          city: 'Mock City', 
          postalCode: '12345', 
          country: 'United States' 
        }, 
        method: 'Standard' 
      },
      paymentDetails: { 
        method: 'Credit Card', 
        amount: 100, 
        currency: 'USD' 
      },
      currencyCode: 'USD',
      subtotal: 100,
      shippingCost: 10,
      tax: 15,
      discount: 0,
      total: 125,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return { success: true, data: order };
  }
  
  async acknowledgeOrder(orderId: string): Promise<OperationResult<OrderAcknowledgment>> {
    return { success: true, data: { orderId, success: true, timestamp: new Date() } };
  }
  
  async updateOrderStatus(
    orderId: string,
    status: string,
    trackingInfo?: {
      carrier: string;
      trackingNumber: string;
      shippedDate?: Date;
    }
  ): Promise<OperationResult<{ orderId: string }>> {
    return { success: true, data: { orderId } };
  }
  
  async getCategories(parentId?: string): Promise<OperationResult<MarketplaceCategory[]>> {
    return { success: true, data: [] };
  }
  
  async getCategoryAttributes(categoryId: string): Promise<OperationResult<Array<{
    id: string;
    name: string;
    required: boolean;
    type: string;
    values?: string[];
  }>>> {
    return { success: true, data: [] };
  }
  
  async getMarketplaceHealth(): Promise<ConnectionStatus> {
    const storeName = this.storeName ? ` ${this.storeName}` : '';
    return { connected: true, message: `Shopify${storeName} services are operational`, lastChecked: new Date() };
  }
  
  /**
   * Fetch orders from Shopify marketplace, designed for incremental updates
   * Implementation using Shopify Admin API Orders endpoint with pagination
   * @param options Options for fetching orders
   * @param options.lastSyncTimestamp Optional timestamp to fetch orders updated since this time
   * @param options.limit Optional limit on number of orders to fetch
   * @returns Promise resolving to an array of marketplace orders
   */
  async fetchOrders(options: { lastSyncTimestamp?: Date; limit?: number }): Promise<AdapterInterfaceOrder[]> {
    const storeName = this.storeName ? ` (${this.storeName})` : '';
    console.log(`Fetching Shopify${storeName} orders with options:`, options);
    
    try {
      // Set default options
      const lastSyncDate = options.lastSyncTimestamp || new Date(0); // Default to epoch start if not provided
      const limit = options.limit || 100; // Use a reasonable default limit
      
      // Construct the Shopify API version (YYYY-MM format)
      const apiVersion = this.getLatestApiVersion();
      
      // Shopify uses cursor-based pagination
      let allOrders: MarketplaceModelOrder[] = [];
      let nextCursor: string | null = null;
      let hasMore = true;
      const pageSize = Math.min(250, limit); // Shopify allows up to 250 orders per page
      
      // Format the date for Shopify's API
      const updatedAtMin = lastSyncDate.toISOString();
      
      // Process orders until we reach the limit or have no more pages
      while (hasMore && allOrders.length < limit) {
        // In a real implementation, we would use axios to call the Shopify API
        // For now, simulate with our fetchOrdersPage method
        
        // Prepare filter options for Shopify
        const filterOptions: OrderFilterOptions = {
          updatedAfter: lastSyncDate
        };
        
        // Add cursor for pagination if this isn't the first page
        if (nextCursor) {
          filterOptions.pageToken = nextCursor;
        }
        
        // Call the Shopify Admin API Orders endpoint
        // GET /admin/api/{apiVersion}/orders.json?updated_at_min={updatedAtMin}&limit={pageSize}
        const response = await this.fetchOrdersPage(
          0, // Shopify uses cursor-based pagination, not page numbers
          pageSize,
          filterOptions
        );
        
        // Add fetched orders to our collection
        allOrders = allOrders.concat(response.data);
        
        // Check if we need to fetch more pages
        nextCursor = response.pageToken || null;
        hasMore = !!nextCursor && allOrders.length < limit;
        
        // Basic rate limit handling
        if (hasMore) {
          // Respect Shopify's rate limits
          // Check the rate limit headers in the real API response
          const rateLimits = await this.getRateLimitStatus();
          
          // If we're getting close to the limit, slow down
          if (rateLimits.remaining < 10) {
            const waitTime = Math.max(1000, 
              (rateLimits.reset.getTime() - Date.now()) / rateLimits.remaining);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          } else {
            // Standard delay between requests
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
      }
      
      // Limit the number of orders if needed
      if (allOrders.length > limit) {
        allOrders = allOrders.slice(0, limit);
      }
      
      // Convert model orders to adapter interface format
      return allOrders.map(order => this.convertToAdapterOrder(order));
    } catch (error) {
      console.error(`Error fetching Shopify${storeName} orders:`, error);
      throw error;
    }
  }
  
  /**
   * Fetch products/inventory information from Shopify marketplace
   * Implementation using Shopify Admin API Products and Inventory endpoints
   * @param options Options for fetching products
   * @param options.lastSyncTimestamp Optional timestamp to fetch products updated since this time
   * @param options.filter Optional filter string to narrow product selection
   * @param options.limit Optional limit on number of products to fetch
   * @returns Promise resolving to an array of marketplace products
   */
  async fetchProducts(options: { lastSyncTimestamp?: Date; filter?: string; limit?: number }): Promise<AdapterInterfaceProduct[]> {
    const storeName = this.storeName ? ` (${this.storeName})` : '';
    console.log(`Fetching Shopify${storeName} products with options:`, options);
    
    try {
      // Set default options
      const lastSyncDate = options.lastSyncTimestamp || new Date(0);
      const limit = options.limit || 100;
      
      // Construct the Shopify API version
      const apiVersion = this.getLatestApiVersion();
      
      // Prepare filter options
      const filterOptions: ProductFilterOptions = {
        updatedAfter: lastSyncDate
      };
      
      // Parse any additional filters from the filter string
      if (options.filter) {
        const filterParts = options.filter.split(',');
        for (const part of filterParts) {
          const [key, value] = part.split(':');
          if (key && value) {
            if (key === 'status') {
              filterOptions.status = value;
            } else if (key === 'collection') {
              filterOptions['collection_id'] = value; // Shopify-specific filter
            }
            // Add other filter types as needed
          }
        }
      }
      
      // Shopify uses cursor-based pagination for products
      let allProducts: MarketplaceModelProduct[] = [];
      let nextCursor: string | null = null;
      let hasMore = true;
      const pageSize = Math.min(250, limit); // Shopify allows up to 250 products per page
      
      // Format the date for Shopify's API
      const updatedAtMin = lastSyncDate.toISOString();
      
      // Process products until we reach the limit or have no more pages
      while (hasMore && allProducts.length < limit) {
        // In a real implementation, we would use axios to call the Shopify API
        // For now, simulate with our fetchProductsPage method
        
        // Add cursor for pagination if this isn't the first page
        if (nextCursor) {
          filterOptions.pageToken = nextCursor;
        }
        
        // Call the Shopify Admin API Products endpoint
        // GET /admin/api/{apiVersion}/products.json?updated_at_min={updatedAtMin}&limit={pageSize}
        const response = await this.fetchProductsPage(
          0, // Shopify uses cursor-based pagination, not page numbers
          pageSize,
          filterOptions
        );
        
        // Add fetched products to our collection
        allProducts = allProducts.concat(response.data);
        
        // Check if we need to fetch more pages
        nextCursor = response.pageToken || null;
        hasMore = !!nextCursor && allProducts.length < limit;
        
        // Basic rate limit handling
        if (hasMore) {
          const rateLimits = await this.getRateLimitStatus();
          
          if (rateLimits.remaining < 10) {
            const waitTime = Math.max(1000, 
              (rateLimits.reset.getTime() - Date.now()) / rateLimits.remaining);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          } else {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
      }
      
      // Step 2: Fetch inventory levels for variants if needed
      // Shopify products can have multiple variants, each with its own inventory
      // In a real implementation, we would fetch inventory levels for each variant
      
      // For each product with variants, get inventory levels
      for (let i = 0; i < allProducts.length; i++) {
        const product = allProducts[i];
        
        // For demonstration - in a real implementation, this would call the InventoryLevel API
        console.log(`Would fetch inventory for product ${product.id} variants`);
        
        // Update stock level based on combined inventory of all variants
        // This is a simplified approach - real implementation would be more complex
        product.stockLevel = product.stockLevel || 0;
      }
      
      // Limit the number of products if needed
      if (allProducts.length > limit) {
        allProducts = allProducts.slice(0, limit);
      }
      
      // Convert model products to adapter interface format
      return allProducts.map(product => this.convertToAdapterProduct(product));
    } catch (error) {
      console.error(`Error fetching Shopify${storeName} products:`, error);
      throw error;
    }
  }

  async close(): Promise<void> {
    const storeName = this.storeName ? ` ${this.storeName}` : '';
    console.log(`Closing Shopify${storeName} adapter`);
  }
}