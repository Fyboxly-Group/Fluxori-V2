#!/usr/bin/env node

/**
 * Fix Remaining High Priority Components
 * 
 * This script fixes warehouse-related components with TypeScript errors
 */

const fs = require('fs');
const path = require('path');

// Root directory
const ROOT_DIR = process.cwd();

// Connection Form Implementation
const connectionFormImplementation = `'use client';

import { useState } from 'react';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { Button } from '@chakra-ui/react/button';
import { Input } from '@chakra-ui/react/input';
import { Textarea } from '@chakra-ui/react/textarea';
import { Select } from '@chakra-ui/react/select';
import { Flex } from '@chakra-ui/react/flex';
import { VStack } from '@chakra-ui/react/stack';
import { FormControl, FormLabel, FormHelperText, FormErrorMessage } from '@chakra-ui/react/form-control';
import { Card, CardBody, CardHeader, CardFooter } from '@chakra-ui/react/card';
import { useColorMode } from '@chakra-ui/react/color-mode';
import { useConnections } from '../hooks/useConnections';

export interface ConnectionFormData {
  name: string;
  type: 'marketplace' | 'shipping' | 'accounting' | 'other';
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  endpoint?: string;
  notes?: string;
  isActive: boolean;
}

interface ConnectionFormProps {
  initialData?: Partial<ConnectionFormData>;
  onSubmit?: (data: ConnectionFormData) => void;
  onCancel?: () => void;
  isEdit?: boolean;
}

const DEFAULT_FORM_DATA: ConnectionFormData = {
  name: '',
  type: 'marketplace',
  apiKey: '',
  apiSecret: '',
  accessToken: '',
  refreshToken: '',
  endpoint: '',
  notes: '',
  isActive: true
};

export function ConnectionForm({
  initialData = {},
  onSubmit,
  onCancel,
  isEdit = false
}: ConnectionFormProps) {
  const { colorMode } = useColorMode();
  const { validateConnection } = useConnections();
  
  // Combine default form data with any initial data provided
  const [formData, setFormData] = useState<ConnectionFormData>({
    ...DEFAULT_FORM_DATA,
    ...initialData
  });
  
  // Form validation state
  const [errors, setErrors] = useState<Partial<Record<keyof ConnectionFormData, string>>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name as keyof ConnectionFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ConnectionFormData, string>> = {};
    
    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Type-specific validation
    if (formData.type === 'marketplace') {
      // API credentials might be required for marketplace connections
      if (!formData.apiKey?.trim() && !formData.accessToken?.trim()) {
        newErrors.apiKey = 'Either API key or access token is required';
        newErrors.accessToken = 'Either API key or access token is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Call onSubmit callback with form data
      if (onSubmit) {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Error submitting connection form:', error);
      // Handle submission error
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Test connection
  const handleTestConnection = async () => {
    try {
      setIsValidating(true);
      
      const result = await validateConnection(formData);
      
      if (result.success) {
        // Show success message
        alert('Connection validated successfully!');
      } else {
        // Show error message
        alert(\`Connection validation failed: \${result.message}\`);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      alert('Failed to test connection. Please check your settings and try again.');
    } finally {
      setIsValidating(false);
    }
  };
  
  return (
    <Card variant="outline">
      <CardHeader pb={0}>
        <Text fontSize="xl" fontWeight="bold">
          {isEdit ? 'Edit Connection' : 'Add New Connection'}
        </Text>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            {/* Basic Information */}
            <Box>
              <Text fontWeight="medium" mb={2}>Basic Information</Text>
              
              <FormControl isRequired isInvalid={!!errors.name}>
                <FormLabel>Connection Name</FormLabel>
                <Input 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  placeholder="e.g., Amazon Seller Central, Shopify Store"
                />
                {errors.name && (
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                )}
              </FormControl>
              
              <FormControl mt={3} isRequired>
                <FormLabel>Connection Type</FormLabel>
                <Select name="type" value={formData.type} onChange={handleChange}>
                  <option value="marketplace">Marketplace</option>
                  <option value="shipping">Shipping Provider</option>
                  <option value="accounting">Accounting Software</option>
                  <option value="other">Other</option>
                </Select>
              </FormControl>
            </Box>
            
            {/* API Credentials */}
            <Box>
              <Text fontWeight="medium" mb={2}>API Credentials</Text>
              
              <FormControl isInvalid={!!errors.apiKey}>
                <FormLabel>API Key</FormLabel>
                <Input 
                  name="apiKey" 
                  value={formData.apiKey || ''} 
                  onChange={handleChange}
                  placeholder="Enter API key"
                />
                {errors.apiKey && (
                  <FormErrorMessage>{errors.apiKey}</FormErrorMessage>
                )}
              </FormControl>
              
              <FormControl mt={3}>
                <FormLabel>API Secret</FormLabel>
                <Input 
                  name="apiSecret" 
                  type="password"
                  value={formData.apiSecret || ''} 
                  onChange={handleChange}
                  placeholder="Enter API secret"
                />
              </FormControl>
              
              <FormControl mt={3} isInvalid={!!errors.accessToken}>
                <FormLabel>Access Token</FormLabel>
                <Input 
                  name="accessToken" 
                  value={formData.accessToken || ''} 
                  onChange={handleChange}
                  placeholder="Enter access token"
                />
                {errors.accessToken && (
                  <FormErrorMessage>{errors.accessToken}</FormErrorMessage>
                )}
              </FormControl>
              
              <FormControl mt={3}>
                <FormLabel>Refresh Token</FormLabel>
                <Input 
                  name="refreshToken" 
                  value={formData.refreshToken || ''} 
                  onChange={handleChange}
                  placeholder="Enter refresh token"
                />
              </FormControl>
              
              <FormControl mt={3}>
                <FormLabel>API Endpoint</FormLabel>
                <Input 
                  name="endpoint" 
                  value={formData.endpoint || ''} 
                  onChange={handleChange}
                  placeholder="e.g., https://api.example.com/v1"
                />
                <FormHelperText>
                  The base URL for API requests (if applicable)
                </FormHelperText>
              </FormControl>
            </Box>
            
            {/* Additional Information */}
            <Box>
              <Text fontWeight="medium" mb={2}>Additional Information</Text>
              
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea 
                  name="notes" 
                  value={formData.notes || ''} 
                  onChange={handleChange}
                  placeholder="Enter any additional notes about this connection"
                  rows={3}
                />
              </FormControl>
              
              <FormControl mt={3} display="flex" alignItems="center">
                <input 
                  type="checkbox" 
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleCheckboxChange}
                  style={{ marginRight: '8px' }}
                />
                <FormLabel htmlFor="isActive" mb="0">
                  Connection Active
                </FormLabel>
              </FormControl>
            </Box>
          </VStack>
        </CardBody>
        
        <CardFooter>
          <Flex justify="space-between" width="100%">
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting || isValidating}
            >
              Cancel
            </Button>
            
            <Flex>
              <Button 
                variant="outline"
                mr={3}
                onClick={handleTestConnection}
                disabled={isSubmitting || isValidating}
                loading={isValidating}
              >
                Test Connection
              </Button>
              
              <Button 
                type="submit"
                colorScheme="blue"
                disabled={isSubmitting || isValidating}
                loading={isSubmitting}
              >
                {isEdit ? 'Update' : 'Create'} Connection
              </Button>
            </Flex>
          </Flex>
        </CardFooter>
      </form>
    </Card>
  );
}

export default ConnectionForm;`;

// MarketplacePush Implementation 
const marketplacePushImplementation = `'use client';

import { useState } from 'react';
import { Box } from '@chakra-ui/react/box';
import { Flex } from '@chakra-ui/react/flex';
import { Text } from '@chakra-ui/react/text';
import { Button } from '@chakra-ui/react/button';
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer } from '@chakra-ui/react/table';
import { Checkbox } from '@chakra-ui/react/checkbox';
import { Badge } from '@chakra-ui/react/badge';
import { Spinner } from '@chakra-ui/react/spinner';
import { HStack, VStack } from '@chakra-ui/react/stack';
import { Divider } from '@chakra-ui/react/divider';
import { Select } from '@chakra-ui/react/select';
import { Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/react/card';
import { Tooltip } from '@chakra-ui/react/tooltip';
import { Input } from '@chakra-ui/react/input';
import { NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from '@chakra-ui/react/number-input';
import { useColorMode } from '@chakra-ui/react/color-mode';
import { AlertCircle, Check, ShoppingCart, Share2, Filter, Search, AlertTriangle } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { useConnections } from '../../connections/hooks/useConnections';

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
  useState(() => {
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
        <Spinner size="xl" />
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
          <VStack spacing={4} py={6} align="center">
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
          <VStack spacing={4} py={6} align="center">
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
            onChange={(e) => setSelectedMarketplace(e.target.value)}
            width={{ base: '100%', md: '300px' }}
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
      
      <Divider />
      
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
        <Flex direction={{ base: 'column', md: 'row' }} mb={4} gap={3} wrap="wrap">
          <Box flex="1" minW={{ base: '100%', md: '200px' }}>
            <Flex>
              <Input
                placeholder="Search products"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
            onChange={(e) => setCategoryFilter(e.target.value)}
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
            onChange={(e) => setStatusFilter(e.target.value)}
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
                    isChecked={
                      filteredProducts.length > 0 &&
                      filteredProducts.every(product => 
                        selectedProducts.includes(product.id)
                      )
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
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
                        isChecked={selectedProducts.includes(product.id)}
                        onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                        disabled={isPushing}
                      />
                    </Td>
                    <Td>
                      <VStack align="start" spacing={0}>
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
                        onChange={(_, value) => handleQuantityChange(product.id, value)}
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
                        onChange={(_, value) => handlePriceChange(product.id, value)}
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
      
      <Divider />
      
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

export default MarketplacePush;`;

// Function to fix Connection Form component
function fixConnectionForm() {
  console.log('🔍 Fixing ConnectionForm component...');
  
  const filePath = path.join(ROOT_DIR, 'src/features/connections/components/ConnectionForm.tsx');
  
  if (fs.existsSync(filePath)) {
    try {
      fs.writeFileSync(filePath, connectionFormImplementation, { mode: 0o644 });
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

// Function to fix MarketplacePush component
function fixMarketplacePush() {
  console.log('🔍 Fixing MarketplacePush component...');
  
  const filePath = path.join(ROOT_DIR, 'src/features/inventory/components/MarketplacePush.tsx');
  
  if (fs.existsSync(filePath)) {
    try {
      fs.writeFileSync(filePath, marketplacePushImplementation, { mode: 0o644 });
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
    console.log('🚀 Starting remaining high priority components fix script');
    
    // Fix ConnectionForm component
    const connectionFormFixed = fixConnectionForm();
    
    // Fix MarketplacePush component
    const marketplacePushFixed = fixMarketplacePush();
    
    // Summary
    const fixedCount = [connectionFormFixed, marketplacePushFixed].filter(Boolean).length;
    console.log(`✅ Fixed ${fixedCount} out of 2 components`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();