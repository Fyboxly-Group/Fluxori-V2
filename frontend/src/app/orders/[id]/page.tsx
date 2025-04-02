import React from 'react';
import { OrderDetail } from '@/components/order/OrderDetail';
import { mockOrderData } from './mock-data';
import { Box, Text, Breadcrumbs, Anchor, Group, ActionIcon, Button } from '@mantine/core';
import { IconArrowLeft, IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';

// This would normally come from a server component or API call
// For demonstration, we're using mock data
const getOrderData = (id: string) => {
  // In a real implementation, this would fetch from an API
  // const data = await fetch(`/api/orders/${id}`);
  // return data.json();
  return mockOrderData;
};

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const orderData = getOrderData(params.id);
  
  const handleStatusChange = (orderId: string, status: string) => {
    console.log(`Updating order ${orderId} status to ${status}`);
    // In a real implementation, this would call an API
  };
  
  const handlePaymentStatusChange = (orderId: string, status: string) => {
    console.log(`Updating order ${orderId} payment status to ${status}`);
    // In a real implementation, this would call an API
  };
  
  const handleDocumentDownload = (documentId: string, orderId: string) => {
    console.log(`Downloading document ${documentId} from order ${orderId}`);
    // In a real implementation, this would download a file
  };
  
  return (
    <Box p="md">
      {/* Breadcrumbs & Navigation */}
      <Group position="apart" mb="lg">
        <Group>
          <ActionIcon 
            component={Link}
            href="/orders"
            variant="light"
            size="lg"
          >
            <IconArrowLeft size={18} />
          </ActionIcon>
          
          <Breadcrumbs separator={<IconChevronRight size={14} />}>
            <Anchor component={Link} href="/dashboard" size="sm">
              Dashboard
            </Anchor>
            <Anchor component={Link} href="/orders" size="sm">
              Orders
            </Anchor>
            <Text size="sm">Order #{orderData.order_number}</Text>
          </Breadcrumbs>
        </Group>
        
        <Button component={Link} href={`/orders/${params.id}/edit`}>
          Edit Order
        </Button>
      </Group>
      
      {/* Order Detail Component */}
      <OrderDetail 
        order={orderData}
        onStatusChange={handleStatusChange}
        onPaymentStatusChange={handlePaymentStatusChange}
        onDocumentDownload={handleDocumentDownload}
      />
    </Box>
  );
}