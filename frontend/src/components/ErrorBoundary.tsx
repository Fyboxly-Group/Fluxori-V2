/// <reference path="../types/module-declarations.d.ts" />
'use client'

import React from 'react';
import { Box, Button, Code, Flex, Heading, Icon, Text, VStack } from '@/utils/chakra-compat';
import { Component, ErrorInfo, ReactNode } from 'react'
;
;
;
;
;

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { AppError, ErrorCategory, createAppError } from '@/utils/error.utils'
import { useRouter } from 'next/navigation'
import { captureException } from '@/utils/monitoring.utils'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  FallbackComponent?: React.ComponentType<{ error: AppError; resetError: () => void }>
  onError?: (error: AppError, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: AppError | null
}

/**
 * Error boundary component for catching and displaying UI errors
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null
    }
  }

  // Update state when error occurs
  static getDerivedStateFromError(error: any): State {
    // Convert to AppError format
    const appError: AppError = error instanceof Error
      ? createAppError(
          error.message,
          ErrorCategory.UI,
          { 
            technicalMessage: error.stack,
            originalError: error
          }
        )
      : createAppError(
          'An unexpected UI error occurred',
          ErrorCategory.UNEXPECTED,
          { originalError: error }
        );

    return {
      hasError: true,
      error: appError
    }
  }

  // Handle error - log, report, etc.
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Report to monitoring
    const appError = this.state.error || createAppError(
      error.message,
      ErrorCategory.UI,
      { technicalMessage: error.stack, originalError: error }
    );
    
    // Log to console
    console.error('UI Error:', {
      error: appError,
      componentStack: errorInfo.componentStack
    });
    
    // Report to monitoring
    captureException(appError);
    
    // Call custom error handler if provided
    this.props.onError?.(appError, errorInfo);
  }
  
  // Reset error state
  resetError = () => {
    this.setState({
      hasError: false,
      error: null
    })
  }

  render() {
    // Return children if no error
    if (!this.state.hasError) {
      return this.props.children
    }

    // Use custom fallback component if provided
    if (this.props.FallbackComponent && this.state.error) {
      return <this.props.FallbackComponent 
        error={this.state.error} 
        resetError={this.resetError} 
      />
    }
    
    // Use simple fallback node if provided
    if (this.props.fallback) {
      return this.props.fallback
    }

    // Default error UI
    return (
      <DefaultErrorFallback 
        error={this.state.error} 
        resetError={this.resetError} 
      />
    )
  }
}

/**
 * Default error fallback component
 */
const DefaultErrorFallback = ({ 
  error, 
  resetError 
}: { 
  error: AppError | null; 
  resetError: () => void 
}) => {
  const router = useRouter()
  
  // Go back to previous page
  const handleGoBack = () => {
    router.back()
  }
  
  // Reload the current page
  const handleReload = () => {
    window.location.reload()
  }
  
  // Retry the operation
  const handleRetry = () => {
    resetError()
  }
  
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      h="100%"
      minH="400px"
      p={8}
    >
      <Box 
        p={8}
        maxW="600px" 
        w="100%"
        bg="white" 
        shadow="lg" 
        borderRadius="md"
        borderLeft="4px solid" 
        borderLeftColor="red.500"
      >
        <VStack align="flex-start" gap={4}>
          <Flex 
            align="center" 
            color="red.500"
          >
            <Icon as={AlertTriangle} mr={2} boxSize={6} />
            <Heading size="md">Something went wrong</Heading>
          </Flex>
          
          <Text color="gray.700">
            {error?.message || 'An unexpected error occurred in the user interface.'}
          </Text>
          
          {process.env.NODE_ENV !== 'production' && error?.technicalMessage && (
            <Box 
              bg="gray.50" 
              p={3} 
              borderRadius="md" 
              fontSize="sm" 
              w="100%"
              overflowX="auto"
            >
              <Code whiteSpace="pre-wrap" colorScheme="red">
                {error.technicalMessage}
              </Code>
            </Box>
          )}
          
          <Flex mt={4} gap={4}>
            <Button
              leftIcon={<RefreshCw size={18} />}
              colorScheme="blue"
              onClick={handleRetry}
            >
              Retry
            </Button>
            
            <Button
              variant="outline"
              onClick={handleGoBack}
            >
              Go Back
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleReload}
            >
              Reload Page
            </Button>
          </Flex>
        </VStack>
      </Box>
    </Flex>
  )
}

export default ErrorBoundary