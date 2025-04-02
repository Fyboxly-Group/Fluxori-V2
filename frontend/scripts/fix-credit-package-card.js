const fs = require('fs');
const path = require('path');

console.log('🚀 Starting CreditPackageCard fix script');

const sourceFilePath = path.resolve(__dirname, '../src/features/credits/components/CreditPackageCard.tsx');

// Completely rebuild the file with proper TypeScript and Chakra UI v3 patterns
const fixedContent = `'use client';

/**
 * Credit Package Card Component
 * Displays credit package details and purchase button
 */

import { useState } from 'react';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { Heading } from '@chakra-ui/react/heading';
import { VStack } from '@chakra-ui/react/stack';
import { HStack } from '@chakra-ui/react/stack';
import { Button } from '@chakra-ui/react/button';
import { Badge } from '@chakra-ui/react/badge';
import { Card } from '@chakra-ui/react/card';
import { CardBody } from '@chakra-ui/react/card';
import { CardFooter } from '@chakra-ui/react/card';
import { useCredits } from '../hooks/useCredits';
import { CreditPackage } from '../types/credits.types';
import { formatCurrency } from '@/utils/format-utils';

interface CreditPackageCardProps {
  creditPackage: CreditPackage;
}

export function CreditPackageCard({ creditPackage }: CreditPackageCardProps) {
  const [loading, setIsLoading] = useState(false);
  const { purchaseCredits } = useCredits();
  
  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      const result = await purchaseCredits(creditPackage.id);
      
      // If we have a redirect URL, go to payment processor
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
    } catch (error) {
      console.error('Failed to purchase credit package:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate price per credit for display
  const pricePerCredit = creditPackage.price / creditPackage.amount;
  
  return (
    <Card
      variant="outline"
      borderWidth="1px"
      borderColor={creditPackage.isPopular ? 'brand.500' : 'gray.200'}
      borderRadius="lg"
      overflow="hidden"
      position="relative"
      _hover={{
        boxShadow: 'lg',
        transform: 'translateY(-4px)',
        transition: 'all 0.2s ease-in-out'
      }}
    >
      {creditPackage.isPopular && (
        <Badge
          position="absolute"
          top={0}
          right={0}
          m={2}
          colorScheme="blue"
          borderRadius="md"
          px={2}
          py={1}
          fontWeight="bold"
          fontSize="xs"
          textTransform="uppercase"
        >
          Most Popular
        </Badge>
      )}
      
      <CardBody>
        <VStack align="center" gap={4}>
          <Heading size="md">{creditPackage.name}</Heading>
          
          <HStack>
            <Text fontSize="3xl" fontWeight="bold">
              {formatCurrency(creditPackage.price, creditPackage.currency)}
            </Text>
          </HStack>
          
          <HStack>
            <Text fontSize="xl" fontWeight="medium" color="brand.500">
              {creditPackage.amount.toLocaleString()} Credits
            </Text>
          </HStack>
          
          <Text fontSize="sm" color="gray.500" textAlign="center">
            {creditPackage.description}
          </Text>
          
          <Text fontSize="xs" color="gray.400">
            {formatCurrency(pricePerCredit, creditPackage.currency)} per credit
          </Text>
        </VStack>
      </CardBody>
      
      <CardFooter pt={0}>
        <Button
          colorScheme="brand"
          width="full"
          onClick={handlePurchase}
          loading={loading}
          loadingText="Processing..."
        >
          Purchase Now
        </Button>
      </CardFooter>
    </Card>
  );
}

export default CreditPackageCard;`;

try {
  fs.writeFileSync(sourceFilePath, fixedContent);
  console.log('✅ Fixed src/features/credits/components/CreditPackageCard.tsx');
} catch (error) {
  console.error('❌ Error fixing CreditPackageCard.tsx:', error);
}

console.log('✅ All fixes applied');