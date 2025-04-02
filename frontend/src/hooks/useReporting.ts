import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReportingService, {
  Report,
  Dashboard,
  DataSource,
  ReportFilterParams,
  DashboardFilterParams,
  ReportDimension,
  ReportMetric,
  ReportFilter,
  VisualizationType,
  DashboardWidget,
  DashboardLayout,
  ReportSchedule
} from '@/api/services/reporting.service';

/**
 * Hook for managing data sources
 */
export function useDataSources() {
  const {
    data: dataSources,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['data-sources'],
    queryFn: () => ReportingService.getDataSources()
  });
  
  return {
    dataSources: dataSources || [],
    isLoading,
    error,
    refetch
  };
}

/**
 * Hook for a specific data source
 */
export function useDataSource(dataSourceId: string) {
  const {
    data: dataSource,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['data-source', dataSourceId],
    queryFn: () => ReportingService.getDataSource(dataSourceId),
    enabled: !!dataSourceId
  });
  
  const {
    data: dimensions,
    isLoading: isDimensionsLoading,
    error: dimensionsError,
    refetch: refetchDimensions
  } = useQuery({
    queryKey: ['data-source-dimensions', dataSourceId],
    queryFn: () => ReportingService.getAvailableDimensions(dataSourceId),
    enabled: !!dataSourceId
  });
  
  const {
    data: metrics,
    isLoading: isMetricsLoading,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['data-source-metrics', dataSourceId],
    queryFn: () => ReportingService.getAvailableMetrics(dataSourceId),
    enabled: !!dataSourceId
  });
  
  return {
    dataSource,
    dimensions: dimensions || [],
    metrics: metrics || [],
    isLoading: isLoading || isDimensionsLoading || isMetricsLoading,
    error: error || dimensionsError || metricsError,
    refetch: () => {
      refetch();
      refetchDimensions();
      refetchMetrics();
    }
  };
}

/**
 * Hook for managing reports
 */
export function useReports(filters: ReportFilterParams = {}) {
  const queryClient = useQueryClient();
  
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['reports', filters],
    queryFn: () => ReportingService.getReports(filters)
  });
  
  const createReportMutation = useMutation({
    mutationFn: (reportData: Partial<Report>) => ReportingService.createReport(reportData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
  
  const deleteReportMutation = useMutation({
    mutationFn: (reportId: string) => ReportingService.deleteReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
  
  return {
    reports: data?.items || [],
    totalReports: data?.total || 0,
    pagination: {
      page: data?.page || 1,
      pageSize: data?.pageSize || 10,
      totalPages: data?.totalPages || 1
    },
    isLoading,
    error,
    refetch,
    createReport: createReportMutation.mutateAsync,
    deleteReport: deleteReportMutation.mutateAsync,
    isCreating: createReportMutation.isPending,
    isDeleting: deleteReportMutation.isPending
  };
}

/**
 * Hook for a specific report
 */
export function useReport(reportId: string) {
  const queryClient = useQueryClient();
  
  const {
    data: report,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['report', reportId],
    queryFn: () => ReportingService.getReport(reportId),
    enabled: !!reportId
  });
  
  const updateReportMutation = useMutation({
    mutationFn: (reportData: Partial<Report>) => ReportingService.updateReport(reportId, reportData),
    onSuccess: (updatedReport) => {
      queryClient.invalidateQueries({ queryKey: ['report', reportId] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
  
  const deleteReportMutation = useMutation({
    mutationFn: () => ReportingService.deleteReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
  
  const runReportMutation = useMutation({
    mutationFn: (params: {
      filters?: Record<string, any>;
      timeRange?: { from: string; to: string };
    } = {}) => ReportingService.runReport(reportId, params)
  });
  
  const exportReportMutation = useMutation({
    mutationFn: ({ 
      format, 
      params 
    }: {
      format: 'csv' | 'excel' | 'pdf' | 'json';
      params?: {
        filters?: Record<string, any>;
        timeRange?: { from: string; to: string };
      }
    }) => ReportingService.exportReport(reportId, format, params)
  });
  
  const saveAsTemplateMutation = useMutation({
    mutationFn: (templateData: {
      name: string;
      description?: string;
    }) => ReportingService.saveAsTemplate(reportId, templateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-templates'] });
    }
  });
  
  const scheduleReportMutation = useMutation({
    mutationFn: (scheduleData: Partial<ReportSchedule>) => ReportingService.scheduleReport(reportId, scheduleData),
    onSuccess: (updatedReport) => {
      queryClient.invalidateQueries({ queryKey: ['report', reportId] });
    }
  });
  
  const updateScheduleMutation = useMutation({
    mutationFn: ({ 
      scheduleId, 
      scheduleData 
    }: {
      scheduleId: string;
      scheduleData: Partial<ReportSchedule>
    }) => ReportingService.updateReportSchedule(reportId, scheduleId, scheduleData),
    onSuccess: (updatedReport) => {
      queryClient.invalidateQueries({ queryKey: ['report', reportId] });
    }
  });
  
  const deleteScheduleMutation = useMutation({
    mutationFn: (scheduleId: string) => ReportingService.deleteReportSchedule(reportId, scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report', reportId] });
    }
  });
  
  return {
    report,
    isLoading,
    error,
    refetch,
    updateReport: updateReportMutation.mutateAsync,
    deleteReport: deleteReportMutation.mutateAsync,
    runReport: runReportMutation.mutateAsync,
    exportReport: exportReportMutation.mutateAsync,
    saveAsTemplate: saveAsTemplateMutation.mutateAsync,
    scheduleReport: scheduleReportMutation.mutateAsync,
    updateSchedule: updateScheduleMutation.mutateAsync,
    deleteSchedule: deleteScheduleMutation.mutateAsync,
    isUpdating: updateReportMutation.isPending,
    isDeleting: deleteReportMutation.isPending,
    isRunning: runReportMutation.isPending,
    isExporting: exportReportMutation.isPending,
    isSavingTemplate: saveAsTemplateMutation.isPending,
    isScheduling: scheduleReportMutation.isPending || updateScheduleMutation.isPending || deleteScheduleMutation.isPending,
    reportData: runReportMutation.data,
    exportUrl: exportReportMutation.data?.url
  };
}

/**
 * Hook for report templates
 */
export function useReportTemplates() {
  const {
    data: templates,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['report-templates'],
    queryFn: () => ReportingService.getReportTemplates()
  });
  
  return {
    templates: templates || [],
    isLoading,
    error,
    refetch
  };
}

/**
 * Hook for report visualizations
 */
export function useVisualizations() {
  const {
    data: visualizations,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['visualizations'],
    queryFn: () => ReportingService.getAvailableVisualizations()
  });
  
  return {
    visualizations: visualizations || [],
    isLoading,
    error,
    refetch
  };
}

/**
 * Hook for report builder preview
 */
export function useReportPreview() {
  const previewReportMutation = useMutation({
    mutationFn: (reportConfig: {
      dataSource: string;
      dimensions: ReportDimension[];
      metrics: ReportMetric[];
      filters?: ReportFilter[];
      limit?: number;
    }) => ReportingService.previewReportData(reportConfig)
  });
  
  return {
    previewReport: previewReportMutation.mutateAsync,
    isLoading: previewReportMutation.isPending,
    data: previewReportMutation.data,
    error: previewReportMutation.error
  };
}

/**
 * Hook for managing dashboards
 */
export function useDashboards(filters: DashboardFilterParams = {}) {
  const queryClient = useQueryClient();
  
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboards', filters],
    queryFn: () => ReportingService.getDashboards(filters)
  });
  
  const createDashboardMutation = useMutation({
    mutationFn: (dashboardData: Partial<Dashboard>) => ReportingService.createDashboard(dashboardData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    }
  });
  
  const deleteDashboardMutation = useMutation({
    mutationFn: (dashboardId: string) => ReportingService.deleteDashboard(dashboardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    }
  });
  
  const setDefaultDashboardMutation = useMutation({
    mutationFn: (dashboardId: string) => ReportingService.setDefaultDashboard(dashboardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    }
  });
  
  return {
    dashboards: data?.items || [],
    totalDashboards: data?.total || 0,
    pagination: {
      page: data?.page || 1,
      pageSize: data?.pageSize || 10,
      totalPages: data?.totalPages || 1
    },
    isLoading,
    error,
    refetch,
    createDashboard: createDashboardMutation.mutateAsync,
    deleteDashboard: deleteDashboardMutation.mutateAsync,
    setDefaultDashboard: setDefaultDashboardMutation.mutateAsync,
    isCreating: createDashboardMutation.isPending,
    isDeleting: deleteDashboardMutation.isPending,
    isSettingDefault: setDefaultDashboardMutation.isPending
  };
}

/**
 * Hook for a specific dashboard
 */
export function useDashboard(dashboardId: string) {
  const queryClient = useQueryClient();
  
  const {
    data: dashboard,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboard', dashboardId],
    queryFn: () => ReportingService.getDashboard(dashboardId),
    enabled: !!dashboardId
  });
  
  const updateDashboardMutation = useMutation({
    mutationFn: (dashboardData: Partial<Dashboard>) => ReportingService.updateDashboard(dashboardId, dashboardData),
    onSuccess: (updatedDashboard) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', dashboardId] });
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    }
  });
  
  const deleteDashboardMutation = useMutation({
    mutationFn: () => ReportingService.deleteDashboard(dashboardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    }
  });
  
  const addWidgetMutation = useMutation({
    mutationFn: (widgetData: Partial<DashboardWidget> & { layout: Omit<DashboardLayout, 'i'> }) => 
      ReportingService.addDashboardWidget(dashboardId, widgetData),
    onSuccess: (updatedDashboard) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', dashboardId] });
    }
  });
  
  const updateWidgetMutation = useMutation({
    mutationFn: ({ 
      widgetId, 
      widgetData 
    }: {
      widgetId: string;
      widgetData: Partial<DashboardWidget> & { layout?: Omit<DashboardLayout, 'i'> }
    }) => ReportingService.updateDashboardWidget(dashboardId, widgetId, widgetData),
    onSuccess: (updatedDashboard) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', dashboardId] });
    }
  });
  
  const deleteWidgetMutation = useMutation({
    mutationFn: (widgetId: string) => ReportingService.deleteDashboardWidget(dashboardId, widgetId),
    onSuccess: (updatedDashboard) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', dashboardId] });
    }
  });
  
  const updateLayoutMutation = useMutation({
    mutationFn: (layout: DashboardLayout[]) => ReportingService.updateDashboardLayout(dashboardId, layout),
    onSuccess: (updatedDashboard) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', dashboardId] });
    }
  });
  
  const shareDashboardMutation = useMutation({
    mutationFn: (shareData: {
      isShared: boolean;
      restrictedToUsers?: string[];
    }) => ReportingService.shareDashboard(dashboardId, shareData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', dashboardId] });
    }
  });
  
  const exportDashboardMutation = useMutation({
    mutationFn: (format: 'pdf' = 'pdf') => ReportingService.exportDashboard(dashboardId, format)
  });
  
  const refreshDashboardMutation = useMutation({
    mutationFn: () => ReportingService.refreshDashboard(dashboardId)
  });
  
  const refreshWidgetMutation = useMutation({
    mutationFn: (widgetId: string) => ReportingService.refreshWidget(dashboardId, widgetId)
  });
  
  const cloneDashboardMutation = useMutation({
    mutationFn: (cloneData: {
      name: string;
      description?: string;
    }) => ReportingService.cloneDashboard(dashboardId, cloneData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    }
  });
  
  return {
    dashboard,
    isLoading,
    error,
    refetch,
    updateDashboard: updateDashboardMutation.mutateAsync,
    deleteDashboard: deleteDashboardMutation.mutateAsync,
    addWidget: addWidgetMutation.mutateAsync,
    updateWidget: updateWidgetMutation.mutateAsync,
    deleteWidget: deleteWidgetMutation.mutateAsync,
    updateLayout: updateLayoutMutation.mutateAsync,
    shareDashboard: shareDashboardMutation.mutateAsync,
    exportDashboard: exportDashboardMutation.mutateAsync,
    refreshDashboard: refreshDashboardMutation.mutateAsync,
    refreshWidget: refreshWidgetMutation.mutateAsync,
    cloneDashboard: cloneDashboardMutation.mutateAsync,
    isUpdating: updateDashboardMutation.isPending,
    isDeleting: deleteDashboardMutation.isPending,
    isAddingWidget: addWidgetMutation.isPending,
    isUpdatingWidget: updateWidgetMutation.isPending,
    isDeletingWidget: deleteWidgetMutation.isPending,
    isUpdatingLayout: updateLayoutMutation.isPending,
    isSharing: shareDashboardMutation.isPending,
    isExporting: exportDashboardMutation.isPending,
    isRefreshing: refreshDashboardMutation.isPending || refreshWidgetMutation.isPending,
    isCloning: cloneDashboardMutation.isPending,
    shareUrl: shareDashboardMutation.data?.shareUrl,
    exportUrl: exportDashboardMutation.data?.url,
    widgetData: refreshWidgetMutation.data
  };
}