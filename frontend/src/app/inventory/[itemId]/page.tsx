'use client';

import React from 'react';
import { Box, Button, HStack } from '@/utils/chakra-compat';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { InventoryDetail } from '@/features/inventory/components/InventoryDetail';

export default function InventoryItemPage({ params }: { params: { itemId: string } }) {
  const router = useRouter();
  const itemId = params.itemId;
  
  const handleBack = () => {
    router.back();
  };
  
  return (
    <Box>
      <HStack mb={6}>
        <Button 
          leftIcon={<ChevronLeft size={16} />} 
          variant="outline" 
          onClick={handleBack}
        >
          Back to Inventory
        </Button>
      </HStack>
      
      <InventoryDetail itemId={itemId} />
    </Box>
  );
}