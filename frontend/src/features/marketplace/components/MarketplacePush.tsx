'use client';

import React from 'react';
import { Box, Text, Button, VStack, HStack, Heading } from '@/utils/chakra-compat';

interface MarketplacePushProps {
  inventoryItem: any;
}

export function MarketplacePush({ inventoryItem }: MarketplacePushProps) {
  return (
    <Box>
      <VStack align="start" spacing={4}>
        <Box>
          <Heading size="md" mb={2}>Marketplace Integration</Heading>
          <Text>Push this inventory item to connected marketplaces.</Text>
        </Box>
        
        <HStack spacing={4}>
          <Button colorScheme="blue">Amazon</Button>
          <Button colorScheme="teal">Shopify</Button>
          <Button colorScheme="purple">eBay</Button>
        </HStack>
      </VStack>
    </Box>
  );
}
