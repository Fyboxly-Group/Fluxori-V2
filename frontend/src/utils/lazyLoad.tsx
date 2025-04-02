import React, { lazy, Suspense, ComponentType } from 'react';
import { Box, Skeleton, Loader, Center } from '@mantine/core';

// Types for lazy loading options
interface LazyLoadOptions {
  /** Fallback component to display while loading */
  fallback?: React.ReactNode;
  /** Whether to preload the component */
  preload?: boolean;
  /** Whether to include the component in server-side rendering */
  ssr?: boolean;
  /** Error boundary for handling load errors */
  errorBoundary?: boolean;
  /** Loading delay to prevent flashing for fast connections */
  loadingDelay?: number;
  /** Priority for loading (high priority loads immediately) */
  priority?: 'high' | 'low' | 'idle';
  /** Performance budget in milliseconds - logs warning if component takes longer to load */
  perfBudget?: number;
  /** Whether to retry loading on failure */
  retry?: boolean | number;
}

/**
 * Enhanced lazy loader with preloading and SSR options
 */
export function lazyLoad<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
) {
  const {
    fallback,
    preload = false,
    ssr = true,
    errorBoundary = true,
    loadingDelay = 200,
    priority = 'low',
    perfBudget = 1000,
    retry = false
  } = options;

  // Create the lazy component
  const LazyComponent = lazy(factory);

  // Preload the component based on priority
  if (typeof window !== 'undefined') {
    // Always preload high priority components
    if (priority === 'high' || preload) {
      factory();
    } else if (priority === 'low') {
      // Low priority: load when browser is idle
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => factory());
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => factory(), 1000);
      }
    } else if (priority === 'idle') {
      // Idle priority: load after a delay when browser is idle
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => factory(), { timeout: 2000 });
      } else {
        setTimeout(() => factory(), 2000);
      }
    }
  }

  // Create default loading component
  const DefaultLoading = () => (
    <Box p="md">
      <Skeleton height={100} radius="md" animate={true} />
    </Box>
  );

  // Create a wrapper component to handle loading state and errors
  const LoadableComponent = (props: React.ComponentProps<T>) => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<Error | null>(null);
    const [loadAttempts, setLoadAttempts] = React.useState(0);
    const loadStartTimeRef = React.useRef<number>(0);
    
    // Performance tracking
    React.useEffect(() => {
      if (typeof window !== 'undefined' && perfBudget > 0) {
        loadStartTimeRef.current = performance.now();
        
        return () => {
          const loadTime = performance.now() - loadStartTimeRef.current;
          if (loadTime > perfBudget) {
            console.warn(
              `Component ${LoadableComponent.displayName} took ${loadTime.toFixed(2)}ms to load, ` +
              `which exceeds the performance budget of ${perfBudget}ms.`
            );
          }
        };
      }
    }, []);

    // Handle loading delay to prevent flickering
    React.useEffect(() => {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, loadingDelay);

      return () => clearTimeout(timer);
    }, []);
    
    // Handle retry logic
    const handleRetry = React.useCallback(() => {
      const maxRetries = typeof retry === 'number' ? retry : 3;
      if (retry && loadAttempts < maxRetries) {
        setLoadAttempts(prev => prev + 1);
        setError(null);
        // Force re-render of the lazy component
        factory().catch(newError => setError(newError));
      }
    }, [loadAttempts]);

    // Show delayed loading state
    if (isLoading) {
      return fallback ? <>{fallback}</> : <DefaultLoading />;
    }

    // Handle error state
    if (error && errorBoundary) {
      return (
        <Box p="md" style={{ color: 'red' }}>
          <div>Error loading component: {error.message}</div>
          {retry && loadAttempts < (typeof retry === 'number' ? retry : 3) && (
            <button 
              onClick={handleRetry}
              style={{ 
                marginTop: '10px', 
                padding: '5px 10px',
                cursor: 'pointer'
              }}
            >
              Retry ({loadAttempts + 1}/{typeof retry === 'number' ? retry : 3})
            </button>
          )}
        </Box>
      );
    }

    // Render the component with error handling
    return (
      <ErrorBoundary onError={setError} onRetry={handleRetry} canRetry={!!retry}>
        <Suspense fallback={fallback || <DefaultLoading />}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };

  // Add displayName for debugging
  const componentName = factory.toString().match(/\/\* import\("(.+)"\) \*\//)?.[1] || 'LazyComponent';
  LoadableComponent.displayName = `Lazy(${componentName})`;

  return LoadableComponent;
}

/**
 * Enhanced error boundary component with retry support
 */
interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError: (error: Error) => void;
  onRetry?: () => void;
  canRetry?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { 
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to an error reporting service
    console.error('Component error:', error, errorInfo);
    this.props.onError(error);
    
    // Track error in analytics if available
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'error', {
        'event_category': 'component_error',
        'event_label': error.message,
        'value': 1
      });
    }
  }
  
  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  }

  render() {
    if (this.state.hasError) {
      // Parent component will handle displaying the error
      if (!this.props.canRetry) {
        return null;
      }
      
      // Show retry button if retry is enabled
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ color: 'red', marginBottom: '10px' }}>
            Component failed to load
          </div>
          <button
            onClick={this.handleRetry}
            style={{
              padding: '5px 15px',
              background: '#f0f0f0',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Preload a component in advance (e.g., on hover or when likely to be needed)
 */
export function preloadComponent(
  factory: () => Promise<{ default: any }>,
  priority: 'high' | 'low' | 'idle' = 'high'
) {
  if (typeof window !== 'undefined') {
    if (priority === 'high') {
      return factory();
    } else if (priority === 'low') {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => factory());
      } else {
        setTimeout(() => factory(), 300);
      }
    } else if (priority === 'idle') {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => factory(), { timeout: 2000 });
      } else {
        setTimeout(() => factory(), 1000);
      }
    }
  }
  return Promise.resolve();
}

/**
 * Preload multiple components based on a pattern (e.g., for routes likely to be accessed)
 */
export function preloadComponents(factories: Array<() => Promise<{ default: any }>>, priority: 'high' | 'low' | 'idle' = 'low') {
  if (typeof window !== 'undefined') {
    if (priority === 'high') {
      return Promise.all(factories.map(factory => factory()));
    } else {
      // Load components sequentially with small delays to avoid resource contention
      let delay = 0;
      factories.forEach(factory => {
        setTimeout(() => preloadComponent(factory, priority), delay);
        delay += 150; // Stagger by 150ms
      });
    }
  }
  return Promise.resolve();
}

/**
 * Create a common loading fallback
 */
export const LoadingFallback: React.FC<{ height?: number | string; text?: string }> = ({
  height = 200,
  text = 'Loading...',
}) => (
  <Center style={{ height }}>
    <Box sx={{ textAlign: 'center' }}>
      <Loader size="md" variant="dots" />
      <Box mt="xs">{text}</Box>
    </Box>
  </Center>
);

/**
 * React Hook for link prefetching - use on navigation elements to preload pages when hovering
 */
export function useLinkPrefetch(
  componentFactory: () => Promise<{ default: any }>,
  options: { delay?: number; priority?: 'high' | 'low' | 'idle' } = {}
) {
  const { delay = 150, priority = 'low' } = options;
  const timeoutRef = React.useRef<number | null>(null);
  
  const handlePrefetch = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      timeoutRef.current = window.setTimeout(() => {
        preloadComponent(componentFactory, priority);
      }, delay);
    }
  }, [componentFactory, delay, priority]);
  
  const handleCancelPrefetch = React.useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  
  return {
    onMouseEnter: handlePrefetch,
    onFocus: handlePrefetch, 
    onMouseLeave: handleCancelPrefetch,
    onBlur: handleCancelPrefetch
  };
}

export default {
  lazyLoad,
  preloadComponent,
  preloadComponents,
  LoadingFallback,
  useLinkPrefetch
};