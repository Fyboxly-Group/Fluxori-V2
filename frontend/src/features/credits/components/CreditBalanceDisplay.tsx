/// <reference path="../../../types/module-declarations.d.ts" />
'use client'

/**
 * Credit Balance Display Component
 * Shows the user's current credit balance
 */

import React from 'react';
import { Box, Text, HStack, Spinner, Tooltip } from '@/utils/chakra-compat';;
;
;
;
;
import { Info } from 'lucide-react';
import { useCreditBalance } from '../hooks/useCredits';
import { convertChakraProps, withAriaLabel } from '@/utils';

interface CreditBalanceDisplayProps {
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function CreditBalanceDisplay({ showLabel = true, size = 'md' }: CreditBalanceDisplayProps) {
  const { data: creditBalance, loading, isError } = useCreditBalance();

  // Define styles based on size
  const fontSizes = {
    sm: { label: 'xs', value: 'sm' },
    md: { label: 'sm', value: 'md' },
    lg: { label: 'md', value: 'lg' },
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  // If loading, show spinner
  if (loading) {
    return (
      <HStack gap={2}>
        {showLabel && <Text fontSize={fontSizes[size].label}>Credits:</Text>}
        <Spinner size="xs"   />
      </HStack>
    );
  }

  // If error, show error state
  if (isError || !creditBalance) {
    return (
      <HStack gap={2} color="gray.500">
        {showLabel && <Text fontSize={fontSizes[size].label}>Credits:</Text>}
        <Text fontSize={fontSizes[size].value}>--</Text>
      </HStack>
    );
  }

  // Calculate color based on balance
  const getBalanceColor = (balance: number) => {
    if (balance <= 10) return 'red.500';
    if (balance <= 50) return 'orange.500';
    return 'brand.500';
  };

  return (
    <Tooltip 
      label={`Last updated: ${new Date(creditBalance.lastUpdated).toLocaleString()}`}
      placement="bottom"
      hasArrow
    >
      <HStack gap={2}>
        {showLabel && (
          <Text fontSize={fontSizes[size].label} color="gray.600">
            Credits:
          </Text>
        )}
        <HStack gap={1}>
          <Text 
            fontSize={fontSizes[size].value} 
            fontWeight="bold"
            color={getBalanceColor(creditBalance.balance)}
          >
            {creditBalance.balance.toLocaleString()}
          </Text>
          <Info 
            size={iconSizes[size]} 
            color="gray.400" 
          />
        </HStack>
      </HStack>
    </Tooltip>
  );
}

export default CreditBalanceDisplay;