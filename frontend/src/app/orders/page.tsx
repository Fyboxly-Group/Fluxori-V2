import React from 'react';
import { 
  Box, 
  Card, 
  Title, 
  Text, 
  Group, 
  Button, 
  Badge, 
  TextInput, 
  Grid, 
  MultiSelect, 
  DateRangePicker, 
  Select, 
  Stack,
  ActionIcon,
  Tooltip,
  Pagination
} from '@mantine/core';
import Link from 'next/link';
import { 
  IconSearch, 
  IconFilter, 
  IconEye, 
  IconShoppingCart, 
  IconChevronRight, 
  IconTruckDelivery, 
  IconClock, 
  IconCheck, 
  IconAlertTriangle,
  IconFilterOff,
  IconPlus,
  IconFileInvoice,
  IconPrinter,
  IconDotsVertical
} from '@tabler/icons-react';
import { mockOrders } from '@/mocks/data/orders';
import { PageTransition } from '@/components/PageTransition/PageTransition';

export default function OrdersPage() {
  // In a real implementation, this would be state with API calls
  const orders = mockOrders;
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('deliver')) return 'green';
    if (statusLower.includes('transit') || statusLower.includes('process')) return 'blue';
    if (statusLower.includes('pending') || statusLower.includes('awaiting')) return 'yellow';
    if (statusLower.includes('cancel') || statusLower.includes('refund')) return 'red';
    if (statusLower.includes('hold')) return 'orange';
    
    return 'gray';
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('deliver')) return <IconCheck size={16} />;
    if (statusLower.includes('transit') || statusLower.includes('ship')) return <IconTruckDelivery size={16} />;
    if (statusLower.includes('process') || statusLower.includes('pending')) return <IconClock size={16} />;
    if (statusLower.includes('cancel') || statusLower.includes('refund')) return <IconAlertTriangle size={16} />;
    
    return <IconShoppingCart size={16} />;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Filter options
  const statusOptions = [
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'hold', label: 'On Hold' }
  ];
  
  const paymentStatusOptions = [
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'partially_paid', label: 'Partially Paid' }
  ];
  
  const marketplaceOptions = [
    { value: 'amazon', label: 'Amazon' },
    { value: 'takealot', label: 'Takealot' },
    { value: 'shopify', label: 'Shopify' },
    { value: 'woocommerce', label: 'WooCommerce' },
    { value: 'manual', label: 'Manual Order' }
  ];
  
  return (
    <PageTransition>
      <Box p="md">
        <Group position="apart" mb="lg">
          <Title order={2}>Orders</Title>
          <Button leftIcon={<IconPlus size={16} />} component={Link} href="/orders/new">
            Create Order
          </Button>
        </Group>
        
        {/* Filters */}
        <Card p="md" withBorder mb="lg">
          <Grid>
            <Grid.Col span={12} md={3}>
              <TextInput
                placeholder="Search orders..."
                icon={<IconSearch size={16} />}
                mb="xs"
              />
            </Grid.Col>
            
            <Grid.Col span={12} md={3}>
              <MultiSelect
                placeholder="Filter by status"
                data={statusOptions}
                clearable
                mb="xs"
              />
            </Grid.Col>
            
            <Grid.Col span={12} md={3}>
              <MultiSelect
                placeholder="Filter by marketplace"
                data={marketplaceOptions}
                clearable
                mb="xs"
              />
            </Grid.Col>
            
            <Grid.Col span={12} md={3}>
              <MultiSelect
                placeholder="Payment status"
                data={paymentStatusOptions}
                clearable
                mb="xs"
              />
            </Grid.Col>
            
            <Grid.Col span={12} md={6}>
              <DateRangePicker
                placeholder="Order date range"
                mb="xs"
                clearable
              />
            </Grid.Col>
            
            <Grid.Col span={12} md={3}>
              <Select
                placeholder="Sort by"
                data={[
                  { value: 'date_desc', label: 'Date (Newest first)' },
                  { value: 'date_asc', label: 'Date (Oldest first)' },
                  { value: 'total_desc', label: 'Total (Highest first)' },
                  { value: 'total_asc', label: 'Total (Lowest first)' }
                ]}
                mb="xs"
              />
            </Grid.Col>
            
            <Grid.Col span={12} md={3}>
              <Group position="right" mb="xs" sx={{ height: '100%' }} align="flex-end">
                <Button variant="light" leftIcon={<IconFilterOff size={16} />}>
                  Clear Filters
                </Button>
              </Group>
            </Grid.Col>
          </Grid>
        </Card>
        
        {/* Order List */}
        <Stack spacing="md">
          {orders.map((order) => (
            <Card key={order.id} withBorder p="md" component={Link} href={`/orders/${order.id}`}
              sx={(theme) => ({
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${
                    theme.colorScheme === 'dark' ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.1)'
                  }`
                }
              })}
            >
              <Grid align="center">
                <Grid.Col span={6} sm={3}>
                  <Group spacing="sm" noWrap>
                    <Badge 
                      size="lg" 
                      color={getStatusColor(order.status)}
                      leftSection={getStatusIcon(order.status)}
                    >
                      {order.status}
                    </Badge>
                    <Stack spacing={0}>
                      <Text weight={600}>#{order.orderNumber}</Text>
                      <Text size="xs" color="dimmed">
                        {formatDate(order.createdAt)}
                      </Text>
                    </Stack>
                  </Group>
                </Grid.Col>
                
                <Grid.Col span={6} sm={3}>
                  <Stack spacing={0}>
                    <Text size="sm" weight={500}>{order.customer.name}</Text>
                    <Text size="xs" color="dimmed">{order.customer.email}</Text>
                  </Stack>
                </Grid.Col>
                
                <Grid.Col span={6} sm={2}>
                  <Group spacing="xs">
                    {order.marketplace && (
                      <Badge size="sm" color="gray" variant="outline">
                        {order.marketplace}
                      </Badge>
                    )}
                    <Badge size="sm" color={order.paymentStatus === 'Paid' ? 'green' : 'yellow'}>
                      {order.paymentStatus}
                    </Badge>
                  </Group>
                </Grid.Col>
                
                <Grid.Col span={6} sm={2}>
                  <Text weight={700} align="right">
                    {formatCurrency(order.total)}
                  </Text>
                  <Text size="xs" color="dimmed" align="right">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </Text>
                </Grid.Col>
                
                <Grid.Col span={12} sm={2}>
                  <Group position="right" spacing="xs" noWrap>
                    <Tooltip label="View details">
                      <ActionIcon component={Link} href={`/orders/${order.id}`} variant="light" color="blue">
                        <IconEye size={16} />
                      </ActionIcon>
                    </Tooltip>
                    
                    <Tooltip label="View invoice">
                      <ActionIcon variant="light">
                        <IconFileInvoice size={16} />
                      </ActionIcon>
                    </Tooltip>
                    
                    <Tooltip label="Print">
                      <ActionIcon variant="light">
                        <IconPrinter size={16} />
                      </ActionIcon>
                    </Tooltip>
                    
                    <ActionIcon>
                      <IconDotsVertical size={16} />
                    </ActionIcon>
                  </Group>
                </Grid.Col>
                
                {order.shipment && (
                  <Grid.Col span={12}>
                    <Group spacing="xs" mt="sm">
                      <IconTruckDelivery size={16} color="gray" />
                      <Text size="sm" color="dimmed">
                        {order.shipment.carrier}: {order.shipment.trackingNumber} - <Text span weight={500} color={getStatusColor(order.shipment.status)}>{order.shipment.status}</Text>
                      </Text>
                      <Text size="xs" color="dimmed">
                        (Est. Delivery: {formatDate(order.shipment.estimatedDelivery)})
                      </Text>
                    </Group>
                  </Grid.Col>
                )}
              </Grid>
            </Card>
          ))}
        </Stack>
        
        {/* Pagination */}
        <Group position="apart" mt="xl">
          <Text>Showing 1-2 of 2 orders</Text>
          <Pagination total={1} withEdges />
        </Group>
      </Box>
    </PageTransition>
  );
}