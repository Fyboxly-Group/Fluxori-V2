/**
 * Script to rebuild the warehouse.controller.ts file
 * Implementing proper TypeScript with controller methods
 */
const fs = require('fs');
const path = require('path');

// File paths
const targetFile = path.join(__dirname, '../src/controllers/warehouse.controller.ts');
const backupFile = path.join(__dirname, '../src/controllers/warehouse.controller.ts.bak');

// Backup the original file
if (fs.existsSync(targetFile)) {
  console.log('Creating backup of original file...');
  fs.copyFileSync(targetFile, backupFile);
}

// Define the rebuilt controller content
const newControllerContent = `import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import Warehouse, { WarehouseStatus, WarehouseType } from '../models/warehouse.model';
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
 * Get all warehouses
 */
export const getWarehouses = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;
    
    if (!userId || !organizationId) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized - User not authenticated'
      });
      return;
    }
    
    // Parse query parameters
    const status = req.query.status as string;
    const type = req.query.type as string;
    
    // Build query filters
    const filter: any = { organizationId };
    
    if (status) {
      filter.status = status;
    }
    
    if (type) {
      filter.type = type;
    }
    
    // Get warehouses
    const warehouses = await Warehouse.find(filter)
      .sort({ name: 1 });
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: warehouses
    });
  } catch (error) {
    console.error('Error getting warehouses:', error);
    next(error);
  }
};

/**
 * Get a single warehouse by ID
 */
export const getWarehouseById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;
    const warehouseId = req.params.id;
    
    if (!userId || !organizationId) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized - User not authenticated'
      });
      return;
    }
    
    // Find the warehouse
    const warehouse = await Warehouse.findOne({
      _id: warehouseId,
      organizationId
    });
    
    if (!warehouse) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Warehouse not found'
      });
      return;
    }
    
    // Get inventory count for this warehouse
    const inventoryCount = await Inventory.countDocuments({
      'warehouseStock.warehouseId': warehouse._id,
      organizationId
    });
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        warehouse,
        inventoryCount
      }
    });
  } catch (error) {
    console.error('Error getting warehouse:', error);
    next(error);
  }
};

/**
 * Create a new warehouse
 */
export const createWarehouse = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;
    const warehouseData = req.body;
    
    if (!userId || !organizationId) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized - User not authenticated'
      });
      return;
    }
    
    // Validate required fields
    if (!warehouseData.name || !warehouseData.code || !warehouseData.address) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Name, code, and address are required'
      });
      return;
    }
    
    // Check if warehouse code already exists
    const existingWarehouse = await Warehouse.findOne({
      code: warehouseData.code,
      organizationId
    });
    
    if (existingWarehouse) {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: 'A warehouse with this code already exists'
      });
      return;
    }
    
    // Create the warehouse
    const warehouse = await Warehouse.create({
      ...warehouseData,
      organizationId,
      createdBy: userId
    });
    
    // Log activity
    await Activity.create({
      type: 'warehouse_create',
      description: \`Created warehouse \${warehouse.name} (\${warehouse.code})\`,
      details: {
        warehouseId: warehouse._id,
        name: warehouse.name,
        code: warehouse.code
      },
      userId,
      organizationId
    });
    
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Warehouse created successfully',
      data: warehouse
    });
  } catch (error) {
    console.error('Error creating warehouse:', error);
    next(error);
  }
};

/**
 * Update a warehouse
 */
export const updateWarehouse = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;
    const warehouseId = req.params.id;
    const updateData = req.body;
    
    if (!userId || !organizationId) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized - User not authenticated'
      });
      return;
    }
    
    // Find the warehouse
    const warehouse = await Warehouse.findOne({
      _id: warehouseId,
      organizationId
    });
    
    if (!warehouse) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Warehouse not found'
      });
      return;
    }
    
    // Don't allow changing the code if it already exists
    if (updateData.code && updateData.code !== warehouse.code) {
      const existingWarehouse = await Warehouse.findOne({
        code: updateData.code,
        organizationId,
        _id: { $ne: warehouseId }
      });
      
      if (existingWarehouse) {
        res.status(StatusCodes.CONFLICT).json({
          success: false,
          message: 'A warehouse with this code already exists'
        });
        return;
      }
    }
    
    // Update the warehouse
    const updatedWarehouse = await Warehouse.findByIdAndUpdate(
      warehouseId,
      updateData,
      { new: true, runValidators: true }
    );
    
    // Log activity
    await Activity.create({
      type: 'warehouse_update',
      description: \`Updated warehouse \${warehouse.name} (\${warehouse.code})\`,
      details: {
        warehouseId: warehouse._id,
        changes: updateData
      },
      userId,
      organizationId
    });
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Warehouse updated successfully',
      data: updatedWarehouse
    });
  } catch (error) {
    console.error('Error updating warehouse:', error);
    next(error);
  }
};

/**
 * Delete a warehouse
 */
export const deleteWarehouse = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;
    const warehouseId = req.params.id;
    
    if (!userId || !organizationId) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized - User not authenticated'
      });
      return;
    }
    
    // Find the warehouse
    const warehouse = await Warehouse.findOne({
      _id: warehouseId,
      organizationId
    });
    
    if (!warehouse) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Warehouse not found'
      });
      return;
    }
    
    // Check if this is the default warehouse
    if (warehouse.isDefault) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Cannot delete the default warehouse'
      });
      return;
    }
    
    // Check if warehouse has inventory
    const hasInventory = await Inventory.exists({
      'warehouseStock.warehouseId': warehouse._id,
      organizationId
    });
    
    if (hasInventory) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Cannot delete warehouse with existing inventory'
      });
      return;
    }
    
    // Delete the warehouse
    await Warehouse.findByIdAndDelete(warehouseId);
    
    // Log activity
    await Activity.create({
      type: 'warehouse_delete',
      description: \`Deleted warehouse \${warehouse.name} (\${warehouse.code})\`,
      details: {
        warehouseId: warehouse._id,
        name: warehouse.name,
        code: warehouse.code
      },
      userId,
      organizationId
    });
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Warehouse deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting warehouse:', error);
    next(error);
  }
};

/**
 * Add a zone to a warehouse
 */
export const addWarehouseZone = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;
    const warehouseId = req.params.id;
    const zoneData = req.body;
    
    if (!userId || !organizationId) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized - User not authenticated'
      });
      return;
    }
    
    // Validate required fields
    if (!zoneData.name || !zoneData.type) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Zone name and type are required'
      });
      return;
    }
    
    // Find the warehouse
    const warehouse = await Warehouse.findOne({
      _id: warehouseId,
      organizationId
    });
    
    if (!warehouse) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Warehouse not found'
      });
      return;
    }
    
    // Check if zone with this name already exists
    if (warehouse.zones && warehouse.zones.some(zone => zone.name === zoneData.name)) {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: 'A zone with this name already exists in the warehouse'
      });
      return;
    }
    
    // Add the zone
    if (!warehouse.zones) {
      warehouse.zones = [];
    }
    
    warehouse.zones.push(zoneData);
    await warehouse.save();
    
    // Get the newly added zone
    const newZone = warehouse.zones[warehouse.zones.length - 1];
    
    // Log activity
    await Activity.create({
      type: 'warehouse_zone_add',
      description: \`Added zone "\${zoneData.name}" to warehouse \${warehouse.name}\`,
      details: {
        warehouseId: warehouse._id,
        zoneName: zoneData.name,
        zoneType: zoneData.type
      },
      userId,
      organizationId
    });
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Zone added successfully',
      data: newZone
    });
  } catch (error) {
    console.error('Error adding warehouse zone:', error);
    next(error);
  }
};

/**
 * Get warehouse inventory
 */
export const getWarehouseInventory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;
    const warehouseId = req.params.id;
    
    if (!userId || !organizationId) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized - User not authenticated'
      });
      return;
    }
    
    // Find the warehouse
    const warehouse = await Warehouse.findOne({
      _id: warehouseId,
      organizationId
    });
    
    if (!warehouse) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Warehouse not found'
      });
      return;
    }
    
    // Parse query parameters for pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    // Get inventory for this warehouse
    const skip = (page - 1) * limit;
    
    const [inventoryItems, totalItems] = await Promise.all([
      Inventory.find({ 
        'warehouseStock.warehouseId': warehouse._id,
        organizationId
      })
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit),
      Inventory.countDocuments({ 
        'warehouseStock.warehouseId': warehouse._id,
        organizationId
      })
    ]);
    
    // Format the response to focus on stock in this warehouse
    const formattedItems = inventoryItems.map(item => {
      const warehouseStock = item.warehouseStock?.find(
        ws => ws.warehouseId.toString() === warehouseId
      );
      
      return {
        _id: item._id,
        sku: item.sku,
        name: item.name,
        category: item.category,
        stockQuantity: warehouseStock?.quantity || 0,
        reorderPoint: item.reorderPoint,
        reorderQuantity: item.reorderQuantity,
        location: warehouseStock?.location || '',
        price: item.price,
        costPrice: item.costPrice
      };
    });
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        items: formattedItems,
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit)
      }
    });
  } catch (error) {
    console.error('Error getting warehouse inventory:', error);
    next(error);
  }
};`;

// Write the new file
console.log('Writing new controller file...');
fs.writeFileSync(targetFile, newControllerContent);

console.log('Successfully rebuilt warehouse.controller.ts');