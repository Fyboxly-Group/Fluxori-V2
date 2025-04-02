/**
 * Type declarations for react-error-boundary
 */

declare module 'react-error-boundary' {
  import { Component, ComponentType, ReactNode } from 'react';
  
  export interface FallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
  }
  
  export interface ErrorBoundaryProps {
    fallback?: ReactNode;
    FallbackComponent?: ComponentType<FallbackProps>;
    onError?: (error: Error, info: { componentStack: string }) => void;
    onReset?: () => void;
    resetKeys?: Array<any>;
    onResetKeysChange?: (
      prevResetKeys: Array<any> | undefined,
      resetKeys: Array<any> | undefined
    ) => void;
    children?: ReactNode;
  }
  
  export class ErrorBoundary extends Component<ErrorBoundaryProps> {}
  
  export function useErrorHandler(error?: Error): (error: Error) => void;
  
  export function withErrorBoundary<P extends {}>(
    Component: ComponentType<P>,
    errorBoundaryProps: ErrorBoundaryProps
  ): ComponentType<P>;
}