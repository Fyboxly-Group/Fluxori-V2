/**
 * Query utility functions and hooks
 */
/// <reference path="../types/module-declarations.d.ts" />

import React from 'react';
import { createToaster } from '@/utils/chakra-compat';;;

// Default error handler for mutations
export const defaultMutationErrorHandler = (error: any, options?: any) => {
  const toast = createToaster();
  
  // Display error toast
  toast({
    title: options?.title || 'An error occurred',
    description: options?.description || error?.message || 'Please try again',
    status: 'error',
    duration: 5000,
    isClosable: true,
  });
  
  // Log error
  console.error('[Mutation Error]', error);
  
  return { error };
};

/**
 * Options for creating a mutation with toast notifications
 */
export type CreateMutationWithToastOptions = {
  successTitle?: string;
  successDescription?: string;
  errorTitle?: string;
  errorDescription?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  toastDuration?: number;
  onSuccess?: (...args: any[]) => void;
  onError?: (...args: any[]) => void;
  onSettled?: (...args: any[]) => void;
  [key: string]: any;
};

/**
 * Create mutation options with toast notifications
 */
// @ts-ignore - Complex generic type
export const createMutationWithToast = (options: CreateMutationWithToastOptions = {}) => {
  const {
    successTitle = 'Operation successful',
    successDescription = '',
    errorTitle = 'An error occurred',
    errorDescription = 'Please try again',
    showSuccessToast = true,
    showErrorToast = true,
    toastDuration = 5000,
    onSuccess,
    onError,
    onSettled,
    ...restOptions
  } = options;

  // @ts-ignore - Complex event handler types
  return {
    ...restOptions,
    onSuccess: (data: any, variables: any, context: any) => {
      if (showSuccessToast) {
        const toast = createToaster();
        toast({
          title: successTitle,
          description: successDescription,
          status: 'success',
          duration: toastDuration,
          isClosable: true,
        });
      }
      
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    onError: (error: any, variables: any, context: any) => {
      if (showErrorToast) {
        const toast = createToaster();
        toast({
          title: errorTitle,
          description: errorDescription || error?.message,
          status: 'error',
          duration: toastDuration,
          isClosable: true,
        });
      }
      
      console.error('[Mutation Error]', error);
      
      if (onError) {
        onError(error, variables, context);
      }
    },
    onSettled: (data: any, error: any, variables: any, context: any) => {
      if (onSettled) {
        onSettled(data, error, variables, context);
      }
    }
  };
};

/**
 * Options for creating a query with toast notifications
 */
export type CreateQueryWithToastOptions = {
  errorTitle?: string;
  errorDescription?: string;
  showErrorToast?: boolean;
  toastDuration?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onSettled?: (data: any, error: any) => void;
  [key: string]: any;
};

/**
 * Create query options with toast notifications
 */
// @ts-ignore - Complex generic type
export const createQueryWithToast = (options: CreateQueryWithToastOptions = {}) => {
  const {
    errorTitle = 'An error occurred',
    errorDescription = 'Please try again',
    showErrorToast = true,
    toastDuration = 5000,
    onSuccess,
    onError,
    onSettled,
    ...restOptions
  } = options;

  // @ts-ignore - Complex event handler types
  return {
    ...restOptions,
    onSuccess: (data: any) => {
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error: any) => {
      if (showErrorToast) {
        const toast = createToaster();
        toast({
          title: errorTitle,
          description: errorDescription || error?.message,
          status: 'error',
          duration: toastDuration,
          isClosable: true,
        });
      }
      
      console.error('[Query Error]', error);
      
      if (onError) {
        onError(error);
      }
    },
    onSettled: (data: any, error: any) => {
      if (onSettled) {
        onSettled(data, error);
      }
    }
  };
};

// Create query client
export const createQueryClient = () => ({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
