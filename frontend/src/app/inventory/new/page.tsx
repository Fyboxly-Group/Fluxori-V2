'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Title, Text } from '@mantine/core';
import AppShell from '@/components/Layout/AppShell';
import ProductForm from '@/features/inventory/components/ProductForm';
import useAuth from '@/hooks/useAuth';
import useAppStore from '@/store/useAppStore';

/**
 * New Product page for creating new inventory items
 */
export default function NewProductPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { setBreadcrumbs } = useAppStore();
  
  // Update breadcrumbs when the component mounts
  useEffect(() => {
    setBreadcrumbs([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Inventory', href: '/inventory' },
      { label: 'New Product' },
    ]);
  }, [setBreadcrumbs]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Handle form submission
  const handleSubmit = async (data: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Product created:', data);
    
    // In a real app, you would submit this data to your API
    return data;
  };
  
  if (isLoading) {
    return null; // Or a loading spinner
  }
  
  return (
    <AppShell title="New Product">
      <Container size="xl">
        <ProductForm 
          onSubmit={handleSubmit}
          onCancel={() => router.push('/inventory')}
        />
      </Container>
    </AppShell>
  );
}