'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Text,
  Group,
  Button,
  Badge,
  Card,
  Grid,
  Paper,
  Stack,
  Skeleton,
  Box,
  RingProgress,
  SimpleGrid,
  ActionIcon,
  ThemeIcon,
  rem,
  Avatar,
} from '@mantine/core';
import AppShell from '@/components/Layout/AppShell';
import DataTable from '@/components/DataTable/DataTable';
import AnimatedCard from '@/components/Card/AnimatedCard';
import { useAnimatedMount, useStaggerAnimation } from '@/hooks/useAnimation';
import { fadeInUp, scaleIn } from '@/animations/gsap';
import useAuth from '@/hooks/useAuth';
import useAppStore from '@/store/useAppStore';
import { notifications } from '@mantine/notifications';
import { 
  IconPlus, 
  IconPackage, 
  IconTruckDelivery, 
  IconAlertTriangle, 
  IconArrowUp, 
  IconArrowDown, 
  IconCloudUpload, 
  IconSettings, 
  IconChartBar, 
  IconEye,
  IconEdit,
  IconTrash,
  IconTags,
  IconTargetArrow,
  IconShieldCheck,
} from '@tabler/icons-react';

// Mock inventory data
const mockInventory = Array(50)
  .fill(0)
  .map((_, index) => ({
    id: `item-${index + 1}`,
    sku: `SKU-${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`,
    name: [
      'Wireless Earbuds',
      'Smart Watch',
      'Bluetooth Speaker',
      'Power Bank',
      'Laptop Stand',
      'Keyboard',
      'Mouse',
      'Monitor',
      'Headphones',
      'Webcam',
    ][Math.floor(Math.random() * 10)],
    category: [
      'Electronics',
      'Accessories',
      'Audio',
      'Computing',
      'Wearables',
    ][Math.floor(Math.random() * 5)],
    stock: Math.floor(Math.random() * 100),
    price: (Math.random() * 200 + 10).toFixed(2),
    status: ['In Stock', 'Low Stock', 'Out of Stock'][
      Math.floor(Math.random() * 3)
    ],
    supplier: [
      'TechSupplies Inc.',
      'ElectroDistributors',
      'GlobalGadgets',
      'PrimeTech',
      'SuperSource',
    ][Math.floor(Math.random() * 5)],
    lastUpdated: new Date(
      Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
    ).toISOString(),
  }));

export default function InventoryPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { setBreadcrumbs } = useAppStore();
  
  // State for the page
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState(mockInventory);
  const [selectedItems, setSelectedItems] = useState<typeof mockInventory>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Update breadcrumbs when the component mounts
  useEffect(() => {
    setBreadcrumbs([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Inventory' },
    ]);
  }, [setBreadcrumbs]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Animation refs
  const headingRef = useAnimatedMount('fadeInUp', { duration: 0.8 });
  const statsRef = useStaggerAnimation({ stagger: 0.1, delay: 0.3 });
  
  // Table columns
  const columns = [
    {
      key: 'sku',
      title: 'SKU',
      sortable: true,
      filterable: true,
      width: 120,
    },
    {
      key: 'name',
      title: 'Product',
      sortable: true,
      filterable: true,
      render: (item: typeof mockInventory[0]) => (
        <Group spacing="sm">
          <Avatar color="blue" radius="md" size="sm">
            {item.name.substring(0, 1)}
          </Avatar>
          <Text size="sm" weight={500}>
            {item.name}
          </Text>
        </Group>
      ),
    },
    {
      key: 'category',
      title: 'Category',
      sortable: true,
      filterable: true,
      render: (item: typeof mockInventory[0]) => (
        <Badge size="sm" color="blue" variant="outline">
          {item.category}
        </Badge>
      ),
    },
    {
      key: 'stock',
      title: 'Stock',
      sortable: true,
      render: (item: typeof mockInventory[0]) => {
        let color = 'green';
        if (item.stock < 10) color = 'red';
        else if (item.stock < 30) color = 'orange';
        
        return (
          <Text size="sm" color={color} weight={500}>
            {item.stock}
          </Text>
        );
      },
    },
    {
      key: 'price',
      title: 'Price',
      sortable: true,
      render: (item: typeof mockInventory[0]) => (
        <Text size="sm">${parseFloat(item.price).toFixed(2)}</Text>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      filterable: true,
      render: (item: typeof mockInventory[0]) => {
        const colorMap = {
          'In Stock': 'green',
          'Low Stock': 'orange',
          'Out of Stock': 'red',
        };
        
        return (
          <Badge
            color={colorMap[item.status as keyof typeof colorMap]}
            variant={item.status === 'Out of Stock' ? 'filled' : 'light'}
            size="sm"
          >
            {item.status}
          </Badge>
        );
      },
    },
    {
      key: 'supplier',
      title: 'Supplier',
      sortable: true,
      filterable: true,
    },
    {
      key: 'lastUpdated',
      title: 'Last Updated',
      sortable: true,
      render: (item: typeof mockInventory[0]) => (
        <Text size="xs" color="dimmed">
          {new Date(item.lastUpdated).toLocaleDateString()}
        </Text>
      ),
    },
  ];
  
  // Table handlers
  const handleRowClick = (item: typeof mockInventory[0]) => {
    router.push(`/inventory/${item.id}`);
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
    // In a real app, this would trigger an API call with the search query
  };
  
  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortBy(key);
    setSortDirection(direction);
    // In a real app, this would trigger an API call with sorting parameters
  };
  
  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;
    
    setInventory(inventory.filter(item => !selectedItems.find(selected => selected.id === item.id)));
    
    notifications.show({
      title: 'Items deleted',
      message: `${selectedItems.length} items deleted successfully`,
      color: 'red',
    });
    
    setSelectedItems([]);
  };
  
  // Stats cards data
  const statsData = [
    {
      title: 'Total Products',
      value: inventory.length,
      icon: IconPackage,
      color: 'blue',
      change: 5.2,
      changeType: 'increase',
    },
    {
      title: 'Low Stock Items',
      value: inventory.filter(item => item.status === 'Low Stock').length,
      icon: IconAlertTriangle,
      color: 'orange',
      change: -2.1,
      changeType: 'decrease',
    },
    {
      title: 'Out of Stock',
      value: inventory.filter(item => item.status === 'Out of Stock').length,
      icon: IconTruckDelivery,
      color: 'red',
      change: 0,
      changeType: 'neutral',
    },
  ];
  
  // If loading auth, show loading state
  if (isLoading) {
    return null; // Or a loading spinner
  }
  
  return (
    <AppShell title="Inventory">
      <Container size="xl">
        <Stack spacing="xl">
          <Box ref={headingRef}>
            <Group position="apart" mb="md">
              <div>
                <Title order={2}>Inventory Management</Title>
                <Text color="dimmed">
                  Manage your products, stock levels, and suppliers
                </Text>
              </div>
              
              <Group>
                <Button 
                  leftIcon={<IconCloudUpload size={16} />} 
                  variant="outline"
                >
                  Import
                </Button>
                <Button 
                  leftIcon={<IconPlus size={16} />} 
                  onClick={() => router.push('/inventory/new')}
                >
                  Add Product
                </Button>
              </Group>
            </Group>
          </Box>
          
          <SimpleGrid
            cols={3}
            spacing="lg"
            breakpoints={[
              { maxWidth: 'md', cols: 2 },
              { maxWidth: 'xs', cols: 1 },
            ]}
            ref={statsRef}
          >
            {statsData.map((stat, index) => (
              <AnimatedCard
                key={stat.title}
                p="lg"
                entranceAnimation="fadeInUp"
                animationDelay={0.1 * index}
              >
                <Group position="apart" noWrap>
                  <div>
                    <Text size="xs" color="dimmed">
                      {stat.title}
                    </Text>
                    <Title order={3} weight={700}>
                      {stat.value}
                    </Title>
                    
                    <Group spacing="xs" mt={4}>
                      {stat.changeType !== 'neutral' ? (
                        <Text 
                          size="xs" 
                          color={stat.changeType === 'increase' ? 'green' : 'red'}
                          weight={500}
                        >
                          {stat.changeType === 'increase' ? (
                            <IconArrowUp size={14} style={{ display: 'inline' }} />
                          ) : (
                            <IconArrowDown size={14} style={{ display: 'inline' }} />
                          )}
                          {' '}
                          {Math.abs(stat.change).toFixed(1)}%
                        </Text>
                      ) : (
                        <Text size="xs" color="dimmed">
                          No change
                        </Text>
                      )}
                      <Text size="xs" color="dimmed">
                        from last month
                      </Text>
                    </Group>
                  </div>
                  
                  <ThemeIcon
                    size={48}
                    radius="md"
                    color={stat.color}
                  >
                    <stat.icon size={24} />
                  </ThemeIcon>
                </Group>
              </AnimatedCard>
            ))}
          </SimpleGrid>
          
          {/* Actions for selected items */}
          {selectedItems.length > 0 && (
            <Group spacing="sm">
              <Text size="sm">
                {selectedItems.length} items selected
              </Text>
              <Button 
                variant="outline" 
                size="xs"
                onClick={() => setSelectedItems([])}
              >
                Clear selection
              </Button>
              <Button 
                variant="outline" 
                color="blue" 
                size="xs"
                leftIcon={<IconCloudUpload size={14} />}
              >
                Update Marketplaces
              </Button>
              <Button 
                variant="outline" 
                color="red" 
                size="xs"
                leftIcon={<IconTrash size={14} />}
                onClick={handleDeleteSelected}
              >
                Delete
              </Button>
            </Group>
          )}
          
          {/* Data Table */}
          <DataTable
            data={inventory.slice((page - 1) * limit, page * limit)}
            columns={columns}
            loading={loading}
            selectable
            onRowClick={handleRowClick}
            onSelect={setSelectedItems}
            searchable
            onSearch={handleSearch}
            onSort={handleSort}
            showRowNumbers
            pagination={{
              page,
              total: inventory.length,
              limit,
              onPageChange: setPage,
              onLimitChange: setLimit,
            }}
            actions={{
              view: true,
              edit: true,
              delete: true,
              custom: [
                {
                  label: 'Push to Marketplaces',
                  icon: <IconCloudUpload size={14} />,
                  onClick: (item) => {
                    notifications.show({
                      title: 'Product pushed',
                      message: `Product ${item.name} pushed to marketplaces`,
                      color: 'green',
                    });
                  },
                },
                {
                  label: 'Manage Stock',
                  icon: <IconTargetArrow size={14} />,
                  onClick: (item) => {
                    router.push(`/inventory/${item.id}/stock`);
                  },
                },
              ],
            }}
          />
        </Stack>
      </Container>
    </AppShell>
  );
}