import { useEffect, useRef } from 'react';
import { 
  Box, 
  Paper, 
  Stepper, 
  Group, 
  Button, 
  Title, 
  Text,
  Grid,
  Container
} from '@mantine/core';
import { useReportBuilder } from '@/hooks/reporting/useReportBuilder';
import { DataSourceSelector } from './DataSourceSelector';
import { MetricSelector } from './MetricSelector';
import { DimensionSelector } from './DimensionSelector';
import { FilterBuilder } from './FilterBuilder';
import { ChartTypeSelector } from './ChartTypeSelector';
import { ReportConfigurator } from './ReportConfigurator';
import { ReportPreview } from './ReportPreview';
import { ReportConfiguration } from '@/types/reporting';
import { useOptimizedAnimation } from '@/hooks/useOptimizedAnimation';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import gsap from 'gsap';

interface ReportBuilderProps {
  initialConfig?: Partial<ReportConfiguration>;
  onSave?: (config: ReportConfiguration) => void;
  onCancel?: () => void;
}

export function ReportBuilder({ initialConfig, onSave, onCancel }: ReportBuilderProps) {
  const [active, setActive] = useState(0);
  const [completed, setCompleted] = useState(false);
  const reportBuilder = useReportBuilder({ initialConfig });
  const containerRef = useRef<HTMLDivElement>(null);
  const { animationRef } = useOptimizedAnimation('fadeInUp', { duration: 0.6 });
  const { motionLevel } = useMotionPreference();
  
  const nextStep = () => setActive((current) => {
    if (current < 5) {
      animateStepTransition(current, current + 1);
      return current + 1;
    }
    return current;
  });
  
  const prevStep = () => setActive((current) => {
    if (current > 0) {
      animateStepTransition(current, current - 1);
      return current - 1;
    }
    return current;
  });
  
  const animateStepTransition = (from: number, to: number) => {
    if (motionLevel === 'minimal' || !containerRef.current) return;
    
    const timeline = gsap.timeline();
    const direction = to > from ? 1 : -1;
    const currentStep = containerRef.current.querySelector(`.step-${from}`);
    const nextStep = containerRef.current.querySelector(`.step-${to}`);
    
    if (currentStep && nextStep) {
      timeline
        .to(currentStep, { 
          opacity: 0, 
          x: -30 * direction, 
          duration: 0.3, 
          ease: 'power2.in' 
        })
        .set(nextStep, { 
          opacity: 0, 
          x: 30 * direction 
        })
        .to(nextStep, { 
          opacity: 1, 
          x: 0, 
          duration: 0.4, 
          ease: 'power2.out' 
        });
    }
  };
  
  const handleSave = () => {
    const validation = reportBuilder.validate();
    if (!validation.isValid) {
      // Handle validation errors
      console.error('Validation failed:', validation.errors);
      return;
    }
    
    const config = reportBuilder.generateReportConfig();
    setCompleted(true);
    
    if (onSave) {
      onSave(config);
    }
  };
  
  // Handle step content
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box className="step-0">
            <DataSourceSelector 
              availableDataSources={reportBuilder.availableDataSources}
              selectedDataSourceId={reportBuilder.dataSourceId}
              onSelectDataSource={reportBuilder.setDataSourceId}
              setReportCategory={reportBuilder.setReportCategory}
            />
          </Box>
        );
      case 1:
        return (
          <Box className="step-1">
            <ReportConfigurator 
              reportName={reportBuilder.reportName}
              reportDescription={reportBuilder.reportDescription}
              timeFrame={reportBuilder.timeFrame}
              startDate={reportBuilder.startDate}
              endDate={reportBuilder.endDate}
              chartType={reportBuilder.chartType}
              setReportName={reportBuilder.setReportName}
              setReportDescription={reportBuilder.setReportDescription}
              setTimeFrame={reportBuilder.setTimeFrame}
              setStartDate={reportBuilder.setStartDate}
              setEndDate={reportBuilder.setEndDate}
              setChartType={reportBuilder.setChartType}
            />
          </Box>
        );
      case 2:
        return (
          <Box className="step-2">
            <MetricSelector 
              availableMetrics={reportBuilder.availableFields.metrics}
              selectedMetrics={reportBuilder.metrics}
              onAddMetric={reportBuilder.addMetric}
              onRemoveMetric={reportBuilder.removeMetric}
              onUpdateMetric={reportBuilder.updateMetric}
            />
          </Box>
        );
      case 3:
        return (
          <Box className="step-3">
            <DimensionSelector 
              availableDimensions={reportBuilder.availableFields.dimensions}
              selectedDimensions={reportBuilder.dimensions}
              onAddDimension={reportBuilder.addDimension}
              onRemoveDimension={reportBuilder.removeDimension}
              onUpdateDimension={reportBuilder.updateDimension}
            />
          </Box>
        );
      case 4:
        return (
          <Box className="step-4">
            <FilterBuilder 
              availableFields={[
                ...reportBuilder.availableFields.metrics,
                ...reportBuilder.availableFields.dimensions
              ]}
              filters={reportBuilder.filters}
              onAddFilter={reportBuilder.addFilter}
              onRemoveFilter={reportBuilder.removeFilter}
              onUpdateFilter={reportBuilder.updateFilter}
            />
          </Box>
        );
      case 5:
        return (
          <Box className="step-5">
            <ReportPreview 
              configuration={reportBuilder.generateReportConfig()}
            />
          </Box>
        );
      default:
        return null;
    }
  };
  
  // Effect to handle completion animation
  useEffect(() => {
    if (completed && containerRef.current && motionLevel !== 'minimal') {
      const timeline = gsap.timeline();
      
      timeline
        .to(containerRef.current, { 
          scale: 1.02, 
          duration: 0.3, 
          ease: 'power2.out' 
        })
        .to(containerRef.current, { 
          scale: 1, 
          duration: 0.5, 
          ease: 'elastic.out(1, 0.3)' 
        });
    }
  }, [completed, motionLevel]);
  
  const steps = [
    { label: 'Data Source', description: 'Select data source' },
    { label: 'Configuration', description: 'Basic report settings' },
    { label: 'Metrics', description: 'Select metrics to display' },
    { label: 'Dimensions', description: 'Select dimensions for grouping' },
    { label: 'Filters', description: 'Add filters to your report' },
    { label: 'Preview', description: 'Preview and save your report' }
  ];

  return (
    <Container size="xl" ref={animationRef}>
      <Paper shadow="md" p="xl" radius="md" ref={containerRef} withBorder>
        <Box mb="xl">
          <Title order={2}>Create New Report</Title>
          <Text color="dimmed">Follow the steps below to create your custom report</Text>
        </Box>

        <Stepper active={active} breakpoint="sm" mb="xl">
          {steps.map((step, index) => (
            <Stepper.Step 
              key={index} 
              label={step.label} 
              description={step.description}
              allowStepSelect={index < active}
              onClick={() => index < active && setActive(index)}
            />
          ))}
        </Stepper>

        <Grid>
          <Grid.Col span={12}>
            {getStepContent(active)}
          </Grid.Col>
        </Grid>

        <Group position="right" mt="xl">
          {active !== 0 && (
            <Button variant="default" onClick={prevStep}>
              Back
            </Button>
          )}
          {active !== steps.length - 1 ? (
            <Button onClick={nextStep} disabled={!reportBuilder.dataSourceId && active === 0}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSave} color="green">
              Save Report
            </Button>
          )}
          {onCancel && (
            <Button variant="outline" color="red" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </Group>
      </Paper>
    </Container>
  );
}

// For TypeScript support
import { useState } from 'react';