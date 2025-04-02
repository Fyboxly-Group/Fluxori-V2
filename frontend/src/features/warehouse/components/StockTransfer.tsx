/// <reference path="../../../types/module-declarations.d.ts" />
'use client';

import React from 'react';
import { Divider } from '@/utils/chakra-compat';;;
;
;
;
;
;
;
;
;
;
;
import { useState } from 'react';
;
;
;
;
;
;
;
;
;
;
;
;

import { useWarehouse } from '../hooks/useWarehouse';
import { WarehouseSelector } from './WarehouseSelector';
import { InventoryStock } from '../api/warehouse.api';

import { convertChakraProps, withAriaLabel } from '@/utils';

interface StockTransferProps {
  inventoryItem: {
    _id: string;
    sku: string;
    name: string;
  };
  onTransferComplete?: () => void;
}

export function StockTransfer({ inventoryItem, onTransferComplete }: StockTransferProps) {
  const { useInventoryStock, useTransferInventory } = useWarehouse();
  
  const [sourceWarehouseId, setSourceWarehouseId] = useState('');
  const [destinationWarehouseId, setDestinationWarehouseId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  
  const { data: stockData, loading: isLoadingStock } = useInventoryStock(inventoryItem._id);
  const { mutate: transferStock, isPending: isTransferring } = useTransferInventory();
  
  // Find selected warehouses' stock info
  const getWarehouseStock = (warehouseId: string) => {
    if (!stockData || !warehouseId) return null;
    
    const stockLevel = stockData.stockLevels.find(
      (stock: any) => stock.warehouse._id === warehouseId
    );
    
    return stockLevel;
  };
  
  const sourceStock = getWarehouseStock(sourceWarehouseId);
  const destinationStock = getWarehouseStock(destinationWarehouseId);
  
  // Check if the form is valid
  const isFormValid = 
    sourceWarehouseId && 
    destinationWarehouseId && 
    sourceWarehouseId !== destinationWarehouseId && 
    quantity > 0 && 
    sourceStock && 
    sourceStock.quantityOnHand >= quantity;
  
  // Calculate new stock levels after transfer
  const getNewStockLevel = (warehouseId: string, isSource: boolean) => {
    const stockLevel = getWarehouseStock(warehouseId);
    if (!stockLevel) return '-';
    
    return isSource
      ? stockLevel.quantityOnHand - quantity
      : stockLevel.quantityOnHand + quantity;
  };
  
  // Handle transfer
  const handleTransfer = () => {
    if (!isFormValid) return;
    
    transferStock(
      {
        itemId: inventoryItem._id,
        transferData: {
          sourceWarehouseId,
          destinationWarehouseId,
          quantity,
          notes,
        },
      },
      {
        onSuccess: () => {
          // Reset form
          setQuantity(1);
          setNotes('');
          
          // Notify parent component if needed
          if (onTransferComplete) {
            onTransferComplete();
          }
        },
      }
    );
  };
  
  if (isLoadingStock) {
    return (
      <Box textAlign="center" py={4}>
        <Text>Loading stock information...</Text>
      </Box>
    );
  }
  
  if (!stockData || stockData.stockLevels.length < 2) {
    return (
      <Alert status="info">
        <AlertIcon   />
        <Text>
          This item needs to be stocked in at least two warehouses to perform transfers.
        </Text>
      </Alert>
    );
  }
  
  return (
    <Box>
      <VStack gap={4} align="stretch">
        <Card variant="outline">
          <CardHeader>
            <Heading size="md">Transfer Stock</Heading>
          </CardHeader>
          <CardBody>
            <VStack gap={4} align="stretch">
              <HStack alignItems="flex-start" gap={4}>
                <Box flex="1">
                  <WarehouseSelector
                    label="From Warehouse"
                    value={sourceWarehouseId}
                    onChange={setSourceWarehouseId}
                    required
                  />
                  {sourceStock && (
                    <Text mt={2} fontSize="sm">
                      Current stock: <strong>{sourceStock.quantityOnHand}</strong> units
                      {sourceStock.quantityAllocated > 0 && 
                        ` (${sourceStock.quantityAllocated} allocated)`}
                    </Text>
                  )}
                </Box>
                
                <Box flex="1">
                  <WarehouseSelector
                    label="To Warehouse"
                    value={destinationWarehouseId}
                    onChange={setDestinationWarehouseId}
                    required
                  />
                  {destinationStock && (
                    <Text mt={2} fontSize="sm">
                      Current stock: <strong>{destinationStock.quantityOnHand}</strong> units
                      {destinationStock.quantityAllocated > 0 && 
                        ` (${destinationStock.quantityAllocated} allocated)`}
                    </Text>
                  )}
                </Box>
              </HStack>
              
              <FormControl required>
                <FormLabel>Quantity to Transfer</FormLabel>
                <Input
                  type="number"
                  min={1}
                  max={sourceStock?.quantityOnHand || 1}
                  value={quantity}
                  onChange={(e: any) => setQuantity(Number(e.target.value))}
                />
                {sourceStock && quantity > sourceStock.quantityOnHand && (
                  <Text color="red.500" fontSize="sm">
                    Quantity exceeds available stock in source warehouse
                  </Text>
                )}
              </FormControl>
              
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={notes}
                  onChange={(e: any) => setNotes(e.target.value)}
                  placeholder="Enter reason for transfer or additional notes"
                  rows={2}
                />
              </FormControl>
              
              {sourceWarehouseId && destinationWarehouseId && sourceWarehouseId !== destinationWarehouseId && (
                <Box mt={4}>
                  <Divider mb={4}   />
                  <Heading size="sm" mb={2}>After Transfer:</Heading>
                  <HStack gap={8}>
                    <Box>
                      <Text fontSize="sm">Source warehouse: </Text>
                      <Text fontWeight="bold">
                        {getNewStockLevel(sourceWarehouseId, true)} units
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm">Destination warehouse: </Text>
                      <Text fontWeight="bold">
                        {getNewStockLevel(destinationWarehouseId, false)} units
                      </Text>
                    </Box>
                  </HStack>
                </Box>
              )}
              
              <Button
                mt={4}
                colorScheme="blue"
                onClick={handleTransfer}
                loading={isTransferring}
                disabled={!isFormValid}
              >
                Transfer Stock
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}

export default StockTransfer;
