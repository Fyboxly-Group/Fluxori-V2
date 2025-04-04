import { injectable, inject } from 'inversify';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { BaseMarketplaceAdapter } from '../common/base-marketplace-adapter';
import { 
  MarketplaceCredentials,
  ConnectionStatus,
  MarketplaceProduct,
  StockUpdatePayload,
  PriceUpdatePayload,
  StatusUpdatePayload,
  MarketplaceOrder,
  OrderAcknowledgment,
  MarketplaceCategory,
  PaginatedResponse,
  OperationResult,
  ProductFilterOptions,
  OrderFilterOptions,
  ProductStatus,
  MarketplaceError
} from '../../models/marketplace.models';
import { TakealotCredentials } from '../../interfaces/marketplace-credentials.interface';
import { takealotConfig } from '../../config/takealot.config';
import { Logger } from '../../../../types/logger';

/**
 * Interface for Takealot product data
 */
interface TakealotProduct {
  offer_id: string;
  tsin: string;
  title: string;
  barcode: string;
  sku: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  selling_price: number;
  rrp: number;
  images: Array<{
    url: string;
    is_primary: boolean;
  }>;
  stock_at_takealot_dc: {
    JHB: number;
    CPT: number;
    total: number;
  };
  category: {
    id: string;
    name: string;
    breadcrumb: string[];
  };
  attributes: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Interface for Takealot order data
 */
interface TakealotOrder {
  order_id: string;
  order_number: string;
  order_item_id: string;
  purchase_date: string;
  order_status: string;
  order_status_description: string;
  shipping_status: string;
  shipping_status_description: string;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  shipping_address: {
    street_address: string;
    suburb: string;
    city: string;
    postal_code: string;
    province: string;
    country: string;
  };
  product: {
    offer_id: string;
    tsin: string;
    title: string;
    sku: string;
    quantity: number;
    unit_price: number;
  };
  payment: {
    payment_method: string;
    payment_status: string;
    subtotal: number;
    shipping_fee: number;
    total: number;
    currency: string;
  };
  fulfillment: {
    courier: string;
    tracking_number: string;
    tracking_url: string;
    shipped_date: string | null;
  };
}

/**
 * Interface for Takealot category data
 */
interface TakealotCategory {
  id: string;
  name: string;
  parent_id: string | null;
  level: number;
  is_leaf: boolean;
  path: string[];
  attributes: Array<{
    id: string;
    name: string;
    required: boolean;
    data_type: string;
    allowed_values?: string[];
  }>;
}

/**
 * Takealot marketplace adapter implementation
 */
@injectable()
export class TakealotAdapter extends BaseMarketplaceAdapter {
  readonly marketplaceId = 'takealot';
  readonly marketplaceName = 'Takealot';
  
  // Takealot specific properties
  private takealotCredentials: TakealotCredentials | null = null;
  private apiClient: AxiosInstance | null = null;
  private logger: Logger;
  
  /**
   * Constructor for TakealotAdapter
   */
  constructor(@inject('Logger') logger: Logger) {
    super();
    this.logger = logger;
  }
  
  /**
   * Initialize the adapter with Takealot credentials
   * @param credentials Takealot marketplace credentials
   */
  async initialize(credentials: MarketplaceCredentials): Promise<void> {
    this.logger.info('Initializing Takealot adapter', {
      sellerId: credentials.sellerId || 'Unknown seller'
    });
    
    try {
      this.credentials = credentials;
      this.takealotCredentials = credentials as TakealotCredentials;
      
      // Determine API URL based on environment
      const environment = this.takealotCredentials.environment || 'production';
      const baseUrl = environment === 'sandbox' 
        ? 'https://sandbox-api.takealot.com' 
        : takealotConfig.apiBaseUrl;
      
      // Create Axios instance for making API calls
      this.apiClient = axios.create({
        baseURL: `${baseUrl}/${takealotConfig.apiVersion}`,
        timeout: takealotConfig.defaultTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      // Add authentication headers
      this.apiClient.defaults.headers.common['X-Api-Key'] = this.takealotCredentials.apiKey;
      this.apiClient.defaults.headers.common['X-Seller-Id'] = this.takealotCredentials.sellerId;
      
      // Add request interceptor for authentication
      this.apiClient.interceptors.request.use((config) => {
        // Add timestamp for request signing if required
        const timestamp = new Date().toISOString();
        config.headers['X-Timestamp'] = timestamp;
        
        // In a real implementation, we would add a signature here
        // const signature = this.generateSignature(timestamp, config.url, config.method);
        // config.headers['X-Signature'] = signature;
        
        return config;
      });
      
      // Add response interceptor for rate limit tracking
      this.apiClient.interceptors.response.use((response) => {
        // Update rate limit info if headers are present
        if (response.headers['x-ratelimit-remaining'] && 
            response.headers['x-ratelimit-limit'] && 
            response.headers['x-ratelimit-reset']) {
          this.rateLimitInfo = {
            remaining: parseInt(response.headers['x-ratelimit-remaining'], 10),
            limit: parseInt(response.headers['x-ratelimit-limit'], 10),
            reset: new Date(parseInt(response.headers['x-ratelimit-reset'], 10) * 1000)
          };
        }
        
        return response;
      });
      
      // Test connection to verify credentials
      const connectionStatus = await this.testConnection();
      
      if (!connectionStatus.connected) {
        throw new Error(`Failed to connect to Takealot: ${connectionStatus.message}`);
      }
      
      this.logger.info('Takealot adapter initialized successfully', {
        sellerId: this.takealotCredentials.sellerId,
        environment
      });
    } catch (error) {
      this.logger.error('Failed to initialize Takealot adapter', { error });
      throw error;
    }
  }
  
  /**
   * Test connection to Takealot API
   */
  async testConnection(): Promise<ConnectionStatus> {
    try {
      this.ensureInitialized();
      
      // In production, we'd make a real API call to verify connection
      // For demonstration, simulate a successful connection
      
      // For real implementation:
      // const response = await this.apiClient!.get('/seller/profile');
      // if (response.status === 200 && response.data) {
      //   // Connection successful
      // }
      
      this.lastConnectionCheck = new Date();
      this.lastConnectionStatus = true;
      
      return {
        connected: true,
        message: `Connected to Takealot as seller ${this.takealotCredentials?.sellerId}`,
        lastChecked: this.lastConnectionCheck
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('Takealot connection test failed', { error });
      
      this.lastConnectionCheck = new Date();
      this.lastConnectionStatus = false;
      
      return {
        connected: false,
        message: `Failed to connect to Takealot: ${message}`,
        lastChecked: this.lastConnectionCheck
      };
    }
  }
  
  /**
   * Get product by SKU from Takealot
   * @param sku Product SKU
   */
  async getProductBySku(sku: string): Promise<OperationResult<MarketplaceProduct>> {
    try {
      this.ensureInitialized();
      
      this.logger.debug('Getting Takealot product by SKU', { sku });
      
      // In production, we'd make a real API call to get product by SKU
      // For demonstration, return a mock response
      
      // For real implementation:
      // const response = await this.apiClient!.get(`/offers/by-sku/${sku}`);
      // const takealotProduct = response.data as TakealotProduct;
      
      // Mock a Takealot product for demo
      const takealotProduct: TakealotProduct = {
        offer_id: `offer-${sku}`,
        tsin: `T${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        title: `Test Product ${sku}`,
        barcode: `BARCODE${sku}`,
        sku,
        status: 'ACTIVE',
        selling_price: 599.99,
        rrp: 699.99,
        images: [
          { url: `https://media.takealot.com/covers/${sku}_1.jpg`, is_primary: true },
          { url: `https://media.takealot.com/covers/${sku}_2.jpg`, is_primary: false }
        ],
        stock_at_takealot_dc: {
          JHB: 10,
          CPT: 5,
          total: 15
        },
        category: {
          id: 'cat123',
          name: 'Electronics',
          breadcrumb: ['Home', 'Electronics']
        },
        attributes: {
          brand: 'Test Brand',
          color: 'Black',
          model: sku
        },
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Map to standard marketplace product format
      const standardProduct = this.mapTakealotProductToStandard(takealotProduct);
      
      return this.createSuccessResult(standardProduct);
    } catch (error) {
      const marketplaceError = this.handleApiError(error, `getProductBySku(${sku})`);
      return this.createErrorResult(marketplaceError);
    }
  }
  
  /**
   * Get product by ID from Takealot
   * @param id Product ID (offer_id in Takealot)
   */
  async getProductById(id: string): Promise<OperationResult<MarketplaceProduct>> {
    try {
      this.ensureInitialized();
      
      this.logger.debug('Getting Takealot product by ID', { id });
      
      // In production, we'd make a real API call to get product by ID
      // For demonstration, extract SKU from the ID and use getProductBySku
      
      // Takealot IDs typically have a prefix in our system
      const sku = id.startsWith('takealot-') 
        ? id.substring(9) 
        : id;
      
      return this.getProductBySku(sku);
    } catch (error) {
      const marketplaceError = this.handleApiError(error, `getProductById(${id})`);
      return this.createErrorResult(marketplaceError);
    }
  }
  
  /**
   * Get multiple products by SKUs
   * @param skus Array of product SKUs
   */
  async getProductsBySkus(skus: string[]): Promise<OperationResult<MarketplaceProduct[]>> {
    try {
      this.ensureInitialized();
      
      this.logger.debug('Getting Takealot products by SKUs', { skuCount: skus.length });
      
      // In production, Takealot might have a batch endpoint for multiple SKUs
      // For demonstration, call getProductBySku for each SKU
      
      const productPromises = skus.map(sku => this.getProductBySku(sku));
      const productResults = await Promise.all(productPromises);
      
      // Extract successful products
      const products = productResults
        .filter(result => result.success && result.data)
        .map(result => result.data!);
      
      return this.createSuccessResult(products);
    } catch (error) {
      const marketplaceError = this.handleApiError(error, `getProductsBySkus(${skus.length} SKUs)`);
      return this.createErrorResult(marketplaceError);
    }
  }
  
  /**
   * Get products with pagination
   * @param page Page number (0-based)
   * @param pageSize Number of products per page
   * @param filters Optional filters
   */
  async getProducts(
    page: number,
    pageSize: number,
    filters?: ProductFilterOptions
  ): Promise<PaginatedResponse<MarketplaceProduct>> {
    try {
      this.ensureInitialized();
      
      this.logger.debug('Getting Takealot products', { page, pageSize, filters });
      
      // In production, we'd make a real API call with pagination parameters
      // For demonstration, generate mock data
      
      // For real implementation:
      // const apiPage = page + 1; // Convert to 1-based for API
      // const params = {
      //   page: apiPage,
      //   limit: pageSize,
      //   ...this.convertFiltersToApiParams(filters)
      // };
      // const response = await this.apiClient!.get('/offers', { params });
      // const products = response.data.items as TakealotProduct[];
      // const totalItems = response.data.total_count;
      
      // Generate mock products
      const mockProducts: MarketplaceProduct[] = [];
      const totalItems = 100; // Mock total
      
      for (let i = 0; i < Math.min(pageSize, totalItems - page * pageSize); i++) {
        const index = page * pageSize + i;
        const sku = `SKU${index.toString().padStart(5, '0')}`;
        
        mockProducts.push({
          id: `takealot-${sku}`,
          sku,
          title: `Takealot Test Product ${index}`,
          description: `Description for product ${sku}`,
          price: 100 + Math.floor(Math.random() * 900),
          currencyCode: 'ZAR',
          stockLevel: Math.floor(Math.random() * 50),
          status: ProductStatus.ACTIVE,
          images: [`https://media.takealot.com/covers/${sku}_1.jpg`],
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
          marketplaceId: this.marketplaceId
        });
      }
      
      // Calculate pagination values
      const totalPages = Math.ceil(totalItems / pageSize);
      
      return {
        data: mockProducts,
        total: totalItems,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages - 1,
        hasPrev: page > 0
      };
    } catch (error) {
      this.logger.error('Error getting Takealot products', { error, page, pageSize, filters });
      
      // Return empty result with error
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
        error: this.handleApiError(error, 'getProducts')
      };
    }
  }
  
  /**
   * Update stock levels for products
   * @param updates Stock update payload
   */
  async updateStock(updates: StockUpdatePayload[]): Promise<OperationResult<{
    successful: string[];
    failed: Array<{ sku: string; reason: string }>;
  }>> {
    try {
      this.ensureInitialized();
      
      this.logger.debug('Updating Takealot product stock levels', { 
        updateCount: updates.length 
      });
      
      // In production, we'd make a real API call to update stock
      // For demonstration, simulate a mostly successful update
      
      // For real implementation:
      // const payload = updates.map(update => ({
      //   sku: update.sku,
      //   quantity: update.quantity
      // }));
      // const response = await this.apiClient!.post('/inventory/update', payload);
      // const results = response.data.results;
      
      // Simulate mostly successful updates with some random failures
      const successful: string[] = [];
      const failed: Array<{ sku: string, reason: string }> = [];
      
      for (const update of updates) {
        // 90% success rate
        if (Math.random() < 0.9) {
          successful.push(update.sku);
        } else {
          failed.push({
            sku: update.sku,
            reason: 'Simulated random failure'
          });
        }
      }
      
      return this.createSuccessResult({
        successful,
        failed
      });
    } catch (error) {
      const marketplaceError = this.handleApiError(error, 'updateStock');
      
      return this.createErrorResult({
        successful: [],
        failed: updates.map(update => ({
          sku: update.sku,
          reason: marketplaceError.message
        }))
      });
    }
  }
  
  /**
   * Update prices for products
   * @param updates Price update payload
   */
  async updatePrices(updates: PriceUpdatePayload[]): Promise<OperationResult<{
    successful: string[];
    failed: Array<{ sku: string; reason: string }>;
  }>> {
    try {
      this.ensureInitialized();
      
      this.logger.debug('Updating Takealot product prices', { 
        updateCount: updates.length 
      });
      
      // In production, we'd make a real API call to update prices
      // For demonstration, simulate a mostly successful update
      
      // For real implementation:
      // const payload = updates.map(update => ({
      //   sku: update.sku,
      //   selling_price: update.price
      // }));
      // const response = await this.apiClient!.post('/offers/update-price', payload);
      // const results = response.data.results;
      
      // Simulate mostly successful updates with some random failures
      const successful: string[] = [];
      const failed: Array<{ sku: string, reason: string }> = [];
      
      for (const update of updates) {
        // 90% success rate
        if (Math.random() < 0.9) {
          successful.push(update.sku);
        } else {
          failed.push({
            sku: update.sku,
            reason: 'Simulated random failure'
          });
        }
      }
      
      return this.createSuccessResult({
        successful,
        failed
      });
    } catch (error) {
      const marketplaceError = this.handleApiError(error, 'updatePrices');
      
      return this.createErrorResult({
        successful: [],
        failed: updates.map(update => ({
          sku: update.sku,
          reason: marketplaceError.message
        }))
      });
    }
  }
  
  /**
   * Update product status
   * @param updates Status update payload
   */
  async updateStatus(updates: StatusUpdatePayload[]): Promise<OperationResult<{
    successful: string[];
    failed: Array<{ sku: string; reason: string }>;
  }>> {
    try {
      this.ensureInitialized();
      
      this.logger.debug('Updating Takealot product status', { 
        updateCount: updates.length 
      });
      
      // In production, we'd make a real API call to update product status
      // For demonstration, simulate a mostly successful update
      
      // Map our status values to Takealot status values
      const mapStatus = (status: ProductStatus): string => {
        switch (status) {
          case ProductStatus.ACTIVE:
            return 'ACTIVE';
          case ProductStatus.INACTIVE:
            return 'INACTIVE';
          case ProductStatus.DRAFT:
            return 'INACTIVE'; // Takealot doesn't have a draft status
          default:
            return 'INACTIVE';
        }
      };
      
      // For real implementation:
      // const payload = updates.map(update => ({
      //   sku: update.sku,
      //   status: mapStatus(update.status)
      // }));
      // const response = await this.apiClient!.post('/offers/update-status', payload);
      // const results = response.data.results;
      
      // Simulate mostly successful updates with some random failures
      const successful: string[] = [];
      const failed: Array<{ sku: string, reason: string }> = [];
      
      for (const update of updates) {
        // 90% success rate
        if (Math.random() < 0.9) {
          successful.push(update.sku);
        } else {
          failed.push({
            sku: update.sku,
            reason: 'Simulated random failure'
          });
        }
      }
      
      return this.createSuccessResult({
        successful,
        failed
      });
    } catch (error) {
      const marketplaceError = this.handleApiError(error, 'updateStatus');
      
      return this.createErrorResult({
        successful: [],
        failed: updates.map(update => ({
          sku: update.sku,
          reason: marketplaceError.message
        }))
      });
    }
  }
  
  /**
   * Get recent orders
   * @param sinceDate Date to fetch orders from
   * @param page Page number (0-based)
   * @param pageSize Number of orders per page
   */
  async getRecentOrders(
    sinceDate: Date,
    page: number,
    pageSize: number
  ): Promise<PaginatedResponse<MarketplaceOrder>> {
    try {
      this.ensureInitialized();
      
      this.logger.debug('Getting recent Takealot orders', { 
        sinceDate, 
        page, 
        pageSize 
      });
      
      // In production, we'd make a real API call to get recent orders
      // For demonstration, generate mock data
      
      // For real implementation:
      // const apiPage = page + 1; // Convert to 1-based for API
      // const params = {
      //   page: apiPage,
      //   limit: pageSize,
      //   updated_after: sinceDate.toISOString()
      // };
      // const response = await this.apiClient!.get('/orders', { params });
      // const orders = response.data.items as TakealotOrder[];
      // const totalItems = response.data.total_count;
      
      // Generate mock orders
      const mockOrders: MarketplaceOrder[] = [];
      const totalItems = 20; // Mock total
      
      for (let i = 0; i < Math.min(pageSize, totalItems - page * pageSize); i++) {
        const index = page * pageSize + i;
        const orderNumber = `ORD${index.toString().padStart(6, '0')}`;
        const orderDate = new Date(Math.max(
          sinceDate.getTime(),
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
        ));
        
        mockOrders.push({
          id: `order-${orderNumber}`,
          marketplaceOrderId: orderNumber,
          orderItems: [
            {
              id: `item-${index}-1`,
              productId: `prod-${index}-1`,
              sku: `SKU${index}A`,
              title: `Product ${index}A`,
              quantity: 1,
              unitPrice: 199.99,
              total: 199.99
            },
            {
              id: `item-${index}-2`,
              productId: `prod-${index}-2`,
              sku: `SKU${index}B`,
              title: `Product ${index}B`,
              quantity: 2,
              unitPrice: 99.99,
              total: 199.98
            }
          ],
          customerDetails: {
            email: `customer${index}@example.com`,
            firstName: 'Test',
            lastName: 'Customer'
          },
          orderStatus: ['new', 'processing', 'shipped', 'delivered'][Math.floor(Math.random() * 4)],
          paymentStatus: 'paid',
          shippingStatus: ['pending', 'shipped', 'delivered'][Math.floor(Math.random() * 3)],
          shippingDetails: {
            address: {
              line1: '123 Test Street',
              city: 'Cape Town',
              postalCode: '8001',
              country: 'South Africa'
            },
            method: 'Standard Delivery'
          },
          paymentDetails: {
            method: 'Credit Card',
            amount: 399.97,
            currency: 'ZAR'
          },
          currencyCode: 'ZAR',
          subtotal: 399.97,
          shippingCost: 50,
          tax: 60,
          discount: 0,
          total: 509.97,
          createdAt: orderDate,
          updatedAt: new Date()
        });
      }
      
      // Calculate pagination values
      const totalPages = Math.ceil(totalItems / pageSize);
      
      return {
        data: mockOrders,
        total: totalItems,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages - 1,
        hasPrev: page > 0
      };
    } catch (error) {
      this.logger.error('Error getting recent Takealot orders', { 
        error, 
        sinceDate, 
        page, 
        pageSize 
      });
      
      // Return empty result with error
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
        error: this.handleApiError(error, 'getRecentOrders')
      };
    }
  }
  
  /**
   * Get order by ID
   * @param id Order ID
   */
  async getOrderById(id: string): Promise<OperationResult<MarketplaceOrder>> {
    try {
      this.ensureInitialized();
      
      this.logger.debug('Getting Takealot order by ID', { id });
      
      // In production, we'd make a real API call to get order by ID
      // For demonstration, generate mock data
      
      // For real implementation:
      // const response = await this.apiClient!.get(`/orders/${id}`);
      // const takealotOrder = response.data as TakealotOrder;
      
      // Extract order number from ID if it has our prefix
      const orderNumber = id.startsWith('order-') 
        ? id.substring(6) 
        : id;
      
      // Generate mock order
      const mockOrder: MarketplaceOrder = {
        id,
        marketplaceOrderId: orderNumber,
        orderItems: [
          {
            id: `item-${orderNumber}-1`,
            productId: `prod-${orderNumber}-1`,
            sku: `SKU${orderNumber}A`,
            title: `Product ${orderNumber}A`,
            quantity: 1,
            unitPrice: 199.99,
            total: 199.99
          },
          {
            id: `item-${orderNumber}-2`,
            productId: `prod-${orderNumber}-2`,
            sku: `SKU${orderNumber}B`,
            title: `Product ${orderNumber}B`,
            quantity: 2,
            unitPrice: 99.99,
            total: 199.98
          }
        ],
        customerDetails: {
          email: `customer-${orderNumber}@example.com`,
          firstName: 'Test',
          lastName: 'Customer'
        },
        orderStatus: 'processing',
        paymentStatus: 'paid',
        shippingStatus: 'pending',
        shippingDetails: {
          address: {
            line1: '123 Test Street',
            city: 'Cape Town',
            postalCode: '8001',
            country: 'South Africa'
          },
          method: 'Standard Delivery'
        },
        paymentDetails: {
          method: 'Credit Card',
          amount: 399.97,
          currency: 'ZAR'
        },
        currencyCode: 'ZAR',
        subtotal: 399.97,
        shippingCost: 50,
        tax: 60,
        discount: 0,
        total: 509.97,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      };
      
      return this.createSuccessResult(mockOrder);
    } catch (error) {
      const marketplaceError = this.handleApiError(error, `getOrderById(${id})`);
      return this.createErrorResult(marketplaceError);
    }
  }
  
  /**
   * Acknowledge receipt of an order
   * @param orderId Order ID
   */
  async acknowledgeOrder(orderId: string): Promise<OperationResult<OrderAcknowledgment>> {
    try {
      this.ensureInitialized();
      
      this.logger.debug('Acknowledging Takealot order', { orderId });
      
      // In production, we'd make a real API call to acknowledge the order
      // For demonstration, simulate success
      
      // For real implementation:
      // const response = await this.apiClient!.post(`/orders/${orderId}/acknowledge`);
      
      return this.createSuccessResult({
        orderId,
        success: true,
        timestamp: new Date()
      });
    } catch (error) {
      const marketplaceError = this.handleApiError(error, `acknowledgeOrder(${orderId})`);
      return this.createErrorResult(marketplaceError);
    }
  }
  
  /**
   * Update order status
   * @param orderId Order ID
   * @param status New status
   * @param trackingInfo Optional tracking information
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
      
      this.logger.debug('Updating Takealot order status', { 
        orderId, 
        status, 
        trackingInfo 
      });
      
      // In production, we'd make a real API call to update order status
      // For demonstration, simulate success
      
      // For real implementation:
      // const payload = {
      //   status,
      //   tracking: trackingInfo && {
      //     carrier: trackingInfo.carrier,
      //     tracking_number: trackingInfo.trackingNumber,
      //     shipped_date: trackingInfo.shippedDate?.toISOString()
      //   }
      // };
      // const response = await this.apiClient!.post(`/orders/${orderId}/update-status`, payload);
      
      return this.createSuccessResult({ orderId });
    } catch (error) {
      const marketplaceError = this.handleApiError(error, `updateOrderStatus(${orderId}, ${status})`);
      return this.createErrorResult(marketplaceError);
    }
  }
  
  /**
   * Get marketplace categories
   * @param parentId Optional parent category ID
   */
  async getCategories(parentId?: string): Promise<OperationResult<MarketplaceCategory[]>> {
    try {
      this.ensureInitialized();
      
      this.logger.debug('Getting Takealot categories', { parentId });
      
      // In production, we'd make a real API call to get categories
      // For demonstration, return mock data
      
      // For real implementation:
      // const params = parentId ? { parent_id: parentId } : {};
      // const response = await this.apiClient!.get('/categories', { params });
      // const takealotCategories = response.data.items as TakealotCategory[];
      
      // Mock categories
      const mockCategories: MarketplaceCategory[] = [
        {
          id: 'cat1',
          name: 'Electronics',
          level: 1,
          isLeaf: false,
          createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          id: 'cat2',
          name: 'Computers',
          parentId: 'cat1',
          level: 2,
          isLeaf: false,
          createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          id: 'cat3',
          name: 'Laptops',
          parentId: 'cat2',
          level: 3,
          isLeaf: true,
          createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          id: 'cat4',
          name: 'Home & Kitchen',
          level: 1,
          isLeaf: false,
          createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        }
      ];
      
      // Filter by parent ID if provided
      const filteredCategories = parentId
        ? mockCategories.filter(cat => cat.parentId === parentId)
        : mockCategories.filter(cat => !cat.parentId);
      
      return this.createSuccessResult(filteredCategories);
    } catch (error) {
      const marketplaceError = this.handleApiError(error, 'getCategories');
      return this.createErrorResult(marketplaceError);
    }
  }
  
  /**
   * Get category attributes
   * @param categoryId Category ID
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
      
      this.logger.debug('Getting Takealot category attributes', { categoryId });
      
      // In production, we'd make a real API call to get category attributes
      // For demonstration, return mock data
      
      // For real implementation:
      // const response = await this.apiClient!.get(`/categories/${categoryId}/attributes`);
      // const attributes = response.data.items;
      
      // Mock attributes for the "Laptops" category
      if (categoryId === 'cat3') {
        return this.createSuccessResult([
          {
            id: 'brand',
            name: 'Brand',
            required: true,
            type: 'enum',
            values: ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS']
          },
          {
            id: 'processor',
            name: 'Processor',
            required: true,
            type: 'enum',
            values: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'AMD Ryzen 5', 'AMD Ryzen 7']
          },
          {
            id: 'ram',
            name: 'RAM',
            required: true,
            type: 'enum',
            values: ['4GB', '8GB', '16GB', '32GB']
          },
          {
            id: 'storage',
            name: 'Storage',
            required: true,
            type: 'enum',
            values: ['256GB SSD', '512GB SSD', '1TB SSD', '1TB HDD']
          }
        ]);
      } else {
        return this.createSuccessResult([]);
      }
    } catch (error) {
      const marketplaceError = this.handleApiError(error, `getCategoryAttributes(${categoryId})`);
      return this.createErrorResult(marketplaceError);
    }
  }
  
  /**
   * Get marketplace health status
   */
  async getMarketplaceHealth(): Promise<ConnectionStatus> {
    try {
      this.ensureInitialized();
      
      // In production, we'd make specific API calls to check Takealot services
      // For demonstration, call testConnection
      
      return this.testConnection();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        connected: false,
        message: `Takealot service health check failed: ${message}`,
        lastChecked: new Date()
      };
    }
  }
  
  /**
   * Close the adapter and clean up resources
   */
  async close(): Promise<void> {
    this.logger.info('Closing Takealot adapter');
    
    // Clean up resources
    this.credentials = null;
    this.takealotCredentials = null;
    this.apiClient = null;
  }
  
  /**
   * Map a Takealot product to our standard format
   * @param takealotProduct Takealot product data
   */
  private mapTakealotProductToStandard(takealotProduct: TakealotProduct): MarketplaceProduct {
    // Map product status
    let productStatus: ProductStatus;
    switch (takealotProduct.status) {
      case 'ACTIVE':
        productStatus = ProductStatus.ACTIVE;
        break;
      case 'INACTIVE':
        productStatus = ProductStatus.INACTIVE;
        break;
      case 'SUSPENDED':
        productStatus = ProductStatus.INACTIVE;
        break;
      default:
        productStatus = ProductStatus.DRAFT;
    }
    
    // Extract images
    const images = takealotProduct.images
      .sort((a, b) => a.is_primary ? -1 : b.is_primary ? 1 : 0)
      .map(img => img.url);
    
    // Map to standard product format
    return {
      id: `takealot-${takealotProduct.sku}`,
      sku: takealotProduct.sku,
      title: takealotProduct.title,
      barcode: takealotProduct.barcode,
      price: takealotProduct.selling_price,
      currencyCode: 'ZAR', // Takealot operates in South African Rand
      stockLevel: takealotProduct.stock_at_takealot_dc.total,
      status: productStatus,
      images,
      createdAt: new Date(takealotProduct.created_at),
      updatedAt: new Date(takealotProduct.updated_at),
      marketplaceId: this.marketplaceId,
      // Takealot specific fields
      tsin: takealotProduct.tsin,
      category: takealotProduct.category.name,
      categoryPath: takealotProduct.category.breadcrumb.join(' > '),
      rrp: takealotProduct.rrp,
      attributes: takealotProduct.attributes
    };
  }
  
  /**
   * Convert our filter options to Takealot API parameters
   * @param filters Filter options
   */
  private convertFiltersToApiParams(filters?: ProductFilterOptions): Record<string, any> {
    if (!filters) {
      return {};
    }
    
    const params: Record<string, any> = {};
    
    if (filters.updatedAfter) {
      params.updated_after = filters.updatedAfter.toISOString();
    }
    
    if (filters.status) {
      // Map our status values to Takealot status values
      switch (filters.status) {
        case ProductStatus.ACTIVE:
          params.status = 'ACTIVE';
          break;
        case ProductStatus.INACTIVE:
          params.status = 'INACTIVE';
          break;
        case ProductStatus.DRAFT:
          params.status = 'INACTIVE'; // Takealot doesn't have a draft status
          break;
      }
    }
    
    return params;
  }
}