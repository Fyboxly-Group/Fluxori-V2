import { useEffect, useRef } from 'react';
import { Paper, Text, Timeline, Group, ThemeIcon, Stack } from '@mantine/core';
import { IconCheck, IconClock, IconTruck, IconPackage, IconSend, IconMapPin } from '@tabler/icons-react';
import { gsap } from 'gsap';
import { DrawSVG } from 'gsap/DrawSVG';

// Register GSAP plugins
gsap.registerPlugin(DrawSVG);

export interface ShipmentEvent {
  id: string;
  status: 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'pending' | 'exception';
  location: string;
  timestamp: Date;
  description: string;
  isActive?: boolean;
}

export interface ShipmentTimelineProps {
  events: ShipmentEvent[];
  title?: string;
  className?: string;
  animateEntrance?: boolean;
}

export const ShipmentTimeline: React.FC<ShipmentTimelineProps> = ({
  events,
  title = 'Shipment Progress',
  className,
  animateEntrance = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  
  // Format date to readable string
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get icon based on status
  const getStatusIcon = (status: ShipmentEvent['status']) => {
    switch (status) {
      case 'shipped':
        return <IconSend size={16} />;
      case 'in_transit':
        return <IconTruck size={16} />;
      case 'out_for_delivery':
        return <IconPackage size={16} />;
      case 'delivered':
        return <IconCheck size={16} />;
      case 'pending':
        return <IconClock size={16} />;
      case 'exception':
        return <IconMapPin size={16} />;
      default:
        return <IconTruck size={16} />;
    }
  };
  
  // Get color based on status
  const getStatusColor = (status: ShipmentEvent['status']) => {
    switch (status) {
      case 'shipped':
        return 'blue';
      case 'in_transit':
        return 'indigo';
      case 'out_for_delivery':
        return 'violet';
      case 'delivered':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'exception':
        return 'red';
      default:
        return 'gray';
    }
  };
  
  // Animate timeline on mount
  useEffect(() => {
    if (containerRef.current && animateEntrance) {
      const items = containerRef.current.querySelectorAll('.timeline-item');
      const icons = containerRef.current.querySelectorAll('.timeline-icon');
      const labels = containerRef.current.querySelectorAll('.timeline-label');
      const descriptions = containerRef.current.querySelectorAll('.timeline-description');
      
      // Create timeline animation
      const timeline = gsap.timeline();
      
      // Stagger animate timeline items
      timeline.fromTo(items,
        { opacity: 0, x: -20 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.5, 
          stagger: 0.15,
          ease: 'power2.out' 
        }
      );
      
      // Animate icons with scale effect
      timeline.fromTo(icons,
        { scale: 0, opacity: 0 },
        { 
          scale: 1, 
          opacity: 1, 
          duration: 0.4, 
          stagger: 0.15,
          ease: 'back.out(1.7)'
        },
        '-=0.8'
      );
      
      // Fade in labels
      timeline.fromTo(labels,
        { opacity: 0 },
        { 
          opacity: 1, 
          duration: 0.3, 
          stagger: 0.15,
          ease: 'power2.out' 
        },
        '-=0.8'
      );
      
      // Fade in descriptions slightly delayed
      timeline.fromTo(descriptions,
        { opacity: 0, y: 10 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.4, 
          stagger: 0.15,
          ease: 'power2.out' 
        },
        '-=0.7'
      );
      
      // Animate timeline line if SVG is available
      if (lineRef.current) {
        timeline.fromTo(lineRef.current,
          { drawSVG: "0%" },
          { 
            drawSVG: "100%", 
            duration: 1.2, 
            ease: "power2.inOut" 
          },
          0
        );
      }
    }
  }, [animateEntrance]);
  
  return (
    <Paper p="md" withBorder shadow="sm" className={className}>
      <Stack spacing="md">
        <Text weight={700} size="lg">{title}</Text>
        
        <div ref={containerRef} className="shipment-timeline">
          <Timeline active={events.findIndex(event => event.isActive)}>
            {events.map((event, index) => (
              <Timeline.Item 
                key={event.id}
                className="timeline-item"
                bullet={
                  <ThemeIcon 
                    size={24} 
                    radius="xl" 
                    color={getStatusColor(event.status)}
                    className="timeline-icon"
                  >
                    {getStatusIcon(event.status)}
                  </ThemeIcon>
                }
                title={
                  <Group position="apart" className="timeline-label">
                    <Text weight={500}>{event.location}</Text>
                    <Text size="xs" color="dimmed">{formatDate(event.timestamp)}</Text>
                  </Group>
                }
              >
                <Text size="sm" mt={4} color="dimmed" className="timeline-description">
                  {event.description}
                </Text>
              </Timeline.Item>
            ))}
          </Timeline>
          
          {/* Hidden SVG for timeline line animation */}
          <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
            <path ref={lineRef} d="M0,0 L0,1000" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </div>
      </Stack>
    </Paper>
  );
};

export default ShipmentTimeline;