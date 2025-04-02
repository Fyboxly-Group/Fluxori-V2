'use client';

import { Container, Text, Title, Group, Breadcrumbs, Anchor, LoadingOverlay } from '@mantine/core';
import { IconChevronRight, IconHome, IconShoppingCart, IconChartBar } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { BuyBoxMonitoringDashboard } from '@/components/buybox/BuyBoxMonitoringDashboard';
import { getBuyBoxData } from './mock-data';
import { BuyBoxProduct, BuyBoxAnalytics } from '@/types/buybox';

export default function BuyBoxPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    products: BuyBoxProduct[];
    analytics: BuyBoxAnalytics;
  } | null>(null);
  
  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = getBuyBoxData();
      setData(result);
      setLoading(false);
    };
    
    fetchData();
  }, []);
  
  // Handle search
  const handleSearch = (searchTerm: string) => {
    console.log('Searching for:', searchTerm);
    // In a real app, you would filter data here or make an API request
  };
  
  // Handle filter changes
  const handleFilterChange = (filters: any) => {
    console.log('Filters changed:', filters);
    // In a real app, you would apply filters here or make an API request
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setLoading(true);
    
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const result = getBuyBoxData();
    setData(result);
    setLoading(false);
  };
  
  return (
    <Container fluid p="md">
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        <LoadingOverlay visible={loading} overlayBlur={2} />
        
        <Group position="apart" mb="lg">
          <div>
            <Title order={2} mb="xs">Buy Box Monitoring</Title>
            <Breadcrumbs separator={<IconChevronRight size={14} />}>
              <Anchor href="/" size="sm">
                <Group spacing={4}>
                  <IconHome size={14} />
                  <span>Home</span>
                </Group>
              </Anchor>
              <Anchor href="/dashboard" size="sm">
                <Group spacing={4}>
                  <IconChartBar size={14} />
                  <span>Dashboard</span>
                </Group>
              </Anchor>
              <Text size="sm">
                <Group spacing={4}>
                  <IconShoppingCart size={14} />
                  <span>Buy Box</span>
                </Group>
              </Text>
            </Breadcrumbs>
          </div>
        </Group>
        
        {data ? (
          <BuyBoxMonitoringDashboard 
            products={data.products}
            analytics={data.analytics}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            onRefresh={handleRefresh}
            loading={loading}
          />
        ) : !loading ? (
          <Text align="center" color="dimmed" size="lg" py="xl">
            No data available. Please try refreshing the page.
          </Text>
        ) : null}
      </div>
    </Container>
  );
}