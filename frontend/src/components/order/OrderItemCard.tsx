import React, { useState } from 'react';
import { 
  Card, 
  Group, 
  Text, 
  Badge, 
  Image, 
  Stack, 
  useMantineTheme, 
  ActionIcon, 
  Box, 
  Collapse, 
  Paper,
  Grid,
  Tooltip,
  ThemeIcon
} from '@mantine/core';
import { 
  IconChevronDown, 
  IconChevronUp, 
  IconPackageExport, 
  IconShoppingBag, 
  IconLink, 
  IconMapPin, 
  IconCurrencyDollar 
} from '@tabler/icons-react';
import gsap from 'gsap';
import { OrderItem } from '@/types/order';

interface OrderItemCardProps {
  /** Order item data */
  item: OrderItem;
  /** Custom class name */
  className?: string;
  /** Whether to show the full details by default */
  expandedByDefault?: boolean;
  /** Called when the user clicks on the item link */
  onViewItemClick?: (itemId: string) => void;
  /** Whether to show the fulfillment status */
  showFulfillmentStatus?: boolean;
  /** Currency code */
  currency?: string;
  /** Whether to show variation details */
  showVariations?: boolean;
}

/**
 * Order Item Card Component
 * 
 * Displays detailed information about an order item with
 * animation effects and expandable content.
 */
export const OrderItemCard: React.FC<OrderItemCardProps> = ({
  item,
  className,
  expandedByDefault = false,
  onViewItemClick,
  showFulfillmentStatus = true,
  currency = 'USD',
  showVariations = true
}) => {
  const theme = useMantineTheme();
  const [expanded, setExpanded] = useState(expandedByDefault);
  
  // Handle expand/collapse with animation
  const toggleExpand = () => {
    setExpanded(!expanded);
    
    // Animate the card when expanding/collapsing
    gsap.to(`.item-${item.id}-details`, {
      height: expanded ? 0 : 'auto',
      opacity: expanded ? 0 : 1,
      duration: 0.3,
      ease: 'power2.inOut'
    });
  };
  
  // Get the formatted price
  const getFormattedPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Get the fulfillment status color
  const getFulfillmentStatusColor = () => {
    switch (item.fulfillment_status) {
      case 'fulfilled':
        return 'green';
      case 'partially_fulfilled':
        return 'orange';
      case 'on_backorder':
        return 'red';
      default:
        return 'gray';
    }
  };
  
  // Format the fulfillment status text
  const getFormattedFulfillmentStatus = () => {
    if (!item.fulfillment_status) return 'Unfulfilled';
    
    return item.fulfillment_status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };
  
  return (
    <Card
      shadow="sm"
      p="md" 
      radius="md"
      withBorder
      className={className}
      sx={{
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        overflow: 'visible',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }
      }}
    >
      <Card.Section p="md">
        <Group position="apart" noWrap>
          {/* Product Image and Basic Info */}
          <Group spacing="md" noWrap>
            <Box sx={{ position: 'relative' }}>
              <Image
                src={item.image_url || '/placeholder-image.svg'}
                alt={item.name}
                height={80}
                width={80}
                radius="md"
                withPlaceholder
                placeholder={
                  <ThemeIcon size={80} radius="md" variant="light">
                    <IconShoppingBag size={40} />
                  </ThemeIcon>
                }
                sx={{
                  border: `1px solid ${
                    theme.colorScheme === 'dark' 
                      ? theme.colors.dark[4] 
                      : theme.colors.gray[3]
                  }`
                }}
              />
              
              {showFulfillmentStatus && item.fulfillment_status && (
                <Badge 
                  color={getFulfillmentStatusColor()}
                  size="sm"
                  sx={{ 
                    position: 'absolute', 
                    bottom: -5, 
                    right: -5,
                    zIndex: 2
                  }}
                >
                  {getFormattedFulfillmentStatus()}
                </Badge>
              )}
            </Box>
            
            <Stack spacing={4}>
              <Text weight={500} lineClamp={2}>
                {item.name}
              </Text>
              <Text size="sm" color="dimmed">
                SKU: {item.sku}
              </Text>
              <Text size="sm">
                Qty: {item.quantity} × {getFormattedPrice(item.price)}
              </Text>
            </Stack>
          </Group>
          
          {/* Price and Actions */}
          <Group spacing={10} noWrap>
            <Stack spacing={5} align="flex-end">
              <Text weight={700} size="lg">
                {getFormattedPrice(item.total)}
              </Text>
              
              {(item.discount > 0 || item.tax > 0) && (
                <Group spacing={5}>
                  {item.discount > 0 && (
                    <Badge color="red" variant="light" size="sm">
                      -{getFormattedPrice(item.discount)}
                    </Badge>
                  )}
                  
                  {item.tax > 0 && (
                    <Badge color="blue" variant="light" size="sm">
                      +{getFormattedPrice(item.tax)}
                    </Badge>
                  )}
                </Group>
              )}
            </Stack>
            
            <ActionIcon 
              onClick={toggleExpand} 
              variant="light"
              color={expanded ? 'blue' : 'gray'}
              sx={{
                transition: 'transform 0.2s ease-in-out',
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            >
              {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            </ActionIcon>
          </Group>
        </Group>
      </Card.Section>
      
      {/* Expandable Details */}
      <Collapse in={expanded} className={`item-${item.id}-details`}>
        <Paper p="md" mt="sm" radius="md" withBorder>
          <Grid>
            {/* Variation Details */}
            {showVariations && item.variation && Object.keys(item.variation).length > 0 && (
              <Grid.Col span={12} md={6}>
                <Text weight={500} size="sm" mb="xs">
                  Variations
                </Text>
                <Stack spacing={5}>
                  {Object.entries(item.variation).map(([key, value]) => (
                    <Group key={key} position="apart" spacing={5}>
                      <Text size="sm" color="dimmed">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                      </Text>
                      <Text size="sm">{value}</Text>
                    </Group>
                  ))}
                </Stack>
              </Grid.Col>
            )}
            
            {/* Warehouse Info */}
            {item.warehouse_id && (
              <Grid.Col span={12} md={6}>
                <Stack spacing={8}>
                  <Group spacing={5}>
                    <IconMapPin size={16} />
                    <Text weight={500} size="sm">
                      Warehouse
                    </Text>
                  </Group>
                  <Text size="sm">{item.warehouse_id}</Text>
                </Stack>
              </Grid.Col>
            )}
            
            {/* Price Breakdown */}
            <Grid.Col span={12} md={6}>
              <Group spacing={5} mb="xs">
                <IconCurrencyDollar size={16} />
                <Text weight={500} size="sm">
                  Price Breakdown
                </Text>
              </Group>
              <Stack spacing={5}>
                <Group position="apart">
                  <Text size="sm" color="dimmed">Unit Price:</Text>
                  <Text size="sm">{getFormattedPrice(item.price)}</Text>
                </Group>
                
                {item.discount > 0 && (
                  <Group position="apart">
                    <Text size="sm" color="dimmed">Discount:</Text>
                    <Text size="sm" color="red">-{getFormattedPrice(item.discount)}</Text>
                  </Group>
                )}
                
                {item.tax > 0 && (
                  <Group position="apart">
                    <Text size="sm" color="dimmed">Tax:</Text>
                    <Text size="sm">+{getFormattedPrice(item.tax)}</Text>
                  </Group>
                )}
                
                <Group position="apart">
                  <Text size="sm" color="dimmed">Subtotal:</Text>
                  <Text size="sm" weight={500}>{getFormattedPrice(item.price * item.quantity)}</Text>
                </Group>
                
                <Group position="apart">
                  <Text size="sm" weight={700}>Total:</Text>
                  <Text size="sm" weight={700}>{getFormattedPrice(item.total)}</Text>
                </Group>
              </Stack>
            </Grid.Col>
            
            {/* Actions */}
            <Grid.Col span={12}>
              <Group position="right" spacing="sm">
                {onViewItemClick && (
                  <Tooltip label="View product details">
                    <ActionIcon 
                      variant="light" 
                      color="blue"
                      onClick={() => onViewItemClick(item.product_id)}
                    >
                      <IconLink size={18} />
                    </ActionIcon>
                  </Tooltip>
                )}
                
                {showFulfillmentStatus && item.fulfillment_status !== 'fulfilled' && (
                  <Tooltip label="Mark as shipped">
                    <ActionIcon variant="light" color="green">
                      <IconPackageExport size={18} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
            </Grid.Col>
          </Grid>
        </Paper>
      </Collapse>
    </Card>
  );
};

export default OrderItemCard;