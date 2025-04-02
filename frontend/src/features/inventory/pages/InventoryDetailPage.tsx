/// <reference path="../../types/module-declarations.d.ts" />
'use client';

import React from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/utils/chakra-compat';
import { useColorMode } from '@/components/stubs/ChakraStubs';;;;
;
;
;
;
;
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

import { InventoryDetail } from '../components/InventoryDetail';
import { Box  } from '@/utils/chakra-compat';
import { VStack  } from '@/utils/chakra-compat';
import { HStack  } from '@/utils/chakra-compat';
import { Heading  } from '@/utils/chakra-compat';
import { Button  } from '@/utils/chakra-compat';

interface InventoryDetailPageProps {}

export default function InventoryDetailPage() {
  const { colorMode } = useColorMode();
  const router = useRouter();
  const params = useParams();
  const itemId = params?.id?.toString() || '';
  
  return (
    <Box p={6}>
      <VStack align="stretch" gap={6}>
        <HStack justify="space-between">
          <VStack align="start" gap={1}>
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
          
          <HStack gap={3}>
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