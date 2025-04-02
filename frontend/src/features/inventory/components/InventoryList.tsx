/// <reference path="../../../types/module-declarations.d.ts" />
'use client';

import React from 'react';
import { Tab } from '@/utils/chakra-compat';
import { useColorMode } from '@/components/stubs/ChakraStubs';;;
;;
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
;
;
;
;
;
import { Search } from 'lucide-react';
;
;

import { useInventory } from '../hooks/useInventory';
import { useEnhancedInventory } from '../hooks/useEnhancedInventory';
import { useWarehouse } from '../../warehouse/hooks/useWarehouse';

import { convertChakraProps, withAriaLabel } from '@/utils';

interface InventoryListProps {
  limit?: number;
  showFilters?: boolean;
  showPagination?: boolean;
  onItemClick?: (itemId: string) => void;
  useEnhanced?: boolean;
}

export function InventoryList({ 
  limit = 10,
  showFilters = true,
  showPagination = true,
  onItemClick,
  useEnhanced = false
}: InventoryListProps) {
  const { colorMode } = useColorMode();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [supplier, setSupplier] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  
  const { useInventoryItems } = useInventory();
  const { useEnhancedInventoryItems } = useEnhancedInventory();
  const { useWarehouses } = useWarehouse();
  
  // Fetch inventory items with filters - standard or enhanced
  const { 
    data: inventoryData, 
    loading,
    error 
  } = useEnhanced 
    ? useEnhancedInventoryItems({
        search,
        category,
        supplier,
        lowStock: showLowStock,
        page,
        limit,
        includeWarehouseCount: true
      })
    : useInventoryItems({
        search,
        category,
        supplier,
        lowStock: showLowStock,
        page,
        limit
      });
  
  // Fetch warehouses for showing warehouse count
  const { data: warehouses } = useWarehouses();
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setPage(1); // Reset to first page on filter change
  };
  
  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSupplier(e.target.value);
    setPage(1); // Reset to first page on filter change
  };
  
  const handleToggleLowStock = () => {
    setShowLowStock(!showLowStock);
    setPage(1); // Reset to first page on filter change
  };
  
  const handleItemClick = (itemId: string) => {
    if (onItemClick) {
      onItemClick(itemId);
    }
  };
  
  // Extract unique categories and suppliers for filters
  const categories = inventoryData && 'data' in inventoryData ? 
    Array.from(new Set(((inventoryData as any).data as any[]).map((item: any) => item.category))).sort() : 
    [];
  
  const suppliers = inventoryData && 'data' in inventoryData ? 
    Array.from(new Set(((inventoryData as any).data as any[]).map((item: any) => item.supplier?.name).filter(Boolean))).sort() : 
    [];
  
  if (loading) {
    return (
      <Box textAlign="center" py={6}>
        <Spinner size="lg"   />
        <Text mt={2}>Loading inventory data...</Text>
      </Box>
    );
  }
  
  if (error || !inventoryData) {
    return (
      <Box 
        p={4} 
        bg={colorMode === 'light' ? 'red.50' : 'red.900'} 
        color={colorMode === 'light' ? 'red.600' : 'red.200'} 
        borderRadius="md"
      >
        <Heading size="md" mb={2}>Error Loading Inventory</Heading>
        <Text>There was a problem loading the inventory items.</Text>
      </Box>
    );
  }
  
  const { data: items, pagination } = inventoryData as { data: any; pagination: any; };
  
  return (
    <Card variant="outline">
      {showFilters && (
        <CardHeader>
          <VStack gap={4} align="stretch">
            <HStack justify="space-between">
              <Heading size="md">Inventory</Heading>
              <HStack>
                <InputGroup size="sm" maxW="250px">
                  <InputLeftElement pointerEvents="none">
                    <Search color="gray.400" size={16} />
                  </InputLeftElement>
                  <Input
                    placeholder="Search inventory..."
                    value={search}
                    onChange={handleSearchChange}
                    />
                </InputGroup>
                <Button
                  size="sm"
                  colorScheme={showLowStock ? 'orange' : 'gray'}
                  onClick={handleToggleLowStock}
                >
                  {showLowStock ? 'All Stock' : 'Low Stock'}
                </Button>
              </HStack>
            </HStack>
            
            <HStack>
              <Select 
                placeholder="All Categories" 
                size="sm" 
                value={category}
                onChange={handleCategoryChange}
                maxW="200px"
              >
                {(categories as any[]).map((cat: string) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
              
              <Select 
                placeholder="All Suppliers" 
                size="sm" 
                value={supplier}
                onChange={handleSupplierChange}
                maxW="200px"
              >
                {(suppliers as any[]).map((sup: string) => (
                  <option key={sup} value={sup}>{sup}</option>
                ))}
              </Select>
            </HStack>
          </VStack>
        </CardHeader>
      )}
      
      <CardBody>
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Item</Th>
                <Th>Category</Th>
                <Th isNumeric>Price</Th>
                <Th isNumeric>Stock</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {items.length === 0 ? (
                <Tr>
                  <Td colSpan={5} textAlign="center" py={4}>
                    <Text>No inventory items found</Text>
                  </Td>
                </Tr>
              ) : (
                (items as any[]).map((item: any) => {
                  const isLowStock = item.stockQuantity <= item.reorderPoint;
                  const isOutOfStock = item.stockQuantity === 0;
                  
                  // Look up item in warehouse data to check multi-warehouse status
                  const warehouseCount = item.warehouseCount || 0;
                  const hasMultipleWarehouses = warehouseCount > 1;
                  
                  return (
                    <Tr 
                      key={item._id}
                      onClick={() => handleItemClick(item._id)}
                      cursor={onItemClick ? 'pointer' : 'default'}
                      _hover={{ bg: onItemClick ? (colorMode === 'light' ? 'gray.50' : 'gray.700') : undefined }}
                    >
                      <Td>
                        <HStack>
                          <VStack align="start" gap={0}>
                            <Text fontWeight="medium">{item.name}</Text>
                            <Text fontSize="xs" color="gray.500">{item.sku}</Text>
                          </VStack>
                        </HStack>
                      </Td>
                      <Td>{item.category}</Td>
                      <Td isNumeric>${item.price.toFixed(2)}</Td>
                      <Td isNumeric>
                        <Flex justifyContent="flex-end" alignItems="center">
                          <Badge
                            colorScheme={isOutOfStock ? 'red' : isLowStock ? 'orange' : 'green'}
                          >
                            {item.stockQuantity}
                          </Badge>
                          
                          {hasMultipleWarehouses && (
                            <Tooltip label={`Stocked in ${warehouseCount} warehouses`}>
                              <Badge
                                ml={2}
                                colorScheme="blue"
                                variant="outline"
                                fontSize="xs"
                              >
                                {warehouseCount}
                              </Badge>
                            </Tooltip>
                          )}
                        </Flex>
                      </Td>
                      <Td>
                        <Badge colorScheme={item.isActive ? 'green' : 'gray'}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </Td>
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </CardBody>
      
      {showPagination && pagination && pagination.totalPages > 1 && (
        <CardFooter justify="space-between" flexWrap="wrap">
          <Text fontSize="sm">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} items
          </Text>
          <HStack>
            <Button
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <Text fontSize="sm">
              Page {pagination.page} of {pagination.totalPages}
            </Text>
            <Button
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </Button>
          </HStack>
        </CardFooter>
      )}
    </Card>
  );
}

export default InventoryList;
