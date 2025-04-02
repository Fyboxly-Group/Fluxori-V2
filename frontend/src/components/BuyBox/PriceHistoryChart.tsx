import React, { useEffect, useRef } from 'react';
import { Group, useMantineTheme, Paper, Text, Skeleton, Stack, Switch, Badge, Tooltip, Box } from '@mantine/core';
import { useAnimatedMount } from '@/hooks/useAnimation';
import gsap from 'gsap';

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

export interface PriceHistoryChartProps {
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
 * Price history chart component with animation and controls
 * Note: This component provides SVG elements for manual chart drawing.
 * In a real implementation, you would use a charting library like recharts 
 * or chart.js/nivo, but animate the elements using GSAP.
 */
export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
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
  const chartRef = useAnimatedMount('fadeInUp', { duration: 0.6 });
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Chart dimensions
  const margin = { top: 20, right: 30, bottom: 40, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  // Get min/max values from data for scaling
  const priceRange = React.useMemo(() => {
    if (data.length === 0) return { min: 0, max: 100 };
    
    let min = Infinity;
    let max = -Infinity;
    
    data.forEach((point) => {
      if (showYourPrice) min = Math.min(min, point.yourPrice);
      if (showBuyBoxPrice) min = Math.min(min, point.buyBoxPrice);
      if (showLowestPrice) min = Math.min(min, point.lowestPrice);
      if (showHighestPrice) min = Math.min(min, point.highestPrice);
      
      if (showYourPrice) max = Math.max(max, point.yourPrice);
      if (showBuyBoxPrice) max = Math.max(max, point.buyBoxPrice);
      if (showLowestPrice) max = Math.max(max, point.lowestPrice);
      if (showHighestPrice) max = Math.max(max, point.highestPrice);
    });
    
    // Add some padding
    min = Math.max(0, min * 0.95);
    max = max * 1.05;
    
    return { min, max };
  }, [data, showYourPrice, showBuyBoxPrice, showLowestPrice, showHighestPrice]);
  
  // Toggle series visibility
  const handleToggleVisibility = (key: string, value: boolean) => {
    if (onVisibilityChange) {
      onVisibilityChange(key, value);
    }
  };
  
  // Handle time period change
  const handleTimePeriodChange = (period: '24h' | '7d' | '30d' | '90d') => {
    if (onTimePeriodChange) {
      onTimePeriodChange(period);
    }
  };
  
  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Generate path string for line chart
  const generatePath = (dataPoints: PricePoint[], accessor: (point: PricePoint) => number): string => {
    if (dataPoints.length === 0) return '';
    
    const xScale = (i: number) => (i / (dataPoints.length - 1)) * chartWidth;
    const yScale = (value: number) =>
      chartHeight - ((value - priceRange.min) / (priceRange.max - priceRange.min)) * chartHeight;
    
    return dataPoints
      .map((point, i) => {
        const x = xScale(i);
        const y = yScale(accessor(point));
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ');
  };
  
  // Animate chart on data change
  useEffect(() => {
    if (!svgRef.current || loading || data.length === 0) return;
    
    const svg = svgRef.current;
    const paths = svg.querySelectorAll('path.line-path');
    const buyBoxPoints = svg.querySelectorAll('circle.buy-box-point');
    
    // Reset paths to original state
    gsap.set(paths, { strokeDashoffset: 0 });
    
    // Measure paths for animation
    paths.forEach((path) => {
      const length = (path as SVGPathElement).getTotalLength();
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });
    });
    
    // Create timeline for animations
    const timeline = gsap.timeline();
    
    // Animate each path
    timeline.to(paths, {
      strokeDashoffset: 0,
      duration: 1.5,
      ease: 'power2.out',
      stagger: 0.15,
    });
    
    // Animate Buy Box points
    if (buyBoxPoints.length) {
      timeline.fromTo(
        buyBoxPoints,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: 'back.out(1.7)',
          stagger: 0.03,
        },
        '-=0.5' // Start slightly before the paths finish
      );
    }
    
    return () => {
      timeline.kill();
    };
  }, [data, loading]);
  
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
  
  return (
    <Paper ref={chartRef} withBorder p="md" radius="md">
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
          onChange={(e) => handleToggleVisibility('yourPrice', e.currentTarget.checked)}
          color="blue"
          size="sm"
        />
        <Switch
          label="Buy Box Price"
          checked={showBuyBoxPrice}
          onChange={(e) => handleToggleVisibility('buyBoxPrice', e.currentTarget.checked)}
          color="green"
          size="sm"
        />
        <Switch
          label="Lowest Price"
          checked={showLowestPrice}
          onChange={(e) => handleToggleVisibility('lowestPrice', e.currentTarget.checked)}
          color="orange"
          size="sm"
        />
        <Switch
          label="Highest Price"
          checked={showHighestPrice}
          onChange={(e) => handleToggleVisibility('highestPrice', e.currentTarget.checked)}
          color="gray"
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
            <Text weight={700} size="lg">
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
            <Group spacing={4}>
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
            <Text weight={700} size="lg">
              {currency}
              {data.length > 0
                ? (data.reduce((sum, point) => sum + point.buyBoxPrice, 0) / data.length).toFixed(2)
                : '0.00'}
            </Text>
          )}
        </Stack>
      </Group>
      
      {/* Chart */}
      <Box pos="relative" h={height}>
        {loading && (
          <Stack
            align="center"
            justify="center"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            <Skeleton width={400} height={200} />
            <Text color="dimmed">Loading price history...</Text>
          </Stack>
        )}
        
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
          <svg
            ref={svgRef}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            style={{ overflow: 'visible' }}
          >
            {/* Chart area */}
            <g transform={`translate(${margin.left}, ${margin.top})`}>
              {/* Y-axis grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = chartHeight - chartHeight * ratio;
                const value = priceRange.min + (priceRange.max - priceRange.min) * ratio;
                
                return (
                  <g key={`y-${ratio}`}>
                    <line
                      x1={0}
                      y1={y}
                      x2={chartWidth}
                      y2={y}
                      stroke={theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}
                      strokeDasharray="3,3"
                    />
                    <text
                      x={-10}
                      y={y}
                      fill={theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7]}
                      textAnchor="end"
                      dominantBaseline="middle"
                      fontSize={10}
                    >
                      {currency}
                      {value.toFixed(2)}
                    </text>
                  </g>
                );
              })}
              
              {/* X-axis labels */}
              {data.length > 0 &&
                [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const index = Math.floor(ratio * (data.length - 1));
                  const x = chartWidth * ratio;
                  const date = data[index]?.timestamp;
                  
                  if (!date) return null;
                  
                  return (
                    <g key={`x-${ratio}`}>
                      <line
                        x1={x}
                        y1={0}
                        x2={x}
                        y2={chartHeight}
                        stroke={
                          theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
                        }
                        strokeDasharray="3,3"
                        opacity={ratio === 0 || ratio === 1 ? 0 : 1}
                      />
                      <text
                        x={x}
                        y={chartHeight + 20}
                        fill={
                          theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7]
                        }
                        textAnchor="middle"
                        fontSize={10}
                      >
                        {formatDate(date)}
                      </text>
                    </g>
                  );
                })}
              
              {/* X and Y axis lines */}
              <line
                x1={0}
                y1={chartHeight}
                x2={chartWidth}
                y2={chartHeight}
                stroke={theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[5]}
              />
              <line
                x1={0}
                y1={0}
                x2={0}
                y2={chartHeight}
                stroke={theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[5]}
              />
              
              {/* Lines */}
              {showYourPrice && (
                <path
                  d={generatePath(data, (p) => p.yourPrice)}
                  fill="none"
                  stroke={theme.colors.blue[6]}
                  strokeWidth={2}
                  className="line-path"
                />
              )}
              
              {showBuyBoxPrice && (
                <path
                  d={generatePath(data, (p) => p.buyBoxPrice)}
                  fill="none"
                  stroke={theme.colors.green[6]}
                  strokeWidth={2}
                  className="line-path"
                />
              )}
              
              {showLowestPrice && (
                <path
                  d={generatePath(data, (p) => p.lowestPrice)}
                  fill="none"
                  stroke={theme.colors.orange[6]}
                  strokeWidth={2}
                  className="line-path"
                />
              )}
              
              {showHighestPrice && (
                <path
                  d={generatePath(data, (p) => p.highestPrice)}
                  fill="none"
                  stroke={theme.colors.gray[6]}
                  strokeWidth={1.5}
                  className="line-path"
                />
              )}
              
              {/* Buy Box win points */}
              {showYourPrice &&
                data.map((point, i) => {
                  if (!point.hadBuyBox) return null;
                  
                  const x = (i / (data.length - 1)) * chartWidth;
                  const y =
                    chartHeight -
                    ((point.yourPrice - priceRange.min) / (priceRange.max - priceRange.min)) * chartHeight;
                  
                  return (
                    <circle
                      key={`win-${i}`}
                      cx={x}
                      cy={y}
                      r={4}
                      fill={theme.colors.green[6]}
                      stroke="white"
                      strokeWidth={1}
                      className="buy-box-point"
                    />
                  );
                })}
              
              {/* Legend */}
              <g transform={`translate(${chartWidth - 200}, 10)`}>
                {showYourPrice && (
                  <g transform="translate(0, 0)">
                    <line x1={0} y1={0} x2={20} y2={0} stroke={theme.colors.blue[6]} strokeWidth={2} />
                    <text
                      x={25}
                      y={0}
                      fill={theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7]}
                      dominantBaseline="middle"
                      fontSize={10}
                    >
                      Your Price
                    </text>
                  </g>
                )}
                
                {showBuyBoxPrice && (
                  <g transform="translate(0, 20)">
                    <line x1={0} y1={0} x2={20} y2={0} stroke={theme.colors.green[6]} strokeWidth={2} />
                    <text
                      x={25}
                      y={0}
                      fill={theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7]}
                      dominantBaseline="middle"
                      fontSize={10}
                    >
                      Buy Box Price
                    </text>
                  </g>
                )}
                
                {showLowestPrice && (
                  <g transform="translate(0, 40)">
                    <line
                      x1={0}
                      y1={0}
                      x2={20}
                      y2={0}
                      stroke={theme.colors.orange[6]}
                      strokeWidth={2}
                    />
                    <text
                      x={25}
                      y={0}
                      fill={theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7]}
                      dominantBaseline="middle"
                      fontSize={10}
                    >
                      Lowest Price
                    </text>
                  </g>
                )}
                
                {showHighestPrice && (
                  <g transform="translate(0, 60)">
                    <line x1={0} y1={0} x2={20} y2={0} stroke={theme.colors.gray[6]} strokeWidth={1.5} />
                    <text
                      x={25}
                      y={0}
                      fill={theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7]}
                      dominantBaseline="middle"
                      fontSize={10}
                    >
                      Highest Price
                    </text>
                  </g>
                )}
                
                {showYourPrice && (
                  <g transform="translate(100, 0)">
                    <circle cx={10} cy={0} r={4} fill={theme.colors.green[6]} stroke="white" strokeWidth={1} />
                    <text
                      x={25}
                      y={0}
                      fill={theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7]}
                      dominantBaseline="middle"
                      fontSize={10}
                    >
                      Buy Box Win
                    </text>
                  </g>
                )}
              </g>
            </g>
          </svg>
        )}
      </Box>
    </Paper>
  );
};

export default PriceHistoryChart;