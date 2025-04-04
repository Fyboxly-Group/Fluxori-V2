import { injectable, inject } from 'inversify';
import * as mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import Inventory, { IInventoryItemDocument } from '../models/inventory.model';
import { ApiError } from '../middleware/error.middleware';
import { LoggerService } from './logger.service';
import 'reflect-metadata';

/**
 * Time period for inventory reports
 */
export type ReportPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';

/**
 * Interface for inventory value report
 */
export interface InventoryValueReport {
  totalItems: number;
  totalValue: number;
  averageValue: number;
  valueByCurrency: Record<string, number>;
  valueByCategory: Record<string, number>;
  valueByWarehouse: Record<string, number>;
}

/**
 * Interface for stock level report
 */
export interface StockLevelReport {
  totalItems: number;
  inStockItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  stockByWarehouse: Record<string, {
    totalItems: number;
    inStockItems: number;
    lowStockItems: number;
    outOfStockItems: number;
  }>;
  stockByCategory: Record<string, {
    totalItems: number;
    inStockItems: number;
    lowStockItems: number;
    outOfStockItems: number;
  }>;
}

/**
 * Interface for inventory movement report
 */
export interface InventoryMovementReport {
  period: ReportPeriod;
  startDate: Date;
  endDate: Date;
  totalInbound: number;
  totalOutbound: number;
  netChange: number;
  movementByWarehouse: Record<string, {
    inbound: number;
    outbound: number;
    netChange: number;
  }>;
  movementByCategory: Record<string, {
    inbound: number;
    outbound: number;
    netChange: number;
  }>;
}

/**
 * Interface for inventory turnover report
 */
export interface InventoryTurnoverReport {
  period: ReportPeriod;
  startDate: Date;
  endDate: Date;
  overallTurnover: number;
  turnoverByCategory: Record<string, number>;
  turnoverByWarehouse: Record<string, number>;
  highestTurnoverItems: Array<{
    id: string;
    sku: string;
    name: string;
    turnover: number;
  }>;
  lowestTurnoverItems: Array<{
    id: string;
    sku: string;
    name: string;
    turnover: number;
  }>;
}

/**
 * Interface for inventory optimization report
 */
export interface InventoryOptimizationReport {
  excessStock: Array<{
    id: string;
    sku: string;
    name: string;
    currentStock: number;
    optimalStock: number;
    excessQuantity: number;
    excessValue: number;
  }>;
  recommendedRestock: Array<{
    id: string;
    sku: string;
    name: string;
    currentStock: number;
    optimalStock: number;
    restockQuantity: number;
    restockValue: number;
  }>;
  warehouseUtilization: Record<string, {
    totalCapacity: number;
    usedCapacity: number;
    utilizationPercentage: number;
  }>;
}

/**
 * Interface for inventory reporting service
 */
export interface IInventoryReportingService {
  getValueReport(organizationId: string, warehouseId?: string): Promise<InventoryValueReport>;
  getStockLevelReport(organizationId: string): Promise<StockLevelReport>;
  getMovementReport(organizationId: string, period: ReportPeriod, startDate?: Date, endDate?: Date): Promise<InventoryMovementReport>;
  getTurnoverReport(organizationId: string, period: ReportPeriod, startDate?: Date, endDate?: Date): Promise<InventoryTurnoverReport>;
  getOptimizationReport(organizationId: string): Promise<InventoryOptimizationReport>;
  getProductPerformance(organizationId: string, productId: string, period: ReportPeriod): Promise<any>;
  getABCAnalysis(organizationId: string): Promise<any>;
}

/**
 * Inventory Reporting Service
 * Handles generation of inventory reports and analytics
 */
@injectable()
export class InventoryReportingService implements IInventoryReportingService {
  constructor(
    @inject('LoggerService') private logger: LoggerService
  ) {}

  /**
   * Get inventory value report
   * @param organizationId Organization ID
   * @param warehouseId Optional warehouse ID to filter by
   */
  async getValueReport(
    organizationId: string,
    warehouseId?: string
  ): Promise<InventoryValueReport> {
    try {
      const matchStage: mongoose.PipelineStage.Match['$match'] = {
        organizationId: new mongoose.Types.ObjectId(organizationId),
        isActive: true
      };

      // Add warehouse filter if specified
      if (warehouseId) {
        matchStage['warehouseStock.warehouseId'] = new mongoose.Types.ObjectId(warehouseId);
      }

      const inventoryValue = await Inventory.aggregate([
        { $match: matchStage },
        {
          $project: {
            category: 1,
            stockQuantity: 1,
            costPrice: 1,
            currency: { $ifNull: ['$currency', 'USD'] },
            warehouseStock: 1,
            value: { $multiply: ['$stockQuantity', '$costPrice'] }
          }
        },
        {
          $group: {
            _id: null,
            totalItems: { $sum: 1 },
            totalValue: { $sum: '$value' },
            currencies: { $addToSet: '$currency' },
            categories: { $addToSet: '$category' }
          }
        }
      ]);

      // If no items found, return default structure
      if (!inventoryValue.length) {
        return {
          totalItems: 0,
          totalValue: 0,
          averageValue: 0,
          valueByCurrency: {},
          valueByCategory: {},
          valueByWarehouse: {}
        };
      }

      // Calculate values by currency
      const valueByCurrency = await Inventory.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $ifNull: ['$currency', 'USD'] },
            value: { $sum: { $multiply: ['$stockQuantity', '$costPrice'] } }
          }
        }
      ]);

      // Calculate values by category
      const valueByCategory = await Inventory.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$category',
            value: { $sum: { $multiply: ['$stockQuantity', '$costPrice'] } }
          }
        }
      ]);

      // Calculate values by warehouse
      const valueByWarehouse = await Inventory.aggregate([
        { $match: matchStage },
        { $unwind: '$warehouseStock' },
        {
          $group: {
            _id: '$warehouseStock.warehouseId',
            value: { $sum: { $multiply: ['$warehouseStock.quantity', '$costPrice'] } }
          }
        }
      ]);

      const result: InventoryValueReport = {
        totalItems: inventoryValue[0].totalItems,
        totalValue: inventoryValue[0].totalValue,
        averageValue: inventoryValue[0].totalItems > 0 ? 
          inventoryValue[0].totalValue / inventoryValue[0].totalItems : 0,
        valueByCurrency: valueByCurrency.reduce((acc, curr) => {
          acc[curr._id] = curr.value;
          return acc;
        }, {} as Record<string, number>),
        valueByCategory: valueByCategory.reduce((acc, curr) => {
          acc[curr._id] = curr.value;
          return acc;
        }, {} as Record<string, number>),
        valueByWarehouse: valueByWarehouse.reduce((acc, curr) => {
          acc[curr._id.toString()] = curr.value;
          return acc;
        }, {} as Record<string, number>)
      };

      return result;
    } catch (error) {
      this.logger.error('Error in InventoryReportingService.getValueReport', { 
        error: error instanceof Error ? error.message : String(error),
        organizationId,
        warehouseId
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Get stock level report
   * @param organizationId Organization ID
   */
  async getStockLevelReport(organizationId: string): Promise<StockLevelReport> {
    try {
      const allInventoryItems = await Inventory.find({
        organizationId: new mongoose.Types.ObjectId(organizationId),
        isActive: true
      });

      if (!allInventoryItems.length) {
        return {
          totalItems: 0,
          inStockItems: 0,
          lowStockItems: 0,
          outOfStockItems: 0,
          stockByWarehouse: {},
          stockByCategory: {}
        };
      }

      // Count items by stock level
      const totalItems = allInventoryItems.length;
      const inStockItems = allInventoryItems.filter(item => 
        item.stockQuantity > item.reorderPoint
      ).length;
      const lowStockItems = allInventoryItems.filter(item => 
        item.stockQuantity > 0 && item.stockQuantity <= item.reorderPoint
      ).length;
      const outOfStockItems = allInventoryItems.filter(item => 
        item.stockQuantity === 0
      ).length;

      // Gather unique warehouses and categories
      const warehouseIds = new Set<string>();
      const categories = new Set<string>();

      allInventoryItems.forEach(item => {
        if (item.category) categories.add(item.category);
        
        item.warehouseStock?.forEach(ws => {
          warehouseIds.add(ws.warehouseId.toString());
        });
      });

      // Calculate stock levels by warehouse
      const stockByWarehouse: Record<string, {
        totalItems: number;
        inStockItems: number;
        lowStockItems: number;
        outOfStockItems: number;
      }> = {};

      for (const warehouseId of warehouseIds) {
        const itemsInWarehouse = allInventoryItems.filter(item => 
          item.warehouseStock?.some(ws => ws.warehouseId.toString() === warehouseId)
        );

        stockByWarehouse[warehouseId] = {
          totalItems: itemsInWarehouse.length,
          inStockItems: itemsInWarehouse.filter(item => {
            const warehouseStock = item.warehouseStock?.find(ws => 
              ws.warehouseId.toString() === warehouseId
            );
            return warehouseStock && warehouseStock.quantity > item.reorderPoint;
          }).length,
          lowStockItems: itemsInWarehouse.filter(item => {
            const warehouseStock = item.warehouseStock?.find(ws => 
              ws.warehouseId.toString() === warehouseId
            );
            return warehouseStock && warehouseStock.quantity > 0 && warehouseStock.quantity <= item.reorderPoint;
          }).length,
          outOfStockItems: itemsInWarehouse.filter(item => {
            const warehouseStock = item.warehouseStock?.find(ws => 
              ws.warehouseId.toString() === warehouseId
            );
            return !warehouseStock || warehouseStock.quantity === 0;
          }).length
        };
      }

      // Calculate stock levels by category
      const stockByCategory: Record<string, {
        totalItems: number;
        inStockItems: number;
        lowStockItems: number;
        outOfStockItems: number;
      }> = {};

      for (const category of categories) {
        const itemsInCategory = allInventoryItems.filter(item => item.category === category);

        stockByCategory[category] = {
          totalItems: itemsInCategory.length,
          inStockItems: itemsInCategory.filter(item => 
            item.stockQuantity > item.reorderPoint
          ).length,
          lowStockItems: itemsInCategory.filter(item => 
            item.stockQuantity > 0 && item.stockQuantity <= item.reorderPoint
          ).length,
          outOfStockItems: itemsInCategory.filter(item => 
            item.stockQuantity === 0
          ).length
        };
      }

      return {
        totalItems,
        inStockItems,
        lowStockItems,
        outOfStockItems,
        stockByWarehouse,
        stockByCategory
      };
    } catch (error) {
      this.logger.error('Error in InventoryReportingService.getStockLevelReport', { 
        error: error instanceof Error ? error.message : String(error),
        organizationId
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Get inventory movement report
   * @param organizationId Organization ID
   * @param period Report period
   * @param startDate Optional custom start date
   * @param endDate Optional custom end date
   */
  async getMovementReport(
    organizationId: string,
    period: ReportPeriod,
    startDate?: Date,
    endDate?: Date
  ): Promise<InventoryMovementReport> {
    try {
      // Calculate date range based on period
      const dates = this.calculateDateRange(period, startDate, endDate);
      
      // In a real implementation, we would query activity logs or stock movement transactions
      // This is a simplified mock implementation
      const mockReport: InventoryMovementReport = {
        period,
        startDate: dates.startDate,
        endDate: dates.endDate,
        totalInbound: 1250,
        totalOutbound: 850,
        netChange: 400,
        movementByWarehouse: {
          'warehouse1': {
            inbound: 750,
            outbound: 500,
            netChange: 250
          },
          'warehouse2': {
            inbound: 500,
            outbound: 350,
            netChange: 150
          }
        },
        movementByCategory: {
          'Electronics': {
            inbound: 500,
            outbound: 400,
            netChange: 100
          },
          'Clothing': {
            inbound: 400,
            outbound: 300,
            netChange: 100
          },
          'Home Goods': {
            inbound: 350,
            outbound: 150,
            netChange: 200
          }
        }
      };

      return mockReport;
    } catch (error) {
      this.logger.error('Error in InventoryReportingService.getMovementReport', { 
        error: error instanceof Error ? error.message : String(error),
        organizationId,
        period
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Get inventory turnover report
   * @param organizationId Organization ID
   * @param period Report period
   * @param startDate Optional custom start date
   * @param endDate Optional custom end date
   */
  async getTurnoverReport(
    organizationId: string,
    period: ReportPeriod,
    startDate?: Date,
    endDate?: Date
  ): Promise<InventoryTurnoverReport> {
    try {
      // Calculate date range based on period
      const dates = this.calculateDateRange(period, startDate, endDate);
      
      // In a real implementation, we would calculate inventory turnover based on COGS and average inventory
      // This is a simplified mock implementation
      const mockReport: InventoryTurnoverReport = {
        period,
        startDate: dates.startDate,
        endDate: dates.endDate,
        overallTurnover: 4.5,
        turnoverByCategory: {
          'Electronics': 6.2,
          'Clothing': 5.8,
          'Home Goods': 2.1
        },
        turnoverByWarehouse: {
          'warehouse1': 4.8,
          'warehouse2': 4.2
        },
        highestTurnoverItems: [
          { id: '1', sku: 'SKU001', name: 'Product 1', turnover: 12.5 },
          { id: '2', sku: 'SKU002', name: 'Product 2', turnover: 10.2 },
          { id: '3', sku: 'SKU003', name: 'Product 3', turnover: 9.7 }
        ],
        lowestTurnoverItems: [
          { id: '4', sku: 'SKU004', name: 'Product 4', turnover: 0.8 },
          { id: '5', sku: 'SKU005', name: 'Product 5', turnover: 1.2 },
          { id: '6', sku: 'SKU006', name: 'Product 6', turnover: 1.5 }
        ]
      };

      return mockReport;
    } catch (error) {
      this.logger.error('Error in InventoryReportingService.getTurnoverReport', { 
        error: error instanceof Error ? error.message : String(error),
        organizationId,
        period
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Get inventory optimization report
   * @param organizationId Organization ID
   */
  async getOptimizationReport(organizationId: string): Promise<InventoryOptimizationReport> {
    try {
      // In a real implementation, this would analyze sales data, lead times, and inventory carrying costs
      // to provide optimization recommendations
      // This is a simplified mock implementation
      const mockReport: InventoryOptimizationReport = {
        excessStock: [
          { id: '1', sku: 'SKU001', name: 'Product 1', currentStock: 250, optimalStock: 150, excessQuantity: 100, excessValue: 5000 },
          { id: '2', sku: 'SKU002', name: 'Product 2', currentStock: 180, optimalStock: 120, excessQuantity: 60, excessValue: 3600 }
        ],
        recommendedRestock: [
          { id: '3', sku: 'SKU003', name: 'Product 3', currentStock: 30, optimalStock: 100, restockQuantity: 70, restockValue: 3500 },
          { id: '4', sku: 'SKU004', name: 'Product 4', currentStock: 15, optimalStock: 80, restockQuantity: 65, restockValue: 5200 }
        ],
        warehouseUtilization: {
          'warehouse1': {
            totalCapacity: 10000,
            usedCapacity: 6500,
            utilizationPercentage: 65
          },
          'warehouse2': {
            totalCapacity: 8000,
            usedCapacity: 6000,
            utilizationPercentage: 75
          }
        }
      };

      return mockReport;
    } catch (error) {
      this.logger.error('Error in InventoryReportingService.getOptimizationReport', { 
        error: error instanceof Error ? error.message : String(error),
        organizationId
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Get performance metrics for a specific product
   * @param organizationId Organization ID
   * @param productId Product ID
   * @param period Report period
   */
  async getProductPerformance(
    organizationId: string,
    productId: string,
    period: ReportPeriod
  ): Promise<any> {
    try {
      // In a real implementation, this would analyze sales data, stock levels, and other metrics
      // for the specific product
      // This is a simplified mock implementation
      return {
        productId,
        period,
        salesVolume: 120,
        revenue: 9600,
        profitMargin: 28.5,
        averageOrderValue: 80,
        stockTurnover: 5.2,
        daysInStock: 70,
        returnRate: 2.3,
        stockoutFrequency: 0.5
      };
    } catch (error) {
      this.logger.error('Error in InventoryReportingService.getProductPerformance', { 
        error: error instanceof Error ? error.message : String(error),
        organizationId,
        productId,
        period
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Get ABC analysis of inventory items
   * @param organizationId Organization ID
   */
  async getABCAnalysis(organizationId: string): Promise<any> {
    try {
      // In a real implementation, this would categorize inventory into A, B, and C classes
      // based on value and volume
      // This is a simplified mock implementation
      return {
        aItems: {
          count: 25,
          valuePercentage: 70,
          items: [
            { id: '1', sku: 'SKU001', name: 'Product 1', value: 25000, percentage: 15 },
            { id: '2', sku: 'SKU002', name: 'Product 2', value: 18000, percentage: 11 }
          ]
        },
        bItems: {
          count: 75,
          valuePercentage: 20,
          items: [
            { id: '3', sku: 'SKU003', name: 'Product 3', value: 5000, percentage: 3 },
            { id: '4', sku: 'SKU004', name: 'Product 4', value: 4200, percentage: 2.5 }
          ]
        },
        cItems: {
          count: 200,
          valuePercentage: 10,
          items: [
            { id: '5', sku: 'SKU005', name: 'Product 5', value: 800, percentage: 0.5 },
            { id: '6', sku: 'SKU006', name: 'Product 6', value: 650, percentage: 0.4 }
          ]
        }
      };
    } catch (error) {
      this.logger.error('Error in InventoryReportingService.getABCAnalysis', { 
        error: error instanceof Error ? error.message : String(error),
        organizationId
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Calculate date range based on period
   * @param period Report period
   * @param startDate Optional custom start date
   * @param endDate Optional custom end date
   */
  private calculateDateRange(
    period: ReportPeriod,
    startDate?: Date,
    endDate?: Date
  ): { startDate: Date, endDate: Date } {
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Use custom dates if provided
    if (startDate && endDate) {
      return { startDate, endDate };
    }

    let calculatedStartDate: Date;

    switch (period) {
      case 'day':
        calculatedStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        break;
      case 'week':
        calculatedStartDate = new Date(now);
        calculatedStartDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        calculatedStartDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'quarter':
        calculatedStartDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'year':
        calculatedStartDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        calculatedStartDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
    }

    return {
      startDate: calculatedStartDate,
      endDate: endDate || endOfDay
    };
  }
}

export default new InventoryReportingService();