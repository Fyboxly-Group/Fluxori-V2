import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { injectable, inject } from 'inversify';
import { BaseMarketplaceAdapter } from '../common/base-marketplace-adapter';
import {
  MarketplaceCredentials,
  ConnectionStatus,
  MarketplaceProduct,
  StockUpdatePayload,
  PriceUpdatePayload,
  StatusUpdatePayload,
  MarketplaceOrder,
  OrderStatus,
  OrderAcknowledgment,
  MarketplaceCategory,
  PaginatedResponse,
  OperationResult,
  ProductStatus
} from '../../models/marketplace.models';
import { AmazonCredentials } from '../../interfaces/marketplace-credentials.interface';
import { LoggerService } from '../../../../services/logger.service';

/**
 * Amazon SP-API integration adapter implementing the marketplace adapter interface
 * Provides TypeScript-typed access to Amazon SP-API services
 */
@injectable()
export class AmazonAdapter extends BaseMarketplaceAdapter {
  /**
   * The unique identifier for the marketplace
   */
  public readonly marketplaceId: string = 'amazon';
  
  /**
   * Human-readable name of the marketplace
   */
  public readonly marketplaceName: string = 'Amazon';

  /**
   * Amazon SP-API client
   */
  private apiClient: AxiosInstance | null = null;
  
  /**
   * Amazon credentials
   */
  private amazonCredentials: AmazonCredentials | null = null;
  
  /**
   * Access token for SP-API
   */
  private accessToken: string | null = null;
  
  /**
   * Access token expiry time
   */
  private tokenExpiry: Date | null = null;

  /**
   * Constructor for Amazon adapter
   * @param logger Logger service for consistent logging
   */
  constructor(
    @inject('LoggerService') private logger: LoggerService
  ) {
    super();
    this.logger.info('Amazon adapter created', { marketplace: this.marketplaceName });
  }

  /**
   * Initialize the adapter with Amazon SP-API credentials
   * @param credentials Amazon marketplace credentials
   */
  async initialize(credentials: MarketplaceCredentials): Promise<void> {
    try {
      this.logger.info('Initializing Amazon adapter', { 
        sellerId: credentials.sellerId,
        marketplaceId: (credentials as AmazonCredentials).marketplaceId
      });
      
      // Validate and store credentials
      if (!this.validateCredentials(credentials)) {
        throw new Error('Invalid Amazon credentials provided');
      }
      
      this.amazonCredentials = credentials as AmazonCredentials;
      this.credentials = credentials;
      
      // Initialize API client
      await this.setupApiClient();
      
      // Test connection to validate credentials
      const connectionStatus = await this.testConnection();
      
      if (!connectionStatus.connected) {
        throw new Error(`Failed to connect to Amazon SP-API: ${connectionStatus.message}`);
      }
      
      this.logger.info('Amazon adapter initialized successfully', { 
        connected: true,
        sellerId: this.amazonCredentials.sellerId
      });
    } catch (error) {
      this.logger.error('Failed to initialize Amazon adapter', { error });
      throw error;
    }
  }

  /**
   * Test the connection to Amazon SP-API
   */
  async testConnection(): Promise<ConnectionStatus> {
    try {
      this.ensureInitialized();
      
      // Ensure access token is valid
      await this.ensureValidToken();
      
      // Make a lightweight API call to test connection
      // Using getCatalogItem as a test endpoint
      await this.apiClient?.get('/catalog/v0/items/status', {
        params: {
          marketplaceIds: [this.amazonCredentials?.marketplaceId]
        }
      });
      
      const now = new Date();
      this.lastConnectionCheck = now;
      this.lastConnectionStatus = true;
      
      return {
        connected: true,
        message: 'Successfully connected to Amazon SP-API',
        lastChecked: now,
        rateLimit: this.rateLimitInfo
      };
    } catch (error: any) {
      const now = new Date();
      this.lastConnectionCheck = now;
      this.lastConnectionStatus = false;
      
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      
      this.logger.error('Amazon connection test failed', { error: errorMessage });
      
      return {
        connected: false,
        message: `Failed to connect to Amazon SP-API: ${errorMessage}`,
        lastChecked: now
      };
    }
  }

  /**
   * Fetch a product by its SKU
   * @param sku Product SKU
   */
  async getProductBySku(sku: string): Promise<OperationResult<MarketplaceProduct>> {
    try {
      this.ensureInitialized();
      await this.ensureValidToken();
      
      this.logger.debug('Getting Amazon product by SKU', { sku });
      
      // Use catalog API to get product by SKU
      const response = await this.apiClient?.get('/catalog/v0/items', {
        params: {
          marketplaceIds: [this.amazonCredentials?.marketplaceId],
          identifiers: [sku],
          identifiersType: 'SKU',
          includedData: ['attributes', 'dimensions', 'images', 'productTypes', 'salesRanks', 'summaries']
        }
      });
      
      if (!response?.data?.items || response.data.items.length === 0) {
        return this.createErrorResult({
          code: 'PRODUCT_NOT_FOUND',
          message: `Product with SKU ${sku} not found`,
          timestamp: new Date()
        });
      }
      
      // Map Amazon product data to standardized format
      const amazonProduct = response.data.items[0];
      const product = this.mapAmazonProductToStandardFormat(amazonProduct, sku);
      
      return this.createSuccessResult(product);
    } catch (error: any) {
      const marketplaceError = this.handleApiError(error, `getProductBySku(${sku})`);
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Fetch a product by Amazon ASIN
   * @param id Amazon ASIN
   */
  async getProductById(id: string): Promise<OperationResult<MarketplaceProduct>> {
    try {
      this.ensureInitialized();
      await this.ensureValidToken();
      
      this.logger.debug('Getting Amazon product by ASIN', { asin: id });
      
      // Use catalog API to get product by ASIN
      const response = await this.apiClient?.get(`/catalog/v0/items/${id}`, {
        params: {
          marketplaceIds: [this.amazonCredentials?.marketplaceId],
          includedData: ['attributes', 'dimensions', 'images', 'productTypes', 'salesRanks', 'summaries']
        }
      });
      
      if (!response?.data) {
        return this.createErrorResult({
          code: 'PRODUCT_NOT_FOUND',
          message: `Product with ASIN ${id} not found`,
          timestamp: new Date()
        });
      }
      
      // Map Amazon product data to standardized format
      const amazonProduct = response.data;
      const product = this.mapAmazonProductToStandardFormat(amazonProduct);
      
      return this.createSuccessResult(product);
    } catch (error: any) {
      const marketplaceError = this.handleApiError(error, `getProductById(${id})`);
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Fetch multiple products by their SKUs
   * @param skus Array of SKUs to fetch
   */
  async getProductsBySkus(skus: string[]): Promise<OperationResult<MarketplaceProduct[]>> {
    try {
      this.ensureInitialized();
      await this.ensureValidToken();
      
      this.logger.debug('Getting Amazon products by SKUs', { skuCount: skus.length });
      
      const products: MarketplaceProduct[] = [];
      const failedSkus: string[] = [];
      
      // Process in batches of 20 to avoid API limits
      const batchSize = 20;
      for (let i = 0; i < skus.length; i += batchSize) {
        const batch = skus.slice(i, i + batchSize);
        
        try {
          // Use catalog API to get products by SKU batch
          const response = await this.apiClient?.post('/catalog/v0/items/search', {
            marketplaceIds: [this.amazonCredentials?.marketplaceId],
            identifiers: batch.map(sku => ({ identifier: sku, identifierType: 'SKU' })),
            includedData: ['attributes', 'dimensions', 'images', 'productTypes', 'salesRanks', 'summaries']
          });
          
          if (response?.data?.items) {
            // Map Amazon products to standardized format
            for (const item of response.data.items) {
              const sku = item.identifiers.SKU;
              products.push(this.mapAmazonProductToStandardFormat(item, sku));
            }
          }
          
          // Collect SKUs that weren't found
          const foundSkus = response?.data?.items.map(item => item.identifiers.SKU) || [];
          const missingSkus = batch.filter(sku => !foundSkus.includes(sku));
          failedSkus.push(...missingSkus);
        } catch (error) {
          // If a batch fails, log and continue to the next batch
          this.logger.error('Error fetching batch of Amazon products', { 
            error, 
            skus: batch 
          });
          failedSkus.push(...batch);
        }
        
        // Throttle requests to avoid hitting rate limits
        if (i + batchSize < skus.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (products.length === 0 && failedSkus.length > 0) {
        return this.createErrorResult({
          code: 'PRODUCTS_NOT_FOUND',
          message: `Could not find any products with the provided SKUs`,
          details: { failedSkus },
          timestamp: new Date()
        });
      }
      
      return this.createSuccessResult(products);
    } catch (error: any) {
      const marketplaceError = this.handleApiError(error, 'getProductsBySkus');
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Fetch products with pagination
   * @param page Page number (0-based)
   * @param pageSize Number of items per page
   * @param filters Optional filters to apply
   */
  async getProducts(
    page: number,
    pageSize: number,
    filters?: Record<string, any>
  ): Promise<PaginatedResponse<MarketplaceProduct>> {
    try {
      this.ensureInitialized();
      await this.ensureValidToken();
      
      this.logger.debug('Getting paginated Amazon products', { page, pageSize });
      
      // Use listings API to get products
      const response = await this.apiClient?.get('/listings/2021-08-01/items', {
        params: {
          marketplaceIds: [this.amazonCredentials?.marketplaceId],
          sellerId: this.amazonCredentials?.sellerId,
          pageSize,
          nextToken: filters?.nextToken || undefined,
          issueLocale: filters?.issueLocale || 'en_US',
          includedData: ['attributes', 'issues', 'offers', 'summaries']
        }
      });
      
      if (!response?.data || !response.data.items) {
        return {
          data: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0,
          hasNext: false,
          hasPrev: page > 0
        };
      }
      
      // Map Amazon products to standardized format
      const products: MarketplaceProduct[] = response.data.items.map(item => 
        this.mapAmazonProductToStandardFormat(item, item.sku)
      );
      
      // Calculate pagination values
      const nextToken = response.data.nextToken;
      
      return {
        data: products,
        total: products.length + (nextToken ? pageSize : 0), // Estimate if we have a next token
        page,
        pageSize,
        totalPages: nextToken ? page + 2 : page + 1, // Estimate if we have a next token
        hasNext: !!nextToken,
        hasPrev: page > 0
      };
    } catch (error: any) {
      this.logger.error('Error fetching Amazon products', { error });
      
      // Return empty results on error
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
        hasNext: false,
        hasPrev: page > 0
      };
    }
  }

  /**
   * Update stock levels for one or more products
   * @param updates Array of stock update payloads
   */
  async updateStock(updates: StockUpdatePayload[]): Promise<OperationResult<{
    successful: string[];
    failed: Array<{ sku: string; reason: string }>;
  }>> {
    try {
      this.ensureInitialized();
      await this.ensureValidToken();
      
      this.logger.debug('Updating Amazon stock levels', { updateCount: updates.length });
      
      const successful: string[] = [];
      const failed: Array<{ sku: string; reason: string }> = [];
      
      // Process in batches of 10 to avoid API limits
      const batchSize = 10;
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        
        try {
          // Prepare inventory update payload
          const updatePayload = {
            issues: batch.map(update => ({
              sku: update.sku,
              availability: {
                fulfillmentType: 'MFN', // Merchant Fulfilled
                quantity: update.quantity
              }
            }))
          };
          
          // Use inventory API to update stock levels
          const response = await this.apiClient?.put('/inventory/v1/inventoryUpdate', updatePayload, {
            params: {
              marketplaceIds: [this.amazonCredentials?.marketplaceId],
              sellerId: this.amazonCredentials?.sellerId
            }
          });
          
          // Process results
          if (response?.data?.updateResults) {
            for (const result of response.data.updateResults) {
              if (result.status === 'SUCCESS') {
                successful.push(result.sku);
              } else {
                failed.push({
                  sku: result.sku,
                  reason: result.errorMessage || 'Unknown error'
                });
              }
            }
          }
        } catch (error: any) {
          // If a batch fails, log and mark all SKUs as failed
          this.logger.error('Error updating batch of Amazon stock levels', { error });
          
          batch.forEach(update => {
            failed.push({
              sku: update.sku,
              reason: error.message || 'Batch update failed'
            });
          });
        }
        
        // Throttle requests to avoid hitting rate limits
        if (i + batchSize < updates.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      return this.createSuccessResult({
        successful,
        failed
      });
    } catch (error: any) {
      const marketplaceError = this.handleApiError(error, 'updateStock');
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Update prices for one or more products
   * @param updates Array of price update payloads
   */
  async updatePrices(updates: PriceUpdatePayload[]): Promise<OperationResult<{
    successful: string[];
    failed: Array<{ sku: string; reason: string }>;
  }>> {
    try {
      this.ensureInitialized();
      await this.ensureValidToken();
      
      this.logger.debug('Updating Amazon prices', { updateCount: updates.length });
      
      const successful: string[] = [];
      const failed: Array<{ sku: string; reason: string }> = [];
      
      // Process in batches of 5 to avoid API limits
      const batchSize = 5;
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        
        try {
          // Prepare price update payload
          const priceUpdates = batch.map(update => {
            // Base price update
            const priceUpdate: any = {
              sku: update.sku,
              price: {
                amount: update.price,
                currencyCode: update.currencyCode || 'USD'
              }
            };
            
            // Add sale price if provided
            if (update.salePrice) {
              priceUpdate.salePrice = {
                amount: update.salePrice,
                currencyCode: update.currencyCode || 'USD'
              };
              
              if (update.saleStartDate) {
                priceUpdate.saleFromDate = update.saleStartDate.toISOString();
              }
              
              if (update.saleEndDate) {
                priceUpdate.saleEndDate = update.saleEndDate.toISOString();
              }
            }
            
            return priceUpdate;
          });
          
          // Use pricing API to update prices
          const response = await this.apiClient?.put('/pricing/v0/price', {
            prices: priceUpdates
          }, {
            params: {
              marketplaceIds: [this.amazonCredentials?.marketplaceId],
              sellerId: this.amazonCredentials?.sellerId
            }
          });
          
          // Process results
          if (response?.data?.results) {
            for (const result of response.data.results) {
              if (result.status === 'SUCCESS') {
                successful.push(result.sku);
              } else {
                failed.push({
                  sku: result.sku,
                  reason: result.message || 'Unknown error'
                });
              }
            }
          }
        } catch (error: any) {
          // If a batch fails, log and mark all SKUs as failed
          this.logger.error('Error updating batch of Amazon prices', { error });
          
          batch.forEach(update => {
            failed.push({
              sku: update.sku,
              reason: error.message || 'Batch update failed'
            });
          });
        }
        
        // Throttle requests to avoid hitting rate limits
        if (i + batchSize < updates.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      return this.createSuccessResult({
        successful,
        failed
      });
    } catch (error: any) {
      const marketplaceError = this.handleApiError(error, 'updatePrices');
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Update status (active/inactive) for one or more products
   * @param updates Array of status update payloads
   */
  async updateStatus(updates: StatusUpdatePayload[]): Promise<OperationResult<{
    successful: string[];
    failed: Array<{ sku: string; reason: string }>;
  }>> {
    try {
      this.ensureInitialized();
      await this.ensureValidToken();
      
      this.logger.debug('Updating Amazon product status', { updateCount: updates.length });
      
      const successful: string[] = [];
      const failed: Array<{ sku: string; reason: string }> = [];
      
      // Amazon doesn't have a direct status update API, so we need to handle this
      // by either updating the inventory or creating a delete request
      
      // Split updates by status
      const activateUpdates = updates.filter(u => 
        u.status === ProductStatus.ACTIVE || u.status === ProductStatus.PENDING
      );
      
      const deactivateUpdates = updates.filter(u => 
        u.status === ProductStatus.INACTIVE || 
        u.status === ProductStatus.DELETED || 
        u.status === ProductStatus.ARCHIVED
      );
      
      // Handle activations - set inventory to available
      if (activateUpdates.length > 0) {
        const stockUpdates = activateUpdates.map(u => ({
          sku: u.sku,
          quantity: 0 // Will be updated separately with actual stock levels
        }));
        
        const activateResult = await this.updateStock(stockUpdates);
        
        if (activateResult.success && activateResult.data) {
          successful.push(...activateResult.data.successful);
          failed.push(...activateResult.data.failed);
        }
      }
      
      // Handle deactivations - set inventory to 0
      if (deactivateUpdates.length > 0) {
        const stockUpdates = deactivateUpdates.map(u => ({
          sku: u.sku,
          quantity: 0
        }));
        
        const deactivateResult = await this.updateStock(stockUpdates);
        
        if (deactivateResult.success && deactivateResult.data) {
          successful.push(...deactivateResult.data.successful);
          failed.push(...deactivateResult.data.failed);
        }
      }
      
      return this.createSuccessResult({
        successful,
        failed
      });
    } catch (error: any) {
      const marketplaceError = this.handleApiError(error, 'updateStatus');
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Fetch recent orders
   * @param sinceDate Fetch orders created after this date
   * @param page Page number (0-based)
   * @param pageSize Number of items per page
   */
  async getRecentOrders(
    sinceDate: Date,
    page: number,
    pageSize: number
  ): Promise<PaginatedResponse<MarketplaceOrder>> {
    try {
      this.ensureInitialized();
      await this.ensureValidToken();
      
      this.logger.debug('Getting recent Amazon orders', { 
        sinceDate: sinceDate.toISOString(),
        page,
        pageSize
      });
      
      // Use orders API to get recent orders
      const response = await this.apiClient?.get('/orders/v0/orders', {
        params: {
          marketplaceIds: [this.amazonCredentials?.marketplaceId],
          createdAfter: sinceDate.toISOString(),
          nextToken: page > 0 ? String(page) : undefined,
          maxResultsPerPage: pageSize,
          orderStatuses: ['UNSHIPPED', 'PARTIALLY_SHIPPED', 'SHIPPED']
        }
      });
      
      if (!response?.data || !response.data.orders) {
        return {
          data: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0,
          hasNext: false,
          hasPrev: page > 0
        };
      }
      
      // Get order items for each order
      const orders: MarketplaceOrder[] = [];
      for (const amazonOrder of response.data.orders) {
        try {
          // Get order items
          const itemsResponse = await this.apiClient?.get(`/orders/v0/orders/${amazonOrder.amazonOrderId}/orderItems`);
          
          if (itemsResponse?.data?.orderItems) {
            // Map Amazon order to standardized format
            const order = await this.mapAmazonOrderToStandardFormat(amazonOrder, itemsResponse.data.orderItems);
            orders.push(order);
          }
        } catch (error) {
          this.logger.error('Error fetching Amazon order items', { 
            error,
            orderId: amazonOrder.amazonOrderId
          });
        }
        
        // Throttle requests to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Calculate pagination values
      const nextToken = response.data.nextToken;
      
      return {
        data: orders,
        total: orders.length + (nextToken ? pageSize : 0), // Estimate if we have a next token
        page,
        pageSize,
        totalPages: nextToken ? page + 2 : page + 1, // Estimate if we have a next token
        hasNext: !!nextToken,
        hasPrev: page > 0
      };
    } catch (error: any) {
      this.logger.error('Error fetching recent Amazon orders', { error });
      
      // Return empty results on error
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
        hasNext: false,
        hasPrev: page > 0
      };
    }
  }

  /**
   * Fetch an order by its Amazon Order ID
   * @param id Amazon Order ID
   */
  async getOrderById(id: string): Promise<OperationResult<MarketplaceOrder>> {
    try {
      this.ensureInitialized();
      await this.ensureValidToken();
      
      this.logger.debug('Getting Amazon order by ID', { orderId: id });
      
      // Get order details
      const orderResponse = await this.apiClient?.get(`/orders/v0/orders/${id}`);
      
      if (!orderResponse?.data?.payload) {
        return this.createErrorResult({
          code: 'ORDER_NOT_FOUND',
          message: `Order with ID ${id} not found`,
          timestamp: new Date()
        });
      }
      
      const amazonOrder = orderResponse.data.payload;
      
      // Get order items
      const itemsResponse = await this.apiClient?.get(`/orders/v0/orders/${id}/orderItems`);
      
      if (!itemsResponse?.data?.orderItems) {
        return this.createErrorResult({
          code: 'ORDER_ITEMS_NOT_FOUND',
          message: `Items for order ${id} not found`,
          timestamp: new Date()
        });
      }
      
      // Map to standardized format
      const order = await this.mapAmazonOrderToStandardFormat(amazonOrder, itemsResponse.data.orderItems);
      
      return this.createSuccessResult(order);
    } catch (error: any) {
      const marketplaceError = this.handleApiError(error, `getOrderById(${id})`);
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Acknowledge receipt of an order
   * @param orderId Amazon Order ID
   */
  async acknowledgeOrder(orderId: string): Promise<OperationResult<OrderAcknowledgment>> {
    // Amazon doesn't require explicit order acknowledgment
    // This is a no-op that returns success
    return this.createSuccessResult({
      orderId,
      success: true,
      message: 'Amazon does not require explicit order acknowledgment',
      timestamp: new Date()
    });
  }

  /**
   * Update order status
   * @param orderId Amazon Order ID
   * @param status New order status
   * @param trackingInfo Optional tracking information for shipping updates
   */
  async updateOrderStatus(
    orderId: string,
    status: string,
    trackingInfo?: {
      carrier: string;
      trackingNumber: string;
      shippedDate?: Date;
    }
  ): Promise<OperationResult<{ orderId: string }>> {
    try {
      this.ensureInitialized();
      await this.ensureValidToken();
      
      this.logger.debug('Updating Amazon order status', { 
        orderId,
        status,
        trackingInfo
      });
      
      // For Amazon, we can only update tracking information when shipping
      if (status === OrderStatus.SHIPPED && trackingInfo) {
        // Get order items first
        const itemsResponse = await this.apiClient?.get(`/orders/v0/orders/${orderId}/orderItems`);
        
        if (!itemsResponse?.data?.orderItems) {
          return this.createErrorResult({
            code: 'ORDER_ITEMS_NOT_FOUND',
            message: `Items for order ${orderId} not found`,
            timestamp: new Date()
          });
        }
        
        // Create shipment for the order
        const shipmentPayload = {
          amazonOrderId: orderId,
          marketplaceId: this.amazonCredentials?.marketplaceId,
          shipmentDate: (trackingInfo.shippedDate || new Date()).toISOString(),
          shipFromAddress: {
            name: 'Warehouse',
            addressLine1: '123 Shipping St',
            city: 'Ship City',
            stateOrRegion: 'ST',
            postalCode: '12345',
            countryCode: 'US'
          },
          shippingServiceOptions: {
            carrierName: trackingInfo.carrier,
            shippingServiceName: trackingInfo.carrier
          },
          fulfillmentItems: itemsResponse.data.orderItems.map(item => ({
            sellerSku: item.sellerSku,
            sellerFulfillmentOrderItemId: item.orderItemId,
            quantity: item.quantityOrdered
          }))
        };
        
        if (trackingInfo.trackingNumber) {
          shipmentPayload.shippingServiceOptions.trackingNumber = trackingInfo.trackingNumber;
        }
        
        // Use merchantFulfillment API to create shipment
        await this.apiClient?.post('/merchantFulfillment/v0/shipments', shipmentPayload);
        
        return this.createSuccessResult({ orderId });
      }
      
      // For statuses other than SHIPPED, we don't have a direct API call
      // This is an informational update only
      this.logger.info('Status update for Amazon order is informational only', {
        orderId,
        status
      });
      
      return this.createSuccessResult({ orderId });
    } catch (error: any) {
      const marketplaceError = this.handleApiError(error, `updateOrderStatus(${orderId})`);
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Get Amazon marketplace categories
   * @param parentId Optional parent category ID for hierarchical retrieval
   */
  async getCategories(parentId?: string): Promise<OperationResult<MarketplaceCategory[]>> {
    try {
      this.ensureInitialized();
      await this.ensureValidToken();
      
      this.logger.debug('Getting Amazon categories', { parentId });
      
      // Use productTypes API to get categories
      const response = await this.apiClient?.get('/productTypes/v0/productTypes', {
        params: {
          marketplaceIds: [this.amazonCredentials?.marketplaceId]
        }
      });
      
      if (!response?.data?.productTypes) {
        return this.createErrorResult({
          code: 'CATEGORIES_NOT_FOUND',
          message: 'Failed to retrieve Amazon categories',
          timestamp: new Date()
        });
      }
      
      // Map to standardized format
      const categories: MarketplaceCategory[] = response.data.productTypes.map(type => ({
        id: type.name,
        name: type.displayName || type.name,
        level: 0, // Base level
        isLeaf: true, // Amazon product types are leaf nodes
        parentId: parentId || undefined
      }));
      
      return this.createSuccessResult(categories);
    } catch (error: any) {
      const marketplaceError = this.handleApiError(error, 'getCategories');
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Get Amazon category attributes
   * @param categoryId Amazon product type ID
   */
  async getCategoryAttributes(categoryId: string): Promise<OperationResult<Array<{
    id: string;
    name: string;
    required: boolean;
    type: string;
    values?: string[];
  }>>> {
    try {
      this.ensureInitialized();
      await this.ensureValidToken();
      
      this.logger.debug('Getting Amazon category attributes', { categoryId });
      
      // Use productTypes API to get category definition
      const response = await this.apiClient?.get(`/productTypes/v0/productTypes/${categoryId}/attributes`, {
        params: {
          marketplaceIds: [this.amazonCredentials?.marketplaceId],
          sellerId: this.amazonCredentials?.sellerId
        }
      });
      
      if (!response?.data?.attributes) {
        return this.createErrorResult({
          code: 'ATTRIBUTES_NOT_FOUND',
          message: `Attributes for category ${categoryId} not found`,
          timestamp: new Date()
        });
      }
      
      // Map to standardized format
      const attributes = response.data.attributes.map(attr => ({
        id: attr.name,
        name: attr.displayName || attr.name,
        required: attr.required || false,
        type: this.mapAttributeType(attr.dataType),
        values: attr.acceptedValues
      }));
      
      return this.createSuccessResult(attributes);
    } catch (error: any) {
      const marketplaceError = this.handleApiError(error, `getCategoryAttributes(${categoryId})`);
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Close the adapter and clean up resources
   */
  async close(): Promise<void> {
    this.logger.info('Closing Amazon adapter');
    this.apiClient = null;
    this.credentials = null;
    this.amazonCredentials = null;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Setup the API client with proper configurations
   * @private
   */
  private async setupApiClient(): Promise<void> {
    // Create base Axios client with default configuration
    this.apiClient = axios.create({
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'FluxoriV2/1.0.0 (Language=TypeScript; Platform=Node)'
      },
      timeout: 30000
    });
    
    // Add request interceptor to handle authentication
    this.apiClient.interceptors.request.use(async (config: AxiosRequestConfig) => {
      // Ensure we have a valid token
      await this.ensureValidToken();
      
      // Add authorization header
      if (this.accessToken && config.headers) {
        config.headers['Authorization'] = `Bearer ${this.accessToken}`;
      }
      
      return config;
    });
    
    // Add response interceptor to handle rate limiting and token refresh
    this.apiClient.interceptors.response.use(
      (response) => {
        // Update rate limit info if available
        if (response.headers['x-amzn-ratelimit-limit']) {
          this.rateLimitInfo = {
            limit: parseInt(response.headers['x-amzn-ratelimit-limit'] as string),
            remaining: parseInt(response.headers['x-amzn-ratelimit-remaining'] as string),
            reset: new Date(Date.now() + parseInt(response.headers['x-amzn-ratelimit-reset'] as string) * 1000)
          };
        }
        
        return response;
      },
      async (error) => {
        // Handle rate limiting
        if (error.response?.status === 429) {
          this.logger.warn('Amazon rate limit exceeded', {
            endpoint: error.config.url,
            retryAfter: error.response.headers['retry-after']
          });
        }
        
        // Handle token expiration
        if (error.response?.status === 401 && this.accessToken) {
          this.logger.info('Amazon access token expired, refreshing');
          
          // Clear current token
          this.accessToken = null;
          this.tokenExpiry = null;
          
          // Retry the request with a new token
          try {
            await this.getAccessToken();
            
            // Retry the original request
            error.config.headers['Authorization'] = `Bearer ${this.accessToken}`;
            return axios(error.config);
          } catch (refreshError) {
            this.logger.error('Failed to refresh Amazon access token', { error: refreshError });
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get a new access token using the refresh token
   * @private
   */
  private async getAccessToken(): Promise<void> {
    if (!this.amazonCredentials) {
      throw new Error('Amazon credentials not initialized');
    }
    
    try {
      // Use LWA (Login with Amazon) to get a new access token
      const response = await axios.post('https://api.amazon.com/auth/o2/token', {
        grant_type: 'refresh_token',
        refresh_token: this.amazonCredentials.refreshToken,
        client_id: this.amazonCredentials.clientId,
        client_secret: this.amazonCredentials.clientSecret
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      if (response.data.access_token) {
        this.accessToken = response.data.access_token;
        
        // Calculate expiry (typically 1 hour)
        const expiresIn = response.data.expires_in || 3600;
        this.tokenExpiry = new Date(Date.now() + expiresIn * 1000);
        
        this.logger.debug('Obtained new Amazon access token', {
          expiresIn,
          expiresAt: this.tokenExpiry.toISOString()
        });
      } else {
        throw new Error('Failed to obtain access token from Amazon');
      }
    } catch (error) {
      this.logger.error('Error getting Amazon access token', { error });
      throw error;
    }
  }

  /**
   * Ensure we have a valid access token
   * @private
   */
  private async ensureValidToken(): Promise<void> {
    if (!this.accessToken || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
      await this.getAccessToken();
    }
  }

  /**
   * Validate Amazon credentials
   * @param credentials Credentials to validate
   * @private
   */
  private validateCredentials(credentials: MarketplaceCredentials): boolean {
    const amazonCredentials = credentials as AmazonCredentials;
    
    // Check required fields
    return !!(
      amazonCredentials.sellerId &&
      amazonCredentials.marketplaceId &&
      amazonCredentials.refreshToken &&
      amazonCredentials.clientId &&
      amazonCredentials.clientSecret
    );
  }

  /**
   * Map an Amazon product to our standardized format
   * @param amazonProduct Amazon product data
   * @param sku Optional SKU if not available in the product data
   * @private
   */
  private mapAmazonProductToStandardFormat(amazonProduct: any, sku?: string): MarketplaceProduct {
    const product: MarketplaceProduct = {
      id: amazonProduct.asin || amazonProduct.identifiers?.ASIN || '',
      sku: amazonProduct.sku || sku || '',
      title: this.extractProductTitle(amazonProduct),
      description: this.extractProductDescription(amazonProduct),
      images: this.extractProductImages(amazonProduct),
      price: this.extractProductPrice(amazonProduct),
      currencyCode: 'USD', // Default
      stockLevel: this.extractProductStock(amazonProduct),
      status: this.extractProductStatus(amazonProduct),
      categories: this.extractProductCategories(amazonProduct),
      attributes: this.extractProductAttributes(amazonProduct),
      dimensions: this.extractProductDimensions(amazonProduct),
      barcode: amazonProduct.identifiers?.UPC || amazonProduct.identifiers?.EAN || amazonProduct.identifiers?.ISBN || '',
      createdAt: new Date(amazonProduct.createdDate || amazonProduct.lastUpdatedDate || Date.now()),
      updatedAt: new Date(amazonProduct.lastUpdatedDate || Date.now()),
      marketplaceId: 'amazon',
      marketplaceSku: amazonProduct.sku || sku || '',
      marketplaceUrl: amazonProduct.asin ? 
        `https://www.amazon.com/dp/${amazonProduct.asin}` : 
        undefined,
      metadata: {
        asin: amazonProduct.asin || amazonProduct.identifiers?.ASIN || '',
        productType: amazonProduct.productType || '',
        conditionType: amazonProduct.condition || 'New',
        buyBoxPrice: amazonProduct.summaries?.[0]?.buyBoxPrice || null,
        fulfillmentChannel: amazonProduct.fulfillmentAvailability?.[0]?.fulfillmentChannelCode || 'DEFAULT'
      }
    };
    
    return product;
  }

  /**
   * Extract product title from Amazon product data
   * @private
   */
  private extractProductTitle(amazonProduct: any): string {
    return amazonProduct.itemName || 
      amazonProduct.summaries?.[0]?.itemName || 
      amazonProduct.attributes?.itemName?.[0]?.value ||
      'Untitled Product';
  }

  /**
   * Extract product description from Amazon product data
   * @private
   */
  private extractProductDescription(amazonProduct: any): string | undefined {
    return amazonProduct.productDescription || 
      amazonProduct.summaries?.[0]?.productDescription || 
      amazonProduct.attributes?.productDescription?.[0]?.value;
  }

  /**
   * Extract product images from Amazon product data
   * @private
   */
  private extractProductImages(amazonProduct: any): string[] {
    const images: string[] = [];
    
    // Primary image
    if (amazonProduct.summaries?.[0]?.mainImage?.link) {
      images.push(amazonProduct.summaries[0].mainImage.link);
    }
    
    // Other images
    if (amazonProduct.summaries?.[0]?.otherImages) {
      amazonProduct.summaries[0].otherImages.forEach((img: any) => {
        if (img.link && !images.includes(img.link)) {
          images.push(img.link);
        }
      });
    }
    
    return images;
  }

  /**
   * Extract product price from Amazon product data
   * @private
   */
  private extractProductPrice(amazonProduct: any): number {
    // Try different possible locations for price data
    if (amazonProduct.pricing?.buyingPrice?.landedPrice?.amount) {
      return amazonProduct.pricing.buyingPrice.landedPrice.amount;
    }
    
    if (amazonProduct.summaries?.[0]?.buyBoxPrice?.amount) {
      return amazonProduct.summaries[0].buyBoxPrice.amount;
    }
    
    if (amazonProduct.offers?.[0]?.price?.amount) {
      return amazonProduct.offers[0].price.amount;
    }
    
    return 0;
  }

  /**
   * Extract product stock from Amazon product data
   * @private
   */
  private extractProductStock(amazonProduct: any): number {
    // Try different possible locations for stock data
    if (amazonProduct.fulfillmentAvailability?.[0]?.quantity) {
      return amazonProduct.fulfillmentAvailability[0].quantity;
    }
    
    if (amazonProduct.inventory?.fulfillableQuantity) {
      return amazonProduct.inventory.fulfillableQuantity;
    }
    
    return 0;
  }

  /**
   * Extract product status from Amazon product data
   * @private
   */
  private extractProductStatus(amazonProduct: any): ProductStatus {
    // Map Amazon status to standard status
    if (amazonProduct.status === 'INACTIVE' || amazonProduct.status === 'DELETED') {
      return ProductStatus.INACTIVE;
    }
    
    if (amazonProduct.status === 'INCOMPLETE') {
      return ProductStatus.PENDING;
    }
    
    if (amazonProduct.status === 'ACTIVE') {
      // If active but out of stock
      if (this.extractProductStock(amazonProduct) <= 0) {
        return ProductStatus.OUT_OF_STOCK;
      }
      
      return ProductStatus.ACTIVE;
    }
    
    return ProductStatus.INACTIVE;
  }

  /**
   * Extract product categories from Amazon product data
   * @private
   */
  private extractProductCategories(amazonProduct: any): string[] {
    const categories: string[] = [];
    
    // Product type
    if (amazonProduct.productType) {
      categories.push(amazonProduct.productType);
    }
    
    // Browse paths
    if (amazonProduct.browsePaths) {
      amazonProduct.browsePaths.forEach((path: string[]) => {
        categories.push(...path);
      });
    }
    
    // Sales ranks
    if (amazonProduct.salesRanks) {
      amazonProduct.salesRanks.forEach((rank: any) => {
        if (rank.classificationId) {
          categories.push(rank.classificationId);
        }
      });
    }
    
    return [...new Set(categories)]; // Remove duplicates
  }

  /**
   * Extract product attributes from Amazon product data
   * @private
   */
  private extractProductAttributes(amazonProduct: any): ProductAttribute[] {
    const attributes: ProductAttribute[] = [];
    
    // Extract from attributes object
    if (amazonProduct.attributes) {
      Object.entries(amazonProduct.attributes).forEach(([key, value]: [string, any]) => {
        if (Array.isArray(value) && value.length > 0) {
          attributes.push({
            name: key,
            value: value[0].value,
            unit: value[0].unit || undefined
          });
        }
      });
    }
    
    return attributes;
  }

  /**
   * Extract product dimensions from Amazon product data
   * @private
   */
  private extractProductDimensions(amazonProduct: any): ProductDimensions {
    const dimensions: ProductDimensions = {};
    
    // Extract from item dimensions
    if (amazonProduct.itemDimensions) {
      if (amazonProduct.itemDimensions.height?.value) {
        dimensions.height = amazonProduct.itemDimensions.height.value;
        dimensions.dimensionUnit = amazonProduct.itemDimensions.height.unit || 'inches';
      }
      
      if (amazonProduct.itemDimensions.length?.value) {
        dimensions.length = amazonProduct.itemDimensions.length.value;
        dimensions.dimensionUnit = amazonProduct.itemDimensions.length.unit || 'inches';
      }
      
      if (amazonProduct.itemDimensions.width?.value) {
        dimensions.width = amazonProduct.itemDimensions.width.value;
        dimensions.dimensionUnit = amazonProduct.itemDimensions.width.unit || 'inches';
      }
      
      if (amazonProduct.itemDimensions.weight?.value) {
        dimensions.weight = amazonProduct.itemDimensions.weight.value;
        dimensions.weightUnit = amazonProduct.itemDimensions.weight.unit || 'pounds';
      }
    }
    
    return dimensions;
  }

  /**
   * Map an Amazon order to our standardized format
   * @param amazonOrder Amazon order data
   * @param orderItems Amazon order items
   * @private
   */
  private async mapAmazonOrderToStandardFormat(amazonOrder: any, orderItems: any[]): Promise<MarketplaceOrder> {
    // Map shipping address
    const shippingAddress = amazonOrder.shippingAddress ? {
      line1: amazonOrder.shippingAddress.addressLine1 || '',
      line2: amazonOrder.shippingAddress.addressLine2 || undefined,
      city: amazonOrder.shippingAddress.city || '',
      state: amazonOrder.shippingAddress.stateOrRegion || undefined,
      postalCode: amazonOrder.shippingAddress.postalCode || '',
      country: amazonOrder.shippingAddress.countryCode || '',
      contactName: amazonOrder.shippingAddress.name || undefined,
      contactPhone: amazonOrder.shippingAddress.phoneNumber || undefined
    } : undefined;
    
    // Map customer details
    const customerDetails = {
      id: undefined,
      marketplaceCustomerId: amazonOrder.buyerId || undefined,
      email: amazonOrder.buyerEmail || 'no-email@amazon.com',
      firstName: amazonOrder.buyerName ? amazonOrder.buyerName.split(' ')[0] : undefined,
      lastName: amazonOrder.buyerName ? amazonOrder.buyerName.split(' ').slice(1).join(' ') : undefined,
      phone: amazonOrder.buyerPhone || undefined,
      billingAddress: shippingAddress
    };
    
    // Map order items
    const mappedItems = orderItems.map(item => ({
      id: item.orderItemId,
      sku: item.sellerSku,
      productId: item.asin,
      marketplaceProductId: item.asin,
      title: item.title,
      quantity: item.quantityOrdered,
      unitPrice: item.itemPrice?.amount ? parseFloat(item.itemPrice.amount) : 0,
      tax: item.itemTax?.amount ? parseFloat(item.itemTax.amount) : 0,
      discount: item.promotionDiscount?.amount ? parseFloat(item.promotionDiscount.amount) : 0,
      total: item.itemPrice?.amount ? parseFloat(item.itemPrice.amount) * item.quantityOrdered : 0,
      imageUrl: undefined
    }));
    
    // Map order status
    let orderStatus: OrderStatus;
    switch (amazonOrder.orderStatus) {
      case 'Pending':
        orderStatus = OrderStatus.NEW;
        break;
      case 'Unshipped':
        orderStatus = OrderStatus.PROCESSING;
        break;
      case 'PartiallyShipped':
        orderStatus = OrderStatus.PROCESSING;
        break;
      case 'Shipped':
        orderStatus = OrderStatus.SHIPPED;
        break;
      case 'Canceled':
        orderStatus = OrderStatus.CANCELED;
        break;
      default:
        orderStatus = OrderStatus.PROCESSING;
    }
    
    // Create standardized order
    const order: MarketplaceOrder = {
      id: amazonOrder.amazonOrderId,
      marketplaceOrderId: amazonOrder.amazonOrderId,
      customerDetails,
      orderItems: mappedItems,
      orderStatus,
      paymentStatus: amazonOrder.orderTotal?.amount ? 'paid' : 'pending',
      shippingStatus: amazonOrder.orderStatus === 'Shipped' ? 'shipped' : 'awaiting_fulfillment',
      shippingDetails: {
        address: shippingAddress || {
          line1: 'Unknown',
          city: 'Unknown',
          postalCode: 'Unknown',
          country: 'Unknown'
        },
        method: amazonOrder.shipmentServiceLevelCategory || 'Standard',
        carrier: amazonOrder.earliestShipDate ? undefined : undefined,
        trackingNumber: undefined,
        estimatedDelivery: amazonOrder.promisedDeliveryDate ? new Date(amazonOrder.promisedDeliveryDate) : undefined
      },
      paymentDetails: {
        method: amazonOrder.paymentMethod || 'Amazon',
        amount: amazonOrder.orderTotal?.amount ? parseFloat(amazonOrder.orderTotal.amount) : 0,
        currency: amazonOrder.orderTotal?.currencyCode || 'USD',
        paymentDate: amazonOrder.purchaseDate ? new Date(amazonOrder.purchaseDate) : undefined
      },
      currencyCode: amazonOrder.orderTotal?.currencyCode || 'USD',
      subtotal: amazonOrder.orderTotal?.amount ? 
        parseFloat(amazonOrder.orderTotal.amount) - 
        (amazonOrder.shippingPrice?.amount ? parseFloat(amazonOrder.shippingPrice.amount) : 0) : 0,
      shippingCost: amazonOrder.shippingPrice?.amount ? parseFloat(amazonOrder.shippingPrice.amount) : 0,
      tax: amazonOrder.orderTax?.amount ? parseFloat(amazonOrder.orderTax.amount) : 0,
      discount: 0, // Calculate from items
      total: amazonOrder.orderTotal?.amount ? parseFloat(amazonOrder.orderTotal.amount) : 0,
      createdAt: amazonOrder.purchaseDate ? new Date(amazonOrder.purchaseDate) : new Date(),
      updatedAt: amazonOrder.lastUpdateDate ? new Date(amazonOrder.lastUpdateDate) : new Date(),
      marketplaceSpecific: {
        fulfillmentChannel: amazonOrder.fulfillmentChannel,
        salesChannel: amazonOrder.salesChannel,
        orderType: amazonOrder.orderType,
        shipServiceLevel: amazonOrder.shipServiceLevel
      }
    };
    
    return order;
  }

  /**
   * Map Amazon attribute data type to standard type
   * @param dataType Amazon data type
   * @private
   */
  private mapAttributeType(dataType: string): string {
    switch (dataType) {
      case 'string':
        return 'string';
      case 'number':
      case 'integer':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'date':
      case 'dateTime':
        return 'date';
      case 'dimension':
        return 'dimension';
      case 'weight':
        return 'weight';
      default:
        return 'string';
    }
  }
}