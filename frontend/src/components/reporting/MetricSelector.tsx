import { useEffect, useRef } from 'react';
import {
  Box,
  Text,
  Title,
  Group,
  Card,
  Badge,
  ActionIcon,
  Select,
  TextInput,
  Grid,
  ColorInput,
  Divider,
  ScrollArea,
  SimpleGrid
} from '@mantine/core';
import { IconPlus, IconTrash, IconChevronRight, IconSearch } from '@tabler/icons-react';
import { DataSourceField, ReportMetric, AggregationMethod } from '@/types/reporting';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import gsap from 'gsap';

interface MetricSelectorProps {
  availableMetrics: DataSourceField[];
  selectedMetrics: ReportMetric[];
  onAddMetric: (field: DataSourceField) => void;
  onRemoveMetric: (id: string) => void;
  onUpdateMetric: (id: string, updates: Partial<ReportMetric>) => void;
}

export function MetricSelector({
  availableMetrics,
  selectedMetrics,
  onAddMetric,
  onRemoveMetric,
  onUpdateMetric
}: MetricSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const selectedMetricsRef = useRef<HTMLDivElement>(null);
  const availableMetricsRef = useRef<HTMLDivElement>(null);
  const { motionLevel } = useMotionPreference();
  
  // Filter available metrics based on search term
  const filteredMetrics = availableMetrics.filter(
    metric => !selectedMetrics.some(m => m.field === metric.name) && (
      metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metric.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metric.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  // Animation effects
  useEffect(() => {
    if (motionLevel === 'minimal') return;
    
    // Animate available metrics on mount
    if (availableMetricsRef.current) {
      const metrics = availableMetricsRef.current.querySelectorAll('.available-metric');
      gsap.fromTo(
        metrics,
        { opacity: 0, y: 10 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.3, 
          stagger: 0.03, 
          ease: 'power2.out' 
        }
      );
    }
    
    // Animate selected metrics
    if (selectedMetricsRef.current) {
      const metrics = selectedMetricsRef.current.querySelectorAll('.selected-metric');
      gsap.fromTo(
        metrics,
        { opacity: 0, x: -10 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.3, 
          stagger: 0.05, 
          ease: 'power2.out' 
        }
      );
    }
  }, [motionLevel]);
  
  // Animate metric add
  const animateAddMetric = (metric: DataSourceField) => {
    if (motionLevel === 'minimal') {
      onAddMetric(metric);
      return;
    }
    
    // Find the metric element
    const metricElement = availableMetricsRef.current?.querySelector(`[data-metric-id="${metric.name}"]`);
    
    if (metricElement) {
      gsap.timeline()
        .to(metricElement, {
          scale: 1.05,
          duration: 0.2,
          ease: 'power2.out'
        })
        .to(metricElement, {
          x: 20,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => {
            onAddMetric(metric);
          }
        });
    } else {
      onAddMetric(metric);
    }
  };
  
  // Animate metric remove
  const animateRemoveMetric = (id: string) => {
    if (motionLevel === 'minimal') {
      onRemoveMetric(id);
      return;
    }
    
    // Find the metric element
    const metricElement = selectedMetricsRef.current?.querySelector(`[data-metric-id="${id}"]`);
    
    if (metricElement) {
      gsap.to(metricElement, {
        opacity: 0,
        x: -20,
        height: 0,
        marginBottom: 0,
        padding: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          onRemoveMetric(id);
        }
      });
    } else {
      onRemoveMetric(id);
    }
  };
  
  // Get aggregation method options
  const getAggregationOptions = (field: DataSourceField) => {
    const defaultOptions: AggregationMethod[] = ['sum', 'average', 'count', 'min', 'max'];
    return field.supportedAggregations || defaultOptions;
  };

  return (
    <Box>
      <Title order={3} mb="md">Select Metrics</Title>
      <Text color="dimmed" mb="lg">
        Choose the metrics you want to analyze in your report. These are typically numeric values that can be aggregated.
      </Text>
      
      <Grid>
        {/* Selected metrics */}
        <Grid.Col span={12} mb="lg">
          <Box>
            <Title order={4} mb="sm">Selected Metrics</Title>
            <Card p="md" radius="md" withBorder ref={selectedMetricsRef}>
              {selectedMetrics.length === 0 ? (
                <Text color="dimmed" align="center" py="md">
                  No metrics selected. Add metrics from the list below.
                </Text>
              ) : (
                <SimpleGrid cols={1} spacing="md">
                  {selectedMetrics.map((metric) => {
                    const sourceField = availableMetrics.find(f => f.name === metric.field);
                    
                    return (
                      <Card 
                        key={metric.id} 
                        p="md" 
                        radius="md" 
                        withBorder
                        className="selected-metric"
                        data-metric-id={metric.id}
                      >
                        <Grid>
                          <Grid.Col span={4}>
                            <TextInput
                              label="Display Label"
                              value={metric.label}
                              onChange={(e) => onUpdateMetric(metric.id, { label: e.currentTarget.value })}
                            />
                          </Grid.Col>
                          <Grid.Col span={3}>
                            <Select
                              label="Aggregation"
                              value={metric.aggregation}
                              data={getAggregationOptions(sourceField!).map(agg => ({
                                value: agg,
                                label: agg.charAt(0).toUpperCase() + agg.slice(1)
                              }))}
                              onChange={(value) => onUpdateMetric(metric.id, { aggregation: value as AggregationMethod })}
                            />
                          </Grid.Col>
                          <Grid.Col span={3}>
                            <Select
                              label="Format"
                              value={metric.format || ''}
                              data={[
                                { value: '', label: 'None' },
                                { value: 'number', label: 'Number' },
                                { value: 'currency', label: 'Currency' },
                                { value: 'percentage', label: 'Percentage' }
                              ]}
                              onChange={(value) => onUpdateMetric(metric.id, { format: value || undefined })}
                            />
                          </Grid.Col>
                          <Grid.Col span={2}>
                            <ColorInput
                              label="Color"
                              value={metric.color || '#4dabf7'}
                              onChange={(value) => onUpdateMetric(metric.id, { color: value })}
                              format="hex"
                              swatches={['#4dabf7', '#37b24d', '#f03e3e', '#f59f00', '#7048e8', '#1c7ed6']}
                            />
                          </Grid.Col>
                          <Grid.Col span={12} mt="xs">
                            <Group position="apart">
                              <Text size="sm" color="dimmed">
                                Field: <Badge size="sm">{metric.field}</Badge>
                              </Text>
                              <ActionIcon 
                                color="red" 
                                variant="light"
                                onClick={() => animateRemoveMetric(metric.id)}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Group>
                          </Grid.Col>
                        </Grid>
                      </Card>
                    );
                  })}
                </SimpleGrid>
              )}
            </Card>
          </Box>
        </Grid.Col>
        
        <Grid.Col span={12}>
          <Divider mb="md" />
          <Title order={4} mb="sm">Available Metrics</Title>
          
          <TextInput
            placeholder="Search metrics..."
            icon={<IconSearch size={14} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            mb="md"
          />
          
          <ScrollArea h={300} offsetScrollbars>
            <SimpleGrid cols={2} spacing="md" ref={availableMetricsRef}>
              {filteredMetrics.map((metric) => (
                <Card
                  key={metric.name}
                  p="sm"
                  radius="md"
                  withBorder
                  className="available-metric"
                  data-metric-id={metric.name}
                  sx={(theme) => ({
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, background-color 0.2s ease',
                    '&:hover': {
                      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
                      transform: 'translateY(-2px)'
                    }
                  })}
                  onClick={() => animateAddMetric(metric)}
                >
                  <Group position="apart" noWrap>
                    <Box>
                      <Text weight={500}>{metric.label}</Text>
                      <Text size="xs" color="dimmed">{metric.name}</Text>
                    </Box>
                    <Group spacing={4}>
                      <Badge size="sm" color={metric.format === 'currency' ? 'green' : 'blue'}>
                        {metric.type}
                      </Badge>
                      <ActionIcon color="blue" variant="light">
                        <IconPlus size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                  
                  {metric.description && (
                    <Text size="xs" color="dimmed" mt="xs" lineClamp={2}>
                      {metric.description}
                    </Text>
                  )}
                </Card>
              ))}
              
              {filteredMetrics.length === 0 && (
                <Text align="center" color="dimmed" style={{ gridColumn: '1 / -1' }}>
                  No metrics found matching your search criteria.
                </Text>
              )}
            </SimpleGrid>
          </ScrollArea>
        </Grid.Col>
      </Grid>
    </Box>
  );
}

// For TypeScript support
import { useState } from 'react';