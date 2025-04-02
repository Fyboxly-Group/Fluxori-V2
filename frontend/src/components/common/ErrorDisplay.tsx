/// <reference path="../../types/module-declarations.d.ts" />
import React from 'react';
import { Box  } from '@/utils/chakra-compat';
import { Heading  } from '@/utils/chakra-compat';
import { Text  } from '@/utils/chakra-compat';
import { Button  } from '@/utils/chakra-compat';
import { VStack  } from '@/utils/chakra-compat';
import { Alert  } from '@/utils/chakra-compat';
import { AlertIcon  } from '@/utils/chakra-compat';
import { AlertTitle  } from '@/utils/chakra-compat';
import { AlertDescription  } from '@/utils/chakra-compat';
import { RefreshCw } from 'lucide-react';
export interface ErrorDisplayProps {
  error?: Error | null;
  title?: string;
  description?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  status?: 'error' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'subtle' | 'solid' | 'left-accent' | 'top-accent';
  width?: ResponsiveValue<string | number>;
  mb?: ResponsiveValue<string | number>;
  mt?: ResponsiveValue<string | number>;
  mx?: ResponsiveValue<string | number>;
  resetErrorBoundary?: () => void;
  showReset?: boolean;
}

export function ErrorDisplay({ 
  title = 'Something went wrong', 
  error, 
  resetErrorBoundary,
  showReset = true,
  onRetry
}: ErrorDisplayProps) {
  // Extract error message
  const errorMessage = typeof error === 'string' 
    ? error 
    : error.message || 'An unknown error occurred';
  
  const handleReset = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    }
    
    if (onRetry) {
      onRetry();
    }
  };
  
  return (
    <Box>
      <Alert 
        status="error" 
        variant="subtle" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        textAlign="center" 
        borderRadius="md"
        py={6}
      >
        <AlertIcon boxSize="40px" mr={0}  />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          {title}
        </AlertTitle>
        <AlertDescription maxWidth="md">
          <VStack gap={4}>
            <Text>{errorMessage}</Text>
            
            {(showReset || onRetry) && (
              <Button
                leftIcon={<RefreshCw size={16} />}
                onClick={handleReset}
                size="sm"
                variant="outline"
              >
                Try again
              </Button>
            )}
          </VStack>
        </AlertDescription>
      </Alert>
    </Box>
  );
}

export default ErrorDisplay;