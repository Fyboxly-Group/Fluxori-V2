/// <reference path="../../types/module-declarations.d.ts" />
import { ResponsiveValue, GridTemplateColumns, LayoutDirection, ResponsiveSpacing } from '../../../utils/chakra-utils';
import { ResponsiveValue, GridTemplateColumns, LayoutDirection, ResponsiveSpacing } from '../../../utils/chakra-utils';
import React, { useState, useEffect } from 'react';
import { Box  } from '@/utils/chakra-compat';
import { Flex  } from '@/utils/chakra-compat';
import { Text  } from '@/utils/chakra-compat';
import { Button  } from '@/utils/chakra-compat';
import { Card  } from '@/utils/chakra-compat';
import { CardHeader  } from '@/utils/chakra-compat';
import { CardBody  } from '@/utils/chakra-compat';
import { CardFooter  } from '@/utils/chakra-compat';
import { HStack  } from '@/utils/chakra-compat';
import { Input  } from '@/utils/chakra-compat';
import { InputGroup  } from '@/utils/chakra-compat';
import { InputLeftElement  } from '@/utils/chakra-compat';
import { Spinner  } from '@/utils/chakra-compat';
import { Table  } from '@/utils/chakra-compat';
import { Thead  } from '@/utils/chakra-compat';
import { Tbody  } from '@/utils/chakra-compat';
import { Tr  } from '@/utils/chakra-compat';
import { Th  } from '@/utils/chakra-compat';
import { Td  } from '@/utils/chakra-compat';
import { TableContainer  } from '@/utils/chakra-compat';
import { Badge  } from '@/utils/chakra-compat';
import { IconButton  } from '@/utils/chakra-compat';
import { Tooltip  } from '@/utils/chakra-compat';
import { useColorMode } from '@/components/stubs/ChakraStubs';;
import { Search, Edit, Plus, ArrowUpDown } from 'lucide-react';
import { useWarehouse } from '../hooks/useWarehouse';


interface WarehouseInventoryProps {
  warehouseId: string;
  showFilters?: boolean;
  showSearch?: boolean;
  showPagination?: boolean;
  pageSize?: number;
  defaultSort?: string;
  defaultFilter?: Record<string, any>;
  onRowClick?: (item: any) => void;
  onRefresh?: () => void;
  isCompact?: boolean;
  maxHeight?: ResponsiveValue<string | number>;
  gridTemplateColumns?: ResponsiveValue<string>;
  gap?: ResponsiveValue<number | string>;
}

export function WarehouseInventory({ 
  warehouseId, 
  showHeader = true,
  limit
}: WarehouseInventoryProps) {
  const { colorMode } = useColorMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('sku');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const { useWarehouseInventory } = useWarehouse();
  const { 
    data: inventoryData, 
    loading, 
    error 
  } = useWarehouseInventory(warehouseId);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle sort toggle
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Filter and sort inventory items
  const filteredItems = React.useMemo((_: any) => {
    if (!inventoryData?.items) return [];
    
    // Filter items based on search query
    let items = inventoryData.items.filter(item => 
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Apply limit if specified
    if (limit && items.length > limit) {
      items = items.slice(0, limit);
    }
    
    // Sort items
    return [...items].sort((a: any, b: any) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [inventoryData?.items, searchQuery, sortField, sortDirection, limit]);
  
  if (loading) {
    return (
      <Box textAlign="center" py={6}>
        <Spinner size="xl"  />
        <Text mt={4}>Loading inventory data...</Text>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box p={4} bg="red.50" color="red.500" borderRadius="md">
        <Text>Failed to load inventory: {error.message}</Text>
      </Box>
    );
  }
  
  return (
    <Card variant="outline">
      {showHeader && (
        <CardHeader>
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontSize="lg" fontWeight="bold">Warehouse Inventory</Text>
            <Button 
              leftIcon={<Plus size={16} />}
              size="sm"
              colorScheme="blue"
            >
              Add Stock
            </Button>
          </Flex>
          <InputGroup mt={4} size="sm">
            <InputLeftElement pointerEvents="none">
              <Search size={16} color="gray.400" />
            </InputLeftElement>
            <Input 
              placeholder="Search inventory items..."
              value={searchQuery}
              onChange={handleSearchChange}
             />
          </InputGroup>
        </CardHeader>
      )}
      
      <CardBody p={0}>
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th 
                  cursor="pointer" 
                  onClick={() => handleSort('sku')}
                >
                  SKU
                  {sortField === 'sku' && (
                    <ArrowUpDown 
                      size={14} 
                      style={{ 
                        display: 'inline', 
                        marginLeft: '4px',
                        transform: sortDirection === 'desc' ? 'rotate(180deg)' : undefined
                      }} 
                    />
                  )}
                </Th>
                <Th 
                  cursor="pointer" 
                  onClick={() => handleSort('name')}
                >
                  Product
                  {sortField === 'name' && (
                    <ArrowUpDown 
                      size={14} 
                      style={{ 
                        display: 'inline', 
                        marginLeft: '4px',
                        transform: sortDirection === 'desc' ? 'rotate(180deg)' : undefined
                      }} 
                    />
                  )}
                </Th>
                <Th isNumeric>Quantity</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredItems.map((item: any) => (
                <Tr key={item.id || item._id}>
                  <Td>{item.sku}</Td>
                  <Td>{item.name}</Td>
                  <Td isNumeric>{item.quantity}</Td>
                  <Td>
                    <Badge 
                      colorScheme={item.quantity > 0 ? 'green' : 'red'}
                      fontSize="xs"
                    >
                      {item.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </Td>
                  <Td>
                    <Tooltip label="Edit Stock">
                      <IconButton
                        icon={<Edit size={16}  />}
                        size="xs"
                        variant="ghost"
                        aria-label="Edit stock"
                      />
                    </Tooltip>
                  </Td>
                </Tr>
              ))}
              
              {filteredItems.length === 0 && (
                <Tr>
                  <Td colSpan={5} textAlign="center" py={4}>
                    <Text color="gray.500">
                      {searchQuery ? 'No matching items found' : 'No inventory items available'}
                    </Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </CardBody>
      
      {showHeader && (
        <CardFooter pt={2} justifyContent="space-between">
          <Text fontSize="sm" color="gray.500">
            Showing {filteredItems.length} of {inventoryData?.items?.length || 0} items
          </Text>
          <HStack>
            <Button size="sm" variant="ghost">
              Export
            </Button>
            <Button size="sm" variant="ghost">
              Print
            </Button>
          </HStack>
        </CardFooter>
      )}
    </Card>
  );
}

export default WarehouseInventory;