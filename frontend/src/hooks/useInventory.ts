import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import InventoryService, { 
  Product, 
  ProductFilterParams, 
  ProductCategory, 
  ProductSupplier, 
  BulkPriceUpdateOptions 
} from '@/api/services/inventory.service';

/**
 * Hook for managing products
 */
export function useProducts(filters: ProductFilterParams = {}) {
  const queryClient = useQueryClient();
  
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => InventoryService.getProducts(filters)
  });
  
  const createProductMutation = useMutation({
    mutationFn: (productData: Partial<Product>) => InventoryService.createProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
  
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => 
      InventoryService.updateProduct(id, data),
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', updatedProduct.id] });
    }
  });
  
  const deleteProductMutation = useMutation({
    mutationFn: (productId: string) => InventoryService.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
  
  const bulkDeleteProductsMutation = useMutation({
    mutationFn: (productIds: string[]) => InventoryService.bulkDeleteProducts(productIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
  
  const updateStockMutation = useMutation({
    mutationFn: ({ id, stock, reason }: { id: string; stock: number; reason?: string }) => 
      InventoryService.updateProductStock(id, stock, reason),
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', updatedProduct.id] });
    }
  });
  
  const bulkUpdateStockMutation = useMutation({
    mutationFn: ({ products, reason }: { products: { id: string; stock: number }[]; reason?: string }) => 
      InventoryService.bulkUpdateStock(products, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
  
  const bulkUpdatePricesMutation = useMutation({
    mutationFn: (options: BulkPriceUpdateOptions) => InventoryService.bulkUpdatePrices(options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
  
  const bulkUpdateStatusMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: 'active' | 'inactive' | 'archived' }) => 
      InventoryService.bulkUpdateStatus(ids, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
  
  return {
    products: data?.items || [],
    totalProducts: data?.total || 0,
    pagination: {
      page: data?.page || 1,
      pageSize: data?.pageSize || 10,
      totalPages: data?.totalPages || 1
    },
    isLoading,
    error,
    refetch,
    createProduct: createProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,
    bulkDeleteProducts: bulkDeleteProductsMutation.mutateAsync,
    updateStock: updateStockMutation.mutateAsync,
    bulkUpdateStock: bulkUpdateStockMutation.mutateAsync,
    bulkUpdatePrices: bulkUpdatePricesMutation.mutateAsync,
    bulkUpdateStatus: bulkUpdateStatusMutation.mutateAsync,
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending || bulkDeleteProductsMutation.isPending,
    isUpdatingStock: updateStockMutation.isPending || bulkUpdateStockMutation.isPending,
    isUpdatingPrices: bulkUpdatePricesMutation.isPending,
    isUpdatingStatus: bulkUpdateStatusMutation.isPending
  };
}

/**
 * Hook for getting a specific product
 */
export function useProduct(productId: string) {
  const queryClient = useQueryClient();
  
  const {
    data: product,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => InventoryService.getProduct(productId),
    enabled: !!productId
  });
  
  const updateProductMutation = useMutation({
    mutationFn: (productData: Partial<Product>) => InventoryService.updateProduct(productId, productData),
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
  
  const uploadImagesMutation = useMutation({
    mutationFn: (images: File[]) => InventoryService.uploadProductImages(productId, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
    }
  });
  
  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) => InventoryService.deleteProductImage(productId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
    }
  });
  
  const updateImageMutation = useMutation({
    mutationFn: ({ imageId, data }: { 
      imageId: string; 
      data: { isCover?: boolean; sortOrder?: number; alt?: string } 
    }) => InventoryService.updateProductImage(productId, imageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
    }
  });
  
  return {
    product,
    isLoading,
    error,
    refetch,
    updateProduct: updateProductMutation.mutateAsync,
    uploadImages: uploadImagesMutation.mutateAsync,
    deleteImage: deleteImageMutation.mutateAsync,
    updateImage: updateImageMutation.mutateAsync,
    isUpdating: updateProductMutation.isPending,
    isUploadingImages: uploadImagesMutation.isPending,
    isDeletingImage: deleteImageMutation.isPending,
    isUpdatingImage: updateImageMutation.isPending
  };
}

/**
 * Hook for product categories
 */
export function useProductCategories() {
  const queryClient = useQueryClient();
  
  const {
    data: categories,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['product-categories'],
    queryFn: () => InventoryService.getCategories()
  });
  
  const createCategoryMutation = useMutation({
    mutationFn: (categoryData: Partial<ProductCategory>) => InventoryService.createCategory(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
    }
  });
  
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductCategory> }) => 
      InventoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
    }
  });
  
  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId: string) => InventoryService.deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
    }
  });
  
  return {
    categories: categories || [],
    isLoading,
    error,
    refetch,
    createCategory: createCategoryMutation.mutateAsync,
    updateCategory: updateCategoryMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,
    isCreating: createCategoryMutation.isPending,
    isUpdating: updateCategoryMutation.isPending,
    isDeleting: deleteCategoryMutation.isPending
  };
}

/**
 * Hook for product suppliers
 */
export function useProductSuppliers() {
  const queryClient = useQueryClient();
  
  const {
    data: suppliers,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['product-suppliers'],
    queryFn: () => InventoryService.getSuppliers()
  });
  
  const createSupplierMutation = useMutation({
    mutationFn: (supplierData: Partial<ProductSupplier>) => InventoryService.createSupplier(supplierData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-suppliers'] });
    }
  });
  
  const updateSupplierMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductSupplier> }) => 
      InventoryService.updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-suppliers'] });
    }
  });
  
  const deleteSupplierMutation = useMutation({
    mutationFn: (supplierId: string) => InventoryService.deleteSupplier(supplierId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-suppliers'] });
    }
  });
  
  return {
    suppliers: suppliers || [],
    isLoading,
    error,
    refetch,
    createSupplier: createSupplierMutation.mutateAsync,
    updateSupplier: updateSupplierMutation.mutateAsync,
    deleteSupplier: deleteSupplierMutation.mutateAsync,
    isCreating: createSupplierMutation.isPending,
    isUpdating: updateSupplierMutation.isPending,
    isDeleting: deleteSupplierMutation.isPending
  };
}

/**
 * Hook for product variants
 */
export function useProductVariants(productId: string) {
  const queryClient = useQueryClient();
  
  const {
    data: variants,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['product-variants', productId],
    queryFn: () => InventoryService.getVariants(productId),
    enabled: !!productId
  });
  
  const createVariantMutation = useMutation({
    mutationFn: (variantData: Partial<Product>) => InventoryService.createVariant(productId, variantData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
    }
  });
  
  return {
    variants: variants || [],
    isLoading,
    error,
    refetch,
    createVariant: createVariantMutation.mutateAsync,
    isCreating: createVariantMutation.isPending
  };
}

/**
 * Hook for inventory summary
 */
export function useInventorySummary() {
  const {
    data: summary,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['inventory-summary'],
    queryFn: () => InventoryService.getInventorySummary()
  });
  
  return {
    summary,
    isLoading,
    error,
    refetch
  };
}

/**
 * Hook for product stock history
 */
export function useProductStockHistory(productId: string, page = 1, pageSize = 10) {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['product-stock-history', productId, page, pageSize],
    queryFn: () => InventoryService.getStockHistory(productId, { page, pageSize }),
    enabled: !!productId
  });
  
  return {
    history: data?.items || [],
    pagination: {
      page: data?.page || 1,
      pageSize: data?.pageSize || 10,
      totalPages: data?.totalPages || 1,
      total: data?.total || 0
    },
    isLoading,
    error,
    refetch
  };
}

/**
 * Hook for product import/export
 */
export function useProductImportExport() {
  const queryClient = useQueryClient();
  
  const validateImportMutation = useMutation({
    mutationFn: (file: File) => InventoryService.validateImportFile(file)
  });
  
  const importProductsMutation = useMutation({
    mutationFn: (file: File) => InventoryService.importProducts(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
    }
  });
  
  const exportProductsMutation = useMutation({
    mutationFn: (filters: ProductFilterParams = {}) => InventoryService.exportProducts(filters)
  });
  
  return {
    validateImport: validateImportMutation.mutateAsync,
    importProducts: importProductsMutation.mutateAsync,
    exportProducts: exportProductsMutation.mutateAsync,
    isValidating: validateImportMutation.isPending,
    isImporting: importProductsMutation.isPending,
    isExporting: exportProductsMutation.isPending,
    validationResult: validateImportMutation.data,
    importResult: importProductsMutation.data,
    exportResult: exportProductsMutation.data,
    error: validateImportMutation.error || importProductsMutation.error || exportProductsMutation.error
  };
}

/**
 * Hook for marketplace synchronization
 */
export function useMarketplaceSync(productId: string) {
  const queryClient = useQueryClient();
  
  const syncMutation = useMutation({
    mutationFn: ({ marketplace, data }: { marketplace: string; data?: any }) => 
      InventoryService.syncWithMarketplace(productId, marketplace, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
    }
  });
  
  return {
    syncWithMarketplace: syncMutation.mutateAsync,
    isSyncing: syncMutation.isPending,
    error: syncMutation.error
  };
}