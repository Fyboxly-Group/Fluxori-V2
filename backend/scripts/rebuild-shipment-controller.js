/**
 * Script to rebuild the shipment.controller.ts file
 * Implementing proper TypeScript with controller methods
 */
const fs = require('fs');
const path = require('path');

// File paths
const targetFile = path.join(__dirname, '../src/controllers/shipment.controller.ts');
const backupFile = path.join(__dirname, '../src/controllers/shipment.controller.ts.bak');

// Backup the original file
if (fs.existsSync(targetFile)) {
  console.log('Creating backup of original file...');
  fs.copyFileSync(targetFile, backupFile);
}

// Define the rebuilt controller content
const newControllerContent = `import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import Shipment, { ShipmentStatus, ShipmentType } from '../models/shipment.model';
import Inventory from '../models/inventory.model';
import Customer from '../models/customer.model';
import Supplier from '../models/supplier.model';
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
 * Get all shipments
 */
export const getShipments = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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
    
    // Parse query parameters for pagination and filtering
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string;
    const status = req.query.status as string;
    const search = req.query.search as string;
    
    // Build query filters
    const filter: any = { organizationId };
    
    if (type) {
      filter.type = type;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { shipmentNumber: { $regex: search, $options: 'i' } },
        { trackingNumber: { $regex: search, $options: 'i' } },
        { courier: { $regex: search, $options: 'i' } },
        { 'origin.name': { $regex: search, $options: 'i' } },
        { 'destination.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [shipments, totalShipments] = await Promise.all([
      Shipment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Shipment.countDocuments(filter)
    ]);
    
    // Return paginated results
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        shipments,
        totalShipments,
        page,
        limit,
        totalPages: Math.ceil(totalShipments / limit)
      }
    });
  } catch (error) {
    console.error('Error getting shipments:', error);
    next(error);
  }
};

/**
 * Get a single shipment by ID
 */
export const getShipmentById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;
    const shipmentId = req.params.id;
    
    if (!userId || !organizationId) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized - User not authenticated'
      });
      return;
    }
    
    // Find the shipment
    const shipment = await Shipment.findOne({
      _id: shipmentId,
      organizationId
    })
      .populate('items.product', 'name sku description')
      .populate('createdBy', 'firstName lastName email');
    
    if (!shipment) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Shipment not found'
      });
      return;
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: shipment
    });
  } catch (error) {
    console.error('Error getting shipment:', error);
    next(error);
  }
};

/**
 * Create a new shipment
 */
export const createShipment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;
    const shipmentData = req.body;
    
    if (!userId || !organizationId) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized - User not authenticated'
      });
      return;
    }
    
    // Validate required fields
    if (!shipmentData.type || !shipmentData.courier || !shipmentData.trackingNumber ||
        !shipmentData.origin || !shipmentData.destination || !shipmentData.items) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Missing required fields'
      });
      return;
    }
    
    // Generate shipment number if not provided
    if (!shipmentData.shipmentNumber) {
      const date = new Date();
      const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      shipmentData.shipmentNumber = \`SH\${date.getFullYear()}\${(date.getMonth() + 1).toString().padStart(2, '0')}\${randomPart}\`;
    }
    
    // Validate items exist in inventory
    const itemProductIds = shipmentData.items.map((item) => item.product);
    const inventoryItems = await Inventory.find({
      _id: { $in: itemProductIds },
      organizationId
    });
    
    if (inventoryItems.length !== itemProductIds.length) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'One or more items do not exist in inventory'
      });
      return;
    }
    
    // Create the shipment
    const shipment = await Shipment.create({
      ...shipmentData,
      organizationId,
      createdBy: userId
    });
    
    // Update inventory stock if this is an outbound shipment
    if (shipmentData.type === ShipmentType.OUTBOUND) {
      // This would call a service to update inventory stock
      // For now, we'll just log the activity
      await Activity.create({
        type: 'shipment_create_outbound',
        description: \`Created outbound shipment \${shipment.shipmentNumber}\`,
        details: {
          shipmentId: shipment._id,
          type: shipment.type,
          items: shipment.items
        },
        userId,
        organizationId
      });
    } else {
      await Activity.create({
        type: 'shipment_create_inbound',
        description: \`Created inbound shipment \${shipment.shipmentNumber}\`,
        details: {
          shipmentId: shipment._id,
          type: shipment.type,
          items: shipment.items
        },
        userId,
        organizationId
      });
    }
    
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Shipment created successfully',
      data: shipment
    });
  } catch (error) {
    console.error('Error creating shipment:', error);
    next(error);
  }
};

/**
 * Update a shipment
 */
export const updateShipment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;
    const shipmentId = req.params.id;
    const updateData = req.body;
    
    if (!userId || !organizationId) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized - User not authenticated'
      });
      return;
    }
    
    // Find the shipment
    const shipment = await Shipment.findOne({
      _id: shipmentId,
      organizationId
    });
    
    if (!shipment) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Shipment not found'
      });
      return;
    }
    
    // Don't allow changing the shipment number
    if (updateData.shipmentNumber && updateData.shipmentNumber !== shipment.shipmentNumber) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Shipment number cannot be changed'
      });
      return;
    }
    
    // Check status transition
    if (updateData.status) {
      const validStatusTransitions: Record<string, string[]> = {
        [ShipmentStatus.PENDING]: [ShipmentStatus.PROCESSING, 'cancelled'],
        [ShipmentStatus.PROCESSING]: [ShipmentStatus.SHIPPED],
        [ShipmentStatus.SHIPPED]: [ShipmentStatus.IN_TRANSIT],
        [ShipmentStatus.IN_TRANSIT]: [ShipmentStatus.OUT_FOR_DELIVERY, ShipmentStatus.FAILED],
        [ShipmentStatus.OUT_FOR_DELIVERY]: [ShipmentStatus.DELIVERED, ShipmentStatus.FAILED],
        [ShipmentStatus.DELIVERED]: [ShipmentStatus.RETURNED],
        [ShipmentStatus.FAILED]: [ShipmentStatus.PROCESSING, ShipmentStatus.RETURNED],
        [ShipmentStatus.RETURNED]: []
      };
      
      const currentStatus = shipment.status as ShipmentStatus;
      const newStatus = updateData.status as ShipmentStatus;
      
      if (currentStatus !== newStatus && 
          !validStatusTransitions[currentStatus]?.includes(newStatus)) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: \`Invalid status transition from \${currentStatus} to \${newStatus}\`
        });
        return;
      }
      
      // Set date fields based on status
      if (newStatus === ShipmentStatus.SHIPPED && !updateData.shippedDate) {
        updateData.shippedDate = new Date();
      }
      
      if (newStatus === ShipmentStatus.DELIVERED && !updateData.deliveredDate) {
        updateData.deliveredDate = new Date();
      }
      
      // Add tracking history event
      if (!updateData.trackingHistory) {
        updateData.trackingHistory = shipment.trackingHistory || [];
      }
      
      updateData.trackingHistory.push({
        status: newStatus,
        timestamp: new Date(),
        description: \`Status changed from \${currentStatus} to \${newStatus}\`
      });
    }
    
    // Update the shipment
    const updatedShipment = await Shipment.findByIdAndUpdate(
      shipmentId,
      updateData,
      { new: true, runValidators: true }
    );
    
    // Log activity
    await Activity.create({
      type: 'shipment_update',
      description: \`Updated shipment \${shipment.shipmentNumber}\`,
      details: {
        shipmentId: shipment._id,
        changes: updateData
      },
      userId,
      organizationId
    });
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Shipment updated successfully',
      data: updatedShipment
    });
  } catch (error) {
    console.error('Error updating shipment:', error);
    next(error);
  }
};

/**
 * Delete a shipment
 */
export const deleteShipment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;
    const shipmentId = req.params.id;
    
    if (!userId || !organizationId) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized - User not authenticated'
      });
      return;
    }
    
    // Find the shipment
    const shipment = await Shipment.findOne({
      _id: shipmentId,
      organizationId
    });
    
    if (!shipment) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Shipment not found'
      });
      return;
    }
    
    // Only allow deleting shipments in pending status
    if (shipment.status !== ShipmentStatus.PENDING) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Only shipments in pending status can be deleted'
      });
      return;
    }
    
    // Delete the shipment
    await Shipment.findByIdAndDelete(shipmentId);
    
    // Log activity
    await Activity.create({
      type: 'shipment_delete',
      description: \`Deleted shipment \${shipment.shipmentNumber}\`,
      details: {
        shipmentId: shipment._id,
        shipmentNumber: shipment.shipmentNumber
      },
      userId,
      organizationId
    });
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Shipment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting shipment:', error);
    next(error);
  }
};

/**
 * Add a tracking event to a shipment
 */
export const addTrackingEvent = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;
    const shipmentId = req.params.id;
    const { status, location, description } = req.body;
    
    if (!userId || !organizationId) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized - User not authenticated'
      });
      return;
    }
    
    if (!status) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Status is required'
      });
      return;
    }
    
    // Find the shipment
    const shipment = await Shipment.findOne({
      _id: shipmentId,
      organizationId
    });
    
    if (!shipment) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Shipment not found'
      });
      return;
    }
    
    // Create the tracking event
    const trackingEvent = {
      status,
      location,
      description,
      timestamp: new Date()
    };
    
    // Add to tracking history
    if (!shipment.trackingHistory) {
      shipment.trackingHistory = [];
    }
    
    shipment.trackingHistory.push(trackingEvent);
    
    // Update shipment status if applicable
    if (Object.values(ShipmentStatus).includes(status as ShipmentStatus)) {
      shipment.status = status;
      
      // Update date fields based on status
      if (status === ShipmentStatus.SHIPPED && !shipment.shippedDate) {
        shipment.shippedDate = new Date();
      }
      
      if (status === ShipmentStatus.DELIVERED && !shipment.deliveredDate) {
        shipment.deliveredDate = new Date();
      }
    }
    
    await shipment.save();
    
    // Log activity
    await Activity.create({
      type: 'shipment_tracking_update',
      description: \`Added tracking event to shipment \${shipment.shipmentNumber}\`,
      details: {
        shipmentId: shipment._id,
        trackingEvent
      },
      userId,
      organizationId
    });
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Tracking event added successfully',
      data: shipment
    });
  } catch (error) {
    console.error('Error adding tracking event:', error);
    next(error);
  }
};`;

// Write the new file
console.log('Writing new controller file...');
fs.writeFileSync(targetFile, newControllerContent);

console.log('Successfully rebuilt shipment.controller.ts');