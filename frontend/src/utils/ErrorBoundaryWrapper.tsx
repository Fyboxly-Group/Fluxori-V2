import React from 'react';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import AsyncBoundary from '../components/ui/AsyncBoundary';
import { errorReporting } from './monitoring';

type ErrorBoundaryWrapperProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  suspenseFallback?: React.ReactNode;
  withSuspense?: boolean;
  id?: string;
  onError?: (error: Error, info: React.ErrorInfo) => void;
};

/**
 * Wrapper component that combines error boundary and optional suspense boundary.
 * This makes it easy to consistently wrap components with error handling.
 */
export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({
  children,
  fallback,
  suspenseFallback,
  withSuspense = false,
  id,
  onError,
}) => {
  // Handle reporting errors to the monitoring service
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Report to monitoring service
    errorReporting.reportError(error, {
      context: {
        component: id || 'unknown',
        additionalData: {
          componentStack: errorInfo.componentStack
        }
      }
    });
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
  };

  // If suspense is needed (for code splitting or async data), use AsyncBoundary
  if (withSuspense) {
    return (
      <AsyncBoundary 
        fallbackComponent={suspenseFallback}
        errorComponent={fallback}
        onError={handleError}
        errorBoundaryProps={{
          errorType: 'client',
          showDetails: process.env.NODE_ENV !== 'production'
        }}
      >
        {children}
      </AsyncBoundary>
    );
  }

  // Otherwise use regular ErrorBoundary
  return (
    <ErrorBoundary
      fallback={typeof fallback === 'function' ? fallback : fallback}
      onError={handleError}
      errorType="client"
      showDetails={process.env.NODE_ENV !== 'production'}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * Higher-order component that wraps a component with error boundaries
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ErrorBoundaryWrapperProps, 'children'> = {}
) => {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const WrappedComponent = (props: P) => {
    return (
      <ErrorBoundaryWrapper {...options} id={displayName}>
        <Component {...props} />
      </ErrorBoundaryWrapper>
    );
  };
  
  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;
  
  return WrappedComponent;
};

export default {
  ErrorBoundaryWrapper,
  withErrorBoundary
};