import React, { useRef, useEffect, useMemo } from 'react';
import { Card, CardProps, Text, Group, Title, useMantineTheme, ActionIcon, Menu, Stack, Loader } from '@mantine/core';
import { IconDotsVertical, IconDownload, IconRefresh, IconZoomIn, IconChartLine, IconChartBar, IconChartPie, IconChartDots } from '@tabler/icons-react';
import { useElementSize } from '@mantine/hooks';
import gsap from 'gsap';
import { useAnimatedMount } from '@/hooks/useAnimation';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Tooltip, 
  Legend, 
  ChartOptions, 
  ChartData, 
  RadialLinearScale,
  ScatterController,
  ScatterDataPoint,
  ChartType as ChartJSType
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { useMotionPreference } from '@/hooks/useMotionPreference';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  ScatterController,
  Tooltip,
  Legend
);

export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'radar' | 'scatter';

// Plugin to handle animations with GSAP instead of default Chart.js animations
const gsapAnimationsPlugin = {
  id: 'gsapAnimations',
  afterDraw: (chart: ChartJS) => {
    // This is where we can add GSAP animations if needed
    // We'll handle most animations on component mount/update via useEffect
  }
};

export interface AnimatedChartJSProps extends Omit<CardProps, 'children'> {
  /** Chart title */
  title: string;
  /** Optional description */
  description?: string;
  /** Chart.js data */
  data: ChartData;
  /** Chart.js options */
  options?: ChartOptions;
  /** Chart type */
  chartType: ChartType;
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
  /** Function called when chart type is changed */
  onChartTypeChange?: (type: ChartType) => void;
  /** Whether to animate the chart on mount */
  animate?: boolean;
  /** Animation duration in seconds */
  animationDuration?: number;
}

/**
 * Enhanced Chart.js wrapper with GSAP animations that follow the Fluxori Motion Design Guide
 */
export const AnimatedChartJS: React.FC<AnimatedChartJSProps> = ({
  title,
  description,
  data,
  options = {},
  chartType = 'line',
  downloadable = true,
  refreshable = true,
  loading = false,
  onRefresh,
  chartHeight = 300,
  onDownload,
  switchableType = false,
  onChartTypeChange,
  animate = true,
  animationDuration = 1,
  ...props
}) => {
  const theme = useMantineTheme();
  const chartRef = useRef<ChartJS | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useAnimatedMount('fadeInUp', { duration: 0.5 });
  const { ref: sizeRef, width } = useElementSize();
  const { motionPreference } = useMotionPreference();
  
  // Convert chartType to ChartJS type
  const chartJSType = useMemo((): ChartJSType => {
    switch (chartType) {
      case 'area':
        return 'line';
      case 'radar':
        return 'radar';
      case 'scatter':
        return 'scatter';
      default:
        return chartType as ChartJSType;
    }
  }, [chartType]);

  // Set area chart fill
  useEffect(() => {
    if (chartType === 'area' && data.datasets) {
      data.datasets.forEach(dataset => {
        if (dataset) {
          dataset.fill = true;
        }
      });
    }
  }, [chartType, data]);

  // Enhanced options with motion preferences
  const enhancedOptions = useMemo(() => {
    const reducedMotion = motionPreference.reduced || motionPreference.level !== 'full';
    
    // Disable animations completely if user prefers reduced motion
    const baseOptions: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: reducedMotion ? 0 : animate ? animationDuration * 1000 : 0,
      },
      plugins: {
        ...options.plugins,
        tooltip: {
          ...options.plugins?.tooltip,
          animation: {
            duration: reducedMotion ? 0 : 150
          }
        }
      },
      transitions: {
        active: {
          animation: {
            duration: reducedMotion ? 0 : animate ? 300 : 0
          }
        }
      }
    };
    
    return {
      ...options,
      ...baseOptions,
    };
  }, [options, animate, animationDuration, motionPreference]);
  
  // Apply GSAP animations to chart elements
  useEffect(() => {
    if (!chartRef.current || !animate || motionPreference.reduced) return;
    
    const chart = chartRef.current;
    const reducedMotion = motionPreference.level !== 'full';
    
    // Set animation duration based on motion preference
    const duration = reducedMotion ? animationDuration * 0.6 : animationDuration;
    
    // Create context for GSAP animations
    const ctx = chart.ctx;
    const canvas = chart.canvas;
    if (!ctx || !canvas) return;

    // Apply animations based on chart type
    switch (chartJSType) {
      case 'line':
      case 'radar':
        // Animate points
        const pointElements = chart.getDatasetMeta(0)?.data || [];
        
        gsap.fromTo(
          pointElements,
          { 
            _gsapScale: 0, 
            _gsapOpacity: 0 
          },
          { 
            _gsapScale: 1, 
            _gsapOpacity: 1,
            duration: duration * 0.8,
            stagger: 0.03,
            ease: "back.out(2)",
            onUpdate: () => {
              // Force redraw on animation frames
              chart.render();
            }
          }
        );
        break;
        
      case 'bar':
        // Animate bars
        const barElements = [];
        
        // Collect all bar elements from all datasets
        for (let i = 0; i < chart.data.datasets.length; i++) {
          const datasetMeta = chart.getDatasetMeta(i);
          if (datasetMeta?.data) {
            barElements.push(...datasetMeta.data);
          }
        }
        
        gsap.fromTo(
          barElements,
          { _gsapScaleY: 0, transformOrigin: 'bottom' },
          { 
            _gsapScaleY: 1, 
            duration: duration,
            stagger: 0.03,
            ease: "elastic.out(0.5, 0.3)",
            onUpdate: () => {
              // Force redraw on animation frames
              chart.render();
            }
          }
        );
        break;
        
      case 'pie':
      case 'doughnut':
        // Animate pie/doughnut
        const arcElements = [];
        
        // Collect all arc elements from all datasets
        for (let i = 0; i < chart.data.datasets.length; i++) {
          const datasetMeta = chart.getDatasetMeta(i);
          if (datasetMeta?.data) {
            arcElements.push(...datasetMeta.data);
          }
        }
        
        gsap.fromTo(
          arcElements,
          { 
            _gsapRotation: -90, 
            _gsapScale: 0.5, 
            _gsapOpacity: 0,
            transformOrigin: 'center' 
          },
          { 
            _gsapRotation: 0, 
            _gsapScale: 1, 
            _gsapOpacity: 1,
            duration: duration,
            stagger: 0.1,
            ease: "back.out(1.7)",
            onUpdate: () => {
              // Force redraw on animation frames
              chart.render();
            }
          }
        );
        break;
        
      case 'scatter':
        // Animate scatter points
        const scatterElements = [];
        
        // Collect all scatter elements from all datasets
        for (let i = 0; i < chart.data.datasets.length; i++) {
          const datasetMeta = chart.getDatasetMeta(i);
          if (datasetMeta?.data) {
            scatterElements.push(...datasetMeta.data);
          }
        }
        
        gsap.fromTo(
          scatterElements,
          { _gsapScale: 0, _gsapOpacity: 0 },
          { 
            _gsapScale: 1, 
            _gsapOpacity: 1,
            duration: duration * 0.7,
            stagger: 0.01,
            ease: "power2.out",
            onUpdate: () => {
              // Force redraw on animation frames
              chart.render();
            }
          }
        );
        break;
    }
    
  }, [chartJSType, data, animate, animationDuration, motionPreference]);
  
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
  
  // Handle chart type change
  const handleChartTypeChange = (type: ChartType) => {
    if (onChartTypeChange) {
      // Animate the transition
      if (chartContainerRef.current) {
        gsap.to(chartContainerRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: () => {
            onChartTypeChange(type);
            gsap.to(chartContainerRef.current, {
              opacity: 1,
              scale: 1,
              duration: 0.4,
              ease: 'power2.out',
              delay: 0.1
            });
          }
        });
      } else {
        onChartTypeChange(type);
      }
    }
  };
  
  // Get the icon for the current chart type
  const getChartTypeIcon = (type: ChartType) => {
    switch (type) {
      case 'bar':
        return <IconChartBar size={16} />;
      case 'pie':
        return <IconChartPie size={16} />;
      case 'scatter':
        return <IconChartDots size={16} />;
      case 'line':
      case 'area':
      default:
        return <IconChartLine size={16} />;
    }
  };
  
  // Handle chart download
  const handleDownload = () => {
    if (!chartRef.current || !onDownload) return;
    
    // Animate download button
    const downloadButton = document.querySelector('.download-button');
    if (downloadButton) {
      gsap.to(downloadButton, {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        onComplete: onDownload
      });
    } else {
      onDownload();
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
                    onClick={() => handleChartTypeChange('line')}
                    disabled={chartType === 'line'}
                  >
                    Line Chart
                  </Menu.Item>
                  <Menu.Item 
                    icon={<IconChartLine size={16} />}
                    onClick={() => handleChartTypeChange('area')}
                    disabled={chartType === 'area'}
                  >
                    Area Chart
                  </Menu.Item>
                  <Menu.Item 
                    icon={<IconChartBar size={16} />}
                    onClick={() => handleChartTypeChange('bar')}
                    disabled={chartType === 'bar'}
                  >
                    Bar Chart
                  </Menu.Item>
                  <Menu.Item 
                    icon={<IconChartPie size={16} />}
                    onClick={() => handleChartTypeChange('pie')}
                    disabled={chartType === 'pie'}
                  >
                    Pie Chart
                  </Menu.Item>
                  <Menu.Item 
                    icon={<IconChartDots size={16} />}
                    onClick={() => handleChartTypeChange('scatter')}
                    disabled={chartType === 'scatter'}
                  >
                    Scatter Chart
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
            
            {downloadable && onDownload && (
              <ActionIcon
                variant="light"
                onClick={handleDownload}
                title="Download"
                className="download-button"
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
                    onClick={handleDownload}
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
              height: '100%',
              width: '100%'
            }}
          >
            <Chart
              ref={chartRef}
              type={chartJSType}
              data={data}
              options={enhancedOptions}
              plugins={[gsapAnimationsPlugin]}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default AnimatedChartJS;