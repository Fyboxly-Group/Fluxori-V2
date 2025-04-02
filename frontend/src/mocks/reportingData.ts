import {
  ReportCategory,
  ReportConfiguration,
  ReportTemplate,
  SavedReport,
  ScheduledReport,
  ReportResult,
  ReportHistoryItem,
  DataSource,
  Dashboard
} from '@/types/reporting';

// Helper functions for date generation
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// Sample data sources
export const dataSources: DataSource[] = [
  {
    id: 'ds-inventory',
    name: 'Inventory Data',
    description: 'Stock levels, movements, and valuation data',
    category: 'inventory',
    fields: [
      {
        name: 'sku',
        label: 'SKU',
        type: 'string',
        isMetric: false,
        isDimension: true,
        description: 'Stock Keeping Unit'
      },
      {
        name: 'product_name',
        label: 'Product Name',
        type: 'string',
        isMetric: false,
        isDimension: true
      },
      {
        name: 'category',
        label: 'Category',
        type: 'string',
        isMetric: false,
        isDimension: true
      },
      {
        name: 'warehouse',
        label: 'Warehouse',
        type: 'string',
        isMetric: false,
        isDimension: true
      },
      {
        name: 'stock_level',
        label: 'Current Stock',
        type: 'number',
        isMetric: true,
        isDimension: false,
        supportedAggregations: ['sum', 'average', 'min', 'max']
      },
      {
        name: 'reorder_point',
        label: 'Reorder Point',
        type: 'number',
        isMetric: true,
        isDimension: false
      },
      {
        name: 'cost',
        label: 'Cost',
        type: 'number',
        isMetric: true,
        isDimension: false,
        format: 'currency'
      },
      {
        name: 'value',
        label: 'Total Value',
        type: 'number',
        isMetric: true,
        isDimension: false,
        format: 'currency'
      },
      {
        name: 'last_counted',
        label: 'Last Counted',
        type: 'date',
        isMetric: false,
        isDimension: true
      },
      {
        name: 'last_received',
        label: 'Last Received',
        type: 'date',
        isMetric: false,
        isDimension: true
      },
      {
        name: 'last_sold',
        label: 'Last Sold',
        type: 'date',
        isMetric: false,
        isDimension: true
      },
      {
        name: 'days_of_supply',
        label: 'Days of Supply',
        type: 'number',
        isMetric: true,
        isDimension: false
      }
    ],
    lastRefreshed: new Date(),
    refreshRate: 60 // minutes
  },
  {
    id: 'ds-sales',
    name: 'Sales Data',
    description: 'Orders, revenue, and sales performance metrics',
    category: 'sales',
    fields: [
      {
        name: 'order_id',
        label: 'Order ID',
        type: 'string',
        isMetric: false,
        isDimension: true
      },
      {
        name: 'order_date',
        label: 'Order Date',
        type: 'date',
        isMetric: false,
        isDimension: true
      },
      {
        name: 'customer_id',
        label: 'Customer ID',
        type: 'string',
        isMetric: false,
        isDimension: true
      },
      {
        name: 'customer_name',
        label: 'Customer Name',
        type: 'string',
        isMetric: false,
        isDimension: true
      },
      {
        name: 'channel',
        label: 'Channel',
        type: 'string',
        isMetric: false,
        isDimension: true
      },
      {
        name: 'product_id',
        label: 'Product ID',
        type: 'string',
        isMetric: false,
        isDimension: true
      },
      {
        name: 'product_name',
        label: 'Product Name',
        type: 'string',
        isMetric: false,
        isDimension: true
      },
      {
        name: 'category',
        label: 'Category',
        type: 'string',
        isMetric: false,
        isDimension: true
      },
      {
        name: 'quantity',
        label: 'Quantity',
        type: 'number',
        isMetric: true,
        isDimension: false,
        supportedAggregations: ['sum', 'average', 'min', 'max']
      },
      {
        name: 'unit_price',
        label: 'Unit Price',
        type: 'number',
        isMetric: true,
        isDimension: false,
        format: 'currency'
      },
      {
        name: 'discount',
        label: 'Discount',
        type: 'number',
        isMetric: true,
        isDimension: false,
        format: 'currency'
      },
      {
        name: 'total',
        label: 'Total',
        type: 'number',
        isMetric: true,
        isDimension: false,
        format: 'currency'
      },
      {
        name: 'cost',
        label: 'Cost',
        type: 'number',
        isMetric: true,
        isDimension: false,
        format: 'currency'
      },
      {
        name: 'profit',
        label: 'Profit',
        type: 'number',
        isMetric: true,
        isDimension: false,
        format: 'currency'
      },
      {
        name: 'margin',
        label: 'Margin',
        type: 'number',
        isMetric: true,
        isDimension: false,
        format: 'percentage'
      }
    ],
    lastRefreshed: new Date(),
    refreshRate: 30 // minutes
  },
  {
    id: 'ds-buybox',
    name: 'Buy Box Data',
    description: 'Buy Box win rates, pricing, and competitor data',
    category: 'buybox',
    fields: [
      {
        name: 'product_id',
        label: 'Product ID',
        type: 'string',
        isMetric: false,
        isDimension: true
      },
      {
        name: 'product_name',
        label: 'Product Name',
        type: 'string',
        isMetric: false,
        isDimension: true
      },
      {
        name: 'sku',
        label: 'SKU',
        type: 'string',
        isMetric: false,
        isDimension: true
      },
      {
        name: 'marketplace',
        label: 'Marketplace',
        type: 'string',
        isMetric: false,
        isDimension: true
      },
      {
        name: 'date',
        label: 'Date',
        type: 'date',
        isMetric: false,
        isDimension: true
      },
      {
        name: 'your_price',
        label: 'Your Price',
        type: 'number',
        isMetric: true,
        isDimension: false,
        format: 'currency'
      },
      {
        name: 'buy_box_price',
        label: 'Buy Box Price',
        type: 'number',
        isMetric: true,
        isDimension: false,
        format: 'currency'
      },
      {
        name: 'lowest_price',
        label: 'Lowest Price',
        type: 'number',
        isMetric: true,
        isDimension: false,
        format: 'currency'
      },
      {
        name: 'has_buy_box',
        label: 'Has Buy Box',
        type: 'boolean',
        isMetric: true,
        isDimension: true
      },
      {
        name: 'competitor_count',
        label: 'Competitor Count',
        type: 'number',
        isMetric: true,
        isDimension: false
      },
      {
        name: 'win_rate',
        label: 'Win Rate',
        type: 'number',
        isMetric: true,
        isDimension: false,
        format: 'percentage'
      },
      {
        name: 'price_difference',
        label: 'Price Difference',
        type: 'number',
        isMetric: true,
        isDimension: false,
        format: 'currency'
      },
      {
        name: 'price_difference_percent',
        label: 'Price Difference %',
        type: 'number',
        isMetric: true,
        isDimension: false,
        format: 'percentage'
      }
    ],
    lastRefreshed: new Date(),
    refreshRate: 15 // minutes
  }
];

// Sample report templates
export const reportTemplates: ReportTemplate[] = [
  {
    id: 'tpl-inventory-valuation',
    name: 'Inventory Valuation',
    description: 'Total value of inventory by category and warehouse',
    category: 'inventory',
    isSystem: true,
    configuration: {
      id: 'tpl-inventory-valuation',
      name: 'Inventory Valuation',
      description: 'Total value of inventory by category and warehouse',
      category: 'inventory',
      timeFrame: 'month',
      metrics: [
        {
          id: 'metric-1',
          field: 'value',
          aggregation: 'sum',
          label: 'Total Value',
          format: 'currency'
        },
        {
          id: 'metric-2',
          field: 'stock_level',
          aggregation: 'sum',
          label: 'Total Stock',
        }
      ],
      dimensions: [
        {
          id: 'dim-1',
          field: 'category',
          label: 'Category',
          groupBy: true
        },
        {
          id: 'dim-2',
          field: 'warehouse',
          label: 'Warehouse',
          groupBy: true
        }
      ],
      filters: [],
      chartType: 'bar',
      sorting: {
        field: 'value',
        direction: 'desc'
      },
      limit: 20,
      createdBy: 'system',
      createdAt: new Date(2025, 0, 1),
      updatedAt: new Date(2025, 0, 1)
    } as ReportConfiguration
  },
  {
    id: 'tpl-sales-by-channel',
    name: 'Sales by Channel',
    description: 'Sales breakdown by channel over time',
    category: 'sales',
    isSystem: true,
    configuration: {
      id: 'tpl-sales-by-channel',
      name: 'Sales by Channel',
      description: 'Sales breakdown by channel over time',
      category: 'sales',
      timeFrame: 'month',
      metrics: [
        {
          id: 'metric-1',
          field: 'total',
          aggregation: 'sum',
          label: 'Total Sales',
          format: 'currency'
        }
      ],
      dimensions: [
        {
          id: 'dim-1',
          field: 'channel',
          label: 'Channel',
          groupBy: true
        },
        {
          id: 'dim-2',
          field: 'order_date',
          label: 'Date',
          groupBy: true
        }
      ],
      filters: [],
      chartType: 'line',
      sorting: {
        field: 'order_date',
        direction: 'asc'
      },
      createdBy: 'system',
      createdAt: new Date(2025, 0, 1),
      updatedAt: new Date(2025, 0, 1)
    } as ReportConfiguration
  },
  {
    id: 'tpl-buybox-win-rate',
    name: 'Buy Box Win Rate',
    description: 'Buy Box win rate by marketplace over time',
    category: 'buybox',
    isSystem: true,
    configuration: {
      id: 'tpl-buybox-win-rate',
      name: 'Buy Box Win Rate',
      description: 'Buy Box win rate by marketplace over time',
      category: 'buybox',
      timeFrame: 'month',
      metrics: [
        {
          id: 'metric-1',
          field: 'win_rate',
          aggregation: 'average',
          label: 'Win Rate',
          format: 'percentage'
        }
      ],
      dimensions: [
        {
          id: 'dim-1',
          field: 'marketplace',
          label: 'Marketplace',
          groupBy: true
        },
        {
          id: 'dim-2',
          field: 'date',
          label: 'Date',
          groupBy: true
        }
      ],
      filters: [],
      chartType: 'line',
      sorting: {
        field: 'date',
        direction: 'asc'
      },
      createdBy: 'system',
      createdAt: new Date(2025, 0, 1),
      updatedAt: new Date(2025, 0, 1)
    } as ReportConfiguration
  }
];

// Sample saved reports
export const savedReports: SavedReport[] = [
  {
    id: 'report-1',
    name: 'Monthly Inventory Valuation',
    description: 'Value of inventory by category for the current month',
    category: 'inventory',
    configuration: {
      ...reportTemplates[0].configuration,
      id: 'report-1',
      name: 'Monthly Inventory Valuation',
      description: 'Value of inventory by category for the current month'
    } as ReportConfiguration,
    lastGeneratedAt: daysAgo(1),
    createdBy: 'user1',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(1),
    favorited: true,
    timesViewed: 12
  },
  {
    id: 'report-2',
    name: 'Quarterly Sales Analysis',
    description: 'Sales breakdown by channel for Q1 2025',
    category: 'sales',
    configuration: {
      ...reportTemplates[1].configuration,
      id: 'report-2',
      name: 'Quarterly Sales Analysis',
      description: 'Sales breakdown by channel for Q1 2025',
      timeFrame: 'quarter',
      startDate: new Date(2025, 0, 1),
      endDate: new Date(2025, 2, 31)
    } as ReportConfiguration,
    lastGeneratedAt: daysAgo(3),
    createdBy: 'user1',
    createdAt: daysAgo(45),
    updatedAt: daysAgo(3),
    favorited: false,
    timesViewed: 8
  },
  {
    id: 'report-3',
    name: 'Amazon Buy Box Performance',
    description: 'Buy Box win rate for Amazon products over the last 6 months',
    category: 'buybox',
    configuration: {
      ...reportTemplates[2].configuration,
      id: 'report-3',
      name: 'Amazon Buy Box Performance',
      description: 'Buy Box win rate for Amazon products over the last 6 months',
      timeFrame: 'custom',
      startDate: daysAgo(180),
      endDate: new Date(),
      filters: [
        {
          id: 'filter-1',
          field: 'marketplace',
          operator: 'equals',
          value: 'amazon',
          fieldType: 'text',
          label: 'Marketplace'
        }
      ]
    } as ReportConfiguration,
    lastGeneratedAt: daysAgo(2),
    createdBy: 'user1',
    createdAt: daysAgo(15),
    updatedAt: daysAgo(2),
    favorited: true,
    timesViewed: 24
  }
];

// Sample scheduled reports
export const scheduledReports: ScheduledReport[] = [
  {
    id: 'schedule-1',
    reportId: 'report-1',
    reportName: 'Monthly Inventory Valuation',
    schedule: {
      enabled: true,
      frequency: 'monthly',
      dayOfMonth: 1,
      time: '06:00',
      timezone: 'UTC',
      recipients: ['admin@example.com', 'inventory@example.com'],
      deliveryMethod: 'email',
      exportFormat: 'excel'
    },
    lastRunAt: daysAgo(1),
    nextRunAt: new Date(new Date().setMonth(new Date().getMonth() + 1, 1)),
    status: 'active',
    createdBy: 'user1',
    createdAt: daysAgo(60),
    updatedAt: daysAgo(1)
  },
  {
    id: 'schedule-2',
    reportId: 'report-2',
    reportName: 'Quarterly Sales Analysis',
    schedule: {
      enabled: true,
      frequency: 'quarterly',
      dayOfMonth: 5,
      time: '08:00',
      timezone: 'UTC',
      recipients: ['admin@example.com', 'sales@example.com'],
      deliveryMethod: 'email',
      exportFormat: 'pdf'
    },
    lastRunAt: daysAgo(5),
    nextRunAt: new Date(new Date().setMonth(Math.floor(new Date().getMonth() / 3) * 3 + 3, 5)),
    status: 'active',
    createdBy: 'user1',
    createdAt: daysAgo(90),
    updatedAt: daysAgo(5)
  },
  {
    id: 'schedule-3',
    reportId: 'report-3',
    reportName: 'Amazon Buy Box Performance',
    schedule: {
      enabled: false,
      frequency: 'weekly',
      dayOfWeek: 1, // Monday
      time: '07:00',
      timezone: 'UTC',
      recipients: ['admin@example.com', 'buybox@example.com'],
      deliveryMethod: 'email',
      exportFormat: 'excel'
    },
    lastRunAt: daysAgo(5),
    nextRunAt: undefined,
    status: 'paused',
    errorMessage: 'Schedule paused by user',
    createdBy: 'user1',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5)
  }
];

// Generate sample report data
const generateReportData = (reportId: string): ReportResult => {
  const report = savedReports.find(r => r.id === reportId);
  if (!report) {
    throw new Error(`Report with ID ${reportId} not found`);
  }

  // Generate different data based on report category
  switch (report.category) {
    case 'inventory':
      return {
        id: `result-${reportId}`,
        configuration: report.configuration,
        dataset: {
          labels: ['Electronics', 'Clothing', 'Home Goods', 'Sporting Goods', 'Office Supplies'],
          series: [
            {
              id: 'series-1',
              label: 'Total Value',
              data: [143500, 98700, 76200, 54300, 32100],
              color: '#4dabf7'
            },
            {
              id: 'series-2',
              label: 'Total Stock',
              data: [1240, 3450, 890, 670, 1230],
              color: '#37b24d'
            }
          ],
          metadata: {
            categories: ['Electronics', 'Clothing', 'Home Goods', 'Sporting Goods', 'Office Supplies'],
            warehouses: ['Main', 'East', 'West', 'South']
          }
        },
        summary: {
          total: 404800,
          average: 80960,
          min: 32100,
          max: 143500,
          count: 5
        },
        generatedAt: new Date(),
        processingTimeMs: 234,
        cacheHit: false
      };
      
    case 'sales':
      return {
        id: `result-${reportId}`,
        configuration: report.configuration,
        dataset: {
          labels: ['January', 'February', 'March', 'April', 'May', 'June'],
          series: [
            {
              id: 'series-1',
              label: 'Web',
              data: [42500, 48700, 53200, 61300, 59100, 72400],
              color: '#4dabf7'
            },
            {
              id: 'series-2',
              label: 'Marketplace',
              data: [54200, 61500, 58900, 67200, 71300, 83400],
              color: '#f03e3e'
            },
            {
              id: 'series-3',
              label: 'Wholesale',
              data: [32100, 35600, 38200, 41500, 43700, 48200],
              color: '#37b24d'
            }
          ],
          metadata: {
            channels: ['Web', 'Marketplace', 'Wholesale'],
            months: ['January', 'February', 'March', 'April', 'May', 'June']
          }
        },
        summary: {
          total: 973800,
          average: 54100,
          min: 32100,
          max: 83400,
          count: 18
        },
        generatedAt: new Date(),
        processingTimeMs: 312,
        cacheHit: false
      };
      
    case 'buybox':
      return {
        id: `result-${reportId}`,
        configuration: report.configuration,
        dataset: {
          labels: ['January', 'February', 'March', 'April', 'May', 'June'],
          series: [
            {
              id: 'series-1',
              label: 'Amazon',
              data: [0.78, 0.81, 0.79, 0.82, 0.84, 0.86],
              color: '#f59f00'
            }
          ],
          metadata: {
            marketplace: 'Amazon',
            totalProducts: 124
          }
        },
        summary: {
          total: 4.9,
          average: 0.82,
          min: 0.78,
          max: 0.86,
          count: 6
        },
        generatedAt: new Date(),
        processingTimeMs: 156,
        cacheHit: false
      };
      
    default:
      return {
        id: `result-${reportId}`,
        configuration: report.configuration,
        dataset: {
          labels: ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5'],
          series: [
            {
              id: 'series-1',
              label: 'Series 1',
              data: [100, 200, 300, 400, 500],
              color: '#4dabf7'
            }
          ]
        },
        summary: {
          total: 1500,
          average: 300,
          min: 100,
          max: 500,
          count: 5
        },
        generatedAt: new Date(),
        processingTimeMs: 123,
        cacheHit: false
      };
  }
};

// Generate sample report results
export const reportResults = Object.fromEntries(
  savedReports.map(report => [report.id, generateReportData(report.id)])
);

// Sample report history
export const reportHistory: ReportHistoryItem[] = [
  {
    id: 'history-1',
    reportId: 'report-1',
    reportName: 'Monthly Inventory Valuation',
    generatedAt: daysAgo(1),
    generatedBy: 'user1',
    processingTimeMs: 234,
    exportFormat: 'excel',
    deliveryMethod: 'email',
    deliveryStatus: 'success',
    fileSize: 156000,
    downloadUrl: '/api/reports/download/history-1'
  },
  {
    id: 'history-2',
    reportId: 'report-1',
    reportName: 'Monthly Inventory Valuation',
    generatedAt: daysAgo(31),
    generatedBy: 'scheduler',
    processingTimeMs: 201,
    exportFormat: 'excel',
    deliveryMethod: 'email',
    deliveryStatus: 'success',
    fileSize: 143000,
    downloadUrl: '/api/reports/download/history-2'
  },
  {
    id: 'history-3',
    reportId: 'report-2',
    reportName: 'Quarterly Sales Analysis',
    generatedAt: daysAgo(3),
    generatedBy: 'user1',
    processingTimeMs: 312,
    exportFormat: 'pdf',
    deliveryMethod: 'download',
    deliveryStatus: 'success',
    fileSize: 245000,
    downloadUrl: '/api/reports/download/history-3'
  },
  {
    id: 'history-4',
    reportId: 'report-3',
    reportName: 'Amazon Buy Box Performance',
    generatedAt: daysAgo(2),
    generatedBy: 'user1',
    processingTimeMs: 156,
    exportFormat: 'excel',
    deliveryMethod: 'download',
    deliveryStatus: 'success',
    fileSize: 128000,
    downloadUrl: '/api/reports/download/history-4'
  },
  {
    id: 'history-5',
    reportId: 'report-3',
    reportName: 'Amazon Buy Box Performance',
    generatedAt: daysAgo(9),
    generatedBy: 'scheduler',
    processingTimeMs: 179,
    exportFormat: 'excel',
    deliveryMethod: 'email',
    deliveryStatus: 'error',
    errorMessage: 'Failed to send email: recipient mailbox full',
    fileSize: 132000,
    downloadUrl: '/api/reports/download/history-5'
  }
];

// Sample dashboards
export const dashboards: Dashboard[] = [
  {
    id: 'dashboard-1',
    name: 'Executive Overview',
    description: 'High-level metrics for executive team',
    widgets: [
      {
        id: 'widget-1',
        type: 'metric',
        title: 'Total Inventory Value',
        configuration: {
          metric: 'value',
          aggregation: 'sum',
          format: 'currency',
          comparison: 'previous_period',
          dataSource: 'ds-inventory'
        },
        size: 'small',
        position: { x: 0, y: 0, w: 1, h: 1 }
      },
      {
        id: 'widget-2',
        type: 'metric',
        title: 'Monthly Sales',
        configuration: {
          metric: 'total',
          aggregation: 'sum',
          format: 'currency',
          comparison: 'previous_period',
          dataSource: 'ds-sales'
        },
        size: 'small',
        position: { x: 1, y: 0, w: 1, h: 1 }
      },
      {
        id: 'widget-3',
        type: 'metric',
        title: 'Buy Box Win Rate',
        configuration: {
          metric: 'win_rate',
          aggregation: 'average',
          format: 'percentage',
          comparison: 'previous_period',
          dataSource: 'ds-buybox'
        },
        size: 'small',
        position: { x: 2, y: 0, w: 1, h: 1 }
      },
      {
        id: 'widget-4',
        type: 'chart',
        title: 'Sales by Channel',
        reportId: 'report-2',
        configuration: {
          chartType: 'line',
          dimensions: ['channel', 'order_date'],
          metrics: ['total'],
          limit: 6
        },
        size: 'large',
        position: { x: 0, y: 1, w: 2, h: 2 }
      },
      {
        id: 'widget-5',
        type: 'chart',
        title: 'Buy Box Performance',
        reportId: 'report-3',
        configuration: {
          chartType: 'line',
          dimensions: ['marketplace', 'date'],
          metrics: ['win_rate'],
          limit: 6
        },
        size: 'medium',
        position: { x: 2, y: 1, w: 1, h: 2 }
      }
    ],
    filters: [
      {
        id: 'filter-1',
        field: 'date',
        operator: 'between',
        value: [daysAgo(30), new Date()],
        fieldType: 'date',
        label: 'Date Range'
      }
    ],
    timeFrame: 'month',
    createdBy: 'user1',
    createdAt: daysAgo(90),
    updatedAt: daysAgo(5),
    isDefault: true,
    isShared: true,
    sharedWith: ['user2', 'user3']
  },
  {
    id: 'dashboard-2',
    name: 'Inventory Management',
    description: 'Detailed inventory metrics and KPIs',
    widgets: [
      {
        id: 'widget-1',
        type: 'metric',
        title: 'Total Stock Count',
        configuration: {
          metric: 'stock_level',
          aggregation: 'sum',
          format: 'number',
          comparison: 'previous_period',
          dataSource: 'ds-inventory'
        },
        size: 'small',
        position: { x: 0, y: 0, w: 1, h: 1 }
      },
      {
        id: 'widget-2',
        type: 'metric',
        title: 'Low Stock Items',
        configuration: {
          metric: 'count',
          filter: {
            field: 'stock_level',
            operator: 'lessThan',
            value: 'reorder_point'
          },
          format: 'number',
          comparison: 'previous_period',
          dataSource: 'ds-inventory'
        },
        size: 'small',
        position: { x: 1, y: 0, w: 1, h: 1 }
      },
      {
        id: 'widget-3',
        type: 'chart',
        title: 'Inventory Value by Category',
        reportId: 'report-1',
        configuration: {
          chartType: 'bar',
          dimensions: ['category'],
          metrics: ['value'],
          sorting: { field: 'value', direction: 'desc' },
          limit: 10
        },
        size: 'large',
        position: { x: 0, y: 1, w: 2, h: 2 }
      },
      {
        id: 'widget-4',
        type: 'table',
        title: 'Low Stock Items',
        configuration: {
          dataSource: 'ds-inventory',
          columns: [
            { field: 'sku', label: 'SKU' },
            { field: 'product_name', label: 'Product' },
            { field: 'stock_level', label: 'Current Stock' },
            { field: 'reorder_point', label: 'Reorder Point' }
          ],
          filter: {
            field: 'stock_level',
            operator: 'lessThan',
            value: 'reorder_point'
          },
          sorting: { field: 'stock_level', direction: 'asc' },
          limit: 10
        },
        size: 'medium',
        position: { x: 2, y: 0, w: 1, h: 3 }
      }
    ],
    filters: [
      {
        id: 'filter-1',
        field: 'warehouse',
        operator: 'equals',
        value: 'Main',
        fieldType: 'select',
        label: 'Warehouse',
        options: [
          { label: 'Main', value: 'Main' },
          { label: 'East', value: 'East' },
          { label: 'West', value: 'West' },
          { label: 'South', value: 'South' }
        ]
      }
    ],
    timeFrame: 'custom',
    startDate: daysAgo(30),
    endDate: new Date(),
    createdBy: 'user1',
    createdAt: daysAgo(60),
    updatedAt: daysAgo(2),
    isDefault: false,
    isShared: false
  }
];