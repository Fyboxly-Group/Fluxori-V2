/**
 * Amazon Sales API Module
 * 
 * This module provides access to sales and traffic data from Amazon Selling Partner API.
 * It allows sellers to retrieve sales, orders, traffic, and other business metrics.
 */

import { ApiModule } from '../../../core/api-module';
import { ApiRequestFunction, ApiResponse } from '../../../core/base-module.interface';
import AmazonErrorHandler, { AmazonErrorCode } from '../../../utils/amazon-error';

/**
 * Time period granularity
 */
export type Granularity = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'TOTAL';

/**
 * Sort direction
 */
export type SortDirection = 'ASC' | 'DESC';

/**
 * Dimension type for grouping
 */
export type DimensionType = 'ASIN' | 'SKU' | 'PARENT_ASIN' | 'CATEGORY' | 'BRAND' | 'FULFILLMENT_CHANNEL';

/**
 * Metric type for traffic
 */
export type TrafficMetric = 'BROWSER_PAGE_VIEWS' | 'BROWSER_SESSIONS' | 'MOBILE_APP_PAGE_VIEWS' | 'MOBILE_APP_SESSIONS';

/**
 * Metric type for sales and orders
 */
export type SalesMetric = 
  | 'ORDERED_REVENUE' 
  | 'ORDERED_UNITS' 
  | 'CONVERSION_RATE' 
  | 'AVG_SELLING_PRICE' 
  | 'AVG_REVENUE_PER_ORDER' 
  | 'ORDERED_ITEMS_PER_ORDER';

/**
 * Metric type for buyability
 */
export type BuyabilityMetric = 
  | 'ACTIVE_LISTINGS' 
  | 'ACTIVE_LISTINGS_WITH_BUYBOX' 
  | 'ACTIVE_LISTINGS_WITHOUT_BUYBOX';

/**
 * Metric type for customer reviews
 */
export type ReviewsMetric = 
  | 'AVERAGE_STAR_RATING' 
  | 'REVIEW_COUNT';

/**
 * Filter for dimension values
 */
export interface DimensionFilter {
  /**
   * The dimension name to filter on
   */
  dimensionName: DimensionType;
  
  /**
   * The dimension value to filter on
   */
  dimensionValue: string;
}

/**
 * Configuration for sorting results
 */
export interface SortConfig {
  /**
   * The key to sort by
   */
  key: string;
  
  /**
   * The direction to sort in
   */
  direction: SortDirection;
}

/**
 * Configuration for paginating results
 */
export interface PaginationConfig {
  /**
   * The page size to request
   */
  size: number;
  
  /**
   * The token for the next page of results
   */
  token?: string;
}

/**
 * Money value with currency
 */
export interface Money {
  /**
   * The amount
   */
  amount: number;
  
  /**
   * The currency code (e.g., USD)
   */
  currencyCode: string;
}

/**
 * Sales metric data
 */
export interface SalesMetricData {
  /**
   * Ordered revenue
   */
  orderedRevenue?: Money;
  
  /**
   * Ordered units
   */
  orderedUnits?: number;
  
  /**
   * Conversion rate
   */
  conversionRate?: number;
  
  /**
   * Average selling price
   */
  avgSellingPrice?: Money;
  
  /**
   * Average revenue per order
   */
  avgRevenuePerOrder?: Money;
  
  /**
   * Ordered items per order
   */
  orderedItemsPerOrder?: number;
}

/**
 * Traffic metric data
 */
export interface TrafficMetricData {
  /**
   * Browser page views
   */
  browserPageViews?: number;
  
  /**
   * Browser sessions
   */
  browserSessions?: number;
  
  /**
   * Mobile app page views
   */
  mobileAppPageViews?: number;
  
  /**
   * Mobile app sessions
   */
  mobileAppSessions?: number;
}

/**
 * Buyability metric data
 */
export interface BuyabilityMetricData {
  /**
   * Active listings
   */
  activeListings?: number;
  
  /**
   * Active listings with buybox
   */
  activeListingsWithBuybox?: number;
  
  /**
   * Active listings without buybox
   */
  activeListingsWithoutBuybox?: number;
}

/**
 * Reviews metric data
 */
export interface ReviewsMetricData {
  /**
   * Average star rating
   */
  averageStarRating?: number;
  
  /**
   * Review count
   */
  reviewCount?: number;
}

/**
 * Product metrics data
 */
export interface ProductMetricsData {
  /**
   * ASIN or SKU
   */
  identifier: string;
  
  /**
   * The dimension type (ASIN, SKU, etc.)
   */
  dimensionType: DimensionType;
  
  /**
   * The report date
   */
  reportDate: string;
  
  /**
   * Traffic metrics data
   */
  traffic?: TrafficMetricData;
  
  /**
   * Sales metrics data
   */
  sales?: SalesMetricData;
  
  /**
   * Buyability metrics data
   */
  buyability?: BuyabilityMetricData;
  
  /**
   * Reviews metrics data
   */
  reviews?: ReviewsMetricData;
}

/**
 * Order metric data
 */
export interface OrderMetric {
  /**
   * The interval
   */
  interval: string;
  
  /**
   * The unit count
   */
  unitCount: number;
  
  /**
   * The order item count
   */
  orderItemCount: number;
  
  /**
   * The order count
   */
  orderCount: number;
  
  /**
   * The average unit price
   */
  averageUnitPrice: Money;
  
  /**
   * The total sales
   */
  totalSales: Money;
}

/**
 * Query parameters for getting sales and traffic data
 */
export interface GetSalesAndTrafficQuery {
  /**
   * Marketplace IDs to get data for
   */
  marketplaceIds: string[];
  
  /**
   * Start date (YYYY-MM-DD)
   */
  startDate: string;
  
  /**
   * End date (YYYY-MM-DD)
   */
  endDate: string;
  
  /**
   * Time granularity
   */
  granularity: Granularity;
  
  /**
   * ASIN list to filter by
   */
  asins?: string[];
  
  /**
   * SKU list to filter by
   */
  skus?: string[];
  
  /**
   * Brand list to filter by
   */
  brands?: string[];
  
  /**
   * Traffic metrics to include
   */
  trafficMetrics?: TrafficMetric[];
  
  /**
   * Sales metrics to include
   */
  salesMetrics?: SalesMetric[];
  
  /**
   * Buyability metrics to include
   */
  buyabilityMetrics?: BuyabilityMetric[];
  
  /**
   * Reviews metrics to include
   */
  reviewsMetrics?: ReviewsMetric[];
  
  /**
   * Dimension to group by
   */
  groupBy?: DimensionType;
  
  /**
   * Dimension filters to apply
   */
  filters?: DimensionFilter[];
  
  /**
   * Sorting configuration
   */
  sort?: SortConfig;
  
  /**
   * Pagination configuration
   */
  pagination?: PaginationConfig;
}

/**
 * Query parameters for getting order metrics data
 */
export interface GetOrderMetricsQuery {
  /**
   * Marketplace IDs to get data for
   */
  marketplaceIds: string[];
  
  /**
   * Start date (ISO 8601)
   */
  startDate: string;
  
  /**
   * End date (ISO 8601)
   */
  endDate: string;
  
  /**
   * Time granularity
   */
  granularity: Granularity;
  
  /**
   * Filter by ASIN
   */
  byAsin?: string;
  
  /**
   * Filter by SKU
   */
  bySku?: string;
  
  /**
   * Dimension filters to apply
   */
  filters?: DimensionFilter[];
}

/**
 * Response for the getSalesAndTraffic API
 */
export interface GetSalesAndTrafficResponse {
  /**
   * The payload
   */
  payload: {
    /**
     * Report specification
     */
    reportSpecification: {
      /**
       * Marketplace IDs included in the report
       */
      marketplaceIds: string[];
      
      /**
       * Start date of the report
       */
      startDate: string;
      
      /**
       * End date of the report
       */
      endDate: string;
      
      /**
       * Time granularity of the report
       */
      granularity: Granularity;
    };
    
    /**
     * List of product metrics
     */
    productMetricsList?: ProductMetricsData[];
    
    /**
     * The next token for pagination
     */
    nextToken?: string;
  };
}

/**
 * Response for the getOrderMetrics API
 */
export interface GetOrderMetricsResponse {
  /**
   * The payload
   */
  payload: OrderMetric[];
}

/**
 * Options for the sales module
 */
export interface SalesModuleOptions {
  /**
   * Maximum batch size for requests
   */
  maxBatchSize?: number;
  
  /**
   * Maximum page size for pagination
   */
  maxPageSize?: number;
}

/**
 * Implementation of the Amazon Sales API
 */
export class SalesModule extends ApiModule<SalesModuleOptions> {
  /**
   * The unique identifier for this module
   */
  readonly moduleId: string = 'sales';
  
  /**
   * The human-readable name of this module
   */
  readonly moduleName: string = 'Sales';
  
  /**
   * The API version this module uses
   */
  readonly apiVersion: string;
  
  /**
   * The base URL path for API requests
   */
  readonly basePath: string;
  
  /**
   * Constructor
   * @param apiVersion API version
   * @param apiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param options Module-specific options
   */
  constructor(
    apiVersion: string,
    apiRequest: ApiRequestFunction,
    marketplaceId: string,
    options: SalesModuleOptions = {}
  ) {
    super(apiRequest, marketplaceId, options);
    this.apiVersion = apiVersion;
    this.basePath = `/sales/${apiVersion}`;
  }
  
  /**
   * Get order metrics
   * @param query Query parameters
   * @returns Order metrics data
   */
  public async getOrderMetrics(
    query: GetOrderMetricsQuery
  ): Promise<OrderMetric[]> {
    if (!query.marketplaceIds || query.marketplaceIds.length === 0) {
      throw AmazonErrorHandler.createError(
        'At least one marketplace ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!query.startDate || !query.endDate) {
      throw AmazonErrorHandler.createError(
        'Start date and end date are required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      // Build query parameters
      const params: Record<string, any> = {
        marketplaceIds: query.marketplaceIds,
        startDate: query.startDate,
        endDate: query.endDate,
        granularity: query.granularity || 'DAY'
      };
      
      // Add optional filters
      if (query.byAsin) {
        params.asin = query.byAsin;
      }
      
      if (query.bySku) {
        params.sku = query.bySku;
      }
      
      // Add dimension filters
      if (query.filters && query.filters.length > 0) {
        for (let i = 0; i < query.filters.length; i++) {
          const filter = query.filters[i];
          params[`${filter.dimensionName}`] = filter.dimensionValue;
        }
      }
      
      // Make the API request
      const response = await this.request<GetOrderMetricsResponse>(
        '/orders/metrics',
        'GET',
        params
      );
      
      return response.data.payload || [];
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getOrderMetrics`);
    }
  }
  
  /**
   * Get sales and traffic data
   * @param query Query parameters
   * @returns Sales and traffic data
   */
  public async getSalesAndTraffic(
    query: GetSalesAndTrafficQuery
  ): Promise<GetSalesAndTrafficResponse> {
    if (!query.marketplaceIds || query.marketplaceIds.length === 0) {
      throw AmazonErrorHandler.createError(
        'At least one marketplace ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!query.startDate || !query.endDate) {
      throw AmazonErrorHandler.createError(
        'Start date and end date are required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      // Build query parameters
      const params: Record<string, any> = {
        marketplaceIds: query.marketplaceIds,
        startDate: query.startDate,
        endDate: query.endDate,
        granularity: query.granularity || 'DAY'
      };
      
      // Add optional filters
      if (query.asins && query.asins.length > 0) {
        params.asins = query.asins;
      }
      
      if (query.skus && query.skus.length > 0) {
        params.skus = query.skus;
      }
      
      if (query.trafficMetrics && query.trafficMetrics.length > 0) {
        params.trafficMetrics = query.trafficMetrics;
      }
      
      if (query.salesMetrics && query.salesMetrics.length > 0) {
        params.salesMetrics = query.salesMetrics;
      }
      
      if (query.buyabilityMetrics && query.buyabilityMetrics.length > 0) {
        params.buyabilityMetrics = query.buyabilityMetrics;
      }
      
      if (query.reviewsMetrics && query.reviewsMetrics.length > 0) {
        params.reviewsMetrics = query.reviewsMetrics;
      }
      
      if (query.groupBy) {
        params.groupBy = query.groupBy;
      }
      
      // Add sort configuration
      if (query.sort) {
        params.sortKey = query.sort.key;
        params.sortDirection = query.sort.direction;
      }
      
      // Add pagination
      if (query.pagination) {
        const maxPageSize = this.options.maxPageSize || 100;
        params.pageSize = Math.min(query.pagination.size, maxPageSize);
        
        if (query.pagination.token) {
          params.nextToken = query.pagination.token;
        }
      }
      
      // Make the API request
      const response = await this.request<GetSalesAndTrafficResponse>(
        '/salesAndTraffic',
        'GET',
        params
      );
      
      return response.data;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getSalesAndTraffic`);
    }
  }
  
  /**
   * Get all sales for a date range, organized by marketplace
   * @param marketplaceIds Marketplace IDs to get data for
   * @param startDate Start date (YYYY-MM-DD)
   * @param endDate End date (YYYY-MM-DD)
   * @param granularity Time granularity
   * @returns Map of marketplace ID to order metrics
   */
  public async getAllSalesByMarketplace(
    marketplaceIds: string[],
    startDate: string,
    endDate: string,
    granularity: Granularity = 'DAY'
  ): Promise<Record<string, OrderMetric[]>> {
    const results: Record<string, OrderMetric[]> = {};
    
    for (const marketplaceId of marketplaceIds) {
      const response = await this.getOrderMetrics({
        marketplaceIds: [marketplaceId],
        startDate,
        endDate,
        granularity
      });
      
      results[marketplaceId] = response;
    }
    
    return results;
  }
  
  /**
   * Get top selling products for a period
   * @param marketplaceIds Marketplace IDs to get data for
   * @param limit Maximum number of products to return
   * @param startDate Start date (YYYY-MM-DD)
   * @param endDate End date (YYYY-MM-DD)
   * @returns Most popular products by sales
   */
  public async getTopSellingProducts(
    marketplaceIds: string[],
    limit: number = 10,
    startDate?: string,
    endDate?: string
  ): Promise<ProductMetricsData[]> {
    // If dates not provided, use past 30 days
    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Get sales and traffic data
    const response = await this.getSalesAndTraffic({
      marketplaceIds,
      startDate: start,
      endDate: end,
      granularity: 'TOTAL',
      groupBy: 'ASIN',
      salesMetrics: ['ORDERED_REVENUE', 'ORDERED_UNITS'],
      sort: {
        key: 'ORDERED_UNITS',
        direction: 'DESC'
      },
      pagination: {
        size: limit
      }
    });
    
    return response.payload.productMetricsList || [];
  }
  
  /**
   * Get top product categories by sales
   * @param marketplaceIds Marketplace IDs to get data for
   * @param startDate Start date (YYYY-MM-DD)
   * @param endDate End date (YYYY-MM-DD)
   * @returns Top categories by sales
   */
  public async getTopCategories(
    marketplaceIds: string[],
    startDate?: string,
    endDate?: string
  ): Promise<ProductMetricsData[]> {
    // If dates not provided, use past 30 days
    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Get sales and traffic data
    const response = await this.getSalesAndTraffic({
      marketplaceIds,
      startDate: start,
      endDate: end,
      granularity: 'TOTAL',
      groupBy: 'CATEGORY',
      salesMetrics: ['ORDERED_REVENUE'],
      sort: {
        key: 'ORDERED_REVENUE',
        direction: 'DESC'
      }
    });
    
    return response.payload.productMetricsList || [];
  }
  
  /**
   * Get traffic and conversion metrics for a time period
   * @param marketplaceIds Marketplace IDs to get data for
   * @param granularity Time granularity
   * @param startDate Start date (YYYY-MM-DD)
   * @param endDate End date (YYYY-MM-DD)
   * @returns Traffic and conversion metrics
   */
  public async getTrafficAndConversion(
    marketplaceIds: string[],
    granularity: Granularity = 'DAY',
    startDate?: string,
    endDate?: string
  ): Promise<GetSalesAndTrafficResponse> {
    // If dates not provided, use past 30 days
    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Get traffic and conversion data
    return this.getSalesAndTraffic({
      marketplaceIds,
      startDate: start,
      endDate: end,
      granularity,
      trafficMetrics: ['BROWSER_PAGE_VIEWS', 'BROWSER_SESSIONS'],
      salesMetrics: ['CONVERSION_RATE']
    });
  }
  
  /**
   * Get comprehensive dashboard metrics
   * @param marketplaceIds Marketplace IDs to get data for
   * @returns Comprehensive dashboard metrics
   */
  public async getDashboardMetrics(
    marketplaceIds: string[]
  ): Promise<GetSalesAndTrafficResponse> {
    // Use past 30 days
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Get all metrics types for dashboard
    return this.getSalesAndTraffic({
      marketplaceIds,
      startDate,
      endDate,
      granularity: 'TOTAL',
      trafficMetrics: ['BROWSER_PAGE_VIEWS'],
      salesMetrics: ['ORDERED_REVENUE'],
      reviewsMetrics: ['AVERAGE_STAR_RATING'],
      buyabilityMetrics: ['ACTIVE_LISTINGS']
    });
  }
}