/// <reference path="../../../types/module-declarations.d.ts" />
import React from 'react';
import { createToaster } from '@/utils/chakra-compat';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getWarehouseInventory,
  getWarehouseStats,
  getInventoryStockByItem,
  updateInventoryStockInWarehouse,
  transferInventory,
  getLowStockItemsByWarehouse,
  Warehouse,
  WarehouseInventoryItem,
  WarehouseStats,
  InventoryStock,
  InventoryTransfer
} from '../api/warehouse.api';

interface useWarehouseProps {}

;

// Define types for API responses and errors
interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Hook for warehouse-related operations using React Query
export const useWarehouse = () => {
  const queryClient = useQueryClient();
  const toast = createToaster();

  // Get all warehouses
  const useWarehouses = (params = {}) => {
    return useQuery({
      queryKey: ['warehouses', params],
      queryFn: () => getWarehouses(params),
      select: (response: any) => (response as any).data,
    });
  };

  // Get a warehouse by ID
  const useWarehouseById = (id: string) => {
    return useQuery({
      queryKey: ['warehouse', id],
      queryFn: () => getWarehouseById(id),
      select: (response: any) => (response as any).data,
      enabled: !!id,
    });
  };

  // Create a warehouse
  const useCreateWarehouse = () => {
    return useMutation({
      mutationFn: createWarehouse,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['warehouses'] });
        toast.show({
          title: 'Success',
          description: 'Warehouse created successfully',
          status: 'success',
        });
      },
      onError: (error: ApiError) => {
        toast.show({
          title: 'Error',
          description: error?.response?.data?.message || 'Failed to create warehouse',
          status: 'error',
        });
      },
    });
  };

  // Update a warehouse
  const useUpdateWarehouse = () => {
    return useMutation<any, Error, { id: string; data: Partial<Warehouse> }>({
      mutationFn: ({ id, data }) => updateWarehouse(id, data),
      onSuccess: (_: any, variables: any) => {
        const { id } = variables;
        queryClient.invalidateQueries({ queryKey: ['warehouses'] });
        queryClient.invalidateQueries({ queryKey: ['warehouse', id] });
        toast.show({
          title: 'Success',
          description: 'Warehouse updated successfully',
          status: 'success',
        });
      },
      onError: (error: ApiError) => {
        toast.show({
          title: 'Error',
          description: error?.response?.data?.message || 'Failed to update warehouse',
          status: 'error',
        });
      },
    });
  };

  // Delete a warehouse
  const useDeleteWarehouse = () => {
    return useMutation({
      mutationFn: deleteWarehouse,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['warehouses'] });
        toast.show({
          title: 'Success',
          description: 'Warehouse deactivated successfully',
          status: 'success',
        });
      },
      onError: (error: ApiError) => {
        toast.show({
          title: 'Error',
          description: error?.response?.data?.message || 'Failed to deactivate warehouse',
          status: 'error',
        });
      },
    });
  };

  // Get inventory in a warehouse
  const useWarehouseInventory = (warehouseId: string, params = {}) => {
    return useQuery({
      queryKey: ['warehouseInventory', warehouseId, params],
      queryFn: () => getWarehouseInventory(warehouseId, params),
      select: (response: any) => ({
        items: (response as any).data,
        pagination: response.pagination,
        total: response.total,
        count: response.count,
      }),
      enabled: !!warehouseId,
    });
  };

  // Get warehouse statistics
  const useWarehouseStats = (warehouseId: string) => {
    return useQuery({
      queryKey: ['warehouseStats', warehouseId],
      queryFn: () => getWarehouseStats(warehouseId),
      select: (response: any) => (response as any).data,
      enabled: !!warehouseId,
    });
  };

  // Get inventory stock levels for an item
  const useInventoryStock = (itemId: string) => {
    return useQuery({
      queryKey: ['inventoryStock', itemId],
      queryFn: () => getInventoryStockByItem(itemId),
      select: (response: any) => (response as any).data,
      enabled: !!itemId,
    });
  };

  // Update inventory stock in a warehouse
  const useUpdateInventoryStock = () => {
    return useMutation<
      any, 
      Error, 
      { 
        itemId: string; 
        warehouseId: string; 
        data: {
          quantityOnHand?: number;
          quantityAllocated?: number;
          reorderPoint?: number;
          reorderQuantity?: number;
          binLocation?: string;
        } 
      }
    >({
      mutationFn: ({ itemId, warehouseId, data }) => 
        updateInventoryStockInWarehouse(itemId, warehouseId, data),
      onSuccess: (_: any, variables: any) => {
        const { itemId, warehouseId } = variables;
        queryClient.invalidateQueries({ queryKey: ['inventoryStock', itemId] });
        queryClient.invalidateQueries({ queryKey: ['warehouseInventory', warehouseId] });
        queryClient.invalidateQueries({ queryKey: ['warehouseStats', warehouseId] });
        queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
        queryClient.invalidateQueries({ queryKey: ['inventoryItem', itemId] });
        queryClient.invalidateQueries({ queryKey: ['lowStockItemsByWarehouse'] });
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

  // Transfer inventory between warehouses
  const useTransferInventory = () => {
    return useMutation<any, Error, { itemId: string; transferData: InventoryTransfer }>({
      mutationFn: ({ itemId, transferData }) => 
        transferInventory(itemId, transferData),
      onSuccess: (_: any, variables: any) => {
        const { itemId, transferData } = variables;
        queryClient.invalidateQueries({ queryKey: ['inventoryStock', itemId] });
        queryClient.invalidateQueries({ queryKey: ['warehouseInventory', transferData.sourceWarehouseId] });
        queryClient.invalidateQueries({ queryKey: ['warehouseInventory', transferData.destinationWarehouseId] });
        queryClient.invalidateQueries({ queryKey: ['warehouseStats', transferData.sourceWarehouseId] });
        queryClient.invalidateQueries({ queryKey: ['warehouseStats', transferData.destinationWarehouseId] });
        queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
        queryClient.invalidateQueries({ queryKey: ['inventoryItem', itemId] });
        toast.show({
          title: 'Success',
          description: 'Inventory transferred successfully',
          status: 'success',
        });
      },
      onError: (error: ApiError) => {
        toast.show({
          title: 'Error',
          description: error?.response?.data?.message || 'Failed to transfer inventory',
          status: 'error',
        });
      },
    });
  };

  // Get low stock items by warehouse
  const useLowStockItemsByWarehouse = () => {
    return useQuery({
      queryKey: ['lowStockItemsByWarehouse'],
      queryFn: getLowStockItemsByWarehouse,
      select: (response: any) => (response as any).data,
    });
  };

  return {
    useWarehouses,
    useWarehouseById,
    useCreateWarehouse,
    useUpdateWarehouse,
    useDeleteWarehouse,
    useWarehouseInventory,
    useWarehouseStats,
    useInventoryStock,
    useUpdateInventoryStock,
    useTransferInventory,
    useLowStockItemsByWarehouse,
  };
};