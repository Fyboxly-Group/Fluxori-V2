const fs = require('fs');
const path = require('path');

console.log('🚀 Starting WarehouseManagement fix script');

const sourceFilePath = path.resolve(__dirname, '../src/features/warehouse/components/WarehouseManagement.tsx');

// Completely rebuild the file with proper TypeScript and Chakra UI v3 patterns
const fixedContent = `'use client';

import { useState } from 'react';
import { HStack } from '@chakra-ui/react/stack';
import { VStack } from '@chakra-ui/react/stack';
import { Grid } from '@chakra-ui/react/layout';
import { GridItem } from '@chakra-ui/react/layout';
import { Card } from '@chakra-ui/react/card';
import { CardHeader } from '@chakra-ui/react/card';
import { CardBody } from '@chakra-ui/react/card';
import { Box } from '@chakra-ui/react/box';
import { Button } from '@chakra-ui/react/button';
import { Input } from '@chakra-ui/react/input';
import { InputGroup } from '@chakra-ui/react/input';
import { InputLeftElement } from '@chakra-ui/react/input';
import { Text } from '@chakra-ui/react/text';
import { Heading } from '@chakra-ui/react/heading';
import { Badge } from '@chakra-ui/react/badge';
import { IconButton } from '@chakra-ui/react/button';
import { Tooltip } from '@chakra-ui/react/tooltip';
import { Spinner } from '@chakra-ui/react/spinner';
import { Table } from '@chakra-ui/react/table';
import { Thead } from '@chakra-ui/react/table';
import { Tbody } from '@chakra-ui/react/table';
import { Tr } from '@chakra-ui/react/table';
import { Th } from '@chakra-ui/react/table';
import { Td } from '@chakra-ui/react/table';
import { TableContainer } from '@chakra-ui/react/table';
import { Tabs } from '@chakra-ui/react/tabs';
import { TabList } from '@chakra-ui/react/tabs';
import { TabPanels } from '@chakra-ui/react/tabs';
import { TabPanel } from '@chakra-ui/react/tabs';
import { Tab } from '@chakra-ui/react/tabs';
import { useColorMode } from '@/utils/chakra-compat';
import { Edit, Eye, Plus, Search, Trash } from 'lucide-react';
import { useWarehouse } from '../hooks/useWarehouse';
import { WarehouseForm } from './WarehouseForm';
import { WarehouseInventory } from './WarehouseInventory';
import { WarehouseStats } from './WarehouseStats';
import type { Warehouse } from '../api/warehouse.api';

export function WarehouseManagement() {
  const { colorMode } = useColorMode();
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { useWarehouses, useDeleteWarehouse } = useWarehouse();
  const { data: warehousesResponse, loading } = useWarehouses();
  const { mutate: deleteWarehouse, isPending: isDeleting } = useDeleteWarehouse();
  
  const handleCreateWarehouse = () => {
    setIsCreating(true);
    setSelectedWarehouseId(null);
    setIsEditing(false);
  };
  
  const handleEditWarehouse = (id: string) => {
    setSelectedWarehouseId(id);
    setIsEditing(true);
    setIsCreating(false);
  };
  
  const handleViewWarehouse = (id: string) => {
    setSelectedWarehouseId(id);
    setIsEditing(false);
    setIsCreating(false);
  };
  
  const handleDeleteWarehouse = (id: string) => {
    if (window.confirm('Are you sure you want to deactivate this warehouse?')) {
      deleteWarehouse(id, {
        onSuccess: () => {
          if (selectedWarehouseId === id) {
            setSelectedWarehouseId(null);
          }
        },
      });
    }
  };
  
  const handleFormClose = () => {
    setIsCreating(false);
    setIsEditing(false);
  };
  
  const filteredWarehouses = warehousesResponse?.data
    ? (warehousesResponse.data as Warehouse[]).filter(warehouse => 
      warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warehouse.code.toLowerCase().includes(searchQuery.toLowerCase())
    ) 
    : [];
  
  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading warehouses...</Text>
      </Box>
    );
  }
  
  return (
    <Box>
      <Grid templateColumns={{ base: '1fr', lg: '350px 1fr' }} gap={6}>
        <GridItem>
          <Card variant="outline" h="100%">
            <CardHeader>
              <HStack justifyContent="space-between">
                <Heading size="md">Warehouses</Heading>
                <Button
                  leftIcon={<Plus size={16} />}
                  colorScheme="blue"
                  size="sm"
                  onClick={handleCreateWarehouse}
                >
                  Add Warehouse
                </Button>
              </HStack>
              <InputGroup size="sm" mt={4}>
                <InputLeftElement pointerEvents="none">
                  <Search size={16} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search warehouses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </CardHeader>
            <CardBody overflowY="auto" maxH={{ base: '300px', lg: '600px' }}>
              {filteredWarehouses.length === 0 ? (
                <Text textAlign="center" py={4}>
                  {searchQuery ? 'No warehouses match your search' : 'No warehouses found'}
                </Text>
              ) : (
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Code</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredWarehouses.map((warehouse) => (
                        <Tr
                          key={warehouse._id}
                          bg={selectedWarehouseId === warehouse._id ? (
                            colorMode === 'light' ? 'blue.50' : 'blue.900'
                          ) : undefined}
                          cursor="pointer"
                          onClick={() => handleViewWarehouse(warehouse._id)}
                        >
                          <Td>
                            <HStack>
                              <Text fontWeight={warehouse.isDefault ? 'bold' : 'normal'}>
                                {warehouse.name}
                              </Text>
                              {warehouse.isDefault && (
                                <Badge colorScheme="green" size="sm">Default</Badge>
                              )}
                              {!warehouse.active && (
                                <Badge colorScheme="red" size="sm">Inactive</Badge>
                              )}
                            </HStack>
                          </Td>
                          <Td>{warehouse.code}</Td>
                          <Td>
                            <HStack gap={1}>
                              <Tooltip label="View">
                                <IconButton
                                  icon={<Eye size={16} />}
                                  size="xs"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewWarehouse(warehouse._id);
                                  }}
                                  aria-label="View warehouse"
                                />
                              </Tooltip>
                              <Tooltip label="Edit">
                                <IconButton
                                  icon={<Edit size={16} />}
                                  size="xs"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditWarehouse(warehouse._id);
                                  }}
                                  aria-label="Edit warehouse"
                                />
                              </Tooltip>
                              <Tooltip label="Delete">
                                <IconButton
                                  icon={<Trash size={16} />}
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="red"
                                  disabled={warehouse.isDefault || isDeleting}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteWarehouse(warehouse._id);
                                  }}
                                  aria-label="Delete warehouse"
                                />
                              </Tooltip>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          {isCreating ? (
            <WarehouseForm onClose={handleFormClose} />
          ) : isEditing && selectedWarehouseId ? (
            <WarehouseForm warehouseId={selectedWarehouseId} onClose={handleFormClose} />
          ) : selectedWarehouseId ? (
            <WarehouseDetail
              warehouseId={selectedWarehouseId} 
              onEdit={() => handleEditWarehouse(selectedWarehouseId)} 
            />
          ) : (
            <Box
              p={8} 
              textAlign="center"
              borderWidth="1px"
              borderRadius="lg"
              borderStyle="dashed"
              borderColor="gray.200"
            >
              <Text fontSize="lg" color="gray.500">
                Select a warehouse or create a new one
              </Text>
            </Box>
          )}
        </GridItem>
      </Grid>
    </Box>
  );
}

interface WarehouseDetailProps {
  warehouseId: string;
  onEdit: () => void;
}

function WarehouseDetail({ warehouseId, onEdit }: WarehouseDetailProps) {
  const { useWarehouseById } = useWarehouse();
  const { data: warehouse, loading } = useWarehouseById(warehouseId);
  
  if (loading || !warehouse) {
    return (
      <Box textAlign="center" py={6}>
        <Spinner size="md" />
        <Text mt={2}>Loading warehouse details...</Text>
      </Box>
    );
  }
  
  return (
    <Box>
      <Card variant="outline" mb={6}>
        <CardHeader>
          <HStack justifyContent="space-between">
            <Heading size="md">
              {warehouse.name} ({warehouse.code})
              {warehouse.isDefault && (
                <Badge ml={2} colorScheme="green">Default</Badge>
              )}
            </Heading>
            <Button rightIcon={<Edit size={16} />} size="sm" onClick={onEdit}>
              Edit
            </Button>
          </HStack>
        </CardHeader>
        <CardBody>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
            <GridItem>
              <VStack align="start" gap={3}>
                <Box>
                  <Text fontWeight="bold">Address</Text>
                  <Text>{warehouse.address.street}</Text>
                  <Text>
                    {warehouse.address.city}, {warehouse.address.state} {warehouse.address.postalCode}
                  </Text>
                  <Text>{warehouse.address.country}</Text>
                </Box>
                
                {warehouse.notes && (
                  <Box>
                    <Text fontWeight="bold">Notes</Text>
                    <Text>{warehouse.notes}</Text>
                  </Box>
                )}
              </VStack>
            </GridItem>
            
            <GridItem>
              <VStack align="start" gap={3}>
                {warehouse.contactPerson && (
                  <Box>
                    <Text fontWeight="bold">Contact Person</Text>
                    <Text>{warehouse.contactPerson}</Text>
                  </Box>
                )}
                
                {warehouse.contactEmail && (
                  <Box>
                    <Text fontWeight="bold">Email</Text>
                    <Text>{warehouse.contactEmail}</Text>
                  </Box>
                )}
                
                {warehouse.contactPhone && (
                  <Box>
                    <Text fontWeight="bold">Phone</Text>
                    <Text>{warehouse.contactPhone}</Text>
                  </Box>
                )}
              </VStack>
            </GridItem>
          </Grid>
        </CardBody>
      </Card>
      
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Inventory</Tab>
          <Tab>Statistics</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel px={0}>
            <WarehouseInventory warehouseId={warehouseId} showHeader={false} limit={10} />
          </TabPanel>
          
          <TabPanel px={0}>
            <WarehouseStats warehouseId={warehouseId} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default WarehouseManagement;`;

try {
  fs.writeFileSync(sourceFilePath, fixedContent);
  console.log('✅ Fixed src/features/warehouse/components/WarehouseManagement.tsx');
} catch (error) {
  console.error('❌ Error fixing WarehouseManagement.tsx:', error);
}

console.log('✅ All fixes applied');