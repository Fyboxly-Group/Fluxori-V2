/**
 * Types for the inventory feature
 */

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  status: 'In Stock' | 'Out of Stock' | 'Low Stock' | 'Discontinued';
  quantity: number;
  category: string;
  description: string;
  images: string[];
  variants: Array<{ name: string; value: string }>;
  stats: {
    views: number;
    sales: number;
    rating: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InventoryFilter {
  category?: string;
  status?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface InventoryUpdatePayload {
  name?: string;
  price?: number;
  status?: string;
  quantity?: number;
  category?: string;
  description?: string;
  variants?: Array<{ name: string; value: string }>;
}