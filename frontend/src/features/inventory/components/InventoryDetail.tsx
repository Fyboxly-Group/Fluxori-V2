'use client';

import { useState } from 'react';
import { Box } from '@chakra-ui/react/box';
import { Button } from '@chakra-ui/react/button';
import { Text } from '@chakra-ui/react/text';
import { Heading } from '@chakra-ui/react/heading';
import { Stack, HStack, VStack } from '@chakra-ui/react/stack';
import { Spinner } from '@chakra-ui/react/spinner';
import { Divider } from '@chakra-ui/react/divider';
import { Badge } from '@chakra-ui/react/badge';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react/tabs';
import { useColorMode } from '@chakra-ui/react/color-mode';
import { Image } from '@chakra-ui/react/image';
import { Grid, GridItem } from '@chakra-ui/react/grid';
import { Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/react/card';
import { Link } from '@chakra-ui/react/link';

import { useInventory } from '../hooks/useInventory';
import { MarketplacePush } from './MarketplacePush';

interface InventoryDetailProps {
  itemId: string;
}

export function InventoryDetail({ itemId }: InventoryDetailProps) {
  const { colorMode } = useColorMode();
  const { useInventoryItem } = useInventory();
  const { data: item, isLoading, error } = useInventoryItem(itemId);
  
  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading inventory details...</Text>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box 
        p={6} 
        bg={colorMode === 'light' ? 'red.50' : 'red.900'} 
        color={colorMode === 'light' ? 'red.500' : 'red.200'} 
        borderRadius="md"
      >
        <Heading size="md" mb={2}>Error Loading Inventory</Heading>
        <Text>There was a problem loading the inventory item: {error.message}</Text>
      </Box>
    );
  }
  
  if (!item) {
    return (
      <Box 
        p={6} 
        bg={colorMode === 'light' ? 'yellow.50' : 'yellow.900'} 
        color={colorMode === 'light' ? 'yellow.700' : 'yellow.200'} 
        borderRadius="md"
      >
        <Heading size="md" mb={2}>Inventory Not Found</Heading>
        <Text>The requested inventory item could not be found.</Text>
      </Box>
    );
  }
  
  return (
    <Box>
      <Card mb={6} variant="outline">
        <CardHeader>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Heading size="lg">{item.name}</Heading>
              <Text color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                SKU: {item.sku}
              </Text>
            </VStack>
            <Badge 
              colorScheme={item.isActive ? 'green' : 'gray'}
              fontSize="0.8em" 
              py={1} 
              px={2}
            >
              {item.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </HStack>
        </CardHeader>
        
        <CardBody pt={0}>
          <Tabs variant="enclosed">
            <TabList>
              <Tab>Details</Tab>
              <Tab>Stock</Tab>
              <Tab>Marketplaces</Tab>
            </TabList>
            
            <TabPanels>
              {/* Details Tab */}
              <TabPanel>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                  <GridItem>
                    <VStack align="start" spacing={4}>
                      <Box>
                        <Text fontWeight="bold" mb={1}>Description</Text>
                        <Text>{item.description || 'No description available'}</Text>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="bold" mb={1}>Category</Text>
                        <Text>{item.category}</Text>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="bold" mb={1}>Location</Text>
                        <Text>{item.location || 'No location specified'}</Text>
                      </Box>
                      
                      {item.barcode && (
                        <Box>
                          <Text fontWeight="bold" mb={1}>Barcode</Text>
                          <Text>{item.barcode}</Text>
                        </Box>
                      )}
                      
                      {item.tags && item.tags.length > 0 && (
                        <Box>
                          <Text fontWeight="bold" mb={1}>Tags</Text>
                          <HStack flexWrap="wrap">
                            {item.tags.map((tag, index) => (
                              <Badge key={index} colorScheme="blue" mr={2} mb={2}>
                                {tag}
                              </Badge>
                            ))}
                          </HStack>
                        </Box>
                      )}
                    </VStack>
                  </GridItem>
                  
                  <GridItem>
                    <VStack align="start" spacing={4}>
                      <Box>
                        <Text fontWeight="bold" mb={1}>Pricing</Text>
                        <HStack spacing={6}>
                          <Box>
                            <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                              Selling Price
                            </Text>
                            <Text fontSize="xl" fontWeight="bold">
                              ${item.price.toFixed(2)}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                              Cost Price
                            </Text>
                            <Text fontSize="xl">
                              ${item.costPrice.toFixed(2)}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                              Margin
                            </Text>
                            <Text fontSize="xl">
                              {(((item.price - item.costPrice) / item.price) * 100).toFixed(1)}%
                            </Text>
                          </Box>
                        </HStack>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="bold" mb={1}>Supplier</Text>
                        <Text>{item.supplier?.name || 'Not specified'}</Text>
                        {item.supplier?.contactPerson && (
                          <Text fontSize="sm">Contact: {item.supplier.contactPerson}</Text>
                        )}
                        {item.supplier?.email && (
                          <Link href={`mailto:${item.supplier.email}`} color="blue.500">
                            {item.supplier.email}
                          </Link>
                        )}
                      </Box>
                      
                      {item.dimensions && (
                        <Box>
                          <Text fontWeight="bold" mb={1}>Dimensions</Text>
                          <Text>
                            {item.dimensions.width} x {item.dimensions.height} x {item.dimensions.depth} {item.dimensions.unit}
                          </Text>
                          <Text>
                            Weight: {item.dimensions.weight} {item.dimensions.weightUnit}
                          </Text>
                        </Box>
                      )}
                      
                      {item.images && item.images.length > 0 && (
                        <Box>
                          <Text fontWeight="bold" mb={1}>Images</Text>
                          <HStack>
                            {item.images.map((image, index) => (
                              <Box key={index} boxSize="100px" borderRadius="md" overflow="hidden">
                                <Image src={image} alt={`${item.name} - ${index + 1}`} />
                              </Box>
                            ))}
                          </HStack>
                        </Box>
                      )}
                    </VStack>
                  </GridItem>
                </Grid>
              </TabPanel>
              
              {/* Stock Tab */}
              <TabPanel>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                  <GridItem>
                    <Card variant="filled" p={4}>
                      <HStack justify="space-between" mb={2}>
                        <Text fontWeight="bold">Current Stock</Text>
                        <Badge 
                          colorScheme={item.stockQuantity <= item.reorderPoint ? 'red' : 'green'}
                          fontSize="0.8em" 
                          py={1} 
                          px={2}
                        >
                          {item.stockQuantity <= 0 ? 'Out of Stock' : 
                           item.stockQuantity <= item.reorderPoint ? 'Low Stock' : 'In Stock'}
                        </Badge>
                      </HStack>
                      <Text fontSize="3xl" fontWeight="bold">{item.stockQuantity}</Text>
                      <HStack justify="space-between" mt={2}>
                        <Text fontSize="sm">Reorder Point: {item.reorderPoint}</Text>
                        <Text fontSize="sm">Reorder Quantity: {item.reorderQuantity}</Text>
                      </HStack>
                    </Card>
                  </GridItem>
                  
                  <GridItem>
                    <VStack align="start" spacing={4}>
                      <Box w="full">
                        <Text fontWeight="bold" mb={2}>Stock Actions</Text>
                        <HStack spacing={4}>
                          <Button colorScheme="blue" size="sm" w="full">
                            Add Stock
                          </Button>
                          <Button colorScheme="orange" size="sm" w="full">
                            Remove Stock
                          </Button>
                          <Button colorScheme="purple" size="sm" w="full">
                            Set Stock
                          </Button>
                        </HStack>
                      </Box>
                      
                      <Box w="full" mt={4}>
                        <Text fontWeight="bold" mb={2}>Inventory Tracking</Text>
                        <Text>Last Updated: {new Date(item.updatedAt).toLocaleString()}</Text>
                      </Box>
                    </VStack>
                  </GridItem>
                </Grid>
              </TabPanel>
              
              {/* Marketplaces Tab */}
              <TabPanel>
                <MarketplacePush inventoryItem={item} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </Box>
  );
}