/**
 * Order schema for order ingestion system
 * Using Firestore data model
 */
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Order status enum - Standardized across marketplaces
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
 * Payment status enum - Standardized across marketplaces
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
 * Order fulfillment type enum
 */
export enum FulfillmentType {
  MARKETPLACE_FULFILLED = 'marketplace_fulfilled',
  SELLER_FULFILLED = 'seller_fulfilled'
}

/**
 * Address interface
 */
export interface IAddress {
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
 * Order line item interface
 */
export interface IOrderLineItem {
  sku: string;
  marketplaceProductId?: string;
  productId?: string; // Link to internal product catalog if available
  title: string;
  quantity: number;
  unitPrice: number;
  tax?: number;
  discount?: number;
  total: number;
  imageUrl?: string;
  attributes?: Array<{
    name: string;
    value: string;
  }>;
}

/**
 * Order interface
 */
export interface IOrder {
  userId: string;
  organizationId: string;
  marketplaceId: string;
  marketplaceName: string;
  marketplaceOrderId: string;
  orderNumber?: string; // Human-readable order number if different from ID
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  shippingAddress: IAddress;
  billingAddress?: IAddress; // Optional, defaults to shipping address if not provided
  lineItems: IOrderLineItem[];
  currency: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  notes?: string;
  fulfillmentType?: FulfillmentType;
  orderDate: Date | Timestamp;
  processedDate?: Date | Timestamp; // When the order was processed by Fluxori
  xeroInvoiceId?: string; // Reference to Xero invoice if created
  xeroInvoiceNumber?: string; // Human-readable Xero invoice number
  xeroPushAttempted?: boolean; // Whether a push to Xero was attempted
  xeroPushDate?: Date | Timestamp; // When the Xero push was attempted
  xeroPushStatus?: 'success' | 'failed'; // Result of Xero push
  xeroPushError?: string; // Error message if Xero push failed
  trackingNumber?: string;
  trackingCompany?: string;
  trackingUrl?: string;
  estimatedDeliveryDate?: Date | Timestamp;
  shippedDate?: Date | Timestamp;
  deliveredDate?: Date | Timestamp;
  marketplaceData?: any; // Raw data from marketplace for reference
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * Order with ID field
 */
export interface IOrderWithId extends IOrder {
  id: string; // Document ID
}

/**
 * Converter for Firestore
 */
export const orderConverter = {
  toFirestore(order: IOrder): FirebaseFirestore.DocumentData {
    // Ensure timestamps are correct
    const now = Timestamp.now();
    return {
      userId: order.userId,
      organizationId: order.organizationId,
      marketplaceId: order.marketplaceId,
      marketplaceName: order.marketplaceName,
      marketplaceOrderId: order.marketplaceOrderId,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      lineItems: order.lineItems,
      currency: order.currency,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      discount: order.discount,
      total: order.total,
      notes: order.notes,
      fulfillmentType: order.fulfillmentType,
      orderDate: order.orderDate instanceof Date 
        ? Timestamp.fromDate(order.orderDate) 
        : order.orderDate || now,
      processedDate: order.processedDate instanceof Date 
        ? Timestamp.fromDate(order.processedDate) 
        : order.processedDate,
      xeroInvoiceId: order.xeroInvoiceId,
      xeroInvoiceNumber: order.xeroInvoiceNumber,
      xeroPushAttempted: order.xeroPushAttempted,
      xeroPushDate: order.xeroPushDate instanceof Date 
        ? Timestamp.fromDate(order.xeroPushDate) 
        : order.xeroPushDate,
      xeroPushStatus: order.xeroPushStatus,
      xeroPushError: order.xeroPushError,
      trackingNumber: order.trackingNumber,
      trackingCompany: order.trackingCompany,
      trackingUrl: order.trackingUrl,
      estimatedDeliveryDate: order.estimatedDeliveryDate instanceof Date 
        ? Timestamp.fromDate(order.estimatedDeliveryDate) 
        : order.estimatedDeliveryDate,
      shippedDate: order.shippedDate instanceof Date 
        ? Timestamp.fromDate(order.shippedDate) 
        : order.shippedDate,
      deliveredDate: order.deliveredDate instanceof Date 
        ? Timestamp.fromDate(order.deliveredDate) 
        : order.deliveredDate,
      marketplaceData: order.marketplaceData,
      createdAt: order.createdAt instanceof Date 
        ? Timestamp.fromDate(order.createdAt) 
        : order.createdAt || now,
      updatedAt: now
    };
  },
  
  fromFirestore(
    snapshot: FirebaseFirestore.QueryDocumentSnapshot
  ): IOrderWithId {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      organizationId: data.organizationId,
      marketplaceId: data.marketplaceId,
      marketplaceName: data.marketplaceName,
      marketplaceOrderId: data.marketplaceOrderId,
      orderNumber: data.orderNumber,
      orderStatus: data.orderStatus,
      paymentStatus: data.paymentStatus,
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      shippingAddress: data.shippingAddress,
      billingAddress: data.billingAddress,
      lineItems: data.lineItems,
      currency: data.currency,
      subtotal: data.subtotal,
      tax: data.tax,
      shipping: data.shipping,
      discount: data.discount,
      total: data.total,
      notes: data.notes,
      fulfillmentType: data.fulfillmentType,
      orderDate: data.orderDate,
      processedDate: data.processedDate,
      xeroInvoiceId: data.xeroInvoiceId,
      xeroInvoiceNumber: data.xeroInvoiceNumber,
      xeroPushAttempted: data.xeroPushAttempted,
      xeroPushDate: data.xeroPushDate,
      xeroPushStatus: data.xeroPushStatus,
      xeroPushError: data.xeroPushError,
      trackingNumber: data.trackingNumber,
      trackingCompany: data.trackingCompany,
      trackingUrl: data.trackingUrl,
      estimatedDeliveryDate: data.estimatedDeliveryDate,
      shippedDate: data.shippedDate,
      deliveredDate: data.deliveredDate,
      marketplaceData: data.marketplaceData,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    } as IOrderWithId;
  }
};