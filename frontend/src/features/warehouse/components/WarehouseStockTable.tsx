/// <reference path="../../types/module-declarations.d.ts" />
'use client';

import React from 'react';
import { useState } from 'react';
import { Box  } from '@/utils/chakra-compat';
import { Flex  } from '@/utils/chakra-compat';
import { Text  } from '@/utils/chakra-compat';
import { Button  } from '@/utils/chakra-compat';
import { Input  } from '@/utils/chakra-compat';
import { Select  } from '@/utils/chakra-compat';
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer  } from '@/utils/chakra-compat';
import { Tooltip  } from '@/utils/chakra-compat';
import { Badge  } from '@/utils/chakra-compat';
import { IconButton  } from '@/utils/chakra-compat';
import { Spinner  } from '@/utils/chakra-compat';
import { HStack, VStack  } from '@/utils/chakra-compat';
import { useColorMode } from '@/components/stubs/ChakraStubs';;
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@/components/stubs/ChakraStubs';;
import { useDisclosure } from '@/components/stubs/ChakraStubs';;
import { NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper  } from '@/utils/chakra-compat';
import { FormControl, FormLabel  } from '@/utils/chakra-compat';
import { Search, Edit, Plus, Minus, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { useWarehouse } from '../hooks/useWarehouse';


interface StockItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  stockQuantity: number;
  minimumStockLevel: number;
  unitPrice: number;
  location?: string;
}

interface WarehouseStockTableProps {
  warehouseId: string;
  onEditItem?: (item: StockItem) => void;
}

export function WarehouseStockTable({ warehouseId, onEditItem }: WarehouseStockTableProps) {
  const { colorMode } = useColorMode();
  const { useWarehouseStock, updateStockQuantity } = useWarehouse();
  const { data: stockItems, isLoading, error, refetch } = useWarehouseStock(warehouseId);
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  
  // State for stock adjustment modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handler for opening stock adjustment modal
  const handleAdjustStock = (item: StockItem) => {
    setSelectedItem(item);
    setAdjustmentQuantity(0);
    setAdjustmentReason('');
    onOpen();
  };
  
  // Submit stock adjustment
  const handleSubmitAdjustment = async () => {
    if (!selectedItem || !adjustmentReason) return;
    
    try {
      setIsSubmitting(true);
      
      await updateStockQuantity({
        warehouseId,
        productId: selectedItem.id,
        adjustment: adjustmentQuantity,
        reason: adjustmentReason
      });
      
      // Refresh stock data
      refetch();
      
      // Close modal
      onClose();
      
      // Show success message
      // toast.success('Stock updated successfully');
    } catch (err) {
      console.error('Failed to update stock:', err);
      // toast.error('Failed to update stock');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  // Get unique categories for filter
  const categories = stockItems 
    ? [...new Set(stockItems.map(item => item.category))].sort() 
    : [];
  
  // Filter stock items
  const filteredItems = stockItems 
    ? stockItems.filter(item => {
        // Search filter
        const matchesSearch = searchTerm 
          ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase())
          : true;
          
        // Category filter
        const matchesCategory = categoryFilter 
          ? item.category === categoryFilter
          : true;
          
        // Stock level filter
        let matchesStockLevel = true;
        if (stockFilter === 'low') {
          matchesStockLevel = item.stockQuantity <= item.minimumStockLevel;
        } else if (stockFilter === 'out') {
          matchesStockLevel = item.stockQuantity === 0;
        }
        
        return matchesSearch && matchesCategory && matchesStockLevel;
      })
    : [];
  
  // Loading state
  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="lg"  />
      </Flex>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Box p={4} bg={colorMode === 'light' ? 'red.50' : 'red.900'} color={colorMode === 'light' ? 'red.600' : 'red.200'} borderRadius="md">
        <Flex align="center" mb={2}>
          <AlertTriangle size={20} style={{ marginRight: '8px' }} />
          <Text fontWeight="bold">Error Loading Stock</Text>
        </Flex>
        <Text>There was an error loading warehouse stock. Please try again.</Text>
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Filters */}
      <Flex direction={{ base: 'column', md: 'row' } as ResponsiveValue<string>} mb={4} gap={3} wrap="wrap">
        <Box flex="1" minW={{ base: '100%', md: '200px' }}>
          <Flex>
            <Input
              placeholder="Search by name or SKU"
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              pr="8"
            />
            <Box ml="-8" zIndex="1" pointerEvents="none">
              <Search size={16} opacity={0.5} />
            </Box>
          </Flex>
        </Box>
        
        <Select
          placeholder="All Categories"
          value={categoryFilter}
          onChange={(e: any) => setCategoryFilter(e.target.value)}
          maxW={{ base: '100%', md: '200px' }}
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </Select>
        
        <Select
          placeholder="Stock Level"
          value={stockFilter}
          onChange={(e: any) => setStockFilter(e.target.value)}
          maxW={{ base: '100%', md: '150px' }}
        >
          <option value="all">All Items</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </Select>
        
        <Button
          leftIcon={<ChevronDown size={16} />}
          variant="outline"
          onClick={() => refetch()}
          ml={{ base: 0, md: 'auto' }}
        >
          Refresh
        </Button>
      </Flex>
      
      {/* Stock table */}
      {filteredItems.length === 0 ? (
        <Box textAlign="center" py={6} px={4} bg={colorMode === 'light' ? 'gray.50' : 'gray.700'} borderRadius="md">
          <Text>No stock items found.</Text>
          <Text fontSize="sm" color="gray.500" mt={1}>
            {searchTerm || categoryFilter || stockFilter !== 'all' 
              ? 'Try adjusting your filters'
              : 'Add inventory items to get started'}
          </Text>
        </Box>
      ) : (
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Product</Th>
                <Th>Category</Th>
                <Th isNumeric>Stock</Th>
                <Th isNumeric>Unit Price</Th>
                <Th isNumeric>Value</Th>
                <Th>Location</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredItems.map((item: any) => (
                <Tr key={item.id}>
                  <Td>
                    <VStack align="start" gap={0}>
                      <Text fontWeight="medium">{item.name}</Text>
                      <Text fontSize="xs" color="gray.500">SKU: {item.sku}</Text>
                    </VStack>
                  </Td>
                  <Td>{item.category}</Td>
                  <Td isNumeric>
                    <Flex justify="flex-end" align="center">
                      {item.stockQuantity === 0 ? (
                        <Badge colorScheme="red">Out of stock</Badge>
                      ) : item.stockQuantity <= item.minimumStockLevel ? (
                        <Tooltip label={`Below minimum level (${item.minimumStockLevel})`}>
                          <Badge colorScheme="orange">{item.stockQuantity}</Badge>
                        </Tooltip>
                      ) : (
                        <Text>{item.stockQuantity}</Text>
                      )}
                    </Flex>
                  </Td>
                  <Td isNumeric>{formatCurrency(item.unitPrice)}</Td>
                  <Td isNumeric>{formatCurrency(item.stockQuantity * item.unitPrice)}</Td>
                  <Td>{item.location || '—'}</Td>
                  <Td>
                    <HStack gap={1}>
                      <IconButton
                        icon={<Edit size={14}  />}
                        aria-label="Edit item"
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditItem && onEditItem(item)}
                      />
                      <IconButton
                        icon={item.stockQuantity > 0 ? <Minus size={14} /> : <Plus size={14} />}
                        aria-label="Adjust stock"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAdjustStock(item)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
      
      {/* Stock adjustment modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Adjust Stock Quantity</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            {selectedItem && (
              <VStack align="stretch" gap={4}>
                <Text>
                  Current stock for <strong>{selectedItem.name}</strong>: 
                  <Badge ml={2} colorScheme={selectedItem.stockQuantity <= selectedItem.minimumStockLevel ? 'orange' : 'green'}>
                    {selectedItem.stockQuantity}
                  </Badge>
                </Text>
                
                <FormControl>
                  <FormLabel>Adjustment</FormLabel>
                  <NumberInput
                    value={adjustmentQuantity}
                    onChange={(_: any, value: any) => setAdjustmentQuantity(value)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Use positive numbers to add stock, negative to remove
                  </Text>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Reason</FormLabel>
                  <Select
                    value={adjustmentReason}
                    onChange={(e: any) => setAdjustmentReason(e.target.value)}
                    placeholder="Select reason"
                  >
                    <option value="purchase">New purchase</option>
                    <option value="sale">Sale</option>
                    <option value="return">Customer return</option>
                    <option value="damaged">Damaged inventory</option>
                    <option value="correction">Inventory correction</option>
                    <option value="transfer">Warehouse transfer</option>
                  </Select>
                </FormControl>
                
                <Text fontSize="sm" fontWeight="bold">
                  New stock quantity will be: {selectedItem.stockQuantity + adjustmentQuantity}
                </Text>
              </VStack>
            )}
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSubmitAdjustment}
              loading={isSubmitting}
              disabled={!adjustmentReason || adjustmentQuantity === 0 || isSubmitting}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default WarehouseStockTable;