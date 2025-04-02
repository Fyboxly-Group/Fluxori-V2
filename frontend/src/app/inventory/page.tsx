/// <reference path="../../types/module-declarations.d.ts" />
'use client';

;
;
;
import React from 'react';
import { Box, Heading, Stack, VStack } from '@/utils/chakra-compat';;
;
;
import { useRouter } from 'next/navigation';

import { InventoryList } from '@/features/inventory/components/InventoryList';

export default function InventoryPage() {
  const router = useRouter();
  
  const handleItemClick = (itemId: string) => {
    router.push(`/inventory/${itemId}`);
  };
  
  return (
    <VStack align="stretch" gap={6}>
      <Box>
        <Heading size="lg">Inventory Management</Heading>
      </Box>
      
      <InventoryList 
        onItemClick={handleItemClick}
        useEnhanced={true}
      />
    </VStack>
  );
}