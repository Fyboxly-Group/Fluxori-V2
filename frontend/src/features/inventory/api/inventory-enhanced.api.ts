import { apiClient } from '@/api/client';
import { InventoryItem } from './inventory.api';

// Enhanced inventory item with warehouse count
export interface EnhancedInventoryItem extends InventoryItem {
  warehouseCount?: number;
  warehouseData?: {
    warehouseId: string;
    warehouseName: string;
    quantityOnHand: number;
    quantityAllocated: number;
    availableQuantity: number;
  }[];
}

// Get all inventory items with filter, pagination, and warehouse information
export const getEnhancedInventoryItems = async (
  params: {
    search?: string;
    category?: string;
    supplier?: string;
    lowStock?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    includeWarehouseCount?: boolean;
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
  if (params.includeWarehouseCount !== undefined) 
    queryParams.append('includeWarehouseCount', params.includeWarehouseCount.toString());
  
  // Build the URL with query parameters
  const url = `/inventory/enhanced${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  return apiClient.get<{
    success: boolean;
    count: number;
    total: number;
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
    };
    data: EnhancedInventoryItem[];
  }>(url);
};

// Get a single inventory item with warehouse information
export const getEnhancedInventoryItem = async (id: string) => {
  return apiClient.get<{ 
    success: boolean; 
    data: EnhancedInventoryItem 
  }>(`/inventory/enhanced/${id}`);
};