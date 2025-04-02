/// <reference path="../../types/module-declarations.d.ts" />
'use client';

import React from 'react';
import { useState } from 'react';
import { Box  } from '@/utils/chakra-compat';
import { Flex  } from '@/utils/chakra-compat';
import { Text  } from '@/utils/chakra-compat';
import { Button  } from '@/utils/chakra-compat';
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer  } from '@/utils/chakra-compat';
import { Checkbox  } from '@/utils/chakra-compat';
import { Badge  } from '@/utils/chakra-compat';
import { Spinner  } from '@/utils/chakra-compat';
import { HStack, VStack  } from '@/utils/chakra-compat';
import { Divider  } from '@/utils/chakra-compat';
import { Select  } from '@/utils/chakra-compat';
import { Card, CardHeader, CardBody, CardFooter  } from '@/utils/chakra-compat';
import { Tooltip  } from '@/utils/chakra-compat';
import { Input  } from '@/utils/chakra-compat';
import { NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper  } from '@/utils/chakra-compat';
import { useColorMode } from '@/components/stubs/ChakraStubs';;
import { AlertCircle, Check, ShoppingCart, Share2, Filter, Search, AlertTriangle } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { useConnections } from '../../connections/hooks/useConnections';
import { ResponsiveValue } from '../../../utils/chakra-utils';
import { Card  } from '@/utils/chakra-compat';
import { CardBody  } from '@/utils/chakra-compat';
import { VStack  } from '@/utils/chakra-compat';
import { CardHeader  } from '@/utils/chakra-compat';
import { Table  } from '@/utils/chakra-compat';
import { Thead  } from '@/utils/chakra-compat';
import { Tr  } from '@/utils/chakra-compat';
import { Th  } from '@/utils/chakra-compat';
import { Tbody  } from '@/utils/chakra-compat';
import { Td  } from '@/utils/chakra-compat';
import { CardFooter  } from '@/utils/chakra-compat';
import { HStack  } from '@/utils/chakra-compat';

interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  currentInventory: number;
  category: string;
  status: 'active' | 'inactive' | 'draft';
  listedMarketplaces: string[];
}

interface MarketplacePushProps {
  initialSelectedProducts?: string[];
  onComplete?: () => void;
  minW?: ResponsiveValue<any>;
  maxW?: ResponsiveValue<any>;
}

export function MarketplacePush({
  initialSelectedProducts = [],
  onComplete
}: MarketplacePushProps) {
  const { colorMode } = useColorMode();
  const { useProducts } = useInventory();
  const { useMarketplaceConnections, pushToMarketplace } = useConnections();
  
  // Get products and marketplace connections
  const { data: products, isLoading: productsLoading, error: productsError } = useProducts();
  const { data: marketplaces, isLoading: marketplacesLoading, error: marketplacesError } = useMarketplaceConnections();
  
  // State for selected products and marketplace
  const [selectedProducts, setSelectedProducts] = useState<string[]>(initialSelectedProducts);
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // State for quantity adjustments
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [prices, setPrices] = useState<Record<string, number>>({});
  
  // Push state
  const [isPushing, setIsPushing] = useState(false);
  const [pushResults, setPushResults] = useState<{
    success: string[];
    failed: string[];
    message?: string;
  } | null>(null);
  
  // Calculate initial quantities and prices
  useState((_: any) => {
    if (products) {
      const initialQuantities: Record<string, number> = {};
      const initialPrices: Record<string, number> = {};
      
      products.forEach(product => {
        initialQuantities[product.id] = product.currentInventory;
        initialPrices[product.id] = product.price;
      });
      
      setQuantities(initialQuantities);
      setPrices(initialPrices);
    }
  });
  
  // Filter products
  const filteredProducts = products 
    ? products.filter(product => {
        // Search filter
        const matchesSearch = searchTerm 
          ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase())
          : true;
          
        // Category filter
        const matchesCategory = categoryFilter
          ? product.category === categoryFilter
          : true;
          
        // Status filter
        const matchesStatus = statusFilter
          ? product.status === statusFilter
          : true;
        
        return matchesSearch && matchesCategory && matchesStatus;
      })
    : [];
  
  // Get unique categories for filtering
  const categories = products 
    ? [...new Set(products.map(product => product.category))].sort()
    : [];
  
  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map(product => product.id));
    } else {
      setSelectedProducts([]);
    }
  };
  
  // Handle individual product selection
  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };
  
  // Handle quantity change
  const handleQuantityChange = (productId: string, value: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: value
    }));
  };
  
  // Handle price change
  const handlePriceChange = (productId: string, value: number) => {
    setPrices(prev => ({
      ...prev,
      [productId]: value
    }));
  };
  
  // Handle push to marketplace
  const handlePushToMarketplace = async () => {
    if (!selectedMarketplace || selectedProducts.length === 0) {
      return;
    }
    
    try {
      setIsPushing(true);
      setPushResults(null);
      
      // Prepare push data
      const pushData = selectedProducts.map(productId => {
        const product = products?.find(p => p.id === productId);
        return {
          productId,
          sku: product?.sku || '',
          name: product?.name || '',
          price: prices[productId] || 0,
          quantity: quantities[productId] || 0
        };
      });
      
      // Call API to push products
      const result = await pushToMarketplace(selectedMarketplace, pushData);
      
      // Set push results
      setPushResults({
        success: result.success || [],
        failed: result.failed || [],
        message: result.message
      });
      
      // Call onComplete callback if all products were pushed successfully
      if (result.success?.length === selectedProducts.length && onComplete) {
        // Small delay to show success message before completing
        setTimeout(onComplete, 2000);
      }
    } catch (error) {
      console.error('Error pushing products to marketplace:', error);
      setPushResults({
        success: [],
        failed: selectedProducts,
        message: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsPushing(false);
    }
  };
  
  // Show loading state
  if (productsLoading || marketplacesLoading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl"  />
        <Text mt={4}>Loading...</Text>
      </Box>
    );
  }
  
  // Show error state
  if (productsError || marketplacesError) {
    return (
      <Box p={4} bg={colorMode === 'light' ? 'red.50' : 'red.900'} color={colorMode === 'light' ? 'red.600' : 'red.200'} borderRadius="md">
        <Flex align="center" mb={2}>
          <AlertTriangle size={20} style={{ marginRight: '8px' }} />
          <Text fontWeight="bold">Error Loading Data</Text>
        </Flex>
        <Text>
          {productsError ? 'Failed to load products.' : 'Failed to load marketplace connections.'}
          Please try again.
        </Text>
      </Box>
    );
  }
  
  // No marketplaces connected
  if (!marketplaces || marketplaces.length === 0) {
    return (
      <Card>
        <CardBody>
          <VStack gap={4} py={6} align="center">
            <AlertCircle size={48} color={colorMode === 'light' ? '#3182CE' : '#63B3ED'} />
            <Text fontSize="lg" fontWeight="bold">No Marketplace Connections</Text>
            <Text textAlign="center">
              You need to connect to at least one marketplace before you can push products.
            </Text>
            <Button colorScheme="blue" leftIcon={<Share2 size={16} />}>
              Set Up Marketplace Connection
            </Button>
          </VStack>
        </CardBody>
      </Card>
    );
  }
  
  // No products available
  if (!products || products.length === 0) {
    return (
      <Card>
        <CardBody>
          <VStack gap={4} py={6} align="center">
            <ShoppingCart size={48} color={colorMode === 'light' ? '#3182CE' : '#63B3ED'} />
            <Text fontSize="lg" fontWeight="bold">No Products Found</Text>
            <Text textAlign="center">
              You need to add products to your inventory before you can push them to marketplaces.
            </Text>
            <Button colorScheme="blue">
              Add Products
            </Button>
          </VStack>
        </CardBody>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <Text fontSize="xl" fontWeight="bold">Push Products to Marketplace</Text>
          
          <Select
            placeholder="Select Marketplace"
            value={selectedMarketplace}
            onChange={(e: any) => setSelectedMarketplace(e.target.value)}
            width={{ base: '100%', md: '300px' } as ResponsiveValue<number>}
            disabled={isPushing}
          >
            {marketplaces.map(marketplace => (
              <option key={marketplace.id} value={marketplace.id}>
                {marketplace.name}
              </option>
            ))}
          </Select>
        </Flex>
      </CardHeader>
      
      <Divider  />
      
      <CardBody>
        {/* Push Results */}
        {pushResults && (
          <Box 
            mb={4} 
            p={4} 
            borderRadius="md"
            bg={pushResults.failed.length === 0 
              ? (colorMode === 'light' ? 'green.50' : 'green.900')
              : (colorMode === 'light' ? 'orange.50' : 'orange.900')
            }
          >
            <Flex align="center" mb={2}>
              {pushResults.failed.length === 0 ? (
                <Check size={20} color="green" style={{ marginRight: '8px' }} />
              ) : (
                <AlertCircle size={20} color="orange" style={{ marginRight: '8px' }} />
              )}
              
              <Text fontWeight="bold">
                {pushResults.failed.length === 0 
                  ? 'Products Successfully Pushed!' 
                  : 'Some Products Failed to Push'
                }
              </Text>
            </Flex>
            
            <Text>{pushResults.message}</Text>
            
            {pushResults.success.length > 0 && (
              <Text mt={2}>
                <strong>{pushResults.success.length}</strong> products were successfully pushed.
              </Text>
            )}
            
            {pushResults.failed.length > 0 && (
              <Text mt={2} color={colorMode === 'light' ? 'red.600' : 'red.300'}>
                <strong>{pushResults.failed.length}</strong> products failed to push.
              </Text>
            )}
          </Box>
        )}
        
        {/* Filters */}
        <Flex direction={{ base: 'column', md: 'row' } as ResponsiveValue<string>} mb={4} gap={3} wrap="wrap">
          <Box flex="1" minW={{ base: '100%', md: '200px' }}>
            <Flex>
              <Input
                placeholder="Search products"
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                pr="8"
              />
              <Box ml="-8" zIndex="1" pointerEvents="none" display="flex" alignItems="center">
                <Search size={16} opacity={0.5} />
              </Box>
            </Flex>
          </Box>
          
          <Select
            placeholder="All Categories"
            value={categoryFilter}
            onChange={(e: any) => setCategoryFilter(e.target.value)}
            maxW={{ base: '100%', md: '200px' }}
            icon={<Filter size={14} />}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Select>
          
          <Select
            placeholder="All Statuses"
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            maxW={{ base: '100%', md: '150px' }}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </Select>
        </Flex>
        
        {/* Products Table */}
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th width="50px">
                  <Checkbox
                    checked={
                      filteredProducts.length > 0 &&
                      filteredProducts.every(product => 
                        selectedProducts.includes(product.id)
                      )
                    }
                    onChange={(e: any) => handleSelectAll(e.target.checked)}
                    disabled={isPushing}
                  />
                </Th>
                <Th>Product</Th>
                <Th>Status</Th>
                <Th>Marketplaces</Th>
                <Th>Quantity</Th>
                <Th>Price</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredProducts.length === 0 ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={4}>
                    <Text>No products found matching your filters</Text>
                  </Td>
                </Tr>
              ) : (
                filteredProducts.map(product => (
                  <Tr key={product.id}>
                    <Td>
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e: any) => handleSelectProduct(product.id, e.target.checked)}
                        disabled={isPushing}
                      />
                    </Td>
                    <Td>
                      <VStack align="start" gap={0}>
                        <Text fontWeight="medium">{product.name}</Text>
                        <Text fontSize="xs" color="gray.500">SKU: {product.sku}</Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          product.status === 'active' ? 'green' :
                          product.status === 'inactive' ? 'gray' :
                          'orange'
                        }
                      >
                        {product.status}
                      </Badge>
                    </Td>
                    <Td>
                      {product.listedMarketplaces.length === 0 ? (
                        <Text fontSize="sm" color="gray.500">Not listed</Text>
                      ) : (
                        <Tooltip label={product.listedMarketplaces.join(', ')}>
                          <Text fontSize="sm">
                            {product.listedMarketplaces.length} marketplace(s)
                          </Text>
                        </Tooltip>
                      )}
                    </Td>
                    <Td>
                      <NumberInput
                        value={quantities[product.id] || 0}
                        onChange={(_: any, value: any) => handleQuantityChange(product.id, value)}
                        min={0}
                        max={999}
                        size="sm"
                        maxW="100px"
                        disabled={!selectedProducts.includes(product.id) || isPushing}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </Td>
                    <Td>
                      <NumberInput
                        value={prices[product.id] || 0}
                        onChange={(_: any, value: any) => handlePriceChange(product.id, value)}
                        min={0}
                        precision={2}
                        step={0.01}
                        size="sm"
                        maxW="120px"
                        disabled={!selectedProducts.includes(product.id) || isPushing}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </CardBody>
      
      <Divider  />
      
      <CardFooter>
        <Flex justify="space-between" width="100%" align="center">
          <Text>
            {selectedProducts.length} of {filteredProducts.length} products selected
          </Text>
          
          <HStack>
            <Button
              variant="ghost"
              onClick={onComplete}
              disabled={isPushing}
            >
              Cancel
            </Button>
            
            <Button
              colorScheme="blue"
              leftIcon={<Share2 size={16} />}
              onClick={handlePushToMarketplace}
              disabled={selectedProducts.length === 0 || !selectedMarketplace || isPushing}
              loading={isPushing}
            >
              Push to Marketplace
            </Button>
          </HStack>
        </Flex>
      </CardFooter>
    </Card>
  );
}

export default MarketplacePush;