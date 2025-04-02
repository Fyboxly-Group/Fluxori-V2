import { useEffect, useRef, useState } from 'react';
import { 
  Paper, Title, Stack, Group, Text, Badge, 
  ThemeIcon, Checkbox, Table, Tabs, Button,
  SegmentedControl, Tooltip, ActionIcon,
  ScrollArea, RingProgress
} from '@mantine/core';
import { 
  IconArrowUpRight, IconArrowDownRight, IconInfoCircle,
  IconChartBar, IconChartLine, IconShoppingCart,
  IconPercentage, IconTrendingUp, IconCurrencyDollar
} from '@tabler/icons-react';
import { gsap } from 'gsap';
import { MarketplaceType } from './MarketplaceConnector';

export interface MarketplacePerformance {
  id: string;
  name: string;
  type: MarketplaceType;
  metrics: {
    sales: {
      current: number;
      previous: number;
      change: number;
    };
    units: {
      current: number;
      previous: number;
      change: number;
    };
    conversion: {
      current: number;
      previous: number;
      change: number;
    };
    aov: { // Average Order Value
      current: number;
      previous: number;
      change: number;
    };
    fee: { // Marketplace Fee
      current: number;
    };
    margin: {
      current: number;
      previous: number;
      change: number;
    };
  };
  ranking: number; // 1-based ranking
}

// Time period options
type TimePeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';

// Metric types
type MetricType = 'sales' | 'units' | 'conversion' | 'aov' | 'fee' | 'margin';

// Metric display information
const METRICS_INFO: Record<MetricType, { label: string; icon: React.ReactNode; color: string; format: (value: number) => string }> = {
  sales: {
    label: 'Sales',
    icon: <IconCurrencyDollar size={16} />,
    color: 'blue',
    format: (value) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  },
  units: {
    label: 'Units Sold',
    icon: <IconShoppingCart size={16} />,
    color: 'indigo',
    format: (value) => value.toLocaleString()
  },
  conversion: {
    label: 'Conversion Rate',
    icon: <IconPercentage size={16} />,
    color: 'teal',
    format: (value) => `${value.toFixed(2)}%`
  },
  aov: {
    label: 'Avg. Order Value',
    icon: <IconChartBar size={16} />,
    color: 'green',
    format: (value) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  },
  fee: {
    label: 'Marketplace Fee',
    icon: <IconPercentage size={16} />,
    color: 'red',
    format: (value) => `${value.toFixed(1)}%`
  },
  margin: {
    label: 'Net Margin',
    icon: <IconTrendingUp size={16} />,
    color: 'grape',
    format: (value) => `${value.toFixed(1)}%`
  }
};

export interface MarketplaceComparisonProps {
  marketplaces: MarketplacePerformance[];
  onViewDetails?: (marketplaceId: string) => void;
  className?: string;
}

export const MarketplaceComparison: React.FC<MarketplaceComparisonProps> = ({
  marketplaces,
  onViewDetails,
  className
}) => {
  const [view, setView] = useState<'table' | 'chart'>('table');
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>(['sales', 'units', 'conversion', 'margin']);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Toggle metric selection
  const toggleMetric = (metric: MetricType) => {
    if (selectedMetrics.includes(metric)) {
      if (selectedMetrics.length > 1) {
        setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
      }
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };
  
  // Format change as +/- percent
  const formatChange = (change: number) => {
    const prefix = change > 0 ? '+' : '';
    return `${prefix}${change.toFixed(1)}%`;
  };
  
  // Get icon and color for change
  const getChangeInfo = (change: number) => {
    if (change > 0) {
      return { icon: <IconArrowUpRight size={16} />, color: 'green' };
    } else if (change < 0) {
      return { icon: <IconArrowDownRight size={16} />, color: 'red' };
    }
    return { icon: null, color: 'gray' };
  };
  
  // Toggle view between table and chart
  const changeView = (newView: 'table' | 'chart') => {
    if (view !== newView) {
      setView(newView);
      
      // Animate view transition
      if (tableRef.current && chartRef.current) {
        if (newView === 'chart') {
          // Transition to chart view
          gsap.to(tableRef.current, {
            opacity: 0,
            y: 20,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
              gsap.set(tableRef.current, { display: 'none' });
              gsap.set(chartRef.current, { display: 'block' });
              gsap.fromTo(chartRef.current,
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
              );
            }
          });
        } else {
          // Transition to table view
          gsap.to(chartRef.current, {
            opacity: 0,
            y: 20,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
              gsap.set(chartRef.current, { display: 'none' });
              gsap.set(tableRef.current, { display: 'block' });
              gsap.fromTo(tableRef.current,
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
              );
            }
          });
        }
      }
    }
  };
  
  // Sort marketplaces by sales ranking
  const sortedMarketplaces = [...marketplaces].sort((a, b) => a.ranking - b.ranking);
  
  // Entrance animation
  useEffect(() => {
    if (containerRef.current) {
      const header = containerRef.current.querySelector('.comparison-header');
      const controls = containerRef.current.querySelector('.comparison-controls');
      
      const tl = gsap.timeline();
      
      tl.fromTo(header,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
      
      tl.fromTo(controls,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        '-=0.3'
      );
      
      // Animate table rows
      if (tableRef.current) {
        const rows = tableRef.current.querySelectorAll('tr');
        
        gsap.fromTo(rows,
          { opacity: 0, x: -20 },
          { 
            opacity: 1, 
            x: 0, 
            duration: 0.4, 
            stagger: 0.05, 
            ease: 'power2.out',
            delay: 0.3
          }
        );
      }
    }
  }, []);
  
  // Animate when time period changes
  useEffect(() => {
    // Animate metrics with new data
    if (tableRef.current) {
      const cells = tableRef.current.querySelectorAll('.metric-value');
      const changes = tableRef.current.querySelectorAll('.metric-change');
      
      gsap.fromTo(cells,
        { scale: 0.8, opacity: 0.5 },
        { 
          scale: 1, 
          opacity: 1, 
          duration: 0.4, 
          stagger: 0.02, 
          ease: 'back.out(1.5)' 
        }
      );
      
      gsap.fromTo(changes,
        { y: 10, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.3, 
          stagger: 0.02, 
          ease: 'power2.out',
          delay: 0.2
        }
      );
    }
    
    // Animate chart if in chart view
    if (view === 'chart' && chartRef.current) {
      const bars = chartRef.current.querySelectorAll('.chart-bar');
      
      gsap.fromTo(bars,
        { scaleY: 0, transformOrigin: 'bottom' },
        { 
          scaleY: 1, 
          duration: 0.5, 
          stagger: 0.1, 
          ease: 'power2.out' 
        }
      );
    }
  }, [timePeriod, view]);
  
  return (
    <Paper ref={containerRef} p="md" withBorder shadow="sm" className={className}>
      <Stack spacing="lg">
        <div className="comparison-header">
          <Group position="apart">
            <div>
              <Title order={3}>Marketplace Comparison</Title>
              <Text size="sm" color="dimmed">
                Compare performance across your connected marketplaces
              </Text>
            </div>
          </Group>
        </div>
        
        <div className="comparison-controls">
          <Group position="apart">
            <SegmentedControl
              value={timePeriod}
              onChange={(value) => setTimePeriod(value as TimePeriod)}
              data={[
                { label: 'Day', value: 'day' },
                { label: 'Week', value: 'week' },
                { label: 'Month', value: 'month' },
                { label: 'Quarter', value: 'quarter' },
                { label: 'Year', value: 'year' }
              ]}
            />
            
            <SegmentedControl
              value={view}
              onChange={(value) => changeView(value as 'table' | 'chart')}
              data={[
                { 
                  label: (
                    <Group spacing="xs">
                      <IconChartLine size={16} />
                      <span>Table</span>
                    </Group>
                  ), 
                  value: 'table' 
                },
                { 
                  label: (
                    <Group spacing="xs">
                      <IconChartBar size={16} />
                      <span>Chart</span>
                    </Group>
                  ), 
                  value: 'chart' 
                }
              ]}
            />
          </Group>
          
          <Group mt="sm">
            <Text size="sm" weight={500}>Metrics:</Text>
            
            {Object.entries(METRICS_INFO).map(([key, info]) => (
              <Checkbox
                key={key}
                label={(
                  <Group spacing="xs">
                    <ThemeIcon size="xs" color={info.color} variant="light">
                      {info.icon}
                    </ThemeIcon>
                    <Text size="sm">{info.label}</Text>
                  </Group>
                )}
                checked={selectedMetrics.includes(key as MetricType)}
                onChange={() => toggleMetric(key as MetricType)}
              />
            ))}
          </Group>
        </div>
        
        {marketplaces.length === 0 ? (
          <Paper withBorder p="xl" radius="sm" style={{ textAlign: 'center' }}>
            <Stack spacing="md" align="center">
              <ThemeIcon size="xl" radius="xl" color="blue" variant="light">
                <IconShoppingCart size={24} />
              </ThemeIcon>
              
              <div>
                <Text weight={500}>No marketplaces available</Text>
                <Text size="sm" color="dimmed">
                  Connect to marketplaces to compare their performance
                </Text>
              </div>
            </Stack>
          </Paper>
        ) : (
          <>
            {/* Table View */}
            <div 
              ref={tableRef} 
              style={{ 
                display: view === 'table' ? 'block' : 'none'
              }}
            >
              <ScrollArea>
                <Table striped>
                  <thead>
                    <tr>
                      <th style={{ width: '25%' }}>Marketplace</th>
                      {selectedMetrics.map((metric) => (
                        <th key={metric} style={{ width: `${75 / selectedMetrics.length}%` }}>
                          <Group spacing="xs">
                            <ThemeIcon size="xs" color={METRICS_INFO[metric].color} variant="light">
                              {METRICS_INFO[metric].icon}
                            </ThemeIcon>
                            <Text size="sm">{METRICS_INFO[metric].label}</Text>
                            <Tooltip 
                              label={`${METRICS_INFO[metric].label} for the selected time period`}
                              position="top"
                            >
                              <ActionIcon size="xs" variant="transparent">
                                <IconInfoCircle size={14} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedMarketplaces.map((marketplace) => (
                      <tr key={marketplace.id}>
                        <td>
                          <Group spacing="xs">
                            <Badge 
                              color="blue" 
                              size="sm" 
                              circle
                              style={{ minWidth: 22 }}
                            >
                              {marketplace.ranking}
                            </Badge>
                            
                            <Text weight={500}>{marketplace.name}</Text>
                            
                            <Button
                              variant="subtle"
                              size="xs"
                              compact
                              onClick={() => onViewDetails?.(marketplace.id)}
                            >
                              Details
                            </Button>
                          </Group>
                        </td>
                        
                        {selectedMetrics.map((metric) => {
                          const metricData = marketplace.metrics[metric];
                          const changeInfo = getChangeInfo(metricData.change);
                          
                          return (
                            <td key={metric}>
                              <div>
                                <Text 
                                  weight={600} 
                                  size="md"
                                  className="metric-value"
                                >
                                  {METRICS_INFO[metric].format(metricData.current)}
                                </Text>
                                
                                {metric !== 'fee' && (
                                  <Group spacing="xs" className="metric-change">
                                    <ThemeIcon 
                                      size="xs" 
                                      color={changeInfo.color}
                                      variant="light"
                                    >
                                      {changeInfo.icon}
                                    </ThemeIcon>
                                    
                                    <Text 
                                      size="xs" 
                                      color={changeInfo.color}
                                    >
                                      {formatChange(metricData.change)}
                                    </Text>
                                  </Group>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </ScrollArea>
            </div>
            
            {/* Chart View */}
            <div 
              ref={chartRef} 
              style={{ 
                display: view === 'chart' ? 'block' : 'none',
                height: selectedMetrics.length * 150 + 'px'
              }}
            >
              <Stack spacing="xl">
                {selectedMetrics.map((metric) => (
                  <div key={metric} style={{ height: '150px' }}>
                    <Group position="apart" mb="xs">
                      <Group spacing="xs">
                        <ThemeIcon size="sm" color={METRICS_INFO[metric].color} variant="light">
                          {METRICS_INFO[metric].icon}
                        </ThemeIcon>
                        <Text weight={500}>{METRICS_INFO[metric].label}</Text>
                      </Group>
                    </Group>
                    
                    <div style={{ 
                      position: 'relative', 
                      height: '120px',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-around',
                      borderBottom: '1px solid var(--mantine-color-gray-3)',
                      paddingBottom: '20px'
                    }}>
                      {sortedMarketplaces.map((marketplace) => {
                        const metricData = marketplace.metrics[metric];
                        const metricValue = metricData.current;
                        
                        // Find max value for scaling
                        const maxValue = Math.max(...sortedMarketplaces.map(m => m.metrics[metric].current));
                        
                        // Calculate scaled height (0-100)
                        const height = Math.round((metricValue / maxValue) * 100);
                        
                        // Calculate change color
                        const changeInfo = getChangeInfo(metricData.change);
                        
                        return (
                          <div 
                            key={marketplace.id} 
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              width: `${100 / sortedMarketplaces.length}%`,
                              maxWidth: '150px'
                            }}
                          >
                            <Tooltip 
                              label={(
                                <div>
                                  <Text weight={500}>{marketplace.name}</Text>
                                  <Text size="sm">{METRICS_INFO[metric].format(metricValue)}</Text>
                                  {metric !== 'fee' && (
                                    <Text size="xs" color={changeInfo.color}>
                                      {formatChange(metricData.change)}
                                    </Text>
                                  )}
                                </div>
                              )}
                              position="top"
                              withArrow
                            >
                              <div 
                                className="chart-bar"
                                style={{
                                  height: `${height}%`,
                                  width: '60px',
                                  borderRadius: '4px 4px 0 0',
                                  backgroundColor: `var(--mantine-color-${METRICS_INFO[metric].color}-6)`,
                                  marginBottom: '5px',
                                  position: 'relative',
                                  overflow: 'hidden'
                                }}
                              >
                                {metric !== 'fee' && metricData.change !== 0 && (
                                  <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '4px',
                                    backgroundColor: `var(--mantine-color-${changeInfo.color}-6)`
                                  }} />
                                )}
                              </div>
                            </Tooltip>
                            
                            <Text size="xs" weight={500}>
                              {marketplace.name.split(' ')[0]}
                            </Text>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </Stack>
            </div>
          </>
        )}
      </Stack>
    </Paper>
  );
};

export default MarketplaceComparison;