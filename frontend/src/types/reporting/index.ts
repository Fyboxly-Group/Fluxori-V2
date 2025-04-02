/**
 * Types for reporting and analytics components
 */

/**
 * Report timeframe options
 */
export type ReportTimeFrame = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

/**
 * Report chart type options
 */
export type ReportChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'radar' | 'table';

/**
 * Report data aggregation method
 */
export type AggregationMethod = 'sum' | 'average' | 'count' | 'min' | 'max' | 'median';

/**
 * Report data category
 */
export type ReportCategory = 
  | 'sales' 
  | 'inventory' 
  | 'purchasing' 
  | 'marketplace' 
  | 'fulfillment' 
  | 'financial' 
  | 'customer' 
  | 'supplier' 
  | 'buybox';

/**
 * Report export format
 */
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json';

/**
 * Report delivery method
 */
export type DeliveryMethod = 'email' | 'download' | 'api' | 'webhook';

/**
 * Report schedule frequency
 */
export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';

/**
 * Report filter comparison operators
 */
export type FilterOperator = 
  | 'equals' 
  | 'notEquals' 
  | 'greaterThan' 
  | 'lessThan' 
  | 'contains' 
  | 'notContains' 
  | 'startsWith' 
  | 'endsWith'
  | 'between'
  | 'in'
  | 'notIn';

/**
 * Report filter field type
 */
export type FilterFieldType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiSelect';

/**
 * Report filter configuration
 */
export interface ReportFilter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string | number | boolean | Date | Array<string | number>;
  fieldType: FilterFieldType;
  label?: string;
  options?: Array<{label: string; value: string | number}>;
}

/**
 * Report metric configuration
 */
export interface ReportMetric {
  id: string;
  field: string;
  aggregation: AggregationMethod;
  label: string;
  format?: string;
  color?: string;
}

/**
 * Report dimension configuration
 */
export interface ReportDimension {
  id: string;
  field: string;
  label: string;
  sortOrder?: 'asc' | 'desc';
  groupBy?: boolean;
}

/**
 * Report configuration
 */
export interface ReportConfiguration {
  id: string;
  name: string;
  description?: string;
  category: ReportCategory;
  timeFrame: ReportTimeFrame;
  startDate?: Date;
  endDate?: Date;
  metrics: ReportMetric[];
  dimensions: ReportDimension[];
  filters: ReportFilter[];
  chartType: ReportChartType;
  sorting?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  limit?: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isTemplate?: boolean;
  schedule?: {
    enabled: boolean;
    frequency: ScheduleFrequency;
    dayOfWeek?: number;
    dayOfMonth?: number;
    time?: string;
    timezone?: string;
    recipients?: string[];
    deliveryMethod: DeliveryMethod;
    exportFormat: ExportFormat;
  };
}

/**
 * Report data series
 */
export interface ReportDataSeries {
  id: string;
  label: string;
  data: number[];
  color?: string;
}

/**
 * Report dataset
 */
export interface ReportDataset {
  labels: string[];
  series: ReportDataSeries[];
  metadata?: Record<string, any>;
}

/**
 * Report result
 */
export interface ReportResult {
  id: string;
  configuration: ReportConfiguration;
  dataset: ReportDataset;
  summary?: {
    total: number;
    average: number;
    min: number;
    max: number;
    count: number;
  };
  generatedAt: Date;
  processingTimeMs: number;
  cacheHit?: boolean;
}

/**
 * Saved report
 */
export interface SavedReport {
  id: string;
  name: string;
  description?: string;
  category: ReportCategory;
  configuration: ReportConfiguration;
  lastGeneratedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  favorited: boolean;
  timesViewed: number;
}

/**
 * Report template
 */
export interface ReportTemplate extends Omit<SavedReport, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'favorited' | 'timesViewed'> {
  id: string;
  isSystem: boolean;
}

/**
 * Scheduled report
 */
export interface ScheduledReport {
  id: string;
  reportId: string;
  reportName: string;
  schedule: NonNullable<ReportConfiguration['schedule']>;
  lastRunAt?: Date;
  nextRunAt?: Date;
  status: 'active' | 'paused' | 'error';
  errorMessage?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Report history item
 */
export interface ReportHistoryItem {
  id: string;
  reportId: string;
  reportName: string;
  generatedAt: Date;
  generatedBy: string;
  processingTimeMs: number;
  exportFormat?: ExportFormat;
  deliveryMethod?: DeliveryMethod;
  deliveryStatus: 'success' | 'error';
  errorMessage?: string;
  fileSize?: number;
  downloadUrl?: string;
}

/**
 * Dashboard widget types
 */
export type WidgetType = 'chart' | 'metric' | 'table' | 'filter';

/**
 * Dashboard widget configuration
 */
export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  reportId?: string;
  configuration: any;
  size: 'small' | 'medium' | 'large';
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

/**
 * Dashboard configuration
 */
export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  filters?: ReportFilter[];
  timeFrame?: ReportTimeFrame;
  startDate?: Date;
  endDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
  isShared?: boolean;
  sharedWith?: string[];
}

/**
 * Data source field definition
 */
export interface DataSourceField {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'object' | 'array';
  isMetric: boolean;
  isDimension: boolean;
  supportedAggregations?: AggregationMethod[];
  description?: string;
  category?: string;
  format?: string;
  path?: string;
}

/**
 * Data source definition
 */
export interface DataSource {
  id: string;
  name: string;
  description?: string;
  fields: DataSourceField[];
  category: ReportCategory;
  endpoint?: string;
  refreshRate?: number;
  lastRefreshed?: Date;
}

/**
 * Report export job
 */
export interface ReportExportJob {
  id: string;
  reportId: string;
  format: ExportFormat;
  status: 'pending' | 'processing' | 'completed' | 'error';
  startedAt: Date;
  completedAt?: Date;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  errorMessage?: string;
  createdBy: string;
}