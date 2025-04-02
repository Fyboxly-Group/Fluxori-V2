/// <reference path="../../types/module-declarations.d.ts" />
'use client';

;
;
;
import React from 'react';
import { Box, Button, Text } from '@/utils/chakra-compat';;
;
;
import { ChevronLeft, Search, Plus } from 'lucide-react';

export default function TestIconPage() {
  return (
    <Box p={4}>
      <Text fontSize="xl" mb={4}>Icon Migration Test</Text>
      
      <Button leftIcon={<ChevronLeft size={16} />} mr={2}>
        Back
      </Button>
      
      <Button leftIcon={<Search size={16} />} mr={2}>
        Search
      </Button>
      
      <Button leftIcon={<Plus size={16} />}>
        Add New
      </Button>
    </Box>
  );
}