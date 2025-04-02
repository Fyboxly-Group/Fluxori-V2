import { useState, useCallback, useMemo, useEffect } from 'react';
import { ReportConfiguration, ReportResult, ReportChartType } from '@/types/reporting';
import { reportResults, savedReports } from '@/mocks/reportingData';
import gsap from 'gsap';

interface UseReportVisualizationProps {
  reportId?: string;
  configuration?: ReportConfiguration;
}

export function useReportVisualization({ reportId, configuration }: UseReportVisualizationProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReportResult | null>(null);
  const [chartType, setChartType] = useState<ReportChartType>(configuration?.chartType || 'bar');
  const [animationComplete, setAnimationComplete] = useState(false);

  // Get the report configuration
  const reportConfig = useMemo(() => {
    if (configuration) return configuration;
    if (reportId) {
      const report = savedReports.find(r => r.id === reportId);
      return report?.configuration || null;
    }
    return null;
  }, [reportId, configuration]);

  // Fetch report data
  const fetchReportData = useCallback(async () => {
    if (!reportId && !configuration) {
      setError('Report ID or configuration is required');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setAnimationComplete(false);
      
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let reportData: ReportResult | null = null;
      
      if (reportId) {
        // Fetch existing report
        reportData = reportResults[reportId] || null;
      } else if (configuration) {
        // Generate new report based on configuration
        // This is a simplified mock implementation
        // In a real application, this would call an API
        
        const randomId = Math.random().toString(36).substring(2, 15);
        const existingResult = Object.values(reportResults)[0];
        
        if (existingResult) {
          reportData = {
            ...existingResult,
            id: `temp-${randomId}`,
            configuration: configuration,
            generatedAt: new Date(),
            processingTimeMs: Math.floor(Math.random() * 500) + 100
          };
        }
      }
      
      if (!reportData) {
        throw new Error('Failed to generate report data');
      }
      
      setResult(reportData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [reportId, configuration]);

  // Trigger animation for chart elements
  const animateChart = useCallback((chartSelector: string) => {
    const timeline = gsap.timeline({
      onComplete: () => setAnimationComplete(true)
    });
    
    // Different animation approaches based on chart type
    switch (chartType) {
      case 'bar':
        timeline.fromTo(
          `${chartSelector} .bar-element`,
          { scaleY: 0, transformOrigin: 'bottom' },
          { 
            scaleY: 1, 
            duration: 0.6, 
            stagger: 0.05, 
            ease: 'power2.out' 
          }
        );
        break;
        
      case 'line':
        timeline
          .fromTo(
            `${chartSelector} .line-path`, 
            { drawSVG: '0%' },
            { 
              drawSVG: '100%', 
              duration: 1.2, 
              ease: 'power1.inOut' 
            }
          )
          .fromTo(
            `${chartSelector} .data-point`,
            { scale: 0, opacity: 0 },
            { 
              scale: 1, 
              opacity: 1, 
              duration: 0.4, 
              stagger: 0.03, 
              ease: 'back.out(1.7)' 
            },
            '-=0.8'
          );
        break;
        
      case 'pie':
        timeline.fromTo(
          `${chartSelector} .pie-segment`,
          { scale: 0.5, opacity: 0, transformOrigin: 'center' },
          { 
            scale: 1, 
            opacity: 1, 
            duration: 0.7, 
            stagger: 0.1, 
            ease: 'back.out(1.2)' 
          }
        );
        break;
        
      case 'scatter':
        timeline.fromTo(
          `${chartSelector} .data-point`,
          { scale: 0, opacity: 0 },
          { 
            scale: 1, 
            opacity: 1, 
            duration: 0.4, 
            stagger: { 
              amount: 0.7, 
              grid: 'auto', 
              from: 'center' 
            }, 
            ease: 'power2.out' 
          }
        );
        break;
        
      default:
        // Default animation for other chart types
        timeline.fromTo(
          `${chartSelector} .chart-element`,
          { opacity: 0, y: 20 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.5, 
            stagger: 0.05, 
            ease: 'power2.out' 
          }
        );
    }
    
    // Animate summary statistics
    timeline.fromTo(
      `${chartSelector}-summary .stat-value`,
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
    
    return timeline;
  }, [chartType]);

  // Export report data
  const exportReport = useCallback(async (format: 'pdf' | 'excel' | 'csv') => {
    if (!result) {
      setError('No report data available to export');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Simulate export processing with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock implementation
      console.log(`Exporting report in ${format} format...`);
      
      // In a real application, this would call an API to generate the export
      // and then trigger a download
      
      // Simulate download by logging
      console.log(`Report exported successfully in ${format} format`);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export report');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [result]);

  // If reportId or configuration changes, fetch the data
  useEffect(() => {
    if (reportId || configuration) {
      fetchReportData();
    }
  }, [reportId, fetchReportData]);

  return {
    isLoading,
    error,
    result,
    chartType,
    animationComplete,
    setChartType,
    fetchReportData,
    animateChart,
    exportReport,
    reportConfig
  };
}