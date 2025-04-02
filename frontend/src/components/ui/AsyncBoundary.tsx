import React, { Suspense } from 'react';
import { Loader, Box, Center } from '@mantine/core';
import ErrorBoundary from './ErrorBoundary';

interface AsyncBoundaryProps {
  /** Child components to render */
  children: React.ReactNode;
  /** Custom loading component */
  fallbackComponent?: React.ReactNode;
  /** Custom error component */
  errorComponent?: React.ReactNode | ((error: Error, reset: () => void) => React.ReactNode);
  /** Called when an error occurs */
  onError?: (error: Error) => void;
  /** CSS class for the loader */
  className?: string;
  /** Whether errors should be retryable */
  retryable?: boolean;
  /** Additional props to pass to the error boundary */
  errorBoundaryProps?: Omit<React.ComponentProps<typeof ErrorBoundary>, 'children' | 'fallback' | 'onError'>;
}

/**
 * A component that combines Suspense and ErrorBoundary for handling async operations.
 * Useful for data fetching with React Query, SWR, or other async libraries.
 */
const AsyncBoundary: React.FC<AsyncBoundaryProps> = ({
  children,
  fallbackComponent,
  errorComponent,
  onError,
  className,
  retryable = true,
  errorBoundaryProps,
}) => {
  // Default loading component if none provided
  const defaultLoader = (
    <Center className={className} py="xl">
      <Loader size="md" variant="dots" />
    </Center>
  );

  // Handle error in a format the ErrorBoundary expects
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    if (onError) {
      onError(error);
    }
  };

  // Default error component if none provided
  const errorFallback = errorComponent 
    ? (typeof errorComponent === 'function' 
        ? (error: Error, errorInfo: React.ErrorInfo, reset: () => void) => errorComponent(error, reset)
        : errorComponent)
    : undefined;

  return (
    <ErrorBoundary
      fallback={errorFallback}
      onError={handleError}
      retryable={retryable}
      {...errorBoundaryProps}
    >
      <Suspense fallback={fallbackComponent || defaultLoader}>
        <Box className={className}>
          {children}
        </Box>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AsyncBoundary;