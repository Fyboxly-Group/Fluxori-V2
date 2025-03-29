import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Task from '../models/task.model';
import { ApiError } from '../middleware/error.middleware';
import { ActivityService } from '../services/activity.service';

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, status, dueDate, assignedTo, priority, tags } = req.body;
    
    if (!title) {
      throw new ApiError(400, 'Please provide a title for the task', {
        title: ['Title is required'],
      });
    }
    
    // Create task
    const task = new Task({
      title,
      description,
      status: status || 'pending',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      assignedTo: assignedTo || req.user?._id,
      createdBy: req.user?._id,
      priority: priority || 'medium',
      tags,
    });
    
    await task.save();
    
    // Log activity
    if (req.user) {
      await ActivityService.logTaskCreate(
        task._id,
        req.user._id,
        task.title
      );
    }
    
    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tasks
 * @route   GET /api/tasks
 * @access  Private
 */
export const getAllTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, assignedTo, priority, search } = req.query;
    
    // Build query
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (assignedTo) {
      query.assignedTo = assignedTo;
    } else if (req.user) {
      // Default to current user's tasks if no assignedTo specified
      query.assignedTo = req.user._id;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Execute query
    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email');
    
    // Get total count for pagination
    const totalTasks = await Task.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: tasks.length,
      total: totalTasks,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalTasks / limit),
      },
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
export const getTaskById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new ApiError(400, 'Invalid task ID');
    }
    
    const task = await Task.findById(taskId)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email');
    
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }
    
    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = req.params.id;
    const updates = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new ApiError(400, 'Invalid task ID');
    }
    
    // Find task
    const task = await Task.findById(taskId);
    
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }
    
    // Check if user is authorized to update this task
    if (req.user && !req.user.role.includes('admin') && 
        task.assignedTo.toString() !== req.user._id.toString() && 
        task.createdBy.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You are not authorized to update this task');
    }
    
    // Save old status for activity logging
    const oldStatus = task.status;
    
    // Update task
    Object.keys(updates).forEach((key) => {
      if (key !== '_id' && key !== 'createdBy' && key !== 'createdAt') {
        (task as any)[key] = updates[key];
      }
    });
    
    // Handle date conversions
    if (updates.dueDate) {
      task.dueDate = new Date(updates.dueDate);
    }
    
    await task.save();
    
    // Log activity
    if (req.user) {
      if (oldStatus !== task.status) {
        await ActivityService.logTaskStatusChange(
          task._id,
          req.user._id,
          task.title,
          oldStatus,
          task.status
        );
      } else {
        await ActivityService.logTaskUpdate(
          task._id,
          req.user._id,
          task.title,
          updates
        );
      }
    }
    
    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new ApiError(400, 'Invalid task ID');
    }
    
    // Find task
    const task = await Task.findById(taskId);
    
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }
    
    // Check if user is authorized to delete this task
    if (req.user && !req.user.role.includes('admin') && 
        task.createdBy.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You are not authorized to delete this task');
    }
    
    // Store task title for activity logging
    const taskTitle = task.title;
    
    // Delete task - using deleteOne instead of remove() as remove is deprecated
    await Task.deleteOne({ _id: taskId });
    
    // Log activity
    if (req.user) {
      await ActivityService.logActivity({
        description: `Task "${taskTitle}" deleted`,
        entityType: 'task',
        action: 'delete',
        status: 'completed',
        userId: req.user._id,
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};