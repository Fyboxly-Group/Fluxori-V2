import React, { useRef, useEffect, useState } from 'react';
import { Card, CardProps, Text, Group, Title, useMantineTheme, ActionIcon, Menu, Stack, Loader } from '@mantine/core';
import { IconDotsVertical, IconDownload, IconRefresh, IconZoomIn, IconChartLine, IconChartBar, IconChartPie } from '@tabler/icons-react';
import { useElementSize } from '@mantine/hooks';
import gsap from 'gsap';
import { useAnimatedMount } from '@/hooks/useAnimation';

export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'radar' | 'scatter';

export interface AnimatedChartProps extends Omit<CardProps, 'children'> {
  /** Chart title */
  title: string;
  /** Optional description */
  description?: string;
  /** Chart data component (e.g., your chart library component) */
  children: React.ReactNode;
  /** Whether to show download option */
  downloadable?: boolean;
  /** Whether to show refresh button */
  refreshable?: boolean;
  /** Whether the chart is loading */
  loading?: boolean;
  /** Function called when refresh is clicked */
  onRefresh?: () => void;
  /** Height of the chart */
  chartHeight?: number | string;
  /** Function to handle chart download */
  onDownload?: () => void;
  /** Whether to allow chart type switching */
  switchableType?: boolean;
  /** Current chart type */
  chartType?: ChartType;
  /** Function called when chart type is changed */
  onChartTypeChange?: (type: ChartType) => void;
  /** Whether to animate the chart on mount */
  animate?: boolean;
  /** Animation duration in seconds */
  animationDuration?: number;
}

/**
 * Animated chart container component that adds consistent styling and animations
 * to any chart library
 */
export const AnimatedChart: React.FC<AnimatedChartProps> = ({
  title,
  description,
  children,
  downloadable = true,
  refreshable = true,
  loading = false,
  onRefresh,
  chartHeight = 300,
  onDownload,
  switchableType = false,
  chartType = 'line',
  onChartTypeChange,
  animate = true,
  animationDuration = 1,
  ...props
}) => {
  const theme = useMantineTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useAnimatedMount('fadeInUp', { duration: 0.5 });
  const { ref: sizeRef, width } = useElementSize();
  const [isChartVisible, setIsChartVisible] = useState(!animate);
  
  // Handle chart animation on mount
  useEffect(() => {
    if (!animate || !chartContainerRef.current) {
      setIsChartVisible(true);
      return;
    }
    
    // Delay chart visibility to ensure proper animation
    const timer = setTimeout(() => {
      setIsChartVisible(true);
      
      // Find chart elements to animate
      const chartContainer = chartContainerRef.current;
      if (!chartContainer) return;
      
      // Common chart elements to animate
      const animations = [];
      
      // SVG paths (for line/area charts)
      const paths = chartContainer.querySelectorAll('path');
      if (paths.length > 0) {
        animations.push(
          gsap.fromTo(
            paths, 
            { 
              strokeDashoffset: (i, target) => {
                // Get the actual length of the path
                const length = target.getTotalLength?.() || 1000;
                // Set initial dasharray and offset to create drawing effect
                gsap.set(target, { strokeDasharray: length });
                return length;
              },
              opacity: 0 
            },
            { 
              strokeDashoffset: 0, 
              opacity: 1, 
              duration: animationDuration,
              ease: 'power2.out',
              stagger: 0.1
            }
          )
        );
      }
      
      // Bars (for bar charts)
      const bars = chartContainer.querySelectorAll('rect:not([width="100%"])');
      if (bars.length > 0) {
        animations.push(
          gsap.fromTo(
            bars,
            { scaleY: 0, transformOrigin: 'bottom' },
            { 
              scaleY: 1, 
              duration: animationDuration,
              ease: 'elastic.out(0.5, 0.3)',
              stagger: 0.03
            }
          )
        );
      }
      
      // Circles (for scatter/points)
      const circles = chartContainer.querySelectorAll('circle');
      if (circles.length > 0) {
        animations.push(
          gsap.fromTo(
            circles,
            { scale: 0, opacity: 0 },
            { 
              scale: 1, 
              opacity: 1,
              duration: animationDuration * 0.7,
              ease: 'back.out(2)',
              stagger: 0.02
            }
          )
        );
      }
      
      // Pie/Donut slices
      const slices = chartContainer.querySelectorAll('path[d*="A"]');
      if (slices.length > 0 && chartType === 'pie') {
        animations.push(
          gsap.fromTo(
            slices,
            { scale: 0.5, opacity: 0, transformOrigin: 'center' },
            { 
              scale: 1, 
              opacity: 1,
              duration: animationDuration,
              ease: 'back.out(1.7)',
              stagger: 0.1
            }
          )
        );
      }
      
      // Text labels
      const labels = chartContainer.querySelectorAll('text');
      if (labels.length > 0) {
        animations.push(
          gsap.fromTo(
            labels,
            { opacity: 0, y: 10 },
            { 
              opacity: 1, 
              y: 0,
              duration: animationDuration * 0.5,
              ease: 'power2.out',
              stagger: 0.02,
              delay: animationDuration * 0.5
            }
          )
        );
      }
      
      // If no specific elements were found, animate the whole container
      if (animations.length === 0) {
        gsap.fromTo(
          chartContainer,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: animationDuration, ease: 'power2.out' }
        );
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [animate, animationDuration, chartType]);
  
  // Handle chart refresh with animation
  const handleRefresh = () => {
    if (!chartContainerRef.current || !onRefresh) return;
    
    // Create refresh animation
    const tl = gsap.timeline();
    
    tl.to(chartContainerRef.current, {
      opacity: 0,
      y: 10,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        onRefresh();
      }
    }).to(chartContainerRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
      delay: 0.2
    });
  };
  
  // Get the icon for the current chart type
  const getChartTypeIcon = (type: ChartType) => {
    switch (type) {
      case 'bar':
        return <IconChartBar size={16} />;
      case 'pie':
        return <IconChartPie size={16} />;
      case 'line':
      case 'area':
      default:
        return <IconChartLine size={16} />;
    }
  };
  
  return (
    <Card ref={cardRef} shadow="sm" radius="md" withBorder p="lg" {...props}>
      <Card.Section px="lg" pt="lg" pb="xs">
        <Group position="apart">
          <div>
            <Title order={4}>{title}</Title>
            {description && (
              <Text size="sm" color="dimmed">
                {description}
              </Text>
            )}
          </div>
          
          <Group spacing={8}>
            {refreshable && onRefresh && (
              <ActionIcon
                variant="light"
                onClick={handleRefresh}
                title="Refresh"
              >
                <IconRefresh size={18} />
              </ActionIcon>
            )}
            
            {switchableType && onChartTypeChange && (
              <Menu position="bottom-end" shadow="md">
                <Menu.Target>
                  <ActionIcon
                    variant="light"
                    title="Change chart type"
                  >
                    {getChartTypeIcon(chartType)}
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Chart Type</Menu.Label>
                  <Menu.Item 
                    icon={<IconChartLine size={16} />}
                    onClick={() => onChartTypeChange('line')}
                    disabled={chartType === 'line'}
                  >
                    Line Chart
                  </Menu.Item>
                  <Menu.Item 
                    icon={<IconChartBar size={16} />}
                    onClick={() => onChartTypeChange('bar')}
                    disabled={chartType === 'bar'}
                  >
                    Bar Chart
                  </Menu.Item>
                  <Menu.Item 
                    icon={<IconChartPie size={16} />}
                    onClick={() => onChartTypeChange('pie')}
                    disabled={chartType === 'pie'}
                  >
                    Pie Chart
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
            
            {downloadable && onDownload && (
              <ActionIcon
                variant="light"
                onClick={onDownload}
                title="Download"
              >
                <IconDownload size={18} />
              </ActionIcon>
            )}
            
            <Menu position="bottom-end" shadow="md">
              <Menu.Target>
                <ActionIcon variant="light">
                  <IconDotsVertical size={18} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Chart Options</Menu.Label>
                <Menu.Item icon={<IconZoomIn size={16} />}>
                  Zoom In
                </Menu.Item>
                {downloadable && (
                  <Menu.Item 
                    icon={<IconDownload size={16} />}
                    onClick={onDownload}
                  >
                    Download Data
                  </Menu.Item>
                )}
                {refreshable && (
                  <Menu.Item 
                    icon={<IconRefresh size={16} />}
                    onClick={handleRefresh}
                  >
                    Refresh Data
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Card.Section>
      
      <div 
        ref={sizeRef}
        style={{
          height: chartHeight,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {loading ? (
          <Stack
            align="center"
            justify="center"
            style={{ height: '100%' }}
            spacing="xs"
          >
            <Loader />
            <Text size="sm" color="dimmed">Loading chart data...</Text>
          </Stack>
        ) : (
          <div 
            ref={chartContainerRef}
            style={{
              opacity: isChartVisible ? 1 : 0,
              height: '100%',
              width: '100%'
            }}
          >
            {children}
          </div>
        )}
      </div>
    </Card>
  );
};

export default AnimatedChart;