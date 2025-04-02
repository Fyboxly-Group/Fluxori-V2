import { useEffect, useRef } from 'react';
import {
  Box,
  Text,
  Badge,
  Grid,
  useMantineTheme
} from '@mantine/core';
import {
  IconChartBar,
  IconChartLine,
  IconChartPie,
  IconTable,
  IconGraph
} from '@tabler/icons-react';
import { Dashboard, DashboardWidget, WidgetType } from '@/types/reporting';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import gsap from 'gsap';

interface DashboardPreviewProps {
  dashboard: Dashboard;
}

export function DashboardPreview({ dashboard }: DashboardPreviewProps) {
  const theme = useMantineTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const { motionLevel } = useMotionPreference();
  
  // Get icon for widget type
  const getWidgetIcon = (type: WidgetType) => {
    switch(type) {
      case 'chart': return <IconGraph size={14} />;
      case 'metric': return <IconChartBar size={14} />;
      case 'table': return <IconTable size={14} />;
      case 'filter': return <IconChartPie size={14} />;
      default: return <IconGraph size={14} />;
    }
  };
  
  // Get class for widget size
  const getWidgetSizeClass = (size: 'small' | 'medium' | 'large') => {
    switch(size) {
      case 'small': return 4;
      case 'medium': return 6;
      case 'large': return 12;
      default: return 4;
    }
  };
  
  // Animate widgets on mount
  useEffect(() => {
    if (!containerRef.current || motionLevel === 'minimal') return;
    
    const widgets = containerRef.current.querySelectorAll('.dashboard-widget');
    
    gsap.fromTo(
      widgets,
      { opacity: 0, scale: 0.9, y: 10 },
      { 
        opacity: 1, 
        scale: 1,
        y: 0,
        duration: 0.4, 
        stagger: 0.05, 
        ease: 'back.out(1.2)' 
      }
    );
  }, [motionLevel]);

  return (
    <Box ref={containerRef} mb="md">
      <Text size="sm" weight={500} mb="xs">Preview</Text>
      
      <Grid>
        {dashboard.widgets.map((widget) => (
          <Grid.Col key={widget.id} span={getWidgetSizeClass(widget.size)}>
            <Box
              className="dashboard-widget"
              p="sm"
              sx={(theme) => ({
                backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
                borderRadius: theme.radius.sm,
                border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                height: widget.size === 'small' ? 80 : widget.size === 'medium' ? 120 : 160,
              })}
            >
              <Text size="xs" weight={500} lineClamp={1}>{widget.title}</Text>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                }}
              >
                <Badge 
                  size="xs"
                  leftSection={getWidgetIcon(widget.type)}
                >
                  {widget.type}
                </Badge>
              </Box>
            </Box>
          </Grid.Col>
        ))}
        
        {dashboard.widgets.length === 0 && (
          <Grid.Col span={12}>
            <Text size="sm" color="dimmed" align="center">
              This dashboard has no widgets yet.
            </Text>
          </Grid.Col>
        )}
      </Grid>
      
      <Text size="xs" color="dimmed" mt="md">
        This dashboard contains {dashboard.widgets.length} widgets and {dashboard.filters?.length || 0} filters.
      </Text>
    </Box>
  );
}