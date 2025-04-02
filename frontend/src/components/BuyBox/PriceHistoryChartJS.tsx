import React, { useState, useEffect } from 'react';
import { Group, useMantineTheme, Paper, Text, Skeleton, Stack, Switch, Badge, Box } from '@mantine/core';
import { useAnimatedMount } from '@/hooks/useAnimation';
import gsap from 'gsap';
import AnimatedChartJS from '../Charts/AnimatedChartJS';
import { ChartData, ChartOptions } from 'chart.js';

export interface PricePoint {
  /** Timestamp for price point */
  timestamp: Date;
  /** Your price */
  yourPrice: number;
  /** Buy Box price */
  buyBoxPrice: number;
  /** Lowest price */
  lowestPrice: number;
  /** Highest price */
  highestPrice: number;
  /** Whether you had the Buy Box at this time */
  hadBuyBox: boolean;
}

export interface PriceHistoryChartJSProps {
  /** Product name to display */
  productName: string;
  /** Price history data */
  data: PricePoint[];
  /** Currency symbol */
  currency?: string;
  /** Whether data is currently loading */
  loading?: boolean;
  /** Current marketplace */
  marketplace?: string;
  /** Current product ID or SKU */
  productId?: string;
  /** Chart width */
  width?: number;
  /** Chart height */
  height?: number;
  /** Time period to display */
  timePeriod?: '24h' | '7d' | '30d' | '90d';
  /** Function called when time period changes */
  onTimePeriodChange?: (period: '24h' | '7d' | '30d' | '90d') => void;
  /** Whether to show your price */
  showYourPrice?: boolean;
  /** Whether to show Buy Box price */
  showBuyBoxPrice?: boolean;
  /** Whether to show lowest price */
  showLowestPrice?: boolean;
  /** Whether to show highest price */
  showHighestPrice?: boolean;
  /** Function called when visibility toggles change */
  onVisibilityChange?: (key: string, visible: boolean) => void;
}

/**
 * Enhanced Price History Chart using Chart.js implementation
 * with Fluxori Motion Design Guide animations
 */
export const PriceHistoryChartJS: React.FC<PriceHistoryChartJSProps> = ({
  productName,
  data,
  currency = '$',
  loading = false,
  marketplace = '',
  productId = '',
  width = 800,
  height = 400,
  timePeriod = '7d',
  onTimePeriodChange,
  showYourPrice = true,
  showBuyBoxPrice = true,
  showLowestPrice = true,
  showHighestPrice = false,
  onVisibilityChange,
}) => {
  const theme = useMantineTheme();
  const containerRef = useAnimatedMount('fadeInUp', { duration: 0.6 });
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  
  // Calculate win percentage
  const winPercentage = React.useMemo(() => {
    if (data.length === 0) return 0;
    const wins = data.filter((point) => point.hadBuyBox).length;
    return (wins / data.length) * 100;
  }, [data]);
  
  // Calculate current standing
  const currentStanding = React.useMemo(() => {
    if (data.length === 0) return null;
    const latestPoint = data[data.length - 1];
    
    if (latestPoint.hadBuyBox) {
      return {
        status: 'winning',
        difference: 0,
      };
    }
    
    const difference = latestPoint.yourPrice - latestPoint.buyBoxPrice;
    return {
      status: 'losing',
      difference,
    };
  }, [data]);
  
  // Format labels for Chart.js
  const chartLabels = React.useMemo(() => {
    return data.map(point => {
      const date = new Date(point.timestamp);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    });
  }, [data]);
  
  // Prepare datasets for Chart.js
  const chartData = React.useMemo<ChartData>(() => {
    const datasets = [];
    
    // Your price dataset
    if (showYourPrice) {
      datasets.push({
        label: 'Your Price',
        data: data.map(point => point.yourPrice),
        borderColor: theme.colors.blue[6],
        backgroundColor: `${theme.colors.blue[6]}33`, // With transparency for area
        borderWidth: 2,
        tension: 0.3, // Smooth curve
        fill: chartType === 'area',
        pointBackgroundColor: data.map(point => 
          point.hadBuyBox ? theme.colors.green[6] : theme.colors.blue[6]
        ),
        pointBorderColor: data.map(point => 
          point.hadBuyBox ? 'white' : theme.colors.blue[6]
        ),
        pointRadius: data.map(point => point.hadBuyBox ? 5 : 3),
        pointHoverRadius: data.map(point => point.hadBuyBox ? 7 : 5),
        pointBorderWidth: data.map(point => point.hadBuyBox ? 2 : 1),
        order: 1, // Lower number = drawn on top
      });
    }
    
    // Buy Box price dataset
    if (showBuyBoxPrice) {
      datasets.push({
        label: 'Buy Box Price',
        data: data.map(point => point.buyBoxPrice),
        borderColor: theme.colors.green[6],
        backgroundColor: `${theme.colors.green[6]}33`, // With transparency for area
        borderWidth: 2,
        tension: 0.3, // Smooth curve
        fill: chartType === 'area',
        pointBackgroundColor: theme.colors.green[6],
        pointRadius: 3,
        pointHoverRadius: 5,
        order: 2,
      });
    }
    
    // Lowest price dataset
    if (showLowestPrice) {
      datasets.push({
        label: 'Lowest Price',
        data: data.map(point => point.lowestPrice),
        borderColor: theme.colors.orange[6],
        backgroundColor: `${theme.colors.orange[6]}33`, // With transparency for area
        borderWidth: 2,
        borderDash: [3, 3], // Dashed line
        tension: 0.3, // Smooth curve
        fill: chartType === 'area',
        pointBackgroundColor: theme.colors.orange[6],
        pointRadius: 2,
        pointHoverRadius: 4,
        order: 3,
      });
    }
    
    // Highest price dataset
    if (showHighestPrice) {
      datasets.push({
        label: 'Highest Price',
        data: data.map(point => point.highestPrice),
        borderColor: theme.colors.gray[6],
        backgroundColor: `${theme.colors.gray[6]}33`, // With transparency for area
        borderWidth: 1.5,
        borderDash: [5, 5], // Dashed line
        tension: 0.3, // Smooth curve
        fill: chartType === 'area',
        pointBackgroundColor: theme.colors.gray[6],
        pointRadius: 2,
        pointHoverRadius: 4,
        order: 4,
      });
    }
    
    return {
      labels: chartLabels,
      datasets,
    };
  }, [
    data, 
    showYourPrice, 
    showBuyBoxPrice, 
    showLowestPrice, 
    showHighestPrice, 
    chartLabels, 
    chartType, 
    theme
  ]);
  
  // Chart options
  const chartOptions = React.useMemo<ChartOptions>(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            title: (items) => {
              if (items.length > 0) {
                const index = items[0].dataIndex;
                const date = new Date(data[index]?.timestamp);
                return date.toLocaleString();
              }
              return '';
            },
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              return `${label}: ${currency}${value.toFixed(2)}`;
            },
            afterLabel: (context) => {
              const index = context.dataIndex;
              const point = data[index];
              if (point && context.dataset.label === 'Your Price') {
                return point.hadBuyBox ? '✅ You had the Buy Box' : '';
              }
              return '';
            }
          }
        },
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            boxWidth: 12,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            maxRotation: 45,
            minRotation: 45,
            autoSkip: true,
            maxTicksLimit: 8
          }
        },
        y: {
          beginAtZero: false,
          grid: {
            color: theme.colorScheme === 'dark' 
              ? theme.colors.dark[5] 
              : theme.colors.gray[2]
          },
          ticks: {
            callback: (value) => `${currency}${value}`
          }
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      },
      elements: {
        line: {
          tension: 0.3 // Smooth curves
        }
      }
    };
  }, [currency, data, theme]);
  
  // Toggle series visibility
  const handleToggleVisibility = (key: string, value: boolean) => {
    if (onVisibilityChange) {
      onVisibilityChange(key, value);
    }
  };
  
  // Handle time period change
  const handleTimePeriodChange = (period: '24h' | '7d' | '30d' | '90d') => {
    if (onTimePeriodChange) {
      const timePeriodElement = document.querySelector(`[data-period="${period}"]`);
      
      // Animate the selected period badge
      if (timePeriodElement) {
        gsap.fromTo(
          timePeriodElement,
          { scale: 0.9 },
          { 
            scale: 1, 
            duration: 0.3, 
            ease: "back.out(1.5)",
            onComplete: () => onTimePeriodChange(period)
          }
        );
      } else {
        onTimePeriodChange(period);
      }
    }
  };
  
  // Animate stats on data change or when first loaded
  useEffect(() => {
    if (loading || data.length === 0) return;
    
    const statElements = document.querySelectorAll('.stat-value');
    if (statElements.length === 0) return;
    
    gsap.fromTo(
      statElements,
      { opacity: 0, y: 10 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.4, 
        stagger: 0.1, 
        ease: "power2.out" 
      }
    );
  }, [loading, data]);
  
  // Handle toggle animation
  const handleSwitchChange = (key: string, value: boolean) => {
    // Find the switch element that was toggled
    const switchElement = document.querySelector(`[data-switch="${key}"]`);
    if (switchElement) {
      // Create a subtle pulse animation
      gsap.fromTo(
        switchElement,
        { scale: 0.95 },
        { 
          scale: 1, 
          duration: 0.3, 
          ease: "back.out(1.5)",
          onComplete: () => handleToggleVisibility(key, value)
        }
      );
    } else {
      handleToggleVisibility(key, value);
    }
  };
  
  return (
    <Paper ref={containerRef} withBorder p="md" radius="md">
      {/* Header with title and controls */}
      <Group position="apart" mb="lg">
        <div>
          <Text weight={700} size="lg">
            {loading ? <Skeleton width={200} height={20} /> : productName}
          </Text>
          <Group spacing={8} mt={4}>
            {marketplace && (
              <Badge color="gray" variant="outline">
                {marketplace}
              </Badge>
            )}
            {productId && (
              <Text size="xs" color="dimmed">
                {productId}
              </Text>
            )}
          </Group>
        </div>
        
        {/* Chart controls */}
        <Group>
          {/* Time period selection */}
          <Group spacing={4}>
            {(['24h', '7d', '30d', '90d'] as const).map((period) => (
              <Badge
                key={period}
                variant={timePeriod === period ? 'filled' : 'outline'}
                color="blue"
                onClick={() => handleTimePeriodChange(period)}
                sx={{ cursor: 'pointer' }}
                data-period={period}
              >
                {period}
              </Badge>
            ))}
          </Group>
        </Group>
      </Group>
      
      {/* Series visibility toggles */}
      <Group spacing="xl" mb="md">
        <Switch
          label="Your Price"
          checked={showYourPrice}
          onChange={(e) => handleSwitchChange('yourPrice', e.currentTarget.checked)}
          color="blue"
          size="sm"
          data-switch="yourPrice"
        />
        <Switch
          label="Buy Box Price"
          checked={showBuyBoxPrice}
          onChange={(e) => handleSwitchChange('buyBoxPrice', e.currentTarget.checked)}
          color="green"
          size="sm"
          data-switch="buyBoxPrice"
        />
        <Switch
          label="Lowest Price"
          checked={showLowestPrice}
          onChange={(e) => handleSwitchChange('lowestPrice', e.currentTarget.checked)}
          color="orange"
          size="sm"
          data-switch="lowestPrice"
        />
        <Switch
          label="Highest Price"
          checked={showHighestPrice}
          onChange={(e) => handleSwitchChange('highestPrice', e.currentTarget.checked)}
          color="gray"
          size="sm"
          data-switch="highestPrice"
        />
        
        <Switch
          label="Area Chart"
          checked={chartType === 'area'}
          onChange={(e) => setChartType(e.currentTarget.checked ? 'area' : 'line')}
          color="indigo"
          size="sm"
        />
      </Group>
      
      {/* Stats summary */}
      <Group spacing="xl" mb="lg">
        <Stack spacing={0}>
          <Text size="xs" color="dimmed">
            Buy Box Win Rate
          </Text>
          {loading ? (
            <Skeleton width={60} height={24} />
          ) : (
            <Text weight={700} size="lg" className="stat-value">
              {winPercentage.toFixed(1)}%
            </Text>
          )}
        </Stack>
        
        <Stack spacing={0}>
          <Text size="xs" color="dimmed">
            Current Status
          </Text>
          {loading ? (
            <Skeleton width={100} height={24} />
          ) : (
            <Group spacing={4} className="stat-value">
              <Badge color={currentStanding?.status === 'winning' ? 'green' : 'red'}>
                {currentStanding?.status === 'winning' ? 'Winning' : 'Not Winning'}
              </Badge>
              {currentStanding?.status === 'losing' && (
                <Text size="sm" color="red">
                  {currency}
                  {Math.abs(currentStanding.difference).toFixed(2)} higher
                </Text>
              )}
            </Group>
          )}
        </Stack>
        
        <Stack spacing={0}>
          <Text size="xs" color="dimmed">
            Average Buy Box Price
          </Text>
          {loading ? (
            <Skeleton width={70} height={24} />
          ) : (
            <Text weight={700} size="lg" className="stat-value">
              {currency}
              {data.length > 0
                ? (data.reduce((sum, point) => sum + point.buyBoxPrice, 0) / data.length).toFixed(2)
                : '0.00'}
            </Text>
          )}
        </Stack>
      </Group>
      
      {/* Chart */}
      <Box h={height} pos="relative">
        {data.length === 0 && !loading ? (
          <Stack
            align="center"
            justify="center"
            h="100%"
          >
            <Text color="dimmed" align="center">
              No price history data available for the selected period.
            </Text>
          </Stack>
        ) : (
          <AnimatedChartJS
            title=""
            chartType={chartType}
            data={chartData}
            options={chartOptions}
            chartHeight={height}
            loading={loading}
            animate={true}
            animationDuration={1.2}
            p={0}
            style={{ height }}
          />
        )}
      </Box>
    </Paper>
  );
};

export default PriceHistoryChartJS;