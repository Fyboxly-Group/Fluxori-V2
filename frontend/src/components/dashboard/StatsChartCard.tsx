import React, { useState } from 'react';
import { Card, Text, Group, Badge, Stack, ThemeIcon, ActionIcon, Menu, useMantineTheme } from '@mantine/core';
import { IconArrowUpRight, IconArrowDownRight, IconArrowRight, IconDotsVertical, IconCalendar } from '@tabler/icons-react';
import { ChartData, ChartOptions } from 'chart.js';
import AnimatedChartJS from '../Charts/AnimatedChartJS';
import { useAnimatedMount } from '@/hooks/useAnimation';
import gsap from 'gsap';

export interface TimeRangeOption {
  label: string;
  value: string;
  days: number;
}

export interface StatsChartCardProps {
  /** Title of the card */
  title: string;
  /** Current value to display */
  value: number | string;
  /** Percentage change */
  change?: number;
  /** Description or subtitle */
  description?: string;
  /** Chart data for Chart.js */
  chartData: ChartData;
  /** Chart options for Chart.js */
  chartOptions?: ChartOptions;
  /** Chart type to display */
  chartType?: 'line' | 'bar' | 'area' | 'pie';
  /** Currency symbol for formatting */
  currency?: string;
  /** Height of the chart */
  chartHeight?: number;
  /** Whether the data is loading */
  loading?: boolean;
  /** Color for the chart and card accents */
  color?: string;
  /** Time range options for the chart */
  timeRangeOptions?: TimeRangeOption[];
  /** The currently selected time range */
  selectedTimeRange?: string;
  /** Function called when time range changes */
  onTimeRangeChange?: (range: string) => void;
  /** Function called when refresh is clicked */
  onRefresh?: () => void;
  /** Function called when data is downloaded */
  onDownload?: () => void;
}

/**
 * A dashboard stats card with integrated Chart.js chart
 * Follows Fluxori Motion Design Guidelines with GSAP animations
 */
export const StatsChartCard: React.FC<StatsChartCardProps> = ({
  title,
  value,
  change,
  description,
  chartData,
  chartOptions = {},
  chartType = 'line',
  currency = '',
  chartHeight = 120,
  loading = false,
  color = 'blue',
  timeRangeOptions = [
    { label: '24h', value: '24h', days: 1 },
    { label: '7d', value: '7d', days: 7 },
    { label: '30d', value: '30d', days: 30 },
    { label: '90d', value: '90d', days: 90 }
  ],
  selectedTimeRange = '7d',
  onTimeRangeChange,
  onRefresh,
  onDownload
}) => {
  const theme = useMantineTheme();
  const cardRef = useAnimatedMount('fadeInUp', { duration: 0.5 });
  const [hovering, setHovering] = useState(false);
  
  // Format the change value with a + or - sign
  const formattedChange = change !== undefined && !isNaN(change) 
    ? (change > 0 ? '+' : '') + change.toFixed(1) + '%' 
    : null;
  
  // Determine the change direction
  const changeDirection = change !== undefined && !isNaN(change)
    ? change > 0 
      ? 'increase' 
      : change < 0 
        ? 'decrease' 
        : 'neutral'
    : 'neutral';
  
  // Get the appropriate icon and color for the change
  const getChangeIcon = () => {
    switch (changeDirection) {
      case 'increase':
        return <IconArrowUpRight size={16} />;
      case 'decrease':
        return <IconArrowDownRight size={16} />;
      default:
        return <IconArrowRight size={16} />;
    }
  };
  
  const getChangeColor = () => {
    switch (changeDirection) {
      case 'increase':
        return theme.colors.green[6];
      case 'decrease':
        return theme.colors.red[6];
      default:
        return theme.colors.gray[6];
    }
  };
  
  // Handle card hover animations
  const handleMouseEnter = () => {
    setHovering(true);
    gsap.to(cardRef.current, {
      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
      y: -3,
      duration: 0.3,
      ease: 'power2.out'
    });
  };
  
  const handleMouseLeave = () => {
    setHovering(false);
    gsap.to(cardRef.current, {
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      y: 0,
      duration: 0.3,
      ease: 'power2.out'
    });
  };
  
  // Handle time range change with animation
  const handleTimeRangeChange = (range: string) => {
    if (onTimeRangeChange) {
      const badge = document.querySelector(`[data-range="${range}"]`);
      if (badge) {
        gsap.fromTo(
          badge,
          { scale: 0.9 },
          { 
            scale: 1, 
            duration: 0.3, 
            ease: 'back.out(1.7)',
            onComplete: () => onTimeRangeChange(range)
          }
        );
      } else {
        onTimeRangeChange(range);
      }
    }
  };
  
  // Merge chart options with defaults
  const mergedChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        ...chartOptions.plugins?.tooltip
      }
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false
        },
        ...chartOptions.scales?.x
      },
      y: {
        display: false,
        grid: {
          display: false
        },
        ...chartOptions.scales?.y
      }
    },
    ...chartOptions
  };

  return (
    <Card 
      ref={cardRef}
      withBorder
      p="md"
      radius="md"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ 
        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Card.Section px="md" pt="md">
        <Group position="apart" mb="xs">
          <Text size="xs" color="dimmed" weight={500}>
            {title}
          </Text>
          
          <Menu withinPortal position="bottom-end" shadow="sm">
            <Menu.Target>
              <ActionIcon variant="subtle" size="sm">
                <IconDotsVertical size={14} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Chart Options</Menu.Label>
              <Menu.Item icon={<IconCalendar size={14} />}>
                Time Range
              </Menu.Item>
              <Menu.Item icon={<IconArrowUpRight size={14} />}>
                Show Full Report
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
        
        <Group align="flex-end" spacing="xs" mb={5}>
          <Text weight={700} size="xl">
            {currency}{value}
          </Text>
          
          {formattedChange && (
            <Group spacing={4} mb={4}>
              <ThemeIcon 
                color={getChangeColor()} 
                variant="light" 
                size="sm" 
                radius="xl"
              >
                {getChangeIcon()}
              </ThemeIcon>
              <Text 
                size="sm" 
                color={getChangeColor()}
                weight={500}
              >
                {formattedChange}
              </Text>
            </Group>
          )}
        </Group>
        
        {description && (
          <Text size="xs" color="dimmed" mb="md">
            {description}
          </Text>
        )}
      </Card.Section>
      
      <Card.Section px="md" py="xs" mt="auto">
        <Group spacing={4} mb="xs">
          {timeRangeOptions.map((option) => (
            <Badge
              key={option.value}
              variant={selectedTimeRange === option.value ? 'filled' : 'outline'}
              color={color}
              size="xs"
              sx={{ cursor: 'pointer' }}
              onClick={() => handleTimeRangeChange(option.value)}
              data-range={option.value}
            >
              {option.label}
            </Badge>
          ))}
        </Group>
      </Card.Section>
      
      <Card.Section p={0} mt="xs" style={{ flex: 1, minHeight: chartHeight }}>
        <AnimatedChartJS
          title=""
          chartType={chartType}
          data={chartData}
          options={mergedChartOptions}
          chartHeight={chartHeight}
          loading={loading}
          animate={true}
          animationDuration={1}
          onRefresh={onRefresh}
          onDownload={onDownload}
          refreshable={!!onRefresh}
          downloadable={!!onDownload}
          p={0}
          style={{ height: '100%' }}
          withBorder={false}
          shadow="none"
        />
      </Card.Section>
    </Card>
  );
};

export default StatsChartCard;