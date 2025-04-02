/// <reference path="../../types/module-declarations.d.ts" />
'use client';

import React from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/utils/chakra-compat';
import { useColorMode } from '@/components/stubs/ChakraStubs';;;
import Link from 'next/link';

import { AICustomerServiceDemo } from '@/features/ai-cs-agent/components/AICustomerServiceDemo';
;
;
;
;

// Fix for Next.js module resolution
import { ChakraProvider } from "@chakra-ui/react";
import { Box, VStack, Heading, Text } from '@/utils/chakra/components';



export default function AICustomerServicePage() {
  const { colorMode } = useColorMode();
  
  return (
    <Box p={6}>
      <VStack align="stretch" gap={6}>
        <Box>
          <Breadcrumb fontSize="sm" mb={2}>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>AI Customer Service</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          
          <Heading size="lg" mb={2}>AI Customer Service</Heading>
          <Text color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
            Interact with our AI-powered customer service agent in real-time
          </Text>
        </Box>
        
        <Box height="700px">
          <AICustomerServiceDemo />
        </Box>
      </VStack>
    </Box>
  );
}