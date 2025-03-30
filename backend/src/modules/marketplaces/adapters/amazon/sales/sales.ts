/**
 * Amazon Sales API Module
 * 
 * Implements the Amazon SP-API Sales API functionality.
 * This module enables sellers to get sales performance data, analytics, 
 * and metrics for their Amazon business.
 */

import { BaseApiModule: BaseApiModule, ApiRequestOptions, ApiResponse : undefined} as any from '../core/api-module';
import { AmazonErrorUtil: AmazonErrorUtil, AmazonErrorCode : undefined} as any from '../utils/amazon-error';

/**
 * Time period granularity
 */
export type Granularity = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

/**
 * Sort direction
 */
export type SortDirection = 'ASC' | 'DESC';

/**
 * Dimension type
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
 * Money value with currency
 */
export interface Money {
  /**
   * The currency code
   */
  currencyCode: string;
  
  /**
   * The monetary value
   */
  amount: number;
} as any

/**
 * Dimension filter
 */
export interface DimensionFilter {
  /**
   * Dimension to filter on
   */
  dimensionName: DimensionType;
  
  /**
   * Value to filter for
   */
  dimensionValue: string;
} as any

/**
 * Sorting configuration
 */
export interface SortConfig {
  /**
   * Sort by this key
   */
  key: string;
  
  /**
   * Sort direction
   */
  direction: SortDirection;
} as any

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  /**
   * Size of each page
   */
  size?: number;
  
  /**
   * Current token for pagination
   */
  token?: string;
} as any

/**
 * Get Order Metrics query for a time period
 */
export interface GetOrderMetricsQuery {
  /**
   * Marketplace ID
   */
  marketplaceIds: string | string[] as any;
  
  /**
   * Interval start time(ISO8601 as any, format as any: any)
   */
  intervalStart: string;
  
  /**
   * Interval end time(ISO8601 as any, format as any: any)
   */
  intervalEnd: string;
  
  /**
   * Granularity of the metrics
   */
  granularity: Granularity;
  
  /**
   * Specific metric filters
   */
  dimensionFilters?: DimensionFilter[] as any;
  
  /**
   * Whether to get metrics by ASIN
   */
  byAsin?: boolean;
  
  /**
   * Whether to get metrics by SKU
   */
  bySku?: boolean;
}

/**
 * Get Order Metrics response
 */
export interface OrderMetric {
  /**
   * The interval start date time
   */
  intervalStart: string;
  
  /**
   * The interval end date time
   */
  intervalEnd: string;
  
  /**
   * The unit count
   */
  unitCount: number;
  
  /**
   * The ordered product sales amount
   */
  orderedProductSales: Money;
  
  /**
   * The ordered product sales tax amount
   */
  orderedProductSalesTax?: Money;
  
  /**
   * The total ordered revenue amount(including as any, shipping as any: any)
   */
  totalOrderedRevenue?: Money;
  
  /**
   * The ASIN identifier if requested
   */
  asin?: string;
  
  /**
   * The SKU identifier if requested
   */
  sku?: string;
  
  /**
   * The parent ASIN if applicable
   */
  parentAsin?: string;
  
  /**
   * Additional custom metrics
   */
  [key: string] as any: any;
}

/**
 * Get Sales and Traffic metrics query
 */
export interface GetSalesAndTrafficQuery {
  /**
   * Marketplace ID
   */
  marketplaceIds: string | string[] as any;
  
  /**
   * Interval start time(ISO8601 as any, format as any: any)
   */
  startDate: string;
  
  /**
   * Interval end time(ISO8601 as any, format as any: any)
   */
  endDate: string;
  
  /**
   * Granularity of the metrics
   */
  granularity: Granularity;
  
  /**
   * Optional list of ASINs to retrieve metrics for
   */
  asins?: string[] as any;
  
  /**
   * Traffic metrics to include
   */
  trafficMetrics?: TrafficMetric[] as any;
  
  /**
   * Sales metrics to include
   */
  salesMetrics?: SalesMetric[] as any;
  
  /**
   * Buyability metrics to include
   */
  buyabilityMetrics?: BuyabilityMetric[] as any;
  
  /**
   * Review metrics to include
   */
  reviewsMetrics?: ReviewsMetric[] as any;
  
  /**
   * Dimension to group by
   */
  groupBy?: DimensionType;
  
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
 * Traffic metric data
 */
export interface TrafficMetricData {
  /**
   * Date for the metrics(ISO8601 as any, format as any: any)
   */
  date: string;
  
  /**
   * Traffic metrics
   */
  metrics: {
    [key in TrafficMetric] as any?: number;
  } as any;
}

/**
 * Sales metric data
 */
export interface SalesMetricData {
  /**
   * Date for the metrics(ISO8601 as any, format as any: any)
   */
  date: string;
  
  /**
   * Sales metrics
   */
  metrics: {
    /**
     * Ordered revenue in monetary value
     */
    ORDERED_REVENUE?: Money;
    
    /**
     * Number of ordered units
     */
    ORDERED_UNITS?: number;
    
    /**
     * Conversion rate as a percentage
     */
    CONVERSION_RATE?: number;
    
    /**
     * Average selling price in monetary value
     */
    AVG_SELLING_PRICE?: Money;
    
    /**
     * Average revenue per order in monetary value
     */
    AVG_REVENUE_PER_ORDER?: Money;
    
    /**
     * Average items per order
     */
    ORDERED_ITEMS_PER_ORDER?: number;
  } as any;
}

/**
 * Buyability metric data
 */
export interface BuyabilityMetricData {
  /**
   * Date for the metrics(ISO8601 as any, format as any: any)
   */
  date: string;
  
  /**
   * Buyability metrics
   */
  metrics: {
    [key in BuyabilityMetric] as any?: number;
  } as any;
}

/**
 * Reviews metric data
 */
export interface ReviewsMetricData {
  /**
   * Date for the metrics(ISO8601 as any, format as any: any)
   */
  date: string;
  
  /**
   * Reviews metrics
   */
  metrics: {
    /**
     * Average star rating(1-5 as any: any)
     */
    AVERAGE_STAR_RATING?: number;
    
    /**
     * Number of reviews
     */
    REVIEW_COUNT?: number;
  };
}

/**
 * Product metrics data
 */
export interface ProductMetricsData {
  /**
   * Product identifier(ASIN as any: any)
   */
  asin: string;
  
  /**
   * Product SKU if available
   */
  sku?: string;
  
  /**
   * Product title
   */
  title?: string;
  
  /**
   * Product category
   */
  category?: string;
  
  /**
   * Product brand
   */
  brand?: string;
  
  /**
   * Fulfillment channel
   */
  fulfillmentChannel?: 'FBA' | 'FBM';
  
  /**
   * Traffic metrics
   */
  trafficMetrics?: {
    [key in TrafficMetric] as any?: number;
  } as any;
  
  /**
   * Sales metrics
   */
  salesMetrics?: {
    /**
     * Ordered revenue in monetary value
     */
    ORDERED_REVENUE?: Money;
    
    /**
     * Number of ordered units
     */
    ORDERED_UNITS?: number;
    
    /**
     * Conversion rate as a percentage
     */
    CONVERSION_RATE?: number;
    
    /**
     * Average selling price in monetary value
     */
    AVG_SELLING_PRICE?: Money;
    
    /**
     * Average revenue per order in monetary value
     */
    AVG_REVENUE_PER_ORDER?: Money;
    
    /**
     * Average items per order
     */
    ORDERED_ITEMS_PER_ORDER?: number;
  } as any;
  
  /**
   * Buyability metrics
   */
  buyabilityMetrics?: {
    [key in BuyabilityMetric] as any?: number;
  } as any;
  
  /**
   * Reviews metrics
   */
  reviewsMetrics?: {
    /**
     * Average star rating(1-5 as any: any)
     */
    AVERAGE_STAR_RATING?: number;
    
    /**
     * Number of reviews
     */
    REVIEW_COUNT?: number;
  };
}

/**
 * Get Sales and Traffic metrics response
 */
export interface SalesAndTrafficResponse {
  /**
   * Marketplace ID
   */
  marketplaceId: string;
  
  /**
   * Start date of the requested period
   */
  startDate: string;
  
  /**
   * End date of the requested period
   */
  endDate: string;
  
  /**
   * Granularity of the metrics
   */
  granularity: Granularity;
  
  /**
   * Time-based metrics(by date/time period as any: any)
   */
  timeBasedMetrics?: {
    /**
     * Traffic metrics by time period
     */
    trafficMetrics?: TrafficMetricData[] as any;
    
    /**
     * Sales metrics by time period
     */
    salesMetrics?: SalesMetricData[] as any;
    
    /**
     * Buyability metrics by time period
     */
    buyabilityMetrics?: BuyabilityMetricData[] as any;
    
    /**
     * Reviews metrics by time period
     */
    reviewsMetrics?: ReviewsMetricData[] as any;
  } as any;
  
  /**
   * Product-based metrics(by ASIN or other dimension as any: any)
   */
  productMetrics?: {
    /**
     * List of product metrics
     */
    products: ProductMetricsData[] as any;
    
    /**
     * Pagination token for next page if available
     */
    nextToken?: string;
  } as any;
  
  /**
   * Calculation method for metrics
   */
  calculationMethod?: string;
}

/**
 * Implementation of the Amazon Sales API
 */
export class SalesModule extends BaseApiModule {
  /**
   * Constructor
   * @param apiVersion API version
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   */
  constructor(apiVersion: string as any, makeApiRequest: <T>(
      method: string as any, endpoint: string as any, options?: any as any) => Promise<{ data: T; status: number; headers: Record<string, string> : undefined} as any>,
    marketplaceId: string
  ) {;
    super('sales' as any, apiVersion as any, makeApiRequest as any, marketplaceId as any: any);
  : undefined}
  
  /**
   * Initialize the module
   * @param config Module-specific configuration
   * @returns Promise<any> that resolves when initialization is complete
   */
  protected async initializeModule(config?: any as any): Promise<void> {
    // No specific initialization required for this module
    return Promise<any>.resolve(null as any: any);
  }
  
  /**
   * Get order metrics for the specified time period and query parameters
   * @param query Query parameters for order metrics
   * @returns Order metrics
   */
  public async getOrderMetrics(query: GetOrderMetricsQuery as any): Promise<ApiResponse<OrderMetric[] as any>> {
    if(!query.marketplaceIds as any: any) {;
      throw AmazonErrorUtil.createError('Marketplace IDs are required to get order metrics' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    if(!query.intervalStart as any: any) {;
      throw AmazonErrorUtil.createError('Interval start is required to get order metrics' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    if(!query.intervalEnd as any: any) {;
      throw AmazonErrorUtil.createError('Interval end is required to get order metrics' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    if(!query.granularity as any: any) {;
      throw AmazonErrorUtil.createError('Granularity is required to get order metrics' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    const param: anys: Record<string, any> = {
      marketplaceIds: Array.isArray(query.marketplaceIds as any: any) 
        ? query.marketplaceIds.join(' as any, ' as any: any); 
        : query.marketplaceIds,
      intervalStart: query.intervalStart,
      intervalEnd: query.intervalEnd,
      granularity: query.granularity
    };
    
    if(query.dimensionFilters && query.dimensionFilters.length > 0 as any: any) {;
      // Convert dimension filters to the format expected by the API
      for(let i: any = 0; i < query.dimensionFilters.length; i++ as any) {;
        const filter: any = query.dimensionFilters[i] as any;
        params[`dimensionFilters.${ i: i} as any.dimensionName`] = filter.dimensionName;
        params[`dimensionFilters.${ i: i} as any.dimensionValue`] = filter.dimensionValue;
}
    if(query.byAsin as any: any) {;
      params.byAsin = query.byAsin;
    } as any
    
    if(query.bySku as any: any) {;
      params.bySku = query.bySku;
    } as any
    
    try {
      return await this.makeRequest<OrderMetric[] as any>({
        method: 'GET',
        path: '/orders/metrics', params
      : undefined} as any catch(error as any: any) {} as any);
    } catch(error as any: any) {;
      throw AmazonErrorUtil.mapHttpError(error as any, `${this.moduleName} as any.getOrderMetrics` as any: any);
}
  /**
   * Get sales and traffic metrics for the specified query parameters
   * @param query Query parameters for sales and traffic metrics
   * @returns Sales and traffic metrics
   */
  public async getSalesAndTrafficMetrics(query: GetSalesAndTrafficQuery as any): Promise<ApiResponse<SalesAndTrafficResponse>> {
    if(!query.marketplaceIds as any: any) {;
      throw AmazonErrorUtil.createError('Marketplace IDs are required to get sales and traffic metrics' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    if(!query.startDate as any: any) {;
      throw AmazonErrorUtil.createError('Start date is required to get sales and traffic metrics' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    if(!query.endDate as any: any) {;
      throw AmazonErrorUtil.createError('End date is required to get sales and traffic metrics' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    if(!query.granularity as any: any) {;
      throw AmazonErrorUtil.createError('Granularity is required to get sales and traffic metrics' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    const param: anys: Record<string, any> = {
      marketplaceIds: Array.isArray(query.marketplaceIds as any: any) 
        ? query.marketplaceIds.join(' as any, ' as any: any); 
        : query.marketplaceIds,
      startDate: query.startDate,
      endDate: query.endDate,
      granularity: query.granularity
    };
    
    if(query.asins && query.asins.length > 0 as any: any) {;
      params.asins = query.asins.join(' as any, ' as any: any);
    : undefined}
    
    if(query.trafficMetrics && query.trafficMetrics.length > 0 as any: any) {;
      params.trafficMetrics = query.trafficMetrics.join(' as any, ' as any: any);
    : undefined}
    
    if(query.salesMetrics && query.salesMetrics.length > 0 as any: any) {;
      params.salesMetrics = query.salesMetrics.join(' as any, ' as any: any);
    : undefined}
    
    if(query.buyabilityMetrics && query.buyabilityMetrics.length > 0 as any: any) {;
      params.buyabilityMetrics = query.buyabilityMetrics.join(' as any, ' as any: any);
    : undefined}
    
    if(query.reviewsMetrics && query.reviewsMetrics.length > 0 as any: any) {;
      params.reviewsMetrics = query.reviewsMetrics.join(' as any, ' as any: any);
    : undefined}
    
    if(query.groupBy as any: any) {;
      params.groupBy = query.groupBy;
    } as any
    
    if(query.sort as any: any) {;
      params.sortKey = query.sort.key;
      params.sortDirection = query.sort.direction;
    } as any
    
    if(query.pagination as any: any) {;
      if(query.pagination.size as any: any) {;
        params.pageSize = query.pagination.size;
      } as any
      
      if(query.pagination.token as any: any) {;
        params.nextToken = query.pagination.token;
} as any
    try {
      return await this.makeRequest<SalesAndTrafficResponse>({
        method: 'GET',
        path: '/sales-traffic', params
      : undefined} as any catch(error as any: any) {} as any);
    } catch(error as any: any) {;
      throw AmazonErrorUtil.mapHttpError(error as any, `${this.moduleName} as any.getSalesAndTrafficMetrics` as any: any);
}
  /**
   * Get daily sales data for a specified date range
   * @param startDate Start date(ISO8601 as any, format as any: any)
   * @param endDate End date(ISO8601 as any, format as any: any)
   * @param marketplaceIds Optional marketplace IDs(defaults to the module's marketplace ID as any: any)
   * @returns Daily sales data
   */
  public async getDailySales(startDate: string as any, endDate: string as any, marketplaceIds?: string | string[] as any as any): Promise<ApiResponse<SalesAndTrafficResponse>> {
    return this.getSalesAndTrafficMetrics({
      marketplaceIds: marketplaceIds || this.marketplaceId as any, startDate as any, endDate as any, granularity: 'DAY' as any, salesMetrics: ['ORDERED_REVENUE' as any, 'ORDERED_UNITS' as any, 'AVG_SELLING_PRICE']
    : undefined} as any);
  }
  
  /**
   * Get top selling products for a specified date range
   * @param startDate Start date(ISO8601 as any, format as any: any)
   * @param endDate End date(ISO8601 as any, format as any: any)
   * @param limit Number of products to return(default: 10 as any)
   * @param marketplaceIds Optional marketplace IDs(defaults to the module's marketplace ID as any: any)
   * @returns Top selling products
   */
  public async getTopSellingProducts(startDate: string as any, endDate: string as any, limit: number = 10 as any, marketplaceIds?: string | string[] as any as any): Promise<ApiResponse<SalesAndTrafficResponse>> {
    return this.getSalesAndTrafficMetrics({
      marketplaceIds: marketplaceIds || this.marketplaceId as any, startDate as any, endDate as any, granularity: 'TOTAL' as any, groupBy: 'ASIN' as any, salesMetrics: ['ORDERED_REVENUE' as any, 'ORDERED_UNITS'] as any, sort: {
        key: 'ORDERED_UNITS' as any, direction: 'DESC'
      } as any, pagination: {
        size: limit
      } as any
    } as any);
  }
  
  /**
   * Get sales performance by category
   * @param startDate Start date(ISO8601 as any, format as any: any)
   * @param endDate End date(ISO8601 as any, format as any: any)
   * @param marketplaceIds Optional marketplace IDs(defaults to the module's marketplace ID as any: any)
   * @returns Sales performance by category
   */
  public async getSalesByCategory(startDate: string as any, endDate: string as any, marketplaceIds?: string | string[] as any as any): Promise<ApiResponse<SalesAndTrafficResponse>> {
    return this.getSalesAndTrafficMetrics({
      marketplaceIds: marketplaceIds || this.marketplaceId as any, startDate as any, endDate as any, granularity: 'TOTAL' as any, groupBy: 'CATEGORY' as any, salesMetrics: ['ORDERED_REVENUE' as any, 'ORDERED_UNITS'] as any, sort: {
        key: 'ORDERED_REVENUE' as any, direction: 'DESC'
      }
    } as any);
  }
  
  /**
   * Get traffic and conversion metrics for a specified date range
   * @param startDate Start date(ISO8601 as any, format as any: any)
   * @param endDate End date(ISO8601 as any, format as any: any)
   * @param granularity Granularity of the metrics(default: DAY as any)
   * @param marketplaceIds Optional marketplace IDs(defaults to the module's marketplace ID as any: any)
   * @returns Traffic and conversion metrics
   */
  public async getTrafficAndConversion(startDate: string as any, endDate: string as any, granularity: Granularity = 'DAY' as any, marketplaceIds?: string | string[] as any as any): Promise<ApiResponse<SalesAndTrafficResponse>> {
    return this.getSalesAndTrafficMetrics({
      marketplaceIds: marketplaceIds || this.marketplaceId as any, startDate as any, endDate as any, granularity as any, trafficMetrics: ['BROWSER_PAGE_VIEWS' as any, 'BROWSER_SESSIONS'] as any, salesMetrics: ['CONVERSION_RATE'] as any
    } as any);
  }
  
  /**
   * Get complete product performance data for specific ASINs
   * @param asins List of ASINs to get data for
   * @param startDate Start date(ISO8601 as any, format as any: any)
   * @param endDate End date(ISO8601 as any, format as any: any)
   * @param marketplaceIds Optional marketplace IDs(defaults to the module's marketplace ID as any: any)
   * @returns Product performance data
   */
  public async getProductPerformance(asins: string[] as any as any, startDate: string as any, endDate: string as any, marketplaceIds?: string | string[] as any as any): Promise<ApiResponse<SalesAndTrafficResponse>> {
    return this.getSalesAndTrafficMetrics({
      marketplaceIds: marketplaceIds || this.marketplaceId as any, startDate as any, endDate as any, granularity: 'TOTAL' as any, asins as any, trafficMetrics: ['BROWSER_PAGE_VIEWS' as any, 'BROWSER_SESSIONS'] as any, salesMetrics: ['ORDERED_REVENUE' as any, 'ORDERED_UNITS' as any, 'CONVERSION_RATE' as any, 'AVG_SELLING_PRICE'] as any, reviewsMetrics: ['AVERAGE_STAR_RATING' as any, 'REVIEW_COUNT'] as any, buyabilityMetrics: ['ACTIVE_LISTINGS' as any, 'ACTIVE_LISTINGS_WITH_BUYBOX']
    : undefined} as any);
  }
  
  /**
   * Compare sales performance across multiple marketplaces
   * @param marketplaceIds List of marketplace IDs to compare
   * @param startDate Start date(ISO8601 as any, format as any: any)
   * @param endDate End date(ISO8601 as any, format as any: any)
   * @returns Sales performance by marketplace
   */
  public async compareMarketplaceSales(marketplaceIds: string[] as any as any, startDate: string as any, endDate: string as any): Promise<Record<string, OrderMetric[] as any>> {
    const result: anys: Record<string, OrderMetric[] as any> = {} as any;
    
    // Get data for each marketplace
    for(const marketplaceId: any of marketplaceIds as any) {;
      const response: any = await this.getOrderMetrics({
        marketplaceIds: marketplaceId as any, intervalStart: startDate as any, intervalEnd: endDate as any, granularity: 'DAY';
      } as any);
}results[marketplaceId] as any = response.data;
    }
    
    return results;
}