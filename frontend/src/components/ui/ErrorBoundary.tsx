import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorState, { ErrorStateProps } from './ErrorState';

interface ErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  /** Custom fallback component to render when an error occurs */
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo, reset: () => void) => ReactNode);
  /** Whether to include stack traces in the error display */
  showDetails?: boolean;
  /** Called when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether the error is retryable */
  retryable?: boolean;
  /** Error type to display (passed to ErrorState) */
  errorType?: ErrorStateProps['type'];
  /** Custom error message (if not provided, uses error.message) */
  errorMessage?: string;
  /** Custom error title */
  errorTitle?: string;
  /** CSS class for the error state */
  className?: string;
  /** Whether to animate the error state */
  animate?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary component that catches JavaScript errors in its child component tree.
 * Displays a fallback UI when an error occurs.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; error: Error } {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Set errorInfo in state
    this.setState({ errorInfo });

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error caught by ErrorBoundary:', error);
      console.error('Component stack trace:', errorInfo.componentStack);
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { 
      children, 
      fallback, 
      showDetails = true,
      retryable = true,
      errorType = 'client',
      errorMessage,
      errorTitle,
      className,
      animate
    } = this.props;

    if (hasError && error) {
      // If a custom fallback component is provided, use it
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(error, errorInfo!, this.resetErrorBoundary);
        }
        return fallback;
      }

      // Otherwise use default ErrorState component
      return (
        <ErrorState
          title={errorTitle}
          message={errorMessage || error.message || 'An unexpected error occurred'}
          error={showDetails ? error : undefined}
          type={errorType}
          retryable={retryable}
          onRetry={this.resetErrorBoundary}
          className={className}
          animate={animate}
        />
      );
    }

    return children;
  }
}

export default ErrorBoundary;