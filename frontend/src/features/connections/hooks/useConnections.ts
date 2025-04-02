/// <reference path="../../../types/module-declarations.d.ts" />
import React from 'react';
import { createToaster } from '@/utils/chakra-compat';;;
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getConnections,
  getConnectionById,
  createConnection,
  deleteConnection,
  testConnection,
  getConnectionStatuses,
  CreateConnectionPayload,
  Connection,
} from '../../../api/connections.api';
// @ts-ignore - Fix for missing toast import
;
import { AppError, ErrorCategory } from '@/utils/error.utils';
import { useQueryClient } from '@tanstack/react-query';
import { enhanceQueryOptions, enhanceMutationOptions } from '@/utils/chakra-compat';
import { captureException } from '@/utils/monitoring.utils';

interface useConnectionsProps {}


/**
 * Hook for connection-related operations with enhanced error handling
 */
export const useConnections = () => {
  const toast = createToaster();

  /**
   * Get all connections
   */
  const useAllConnections = () => {
    return useQuery({
      queryKey: ['connections'],
      queryFn: async () =>  async () =>  async () =>  async () =>  async () =>  async () => {
        return await getConnections();
      },
      select: (response: any) => (response as any).data,
      ...enhanceQueryOptions({
        meta: {
          // Custom error handling for this query
          onError: (error: AppError) => {
            if (error.category === ErrorCategory.NETWORK) {
              // Specific handling for network errors
              toast({
                title: 'Connection Error',
                description: 'Unable to retrieve connections due to network issues. Please check your connection.',
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
            }
          }
        }
      })
    });
  };

  /**
   * Get a specific connection by ID
   */
  const useConnection = (connectionId: string) => {
    return useQuery({
      queryKey: ['connections', connectionId],
      queryFn: async () =>  async () =>  async () =>  async () =>  async () =>  async () => {
        return await getConnectionById(connectionId);
      },
      select: (response: any) => (response as any).data,
      enabled: Boolean(connectionId),
      ...enhanceQueryOptions({
        meta: {
          showErrorToast: true // Show standard error toast
        }
      })
    });
  };

  /**
   * Create a new connection
   */
  const useCreateConnection = () => {
    return useMutation({
      mutationFn: async (data: CreateConnectionPayload) => {
        return await createConnection(data);
      },
      onSuccess: () => {
        queryClient().invalidateQueries({ queryKey: ['connections'] });
        toast({
          title: 'Success',
          description: 'Connection created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
      ...enhanceMutationOptions({
        // Custom error handling based on error category
        onError: (error: AppError, variables) => {
          // Log specific marketplace connection failures
          if (error.category === ErrorCategory.MARKETPLACE) {
            captureException(error, {
              marketplaceId: variables.marketplaceId,
              operation: 'createConnection',
            });
            
            toast({
              title: 'Marketplace Connection Failed',
              description: `Could not connect to ${variables.marketplaceId}. Please check your credentials and try again.`,
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          } else if (error.category === ErrorCategory.VALIDATION) {
            // Handle validation errors specifically
            toast({
              title: 'Validation Error',
              description: 'Please check your connection details and try again.',
              status: 'warning',
              duration: 5000,
              isClosable: true,
            });
          }
          // Other errors handled by default error handlers
        }
      })
    });
  };

  /**
   * Delete a connection
   */
  const useDeleteConnection = () => {
    return useMutation({
      mutationFn: async (connectionId: string) => {
        return await deleteConnection(connectionId);
      },
      onSuccess: () => {
        queryClient().invalidateQueries({ queryKey: ['connections'] });
        toast({
          title: 'Success',
          description: 'Connection deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
      ...enhanceMutationOptions({
        retry: 1, // Less retries for deletion operations
        meta: {
          showErrorToast: true
        }
      })
    });
  };

  /**
   * Test a connection
   */
  const useTestConnection = () => {
    return useMutation({
      mutationFn: async (connectionId: string) => {
        return await testConnection(connectionId);
      },
      onSuccess: (data: any) => {
        queryClient().invalidateQueries({ queryKey: ['connections'] });
        toast({
          title: data.success ? 'Connection Test Successful' : 'Connection Test Warning',
          description: data.message,
          status: data.success ? 'success' : 'warning',
          duration: 5000,
          isClosable: true,
        });
      },
      ...enhanceMutationOptions({
        // Implement progressive backoff retry for test connection
        retry: (failureCount, error: AppError) => {
          // Retry marketplace errors up to 2 times with backoff
          if (error.category === ErrorCategory.MARKETPLACE && failureCount < 2) {
            return true;
          }
          // Retry network errors up to 3 times
          if (error.category === ErrorCategory.NETWORK && failureCount < 3) {
            return true;
          }
          return false;
        },
        onError: (error: AppError, connectionId) => {
          // Custom error handling based on error details
          if (error.category === ErrorCategory.AUTHENTICATION) {
            toast({
              title: 'Authentication Failed',
              description: 'Your marketplace credentials are invalid or have expired. Please update your connection.',
              status: 'error',
              duration: 7000,
              isClosable: true,
            });
          } else if (error.category === ErrorCategory.API_LIMIT) {
            toast({
              title: 'API Rate Limit Exceeded',
              description: `The marketplace API rate limit was reached. Please try again in ${Math.ceil((error.retryAfter || 60000) / 60000)} minutes.`,
              status: 'warning',
              duration: 7000,
              isClosable: true,
            });
          }
          // Report all test connection errors to monitoring
          captureException(error, { connectionId });
        }
      })
    });
  };

  /**
   * Get connection statuses for dashboard widget
   */
  const useConnectionStatuses = (refetchInterval: any = 60000) => {
    return useQuery({
      queryKey: ['connections', 'statuses'],
      queryFn: async () =>  async () =>  async () =>  async () =>  async () =>  async () => {
        return await getConnectionStatuses();
      },
      select: (response: any) => (response as any).data,
      refetchInterval: refetchInterval, // Auto-refresh every minute by default
      ...enhanceQueryOptions({
        // Only retry server errors, not client errors
        retry: (count, error: AppError) => {
          return error.statusCode && error.statusCode >= 500 && count < 2;
        },
        meta: {
          // Don't show toast for background status updates
          showErrorToast: false
        }
      })
    });
  };

  return {
    useAllConnections,
    useConnection,
    useCreateConnection,
    useDeleteConnection,
    useTestConnection,
    useConnectionStatuses,
  };
};

export default useConnections;