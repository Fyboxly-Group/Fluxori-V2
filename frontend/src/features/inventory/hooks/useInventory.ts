import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateInventoryStock,
  getInventoryStats,
  getLowStockItems,
  getConnectedMarketplaces,
  pushProductToMarketplace,
  InventoryItem,
  MarketplacePushOptions
} from '../api/inventory.api';
import { createToaster } from '@/utils/chakra-compat';

interface useInventoryProps {}
;

// Define types for API responses and errors
interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface InventoryResponse {
  success: boolean;
  count?: number;
  total?: number;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
  };
  data: InventoryItem[] | InventoryItem;
}

interface InventoryStatsResponse {
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
}

interface MarketplacePushResponse {
  success: boolean;
  message: string;
  data: {
    success: boolean;
    message: string;
  };
}

// Hook for inventory-related operations using React Query
export const useInventory = () => {
  const queryClient = useQueryClient();
  const toast = createToaster();

  // Get inventory items with filtering and pagination
  const useInventoryItems = (params = {}) => {
    return useQuery({
      queryKey: ['inventoryItems', params],
      queryFn: () => getInventoryItems(params),
      select: (data: InventoryResponse) => data.data as InventoryItem[],
    });
  };

  // Get single inventory item by ID
  const useInventoryItem = (id: string) => {
    return useQuery({
      queryKey: ['inventoryItem', id],
      queryFn: async () => {
        const response = await getInventoryItemById(id);
        // Transform the response to match the expected type structure
        return { 
          data: { 
            data: response.data 
          } 
        };
      },
      select: (data: { data: { data: InventoryItem } }) => data.data.data,
      enabled: !!id,
    });
  };

  // Create inventory item mutation
  const useCreateInventoryItem = () => {
    return useMutation({
      mutationFn: createInventoryItem,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
        toast.show({
          title: 'Success',
          description: 'Inventory item created successfully',
          status: 'success',
        });
      },
      onError: (error: ApiError) => {
        toast.show({
          title: 'Error',
          description: error?.response?.data?.message || 'Failed to create inventory item',
          status: 'error',
        });
      },
    });
  };

  // Update inventory item mutation
  const useUpdateInventoryItem = () => {
    return useMutation<any, Error, { id: string; data: Partial<InventoryItem> }>({
      mutationFn: ({ id, data }) =>
        updateInventoryItem(id, data),
      onSuccess: (_: any, variables: any) => {
        const { id } = variables;
        queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
        queryClient.invalidateQueries({ queryKey: ['inventoryItem', id] });
        toast.show({
          title: 'Success',
          description: 'Inventory item updated successfully',
          status: 'success',
        });
      },
      onError: (error: ApiError) => {
        toast.show({
          title: 'Error',
          description: error?.response?.data?.message || 'Failed to update inventory item',
          status: 'error',
        });
      },
    });
  };

  // Delete inventory item mutation
  const useDeleteInventoryItem = () => {
    return useMutation({
      mutationFn: deleteInventoryItem,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
        toast.show({
          title: 'Success',
          description: 'Inventory item deleted successfully',
          status: 'success',
        });
      },
      onError: (error: ApiError) => {
        toast.show({
          title: 'Error',
          description: error?.response?.data?.message || 'Failed to delete inventory item',
          status: 'error',
        });
      },
    });
  };

  // Update inventory stock mutation
  const useUpdateInventoryStock = () => {
    return useMutation<any, Error, { id: string; data: { quantity: number; adjustmentType: 'set' | 'add' | 'subtract'; reason?: string } }>({
      mutationFn: ({ id, data }) =>
        updateInventoryStock(id, data),
      onSuccess: (_: any, variables: any) => {
        const { id } = variables;
        queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
        queryClient.invalidateQueries({ queryKey: ['inventoryItem', id] });
        queryClient.invalidateQueries({ queryKey: ['inventoryStats'] });
        toast.show({
          title: 'Success',
          description: 'Inventory stock updated successfully',
          status: 'success',
        });
      },
      onError: (error: ApiError) => {
        toast.show({
          title: 'Error',
          description: error?.response?.data?.message || 'Failed to update inventory stock',
          status: 'error',
        });
      },
    });
  };

  // Get inventory statistics
  const useInventoryStats = () => {
    return useQuery({
      queryKey: ['inventoryStats'],
      queryFn: async () => {
        const response = await getInventoryStats();
        // Transform the response to match the expected type structure
        return { 
          data: response
        };
      },
      select: (data: { data: InventoryStatsResponse }) => data.data.data,
    });
  };

  // Get low stock items
  const useLowStockItems = () => {
    return useQuery({
      queryKey: ['lowStockItems'],
      queryFn: async () => {
        const response = await getLowStockItems();
        // Transform the response to match the expected type structure
        return { 
          data: { 
            data: response.data 
          } 
        };
      },
      select: (data: { data: { data: InventoryItem[] } }) => data.data.data,
    });
  };

  // Get connected marketplaces
  const useConnectedMarketplaces = () => {
    return useQuery({
      queryKey: ['connectedMarketplaces'],
      queryFn: async () => {
        const response = await getConnectedMarketplaces();
        // Transform the response to match the expected type structure
        return { 
          data: { 
            data: response.data 
          } 
        };
      },
      select: (data: { data: { data: any[] } }) => data.data.data,
    });
  };

  // Push product to marketplace mutation
  const usePushToMarketplace = () => {
    return useMutation<any, Error, { productId: string; marketplaceId: string; updates: MarketplacePushOptions }>({
      mutationFn: ({ productId, marketplaceId, updates }) => 
        pushProductToMarketplace(productId, marketplaceId, updates),
      onSuccess: (result: any, variables: any) => {
        const { marketplaceId } = variables;
        // Show overall success or partial success message
        if (result.success) {
          toast.show({
            title: `${marketplaceId.charAt(0).toUpperCase() + marketplaceId.slice(1)} Update`,
            description: result.message || 'Successfully updated',
            status: 'success',
          });
        } else {
          toast.show({
            title: `${marketplaceId.charAt(0).toUpperCase() + marketplaceId.slice(1)} Update`,
            description: result.message || 'Update completed with warnings',
            status: 'warning',
          });
        }
      },
      onError: (error: ApiError, { marketplaceId }: { marketplaceId: string }) => {
        toast.show({
          title: 'Error',
          description: `Failed to push updates to ${marketplaceId}: ${error?.response?.data?.message || 'Unknown error'}`,
          status: 'error',
        });
      },
    });
  };

  return {
    useInventoryItems,
    useInventoryItem,
    useCreateInventoryItem,
    useUpdateInventoryItem,
    useDeleteInventoryItem,
    useUpdateInventoryStock,
    useInventoryStats,
    useLowStockItems,
    useConnectedMarketplaces,
    usePushToMarketplace,
  };
};