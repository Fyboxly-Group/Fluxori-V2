import { useEffect, useRef } from 'react';
import {
  Box,
  Text,
  Card,
  Group,
  Badge,
  Tabs,
  Grid,
  Paper,
  Title,
  Skeleton,
  ScrollArea,
  Center,
  useMantineTheme
} from '@mantine/core';
import {
  IconChartBar,
  IconChartLine,
  IconChartPie,
  IconChartDots,
  IconChartRadar,
  IconTable
} from '@tabler/icons-react';
import { ReportResult, ReportChartType } from '@/types/reporting';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import gsap from 'gsap';

interface ReportVisualizationProps {
  result: ReportResult | null;
  chartType: ReportChartType;
  onChartTypeChange?: (chartType: ReportChartType) => void;
}

export function ReportVisualization({
  result,
  chartType,
  onChartTypeChange
}: ReportVisualizationProps) {
  const theme = useMantineTheme();
  const chartRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const { motionLevel } = useMotionPreference();
  
  // Format number for display
  const formatNumber = (value: number, format?: string) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
      }).format(value);
    }
    
    if (format === 'percentage') {
      return new Intl.NumberFormat('en-US', { 
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 2 
      }).format(value/100);
    }
    
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Get icon for chart type
  const getChartIcon = (type: ReportChartType) => {
    switch(type) {
      case 'bar': return <IconChartBar size={16} />;
      case 'line': return <IconChartLine size={16} />;
      case 'pie': return <IconChartPie size={16} />;
      case 'scatter': return <IconChartDots size={16} />;
      case 'radar': return <IconChartRadar size={16} />;
      case 'table': return <IconTable size={16} />;
      default: return <IconChartBar size={16} />;
    }
  };
  
  // Animate chart on mount or when data changes
  useEffect(() => {
    if (!result || !chartRef.current || motionLevel === 'minimal') return;
    
    const timeline = gsap.timeline();
    
    // Different animations based on chart type
    switch (chartType) {
      case 'bar':
        // Create fake bars for animation
        const barContainer = chartRef.current.querySelector('.chart-container');
        if (barContainer) {
          const barCount = result.dataset.labels.length;
          const seriesCount = result.dataset.series.length;
          
          // Clear previous elements
          gsap.set(barContainer, { innerHTML: '' });
          
          // Create bars for each series and label
          for (let i = 0; i < seriesCount; i++) {
            const series = result.dataset.series[i];
            for (let j = 0; j < barCount; j++) {
              const barHeight = (series.data[j] / Math.max(...series.data)) * 80;
              const bar = document.createElement('div');
              bar.classList.add('bar-element');
              bar.style.position = 'absolute';
              bar.style.bottom = '0';
              bar.style.left = `${(j * (100 / barCount)) + (i * (100 / barCount / seriesCount))}%`;
              bar.style.width = `${(100 / barCount) / seriesCount - 2}%`;
              bar.style.height = `${barHeight}%`;
              bar.style.backgroundColor = series.color || theme.colors[theme.primaryColor][i % 9];
              bar.style.margin = '0 1%';
              bar.style.borderRadius = '3px 3px 0 0';
              barContainer.appendChild(bar);
            }
          }
          
          // Animate bars
          timeline.fromTo(
            '.bar-element',
            { scaleY: 0, transformOrigin: 'bottom' },
            { 
              scaleY: 1, 
              duration: 0.6, 
              stagger: 0.02, 
              ease: 'power2.out' 
            }
          );
        }
        break;
        
      case 'line':
        // Create a simplified line chart for animation
        const lineContainer = chartRef.current.querySelector('.chart-container');
        if (lineContainer) {
          // Clear previous elements
          gsap.set(lineContainer, { innerHTML: '' });
          
          // Create an SVG for the line chart
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('width', '100%');
          svg.setAttribute('height', '100%');
          svg.style.overflow = 'visible';
          
          const seriesCount = result.dataset.series.length;
          
          for (let i = 0; i < seriesCount; i++) {
            const series = result.dataset.series[i];
            const points = series.data;
            const maxValue = Math.max(...points);
            const pointCount = points.length;
            
            // Create line path
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.classList.add('line-path');
            
            let pathData = 'M ';
            for (let j = 0; j < pointCount; j++) {
              const x = (j / (pointCount - 1)) * 100;
              const y = 100 - ((points[j] / maxValue) * 80);
              pathData += `${x} ${y} `;
              
              if (j === 0) {
                pathData += 'L ';
              }
            }
            
            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', series.color || theme.colors[theme.primaryColor][i % 9]);
            path.setAttribute('stroke-width', '3');
            svg.appendChild(path);
            
            // Create data points
            for (let j = 0; j < pointCount; j++) {
              const x = (j / (pointCount - 1)) * 100;
              const y = 100 - ((points[j] / maxValue) * 80);
              
              const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
              circle.classList.add('data-point');
              circle.setAttribute('cx', `${x}`);
              circle.setAttribute('cy', `${y}`);
              circle.setAttribute('r', '4');
              circle.setAttribute('fill', series.color || theme.colors[theme.primaryColor][i % 9]);
              svg.appendChild(circle);
            }
          }
          
          lineContainer.appendChild(svg);
          
          // Animate path and points
          timeline
            .fromTo(
              '.line-path',
              { strokeDasharray: '1000', strokeDashoffset: '1000' },
              { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }
            )
            .fromTo(
              '.data-point',
              { scale: 0, opacity: 0 },
              { 
                scale: 1, 
                opacity: 1, 
                duration: 0.3, 
                stagger: 0.03, 
                ease: 'back.out(1.7)' 
              },
              '-=0.8'
            );
        }
        break;
        
      case 'pie':
        // Create a simplified pie chart for animation
        const pieContainer = chartRef.current.querySelector('.chart-container');
        if (pieContainer) {
          // Clear previous elements
          gsap.set(pieContainer, { innerHTML: '' });
          
          // Create an SVG for the pie chart
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('width', '100%');
          svg.setAttribute('height', '100%');
          svg.style.overflow = 'visible';
          
          const series = result.dataset.series[0];
          const total = series.data.reduce((sum, val) => sum + val, 0);
          let startAngle = 0;
          
          for (let i = 0; i < series.data.length; i++) {
            const value = series.data[i];
            const percentage = value / total;
            const endAngle = startAngle + percentage * 360;
            
            // Convert angles to radians for calculation
            const startRad = (startAngle - 90) * Math.PI / 180;
            const endRad = (endAngle - 90) * Math.PI / 180;
            
            // Calculate path
            const radius = 40;
            const centerX = 50;
            const centerY = 50;
            
            const x1 = centerX + radius * Math.cos(startRad);
            const y1 = centerY + radius * Math.sin(startRad);
            const x2 = centerX + radius * Math.cos(endRad);
            const y2 = centerY + radius * Math.sin(endRad);
            
            const largeArcFlag = percentage > 0.5 ? 1 : 0;
            
            // Create path for pie segment
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.classList.add('pie-segment');
            
            const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
            
            path.setAttribute('d', pathData);
            path.setAttribute('fill', series.color || theme.colors[i % 9]);
            svg.appendChild(path);
            
            startAngle = endAngle;
          }
          
          pieContainer.appendChild(svg);
          
          // Animate pie segments
          timeline.fromTo(
            '.pie-segment',
            { scale: 0, opacity: 0, transformOrigin: 'center' },
            { 
              scale: 1, 
              opacity: 1, 
              duration: 0.6, 
              stagger: 0.08, 
              ease: 'back.out(1.7)' 
            }
          );
        }
        break;
        
      default:
        // Default animation for other chart types
        timeline.fromTo(
          chartRef.current.querySelector('.chart-container'),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
    }
    
    // Animate summary statistics
    if (summaryRef.current) {
      timeline.fromTo(
        summaryRef.current.querySelectorAll('.stat-value'),
        { opacity: 0, y: 10 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.4, 
          stagger: 0.1, 
          ease: 'power2.out' 
        },
        '-=0.3'
      );
    }
    
  }, [result, chartType, theme, motionLevel]);
  
  if (!result) {
    return <Skeleton height={400} radius="md" />;
  }
  
  return (
    <Box>
      <Tabs 
        defaultValue={chartType}
        value={chartType}
        onTabChange={(value) => onChartTypeChange?.(value as ReportChartType)}
      >
        <Tabs.List mb="md">
          <Tabs.Tab value="bar" icon={<IconChartBar size={16} />}>Bar</Tabs.Tab>
          <Tabs.Tab value="line" icon={<IconChartLine size={16} />}>Line</Tabs.Tab>
          <Tabs.Tab value="pie" icon={<IconChartPie size={16} />}>Pie</Tabs.Tab>
          <Tabs.Tab value="scatter" icon={<IconChartDots size={16} />}>Scatter</Tabs.Tab>
          <Tabs.Tab value="radar" icon={<IconChartRadar size={16} />}>Radar</Tabs.Tab>
          <Tabs.Tab value="table" icon={<IconTable size={16} />}>Table</Tabs.Tab>
        </Tabs.List>
        
        <Grid>
          <Grid.Col span={chartType === 'table' ? 12 : 8}>
            <Card p="md" radius="md" withBorder mb="lg" ref={chartRef}>
              <Group position="apart" mb="lg">
                <Text weight={500}>
                  {result.configuration.name}
                </Text>
                <Badge leftSection={getChartIcon(chartType)}>
                  {chartType.charAt(0).toUpperCase() + chartType.slice(1)}
                </Badge>
              </Group>
              
              <Box className="chart-container" h={300} pos="relative">
                {chartType === 'table' ? (
                  <ScrollArea h={300}>
                    <Box as="table" w="100%" style={{ borderCollapse: 'collapse' }}>
                      <Box as="thead">
                        <Box as="tr">
                          {/* First column for dimension labels */}
                          <Box as="th" p="xs" style={{ borderBottom: `1px solid ${theme.colors.gray[3]}` }}>
                            {result.configuration.dimensions[0]?.label || 'Dimension'}
                          </Box>
                          
                          {/* Columns for each metric */}
                          {result.configuration.metrics.map((metric, i) => (
                            <Box 
                              key={metric.id} 
                              as="th" 
                              p="xs" 
                              align="right"
                              style={{ borderBottom: `1px solid ${theme.colors.gray[3]}` }}
                            >
                              {metric.label}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                      
                      <Box as="tbody">
                        {result.dataset.labels.map((label, rowIndex) => (
                          <Box 
                            key={rowIndex} 
                            as="tr"
                            sx={(theme) => ({
                              '&:hover': {
                                backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0]
                              }
                            })}
                          >
                            {/* Dimension value */}
                            <Box as="td" p="xs" style={{ borderBottom: `1px solid ${theme.colors.gray[2]}` }}>
                              {label}
                            </Box>
                            
                            {/* Metric values */}
                            {result.dataset.series.map((series, i) => (
                              <Box 
                                key={i} 
                                as="td" 
                                p="xs" 
                                align="right"
                                style={{ borderBottom: `1px solid ${theme.colors.gray[2]}` }}
                              >
                                {formatNumber(
                                  series.data[rowIndex], 
                                  result.configuration.metrics[i]?.format
                                )}
                              </Box>
                            ))}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </ScrollArea>
                ) : (
                  <Center h="100%">
                    <Text color="dimmed">
                      Chart visualization placeholder for {chartType} chart
                    </Text>
                  </Center>
                )}
              </Box>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={chartType === 'table' ? 12 : 4}>
            <Card p="md" radius="md" withBorder mb="lg" ref={summaryRef} id={`${chartType}-summary`}>
              <Title order={5} mb="md">Summary</Title>
              
              <Grid>
                {result.summary && (
                  <>
                    <Grid.Col span={6}>
                      <Text size="sm" color="dimmed">Total</Text>
                      <Text weight={500} className="stat-value">
                        {formatNumber(result.summary.total, result.configuration.metrics[0]?.format)}
                      </Text>
                    </Grid.Col>
                    
                    <Grid.Col span={6}>
                      <Text size="sm" color="dimmed">Average</Text>
                      <Text weight={500} className="stat-value">
                        {formatNumber(result.summary.average, result.configuration.metrics[0]?.format)}
                      </Text>
                    </Grid.Col>
                    
                    <Grid.Col span={6}>
                      <Text size="sm" color="dimmed">Min</Text>
                      <Text weight={500} className="stat-value">
                        {formatNumber(result.summary.min, result.configuration.metrics[0]?.format)}
                      </Text>
                    </Grid.Col>
                    
                    <Grid.Col span={6}>
                      <Text size="sm" color="dimmed">Max</Text>
                      <Text weight={500} className="stat-value">
                        {formatNumber(result.summary.max, result.configuration.metrics[0]?.format)}
                      </Text>
                    </Grid.Col>
                  </>
                )}
                
                <Grid.Col span={6}>
                  <Text size="sm" color="dimmed">Data Points</Text>
                  <Text weight={500} className="stat-value">
                    {result.dataset.labels.length}
                  </Text>
                </Grid.Col>
                
                <Grid.Col span={6}>
                  <Text size="sm" color="dimmed">Generated</Text>
                  <Text weight={500} className="stat-value">
                    {new Date(result.generatedAt).toLocaleString()}
                  </Text>
                </Grid.Col>
                
                <Grid.Col span={12}>
                  <Text size="xs" color="dimmed" mt="xs">
                    Processing time: {result.processingTimeMs}ms
                    {result.cacheHit && " (from cache)"}
                  </Text>
                </Grid.Col>
              </Grid>
            </Card>
          </Grid.Col>
        </Grid>
      </Tabs>
    </Box>
  );
}