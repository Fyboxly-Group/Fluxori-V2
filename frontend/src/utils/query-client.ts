import { QueryClient } from '@tanstack/react-query';
import { AppError, ErrorCategory } from '@/api/api-client';

/**
 * Create a configured React Query client
 */
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Don't retry on certain error categories
          if (error instanceof AppError) {
            // Don't retry auth, validation, or permission errors
            if (
              error.category === ErrorCategory.AUTHENTICATION ||
              error.category === ErrorCategory.AUTHORIZATION ||
              error.category === ErrorCategory.VALIDATION
            ) {
              return false;
            }
            
            // Limit retries for other errors
            return failureCount < 2;
          }
          
          // Default retry behavior (3 times)
          return failureCount < 3;
        },
        staleTime: 60 * 1000, // 1 minute
      },
      mutations: {
        retry: (failureCount, error) => {
          // Only retry network errors for mutations
          if (error instanceof AppError) {
            if (error.category === ErrorCategory.NETWORK) {
              return failureCount < 2;
            }
            return false;
          }
          return failureCount < 1;
        },
      },
    },
  });
};

export default createQueryClient;