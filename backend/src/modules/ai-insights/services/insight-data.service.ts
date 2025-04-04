import * as mongoose from 'mongoose';
import { ApiError } from '../../../utils/error.utils';
import { Types } from 'mongoose';

/**
 * Available data source types
 */
export enum DataSourceType {
  INVENTORY = 'inventory',
  SALES = 'sales',
  ORDERS = 'orders',
  PRODUCTS = 'products',
  CUSTOMERS = 'customers',
  SHIPPING = 'shipping',
  MARKETPLACE = 'marketplace'
}

/**
 * Data context for insight generation
 */
export interface IDataContext {
  data: Record<string, any>;
  sources?: string[];
  timeRange?: {
    start: Date;
    end: Date;
  };
  metadata?: Record<string, any>;
}

/**
 * Service for retrieving and preparing data for AI insights
 */
export class InsightDataService {
  /**
   * Get data for a specific insight type
   * @param insightType The type of insight to generate
   * @param contextData Additional context data provided by the user
   * @param organizationId The organization ID
   * @returns Structured data context for the insight
   */
  async getDataForInsight(
    insightType: string,
    contextData: Record<string, any>,
    organizationId: string
  ): Promise<IDataContext> {
    try {
      // Determine what data sources are needed for this insight type
      const dataSources = this.getDataSourcesForInsightType(insightType);
      
      // Determine time range if not provided
      const timeRange = contextData.timeRange ? {
        start: new Date(contextData.timeRange.start),
        end: new Date(contextData.timeRange.end)
      } : this.getDefaultTimeRange(insightType);
      
      // Retrieve data from each source
      const data: Record<string, any> = {};
      const sources: string[] = [];
      
      for (const source of dataSources) {
        const sourceData = await this.getDataFromSource(
          source, 
          organizationId, 
          timeRange,
          contextData
        );
        
        if (sourceData && Object.keys(sourceData).length > 0) {
          data[source] = sourceData;
          sources.push(source);
        }
      }
      
      // Combine with context data
      const result: IDataContext = {
        data: {
          ...data,
          contextData: this.sanitizeContextData(contextData)
        },
        sources,
        timeRange,
        metadata: {
          insightType,
          generatedAt: new Date(),
          organizationId
        }
      };
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, `Error getting data for insight: ${errorMessage}`);
    }
  }
  
  /**
   * Get data sources needed for a specific insight type
   */
  private getDataSourcesForInsightType(insightType: string): DataSourceType[] {
    // Mapping of insight types to required data sources
    const insightDataSourceMap: Record<string, DataSourceType[]> = {
      'inventory_analysis': [DataSourceType.INVENTORY, DataSourceType.PRODUCTS],
      'sales_performance': [DataSourceType.SALES, DataSourceType.PRODUCTS, DataSourceType.CUSTOMERS],
      'customer_insights': [DataSourceType.CUSTOMERS, DataSourceType.ORDERS, DataSourceType.SALES],
      'marketplace_analysis': [DataSourceType.MARKETPLACE, DataSourceType.SALES, DataSourceType.PRODUCTS],
      'shipping_optimization': [DataSourceType.SHIPPING, DataSourceType.ORDERS],
      'product_performance': [DataSourceType.PRODUCTS, DataSourceType.SALES, DataSourceType.INVENTORY]
    };
    
    // Return data sources for the insight type or default to all sources
    return insightDataSourceMap[insightType.toLowerCase()] || Object.values(DataSourceType);
  }
  
  /**
   * Get default time range for an insight type
   */
  private getDefaultTimeRange(insightType: string): { start: Date; end: Date } {
    const end = new Date();
    let start: Date;
    
    // Determine appropriate time range based on insight type
    switch (insightType.toLowerCase()) {
      case 'daily_report':
        // Last 24 hours
        start = new Date(end);
        start.setDate(end.getDate() - 1);
        break;
      case 'weekly_analysis':
        // Last 7 days
        start = new Date(end);
        start.setDate(end.getDate() - 7);
        break;
      case 'monthly_summary':
        // Last 30 days
        start = new Date(end);
        start.setDate(end.getDate() - 30);
        break;
      case 'quarterly_report':
        // Last 90 days
        start = new Date(end);
        start.setDate(end.getDate() - 90);
        break;
      default:
        // Default to last 30 days
        start = new Date(end);
        start.setDate(end.getDate() - 30);
    }
    
    return { start, end };
  }
  
  /**
   * Get data from a specific source
   */
  private async getDataFromSource(
    source: DataSourceType,
    organizationId: string,
    timeRange: { start: Date; end: Date },
    contextData: Record<string, any>
  ): Promise<Record<string, any>> {
    try {
      const orgId = new Types.ObjectId(organizationId);
      
      switch (source) {
        case DataSourceType.INVENTORY:
          return await this.getInventoryData(orgId, timeRange, contextData);
        case DataSourceType.SALES:
          return await this.getSalesData(orgId, timeRange, contextData);
        case DataSourceType.ORDERS:
          return await this.getOrdersData(orgId, timeRange, contextData);
        case DataSourceType.PRODUCTS:
          return await this.getProductsData(orgId, contextData);
        case DataSourceType.CUSTOMERS:
          return await this.getCustomersData(orgId, timeRange, contextData);
        case DataSourceType.SHIPPING:
          return await this.getShippingData(orgId, timeRange, contextData);
        case DataSourceType.MARKETPLACE:
          return await this.getMarketplaceData(orgId, timeRange, contextData);
        default:
          return {};
      }
    } catch (error) {
      console.error(`Error getting data from source ${source}:`, error);
      return {}; // Return empty object on error
    }
  }
  
  /**
   * Remove sensitive fields from context data
   */
  private sanitizeContextData(contextData: Record<string, any>): Record<string, any> {
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'api_key', 'key', 'credentials'];
    const sanitized = { ...contextData };
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        delete sanitized[field];
      }
    }
    
    return sanitized;
  }
  
  /**
   * Get inventory data
   */
  private async getInventoryData(
    organizationId: Types.ObjectId,
    timeRange: { start: Date; end: Date },
    contextData: Record<string, any>
  ): Promise<Record<string, any>> {
    // Implementation placeholder - would retrieve actual inventory data
    return {
      summary: {
        totalItems: 1250,
        totalValue: 125000,
        lowStockItems: 45,
        outOfStockItems: 12
      },
      topCategories: [
        { name: 'Electronics', count: 350, value: 52500 },
        { name: 'Clothing', count: 425, value: 31875 },
        { name: 'Home & Garden', count: 275, value: 27500 }
      ],
      warehouseDistribution: [
        { name: 'Main Warehouse', count: 850, value: 85000 },
        { name: 'Secondary Warehouse', count: 400, value: 40000 }
      ],
      recentMovements: [
        { date: new Date(), type: 'in', quantity: 50, productId: '1' },
        { date: new Date(), type: 'out', quantity: 25, productId: '2' }
      ]
    };
  }
  
  /**
   * Get sales data
   */
  private async getSalesData(
    organizationId: Types.ObjectId,
    timeRange: { start: Date; end: Date },
    contextData: Record<string, any>
  ): Promise<Record<string, any>> {
    // Implementation placeholder
    return {
      summary: {
        totalSales: 152500,
        totalOrders: 1250,
        averageOrderValue: 122
      },
      trends: {
        dailySales: [
          { date: '2025-03-01', sales: 4500 },
          { date: '2025-03-02', sales: 5200 }
          // More dates would be here
        ],
        weeklySales: [
          { week: '2025-W09', sales: 32500 },
          { week: '2025-W10', sales: 35750 }
          // More weeks would be here
        ]
      },
      topProducts: [
        { productId: '1', name: 'Product 1', sales: 25000, quantity: 250 },
        { productId: '2', name: 'Product 2', sales: 18750, quantity: 125 }
      ],
      marketplaceBreakdown: [
        { marketplace: 'Amazon', sales: 62500, percentage: 41 },
        { marketplace: 'Shopify', sales: 45000, percentage: 29.5 },
        { marketplace: 'Takealot', sales: 45000, percentage: 29.5 }
      ]
    };
  }
  
  /**
   * Get orders data
   */
  private async getOrdersData(
    organizationId: Types.ObjectId,
    timeRange: { start: Date; end: Date },
    contextData: Record<string, any>
  ): Promise<Record<string, any>> {
    // Implementation placeholder
    return {
      summary: {
        totalOrders: 1250,
        pendingOrders: 75,
        shippingOrders: 125,
        completedOrders: 1050
      },
      trends: {
        dailyOrders: [
          { date: '2025-03-01', count: 35 },
          { date: '2025-03-02', count: 42 }
          // More dates would be here
        ]
      },
      fulfillmentPerformance: {
        averageTimeToShip: 1.2, // days
        lateShipments: 35,
        onTimePercentage: 97.2
      },
      orderSources: [
        { source: 'Amazon', count: 525, percentage: 42 },
        { source: 'Shopify', count: 375, percentage: 30 },
        { source: 'Takealot', count: 350, percentage: 28 }
      ]
    };
  }
  
  /**
   * Get products data
   */
  private async getProductsData(
    organizationId: Types.ObjectId,
    contextData: Record<string, any>
  ): Promise<Record<string, any>> {
    // Implementation placeholder
    return {
      summary: {
        totalProducts: 750,
        activeProducts: 625,
        inactiveProducts: 125
      },
      categories: [
        { name: 'Electronics', count: 200 },
        { name: 'Clothing', count: 250 },
        { name: 'Home & Garden', count: 175 }
      ],
      topPerformers: [
        { productId: '1', name: 'Product 1', revenue: 25000, profit: 10000 },
        { productId: '2', name: 'Product 2', revenue: 18750, profit: 7500 }
      ],
      lowPerformers: [
        { productId: '749', name: 'Product 749', revenue: 250, profit: 50 },
        { productId: '750', name: 'Product 750', revenue: 125, profit: 25 }
      ]
    };
  }
  
  /**
   * Get customers data
   */
  private async getCustomersData(
    organizationId: Types.ObjectId,
    timeRange: { start: Date; end: Date },
    contextData: Record<string, any>
  ): Promise<Record<string, any>> {
    // Implementation placeholder
    return {
      summary: {
        totalCustomers: 5000,
        newCustomers: 350,
        returningCustomers: 1250
      },
      demographics: {
        regions: [
          { name: 'North America', count: 2500 },
          { name: 'Europe', count: 1500 },
          { name: 'Asia', count: 750 },
          { name: 'Other', count: 250 }
        ]
      },
      behavior: {
        averageOrderFrequency: 1.5, // orders per month
        averageLifetimeValue: 325
      },
      segments: [
        { name: 'High Value', count: 500, revenue: 75000 },
        { name: 'Regular', count: 2000, revenue: 62500 },
        { name: 'Occasional', count: 2500, revenue: 15000 }
      ]
    };
  }
  
  /**
   * Get shipping data
   */
  private async getShippingData(
    organizationId: Types.ObjectId,
    timeRange: { start: Date; end: Date },
    contextData: Record<string, any>
  ): Promise<Record<string, any>> {
    // Implementation placeholder
    return {
      summary: {
        totalShipments: 1125,
        pendingShipments: 75,
        inTransitShipments: 150,
        deliveredShipments: 900
      },
      performance: {
        averageDeliveryTime: 3.5, // days
        lateDeliveries: 45,
        onTimePercentage: 96
      },
      carriers: [
        { name: 'FedEx', count: 450, percentage: 40 },
        { name: 'UPS', count: 350, percentage: 31.1 },
        { name: 'DHL', count: 325, percentage: 28.9 }
      ],
      costs: {
        totalShippingCost: 28125,
        averageShippingCost: 25
      }
    };
  }
  
  /**
   * Get marketplace data
   */
  private async getMarketplaceData(
    organizationId: Types.ObjectId,
    timeRange: { start: Date; end: Date },
    contextData: Record<string, any>
  ): Promise<Record<string, any>> {
    // Implementation placeholder
    return {
      summary: {
        totalMarketplaces: 3,
        totalListings: 1500
      },
      performance: [
        { 
          marketplace: 'Amazon', 
          listings: 750, 
          sales: 62500, 
          orders: 525,
          conversion: 4.2 // percentage
        },
        { 
          marketplace: 'Shopify', 
          listings: 500, 
          sales: 45000, 
          orders: 375,
          conversion: 5.1 // percentage
        },
        { 
          marketplace: 'Takealot', 
          listings: 250, 
          sales: 45000, 
          orders: 350,
          conversion: 8.4 // percentage
        }
      ],
      competitionData: {
        buyboxWinRate: 72.5, // percentage
        averageCompetitorCount: 4.2,
        priceCompetitiveness: 'medium'
      }
    };
  }
}