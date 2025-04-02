import { useEffect, useRef } from 'react';
import {
  Box,
  Text,
  Title,
  TextInput,
  Textarea,
  Grid,
  Group,
  Select,
  NumberInput,
  Card
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { ReportTimeFrame, ReportChartType } from '@/types/reporting';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { ChartTypeSelector } from './ChartTypeSelector';
import gsap from 'gsap';

interface ReportConfiguratorProps {
  reportName: string;
  reportDescription: string;
  timeFrame: ReportTimeFrame;
  startDate: Date | null;
  endDate: Date | null;
  chartType: ReportChartType;
  setReportName: (name: string) => void;
  setReportDescription: (description: string) => void;
  setTimeFrame: (timeFrame: ReportTimeFrame) => void;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  setChartType: (chartType: ReportChartType) => void;
  limit?: number;
  setLimit?: (limit: number | undefined) => void;
}

export function ReportConfigurator({
  reportName,
  reportDescription,
  timeFrame,
  startDate,
  endDate,
  chartType,
  setReportName,
  setReportDescription,
  setTimeFrame,
  setStartDate,
  setEndDate,
  setChartType,
  limit,
  setLimit
}: ReportConfiguratorProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const chartSelectorRef = useRef<HTMLDivElement>(null);
  const { motionLevel } = useMotionPreference();
  
  // Time frame options
  const timeFrameOptions = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'quarter', label: 'Quarter' },
    { value: 'year', label: 'Year' },
    { value: 'custom', label: 'Custom Range' }
  ];
  
  // Animate form fields on mount
  useEffect(() => {
    if (formRef.current && motionLevel !== 'minimal') {
      const formElements = formRef.current.querySelectorAll('input, textarea, .mantine-Select-root');
      
      gsap.fromTo(
        formElements,
        { opacity: 0, y: 15 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.4, 
          stagger: 0.05, 
          ease: 'power2.out' 
        }
      );
    }
    
    // Animate chart selector with a delay
    if (chartSelectorRef.current && motionLevel !== 'minimal') {
      gsap.fromTo(
        chartSelectorRef.current,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          delay: 0.3,
          ease: 'power2.out' 
        }
      );
    }
  }, [motionLevel]);

  return (
    <Box>
      <Title order={3} mb="md">Configure Report</Title>
      <Text color="dimmed" mb="lg">
        Define the basic settings for your report.
      </Text>
      
      <Grid>
        <Grid.Col span={12}>
          <Card p="md" radius="md" withBorder mb="xl">
            <Box ref={formRef}>
              <Grid>
                <Grid.Col span={7}>
                  <TextInput
                    label="Report Name"
                    placeholder="Enter a descriptive name for your report"
                    value={reportName}
                    onChange={(e) => setReportName(e.currentTarget.value)}
                    required
                    mb="md"
                  />
                </Grid.Col>
                <Grid.Col span={5}>
                  <Select
                    label="Time Frame"
                    data={timeFrameOptions}
                    value={timeFrame}
                    onChange={(value) => setTimeFrame(value as ReportTimeFrame)}
                    required
                    mb="md"
                  />
                </Grid.Col>
                
                {timeFrame === 'custom' && (
                  <Grid.Col span={12}>
                    <Group grow>
                      <DatePicker
                        label="Start Date"
                        placeholder="Select start date"
                        value={startDate}
                        onChange={setStartDate}
                        required
                      />
                      <DatePicker
                        label="End Date"
                        placeholder="Select end date"
                        value={endDate}
                        onChange={setEndDate}
                        required
                        minDate={startDate || undefined}
                      />
                    </Group>
                  </Grid.Col>
                )}
                
                <Grid.Col span={12}>
                  <Textarea
                    label="Description"
                    placeholder="Provide a brief description of this report"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.currentTarget.value)}
                    autosize
                    minRows={2}
                    maxRows={4}
                    mb="md"
                  />
                </Grid.Col>
                
                {setLimit && (
                  <Grid.Col span={4}>
                    <NumberInput
                      label="Result Limit"
                      description="Maximum number of results to include"
                      value={limit}
                      onChange={(val) => setLimit(val || undefined)}
                      min={1}
                      max={1000}
                    />
                  </Grid.Col>
                )}
              </Grid>
            </Box>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={12} ref={chartSelectorRef}>
          <ChartTypeSelector
            selectedChartType={chartType}
            onChange={setChartType}
          />
        </Grid.Col>
      </Grid>
    </Box>
  );
}