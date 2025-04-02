/// <reference path="../../../types/module-declarations.d.ts" />
'use client';

import React from 'react';
import { FormLabel } from '@/utils/chakra-compat';;;
;
;
;
;
;
;
;
import { useState, useEffect } from 'react';
;
;
;
;
;
;
;
import { useWarehouse } from '../hooks/useWarehouse';
import { Warehouse } from '../api/warehouse.api';
;

interface StockUpdateFormProps {
  inventoryItemId: string;
  warehouseId?: string;
  isNewWarehouse?: boolean;
  availableWarehouses?: Warehouse[];
  onComplete: () => void;
}

export function StockUpdateForm({
  inventoryItemId,
  warehouseId,
  isNewWarehouse = false,
  availableWarehouses = [],
  onComplete
}: StockUpdateFormProps) {
  const { useInventoryStock, useUpdateInventoryStock } = useWarehouse();
  const { data: stockData } = useInventoryStock(inventoryItemId);
  const { mutate: updateStock, isPending: isUpdating } = useUpdateInventoryStock();

  // State for form values
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(warehouseId || '');
  const [quantityOnHand, setQuantityOnHand] = useState<number>(0);
  const [quantityAllocated, setQuantityAllocated] = useState<number>(0);
  const [reorderPoint, setReorderPoint] = useState<number>(0);
  const [reorderQuantity, setReorderQuantity] = useState<number>(0);
  const [binLocation, setBinLocation] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load current values if editing existing stock
  useEffect((_: any) => {
    if (!isNewWarehouse && stockData && warehouseId) {
      const currentStock = stockData.stockLevels.find(
        (stock: any) => stock.warehouse._id === warehouseId
      );

      if (currentStock) {
        setQuantityOnHand(currentStock.quantityOnHand);
        setQuantityAllocated(currentStock.quantityAllocated);
        setReorderPoint(currentStock.reorderPoint);
        setReorderQuantity(currentStock.reorderQuantity);
        setBinLocation(currentStock.binLocation || '');
      }
    }
  }, [stockData, warehouseId, isNewWarehouse]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (isNewWarehouse && !selectedWarehouseId) {
      newErrors.warehouse = 'Please select a warehouse';
    }

    if (quantityOnHand < 0) {
      newErrors.quantityOnHand = 'Quantity must be zero or positive';
    }

    if (quantityAllocated < 0) {
      newErrors.quantityAllocated = 'Allocated quantity must be zero or positive';
    }

    if (quantityAllocated > quantityOnHand) {
      newErrors.quantityAllocated = 'Allocated quantity cannot exceed on-hand quantity';
    }

    if (reorderPoint < 0) {
      newErrors.reorderPoint = 'Reorder point must be zero or positive';
    }

    if (reorderQuantity < 0) {
      newErrors.reorderQuantity = 'Reorder quantity must be zero or positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const targetWarehouseId = isNewWarehouse ? selectedWarehouseId : warehouseId;

    if (!targetWarehouseId) {
      setErrors({ warehouse: 'Please select a warehouse' });
      return;
    }

    updateStock(
      {
        itemId: inventoryItemId,
        warehouseId: targetWarehouseId,
        data: {
          quantityOnHand,
          quantityAllocated,
          reorderPoint,
          reorderQuantity,
          binLocation: binLocation || undefined
        }
      },
      {
        onSuccess: () => {
          onComplete();
        }
      }
    );
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack gap={4} align="stretch">
        {isNewWarehouse && (
          <FormControl required invalid={!!errors.warehouse}>
            <FormLabel>Warehouse</FormLabel>
            <Select
              placeholder="Select warehouse"
              value={selectedWarehouseId}
              onChange={(e: any) => setSelectedWarehouseId(e.target.value)}
            >
              {availableWarehouses.map((warehouse: any) => (
                <option key={warehouse._id} value={warehouse._id}>
                  {warehouse.name} ({warehouse.code})
                  {warehouse.isDefault && ' - Default'}
                </option>
              ))}
            </Select>
            {errors.warehouse && (
              <Alert status="error" size="sm" mt={1}>
                <AlertIcon   />
                {errors.warehouse}
              </Alert>
            )}
          </FormControl>
        )}

        <FormControl required invalid={!!errors.quantityOnHand}>
          <FormLabel>Quantity On Hand</FormLabel>
          <Input
            type="number"
            min={0}
            value={quantityOnHand}
            onChange={(e: any) => setQuantityOnHand(Number(e.target.value))}
          />
          {errors.quantityOnHand && (
            <Alert status="error" size="sm" mt={1}>
              <AlertIcon   />
              {errors.quantityOnHand}
            </Alert>
          )}
          <Text fontSize="sm" color="gray.500">The total quantity physically in the warehouse</Text>
        </FormControl>

        <FormControl invalid={!!errors.quantityAllocated}>
          <FormLabel>Quantity Allocated</FormLabel>
          <Input
            type="number"
            min={0}
            max={quantityOnHand}
            value={quantityAllocated}
            onChange={(e: any) => setQuantityAllocated(Number(e.target.value))}
          />
          {errors.quantityAllocated && (
            <Alert status="error" size="sm" mt={1}>
              <AlertIcon   />
              {errors.quantityAllocated}
            </Alert>
          )}
          <Text fontSize="sm" color="gray.500">Quantity reserved for orders (cannot exceed on-hand quantity)</Text>
        </FormControl>

        <FormControl invalid={!!errors.reorderPoint}>
          <FormLabel>Reorder Point</FormLabel>
          <Input
            type="number"
            min={0}
            value={reorderPoint}
            onChange={(e: any) => setReorderPoint(Number(e.target.value))}
          />
          {errors.reorderPoint && (
            <Alert status="error" size="sm" mt={1}>
              <AlertIcon   />
              {errors.reorderPoint}
            </Alert>
          )}
          <Text fontSize="sm" color="gray.500">Minimum stock level before reordering</Text>
        </FormControl>

        <FormControl invalid={!!errors.reorderQuantity}>
          <FormLabel>Reorder Quantity</FormLabel>
          <Input
            type="number"
            min={0}
            value={reorderQuantity}
            onChange={(e: any) => setReorderQuantity(Number(e.target.value))}
          />
          {errors.reorderQuantity && (
            <Alert status="error" size="sm" mt={1}>
              <AlertIcon   />
              {errors.reorderQuantity}
            </Alert>
          )}
          <Text fontSize="sm" color="gray.500">Quantity to order when stock falls below reorder point</Text>
        </FormControl>

        <FormControl>
          <FormLabel>Bin Location</FormLabel>
          <Input
            placeholder="e.g., A-12-3"
            value={binLocation}
            onChange={(e: any) => setBinLocation(e.target.value)}
          />
          <Text fontSize="sm" color="gray.500">Physical location in the warehouse (optional)</Text>
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          loading={isUpdating}
          loadingText="Updating"
          mt={4}
        >
          {isNewWarehouse ? 'Add to Warehouse' : 'Update Stock'}
        </Button>
      </VStack>
    </Box>
  );
}

export default StockUpdateForm;
