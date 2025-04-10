/**
 * Script to rebuild the inventory-stock.controller.ts file
 * using the controller template and fixing ObjectId errors
 */
const fs = require('fs');
const path = require('path');

// File paths
const targetFile = path.join(__dirname, '../src/controllers/inventory-stock.controller.ts');
const backupFile = path.join(__dirname, '../src/controllers/inventory-stock.controller.ts.bak');

// Backup the original file
if (fs.existsSync(targetFile)) {
  console.log('Creating backup of original file...');
  fs.copyFileSync(targetFile, backupFile);
}

// Define the rebuilt controller content
const newControllerContent = `import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import Inventory from '../models/inventory.model';
import Activity from '../models/activity.model';
import { IUserDocument } from '../models/user.model';

// Define authenticated request type
type AuthenticatedRequest = Request & {
  user?: IUserDocument & {
    id: string;
    organizationId: string;
    role?: string;
  };
};

/**
 * Get inventory stock levels by item ID
 * @route GET /api/inventory/:id/stock
 */
export const getInventoryStockByItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;

    const item = await Inventory.findOne({ 
      _id: id, 
      organizationId 
    });

    if (!item) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Inventory item not found'
      });
      return;
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: item.warehouseStock || []
    });
  } catch (error) {
    console.error('Error getting inventory stock:', error);
    next(error);
  }
};

/**
 * Update inventory stock for a specific warehouse
 * @route PUT /api/inventory/:id/stock/:warehouseId
 */
export const updateInventoryStock = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, warehouseId } = req.params;
    const { quantity, reason } = req.body;
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;

    if (typeof quantity !== 'number') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Quantity must be a number'
      });
      return;
    }

    const item = await Inventory.findOne({ 
      _id: id, 
      organizationId 
    });

    if (!item) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Inventory item not found'
      });
      return;
    }

    // Find the warehouseStock entry for this warehouse
    let warehouseStockIndex = -1;
    if (item.warehouseStock && item.warehouseStock.length > 0) {
      warehouseStockIndex = item.warehouseStock.findIndex(
        ws => ws.warehouseId.toString() === warehouseId
      );
    }

    // Update or add warehouse stock entry
    if (warehouseStockIndex !== -1) {
      // Update existing stock entry
      const oldQuantity = item.warehouseStock[warehouseStockIndex].quantity;
      item.warehouseStock[warehouseStockIndex].quantity = quantity;
      
      // Create activity record
      await Activity.create({
        type: 'inventory_update',
        description: \`Stock level changed from \${oldQuantity} to \${quantity}\`,
        details: {
          item: id,
          warehouseId,
          oldQuantity,
          newQuantity: quantity,
          difference: quantity - oldQuantity,
          reason
        },
        userId,
        organizationId
      });
    } else {
      // Add new stock entry for this warehouse
      if (!item.warehouseStock) {
        item.warehouseStock = [];
      }
      
      item.warehouseStock.push({
        warehouseId: new mongoose.Types.ObjectId(warehouseId),
        quantity
      });
      
      // Create activity record
      await Activity.create({
        type: 'inventory_update',
        description: \`Initial stock level set to \${quantity}\`,
        details: {
          item: id,
          warehouseId,
          oldQuantity: 0,
          newQuantity: quantity,
          difference: quantity,
          reason
        },
        userId,
        organizationId
      });
    }

    // Save the updated item
    await item.save();

    res.status(StatusCodes.OK).json({
      success: true,
      data: item.warehouseStock
    });
  } catch (error) {
    console.error('Error updating inventory stock:', error);
    next(error);
  }
};

/**
 * Transfer inventory between warehouses
 * @route POST /api/inventory/:id/transfer
 */
export const transferInventory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { fromWarehouseId, toWarehouseId, quantity, reason } = req.body;
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;

    // Validate input
    if (!fromWarehouseId || !toWarehouseId || typeof quantity !== 'number' || quantity <= 0) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Invalid transfer parameters'
      });
      return;
    }

    if (fromWarehouseId === toWarehouseId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Source and destination warehouses must be different'
      });
      return;
    }

    const item = await Inventory.findOne({ 
      _id: id, 
      organizationId 
    });

    if (!item) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Inventory item not found'
      });
      return;
    }

    // Ensure warehouseStock array exists
    if (!item.warehouseStock) {
      item.warehouseStock = [];
    }

    // Find source warehouse stock
    const sourceIndex = item.warehouseStock.findIndex(
      ws => ws.warehouseId.toString() === fromWarehouseId
    );

    if (sourceIndex === -1 || item.warehouseStock[sourceIndex].quantity < quantity) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Insufficient stock in source warehouse'
      });
      return;
    }

    // Find destination warehouse stock
    let destIndex = item.warehouseStock.findIndex(
      ws => ws.warehouseId.toString() === toWarehouseId
    );

    // Update source warehouse stock
    item.warehouseStock[sourceIndex].quantity -= quantity;

    // Update or add destination warehouse stock
    if (destIndex !== -1) {
      item.warehouseStock[destIndex].quantity += quantity;
    } else {
      item.warehouseStock.push({
        warehouseId: new mongoose.Types.ObjectId(toWarehouseId),
        quantity
      });
    }

    // Save the updated item
    await item.save();

    // Create activity record
    await Activity.create({
      type: 'inventory_transfer',
      description: \`Transferred \${quantity} units from warehouse \${fromWarehouseId} to warehouse \${toWarehouseId}\`,
      details: {
        item: id,
        fromWarehouseId,
        toWarehouseId,
        quantity,
        reason
      },
      userId,
      organizationId
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: item.warehouseStock
    });
  } catch (error) {
    console.error('Error transferring inventory:', error);
    next(error);
  }
};

/**
 * Get low stock items across all warehouses
 * @route GET /api/inventory/low-stock/warehouse
 */
export const getLowStockItems = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    
    const items = await Inventory.find({
      organizationId,
      'warehouseStock.quantity': { $lt: new mongoose.Types.ObjectId('$reorderThreshold') }
    }).populate('warehouseStock.warehouseId', 'name location');

    // Filter out items that don't have any warehouse stock below threshold
    const lowStockItems = items.map(item => {
      const lowStockWarehouses = item.warehouseStock?.filter(
        ws => ws.quantity < (item.reorderThreshold || 5)
      );
      
      if (lowStockWarehouses && lowStockWarehouses.length > 0) {
        return {
          _id: item._id,
          name: item.name,
          sku: item.sku,
          reorderThreshold: item.reorderThreshold || item.reorderPoint,
          lowStockWarehouses
        };
      }
      return null;
    }).filter(Boolean);

    res.status(StatusCodes.OK).json({
      success: true,
      data: lowStockItems
    });
  } catch (error) {
    console.error('Error getting low stock items:', error);
    next(error);
  }
};`;

// Write the new file
console.log('Writing new controller file...');
fs.writeFileSync(targetFile, newControllerContent);

console.log('Successfully rebuilt inventory-stock.controller.ts');