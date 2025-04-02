'use client';

import React from 'react';

/**
 * Temporary component to fix circular dependencies in Chakra UI imports
 * This should be removed once the import patterns are fully normalized
 */

// Import directly from @chakra-ui/react
const ChakraUI = require('@chakra-ui/react');

export const CloseButton = (props: any) => {
  return <ChakraUI.CloseButton {...props} />;
};

export const useToast = () => {
  const toast = ChakraUI.useToast();
  return {
    ...toast,
    show: (options: any) => toast(options)
  };
};

export const useCredits = () => {
  // Mock implementation
  return {
    balance: 0,
    history: [],
    loading: false,
    error: null,
    refetch: () => {},
    purchaseCredits: async (id: string) => ({ success: true, redirectUrl: '' })
  };
};

export const useToastNotifications = () => {
  const toast = useToast();
  return {
    showSuccess: (title: string, description?: string) => 
      toast({ title, description, status: 'success', duration: 3000 }),
    showError: (title: string, description?: string) => 
      toast({ title, description, status: 'error', duration: 5000 }),
    showInfo: (title: string, description?: string) => 
      toast({ title, description, status: 'info', duration: 3000 }),
    showWarning: (title: string, description?: string) => 
      toast({ title, description, status: 'warning', duration: 4000 })
  };
};