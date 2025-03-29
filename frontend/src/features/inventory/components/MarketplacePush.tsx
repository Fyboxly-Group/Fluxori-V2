'use client';

import { useState } from 'react';
import { Button } from '@chakra-ui/react/button';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { Stack, VStack, HStack } from '@chakra-ui/react/stack';
import { Divider } from '@chakra-ui/react/divider';
import { Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/react/card';
import { Heading } from '@chakra-ui/react/heading';
import { Checkbox } from '@chakra-ui/react/checkbox';
import { Spinner } from '@chakra-ui/react/spinner';
import { Badge } from '@chakra-ui/react/badge';
import { Tooltip } from '@chakra-ui/react/tooltip';
import { Image } from '@chakra-ui/react/image';
import { IconButton } from '@chakra-ui/react/button';
import { Switch } from '@chakra-ui/react/switch';
import { FormControl, FormLabel } from '@chakra-ui/react/form-control';
import { useColorMode } from '@chakra-ui/react/color-mode';

import { InventoryItem, MarketplaceConnection } from '../api/inventory.api';
import { useInventory } from '../hooks/useInventory';

interface MarketplacePushProps {
  inventoryItem: InventoryItem;
}

export function MarketplacePush({ inventoryItem }: MarketplacePushProps) {
  const { colorMode } = useColorMode();
  
  // Fetch connected marketplaces
  const { useConnectedMarketplaces, usePushToMarketplace } = useInventory();
  const { data: marketplaces, isLoading, error } = useConnectedMarketplaces();
  const pushMutation = usePushToMarketplace();
  
  // Local state for which fields to push for each marketplace
  const [pushSelections, setPushSelections] = useState<Record<string, {
    price: boolean;
    stock: boolean;
    status: boolean;
    isExpanded: boolean;
  }>>({});
  
  // Function to toggle a field selection for a marketplace
  const toggleFieldSelection = (marketplaceId: string, field: 'price' | 'stock' | 'status') => {
    setPushSelections(prev => {
      const marketplace = prev[marketplaceId] || { price: false, stock: false, status: false, isExpanded: false };
      return {
        ...prev,
        [marketplaceId]: {
          ...marketplace,
          [field]: !marketplace[field]
        }
      };
    });
  };
  
  // Function to toggle expanded state for a marketplace
  const toggleExpanded = (marketplaceId: string) => {
    setPushSelections(prev => {
      const marketplace = prev[marketplaceId] || { price: false, stock: false, status: false, isExpanded: false };
      return {
        ...prev,
        [marketplaceId]: {
          ...marketplace,
          isExpanded: !marketplace.isExpanded
        }
      };
    });
  };
  
  // Function to handle push to marketplace
  const handlePushToMarketplace = (marketplace: MarketplaceConnection) => {
    const selections = pushSelections[marketplace.id] || { price: false, stock: false, status: false };
    
    // Prepare updates based on selected fields
    const updates: { price?: number; rrp?: number; stock?: number; status?: 'active' | 'inactive' } = {};
    
    if (selections.price) {
      updates.price = inventoryItem.price;
    }
    
    if (selections.stock) {
      updates.stock = inventoryItem.stockQuantity;
    }
    
    if (selections.status) {
      updates.status = inventoryItem.isActive ? 'active' : 'inactive';
    }
    
    // Execute push mutation
    pushMutation.mutate({
      productId: inventoryItem._id,
      marketplaceId: marketplace.id,
      updates
    });
  };
  
  // Helper to check if any field is selected for a marketplace
  const isAnyFieldSelected = (marketplaceId: string) => {
    const selections = pushSelections[marketplaceId];
    return selections && (selections.price || selections.stock || selections.status);
  };
  
  // Helper function to get the status badge for a marketplace
  const getStatusBadge = (status: string) => {
    let color;
    switch (status) {
      case 'connected':
        color = 'green';
        break;
      case 'disconnected':
        color = 'gray';
        break;
      case 'error':
        color = 'red';
        break;
      default:
        color = 'gray';
    }
    return <Badge colorScheme={color}>{status}</Badge>;
  };
  
  // Helper to format last synced time
  const formatLastSynced = (lastSynced: string) => {
    const date = new Date(lastSynced);
    return date.toLocaleString();
  };
  
  if (isLoading) {
    return (
      <Box textAlign="center" py={4}>
        <Spinner size="lg" />
        <Text mt={2}>Loading connected marketplaces...</Text>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box 
        p={4} 
        bg={colorMode === 'light' ? 'red.50' : 'red.900'} 
        color={colorMode === 'light' ? 'red.500' : 'red.200'} 
        borderRadius="md"
      >
        <Text>Error loading marketplaces: {error.message}</Text>
      </Box>
    );
  }
  
  if (!marketplaces || marketplaces.length === 0) {
    return (
      <Box 
        p={4} 
        bg={colorMode === 'light' ? 'yellow.50' : 'yellow.900'} 
        color={colorMode === 'light' ? 'yellow.700' : 'yellow.200'} 
        borderRadius="md"
      >
        <Text>No marketplaces are currently connected to your account.</Text>
      </Box>
    );
  }
  
  return (
    <VStack spacing={4} w="full" align="stretch">
      <Heading size="md">Push to Marketplaces</Heading>
      <Text>
        Update this product's information on connected marketplaces. Select the data you want to push for each marketplace.
      </Text>
      
      {marketplaces.map((marketplace) => {
        const selections = pushSelections[marketplace.id] || { 
          price: false, 
          stock: false, 
          status: false,
          isExpanded: false
        };
        const isPushing = pushMutation.isPending && 
                         pushMutation.variables?.marketplaceId === marketplace.id;
        
        return (
          <Card 
            key={marketplace.id} 
            variant="outline" 
            borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
            boxShadow="sm"
          >
            <CardHeader pb={2}>
              <HStack justify="space-between">
                <HStack>
                  {marketplace.logo && (
                    <Box boxSize="32px" borderRadius="md" overflow="hidden" mr={2}>
                      <Image src={marketplace.logo} alt={marketplace.name} boxSize="32px" objectFit="contain" />
                    </Box>
                  )}
                  <VStack align="start" spacing={0}>
                    <Heading size="sm">{marketplace.name}</Heading>
                    <HStack>
                      {getStatusBadge(marketplace.status)}
                      <Text fontSize="xs">
                        Last synced: {formatLastSynced(marketplace.lastSynced)}
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => toggleExpanded(marketplace.id)}
                >
                  {selections.isExpanded ? 'Hide' : 'Configure'}
                </Button>
              </HStack>
            </CardHeader>
            
            {selections.isExpanded && (
              <>
                <Divider />
                <CardBody pt={3} pb={3}>
                  <VStack align="start" spacing={3}>
                    <Text fontWeight="medium">Select fields to push:</Text>
                    
                    <FormControl as={HStack}>
                      <Checkbox 
                        isChecked={selections.price}
                        onChange={() => toggleFieldSelection(marketplace.id, 'price')}
                        id={`${marketplace.id}-price`}
                      >
                        Price ({inventoryItem.price})
                      </Checkbox>
                      <Tooltip 
                        label="Push the current selling price to this marketplace" 
                        hasArrow
                      >
                        <Box as="span" fontSize="sm">ⓘ</Box>
                      </Tooltip>
                    </FormControl>
                    
                    <FormControl as={HStack}>
                      <Checkbox 
                        isChecked={selections.stock}
                        onChange={() => toggleFieldSelection(marketplace.id, 'stock')}
                        id={`${marketplace.id}-stock`}
                      >
                        Stock Quantity ({inventoryItem.stockQuantity})
                      </Checkbox>
                      <Tooltip 
                        label="Push the current stock level to this marketplace" 
                        hasArrow
                      >
                        <Box as="span" fontSize="sm">ⓘ</Box>
                      </Tooltip>
                    </FormControl>
                    
                    <FormControl as={HStack}>
                      <Checkbox 
                        isChecked={selections.status}
                        onChange={() => toggleFieldSelection(marketplace.id, 'status')}
                        id={`${marketplace.id}-status`}
                      >
                        Status ({inventoryItem.isActive ? 'Active' : 'Inactive'})
                      </Checkbox>
                      <Tooltip 
                        label="Push the current active status to this marketplace" 
                        hasArrow
                      >
                        <Box as="span" fontSize="sm">ⓘ</Box>
                      </Tooltip>
                    </FormControl>
                  </VStack>
                </CardBody>
              </>
            )}
            
            <CardFooter pt={2}>
              <Button
                colorScheme="blue"
                leftIcon={isPushing ? <Spinner size="sm" /> : undefined}
                isDisabled={!isAnyFieldSelected(marketplace.id) || isPushing}
                onClick={() => handlePushToMarketplace(marketplace)}
                w="full"
              >
                {isPushing ? 'Pushing...' : 'Push to ' + marketplace.name}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </VStack>
  );
}