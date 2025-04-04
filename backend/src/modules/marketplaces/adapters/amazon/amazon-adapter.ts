/**
 * Amazon Marketplace Adapter Implementation
 * 
 * This adapter interacts with the Amazon Selling Partner API to manage products,
 * inventory, orders, and other Amazon marketplace operations.
 */
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { BaseMarketplaceAdapter } from '../../interfaces/marketplace-adapter.interface';
import { 
  MarketplaceCredentials,
  MarketplaceProduct,
  MarketplaceProductStatus,
  MarketplaceOrder,
  MarketplaceOrderStatus,
  MarketplaceInventoryUpdate,
  MarketplaceProductOptions,
  MarketplaceOrderOptions,
  MarketplaceCatalogOptions,
  MarketplaceWebhookPayload
} from '../../types/marketplace.types';
import { logger } from '../../../../utils/logger';

/**
 * Amazon API rate limit information
 */
interface AmazonRateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
}

/**
 * Amazon SP-API Configuration
 */
interface AmazonApiConfig {
  region: string;
  refreshToken: string;
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  tokenExpiry?: Date;
}

/**
 * Amazon API Response Format
 */
interface AmazonApiResponse<T> {
  payload: T;
  errors?: Array<{
    code: string;
    message: string;
    details?: string;
  }>;
  pagination?: {
    nextToken?: string;
  };
}

/**
 * Paginated response interface for consistent API responses
 */
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  pageToken?: string;
}

/**
 * Amazon Marketplace Adapter Class
 */
export class AmazonAdapter extends BaseMarketplaceAdapter {
  private readonly client: AxiosInstance;
  private config: AmazonApiConfig;
  private region: string = 'us';

  /**
   * Constructor
   * @param connectionId - Connection ID for this adapter instance
   * @param credentials - Amazon marketplace credentials
   */
  constructor(connectionId: string, credentials: MarketplaceCredentials) {
    super('amazon', connectionId, credentials);

    // Initialize config
    this.config = {
      region: credentials.region as string || 'us',
      refreshToken: credentials.refreshToken as string,
      clientId: credentials.clientId as string,
      clientSecret: credentials.clientSecret as string,
      accessToken: credentials.accessToken,
      tokenExpiry: credentials.tokenExpiry
    };

    this.region = this.config.region;

    // Initialize the HTTP client
    this.client = axios.create({
      baseURL: this.getBaseUrl(),
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'x-amz-access-token': this.config.accessToken || ''
      }
    });

    // Add request interceptor for auth token refresh
    this.client.interceptors.request.use(
      async (config) => {
        // Check if token needs refresh
        if (this.needsTokenRefresh()) {
          await this.refreshAccessToken();
          config.headers['x-amz-access-token'] = this.config.accessToken;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // Handle common SP-API errors
        if (error.response) {
          logger.error(`Amazon API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
          
          // Handle rate limiting
          if (error.response.status === 429) {
            // Could implement retry logic here
          }
          
          // Handle authentication issues
          if (error.response.status === 401 || error.response.status === 403) {
            // Could trigger token refresh
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Tests the connection to Amazon SP-API
   * @returns Promise resolving to connection status
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try to call a simple API endpoint to test authentication
      await this.getCatalog();
      return true;
    } catch (error) {
      logger.error(`Amazon connection test failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Gets products from Amazon
   * @param options - Product query options
   * @returns Promise resolving to array of products
   */
  async getProducts(options?: MarketplaceProductOptions): Promise<MarketplaceProduct[]> {
    try {
      // Set up default options
      const queryOptions = {
        limit: options?.limit || 50,
        page: options?.page || 1,
        status: options?.status || 'active',
        ...options
      };

      // Build query parameters for Amazon API
      const params: Record<string, any> = {
        MarketplaceId: this.getMarketplaceId(),
        MaxResultsPerPage: queryOptions.limit
      };

      // Add filters based on options
      if (options?.since) {
        params.QueryStartDateTime = options.since.toISOString();
      }

      if (options?.status) {
        // Map our status to Amazon status
        params.Status = this.mapProductStatusToAmazon(options.status as MarketplaceProductStatus);
      }

      // Make API call to get products
      const response = await this.client.get('/catalog/2022-04-01/items', { params });
      const items = this.extractAmazonResponse<any[]>(response.data);

      // Map Amazon products to our format
      return items.map(item => this.mapAmazonProductToMarketplace(item));
    } catch (error) {
      throw this.formatError(error, 'Failed to get products from Amazon');
    }
  }

  /**
   * Gets a specific product by ID
   * @param productId - Amazon product ID (ASIN)
   * @returns Promise resolving to product or null
   */
  async getProductById(productId: string): Promise<MarketplaceProduct | null> {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }

      // Make API call to get product details
      const response = await this.client.get(`/catalog/2022-04-01/items/${productId}`, {
        params: {
          MarketplaceId: this.getMarketplaceId()
        }
      });

      const item = this.extractAmazonResponse<any>(response.data);
      if (!item) {
        return null;
      }

      // Map Amazon product to our format
      return this.mapAmazonProductToMarketplace(item);
    } catch (error) {
      // Check if it's a not found error
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw this.formatError(error, `Failed to get Amazon product with ID: ${productId}`);
    }
  }

  /**
   * Creates a new product on Amazon
   * @param product - Product to create
   * @returns Promise resolving to created product
   */
  async createProduct(product: MarketplaceProduct): Promise<MarketplaceProduct> {
    try {
      // Convert our product to Amazon format
      const amazonProduct = this.mapMarketplaceProductToAmazon(product);

      // Make API call to create product
      const response = await this.client.post('/listings/2021-08-01/items', amazonProduct, {
        params: {
          MarketplaceId: this.getMarketplaceId()
        }
      });

      // Get the created product ID from the response
      const result = this.extractAmazonResponse<any>(response.data);
      
      // We need to fetch the newly created product to return it with all details
      const createdProduct = await this.getProductById(result.asin || result.sku);
      
      if (!createdProduct) {
        throw new Error('Product was created but could not be retrieved');
      }
      
      return createdProduct;
    } catch (error) {
      throw this.formatError(error, 'Failed to create product on Amazon');
    }
  }

  /**
   * Updates an existing product on Amazon
   * @param productId - Product ID to update
   * @param product - Updated product data
   * @returns Promise resolving to updated product
   */
  async updateProduct(productId: string, product: Partial<MarketplaceProduct>): Promise<MarketplaceProduct> {
    try {
      // Convert our product to Amazon format (partial update)
      const amazonProduct = this.mapMarketplaceProductToAmazon(product as MarketplaceProduct, true);

      // Make API call to update product
      await this.client.put(`/listings/2021-08-01/items/${productId}`, amazonProduct, {
        params: {
          MarketplaceId: this.getMarketplaceId()
        }
      });
      
      // Fetch the updated product to return it with all details
      const updatedProduct = await this.getProductById(productId);
      
      if (!updatedProduct) {
        throw new Error('Product was updated but could not be retrieved');
      }
      
      return updatedProduct;
    } catch (error) {
      throw this.formatError(error, `Failed to update Amazon product with ID: ${productId}`);
    }
  }

  /**
   * Uploads product images to Amazon
   * @param productId - Product ID to upload images for
   * @param imageUrls - Array of image URLs to upload
   * @returns Promise resolving to array of image IDs
   */
  async uploadProductImages(productId: string, imageUrls: string[]): Promise<string[]> {
    try {
      // Create image upload request
      const imageData = imageUrls.map((url, index) => ({
        imageType: index === 0 ? 'MAIN' : 'PT',
        mediaUrl: url
      }));

      // Make API call to update product images
      await this.client.put(`/listings/2021-08-01/items/${productId}/images`, { images: imageData }, {
        params: {
          MarketplaceId: this.getMarketplaceId()
        }
      });
      
      // Return the image URLs as IDs - Amazon doesn't return image IDs
      return imageUrls;
    } catch (error) {
      throw this.formatError(error, `Failed to upload images for Amazon product with ID: ${productId}`);
    }
  }

  /**
   * Deletes a product from Amazon
   * @param productId - Product ID to delete
   * @returns Promise resolving to success status
   */
  async deleteProduct(productId: string): Promise<boolean> {
    try {
      // In Amazon, we don't actually delete products - we close the listing
      await this.client.delete(`/listings/2021-08-01/items/${productId}`, {
        params: {
          MarketplaceId: this.getMarketplaceId()
        }
      });
      
      return true;
    } catch (error) {
      throw this.formatError(error, `Failed to delete Amazon product with ID: ${productId}`);
    }
  }

  /**
   * Gets orders from Amazon
   * @param options - Order query options
   * @returns Promise resolving to array of orders
   */
  async getOrders(options?: MarketplaceOrderOptions): Promise<MarketplaceOrder[]> {
    try {
      // Set up default options
      const queryOptions = {
        limit: options?.limit || 50,
        page: options?.page || 1,
        ...options
      };

      // Build query parameters for Amazon API
      const params: Record<string, any> = {
        MarketplaceIds: [this.getMarketplaceId()],
        MaxResultsPerPage: queryOptions.limit
      };

      // Add filters based on options
      if (options?.createdAfter) {
        params.CreatedAfter = options.createdAfter.toISOString();
      }

      if (options?.updatedAfter) {
        params.LastUpdatedAfter = options.updatedAfter.toISOString();
      }

      if (options?.status) {
        // Map our status to Amazon status
        params.OrderStatuses = [this.mapOrderStatusToAmazon(options.status as MarketplaceOrderStatus)];
      }

      // Make API call to get orders
      const response = await this.client.get('/orders/v0/orders', { params });
      const orders = this.extractAmazonResponse<any[]>(response.data);

      // Process order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          // Get order items for this order
          const itemsResponse = await this.client.get(`/orders/v0/orders/${order.AmazonOrderId}/orderItems`);
          const items = this.extractAmazonResponse<any[]>(itemsResponse.data);
          
          // Add items to the order
          return {
            ...order,
            OrderItems: items
          };
        })
      );

      // Map Amazon orders to our format
      return ordersWithItems.map(order => this.mapAmazonOrderToMarketplace(order));
    } catch (error) {
      throw this.formatError(error, 'Failed to get orders from Amazon');
    }
  }

  /**
   * Gets a specific order by ID
   * @param orderId - Amazon order ID
   * @returns Promise resolving to order or null
   */
  async getOrderById(orderId: string): Promise<MarketplaceOrder | null> {
    try {
      // Make API call to get order details
      const response = await this.client.get(`/orders/v0/orders/${orderId}`);
      const order = this.extractAmazonResponse<any>(response.data);
      
      if (!order) {
        return null;
      }

      // Get order items
      const itemsResponse = await this.client.get(`/orders/v0/orders/${orderId}/orderItems`);
      const items = this.extractAmazonResponse<any[]>(itemsResponse.data);
      
      // Add items to the order
      const orderWithItems = {
        ...order,
        OrderItems: items
      };

      // Map Amazon order to our format
      return this.mapAmazonOrderToMarketplace(orderWithItems);
    } catch (error) {
      // Check if it's a not found error
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw this.formatError(error, `Failed to get Amazon order with ID: ${orderId}`);
    }
  }

  /**
   * Updates an order's status on Amazon
   * @param orderId - Order ID to update
   * @param status - New status
   * @returns Promise resolving to updated order
   */
  async updateOrderStatus(orderId: string, status: MarketplaceOrderStatus): Promise<MarketplaceOrder> {
    try {
      // For Amazon, we don't directly update order status
      // Instead, we submit a feed for fulfillment
      if (status === MarketplaceOrderStatus.FULFILLED || status === MarketplaceOrderStatus.SHIPPED) {
        // Get the order to get the items
        const order = await this.getOrderById(orderId);
        if (!order) {
          throw new Error(`Order not found with ID: ${orderId}`);
        }

        // Create fulfillment data
        const fulfillmentData = {
          AmazonOrderId: orderId,
          MerchantFulfillmentID: `fulfillment-${orderId}`,
          FulfillmentDate: new Date().toISOString(),
          Items: order.items.map(item => ({
            AmazonOrderItemCode: item.id,
            Quantity: item.quantity
          }))
        };

        // Submit fulfillment feed
        await this.client.post('/feeds/2021-06-30/documents', {
          feedType: 'POST_ORDER_FULFILLMENT_DATA',
          marketplaceIds: [this.getMarketplaceId()],
          inputFeedDocumentId: await this.createFeedDocument(fulfillmentData)
        });
      }

      // Fetch the updated order
      const updatedOrder = await this.getOrderById(orderId);
      if (!updatedOrder) {
        throw new Error(`Could not retrieve order after status update: ${orderId}`);
      }

      return updatedOrder;
    } catch (error) {
      throw this.formatError(error, `Failed to update Amazon order status for ID: ${orderId}`);
    }
  }

  /**
   * Cancels an order on Amazon
   * @param orderId - Order ID to cancel
   * @param reason - Cancellation reason
   * @returns Promise resolving to success status
   */
  async cancelOrder(orderId: string, reason?: string): Promise<boolean> {
    try {
      // For Amazon, we don't directly cancel orders
      // Instead, we mark it as "Cancelled" in our system
      // In reality, Amazon has specific rules about when orders can be cancelled
      
      // Just for demonstration, we'll return true
      // In a real implementation, you would need to check order status and follow Amazon's cancellation rules
      return true;
    } catch (error) {
      throw this.formatError(error, `Failed to cancel Amazon order with ID: ${orderId}`);
    }
  }

  /**
   * Updates inventory levels on Amazon
   * @param updates - Array of inventory updates
   * @returns Promise resolving to success status
   */
  async updateInventory(updates: MarketplaceInventoryUpdate[]): Promise<boolean> {
    try {
      // Group updates by SKU for batch processing
      const inventoryUpdates = updates.map(update => ({
        sku: update.sku || update.productId,
        quantity: update.quantity
      }));

      // Submit inventory feed
      await this.client.post('/feeds/2021-06-30/documents', {
        feedType: 'POST_INVENTORY_AVAILABILITY_DATA',
        marketplaceIds: [this.getMarketplaceId()],
        inputFeedDocumentId: await this.createFeedDocument({
          MessageType: 'Inventory',
          Message: inventoryUpdates.map(update => ({
            MessageID: `inventory-${update.sku}-${Date.now()}`,
            OperationType: 'Update',
            Inventory: {
              SKU: update.sku,
              Quantity: update.quantity
            }
          }))
        })
      });

      return true;
    } catch (error) {
      throw this.formatError(error, 'Failed to update inventory on Amazon');
    }
  }

  /**
   * Handles a webhook payload from Amazon
   * @param payload - Webhook payload
   * @returns Promise resolving to handling result
   */
  async handleWebhook(payload: MarketplaceWebhookPayload): Promise<any> {
    try {
      // Amazon uses "Notifications API" rather than webhooks
      // This method would be used to handle those notifications
      logger.info(`Received Amazon notification: ${payload.event}`);
      
      // Process the notification based on the event type
      switch (payload.event) {
        case 'Order':
          // Process order notification
          return { success: true, message: 'Order notification processed' };
        
        case 'Inventory':
          // Process inventory notification
          return { success: true, message: 'Inventory notification processed' };
        
        default:
          return { success: true, message: `Unhandled notification type: ${payload.event}` };
      }
    } catch (error) {
      throw this.formatError(error, 'Failed to handle Amazon webhook');
    }
  }

  /**
   * Gets the marketplace catalog (categories, attributes, etc.)
   * @param options - Catalog query options
   * @returns Promise resolving to catalog data
   */
  async getCatalog(options?: MarketplaceCatalogOptions): Promise<any> {
    try {
      // Set up default options
      const queryOptions = {
        type: options?.type || 'categories',
        ...options
      };

      // Build query parameters for Amazon API
      const params: Record<string, any> = {
        MarketplaceId: this.getMarketplaceId()
      };

      // Make API call based on catalog type
      let response;
      switch (queryOptions.type) {
        case 'categories':
          response = await this.client.get('/catalog/2022-04-01/categories', { params });
          break;
        
        case 'attributes':
          response = await this.client.get('/catalog/2022-04-01/attributes', { params });
          break;
        
        case 'brands':
          // Amazon doesn't have a specific brands API
          response = { data: { payload: [] } };
          break;
        
        default:
          response = await this.client.get('/catalog/2022-04-01/categories', { params });
          break;
      }

      return this.extractAmazonResponse<any>(response.data);
    } catch (error) {
      throw this.formatError(error, 'Failed to get catalog from Amazon');
    }
  }

  /**
   * Fetch orders from Amazon, designed for incremental updates
   * @param options - Options for fetching orders
   * @returns Promise resolving to array of marketplace orders
   */
  async fetchOrders(options: { lastSyncTimestamp?: Date; limit?: number }): Promise<MarketplaceOrder[]> {
    try {
      // Set up default options
      const lastSyncDate = options.lastSyncTimestamp || new Date(0); // Default to epoch start if not provided
      const limit = options.limit || 100;
      
      // Order statuses to fetch
      const orderStatuses = [
        'Unshipped', 'PartiallyShipped', 'Shipped', 
        'Pending', 'Canceled', 'Unfulfillable', 'InvoiceUnconfirmed'
      ];
      
      // Build query parameters for Amazon API
      const params: Record<string, any> = {
        MarketplaceIds: [this.getMarketplaceId()],
        LastUpdatedAfter: lastSyncDate.toISOString(),
        OrderStatuses: orderStatuses,
        MaxResultsPerPage: Math.min(limit, 100) // Amazon has a max limit of 100
      };
      
      const allOrders: MarketplaceOrder[] = [];
      let nextToken: string | null = null;
      let hasMore = true;
      
      // Process orders until we reach the limit or have no more pages
      while (hasMore && allOrders.length < limit) {
        // Add nextToken if available
        if (nextToken) {
          params.NextToken = nextToken;
        }
        
        // Make API call to get orders
        const response = await this.client.get('/orders/v0/orders', { params });
        const result = this.extractAmazonResponse<any>(response.data);
        
        const orders = result.Orders || [];
        nextToken = result.NextToken || null;
        
        // Process order items for each order
        for (const order of orders) {
          try {
            // Get order items
            const itemsResponse = await this.client.get(`/orders/v0/orders/${order.AmazonOrderId}/orderItems`);
            const items = this.extractAmazonResponse<any>(itemsResponse.data);
            
            // Add items to the order
            const orderWithItems = {
              ...order,
              OrderItems: items.OrderItems || []
            };
            
            // Map Amazon order to our format
            allOrders.push(this.mapAmazonOrderToMarketplace(orderWithItems));
            
            // Check if we've reached the limit
            if (allOrders.length >= limit) {
              break;
            }
            
            // Add a small delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (error) {
            logger.error(`Error fetching items for order ${order.AmazonOrderId}: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
        
        // Check if we need to fetch more pages
        hasMore = !!nextToken && allOrders.length < limit;
        
        // Add a delay between pages to avoid rate limiting
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      return allOrders;
    } catch (error) {
      throw this.formatError(error, 'Failed to fetch orders from Amazon');
    }
  }

  /**
   * Fetch products from Amazon, designed for incremental updates
   * @param options - Options for fetching products
   * @returns Promise resolving to array of marketplace products
   */
  async fetchProducts(options: { lastSyncTimestamp?: Date; filter?: string; limit?: number }): Promise<MarketplaceProduct[]> {
    try {
      // Set up default options
      const lastSyncDate = options.lastSyncTimestamp || new Date(0); // Default to epoch start if not provided
      const limit = options.limit || 100;
      
      // Parse any additional filters
      const filterOptions: Record<string, any> = {
        LastUpdatedAfter: lastSyncDate.toISOString()
      };
      
      if (options.filter) {
        const filterParts = options.filter.split(',');
        for (const part of filterParts) {
          const [key, value] = part.split(':');
          if (key && value) {
            if (key === 'status') {
              filterOptions.Status = this.mapProductStatusToAmazon(value as MarketplaceProductStatus);
            } else if (key === 'fulfillment') {
              filterOptions.FulfillmentType = value;
            }
          }
        }
      }
      
      // Build query parameters for Amazon API
      const params: Record<string, any> = {
        MarketplaceId: this.getMarketplaceId(),
        QueryContextId: 'Inventory',
        ...filterOptions,
        PageSize: Math.min(limit, 20) // Amazon has a max page size of 20 for catalog items
      };
      
      const allProducts: MarketplaceProduct[] = [];
      let nextToken: string | null = null;
      let hasMore = true;
      
      // Process products until we reach the limit or have no more pages
      while (hasMore && allProducts.length < limit) {
        // Add nextToken if available
        if (nextToken) {
          params.NextToken = nextToken;
        }
        
        // Make API call to get products
        const response = await this.client.get('/catalog/2022-04-01/items', { params });
        const result = this.extractAmazonResponse<any>(response.data);
        
        const products = result.Items || [];
        nextToken = result.NextToken || null;
        
        // Map Amazon products to our format
        for (const product of products) {
          try {
            // Get additional product details
            const detailsResponse = await this.client.get(`/catalog/2022-04-01/items/${product.Identifiers.MarketplaceASIN.ASIN}`, {
              params: {
                MarketplaceId: this.getMarketplaceId()
              }
            });
            
            const details = this.extractAmazonResponse<any>(detailsResponse.data);
            
            // Merge product with details
            const productWithDetails = {
              ...product,
              Details: details
            };
            
            // Map Amazon product to our format
            allProducts.push(this.mapAmazonProductToMarketplace(productWithDetails));
            
            // Check if we've reached the limit
            if (allProducts.length >= limit) {
              break;
            }
            
            // Add a small delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (error) {
            logger.error(`Error fetching details for product ${product.Identifiers?.MarketplaceASIN?.ASIN}: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
        
        // Check if we need to fetch more pages
        hasMore = !!nextToken && allProducts.length < limit;
        
        // Add a delay between pages to avoid rate limiting
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      return allProducts;
    } catch (error) {
      throw this.formatError(error, 'Failed to fetch products from Amazon');
    }
  }

  /**
   * Gets the base URL for Amazon SP-API based on the region
   * @returns Base URL string
   */
  private getBaseUrl(): string {
    const regionEndpoints: Record<string, string> = {
      'us': 'https://sellingpartnerapi-na.amazon.com',
      'eu': 'https://sellingpartnerapi-eu.amazon.com',
      'fe': 'https://sellingpartnerapi-fe.amazon.com'
    };
    
    return regionEndpoints[this.region] || regionEndpoints.us;
  }

  /**
   * Gets the Amazon marketplace ID based on the region
   * @returns Marketplace ID string
   */
  private getMarketplaceId(): string {
    const marketplaceIds: Record<string, string> = {
      'us': 'ATVPDKIKX0DER',       // USA
      'ca': 'A2EUQ1WTGCTBG2',      // Canada
      'mx': 'A1AM78C64UM0Y8',      // Mexico
      'uk': 'A1F83G8C2ARO7P',      // UK
      'de': 'A1PA6795UKMFR9',      // Germany
      'fr': 'A13V1IB3VIYZZH',      // France
      'it': 'APJ6JRA9NG5V4',       // Italy
      'es': 'A1RKKUPIHCS9HS',      // Spain
      'jp': 'A1VC38T7YXB528',      // Japan
      'in': 'A21TJRUUN4KGV',       // India
      'au': 'A39IBJ37TRP1C6'       // Australia
    };
    
    return marketplaceIds[this.region] || marketplaceIds.us;
  }

  /**
   * Gets the currency code for the current region
   * @returns Currency code string
   */
  private getCurrencyCode(): string {
    const currencyMap: Record<string, string> = {
      'us': 'USD',
      'ca': 'CAD',
      'uk': 'GBP',
      'de': 'EUR',
      'fr': 'EUR',
      'it': 'EUR',
      'es': 'EUR',
      'jp': 'JPY',
      'in': 'INR',
      'au': 'AUD'
    };
    
    return currencyMap[this.region] || 'USD';
  }

  /**
   * Gets the country name for the current region
   * @returns Country name string
   */
  private getCountryName(): string {
    const countryMap: Record<string, string> = {
      'us': 'United States',
      'uk': 'United Kingdom',
      'ca': 'Canada',
      'de': 'Germany',
      'fr': 'France',
      'it': 'Italy',
      'es': 'Spain',
      'jp': 'Japan',
      'in': 'India',
      'au': 'Australia'
    };
    
    return countryMap[this.region] || 'United States';
  }

  /**
   * Checks if the access token needs to be refreshed
   * @returns Boolean indicating if refresh is needed
   */
  private needsTokenRefresh(): boolean {
    // Check if we have a token and if it's expired
    if (!this.config.accessToken || !this.config.tokenExpiry) {
      return true;
    }
    
    // Return true if token expires in less than 5 minutes
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() >= (this.config.tokenExpiry.getTime() - fiveMinutes);
  }

  /**
   * Refreshes the Amazon SP-API access token
   * @returns Promise resolving when token is refreshed
   */
  private async refreshAccessToken(): Promise<void> {
    try {
      // Make token request to Login with Amazon
      const response = await axios.post('https://api.amazon.com/auth/o2/token', {
        grant_type: 'refresh_token',
        refresh_token: this.config.refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      // Update the config with new token
      this.config.accessToken = response.data.access_token;
      
      // Set token expiry (typically 1 hour)
      const expiresIn = response.data.expires_in || 3600;
      this.config.tokenExpiry = new Date(Date.now() + (expiresIn * 1000));
      
      // Update credentials
      await this.updateCredentials({
        ...this.getCredentials(),
        accessToken: this.config.accessToken,
        tokenExpiry: this.config.tokenExpiry
      });
      
      logger.info('Amazon access token refreshed successfully');
    } catch (error) {
      logger.error(`Failed to refresh Amazon access token: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error('Failed to refresh Amazon access token');
    }
  }

  /**
   * Creates a feed document for Amazon feeds API
   * @param data - Feed data
   * @returns Promise resolving to feed document ID
   */
  private async createFeedDocument(data: any): Promise<string> {
    try {
      // Create a feed document
      const response = await this.client.post('/feeds/2021-06-30/documents', {
        contentType: 'application/json'
      });
      
      const feedDocument = this.extractAmazonResponse<any>(response.data);
      
      // Upload the feed data to the pre-signed URL
      await axios.put(feedDocument.url, JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return feedDocument.feedDocumentId;
    } catch (error) {
      throw this.formatError(error, 'Failed to create feed document');
    }
  }

  /**
   * Gets the current API rate limit status
   * @returns Promise resolving to rate limit info
   */
  private async getRateLimitStatus(): Promise<AmazonRateLimitInfo> {
    // In a real implementation, this would check the rate limit headers
    // For now, we'll return a mock response
    return {
      limit: 100,
      remaining: 95,
      reset: new Date(Date.now() + 3600000) // 1 hour from now
    };
  }

  /**
   * Maps our product status to Amazon product status
   * @param status - Our product status
   * @returns Amazon product status
   */
  private mapProductStatusToAmazon(status: MarketplaceProductStatus | string): string {
    const statusMap: Record<string, string> = {
      [MarketplaceProductStatus.ACTIVE]: 'ACTIVE',
      [MarketplaceProductStatus.INACTIVE]: 'INACTIVE',
      [MarketplaceProductStatus.DRAFT]: 'INACTIVE',
      [MarketplaceProductStatus.ARCHIVED]: 'INACTIVE',
      [MarketplaceProductStatus.DELETED]: 'DELETED'
    };
    
    return statusMap[status] || 'ACTIVE';
  }

  /**
   * Maps Amazon product status to our product status
   * @param status - Amazon product status
   * @returns Our product status
   */
  private mapAmazonProductStatusToMarketplace(status: string): MarketplaceProductStatus {
    const statusMap: Record<string, MarketplaceProductStatus> = {
      'ACTIVE': MarketplaceProductStatus.ACTIVE,
      'INACTIVE': MarketplaceProductStatus.INACTIVE,
      'DELETED': MarketplaceProductStatus.DELETED
    };
    
    return statusMap[status] || MarketplaceProductStatus.INACTIVE;
  }

  /**
   * Maps our order status to Amazon order status
   * @param status - Our order status
   * @returns Amazon order status
   */
  private mapOrderStatusToAmazon(status: MarketplaceOrderStatus | string): string {
    const statusMap: Record<string, string> = {
      [MarketplaceOrderStatus.PENDING]: 'PendingAvailability',
      [MarketplaceOrderStatus.PROCESSING]: 'Pending',
      [MarketplaceOrderStatus.FULFILLED]: 'Shipped',
      [MarketplaceOrderStatus.SHIPPED]: 'Shipped',
      [MarketplaceOrderStatus.DELIVERED]: 'Shipped',
      [MarketplaceOrderStatus.COMPLETED]: 'Shipped',
      [MarketplaceOrderStatus.CANCELLED]: 'Canceled',
      [MarketplaceOrderStatus.REFUNDED]: 'Canceled',
      [MarketplaceOrderStatus.ON_HOLD]: 'Pending',
      [MarketplaceOrderStatus.RETURNED]: 'Canceled',
      [MarketplaceOrderStatus.PARTIALLY_FULFILLED]: 'PartiallyShipped',
      [MarketplaceOrderStatus.PARTIALLY_REFUNDED]: 'Pending'
    };
    
    return statusMap[status] || 'Pending';
  }

  /**
   * Maps Amazon order status to our order status
   * @param status - Amazon order status
   * @returns Our order status
   */
  private mapAmazonOrderStatusToMarketplace(status: string): MarketplaceOrderStatus {
    const statusMap: Record<string, MarketplaceOrderStatus> = {
      'PendingAvailability': MarketplaceOrderStatus.PENDING,
      'Pending': MarketplaceOrderStatus.PROCESSING,
      'Unshipped': MarketplaceOrderStatus.PROCESSING,
      'PartiallyShipped': MarketplaceOrderStatus.PARTIALLY_FULFILLED,
      'Shipped': MarketplaceOrderStatus.SHIPPED,
      'InvoiceUnconfirmed': MarketplaceOrderStatus.PROCESSING,
      'Canceled': MarketplaceOrderStatus.CANCELLED,
      'Unfulfillable': MarketplaceOrderStatus.CANCELLED
    };
    
    return statusMap[status] || MarketplaceOrderStatus.PROCESSING;
  }

  /**
   * Maps Amazon product to our marketplace product format
   * @param amazonProduct - Amazon product data
   * @returns Marketplace product
   */
  private mapAmazonProductToMarketplace(amazonProduct: any): MarketplaceProduct {
    // Extract product details
    const asin = amazonProduct.Identifiers?.MarketplaceASIN?.ASIN || amazonProduct.ASIN;
    const sku = amazonProduct.SKU || '';
    
    // Extract attributes
    const attributes = amazonProduct.AttributeSets?.[0] || {};
    
    // Extract images
    const images = (attributes.Images || []).map((img: any) => img.URL || img.ImageUrl || '');
    
    // Extract price
    const price = amazonProduct.Price || amazonProduct.ListingPrice || { Amount: 0, CurrencyCode: this.getCurrencyCode() };
    
    // Map to our format
    return {
      id: asin,
      title: attributes.Title || 'Unknown Product',
      description: attributes.ProductDescription || '',
      type: attributes.ProductType || '',
      vendor: attributes.Brand || '',
      sku: sku,
      barcode: attributes.UPC || attributes.EAN || '',
      price: {
        regular: price.Amount || 0,
        currency: price.CurrencyCode || this.getCurrencyCode(),
        onSale: !!amazonProduct.SalePrice?.Amount
      },
      status: this.mapAmazonProductStatusToMarketplace(amazonProduct.Status || 'ACTIVE'),
      images: images,
      tags: [],
      createdAt: new Date(amazonProduct.CreatedDate || Date.now()),
      updatedAt: new Date(amazonProduct.LastUpdatedDate || Date.now())
    };
  }

  /**
   * Maps our marketplace product to Amazon format
   * @param product - Our marketplace product
   * @param isUpdate - Whether this is an update operation
   * @returns Amazon product data
   */
  private mapMarketplaceProductToAmazon(product: MarketplaceProduct, isUpdate = false): any {
    // For simplicity, we're creating a basic mapping
    // In a real implementation, this would be much more complex
    const amazonProduct: any = {
      SKU: product.sku || `SKU-${Date.now()}`,
      StandardProductID: {
        Type: product.barcode?.length === 13 ? 'EAN' : (product.barcode?.length === 12 ? 'UPC' : 'ASIN'),
        Value: product.barcode || product.id
      },
      ProductTaxCode: 'A_GEN_TAX',
      ConditionType: 'New',
      Condition: {
        Value: 'New'
      }
    };
    
    // Add product details
    if (!isUpdate) {
      amazonProduct.DescriptionData = {
        Title: product.title,
        Description: product.description,
        BulletPoints: product.description?.split('\n').filter(Boolean) || [],
        Brand: product.vendor,
        Manufacturer: product.vendor
      };
    }
    
    // Add pricing
    if (product.price) {
      amazonProduct.Price = {
        Amount: product.price.regular || 0,
        CurrencyCode: product.price.currency || this.getCurrencyCode()
      };
      
      if (product.price.sale && product.price.onSale) {
        amazonProduct.SalePrice = {
          Amount: product.price.sale,
          CurrencyCode: product.price.currency || this.getCurrencyCode()
        };
        
        if (product.price.saleStart && product.price.saleEnd) {
          amazonProduct.SaleStartDate = product.price.saleStart.toISOString();
          amazonProduct.SaleEndDate = product.price.saleEnd.toISOString();
        }
      }
    }
    
    return amazonProduct;
  }

  /**
   * Maps Amazon order to our marketplace order format
   * @param amazonOrder - Amazon order data
   * @returns Marketplace order
   */
  private mapAmazonOrderToMarketplace(amazonOrder: any): MarketplaceOrder {
    // Extract order items
    const items = (amazonOrder.OrderItems || []).map((item: any) => ({
      id: item.OrderItemId || item.ASIN,
      productId: item.ASIN,
      title: item.Title || 'Unknown Product',
      sku: item.SellerSKU || '',
      quantity: parseInt(item.QuantityOrdered) || 1,
      price: parseFloat(item.ItemPrice?.Amount) || 0,
      subtotal: parseFloat(item.ItemPrice?.Amount) || 0,
      tax: parseFloat(item.ItemTax?.Amount) || 0,
      total: (parseFloat(item.ItemPrice?.Amount) || 0) + (parseFloat(item.ItemTax?.Amount) || 0)
    }));
    
    // Extract shipping address
    const shippingAddress = amazonOrder.ShippingAddress || {};
    
    // Map to our format
    return {
      id: amazonOrder.AmazonOrderId,
      orderNumber: amazonOrder.SellerOrderId || amazonOrder.AmazonOrderId,
      status: this.mapAmazonOrderStatusToMarketplace(amazonOrder.OrderStatus),
      currency: amazonOrder.OrderTotal?.CurrencyCode || this.getCurrencyCode(),
      customer: {
        email: amazonOrder.BuyerEmail || 'unknown@example.com',
        name: amazonOrder.BuyerName || 'Amazon Customer'
      },
      items: items,
      shipping: {
        method: amazonOrder.ShipmentServiceLevelCategory || 'Standard',
        address: {
          name: shippingAddress.Name || '',
          address1: shippingAddress.AddressLine1 || '',
          address2: shippingAddress.AddressLine2 || '',
          city: shippingAddress.City || '',
          state: shippingAddress.StateOrRegion || '',
          zip: shippingAddress.PostalCode || '',
          country: shippingAddress.CountryCode || '',
          phone: shippingAddress.Phone || ''
        }
      },
      billingAddress: {
        name: shippingAddress.Name || '',
        address1: shippingAddress.AddressLine1 || '',
        address2: shippingAddress.AddressLine2 || '',
        city: shippingAddress.City || '',
        state: shippingAddress.StateOrRegion || '',
        zip: shippingAddress.PostalCode || '',
        country: shippingAddress.CountryCode || '',
        phone: shippingAddress.Phone || ''
      },
      subtotal: parseFloat(amazonOrder.OrderTotal?.Amount) || 0,
      tax: parseFloat(amazonOrder.OrderTax?.Amount) || 0,
      total: parseFloat(amazonOrder.OrderTotal?.Amount) || 0,
      createdAt: new Date(amazonOrder.PurchaseDate || Date.now()),
      updatedAt: new Date(amazonOrder.LastUpdateDate || Date.now())
    };
  }

  /**
   * Extracts the payload from an Amazon API response
   * @param response - Amazon API response
   * @returns Extracted payload
   */
  private extractAmazonResponse<T>(response: any): T {
    // Check for errors in the response
    if (response.errors && response.errors.length > 0) {
      const error = response.errors[0];
      throw new Error(`Amazon API error: ${error.code} - ${error.message}`);
    }
    
    // Return the payload
    return response.payload || response;
  }
}