/**
 * Fix QueryStateHandler component
 * 
 * This script provides a complete clean implementation of the QueryStateHandler component
 * which has complex syntax issues.
 */

const fs = require('fs');
const path = require('path');

// Root directory
const ROOT_DIR = process.cwd();

function fixQueryStateHandler() {
  console.log('🔍 Fixing QueryStateHandler component...');
  
  const filePath = path.join(ROOT_DIR, 'src/components/common/QueryStateHandler.tsx');
  
  if (fs.existsSync(filePath)) {
    // Provide a clean implementation
    const fixedContent = `'use client';

import { ReactNode } from 'react';
import { Box } from '@chakra-ui/react/box';
import { Spinner } from '@chakra-ui/react/spinner';
import { Center } from '@chakra-ui/react/center';
import { VStack } from '@chakra-ui/react/stack';
import { Skeleton } from '@chakra-ui/react/skeleton';

import { ErrorDisplay } from './ErrorDisplay';

export interface QueryStateHandlerProps {
  // Status flags
  isLoading: boolean;
  loading?: boolean; // Alias for isLoading for compatibility with Chakra v3
  isError: boolean;
  error: Error | null;
  
  // Content
  children: ReactNode;
  
  // Options
  onRetry?: () => void;
  errorComponent?: ReactNode;
  
  // Loading state display options
  showSpinnerOnFetch?: boolean;
  isFetching?: boolean;
  useSkeleton?: boolean;
  skeletonHeight?: string;
  skeletonLines?: number;
}

export function QueryStateHandler({
  // Allow both isLoading and loading props for compatibility
  isLoading = false,
  loading = false,
  isError = false,
  error = null,
  children,
  onRetry,
  errorComponent,
  showSpinnerOnFetch = true,
  isFetching = false,
  useSkeleton = false,
  skeletonHeight,
  skeletonLines = 3
}: QueryStateHandlerProps) {
  // Use either isLoading or loading prop
  const isContentLoading = isLoading || loading;
  
  // Show loading state
  if (isContentLoading) {
    if (useSkeleton) {
      // Show skeleton loader
      if (skeletonHeight) {
        return (
          <Skeleton height={skeletonHeight} width="100%" borderRadius="md" />
        );
      } else {
        // Show multiple skeleton lines
        return (
          <VStack align="stretch" spacing={2} width="100%">
            {Array.from({ length: skeletonLines }).map((_, index) => (
              <Skeleton key={index} height="20px" width="100%" borderRadius="md" />
            ))}
          </VStack>
        );
      }
    } else {
      // Show spinner
      return (
        <Center py={6}>
          <Spinner size="xl" />
        </Center>
      );
    }
  }
  
  // Show error state
  if (isError && error) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }
    
    return (
      <ErrorDisplay 
        error={error} 
        onRetry={onRetry}
      />
    );
  }
  
  // Show content with optional loading indicator for background fetching
  return (
    <Box position="relative">
      {children}
      
      {showSpinnerOnFetch && isFetching && (
        <Box 
          position="absolute" 
          top={2} 
          right={2}
          zIndex={2}
        >
          <Spinner size="sm" />
        </Box>
      )}
    </Box>
  );
}`;
    
    fs.writeFileSync(filePath, fixedContent);
    console.log(`✅ Fixed QueryStateHandler component`);
  }
}

function main() {
  try {
    console.log('🚀 Starting QueryStateHandler fix script');
    
    // Fix the component
    fixQueryStateHandler();
    
    console.log('✅ All fixes applied');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();