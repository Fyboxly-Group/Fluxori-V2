import React, { useEffect, useRef, useState } from 'react';
import { 
  Box, 
  Card, 
  Text, 
  Group, 
  Stack, 
  Badge, 
  Title, 
  Divider, 
  useMantineTheme,
  ThemeIcon,
  ActionIcon,
  Tooltip,
  Paper
} from '@mantine/core';
import { 
  IconPackage, 
  IconTruck, 
  IconHome,
  IconMapPin,
  IconCalendarEvent,
  IconCheck,
  IconAlertTriangle,
  IconClock,
  IconChevronDown,
  IconChevronUp,
  IconInfoCircle,
  IconMapSearch
} from '@tabler/icons-react';
import gsap from 'gsap';
import { useDrawSVG, useStaggerAnimation } from '@/hooks/useAnimation';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { ShipmentTracking, ShipmentEvent } from '@/types/order';

// Props interface
interface EnhancedShipmentTimelineProps {
  /** Shipment tracking data */
  shipment: ShipmentTracking;
  /** Custom styling */
  className?: string;
  /** Whether to show the map view */
  showMap?: boolean;
  /** Whether to expand all events by default */
  expandedByDefault?: boolean;
  /** Whether to show the estimated delivery */
  showEstimatedDelivery?: boolean;
  /** Whether to show the carrier information */
  showCarrierInfo?: boolean;
  /** Called when the user clicks on a tracking link */
  onTrackingLinkClick?: (tracking_number: string, carrier: string) => void;
  /** Called when the user clicks on view map */
  onViewMapClick?: (events: ShipmentEvent[], origin?: any, destination?: any) => void;
}

/**
 * Enhanced Shipment Timeline Component
 * 
 * A comprehensive shipment tracking timeline with animated paths,
 * expandable events, map integration, and responsive design.
 */
export const EnhancedShipmentTimeline: React.FC<EnhancedShipmentTimelineProps> = ({
  shipment,
  className,
  showMap = true,
  expandedByDefault = false,
  showEstimatedDelivery = true,
  showCarrierInfo = true,
  onTrackingLinkClick,
  onViewMapClick
}) => {
  const theme = useMantineTheme();
  const { motionPreference } = useMotionPreference();
  const [expanded, setExpanded] = useState(expandedByDefault);
  const svgPathRef = useDrawSVG<SVGPathElement>({
    delay: 0.2,
    duration: 1.5,
    disabled: motionPreference.reduced || motionPreference.level === 'minimal'
  });
  const mainTimelineRef = useRef<HTMLDivElement>(null);
  const detailsRef = useStaggerAnimation({
    stagger: 0.08,
    delay: 0.3,
    y: 10,
    disabled: !expanded || motionPreference.reduced || motionPreference.level === 'minimal'
  });

  // Handle timeline expansion/collapse with animation
  const toggleExpand = () => {
    if (!mainTimelineRef.current) return;
    
    // Toggle state
    setExpanded(!expanded);
    
    // If we're expanding and motion is enabled, animate the new content
    if (!expanded && motionPreference.level !== 'minimal' && !motionPreference.reduced) {
      // The detailsRef staggerAnimation will handle animating in the items
    } else if (expanded && detailsRef.current) {
      // Animate out the details
      gsap.to(detailsRef.current.children, {
        opacity: 0,
        y: -10,
        duration: 0.2,
        stagger: 0.03,
        ease: 'power2.in'
      });
    }
  };

  // Get status icon based on current shipment status
  const getStatusIcon = () => {
    switch (shipment.status) {
      case 'delivered':
        return <IconCheck size={18} />;
      case 'in_transit':
      case 'out_for_delivery':
        return <IconTruck size={18} />;
      case 'pending':
        return <IconClock size={18} />;
      case 'failed':
      case 'returned':
        return <IconAlertTriangle size={18} />;
      default:
        return <IconPackage size={18} />;
    }
  };

  // Get status color based on current shipment status
  const getStatusColor = () => {
    switch (shipment.status) {
      case 'delivered':
        return 'green';
      case 'in_transit':
      case 'out_for_delivery':
        return 'blue';
      case 'pending':
        return 'yellow';
      case 'failed':
      case 'returned':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Format status for display
  const getFormattedStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get estimated delivery text
  const getEstimatedDeliveryText = () => {
    if (!shipment.estimated_delivery) return 'Not available';
    
    const estDate = new Date(shipment.estimated_delivery);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check if it's today
    if (estDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // Check if it's tomorrow
    if (estDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    // Otherwise format the date
    return estDate.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get tracking URL or format for display
  const getTrackingDisplay = () => {
    if (shipment.tracking_url) {
      return (
        <Text 
          component="a" 
          href={shipment.tracking_url} 
          target="_blank" 
          rel="noopener noreferrer"
          sx={{ textDecoration: 'none', color: theme.colors.blue[6] }}
          onClick={(e) => {
            e.preventDefault();
            if (onTrackingLinkClick) {
              onTrackingLinkClick(shipment.tracking_number, shipment.carrier);
            } else {
              window.open(shipment.tracking_url, '_blank');
            }
          }}
        >
          {shipment.tracking_number}
        </Text>
      );
    }
    
    return shipment.tracking_number;
  };

  // Handle map view click
  const handleViewMapClick = () => {
    if (onViewMapClick && shipment.events) {
      onViewMapClick(
        shipment.events,
        shipment.origin_address,
        shipment.destination_address
      );
    }
  };

  return (
    <Card 
      className={className} 
      shadow="sm" 
      p="md"
      radius="md"
      withBorder
    >
      {/* Summary Header */}
      <Group position="apart" mb="md">
        <Group>
          <ThemeIcon 
            size="lg" 
            radius="xl"
            color={getStatusColor()}
            variant="light"
          >
            {getStatusIcon()}
          </ThemeIcon>
          <div>
            <Title order={5}>Shipment Status</Title>
            <Group spacing="xs">
              <Badge color={getStatusColor()} variant="filled">
                {getFormattedStatus(shipment.status)}
              </Badge>
              {showCarrierInfo && (
                <Badge color="gray" variant="outline">
                  {shipment.carrier}
                </Badge>
              )}
            </Group>
          </div>
        </Group>
        
        <ActionIcon 
          variant="subtle" 
          onClick={toggleExpand}
          size="lg"
          color="gray"
          sx={{
            transition: 'transform 0.2s ease-in-out',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        >
          {expanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
        </ActionIcon>
      </Group>
      
      {/* Tracking Information */}
      <Group position="apart" mb="md">
        <div>
          <Text size="sm" weight={500} color="dimmed">Tracking Number</Text>
          <Text>{getTrackingDisplay()}</Text>
        </div>
        
        {showEstimatedDelivery && shipment.estimated_delivery && (
          <div>
            <Text size="sm" weight={500} color="dimmed">Estimated Delivery</Text>
            <Text>{getEstimatedDeliveryText()}</Text>
          </div>
        )}
        
        <div>
          <Text size="sm" weight={500} color="dimmed">Shipped Date</Text>
          <Text>
            {new Date(shipment.shipped_date).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </Text>
        </div>
      </Group>
      
      {/* Main Timeline */}
      <Box ref={mainTimelineRef} my="md">
        <div style={{ position: 'relative' }}>
          {/* SVG Path for Timeline */}
          <Box 
            sx={{ 
              position: 'absolute', 
              left: '15px', 
              top: '15px', 
              height: 'calc(100% - 30px)', 
              zIndex: 0,
              pointerEvents: 'none'
            }}
          >
            <svg 
              height="100%" 
              width="20"
              viewBox="0 0 20 100"
              preserveAspectRatio="none"
            >
              <path
                ref={svgPathRef}
                d="M10,0 L10,100"
                stroke={theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4]}
                strokeWidth="2"
                fill="none"
                strokeDasharray="5,3"
              />
            </svg>
          </Box>
          
          {/* Origin Icon */}
          <Group spacing="lg" mb="sm">
            <ThemeIcon size="lg" radius="xl" color="blue">
              <IconHome size={18} />
            </ThemeIcon>
            <Box>
              <Text weight={500}>Origin</Text>
              <Text size="sm" color="dimmed">
                {shipment.origin_address 
                  ? `${shipment.origin_address.city || ''}, ${shipment.origin_address.state || ''}, ${shipment.origin_address.country || ''}`
                  : 'Warehouse'
                }
              </Text>
            </Box>
          </Group>
          
          {/* Timeline Events (expanded view) */}
          {expanded && shipment.events && shipment.events.length > 0 && (
            <Box ref={detailsRef} ml={20} my="md">
              <Stack spacing="xs">
                {shipment.events.map((event, index) => (
                  <Paper 
                    key={event.id || index} 
                    p="xs" 
                    withBorder
                    radius="md"
                    sx={{ 
                      position: 'relative',
                      borderLeft: `3px solid ${theme.colors[
                        event.status.includes('deliver') ? 'green' : 
                        event.status.includes('transit') ? 'blue' : 
                        event.status.includes('fail') || event.status.includes('return') ? 'red' :
                        'gray'
                      ][6]}`,
                      '&:hover': {
                        backgroundColor: theme.colorScheme === 'dark' 
                          ? theme.colors.dark[6] 
                          : theme.colors.gray[0]
                      }
                    }}
                  >
                    <Group position="apart" noWrap align="flex-start">
                      <Box>
                        <Group spacing="xs">
                          <IconMapPin size={16} />
                          <Text weight={500} size="sm">{event.location}</Text>
                        </Group>
                        <Text size="sm" mt="xs">{event.description}</Text>
                      </Box>
                      <Box>
                        <Text size="xs" color="dimmed">
                          {new Date(event.timestamp).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Text>
                        <Text size="xs" color="dimmed">
                          {new Date(event.timestamp).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </Box>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}
          
          {/* Destination Icon */}
          <Group spacing="lg" mt="sm">
            <ThemeIcon 
              size="lg" 
              radius="xl" 
              color={shipment.status === 'delivered' ? 'green' : 'gray'}
            >
              <IconMapPin size={18} />
            </ThemeIcon>
            <Box>
              <Text weight={500}>Destination</Text>
              <Text size="sm" color="dimmed">
                {shipment.destination_address 
                  ? `${shipment.destination_address.city || ''}, ${shipment.destination_address.state || ''}, ${shipment.destination_address.country || ''}`
                  : 'Customer Address'
                }
              </Text>
            </Box>
          </Group>
        </div>
      </Box>
      
      {/* Footer Actions */}
      <Divider my="md" />
      <Group position="apart">
        <Group spacing="xs">
          <IconCalendarEvent size={16} />
          <Text size="sm" color="dimmed">
            {shipment.items.length} {shipment.items.length === 1 ? 'item' : 'items'} in this shipment
          </Text>
        </Group>
        
        <Group spacing="xs">
          {expanded && showMap && (
            <Tooltip label="View on map">
              <ActionIcon
                variant="light"
                color="blue"
                onClick={handleViewMapClick}
                disabled={!shipment.events || shipment.events.length === 0}
              >
                <IconMapSearch size={18} />
              </ActionIcon>
            </Tooltip>
          )}
          
          <Tooltip label="View details">
            <ActionIcon
              variant="light"
              color="gray"
              onClick={toggleExpand}
            >
              {expanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
            </ActionIcon>
          </Tooltip>
          
          <Tooltip label="More information">
            <ActionIcon
              variant="light"
              color="gray"
              component="a"
              href={shipment.tracking_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                if (onTrackingLinkClick) {
                  onTrackingLinkClick(shipment.tracking_number, shipment.carrier);
                } else if (shipment.tracking_url) {
                  window.open(shipment.tracking_url, '_blank');
                }
              }}
            >
              <IconInfoCircle size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Card>
  );
};

export default EnhancedShipmentTimeline;