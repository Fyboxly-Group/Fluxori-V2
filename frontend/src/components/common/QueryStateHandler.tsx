/// <reference path="../../types/module-declarations.d.ts" />
import React from 'react';
import { Box  } from '@/utils/chakra-compat';
import { Flex  } from '@/utils/chakra-compat';
import { Spinner  } from '@/utils/chakra-compat';
import { ErrorDisplay } from './ErrorDisplay';

interface QueryStateHandlerProps {
  isLoading?: boolean;
  isError?: boolean;
  error?: any;
  isEmpty?: boolean;
  emptyState?: React.ReactNode | (() => React.ReactNode);
  children: React.ReactNode;
  onRetry?: () => void;
}

/**
 * A component that handles common query states:
 * - Loading
 * - Error
 * - Empty results
 * - Success with data
 */
export function QueryStateHandler({
  loading = false,
  isError = false,
  error,
  isEmpty = false,
  emptyState,
  children,
  onRetry
}: QueryStateHandlerProps) {
  // Loading state
  if (isLoading) {
    return (
      <Flex justify="center" align="center" py={10}>
        <Spinner size="xl" thickness="4px" speed="0.65s"  />
      </Flex>
    );
  }
  
  // Error state
  if (isError) {
    return (
      <Box py={4}>
        <ErrorDisplay
          error={error}
          onRetry={onRetry}
        />
      </Box>
    );
  }
  
  // Empty state
  if (isEmpty && emptyState) {
    return (
      <Box py={4}>
        {typeof emptyState === 'function' ? emptyState() : emptyState}
      </Box>
    );
  }
  
  // Default - render children
  return <>{children}</>;
}

export default QueryStateHandler;