/// <reference path="../../../types/module-declarations.d.ts" />

'use client'

/**
 * Credit Packages Component
 * Displays available credit packages for purchase
 */

// Create dummy SimpleGrid component
const SimpleGrid = ({ children, ...props }: React.PropsWithChildren<any>) => (
  <div {...props}>{children}</div>
);

import React from 'react';
import { Box, Text, Heading, VStack, Spinner, Alert, AlertIcon, AlertTitle, AlertDescription } from '@/utils/chakra-compat';;
;
;
;
;
;
import { useCreditPackages } from '../hooks/useCredits';
import { CreditPackageCard } from './CreditPackageCard';
import { convertChakraProps, withAriaLabel } from '@/utils';

interface CreditPackagesProps {
  title?: string
  description?: string
  columns?: { 
    base: number;
    md: number; 
    lg: number 
  }
}

export function CreditPackages({
  title = 'Credit Packages',
  description = 'Purchase credits to use with our services',
  columns = { base: 1, md: 2, lg: 3 },
}: CreditPackagesProps) {
  const { data: creditPackages, loading, isError } = useCreditPackages();
  
  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl"   />
      </Box>
    );
  }
  
  if (isError || !creditPackages) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon   />
        <Box>
          <AlertTitle>Failed to load credit packages</AlertTitle>
          <AlertDescription>
            Please try again later or contact support if the issue persists.
          </AlertDescription>
        </Box>
      </Alert>
    );
  }
  
  if (creditPackages.length === 0) {
    return (
      <Alert status="info" borderRadius="md">
        <AlertIcon   />
        <Box>
          <AlertTitle>No credit packages available</AlertTitle>
          <AlertDescription>
            Check back later for available credit packages or contact support.
          </AlertDescription>
        </Box>
      </Alert>
    );
  }
  
  return (
    <VStack align="start" gap={6} width="100%">
      {title && <Heading size="lg">{title}</Heading>}
      {description && <Text color="gray.600">{description}</Text>}
      
      <SimpleGrid 
        columns={{
          base: columns.base,
          md: columns.md,
          lg: columns.lg
        }}
        gap={6} 
        width="100%"
      >
        {creditPackages.map((pkg: any) => (
          <CreditPackageCard key={pkg.id} creditPackage={pkg} />
        ))}
      </SimpleGrid>
    </VStack>
  );
}

export default CreditPackages;