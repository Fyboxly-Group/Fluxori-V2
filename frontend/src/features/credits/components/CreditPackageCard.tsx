/// <reference path="../../types/module-declarations.d.ts" />
'use client';

/**
 * Credit Package Card Component
 * Displays credit package details and purchase button
 */

import { useState } from 'react';
import { Box  } from '@/utils/chakra-compat';
import { Text  } from '@/utils/chakra-compat';
import { Heading  } from '@/utils/chakra-compat';
import { VStack  } from '@/utils/chakra-compat';
import { HStack  } from '@/utils/chakra-compat';
import { Button  } from '@/utils/chakra-compat';
import { Badge  } from '@/utils/chakra-compat';
import { Card  } from '@/utils/chakra-compat';
import { CardBody  } from '@/utils/chakra-compat';
import { CardFooter  } from '@/utils/chakra-compat';
import { useCredits } from '@/components/stubs/ChakraStubs';
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

export default CreditPackageCard;