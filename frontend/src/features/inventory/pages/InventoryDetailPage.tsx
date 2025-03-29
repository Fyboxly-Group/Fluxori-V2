'use client';

import { Box } from '@chakra-ui/react/box';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react/breadcrumb';
import { Heading } from '@chakra-ui/react/heading';
import { HStack, VStack } from '@chakra-ui/react/stack';
import { Button } from '@chakra-ui/react/button';
import { useColorMode } from '@chakra-ui/react/color-mode';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

import { InventoryDetail } from '../components/InventoryDetail';

export default function InventoryDetailPage() {
  const { colorMode } = useColorMode();
  const router = useRouter();
  const params = useParams();
  const itemId = params?.id?.toString() || '';
  
  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Breadcrumb fontSize="sm">
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} href="/inventory">Inventory</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink>Item Details</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
            <Heading size="xl">Inventory Item Details</Heading>
          </VStack>
          
          <HStack spacing={3}>
            <Button 
              variant="outline" 
              onClick={() => router.back()}
            >
              Back
            </Button>
            <Button 
              colorScheme="blue"
              as={Link}
              href={`/inventory/${itemId}/edit`}
            >
              Edit Item
            </Button>
          </HStack>
        </HStack>
        
        <InventoryDetail itemId={itemId} />
      </VStack>
    </Box>
  );
}