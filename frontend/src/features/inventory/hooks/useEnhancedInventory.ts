import { useQuery } from '@tanstack/react-query';
import {
  getEnhancedInventoryItems,
  getEnhancedInventoryItem,
  EnhancedInventoryItem
} from '../api/inventory-enhanced.api';

interface useEnhancedInventoryProps {}


// Hook for enhanced inventory operations (with multi-warehouse support)
export const useEnhancedInventory = () => {
  // Get inventory items with filtering, pagination and warehouse information
  const useEnhancedInventoryItems = (params = {}) => {
    return useQuery({
      queryKey: ['enhancedInventoryItems', params],
      queryFn: () => getEnhancedInventoryItems({
        ...params,
        includeWarehouseCount: true
      }),
      select: (response: any) => ({
        data: (response as any).data,
        pagination: response.pagination,
        total: response.total,
        count: response.count
      })
    });
  };

  // Get single inventory item with warehouse information
  const useEnhancedInventoryItem = (id: string) => {
    return useQuery({
      queryKey: ['enhancedInventoryItem', id],
      queryFn: () => getEnhancedInventoryItem(id),
      select: (response: any) => (response as any).data,
      enabled: !!id,
    });
  };

  return {
    useEnhancedInventoryItems,
    useEnhancedInventoryItem
  };
};