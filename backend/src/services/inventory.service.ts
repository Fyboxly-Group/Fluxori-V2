import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { injectable, inject } from 'inversify';
import { ApiError } from '../middleware/error.middleware';
import Inventory, { IInventoryItem, IInventoryItemDocument, IWarehouseStock } from '../models/inventory.model';
import Activity from '../models/activity.model';
import InventoryAlert, { AlertType, AlertStatus } from '../models/inventory-alert.model';
import { LoggerService } from './logger.service';
import 'reflect-metadata';

/**
 * Interface for inventory query options
 */
export interface InventoryQueryOptions {
  limit?: number;
  page?: number;
  status?: 'active' | 'inactive' | 'all';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  category?: string;
  supplier?: string;
  warehouseId?: string;
  lowStock?: boolean;
}

/**
 * Interface for inventory list result
 */
export interface InventoryListResult {
  items: IInventoryItemDocument[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Interface for stock adjustment
 */
export interface StockAdjustment {
  quantity: number;
  reason: string;
  warehouseId?: string;
  location?: string;
  reference?: string;
  note?: string;
}

/**
 * Interface for stock transfer
 */
export interface StockTransfer {
  quantity: number;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  reason: string;
  reference?: string;
  note?: string;
}

/**
 * Service interface for dependency injection
 */
export interface IInventoryService {
  getAll(organizationId: string, options: InventoryQueryOptions): Promise<InventoryListResult>;
  getById(id: string, organizationId: string): Promise<IInventoryItemDocument>;
  getByWarehouse(warehouseId: string, organizationId: string, options: InventoryQueryOptions): Promise<InventoryListResult>;
  create(data: Partial<IInventoryItem>, userId: string, organizationId: string): Promise<IInventoryItemDocument>;
  update(id: string, data: Partial<IInventoryItem>, organizationId: string): Promise<IInventoryItemDocument>;
  adjustStock(id: string, adjustment: StockAdjustment, userId: string, organizationId: string): Promise<IInventoryItemDocument>;
  transferStock(id: string, transfer: StockTransfer, userId: string, organizationId: string): Promise<IInventoryItemDocument>;
  delete(id: string, organizationId: string): Promise<boolean>;
}

/**
 * Inventory Service
 * Handles business logic for inventory operations
 */
@injectable()
export class InventoryService implements IInventoryService {
  constructor(
    @inject('LoggerService') private logger: LoggerService
  ) {}

  /**
   * Get all inventory items with pagination and filtering
   */
  async getAll(
    organizationId: string,
    options: InventoryQueryOptions = {}
  ): Promise<InventoryListResult> {
    try {
      const {
        limit = 10,
        page = 1,
        status = 'active',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search = '',
        category,
        supplier,
        lowStock = false
      } = options;

      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // Build query filters
      const query: any = {
        organizationId: new mongoose.Types.ObjectId(organizationId)
      };

      // Add status filter if specified
      if (status && status !== 'all') {
        query.isActive = status === 'active';
      }

      // Add category filter if specified
      if (category) {
        query.category = category;
      }

      // Add supplier filter if specified
      if (supplier) {
        query.supplier = new mongoose.Types.ObjectId(supplier);
      }

      // Add low stock filter if specified
      if (lowStock) {
        query.$expr = { $lt: ['$stockQuantity', '$reorderPoint'] };
      }

      // Add search filter if specified
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
          { barcode: { $regex: search, $options: 'i' } }
        ];
      }

      // Execute query with pagination
      const items = await Inventory
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('supplier', 'name');

      const total = await Inventory.countDocuments(query);

      return {
        items,
        total,
        page,
        limit
      };
    } catch (error) {
      this.logger.error('Error in InventoryService.getAll', { 
        error: error instanceof Error ? error.message : String(error),
        organizationId 
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Get inventory items for a specific warehouse
   */
  async getByWarehouse(
    warehouseId: string,
    organizationId: string,
    options: InventoryQueryOptions = {}
  ): Promise<InventoryListResult> {
    try {
      const {
        limit = 10,
        page = 1,
        status = 'active',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search = '',
        category,
        supplier,
        lowStock = false
      } = options;

      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // Build query filters
      const query: any = {
        organizationId: new mongoose.Types.ObjectId(organizationId),
        'warehouseStock.warehouseId': new mongoose.Types.ObjectId(warehouseId)
      };

      // Add status filter if specified
      if (status && status !== 'all') {
        query.isActive = status === 'active';
      }

      // Add category filter if specified
      if (category) {
        query.category = category;
      }

      // Add supplier filter if specified
      if (supplier) {
        query.supplier = new mongoose.Types.ObjectId(supplier);
      }

      // Add low stock filter if specified
      if (lowStock) {
        query.$expr = {
          $lt: [
            { $arrayElemAt: [
              '$warehouseStock.quantity',
              { $indexOfArray: ['$warehouseStock.warehouseId', new mongoose.Types.ObjectId(warehouseId)] }
            ]},
            '$reorderPoint'
          ]
        };
      }

      // Add search filter if specified
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
          { barcode: { $regex: search, $options: 'i' } }
        ];
      }

      // Execute query with pagination
      const items = await Inventory
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('supplier', 'name');

      const total = await Inventory.countDocuments(query);

      return {
        items,
        total,
        page,
        limit
      };
    } catch (error) {
      this.logger.error('Error in InventoryService.getByWarehouse', { 
        error: error instanceof Error ? error.message : String(error),
        warehouseId,
        organizationId 
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Get inventory item by ID
   */
  async getById(id: string, organizationId: string): Promise<IInventoryItemDocument> {
    try {
      // Validate input
      if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid inventory ID format');
      }

      // Find with organization security check
      const inventoryItem = await Inventory.findOne({
        _id: new mongoose.Types.ObjectId(id),
        organizationId: new mongoose.Types.ObjectId(organizationId)
      }).populate('supplier', 'name');

      if (!inventoryItem) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Inventory item not found');
      }

      return inventoryItem;
    } catch (error) {
      this.logger.error('Error in InventoryService.getById', { 
        error: error instanceof Error ? error.message : String(error),
        id, 
        organizationId 
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Create a new inventory item
   */
  async create(
    data: Partial<IInventoryItem>, 
    userId: string, 
    organizationId: string
  ): Promise<IInventoryItemDocument> {
    try {
      // Check if SKU already exists for this organization
      const existingItem = await Inventory.findOne({
        sku: data.sku,
        organizationId: new mongoose.Types.ObjectId(organizationId)
      });
      
      if (existingItem) {
        throw new ApiError(StatusCodes.CONFLICT, `Inventory item with SKU ${data.sku} already exists`);
      }

      // Create new inventory item
      const newInventoryItem = await Inventory.create({
        ...data,
        createdBy: new mongoose.Types.ObjectId(userId),
        organizationId: new mongoose.Types.ObjectId(organizationId)
      });
      
      // Log activity
      await Activity.create({
        type: 'inventory_created',
        description: `Inventory item created: ${newInventoryItem.name} (SKU: ${newInventoryItem.sku})`,
        entityType: 'inventory',
        entityId: newInventoryItem._id,
        userId: new mongoose.Types.ObjectId(userId),
        organizationId: new mongoose.Types.ObjectId(organizationId)
      });
      
      this.logger.info('Created new inventory item', {
        inventoryId: newInventoryItem._id,
        sku: newInventoryItem.sku,
        organizationId
      });
      
      return newInventoryItem;
    } catch (error) {
      this.logger.error('Error in InventoryService.create', { 
        error: error instanceof Error ? error.message : String(error),
        data,
        organizationId 
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Update inventory item by ID
   */
  async update(
    id: string, 
    data: Partial<IInventoryItem>, 
    organizationId: string
  ): Promise<IInventoryItemDocument> {
    try {
      // Validate input
      if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid inventory ID format');
      }

      // Check if SKU is being changed and if it conflicts with existing items
      if (data.sku) {
        const existingItem = await Inventory.findOne({
          sku: data.sku,
          _id: { $ne: new mongoose.Types.ObjectId(id) },
          organizationId: new mongoose.Types.ObjectId(organizationId)
        });
        
        if (existingItem) {
          throw new ApiError(StatusCodes.CONFLICT, `Another inventory item with SKU ${data.sku} already exists`);
        }
      }

      // Remove fields that shouldn't be updated directly
      delete data.createdBy;
      delete data.organizationId;
      delete data.stockQuantity; // Stock quantity should be updated via adjustment methods

      // Update with organization security check
      const updatedInventoryItem = await Inventory.findOneAndUpdate(
        { 
          _id: new mongoose.Types.ObjectId(id),
          organizationId: new mongoose.Types.ObjectId(organizationId)
        },
        { $set: data },
        { new: true, runValidators: true }
      );

      if (!updatedInventoryItem) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Inventory item not found');
      }

      this.logger.info('Updated inventory item', {
        inventoryId: id,
        sku: updatedInventoryItem.sku,
        organizationId
      });
      
      return updatedInventoryItem;
    } catch (error) {
      this.logger.error('Error in InventoryService.update', { 
        error: error instanceof Error ? error.message : String(error),
        id, 
        organizationId 
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Adjust inventory stock quantity
   */
  async adjustStock(
    id: string,
    adjustment: StockAdjustment,
    userId: string,
    organizationId: string
  ): Promise<IInventoryItemDocument> {
    try {
      // Validate input
      if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid inventory ID format');
      }

      // Find the inventory item
      const inventoryItem = await Inventory.findOne({
        _id: new mongoose.Types.ObjectId(id),
        organizationId: new mongoose.Types.ObjectId(organizationId)
      });

      if (!inventoryItem) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Inventory item not found');
      }

      const { quantity, reason, warehouseId, location, reference, note } = adjustment;

      // If warehouse is specified, update the warehouse-specific stock
      if (warehouseId) {
        if (!mongoose.isValidObjectId(warehouseId)) {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid warehouse ID format');
        }
        
        // Find the warehouse stock entry
        const warehouseStockIndex = inventoryItem.warehouseStock?.findIndex(
          ws => ws.warehouseId.toString() === warehouseId
        );
        
        if (warehouseStockIndex === -1 || warehouseStockIndex === undefined) {
          // If warehouse stock doesn't exist, create it
          const newWarehouseStock: IWarehouseStock = {
            warehouseId: new mongoose.Types.ObjectId(warehouseId),
            quantity: Math.max(0, quantity), // Ensure quantity is not negative for new entries
            location: location
          };
          
          if (!inventoryItem.warehouseStock) {
            inventoryItem.warehouseStock = [newWarehouseStock];
          } else {
            inventoryItem.warehouseStock.push(newWarehouseStock);
          }
        } else {
          // Update existing warehouse stock
          const currentQuantity = inventoryItem.warehouseStock[warehouseStockIndex].quantity || 0;
          const newQuantity = currentQuantity + quantity;
          
          if (newQuantity < 0) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Adjustment would result in negative stock quantity');
          }
          
          inventoryItem.warehouseStock[warehouseStockIndex].quantity = newQuantity;
          
          if (location) {
            inventoryItem.warehouseStock[warehouseStockIndex].location = location;
          }
        }
        
        // Update the total stock quantity
        let totalQuantity = 0;
        inventoryItem.warehouseStock?.forEach(ws => {
          totalQuantity += ws.quantity || 0;
        });
        inventoryItem.stockQuantity = totalQuantity;
      } else {
        // Update the overall stock quantity
        const newQuantity = (inventoryItem.stockQuantity || 0) + quantity;
        
        if (newQuantity < 0) {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'Adjustment would result in negative stock quantity');
        }
        
        inventoryItem.stockQuantity = newQuantity;
      }

      // Save the updated inventory item
      await inventoryItem.save();

      // Log stock adjustment activity
      await Activity.create({
        type: 'inventory_stock_adjusted',
        description: `Stock adjusted for ${inventoryItem.name} (SKU: ${inventoryItem.sku}): ${quantity > 0 ? '+' : ''}${quantity}`,
        details: {
          inventoryId: inventoryItem._id,
          quantity,
          reason,
          warehouseId,
          location,
          reference,
          note
        },
        entityType: 'inventory',
        entityId: inventoryItem._id,
        userId: new mongoose.Types.ObjectId(userId),
        organizationId: new mongoose.Types.ObjectId(organizationId)
      });

      // Check if new stock level is below reorder point and create alert if needed
      if (warehouseId) {
        const warehouseStock = inventoryItem.warehouseStock?.find(
          ws => ws.warehouseId.toString() === warehouseId
        );
        
        if (warehouseStock && warehouseStock.quantity < inventoryItem.reorderPoint) {
          // Check if alert already exists
          const existingAlert = await InventoryAlert.findOne({
            inventoryId: inventoryItem._id,
            warehouseId: new mongoose.Types.ObjectId(warehouseId),
            alertType: AlertType.LOW_STOCK,
            status: AlertStatus.ACTIVE,
            organizationId: new mongoose.Types.ObjectId(organizationId)
          });
          
          if (!existingAlert) {
            // Create new alert
            await InventoryAlert.create({
              inventoryId: inventoryItem._id,
              alertType: AlertType.LOW_STOCK,
              description: `Low stock alert for ${inventoryItem.name} (SKU: ${inventoryItem.sku}) in warehouse`,
              threshold: inventoryItem.reorderPoint,
              status: AlertStatus.ACTIVE,
              warehouseId: new mongoose.Types.ObjectId(warehouseId),
              userId: new mongoose.Types.ObjectId(userId),
              organizationId: new mongoose.Types.ObjectId(organizationId)
            });
          }
        }
      } else if (inventoryItem.stockQuantity < inventoryItem.reorderPoint) {
        // Check if alert already exists
        const existingAlert = await InventoryAlert.findOne({
          inventoryId: inventoryItem._id,
          alertType: AlertType.LOW_STOCK,
          status: AlertStatus.ACTIVE,
          organizationId: new mongoose.Types.ObjectId(organizationId)
        });
        
        if (!existingAlert) {
          // Create new alert
          await InventoryAlert.create({
            inventoryId: inventoryItem._id,
            alertType: AlertType.LOW_STOCK,
            description: `Low stock alert for ${inventoryItem.name} (SKU: ${inventoryItem.sku})`,
            threshold: inventoryItem.reorderPoint,
            status: AlertStatus.ACTIVE,
            userId: new mongoose.Types.ObjectId(userId),
            organizationId: new mongoose.Types.ObjectId(organizationId)
          });
        }
      }

      this.logger.info('Adjusted inventory stock', {
        inventoryId: id,
        sku: inventoryItem.sku,
        adjustment: quantity,
        warehouseId,
        organizationId
      });
      
      return inventoryItem;
    } catch (error) {
      this.logger.error('Error in InventoryService.adjustStock', { 
        error: error instanceof Error ? error.message : String(error),
        id, 
        adjustment,
        organizationId 
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Transfer stock between warehouses
   */
  async transferStock(
    id: string,
    transfer: StockTransfer,
    userId: string,
    organizationId: string
  ): Promise<IInventoryItemDocument> {
    try {
      // Validate input
      if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid inventory ID format');
      }

      const { quantity, sourceWarehouseId, destinationWarehouseId, reason, reference, note } = transfer;

      if (quantity <= 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Transfer quantity must be greater than zero');
      }

      if (!mongoose.isValidObjectId(sourceWarehouseId) || !mongoose.isValidObjectId(destinationWarehouseId)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid warehouse ID format');
      }

      if (sourceWarehouseId === destinationWarehouseId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Source and destination warehouses must be different');
      }

      // Find the inventory item
      const inventoryItem = await Inventory.findOne({
        _id: new mongoose.Types.ObjectId(id),
        organizationId: new mongoose.Types.ObjectId(organizationId)
      });

      if (!inventoryItem) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Inventory item not found');
      }

      // Find the source warehouse stock
      const sourceWarehouseStockIndex = inventoryItem.warehouseStock?.findIndex(
        ws => ws.warehouseId.toString() === sourceWarehouseId
      );

      if (sourceWarehouseStockIndex === -1 || sourceWarehouseStockIndex === undefined || !inventoryItem.warehouseStock) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Source warehouse has no stock for this item');
      }

      const sourceStock = inventoryItem.warehouseStock[sourceWarehouseStockIndex];
      const sourceQuantity = sourceStock.quantity || 0;

      if (sourceQuantity < quantity) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Insufficient stock in source warehouse');
      }

      // Reduce stock in source warehouse
      inventoryItem.warehouseStock[sourceWarehouseStockIndex].quantity = sourceQuantity - quantity;

      // Find or create destination warehouse stock
      const destinationWarehouseStockIndex = inventoryItem.warehouseStock.findIndex(
        ws => ws.warehouseId.toString() === destinationWarehouseId
      );

      if (destinationWarehouseStockIndex === -1) {
        // Create new warehouse stock entry for destination
        inventoryItem.warehouseStock.push({
          warehouseId: new mongoose.Types.ObjectId(destinationWarehouseId),
          quantity: quantity,
          location: ''
        });
      } else {
        // Update existing destination warehouse stock
        const destinationQuantity = inventoryItem.warehouseStock[destinationWarehouseStockIndex].quantity || 0;
        inventoryItem.warehouseStock[destinationWarehouseStockIndex].quantity = destinationQuantity + quantity;
      }

      // Total stock quantity doesn't change in a transfer

      // Save the updated inventory item
      await inventoryItem.save();

      // Log stock transfer activity
      await Activity.create({
        type: 'inventory_stock_transferred',
        description: `Stock transferred for ${inventoryItem.name} (SKU: ${inventoryItem.sku}): ${quantity} units from warehouse ${sourceWarehouseId} to ${destinationWarehouseId}`,
        details: {
          inventoryId: inventoryItem._id,
          quantity,
          sourceWarehouseId,
          destinationWarehouseId,
          reason,
          reference,
          note
        },
        entityType: 'inventory',
        entityId: inventoryItem._id,
        userId: new mongoose.Types.ObjectId(userId),
        organizationId: new mongoose.Types.ObjectId(organizationId)
      });

      this.logger.info('Transferred inventory stock between warehouses', {
        inventoryId: id,
        sku: inventoryItem.sku,
        quantity,
        sourceWarehouseId,
        destinationWarehouseId,
        organizationId
      });
      
      return inventoryItem;
    } catch (error) {
      this.logger.error('Error in InventoryService.transferStock', { 
        error: error instanceof Error ? error.message : String(error),
        id, 
        transfer,
        organizationId 
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Delete inventory item by ID
   */
  async delete(id: string, organizationId: string): Promise<boolean> {
    try {
      // Validate input
      if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid inventory ID format');
      }

      // Delete with organization security check
      const result = await Inventory.deleteOne({ 
        _id: new mongoose.Types.ObjectId(id),
        organizationId: new mongoose.Types.ObjectId(organizationId)
      });

      if (result.deletedCount === 0) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Inventory item not found');
      }

      // Delete associated alerts
      await InventoryAlert.deleteMany({
        inventoryId: new mongoose.Types.ObjectId(id),
        organizationId: new mongoose.Types.ObjectId(organizationId)
      });

      this.logger.info('Deleted inventory item', {
        inventoryId: id,
        organizationId
      });
      
      return true;
    } catch (error) {
      this.logger.error('Error in InventoryService.delete', { 
        error: error instanceof Error ? error.message : String(error),
        id, 
        organizationId 
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }
}

export default InventoryService;