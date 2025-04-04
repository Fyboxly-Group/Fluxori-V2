import { injectable, inject } from 'inversify';
import * as mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import Inventory, { IInventoryItemDocument } from '../models/inventory.model';
import InventoryAlert from '../models/inventory-alert.model';
import Supplier from '../models/supplier.model';
import PurchaseOrder from '../models/purchase-order.model';
import { ApiError } from '../middleware/error.middleware';
import { LoggerService } from './logger.service';
import { InventoryService } from './inventory.service';
import { ActivityService } from './activity.service';
import 'reflect-metadata';

/**
 * Interface for reorder recommendation
 */
export interface ReorderRecommendation {
  item: IInventoryItemDocument;
  currentStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  suggestedQuantity: number;
  supplier: {
    id: string;
    name: string;
  };
  estimatedCost: number;
  warehouseId?: string;
  urgency: 'high' | 'medium' | 'low';
}

/**
 * Interface for reorder request
 */
export interface ReorderRequest {
  inventoryId: string;
  quantity: number;
  supplierId: string;
  warehouseId?: string;
  notes?: string;
  expectedDeliveryDate?: Date;
}

/**
 * Interface for reorder group by supplier
 */
export interface SupplierReorderGroup {
  supplier: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    itemId: string;
    sku: string;
    name: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
  totalItems: number;
  totalCost: number;
}

/**
 * Interface for reorder settings
 */
export interface ReorderSettings {
  autoReorderEnabled: boolean;
  approvalRequired: boolean;
  minimumOrderValue: number;
  preferredSuppliers: string[];
  consolidateBySupplier: boolean;
  defaultLeadTime: number;
  safetyStockPercentage: number;
  maxOrderFrequency: number; // days
}

/**
 * Service interface for dependency injection
 */
export interface IInventoryReorderService {
  getReorderRecommendations(organizationId: string, warehouseId?: string): Promise<ReorderRecommendation[]>;
  createReorderRequest(request: ReorderRequest, userId: string, organizationId: string): Promise<any>;
  createPurchaseOrderFromRecommendations(
    recommendations: ReorderRecommendation[],
    userId: string,
    organizationId: string,
    notes?: string
  ): Promise<any>;
  groupRecommendationsBySupplier(recommendations: ReorderRecommendation[]): Promise<SupplierReorderGroup[]>;
  getReorderSettings(organizationId: string): Promise<ReorderSettings>;
  updateReorderSettings(organizationId: string, settings: Partial<ReorderSettings>): Promise<ReorderSettings>;
  performAutoReorder(organizationId: string): Promise<any>;
}

/**
 * Inventory Reorder Service
 * Handles reordering logic for inventory items
 */
@injectable()
export class InventoryReorderService implements IInventoryReorderService {
  constructor(
    @inject('LoggerService') private logger: LoggerService,
    @inject('InventoryService') private inventoryService: InventoryService
  ) {}

  /**
   * Get reorder recommendations for inventory items
   * @param organizationId Organization ID
   * @param warehouseId Optional warehouse ID for warehouse-specific recommendations
   */
  async getReorderRecommendations(
    organizationId: string,
    warehouseId?: string
  ): Promise<ReorderRecommendation[]> {
    try {
      // Query parameters
      const query: mongoose.FilterQuery<IInventoryItemDocument> = {
        organizationId: new mongoose.Types.ObjectId(organizationId),
        isActive: true,
        $expr: { $lte: ['$stockQuantity', '$reorderPoint'] }
      };

      // Add warehouse filter if specified
      if (warehouseId) {
        query['warehouseStock.warehouseId'] = new mongoose.Types.ObjectId(warehouseId);
      }

      // Find items that need to be reordered
      const lowStockItems = await Inventory
        .find(query)
        .populate('supplier', 'name email phone');

      if (!lowStockItems.length) {
        return [];
      }

      // Create recommendations
      const recommendations: ReorderRecommendation[] = [];

      for (const item of lowStockItems) {
        // Get current stock for this warehouse if specified
        let currentStock = item.stockQuantity;
        if (warehouseId) {
          const warehouseStock = item.warehouseStock?.find(
            ws => ws.warehouseId.toString() === warehouseId
          );
          currentStock = warehouseStock?.quantity || 0;
        }

        // Calculate suggested quantity
        // Basic calculation: reorderQuantity + (reorderPoint - currentStock)
        // This ensures you get back above reorder point
        const suggestedQuantity = Math.max(
          item.reorderQuantity,
          item.reorderQuantity + (item.reorderPoint - currentStock)
        );

        // Determine urgency
        let urgency: 'high' | 'medium' | 'low' = 'medium';
        if (currentStock === 0) {
          urgency = 'high';
        } else if (currentStock > (item.reorderPoint * 0.5)) {
          urgency = 'low';
        }

        recommendations.push({
          item,
          currentStock,
          reorderPoint: item.reorderPoint,
          reorderQuantity: item.reorderQuantity,
          suggestedQuantity,
          supplier: {
            id: item.supplier?._id.toString() || '',
            name: item.supplier?.name || 'Unknown Supplier'
          },
          estimatedCost: suggestedQuantity * item.costPrice,
          warehouseId,
          urgency
        });
      }

      // Sort by urgency
      return recommendations.sort((a, b) => {
        const urgencyValues = { high: 3, medium: 2, low: 1 };
        return urgencyValues[b.urgency] - urgencyValues[a.urgency];
      });
    } catch (error) {
      this.logger.error('Error in InventoryReorderService.getReorderRecommendations', { 
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
   * Create a reorder request for an inventory item
   * @param request Reorder request
   * @param userId User creating the request
   * @param organizationId Organization ID
   */
  async createReorderRequest(
    request: ReorderRequest,
    userId: string,
    organizationId: string
  ): Promise<any> {
    try {
      const { inventoryId, quantity, supplierId, warehouseId, notes, expectedDeliveryDate } = request;

      // Validate input
      if (!mongoose.isValidObjectId(inventoryId)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid inventory ID format');
      }

      if (!mongoose.isValidObjectId(supplierId)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid supplier ID format');
      }

      if (quantity <= 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Quantity must be greater than zero');
      }

      // Get inventory item
      const item = await Inventory.findOne({
        _id: new mongoose.Types.ObjectId(inventoryId),
        organizationId: new mongoose.Types.ObjectId(organizationId)
      });

      if (!item) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Inventory item not found');
      }

      // Get supplier
      const supplier = await Supplier.findOne({
        _id: new mongoose.Types.ObjectId(supplierId),
        organizationId: new mongoose.Types.ObjectId(organizationId)
      });

      if (!supplier) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Supplier not found');
      }

      // Create purchase order for the reorder
      const purchaseOrder = await PurchaseOrder.create({
        organizationId: new mongoose.Types.ObjectId(organizationId),
        supplier: new mongoose.Types.ObjectId(supplierId),
        status: 'draft',
        createdBy: new mongoose.Types.ObjectId(userId),
        items: [
          {
            inventory: new mongoose.Types.ObjectId(inventoryId),
            sku: item.sku,
            name: item.name,
            quantity,
            unitPrice: item.costPrice,
            totalPrice: item.costPrice * quantity
          }
        ],
        notes,
        expectedDeliveryDate,
        warehouseId: warehouseId ? new mongoose.Types.ObjectId(warehouseId) : undefined,
        totalAmount: item.costPrice * quantity
      });

      // Log activity
      await ActivityService.logActivity({
        description: `Reorder request created for ${item.name} (${item.sku})`,
        action: 'create',
        status: 'completed',
        entityType: 'purchase_order',
        entityId: purchaseOrder._id,
        userId: new mongoose.Types.ObjectId(userId),
        metadata: {
          inventoryId,
          quantity,
          supplierId,
          warehouseId,
          purchaseOrderId: purchaseOrder._id
        }
      });

      // Update or create alert for this item
      const existingAlert = await InventoryAlert.findOne({
        item: new mongoose.Types.ObjectId(inventoryId),
        status: 'active',
        alertType: 'low-stock',
        organizationId: new mongoose.Types.ObjectId(organizationId)
      });

      if (existingAlert) {
        existingAlert.status = 'in-progress';
        existingAlert.resolution = `Reorder created: PO #${purchaseOrder._id}`;
        existingAlert.actionTaken = `Ordered ${quantity} units`;
        existingAlert.updatedBy = new mongoose.Types.ObjectId(userId);
        await existingAlert.save();
      }

      this.logger.info('Created reorder request', {
        inventoryId,
        purchaseOrderId: purchaseOrder._id,
        quantity,
        supplierId,
        organizationId
      });

      return purchaseOrder;
    } catch (error) {
      this.logger.error('Error in InventoryReorderService.createReorderRequest', { 
        error: error instanceof Error ? error.message : String(error),
        request,
        organizationId
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Create a purchase order from multiple reorder recommendations
   * @param recommendations Reorder recommendations
   * @param userId User creating the purchase order
   * @param organizationId Organization ID
   * @param notes Optional notes
   */
  async createPurchaseOrderFromRecommendations(
    recommendations: ReorderRecommendation[],
    userId: string,
    organizationId: string,
    notes?: string
  ): Promise<any> {
    try {
      if (!recommendations.length) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'No recommendations provided');
      }

      // Group recommendations by supplier
      const supplierGroups = await this.groupRecommendationsBySupplier(recommendations);

      // Create purchase orders for each supplier
      const purchaseOrders = [];

      for (const group of supplierGroups) {
        const purchaseOrder = await PurchaseOrder.create({
          organizationId: new mongoose.Types.ObjectId(organizationId),
          supplier: new mongoose.Types.ObjectId(group.supplier.id),
          status: 'draft',
          createdBy: new mongoose.Types.ObjectId(userId),
          items: group.items.map(item => ({
            inventory: new mongoose.Types.ObjectId(item.itemId),
            sku: item.sku,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitCost,
            totalPrice: item.totalCost
          })),
          notes,
          totalAmount: group.totalCost
        });

        purchaseOrders.push(purchaseOrder);

        // Update alerts for these items
        for (const item of group.items) {
          const existingAlert = await InventoryAlert.findOne({
            item: new mongoose.Types.ObjectId(item.itemId),
            status: 'active',
            alertType: 'low-stock',
            organizationId: new mongoose.Types.ObjectId(organizationId)
          });

          if (existingAlert) {
            existingAlert.status = 'in-progress';
            existingAlert.resolution = `Reorder created: PO #${purchaseOrder._id}`;
            existingAlert.actionTaken = `Ordered ${item.quantity} units`;
            existingAlert.updatedBy = new mongoose.Types.ObjectId(userId);
            await existingAlert.save();
          }
        }

        // Log activity
        await ActivityService.logActivity({
          description: `Purchase order created for supplier: ${group.supplier.name}`,
          action: 'create',
          status: 'completed',
          entityType: 'purchase_order',
          entityId: purchaseOrder._id,
          userId: new mongoose.Types.ObjectId(userId),
          metadata: {
            supplierId: group.supplier.id,
            totalAmount: group.totalCost,
            itemCount: group.items.length,
            purchaseOrderId: purchaseOrder._id
          }
        });
      }

      return purchaseOrders;
    } catch (error) {
      this.logger.error('Error in InventoryReorderService.createPurchaseOrderFromRecommendations', { 
        error: error instanceof Error ? error.message : String(error),
        recommendationCount: recommendations.length,
        organizationId
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Group reorder recommendations by supplier
   * @param recommendations Reorder recommendations
   */
  async groupRecommendationsBySupplier(
    recommendations: ReorderRecommendation[]
  ): Promise<SupplierReorderGroup[]> {
    try {
      // Group by supplier
      const supplierGroups: Record<string, SupplierReorderGroup> = {};

      for (const recommendation of recommendations) {
        const supplierId = recommendation.supplier.id;
        
        if (!supplierId) {
          continue; // Skip items without a supplier
        }

        if (!supplierGroups[supplierId]) {
          // Get supplier details
          const supplier = await Supplier.findById(supplierId)
            .select('name email phone');

          supplierGroups[supplierId] = {
            supplier: {
              id: supplierId,
              name: supplier?.name || 'Unknown Supplier',
              email: supplier?.email || '',
              phone: supplier?.phone || ''
            },
            items: [],
            totalItems: 0,
            totalCost: 0
          };
        }

        // Add item to supplier group
        supplierGroups[supplierId].items.push({
          itemId: recommendation.item._id.toString(),
          sku: recommendation.item.sku,
          name: recommendation.item.name,
          quantity: recommendation.suggestedQuantity,
          unitCost: recommendation.item.costPrice,
          totalCost: recommendation.suggestedQuantity * recommendation.item.costPrice
        });

        // Update totals
        supplierGroups[supplierId].totalItems += 1;
        supplierGroups[supplierId].totalCost += recommendation.suggestedQuantity * recommendation.item.costPrice;
      }

      // Convert to array and sort by total cost (highest first)
      return Object.values(supplierGroups).sort((a, b) => b.totalCost - a.totalCost);
    } catch (error) {
      this.logger.error('Error in InventoryReorderService.groupRecommendationsBySupplier', { 
        error: error instanceof Error ? error.message : String(error),
        recommendationCount: recommendations.length
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Get reorder settings for an organization
   * @param organizationId Organization ID
   */
  async getReorderSettings(organizationId: string): Promise<ReorderSettings> {
    try {
      // In a real implementation, this would fetch settings from the database
      // This is a simplified mock implementation with defaults
      return {
        autoReorderEnabled: false,
        approvalRequired: true,
        minimumOrderValue: 500,
        preferredSuppliers: [],
        consolidateBySupplier: true,
        defaultLeadTime: 7,
        safetyStockPercentage: 20,
        maxOrderFrequency: 7
      };
    } catch (error) {
      this.logger.error('Error in InventoryReorderService.getReorderSettings', { 
        error: error instanceof Error ? error.message : String(error),
        organizationId
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Update reorder settings for an organization
   * @param organizationId Organization ID
   * @param settings Settings to update
   */
  async updateReorderSettings(
    organizationId: string,
    settings: Partial<ReorderSettings>
  ): Promise<ReorderSettings> {
    try {
      // In a real implementation, this would update settings in the database
      // This is a simplified mock implementation
      const currentSettings = await this.getReorderSettings(organizationId);
      return {
        ...currentSettings,
        ...settings
      };
    } catch (error) {
      this.logger.error('Error in InventoryReorderService.updateReorderSettings', { 
        error: error instanceof Error ? error.message : String(error),
        organizationId,
        settings
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Perform automatic reordering based on settings
   * @param organizationId Organization ID
   */
  async performAutoReorder(organizationId: string): Promise<any> {
    try {
      // Get reorder settings
      const settings = await this.getReorderSettings(organizationId);

      // Check if auto-reorder is enabled
      if (!settings.autoReorderEnabled) {
        return {
          success: false,
          message: 'Auto-reorder is disabled',
          reordersCreated: 0
        };
      }

      // Get reorder recommendations
      const recommendations = await this.getReorderRecommendations(organizationId);

      if (!recommendations.length) {
        return {
          success: true,
          message: 'No items need reordering',
          reordersCreated: 0
        };
      }

      // Group by supplier
      const supplierGroups = await this.groupRecommendationsBySupplier(recommendations);

      // Filter out groups below minimum order value
      const validGroups = supplierGroups.filter(group => 
        group.totalCost >= settings.minimumOrderValue
      );

      if (!validGroups.length) {
        return {
          success: true,
          message: 'No supplier groups meet the minimum order value',
          reordersCreated: 0
        };
      }

      // Create purchase orders (in this mock implementation, we'll just return the count)
      // In a real implementation, we would create actual purchase orders

      return {
        success: true,
        message: `Created ${validGroups.length} auto-reorders`,
        reordersCreated: validGroups.length,
        totalValue: validGroups.reduce((sum, group) => sum + group.totalCost, 0)
      };
    } catch (error) {
      this.logger.error('Error in InventoryReorderService.performAutoReorder', { 
        error: error instanceof Error ? error.message : String(error),
        organizationId
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }
}

export default new InventoryReorderService();