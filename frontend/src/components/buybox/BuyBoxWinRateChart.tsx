import React, { useEffect, useRef } from 'react';
import { 
  Paper, 
  Text, 
  Group, 
  useMantineTheme, 
  Stack, 
  SegmentedControl, 
  Skeleton, 
  Title
} from '@mantine/core';
import { useAnimatedMount } from '@/hooks/useAnimation';
import { Chart, registerables } from 'chart.js';
import gsap from 'gsap';

// Register Chart.js components
Chart.register(...registerables);

export interface BuyBoxWinRateChartProps {
  /** Historical win rate data points */
  winRateData: {
    date: Date;
    winRate: number;
    totalProducts: number;
  }[];
  /** Optional title for the chart */
  title?: string;
  /** Default time period to display */
  defaultPeriod?: 'day' | 'week' | 'month' | 'year';
  /** Whether the data is currently loading */
  loading?: boolean;
  /** Current overall win rate */
  currentWinRate?: number;
  /** Custom style */
  className?: string;
}

/**
 * Displays Buy Box win rate history with animated charts
 * and interactive time period selection
 */
export const BuyBoxWinRateChart: React.FC<BuyBoxWinRateChartProps> = ({
  winRateData,
  title = 'Buy Box Win Rate',
  defaultPeriod = 'week',
  loading = false,
  currentWinRate,
  className
}) => {
  const theme = useMantineTheme();
  const containerRef = useAnimatedMount('fadeIn', { duration: 0.5 });
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [period, setPeriod] = React.useState<'day' | 'week' | 'month' | 'year'>(defaultPeriod);

  // Format date label based on selected period
  const formatDateLabel = (date: Date, period: 'day' | 'week' | 'month' | 'year'): string => {
    switch (period) {
      case 'day':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case 'week':
        return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      case 'month':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      case 'year':
        return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
      default:
        return date.toLocaleDateString();
    }
  };

  // Filter data based on selected period
  const filterDataByPeriod = (data: typeof winRateData, period: 'day' | 'week' | 'month' | 'year') => {
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (period) {
      case 'day':
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return data.filter(item => item.date >= cutoffDate);
  };

  // Initialize and update chart
  useEffect(() => {
    if (loading || !chartRef.current) return;
    
    // Clean up any existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }
    
    const filteredData = filterDataByPeriod(winRateData, period);
    const ctx = chartRef.current.getContext('2d');
    
    if (!ctx) return;
    
    // Colors for chart
    const primaryColor = theme.colors.blue[6];
    const gradientFill = ctx.createLinearGradient(0, 0, 0, 300);
    gradientFill.addColorStop(0, theme.fn.rgba(primaryColor, 0.6));
    gradientFill.addColorStop(1, theme.fn.rgba(primaryColor, 0.0));
    
    // Create chart instance
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: filteredData.map(item => formatDateLabel(item.date, period)),
        datasets: [
          {
            label: 'Win Rate (%)',
            data: filteredData.map(item => item.winRate * 100), // Convert to percentage
            borderColor: primaryColor,
            backgroundColor: gradientFill,
            borderWidth: 2,
            pointBackgroundColor: primaryColor,
            pointBorderColor: theme.white,
            pointBorderWidth: 1,
            pointRadius: 3,
            pointHoverRadius: 5,
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        },
        scales: {
          x: {
            grid: {
              color: theme.colorScheme === 'dark' 
                ? theme.colors.dark[5] 
                : theme.colors.gray[2],
              drawBorder: false
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: theme.colorScheme === 'dark' 
                ? theme.colors.dark[5] 
                : theme.colors.gray[2],
            },
            ticks: {
              callback: (value) => `${value}%`
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => `Win Rate: ${context.parsed.y.toFixed(1)}%`,
              afterLabel: (context) => {
                const index = context.dataIndex;
                const totalProducts = filteredData[index].totalProducts;
                return `Products: ${totalProducts}`;
              }
            }
          },
          legend: {
            display: false
          }
        }
      }
    });
    
    // Animate the chart creation with GSAP
    if (chartRef.current) {
      gsap.fromTo(
        chartRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [winRateData, period, theme, loading]);
  
  // Animate current win rate on mount
  useEffect(() => {
    if (!loading && currentWinRate !== undefined) {
      const winRateElem = document.querySelector('.current-win-rate');
      if (winRateElem) {
        gsap.fromTo(
          { value: 0 },
          { 
            value: currentWinRate * 100, 
            duration: 1.5,
            ease: 'power2.out',
            onUpdate: function() {
              const val = this.targets()[0].value;
              winRateElem.textContent = `${val.toFixed(1)}%`;
            }
          }
        );
      }
    }
  }, [currentWinRate, loading]);
  
  // Handle period change
  const handlePeriodChange = (value: 'day' | 'week' | 'month' | 'year') => {
    setPeriod(value);
    
    // Flash the chart area to indicate data is changing
    if (chartRef.current) {
      gsap.fromTo(
        chartRef.current,
        { opacity: 0.5 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  };
  
  return (
    <Paper ref={containerRef} withBorder p="md" className={className} radius="md">
      <Stack spacing="md">
        <Group position="apart">
          <Title order={4}>{title}</Title>
          
          {currentWinRate !== undefined && !loading ? (
            <Group spacing={4}>
              <Text size="sm">Current:</Text>
              <Text weight={700} size="lg" className="current-win-rate">
                {(currentWinRate * 100).toFixed(1)}%
              </Text>
            </Group>
          ) : loading ? (
            <Skeleton height={24} width={80} />
          ) : null}
        </Group>
        
        <SegmentedControl
          value={period}
          onChange={handlePeriodChange as any}
          data={[
            { label: 'Day', value: 'day' },
            { label: 'Week', value: 'week' },
            { label: 'Month', value: 'month' },
            { label: 'Year', value: 'year' }
          ]}
          size="sm"
        />
        
        <div style={{ height: 300, position: 'relative' }}>
          {loading ? (
            <Stack justify="center" align="center" style={{ height: '100%' }}>
              <Skeleton height={200} width="100%" />
            </Stack>
          ) : winRateData.length === 0 ? (
            <Stack justify="center" align="center" style={{ height: '100%' }}>
              <Text color="dimmed">No win rate data available</Text>
            </Stack>
          ) : (
            <canvas ref={chartRef} />
          )}
        </div>
      </Stack>
    </Paper>
  );
};

export default BuyBoxWinRateChart;