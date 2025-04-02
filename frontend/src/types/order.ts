// Order status types
export type OrderStatus = 
  | 'pending' 
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'on_hold'
  | 'refunded'
  | 'partially_shipped'
  | 'awaiting_payment';

// Payment status types
export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'partially_paid'
  | 'refunded'
  | 'failed'
  | 'cancelled';

// Order item interface
export interface OrderItem {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  tax: number;
  discount: number;
  total: number;
  image_url?: string;
  variation?: Record<string, string>;
  warehouse_id?: string;
  fulfillment_status?: 'unfulfilled' | 'partially_fulfilled' | 'fulfilled' | 'on_backorder';
}

// Address interface
export interface Address {
  first_name: string;
  last_name: string;
  company?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  email?: string;
}

// Shipment tracking information
export interface ShipmentTracking {
  id: string;
  carrier: string;
  tracking_number: string;
  tracking_url?: string;
  status: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
  estimated_delivery?: Date;
  shipped_date: Date;
  items: {
    order_item_id: string;
    quantity: number;
  }[];
  origin_address?: Partial<Address>;
  destination_address?: Partial<Address>;
  events?: ShipmentEvent[];
}

// Shipment tracking event
export interface ShipmentEvent {
  id: string;
  timestamp: Date;
  location: string;
  status: string;
  description: string;
  lat?: number;
  lng?: number;
}

// Payment information
export interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  transaction_id?: string;
  status: PaymentStatus;
  date: Date;
  currency: string;
  notes?: string;
}

// Timeline event
export interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: 'order_created' | 'order_updated' | 'payment' | 'shipment' | 'note' | 'status_change' | 'customer_action';
  title: string;
  description?: string;
  user_id?: string;
  user_name?: string;
  metadata?: Record<string, any>;
}

// Document
export interface OrderDocument {
  id: string;
  type: 'invoice' | 'packing_slip' | 'customs_form' | 'receipt' | 'return_label' | 'other';
  title: string;
  file_url: string;
  created_at: Date;
  mime_type: string;
  size: number;
  preview_url?: string;
}

// Main Order interface
export interface Order {
  id: string;
  order_number: string;
  reference_number?: string;
  channel: 'web' | 'marketplace' | 'pos' | 'wholesale' | 'other';
  marketplace?: string;
  marketplace_order_id?: string;
  date_created: Date;
  date_modified: Date;
  customer: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    company?: string;
  };
  shipping_address: Address;
  billing_address: Address;
  items: OrderItem[];
  shipments: ShipmentTracking[];
  payments: Payment[];
  documents: OrderDocument[];
  timeline: TimelineEvent[];
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_items: number;
  subtotal: number;
  shipping_total: number;
  tax_total: number;
  discount_total: number;
  total: number;
  currency: string;
  notes?: string;
  tags?: string[];
  is_priority?: boolean;
  warehouse_id?: string;
  shipping_method?: string;
  shipping_provider?: string;
  metadata?: Record<string, any>;
}