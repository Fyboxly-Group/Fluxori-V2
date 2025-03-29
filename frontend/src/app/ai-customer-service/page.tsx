'use client';

import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { Heading } from '@chakra-ui/react/heading';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react/breadcrumb';
import { VStack } from '@chakra-ui/react/stack';
import { useColorMode } from '@chakra-ui/react/color-mode';
import Link from 'next/link';

import { AICustomerServiceDemo } from '@/features/ai-cs-agent/components/AICustomerServiceDemo';

export default function AICustomerServicePage() {
  const { colorMode } = useColorMode();
  
  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6}>
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