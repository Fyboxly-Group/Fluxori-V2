import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Project, { ProjectPhase } from '../models/project.model';
import Inventory from '../models/inventory.model';
import Shipment from '../models/shipment.model';
import Customer from '../models/customer.model';
import Supplier from '../models/supplier.model';
import PurchaseOrder from '../models/purchase-order.model';
import Task from '../models/task.model';
import Milestone from '../models/milestone.model';
import Activity from '../models/activity.model';
import { ApiError } from '../middleware/error.middleware';

/**
 * @desc    Get business overview analytics
 * @route   GET /api/analytics/overview
 * @access  Private
 * @swagger
 * /analytics/overview:
 *   get:
 *     summary: Get high-level business overview analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Business overview statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     counts:
 *                       type: object
 *                       properties:
 *                         projects:
 *                           type: number
 *                           description: Total number of projects
 *                         activeProjects:
 *                           type: number
 *                           description: Number of active projects
 *                         inventoryItems:
 *                           type: number
 *                           description: Total number of inventory items
 *                         lowStockItems:
 *                           type: number
 *                           description: Number of low stock items
 *                         shipments:
 *                           type: number
 *                           description: Total number of shipments
 *                         inProgressShipments:
 *                           type: number
 *                           description: Number of in-progress shipments
 *                         customers:
 *                           type: number
 *                           description: Total number of customers
 *                         suppliers:
 *                           type: number
 *                           description: Total number of suppliers
 *                         purchaseOrders:
 *                           type: number
 *                           description: Total number of purchase orders
 *                         tasks:
 *                           type: number
 *                           description: Total number of tasks
 *                         overdueTasks:
 *                           type: number
 *                           description: Number of overdue tasks
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getBusinessOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get basic counts from each collection
    const [
      projectsCount,
      inventoryItemsCount,
      shipmentsCount,
      customersCount,
      suppliersCount,
      purchaseOrdersCount,
      activitiesCount,
      tasksCount
    ] = await Promise.all([
      Project.countDocuments(),
      Inventory.countDocuments(),
      Shipment.countDocuments(),
      Customer.countDocuments(),
      Supplier.countDocuments(),
      PurchaseOrder.countDocuments(),
      Activity.countDocuments(),
      Task.countDocuments()
    ]);

    // Get active projects (not completed or cancelled)
    const activeProjectsCount = await Project.countDocuments({
      status: { $nin: ['completed', 'cancelled'] }
    });

    // Get low stock items
    const lowStockCount = await Inventory.countDocuments({
      quantity: { $lte: 10 }
    });

    // Get in-progress shipments
    const inProgressShipmentsCount = await Shipment.countDocuments({
      status: { $nin: ['delivered', 'cancelled'] }
    });

    // Get overdue tasks
    const today = new Date();
    const overdueTasksCount = await Task.countDocuments({
      dueDate: { $lt: today },
      status: { $nin: ['completed', 'cancelled'] }
    });

    res.status(200).json({
      success: true,
      data: {
        counts: {
          projects: projectsCount,
          activeProjects: activeProjectsCount,
          inventoryItems: inventoryItemsCount,
          lowStockItems: lowStockCount,
          shipments: shipmentsCount,
          inProgressShipments: inProgressShipmentsCount,
          customers: customersCount,
          suppliers: suppliersCount,
          purchaseOrders: purchaseOrdersCount,
          tasks: tasksCount,
          overdueTasks: overdueTasksCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get project performance analytics
 * @route   GET /api/analytics/projects/performance
 * @access  Private
 * @swagger
 * /analytics/projects/performance:
 *   get:
 *     summary: Get project performance analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for project data (YYYY-MM-DD)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for project data (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Project performance analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     projectsByPhase:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Project phase
 *                           count:
 *                             type: number
 *                             description: Number of projects in this phase
 *                     projectsByStatus:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Project status
 *                           count:
 *                             type: number
 *                             description: Number of projects with this status
 *                     averageProjectDuration:
 *                       type: number
 *                       description: Average project duration in days
 *                     onTimeCompletionRate:
 *                       type: number
 *                       description: Percentage of projects completed on time
 *                     projectsByCustomer:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Customer ID
 *                           count:
 *                             type: number
 *                             description: Number of projects for this customer
 *                           customerName:
 *                             type: string
 *                             description: Customer's company name
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getProjectPerformance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get date range from query params with defaults
    const { fromDate, toDate } = req.query;
    let startDate = fromDate ? new Date(fromDate as string) : new Date();
    let endDate = toDate ? new Date(toDate as string) : new Date();
    
    // Default: last 90 days if no dates provided
    if (!fromDate) {
      startDate.setDate(startDate.getDate() - 90);
    }

    // Build date range filter
    const dateFilter = {
      startDate: { $gte: startDate, $lte: endDate }
    };

    // Get projects by phase
    const projectsByPhase = await Project.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$phase', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get projects by status
    const projectsByStatus = await Project.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get average project duration (for completed projects)
    const projectDuration = await Project.aggregate([
      { 
        $match: { 
          status: 'completed',
          startDate: { $exists: true, $ne: null },
          actualCompletionDate: { $exists: true, $ne: null }
        } 
      },
      { 
        $project: { 
          duration: { 
            $divide: [
              { $subtract: ['$actualCompletionDate', '$startDate'] }, 
              24 * 60 * 60 * 1000 // Convert to days
            ] 
          } 
        } 
      },
      { $group: { _id: null, avgDuration: { $avg: '$duration' } } }
    ]);

    // Get on-time completion rate
    const completedProjects = await Project.find({
      status: 'completed',
      startDate: { $exists: true, $ne: null },
      targetCompletionDate: { $exists: true, $ne: null },
      actualCompletionDate: { $exists: true, $ne: null }
    });

    let onTimeCount = 0;
    let totalCount = completedProjects.length;

    completedProjects.forEach(project => {
      if (project.actualCompletionDate && project.targetCompletionDate && 
          project.actualCompletionDate <= project.targetCompletionDate) {
        onTimeCount++;
      }
    });

    const onTimeCompletionRate = totalCount > 0 ? (onTimeCount / totalCount) * 100 : 0;

    // Get projects by customer
    const projectsByCustomer = await Project.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$customer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { 
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customerInfo'
        }
      },
      { 
        $project: {
          _id: 1,
          count: 1,
          customerName: { $arrayElemAt: ['$customerInfo.companyName', 0] }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        projectsByPhase,
        projectsByStatus,
        averageProjectDuration: projectDuration.length > 0 ? projectDuration[0].avgDuration : 0,
        onTimeCompletionRate,
        projectsByCustomer
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get inventory analytics
 * @route   GET /api/analytics/inventory
 * @access  Private
 * @swagger
 * /analytics/inventory:
 *   get:
 *     summary: Get inventory analytics and metrics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     lowStockItems:
 *                       type: array
 *                       description: Items with low stock levels
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           sku:
 *                             type: string
 *                           quantity:
 *                             type: number
 *                           reorderPoint:
 *                             type: number
 *                     valueByCategory:
 *                       type: array
 *                       description: Inventory value distribution by category
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Category name
 *                           totalValue:
 *                             type: number
 *                             description: Total value of items in this category
 *                           itemCount:
 *                             type: number
 *                             description: Number of items in this category
 *                     totalValue:
 *                       type: number
 *                       description: Total value of all inventory
 *                     noMovementItems:
 *                       type: number
 *                       description: Number of items with no movement in last 90 days
 *                     inventoryByStatus:
 *                       type: array
 *                       description: Inventory items grouped by stock status
 *                       items:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                             description: Stock status (Out of Stock, Low Stock, Adequate Stock)
 *                           count:
 *                             type: number
 *                             description: Number of items with this status
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getInventoryAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get top low stock items
    const lowStockItems = await Inventory.find({
      quantity: { $lte: 10 }
    })
    .sort({ quantity: 1 })
    .limit(10)
    .lean();

    // Get inventory value distribution by category
    const valueByCategory = await Inventory.aggregate([
      {
        $match: {
          quantity: { $gt: 0 },
          price: { $exists: true, $ne: null }
        }
      },
      {
        $project: {
          category: 1,
          totalValue: { $multiply: ['$quantity', '$price'] }
        }
      },
      {
        $group: {
          _id: '$category',
          totalValue: { $sum: '$totalValue' },
          itemCount: { $sum: 1 }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);

    // Get total inventory value
    const totalInventoryValue = await Inventory.aggregate([
      {
        $match: {
          quantity: { $gt: 0 },
          price: { $exists: true, $ne: null }
        }
      },
      {
        $project: {
          totalValue: { $multiply: ['$quantity', '$price'] }
        }
      },
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$totalValue' }
        }
      }
    ]);

    // Get items with no movement in last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const noMovementItems = await Inventory.countDocuments({
      lastMovementDate: { $lt: ninetyDaysAgo }
    });

    // Get items by stock status
    const inventoryByStatus = [
      {
        status: 'Out of Stock',
        count: await Inventory.countDocuments({ quantity: 0 })
      },
      {
        status: 'Low Stock',
        count: await Inventory.countDocuments({ 
          quantity: { $gt: 0, $lte: 10 } 
        })
      },
      {
        status: 'Adequate Stock',
        count: await Inventory.countDocuments({ 
          quantity: { $gt: 10 } 
        })
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        lowStockItems,
        valueByCategory,
        totalValue: totalInventoryValue.length > 0 ? totalInventoryValue[0].totalValue : 0,
        noMovementItems,
        inventoryByStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get shipment analytics
 * @route   GET /api/analytics/shipments
 * @access  Private
 * @swagger
 * /analytics/shipments:
 *   get:
 *     summary: Get shipment analytics and performance metrics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for shipment data (YYYY-MM-DD)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for shipment data (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Shipment analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     shipmentsByStatus:
 *                       type: array
 *                       description: Shipments grouped by status
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Shipment status
 *                           count:
 *                             type: number
 *                             description: Number of shipments with this status
 *                     shipmentsByCarrier:
 *                       type: array
 *                       description: Shipments grouped by carrier
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Carrier name
 *                           count:
 *                             type: number
 *                             description: Number of shipments with this carrier
 *                     shipmentsByType:
 *                       type: array
 *                       description: Shipments grouped by type (inbound/outbound)
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Shipment type
 *                           count:
 *                             type: number
 *                             description: Number of shipments of this type
 *                     averageShippingTime:
 *                       type: number
 *                       description: Average shipping time in days
 *                     onTimeDeliveryRate:
 *                       type: number
 *                       description: Percentage of shipments delivered on time
 *                     totalShipments:
 *                       type: number
 *                       description: Total number of shipments in the selected period
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getShipmentAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get date range from query params with defaults
    const { fromDate, toDate } = req.query;
    let startDate = fromDate ? new Date(fromDate as string) : new Date();
    let endDate = toDate ? new Date(toDate as string) : new Date();
    
    // Default: last 90 days if no dates provided
    if (!fromDate) {
      startDate.setDate(startDate.getDate() - 90);
    }

    // Build date range filter
    const dateFilter = {
      createdAt: { $gte: startDate, $lte: endDate }
    };

    // Get shipments by status
    const shipmentsByStatus = await Shipment.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Get shipments by carrier
    const shipmentsByCarrier = await Shipment.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$carrier', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get shipments by type (inbound/outbound)
    const shipmentsByType = await Shipment.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Get average shipping time (for delivered shipments)
    const averageShippingTime = await Shipment.aggregate([
      { 
        $match: { 
          ...dateFilter,
          status: 'delivered',
          shipDate: { $exists: true, $ne: null },
          deliveryDate: { $exists: true, $ne: null }
        } 
      },
      { 
        $project: { 
          shippingTime: { 
            $divide: [
              { $subtract: ['$deliveryDate', '$shipDate'] }, 
              24 * 60 * 60 * 1000 // Convert to days
            ] 
          } 
        } 
      },
      { $group: { _id: null, avgTime: { $avg: '$shippingTime' } } }
    ]);

    // Get on-time delivery rate
    // Find shipments with delivery dates
    const deliveredShipments = await Shipment.find({
      ...dateFilter,
      status: 'delivered',
      estimatedDeliveryDate: { $exists: true, $ne: null },
      deliveredDate: { $exists: true, $ne: null }
    });

    let onTimeCount = 0;
    let totalCount = deliveredShipments.length;

    deliveredShipments.forEach(shipment => {
      if (shipment.deliveredDate && shipment.estimatedDeliveryDate && 
          shipment.deliveredDate <= shipment.estimatedDeliveryDate) {
        onTimeCount++;
      }
    });

    const onTimeDeliveryRate = totalCount > 0 ? (onTimeCount / totalCount) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        shipmentsByStatus,
        shipmentsByCarrier,
        shipmentsByType,
        averageShippingTime: averageShippingTime.length > 0 ? averageShippingTime[0].avgTime : 0,
        onTimeDeliveryRate,
        totalShipments: await Shipment.countDocuments(dateFilter)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get customer analytics
 * @route   GET /api/analytics/customers
 * @access  Private
 * @swagger
 * /analytics/customers:
 *   get:
 *     summary: Get customer analytics and insights
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     customersByIndustry:
 *                       type: array
 *                       description: Customers grouped by industry
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Industry name
 *                           count:
 *                             type: number
 *                             description: Number of customers in this industry
 *                     customersBySize:
 *                       type: array
 *                       description: Customers grouped by company size
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Company size category
 *                           count:
 *                             type: number
 *                             description: Number of customers of this size
 *                     topCustomersByProjects:
 *                       type: array
 *                       description: Top customers by project count
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Customer ID
 *                           count:
 *                             type: number
 *                             description: Number of projects
 *                           customerName:
 *                             type: string
 *                             description: Customer's company name
 *                     customerProjectStatus:
 *                       type: array
 *                       description: Project status breakdown by customer
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Customer ID
 *                           customerName:
 *                             type: string
 *                             description: Customer's company name
 *                           statuses:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 status:
 *                                   type: string
 *                                   description: Project status
 *                                 count:
 *                                   type: number
 *                                   description: Number of projects with this status
 *                           totalProjects:
 *                             type: number
 *                             description: Total number of projects for this customer
 *                     totalCustomers:
 *                       type: number
 *                       description: Total number of customers
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getCustomerAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get customer distribution by industry
    const customersByIndustry = await Customer.aggregate([
      { $group: { _id: '$industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get customer distribution by size
    const customersBySize = await Customer.aggregate([
      { $group: { _id: '$size', count: { $sum: 1 } } },
      { $sort: { _id: 1 } } // Sort by size (assuming sizes are like 'small', 'medium', 'large')
    ]);

    // Get top customers by project count
    const topCustomersByProjects = await Project.aggregate([
      { $group: { _id: '$customer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { 
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customerInfo'
        }
      },
      { 
        $project: {
          _id: 1,
          count: 1,
          customerName: { $arrayElemAt: ['$customerInfo.companyName', 0] }
        }
      }
    ]);

    // Get customer projects by status
    const customerProjectStatus = await Project.aggregate([
      {
        $group: {
          _id: {
            customer: '$customer',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.customer',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          },
          totalProjects: { $sum: '$count' }
        }
      },
      { $sort: { totalProjects: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customerInfo'
        }
      },
      {
        $project: {
          _id: 1,
          customerName: { $arrayElemAt: ['$customerInfo.companyName', 0] },
          statuses: 1,
          totalProjects: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        customersByIndustry,
        customersBySize,
        topCustomersByProjects,
        customerProjectStatus,
        totalCustomers: await Customer.countDocuments()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get time series data for dashboard
 * @route   GET /api/analytics/timeseries
 * @access  Private
 * @swagger
 * /analytics/timeseries:
 *   get:
 *     summary: Get time series data for any metric
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: metric
 *         required: true
 *         schema:
 *           type: string
 *           enum: [projects, inventory, shipments, customers, orders, activities, tasks]
 *         description: The metric to get time series data for
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, quarter, year]
 *           default: week
 *         description: The period to group data by
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           default: 12
 *         description: The number of periods to return
 *     responses:
 *       200:
 *         description: Time series data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     metric:
 *                       type: string
 *                       description: The metric requested
 *                     period:
 *                       type: string
 *                       description: The period granularity
 *                     timeSeriesData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             description: The date label for this data point
 *                           count:
 *                             type: number
 *                             description: The count for this period
 *       400:
 *         description: Bad request - missing metric parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getTimeSeriesData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get date range from query params
    const { metric, period = 'week', count = 12 } = req.query;
    
    if (!metric) {
      throw new ApiError(400, 'Metric parameter is required');
    }

    // Calculate date ranges based on period
    const endDate = new Date();
    const startDate = new Date();
    let groupIdFormat;
    
    switch(period) {
      case 'day':
        startDate.setDate(endDate.getDate() - parseInt(count as string));
        groupIdFormat = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
        break;
      case 'week':
        startDate.setDate(endDate.getDate() - parseInt(count as string) * 7);
        groupIdFormat = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - parseInt(count as string));
        groupIdFormat = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - parseInt(count as string) * 3);
        // MongoDB doesn't have a direct quarter function, so we use integer division
        groupIdFormat = { 
          year: { $year: '$createdAt' }, 
          quarter: { $ceil: { $divide: [{ $month: '$createdAt' }, 3] } } 
        };
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - parseInt(count as string));
        groupIdFormat = { year: { $year: '$createdAt' } };
        break;
      default:
        startDate.setDate(endDate.getDate() - 7 * parseInt(count as string));
        groupIdFormat = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
    }

    // Define date filter
    const dateFilter = {
      createdAt: { $gte: startDate, $lte: endDate }
    };

    let timeSeriesData;

    // Switch based on the requested metric
    switch(metric) {
      case 'projects':
        timeSeriesData = await Project.aggregate([
          { $match: dateFilter },
          { $group: { _id: groupIdFormat, count: { $sum: 1 } } },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1, '_id.day': 1 } }
        ]);
        break;
      case 'inventory':
        timeSeriesData = await Inventory.aggregate([
          { $match: dateFilter },
          { $group: { _id: groupIdFormat, count: { $sum: 1 } } },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1, '_id.day': 1 } }
        ]);
        break;
      case 'shipments':
        timeSeriesData = await Shipment.aggregate([
          { $match: dateFilter },
          { $group: { _id: groupIdFormat, count: { $sum: 1 } } },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1, '_id.day': 1 } }
        ]);
        break;
      case 'customers':
        timeSeriesData = await Customer.aggregate([
          { $match: dateFilter },
          { $group: { _id: groupIdFormat, count: { $sum: 1 } } },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1, '_id.day': 1 } }
        ]);
        break;
      case 'orders':
        timeSeriesData = await PurchaseOrder.aggregate([
          { $match: dateFilter },
          { $group: { _id: groupIdFormat, count: { $sum: 1 } } },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1, '_id.day': 1 } }
        ]);
        break;
      case 'activities':
        timeSeriesData = await Activity.aggregate([
          { $match: dateFilter },
          { $group: { _id: groupIdFormat, count: { $sum: 1 } } },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1, '_id.day': 1 } }
        ]);
        break;
      case 'tasks':
        timeSeriesData = await Task.aggregate([
          { $match: dateFilter },
          { $group: { _id: groupIdFormat, count: { $sum: 1 } } },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1, '_id.day': 1 } }
        ]);
        break;
      default:
        throw new ApiError(400, `Invalid metric: ${metric}`);
    }

    // Format the results for time series visualization
    const formattedData = timeSeriesData.map(item => {
      let dateLabel = '';
      
      if (item._id.day) {
        dateLabel = `${item._id.year}-${item._id.month}-${item._id.day}`;
      } else if (item._id.week) {
        dateLabel = `${item._id.year}-W${item._id.week}`;
      } else if (item._id.quarter) {
        dateLabel = `${item._id.year}-Q${item._id.quarter}`;
      } else if (item._id.month) {
        dateLabel = `${item._id.year}-${item._id.month}`;
      } else {
        dateLabel = `${item._id.year}`;
      }
      
      return {
        date: dateLabel,
        count: item.count
      };
    });

    res.status(200).json({
      success: true,
      data: {
        metric,
        period,
        timeSeriesData: formattedData
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get time-to-completion analysis for projects
 * @route   GET /api/analytics/projects/time-to-completion
 * @access  Private
 * @swagger
 * /analytics/projects/time-to-completion:
 *   get:
 *     summary: Get detailed project time-to-completion analysis
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Project completion time analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     projectData:
 *                       type: array
 *                       description: Detailed completion data for each project
 *                       items:
 *                         type: object
 *                         properties:
 *                           projectName:
 *                             type: string
 *                             description: Project name
 *                           phase:
 *                             type: string
 *                             description: Project phase
 *                           actualDuration:
 *                             type: number
 *                             description: Actual project duration in days
 *                           targetDuration:
 *                             type: number
 *                             description: Target project duration in days
 *                           durationVariance:
 *                             type: number
 *                             description: Difference between actual and target duration in days
 *                           variancePercentage:
 *                             type: number
 *                             description: Percentage variance from target duration
 *                           onTime:
 *                             type: boolean
 *                             description: Whether the project was completed on time
 *                     phaseAnalytics:
 *                       type: array
 *                       description: Duration analytics grouped by project phase
 *                       items:
 *                         type: object
 *                         properties:
 *                           phase:
 *                             type: string
 *                             description: Project phase
 *                           projectCount:
 *                             type: number
 *                             description: Number of projects in this phase
 *                           averageActualDuration:
 *                             type: number
 *                             description: Average actual duration for this phase
 *                           averageTargetDuration:
 *                             type: number
 *                             description: Average target duration for this phase
 *                           averageVariance:
 *                             type: number
 *                             description: Average variance in days for this phase
 *                           onTimePercentage:
 *                             type: number
 *                             description: Percentage of on-time completions for this phase
 *                     overallAnalytics:
 *                       type: object
 *                       properties:
 *                         totalProjects:
 *                           type: number
 *                           description: Total number of completed projects analyzed
 *                         averageActualDuration:
 *                           type: number
 *                           description: Average actual duration across all projects
 *                         averageTargetDuration:
 *                           type: number
 *                           description: Average target duration across all projects
 *                         averageVariance:
 *                           type: number
 *                           description: Average variance in days across all projects
 *                         onTimePercentage:
 *                           type: number
 *                           description: Overall percentage of on-time completions
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getProjectTimeToCompletion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get completed projects with valid dates
    const completedProjects = await Project.find({
      status: 'completed',
      startDate: { $exists: true, $ne: null },
      actualCompletionDate: { $exists: true, $ne: null }
    }).select('name startDate targetCompletionDate actualCompletionDate phase').lean();

    // Calculate metrics for each project
    const projectData = completedProjects.map(project => {
      const startDate = project.startDate instanceof Date ? project.startDate : new Date(project.startDate);
      const targetDate = project.targetCompletionDate ? (project.targetCompletionDate instanceof Date ? project.targetCompletionDate : new Date(project.targetCompletionDate)) : null;
      const actualDate = project.actualCompletionDate instanceof Date ? project.actualCompletionDate : new Date(project.actualCompletionDate);
      
      // Calculate durations in days
      const actualDuration = Math.round((actualDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
      const targetDuration = targetDate ? Math.round((targetDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) : null;
      
      // Calculate variance
      const durationVariance = targetDuration !== null ? actualDuration - targetDuration : null;
      const variancePercentage = targetDuration !== null && durationVariance !== null ? (durationVariance / targetDuration) * 100 : null;
      
      return {
        projectName: project.name,
        phase: project.phase,
        actualDuration,
        targetDuration,
        durationVariance,
        variancePercentage,
        onTime: targetDate ? actualDate <= targetDate : null
      };
    });
    
    // Calculate average metrics by phase
    // Initialize with all possible phases
    const phaseGroups: Record<ProjectPhase, {
      projects: number;
      totalActualDuration: number;
      totalTargetDuration: number;
      totalVariance: number;
      onTimeCount: number;
    }> = {
      discovery: { projects: 0, totalActualDuration: 0, totalTargetDuration: 0, totalVariance: 0, onTimeCount: 0 },
      design: { projects: 0, totalActualDuration: 0, totalTargetDuration: 0, totalVariance: 0, onTimeCount: 0 },
      implementation: { projects: 0, totalActualDuration: 0, totalTargetDuration: 0, totalVariance: 0, onTimeCount: 0 },
      testing: { projects: 0, totalActualDuration: 0, totalTargetDuration: 0, totalVariance: 0, onTimeCount: 0 },
      deployment: { projects: 0, totalActualDuration: 0, totalTargetDuration: 0, totalVariance: 0, onTimeCount: 0 },
      maintenance: { projects: 0, totalActualDuration: 0, totalTargetDuration: 0, totalVariance: 0, onTimeCount: 0 }
    };
    
    projectData.forEach(project => {
      // Validate project.phase is a valid ProjectPhase
      if (project.phase && phaseGroups[project.phase as ProjectPhase]) {
        phaseGroups[project.phase as ProjectPhase].projects++;
        phaseGroups[project.phase as ProjectPhase].totalActualDuration += project.actualDuration;
      
        if (project.targetDuration !== null) {
          phaseGroups[project.phase as ProjectPhase].totalTargetDuration += project.targetDuration;
        }
        
        if (project.durationVariance !== null) {
          phaseGroups[project.phase as ProjectPhase].totalVariance += project.durationVariance;
        }
        
        if (project.onTime === true) {
          phaseGroups[project.phase as ProjectPhase].onTimeCount++;
        }
      }
    });
    
    // Calculate averages for each phase
    const phaseAnalytics = Object.keys(phaseGroups).map(phase => {
      const validPhase = phase as ProjectPhase;
      const group = phaseGroups[validPhase];
      // Only return entries for phases that have projects
      if (group.projects === 0) {
        return {
          phase,
          projectCount: 0,
          averageActualDuration: 0,
          averageTargetDuration: 0,
          averageVariance: 0,
          onTimePercentage: 0
        };
      }
      
      return {
        phase,
        projectCount: group.projects,
        averageActualDuration: group.totalActualDuration / group.projects,
        averageTargetDuration: group.projects > 0 ? group.totalTargetDuration / group.projects : 0,
        averageVariance: group.projects > 0 ? group.totalVariance / group.projects : 0,
        onTimePercentage: group.projects > 0 ? (group.onTimeCount / group.projects) * 100 : 0
      };
    });
    
    // Calculate overall averages
    const totalProjects = projectData.length;
    const averageActualDuration = projectData.reduce((sum, project) => sum + project.actualDuration, 0) / totalProjects;
    const targetDurationProjects = projectData.filter(project => project.targetDuration !== null);
    const averageTargetDuration = targetDurationProjects.length > 0
      ? targetDurationProjects.reduce((sum, project) => sum + (project.targetDuration || 0), 0) / targetDurationProjects.length
      : 0;
    const varianceProjects = projectData.filter(project => project.durationVariance !== null);
    const averageVariance = varianceProjects.length > 0
      ? varianceProjects.reduce((sum, project) => sum + (project.durationVariance || 0), 0) / varianceProjects.length
      : 0;
    const onTimeProjects = projectData.filter(project => project.onTime === true);
    const onTimePercentage = (onTimeProjects.length / totalProjects) * 100;

    res.status(200).json({
      success: true,
      data: {
        projectData,
        phaseAnalytics,
        overallAnalytics: {
          totalProjects,
          averageActualDuration,
          averageTargetDuration,
          averageVariance,
          onTimePercentage
        }
      }
    });
  } catch (error) {
    next(error);
  }
};