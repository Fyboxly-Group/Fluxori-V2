/**
 * Animation Performance Monitor Component
 * Displays a visual dashboard for tracking GSAP animation performance
 */

import React, { useEffect, useState } from 'react';
import { 
  Paper, 
  Group, 
  Text, 
  Title, 
  Badge, 
  Stack, 
  Progress, 
  Button, 
  Card, 
  Tooltip,
  ActionIcon,
  Divider,
  useMantineTheme,
  ScrollArea,
  Collapse,
  Accordion,
  RingProgress,
  Center
} from '@mantine/core';
import { 
  IconChartBar, 
  IconRefresh, 
  IconX, 
  IconArrowRight, 
  IconAlertTriangle,
  IconDeviceAnalytics,
  IconBrush,
  IconInfoCircle,
  IconChevronDown,
  IconChevronUp
} from '@tabler/icons-react';
import { useAnimationPerformance } from '@/hooks/useEnhancedAnimation';
import { calculateFPS } from '@/utils/performance';
import { getDeviceCapabilities } from '@/animations/optimizedGsap';

/**
 * Animation Performance Monitor for development use
 * Displays real-time performance metrics for animations
 */
export const AnimationPerformanceMonitor: React.FC<{
  initiallyExpanded?: boolean;
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left' | 'float';
  width?: number | string;
}> = ({ 
  initiallyExpanded = false,
  position = 'bottom-right',
  width = 350
}) => {
  const theme = useMantineTheme();
  const { recommendations, stats, refreshAnalysis, clearMetrics } = useAnimationPerformance();
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const [fps, setFps] = useState(60);
  const [deviceCapacity, setDeviceCapacity] = useState<{
    tier: string;
    isReducedMotion: boolean;
  }>({ tier: 'medium', isReducedMotion: false });
  
  // Update FPS counter
  useEffect(() => {
    const updateFps = () => {
      setFps(calculateFPS());
    };
    
    const interval = setInterval(updateFps, 1000);
    updateFps();
    
    return () => clearInterval(interval);
  }, []);
  
  // Get device capabilities
  useEffect(() => {
    const capabilities = getDeviceCapabilities();
    setDeviceCapacity({
      tier: capabilities.tier,
      isReducedMotion: capabilities.isReducedMotion
    });
  }, []);

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  // Calculate FPS color
  const getFpsColor = (fps: number) => {
    if (fps >= 55) return 'green';
    if (fps >= 40) return 'yellow';
    return 'red';
  };
  
  // Get position styles
  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 9999,
      width: typeof width === 'number' ? `${width}px` : width,
      maxWidth: '100vw',
      maxHeight: position.includes('top') ? 'calc(100vh - 20px)' : '80vh',
      transition: 'all 0.3s ease'
    };
    
    switch (position) {
      case 'top-right':
        return { ...baseStyles, top: 10, right: 10 };
      case 'bottom-right':
        return { ...baseStyles, bottom: 10, right: 10 };
      case 'bottom-left':
        return { ...baseStyles, bottom: 10, left: 10 };
      case 'top-left':
        return { ...baseStyles, top: 10, left: 10 };
      case 'float':
        return { 
          ...baseStyles, 
          bottom: 70, 
          right: 10,
          boxShadow: '0 0 20px rgba(0,0,0,0.3)'
        };
    }
  };
  
  return (
    <Paper 
      p="xs" 
      shadow="md" 
      withBorder
      style={getPositionStyles()}
      sx={{
        backgroundColor: theme.colorScheme === 'dark' 
          ? theme.colors.dark[7] 
          : theme.colors.gray[0],
        border: `1px solid ${
          theme.colorScheme === 'dark' 
            ? theme.colors.dark[4] 
            : theme.colors.gray[3]
        }`
      }}
    >
      {/* Header */}
      <Group position="apart" mb={expanded ? 'xs' : 0}>
        <Group spacing="xs">
          <ActionIcon 
            size="md" 
            color="blue" 
            variant="light"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
          </ActionIcon>
          <Text weight={500} size="sm">Animation Performance Monitor</Text>
        </Group>
        
        <Group spacing={4}>
          <Badge 
            color={getFpsColor(fps)} 
            size="sm"
            variant="filled"
          >
            {fps} FPS
          </Badge>
          
          <ActionIcon 
            size="sm" 
            color="gray" 
            onClick={() => setExpanded(false)}
            variant="subtle"
          >
            <IconX size={14} />
          </ActionIcon>
        </Group>
      </Group>
      
      {/* Metrics Panel */}
      <Collapse in={expanded}>
        <Divider my="xs" />
        
        {/* Device information */}
        <Group position="apart" mb="xs">
          <Group spacing="xs">
            <Text size="xs" color="dimmed">Device tier:</Text>
            <Badge 
              size="xs" 
              color={
                deviceCapacity.tier === 'high' ? 'green' : 
                deviceCapacity.tier === 'medium' ? 'yellow' : 'red'
              }
            >
              {deviceCapacity.tier}
            </Badge>
          </Group>
          
          <Group spacing="xs">
            <Text size="xs" color="dimmed">Reduced motion:</Text>
            <Badge 
              size="xs" 
              color={deviceCapacity.isReducedMotion ? 'blue' : 'gray'}
            >
              {deviceCapacity.isReducedMotion ? 'On' : 'Off'}
            </Badge>
          </Group>
        </Group>
        
        {/* Summary statistics */}
        <Card withBorder p="xs" mb="xs">
          <Group position="apart" mb="xs">
            <Text size="sm" weight={500}>Animation Statistics</Text>
            
            <Tooltip label="Refresh metrics">
              <ActionIcon size="sm" onClick={refreshAnalysis}>
                <IconRefresh size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
          
          <Group grow mb="xs">
            <Stack spacing={0} align="center">
              <Text size="lg" weight={700}>{stats.total}</Text>
              <Text size="xs" color="dimmed">Animations</Text>
            </Stack>
            
            <Stack spacing={0} align="center">
              <Text size="lg" weight={700}>{stats.averageDuration.toFixed(1)}ms</Text>
              <Text size="xs" color="dimmed">Avg Duration</Text>
            </Stack>
            
            <Stack spacing={0} align="center">
              <Text 
                size="lg" 
                weight={700} 
                color={stats.problematic > 0 ? 'red' : 'green'}
              >
                {stats.problematic}
              </Text>
              <Text size="xs" color="dimmed">Issues</Text>
            </Stack>
          </Group>
          
          {/* Performance gauge */}
          <Group position="center" mb="xs">
            <RingProgress
              size={80}
              thickness={8}
              roundCaps
              sections={[
                { 
                  value: Math.min(100, (stats.problematic / Math.max(1, stats.total)) * 100), 
                  color: 'red',
                  tooltip: 'Problematic animations'
                },
                { 
                  value: Math.min(100, 100 - (stats.problematic / Math.max(1, stats.total)) * 100), 
                  color: 'green',
                  tooltip: 'Healthy animations'
                }
              ]}
              label={
                <Center>
                  <Text size="xs" color="dimmed">
                    {stats.total > 0 
                      ? `${Math.round(100 - (stats.problematic / stats.total) * 100)}%`
                      : '100%'}
                  </Text>
                </Center>
              }
            />
          </Group>
          
          {/* Top animations */}
          {stats.topAnimations.length > 0 && (
            <>
              <Text size="xs" color="dimmed" mb="xs">Top Animations:</Text>
              <Stack spacing="xs">
                {stats.topAnimations.map((anim, i) => (
                  <Group key={i} position="apart" spacing="xs" noWrap>
                    <Text size="xs" lineClamp={1} style={{ maxWidth: '60%' }}>
                      {anim.name}
                    </Text>
                    
                    <Group spacing={4} noWrap>
                      <Badge size="xs">{anim.count}×</Badge>
                      <Text size="xs">{anim.avgDuration.toFixed(1)}ms</Text>
                    </Group>
                  </Group>
                ))}
              </Stack>
            </>
          )}
        </Card>
        
        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Card withBorder p="xs" mb="xs">
            <Group position="apart" mb={4}>
              <Group spacing="xs">
                <IconAlertTriangle size={16} color={theme.colors.orange[5]} />
                <Text size="sm" weight={500}>Optimization Recommendations</Text>
              </Group>
            </Group>
            
            <ScrollArea h={100}>
              <Stack spacing="xs">
                {recommendations.map((rec, i) => (
                  <Paper key={i} p="xs" withBorder>
                    <Text size="xs" weight={500}>{rec.animation}</Text>
                    <Text size="xs" color="dimmed">{rec.recommendation}</Text>
                  </Paper>
                ))}
              </Stack>
            </ScrollArea>
          </Card>
        )}
        
        {/* Actions */}
        <Group position="right">
          <Button 
            size="xs" 
            color="gray" 
            variant="light"
            onClick={clearMetrics}
          >
            Clear Metrics
          </Button>
          
          <Button 
            size="xs" 
            onClick={refreshAnalysis}
            rightIcon={<IconRefresh size={14} />}
          >
            Refresh
          </Button>
        </Group>
      </Collapse>
    </Paper>
  );
};

export default AnimationPerformanceMonitor;