/**
 * Amazon Inventory Planning Module
 * 
 * Provides inventory forecasting, planning, and optimization functions.
 * Uses Amazon's Inventory API data to make intelligent inventory decisions.
 */

import { ApiModule } from '../../../core/api-module';
import { ApiRequestFunction } from '../../../core/base-module.interface';
import AmazonErrorHandler, { AmazonErrorCode } from '../../../utils/amazon-error';

/**
 * Risk level for inventory recommendations
 */
export type RiskLevel = 'low' | 'medium' | 'high';

/**
 * Sales trend direction
 */
export type SalesTrend = 'increasing' | 'stable' | 'decreasing';

/**
 * Inventory health status
 */
export enum InventoryHealthStatus {
  HEALTHY = 'healthy',
  EXCESS = 'excess',
  LOW = 'low',
  OUT_OF_STOCK = 'outOfStock',
  OVERAGED = 'overaged',
  SLOW_MOVING = 'slowMoving',
  STRANDED = 'stranded'
}

/**
 * Inventory level recommendations
 */
export interface InventoryLevelRecommendation {
  /**
   * Product SKU
   */
  sku: string;
  
  /**
   * ASIN if available
   */
  asin?: string;
  
  /**
   * Current inventory level
   */
  currentLevel: number;
  
  /**
   * Recommended inventory level
   */
  recommendedLevel: number;
  
  /**
   * Recommended reorder quantity
   */
  reorderQuantity: number;
  
  /**
   * Confidence score (0-1) of the recommendation
   */
  confidence: number;
  
  /**
   * Expected days of coverage at current level
   */
  daysOfCoverageAtCurrentLevel: number;
  
  /**
   * Expected days of coverage at recommended level
   */
  daysOfCoverageAtRecommendedLevel: number;
  
  /**
   * Risk level
   */
  riskLevel: RiskLevel;
  
  /**
   * Estimated stockout date at current levels
   */
  estimatedStockoutDate?: Date;
  
  /**
   * Estimated lost sales if not restocked
   */
  estimatedLostSales?: number;
  
  /**
   * Reason for the recommendation
   */
  recommendationReason?: string;
}

/**
 * Sales velocity metrics
 */
export interface SalesVelocityMetrics {
  /**
   * Product SKU
   */
  sku: string;
  
  /**
   * ASIN if available
   */
  asin?: string;
  
  /**
   * Units sold in the last 7 days
   */
  unitsSold7Days: number;
  
  /**
   * Units sold in the last 30 days
   */
  unitsSold30Days: number;
  
  /**
   * Units sold in the last 60 days
   */
  unitsSold60Days: number;
  
  /**
   * Units sold in the last 90 days
   */
  unitsSold90Days: number;
  
  /**
   * Average daily sales
   */
  averageDailySales: number;
  
  /**
   * Average weekly sales
   */
  averageWeeklySales: number;
  
  /**
   * Sales trend
   */
  salesTrend: SalesTrend;
  
  /**
   * Sales forecast for next 30 days
   */
  salesForecast30Days: number;
  
  /**
   * Sales forecast for next 60 days
   */
  salesForecast60Days: number;
  
  /**
   * Sales forecast for next 90 days
   */
  salesForecast90Days: number;
  
  /**
   * Seasonality factor (1.0 is average)
   */
  seasonalityFactor: number;
}

/**
 * FBA fee estimates for inventory planning
 */
export interface FbaFeeEstimates {
  /**
   * Product SKU
   */
  sku: string;
  
  /**
   * ASIN if available
   */
  asin?: string;
  
  /**
   * FBA fulfillment fee per unit
   */
  fulfillmentFeePerUnit: number;
  
  /**
   * Monthly storage fee per unit
   */
  monthlyStorageFeePerUnit: number;
  
  /**
   * Long-term storage fee per unit (if applicable)
   */
  longTermStorageFeePerUnit?: number;
  
  /**
   * Estimated storage days before sale
   */
  estimatedStorageDays: number;
  
  /**
   * Total estimated FBA cost per unit
   */
  totalFbaFeesPerUnit: number;
  
  /**
   * Referral fee percentage
   */
  referralFeePercent: number;
  
  /**
   * Currency code for fee amounts
   */
  currencyCode: string;
}

/**
 * Inventory planning parameters
 */
export interface InventoryPlanningParams {
  /**
   * Number of days of inventory coverage to target
   */
  targetDaysOfCoverage?: number;
  
  /**
   * Safety stock days to add to forecasted demand
   */
  safetyStockDays?: number;
  
  /**
   * Minimum reorder quantity
   */
  minimumReorderQuantity?: number;
  
  /**
   * Maximum reorder quantity
   */
  maximumReorderQuantity?: number;
  
  /**
   * Lead time in days for replenishment
   */
  leadTimeDays?: number;
  
  /**
   * Factor to apply to seasonal trends (0-1 reduces effect, >1 increases effect)
   */
  seasonalityFactor?: number;
  
  /**
   * Growth factor to apply to historical sales (1.0 = no growth)
   */
  salesGrowthFactor?: number;
  
  /**
   * Whether to constrain by budgets and space
   */
  applyBudgetConstraints?: boolean;
  
  /**
   * Maximum spend budget
   */
  maxBudget?: number;
  
  /**
   * Maximum units to reorder
   */
  maxUnits?: number;
}

/**
 * Inventory health assessment
 */
export interface InventoryHealthAssessment {
  /**
   * Product SKU
   */
  sku: string;
  
  /**
   * ASIN if available
   */
  asin?: string;
  
  /**
   * Inventory health status
   */
  healthStatus: InventoryHealthStatus;
  
  /**
   * Age of inventory in days
   */
  inventoryAgeDays: number;
  
  /**
   * Whether the inventory is at risk of long-term storage fees
   */
  atRiskOfLtsfFees: boolean;
  
  /**
   * Percent of inventory in excess of needs
   */
  excessInventoryPercent?: number;
  
  /**
   * Cost of excess inventory
   */
  excessInventoryCost?: number;
  
  /**
   * Storage cost per month
   */
  monthlyStorageCost: number;
  
  /**
   * Recommended actions to improve health
   */
  recommendedActions: string[];
  
  /**
   * Sell-through rate (units sold per unit of inventory per month)
   */
  sellThroughRate?: number;
}

/**
 * Amazon inventory item with sales data
 */
export interface AmazonInventoryItem {
  /**
   * Product SKU
   */
  sku: string;
  
  /**
   * ASIN if available
   */
  asin?: string;
  
  /**
   * Current inventory quantity
   */
  quantity: number;
  
  /**
   * Fulfillment channel
   */
  fulfilledBy: 'AMAZON' | 'MERCHANT';
  
  /**
   * Product name if available
   */
  productName?: string;
  
  /**
   * Daily sales history array
   */
  dailySalesHistory?: number[];
  
  /**
   * Reserved inventory quantity
   */
  reservedQuantity?: number;
  
  /**
   * Inbound inventory quantity
   */
  inboundQuantity?: number;
  
  /**
   * Product price
   */
  price?: number;
  
  /**
   * Product cost
   */
  cost?: number;
  
  /**
   * Product condition
   */
  condition?: string;
  
  /**
   * Age of inventory in days
   */
  inventoryAge?: number;
}

/**
 * Options for the Inventory Planning module
 */
export interface InventoryPlanningModuleOptions {
  /**
   * Default planning parameters
   */
  defaultPlanningParams?: Partial<InventoryPlanningParams>;
  
  /**
   * Custom data fetcher function
   */
  inventoryDataFetcher?: (skus: string[]) => Promise<AmazonInventoryItem[]>;
  
  /**
   * Enable detailed debugging
   */
  enableDebug?: boolean;
  
  /**
   * Threshold for days of coverage to consider low
   */
  lowInventoryThreshold?: number;
  
  /**
   * Default currency code
   */
  defaultCurrencyCode?: string;
}

/**
 * Implementation of the Amazon Inventory Planning Module
 * Provides inventory forecasting, planning, and optimization functions
 */
export class InventoryPlanningModule extends ApiModule<InventoryPlanningModuleOptions> {
  /**
   * The unique identifier for this module
   */
  readonly moduleId: string = 'inventory-planning';
  
  /**
   * The human-readable name of this module
   */
  readonly moduleName: string = 'Inventory Planning';
  
  /**
   * The API version this module uses
   */
  readonly apiVersion: string;
  
  /**
   * The base URL path for API requests
   */
  readonly basePath: string;
  
  /**
   * Default planning parameters
   */
  private readonly defaultPlanningParams: Required<InventoryPlanningParams> = {
    targetDaysOfCoverage: 60,
    safetyStockDays: 14,
    minimumReorderQuantity: 1,
    maximumReorderQuantity: 10000,
    leadTimeDays: 30,
    seasonalityFactor: 1.0,
    salesGrowthFactor: 1.0,
    applyBudgetConstraints: false,
    maxBudget: Infinity,
    maxUnits: Infinity
  };

  /**
   * Function to get inventory data from Amazon
   */
  private readonly getInventoryData: (skus: string[]) => Promise<AmazonInventoryItem[]>;
  
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
    options: InventoryPlanningModuleOptions = {}
  ) {
    super(apiRequest, marketplaceId, options);
    this.apiVersion = apiVersion;
    this.basePath = `/fba/inventory/${apiVersion}`;
    
    // Merge provided planning params with defaults
    if (options.defaultPlanningParams) {
      this.defaultPlanningParams = {
        ...this.defaultPlanningParams,
        ...options.defaultPlanningParams
      };
    }
    
    // Set the inventory data fetcher
    this.getInventoryData = options.inventoryDataFetcher || this.defaultInventoryDataFetcher;
  }
  
  /**
   * Default inventory data fetcher that uses the FBA Inventory API
   * @param skus List of SKUs to fetch data for
   * @returns Inventory items with sales data
   */
  private async defaultInventoryDataFetcher(skus: string[]): Promise<AmazonInventoryItem[]> {
    try {
      // Build API request parameters
      const params: Record<string, any> = {
        marketplaceId: this.marketplaceId
      };
      
      // Add SKUs filter if provided
      if (skus && skus.length > 0) {
        params.sellerSkus = skus;
      }
      
      // Make API request to get inventory levels
      const response = await this.request(
        'inventory-summaries',
        'GET',
        params
      );
      
      // Transform the response into our AmazonInventoryItem format
      return (response.data.payload?.inventorySummaries || []).map((summary: any) => ({
        sku: summary.sellerSku,
        asin: summary.asin,
        quantity: summary.totalQuantity || 0,
        fulfilledBy: summary.fulfillmentChannel === 'AFN' ? 'AMAZON' : 'MERCHANT',
        productName: summary.productName,
        reservedQuantity: summary.reservedQuantity || 0,
        inboundQuantity: summary.inboundQuantity || 0,
        inventoryAge: summary.inventoryAge || 0,
        // We'll set empty sales history, actual implementation would get this from another API
        dailySalesHistory: []
      }));
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.defaultInventoryDataFetcher`);
    }
  }
  
  /**
   * Get inventory level recommendations for a list of SKUs
   * @param skus List of SKUs to evaluate
   * @param planningParams Planning parameters
   * @returns Inventory recommendations
   */
  public async getInventoryRecommendations(
    skus: string[], 
    planningParams?: InventoryPlanningParams
  ): Promise<InventoryLevelRecommendation[]> {
    try {
      // Get inventory items with sales data
      const inventoryItems = await this.getInventoryData(skus);
      
      // Merge provided parameters with defaults
      const params = { ...this.defaultPlanningParams, ...planningParams };
      
      // Log debug info if enabled
      if (this.options.enableDebug) {
        console.log(`[${this.moduleName}] Processing recommendations for ${inventoryItems.length} items with parameters:`, params);
      }
      
      // Calculate recommendations for each item
      return inventoryItems.map(item => {
        // Calculate average daily sales
        const salesHistory = item.dailySalesHistory || [];
        const averageDailySales = salesHistory.length > 0
          ? salesHistory.reduce((sum, sales) => sum + sales, 0) / salesHistory.length
          : 0;
        
        // Apply growth and seasonality factors
        const adjustedDailySales = averageDailySales * params.salesGrowthFactor * params.seasonalityFactor;
        
        // Calculate days of coverage at current level
        const daysOfCoverageAtCurrentLevel = adjustedDailySales > 0
          ? item.quantity / adjustedDailySales
          : (item.quantity > 0 ? 365 : 0); // If no sales, but have inventory, assume 1 year
        
        // Calculate recommended level
        const recommendedLevel = Math.ceil(
          adjustedDailySales * (params.targetDaysOfCoverage + params.leadTimeDays + params.safetyStockDays)
        );
        
        // Calculate reorder quantity
        const reservedAndInbound = (item.reservedQuantity || 0) + (item.inboundQuantity || 0);
        const availableInventory = Math.max(0, item.quantity - reservedAndInbound);
        
        let reorderQuantity = Math.max(0, recommendedLevel - availableInventory);
        
        // Apply min/max constraints
        reorderQuantity = Math.max(
          reorderQuantity > 0 ? params.minimumReorderQuantity : 0, 
          Math.min(reorderQuantity, params.maximumReorderQuantity)
        );
        
        // Calculate expected days of coverage at recommended level
        const daysOfCoverageAtRecommendedLevel = adjustedDailySales > 0
          ? recommendedLevel / adjustedDailySales
          : 365; // If no sales, assume 1 year
        
        // Determine risk level
        let riskLevel: RiskLevel;
        if (daysOfCoverageAtCurrentLevel <= params.leadTimeDays) {
          riskLevel = 'high';
        } else if (daysOfCoverageAtCurrentLevel <= params.leadTimeDays + params.safetyStockDays) {
          riskLevel = 'medium';
        } else {
          riskLevel = 'low';
        }
        
        // Calculate estimated stockout date
        const estimatedStockoutDate = adjustedDailySales > 0 && item.quantity > 0
          ? new Date(Date.now() + daysOfCoverageAtCurrentLevel * 24 * 60 * 60 * 1000)
          : undefined;
        
        // Calculate estimated lost sales if not restocked
        const estimatedLostSales = adjustedDailySales > 0
          ? Math.max(0, adjustedDailySales * params.targetDaysOfCoverage - item.quantity)
          : 0;
        
        // Determine reason for recommendation
        let recommendationReason = '';
        if (reorderQuantity > 0) {
          if (riskLevel === 'high') {
            recommendationReason = 'Imminent stockout risk based on sales velocity.';
          } else if (riskLevel === 'medium') {
            recommendationReason = 'Inventory below safety stock level.';
          } else {
            recommendationReason = 'Restock to maintain optimal inventory level.';
          }
        } else if (item.quantity > recommendedLevel * 1.5) {
          recommendationReason = 'Excess inventory based on current sales velocity.';
        } else {
          recommendationReason = 'Inventory levels within optimal range.';
        }
        
        // Return recommendation
        return {
          sku: item.sku,
          asin: item.asin,
          currentLevel: item.quantity,
          recommendedLevel,
          reorderQuantity,
          confidence: this.calculateConfidenceScore(salesHistory),
          daysOfCoverageAtCurrentLevel,
          daysOfCoverageAtRecommendedLevel,
          riskLevel,
          estimatedStockoutDate,
          estimatedLostSales,
          recommendationReason
        };
      });
    } catch (error) {
      throw AmazonErrorHandler.createError(
        `Failed to get inventory recommendations: ${error instanceof Error ? error.message : String(error)}`,
        AmazonErrorCode.SERVICE_UNAVAILABLE,
        error
      );
    }
  }
  
  /**
   * Get sales velocity metrics for a list of SKUs
   * @param skus List of SKUs to analyze
   * @param dayRange Number of historical days to consider
   * @returns Sales velocity metrics
   */
  public async getSalesVelocityMetrics(
    skus: string[], 
    dayRange: number = 90
  ): Promise<SalesVelocityMetrics[]> {
    try {
      // Get inventory items with sales data
      const inventoryItems = await this.getInventoryData(skus);
      
      return inventoryItems.map(item => {
        const salesHistory = item.dailySalesHistory || [];
        
        // Ensure we have enough sales history
        const paddedSalesHistory = salesHistory.slice(0, dayRange);
        const paddedHistory = [...paddedSalesHistory];
        while (paddedHistory.length < dayRange) {
          paddedHistory.unshift(0); // Pad with zeros if we don't have enough history
        }
        
        // Calculate sales for different time periods
        const unitsSold7Days = this.sumLastNDays(paddedHistory, 7);
        const unitsSold30Days = this.sumLastNDays(paddedHistory, 30);
        const unitsSold60Days = this.sumLastNDays(paddedHistory, 60);
        const unitsSold90Days = this.sumLastNDays(paddedHistory, 90);
        
        // Calculate averages
        const averageDailySales = unitsSold30Days / 30;
        const averageWeeklySales = unitsSold30Days / 4.29; // 30 days ÷ 4.29 weeks
        
        // Determine sales trend
        const recentSales = this.sumLastNDays(paddedHistory, 15);
        const previousSales = this.sumLastNDays(paddedHistory.slice(15), 15);
        
        let salesTrend: SalesTrend;
        const trendRatio = previousSales > 0 ? recentSales / previousSales : 1;
        
        if (trendRatio > 1.2) {
          salesTrend = 'increasing';
        } else if (trendRatio < 0.8) {
          salesTrend = 'decreasing';
        } else {
          salesTrend = 'stable';
        }
        
        // Calculate seasonality factor (simple implementation)
        // In a real implementation, this would consider multiple years of data
        const seasonalityFactor = this.calculateSeasonalityFactor(paddedHistory);
        
        // Simple sales forecast
        // In a real implementation, use more sophisticated time-series forecasting
        const growthFactor = this.calculateGrowthFactor(paddedHistory);
        const forecastDailySales = averageDailySales * growthFactor * seasonalityFactor;
        
        return {
          sku: item.sku,
          asin: item.asin,
          unitsSold7Days,
          unitsSold30Days,
          unitsSold60Days,
          unitsSold90Days,
          averageDailySales,
          averageWeeklySales,
          salesTrend,
          salesForecast30Days: Math.round(forecastDailySales * 30),
          salesForecast60Days: Math.round(forecastDailySales * 60),
          salesForecast90Days: Math.round(forecastDailySales * 90),
          seasonalityFactor
        };
      });
    } catch (error) {
      throw AmazonErrorHandler.createError(
        `Failed to get sales velocity metrics: ${error instanceof Error ? error.message : String(error)}`,
        AmazonErrorCode.SERVICE_UNAVAILABLE,
        error
      );
    }
  }
  
  /**
   * Get FBA fee estimates for inventory planning
   * @param skus List of SKUs to get fee estimates for
   * @returns FBA fee estimates
   */
  public async getFbaFeeEstimates(skus: string[]): Promise<FbaFeeEstimates[]> {
    try {
      // Get inventory items with sales data
      const inventoryItems = await this.getInventoryData(skus);
      
      // In a real implementation, this would call the FBA Fee API
      // For this example, we'll calculate approximate fees
      return inventoryItems.map(item => {
        // Default values for demonstration - in real implementation, use Amazon's API
        const price = item.price || 20;
        
        // Simplified fee calculations
        const fulfillmentFeePerUnit = 3.5; // Base fee
        const monthlyStorageFeePerUnit = 0.75; // Estimate
        const longTermStorageFeePerUnit = (item.inventoryAge || 0) > 365 ? 1.5 : undefined;
        const referralFeePercent = 0.15; // 15% is typical
        
        // Calculate storage days based on sales velocity
        const salesHistory = item.dailySalesHistory || [];
        const averageDailySales = salesHistory.length > 0
          ? salesHistory.reduce((sum, sales) => sum + sales, 0) / salesHistory.length
          : 0.1; // Assume slow-moving if no history
          
        const estimatedStorageDays = averageDailySales > 0
          ? Math.min(365, Math.round(item.quantity / averageDailySales))
          : 365; // Cap at 1 year
        
        // Total FBA fees
        const monthlyStorageCost = monthlyStorageFeePerUnit * (estimatedStorageDays / 30);
        const longTermCost = longTermStorageFeePerUnit || 0;
        const totalFbaFeesPerUnit = fulfillmentFeePerUnit + monthlyStorageCost + longTermCost;
        
        return {
          sku: item.sku,
          asin: item.asin,
          fulfillmentFeePerUnit,
          monthlyStorageFeePerUnit,
          longTermStorageFeePerUnit,
          estimatedStorageDays,
          totalFbaFeesPerUnit,
          referralFeePercent,
          currencyCode: this.options.defaultCurrencyCode || 'USD'
        };
      });
    } catch (error) {
      throw AmazonErrorHandler.createError(
        `Failed to get FBA fee estimates: ${error instanceof Error ? error.message : String(error)}`,
        AmazonErrorCode.SERVICE_UNAVAILABLE,
        error
      );
    }
  }
  
  /**
   * Assess inventory health for a list of SKUs
   * @param skus List of SKUs to assess
   * @returns Inventory health assessments
   */
  public async assessInventoryHealth(skus: string[]): Promise<InventoryHealthAssessment[]> {
    try {
      // Get inventory items with sales data
      const inventoryItems = await this.getInventoryData(skus);
      
      // Get sales velocity metrics
      const salesMetrics = await this.getSalesVelocityMetrics(skus);
      
      return inventoryItems.map((item, index) => {
        const metrics = salesMetrics[index];
        const inventoryAgeDays = item.inventoryAge || 0;
        
        // Calculate sell-through rate (units sold per unit of inventory per month)
        const sellThroughRate = item.quantity > 0
          ? metrics.unitsSold30Days / item.quantity
          : 0;
        
        // Determine inventory health status
        let healthStatus: InventoryHealthStatus;
        if (item.quantity === 0) {
          healthStatus = InventoryHealthStatus.OUT_OF_STOCK;
        } else if (metrics.averageDailySales === 0) {
          healthStatus = InventoryHealthStatus.SLOW_MOVING;
        } else if (inventoryAgeDays > 365) {
          healthStatus = InventoryHealthStatus.OVERAGED;
        } else if (metrics.averageDailySales * 15 > item.quantity) { // Less than 15 days coverage
          healthStatus = InventoryHealthStatus.LOW;
        } else if (metrics.averageDailySales * 120 < item.quantity) { // More than 120 days coverage
          healthStatus = InventoryHealthStatus.EXCESS;
        } else {
          healthStatus = InventoryHealthStatus.HEALTHY;
        }
        
        // Calculate excess inventory
        const targetInventory = Math.ceil(metrics.averageDailySales * 90); // 90 days as target
        const excessUnits = Math.max(0, item.quantity - targetInventory);
        const excessInventoryPercent = item.quantity > 0
          ? (excessUnits / item.quantity) * 100
          : 0;
        
        // Calculate storage costs
        const monthlyStorageCost = 0.75 * item.quantity; // Example rate of $0.75 per unit per month
        
        // Calculate excess inventory cost
        const excessInventoryCost = excessUnits * (item.cost || 10); // Use cost if available, else assume $10
        
        // Generate recommended actions
        const recommendedActions: string[] = [];
        
        if (healthStatus === InventoryHealthStatus.EXCESS) {
          recommendedActions.push('Consider running a promotion to reduce excess inventory.');
          recommendedActions.push('Evaluate pricing strategy to increase sales velocity.');
        } else if (healthStatus === InventoryHealthStatus.LOW) {
          recommendedActions.push('Restock soon to avoid stockouts.');
          recommendedActions.push('Consider expedited shipping for next inventory order.');
        } else if (healthStatus === InventoryHealthStatus.OUT_OF_STOCK) {
          recommendedActions.push('Restock immediately to minimize lost sales.');
          recommendedActions.push('Review purchasing process to prevent future stockouts.');
        } else if (healthStatus === InventoryHealthStatus.SLOW_MOVING) {
          recommendedActions.push('Consider marketing efforts to increase demand.');
          recommendedActions.push('Evaluate pricing strategy or consider liquidation.');
        } else if (healthStatus === InventoryHealthStatus.OVERAGED) {
          recommendedActions.push('Consider removing inventory to avoid long-term storage fees.');
          recommendedActions.push('Run promotions to clear aging inventory.');
        }
        
        return {
          sku: item.sku,
          asin: item.asin,
          healthStatus,
          inventoryAgeDays,
          atRiskOfLtsfFees: inventoryAgeDays > 270, // 9 months as risk threshold
          excessInventoryPercent: excessInventoryPercent > 0 ? excessInventoryPercent : undefined,
          excessInventoryCost: excessInventoryCost > 0 ? excessInventoryCost : undefined,
          monthlyStorageCost,
          recommendedActions,
          sellThroughRate
        };
      });
    } catch (error) {
      throw AmazonErrorHandler.createError(
        `Failed to assess inventory health: ${error instanceof Error ? error.message : String(error)}`,
        AmazonErrorCode.SERVICE_UNAVAILABLE,
        error
      );
    }
  }
  
  /**
   * Get excess inventory report
   * @returns Excess inventory items
   */
  public async getExcessInventoryReport(): Promise<InventoryHealthAssessment[]> {
    try {
      // Get all inventory items
      const inventoryItems = await this.getInventoryData([]);
      
      // Assess health for all items
      const healthAssessments = await this.assessInventoryHealth(
        inventoryItems.map(item => item.sku)
      );
      
      // Filter to excess items only
      return healthAssessments.filter(item => item.healthStatus === InventoryHealthStatus.EXCESS);
    } catch (error) {
      throw AmazonErrorHandler.createError(
        `Failed to get excess inventory report: ${error instanceof Error ? error.message : String(error)}`,
        AmazonErrorCode.SERVICE_UNAVAILABLE,
        error
      );
    }
  }
  
  /**
   * Get low inventory report
   * @param daysOfCoverageThreshold Threshold for days of coverage to consider low
   * @returns Low inventory items
   */
  public async getLowInventoryReport(
    daysOfCoverageThreshold: number = 14
  ): Promise<InventoryLevelRecommendation[]> {
    try {
      // Get all inventory items
      const inventoryItems = await this.getInventoryData([]);
      
      // Get recommendations for all items
      const recommendations = await this.getInventoryRecommendations(
        inventoryItems.map(item => item.sku)
      );
      
      // Filter to low inventory items based on threshold
      return recommendations.filter(item => 
        item.daysOfCoverageAtCurrentLevel < daysOfCoverageThreshold
      );
    } catch (error) {
      throw AmazonErrorHandler.createError(
        `Failed to get low inventory report: ${error instanceof Error ? error.message : String(error)}`,
        AmazonErrorCode.SERVICE_UNAVAILABLE,
        error
      );
    }
  }
  
  /**
   * Get optimal reorder plan based on constraints
   * @param planningParams Planning parameters
   * @returns Optimized reorder recommendations
   */
  public async getOptimalReorderPlan(
    planningParams: InventoryPlanningParams
  ): Promise<InventoryLevelRecommendation[]> {
    try {
      // Get all inventory items
      const inventoryItems = await this.getInventoryData([]);
      
      // Get basic recommendations
      const recommendations = await this.getInventoryRecommendations(
        inventoryItems.map(item => item.sku),
        planningParams
      );
      
      // If we have budget constraints, optimize based on inventory value and priority
      if (
        planningParams.applyBudgetConstraints && 
        planningParams.maxBudget && 
        planningParams.maxBudget < Infinity
      ) {
        return this.optimizeForBudget(
          recommendations, 
          inventoryItems, 
          planningParams.maxBudget, 
          planningParams.maxUnits
        );
      }
      
      return recommendations;
    } catch (error) {
      throw AmazonErrorHandler.createError(
        `Failed to get optimal reorder plan: ${error instanceof Error ? error.message : String(error)}`,
        AmazonErrorCode.SERVICE_UNAVAILABLE,
        error
      );
    }
  }
  
  /**
   * Optimize inventory recommendations for budget constraints
   * @param recommendations Initial recommendations
   * @param inventoryItems Inventory items with cost data
   * @param maxBudget Maximum budget
   * @param maxUnits Maximum units
   * @returns Optimized recommendations
   */
  private optimizeForBudget(
    recommendations: InventoryLevelRecommendation[], 
    inventoryItems: AmazonInventoryItem[], 
    maxBudget: number, 
    maxUnits: number = Infinity
  ): InventoryLevelRecommendation[] {
    // Create a map of SKU to cost
    const skuToCost = new Map<string, number>();
    for (const item of inventoryItems) {
      skuToCost.set(item.sku, item.cost || 10); // Default to $10 if cost not available
    }
    
    // Prioritize by risk level and days of coverage
    const sortedRecommendations = [...recommendations].sort((a, b) => {
      // First by risk level (high > medium > low)
      const riskOrder: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2 };
      const riskCompare = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      if (riskCompare !== 0) return riskCompare;
      
      // Then by days of coverage (lower is higher priority)
      return a.daysOfCoverageAtCurrentLevel - b.daysOfCoverageAtCurrentLevel;
    });
    
    // Apply budget constraints
    let remainingBudget = maxBudget;
    let remainingUnits = maxUnits;
    
    const optimizedRecommendations = sortedRecommendations.map(recommendation => {
      const itemCost = skuToCost.get(recommendation.sku) || 10;
      const totalCost = itemCost * recommendation.reorderQuantity;
      const originalReorderQuantity = recommendation.reorderQuantity;
      
      // Check if we can afford this item
      if (totalCost <= remainingBudget && recommendation.reorderQuantity <= remainingUnits) {
        // Full quantity fits within budget
        remainingBudget -= totalCost;
        remainingUnits -= recommendation.reorderQuantity;
      } else if (remainingBudget > 0 && remainingUnits > 0) {
        // Partial quantity fits
        const affordableByBudget = Math.floor(remainingBudget / itemCost);
        const affordableQuantity = Math.min(affordableByBudget, remainingUnits);
        
        if (affordableQuantity > 0) {
          recommendation.reorderQuantity = affordableQuantity;
          remainingBudget -= affordableQuantity * itemCost;
          remainingUnits -= affordableQuantity;
          
          // Update the recommendation reason
          recommendation.recommendationReason = `Reduced order quantity from ${originalReorderQuantity} to ${affordableQuantity} due to budget constraints.`;
        } else {
          recommendation.reorderQuantity = 0;
          recommendation.recommendationReason = 'No reorder due to budget constraints.';
        }
      } else {
        // No budget remaining
        recommendation.reorderQuantity = 0;
        recommendation.recommendationReason = 'No reorder due to budget constraints.';
      }
      
      return recommendation;
    });
    
    return optimizedRecommendations;
  }
  
  /**
   * Sum the last N days of sales from a sales history array
   * @param salesHistory Array of daily sales
   * @param days Number of days to sum
   * @returns Sum of sales
   */
  private sumLastNDays(salesHistory: number[], days: number): number {
    return salesHistory.slice(0, days).reduce((sum, sales) => sum + sales, 0);
  }
  
  /**
   * Calculate a confidence score based on sales history
   * @param salesHistory Array of daily sales
   * @returns Confidence score (0-1)
   */
  private calculateConfidenceScore(salesHistory: number[]): number {
    if (!salesHistory || salesHistory.length === 0) {
      return 0.3; // Low confidence with no data
    }
    
    // More data = higher confidence
    const dataPointsFactor = Math.min(1, salesHistory.length / 60); // Max confidence at 60 days
    
    // Lower variance = higher confidence
    const mean = salesHistory.reduce((sum, sales) => sum + sales, 0) / salesHistory.length;
    const variance = salesHistory.reduce((sum, sales) => sum + Math.pow(sales - mean, 2), 0) / salesHistory.length;
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 1; // Coefficient of variation
    const varianceFactor = Math.max(0, 1 - Math.min(1, cv));
    
    // Calculate combined confidence
    return 0.3 + (0.7 * dataPointsFactor * varianceFactor);
  }
  
  /**
   * Calculate a seasonality factor based on sales history
   * @param salesHistory Array of daily sales
   * @returns Seasonality factor
   */
  private calculateSeasonalityFactor(salesHistory: number[]): number {
    // This is a simplified approach - a real implementation would analyze multiple years
    // of data and use time-series decomposition
    
    // For this example, we'll use a simple ratio of recent to overall average
    if (salesHistory.length < 30) {
      return 1.0; // Not enough data to determine seasonality
    }
    
    const recentSales = this.sumLastNDays(salesHistory, 15);
    const fullPeriodSales = this.sumLastNDays(salesHistory, salesHistory.length);
    
    // Calculate average daily sales for each period
    const recentDailyAvg = recentSales / 15;
    const fullPeriodDailyAvg = fullPeriodSales / salesHistory.length;
    
    // Calculate the seasonality factor with bounds
    return fullPeriodDailyAvg > 0
      ? Math.max(0.5, Math.min(2.0, recentDailyAvg / fullPeriodDailyAvg))
      : 1.0;
  }
  
  /**
   * Calculate a growth factor based on sales history
   * @param salesHistory Array of daily sales
   * @returns Growth factor
   */
  private calculateGrowthFactor(salesHistory: number[]): number {
    if (salesHistory.length < 60) {
      return 1.0; // Not enough data
    }
    
    // Compare recent 30 days to previous 30 days
    const recent30 = this.sumLastNDays(salesHistory, 30);
    const previous30 = this.sumLastNDays(salesHistory.slice(30), 30);
    
    // Calculate growth factor with bounds
    return previous30 > 0
      ? Math.max(0.7, Math.min(1.5, recent30 / previous30))
      : 1.0;
  }
}