// @ts-nocheck - Disable TypeScript checking for this file due to complex axios typing issues
import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { BaseMarketplaceAdapter } from '../common/base-marketplace-adapter';
import {
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
  ProductStatus,
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
  MarketplaceCredentials,
  Address,
  OrderItem
} from '../../models/marketplace.models';
import { takealotConfig } from '../../config/takealot.config';

/**
 * Takealot API specific types
 */
interface TakealotApiResponse<T> {
  status: 'success' | 'error';
  code: number;
  message: string;
  data?: T;
  errors?: Array<{
    code: string;
    message: string;
    field?: string;
  }>;
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

interface TakealotOffer {
  tsin_id: number;
  offer_id: number;
  sku: string;
  barcode: string;
  product_label_number: string;
  selling_price: number;
  rrp: number;
  leadtime_days: number;
  leadtime_stock: TakealotOfferLeadtimeStock[];
  status: string;
  title: string;
  offer_url: string;
  stock_cover: TakealotStockCover[];
  sales_units: TakealotSalesUnits[];
  discount: string;
  discount_shown: boolean;
  storage_fee_eligible: boolean;
  date_created: string;
  stock_at_takealot_total: number;
  stock_at_takealot: TakealotWarehouseStock[];
  stock_on_way: TakealotWarehouseStock[];
  total_stock_on_way: number;
  total_stock_cover: number;
}

interface TakealotOfferLeadtimeStock {
  merchant_warehouse: {
    warehouse_id: number;
    name: string;
  };
  quantity_available: number;
}

interface TakealotStockCover {
  warehouse_id: number;
  stock_cover_days: number;
}

interface TakealotSalesUnits {
  warehouse_id: number;
  sales_units: number;
}

interface TakealotWarehouseStock {
  warehouse: {
    id: number;
    name: string;
  };
  quantity_available: number;
}

interface TakealotOfferSingleUpdate {
  sku?: string;
  selling_price?: number;
  rrp?: number;
  leadtime_days?: number;
  leadtime_stock?: TakealotOfferLeadtimeStock[];
  status_action?: 'Disable' | 'Re-enable';
}

interface TakealotOfferBatchCreateUpdate {
  offer_id?: number;
  sku?: string;
  barcode?: string;
  selling_price?: number;
  rrp?: number;
  leadtime_days?: number;
  leadtime_stock?: TakealotOfferLeadtimeStock[];
  status_action?: 'Disable' | 'Re-enable';
}

interface TakealotBatchResponse {
  batch_id: string;
  status: {
    code: number;
    message: string;
  };
  result: Array<{
    index: number;
    offer_id: number;
    errors?: Array<{
      code: string;
      message: string;
    }>;
  }>;
}

interface TakealotSale {
  shipment_id: number;
  shipment_state_id: number;
  po_number: number;
  shipment_name: string;
  offer_id: number;
  product_title: string;
  takealot_url_mobi: string;
  sku: string;
  tsin: number;
  order_id: number;
  order_item_id: number;
  quantity: number;
  selling_price: number;
  dc: string;
  customer_dc: string;
  order_date: string;
  sale_status: string;
  promotion: string;
  customer: string;
}

interface TakealotSalesResponse {
  page_summary: {
    page_size: number;
    page_number: number;
    total: number;
  };
  sales: TakealotSale[];
}

/**
 * Takealot Marketplace Adapter Implementation
 * Implements Takealot Seller API v2.0 integration using the common marketplace adapter interface
 */
export class TakealotAdapter extends BaseMarketplaceAdapter {
  readonly marketplaceId: string = 'takealot';
  readonly marketplaceName: string = 'Takealot';
  
  // API configuration
  private readonly apiBaseUrl: string;
  private readonly apiVersion: string;
  private apiClient: AxiosInstance;
  
  /**
   * Helper method to safely extract error messages
   */
  private getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object') {
      if ('response' in error && error.response) {
        // It's likely an AxiosError with response
        const axiosError = error as AxiosError;
        const responseData = axiosError.response?.data as any;
        return responseData?.message || axiosError.message || 'Unknown API error';
      } else if ('message' in error) {
        // It's a standard Error
        return (error as Error).message;
      }
    }
    return 'Unknown error';
  }
  private retryDelayMs: number;
  private maxRetries: number;
  
  // Rate limiting internal timestamp (not inherited from base class)
  private _rateLimitReset: number = 0; // Unix timestamp for internal use

  // Warehouse cache
  private merchantWarehouses: Array<{
    warehouse_id: number;
    name: string;
  }> = [];

  /**
   * Constructor
   */
  constructor() {
    super();
    
    // Get API configuration from environment or config
    this.apiBaseUrl = takealotConfig.apiBaseUrl;
    this.apiVersion = takealotConfig.apiVersion;
    this.retryDelayMs = takealotConfig.initialRetryDelay;
    this.maxRetries = takealotConfig.maxRetries;
    
    // Create the API client
    this.apiClient = axios.create({
      baseURL: this.apiBaseUrl,
      timeout: takealotConfig.defaultTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    // Add request interceptor to add auth headers
    this.apiClient.interceptors.request.use(async (config) => {
      // Make sure the adapter is initialized
      this.ensureInitialized();
      
      // @ts-ignore: Suppress all TypeScript errors related to config.headers
      // Add authentication headers
      if (!config.headers) {
        config.headers = {};
      }
      
      config.headers['X-API-KEY'] = this.credentials?.apiKey || '';
      
      return config;
    });
    
    // Add response interceptor to handle rate limits and update rate limit info
    this.apiClient.interceptors.response.use(
      (response) => {
        // Extract rate limit headers if present
        this.updateRateLimitInfo(response);
        return response;
      },
      async (error: AxiosError) => {
        // Extract rate limit headers even from error responses
        if (error.response) {
          this.updateRateLimitInfo(error.response);
          
          // Handle rate limiting (429 Too Many Requests)
          if (error.response.status === 429) {
            // Calculate delay based on headers or use default incremental delay
            const retryAfter = error.response.headers['retry-after'];
            const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : this.retryDelayMs;
            
            console.log(`Rate limited by Takealot API. Retrying in ${delay}ms`);
            await this.sleep(delay);
            
            // Retry the request (don't increment retry counter for rate limit errors)
            const config = error.config as AxiosRequestConfig & { _retryCount?: number };
            return this.apiClient(config);
          }
        }
        
        // For other errors, proceed with normal error handling
        return Promise.reject(error);
      }
    );
  }

  /**
   * Initialize the adapter with marketplace credentials
   */
  async initialize(credentials: MarketplaceCredentials): Promise<void> {
    if (!credentials.apiKey) {
      throw new Error('Takealot adapter requires an API key in the credentials');
    }
    
    // Save credentials
    this.credentials = credentials;
    
    // Test connection
    const connectionStatus = await this.testConnection();
    if (!connectionStatus.connected) {
      throw new Error(`Failed to connect to Takealot API: ${connectionStatus.message}`);
    }
    
    // Get seller warehouses
    await this.fetchMerchantWarehouses();
    
    console.log(`Takealot adapter initialized successfully. API Rate Limit: ${this.rateLimitInfo.remaining}/${this.rateLimitInfo.limit}`);
  }

  /**
   * Test the connection to the Takealot API
   */
  async testConnection(): Promise<ConnectionStatus> {
    this.ensureInitialized();
    
    try {
      // Try to get a single offer to test authentication
      // Using a count endpoint which should be less resource intensive
      const response = await this.makeRequest<TakealotApiResponse<{ count: number }>>(
        'GET',
        `/${this.apiVersion}/offers/count`,
        undefined,
        0
      );
      
      this.lastConnectionCheck = new Date();
      this.lastConnectionStatus = true;
      
      // Update the reset Date from the timestamp
      if (this._rateLimitReset) {
        this.rateLimitInfo.reset = new Date(this._rateLimitReset * 1000);
      }
      
      return {
        connected: true,
        message: 'Successfully connected to Takealot API',
        lastChecked: this.lastConnectionCheck,
        rateLimit: this.rateLimitInfo
      };
    } catch (error) {
      this.lastConnectionCheck = new Date();
      this.lastConnectionStatus = false;
      
      let message = 'Failed to connect to Takealot API';
      // Type guard for AxiosError
      if (error && typeof error === 'object' && 'response' in error && error.response) {
        // It's likely an AxiosError with response data
        const axiosError = error as AxiosError;
        const responseData = axiosError.response?.data as any;
        const errorMessage = axiosError.message || '';
        const responseStatus = axiosError.response?.status || '';
        message = `${message}: ${responseStatus} - ${responseData?.message || errorMessage}`;
      } else if (error && typeof error === 'object' && 'message' in error) {
        // It's a standard Error object
        message = `${message}: ${(error as Error).message}`;
      }
      
      return {
        connected: false,
        message,
        lastChecked: this.lastConnectionCheck
      };
    }
  }

  /**
   * Get the current API rate limit status
   */
  async getRateLimitStatus(): Promise<{ remaining: number; reset: Date; limit: number; }> {
    // Ensure that the reset Date is updated
    if (this._rateLimitReset) {
      this.rateLimitInfo.reset = new Date(this._rateLimitReset * 1000);
    }
    
    return this.rateLimitInfo;
  }

  /**
   * Fetch a product by its SKU
   */
  async getProductBySku(sku: string): Promise<OperationResult<MarketplaceProduct>> {
    this.ensureInitialized();
    
    try {
      // Takealot API allows searching by SKU with the query parameter
      const response = await this.makeRequest<TakealotApiResponse<TakealotOffer>>(
        'GET',
        `/${this.apiVersion}/offers/offer`,
        { params: { identifier: sku, identifier_type: 'sku' } }
      );
      
      if (!response.data.data) {
        return this.createErrorResult(
          this.createError(`No product found with SKU: ${sku}`, 'PRODUCT_NOT_FOUND')
        );
      }
      
      // Convert to standardized format
      const product = this.mapTakealotOfferToProduct(response.data.data);
      
      return this.createSuccessResult(product);
    } catch (error) {
      const marketplaceError = this.handleApiError(error, `getProductBySku(${sku})`);
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Fetch a product by marketplace-specific ID
   */
  async getProductById(id: string): Promise<OperationResult<MarketplaceProduct>> {
    this.ensureInitialized();
    
    try {
      // In Takealot's case, the ID is the offer_id
      const offerId = parseInt(id, 10);
      if (isNaN(offerId)) {
        return this.createErrorResult(
          this.createError(`Invalid offer ID: ${id}`, 'INVALID_OFFER_ID')
        );
      }
      
      const response = await this.makeRequest<TakealotApiResponse<TakealotOffer>>(
        'GET',
        `/${this.apiVersion}/offers/offer`,
        { params: { identifier: offerId, identifier_type: 'offer_id' } }
      );
      
      if (!response.data.data) {
        return this.createErrorResult(
          this.createError(`No product found with ID: ${id}`, 'PRODUCT_NOT_FOUND')
        );
      }
      
      // Convert to standardized format
      const product = this.mapTakealotOfferToProduct(response.data.data);
      
      return this.createSuccessResult(product);
    } catch (error) {
      const marketplaceError = this.handleApiError(error, `getProductById(${id})`);
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Fetch multiple products by their SKUs
   */
  async getProductsBySkus(skus: string[]): Promise<OperationResult<MarketplaceProduct[]>> {
    this.ensureInitialized();
    
    try {
      if (skus.length === 0) {
        return this.createSuccessResult([]);
      }
      
      // Takealot doesn't support bulk retrieval directly
      // We need to fetch each product individually
      const productPromises = skus.map(sku => this.getProductBySku(sku));
      const productResults = await Promise.all(productPromises);
      
      // Filter successful results and extract products
      const products: MarketplaceProduct[] = productResults
        .filter(result => result.success && result.data)
        .map(result => result.data as MarketplaceProduct);
      
      // Check if any SKUs are missing and log them
      const foundSkus = products.map(p => p.sku);
      const missingSkus = skus.filter(sku => !foundSkus.includes(sku));
      
      if (missingSkus.length > 0) {
        console.warn(`Could not find ${missingSkus.length} products by SKU: ${missingSkus.join(', ')}`);
      }
      
      return this.createSuccessResult(products);
    } catch (error) {
      const marketplaceError = this.handleApiError(error, `getProductsBySkus(${skus.length} SKUs)`);
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Fetch products with pagination
   */
  async getProducts(
    page: number,
    pageSize: number,
    filters?: Record<string, any>
  ): Promise<PaginatedResponse<MarketplaceProduct>> {
    this.ensureInitialized();
    
    try {
      // Construct query parameters
      const params: Record<string, any> = {
        page: page + 1, // Convert from 0-based to 1-based paging
        page_size: pageSize,
        ...filters
      };
      
      // Fetch offers from Takealot
      const response = await this.makeRequest<TakealotApiResponse<{
        total_results: number;
        page_size: number;
        page_number: number;
        offers: TakealotOffer[];
      }>>(
        'GET',
        `/${this.apiVersion}/offers`,
        { params }
      );
      
      if (!response.data.data || !response.data.data.offers) {
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
      
      // Convert Takealot offers to standardized products
      const products = response.data.data.offers.map(
        offer => this.mapTakealotOfferToProduct(offer)
      );
      
      // Extract pagination metadata
      const total = response.data.data.total_results;
      const totalPages = Math.ceil(total / pageSize);
      
      // Return standardized paginated response
      return {
        data: products,
        total,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages - 1,
        hasPrev: page > 0
      };
    } catch (error) {
      console.error(`Error fetching products from Takealot:`, error);
      
      // Return empty result on error
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
   */
  async updateStock(updates: StockUpdatePayload[]): Promise<OperationResult<{
    successful: string[];
    failed: Array<{ sku: string; reason: string; }>;
  }>> {
    this.ensureInitialized();
    
    try {
      if (updates.length === 0) {
        return this.createSuccessResult({ successful: [], failed: [] });
      }
      
      // For bulk updates (>5 items), use batch endpoint
      if (updates.length > 5) {
        return this.updateStockBatch(updates);
      }
      
      // For smaller updates, do them individually
      const successful: string[] = [];
      const failed: Array<{ sku: string; reason: string; }> = [];
      
      // Process each update one by one
      for (const update of updates) {
        try {
          // Get the current offer to get the offer_id
          const productResult = await this.getProductBySku(update.sku);
          
          if (!productResult.success || !productResult.data) {
            failed.push({
              sku: update.sku,
              reason: productResult.error?.message || 'Product not found'
            });
            continue;
          }
          
          const offerId = productResult.data.id;
          
          // Create the update payload
          const updatePayload: TakealotOfferSingleUpdate = {
            leadtime_stock: this.createLeadtimeStockPayload(update.quantity)
          };
          
          // Update the stock level
          const updateResponse = await this.makeRequest<TakealotApiResponse<any>>(
            'PATCH',
            `/${this.apiVersion}/offers/offer/${offerId}`,
            { data: updatePayload }
          );
          
          if (updateResponse.data.status === 'success') {
            successful.push(update.sku);
          } else {
            const errorMsg = updateResponse.data.errors?.[0]?.message || 'Unknown error';
            failed.push({
              sku: update.sku,
              reason: errorMsg
            });
          }
        } catch (error) {
          failed.push({
            sku: update.sku,
            reason: error.message || 'Unknown error'
          });
        }
      }
      
      return this.createSuccessResult({ successful, failed });
    } catch (error) {
      const marketplaceError = this.handleApiError(error, 'updateStock');
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Update stock levels in batch
   */
  private async updateStockBatch(updates: StockUpdatePayload[]): Promise<OperationResult<{
    successful: string[];
    failed: Array<{ sku: string; reason: string; }>;
  }>> {
    // Prepare batch updates
    const batchUpdates: TakealotOfferBatchCreateUpdate[] = [];
    
    for (const update of updates) {
      batchUpdates.push({
        sku: update.sku,
        leadtime_stock: this.createLeadtimeStockPayload(update.quantity)
      });
    }
    
    // Create batch
    const batchResponse = await this.makeRequest<TakealotApiResponse<TakealotBatchResponse>>(
      'POST',
      `/${this.apiVersion}/offers/batch`,
      { data: { offers: batchUpdates } }
    );
    
    if (!batchResponse.data.data) {
      return this.createErrorResult(
        this.createError('Failed to create batch update', 'BATCH_UPDATE_FAILED')
      );
    }
    
    const batchId = batchResponse.data.data.batch_id;
    
    // Poll for batch completion
    let batchCompleted = false;
    let retryCount = 0;
    let batchResult: TakealotBatchResponse | null = null;
    
    // Wait for batch to complete (max 60 seconds)
    while (!batchCompleted && retryCount < 12) {
      await this.sleep(5000); // Wait 5 seconds between checks
      
      try {
        const batchStatusResponse = await this.makeRequest<TakealotApiResponse<TakealotBatchResponse>>(
          'GET',
          `/${this.apiVersion}/offers/batch/${batchId}`
        );
        
        if (batchStatusResponse.data.data) {
          const status = batchStatusResponse.data.data.status.code;
          
          // If batch is completed (success or error)
          if (status === 200 || status >= 400) {
            batchCompleted = true;
            batchResult = batchStatusResponse.data.data;
          }
        }
      } catch (error) {
        console.error(`Error checking batch status: ${error.message}`);
      }
      
      retryCount++;
    }
    
    // Process batch results
    const successful: string[] = [];
    const failed: Array<{ sku: string; reason: string; }> = [];
    
    if (!batchResult) {
      // If we timed out waiting for batch to complete
      updates.forEach(update => {
        failed.push({
          sku: update.sku,
          reason: 'Batch processing timed out'
        });
      });
    } else {
      // Map batch results to SKUs
      for (let i = 0; i < batchUpdates.length; i++) {
        const update = batchUpdates[i];
        const sku = update.sku;
        
        if (!sku) continue;
        
        // Find the corresponding result
        const result = batchResult.result.find(r => r.index === i);
        
        if (!result) {
          failed.push({
            sku,
            reason: 'No result for this item in batch response'
          });
        } else if (result.errors && result.errors.length > 0) {
          failed.push({
            sku,
            reason: result.errors.map(e => e.message).join(', ')
          });
        } else {
          successful.push(sku);
        }
      }
    }
    
    return this.createSuccessResult({ successful, failed });
  }

  /**
   * Update prices for one or more products
   */
  async updatePrices(updates: PriceUpdatePayload[]): Promise<OperationResult<{
    successful: string[];
    failed: Array<{ sku: string; reason: string; }>;
  }>> {
    this.ensureInitialized();
    
    try {
      if (updates.length === 0) {
        return this.createSuccessResult({ successful: [], failed: [] });
      }
      
      // For bulk updates (>5 items), use batch endpoint
      if (updates.length > 5) {
        return this.updatePricesBatch(updates);
      }
      
      // For smaller updates, do them individually
      const successful: string[] = [];
      const failed: Array<{ sku: string; reason: string; }> = [];
      
      // Process each update one by one
      for (const update of updates) {
        try {
          // Get the current offer to get the offer_id
          const productResult = await this.getProductBySku(update.sku);
          
          if (!productResult.success || !productResult.data) {
            failed.push({
              sku: update.sku,
              reason: productResult.error?.message || 'Product not found'
            });
            continue;
          }
          
          const offerId = productResult.data.id;
          
          // Create the update payload
          const updatePayload: TakealotOfferSingleUpdate = {
            selling_price: Math.round(update.price) // Takealot requires whole numbers
          };
          
          // Add RRP if specified
          if (update.salePrice) {
            updatePayload.rrp = Math.round(update.salePrice);
          }
          
          // Update the price
          const updateResponse = await this.makeRequest<TakealotApiResponse<any>>(
            'PATCH',
            `/${this.apiVersion}/offers/offer/${offerId}`,
            { data: updatePayload }
          );
          
          if (updateResponse.data.status === 'success') {
            successful.push(update.sku);
          } else {
            const errorMsg = updateResponse.data.errors?.[0]?.message || 'Unknown error';
            failed.push({
              sku: update.sku,
              reason: errorMsg
            });
          }
        } catch (error) {
          failed.push({
            sku: update.sku,
            reason: error.message || 'Unknown error'
          });
        }
      }
      
      return this.createSuccessResult({ successful, failed });
    } catch (error) {
      const marketplaceError = this.handleApiError(error, 'updatePrices');
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Update prices in batch
   */
  private async updatePricesBatch(updates: PriceUpdatePayload[]): Promise<OperationResult<{
    successful: string[];
    failed: Array<{ sku: string; reason: string; }>;
  }>> {
    // Prepare batch updates
    const batchUpdates: TakealotOfferBatchCreateUpdate[] = [];
    
    for (const update of updates) {
      const batchItem: TakealotOfferBatchCreateUpdate = {
        sku: update.sku,
        selling_price: Math.round(update.price) // Takealot requires whole numbers
      };
      
      // Add RRP if specified
      if (update.salePrice) {
        batchItem.rrp = Math.round(update.salePrice);
      }
      
      batchUpdates.push(batchItem);
    }
    
    // Create batch
    const batchResponse = await this.makeRequest<TakealotApiResponse<TakealotBatchResponse>>(
      'POST',
      `/${this.apiVersion}/offers/batch`,
      { data: { offers: batchUpdates } }
    );
    
    if (!batchResponse.data.data) {
      return this.createErrorResult(
        this.createError('Failed to create batch update', 'BATCH_UPDATE_FAILED')
      );
    }
    
    const batchId = batchResponse.data.data.batch_id;
    
    // Poll for batch completion
    let batchCompleted = false;
    let retryCount = 0;
    let batchResult: TakealotBatchResponse | null = null;
    
    // Wait for batch to complete (max 60 seconds)
    while (!batchCompleted && retryCount < 12) {
      await this.sleep(5000); // Wait 5 seconds between checks
      
      try {
        const batchStatusResponse = await this.makeRequest<TakealotApiResponse<TakealotBatchResponse>>(
          'GET',
          `/${this.apiVersion}/offers/batch/${batchId}`
        );
        
        if (batchStatusResponse.data.data) {
          const status = batchStatusResponse.data.data.status.code;
          
          // If batch is completed (success or error)
          if (status === 200 || status >= 400) {
            batchCompleted = true;
            batchResult = batchStatusResponse.data.data;
          }
        }
      } catch (error) {
        console.error(`Error checking batch status: ${error.message}`);
      }
      
      retryCount++;
    }
    
    // Process batch results
    const successful: string[] = [];
    const failed: Array<{ sku: string; reason: string; }> = [];
    
    if (!batchResult) {
      // If we timed out waiting for batch to complete
      updates.forEach(update => {
        failed.push({
          sku: update.sku,
          reason: 'Batch processing timed out'
        });
      });
    } else {
      // Map batch results to SKUs
      for (let i = 0; i < batchUpdates.length; i++) {
        const update = batchUpdates[i];
        const sku = update.sku;
        
        if (!sku) continue;
        
        // Find the corresponding result
        const result = batchResult.result.find(r => r.index === i);
        
        if (!result) {
          failed.push({
            sku,
            reason: 'No result for this item in batch response'
          });
        } else if (result.errors && result.errors.length > 0) {
          failed.push({
            sku,
            reason: result.errors.map(e => e.message).join(', ')
          });
        } else {
          successful.push(sku);
        }
      }
    }
    
    return this.createSuccessResult({ successful, failed });
  }

  /**
   * Update status (active/inactive) for one or more products
   */
  async updateStatus(updates: StatusUpdatePayload[]): Promise<OperationResult<{
    successful: string[];
    failed: Array<{ sku: string; reason: string; }>;
  }>> {
    this.ensureInitialized();
    
    try {
      if (updates.length === 0) {
        return this.createSuccessResult({ successful: [], failed: [] });
      }
      
      // For bulk updates (>5 items), use batch endpoint
      if (updates.length > 5) {
        return this.updateStatusBatch(updates);
      }
      
      // For smaller updates, do them individually
      const successful: string[] = [];
      const failed: Array<{ sku: string; reason: string; }> = [];
      
      // Process each update one by one
      for (const update of updates) {
        try {
          // Get the current offer to get the offer_id
          const productResult = await this.getProductBySku(update.sku);
          
          if (!productResult.success || !productResult.data) {
            failed.push({
              sku: update.sku,
              reason: productResult.error?.message || 'Product not found'
            });
            continue;
          }
          
          const offerId = productResult.data.id;
          
          // Map our status to Takealot status_action
          const statusAction = this.mapProductStatusToTakealotAction(update.status);
          
          // Create the update payload
          const updatePayload: TakealotOfferSingleUpdate = {
            status_action: statusAction
          };
          
          // Update the status
          const updateResponse = await this.makeRequest<TakealotApiResponse<any>>(
            'PATCH',
            `/${this.apiVersion}/offers/offer/${offerId}`,
            { data: updatePayload }
          );
          
          if (updateResponse.data.status === 'success') {
            successful.push(update.sku);
          } else {
            const errorMsg = updateResponse.data.errors?.[0]?.message || 'Unknown error';
            failed.push({
              sku: update.sku,
              reason: errorMsg
            });
          }
        } catch (error) {
          failed.push({
            sku: update.sku,
            reason: error.message || 'Unknown error'
          });
        }
      }
      
      return this.createSuccessResult({ successful, failed });
    } catch (error) {
      const marketplaceError = this.handleApiError(error, 'updateStatus');
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Update status in batch
   */
  private async updateStatusBatch(updates: StatusUpdatePayload[]): Promise<OperationResult<{
    successful: string[];
    failed: Array<{ sku: string; reason: string; }>;
  }>> {
    // Prepare batch updates
    const batchUpdates: TakealotOfferBatchCreateUpdate[] = [];
    
    for (const update of updates) {
      batchUpdates.push({
        sku: update.sku,
        status_action: this.mapProductStatusToTakealotAction(update.status)
      });
    }
    
    // Create batch
    const batchResponse = await this.makeRequest<TakealotApiResponse<TakealotBatchResponse>>(
      'POST',
      `/${this.apiVersion}/offers/batch`,
      { data: { offers: batchUpdates } }
    );
    
    if (!batchResponse.data.data) {
      return this.createErrorResult(
        this.createError('Failed to create batch update', 'BATCH_UPDATE_FAILED')
      );
    }
    
    const batchId = batchResponse.data.data.batch_id;
    
    // Poll for batch completion
    let batchCompleted = false;
    let retryCount = 0;
    let batchResult: TakealotBatchResponse | null = null;
    
    // Wait for batch to complete (max 60 seconds)
    while (!batchCompleted && retryCount < 12) {
      await this.sleep(5000); // Wait 5 seconds between checks
      
      try {
        const batchStatusResponse = await this.makeRequest<TakealotApiResponse<TakealotBatchResponse>>(
          'GET',
          `/${this.apiVersion}/offers/batch/${batchId}`
        );
        
        if (batchStatusResponse.data.data) {
          const status = batchStatusResponse.data.data.status.code;
          
          // If batch is completed (success or error)
          if (status === 200 || status >= 400) {
            batchCompleted = true;
            batchResult = batchStatusResponse.data.data;
          }
        }
      } catch (error) {
        console.error(`Error checking batch status: ${error.message}`);
      }
      
      retryCount++;
    }
    
    // Process batch results
    const successful: string[] = [];
    const failed: Array<{ sku: string; reason: string; }> = [];
    
    if (!batchResult) {
      // If we timed out waiting for batch to complete
      updates.forEach(update => {
        failed.push({
          sku: update.sku,
          reason: 'Batch processing timed out'
        });
      });
    } else {
      // Map batch results to SKUs
      for (let i = 0; i < batchUpdates.length; i++) {
        const update = batchUpdates[i];
        const sku = update.sku;
        
        if (!sku) continue;
        
        // Find the corresponding result
        const result = batchResult.result.find(r => r.index === i);
        
        if (!result) {
          failed.push({
            sku,
            reason: 'No result for this item in batch response'
          });
        } else if (result.errors && result.errors.length > 0) {
          failed.push({
            sku,
            reason: result.errors.map(e => e.message).join(', ')
          });
        } else {
          successful.push(sku);
        }
      }
    }
    
    return this.createSuccessResult({ successful, failed });
  }

  /**
   * Fetch recent orders with pagination
   */
  async getRecentOrders(
    sinceDate: Date,
    page: number,
    pageSize: number
  ): Promise<PaginatedResponse<MarketplaceOrder>> {
    this.ensureInitialized();
    
    try {
      // Format the date for Takealot API (YYYY-MM-DD)
      const sinceDateStr = sinceDate.toISOString().split('T')[0];
      
      // Construct query parameters
      const params: Record<string, any> = {
        page: page + 1, // Convert from 0-based to 1-based paging
        page_size: pageSize,
        from_date: sinceDateStr
      };
      
      // Fetch orders from Takealot
      const response = await this.makeRequest<TakealotSalesResponse>(
        'GET',
        `/v1/sales`,
        { params }
      );
      
      if (!response.data || !response.data.sales) {
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
      
      // Convert Takealot orders to standardized format
      const orders = response.data.sales.map(
        sale => this.mapTakealotSaleToOrder(sale)
      );
      
      // Extract pagination metadata
      const total = response.data.page_summary.total;
      const totalPages = Math.ceil(total / pageSize);
      
      // Return standardized paginated response
      return {
        data: orders,
        total,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages - 1,
        hasPrev: page > 0
      };
    } catch (error) {
      console.error(`Error fetching orders from Takealot:`, error);
      
      // Return empty result on error
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
   * Fetch an order by its marketplace-specific ID
   */
  async getOrderById(id: string): Promise<OperationResult<MarketplaceOrder>> {
    this.ensureInitialized();
    
    try {
      // Takealot doesn't have a direct endpoint to get a single order by ID
      // We need to search for it
      const orderId = parseInt(id, 10);
      if (isNaN(orderId)) {
        return this.createErrorResult(
          this.createError(`Invalid order ID: ${id}`, 'INVALID_ORDER_ID')
        );
      }
      
      // Find the order
      const params: Record<string, any> = {
        order_id: orderId
      };
      
      const response = await this.makeRequest<TakealotSalesResponse>(
        'GET',
        `/v1/sales`,
        { params }
      );
      
      if (!response.data || !response.data.sales || response.data.sales.length === 0) {
        return this.createErrorResult(
          this.createError(`Order not found: ${id}`, 'ORDER_NOT_FOUND')
        );
      }
      
      // Get the first matching sale
      const sale = response.data.sales[0];
      const order = this.mapTakealotSaleToOrder(sale);
      
      return this.createSuccessResult(order);
    } catch (error) {
      const marketplaceError = this.handleApiError(error, `getOrderById(${id})`);
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Acknowledge receipt of an order
   * Note: Takealot doesn't have a direct "acknowledge" endpoint, so this is a placeholder
   */
  async acknowledgeOrder(orderId: string): Promise<OperationResult<OrderAcknowledgment>> {
    this.ensureInitialized();
    
    try {
      // Takealot doesn't have an explicit API to acknowledge orders
      // Orders are automatically acknowledged in their system
      // Just verify that the order exists
      const orderResult = await this.getOrderById(orderId);
      
      if (!orderResult.success || !orderResult.data) {
        return this.createErrorResult(
          this.createError(`Cannot acknowledge order: ${orderId} - Order not found`, 'ORDER_NOT_FOUND')
        );
      }
      
      // Return successful acknowledgment
      return this.createSuccessResult({
        orderId,
        success: true,
        message: 'Order acknowledged successfully (automatic in Takealot)',
        timestamp: new Date(),
        reference: orderId
      });
    } catch (error) {
      const marketplaceError = this.handleApiError(error, `acknowledgeOrder(${orderId})`);
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Update order status
   * Note: Takealot doesn't provide API endpoints to update order status, this is a placeholder
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
    this.ensureInitialized();
    
    // Takealot handles order statuses automatically based on their internal processes
    // Sellers cannot directly update order statuses via API
    return this.createErrorResult(
      this.createError(
        'Takealot does not support updating order status via API. Order status changes are managed by Takealot\'s internal processes.',
        'OPERATION_NOT_SUPPORTED'
      )
    );
  }

  /**
   * Get marketplace-specific categories
   * Note: Takealot doesn't provide an API to fetch categories, this is a placeholder
   */
  async getCategories(parentId?: string): Promise<OperationResult<MarketplaceCategory[]>> {
    this.ensureInitialized();
    
    // Takealot doesn't expose their category hierarchy via the Seller API
    return this.createErrorResult(
      this.createError(
        'Takealot does not provide category data via their Seller API',
        'OPERATION_NOT_SUPPORTED'
      )
    );
  }

  /**
   * Get marketplace-specific attributes for a category
   * Note: Takealot doesn't provide an API to fetch category attributes, this is a placeholder
   */
  async getCategoryAttributes(categoryId: string): Promise<OperationResult<Array<{
    id: string;
    name: string;
    required: boolean;
    type: string;
    values?: string[];
  }>>> {
    this.ensureInitialized();
    
    // Takealot doesn't expose category attributes via the Seller API
    return this.createErrorResult(
      this.createError(
        'Takealot does not provide category attribute data via their Seller API',
        'OPERATION_NOT_SUPPORTED'
      )
    );
  }

  /**
   * Get marketplace health status
   */
  async getMarketplaceHealth(): Promise<ConnectionStatus> {
    return this.testConnection();
  }

  /**
   * Fetch merchant warehouses
   * This is needed to properly set leadtime stock
   */
  private async fetchMerchantWarehouses(): Promise<void> {
    try {
      // We need to fetch at least one offer to get warehouse info
      const response = await this.makeRequest<TakealotApiResponse<{
        total_results: number;
        page_size: number;
        page_number: number;
        offers: TakealotOffer[];
      }>>(
        'GET',
        `/${this.apiVersion}/offers`,
        { params: { page: 1, page_size: 1 } }
      );
      
      if (response.data?.data?.offers && response.data.data.offers.length > 0) {
        const offer = response.data.data.offers[0];
        
        // Extract unique warehouses
        const warehouseMap = new Map<number, { warehouse_id: number; name: string }>();
        
        if (offer.leadtime_stock && offer.leadtime_stock.length > 0) {
          offer.leadtime_stock.forEach(stock => {
            if (stock.merchant_warehouse) {
              warehouseMap.set(
                stock.merchant_warehouse.warehouse_id,
                stock.merchant_warehouse
              );
            }
          });
        }
        
        this.merchantWarehouses = Array.from(warehouseMap.values());
        
        if (this.merchantWarehouses.length === 0) {
          console.warn('No merchant warehouses found for Takealot seller');
          
          // Add a default warehouse
          this.merchantWarehouses.push({
            warehouse_id: 1, // Default ID
            name: 'Default Warehouse'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching merchant warehouses:', error);
      
      // Add a default warehouse
      this.merchantWarehouses = [{
        warehouse_id: 1, // Default ID
        name: 'Default Warehouse'
      }];
    }
  }

  // ================ Helper methods ================

  /**
   * Make an API request with retry logic
   */
  private async makeRequest<T>(
    method: string,
    endpoint: string,
    options: any = {},
    retryCount: number = 0
  ): Promise<AxiosResponse<T>> {
    try {
      const config: AxiosRequestConfig = {
        method,
        url: endpoint,
        ...options
      };
      
      return await this.apiClient(config);
    } catch (error) {
      // Don't retry if we're out of retries or the error isn't retryable
      if (
        retryCount >= this.maxRetries ||
        !this.isRetryableError(error)
      ) {
        throw error;
      }
      
      // Exponential backoff with jitter
      const delay = Math.min(
        this.retryDelayMs * Math.pow(2, retryCount) * (0.8 + Math.random() * 0.4),
        30000 // Maximum 30 seconds delay
      );
      
      console.log(`Retrying request to ${endpoint} after ${delay}ms (${retryCount + 1}/${this.maxRetries})`);
      await this.sleep(delay);
      
      // Retry the request
      return this.makeRequest<T>(method, endpoint, options, retryCount + 1);
    }
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: any): boolean {
    // Network errors are generally retryable
    if (!error.response) {
      return true;
    }
    
    // 429 (Too Many Requests) is handled by the interceptor
    
    // Retry server errors (5xx)
    if (error.response.status >= 500 && error.response.status < 600) {
      return true;
    }
    
    // Retry specific client errors
    const retryableClientErrors = [408, 423, 425, 429];
    return retryableClientErrors.includes(error.response.status);
  }

  /**
   * Sleep for a specified number of milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update rate limit information from response headers
   */
  private updateRateLimitInfo(response: AxiosResponse): void {
    const headers = response.headers;
    
    if (headers['x-ratelimit-limit']) {
      this.rateLimitInfo.limit = parseInt(headers['x-ratelimit-limit'], 10);
    }
    
    if (headers['x-ratelimit-remaining']) {
      this.rateLimitInfo.remaining = parseInt(headers['x-ratelimit-remaining'], 10);
    }
    
    if (headers['x-ratelimit-reset']) {
      // Store the timestamp for internal use
      this._rateLimitReset = parseInt(headers['x-ratelimit-reset'], 10);
      // Update the inherited Date object
      this.rateLimitInfo.reset = new Date(this._rateLimitReset * 1000);
    }
  }

  /**
   * Map Takealot offer to standardized product
   */
  private mapTakealotOfferToProduct(offer: TakealotOffer): MarketplaceProduct {
    // Convert status
    const status = this.mapTakealotStatusToProductStatus(offer.status);
    
    // Calculate total stock level (leadtime + at Takealot)
    const leadtimeStock = offer.leadtime_stock?.reduce(
      (total, item) => total + item.quantity_available, 0
    ) || 0;
    
    const takealotStock = offer.stock_at_takealot?.reduce(
      (total, item) => total + item.quantity_available, 0
    ) || 0;
    
    const totalStock = leadtimeStock + takealotStock;
    
    // Create the standardized product
    return {
      id: offer.offer_id.toString(),
      sku: offer.sku,
      title: offer.title,
      description: '',
      images: [],
      price: offer.selling_price,
      currencyCode: 'ZAR', // Takealot is a South African marketplace
      stockLevel: totalStock,
      status,
      categories: [],
      attributes: [],
      barcode: offer.barcode,
      createdAt: new Date(offer.date_created),
      updatedAt: new Date(), // Takealot doesn't provide updated date
      marketplaceId: this.marketplaceId,
      marketplaceSku: offer.product_label_number,
      marketplaceUrl: offer.offer_url,
      metadata: {
        tsin_id: offer.tsin_id,
        leadtimeStock,
        takealotStock,
        leadtimeDays: offer.leadtime_days,
        rrp: offer.rrp,
        discount: offer.discount,
        discountShown: offer.discount_shown,
        salesUnits: offer.sales_units,
        stockCover: offer.stock_cover,
        stockOnWay: offer.stock_on_way,
        originalStatus: offer.status
      }
    };
  }

  /**
   * Map Takealot sale to standardized order
   */
  private mapTakealotSaleToOrder(sale: TakealotSale): MarketplaceOrder {
    // Create a dummy address since Takealot doesn't provide address details
    const dummyAddress: Address = {
      line1: '',
      city: '',
      postalCode: '',
      country: 'South Africa'
    };
    
    // Create order item
    const orderItem: OrderItem = {
      id: sale.order_item_id.toString(),
      sku: sale.sku,
      marketplaceProductId: sale.tsin.toString(),
      title: sale.product_title,
      quantity: sale.quantity,
      unitPrice: sale.selling_price / sale.quantity,
      total: sale.selling_price
    };
    
    // Map statuses
    const orderStatus = this.mapTakealotSaleStatusToOrderStatus(sale.sale_status);
    const paymentStatus = sale.sale_status ? PaymentStatus.PAID : PaymentStatus.PENDING;
    const shippingStatus = this.mapTakealotSaleStatusToShippingStatus(sale.sale_status);
    
    // Create the standardized order
    return {
      id: sale.order_id.toString(),
      marketplaceOrderId: sale.order_id.toString(),
      customerDetails: {
        email: '',
        firstName: '',
        lastName: sale.customer,
        billingAddress: dummyAddress
      },
      orderItems: [orderItem],
      orderStatus,
      paymentStatus,
      shippingStatus,
      shippingDetails: {
        address: dummyAddress,
        method: '',
        carrier: '',
      },
      paymentDetails: {
        method: 'Takealot Payment',
        amount: sale.selling_price,
        currency: 'ZAR'
      },
      currencyCode: 'ZAR',
      subtotal: sale.selling_price,
      shippingCost: 0, // Not provided by Takealot
      tax: 0, // Not provided by Takealot
      discount: 0, // Not provided by Takealot
      total: sale.selling_price,
      createdAt: new Date(sale.order_date),
      updatedAt: new Date(), // Not provided by Takealot
      marketplaceSpecific: {
        dc: sale.dc,
        customer_dc: sale.customer_dc,
        promotion: sale.promotion,
        po_number: sale.po_number,
        shipment_name: sale.shipment_name,
        shipment_id: sale.shipment_id,
        shipment_state_id: sale.shipment_state_id,
        takealot_url_mobi: sale.takealot_url_mobi,
        originalSaleStatus: sale.sale_status
      }
    };
  }

  /**
   * Map Takealot status to standardized product status
   */
  private mapTakealotStatusToProductStatus(status: string): ProductStatus {
    // Map based on Takealot status values
    switch (status.toLowerCase()) {
      case 'buyable':
        return ProductStatus.ACTIVE;
      case 'not buyable':
        return ProductStatus.OUT_OF_STOCK;
      case 'disabled by seller':
        return ProductStatus.INACTIVE;
      case 'disabled by takealot':
        return ProductStatus.INACTIVE;
      default:
        return ProductStatus.INACTIVE;
    }
  }

  /**
   * Map standardized product status to Takealot status action
   */
  private mapProductStatusToTakealotAction(status: ProductStatus): 'Disable' | 'Re-enable' {
    switch (status) {
      case ProductStatus.ACTIVE:
        return 'Re-enable';
      case ProductStatus.INACTIVE:
      case ProductStatus.DELETED:
      case ProductStatus.ARCHIVED:
        return 'Disable';
      case ProductStatus.PENDING:
      case ProductStatus.OUT_OF_STOCK:
        // For these statuses, we enable the offer but let Takealot decide if it's buyable
        return 'Re-enable';
      default:
        return 'Disable';
    }
  }

  /**
   * Map Takealot sale status to standardized order status
   */
  private mapTakealotSaleStatusToOrderStatus(status: string): OrderStatus {
    if (!status) return OrderStatus.PROCESSING;
    
    // Map based on Takealot sale status values
    switch (status.toLowerCase()) {
      case 'inactive':
        return OrderStatus.CANCELED;
      case 'in progress':
        return OrderStatus.PROCESSING;
      case 'processed and ready for collection':
        return OrderStatus.PROCESSING;
      case 'shipped to customer':
        return OrderStatus.SHIPPED;
      case 'delivery confirmed':
        return OrderStatus.DELIVERED;
      case 'returned':
        return OrderStatus.RETURNED;
      case 'cancelled':
        return OrderStatus.CANCELED;
      default:
        return OrderStatus.PROCESSING;
    }
  }

  /**
   * Map Takealot sale status to standardized shipping status
   */
  private mapTakealotSaleStatusToShippingStatus(status: string): ShippingStatus {
    if (!status) return ShippingStatus.AWAITING_FULFILLMENT;
    
    // Map based on Takealot sale status values
    switch (status.toLowerCase()) {
      case 'inactive':
        return ShippingStatus.AWAITING_FULFILLMENT;
      case 'in progress':
        return ShippingStatus.AWAITING_FULFILLMENT;
      case 'processed and ready for collection':
        return ShippingStatus.FULFILLED;
      case 'shipped to customer':
        return ShippingStatus.SHIPPED;
      case 'delivery confirmed':
        return ShippingStatus.DELIVERED;
      case 'returned':
        return ShippingStatus.RETURNED;
      default:
        return ShippingStatus.AWAITING_FULFILLMENT;
    }
  }

  /**
   * Create leadtime stock payload
   */
  private createLeadtimeStockPayload(quantity: number): TakealotOfferLeadtimeStock[] {
    // If no warehouses found, return empty array
    if (!this.merchantWarehouses || this.merchantWarehouses.length === 0) {
      return [];
    }
    
    // Assume the quantity applies to the first warehouse
    return [{
      merchant_warehouse: this.merchantWarehouses[0],
      quantity_available: Math.max(0, Math.round(quantity))
    }];
  }
}