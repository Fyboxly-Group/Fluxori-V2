import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../models/user.model';
import Task from '../models/task.model';
import Activity from '../models/activity.model';
import { ActivityService } from '../services/activity.service';
import { SystemStatusService } from '../services/system-status.service';

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
 * @desc    Get dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Private
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get high-level dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
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
 *                     usersCount:
 *                       type: number
 *                       description: Number of active users
 *                     tasksCount:
 *                       type: number
 *                       description: Total number of tasks
 *                     pendingTasksCount:
 *                       type: number
 *                       description: Number of pending tasks
 *                     completedTasksCount:
 *                       type: number
 *                       description: Number of completed tasks
 *                     activitiesCount:
 *                       type: number
 *                       description: Number of activity logs
 *                     userTasksCount:
 *                       type: number
 *                       description: Number of tasks assigned to current user
 *                     userPendingTasksCount:
 *                       type: number
 *                       description: Number of pending tasks assigned to current user
 *                     userCompletedTasksCount:
 *                       type: number
 *                       description: Number of completed tasks assigned to current user
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get real stats from database
    const usersCount = await User.countDocuments({ isActive: true });
    const tasksCount = await Task.countDocuments();
    const pendingTasksCount = await Task.countDocuments({ status: 'pending' });
    const completedTasksCount = await Task.countDocuments({ status: 'completed' });
    const activitiesCount = await Activity.countDocuments();
    
    // Get user-specific stats if authenticated
    let userStats = {};
    if (req.user) {
      const userTasksCount = await Task.countDocuments({ assignedTo: (req.user as any)._id });
      const userPendingTasksCount = await Task.countDocuments({ 
        assignedTo: (req.user as any)._id,
        status: 'pending'
      });
      const userCompletedTasksCount = await Task.countDocuments({ 
        assignedTo: (req.user as any)._id,
        status: 'completed'
      });
      
      userStats = {
        userTasksCount,
        userPendingTasksCount,
        userCompletedTasksCount,
      };
    }
    
    const stats = {
      usersCount,
      tasksCount,
      pendingTasksCount,
      completedTasksCount,
      activitiesCount,
      ...userStats,
    };
    
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};

/**
 * @desc    Get recent activities
 * @route   GET /api/dashboard/activities
 * @access  Private
 * @swagger
 * /dashboard/activities:
 *   get:
 *     summary: Get recent system activities
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of activities to return
 *       - in: query
 *         name: onlyMine
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Filter to only show the current user's activities
 *     responses:
 *       200:
 *         description: Recent activities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   description: Number of activities returned
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       description:
 *                         type: string
 *                       entityType:
 *                         type: string
 *                       entityId:
 *                         type: string
 *                       action:
 *                         type: string
 *                         enum: [create, update, delete, login, logout]
 *                       status:
 *                         type: string
 *                         enum: [completed, failed, pending]
 *                       userId:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getActivities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const onlyMine = req.query.onlyMine === 'true';
    
    let userId;
    if (onlyMine && req.user) {
      userId = (req.user as any)._id;
    }
    
    // Get activities from database
    const activities = await ActivityService.getRecentActivities(limit, userId);
    
    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};

/**
 * @desc    Get tasks
 * @route   GET /api/dashboard/tasks
 * @access  Private
 * @swagger
 * /dashboard/tasks:
 *   get:
 *     summary: Get tasks for the current user
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, completed, cancelled]
 *         description: Filter tasks by status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of tasks to return
 *     responses:
 *       200:
 *         description: User tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   description: Number of tasks returned
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [pending, in-progress, completed, cancelled]
 *                       priority:
 *                         type: string
 *                         enum: [low, medium, high, urgent]
 *                       assignedTo:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           email:
 *                             type: string
 *                       dueDate:
 *                         type: string
 *                         format: date-time
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as string;
    const limit = parseInt(req.query.limit as string) || 5;
    
    // Build query
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (req.user) {
      query.assignedTo = (req.user as any)._id;
    }
    
    // Get tasks from database
    const tasks = await Task.find(query)
      .sort({ dueDate: 1, createdAt: -1 })
      .limit(limit)
      .populate('assignedTo', 'firstName lastName email')
      .lean();
    
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};

/**
 * @desc    Get system status
 * @route   GET /api/dashboard/system-status
 * @access  Private
 * @swagger
 * /dashboard/system-status:
 *   get:
 *     summary: Get status of system components
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System status for all components
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   description: Number of components
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: Component name
 *                       status:
 *                         type: string
 *                         enum: [healthy, degraded, down]
 *                       message:
 *                         type: string
 *                         description: Status details
 *                       lastChecked:
 *                         type: string
 *                         format: date-time
 *                       metrics:
 *                         type: object
 *                         description: Optional performance metrics
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error during health check
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getSystemStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let systemStatus;
    
    try {
      // Run a database health check - but continue even if it fails
      await SystemStatusService.checkDatabaseHealth();
    } catch (dbError) {
      console.error('Database health check failed:', dbError);
      // We'll continue and just return the other component statuses
    }
    
    // Get all component statuses
    systemStatus = await SystemStatusService.getAllComponentStatus();
    
    res.status(200).json({
      success: true,
      count: systemStatus.length,
      data: systemStatus,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};