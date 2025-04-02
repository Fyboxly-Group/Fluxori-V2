import api, { ApiResponse } from '../api-client';
import { PaginationParams, PaginatedResponse } from './user-management.service';

/**
 * Order model
 */
export interface Order {
  id: string;
  reference: string;
  customerId: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  status: OrderStatus;
  items: OrderItem[];
  shipping: OrderShipping;
  billing: OrderBilling;
  payment: OrderPayment;
  summary: OrderSummary;
  notes?: string[];
  metadata?: Record<string, any>;
  marketplace?: {
    id: string;
    name: string;
    orderId: string;
    url?: string;
  };
  fulfillment?: {
    method: 'self' | 'fba' | 'dropship';
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'failed';
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string;
  };
  createdAt: string;
  updatedAt: string;
  events: OrderEvent[];
  documents?: OrderDocument[];
}

/**
 * Order status
 */
export type OrderStatus = 
  | 'pending' 
  | 'processing' 
  | 'on-hold' 
  | 'completed' 
  | 'shipped' 
  | 'canceled' 
  | 'refunded' 
  | 'failed';

/**
 * Order item
 */
export interface OrderItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  price: number;
  discount?: number;
  tax?: number;
  total: number;
  metadata?: Record<string, any>;
  image?: string;
  options?: Record<string, string>;
}

/**
 * Order shipping
 */
export interface OrderShipping {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
  method: string;
  cost: number;
  tax?: number;
  instructions?: string;
}

/**
 * Order billing
 */
export interface OrderBilling {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
}

/**
 * Order payment
 */
export interface OrderPayment {
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'refunded' | 'failed';
  transactionId?: string;
  amount: number;
  currency: string;
  datePaid?: string;
  metadata?: Record<string, any>;
}

/**
 * Order summary
 */
export interface OrderSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
}

/**
 * Order event
 */
export interface OrderEvent {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  createdBy?: string;
  metadata?: Record<string, any>;
}

/**
 * Order document
 */
export interface OrderDocument {
  id: string;
  type: 'invoice' | 'receipt' | 'shipping_label' | 'packing_slip' | 'return_label' | 'other';
  name: string;
  url: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

/**
 * Shipment model
 */
export interface Shipment {
  id: string;
  orderId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'failed' | 'returned';
  trackingNumber?: string;
  carrier?: string;
  serviceType?: string;
  packages: {
    id: string;
    weight: number;
    weightUnit: 'kg' | 'lb';
    dimensions?: {
      length: number;
      width: number;
      height: number;
      unit: 'cm' | 'in';
    };
    items: { itemId: string; quantity: number }[];
    trackingNumber?: string;
  }[];
  origin: {
    name: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    email?: string;
  };
  destination: OrderShipping;
  events: {
    id: string;
    status: string;
    location?: string;
    timestamp: string;
    description?: string;
  }[];
  estimatedDelivery?: string;
  actualDelivery?: string;
  shippedAt?: string;
  createdAt: string;
  updatedAt: string;
  cost?: number;
  currency?: string;
  labelUrl?: string;
  commercialInvoiceUrl?: string;
  packingSlipUrl?: string;
}

/**
 * Order filter parameters
 */
export interface OrderFilterParams extends PaginationParams {
  search?: string;
  status?: OrderStatus | OrderStatus[];
  customer?: string;
  dateFrom?: string;
  dateTo?: string;
  marketplace?: string;
  minTotal?: number;
  maxTotal?: number;
  fulfillmentStatus?: string;
  paymentStatus?: string;
}

/**
 * Order Service
 * Handles order-related operations
 */
const OrderService = {
  /**
   * Get paginated list of orders
   */
  async getOrders(filters: OrderFilterParams = {}): Promise<PaginatedResponse<Order>> {
    const response = await api.get<PaginatedResponse<Order>>('/orders', {
      params: filters
    });
    return response.data as PaginatedResponse<Order>;
  },

  /**
   * Get an order by ID
   */
  async getOrder(id: string): Promise<Order> {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data as Order;
  },

  /**
   * Create a new order
   */
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const response = await api.post<Order>('/orders', orderData);
    return response.data as Order;
  },

  /**
   * Update an order
   */
  async updateOrder(id: string, orderData: Partial<Order>): Promise<Order> {
    const response = await api.put<Order>(`/orders/${id}`, orderData);
    return response.data as Order;
  },

  /**
   * Update order status
   */
  async updateOrderStatus(id: string, status: OrderStatus, note?: string): Promise<Order> {
    const response = await api.patch<Order>(`/orders/${id}/status`, { status, note });
    return response.data as Order;
  },

  /**
   * Delete an order (usually just marks as deleted)
   */
  async deleteOrder(id: string): Promise<ApiResponse> {
    return api.delete(`/orders/${id}`);
  },

  /**
   * Add a note to an order
   */
  async addOrderNote(id: string, note: string): Promise<Order> {
    const response = await api.post<Order>(`/orders/${id}/notes`, { note });
    return response.data as Order;
  },

  /**
   * Add an item to an order
   */
  async addOrderItem(id: string, item: Partial<OrderItem>): Promise<Order> {
    const response = await api.post<Order>(`/orders/${id}/items`, item);
    return response.data as Order;
  },

  /**
   * Update an order item
   */
  async updateOrderItem(orderId: string, itemId: string, item: Partial<OrderItem>): Promise<Order> {
    const response = await api.put<Order>(`/orders/${orderId}/items/${itemId}`, item);
    return response.data as Order;
  },

  /**
   * Remove an item from an order
   */
  async removeOrderItem(orderId: string, itemId: string): Promise<Order> {
    const response = await api.delete<Order>(`/orders/${orderId}/items/${itemId}`);
    return response.data as Order;
  },

  /**
   * Get order shipments
   */
  async getOrderShipments(orderId: string): Promise<Shipment[]> {
    const response = await api.get<Shipment[]>(`/orders/${orderId}/shipments`);
    return response.data as Shipment[];
  },

  /**
   * Get a shipment by ID
   */
  async getShipment(id: string): Promise<Shipment> {
    const response = await api.get<Shipment>(`/shipments/${id}`);
    return response.data as Shipment;
  },

  /**
   * Create a shipment for an order
   */
  async createShipment(orderId: string, shipmentData: Partial<Shipment>): Promise<Shipment> {
    const response = await api.post<Shipment>(`/orders/${orderId}/shipments`, shipmentData);
    return response.data as Shipment;
  },

  /**
   * Update a shipment
   */
  async updateShipment(id: string, shipmentData: Partial<Shipment>): Promise<Shipment> {
    const response = await api.put<Shipment>(`/shipments/${id}`, shipmentData);
    return response.data as Shipment;
  },

  /**
   * Update shipment status
   */
  async updateShipmentStatus(id: string, status: string): Promise<Shipment> {
    const response = await api.patch<Shipment>(`/shipments/${id}/status`, { status });
    return response.data as Shipment;
  },

  /**
   * Add tracking information to a shipment
   */
  async addShipmentTracking(
    id: string,
    trackingInfo: { trackingNumber: string; carrier: string; serviceType?: string }
  ): Promise<Shipment> {
    const response = await api.post<Shipment>(`/shipments/${id}/tracking`, trackingInfo);
    return response.data as Shipment;
  },

  /**
   * Generate shipping label
   */
  async generateShippingLabel(shipmentId: string): Promise<{ labelUrl: string }> {
    const response = await api.post<{ labelUrl: string }>(`/shipments/${shipmentId}/label`);
    return response.data as { labelUrl: string };
  },

  /**
   * Generate order invoice
   */
  async generateInvoice(orderId: string): Promise<{ url: string }> {
    const response = await api.post<{ url: string }>(`/orders/${orderId}/invoice`);
    return response.data as { url: string };
  },

  /**
   * Generate packing slip
   */
  async generatePackingSlip(orderId: string): Promise<{ url: string }> {
    const response = await api.post<{ url: string }>(`/orders/${orderId}/packing-slip`);
    return response.data as { url: string };
  },

  /**
   * Process a refund
   */
  async processRefund(
    orderId: string,
    refundData: {
      amount: number;
      reason: string;
      items?: { itemId: string; quantity: number }[];
      restockItems?: boolean;
    }
  ): Promise<Order> {
    const response = await api.post<Order>(`/orders/${orderId}/refund`, refundData);
    return response.data as Order;
  },

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, reason: string): Promise<Order> {
    const response = await api.post<Order>(`/orders/${orderId}/cancel`, { reason });
    return response.data as Order;
  },

  /**
   * Get order documents
   */
  async getOrderDocuments(orderId: string): Promise<OrderDocument[]> {
    const response = await api.get<OrderDocument[]>(`/orders/${orderId}/documents`);
    return response.data as OrderDocument[];
  },

  /**
   * Upload document to an order
   */
  async uploadOrderDocument(
    orderId: string,
    document: {
      type: 'invoice' | 'receipt' | 'shipping_label' | 'packing_slip' | 'return_label' | 'other';
      name: string;
      file: File;
    }
  ): Promise<OrderDocument> {
    const formData = new FormData();
    formData.append('type', document.type);
    formData.append('name', document.name);
    formData.append('file', document.file);
    
    const response = await api.post<OrderDocument>(`/orders/${orderId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data as OrderDocument;
  },

  /**
   * Delete an order document
   */
  async deleteOrderDocument(orderId: string, documentId: string): Promise<ApiResponse> {
    return api.delete(`/orders/${orderId}/documents/${documentId}`);
  },

  /**
   * Get order summary metrics
   */
  async getOrderSummary(params: {
    dateFrom?: string;
    dateTo?: string;
    marketplace?: string;
  } = {}): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    pendingOrders: number;
    processingOrders: number;
    shippedOrders: number;
    completedOrders: number;
    canceledOrders: number;
  }> {
    const response = await api.get<{
      totalOrders: number;
      totalRevenue: number;
      averageOrderValue: number;
      pendingOrders: number;
      processingOrders: number;
      shippedOrders: number;
      completedOrders: number;
      canceledOrders: number;
    }>('/orders/summary', {
      params
    });
    
    return response.data as {
      totalOrders: number;
      totalRevenue: number;
      averageOrderValue: number;
      pendingOrders: number;
      processingOrders: number;
      shippedOrders: number;
      completedOrders: number;
      canceledOrders: number;
    };
  },

  /**
   * Export orders to CSV/PDF
   */
  async exportOrders(
    format: 'csv' | 'pdf',
    filters: OrderFilterParams = {}
  ): Promise<{ url: string }> {
    const response = await api.get<{ url: string }>(`/orders/export/${format}`, {
      params: filters
    });
    
    return response.data as { url: string };
  },

  /**
   * Get shipping rates for an order
   */
  async getShippingRates(
    orderId: string,
    params: {
      destinationZip?: string;
      destinationCountry?: string;
    } = {}
  ): Promise<{
    carrier: string;
    service: string;
    rate: number;
    currency: string;
    estimatedDelivery: string;
  }[]> {
    const response = await api.get<{
      carrier: string;
      service: string;
      rate: number;
      currency: string;
      estimatedDelivery: string;
    }[]>(`/orders/${orderId}/shipping-rates`, {
      params
    });
    
    return response.data as {
      carrier: string;
      service: string;
      rate: number;
      currency: string;
      estimatedDelivery: string;
    }[];
  }
};

export default OrderService;