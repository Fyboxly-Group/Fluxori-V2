import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import InventoryAlert from '../models/inventory-alert.model';
import { ApiError } from '../middleware/error.middleware';
import { ActivityService } from '../services/activity.service';

// Authenticated request type
type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    organizationId: string;
    email?: string;
    role?: string;
  };
};

/**
 * @desc    Get all inventory alerts
 * @route   GET /api/inventory-alerts
 * @access  Private
 */
export const getInventoryAlerts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      status = 'active',
      alertType,
      priority,
      assignedTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;
    
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (alertType) {
      query.alertType = alertType;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    if (assignedTo) {
      if (assignedTo === 'me' && req.user) {
        query.assignedTo = (req.user as any)._id;
      } else if (assignedTo === 'unassigned') {
        query.assignedTo = { $exists: false };
      } else if (assignedTo !== 'all') {
        query.assignedTo = new mongoose.Types.ObjectId(assignedTo as string);
      }
    }
    
    // Parse pagination parameters
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;
    
    // Parse sorting
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const alerts = await InventoryAlert.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('item', 'name sku stockQuantity price images')
      .populate('assignedTo', 'firstName lastName email')
      .populate('resolvedBy', 'firstName lastName email')
      .populate('purchaseOrder', 'orderNumber status')
      .populate('createdBy', 'firstName lastName email');
    
    // Get total count
    const total = await InventoryAlert.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: alerts.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
      data: alerts,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};

/**
 * @desc    Get inventory alert by ID
 * @route   GET /api/inventory-alerts/:id
 * @access  Private
 */
export const getInventoryAlertById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alertId = req.params.id as any;
    
    if (!mongoose.Types.ObjectId.isValid(alertId)) {
      throw new ApiError(400, 'Invalid alert ID');
    }
    
    const alert = await InventoryAlert.findById(alertId)
      .populate('item', 'name sku stockQuantity reorderPoint reorderQuantity price costPrice supplier images')
      .populate({
        path: 'item',
        populate: {
          path: 'supplier',
          select: 'name contactPerson email phone'
        }
      })
      .populate('assignedTo', 'firstName lastName email')
      .populate('resolvedBy', 'firstName lastName email')
      .populate('purchaseOrder', 'orderNumber status')
      .populate('createdBy', 'firstName lastName email');
    
    if (!alert) {
      throw new ApiError(404, 'Alert not found');
    }
    
    res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};

/**
 * @desc    Create a new inventory alert
 * @route   POST /api/inventory-alerts
 * @access  Private
 */
export const createInventoryAlert = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      item,
      itemName,
      itemSku,
      alertType,
      priority,
      description,
      currentQuantity,
      thresholdQuantity,
      expiryDate,
      recommendedAction,
      assignedTo,
    } = req.body;
    
    // Validate required fields
    if (!item || !itemName || !itemSku || !alertType || !description) {
      throw new ApiError(400, 'Please provide all required fields', {
        ...(item ? {} : { item: ['Item ID is required'] }),
        ...(itemName ? {} : { itemName: ['Item name is required'] }),
        ...(itemSku ? {} : { itemSku: ['Item SKU is required'] }),
        ...(alertType ? {} : { alertType: ['Alert type is required'] }),
        ...(description ? {} : { description: ['Description is required'] }),
      });
    }
    
    // Create alert
    const alert = new InventoryAlert({
      item,
      itemName,
      itemSku,
      alertType,
      status: 'active',
      priority: priority || 'medium',
      description,
      currentQuantity,
      thresholdQuantity,
      expiryDate,
      recommendedAction,
      assignedTo,
      createdBy: req.user?._id,
    });
    
    await alert.save();
    
    // Log activity
    if (req.user) {
      await ActivityService.logActivity({
        description: `Inventory alert "${alertType}" created for item "${itemName}" (${itemSku})`,
        entityType: 'user',
        entityId: (req.user as any)._id,
        action: 'create',
        status: 'completed',
        userId: (req.user as any)._id,
        metadata: { alertId: (alert as any)._id, itemId: item },
      });
    }
    
    res.status(201).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};

/**
 * @desc    Update inventory alert
 * @route   PUT /api/inventory-alerts/:id
 * @access  Private
 */
export const updateInventoryAlert = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alertId = req.params.id as any;
    
    if (!mongoose.Types.ObjectId.isValid(alertId)) {
      throw new ApiError(400, 'Invalid alert ID');
    }
    
    // Find alert
    const alert = await InventoryAlert.findById(alertId);
    
    if (!alert) {
      throw new ApiError(404, 'Alert not found');
    }
    
    const updates = req.body;
    
    // Handle special case for status change to resolved
    if (updates.status === 'resolved' && alert.status !== 'resolved') {
      alert.resolvedBy = req.user?._id;
      alert.resolvedAt = new Date();
    }
    
    // Apply updates
    Object.keys(updates).forEach((key) => {
      if (key !== '_id' && key !== 'createdBy' && key !== 'createdAt') {
        (alert as any)[key] = updates[key];
      }
    });
    
    await alert.save();
    
    // Log activity
    if (req.user) {
      await ActivityService.logActivity({
        description: `Inventory alert for "${alert.itemName}" (${alert.itemSku}) updated`,
        entityType: 'user',
        entityId: (req.user as any)._id,
        action: 'update',
        status: 'completed',
        userId: (req.user as any)._id,
        metadata: { alertId: (alert as any)._id, updates },
      });
    }
    
    res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};

/**
 * @desc    Delete inventory alert
 * @route   DELETE /api/inventory-alerts/:id
 * @access  Private
 */
export const deleteInventoryAlert = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alertId = req.params.id as any;
    
    if (!mongoose.Types.ObjectId.isValid(alertId)) {
      throw new ApiError(400, 'Invalid alert ID');
    }
    
    // Find alert
    const alert = await InventoryAlert.findById(alertId);
    
    if (!alert) {
      throw new ApiError(404, 'Alert not found');
    }
    
    // Store alert info for activity log
    const alertType = alert.alertType;
    const itemName = alert.itemName;
    const itemSku = alert.itemSku;
    
    // Delete alert - using deleteOne instead of remove() as remove is deprecated
    await InventoryAlert.deleteOne({ _id: alertId });
    
    // Log activity
    if (req.user) {
      await ActivityService.logActivity({
        description: `Inventory alert "${alertType}" for "${itemName}" (${itemSku}) deleted`,
        entityType: 'user',
        entityId: (req.user as any)._id,
        action: 'delete',
        status: 'completed',
        userId: (req.user as any)._id,
        metadata: { alertId },
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Alert deleted successfully',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};

/**
 * @desc    Assign inventory alert to user
 * @route   PUT /api/inventory-alerts/:id/assign
 * @access  Private
 */
export const assignInventoryAlert = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alertId = req.params.id as any;
    
    if (!mongoose.Types.ObjectId.isValid(alertId)) {
      throw new ApiError(400, 'Invalid alert ID');
    }
    
    const { userId } = req.body;
    
    if (!userId) {
      throw new ApiError(400, 'User ID is required');
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }
    
    // Find alert
    const alert = await InventoryAlert.findById(alertId);
    
    if (!alert) {
      throw new ApiError(404, 'Alert not found');
    }
    
    // Update assignee
    alert.assignedTo = new mongoose.Types.ObjectId(userId);
    
    await alert.save();
    
    // Log activity
    if (req.user) {
      await ActivityService.logActivity({
        description: `Inventory alert for "${alert.itemName}" (${alert.itemSku}) assigned`,
        entityType: 'user',
        entityId: (req.user as any)._id,
        action: 'update',
        status: 'completed',
        userId: (req.user as any)._id,
        metadata: { alertId, assignedTo: userId },
      });
    }
    
    res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};

/**
 * @desc    Resolve inventory alert
 * @route   PUT /api/inventory-alerts/:id/resolve
 * @access  Private
 */
export const resolveInventoryAlert = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alertId = req.params.id as any;
    
    if (!mongoose.Types.ObjectId.isValid(alertId)) {
      throw new ApiError(400, 'Invalid alert ID');
    }
    
    const { resolutionNotes, purchaseOrderCreated, purchaseOrder } = req.body;
    
    // Find alert
    const alert = await InventoryAlert.findById(alertId);
    
    if (!alert) {
      throw new ApiError(404, 'Alert not found');
    }
    
    // Update alert
    alert.status = 'resolved';
    alert.resolvedBy = req.user?._id;
    alert.resolvedAt = new Date();
    
    if (resolutionNotes) {
      alert.resolutionNotes = resolutionNotes;
    }
    
    if (purchaseOrderCreated !== undefined) {
      alert.purchaseOrderCreated = purchaseOrderCreated;
    }
    
    if (purchaseOrder) {
      alert.purchaseOrder = new mongoose.Types.ObjectId(purchaseOrder);
    }
    
    await alert.save();
    
    // Log activity
    if (req.user) {
      await ActivityService.logActivity({
        description: `Inventory alert for "${alert.itemName}" (${alert.itemSku}) resolved`,
        entityType: 'user',
        entityId: (req.user as any)._id,
        action: 'update',
        status: 'completed',
        userId: (req.user as any)._id,
        metadata: { 
          alertId, 
          resolutionNotes,
          purchaseOrderCreated,
          purchaseOrder,
        },
      });
    }
    
    res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};

/**
 * @desc    Get alert statistics
 * @route   GET /api/inventory-alerts/stats
 * @access  Private
 */
export const getAlertStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get total alert count
    const totalAlerts = await InventoryAlert.countDocuments();
    
    // Get active alerts count
    const activeAlerts = await InventoryAlert.countDocuments({ status: 'active' });
    
    // Get resolved alerts count
    const resolvedAlerts = await InventoryAlert.countDocuments({ status: 'resolved' });
    
    // Get counts by type
    const alertsByType = await InventoryAlert.aggregate([
      { $group: { _id: '$alertType', count: { $sum: 1 } } },
    ]);
    
    // Get counts by priority
    const alertsByPriority = await InventoryAlert.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);
    
    // Return formatted stats
    res.status(200).json({
      success: true,
      data: {
        totalAlerts,
        activeAlerts,
        resolvedAlerts,
        alertsByType: alertsByType.reduce((acc: Record<string, number>, curr) => {
          acc[(curr as any)._id] = curr.count;
          return acc;
        }, {}),
        alertsByPriority: alertsByPriority.reduce((acc: Record<string, number>, curr) => {
          acc[(curr as any)._id] = curr.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};