import { useState, useCallback, useMemo } from 'react';
import { ReportConfiguration, ReportFilter, ReportMetric, ReportDimension, ReportChartType, DataSource, DataSourceField, ReportTimeFrame } from '@/types/reporting';
import { nanoid } from 'nanoid';
import { dataSources } from '@/mocks/reportingData';

interface UseReportBuilderProps {
  initialConfig?: Partial<ReportConfiguration>;
}

export function useReportBuilder({ initialConfig }: UseReportBuilderProps = {}) {
  const [dataSourceId, setDataSourceId] = useState<string | null>(initialConfig?.configuration?.id || null);
  const [reportName, setReportName] = useState<string>(initialConfig?.name || '');
  const [reportDescription, setReportDescription] = useState<string>(initialConfig?.description || '');
  const [reportCategory, setReportCategory] = useState<string>(initialConfig?.category || '');
  const [timeFrame, setTimeFrame] = useState<ReportTimeFrame>(initialConfig?.timeFrame || 'month');
  const [startDate, setStartDate] = useState<Date | null>(initialConfig?.startDate || null);
  const [endDate, setEndDate] = useState<Date | null>(initialConfig?.endDate || null);
  const [metrics, setMetrics] = useState<ReportMetric[]>(initialConfig?.metrics || []);
  const [dimensions, setDimensions] = useState<ReportDimension[]>(initialConfig?.dimensions || []);
  const [filters, setFilters] = useState<ReportFilter[]>(initialConfig?.filters || []);
  const [chartType, setChartType] = useState<ReportChartType>(initialConfig?.chartType || 'bar');
  const [limit, setLimit] = useState<number | undefined>(initialConfig?.limit || 20);
  const [sorting, setSorting] = useState<{field: string; direction: 'asc' | 'desc'} | undefined>(
    initialConfig?.sorting || undefined
  );

  // Get available data sources
  const availableDataSources = useMemo(() => {
    return dataSources;
  }, []);

  // Get selected data source
  const selectedDataSource = useMemo(() => {
    if (!dataSourceId) return null;
    return availableDataSources.find(ds => ds.id === dataSourceId) || null;
  }, [dataSourceId, availableDataSources]);

  // Get available fields from selected data source
  const availableFields = useMemo(() => {
    if (!selectedDataSource) return { metrics: [], dimensions: [] };
    
    const metricFields = selectedDataSource.fields.filter(field => field.isMetric);
    const dimensionFields = selectedDataSource.fields.filter(field => field.isDimension);
    
    return { metrics: metricFields, dimensions: dimensionFields };
  }, [selectedDataSource]);

  // Add metric to report
  const addMetric = useCallback((field: DataSourceField) => {
    setMetrics(prev => {
      if (prev.some(m => m.field === field.name)) return prev; // Prevent duplicates
      
      return [...prev, {
        id: nanoid(),
        field: field.name,
        aggregation: field.supportedAggregations?.[0] || 'sum',
        label: field.label,
        format: field.format
      }];
    });
  }, []);

  // Remove metric from report
  const removeMetric = useCallback((id: string) => {
    setMetrics(prev => prev.filter(metric => metric.id !== id));
  }, []);

  // Update metric properties
  const updateMetric = useCallback((id: string, updates: Partial<ReportMetric>) => {
    setMetrics(prev => prev.map(metric => 
      metric.id === id ? { ...metric, ...updates } : metric
    ));
  }, []);

  // Add dimension to report
  const addDimension = useCallback((field: DataSourceField) => {
    setDimensions(prev => {
      if (prev.some(d => d.field === field.name)) return prev; // Prevent duplicates
      
      return [...prev, {
        id: nanoid(),
        field: field.name,
        label: field.label,
        groupBy: true
      }];
    });
  }, []);

  // Remove dimension from report
  const removeDimension = useCallback((id: string) => {
    setDimensions(prev => prev.filter(dimension => dimension.id !== id));
  }, []);

  // Update dimension properties
  const updateDimension = useCallback((id: string, updates: Partial<ReportDimension>) => {
    setDimensions(prev => prev.map(dimension => 
      dimension.id === id ? { ...dimension, ...updates } : dimension
    ));
  }, []);

  // Add filter to report
  const addFilter = useCallback((field: DataSourceField) => {
    setFilters(prev => {
      if (prev.some(f => f.field === field.name)) return prev; // Prevent duplicates
      
      let filterValue: any = '';
      if (field.type === 'number') filterValue = 0;
      if (field.type === 'boolean') filterValue = true;
      if (field.type === 'date') filterValue = new Date();
      
      return [...prev, {
        id: nanoid(),
        field: field.name,
        operator: field.type === 'string' ? 'equals' : 'greaterThan',
        value: filterValue,
        fieldType: field.type === 'string' ? 'text' : 
                  field.type === 'number' ? 'number' : 
                  field.type === 'date' ? 'date' : 
                  field.type === 'boolean' ? 'boolean' : 'text',
        label: field.label
      }];
    });
  }, []);

  // Remove filter from report
  const removeFilter = useCallback((id: string) => {
    setFilters(prev => prev.filter(filter => filter.id !== id));
  }, []);

  // Update filter properties
  const updateFilter = useCallback((id: string, updates: Partial<ReportFilter>) => {
    setFilters(prev => prev.map(filter => 
      filter.id === id ? { ...filter, ...updates } : filter
    ));
  }, []);

  // Reset all configuration
  const resetConfig = useCallback(() => {
    setDataSourceId(null);
    setReportName('');
    setReportDescription('');
    setReportCategory('');
    setTimeFrame('month');
    setStartDate(null);
    setEndDate(null);
    setMetrics([]);
    setDimensions([]);
    setFilters([]);
    setChartType('bar');
    setLimit(20);
    setSorting(undefined);
  }, []);

  // Generate complete report configuration
  const generateReportConfig = useCallback((): ReportConfiguration => {
    return {
      id: initialConfig?.id || nanoid(),
      name: reportName,
      description: reportDescription,
      category: reportCategory as any,
      timeFrame,
      startDate: timeFrame === 'custom' ? startDate || undefined : undefined,
      endDate: timeFrame === 'custom' ? endDate || undefined : undefined,
      metrics,
      dimensions,
      filters,
      chartType,
      sorting,
      limit,
      createdBy: 'current-user', // Replace with actual user ID
      createdAt: initialConfig?.createdAt || new Date(),
      updatedAt: new Date()
    };
  }, [
    initialConfig, reportName, reportDescription, reportCategory, 
    timeFrame, startDate, endDate, metrics, dimensions, filters, 
    chartType, sorting, limit
  ]);

  // Validate the current configuration
  const validate = useCallback(() => {
    const errors: { [key: string]: string } = {};
    
    if (!reportName) errors.reportName = 'Report name is required';
    if (!reportCategory) errors.reportCategory = 'Category is required';
    if (!dataSourceId) errors.dataSourceId = 'Data source is required';
    if (metrics.length === 0) errors.metrics = 'At least one metric is required';
    if (timeFrame === 'custom' && (!startDate || !endDate)) {
      errors.timeFrame = 'Start and end dates are required for custom time frame';
    }
    if (timeFrame === 'custom' && startDate && endDate && startDate > endDate) {
      errors.timeFrame = 'Start date must be before end date';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, [reportName, reportCategory, dataSourceId, metrics, timeFrame, startDate, endDate]);

  return {
    // State
    dataSourceId,
    reportName,
    reportDescription,
    reportCategory,
    timeFrame,
    startDate,
    endDate,
    metrics,
    dimensions,
    filters,
    chartType,
    limit,
    sorting,
    
    // Available options
    availableDataSources,
    selectedDataSource,
    availableFields,
    
    // State setters
    setDataSourceId,
    setReportName,
    setReportDescription,
    setReportCategory,
    setTimeFrame,
    setStartDate,
    setEndDate,
    setChartType,
    setLimit,
    setSorting,
    
    // Actions
    addMetric,
    removeMetric,
    updateMetric,
    addDimension,
    removeDimension,
    updateDimension,
    addFilter,
    removeFilter,
    updateFilter,
    resetConfig,
    generateReportConfig,
    validate
  };
}