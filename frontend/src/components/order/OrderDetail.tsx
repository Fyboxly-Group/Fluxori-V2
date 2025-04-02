import React, { useState, useEffect, useRef } from 'react';
import { 
  Paper, 
  Title, 
  Grid, 
  Group, 
  Badge, 
  Text, 
  Card, 
  Stack, 
  Box, 
  Button, 
  Divider,
  useMantineTheme,
  Tabs,
  ActionIcon,
  Menu,
  Accordion,
  Avatar,
  SimpleGrid,
  Timeline,
  ScrollArea
} from '@mantine/core';
import { 
  IconShoppingCart, 
  IconUser, 
  IconFileInvoice, 
  IconTruckDelivery, 
  IconCreditCard, 
  IconNotes, 
  IconMapPin,
  IconBuildingStore,
  IconCalendarEvent,
  IconArrowRight,
  IconTag,
  IconClock,
  IconPrinter,
  IconDotsVertical,
  IconChartBar,
  IconMail,
  IconPhone,
  IconCheck,
  IconAlertTriangle,
  IconSend,
  IconCalculator,
  IconPencil,
  IconHeart,
  IconTrash,
  IconChevronDown
} from '@tabler/icons-react';
import gsap from 'gsap';
import { useAnimatedMount, useStaggerAnimation } from '@/hooks/useAnimation';
import { EnhancedShipmentTimeline } from '@/components/shipment/EnhancedShipmentTimeline';
import { DocumentViewer } from '@/components/order/DocumentViewer';
import { OrderItemCard } from '@/components/order/OrderItemCard';
import { Order, TimelineEvent, OrderStatus, PaymentStatus } from '@/types/order';

interface OrderDetailProps {
  /** Order data */
  order: Order;
  /** Custom class name */
  className?: string;
  /** Whether to show all sections by default */
  expandAll?: boolean;
  /** Whether to show the actions menu */
  showActions?: boolean;
  /** Called when the order status is updated */
  onStatusChange?: (orderId: string, status: OrderStatus) => void;
  /** Called when the payment status is updated */
  onPaymentStatusChange?: (orderId: string, status: PaymentStatus) => void;
  /** Called when a document is downloaded */
  onDocumentDownload?: (documentId: string, orderId: string) => void;
  /** Called when a note is added */
  onAddNote?: (orderId: string, note: string) => void;
  /** Called when the order is edited */
  onEdit?: (orderId: string) => void;
  /** Called when shipping info is updated */
  onShippingInfoUpdate?: (orderId: string, trackingInfo: any) => void;
}

/**
 * Order Detail Component
 * 
 * A comprehensive order detail page with sections for order information,
 * customer details, shipment tracking, items, documents, and timeline.
 * Features GSAP animations and responsive design.
 */
export const OrderDetail: React.FC<OrderDetailProps> = ({
  order,
  className,
  expandAll = false,
  showActions = true,
  onStatusChange,
  onPaymentStatusChange,
  onDocumentDownload,
  onAddNote,
  onEdit,
  onShippingInfoUpdate
}) => {
  const theme = useMantineTheme();
  const containerRef = useAnimatedMount('fadeIn');
  const headerRef = useRef<HTMLDivElement>(null);
  const itemsContainerRef = useStaggerAnimation({
    stagger: 0.08,
    delay: 0.3,
    y: 15
  });
  const [activeTab, setActiveTab] = useState<string>('items');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPaymentStatusMenu, setShowPaymentStatusMenu] = useState(false);
  
  // Animate the header on scroll
  useEffect(() => {
    if (!headerRef.current) return;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      if (scrollY > 50) {
        gsap.to(headerRef.current, {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(8px)',
          backgroundColor: theme.colorScheme === 'dark' 
            ? `${theme.colors.dark[7]}e6` 
            : `${theme.white}e6`,
          duration: 0.3
        });
      } else {
        gsap.to(headerRef.current, {
          boxShadow: '0 0 0 rgba(0,0,0,0)',
          backdropFilter: 'blur(0px)',
          backgroundColor: theme.colorScheme === 'dark' 
            ? theme.colors.dark[7] 
            : theme.white,
          duration: 0.3
        });
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [theme]);
  
  // Handle tab change with animation
  const handleTabChange = (value: string) => {
    const contentElement = document.querySelector('.order-detail-content');
    if (!contentElement) {
      setActiveTab(value);
      return;
    }
    
    gsap.to(contentElement, {
      opacity: 0,
      y: 10,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setActiveTab(value);
        gsap.to(contentElement, {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format time for display
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format price for display
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: order.currency,
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Get status color based on order status
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
      case 'shipped':
        return 'green';
      case 'processing':
        return 'blue';
      case 'pending':
      case 'awaiting_payment':
        return 'yellow';
      case 'cancelled':
      case 'refunded':
        return 'red';
      case 'on_hold':
        return 'orange';
      case 'partially_shipped':
        return 'cyan';
      default:
        return 'gray';
    }
  };
  
  // Get status icon based on order status
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return <IconCheck size={16} />;
      case 'shipped':
      case 'partially_shipped':
        return <IconTruckDelivery size={16} />;
      case 'processing':
        return <IconClock size={16} />;
      case 'cancelled':
      case 'refunded':
        return <IconAlertTriangle size={16} />;
      default:
        return <IconShoppingCart size={16} />;
    }
  };
  
  // Get payment status color
  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return 'green';
      case 'partially_paid':
        return 'blue';
      case 'pending':
        return 'yellow';
      case 'refunded':
      case 'failed':
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };
  
  // Format status for display
  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  // Get icon for timeline event
  const getTimelineIcon = (event: TimelineEvent) => {
    switch (event.type) {
      case 'order_created':
        return <IconShoppingCart size={14} />;
      case 'order_updated':
        return <IconPencil size={14} />;
      case 'payment':
        return <IconCreditCard size={14} />;
      case 'shipment':
        return <IconTruckDelivery size={14} />;
      case 'note':
        return <IconNotes size={14} />;
      case 'status_change':
        return <IconCheck size={14} />;
      case 'customer_action':
        return <IconUser size={14} />;
      default:
        return <IconClock size={14} />;
    }
  };
  
  // Get color for timeline event
  const getTimelineColor = (event: TimelineEvent) => {
    switch (event.type) {
      case 'order_created':
        return 'blue';
      case 'payment':
        return 'green';
      case 'shipment':
        return 'cyan';
      case 'note':
        return 'yellow';
      case 'status_change':
        return 'violet';
      case 'customer_action':
        return 'pink';
      default:
        return 'gray';
    }
  };
  
  // Handle status change
  const handleStatusChange = (status: OrderStatus) => {
    if (onStatusChange) {
      onStatusChange(order.id, status);
    }
    setShowStatusMenu(false);
  };
  
  // Handle payment status change
  const handlePaymentStatusChange = (status: PaymentStatus) => {
    if (onPaymentStatusChange) {
      onPaymentStatusChange(order.id, status);
    }
    setShowPaymentStatusMenu(false);
  };
  
  // Handle document download
  const handleDocumentDownload = (document: any) => {
    if (onDocumentDownload) {
      onDocumentDownload(document.id, order.id);
    }
  };
  
  return (
    <Box className={className} ref={containerRef}>
      {/* Sticky Header */}
      <Paper 
        ref={headerRef}
        p="md" 
        radius="md" 
        withBorder
        sx={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 10,
          transition: 'box-shadow 0.3s ease'
        }}
        className="order-detail-header"
      >
        <Grid>
          <Grid.Col span={12} md={8}>
            <Group position="apart">
              <div>
                <Group spacing="xs">
                  <Title order={3}>Order #{order.order_number}</Title>
                  
                  <Badge 
                    size="lg" 
                    color={getStatusColor(order.status)}
                    leftSection={getStatusIcon(order.status)}
                  >
                    {formatStatus(order.status)}
                  </Badge>
                  
                  <Badge 
                    size="lg" 
                    color={getPaymentStatusColor(order.payment_status)}
                    variant="outline"
                  >
                    {formatStatus(order.payment_status)}
                  </Badge>
                  
                  {order.is_priority && (
                    <Badge color="red" size="lg" variant="dot">
                      Priority
                    </Badge>
                  )}
                </Group>
                
                <Group spacing="md" mt="xs">
                  <Group spacing="xs">
                    <IconCalendarEvent size={14} />
                    <Text size="sm">
                      {formatDate(order.date_created)} at {formatTime(order.date_created)}
                    </Text>
                  </Group>
                  
                  {order.marketplace && (
                    <Group spacing="xs">
                      <IconBuildingStore size={14} />
                      <Text size="sm">
                        {order.marketplace}
                        {order.marketplace_order_id && ` #${order.marketplace_order_id}`}
                      </Text>
                    </Group>
                  )}
                  
                  {order.warehouse_id && (
                    <Group spacing="xs">
                      <IconMapPin size={14} />
                      <Text size="sm">
                        Warehouse: {order.warehouse_id}
                      </Text>
                    </Group>
                  )}
                </Group>
              </div>
              
              {showActions && (
                <Menu position="bottom-end" shadow="md">
                  <Menu.Target>
                    <ActionIcon size="lg" variant="light">
                      <IconDotsVertical size={18} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>Order Actions</Menu.Label>
                    <Menu.Item icon={<IconPrinter size={14} />}>
                      Print Order
                    </Menu.Item>
                    <Menu.Item 
                      icon={<IconPencil size={14} />}
                      onClick={() => onEdit && onEdit(order.id)}
                    >
                      Edit Order
                    </Menu.Item>
                    <Menu.Divider />
                    
                    <Menu.Label>Status</Menu.Label>
                    {['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'on_hold'].map((status) => (
                      <Menu.Item 
                        key={status}
                        icon={getStatusIcon(status as OrderStatus)}
                        disabled={order.status === status}
                        onClick={() => handleStatusChange(status as OrderStatus)}
                      >
                        {formatStatus(status)}
                      </Menu.Item>
                    ))}
                    
                    <Menu.Divider />
                    
                    <Menu.Label>Payment</Menu.Label>
                    {['pending', 'paid', 'partially_paid', 'refunded', 'failed', 'cancelled'].map((status) => (
                      <Menu.Item 
                        key={`payment-${status}`}
                        icon={status === 'paid' ? <IconCheck size={14} /> : <IconCreditCard size={14} />}
                        disabled={order.payment_status === status}
                        onClick={() => handlePaymentStatusChange(status as PaymentStatus)}
                      >
                        {formatStatus(status)}
                      </Menu.Item>
                    ))}
                    
                    <Menu.Divider />
                    
                    <Menu.Item icon={<IconTrash size={14} />} color="red">
                      Delete Order
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              )}
            </Group>
          </Grid.Col>
          
          <Grid.Col span={12} md={4}>
            <Card p="sm" radius="md" withBorder>
              <Stack spacing={0}>
                <Group position="apart">
                  <Text weight={500}>Subtotal:</Text>
                  <Text>{formatPrice(order.subtotal)}</Text>
                </Group>
                
                {order.shipping_total > 0 && (
                  <Group position="apart">
                    <Text size="sm">Shipping:</Text>
                    <Text size="sm">{formatPrice(order.shipping_total)}</Text>
                  </Group>
                )}
                
                {order.tax_total > 0 && (
                  <Group position="apart">
                    <Text size="sm">Tax:</Text>
                    <Text size="sm">{formatPrice(order.tax_total)}</Text>
                  </Group>
                )}
                
                {order.discount_total > 0 && (
                  <Group position="apart">
                    <Text size="sm">Discount:</Text>
                    <Text size="sm" color="red">-{formatPrice(order.discount_total)}</Text>
                  </Group>
                )}
                
                <Divider my="xs" />
                
                <Group position="apart">
                  <Text weight={700}>Total:</Text>
                  <Text weight={700} size="lg">{formatPrice(order.total)}</Text>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
        
        <Tabs mt="md" value={activeTab} onTabChange={handleTabChange}>
          <Tabs.List>
            <Tabs.Tab 
              value="items" 
              icon={<IconShoppingCart size={14} />}
              rightSection={<Badge size="xs">{order.items.length}</Badge>}
            >
              Items
            </Tabs.Tab>
            <Tabs.Tab 
              value="customer" 
              icon={<IconUser size={14} />}
            >
              Customer
            </Tabs.Tab>
            <Tabs.Tab 
              value="shipments" 
              icon={<IconTruckDelivery size={14} />}
              rightSection={<Badge size="xs">{order.shipments.length}</Badge>}
            >
              Shipments
            </Tabs.Tab>
            <Tabs.Tab 
              value="documents" 
              icon={<IconFileInvoice size={14} />}
              rightSection={<Badge size="xs">{order.documents.length}</Badge>}
            >
              Documents
            </Tabs.Tab>
            <Tabs.Tab 
              value="payments" 
              icon={<IconCreditCard size={14} />}
              rightSection={<Badge size="xs">{order.payments.length}</Badge>}
            >
              Payments
            </Tabs.Tab>
            <Tabs.Tab 
              value="timeline" 
              icon={<IconClock size={14} />}
              rightSection={<Badge size="xs">{order.timeline.length}</Badge>}
            >
              Timeline
            </Tabs.Tab>
            <Tabs.Tab 
              value="notes" 
              icon={<IconNotes size={14} />}
            >
              Notes
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Paper>
      
      {/* Tab Content */}
      <Box py="md" className="order-detail-content">
        {activeTab === 'items' && (
          <Paper p="md" radius="md" withBorder>
            <Title order={4} mb="md">Order Items ({order.items.length})</Title>
            
            <Box ref={itemsContainerRef}>
              <Stack spacing="md">
                {order.items.map(item => (
                  <OrderItemCard
                    key={item.id}
                    item={item}
                    currency={order.currency}
                    showFulfillmentStatus={true}
                    showVariations={true}
                  />
                ))}
              </Stack>
            </Box>
          </Paper>
        )}
        
        {activeTab === 'customer' && (
          <SimpleGrid cols={2} spacing="md" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
            <Paper p="md" radius="md" withBorder>
              <Group position="apart" mb="md">
                <Title order={4}>Customer Information</Title>
                
                <Group spacing="xs">
                  <ActionIcon 
                    variant="light" 
                    color="blue" 
                    component="a"
                    href={`mailto:${order.customer.email}`}
                  >
                    <IconMail size={16} />
                  </ActionIcon>
                  
                  {order.customer.phone && (
                    <ActionIcon 
                      variant="light" 
                      color="green" 
                      component="a"
                      href={`tel:${order.customer.phone}`}
                    >
                      <IconPhone size={16} />
                    </ActionIcon>
                  )}
                </Group>
              </Group>
              
              <Group mb="md" noWrap align="flex-start">
                <Avatar 
                  size={60} 
                  color="blue"
                  radius="xl"
                >
                  {order.customer.first_name[0]}{order.customer.last_name[0]}
                </Avatar>
                
                <div>
                  <Text weight={500} size="lg">
                    {order.customer.first_name} {order.customer.last_name}
                  </Text>
                  
                  <Text>
                    {order.customer.email}
                  </Text>
                  
                  {order.customer.phone && (
                    <Text>
                      {order.customer.phone}
                    </Text>
                  )}
                  
                  {order.customer.company && (
                    <Text size="sm" color="dimmed">
                      {order.customer.company}
                    </Text>
                  )}
                </div>
              </Group>
              
              <Button
                variant="light"
                fullWidth
                leftIcon={<IconUser size={16} />}
              >
                View Customer Profile
              </Button>
            </Paper>
            
            <Stack spacing="md">
              <Paper p="md" radius="md" withBorder>
                <Title order={5} mb="md">
                  <IconMapPin size={18} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
                  Shipping Address
                </Title>
                
                <Text weight={500}>
                  {order.shipping_address.first_name} {order.shipping_address.last_name}
                </Text>
                
                {order.shipping_address.company && (
                  <Text size="sm">{order.shipping_address.company}</Text>
                )}
                
                <Text>{order.shipping_address.address_line1}</Text>
                
                {order.shipping_address.address_line2 && (
                  <Text>{order.shipping_address.address_line2}</Text>
                )}
                
                <Text>
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                </Text>
                
                <Text>{order.shipping_address.country}</Text>
                
                {order.shipping_address.phone && (
                  <Text mt="xs" size="sm">
                    Phone: {order.shipping_address.phone}
                  </Text>
                )}
              </Paper>
              
              <Paper p="md" radius="md" withBorder>
                <Title order={5} mb="md">
                  <IconFileInvoice size={18} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
                  Billing Address
                </Title>
                
                <Text weight={500}>
                  {order.billing_address.first_name} {order.billing_address.last_name}
                </Text>
                
                {order.billing_address.company && (
                  <Text size="sm">{order.billing_address.company}</Text>
                )}
                
                <Text>{order.billing_address.address_line1}</Text>
                
                {order.billing_address.address_line2 && (
                  <Text>{order.billing_address.address_line2}</Text>
                )}
                
                <Text>
                  {order.billing_address.city}, {order.billing_address.state} {order.billing_address.postal_code}
                </Text>
                
                <Text>{order.billing_address.country}</Text>
                
                {order.billing_address.phone && (
                  <Text mt="xs" size="sm">
                    Phone: {order.billing_address.phone}
                  </Text>
                )}
              </Paper>
            </Stack>
          </SimpleGrid>
        )}
        
        {activeTab === 'shipments' && (
          <Box>
            {order.shipments.length === 0 ? (
              <Paper p="md" radius="md" withBorder>
                <Stack align="center" spacing="md" py="xl">
                  <IconTruckDelivery size={48} opacity={0.3} />
                  <Title order={3}>No Shipments</Title>
                  <Text align="center" color="dimmed">
                    This order doesn't have any shipments yet.
                  </Text>
                  <Button leftIcon={<IconTruckDelivery size={16} />}>
                    Create Shipment
                  </Button>
                </Stack>
              </Paper>
            ) : (
              <Stack spacing="md">
                {order.shipments.map(shipment => (
                  <EnhancedShipmentTimeline
                    key={shipment.id}
                    shipment={shipment}
                    showMap={true}
                    expandedByDefault={false}
                  />
                ))}
              </Stack>
            )}
          </Box>
        )}
        
        {activeTab === 'documents' && (
          <DocumentViewer
            documents={order.documents}
            onDownload={handleDocumentDownload}
            showTypeTabs={true}
          />
        )}
        
        {activeTab === 'payments' && (
          <Paper p="md" radius="md" withBorder>
            <Title order={4} mb="md">Payment Information</Title>
            
            {order.payments.length === 0 ? (
              <Stack align="center" spacing="md" py="xl">
                <IconCreditCard size={48} opacity={0.3} />
                <Title order={3}>No Payments</Title>
                <Text align="center" color="dimmed">
                  This order doesn't have any payment records yet.
                </Text>
                <Button leftIcon={<IconCreditCard size={16} />}>
                  Add Payment
                </Button>
              </Stack>
            ) : (
              <Stack spacing="md">
                {order.payments.map(payment => (
                  <Card key={payment.id} withBorder p="md" radius="md">
                    <Group position="apart" mb="xs">
                      <Group>
                        <Badge 
                          size="lg" 
                          color={getPaymentStatusColor(payment.status)}
                        >
                          {formatStatus(payment.status)}
                        </Badge>
                        <Text weight={500}>
                          {payment.payment_method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Text>
                      </Group>
                      <Text weight={700} size="lg">
                        {formatPrice(payment.amount)}
                      </Text>
                    </Group>
                    
                    <Group position="apart">
                      <Group spacing="xs">
                        <IconCalendarEvent size={14} />
                        <Text size="sm">
                          {formatDate(payment.date)} at {formatTime(payment.date)}
                        </Text>
                      </Group>
                      
                      {payment.transaction_id && (
                        <Text size="sm" color="dimmed">
                          Transaction ID: {payment.transaction_id}
                        </Text>
                      )}
                    </Group>
                    
                    {payment.notes && (
                      <Text size="sm" mt="xs" color="dimmed">
                        {payment.notes}
                      </Text>
                    )}
                  </Card>
                ))}
              </Stack>
            )}
          </Paper>
        )}
        
        {activeTab === 'timeline' && (
          <Paper p="md" radius="md" withBorder>
            <Title order={4} mb="md">Order Timeline</Title>
            
            <ScrollArea h={500} offsetScrollbars>
              <Timeline active={order.timeline.length - 1} bulletSize={24} lineWidth={2}>
                {order.timeline.map((event, index) => (
                  <Timeline.Item
                    key={event.id} 
                    bullet={getTimelineIcon(event)}
                    title={event.title}
                    lineVariant={index === order.timeline.length - 1 ? 'dashed' : 'solid'}
                    color={getTimelineColor(event)}
                  >
                    <Text size="sm" mt={4}>
                      {event.description}
                    </Text>
                    <Text size="xs" color="dimmed" mt={4}>
                      {formatDate(event.timestamp)} at {formatTime(event.timestamp)}
                      {event.user_name && ` by ${event.user_name}`}
                    </Text>
                  </Timeline.Item>
                ))}
              </Timeline>
            </ScrollArea>
          </Paper>
        )}
        
        {activeTab === 'notes' && (
          <Paper p="md" radius="md" withBorder>
            <Title order={4} mb="md">Order Notes</Title>
            
            {/* Filter timeline events of type 'note' */}
            {order.timeline.filter(event => event.type === 'note').length === 0 ? (
              <Stack align="center" spacing="md" py="xl">
                <IconNotes size={48} opacity={0.3} />
                <Title order={3}>No Notes</Title>
                <Text align="center" color="dimmed">
                  This order doesn't have any notes yet.
                </Text>
                <Button leftIcon={<IconNotes size={16} />}>
                  Add Note
                </Button>
              </Stack>
            ) : (
              <Stack spacing="sm">
                {order.timeline
                  .filter(event => event.type === 'note')
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map(note => (
                    <Card key={note.id} withBorder p="md" radius="md">
                      <Text>{note.description}</Text>
                      <Group position="apart" mt="xs">
                        <Text size="xs" color="dimmed">
                          {formatDate(note.timestamp)} at {formatTime(note.timestamp)}
                        </Text>
                        {note.user_name && (
                          <Text size="xs" color="dimmed">
                            Added by: {note.user_name}
                          </Text>
                        )}
                      </Group>
                    </Card>
                  ))}
              </Stack>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default OrderDetail;