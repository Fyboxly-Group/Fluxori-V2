'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Container, Title, Text, Skeleton, Stack } from '@mantine/core';
import AppShell from '@/components/Layout/AppShell';
import ProductForm from '@/features/inventory/components/ProductForm';
import useAuth from '@/hooks/useAuth';
import useAppStore from '@/store/useAppStore';
import { showSuccessNotification, showErrorNotification } from '@/utils/notifications';

// Mock inventory item (same as in the detail page)
const mockInventoryItem = {
  id: 'item-123',
  sku: 'SKU-1234',
  name: 'Wireless Earbuds Pro',
  description: 'High quality wireless earbuds with noise cancellation and 24-hour battery life. Includes charging case and multiple ear tip sizes for a perfect fit.',
  price: 89.99,
  costPrice: 45.50,
  taxable: true,
  taxRate: 15,
  categories: ['electronics', 'audio'],
  tags: ['bestseller', 'new'],
  barcode: '123456789012',
  weight: 0.3,
  weightUnit: 'kg',
  dimensions: {
    length: 10,
    width: 5,
    height: 3,
  },
  dimensionUnit: 'cm',
  inventoryTracking: true,
  lowStockThreshold: 10,
  stockQuantity: 24,
  status: 'active',
  brand: 'brand1',
  supplier: 'supplier1',
  manufacturerPartNumber: 'TB-WEP-001',
  images: [],
  variants: [],
  attributes: [],
};

/**
 * Edit Product page for updating existing inventory items
 */
export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { isAuthenticated, isLoading } = useAuth();
  const { setBreadcrumbs } = useAppStore();
  
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  
  // Update breadcrumbs when the component mounts
  useEffect(() => {
    setBreadcrumbs([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Inventory', href: '/inventory' },
      { label: product?.name || 'Loading...', href: `/inventory/${id}` },
      { label: 'Edit' },
    ]);
  }, [setBreadcrumbs, id, product]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Fetch product data
  useEffect(() => {
    if (id) {
      // Simulate API call
      setTimeout(() => {
        setProduct(mockInventoryItem);
        setLoading(false);
      }, 800);
    }
  }, [id]);
  
  // Handle form submission
  const handleSubmit = async (data: any) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Product updated:', data);
      
      // In a real app, you would submit this data to your API
      return data;
    } catch (error) {
      showErrorNotification(
        'Failed to update product',
        'There was an error saving the product. Please try again.'
      );
      throw error;
    }
  };
  
  if (isLoading || loading) {
    return (
      <AppShell title="Edit Product">
        <Container size="xl">
          <Stack spacing="xl">
            <Skeleton height={50} />
            <Skeleton height={600} />
          </Stack>
        </Container>
      </AppShell>
    );
  }
  
  if (!product) {
    return (
      <AppShell title="Product Not Found">
        <Container size="xl">
          <Title order={2}>Product Not Found</Title>
          <Text color="dimmed">
            The product you're trying to edit doesn't exist or has been removed.
          </Text>
        </Container>
      </AppShell>
    );
  }
  
  return (
    <AppShell title={`Edit: ${product.name}`}>
      <Container size="xl">
        <ProductForm 
          initialData={product}
          isEdit={true}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/inventory/${id}`)}
        />
      </Container>
    </AppShell>
  );
}