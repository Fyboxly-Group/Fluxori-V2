/**
 * Common data models for marketplace interactions
 */

/**
 * Authentication configuration for marketplace APIs
 */
export interface MarketplaceCredentials {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
  sellerId?: string;
  storeId?: string;
  password?: string;
  secret?: string;
  // Any other auth-related fields that might be needed
  [key: string]: string | number | boolean | undefined;
}

/**
 * Connection status response
 */
export interface ConnectionStatus {
  connected: boolean;
  message: string;
  lastChecked: Date;
  rateLimit?: {
    remaining: number;
    reset: Date;
    limit: number;
  };
}

/**
 * Base product interface for marketplace products
 */
export interface MarketplaceProduct {
  id: string;
  sku: string;
  title: string;
  description?: string;
  images?: string[];
  price: number;
  currencyCode: string;
  stockLevel: number;
  status: ProductStatus;
  categories?: string[];
  attributes?: ProductAttribute[];
  dimensions?: ProductDimensions;
  barcode?: string;
  createdAt: Date;
  updatedAt: Date;
  marketplaceId: string;
  marketplaceSku?: string;
  marketplaceUrl?: string;
  // For marketplace-specific data
  metadata?: Record<string, any>;
}

/**
 * Product status enum
 */
export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  DELETED = 'deleted',
  OUT_OF_STOCK = 'out_of_stock',
  ARCHIVED = 'archived'
}

/**
 * Product attribute interface
 */
export interface ProductAttribute {
  name: string;
  value: string | number | boolean | string[];
  unit?: string;
}

/**
 * Product dimensions interface
 */
export interface ProductDimensions {
  weight?: number;
  weightUnit?: string;
  length?: number;
  width?: number;
  height?: number;
  dimensionUnit?: string;
}

/**
 * Stock update payload
 */
export interface StockUpdatePayload {
  sku: string;
  quantity: number;
  warehouseId?: string;
}

/**
 * Price update payload
 */
export interface PriceUpdatePayload {
  sku: string;
  price: number;
  currencyCode?: string;
  salePrice?: number;
  saleStartDate?: Date;
  saleEndDate?: Date;
}

/**
 * Status update payload
 */
export interface StatusUpdatePayload {
  sku: string;
  status: ProductStatus;
}

/**
 * Order interface
 */
export interface MarketplaceOrder {
  id: string;
  marketplaceOrderId: string;
  customerDetails: OrderCustomer;
  orderItems: OrderItem[];
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  shippingDetails: ShippingDetails;
  paymentDetails: PaymentDetails;
  currencyCode: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  marketplaceSpecific?: Record<string, any>;
}

/**
 * Order customer interface
 */
export interface OrderCustomer {
  id?: string;
  marketplaceCustomerId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  billingAddress?: Address;
}

/**
 * Order item interface
 */
export interface OrderItem {
  id: string;
  sku: string;
  productId?: string;
  marketplaceProductId?: string;
  title: string;
  quantity: number;
  unitPrice: number;
  tax?: number;
  discount?: number;
  total: number;
  attributes?: ProductAttribute[];
  imageUrl?: string;
}

/**
 * Address interface
 */
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  contactName?: string;
  contactPhone?: string;
}

/**
 * Order status enum
 */
export enum OrderStatus {
  NEW = 'new',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELED = 'canceled',
  ON_HOLD = 'on_hold',
  RETURNED = 'returned',
  REFUNDED = 'refunded',
  COMPLETED = 'completed'
}

/**
 * Payment status enum
 */
export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  FAILED = 'failed',
  VOIDED = 'voided'
}

/**
 * Shipping status enum
 */
export enum ShippingStatus {
  AWAITING_FULFILLMENT = 'awaiting_fulfillment',
  FULFILLED = 'fulfilled',
  PARTIALLY_SHIPPED = 'partially_shipped',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  RETURNED = 'returned'
}

/**
 * Shipping details interface
 */
export interface ShippingDetails {
  address: Address;
  method: string;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
}

/**
 * Payment details interface
 */
export interface PaymentDetails {
  method: string;
  transactionId?: string;
  amount: number;
  currency: string;
  paymentDate?: Date;
  gatewayResponse?: any;
}

/**
 * Order acknowledgment response
 */
export interface OrderAcknowledgment {
  orderId: string;
  success: boolean;
  message?: string;
  timestamp: Date;
  reference?: string;
}

/**
 * Category interface
 */
export interface MarketplaceCategory {
  id: string;
  name: string;
  parentId?: string;
  level: number;
  path?: string[];
  isLeaf: boolean;
  attributes?: Array<{
    id: string;
    name: string;
    required: boolean;
    type: string;
    values?: string[];
  }>;
}

/**
 * Response format for paginated data
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Error response from marketplace APIs
 */
export interface MarketplaceError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  requestId?: string;
}

/**
 * Operation result interface
 */
export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: MarketplaceError;
}