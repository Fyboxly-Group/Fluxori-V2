#!/usr/bin/env node

/**
 * Fix Warehouse Components
 * 
 * This script fixes warehouse-related components with TypeScript errors
 */

const fs = require('fs');
const path = require('path');

// Root directory
const ROOT_DIR = process.cwd();

// List of components to fix with their implementations
const COMPONENTS_TO_FIX = [
  {
    name: 'WarehouseStats',
    path: 'src/features/warehouse/components/WarehouseStats.tsx',
    implementation: `'use client';

import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { Heading } from '@chakra-ui/react/heading';
import { Card, CardHeader, CardBody } from '@chakra-ui/react/card';
import { Grid, GridItem } from '@chakra-ui/react/layout';
import { HStack } from '@chakra-ui/react/stack';
import { Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react/stat';
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer } from '@chakra-ui/react/table';
import { Progress } from '@chakra-ui/react/progress';
import { Spinner } from '@chakra-ui/react/spinner';
import { useColorMode } from '@chakra-ui/react/color-mode';
import { AlertTriangle } from 'lucide-react';
import { useWarehouse } from '../hooks/useWarehouse';

interface CategoryBreakdown {
  category: string;
  count: number;
  stockQuantity: number;
  value: number;
}

interface WarehouseStats {
  totalItems: number;
  totalStockValue: number;
  lowStockItems: number;
  categoryBreakdown: CategoryBreakdown[];
}

interface WarehouseStatsProps {
  warehouseId: string;
}

export function WarehouseStats({ warehouseId }: WarehouseStatsProps) {
  const { colorMode } = useColorMode();
  const { useWarehouseStats } = useWarehouse();
  const { data: stats, isLoading: loading, error } = useWarehouseStats(warehouseId);
  
  if (loading) {
    return (
      <Box textAlign="center" py={6}>
        <Spinner size="md" />
        <Text mt={2}>Loading warehouse statistics...</Text>
      </Box>
    );
  }
  
  if (error || !stats) {
    return (
      <Box
        p={4} 
        bg={colorMode === 'light' ? 'red.50' : 'red.900'} 
        color={colorMode === 'light' ? 'red.600' : 'red.200'} 
        borderRadius="md"
      >
        <Heading size="md" mb={2}>Error Loading Stats</Heading>
        <Text>There was an error loading warehouse statistics. Please try again.</Text>
      </Box>
    );
  }
  
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  // Calculate total stock quantity for percentages
  const totalStockQuantity = stats.categoryBreakdown.reduce(
    (total, category) => total + category.stockQuantity,
    0
  );
  
  return (
    <Box>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4} mb={6}>
        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Items</StatLabel>
                <StatNumber>{stats.totalItems}</StatNumber>
                <StatHelpText>Unique products in inventory</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Stock Value</StatLabel>
                <StatNumber>{formatCurrency(stats.totalStockValue)}</StatNumber>
                <StatHelpText>Based on current prices</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card bg={stats.lowStockItems > 0 ? (colorMode === 'light' ? 'orange.50' : 'orange.900') : undefined}>
            <CardBody>
              <Stat>
                <StatLabel>
                  <HStack>
                    {stats.lowStockItems > 0 && <AlertTriangle color="orange.500" size={16} />}
                    <Text>Low Stock Items</Text>
                  </HStack>
                </StatLabel>
                <StatNumber>{stats.lowStockItems}</StatNumber>
                <StatHelpText>Below reorder threshold</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
      
      <Card>
        <CardHeader>
          <Heading size="md">Category Breakdown</Heading>
        </CardHeader>
        <CardBody>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Category</Th>
                  <Th isNumeric>Items</Th>
                  <Th isNumeric>Stock Qty</Th>
                  <Th isNumeric>Value</Th>
                  <Th>Distribution</Th>
                </Tr>
              </Thead>
              <Tbody>
                {stats.categoryBreakdown.map((category: CategoryBreakdown, index) => (
                  <Tr key={index}>
                    <Td>{category.category}</Td>
                    <Td isNumeric>{category.count}</Td>
                    <Td isNumeric>{category.stockQuantity}</Td>
                    <Td isNumeric>{formatCurrency(category.value)}</Td>
                    <Td>
                      <Box w="100%">
                        <Progress
                          value={(category.stockQuantity / totalStockQuantity) * 100} 
                          size="sm"
                          colorScheme="blue"
                        />
                        <Text fontSize="xs" textAlign="right" mt={1}>
                          {Math.round((category.stockQuantity / totalStockQuantity) * 100)}%
                        </Text>
                      </Box>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    </Box>
  );
}

export default WarehouseStats;`,
  },
  {
    name: 'WarehouseStockTable',
    path: 'src/features/warehouse/components/WarehouseStockTable.tsx',
    implementation: `'use client';

import { useState } from 'react';
import { Box } from '@chakra-ui/react/box';
import { Flex } from '@chakra-ui/react/flex';
import { Text } from '@chakra-ui/react/text';
import { Button } from '@chakra-ui/react/button';
import { Input } from '@chakra-ui/react/input';
import { Select } from '@chakra-ui/react/select';
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer } from '@chakra-ui/react/table';
import { Tooltip } from '@chakra-ui/react/tooltip';
import { Badge } from '@chakra-ui/react/badge';
import { IconButton } from '@chakra-ui/react/button';
import { Spinner } from '@chakra-ui/react/spinner';
import { HStack, VStack } from '@chakra-ui/react/stack';
import { useColorMode } from '@chakra-ui/react/color-mode';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react/modal';
import { useDisclosure } from '@chakra-ui/react/hooks';
import { NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from '@chakra-ui/react/number-input';
import { FormControl, FormLabel } from '@chakra-ui/react/form-control';
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
        <Spinner size="lg" />
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
      <Flex direction={{ base: 'column', md: 'row' }} mb={4} gap={3} wrap="wrap">
        <Box flex="1" minW={{ base: '100%', md: '200px' }}>
          <Flex>
            <Input
              placeholder="Search by name or SKU"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          onChange={(e) => setCategoryFilter(e.target.value)}
          maxW={{ base: '100%', md: '200px' }}
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </Select>
        
        <Select
          placeholder="Stock Level"
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
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
              {filteredItems.map((item) => (
                <Tr key={item.id}>
                  <Td>
                    <VStack align="start" spacing={0}>
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
                        <Tooltip label={\`Below minimum level (\${item.minimumStockLevel})\`}>
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
                    <HStack spacing={1}>
                      <IconButton
                        icon={<Edit size={14} />}
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
              <VStack align="stretch" spacing={4}>
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
                    onChange={(_, value) => setAdjustmentQuantity(value)}
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
                    onChange={(e) => setAdjustmentReason(e.target.value)}
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

export default WarehouseStockTable;`,
  },
];

// Function to fix a component
function fixComponent(componentInfo) {
  console.log(`🔍 Fixing ${componentInfo.name} component...`);
  
  const filePath = path.join(ROOT_DIR, componentInfo.path);
  
  if (fs.existsSync(filePath)) {
    try {
      fs.writeFileSync(filePath, componentInfo.implementation, { mode: 0o644 });
      console.log(`✅ Fixed ${path.relative(ROOT_DIR, filePath)}`);
      return true;
    } catch (error) {
      console.error(`❌ Error writing to ${filePath}:`, error.message);
      return false;
    }
  } else {
    console.warn(`⚠️ File does not exist: ${filePath}`);
    return false;
  }
}

// Main function
function main() {
  try {
    console.log('🚀 Starting warehouse components fix script');
    
    let fixedCount = 0;
    
    for (const component of COMPONENTS_TO_FIX) {
      if (fixComponent(component)) {
        fixedCount++;
      }
    }
    
    console.log(`✅ Fixed ${fixedCount} out of ${COMPONENTS_TO_FIX.length} components`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();