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
import { ShopifyCredentials } from '../../interfaces/marketplace-credentials.interface';
import { shopifyConfig } from '../../config/shopify.config';
import { LeakyBucketRateLimiter, RateLimiterOptions } from './utils/leaky-bucket-rate-limiter';
import { Logger } from '../../../../types/logger';

/**
 * Interface for Shopify product data
 */
interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  status: 'active' | 'archived' | 'draft';
  published_scope: string;
  tags: string;
  variants: ShopifyVariant[];
  options: Array<{
    id: number;
    product_id: number;
    name: string;
    position: number;
    values: string[];
  }>;
  images: Array<{
    id: number;
    product_id: number;
    position: number;
    created_at: string;
    updated_at: string;
    width: number;
    height: number;
    src: string;
    variant_ids: number[];
  }>;
  image: {
    id: number;
    product_id: number;
    position: number;
    created_at: string;
    updated_at: string;
    width: number;
    height: number;
    src: string;
    variant_ids: number[];
  } | null;
}

/**
 * Interface for Shopify product variant data
 */
interface ShopifyVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  sku: string;
  position: number;
  inventory_policy: string;
  compare_at_price: string | null;
  fulfillment_service: string;
  inventory_management: string | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  created_at: string;
  updated_at: string;
  taxable: boolean;
  barcode: string | null;
  grams: number;
  image_id: number | null;
  weight: number;
  weight_unit: string;
  inventory_item_id: number;
  inventory_quantity: number;
  old_inventory_quantity: number;
  requires_shipping: boolean;
}

/**
 * Interface for Shopify order data
 */
interface ShopifyOrder {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  number: number;
  note: string | null;
  token: string;
  gateway: string;
  test: boolean;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  currency: string;
  financial_status: string;
  confirmed: boolean;
  total_discounts: string;
  total_line_items_price: string;
  cart_token: string;
  buyer_accepts_marketing: boolean;
  referring_site: string;
  landing_site: string;
  cancelled_at: string | null;
  cancel_reason: string | null;
  total_price_usd: string | null;
  checkout_token: string;
  reference: string;
  user_id: number | null;
  location_id: number | null;
  source_identifier: string | null;
  source_url: string | null;
  processed_at: string;
  device_id: number | null;
  phone: string | null;
  customer_locale: string;
  app_id: number;
  browser_ip: string | null;
  landing_site_ref: string | null;
  order_number: number;
  discount_applications: any[];
  discount_codes: any[];
  note_attributes: any[];
  payment_gateway_names: string[];
  processing_method: string;
  checkout_id: number;
  source_name: string;
  fulfillment_status: string | null;
  tax_lines: any[];
  tags: string;
  contact_email: string;
  order_status_url: string;
  line_items: Array<{
    id: number;
    variant_id: number;
    title: string;
    quantity: number;
    sku: string;
    variant_title: string | null;
    vendor: string | null;
    fulfillment_service: string;
    product_id: number;
    requires_shipping: boolean;
    taxable: boolean;
    gift_card: boolean;
    name: string;
    variant_inventory_management: string | null;
    properties: any[];
    product_exists: boolean;
    fulfillable_quantity: number;
    grams: number;
    price: string;
    total_discount: string;
    fulfillment_status: string | null;
    price_set: any;
    total_discount_set: any;
    discount_allocations: any[];
    admin_graphql_api_id: string;
    tax_lines: any[];
  }>;
  shipping_lines: Array<{
    id: number;
    title: string;
    price: string;
    code: string;
    source: string;
    phone: string | null;
    requested_fulfillment_service_id: number | null;
    delivery_category: string | null;
    carrier_identifier: string | null;
    discounted_price: string;
    price_set: any;
    discounted_price_set: any;
    discount_allocations: any[];
    tax_lines: any[];
  }>;
  billing_address: {
    first_name: string;
    address1: string;
    phone: string | null;
    city: string;
    zip: string;
    province: string;
    country: string;
    last_name: string;
    address2: string | null;
    company: string | null;
    latitude: number | null;
    longitude: number | null;
    name: string;
    country_code: string;
    province_code: string;
  };
  shipping_address: {
    first_name: string;
    address1: string;
    phone: string | null;
    city: string;
    zip: string;
    province: string;
    country: string;
    last_name: string;
    address2: string | null;
    company: string | null;
    latitude: number | null;
    longitude: number | null;
    name: string;
    country_code: string;
    province_code: string;
  };
  fulfillments: any[];
  refunds: any[];
  customer: {
    id: number;
    email: string;
    accepts_marketing: boolean;
    created_at: string;
    updated_at: string;
    first_name: string;
    last_name: string;
    orders_count: number;
    state: string;
    total_spent: string;
    last_order_id: number;
    note: string | null;
    verified_email: boolean;
    multipass_identifier: string | null;
    tax_exempt: boolean;
    phone: string | null;
    tags: string;
    last_order_name: string;
    currency: string;
    accepts_marketing_updated_at: string;
    marketing_opt_in_level: string | null;
    admin_graphql_api_id: string;
    default_address: {
      id: number;
      customer_id: number;
      first_name: string;
      last_name: string;
      company: string | null;
      address1: string;
      address2: string | null;
      city: string;
      province: string;
      country: string;
      zip: string;
      phone: string;
      name: string;
      province_code: string;
      country_code: string;
      country_name: string;
      default: boolean;
    };
  };
}

/**
 * Interface for Shopify collection data
 */
interface ShopifyCollection {
  id: number;
  handle: string;
  title: string;
  updated_at: string;
  body_html: string | null;
  published_at: string;
  sort_order: string;
  template_suffix: string | null;
  published_scope: string;
  admin_graphql_api_id: string;
}

/**
 * Shopify marketplace adapter implementation
 */
@injectable()
export class ShopifyAdapter extends BaseMarketplaceAdapter {
  readonly marketplaceId = 'shopify';
  readonly marketplaceName = 'Shopify';
  
  // Shopify specific properties
  private shopifyCredentials: ShopifyCredentials | null = null;
  private apiClient: AxiosInstance | null = null;
  private rateLimiter: LeakyBucketRateLimiter;
  private logger: Logger;
  
  /**
   * Constructor for ShopifyAdapter
   */
  constructor(@inject('Logger') logger: Logger) {
    super();
    this.logger = logger;
    
    // Initialize rate limiter with default values
    const rateLimiterOptions: RateLimiterOptions = {
      tokensPerSecond: shopifyConfig.callsPerSecond,
      bucketSize: shopifyConfig.bucketSize
    };
    
    this.rateLimiter = new LeakyBucketRateLimiter(rateLimiterOptions);
  }
  
  /**
   * Initialize the adapter with Shopify credentials
   * @param credentials Shopify marketplace credentials
   */
  async initialize(credentials: MarketplaceCredentials): Promise<void> {
    this.logger.info('Initializing Shopify adapter', {
      storeDomain: (credentials as ShopifyCredentials).storeDomain || 'Unknown store'
    });
    
    try {
      this.credentials = credentials;
      this.shopifyCredentials = credentials as ShopifyCredentials;
      
      // Store domain may not include protocol, ensure it does
      const domain = this.shopifyCredentials.storeDomain.includes('://')
        ? this.shopifyCredentials.storeDomain
        : `https://${this.shopifyCredentials.storeDomain}`;
      
      // Use API version from credentials if available, otherwise from config
      const apiVersion = this.shopifyCredentials.apiVersion || shopifyConfig.apiVersion;
      
      // Create Axios instance for making API calls
      this.apiClient = axios.create({
        baseURL: `${domain}/admin/api/${apiVersion}`,
        timeout: shopifyConfig.defaultTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      // Add authorization header
      if (this.shopifyCredentials.accessToken) {
        this.apiClient.defaults.headers.common['X-Shopify-Access-Token'] = this.shopifyCredentials.accessToken;
      } else {
        throw new Error('Shopify access token is required');
      }
      
      // Add request interceptor for rate limiting
      this.apiClient.interceptors.request.use(async (config) => {
        // Respect Shopify's rate limits using the leaky bucket algorithm
        await this.rateLimiter.acquire(1);
        return config;
      });
      
      // Add response interceptor for extracting rate limit headers
      this.apiClient.interceptors.response.use((response) => {
        // Update rate limit info based on response headers
        if (response.headers['x-shopify-shop-api-call-limit']) {
          const rateHeader = response.headers['x-shopify-shop-api-call-limit'];
          const [used, limit] = rateHeader.split('/').map(Number);
          
          // Update rate limit information
          this.rateLimitInfo = {
            remaining: limit - used,
            limit,
            // Reset time is typically after 1 second for Shopify
            reset: new Date(Date.now() + 1000)
          };
        }
        
        return response;
      });
      
      // Test connection to verify credentials
      const connectionStatus = await this.testConnection();
      
      if (!connectionStatus.connected) {
        throw new Error(`Failed to connect to Shopify: ${connectionStatus.message}`);
      }
      
      this.logger.info('Shopify adapter initialized successfully', {
        storeDomain: this.shopifyCredentials.storeDomain
      });
    } catch (error) {
      this.logger.error('Failed to initialize Shopify adapter', { error });
      throw error;
    }
  }
  
  /**
   * Test connection to Shopify API
   */
  async testConnection(): Promise<ConnectionStatus> {
    try {
      this.ensureInitialized();
      
      // Make a simple API call to verify connection
      const response = await this.apiClient!.get('/shop.json');
      
      if (response.status === 200 && response.data.shop) {
        this.lastConnectionCheck = new Date();
        this.lastConnectionStatus = true;
        
        return {
          connected: true,
          message: `Connected to Shopify shop: ${response.data.shop.name}`,
          lastChecked: this.lastConnectionCheck
        };
      }
      
      return {
        connected: false,
        message: 'Could not verify Shopify shop details',
        lastChecked: new Date()
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('Shopify connection test failed', { error });
      
      return {
        connected: false,
        message: `Failed to connect to Shopify: ${message}`,
        lastChecked: new Date()
      };
    }
  }
  
  /**
   * Get product by SKU from Shopify
   * @param sku Product SKU
   */
  async getProductBySku(sku: string): Promise<OperationResult<MarketplaceProduct>> {
    try {
      this.ensureInitialized();
      
      this.logger.debug('Getting Shopify product by SKU', { sku });
      
      // Shopify doesn't have a direct lookup by SKU, so we need to search for it
      const response = await this.apiClient!.get('/products.json', {
        params: {
          limit: 250
        }
      });
      
      // Look through all variants of all products to find matching SKU
      const products = response.data.products as ShopifyProduct[];
      let matchingProduct: ShopifyProduct | undefined;
      let matchingVariant: ShopifyVariant | undefined;
      
      for (const product of products) {
        const variant = product.variants.find(v => v.sku === sku);
        if (variant) {
          matchingProduct = product;
          matchingVariant = variant;
          break;
        }
      }
      
      if (!matchingProduct || !matchingVariant) {
        return this.createErrorResult(
          this.createError(`Product with SKU ${sku} not found`, 'PRODUCT_NOT_FOUND')
        );
      }
      
      // Map Shopify product to standard format
      const standardProduct = this.mapShopifyProductToStandard(matchingProduct, matchingVariant);
      
      return this.createSuccessResult(standardProduct);
    } catch (error) {
      const marketplaceError = this.handleApiError(error, `getProductBySku(${sku})`);
      return this.createErrorResult(marketplaceError);
    }
  }
  
  /**
   * Get product by ID from Shopify
   * @param id Product ID
   */
  async getProductById(id: string): Promise<OperationResult<MarketplaceProduct>> {
    try {
      this.ensureInitialized();
      
      this.logger.debug('Getting Shopify product by ID', { id });
      
      // Get product from Shopify API
      const response = await this.apiClient!.get(`/products/${id}.json`);
      
      if (!response.data.product) {
        return this.createErrorResult(
          this.createError(`Product with ID ${id} not found`, 'PRODUCT_NOT_FOUND')
        );
      }
      
      const shopifyProduct = response.data.product as ShopifyProduct;
      
      // Use primary variant for the product
      const primaryVariant = shopifyProduct.variants[0];
      
      // Map Shopify product to standard format
      const standardProduct = this.mapShopifyProductToStandard(shopifyProduct, primaryVariant);
      
      return this.createSuccessResult(standardProduct);
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
      
      this.logger.debug('Getting Shopify products by SKUs', { skuCount: skus.length });
      
      // Since Shopify doesn't support bulk lookup by SKU, we'll fetch all products
      // and filter them by SKU
      const response = await this.apiClient!.get('/products.json', {
        params: {
          limit: 250
        }
      });
      
      const products = response.data.products as ShopifyProduct[];
      const matchingProducts: MarketplaceProduct[] = [];
      const missingSkus: string[] = [...skus];
      
      // Look through all variants of all products to find matching SKUs
      for (const product of products) {
        for (const variant of product.variants) {
          const skuIndex = missingSkus.indexOf(variant.sku);
          if (skuIndex !== -1) {
            // Found a matching SKU
            matchingProducts.push(this.mapShopifyProductToStandard(product, variant));
            missingSkus.splice(skuIndex, 1);
            
            // If we've found all SKUs, we can stop searching
            if (missingSkus.length === 0) {
              break;
            }
          }
        }
        
        // If we've found all SKUs, we can stop searching
        if (missingSkus.length === 0) {
          break;
        }
      }
      
      // If we couldn't find all requested SKUs, log a warning
      if (missingSkus.length > 0) {
        this.logger.warn('Some SKUs were not found in Shopify', { 
          missingSkus, 
          found: skus.length - missingSkus.length,
          total: skus.length
        });
      }
      
      return this.createSuccessResult(matchingProducts);
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
      
      this.logger.debug('Getting Shopify products', { page, pageSize, filters });
      
      // Convert to Shopify API parameters
      const params: Record<string, any> = {
        limit: pageSize,
        page: page + 1, // Shopify uses 1-based pagination
      };
      
      // Apply filters if provided
      if (filters) {
        if (filters.updatedAfter) {
          params.updated_at_min = filters.updatedAfter.toISOString();
        }
        
        if (filters.status) {
          params.status = filters.status.toLowerCase();
        }
        
        if (filters.collection_id) {
          // For collection filtering, we'll need to do this separately
          // as Shopify requires a different endpoint
        }
      }
      
      // Get product count for pagination info
      const countResponse = await this.apiClient!.get('/products/count.json');
      const totalProducts = countResponse.data.count;
      
      // Fetch the products
      const response = await this.apiClient!.get('/products.json', { params });
      
      const shopifyProducts = response.data.products as ShopifyProduct[];
      
      // Apply collection filter manually if provided
      let filteredProducts = shopifyProducts;
      if (filters?.collection_id) {
        try {
          // Fetch products in the specific collection
          const collectionResponse = await this.apiClient!.get(
            `/collections/${filters.collection_id}/products.json`,
            { params: { limit: 250 } }
          );
          
          const collectionProductIds = new Set(
            collectionResponse.data.products.map((p: any) => p.id)
          );
          
          // Filter products to only those in the collection
          filteredProducts = shopifyProducts.filter(p => 
            collectionProductIds.has(p.id)
          );
        } catch (collectionError) {
          this.logger.warn('Failed to apply collection filter', { 
            collectionId: filters.collection_id,
            error: collectionError 
          });
          // Continue with unfiltered products
        }
      }
      
      // Map Shopify products to standard format
      const standardProducts: MarketplaceProduct[] = filteredProducts.map(product => {
        // Use primary variant for each product
        const primaryVariant = product.variants[0];
        return this.mapShopifyProductToStandard(product, primaryVariant);
      });
      
      // Calculate pagination values
      const totalPages = Math.ceil(totalProducts / pageSize);
      
      return {
        data: standardProducts,
        total: totalProducts,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages - 1,
        hasPrev: page > 0,
        // Include Shopify specific pagination info for cursor-based pagination
        pageToken: response.headers.link ? this.extractNextPageToken(response.headers.link) : undefined
      };
    } catch (error) {
      this.logger.error('Error getting Shopify products', { 
        error, 
        page, 
        pageSize, 
        filters 
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
      
      this.logger.debug('Updating Shopify product stock levels', { 
        updateCount: updates.length 
      });
      
      const successful: string[] = [];
      const failed: Array<{ sku: string; reason: string }> = [];
      
      // For each product SKU, find its inventory_item_id and update quantity
      for (const update of updates) {
        try {
          // First, find the product by SKU to get variant info
          const productResult = await this.getProductBySku(update.sku);
          
          if (!productResult.success || !productResult.data) {
            failed.push({
              sku: update.sku,
              reason: productResult.error?.message || 'Product not found'
            });
            continue;
          }
          
          // Make a request to get the inventory item ID for the variant
          const variantId = productResult.data.id.split('-')[1]; // Extract variant ID
          
          const variantResponse = await this.apiClient!.get(`/variants/${variantId}.json`);
          const inventoryItemId = variantResponse.data.variant.inventory_item_id;
          
          // Update the inventory level
          await this.apiClient!.post('/inventory_levels/set.json', {
            inventory_item_id: inventoryItemId,
            location_id: await this.getDefaultLocationId(),
            available: update.quantity
          });
          
          successful.push(update.sku);
        } catch (error) {
          this.logger.error('Error updating Shopify product stock', { 
            sku: update.sku, 
            error 
          });
          
          failed.push({
            sku: update.sku,
            reason: error instanceof Error ? error.message : String(error)
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
      
      this.logger.debug('Updating Shopify product prices', { 
        updateCount: updates.length 
      });
      
      const successful: string[] = [];
      const failed: Array<{ sku: string; reason: string }> = [];
      
      // For each product SKU, find its variant and update price
      for (const update of updates) {
        try {
          // First, find the product by SKU to get variant info
          const productResult = await this.getProductBySku(update.sku);
          
          if (!productResult.success || !productResult.data) {
            failed.push({
              sku: update.sku,
              reason: productResult.error?.message || 'Product not found'
            });
            continue;
          }
          
          // Extract variant ID
          const variantId = productResult.data.id.split('-')[1];
          
          // Update the variant price
          await this.apiClient!.put(`/variants/${variantId}.json`, {
            variant: {
              id: variantId,
              price: update.price.toString()
            }
          });
          
          successful.push(update.sku);
        } catch (error) {
          this.logger.error('Error updating Shopify product price', { 
            sku: update.sku, 
            error 
          });
          
          failed.push({
            sku: update.sku,
            reason: error instanceof Error ? error.message : String(error)
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
      
      this.logger.debug('Updating Shopify product status', { 
        updateCount: updates.length 
      });
      
      const successful: string[] = [];
      const failed: Array<{ sku: string; reason: string }> = [];
      
      // For each product SKU, find its product and update status
      for (const update of updates) {
        try {
          // First, find the product by SKU to get product info
          const productResult = await this.getProductBySku(update.sku);
          
          if (!productResult.success || !productResult.data) {
            failed.push({
              sku: update.sku,
              reason: productResult.error?.message || 'Product not found'
            });
            continue;
          }
          
          // Extract product ID
          const productId = productResult.data.id.split('-')[0];
          
          // Map status to Shopify status
          let shopifyStatus: string;
          switch (update.status) {
            case ProductStatus.ACTIVE:
              shopifyStatus = 'active';
              break;
            case ProductStatus.INACTIVE:
              shopifyStatus = 'archived';
              break;
            case ProductStatus.DRAFT:
              shopifyStatus = 'draft';
              break;
            default:
              shopifyStatus = 'draft';
          }
          
          // Update the product status
          await this.apiClient!.put(`/products/${productId}.json`, {
            product: {
              id: productId,
              status: shopifyStatus
            }
          });
          
          successful.push(update.sku);
        } catch (error) {
          this.logger.error('Error updating Shopify product status', { 
            sku: update.sku, 
            error 
          });
          
          failed.push({
            sku: update.sku,
            reason: error instanceof Error ? error.message : String(error)
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
      
      this.logger.debug('Getting recent Shopify orders', { 
        sinceDate, 
        page, 
        pageSize 
      });
      
      // Convert to Shopify API parameters
      const params: Record<string, any> = {
        limit: pageSize,
        page: page + 1, // Shopify uses 1-based pagination
        updated_at_min: sinceDate.toISOString(),
        status: 'any' // Include all orders regardless of status
      };
      
      // Get order count for pagination info
      const countResponse = await this.apiClient!.get('/orders/count.json', {
        params: {
          updated_at_min: sinceDate.toISOString(),
          status: 'any'
        }
      });
      const totalOrders = countResponse.data.count;
      
      // Fetch the orders
      const response = await this.apiClient!.get('/orders.json', { params });
      
      const shopifyOrders = response.data.orders as ShopifyOrder[];
      
      // Map Shopify orders to standard format
      const standardOrders: MarketplaceOrder[] = shopifyOrders.map(order => 
        this.mapShopifyOrderToStandard(order)
      );
      
      // Calculate pagination values
      const totalPages = Math.ceil(totalOrders / pageSize);
      
      return {
        data: standardOrders,
        total: totalOrders,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages - 1,
        hasPrev: page > 0,
        // Include Shopify specific pagination info for cursor-based pagination
        pageToken: response.headers.link ? this.extractNextPageToken(response.headers.link) : undefined
      };
    } catch (error) {
      this.logger.error('Error getting recent Shopify orders', { 
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
      
      this.logger.debug('Getting Shopify order by ID', { id });
      
      // Get order from Shopify API
      const response = await this.apiClient!.get(`/orders/${id}.json`);
      
      if (!response.data.order) {
        return this.createErrorResult(
          this.createError(`Order with ID ${id} not found`, 'ORDER_NOT_FOUND')
        );
      }
      
      const shopifyOrder = response.data.order as ShopifyOrder;
      
      // Map Shopify order to standard format
      const standardOrder = this.mapShopifyOrderToStandard(shopifyOrder);
      
      return this.createSuccessResult(standardOrder);
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
      
      this.logger.debug('Acknowledging Shopify order', { orderId });
      
      // For Shopify, order acknowledgment might mean tagging the order
      // or adding a note to indicate it's been received by the system
      const response = await this.apiClient!.put(`/orders/${orderId}.json`, {
        order: {
          id: orderId,
          tags: 'acknowledged',
          note: 'Order acknowledged by system on ' + new Date().toISOString()
        }
      });
      
      if (!response.data.order) {
        return this.createErrorResult(
          this.createError(`Order with ID ${orderId} not found`, 'ORDER_NOT_FOUND')
        );
      }
      
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
      
      this.logger.debug('Updating Shopify order status', { 
        orderId, 
        status, 
        trackingInfo 
      });
      
      // For Shopify, updating order status often means creating fulfillments
      // or cancelling orders depending on the status
      switch (status.toLowerCase()) {
        case 'cancelled':
          // Cancel the order
          await this.apiClient!.post(`/orders/${orderId}/cancel.json`);
          break;
          
        case 'fulfilled':
        case 'shipped':
          // Create a fulfillment if tracking info is provided
          if (trackingInfo) {
            // First, get the order to find line items
            const orderResponse = await this.apiClient!.get(`/orders/${orderId}.json`);
            const order = orderResponse.data.order as ShopifyOrder;
            
            // Create a fulfillment with tracking info
            await this.apiClient!.post(`/orders/${orderId}/fulfillments.json`, {
              fulfillment: {
                location_id: await this.getDefaultLocationId(),
                tracking_number: trackingInfo.trackingNumber,
                tracking_company: trackingInfo.carrier,
                tracking_urls: [`https://track.package.com/${trackingInfo.trackingNumber}`],
                notify_customer: true,
                line_items: order.line_items.map(item => ({
                  id: item.id,
                  quantity: item.quantity
                }))
              }
            });
          }
          break;
          
        default:
          // For other statuses, update tags or add note
          await this.apiClient!.put(`/orders/${orderId}.json`, {
            order: {
              id: orderId,
              tags: status,
              note: `Order status updated to ${status} on ${new Date().toISOString()}`
            }
          });
      }
      
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
      
      this.logger.debug('Getting Shopify categories (collections)', { parentId });
      
      // In Shopify, categories are called collections
      const response = await this.apiClient!.get('/custom_collections.json');
      
      const collections = response.data.custom_collections as ShopifyCollection[];
      
      // Map collections to standard category format
      const categories: MarketplaceCategory[] = collections.map(collection => ({
        id: collection.id.toString(),
        name: collection.title,
        path: collection.handle,
        parentId: null, // Shopify collections are flat, no hierarchy
        level: 1,
        isLeaf: true,
        createdAt: new Date(collection.updated_at),
        updatedAt: new Date(collection.updated_at)
      }));
      
      return this.createSuccessResult(categories);
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
      
      this.logger.debug('Getting Shopify category attributes', { categoryId });
      
      // Shopify doesn't have category-specific attributes like Amazon
      // We'll return some standard product attributes instead
      
      const attributes = [
        {
          id: 'title',
          name: 'Title',
          required: true,
          type: 'string'
        },
        {
          id: 'body_html',
          name: 'Description',
          required: false,
          type: 'html'
        },
        {
          id: 'vendor',
          name: 'Vendor',
          required: false,
          type: 'string'
        },
        {
          id: 'product_type',
          name: 'Product Type',
          required: false,
          type: 'string'
        },
        {
          id: 'tags',
          name: 'Tags',
          required: false,
          type: 'string'
        }
      ];
      
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
    this.logger.info('Closing Shopify adapter');
    
    // Clean up resources
    this.credentials = null;
    this.shopifyCredentials = null;
    this.apiClient = null;
  }
  
  /**
   * Map a Shopify product to our standard format
   * @param shopifyProduct Shopify product data
   * @param variant Shopify product variant
   */
  private mapShopifyProductToStandard(
    shopifyProduct: ShopifyProduct,
    variant: ShopifyVariant
  ): MarketplaceProduct {
    // Map product status
    let productStatus: ProductStatus;
    switch (shopifyProduct.status) {
      case 'active':
        productStatus = ProductStatus.ACTIVE;
        break;
      case 'archived':
        productStatus = ProductStatus.INACTIVE;
        break;
      case 'draft':
        productStatus = ProductStatus.DRAFT;
        break;
      default:
        productStatus = ProductStatus.DRAFT;
    }
    
    // Construct image URLs
    const images = shopifyProduct.images.map(img => img.src);
    
    // Map to standard product format
    return {
      id: `${shopifyProduct.id}-${variant.id}`, // Combine product and variant IDs
      sku: variant.sku,
      title: shopifyProduct.title,
      description: shopifyProduct.body_html,
      price: parseFloat(variant.price),
      currencyCode: 'USD', // Shopify doesn't include currency in product data
      stockLevel: variant.inventory_quantity,
      status: productStatus,
      images,
      createdAt: new Date(shopifyProduct.created_at),
      updatedAt: new Date(shopifyProduct.updated_at),
      marketplaceId: this.marketplaceId,
      // Include Shopify specific fields
      productType: shopifyProduct.product_type,
      vendor: shopifyProduct.vendor,
      tags: shopifyProduct.tags,
      // Additional variant details
      variantTitle: variant.title === 'Default Title' ? undefined : variant.title,
      weight: variant.weight,
      weightUnit: variant.weight_unit,
      barcode: variant.barcode || undefined
    };
  }
  
  /**
   * Map a Shopify order to our standard format
   * @param shopifyOrder Shopify order data
   */
  private mapShopifyOrderToStandard(shopifyOrder: ShopifyOrder): MarketplaceOrder {
    // Map order items
    const orderItems = shopifyOrder.line_items.map(item => ({
      id: item.id.toString(),
      productId: item.product_id.toString(),
      variantId: item.variant_id.toString(),
      sku: item.sku,
      title: item.name,
      quantity: item.quantity,
      unitPrice: parseFloat(item.price),
      total: item.quantity * parseFloat(item.price)
    }));
    
    // Map order status
    let orderStatus: string;
    if (shopifyOrder.cancelled_at) {
      orderStatus = 'cancelled';
    } else if (shopifyOrder.fulfillment_status === 'fulfilled') {
      orderStatus = 'fulfilled';
    } else if (shopifyOrder.fulfillment_status === 'partial') {
      orderStatus = 'partially_fulfilled';
    } else {
      orderStatus = 'new';
    }
    
    // Map payment status
    let paymentStatus: string;
    switch (shopifyOrder.financial_status) {
      case 'paid':
        paymentStatus = 'paid';
        break;
      case 'partially_paid':
        paymentStatus = 'partially_paid';
        break;
      case 'refunded':
        paymentStatus = 'refunded';
        break;
      case 'pending':
        paymentStatus = 'pending';
        break;
      default:
        paymentStatus = shopifyOrder.financial_status || 'unknown';
    }
    
    // Map shipping status
    let shippingStatus: string;
    switch (shopifyOrder.fulfillment_status) {
      case 'fulfilled':
        shippingStatus = 'shipped';
        break;
      case 'partial':
        shippingStatus = 'partially_shipped';
        break;
      case null:
        shippingStatus = 'awaiting_fulfillment';
        break;
      default:
        shippingStatus = shopifyOrder.fulfillment_status || 'awaiting_fulfillment';
    }
    
    // Map shipping address
    const shippingAddress = shopifyOrder.shipping_address ? {
      address: {
        name: shopifyOrder.shipping_address.name,
        company: shopifyOrder.shipping_address.company || undefined,
        line1: shopifyOrder.shipping_address.address1,
        line2: shopifyOrder.shipping_address.address2 || undefined,
        city: shopifyOrder.shipping_address.city,
        state: shopifyOrder.shipping_address.province,
        postalCode: shopifyOrder.shipping_address.zip,
        country: shopifyOrder.shipping_address.country,
        phone: shopifyOrder.shipping_address.phone || undefined
      },
      method: shopifyOrder.shipping_lines[0]?.title || 'Standard'
    } : undefined;
    
    // Map billing address
    const billingAddress = shopifyOrder.billing_address ? {
      name: shopifyOrder.billing_address.name,
      company: shopifyOrder.billing_address.company || undefined,
      line1: shopifyOrder.billing_address.address1,
      line2: shopifyOrder.billing_address.address2 || undefined,
      city: shopifyOrder.billing_address.city,
      state: shopifyOrder.billing_address.province,
      postalCode: shopifyOrder.billing_address.zip,
      country: shopifyOrder.billing_address.country,
      phone: shopifyOrder.billing_address.phone || undefined
    } : undefined;
    
    // Return standardized order
    return {
      id: shopifyOrder.id.toString(),
      marketplaceOrderId: shopifyOrder.name, // Shopify order name is like #1001
      customerDetails: {
        email: shopifyOrder.email,
        firstName: shopifyOrder.customer?.first_name || '',
        lastName: shopifyOrder.customer?.last_name || '',
        phone: shopifyOrder.customer?.phone || undefined
      },
      orderItems,
      orderStatus,
      paymentStatus,
      shippingStatus,
      shippingDetails: shippingAddress,
      paymentDetails: {
        method: shopifyOrder.gateway || 'unknown',
        amount: parseFloat(shopifyOrder.total_price),
        currency: shopifyOrder.currency
      },
      billingAddress,
      currencyCode: shopifyOrder.currency,
      subtotal: parseFloat(shopifyOrder.subtotal_price),
      shippingCost: shopifyOrder.shipping_lines.reduce((total, line) => 
        total + parseFloat(line.price), 0),
      tax: parseFloat(shopifyOrder.total_tax),
      discount: parseFloat(shopifyOrder.total_discounts),
      total: parseFloat(shopifyOrder.total_price),
      createdAt: new Date(shopifyOrder.created_at),
      updatedAt: new Date(shopifyOrder.updated_at),
      notes: shopifyOrder.note || undefined
    };
  }
  
  /**
   * Get the default location ID for inventory operations
   */
  private async getDefaultLocationId(): Promise<number> {
    try {
      // Get locations from Shopify API
      const response = await this.apiClient!.get('/locations.json');
      const locations = response.data.locations;
      
      // Find the first active location
      const activeLocation = locations.find((location: any) => location.active);
      
      if (activeLocation) {
        return activeLocation.id;
      }
      
      // If no active location found, use the first one
      if (locations.length > 0) {
        return locations[0].id;
      }
      
      throw new Error('No locations found for inventory operations');
    } catch (error) {
      this.logger.error('Error getting Shopify default location', { error });
      throw error;
    }
  }
  
  /**
   * Extract next page token from Shopify Link header
   * @param linkHeader Link header from Shopify response
   */
  private extractNextPageToken(linkHeader: string): string | undefined {
    // Parse Link header to extract next page URL
    const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
    
    if (!match) {
      return undefined;
    }
    
    // Extract page_info query parameter which is used as cursor
    const nextUrl = match[1];
    const url = new URL(nextUrl);
    return url.searchParams.get('page_info') || undefined;
  }
}