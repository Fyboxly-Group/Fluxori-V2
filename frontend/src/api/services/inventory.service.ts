import api, { ApiResponse } from '../api-client';
import { PaginationParams, PaginatedResponse } from './user-management.service';

/**
 * Product model
 */
export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  cost?: number;
  stock: number;
  lowStockThreshold?: number;
  images?: ProductImage[];
  attributes?: Record<string, any>;
  status: 'active' | 'inactive' | 'archived';
  tags?: string[];
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  weight?: {
    value: number;
    unit: 'kg' | 'lb';
  };
  barcode?: string;
  createdAt: string;
  updatedAt: string;
  salesData?: {
    totalSold: number;
    lastSold?: string;
    salesVelocity?: number;
  };
  variantOf?: string;
  variants?: Product[];
  marketplaces?: ProductMarketplace[];
}

/**
 * Product image
 */
export interface ProductImage {
  id: string;
  url: string;
  isCover: boolean;
  sortOrder: number;
  alt?: string;
}

/**
 * Product marketplace
 */
export interface ProductMarketplace {
  id: string;
  marketplace: 'amazon' | 'ebay' | 'walmart' | 'shopify' | string;
  externalId: string;
  status: 'active' | 'inactive' | 'pending';
  price?: number;
  url?: string;
  lastSync?: string;
}

/**
 * Product category
 */
export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  children?: ProductCategory[];
  productCount?: number;
}

/**
 * Product supplier
 */
export interface ProductSupplier {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  leadTime?: number;
  minimumOrderQuantity?: number;
}

/**
 * Product filter parameters
 */
export interface ProductFilterParams extends PaginationParams {
  search?: string;
  category?: string;
  status?: 'active' | 'inactive' | 'archived';
  inStock?: boolean;
  lowStock?: boolean;
  priceMin?: number;
  priceMax?: number;
  tags?: string[];
  marketplace?: string;
}

/**
 * Bulk update price options
 */
export interface BulkPriceUpdateOptions {
  ids: string[];
  type: 'fixed' | 'percentage';
  value: number;
  operation: 'increase' | 'decrease' | 'set';
}

/**
 * Inventory Service
 * Handles inventory-related operations
 */
const InventoryService = {
  /**
   * Get paginated list of products
   */
  async getProducts(filters: ProductFilterParams = {}): Promise<PaginatedResponse<Product>> {
    const response = await api.get<PaginatedResponse<Product>>('/inventory/products', {
      params: filters
    });
    return response.data as PaginatedResponse<Product>;
  },

  /**
   * Get a product by ID
   */
  async getProduct(id: string): Promise<Product> {
    const response = await api.get<Product>(`/inventory/products/${id}`);
    return response.data as Product;
  },

  /**
   * Get a product by SKU
   */
  async getProductBySku(sku: string): Promise<Product> {
    const response = await api.get<Product>('/inventory/products/sku', {
      params: { sku }
    });
    return response.data as Product;
  },

  /**
   * Create a new product
   */
  async createProduct(productData: Partial<Product>): Promise<Product> {
    const response = await api.post<Product>('/inventory/products', productData);
    return response.data as Product;
  },

  /**
   * Update a product
   */
  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    const response = await api.put<Product>(`/inventory/products/${id}`, productData);
    return response.data as Product;
  },

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<ApiResponse> {
    return api.delete(`/inventory/products/${id}`);
  },

  /**
   * Bulk delete products
   */
  async bulkDeleteProducts(ids: string[]): Promise<ApiResponse> {
    return api.post('/inventory/products/bulk-delete', { ids });
  },

  /**
   * Update product stock
   */
  async updateProductStock(id: string, stock: number, reason?: string): Promise<Product> {
    const response = await api.patch<Product>(`/inventory/products/${id}/stock`, { 
      stock, 
      reason 
    });
    return response.data as Product;
  },

  /**
   * Bulk update product stock
   */
  async bulkUpdateStock(products: { id: string; stock: number }[], reason?: string): Promise<ApiResponse> {
    return api.post('/inventory/products/bulk-update-stock', { 
      products, 
      reason 
    });
  },

  /**
   * Bulk update product prices
   */
  async bulkUpdatePrices(options: BulkPriceUpdateOptions): Promise<ApiResponse> {
    return api.post('/inventory/products/bulk-update-prices', options);
  },

  /**
   * Bulk update product status
   */
  async bulkUpdateStatus(ids: string[], status: 'active' | 'inactive' | 'archived'): Promise<ApiResponse> {
    return api.post('/inventory/products/bulk-update-status', { 
      ids, 
      status 
    });
  },

  /**
   * Upload product images
   */
  async uploadProductImages(productId: string, images: File[]): Promise<ProductImage[]> {
    const formData = new FormData();
    images.forEach(image => {
      formData.append('images', image);
    });
    
    const response = await api.post<ProductImage[]>(`/inventory/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data as ProductImage[];
  },

  /**
   * Update product image metadata
   */
  async updateProductImage(
    productId: string,
    imageId: string,
    data: { isCover?: boolean; sortOrder?: number; alt?: string }
  ): Promise<ProductImage> {
    const response = await api.put<ProductImage>(`/inventory/products/${productId}/images/${imageId}`, data);
    return response.data as ProductImage;
  },

  /**
   * Delete product image
   */
  async deleteProductImage(productId: string, imageId: string): Promise<ApiResponse> {
    return api.delete(`/inventory/products/${productId}/images/${imageId}`);
  },

  /**
   * Get product categories
   */
  async getCategories(): Promise<ProductCategory[]> {
    const response = await api.get<ProductCategory[]>('/inventory/categories');
    return response.data as ProductCategory[];
  },

  /**
   * Create product category
   */
  async createCategory(data: Partial<ProductCategory>): Promise<ProductCategory> {
    const response = await api.post<ProductCategory>('/inventory/categories', data);
    return response.data as ProductCategory;
  },

  /**
   * Update product category
   */
  async updateCategory(id: string, data: Partial<ProductCategory>): Promise<ProductCategory> {
    const response = await api.put<ProductCategory>(`/inventory/categories/${id}`, data);
    return response.data as ProductCategory;
  },

  /**
   * Delete product category
   */
  async deleteCategory(id: string): Promise<ApiResponse> {
    return api.delete(`/inventory/categories/${id}`);
  },

  /**
   * Get product suppliers
   */
  async getSuppliers(): Promise<ProductSupplier[]> {
    const response = await api.get<ProductSupplier[]>('/inventory/suppliers');
    return response.data as ProductSupplier[];
  },

  /**
   * Create product supplier
   */
  async createSupplier(data: Partial<ProductSupplier>): Promise<ProductSupplier> {
    const response = await api.post<ProductSupplier>('/inventory/suppliers', data);
    return response.data as ProductSupplier;
  },

  /**
   * Update product supplier
   */
  async updateSupplier(id: string, data: Partial<ProductSupplier>): Promise<ProductSupplier> {
    const response = await api.put<ProductSupplier>(`/inventory/suppliers/${id}`, data);
    return response.data as ProductSupplier;
  },

  /**
   * Delete product supplier
   */
  async deleteSupplier(id: string): Promise<ApiResponse> {
    return api.delete(`/inventory/suppliers/${id}`);
  },

  /**
   * Get stock movement history
   */
  async getStockHistory(productId: string, params: PaginationParams = {}): Promise<PaginatedResponse<any>> {
    const response = await api.get<PaginatedResponse<any>>(`/inventory/products/${productId}/stock-history`, {
      params
    });
    return response.data as PaginatedResponse<any>;
  },

  /**
   * Import products from CSV
   */
  async importProducts(file: File): Promise<{ imported: number; errors: any[] }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<{ imported: number; errors: any[] }>('/inventory/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data as { imported: number; errors: any[] };
  },

  /**
   * Validate import file
   */
  async validateImportFile(file: File): Promise<{ valid: boolean; errors: any[] }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<{ valid: boolean; errors: any[] }>('/inventory/validate-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data as { valid: boolean; errors: any[] };
  },

  /**
   * Export products to CSV
   */
  async exportProducts(filters: ProductFilterParams = {}): Promise<{ url: string }> {
    const response = await api.get<{ url: string }>('/inventory/export', {
      params: filters
    });
    
    return response.data as { url: string };
  },

  /**
   * Create product variant
   */
  async createVariant(productId: string, variantData: Partial<Product>): Promise<Product> {
    const response = await api.post<Product>(`/inventory/products/${productId}/variants`, variantData);
    return response.data as Product;
  },

  /**
   * Get product variants
   */
  async getVariants(productId: string): Promise<Product[]> {
    const response = await api.get<Product[]>(`/inventory/products/${productId}/variants`);
    return response.data as Product[];
  },

  /**
   * Sync product with marketplace
   */
  async syncWithMarketplace(
    productId: string,
    marketplace: string,
    data?: any
  ): Promise<ProductMarketplace> {
    const response = await api.post<ProductMarketplace>(
      `/inventory/products/${productId}/marketplace/${marketplace}/sync`,
      data
    );
    return response.data as ProductMarketplace;
  },

  /**
   * Get inventory summary
   */
  async getInventorySummary(): Promise<{
    totalProducts: number;
    activeProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    productValue: number;
  }> {
    const response = await api.get<{
      totalProducts: number;
      activeProducts: number;
      lowStockProducts: number;
      outOfStockProducts: number;
      productValue: number;
    }>('/inventory/summary');
    
    return response.data as {
      totalProducts: number;
      activeProducts: number;
      lowStockProducts: number;
      outOfStockProducts: number;
      productValue: number;
    };
  }
};

export default InventoryService;