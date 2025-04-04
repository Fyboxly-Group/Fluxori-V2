/**
 * Marketplace Types
 * Common type definitions for marketplace integrations
 */

/**
 * Marketplace credentials interface
 */
export interface MarketplaceCredentials {
  /**
   * API key for the marketplace
   */
  apiKey?: string;
  
  /**
   * API secret for the marketplace
   */
  apiSecret?: string;
  
  /**
   * OAuth access token
   */
  accessToken?: string;
  
  /**
   * OAuth refresh token
   */
  refreshToken?: string;
  
  /**
   * OAuth token expiry timestamp
   */
  tokenExpiry?: Date;
  
  /**
   * Seller ID in the marketplace
   */
  sellerId?: string;
  
  /**
   * Marketplace store ID
   */
  storeId?: string;
  
  /**
   * Marketplace specific settings
   */
  settings?: Record<string, any>;
  
  /**
   * Allow any other marketplace-specific credentials
   */
  [key: string]: any;
}

/**
 * Marketplace product status
 */
export enum MarketplaceProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

/**
 * Marketplace inventory level
 */
export interface MarketplaceInventoryLevel {
  /**
   * Available quantity
   */
  available: number;
  
  /**
   * Reserved quantity (orders not yet fulfilled)
   */
  reserved?: number;
  
  /**
   * Location ID if the marketplace supports multiple locations
   */
  locationId?: string;
  
  /**
   * Warehouse ID in the Fluxori system
   */
  warehouseId?: string;
}

/**
 * Marketplace product price information
 */
export interface MarketplaceProductPrice {
  /**
   * Regular price (non-sale price)
   */
  regular: number;
  
  /**
   * Sale price (if applicable)
   */
  sale?: number;
  
  /**
   * Whether the product is on sale
   */
  onSale?: boolean;
  
  /**
   * Currency code (e.g., 'USD', 'EUR')
   */
  currency: string;
  
  /**
   * Sale start date (if applicable)
   */
  saleStart?: Date;
  
  /**
   * Sale end date (if applicable)
   */
  saleEnd?: Date;
}

/**
 * Marketplace product variant
 */
export interface MarketplaceProductVariant {
  /**
   * Variant ID
   */
  id: string;
  
  /**
   * Parent product ID
   */
  productId: string;
  
  /**
   * Variant title
   */
  title: string;
  
  /**
   * Variant SKU
   */
  sku?: string;
  
  /**
   * Variant barcode/UPC/EAN
   */
  barcode?: string;
  
  /**
   * Variant price information
   */
  price: MarketplaceProductPrice;
  
  /**
   * Variant inventory level
   */
  inventory?: MarketplaceInventoryLevel;
  
  /**
   * Variant attributes (e.g., color, size)
   */
  attributes?: Record<string, string>;
  
  /**
   * Variant image URLs
   */
  images?: string[];
  
  /**
   * Variant weight
   */
  weight?: number;
  
  /**
   * Variant weight unit
   */
  weightUnit?: 'kg' | 'g' | 'lb' | 'oz';
  
  /**
   * Variant dimensions
   */
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: 'cm' | 'in' | 'mm';
  };
  
  /**
   * Marketplace-specific data
   */
  [key: string]: any;
}

/**
 * Marketplace product
 */
export interface MarketplaceProduct {
  /**
   * Product ID in the marketplace
   */
  id: string;
  
  /**
   * Product title
   */
  title: string;
  
  /**
   * Product description
   */
  description?: string;
  
  /**
   * Product type or category
   */
  type?: string;
  
  /**
   * Product vendor or brand
   */
  vendor?: string;
  
  /**
   * Product SKU
   */
  sku?: string;
  
  /**
   * Product barcode/UPC/EAN
   */
  barcode?: string;
  
  /**
   * Product price information
   */
  price: MarketplaceProductPrice;
  
  /**
   * Product inventory level (for simple products)
   */
  inventory?: MarketplaceInventoryLevel;
  
  /**
   * Product status
   */
  status: MarketplaceProductStatus;
  
  /**
   * Product variants (if applicable)
   */
  variants?: MarketplaceProductVariant[];
  
  /**
   * Product image URLs
   */
  images?: string[];
  
  /**
   * Product tags
   */
  tags?: string[];
  
  /**
   * Product created date
   */
  createdAt?: Date;
  
  /**
   * Product updated date
   */
  updatedAt?: Date;
  
  /**
   * Product published date
   */
  publishedAt?: Date;
  
  /**
   * Marketplace-specific product data
   */
  [key: string]: any;
}

/**
 * Marketplace order status
 */
export enum MarketplaceOrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  FULFILLED = 'fulfilled',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  ON_HOLD = 'on_hold',
  RETURNED = 'returned',
  PARTIALLY_FULFILLED = 'partially_fulfilled',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

/**
 * Marketplace order line item
 */
export interface MarketplaceOrderLineItem {
  /**
   * Line item ID
   */
  id: string;
  
  /**
   * Product ID
   */
  productId: string;
  
  /**
   * Variant ID (if applicable)
   */
  variantId?: string;
  
  /**
   * Product title
   */
  title: string;
  
  /**
   * Variant title (if applicable)
   */
  variantTitle?: string;
  
  /**
   * SKU
   */
  sku?: string;
  
  /**
   * Quantity ordered
   */
  quantity: number;
  
  /**
   * Unit price
   */
  price: number;
  
  /**
   * Line item subtotal (price * quantity)
   */
  subtotal: number;
  
  /**
   * Line item discount
   */
  discount?: number;
  
  /**
   * Line item tax
   */
  tax?: number;
  
  /**
   * Line item total (subtotal - discount + tax)
   */
  total: number;
  
  /**
   * Whether the line item requires shipping
   */
  requiresShipping?: boolean;
  
  /**
   * Whether the line item has been fulfilled
   */
  fulfilled?: boolean;
  
  /**
   * Fulfillment status
   */
  fulfillmentStatus?: string;
  
  /**
   * Marketplace-specific line item data
   */
  [key: string]: any;
}

/**
 * Marketplace order address
 */
export interface MarketplaceOrderAddress {
  /**
   * First name
   */
  firstName?: string;
  
  /**
   * Last name
   */
  lastName?: string;
  
  /**
   * Full name
   */
  name?: string;
  
  /**
   * Company name
   */
  company?: string;
  
  /**
   * Address line 1
   */
  address1: string;
  
  /**
   * Address line 2
   */
  address2?: string;
  
  /**
   * City
   */
  city: string;
  
  /**
   * State/province/region
   */
  state?: string;
  
  /**
   * ZIP/postal code
   */
  zip?: string;
  
  /**
   * Country
   */
  country: string;
  
  /**
   * Country code (ISO 3166-1 alpha-2)
   */
  countryCode?: string;
  
  /**
   * Phone number
   */
  phone?: string;
  
  /**
   * Email address
   */
  email?: string;
  
  /**
   * Marketplace-specific address data
   */
  [key: string]: any;
}

/**
 * Marketplace order customer
 */
export interface MarketplaceOrderCustomer {
  /**
   * Customer ID
   */
  id?: string;
  
  /**
   * First name
   */
  firstName?: string;
  
  /**
   * Last name
   */
  lastName?: string;
  
  /**
   * Full name
   */
  name?: string;
  
  /**
   * Email address
   */
  email: string;
  
  /**
   * Phone number
   */
  phone?: string;
  
  /**
   * Whether the customer has an account
   */
  hasAccount?: boolean;
  
  /**
   * Customer note
   */
  note?: string;
  
  /**
   * Marketplace-specific customer data
   */
  [key: string]: any;
}

/**
 * Marketplace order shipping
 */
export interface MarketplaceOrderShipping {
  /**
   * Shipping method
   */
  method?: string;
  
  /**
   * Shipping carrier
   */
  carrier?: string;
  
  /**
   * Shipping cost
   */
  cost?: number;
  
  /**
   * Tracking number
   */
  trackingNumber?: string;
  
  /**
   * Tracking URL
   */
  trackingUrl?: string;
  
  /**
   * Estimated delivery date
   */
  estimatedDelivery?: Date;
  
  /**
   * Shipping address
   */
  address?: MarketplaceOrderAddress;
  
  /**
   * Marketplace-specific shipping data
   */
  [key: string]: any;
}

/**
 * Marketplace order payment
 */
export interface MarketplaceOrderPayment {
  /**
   * Payment method
   */
  method?: string;
  
  /**
   * Payment status
   */
  status?: string;
  
  /**
   * Payment date
   */
  date?: Date;
  
  /**
   * Payment amount
   */
  amount?: number;
  
  /**
   * Payment currency
   */
  currency?: string;
  
  /**
   * Payment transaction ID
   */
  transactionId?: string;
  
  /**
   * Marketplace-specific payment data
   */
  [key: string]: any;
}

/**
 * Marketplace order
 */
export interface MarketplaceOrder {
  /**
   * Order ID in the marketplace
   */
  id: string;
  
  /**
   * Order number (human-readable)
   */
  orderNumber: string;
  
  /**
   * Order status
   */
  status: MarketplaceOrderStatus;
  
  /**
   * Order currency
   */
  currency: string;
  
  /**
   * Order customer
   */
  customer: MarketplaceOrderCustomer;
  
  /**
   * Order line items
   */
  items: MarketplaceOrderLineItem[];
  
  /**
   * Order shipping information
   */
  shipping?: MarketplaceOrderShipping;
  
  /**
   * Order billing address
   */
  billingAddress?: MarketplaceOrderAddress;
  
  /**
   * Order payment information
   */
  payment?: MarketplaceOrderPayment;
  
  /**
   * Order subtotal (sum of line items' subtotals)
   */
  subtotal: number;
  
  /**
   * Order shipping cost
   */
  shippingCost?: number;
  
  /**
   * Order tax
   */
  tax?: number;
  
  /**
   * Order discount
   */
  discount?: number;
  
  /**
   * Order total (subtotal + shipping + tax - discount)
   */
  total: number;
  
  /**
   * Order created date
   */
  createdAt: Date;
  
  /**
   * Order updated date
   */
  updatedAt?: Date;
  
  /**
   * Order note
   */
  note?: string;
  
  /**
   * Customer-facing note
   */
  customerNote?: string;
  
  /**
   * Order tags
   */
  tags?: string[];
  
  /**
   * Marketplace-specific order data
   */
  [key: string]: any;
}

/**
 * Marketplace inventory update
 */
export interface MarketplaceInventoryUpdate {
  /**
   * Product ID
   */
  productId: string;
  
  /**
   * Variant ID (if applicable)
   */
  variantId?: string;
  
  /**
   * SKU
   */
  sku?: string;
  
  /**
   * New inventory quantity
   */
  quantity: number;
  
  /**
   * Location ID (if applicable)
   */
  locationId?: string;
}

/**
 * Marketplace webhook payload
 */
export interface MarketplaceWebhookPayload {
  /**
   * Event type
   */
  event: string;
  
  /**
   * Event data
   */
  data: any;
  
  /**
   * Event timestamp
   */
  timestamp: Date;
  
  /**
   * Marketplace-specific webhook data
   */
  [key: string]: any;
}

/**
 * Marketplace product options for querying products
 */
export interface MarketplaceProductOptions {
  /**
   * Maximum number of products to retrieve
   */
  limit?: number;
  
  /**
   * Page number for pagination
   */
  page?: number;
  
  /**
   * Get products created/updated since this date
   */
  since?: Date;
  
  /**
   * Get products by status
   */
  status?: MarketplaceProductStatus | string;
  
  /**
   * Get products by collection/category
   */
  collection?: string;
  
  /**
   * Get products by vendor/brand
   */
  vendor?: string;
  
  /**
   * Get products with these tags
   */
  tags?: string[];
  
  /**
   * Get products matching this query
   */
  query?: string;
  
  /**
   * Get products by product type
   */
  productType?: string;
  
  /**
   * Field to sort by
   */
  sortBy?: string;
  
  /**
   * Sort direction
   */
  sortDirection?: 'asc' | 'desc';
  
  /**
   * Include specific fields in the response
   */
  fields?: string[];
  
  /**
   * Marketplace-specific options
   */
  [key: string]: any;
}

/**
 * Marketplace order options for querying orders
 */
export interface MarketplaceOrderOptions {
  /**
   * Maximum number of orders to retrieve
   */
  limit?: number;
  
  /**
   * Page number for pagination
   */
  page?: number;
  
  /**
   * Get orders created/updated since this date
   */
  since?: Date;
  
  /**
   * Get orders by status
   */
  status?: MarketplaceOrderStatus | string;
  
  /**
   * Get orders by fulfillment status
   */
  fulfillmentStatus?: string;
  
  /**
   * Get orders by financial status
   */
  financialStatus?: string;
  
  /**
   * Get orders created before this date
   */
  createdBefore?: Date;
  
  /**
   * Get orders created after this date
   */
  createdAfter?: Date;
  
  /**
   * Get orders updated before this date
   */
  updatedBefore?: Date;
  
  /**
   * Get orders updated after this date
   */
  updatedAfter?: Date;
  
  /**
   * Get orders by customer ID
   */
  customerId?: string;
  
  /**
   * Get orders by customer email
   */
  customerEmail?: string;
  
  /**
   * Field to sort by
   */
  sortBy?: string;
  
  /**
   * Sort direction
   */
  sortDirection?: 'asc' | 'desc';
  
  /**
   * Include specific fields in the response
   */
  fields?: string[];
  
  /**
   * Marketplace-specific options
   */
  [key: string]: any;
}

/**
 * Marketplace catalog options for querying catalog data
 */
export interface MarketplaceCatalogOptions {
  /**
   * Catalog type to retrieve
   */
  type?: 'categories' | 'attributes' | 'brands' | 'all';
  
  /**
   * Parent category ID for subcategories
   */
  parentId?: string;
  
  /**
   * Maximum number of items to retrieve
   */
  limit?: number;
  
  /**
   * Page number for pagination
   */
  page?: number;
  
  /**
   * Include specific fields in the response
   */
  fields?: string[];
  
  /**
   * Marketplace-specific options
   */
  [key: string]: any;
}