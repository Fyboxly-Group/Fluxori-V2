/**
 * Firestore Order Schema
 * 
 * Defines the schema for orders in Firestore database.
 */
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Represents a customer in an order
 */
export interface OrderCustomer {
  name: string;
  email: string;
  phone?: string;
}

/**
 * Represents an address (shipping or billing)
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
 * Represents a line item in an order
 */
export interface OrderLineItem {
  sku: string;
  marketplaceProductId: string;
  fluxoriProductId?: string; // Reference to Fluxori inventory item ID
  quantity: number;
  price: number;
  title: string;
  tax?: number;
  discount?: number;
  totalPrice: number;
  attributes?: Record<string, any>; // For variant information or other product attributes
  imageUrl?: string;
}

/**
 * Represents the shipping details of an order
 */
export interface ShippingDetails {
  address: Address;
  method: string;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: Timestamp;
  shippedAt?: Timestamp;
  deliveredAt?: Timestamp;
}

/**
 * Represents the payment details of an order
 */
export interface PaymentDetails {
  method: string;
  transactionId?: string;
  amount: number;
  currency: string;
  paymentDate?: Timestamp;
  gatewayResponse?: any;
}

/**
 * Order status enum
 */
export enum OrderStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  ON_HOLD = 'On Hold',
  RETURNED = 'Returned',
  REFUNDED = 'Refunded'
}

/**
 * Payment status enum
 */
export enum PaymentStatus {
  PENDING = 'Pending',
  AUTHORIZED = 'Authorized',
  PAID = 'Paid',
  PARTIALLY_PAID = 'Partially Paid',
  REFUNDED = 'Refunded',
  PARTIALLY_REFUNDED = 'Partially Refunded',
  FAILED = 'Failed',
  VOIDED = 'Voided'
}

/**
 * Shipping status enum
 */
export enum ShippingStatus {
  AWAITING_FULFILLMENT = 'Awaiting Fulfillment',
  FULFILLED = 'Fulfilled',
  PARTIALLY_SHIPPED = 'Partially Shipped',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  RETURNED = 'Returned',
  CANCELLED = 'Cancelled',
  FAILED = 'Failed'
}

/**
 * Represents an order in Firestore
 */
export interface FirestoreOrder {
  // Organization and marketplace information
  userId: string;
  orgId: string;
  marketplaceOrderId: string;
  marketplaceName: string; // e.g., 'takealot', 'amazon_us', 'shopify'
  
  // Dates
  orderDate: Timestamp;
  lastUpdatedMarketplace: Timestamp; // When the order was last updated on the marketplace
  createdAt: Timestamp; // Fluxori internal
  updatedAt: Timestamp; // Fluxori internal
  
  // Status
  status: OrderStatus | string;
  paymentStatus: PaymentStatus | string;
  shippingStatus: ShippingStatus | string;
  
  // Financial information
  currency: string; // e.g., 'ZAR', 'USD'
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  
  // Customer and shipping information
  customerInfo: OrderCustomer;
  shippingAddress: Address;
  billingAddress?: Address;
  
  // Order items
  lineItems: OrderLineItem[];
  
  // Additional details
  shippingDetails?: ShippingDetails;
  paymentDetails?: PaymentDetails;
  
  // External integrations
  xeroInvoiceId?: string;
  xeroInvoiceStatus?: string;
  
  // Optional metadata
  notes?: string;
  fulfillmentType?: 'marketplace_fulfilled' | 'seller_fulfilled';
  channelType?: string;
  isPriority?: boolean;
  tags?: string[];
  marketplaceSpecific?: Record<string, any>; // For marketplace-specific data
}

/**
 * Firestore document data with ID field
 */
export interface FirestoreOrderWithId extends FirestoreOrder {
  id: string; // Firestore document ID
}

/**
 * Converter for Firestore Order documents
 */
export const orderConverter = {
  toFirestore(order: FirestoreOrder): FirebaseFirestore.DocumentData {
    return {
      userId: order.userId,
      orgId: order.orgId,
      marketplaceOrderId: order.marketplaceOrderId,
      marketplaceName: order.marketplaceName,
      orderDate: order.orderDate,
      lastUpdatedMarketplace: order.lastUpdatedMarketplace,
      status: order.status,
      paymentStatus: order.paymentStatus,
      shippingStatus: order.shippingStatus,
      currency: order.currency,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      tax: order.tax,
      discount: order.discount,
      total: order.total,
      customerInfo: order.customerInfo,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      lineItems: order.lineItems,
      shippingDetails: order.shippingDetails,
      paymentDetails: order.paymentDetails,
      xeroInvoiceId: order.xeroInvoiceId,
      xeroInvoiceStatus: order.xeroInvoiceStatus,
      notes: order.notes,
      fulfillmentType: order.fulfillmentType,
      channelType: order.channelType,
      isPriority: order.isPriority,
      tags: order.tags,
      marketplaceSpecific: order.marketplaceSpecific,
      createdAt: order.createdAt || Timestamp.now(),
      updatedAt: Timestamp.now()
    };
  },
  
  fromFirestore(
    snapshot: FirebaseFirestore.QueryDocumentSnapshot
  ): FirestoreOrderWithId {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      orgId: data.orgId,
      marketplaceOrderId: data.marketplaceOrderId,
      marketplaceName: data.marketplaceName,
      orderDate: data.orderDate,
      lastUpdatedMarketplace: data.lastUpdatedMarketplace,
      status: data.status,
      paymentStatus: data.paymentStatus,
      shippingStatus: data.shippingStatus,
      currency: data.currency,
      subtotal: data.subtotal,
      shippingCost: data.shippingCost,
      tax: data.tax,
      discount: data.discount,
      total: data.total,
      customerInfo: data.customerInfo,
      shippingAddress: data.shippingAddress,
      billingAddress: data.billingAddress,
      lineItems: data.lineItems,
      shippingDetails: data.shippingDetails,
      paymentDetails: data.paymentDetails,
      xeroInvoiceId: data.xeroInvoiceId,
      xeroInvoiceStatus: data.xeroInvoiceStatus,
      notes: data.notes,
      fulfillmentType: data.fulfillmentType,
      channelType: data.channelType,
      isPriority: data.isPriority,
      tags: data.tags,
      marketplaceSpecific: data.marketplaceSpecific,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    } as FirestoreOrderWithId;
  }
};