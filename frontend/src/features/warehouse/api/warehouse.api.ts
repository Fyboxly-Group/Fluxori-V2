import { apiClient } from '@/api/client';

// Define warehouse-related types
export interface Warehouse {
  _id: string;
  name: string;
  code: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  active: boolean;
  isDefault?: boolean;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseInventoryItem {
  _id: string;
  inventoryItem: {
    _id: string;
    sku: string;
    name: string;
    category: string;
    price: number;
    images?: string[];
  };
  warehouse: {
    _id: string;
    name: string;
    code: string;
    isDefault: boolean;
  };
  quantityOnHand: number;
  quantityAllocated: number;
  reorderPoint: number;
  reorderQuantity: number;
  preferredStockLevel: number;
  binLocation?: string;
  lastStockCheck?: string;
}

export interface WarehouseStats {
  name: string;
  code: string;
  totalItems: number;
  totalStockValue: number;
  lowStockItems: number;
  categoryBreakdown: {
    category: string;
    count: number;
    value: number;
    stockQuantity: number;
  }[];
}

export interface InventoryStock {
  itemId: string;
  sku: string;
  name: string;
  totalQuantity: number;
  totalAllocated: number;
  totalAvailable: number;
  stockLevels: {
    _id: string;
    inventoryItem: string;
    warehouse: {
      _id: string;
      name: string;
      code: string;
      isDefault: boolean;
    };
    quantityOnHand: number;
    quantityAllocated: number;
    reorderPoint: number;
    reorderQuantity: number;
    preferredStockLevel: number;
    binLocation?: string;
    lastStockCheck?: string;
  }[];
}

export interface InventoryTransfer {
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  quantity: number;
  notes?: string;
}

// Get all warehouses with optional filtering
export const getWarehouses = async (
  params: {
    active?: boolean;
    sort?: string;
    order?: 'asc' | 'desc';
  } = {}
) => {
  // Create query parameters
  const queryParams = new URLSearchParams();
  if (params.active !== undefined) queryParams.append('active', String(params.active));
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.order) queryParams.append('order', params.order);

  // Build the URL
  const url = `/warehouses${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  return apiClient.get<{
    success: boolean;
    count: number;
    data: Warehouse[];
  }>(url);
};

// Get warehouse by ID
export const getWarehouseById = async (id: string) => {
  return apiClient.get<{ success: boolean; data: Warehouse }>(`/warehouses/${id}`);
};

// Create a new warehouse
export const createWarehouse = async (data: Omit<Warehouse, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>) => {
  return apiClient.post<{ success: boolean; data: Warehouse }>('/warehouses', data);
};

// Update a warehouse
export const updateWarehouse = async (id: string, data: Partial<Warehouse>) => {
  return apiClient.put<{ success: boolean; data: Warehouse }>(`/warehouses/${id}`, data);
};

// Delete (deactivate) a warehouse
export const deleteWarehouse = async (id: string) => {
  return apiClient.delete<{ success: boolean; message: string; data: Warehouse }>(`/warehouses/${id}`);
};

// Get inventory in a specific warehouse
export const getWarehouseInventory = async (
  warehouseId: string,
  params: {
    lowStock?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  } = {}
) => {
  // Create query parameters
  const queryParams = new URLSearchParams();
  if (params.lowStock !== undefined) queryParams.append('lowStock', String(params.lowStock));
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());

  // Build the URL
  const url = `/warehouses/${warehouseId}/inventory${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  return apiClient.get<{
    success: boolean;
    count: number;
    total: number;
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    data: WarehouseInventoryItem[];
  }>(url);
};

// Get warehouse statistics
export const getWarehouseStats = async (warehouseId: string) => {
  return apiClient.get<{ success: boolean; data: WarehouseStats }>(`/warehouses/${warehouseId}/stats`);
};

// Get inventory stock levels for a specific item
export const getInventoryStockByItem = async (itemId: string) => {
  return apiClient.get<{ success: boolean; data: InventoryStock }>(`/inventory/${itemId}/stock`);
};

// Update inventory stock in a specific warehouse
export const updateInventoryStockInWarehouse = async (
  itemId: string,
  warehouseId: string,
  data: {
    quantityOnHand?: number;
    quantityAllocated?: number;
    reorderPoint?: number;
    reorderQuantity?: number;
    binLocation?: string;
  }
) => {
  return apiClient.put<{ 
    success: boolean; 
    message: string;
    data: {
      id: string;
      inventoryItemId: string;
      warehouseId: string;
      quantityOnHand: number;
      quantityAllocated: number;
      availableQuantity: number;
      reorderPoint: number;
      reorderQuantity: number;
      binLocation?: string;
      lastStockCheck: string;
    }
  }>(`/inventory/${itemId}/stock/${warehouseId}`, data);
};

// Transfer inventory between warehouses
export const transferInventory = async (
  itemId: string,
  transferData: InventoryTransfer
) => {
  return apiClient.post<{
    success: boolean;
    message: string;
    data: {
      inventoryItemId: string;
      sku: string;
      name: string;
      sourceWarehouse: {
        id: string;
        name: string;
        code: string;
        newQuantity: number;
      };
      destinationWarehouse: {
        id: string;
        name: string;
        code: string;
        newQuantity: number;
      };
      quantity: number;
      transferDate: string;
    }
  }>(`/inventory/${itemId}/transfer`, transferData);
};

// Get items that are below reorder point in any warehouse
export const getLowStockItemsByWarehouse = async () => {
  return apiClient.get<{
    success: boolean;
    count: number;
    data: {
      items: {
        item: {
          _id: string;
          sku: string;
          name: string;
          category: string;
          price: number;
          costPrice: number;
          supplier: string;
        };
        warehouses: {
          warehouse: {
            _id: string;
            name: string;
            code: string;
            isDefault: boolean;
          };
          quantityOnHand: number;
          quantityAllocated: number;
          availableQuantity: number;
          reorderPoint: number;
          reorderQuantity: number;
        }[];
        totalQuantity: number;
        pendingOrderQuantity: number;
        recommendedOrderQuantity: number;
      }[];
      supplierGroups: Record<string, any[]>;
    }
  }>('/inventory/low-stock/warehouse');
};