import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, Group, Button, Card, Progress, Badge, Overlay, Switch, Collapse, Title, ActionIcon } from '@mantine/core';
import { IconX, IconChartBar, IconCpu, IconAlertTriangle, IconChevronDown, IconSettings } from '@tabler/icons-react';
import monitoring from '@/utils/monitoring';

// Only show in development mode
const DEV_MODE = process.env.NODE_ENV === 'development';

interface PerformanceData {
  fps: number;
  memory: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  } | null;
  animationMetrics: {
    totalAnimations: number;
    slowAnimations: number;
    averageFps: number;
    lastFrameTime: number;
    worstFrameTime: number;
  };
  customMetrics: Record<string, number>;
}

interface FpsHistoryPoint {
  timestamp: number;
  fps: number;
}

/**
 * Performance Monitor Component
 * 
 * Displays real-time performance metrics in a floating panel (dev mode only)
 */
export function PerformanceMonitor() {
  // Don't render in production
  if (!DEV_MODE) return null;

  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    fps: 60,
    memory: null,
    animationMetrics: {
      totalAnimations: 0,
      slowAnimations: 0,
      averageFps: 60,
      lastFrameTime: 0,
      worstFrameTime: 0
    },
    customMetrics: {}
  });
  
  const [fpsHistory, setFpsHistory] = useState<FpsHistoryPoint[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const rafId = useRef<number | null>(null);
  const lastFrameTimestamp = useRef<number>(0);
  const frameCount = useRef<number>(0);
  
  // Initialize monitoring on mount
  useEffect(() => {
    monitoring.init({
      enabled: true,
      environment: 'development'
    });
    
    return () => {
      monitoring.cleanup();
    };
  }, []);
  
  // Start/stop FPS monitoring when isTracking changes
  useEffect(() => {
    if (isTracking) {
      startTracking();
    } else {
      stopTracking();
    }
    
    return () => {
      stopTracking();
    };
  }, [isTracking]);
  
  // Start performance tracking
  const startTracking = () => {
    // Start the monitoring service's FPS tracking
    monitoring.startPerformanceTracking();
    
    // Set up our own tracking for the graph visualization
    lastFrameTimestamp.current = performance.now();
    frameCount.current = 0;
    
    const updateMetrics = (timestamp: number) => {
      if (!isTracking) return;
      
      // Calculate FPS
      frameCount.current++;
      const elapsed = timestamp - lastFrameTimestamp.current;
      
      // Update metrics once per second
      if (elapsed > 1000) {
        const fps = Math.round((frameCount.current * 1000) / elapsed);
        
        // Get memory usage if available
        let memory = null;
        if (performance && (performance as any).memory) {
          memory = (performance as any).memory;
        }
        
        // Get animation metrics from monitoring service
        const animationMetrics = monitoring.getPerformanceMetrics();
        
        // Update state
        setPerformanceData({
          fps,
          memory,
          animationMetrics,
          customMetrics: { ...performanceData.customMetrics }
        });
        
        // Update FPS history
        setFpsHistory(prev => {
          const newHistory = [...prev, { timestamp: Date.now(), fps }];
          // Keep only the last 60 points (1 minute at 1 sample/sec)
          if (newHistory.length > 60) {
            return newHistory.slice(-60);
          }
          return newHistory;
        });
        
        // Reset for next measurement
        lastFrameTimestamp.current = timestamp;
        frameCount.current = 0;
      }
      
      // Continue monitoring
      rafId.current = requestAnimationFrame(updateMetrics);
    };
    
    // Start the animation frame loop
    rafId.current = requestAnimationFrame(updateMetrics);
  };
  
  // Stop performance tracking
  const stopTracking = () => {
    monitoring.stopPerformanceTracking();
    
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  };
  
  // Add a custom metric
  const addTestMetric = () => {
    const metricName = `test-metric-${Object.keys(performanceData.customMetrics).length + 1}`;
    const metricValue = Math.random() * 100;
    
    monitoring.reportMetric(metricName, metricValue);
    
    // Update local state to display it
    setPerformanceData(prev => ({
      ...prev,
      customMetrics: {
        ...prev.customMetrics,
        [metricName]: metricValue
      }
    }));
  };
  
  // Helper to format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };
  
  // Get color for FPS
  const getFpsColor = (fps: number) => {
    if (fps >= 55) return 'green';
    if (fps >= 30) return 'yellow';
    return 'red';
  };
  
  if (!isVisible) {
    return (
      <ActionIcon
        color="blue"
        variant="filled"
        radius="xl"
        size="lg"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999
        }}
        onClick={() => setIsVisible(true)}
      >
        <IconChartBar size={20} />
      </ActionIcon>
    );
  }
  
  return (
    <Card
      p="xs"
      radius="md"
      shadow="md"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: expanded ? '350px' : '200px',
        zIndex: 9999,
        opacity: 0.9,
        transition: 'width 0.3s ease'
      }}
    >
      <Group position="apart" mb="xs">
        <Group spacing="xs">
          <IconCpu size={16} />
          <Text weight={600} size="sm">Performance</Text>
        </Group>
        <Group spacing={4}>
          <ActionIcon size="sm" onClick={() => setExpanded(!expanded)}>
            <IconChevronDown size={16} style={{ transform: expanded ? 'rotate(180deg)' : 'none' }} />
          </ActionIcon>
          <ActionIcon size="sm" onClick={() => setIsVisible(false)}>
            <IconX size={16} />
          </ActionIcon>
        </Group>
      </Group>
      
      <Group position="apart" mb="xs">
        <Text size="xs">FPS: {performanceData.fps}</Text>
        <Badge color={getFpsColor(performanceData.fps)} size="sm">
          {performanceData.fps >= 55 ? 'Good' : performanceData.fps >= 30 ? 'OK' : 'Poor'}
        </Badge>
      </Group>
      
      <Progress
        value={(performanceData.fps / 60) * 100}
        color={getFpsColor(performanceData.fps)}
        size="sm"
        mb="xs"
        style={{ width: '100%' }}
      />
      
      <Group mb="xs">
        <Switch
          size="xs"
          label="Track Performance"
          checked={isTracking}
          onChange={(event) => setIsTracking(event.currentTarget.checked)}
        />
      </Group>
      
      <Collapse in={expanded}>
        {/* FPS History Graph */}
        <Box mb="md">
          <Text size="xs" weight={500} mb={4}>FPS History (last minute)</Text>
          <Box
            style={{
              height: '40px',
              width: '100%',
              background: '#f0f0f0',
              borderRadius: '4px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {fpsHistory.map((point, index) => {
              const x = (index / Math.max(fpsHistory.length - 1, 1)) * 100;
              const y = Math.max(0, 100 - (point.fps / 60) * 100);
              return (
                <div
                  key={point.timestamp}
                  style={{
                    position: 'absolute',
                    bottom: `${y}%`,
                    left: `${x}%`,
                    width: '2px',
                    height: '2px',
                    background: getFpsColor(point.fps),
                    transform: 'translate(-50%, 50%)'
                  }}
                />
              );
            })}
            
            {/* Threshold lines */}
            <div style={{ position: 'absolute', bottom: '50%', left: 0, right: 0, borderTop: '1px dashed #f1c40f', opacity: 0.5 }} />
            <div style={{ position: 'absolute', bottom: '8.33%', left: 0, right: 0, borderTop: '1px dashed #2ecc71', opacity: 0.5 }} />
          </Box>
        </Box>
        
        {/* Memory Usage */}
        {performanceData.memory && (
          <Box mb="md">
            <Text size="xs" weight={500} mb={4}>Memory Usage</Text>
            <Progress
              value={(performanceData.memory.usedJSHeapSize / performanceData.memory.jsHeapSizeLimit) * 100}
              size="sm"
              mb={4}
            />
            <Text size="xs">
              {formatBytes(performanceData.memory.usedJSHeapSize)} / {formatBytes(performanceData.memory.jsHeapSizeLimit)}
            </Text>
          </Box>
        )}
        
        {/* Animation Metrics */}
        <Box mb="md">
          <Text size="xs" weight={500} mb={4}>Animation Performance</Text>
          <Group position="apart">
            <Text size="xs">Average FPS:</Text>
            <Text size="xs">{performanceData.animationMetrics.averageFps.toFixed(1)}</Text>
          </Group>
          <Group position="apart">
            <Text size="xs">Last Frame Time:</Text>
            <Text size="xs">{performanceData.animationMetrics.lastFrameTime.toFixed(2)}ms</Text>
          </Group>
          <Group position="apart">
            <Text size="xs">Worst Frame Time:</Text>
            <Text size="xs">{performanceData.animationMetrics.worstFrameTime.toFixed(2)}ms</Text>
          </Group>
          {performanceData.animationMetrics.totalAnimations > 0 && (
            <Group position="apart">
              <Text size="xs">Slow Animations:</Text>
              <Text size="xs">
                {performanceData.animationMetrics.slowAnimations} / {performanceData.animationMetrics.totalAnimations}
                {' '}
                ({Math.round((performanceData.animationMetrics.slowAnimations / performanceData.animationMetrics.totalAnimations) * 100)}%)
              </Text>
            </Group>
          )}
        </Box>
        
        {/* Custom Metrics */}
        {Object.keys(performanceData.customMetrics).length > 0 && (
          <Box mb="md">
            <Text size="xs" weight={500} mb={4}>Custom Metrics</Text>
            {Object.entries(performanceData.customMetrics).map(([name, value]) => (
              <Group key={name} position="apart">
                <Text size="xs">{name}:</Text>
                <Text size="xs">{value.toFixed(2)}</Text>
              </Group>
            ))}
          </Box>
        )}
        
        {/* Actions */}
        <Group position="center" mt="md">
          <Button size="xs" variant="outline" onClick={addTestMetric}>
            Add Test Metric
          </Button>
          <Button size="xs" variant="outline" color="red" onClick={() => {
            throw new Error('Test error from Performance Monitor');
          }}>
            Trigger Test Error
          </Button>
        </Group>
      </Collapse>
    </Card>
  );
}

export default PerformanceMonitor;