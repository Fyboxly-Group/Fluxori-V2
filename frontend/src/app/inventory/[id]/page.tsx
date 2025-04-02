'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Tabs,
  Image,
  Divider,
  ActionIcon,
  Timeline,
  List,
  ThemeIcon,
  Modal,
  SimpleGrid,
  Progress,
  Table,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import AppShell from '@/components/Layout/AppShell';
import { useAnimatedMount, useStaggerAnimation } from '@/hooks/useAnimation';
import { fadeInUp, scaleIn } from '@/animations/gsap';
import useAuth from '@/hooks/useAuth';
import useAppStore from '@/store/useAppStore';
import { notifications } from '@mantine/notifications';
import { 
  IconPencil,
  IconTrash,
  IconUpload,
  IconChartLine,
  IconPackage,
  IconTags,
  IconTruckDelivery,
  IconHistory,
  IconInfoCircle,
  IconCheck,
  IconAlertTriangle,
  IconX,
  IconExternalLink,
  IconUpload as IconCloudUpload,
  IconReceipt,
  IconBuilding,
  IconShoppingCart,
  IconBarcode,
  IconRuler,
  IconWeight,
  IconFileInvoice,
  IconArrowRight,
  IconArrowDownRight,
  IconArrowUpRight,
} from '@tabler/icons-react';
import { showSuccessNotification, showErrorNotification } from '@/utils/notifications';

// Mock inventory item data (in a real app, you'd fetch this)
const mockInventoryItem = {
  id: 'item-123',
  sku: 'SKU-1234',
  name: 'Wireless Earbuds Pro',
  description: 'High quality wireless earbuds with noise cancellation and 24-hour battery life. Includes charging case and multiple ear tip sizes for a perfect fit.',
  price: 89.99,
  costPrice: 45.50,
  taxable: true,
  taxRate: 15,
  categories: ['Electronics', 'Audio'],
  tags: ['Bestseller', 'New'],
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
  brand: 'TechBrand',
  supplier: 'TechSupplies Inc.',
  manufacturerPartNumber: 'TB-WEP-001',
  images: [
    'https://placehold.co/400x400/2563EB/FFFFFF/png?text=Earbuds+1',
    'https://placehold.co/400x400/2563EB/FFFFFF/png?text=Earbuds+2',
    'https://placehold.co/400x400/2563EB/FFFFFF/png?text=Earbuds+3',
  ],
  warehouseLocations: [
    { id: 'wh1', name: 'Main Warehouse', quantity: 18 },
    { id: 'wh2', name: 'Secondary Warehouse', quantity: 6 },
  ],
  marketplaceStatus: [
    { id: 'amz', name: 'Amazon', status: 'Active', lastUpdated: '2023-06-15T10:30:00Z', stockLevel: 24, price: 89.99 },
    { id: 'ebay', name: 'eBay', status: 'Active', lastUpdated: '2023-06-14T16:45:00Z', stockLevel: 24, price: 92.99 },
    { id: 'shopify', name: 'Shopify', status: 'Active', lastUpdated: '2023-06-15T09:15:00Z', stockLevel: 24, price: 89.99 },
  ],
  history: [
    { id: 'h1', date: '2023-06-15T10:30:00Z', action: 'Stock Update', description: 'Stock increased by 10 units', user: 'John Smith' },
    { id: 'h2', date: '2023-06-14T16:45:00Z', action: 'Price Update', description: 'Price changed from $79.99 to $89.99', user: 'Jane Doe' },
    { id: 'h3', date: '2023-06-10T09:15:00Z', action: 'Marketplace Update', description: 'Product pushed to Amazon', user: 'John Smith' },
    { id: 'h4', date: '2023-06-05T14:20:00Z', action: 'Product Created', description: 'Product was created', user: 'Jane Doe' },
  ],
  salesData: {
    last30Days: 42,
    lastMonth: 38,
    change: 10.5,
    revenue: 3779.58,
    channels: [
      { name: 'Amazon', sales: 25, percentage: 59.5 },
      { name: 'eBay', sales: 10, percentage: 23.8 },
      { name: 'Shopify', sales: 7, percentage: 16.7 },
    ],
  },
};

/**
 * Inventory detail page showing product information
 */
export default function InventoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { user, isAuthenticated, isLoading } = useAuth();
  const { setBreadcrumbs } = useAppStore();
  const theme = useMantineTheme();
  
  // Local state
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<typeof mockInventoryItem | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('overview');
  const [openedDeleteModal, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  
  // Animation refs
  const headerRef = useAnimatedMount('fadeInUp', { duration: 0.8 });
  const contentRef = useAnimatedMount('fadeInUp', { delay: 0.2 });
  const statsRef = useStaggerAnimation({ stagger: 0.1, delay: 0.4 });
  
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
  
  // Update breadcrumbs when the component mounts
  useEffect(() => {
    setBreadcrumbs([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Inventory', href: '/inventory' },
      { label: loading ? 'Loading...' : product?.name || 'Product Details' },
    ]);
  }, [setBreadcrumbs, loading, product]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Delete handler
  const handleDelete = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      closeDeleteModal();
      
      showSuccessNotification(
        'Product Deleted',
        `${product?.name} has been deleted successfully`
      );
      
      // Animate out before navigation
      if (headerRef.current) {
        gsap.to(headerRef.current, {
          opacity: 0,
          y: -20,
          duration: 0.3,
        });
      }
      
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          opacity: 0,
          y: -20,
          duration: 0.3,
          delay: 0.1,
          onComplete: () => {
            router.push('/inventory');
          },
        });
      } else {
        router.push('/inventory');
      }
    }, 1000);
  };
  
  // Push to marketplaces
  const handlePushToMarketplaces = () => {
    notifications.show({
      title: 'Pushing to Marketplaces',
      message: 'Updating product information across all connected marketplaces...',
      loading: true,
      autoClose: false,
      id: 'push-notification',
    });
    
    // Simulate API call
    setTimeout(() => {
      notifications.update({
        id: 'push-notification',
        title: 'Product Updated',
        message: 'Product has been successfully updated on all marketplaces',
        color: 'green',
        icon: <IconCheck size={16} />,
        loading: false,
        autoClose: 5000,
      });
    }, 2000);
  };
  
  // Show skeleton loaders while loading
  if (loading) {
    return (
      <AppShell title="Product Details">
        <Container size="xl">
          <Stack spacing="xl">
            <Group position="apart">
              <div>
                <Skeleton height={34} width={300} mb="xs" />
                <Skeleton height={20} width={200} />
              </div>
              
              <Group>
                <Skeleton height={36} width={100} />
                <Skeleton height={36} width={100} />
              </Group>
            </Group>
            
            <Skeleton height={50} />
            
            <Grid>
              <Grid.Col md={8}>
                <Skeleton height={400} radius="md" mb="lg" />
                <Skeleton height={200} radius="md" />
              </Grid.Col>
              
              <Grid.Col md={4}>
                <Skeleton height={630} radius="md" />
              </Grid.Col>
            </Grid>
          </Stack>
        </Container>
      </AppShell>
    );
  }
  
  // If product not found
  if (!product) {
    return (
      <AppShell title="Product Not Found">
        <Container size="xl">
          <Paper p="xl" withBorder radius="md">
            <Stack align="center" spacing="md" py="xl">
              <ThemeIcon size={80} radius={40} color="gray">
                <IconInfoCircle size={40} />
              </ThemeIcon>
              
              <Title order={2} align="center">Product Not Found</Title>
              
              <Text align="center" color="dimmed" maw={500}>
                The product you're looking for doesn't exist or has been removed.
              </Text>
              
              <Button
                onClick={() => router.push('/inventory')}
                mt="md"
              >
                Back to Inventory
              </Button>
            </Stack>
          </Paper>
        </Container>
      </AppShell>
    );
  }
  
  return (
    <AppShell title={product.name}>
      <Container size="xl">
        <Stack spacing="xl">
          <Box ref={headerRef}>
            <Group position="apart" mb="xs">
              <div>
                <Title order={2}>{product.name}</Title>
                <Group spacing="xs">
                  <Text color="dimmed">SKU: {product.sku}</Text>
                  <Badge 
                    color={
                      product.status === 'active'
                        ? 'green'
                        : product.status === 'draft'
                        ? 'blue'
                        : 'gray'
                    }
                  >
                    {product.status === 'active'
                      ? 'Active'
                      : product.status === 'draft'
                      ? 'Draft'
                      : 'Archived'}
                  </Badge>
                </Group>
              </div>
              
              <Group>
                <Button
                  leftIcon={<IconPencil size={16} />}
                  variant="default"
                  onClick={() => router.push(`/inventory/${id}/edit`)}
                >
                  Edit
                </Button>
                
                <Button
                  leftIcon={<IconTrash size={16} />}
                  color="red"
                  variant="outline"
                  onClick={openDeleteModal}
                >
                  Delete
                </Button>
              </Group>
            </Group>
          </Box>
          
          <div ref={contentRef}>
            <Tabs value={activeTab} onTabChange={setActiveTab} mb="lg">
              <Tabs.List>
                <Tabs.Tab
                  value="overview"
                  icon={<IconPackage size={16} />}
                >
                  Overview
                </Tabs.Tab>
                <Tabs.Tab
                  value="inventory"
                  icon={<IconTags size={16} />}
                >
                  Inventory
                </Tabs.Tab>
                <Tabs.Tab
                  value="marketplaces"
                  icon={<IconCloudUpload size={16} />}
                >
                  Marketplaces
                </Tabs.Tab>
                <Tabs.Tab
                  value="history"
                  icon={<IconHistory size={16} />}
                >
                  History
                </Tabs.Tab>
                <Tabs.Tab
                  value="analytics"
                  icon={<IconChartLine size={16} />}
                >
                  Analytics
                </Tabs.Tab>
              </Tabs.List>
              
              <Tabs.Panel value="overview" pt="lg">
                <Grid gutter="lg">
                  <Grid.Col md={8}>
                    <Stack spacing="lg">
                      {/* Product Images */}
                      <Card withBorder p="lg" radius="md">
                        <Title order={4} mb="md">Product Images</Title>
                        <SimpleGrid
                          cols={3}
                          breakpoints={[
                            { maxWidth: 'sm', cols: 1 },
                          ]}
                        >
                          {product.images.map((image, index) => (
                            <Box key={index}>
                              <Image
                                src={image}
                                alt={`${product.name} - Image ${index + 1}`}
                                height={200}
                                fit="contain"
                                radius="md"
                                withPlaceholder
                              />
                            </Box>
                          ))}
                        </SimpleGrid>
                      </Card>
                      
                      {/* Product Details */}
                      <Card withBorder p="lg" radius="md">
                        <Title order={4} mb="md">Product Details</Title>
                        
                        <Divider mb="md" />
                        
                        <Grid>
                          <Grid.Col md={6}>
                            <Stack spacing="md">
                              <div>
                                <Text size="sm" weight={500} color="dimmed">Description</Text>
                                <Text>{product.description}</Text>
                              </div>
                              
                              <div>
                                <Text size="sm" weight={500} color="dimmed">Categories</Text>
                                <Group spacing="xs" mt={4}>
                                  {product.categories.map((category) => (
                                    <Badge key={category} size="sm" color="blue" variant="outline">
                                      {category}
                                    </Badge>
                                  ))}
                                </Group>
                              </div>
                              
                              <div>
                                <Text size="sm" weight={500} color="dimmed">Tags</Text>
                                <Group spacing="xs" mt={4}>
                                  {product.tags.map((tag) => (
                                    <Badge key={tag} size="sm" color="cyan" variant="filled">
                                      {tag}
                                    </Badge>
                                  ))}
                                </Group>
                              </div>
                            </Stack>
                          </Grid.Col>
                          
                          <Grid.Col md={6}>
                            <Stack spacing="md">
                              <Group>
                                <div style={{ flex: 1 }}>
                                  <Text size="sm" weight={500} color="dimmed">Barcode</Text>
                                  <Group spacing="xs">
                                    <IconBarcode size={16} />
                                    <Text>{product.barcode || 'N/A'}</Text>
                                  </Group>
                                </div>
                                
                                <div style={{ flex: 1 }}>
                                  <Text size="sm" weight={500} color="dimmed">MPN</Text>
                                  <Text>{product.manufacturerPartNumber || 'N/A'}</Text>
                                </div>
                              </Group>
                              
                              <Group>
                                <div style={{ flex: 1 }}>
                                  <Text size="sm" weight={500} color="dimmed">Brand</Text>
                                  <Text>{product.brand || 'N/A'}</Text>
                                </div>
                                
                                <div style={{ flex: 1 }}>
                                  <Text size="sm" weight={500} color="dimmed">Supplier</Text>
                                  <Text>{product.supplier || 'N/A'}</Text>
                                </div>
                              </Group>
                              
                              <Group>
                                <div style={{ flex: 1 }}>
                                  <Text size="sm" weight={500} color="dimmed">
                                    <Group spacing="xs">
                                      <IconWeight size={16} />
                                      <span>Weight</span>
                                    </Group>
                                  </Text>
                                  <Text>
                                    {product.weight} {product.weightUnit}
                                  </Text>
                                </div>
                                
                                <div style={{ flex: 1 }}>
                                  <Text size="sm" weight={500} color="dimmed">
                                    <Group spacing="xs">
                                      <IconRuler size={16} />
                                      <span>Dimensions</span>
                                    </Group>
                                  </Text>
                                  <Text>
                                    {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} {product.dimensionUnit}
                                  </Text>
                                </div>
                              </Group>
                            </Stack>
                          </Grid.Col>
                        </Grid>
                      </Card>
                    </Stack>
                  </Grid.Col>
                  
                  <Grid.Col md={4}>
                    <Card withBorder p="lg" radius="md">
                      <Stack spacing="md">
                        {/* Stock Status */}
                        <div>
                          <Group position="apart">
                            <Text weight={500}>Stock Status</Text>
                            <Badge 
                              color={
                                product.stockQuantity <= 0
                                  ? 'red'
                                  : product.stockQuantity <= product.lowStockThreshold
                                  ? 'orange'
                                  : 'green'
                              }
                              size="lg"
                            >
                              {product.stockQuantity <= 0
                                ? 'Out of Stock'
                                : product.stockQuantity <= product.lowStockThreshold
                                ? 'Low Stock'
                                : 'In Stock'}
                            </Badge>
                          </Group>
                          
                          <Group position="apart" mt="xs">
                            <Text size="sm" color="dimmed">Current Stock</Text>
                            <Text weight={500}>{product.stockQuantity} units</Text>
                          </Group>
                          
                          <Group position="apart">
                            <Text size="sm" color="dimmed">Low Stock Threshold</Text>
                            <Text>{product.lowStockThreshold} units</Text>
                          </Group>
                          
                          <Progress
                            value={(product.stockQuantity / (product.lowStockThreshold * 3)) * 100}
                            color={
                              product.stockQuantity <= 0
                                ? 'red'
                                : product.stockQuantity <= product.lowStockThreshold
                                ? 'orange'
                                : 'green'
                            }
                            size="lg"
                            radius="md"
                            mt="md"
                          />
                        </div>
                        
                        <Divider />
                        
                        {/* Pricing */}
                        <div>
                          <Text weight={500}>Pricing</Text>
                          
                          <Group position="apart" mt="xs">
                            <Text size="sm" color="dimmed">Selling Price</Text>
                            <Text weight={500} size="lg">${product.price.toFixed(2)}</Text>
                          </Group>
                          
                          <Group position="apart">
                            <Text size="sm" color="dimmed">Cost Price</Text>
                            <Text>${product.costPrice.toFixed(2)}</Text>
                          </Group>
                          
                          <Group position="apart">
                            <Text size="sm" color="dimmed">Profit Margin</Text>
                            <Text color="green">
                              {(((product.price - product.costPrice) / product.price) * 100).toFixed(2)}%
                            </Text>
                          </Group>
                          
                          <Group position="apart">
                            <Text size="sm" color="dimmed">Profit per Unit</Text>
                            <Text color="green">
                              ${(product.price - product.costPrice).toFixed(2)}
                            </Text>
                          </Group>
                          
                          {product.taxable && (
                            <Group position="apart">
                              <Text size="sm" color="dimmed">Tax Rate</Text>
                              <Text>{product.taxRate}%</Text>
                            </Group>
                          )}
                        </div>
                        
                        <Divider />
                        
                        {/* Warehouses */}
                        <div>
                          <Text weight={500}>Warehouse Allocation</Text>
                          
                          {product.warehouseLocations.map((location) => (
                            <Group key={location.id} position="apart" mt="xs">
                              <Text size="sm">{location.name}</Text>
                              <Text>{location.quantity} units</Text>
                            </Group>
                          ))}
                        </div>
                        
                        <Divider />
                        
                        {/* Actions */}
                        <Stack spacing="xs">
                          <Button
                            leftIcon={<IconCloudUpload size={16} />}
                            onClick={handlePushToMarketplaces}
                            fullWidth
                          >
                            Push to Marketplaces
                          </Button>
                          
                          <Button
                            leftIcon={<IconFileInvoice size={16} />}
                            variant="outline"
                            fullWidth
                          >
                            Create Purchase Order
                          </Button>
                          
                          <Button
                            leftIcon={<IconShoppingCart size={16} />}
                            variant="outline"
                            fullWidth
                          >
                            View Orders
                          </Button>
                        </Stack>
                      </Stack>
                    </Card>
                  </Grid.Col>
                </Grid>
              </Tabs.Panel>
              
              <Tabs.Panel value="inventory" pt="lg">
                <Stack spacing="lg">
                  {/* Stock Overview */}
                  <Card withBorder p="lg" radius="md">
                    <Title order={4} mb="lg">Stock Overview</Title>
                    
                    <Grid ref={statsRef}>
                      <Grid.Col md={3}>
                        <Paper withBorder p="md" radius="md">
                          <Text size="xs" color="dimmed">Current Stock</Text>
                          <Text size="xl" weight={700}>{product.stockQuantity}</Text>
                          <Text size="xs" color="dimmed">units</Text>
                        </Paper>
                      </Grid.Col>
                      
                      <Grid.Col md={3}>
                        <Paper withBorder p="md" radius="md">
                          <Text size="xs" color="dimmed">Low Stock Threshold</Text>
                          <Text size="xl" weight={700}>{product.lowStockThreshold}</Text>
                          <Text size="xs" color="dimmed">units</Text>
                        </Paper>
                      </Grid.Col>
                      
                      <Grid.Col md={3}>
                        <Paper withBorder p="md" radius="md">
                          <Text size="xs" color="dimmed">Stock Value</Text>
                          <Text size="xl" weight={700}>
                            ${(product.stockQuantity * product.costPrice).toFixed(2)}
                          </Text>
                          <Text size="xs" color="dimmed">at cost price</Text>
                        </Paper>
                      </Grid.Col>
                      
                      <Grid.Col md={3}>
                        <Paper withBorder p="md" radius="md">
                          <Text size="xs" color="dimmed">Retail Value</Text>
                          <Text size="xl" weight={700}>
                            ${(product.stockQuantity * product.price).toFixed(2)}
                          </Text>
                          <Text size="xs" color="dimmed">at selling price</Text>
                        </Paper>
                      </Grid.Col>
                    </Grid>
                  </Card>
                  
                  {/* Warehouse Allocation */}
                  <Card withBorder p="lg" radius="md">
                    <Group position="apart" mb="lg">
                      <Title order={4}>Warehouse Allocation</Title>
                      <Button 
                        variant="outline"
                        leftIcon={<IconBuilding size={16} />}
                        size="sm"
                      >
                        Manage Allocation
                      </Button>
                    </Group>
                    
                    <Table striped withBorder>
                      <thead>
                        <tr>
                          <th>Warehouse</th>
                          <th>Stock Quantity</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.warehouseLocations.map((location) => (
                          <tr key={location.id}>
                            <td>{location.name}</td>
                            <td>{location.quantity} units</td>
                            <td>
                              <Badge
                                color={
                                  location.quantity <= 0
                                    ? 'red'
                                    : location.quantity <= product.lowStockThreshold
                                    ? 'orange'
                                    : 'green'
                                }
                                size="sm"
                              >
                                {location.quantity <= 0
                                  ? 'Out of Stock'
                                  : location.quantity <= product.lowStockThreshold
                                  ? 'Low Stock'
                                  : 'In Stock'}
                              </Badge>
                            </td>
                            <td>
                              <Group spacing="xs">
                                <Tooltip label="Adjust Stock">
                                  <ActionIcon color="blue">
                                    <IconPackage size={16} />
                                  </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Transfer Stock">
                                  <ActionIcon color="green">
                                    <IconArrowRight size={16} />
                                  </ActionIcon>
                                </Tooltip>
                              </Group>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card>
                  
                  {/* Stock Movement History */}
                  <Card withBorder p="lg" radius="md">
                    <Title order={4} mb="lg">Stock Movement History</Title>
                    
                    <Timeline active={3} bulletSize={24} lineWidth={2}>
                      <Timeline.Item 
                        bullet={<IconArrowUpRight size={12} />} 
                        title="Stock Increased"
                      >
                        <Text color="dimmed" size="sm">June 15, 2023</Text>
                        <Text size="sm">Stock increased by 10 units</Text>
                        <Text size="xs" color="dimmed">By: John Smith</Text>
                      </Timeline.Item>
                      
                      <Timeline.Item 
                        bullet={<IconShoppingCart size={12} />} 
                        title="Order Fulfilled"
                      >
                        <Text color="dimmed" size="sm">June 12, 2023</Text>
                        <Text size="sm">Order #12345 fulfilled (3 units)</Text>
                        <Text size="xs" color="dimmed">By: System</Text>
                      </Timeline.Item>
                      
                      <Timeline.Item 
                        bullet={<IconArrowDownRight size={12} />} 
                        title="Stock Decreased"
                      >
                        <Text color="dimmed" size="sm">June 8, 2023</Text>
                        <Text size="sm">Manual adjustment: -2 units (damaged)</Text>
                        <Text size="xs" color="dimmed">By: Jane Doe</Text>
                      </Timeline.Item>
                      
                      <Timeline.Item 
                        bullet={<IconArrowUpRight size={12} />} 
                        title="Initial Stock"
                      >
                        <Text color="dimmed" size="sm">June 5, 2023</Text>
                        <Text size="sm">Initial stock added: 20 units</Text>
                        <Text size="xs" color="dimmed">By: Jane Doe</Text>
                      </Timeline.Item>
                    </Timeline>
                  </Card>
                </Stack>
              </Tabs.Panel>
              
              <Tabs.Panel value="marketplaces" pt="lg">
                <Stack spacing="lg">
                  <Card withBorder p="lg" radius="md">
                    <Group position="apart" mb="lg">
                      <Title order={4}>Marketplace Status</Title>
                      <Button 
                        leftIcon={<IconCloudUpload size={16} />}
                        onClick={handlePushToMarketplaces}
                      >
                        Push to All Marketplaces
                      </Button>
                    </Group>
                    
                    <Table striped withBorder>
                      <thead>
                        <tr>
                          <th>Marketplace</th>
                          <th>Status</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Last Updated</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.marketplaceStatus.map((marketplace) => (
                          <tr key={marketplace.id}>
                            <td>
                              <Group spacing="xs">
                                <Text>{marketplace.name}</Text>
                              </Group>
                            </td>
                            <td>
                              <Badge
                                color={
                                  marketplace.status === 'Active'
                                    ? 'green'
                                    : marketplace.status === 'Inactive'
                                    ? 'gray'
                                    : 'red'
                                }
                                size="sm"
                              >
                                {marketplace.status}
                              </Badge>
                            </td>
                            <td>${marketplace.price.toFixed(2)}</td>
                            <td>{marketplace.stockLevel}</td>
                            <td>
                              {new Date(marketplace.lastUpdated).toLocaleDateString()} {new Date(marketplace.lastUpdated).toLocaleTimeString()}
                            </td>
                            <td>
                              <Group spacing="xs">
                                <Tooltip label="View on Marketplace">
                                  <ActionIcon color="blue">
                                    <IconExternalLink size={16} />
                                  </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Push Updates">
                                  <ActionIcon color="green">
                                    <IconCloudUpload size={16} />
                                  </ActionIcon>
                                </Tooltip>
                              </Group>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card>
                </Stack>
              </Tabs.Panel>
              
              <Tabs.Panel value="history" pt="lg">
                <Card withBorder p="lg" radius="md">
                  <Title order={4} mb="lg">Product History</Title>
                  
                  <Timeline active={product.history.length} bulletSize={24} lineWidth={2}>
                    {product.history.map((event, index) => (
                      <Timeline.Item 
                        key={event.id}
                        bullet={
                          event.action === 'Stock Update' ? (
                            <IconPackage size={12} />
                          ) : event.action === 'Price Update' ? (
                            <IconTags size={12} />
                          ) : event.action === 'Marketplace Update' ? (
                            <IconCloudUpload size={12} />
                          ) : (
                            <IconInfoCircle size={12} />
                          )
                        }
                        title={event.action}
                      >
                        <Text color="dimmed" size="sm">
                          {new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString()}
                        </Text>
                        <Text size="sm">{event.description}</Text>
                        <Text size="xs" color="dimmed">By: {event.user}</Text>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              </Tabs.Panel>
              
              <Tabs.Panel value="analytics" pt="lg">
                <Stack spacing="lg">
                  <Card withBorder p="lg" radius="md">
                    <Title order={4} mb="lg">Sales Performance</Title>
                    
                    <Grid>
                      <Grid.Col md={3}>
                        <Paper withBorder p="md" radius="md">
                          <Text size="xs" color="dimmed">Units Sold (30 days)</Text>
                          <Group spacing="xs" align="baseline">
                            <Text size="xl" weight={700}>{product.salesData.last30Days}</Text>
                            <Text 
                              size="xs" 
                              color={product.salesData.change > 0 ? 'green' : 'red'}
                              weight={500}
                            >
                              {product.salesData.change > 0 ? '+' : ''}{product.salesData.change}%
                            </Text>
                          </Group>
                          <Text size="xs" color="dimmed">vs. previous period</Text>
                        </Paper>
                      </Grid.Col>
                      
                      <Grid.Col md={3}>
                        <Paper withBorder p="md" radius="md">
                          <Text size="xs" color="dimmed">Revenue (30 days)</Text>
                          <Text size="xl" weight={700}>${product.salesData.revenue.toFixed(2)}</Text>
                          <Text size="xs" color="dimmed">from {product.salesData.last30Days} units</Text>
                        </Paper>
                      </Grid.Col>
                      
                      <Grid.Col md={6}>
                        <Paper withBorder p="md" radius="md">
                          <Text size="xs" color="dimmed" mb="xs">Sales by Channel</Text>
                          
                          <Table>
                            <thead>
                              <tr>
                                <th>Channel</th>
                                <th style={{ textAlign: 'right' }}>Units</th>
                                <th style={{ textAlign: 'right' }}>%</th>
                              </tr>
                            </thead>
                            <tbody>
                              {product.salesData.channels.map((channel) => (
                                <tr key={channel.name}>
                                  <td>{channel.name}</td>
                                  <td style={{ textAlign: 'right' }}>{channel.sales}</td>
                                  <td style={{ textAlign: 'right' }}>{channel.percentage.toFixed(1)}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </Paper>
                      </Grid.Col>
                    </Grid>
                  </Card>
                </Stack>
              </Tabs.Panel>
            </Tabs>
          </div>
        </Stack>
      </Container>
      
      {/* Delete Confirmation Modal */}
      <Modal
        opened={openedDeleteModal}
        onClose={closeDeleteModal}
        title="Delete Product"
        centered
      >
        <Text size="sm">
          Are you sure you want to delete <strong>{product.name}</strong>? This action cannot be undone.
        </Text>
        
        <Group position="right" mt="lg">
          <Button variant="default" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDelete}>
            Delete
          </Button>
        </Group>
      </Modal>
    </AppShell>
  );
}