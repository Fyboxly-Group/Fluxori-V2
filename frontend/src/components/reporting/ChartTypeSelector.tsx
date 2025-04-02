import { useRef, useEffect } from 'react';
import {
  Box,
  Text,
  Title,
  SimpleGrid,
  Card,
  Group,
  Radio,
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
import { ReportChartType } from '@/types/reporting';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import gsap from 'gsap';

interface ChartTypeSelectorProps {
  selectedChartType: ReportChartType;
  onChange: (chartType: ReportChartType) => void;
}

interface ChartTypeOption {
  value: ReportChartType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export function ChartTypeSelector({
  selectedChartType,
  onChange
}: ChartTypeSelectorProps) {
  const theme = useMantineTheme();
  const cardsRef = useRef<HTMLDivElement>(null);
  const { motionLevel } = useMotionPreference();
  
  const chartOptions: ChartTypeOption[] = [
    {
      value: 'bar',
      label: 'Bar Chart',
      icon: <IconChartBar size={36} />,
      description: 'Good for comparing values across categories'
    },
    {
      value: 'line',
      label: 'Line Chart',
      icon: <IconChartLine size={36} />,
      description: 'Ideal for showing trends over time'
    },
    {
      value: 'pie',
      label: 'Pie Chart',
      icon: <IconChartPie size={36} />,
      description: 'Shows parts of a whole as proportions'
    },
    {
      value: 'scatter',
      label: 'Scatter Plot',
      icon: <IconChartDots size={36} />,
      description: 'Good for showing correlation between values'
    },
    {
      value: 'radar',
      label: 'Radar Chart',
      icon: <IconChartRadar size={36} />,
      description: 'Compare multiple variables at once'
    },
    {
      value: 'table',
      label: 'Table',
      icon: <IconTable size={36} />,
      description: 'Shows raw data in structured format'
    }
  ];
  
  // Handle selection change
  const handleChange = (value: ReportChartType) => {
    if (value === selectedChartType) return;
    onChange(value);
  };
  
  // Animate cards on mount
  useEffect(() => {
    if (cardsRef.current && motionLevel !== 'minimal') {
      const cards = cardsRef.current.querySelectorAll('.chart-type-card');
      
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.4, 
          stagger: 0.05, 
          ease: 'power2.out' 
        }
      );
    }
  }, [motionLevel]);
  
  // Animate selection change
  const animateSelection = (card: HTMLElement) => {
    if (motionLevel === 'minimal') return;
    
    gsap.timeline()
      .to(card, { 
        scale: 1.05, 
        duration: 0.2, 
        ease: 'power2.out' 
      })
      .to(card, { 
        scale: 1, 
        duration: 0.4, 
        ease: 'elastic.out(1, 0.3)' 
      });
  };

  return (
    <Box>
      <Title order={3} mb="md">Select Chart Type</Title>
      <Text color="dimmed" mb="lg">
        Choose how your data will be visualized.
      </Text>
      
      <Radio.Group
        value={selectedChartType}
        onChange={(value) => handleChange(value as ReportChartType)}
        name="chartType"
      >
        <SimpleGrid cols={3} spacing="md" ref={cardsRef}>
          {chartOptions.map((option) => (
            <Card
              key={option.value}
              p="md"
              radius="md"
              withBorder
              className="chart-type-card"
              sx={(theme) => ({
                cursor: 'pointer',
                borderColor: selectedChartType === option.value 
                  ? theme.colors[theme.primaryColor][5] 
                  : theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2],
                backgroundColor: selectedChartType === option.value 
                  ? theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0]
                  : 'transparent',
                transition: 'background-color 200ms ease, border-color 200ms ease',
                '&:hover': {
                  backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0]
                }
              })}
              onClick={(e) => {
                handleChange(option.value);
                if (e.currentTarget) {
                  animateSelection(e.currentTarget);
                }
              }}
            >
              <Box 
                mb="md" 
                sx={{ 
                  color: selectedChartType === option.value 
                    ? theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6] 
                    : 'inherit' 
                }}
              >
                {option.icon}
              </Box>
              
              <Group position="apart">
                <Box>
                  <Radio 
                    value={option.value} 
                    label={option.label}
                    styles={{ 
                      radio: { 
                        cursor: 'pointer'
                      },
                      label: {
                        cursor: 'pointer',
                        fontWeight: 500
                      }
                    }}
                  />
                  <Text size="xs" color="dimmed" mt={4}>
                    {option.description}
                  </Text>
                </Box>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      </Radio.Group>
    </Box>
  );
}

// For TypeScript support
import { useState } from 'react';