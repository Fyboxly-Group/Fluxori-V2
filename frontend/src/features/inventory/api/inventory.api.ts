import { apiClient } from '@/api/client';

// Define the API response wrapper type
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Types for inventory item
export interface InventoryItem {
  _id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  reorderPoint: number;
  reorderQuantity: number;
  supplier: {
    _id: string;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
  };
  location?: string;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
    weight: number;
    unit: 'cm' | 'in' | 'mm';
    weightUnit: 'kg' | 'g' | 'lb' | 'oz';
  };
  barcode?: string;
  images?: string[];
  isActive: boolean;
  tags?: string[];
  variations?: {
    name: string;
    values: string[];
  }[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Type for marketplace connection
export interface MarketplaceConnection {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSynced: string;
  features: string[];
  logo?: string;
}

// Type for marketplace push options
export interface MarketplacePushOptions {
  price?: number;
  rrp?: number;
  stock?: number;
  status?: 'active' | 'inactive' | boolean;
}

// Type for marketplace push result
export interface MarketplacePushResult {
  success: boolean;
  message: string;
  details?: {
    price?: { success: boolean; message?: string };
    stock?: { success: boolean; message?: string };
    status?: { success: boolean; message?: string };
  };
}

// Get all inventory items with filter and pagination
export const getInventoryItems = async (
  params: {
    search?: string;
    category?: string;
    supplier?: string;
    lowStock?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  } = {}
) => {
  // Create a URLSearchParams object for query parameters
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.category) queryParams.append('category', params.category);
  if (params.supplier) queryParams.append('supplier', params.supplier);
  if (params.lowStock !== undefined) queryParams.append('lowStock', params.lowStock.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
  
  // Build the URL with query parameters
  const url = `/inventory${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  return apiClient.get<{
    success: boolean;
    count: number;
    total: number;
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
    };
    data: InventoryItem[];
  }>(url);
};

// Get single inventory item by ID
export const getInventoryItemById = async (id: string) => {
  return apiClient.get<{ success: boolean; data: InventoryItem }>(`/inventory/${id}`);
};

// Create new inventory item
export const createInventoryItem = async (inventoryData: Omit<InventoryItem, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>) => {
  return apiClient.post<{ success: boolean; data: InventoryItem }>('/inventory', inventoryData);
};

// Update inventory item
export const updateInventoryItem = async (id: string, inventoryData: Partial<InventoryItem>) => {
  return apiClient.put<{ success: boolean; data: InventoryItem }>(`/inventory/${id}`, inventoryData);
};

// Delete inventory item
export const deleteInventoryItem = async (id: string) => {
  return apiClient.delete<{ success: boolean; message: string }>(`/inventory/${id}`);
};

// Update inventory stock
export const updateInventoryStock = async (
  id: string,
  stockData: {
    quantity: number;
    adjustmentType: 'set' | 'add' | 'subtract';
    reason?: string;
  }
) => {
  return apiClient.put<{
    success: boolean;
    data: {
      itemId: string;
      sku: string;
      name: string;
      previousQuantity: number;
      newQuantity: number;
      adjustmentType: 'set' | 'add' | 'subtract';
      reason?: string;
    };
  }>(`/inventory/${id}/stock`, stockData);
};

// Get inventory statistics
export const getInventoryStats = async () => {
  return apiClient.get<{
    success: boolean;
    data: {
      totalItems: number;
      activeItems: number;
      lowStockItems: number;
      outOfStockItems: number;
      inventoryValue: {
        cost: number;
        retail: number;
        potentialProfit: number;
      };
      categoryBreakdown: Record<string, number>;
    };
  }>('/inventory/stats');
};

// Get low stock items
export const getLowStockItems = async () => {
  return apiClient.get<{ success: boolean; count: number; data: InventoryItem[] }>('/inventory/low-stock');
};

// Get connected marketplaces for the user
export const getConnectedMarketplaces = async () => {
  return apiClient.get<{ success: boolean; data: MarketplaceConnection[] }>('/marketplaces/connected');
};

// Push inventory item updates to a marketplace
export const pushProductToMarketplace = async (
  productId: string,
  marketplaceId: string,
  updates: MarketplacePushOptions
) => {
  return apiClient.post<MarketplacePushResult>(
    `/products/${productId}/push/${marketplaceId}`,
    updates
  );
};