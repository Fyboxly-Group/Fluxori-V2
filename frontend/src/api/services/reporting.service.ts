import api, { ApiResponse } from '../api-client';
import { PaginationParams, PaginatedResponse } from './user-management.service';

/**
 * Report model
 */
export interface Report {
  id: string;
  name: string;
  description?: string;
  dataSource: DataSource;
  dimensions: ReportDimension[];
  metrics: ReportMetric[];
  filters: ReportFilter[];
  visualization: {
    type: VisualizationType;
    options: Record<string, any>;
  };
  schedule?: ReportSchedule;
  lastRun?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isTemplate: boolean;
  isSystem: boolean;
  viewCount: number;
}

/**
 * Data source for reports
 */
export interface DataSource {
  id: string;
  name: string;
  description?: string;
  type: string;
  fields: DataSourceField[];
}

/**
 * Data source field
 */
export interface DataSourceField {
  id: string;
  name: string;
  description?: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'object';
  isRequired?: boolean;
  isFilterable?: boolean;
  isSortable?: boolean;
  isAggregatable?: boolean;
  options?: string[] | { value: string; label: string }[];
  category?: string;
}

/**
 * Report dimension
 */
export interface ReportDimension {
  id: string;
  field: string;
  name: string;
  dataType: 'string' | 'number' | 'date' | 'boolean';
  dateGranularity?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  sort?: 'asc' | 'desc';
  limit?: number;
}

/**
 * Report metric
 */
export interface ReportMetric {
  id: string;
  field: string;
  name: string;
  dataType: 'number';
  aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'count_distinct' | 'custom';
  customFormula?: string;
  format?: string;
  hasTrend?: boolean;
  compareWithPrevious?: boolean;
}

/**
 * Report filter
 */
export interface ReportFilter {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'greater_than' | 'less_than' | 'between' | 'is_null' | 'is_not_null';
  value?: any;
  values?: any[];
  fromValue?: any;
  toValue?: any;
  isRequired?: boolean;
  isUserSelectable?: boolean;
}

/**
 * Report schedule
 */
export interface ReportSchedule {
  id: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  timeOfDay?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  recipients: ReportRecipient[];
  format: 'pdf' | 'csv' | 'excel' | 'json';
  subject?: string;
  message?: string;
  active: boolean;
  lastSent?: string;
  nextScheduled?: string;
}

/**
 * Report recipient
 */
export interface ReportRecipient {
  id: string;
  email: string;
  name?: string;
  type: 'user' | 'external';
}

/**
 * Visualization type
 */
export type VisualizationType = 
  | 'table' 
  | 'bar_chart' 
  | 'line_chart' 
  | 'pie_chart' 
  | 'area_chart' 
  | 'scatter_plot' 
  | 'map' 
  | 'pivot_table' 
  | 'kpi' 
  | 'gauge' 
  | 'funnel' 
  | 'heatmap';

/**
 * Dashboard model
 */
export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout[];
  filters: ReportFilter[];
  timeRange?: {
    type: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'custom';
    fromDate?: string;
    toDate?: string;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
  isShared: boolean;
  viewCount: number;
}

/**
 * Dashboard widget
 */
export interface DashboardWidget {
  id: string;
  type: 'report' | 'custom' | 'text' | 'iframe';
  title: string;
  reportId?: string;
  customData?: any;
  content?: string;
  url?: string;
  settings: {
    showTitle: boolean;
    showLegend?: boolean;
    showExport?: boolean;
    showExpand?: boolean;
    height?: number;
    backgroundColor?: string;
    refreshInterval?: number;
  };
}

/**
 * Dashboard layout item
 */
export interface DashboardLayout {
  i: string; // widget id
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
}

/**
 * Report filter parameters
 */
export interface ReportFilterParams extends PaginationParams {
  search?: string;
  dataSource?: string;
  createdBy?: string;
  isTemplate?: boolean;
  isSystem?: boolean;
}

/**
 * Dashboard filter parameters
 */
export interface DashboardFilterParams extends PaginationParams {
  search?: string;
  createdBy?: string;
  isShared?: boolean;
}

/**
 * Reporting Service
 * Handles reporting and dashboard operations
 */
const ReportingService = {
  /**
   * Get available data sources
   */
  async getDataSources(): Promise<DataSource[]> {
    const response = await api.get<DataSource[]>('/reporting/data-sources');
    return response.data as DataSource[];
  },

  /**
   * Get a specific data source
   */
  async getDataSource(id: string): Promise<DataSource> {
    const response = await api.get<DataSource>(`/reporting/data-sources/${id}`);
    return response.data as DataSource;
  },

  /**
   * Get paginated list of reports
   */
  async getReports(filters: ReportFilterParams = {}): Promise<PaginatedResponse<Report>> {
    const response = await api.get<PaginatedResponse<Report>>('/reporting/reports', {
      params: filters
    });
    return response.data as PaginatedResponse<Report>;
  },

  /**
   * Get a report by ID
   */
  async getReport(id: string): Promise<Report> {
    const response = await api.get<Report>(`/reporting/reports/${id}`);
    return response.data as Report;
  },

  /**
   * Create a new report
   */
  async createReport(reportData: Partial<Report>): Promise<Report> {
    const response = await api.post<Report>('/reporting/reports', reportData);
    return response.data as Report;
  },

  /**
   * Update a report
   */
  async updateReport(id: string, reportData: Partial<Report>): Promise<Report> {
    const response = await api.put<Report>(`/reporting/reports/${id}`, reportData);
    return response.data as Report;
  },

  /**
   * Delete a report
   */
  async deleteReport(id: string): Promise<ApiResponse> {
    return api.delete(`/reporting/reports/${id}`);
  },

  /**
   * Run a report
   */
  async runReport(
    id: string,
    params: {
      filters?: Record<string, any>;
      timeRange?: { from: string; to: string };
    } = {}
  ): Promise<{
    data: any[];
    dimensions: ReportDimension[];
    metrics: ReportMetric[];
    totals?: Record<string, any>;
  }> {
    const response = await api.post<{
      data: any[];
      dimensions: ReportDimension[];
      metrics: ReportMetric[];
      totals?: Record<string, any>;
    }>(`/reporting/reports/${id}/run`, params);
    
    return response.data as {
      data: any[];
      dimensions: ReportDimension[];
      metrics: ReportMetric[];
      totals?: Record<string, any>;
    };
  },

  /**
   * Export a report
   */
  async exportReport(
    id: string,
    format: 'csv' | 'excel' | 'pdf' | 'json',
    params: {
      filters?: Record<string, any>;
      timeRange?: { from: string; to: string };
    } = {}
  ): Promise<{ url: string }> {
    const response = await api.post<{ url: string }>(`/reporting/reports/${id}/export/${format}`, params);
    return response.data as { url: string };
  },

  /**
   * Save a report as a template
   */
  async saveAsTemplate(id: string, templateData: {
    name: string;
    description?: string;
  }): Promise<Report> {
    const response = await api.post<Report>(`/reporting/reports/${id}/save-as-template`, templateData);
    return response.data as Report;
  },

  /**
   * Schedule a report
   */
  async scheduleReport(id: string, scheduleData: Partial<ReportSchedule>): Promise<Report> {
    const response = await api.post<Report>(`/reporting/reports/${id}/schedule`, scheduleData);
    return response.data as Report;
  },

  /**
   * Update a report schedule
   */
  async updateReportSchedule(id: string, scheduleId: string, scheduleData: Partial<ReportSchedule>): Promise<Report> {
    const response = await api.put<Report>(`/reporting/reports/${id}/schedule/${scheduleId}`, scheduleData);
    return response.data as Report;
  },

  /**
   * Delete a report schedule
   */
  async deleteReportSchedule(id: string, scheduleId: string): Promise<ApiResponse> {
    return api.delete(`/reporting/reports/${id}/schedule/${scheduleId}`);
  },

  /**
   * Get available dimensions for a data source
   */
  async getAvailableDimensions(dataSourceId: string): Promise<ReportDimension[]> {
    const response = await api.get<ReportDimension[]>(`/reporting/data-sources/${dataSourceId}/dimensions`);
    return response.data as ReportDimension[];
  },

  /**
   * Get available metrics for a data source
   */
  async getAvailableMetrics(dataSourceId: string): Promise<ReportMetric[]> {
    const response = await api.get<ReportMetric[]>(`/reporting/data-sources/${dataSourceId}/metrics`);
    return response.data as ReportMetric[];
  },

  /**
   * Get report templates
   */
  async getReportTemplates(): Promise<Report[]> {
    const response = await api.get<Report[]>('/reporting/templates');
    return response.data as Report[];
  },

  /**
   * Preview report data
   */
  async previewReportData(reportConfig: {
    dataSource: string;
    dimensions: ReportDimension[];
    metrics: ReportMetric[];
    filters?: ReportFilter[];
    limit?: number;
  }): Promise<{
    data: any[];
    dimensions: ReportDimension[];
    metrics: ReportMetric[];
  }> {
    const response = await api.post<{
      data: any[];
      dimensions: ReportDimension[];
      metrics: ReportMetric[];
    }>('/reporting/preview', reportConfig);
    
    return response.data as {
      data: any[];
      dimensions: ReportDimension[];
      metrics: ReportMetric[];
    };
  },

  /**
   * Get available visualizations
   */
  async getAvailableVisualizations(): Promise<{
    id: string;
    name: string;
    description: string;
    type: VisualizationType;
    supportedDataTypes: string[];
    options: {
      name: string;
      description: string;
      type: string;
      default?: any;
      required: boolean;
    }[];
  }[]> {
    const response = await api.get<{
      id: string;
      name: string;
      description: string;
      type: VisualizationType;
      supportedDataTypes: string[];
      options: {
        name: string;
        description: string;
        type: string;
        default?: any;
        required: boolean;
      }[];
    }[]>('/reporting/visualizations');
    
    return response.data as {
      id: string;
      name: string;
      description: string;
      type: VisualizationType;
      supportedDataTypes: string[];
      options: {
        name: string;
        description: string;
        type: string;
        default?: any;
        required: boolean;
      }[];
    }[];
  },

  /**
   * Get paginated list of dashboards
   */
  async getDashboards(filters: DashboardFilterParams = {}): Promise<PaginatedResponse<Dashboard>> {
    const response = await api.get<PaginatedResponse<Dashboard>>('/reporting/dashboards', {
      params: filters
    });
    return response.data as PaginatedResponse<Dashboard>;
  },

  /**
   * Get a dashboard by ID
   */
  async getDashboard(id: string): Promise<Dashboard> {
    const response = await api.get<Dashboard>(`/reporting/dashboards/${id}`);
    return response.data as Dashboard;
  },

  /**
   * Create a new dashboard
   */
  async createDashboard(dashboardData: Partial<Dashboard>): Promise<Dashboard> {
    const response = await api.post<Dashboard>('/reporting/dashboards', dashboardData);
    return response.data as Dashboard;
  },

  /**
   * Update a dashboard
   */
  async updateDashboard(id: string, dashboardData: Partial<Dashboard>): Promise<Dashboard> {
    const response = await api.put<Dashboard>(`/reporting/dashboards/${id}`, dashboardData);
    return response.data as Dashboard;
  },

  /**
   * Delete a dashboard
   */
  async deleteDashboard(id: string): Promise<ApiResponse> {
    return api.delete(`/reporting/dashboards/${id}`);
  },

  /**
   * Add a widget to a dashboard
   */
  async addDashboardWidget(
    dashboardId: string,
    widgetData: Partial<DashboardWidget> & { layout: Omit<DashboardLayout, 'i'> }
  ): Promise<Dashboard> {
    const response = await api.post<Dashboard>(`/reporting/dashboards/${dashboardId}/widgets`, widgetData);
    return response.data as Dashboard;
  },

  /**
   * Update a dashboard widget
   */
  async updateDashboardWidget(
    dashboardId: string,
    widgetId: string,
    widgetData: Partial<DashboardWidget> & { layout?: Omit<DashboardLayout, 'i'> }
  ): Promise<Dashboard> {
    const response = await api.put<Dashboard>(`/reporting/dashboards/${dashboardId}/widgets/${widgetId}`, widgetData);
    return response.data as Dashboard;
  },

  /**
   * Delete a dashboard widget
   */
  async deleteDashboardWidget(dashboardId: string, widgetId: string): Promise<Dashboard> {
    const response = await api.delete<Dashboard>(`/reporting/dashboards/${dashboardId}/widgets/${widgetId}`);
    return response.data as Dashboard;
  },

  /**
   * Update dashboard layout
   */
  async updateDashboardLayout(dashboardId: string, layout: DashboardLayout[]): Promise<Dashboard> {
    const response = await api.put<Dashboard>(`/reporting/dashboards/${dashboardId}/layout`, { layout });
    return response.data as Dashboard;
  },

  /**
   * Share a dashboard
   */
  async shareDashboard(
    dashboardId: string,
    shareData: {
      isShared: boolean;
      restrictedToUsers?: string[];
    }
  ): Promise<{ shareUrl?: string }> {
    const response = await api.post<{ shareUrl?: string }>(`/reporting/dashboards/${dashboardId}/share`, shareData);
    return response.data as { shareUrl?: string };
  },

  /**
   * Export a dashboard
   */
  async exportDashboard(
    dashboardId: string,
    format: 'pdf'
  ): Promise<{ url: string }> {
    const response = await api.get<{ url: string }>(`/reporting/dashboards/${dashboardId}/export/${format}`);
    return response.data as { url: string };
  },

  /**
   * Refresh all widgets in a dashboard
   */
  async refreshDashboard(dashboardId: string): Promise<ApiResponse> {
    return api.post(`/reporting/dashboards/${dashboardId}/refresh`);
  },

  /**
   * Refresh a specific widget in a dashboard
   */
  async refreshWidget(dashboardId: string, widgetId: string): Promise<any> {
    const response = await api.post<any>(`/reporting/dashboards/${dashboardId}/widgets/${widgetId}/refresh`);
    return response.data;
  },

  /**
   * Set a dashboard as default
   */
  async setDefaultDashboard(dashboardId: string): Promise<ApiResponse> {
    return api.post(`/reporting/dashboards/${dashboardId}/set-default`);
  },

  /**
   * Clone a dashboard
   */
  async cloneDashboard(
    dashboardId: string,
    cloneData: {
      name: string;
      description?: string;
    }
  ): Promise<Dashboard> {
    const response = await api.post<Dashboard>(`/reporting/dashboards/${dashboardId}/clone`, cloneData);
    return response.data as Dashboard;
  }
};

export default ReportingService;