import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Milestone from '../models/milestone.model';
import Project from '../models/project.model';
import { ApiError } from '../middleware/error.middleware';
import { ActivityService } from '../services/activity.service';

/**
 * @desc    Get all milestones
 * @route   GET /api/milestones
 * @access  Private
 */
export const getMilestones = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      search,
      project,
      status,
      owner,
      priority,
      fromDate,
      toDate,
      sortBy = 'targetCompletionDate',
      sortOrder = 'asc',
      page = 1,
      limit = 10
    } = req.query;
    
    const query: any = {};
    
    // Search by milestone title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (project) {
      query.project = new mongoose.Types.ObjectId(project as string);
    }
    
    if (status) {
      query.status = status;
    }
    
    if (owner) {
      query.owner = new mongoose.Types.ObjectId(owner as string);
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    // Filter by target date range
    if (fromDate || toDate) {
      query.targetCompletionDate = {};
      
      if (fromDate) {
        query.targetCompletionDate.$gte = new Date(fromDate as string);
      }
      
      if (toDate) {
        query.targetCompletionDate.$lte = new Date(toDate as string);
      }
    }
    
    // My milestones filter (if user wants to see milestones they're involved in)
    if (req.query.myMilestones && req.user) {
      query.$or = [
        { owner: (req.user as any)._id },
        { reviewers: (req.user as any)._id },
        { createdBy: (req.user as any)._id },
      ];
    }
    
    // Parse pagination parameters
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;
    
    // Parse sorting
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const milestones = await Milestone.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('project', 'name status phase')
      .populate('owner', 'firstName lastName email')
      .populate('reviewers', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .populate('dependencies', 'title status')
      .populate('createdBy', 'firstName lastName email');
    
    // Get total count
    const total = await Milestone.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: milestones.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
      data: milestones,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};

/**
 * @desc    Get milestone by ID
 * @route   GET /api/milestones/:id
 * @access  Private
 */
export const getMilestoneById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const milestoneId = req.params.id as any;
    
    if (!mongoose.Types.ObjectId.isValid(milestoneId)) {
      throw new ApiError(400, 'Invalid milestone ID');
    }
    
    const milestone = await Milestone.findById(milestoneId)
      .populate('project', 'name status phase customer')
      .populate({
        path: 'project',
        populate: {
          path: 'customer',
          select: 'companyName logo'
        }
      })
      .populate('owner', 'firstName lastName email')
      .populate('reviewers', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .populate('dependencies', 'title status targetCompletionDate')
      .populate('createdBy', 'firstName lastName email');
    
    if (!milestone) {
      throw new ApiError(404, 'Milestone not found');
    }
    
    res.status(200).json({
      success: true,
      data: milestone,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};

/**
 * @desc    Create a new milestone
 * @route   POST /api/milestones
 * @access  Private
 */
export const createMilestone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      title,
      description,
      project,
      status,
      startDate,
      targetCompletionDate,
      deliverables,
      owner,
      reviewers,
      approvalRequired,
      priority,
      dependencies,
      notes,
      tags,
    } = req.body;
    
    // Validate required fields
    if (!title || !project || !startDate || !targetCompletionDate || !owner) {
      throw new ApiError(400, 'Please provide all required fields', {
        ...(title ? {} : { title: ['Milestone title is required'] }),
        ...(project ? {} : { project: ['Project is required'] }),
        ...(startDate ? {} : { startDate: ['Start date is required'] }),
        ...(targetCompletionDate ? {} : { targetCompletionDate: ['Target completion date is required'] }),
        ...(owner ? {} : { owner: ['Owner is required'] }),
      });
    }
    
    // Validate project exists
    if (!mongoose.Types.ObjectId.isValid(project)) {
      throw new ApiError(400, 'Invalid project ID');
    }
    
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      throw new ApiError(404, 'Project not found');
    }
    
    // Create milestone
    const milestone = new Milestone({
      title,
      description,
      project,
      status: status || 'not-started',
      startDate,
      targetCompletionDate,
      deliverables: Array.isArray(deliverables) ? deliverables : deliverables ? [deliverables] : [],
      owner,
      reviewers: reviewers || [],
      approvalRequired: approvalRequired || false,
      priority: priority || 'medium',
      dependencies: dependencies || [],
      progress: 0,
      notes,
      tags,
      createdBy: req.user?._id,
    });
    
    await milestone.save();
    
    // Log activity
    if (req.user) {
      await ActivityService.logActivity({
        description: `Milestone "${title}" created for project "${projectExists.name}"`,
        entityType: 'user',
        entityId: (req.user as any)._id,
        action: 'create',
        status: 'completed',
        userId: (req.user as any)._id,
        metadata: { milestoneId: (milestone as any)._id, projectId: project },
      });
    }
    
    res.status(201).json({
      success: true,
      data: milestone,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};

/**
 * @desc    Update milestone
 * @route   PUT /api/milestones/:id
 * @access  Private
 */
export const updateMilestone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const milestoneId = req.params.id as any;
    
    if (!mongoose.Types.ObjectId.isValid(milestoneId)) {
      throw new ApiError(400, 'Invalid milestone ID');
    }
    
    // Find milestone
    const milestone = await Milestone.findById(milestoneId);
    
    if (!milestone) {
      throw new ApiError(404, 'Milestone not found');
    }
    
    // Validate access rights (optional, depends on business logic)
    // For example, only milestone owner or creator can update
    if (
      req.user && 
      !req.user?.role.includes('admin') && 
      milestone.owner.toString() !== (req.user as any)._id.toString() && 
      milestone.createdBy.toString() !== (req.user as any)._id.toString()
    ) {
      throw new ApiError(403, 'You do not have permission to update this milestone');
    }
    
    // Update milestone fields
    const updates = req.body;
    
    // Special handling for arrays
    if (updates.deliverables) {
      milestone.deliverables = Array.isArray(updates.deliverables) ? updates.deliverables : [updates.deliverables];
    }
    
    if (updates.reviewers) {
      milestone.reviewers = updates.reviewers;
    }
    
    if (updates.dependencies) {
      milestone.dependencies = updates.dependencies;
    }
    
    // Apply other updates
    Object.keys(updates).forEach((key) => {
      if (
        key !== '_id' && 
        key !== 'createdBy' && 
        key !== 'createdAt' && 
        key !== 'deliverables' && 
        key !== 'reviewers' && 
        key !== 'dependencies'
      ) {
        (milestone as any)[key] = updates[key];
      }
    });
    
    // Special case: if status is being set to 'completed', set the actual completion date
    if (updates.status === 'completed' && milestone.status !== 'completed') {
      milestone.actualCompletionDate = new Date();
    }
    
    await milestone.save();
    
    // Log activity
    if (req.user) {
      await ActivityService.logActivity({
        description: `Milestone "${milestone.title}" updated`,
        entityType: 'user',
        entityId: (req.user as any)._id,
        action: 'update',
        status: 'completed',
        userId: (req.user as any)._id,
        metadata: { milestoneId: (milestone as any)._id, updates },
      });
    }
    
    res.status(200).json({
      success: true,
      data: milestone,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};

/**
 * @desc    Delete milestone
 * @route   DELETE /api/milestones/:id
 * @access  Private
 */
export const deleteMilestone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const milestoneId = req.params.id as any;
    
    if (!mongoose.Types.ObjectId.isValid(milestoneId)) {
      throw new ApiError(400, 'Invalid milestone ID');
    }
    
    // Find milestone
    const milestone = await Milestone.findById(milestoneId);
    
    if (!milestone) {
      throw new ApiError(404, 'Milestone not found');
    }
    
    // Check for dependent tasks
    // This would require importing Task model
    // const dependentTasks = await Task.countDocuments({ milestone: milestoneId });

// Authenticated request type
type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    organizationId: string;
    email?: string;
    role?: string;
  };
};
    // if (dependentTasks > 0) {
    //   throw new ApiError(400, `Cannot delete milestone: ${dependentTasks} task(s) are associated with this milestone`);
    // }
    
    // Check for milestones that depend on this one
    const dependentMilestones = await Milestone.countDocuments({ dependencies: milestoneId });
    if (dependentMilestones > 0) {
      throw new ApiError(400, `Cannot delete milestone: ${dependentMilestones} other milestone(s) depend on this milestone`);
    }
    
    // Store milestone info for activity log
    const milestoneTitle = milestone.title;
    
    // Delete milestone - using deleteOne instead of remove() as remove is deprecated
    await Milestone.deleteOne({ _id: milestoneId });
    
    // Log activity
    if (req.user) {
      await ActivityService.logActivity({
        description: `Milestone "${milestoneTitle}" deleted`,
        entityType: 'user',
        entityId: (req.user as any)._id,
        action: 'delete',
        status: 'completed',
        userId: (req.user as any)._id,
        metadata: { milestoneId },
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Milestone deleted successfully',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};

/**
 * @desc    Update milestone approval
 * @route   PUT /api/milestones/:id/approve
 * @access  Private
 */
export const approveMilestone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const milestoneId = req.params.id as any;
    
    if (!mongoose.Types.ObjectId.isValid(milestoneId)) {
      throw new ApiError(400, 'Invalid milestone ID');
    }
    
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }
    
    // Find milestone
    const milestone = await Milestone.findById(milestoneId);
    
    if (!milestone) {
      throw new ApiError(404, 'Milestone not found');
    }
    
    // Check if user is a reviewer
    const isReviewer = milestone.reviewers.some(
      reviewer => reviewer.toString() === req.user?._id.toString()
    );
    
    if (!isReviewer && req.user?.role !== 'admin') {
      throw new ApiError(403, 'You are not authorized to approve this milestone');
    }
    
    // Check if user has already approved
    const hasApproved = milestone.approvedBy?.some(
      approver => approver.toString() === req.user?._id.toString()
    );
    
    if (hasApproved) {
      throw new ApiError(400, 'You have already approved this milestone');
    }
    
    // Add user to approvals
    milestone.approvedBy = [...(milestone.approvedBy || []), (req.user as any)._id];
    await milestone.save();
    
    // Log activity
    await ActivityService.logActivity({
      description: `Milestone "${milestone.title}" approved`,
      entityType: 'user',
      entityId: (req.user as any)._id,
      action: 'update',
      status: 'completed',
      userId: (req.user as any)._id,
      metadata: { milestoneId },
    });
    
    res.status(200).json({
      success: true,
      message: 'Milestone approved successfully',
      data: { approvedBy: milestone.approvedBy },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};

/**
 * @desc    Update milestone progress
 * @route   PUT /api/milestones/:id/progress
 * @access  Private
 */
export const updateMilestoneProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const milestoneId = req.params.id as any;
    
    if (!mongoose.Types.ObjectId.isValid(milestoneId)) {
      throw new ApiError(400, 'Invalid milestone ID');
    }
    
    // Find milestone
    const milestone = await Milestone.findById(milestoneId);
    
    if (!milestone) {
      throw new ApiError(404, 'Milestone not found');
    }
    
    const { progress } = req.body;
    
    if (progress === undefined || progress < 0 || progress > 100) {
      throw new ApiError(400, 'Progress must be a number between 0 and 100');
    }
    
    // Update progress
    milestone.progress = progress;
    
    // Auto-update status based on progress
    if (progress === 0 && milestone.status !== 'not-started') {
      milestone.status = 'not-started';
    } else if (progress === 100 && milestone.status !== 'completed') {
      milestone.status = 'completed';
      milestone.actualCompletionDate = new Date();
    } else if (progress > 0 && progress < 100 && milestone.status !== 'in-progress') {
      milestone.status = 'in-progress';
    }
    
    await milestone.save();
    
    // Log activity
    if (req.user) {
      await ActivityService.logActivity({
        description: `Milestone "${milestone.title}" progress updated to ${progress}%`,
        entityType: 'user',
        entityId: (req.user as any)._id,
        action: 'update',
        status: 'completed',
        userId: (req.user as any)._id,
        metadata: { milestoneId, progress },
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        progress: milestone.progress,
        status: milestone.status,
        actualCompletionDate: milestone.actualCompletionDate,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};