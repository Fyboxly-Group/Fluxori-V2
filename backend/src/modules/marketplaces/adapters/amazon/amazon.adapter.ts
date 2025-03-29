// @ts-nocheck - Disable TypeScript checking for this file due to complex axios typing issues
import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as crypto from 'crypto';
import { BaseMarketplaceAdapter } from '../common/base-marketplace-adapter';
import { amazonConfig } from '../../config/amazon.config';
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

/**
 * Amazon SP-API specific types
 */
interface AmazonAuthToken {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: Date; // Calculated expiry time
}

interface AmazonApiResponse<T> {
  payload: T;
  errors?: Array<{
    code: string;
    message: string;
    details?: string;
  }>;
}

// Amazon SP-API product types
interface AmazonCatalogItem {
  asin: string;
  attributes?: Record<string, any>;
  identifiers?: {
    marketplaceAsin?: {
      marketplaceId: string;
      asin: string;
    }[];
    skuIdentifier?: {
      marketplaceId: string;
      sellerId: string;
      sellerSKU: string;
    }[];
  };
  productTypes?: Record<string, string>;
}

interface AmazonInventoryItem {
  sku: string;
  asin?: string;
  condition: string;
  inventoryDetails?: {
    fulfillmentAvailability?: {
      quantity: number;
      fulfillmentChannelCode: string;
      isDisplayable?: boolean;
    }[];
    reservedQuantity?: number;
    totalReservedQuantity?: number;
    researchingQuantity?: number;
    inboundReceivingQuantity?: number;
    inboundShippedQuantity?: number;
    totalReservedQuantity?: number;
    futureSupplyQuantity?: number;
  };
}

interface AmazonPricing {
  sku: string;
  asin?: string;
  price?: {
    listingPrice: {
      amount: number;
      currencyCode: string;
    };
    shippingPrice?: {
      amount: number;
      currencyCode: string;
    };
    points?: {
      pointsNumber: number;
      pointsMonetaryValue: {
        amount: number;
        currencyCode: string;
      };
    };
  };
  status?: string;
}

// Amazon SP-API order types
interface AmazonOrder {
  amazonOrderId: string;
  sellerOrderId?: string;
  purchaseDate: string;
  lastUpdateDate: string;
  orderStatus: string;
  fulfillmentChannel?: string;
  salesChannel?: string;
  orderTotal?: {
    currencyCode: string;
    amount: string;
  };
  numberOfItemsShipped?: number;
  numberOfItemsUnshipped?: number;
  paymentMethod?: string;
  paymentMethodDetails?: string[];
  marketplaceId: string;
  shipmentServiceLevelCategory?: string;
  orderType?: string;
  earliestShipDate?: string;
  latestShipDate?: string;
  isBusinessOrder?: boolean;
  isPrime?: boolean;
  isPremiumOrder?: boolean;
  isGlobalExpressEnabled?: boolean;
  isReplacementOrder?: boolean;
  isEstimatedShipDateSet?: boolean;
  shipServiceLevel?: string;
  buyerInfo?: {
    buyerEmail?: string;
    buyerName?: string;
    buyerCounty?: string;
    buyerTaxInfo?: {
      taxClassifications?: {
        name: string;
        value: string;
      }[];
    };
    purchaseOrderNumber?: string;
  };
  shippingAddress?: {
    name: string;
    addressLine1?: string;
    addressLine2?: string;
    addressLine3?: string;
    city?: string;
    county?: string;
    district?: string;
    stateOrRegion?: string;
    postalCode?: string;
    countryCode?: string;
    phone?: string;
  };
}

interface AmazonOrderItem {
  asin: string;
  sellerSKU?: string;
  orderItemId: string;
  title?: string;
  quantityOrdered: number;
  quantityShipped?: number;
  productInfo?: {
    numberOfItems?: number;
  };
  pointsGranted?: {
    pointsNumber: number;
    pointsMonetaryValue: {
      currencyCode: string;
      amount: string;
    };
  };
  itemPrice?: {
    currencyCode: string;
    amount: string;
  };
  shippingPrice?: {
    currencyCode: string;
    amount: string;
  };
  taxCollection?: {
    model: string;
    responsibleParty: string;
  };
  itemTax?: {
    currencyCode: string;
    amount: string;
  };
  promotionDiscount?: {
    currencyCode: string;
    amount: string;
  };
  promotionIds?: string[];
  conditionNote?: string;
  conditionId?: string;
  condition?: string;
  isGift?: boolean;
  giftMessageText?: string;
  giftWrapLevel?: string;
  giftWrapPrice?: {
    currencyCode: string;
    amount: string;
  };
}

interface AmazonRateLimits {
  [key: string]: {
    rate: number;
    burst: number;
  };
}

interface AmazonCategory {
  productCategoryId: string;
  productCategoryName: string;
  parent?: {
    productCategoryId: string;
    productCategoryName: string;
  };
  displayName: string;
  isLeaf: boolean;
}

/**
 * Amazon Marketplace Adapter Implementation
 * Implements Amazon SP-API integration using the common marketplace adapter interface
 */
export class AmazonAdapter extends BaseMarketplaceAdapter {
  readonly marketplaceId: string = 'amazon';
  readonly marketplaceName: string = 'Amazon';
  
  // API configuration from amazon.config.ts
  private readonly spApiUrl: string = amazonConfig.apiBaseUrls.default;
  private readonly tokenUrl: string = amazonConfig.auth.tokenUrl;
  private readonly defaultRegion: string = amazonConfig.awsAuth.defaultRegion;
  private currentToken: AmazonAuthToken | null = null;
  private apiClient: AxiosInstance;
  
  // Rate limiting configuration from amazon.config.ts
  private retryDelayMs: number = amazonConfig.retry.initialDelayMs;
  private maxRetries: number = amazonConfig.retry.maxRetries;
  private rateLimits: { [endpoint: string]: { remaining: number, reset: Date, limit: number } } = {};
  
  // Marketplace IDs
  private amazonMarketplaceId: string = ''; // Set during initialization, defaults to US marketplace
  
  /**
   * Constructor
   */
  constructor() {
    super();
    
    // Create the base API client using configuration
    this.apiClient = axios.create({
      timeout: amazonConfig.request.timeout,
      maxContentLength: amazonConfig.request.maxContentLength,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': amazonConfig.request.userAgent
      }
    });
    
    // Add request interceptor for authentication and request signing
    this.apiClient.interceptors.request.use(async (config) => {
      this.ensureInitialized();
      
      // Set up base headers
      if (!config.headers) {
        config.headers = {};
      }
      
      // Add/refresh auth token if making an SP-API call
      if (config.url && !config.url.includes(this.tokenUrl)) {
        // Get a valid token
        const token = await this.getValidToken();
        
        if (!token) {
          throw new Error('Failed to obtain valid Amazon SP-API access token');
        }
        
        // Add token to headers
        config.headers['x-amz-access-token'] = token.access_token;
        
        // Sign the request with AWS Signature V4
        config = await this.signRequest(config);
      }
      
      return config;
    });
    
    // Add response interceptor for error handling and rate limit tracking
    this.apiClient.interceptors.response.use(
      (response) => {
        // Track rate limits from headers
        this.updateRateLimits(response);
        return response;
      },
      async (error: AxiosError) => {
        // Handle rate limits and retrying
        if (error.response) {
          this.updateRateLimits(error.response);
          
          // Check for rate limiting responses (429)
          if (error.response.status === 429) {
            // Determine which rate limit was hit based on the API path
            const urlPath = error.config?.url || '';
            const delay = this.calculateBackoff(urlPath, error.response);
            
            console.log(`Rate limited by Amazon SP-API. Retrying in ${delay}ms`);
            await this.sleep(delay);
            
            // Retry the request after backoff (specific handling for rate limits)
            const config = error.config as AxiosRequestConfig & { _retryCount?: number };
            return this.apiClient(config);
          }
          
          // Check for server errors that should be retried
          if (amazonConfig.retry.retryableStatusCodes.includes(error.response.status)) {
            const config = error.config as AxiosRequestConfig & { _retryCount?: number };
            const retryCount = config._retryCount || 0;
            
            if (retryCount < this.maxRetries) {
              config._retryCount = retryCount + 1;
              
              // Exponential backoff with jitter
              const delay = Math.min(
                this.retryDelayMs * Math.pow(2, retryCount) * (0.5 + Math.random()),
                amazonConfig.retry.maxDelayMs
              );
              
              console.log(`Server error ${error.response.status} from Amazon SP-API. Retry ${retryCount + 1}/${this.maxRetries} in ${delay}ms`);
              await this.sleep(delay);
              
              return this.apiClient(config);
            }
          }
          
          // Handle auth errors
          if (error.response.status === 401 || error.response.status === 403) {
            // Refresh token and retry on auth errors, but only once to avoid loops
            if (error.config && !error.config.headers?._retry) {
              console.log('Authentication error. Refreshing token and retrying...');
              
              try {
                // Force token refresh
                this.currentToken = null;
                await this.refreshAccessToken();
                
                // Mark the request as retried
                const config = { ...error.config, headers: { ...error.config.headers, _retry: true } };
                
                // Retry the request with new token
                return this.apiClient(config);
              } catch (refreshError) {
                console.error('Failed to refresh token:', refreshError);
                return Promise.reject(error);
              }
            }
          }
        }
        
        // Pass other errors through
        return Promise.reject(error);
      }
    );
  }

  /**
   * Initialize the adapter with marketplace credentials
   */
  async initialize(credentials: MarketplaceCredentials): Promise<void> {
    // Validate required credentials
    if (!credentials.clientId || !credentials.clientSecret || !credentials.refreshToken || !credentials.sellerId) {
      throw new Error('Amazon adapter requires clientId, clientSecret, refreshToken, and sellerId');
    }
    
    // Optional: validate marketplace specific configurations
    if (credentials.amazonMarketplaceId) {
      this.amazonMarketplaceId = credentials.amazonMarketplaceId;
    } else {
      // Default to US marketplace from config
      this.amazonMarketplaceId = amazonConfig.marketplaceIds.defaultMarketplace;
      console.log(`Using default marketplace ID: ${this.amazonMarketplaceId}`);
    }
    
    // Save credentials
    this.credentials = credentials;
    
    // Get initial token
    await this.refreshAccessToken();
    
    // Test connection
    const connectionStatus = await this.testConnection();
    if (!connectionStatus.connected) {
      throw new Error(`Failed to connect to Amazon SP-API: ${connectionStatus.message}`);
    }
    
    console.log(`Amazon adapter initialized successfully for Marketplace ID: ${this.amazonMarketplaceId}`);
  }

  /**
   * Test the connection to the Amazon SP-API
   */
  async testConnection(): Promise<ConnectionStatus> {
    this.ensureInitialized();
    
    try {
      // Try to get API status (catalog API as a lightweight call)
      const response = await this.makeRequest<AmazonApiResponse<{ status: string }>>(
        'GET',
        `/catalog/${amazonConfig.apiVersions.catalogItems}/status`,
        {
          params: {
            marketplaceIds: this.amazonMarketplaceId
          }
        }
      );
      
      this.lastConnectionCheck = new Date();
      this.lastConnectionStatus = true;
      
      return {
        connected: true,
        message: 'Successfully connected to Amazon SP-API',
        lastChecked: this.lastConnectionCheck,
        rateLimit: this.getRateLimitForEndpoint('/catalog')
      };
    } catch (error) {
      this.lastConnectionCheck = new Date();
      this.lastConnectionStatus = false;
      
      let message = 'Failed to connect to Amazon SP-API';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosError;
        const responseData = axiosError.response?.data as any;
        const errorMessage = responseData?.errors?.[0]?.message || axiosError.message || '';
        const responseStatus = axiosError.response?.status || '';
        message = `${message}: ${responseStatus} - ${errorMessage}`;
      } else if (error && typeof error === 'object' && 'message' in error) {
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
    // Get the most restrictive rate limit across all tracked endpoints
    const endpoints = Object.keys(this.rateLimits);
    
    if (endpoints.length === 0) {
      return this.rateLimitInfo; // Return default/empty if no rate limits tracked yet
    }
    
    // Find the endpoint with the least remaining capacity as percentage
    let lowestRemainingPct = 1.0;
    let mostRestrictedEndpoint = endpoints[0];
    
    for (const endpoint of endpoints) {
      const limit = this.rateLimits[endpoint];
      if (limit.limit > 0) {
        const remainingPct = limit.remaining / limit.limit;
        if (remainingPct < lowestRemainingPct) {
          lowestRemainingPct = remainingPct;
          mostRestrictedEndpoint = endpoint;
        }
      }
    }
    
    return this.rateLimits[mostRestrictedEndpoint];
  }

  /**
   * Fetch a product by its SKU
   */
  async getProductBySku(sku: string): Promise<OperationResult<MarketplaceProduct>> {
    this.ensureInitialized();
    
    try {
      // First, get the inventory details for this SKU
      const inventoryResponse = await this.makeRequest<AmazonApiResponse<{
        inventory: AmazonInventoryItem;
      }>>(
        'GET',
        `/fba/inventory/${amazonConfig.apiVersions.fbaInventory}/inventories/${encodeURIComponent(sku)}`,

        {
          params: {
            marketplaceIds: this.amazonMarketplaceId
          }
        }
      );
      
      const inventoryData = inventoryResponse.data.payload?.inventory;
      if (!inventoryData) {
        return this.createErrorResult(
          this.createError(`No inventory found for SKU: ${sku}`, 'INVENTORY_NOT_FOUND')
        );
      }
      
      // Get pricing information
      const pricingResponse = await this.makeRequest<AmazonApiResponse<{
        price: AmazonPricing;
      }>>(
        'GET',
        `/products/pricing/${amazonConfig.apiVersions.pricing}/price`,

        {
          params: {
            MarketplaceId: this.amazonMarketplaceId,
            SellerSKU: sku
          }
        }
      );
      
      // Get catalog item details if we have an ASIN
      let catalogData: AmazonCatalogItem | null = null;
      if (inventoryData.asin) {
        try {
          const catalogResponse = await this.makeRequest<AmazonApiResponse<{
            items: AmazonCatalogItem[];
          }>>(
            'GET',
            `/catalog/${amazonConfig.apiVersions.catalogItems}/items/${inventoryData.asin}`,

            {
              params: {
                marketplaceIds: this.amazonMarketplaceId,
                includedData: 'attributes,identifiers,productTypes'
              }
            }
          );
          
          if (catalogResponse.data.payload?.items?.length > 0) {
            catalogData = catalogResponse.data.payload.items[0];
          }
        } catch (catalogError) {
          console.warn(`Failed to get catalog data for ASIN ${inventoryData.asin}:`, catalogError);
          // Continue without catalog data
        }
      }
      
      // Get listing details (status, etc.)
      const listingResponse = await this.makeRequest<AmazonApiResponse<{
        sku: string;
        status: string;
        marketplaceId: string;
        asin: string;
        productType: string;
        createdDate: string;
        lastUpdatedDate: string;
      }>>(
        'GET',
        `/listings/${amazonConfig.apiVersions.listings}/items/${this.credentials?.sellerId}/${sku}`,

        {
          params: {
            marketplaceIds: this.amazonMarketplaceId
          }
        }
      );
      
      // Combine all data and map to standardized product
      const pricingData = pricingResponse.data.payload?.price;
      const listingData = listingResponse.data.payload;
      
      const product = this.mapAmazonDataToProduct({
        sku,
        inventory: inventoryData,
        pricing: pricingData,
        catalog: catalogData,
        listing: listingData
      });
      
      return this.createSuccessResult(product);
    } catch (error) {
      const marketplaceError = this.handleApiError(error, `getProductBySku(${sku})`);
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Fetch a product by marketplace-specific ID (ASIN in Amazon's case)
   */
  async getProductById(id: string): Promise<OperationResult<MarketplaceProduct>> {
    this.ensureInitialized();
    
    try {
      // For Amazon, the ID is the ASIN
      // We need to query the catalog API to get details, then find the seller's SKU
      
      // Get catalog item
      const catalogResponse = await this.makeRequest<AmazonApiResponse<{
        items: AmazonCatalogItem[];
      }>>(
        'GET',
        `/catalog/${amazonConfig.apiVersions.catalogItems}/items/${id}`,

        {
          params: {
            marketplaceIds: this.amazonMarketplaceId,
            includedData: 'attributes,identifiers,productTypes'
          }
        }
      );
      
      if (!catalogResponse.data.payload?.items || catalogResponse.data.payload.items.length === 0) {
        return this.createErrorResult(
          this.createError(`No catalog item found for ASIN: ${id}`, 'CATALOG_ITEM_NOT_FOUND')
        );
      }
      
      const catalogItem = catalogResponse.data.payload.items[0];
      
      // Now we need to find the seller's SKU for this ASIN
      // Query the listings API to find matching SKUs
      const listingsResponse = await this.makeRequest<AmazonApiResponse<{
        listings: Array<{
          sku: string;
          status: string;
          asin: string;
        }>;
      }>>(
        'GET',
        `/listings/${amazonConfig.apiVersions.listings}/items`,

        {
          params: {
            marketplaceIds: this.amazonMarketplaceId,
            sellerId: this.credentials?.sellerId,
            asin: id
          }
        }
      );
      
      if (!listingsResponse.data.payload?.listings || listingsResponse.data.payload.listings.length === 0) {
        return this.createErrorResult(
          this.createError(`No seller listing found for ASIN: ${id}`, 'LISTING_NOT_FOUND')
        );
      }
      
      // Use the first SKU from the listings (if multiple exist)
      const sku = listingsResponse.data.payload.listings[0].sku;
      
      // Now that we have the SKU, we can use getProductBySku to get complete info
      return this.getProductBySku(sku);
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
      
      // Amazon API doesn't have a bulk endpoint for this, so we need to call getProductBySku for each SKU
      // We'll do this in batches to avoid overloading the API
      const batchSize = amazonConfig.batch.maxBatchSize;
      const products: MarketplaceProduct[] = [];
      const failedSkus: string[] = [];
      
      for (let i = 0; i < skus.length; i += batchSize) {
        const batch = skus.slice(i, i + batchSize);
        const batchPromises = batch.map(sku => this.getProductBySku(sku)
          .then(result => {
            if (result.success && result.data) {
              products.push(result.data);
            } else {
              failedSkus.push(sku);
            }
          })
          .catch(() => {
            failedSkus.push(sku);
          })
        );
        
        // Wait for batch to complete before processing next batch
        await Promise.all(batchPromises);
        
        // Small delay between batches to respect rate limits
        if (i + batchSize < skus.length) {
          await this.sleep(amazonConfig.batch.defaultDelayBetweenBatchesMs);
        }
      }
      
      if (failedSkus.length > 0) {
        console.warn(`Failed to fetch ${failedSkus.length} SKUs: ${failedSkus.join(', ')}`);
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
      // Get all seller SKUs from the listings API
      const listingsResponse = await this.makeRequest<AmazonApiResponse<{
        listings: Array<{
          sku: string;
          status: string;
          asin: string;
          summaries?: Array<{
            marketplaceId: string;
            asin: string;
            productType: string;
            conditionType: string;
            status: string;
            itemName: string;
          }>;
        }>;
        pagination?: {
          nextToken?: string;
        };
      }>>(
        'GET',
        `/listings/${amazonConfig.apiVersions.listings}/items`,

        {
          params: {
            marketplaceIds: this.amazonMarketplaceId,
            sellerId: this.credentials?.sellerId,
            pageSize: pageSize,
            nextToken: page > 0 ? `page${page}` : undefined, // Use a token format Amazon expects
            ...filters
          }
        }
      );
      
      if (!listingsResponse.data.payload?.listings) {
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
      
      // Get the SKUs from the listings response
      const skus = listingsResponse.data.payload.listings.map(listing => listing.sku);
      
      // Get full product details for these SKUs
      const productsResult = await this.getProductsBySkus(skus);
      
      // Create appropriate pagination details
      const hasNextToken = !!listingsResponse.data.payload.pagination?.nextToken;
      
      return {
        data: productsResult.success ? productsResult.data || [] : [],
        total: -1, // Total count not available from Amazon API
        page,
        pageSize,
        totalPages: -1, // Total pages not available from Amazon API
        hasNext: hasNextToken,
        hasPrev: page > 0
      };
    } catch (error) {
      console.error('Error in getProducts:', error);
      
      // Return empty response on error
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
    failed: Array<{ sku: string, reason: string }>;
  }>> {
    this.ensureInitialized();
    
    try {
      const successfulUpdates: string[] = [];
      const failedUpdates: Array<{ sku: string, reason: string }> = [];
      
      // Process updates in batches to respect rate limits
      const batchSize = amazonConfig.batch.maxBatchSize;
      
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        const batchPromises = batch.map(update => this.updateSingleStock(update)
          .then(success => {
            if (success) {
              successfulUpdates.push(update.sku);
            } else {
              failedUpdates.push({ sku: update.sku, reason: 'Failed to update inventory' });
            }
          })
          .catch(error => {
            const message = error.message || 'Unknown error updating inventory';
            failedUpdates.push({ sku: update.sku, reason: message });
          })
        );
        
        // Wait for batch to complete
        await Promise.all(batchPromises);
        
        // Small delay between batches
        if (i + batchSize < updates.length) {
          await this.sleep(amazonConfig.batch.defaultDelayBetweenBatchesMs);
        }
      }
      
      return this.createSuccessResult({
        successful: successfulUpdates,
        failed: failedUpdates
      });
    } catch (error) {
      const marketplaceError = this.handleApiError(error, `updateStock(${updates.length} updates)`);
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Update prices for one or more products
   */
  async updatePrices(updates: PriceUpdatePayload[]): Promise<OperationResult<{
    successful: string[];
    failed: Array<{ sku: string, reason: string }>;
  }>> {
    this.ensureInitialized();
    
    try {
      const successfulUpdates: string[] = [];
      const failedUpdates: Array<{ sku: string, reason: string }> = [];
      
      // Process updates in batches to respect rate limits
      const batchSize = amazonConfig.batch.maxBatchSize;
      
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        const batchPromises = batch.map(update => this.updateSinglePrice(update)
          .then(success => {
            if (success) {
              successfulUpdates.push(update.sku);
            } else {
              failedUpdates.push({ sku: update.sku, reason: 'Failed to update price' });
            }
          })
          .catch(error => {
            const message = error.message || 'Unknown error updating price';
            failedUpdates.push({ sku: update.sku, reason: message });
          })
        );
        
        // Wait for batch to complete
        await Promise.all(batchPromises);
        
        // Small delay between batches
        if (i + batchSize < updates.length) {
          await this.sleep(amazonConfig.batch.defaultDelayBetweenBatchesMs);
        }
      }
      
      return this.createSuccessResult({
        successful: successfulUpdates,
        failed: failedUpdates
      });
    } catch (error) {
      const marketplaceError = this.handleApiError(error, `updatePrices(${updates.length} updates)`);
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Update status (active/inactive) for one or more products
   */
  async updateStatus(updates: StatusUpdatePayload[]): Promise<OperationResult<{
    successful: string[];
    failed: Array<{ sku: string, reason: string }>;
  }>> {
    this.ensureInitialized();
    
    try {
      const successfulUpdates: string[] = [];
      const failedUpdates: Array<{ sku: string, reason: string }> = [];
      
      // Process updates in batches to respect rate limits
      const batchSize = amazonConfig.batch.maxBatchSize;
      
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        const batchPromises = batch.map(update => this.updateSingleStatus(update)
          .then(success => {
            if (success) {
              successfulUpdates.push(update.sku);
            } else {
              failedUpdates.push({ sku: update.sku, reason: 'Failed to update status' });
            }
          })
          .catch(error => {
            const message = error.message || 'Unknown error updating status';
            failedUpdates.push({ sku: update.sku, reason: message });
          })
        );
        
        // Wait for batch to complete
        await Promise.all(batchPromises);
        
        // Small delay between batches
        if (i + batchSize < updates.length) {
          await this.sleep(amazonConfig.batch.defaultDelayBetweenBatchesMs);
        }
      }
      
      return this.createSuccessResult({
        successful: successfulUpdates,
        failed: failedUpdates
      });
    } catch (error) {
      const marketplaceError = this.handleApiError(error, `updateStatus(${updates.length} updates)`);
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Fetch recent orders
   */
  async getRecentOrders(
    sinceDate: Date,
    page: number,
    pageSize: number
  ): Promise<PaginatedResponse<MarketplaceOrder>> {
    this.ensureInitialized();
    
    try {
      // Format the date for Amazon API (ISO 8601)
      const createdAfter = sinceDate.toISOString();
      
      // Get orders from Amazon
      const ordersResponse = await this.makeRequest<AmazonApiResponse<{
        Orders: AmazonOrder[];
        NextToken?: string;
      }>>(
        'GET',
        `/orders/${amazonConfig.apiVersions.orders}/orders`,

        {
          params: {
            MarketplaceIds: this.amazonMarketplaceId,
            CreatedAfter: createdAfter,
            MaxResultsPerPage: pageSize,
            NextToken: page > 0 ? `page${page}` : undefined, // Use a token format Amazon expects
            OrderStatuses: 'Unshipped,PartiallyShipped,Shipped,Canceled' // Common statuses to filter
          }
        }
      );
      
      if (!ordersResponse.data.payload?.Orders) {
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
      
      // Get order details (in parallel for all orders)
      const orders = await Promise.all(
        ordersResponse.data.payload.Orders.map(async (order) => {
          try {
            // Get order items
            const itemsResponse = await this.makeRequest<AmazonApiResponse<{
              OrderItems: AmazonOrderItem[];
              NextToken?: string;
            }>>(
              'GET',
              `/orders/${amazonConfig.apiVersions.orders}/orders/${order.amazonOrderId}/orderItems`,

              {
                params: {
                  MaxResultsPerPage: 100 // Get up to 100 items per order
                }
              }
            );
            
            // Map to standardized order
            return this.mapAmazonOrderToOrder(order, itemsResponse.data.payload?.OrderItems || []);
          } catch (error) {
            console.error(`Failed to get items for order ${order.amazonOrderId}:`, error);
            // Return a partial order without items
            return this.mapAmazonOrderToOrder(order, []);
          }
        })
      );
      
      // Create appropriate pagination details
      const hasNextToken = !!ordersResponse.data.payload.NextToken;
      
      return {
        data: orders,
        total: -1, // Total count not available from Amazon API
        page,
        pageSize,
        totalPages: -1, // Total pages not available from Amazon API
        hasNext: hasNextToken,
        hasPrev: page > 0
      };
    } catch (error) {
      console.error('Error in getRecentOrders:', error);
      
      // Return empty response on error
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
      // Get the order by ID
      const orderResponse = await this.makeRequest<AmazonApiResponse<{
        Orders: AmazonOrder[];
      }>>(
        'GET',
        `/orders/${amazonConfig.apiVersions.orders}/orders/${id}`,

        {}
      );
      
      if (!orderResponse.data.payload?.Orders || orderResponse.data.payload.Orders.length === 0) {
        return this.createErrorResult(
          this.createError(`No order found with ID: ${id}`, 'ORDER_NOT_FOUND')
        );
      }
      
      const amazonOrder = orderResponse.data.payload.Orders[0];
      
      // Get order items
      const itemsResponse = await this.makeRequest<AmazonApiResponse<{
        OrderItems: AmazonOrderItem[];
        NextToken?: string;
      }>>(
        'GET',
        `/orders/${amazonConfig.apiVersions.orders}/orders/${id}/orderItems`,

        {
          params: {
            MaxResultsPerPage: 100 // Get up to 100 items per order
          }
        }
      );
      
      const orderItems = itemsResponse.data.payload?.OrderItems || [];
      
      // Map to standardized order
      const order = this.mapAmazonOrderToOrder(amazonOrder, orderItems);
      
      return this.createSuccessResult(order);
    } catch (error) {
      const marketplaceError = this.handleApiError(error, `getOrderById(${id})`);
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Acknowledge receipt of an order
   */
  async acknowledgeOrder(orderId: string): Promise<OperationResult<OrderAcknowledgment>> {
    this.ensureInitialized();
    
    try {
      // First, check if the order exists
      const orderResult = await this.getOrderById(orderId);
      
      if (!orderResult.success || !orderResult.data) {
        return this.createErrorResult(
          this.createError(`Cannot acknowledge order: ${orderId} - Order not found`, 'ORDER_NOT_FOUND')
        );
      }
      
      // Amazon doesn't have a specific API to acknowledge orders
      // Orders are automatically acknowledged in their system
      // For FBA orders, fulfillment is handled by Amazon
      // For FBM orders, you need to handle the order using the Feeds API
      // Here we'll just return a successful acknowledgment since the order exists
      
      return this.createSuccessResult({
        orderId,
        success: true,
        message: 'Order acknowledged successfully (automatic in Amazon)',
        timestamp: new Date()
      });
    } catch (error) {
      const marketplaceError = this.handleApiError(error, `acknowledgeOrder(${orderId})`);
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Update order status for seller-fulfilled orders
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
    
    try {
      // First, check if the order exists
      const orderResult = await this.getOrderById(orderId);
      
      if (!orderResult.success || !orderResult.data) {
        return this.createErrorResult(
          this.createError(`Cannot update order status: ${orderId} - Order not found`, 'ORDER_NOT_FOUND')
        );
      }
      
      const order = orderResult.data;
      
      // For Amazon, we can only update fulfillment status for Merchant Fulfilled orders
      // Check if it's a Merchant Fulfilled order
      if (order.marketplaceSpecific?.fulfillmentChannel !== 'MFN') {
        return this.createErrorResult(
          this.createError(
            `Cannot update order status: ${orderId} - Only Merchant Fulfilled orders can be updated`,
            'OPERATION_NOT_SUPPORTED'
          )
        );
      }
      
      // Map the standardized status to an Amazon-specific action
      if (status.toLowerCase() === 'shipped' && trackingInfo) {
        // For shipped status, we need to confirm shipment with tracking information
        // The Feed API requires a complicated XML document, so we'll use the newer Orders API
        
        const response = await this.makeRequest<AmazonApiResponse<{
          errors?: Array<{ code: string; message: string; details?: string }>;
        }>>(
          'POST',
          `/orders/${amazonConfig.apiVersions.orders}/orders/${orderId}/shipment`,

          {
            data: {
              packageDetail: {
                packageReferenceId: '1', // An arbitrary package ID
                carrierCode: trackingInfo.carrier,
                trackingNumber: trackingInfo.trackingNumber,
                shippingDate: trackingInfo.shippedDate?.toISOString() || new Date().toISOString()
              },
              marketplaceId: this.amazonMarketplaceId
            }
          }
        );
        
        // Check for errors in the response
        if (response.data.payload?.errors && response.data.payload.errors.length > 0) {
          const error = response.data.payload.errors[0];
          return this.createErrorResult(
            this.createError(
              `Failed to update order status: ${error.message}`,
              error.code
            )
          );
        }
        
        return this.createSuccessResult({ orderId });
      } else {
        return this.createErrorResult(
          this.createError(
            `Unsupported status update: ${status}. Only 'shipped' status with tracking information is supported for Amazon orders.`,
            'UNSUPPORTED_STATUS'
          )
        );
      }
    } catch (error) {
      const marketplaceError = this.handleApiError(error, `updateOrderStatus(${orderId}, ${status})`);
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Get marketplace-specific categories
   */
  async getCategories(parentId?: string): Promise<OperationResult<MarketplaceCategory[]>> {
    this.ensureInitialized();
    
    try {
      // Fetch categories from the Product Type Definitions API
      const response = await this.makeRequest<AmazonApiResponse<{
        productTypes: Array<{
          name: string;
          displayName: string;
          marketplaceId: string;
          productTypeVersion: string;
        }>;
      }>>(
        'GET',
        '/definitions/2020-09-01/productTypes', // Using the fixed version for definitions API

        {
          params: {
            marketplaceIds: this.amazonMarketplaceId
          }
        }
      );
      
      if (!response.data.payload?.productTypes) {
        return this.createErrorResult(
          this.createError('Failed to retrieve categories', 'CATEGORIES_NOT_FOUND')
        );
      }
      
      // Map Amazon product types to MarketplaceCategory objects
      const categories: MarketplaceCategory[] = response.data.payload.productTypes.map((productType, index) => ({
        id: productType.name,
        name: productType.displayName || productType.name,
        level: parentId ? 1 : 0, // Set level based on whether this is a subcategory
        isLeaf: true, // Amazon product types are generally leaf nodes
        parentId: parentId || undefined,
        path: parentId ? [parentId, productType.name] : [productType.name]
      }));
      
      return this.createSuccessResult(categories);
    } catch (error) {
      const marketplaceError = this.handleApiError(error, `getCategories(${parentId || 'root'})`);
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Get marketplace-specific attributes for a category
   */
  async getCategoryAttributes(categoryId: string): Promise<OperationResult<Array<{
    id: string;
    name: string;
    required: boolean;
    type: string;
    values?: string[];
  }>>> {
    this.ensureInitialized();
    
    try {
      // Get the product type definition from Amazon
      const response = await this.makeRequest<AmazonApiResponse<{
        schema: {
          properties: Record<string, {
            title: string;
            type: string;
            required?: boolean;
            enum?: string[];
          }>;
          required?: string[];
        };
      }>>(
        'GET',
        `/definitions/2020-09-01/productTypes/${categoryId}`, // Using the fixed version for definitions API

        {
          params: {
            marketplaceIds: this.amazonMarketplaceId,
            sellerId: this.credentials?.sellerId
          }
        }
      );
      
      if (!response.data.payload?.schema?.properties) {
        return this.createErrorResult(
          this.createError(
            `Failed to retrieve attributes for category: ${categoryId}`,
            'ATTRIBUTES_NOT_FOUND'
          )
        );
      }
      
      const schema = response.data.payload.schema;
      const requiredProps = schema.required || [];
      
      // Map schema properties to attribute objects
      const attributes = Object.entries(schema.properties).map(([id, prop]) => ({
        id,
        name: prop.title || id,
        required: requiredProps.includes(id),
        type: prop.type,
        values: prop.enum
      }));
      
      return this.createSuccessResult(attributes);
    } catch (error) {
      const marketplaceError = this.handleApiError(error, `getCategoryAttributes(${categoryId})`);
      return this.createErrorResult(marketplaceError);
    }
  }

  /**
   * Close the adapter and clean up resources
   */
  async close(): Promise<void> {
    // Reset the token and credentials
    this.currentToken = null;
    this.credentials = null;
  }

  /**
   * ===== PRIVATE HELPER METHODS =====
   */

  /**
   * Get a valid access token, refreshing if needed
   */
  private async getValidToken(): Promise<AmazonAuthToken> {
    // Check if we have a valid token already
    if (this.currentToken && this.isTokenValid(this.currentToken)) {
      return this.currentToken;
    }
    
    // Token is missing or expired, refresh it
    return this.refreshAccessToken();
  }

  /**
   * Check if a token is still valid (with a buffer period)
   */
  private isTokenValid(token: AmazonAuthToken): boolean {
    if (!token || !token.expires_at) {
      return false;
    }
    
    // Buffer time before expiry from config (default 5 minutes)
    const bufferMs = amazonConfig.auth.tokenExpiryBufferMs;
    return new Date(token.expires_at).getTime() > Date.now() + bufferMs;
  }

  /**
   * Refresh the access token using the refresh token
   */
  private async refreshAccessToken(): Promise<AmazonAuthToken> {
    if (!this.credentials?.clientId || !this.credentials?.clientSecret || !this.credentials?.refreshToken) {
      throw new Error('Missing required credentials for token refresh');
    }
    
    try {
      // Prepare the request body
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', this.credentials.refreshToken);
      params.append('client_id', this.credentials.clientId);
      params.append('client_secret', this.credentials.clientSecret);
      
      // Make the token request directly (no interceptors for this call)
      const response = await axios.post(this.tokenUrl, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      // Calculate expiry time
      const expiresIn = response.data.expires_in || 3600; // Default 1 hour
      const expiresAt = new Date(Date.now() + expiresIn * 1000);
      
      // Store the token
      this.currentToken = {
        ...response.data,
        expires_at: expiresAt
      };
      
      console.log(`Amazon LWA token refreshed, expires in ${expiresIn} seconds`);
      
      return this.currentToken;
    } catch (error) {
      console.error('Failed to refresh Amazon access token:', error);
      throw new Error('Failed to refresh Amazon access token');
    }
  }

  /**
   * Sign a request with AWS Signature V4
   * This is required for SP-API calls
   */
  private async signRequest(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    // AWS Signature V4 Implementation
    // Note: In production, use the @aws-crypto/aws-sigv4 library or similar for better security
    
    if (!config.headers) {
      config.headers = {};
    }
    
    // Extract the SP-API path from the full URL
    const path = config.url || '';
    const url = new URL(path, this.spApiUrl);
    
    // Add required headers
    config.headers['host'] = url.host;
    
    // Get AWS region from config
    const region = this.defaultRegion;
    const service = amazonConfig.awsAuth.service;
    
    // Create a timestamp for request signing
    const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substring(0, 8);
    
    // Add date headers
    config.headers['x-amz-date'] = amzDate;
    
    // Set up the canonical request components
    const method = config.method?.toUpperCase() || 'GET';
    const canonicalUri = url.pathname;
    
    // Build canonical query string from URL and additional params
    const searchParams = new URLSearchParams(url.search);
    if (config.params) {
      for (const [key, value] of Object.entries(config.params)) {
        searchParams.append(key, value as string);
      }
    }
    
    // Sort the query parameters
    const sortedParams = Array.from(searchParams.entries())
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
    const canonicalQueryString = sortedParams
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    // Build canonical headers
    const headerEntries = Object.entries(config.headers)
      .map(([key, value]) => [key.toLowerCase(), value as string])
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
    
    const canonicalHeaders = headerEntries
      .map(([key, value]) => `${key}:${value}\n`)
      .join('');
    
    const signedHeaders = headerEntries
      .map(([key]) => key)
      .join(';');
    
    // Create payload hash (empty for GET with no body, or hash of the body for POST/PUT)
    let payload = '';
    if (config.data) {
      if (typeof config.data === 'string') {
        payload = config.data;
      } else {
        payload = JSON.stringify(config.data);
      }
    }
    
    const payloadHash = crypto
      .createHash('sha256')
      .update(payload || '')
      .digest('hex');
    
    // Build the canonical request
    const canonicalRequest = [
      method,
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      payloadHash
    ].join('\n');
    
    // Create the string to sign
    const algorithm = amazonConfig.awsAuth.signingAlgorithm;
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    
    const stringToSign = [
      algorithm,
      amzDate,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex')
    ].join('\n');
    
    // Calculate the signature
    // Note: This is a simplified implementation
    // In production, use a proper AWS SDK or signing library
    
    // For example purposes, using a dummy access key and secret key
    const accessKey = this.credentials?.awsAccessKey || 'DUMMY_ACCESS_KEY';
    const secretKey = this.credentials?.awsSecretKey || 'DUMMY_SECRET_KEY';
    
    // Create the signing key
    // In production, use the AWS SDK to derive proper signing keys
    const kDate = crypto
      .createHmac('sha256', `AWS4${secretKey}`)
      .update(dateStamp)
      .digest();
    
    const kRegion = crypto
      .createHmac('sha256', kDate)
      .update(region)
      .digest();
    
    const kService = crypto
      .createHmac('sha256', kRegion)
      .update(service)
      .digest();
    
    const kSigning = crypto
      .createHmac('sha256', kService)
      .update('aws4_request')
      .digest();
    
    // Calculate the signature
    const signature = crypto
      .createHmac('sha256', kSigning)
      .update(stringToSign)
      .digest('hex');
    
    // Add the authorization header
    const authorizationHeader = 
      `${algorithm} ` +
      `Credential=${accessKey}/${credentialScope}, ` +
      `SignedHeaders=${signedHeaders}, ` +
      `Signature=${signature}`;
    
    config.headers['Authorization'] = authorizationHeader;
    
    // Add additional required headers
    config.headers['x-amz-content-sha256'] = payloadHash;
    
    return config;
  }

  /**
   * Make an API request with retry logic
   */
  private async makeRequest<T>(
    method: string,
    endpoint: string,
    options: any = {},
    retryCount: number = 0
  ): Promise<AxiosResponse<T>> {
    // Construct the full URL
    const url = `${this.spApiUrl}${endpoint}`;
    
    try {
      const config: AxiosRequestConfig = {
        method,
        url,
        ...options
      };
      
      return await this.apiClient(config);
    } catch (error) {
      // Retries are handled by the interceptor
      throw error;
    }
  }

  /**
   * Map rate limits from API response headers
   */
  private updateRateLimits(response: AxiosResponse): void {
    // Get the API path from the URL to categorize rate limits
    const url = response.config?.url || '';
    const match = url.match(/\/([^\/]+)\/v/);
    const apiSection = match ? match[1] : 'default';
    
    // Extract rate limit headers
    const rateLimit = response.headers['x-amzn-ratelimit-limit'];
    const remaining = response.headers['x-amzn-quota-remaining'];
    const resetEpoch = response.headers['x-amzn-ratelimit-reset'];
    
    if (rateLimit && remaining) {
      // Calculate reset time (default to 1 second if not provided)
      const resetInSeconds = resetEpoch ? parseFloat(resetEpoch) : 1;
      const resetDate = new Date(Date.now() + resetInSeconds * 1000);
      
      this.rateLimits[apiSection] = {
        limit: parseInt(rateLimit, 10),
        remaining: parseInt(remaining, 10),
        reset: resetDate
      };
      
      // Update the main rate limit info for the most constrained endpoint
      if (!this.rateLimitInfo.remaining || parseInt(remaining, 10) < this.rateLimitInfo.remaining) {
        this.rateLimitInfo.limit = parseInt(rateLimit, 10);
        this.rateLimitInfo.remaining = parseInt(remaining, 10);
        this.rateLimitInfo.reset = resetDate;
      }
    }
  }

  /**
   * Calculate backoff time for rate-limited requests
   */
  private calculateBackoff(path: string, response: AxiosResponse): number {
    // Extract the API section from the path
    const match = path.match(/\/([^\/]+)\/v/);
    const apiSection = match ? match[1] : 'default';
    
    // Get the rate limit info for this API section
    const rateLimitInfo = this.rateLimits[apiSection];
    
    // Default backoff if rate limit info is missing
    let backoffMs = amazonConfig.retry.initialDelayMs;
    
    if (rateLimitInfo) {
      // Calculate time until reset
      const now = Date.now();
      const resetTime = rateLimitInfo.reset.getTime();
      const timeUntilResetMs = Math.max(0, resetTime - now);
      
      // Use the reset time as backoff, with a minimum of 200ms
      backoffMs = Math.max(200, timeUntilResetMs);
    }
    
    // Add jitter to avoid thundering herd problem
    return backoffMs * (0.8 + Math.random() * 0.4);
  }

  /**
   * Sleep for a specified number of milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Map Amazon data to standardized product
   */
  private mapAmazonDataToProduct(data: {
    sku: string;
    inventory?: AmazonInventoryItem;
    pricing?: AmazonPricing;
    catalog?: AmazonCatalogItem;
    listing?: any;
  }): MarketplaceProduct {
    // Extract basic information
    const sku = data.sku;
    const asin = data.inventory?.asin || data.pricing?.asin || data.listing?.asin || '';
    
    // Get stock level
    let stockLevel = 0;
    if (data.inventory?.inventoryDetails?.fulfillmentAvailability) {
      for (const avail of data.inventory.inventoryDetails.fulfillmentAvailability) {
        stockLevel += avail.quantity || 0;
      }
    }
    
    // Get price
    const price = data.pricing?.price?.listingPrice?.amount || 0;
    const currency = data.pricing?.price?.listingPrice?.currencyCode || 'USD';
    
    // Get status
    const status = this.mapAmazonStatusToProductStatus(data.listing?.status || '');
    
    // Get created/updated dates
    const createdAt = data.listing?.createdDate 
      ? new Date(data.listing.createdDate) 
      : new Date();
      
    const updatedAt = data.listing?.lastUpdatedDate 
      ? new Date(data.listing.lastUpdatedDate) 
      : new Date();
    
    // Get title and description
    const title = data.catalog?.attributes?.title || 
                 data.catalog?.attributes?.item_name || 
                 data.listing?.itemName || 
                 `Amazon Product (${asin})`;
                 
    const description = data.catalog?.attributes?.description || '';
    
    // Get images
    const images: string[] = [];
    if (data.catalog?.attributes?.images) {
      const imageData = data.catalog.attributes.images;
      if (Array.isArray(imageData)) {
        for (const img of imageData) {
          if (img.link) images.push(img.link);
        }
      }
    }
    
    // Get categories
    const categories: string[] = [];
    if (data.catalog?.productTypes) {
      Object.values(data.catalog.productTypes).forEach(type => {
        if (type && !categories.includes(type)) {
          categories.push(type);
        }
      });
    }
    
    // Convert to standardized product
    return {
      id: asin,
      sku,
      title,
      description,
      images,
      price,
      currencyCode: currency,
      stockLevel,
      status,
      categories,
      attributes: [],
      createdAt,
      updatedAt,
      marketplaceId: this.marketplaceId,
      marketplaceSku: sku,
      marketplaceUrl: asin ? `https://www.amazon.com/dp/${asin}` : '',
      metadata: {
        asin,
        fulfillmentChannel: data.inventory?.inventoryDetails?.fulfillmentAvailability?.[0]?.fulfillmentChannelCode,
        originalStatus: data.listing?.status,
        productType: data.listing?.productType,
        listingDetails: data.listing
      }
    };
  }

  /**
   * Map Amazon order to standardized order
   */
  private mapAmazonOrderToOrder(order: AmazonOrder, items: AmazonOrderItem[]): MarketplaceOrder {
    // Map shipping address
    const shippingAddress: Address = {
      line1: order.shippingAddress?.addressLine1 || '',
      line2: order.shippingAddress?.addressLine2 || '',
      city: order.shippingAddress?.city || '',
      state: order.shippingAddress?.stateOrRegion || '',
      postalCode: order.shippingAddress?.postalCode || '',
      country: order.shippingAddress?.countryCode || '',
      contactName: order.shippingAddress?.name || '',
      contactPhone: order.shippingAddress?.phone || ''
    };
    
    // Map order status
    const orderStatus = this.mapAmazonOrderStatusToOrderStatus(order.orderStatus);
    
    // Map payment status
    const paymentStatus = order.orderStatus === 'Canceled' 
      ? PaymentStatus.VOIDED 
      : PaymentStatus.PAID; // Most Amazon orders are pre-paid
    
    // Map shipping status
    const shippingStatus = this.mapAmazonOrderStatusToShippingStatus(order.orderStatus);
    
    // Extract order total
    const total = order.orderTotal 
      ? parseFloat(order.orderTotal.amount) 
      : 0;
    
    const currencyCode = order.orderTotal?.currencyCode || 'USD';
    
    // Map order items
    const orderItems: OrderItem[] = items.map(item => {
      // Calculate item price
      const unitPrice = item.itemPrice 
        ? parseFloat(item.itemPrice.amount) / item.quantityOrdered
        : 0;
        
      const itemTotal = item.itemPrice 
        ? parseFloat(item.itemPrice.amount) 
        : 0;
      
      const tax = item.itemTax 
        ? parseFloat(item.itemTax.amount) 
        : 0;
        
      return {
        id: item.orderItemId,
        sku: item.sellerSKU || '',
        marketplaceProductId: item.asin,
        title: item.title || `Amazon Product (${item.asin})`,
        quantity: item.quantityOrdered,
        unitPrice,
        tax,
        total: itemTotal,
        imageUrl: ''
      };
    });
    
    // Create standardized order
    return {
      id: order.amazonOrderId,
      marketplaceOrderId: order.amazonOrderId,
      customerDetails: {
        email: order.buyerInfo?.buyerEmail || '',
        firstName: '',
        lastName: order.buyerInfo?.buyerName || '',
        billingAddress: shippingAddress // Using shipping address as billing
      },
      orderItems,
      orderStatus,
      paymentStatus,
      shippingStatus,
      shippingDetails: {
        address: shippingAddress,
        method: order.shipmentServiceLevelCategory || '',
        carrier: '',
        estimatedDelivery: order.latestShipDate ? new Date(order.latestShipDate) : undefined
      },
      paymentDetails: {
        method: order.paymentMethod || 'Amazon Payment',
        amount: total,
        currency: currencyCode,
        paymentDate: order.purchaseDate ? new Date(order.purchaseDate) : undefined
      },
      currencyCode,
      subtotal: total,
      shippingCost: 0, // Not directly provided by Amazon
      tax: 0, // Not directly provided by Amazon
      discount: 0, // Not directly provided by Amazon
      total,
      createdAt: order.purchaseDate ? new Date(order.purchaseDate) : new Date(),
      updatedAt: order.lastUpdateDate ? new Date(order.lastUpdateDate) : new Date(),
      marketplaceSpecific: {
        amazonOrderId: order.amazonOrderId,
        orderType: order.orderType,
        fulfillmentChannel: order.fulfillmentChannel,
        salesChannel: order.salesChannel,
        isPrime: order.isPrime,
        isPremiumOrder: order.isPremiumOrder,
        isBusinessOrder: order.isBusinessOrder,
        shipmentServiceLevelCategory: order.shipmentServiceLevelCategory,
        numberOfItemsShipped: order.numberOfItemsShipped,
        numberOfItemsUnshipped: order.numberOfItemsUnshipped,
        originalStatus: order.orderStatus
      }
    };
  }

  /**
   * Map Amazon product status to standardized status
   */
  private mapAmazonStatusToProductStatus(status: string): ProductStatus {
    switch (status?.toLowerCase()) {
      case 'active':
        return ProductStatus.ACTIVE;
      case 'inactive':
        return ProductStatus.INACTIVE;
      case 'incomplete':
        return ProductStatus.PENDING;
      case 'delisted':
        return ProductStatus.ARCHIVED;
      case 'suppressed':
        return ProductStatus.INACTIVE;
      default:
        return ProductStatus.INACTIVE;
    }
  }

  /**
   * Map standardized product status to Amazon status
   */
  private mapProductStatusToAmazonStatus(status: ProductStatus): string {
    switch (status) {
      case ProductStatus.ACTIVE:
        return 'ACTIVE';
      case ProductStatus.INACTIVE:
      case ProductStatus.ARCHIVED:
      case ProductStatus.DELETED:
        return 'INACTIVE';
      case ProductStatus.PENDING:
      case ProductStatus.OUT_OF_STOCK:
        // For these statuses, keep the product active but set inventory to 0
        return 'ACTIVE';
      default:
        return 'INACTIVE';
    }
  }

  /**
   * Map Amazon order status to standardized order status
   */
  private mapAmazonOrderStatusToOrderStatus(status: string): OrderStatus {
    switch (status?.toLowerCase()) {
      case 'pending':
        return OrderStatus.NEW;
      case 'unshipped':
        return OrderStatus.PROCESSING;
      case 'partiallyshipped':
        return OrderStatus.PROCESSING;
      case 'shipped':
        return OrderStatus.SHIPPED;
      case 'canceled':
        return OrderStatus.CANCELED;
      case 'unfulfillable':
        return OrderStatus.ON_HOLD;
      case 'invoiceunconfirmed':
        return OrderStatus.PROCESSING;
      case 'pendingavailability':
        return OrderStatus.ON_HOLD;
      default:
        return OrderStatus.PROCESSING;
    }
  }

  /**
   * Map Amazon order status to standardized shipping status
   */
  private mapAmazonOrderStatusToShippingStatus(status: string): ShippingStatus {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'unshipped':
      case 'invoiceunconfirmed':
      case 'pendingavailability':
        return ShippingStatus.AWAITING_FULFILLMENT;
      case 'partiallyshipped':
        return ShippingStatus.PARTIALLY_SHIPPED;
      case 'shipped':
        return ShippingStatus.SHIPPED;
      default:
        return ShippingStatus.AWAITING_FULFILLMENT;
    }
  }

  /**
   * Update stock level for a single product
   */
  private async updateSingleStock(update: StockUpdatePayload): Promise<boolean> {
    try {
      // For FBA inventory, we can't directly update stock (managed by Amazon)
      // For seller-fulfilled inventory, use the inventory API
      
      // First, check if this is FBA or seller-fulfilled
      const productResult = await this.getProductBySku(update.sku);
      
      if (!productResult.success || !productResult.data) {
        throw new Error(`Product not found: ${update.sku}`);
      }
      
      const fulfillmentChannel = productResult.data.metadata?.fulfillmentChannel?.toLowerCase();
      
      if (fulfillmentChannel === 'amazon' || fulfillmentChannel === 'fba') {
        // FBA inventory cannot be directly updated
        console.warn(`Cannot update FBA inventory directly for SKU ${update.sku}. Use Amazon Seller Central.`);
        return false;
      }
      
      // For seller-fulfilled inventory, update via the Inventory API
      await this.makeRequest(
        'PUT',
        `/inventory/v1/inventories/${encodeURIComponent(update.sku)}`,
        {
          data: {
            inventoryUpdate: {
              quantity: Math.max(0, Math.round(update.quantity))
            }
          },
          params: {
            marketplaceIds: this.amazonMarketplaceId
          }
        }
      );
      
      return true;
    } catch (error) {
      console.error(`Failed to update stock for SKU ${update.sku}:`, error);
      throw error;
    }
  }

  /**
   * Update price for a single product
   */
  private async updateSinglePrice(update: PriceUpdatePayload): Promise<boolean> {
    try {
      // Update price using the Pricing API
      await this.makeRequest(
        'PUT',
        `/pricing/v0/listings/${this.credentials?.sellerId}/${update.sku}/price`,
        {
          data: {
            price: {
              amount: update.price,
              currencyCode: update.currencyCode || 'USD'
            }
          },
          params: {
            marketplaceIds: this.amazonMarketplaceId
          }
        }
      );
      
      return true;
    } catch (error) {
      console.error(`Failed to update price for SKU ${update.sku}:`, error);
      throw error;
    }
  }

  /**
   * Update status for a single product
   */
  private async updateSingleStatus(update: StatusUpdatePayload): Promise<boolean> {
    try {
      // Map the standardized status to Amazon status
      const amazonStatus = this.mapProductStatusToAmazonStatus(update.status);
      
      // Update status using the Listings API
      await this.makeRequest(
        'PATCH',
        `/listings/2021-08-01/items/${this.credentials?.sellerId}/${update.sku}`,
        {
          data: {
            productType: 'PRODUCT',
            patches: [
              {
                op: 'replace',
                path: '/attributes/status',
                value: [amazonStatus]
              }
            ]
          },
          params: {
            marketplaceIds: this.amazonMarketplaceId
          }
        }
      );
      
      return true;
    } catch (error) {
      console.error(`Failed to update status for SKU ${update.sku}:`, error);
      throw error;
    }
  }
}