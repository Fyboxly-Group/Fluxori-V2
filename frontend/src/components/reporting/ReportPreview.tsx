import { useEffect, useRef } from 'react';
import {
  Box,
  Text,
  Title,
  Card,
  Group,
  Button,
  Badge,
  Grid,
  Skeleton,
  Divider,
  LoadingOverlay,
  Paper
} from '@mantine/core';
import { 
  IconDownload, 
  IconFileSpreadsheet, 
  IconFileCsv, 
  IconFilePdf,
  IconRefresh
} from '@tabler/icons-react';
import { ReportConfiguration } from '@/types/reporting';
import { ReportVisualization } from './ReportVisualization';
import { useReportVisualization } from '@/hooks/reporting/useReportVisualization';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import gsap from 'gsap';

interface ReportPreviewProps {
  configuration: ReportConfiguration;
}

export function ReportPreview({ configuration }: ReportPreviewProps) {
  const { 
    isLoading, 
    error, 
    result, 
    chartType, 
    fetchReportData, 
    exportReport,
    setChartType
  } = useReportVisualization({ configuration });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const { motionLevel } = useMotionPreference();
  
  // Format date for display
  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Handle export button click
  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    await exportReport(format);
  };
  
  // Animations
  useEffect(() => {
    if (motionLevel === 'minimal') return;
    
    // Initial animation
    if (containerRef.current) {
      const timeline = gsap.timeline();
      
      timeline.fromTo(
        containerRef.current.querySelector('.report-header'),
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
      
      if (!isLoading && result) {
        // Animate the visualization container
        timeline.fromTo(
          containerRef.current.querySelector('.visualization-container'),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          '-=0.1'
        );
      }
      
      // Animate export options
      if (exportRef.current) {
        timeline.fromTo(
          exportRef.current.querySelectorAll('.export-button'),
          { opacity: 0, y: 10 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.3, 
            stagger: 0.05, 
            ease: 'power2.out' 
          },
          '-=0.2'
        );
      }
    }
  }, [isLoading, result, motionLevel]);
  
  return (
    <Box ref={containerRef}>
      <Title order={3} mb="md" className="report-header">Report Preview</Title>
      
      <Card p="md" radius="md" withBorder mb="lg">
        <Group position="apart" mb="md">
          <Box>
            <Title order={4}>{configuration.name}</Title>
            {configuration.description && (
              <Text color="dimmed" size="sm">
                {configuration.description}
              </Text>
            )}
          </Box>
          <Box>
            <Badge color="blue" size="lg">{configuration.category}</Badge>
          </Box>
        </Group>
        
        <Divider mb="md" />
        
        <Grid mb="md">
          <Grid.Col span={4}>
            <Text size="sm" weight={500}>Time Frame:</Text>
            <Text size="sm">
              {configuration.timeFrame === 'custom' ? 'Custom Range' : configuration.timeFrame}
              {configuration.timeFrame === 'custom' && (
                <Text size="xs" color="dimmed">
                  {formatDate(configuration.startDate)} to {formatDate(configuration.endDate)}
                </Text>
              )}
            </Text>
          </Grid.Col>
          <Grid.Col span={4}>
            <Text size="sm" weight={500}>Metrics:</Text>
            <Text size="sm">
              {configuration.metrics.length} selected
            </Text>
          </Grid.Col>
          <Grid.Col span={4}>
            <Text size="sm" weight={500}>Dimensions:</Text>
            <Text size="sm">
              {configuration.dimensions.length} selected
            </Text>
          </Grid.Col>
        </Grid>
        
        <Box pos="relative" className="visualization-container">
          <LoadingOverlay visible={isLoading} overlayBlur={2} />
          
          {error ? (
            <Paper p="xl" withBorder radius="md" bg="red.0" style={{ borderColor: '#ff6b6b' }}>
              <Text color="red" align="center">
                Error loading report: {error}
              </Text>
              <Group position="center" mt="md">
                <Button 
                  leftIcon={<IconRefresh size={16} />} 
                  onClick={() => fetchReportData()}
                  color="red"
                  variant="light"
                >
                  Retry
                </Button>
              </Group>
            </Paper>
          ) : (
            <Box>
              {!isLoading && !result ? (
                <Skeleton height={300} radius="md" />
              ) : (
                <ReportVisualization
                  result={result}
                  chartType={chartType}
                  onChartTypeChange={setChartType}
                />
              )}
            </Box>
          )}
        </Box>
      </Card>
      
      <Box ref={exportRef}>
        <Title order={4} mb="md">Export Options</Title>
        <Group>
          <Button 
            leftIcon={<IconFilePdf size={16} />}
            onClick={() => handleExport('pdf')}
            className="export-button"
            disabled={isLoading || !result}
          >
            Export PDF
          </Button>
          <Button 
            leftIcon={<IconFileSpreadsheet size={16} />}
            variant="outline"
            onClick={() => handleExport('excel')}
            className="export-button"
            disabled={isLoading || !result}
          >
            Export Excel
          </Button>
          <Button 
            leftIcon={<IconFileCsv size={16} />}
            variant="outline"
            onClick={() => handleExport('csv')}
            className="export-button"
            disabled={isLoading || !result}
          >
            Export CSV
          </Button>
        </Group>
      </Box>
    </Box>
  );
}