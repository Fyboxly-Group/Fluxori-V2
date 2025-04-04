import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Project from '../models/project.model';
import Customer from '../models/customer.model';
import { ApiError } from '../middleware/error.middleware';
import { ActivityService } from '../services/activity.service';

/**
 * @desc    Get all projects
 * @route   GET /api/projects
 * @access  Private
 */
export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      search,
      customer,
      status,
      phase,
      accountManager,
      fromDate,
      toDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;
    
    const query: any = {};
    
    // Search by project name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (customer) {
      query.customer = new mongoose.Types.ObjectId(customer as string);
    }
    
    if (status) {
      query.status = status;
    }
    
    if (phase) {
      query.phase = phase;
    }
    
    if (accountManager) {
      query.accountManager = new mongoose.Types.ObjectId(accountManager as string);
    }
    
    // Filter by date range
    if (fromDate || toDate) {
      query.startDate = {};
      
      if (fromDate) {
        query.startDate.$gte = new Date(fromDate as string);
      }
      
      if (toDate) {
        query.startDate.$lte = new Date(toDate as string);
      }
    }
    
    // Handle stakeholder filtering (if user wants to see projects they're involved in)
    if (req.query.involvedUser && req.user) {
      query.$or = [
        { accountManager: (req.user as any)._id },
        { createdBy: (req.user as any)._id },
        { 'stakeholders.user': (req.user as any)._id },
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
    const projects = await Project.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('customer', 'companyName industry logo')
      .populate('accountManager', 'firstName lastName email')
      .populate('stakeholders.user', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email');
    
    // Get total count
    const total = await Project.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: projects.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
      data: projects,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};

/**
 * @desc    Get project by ID
 * @route   GET /api/projects/:id
 * @access  Private
 */
export const getProjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as any;
    
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new ApiError(400, 'Invalid project ID');
    }
    
    const project = await Project.findById(projectId)
      .populate('customer', 'companyName industry size logo primaryContact')
      .populate('accountManager', 'firstName lastName email')
      .populate('stakeholders.user', 'firstName lastName email')
      .populate('documents.uploadedBy', 'firstName lastName')
      .populate('createdBy', 'firstName lastName email');
    
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }
    
    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private
 */
export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      description,
      customer,
      accountManager,
      status,
      phase,
      startDate,
      targetCompletionDate,
      budget,
      objectives,
      keyResults,
      businessValue,
      stakeholders,
      tags,
    } = req.body;
    
    // Validate required fields
    if (!name || !customer || !accountManager || !startDate || !objectives) {
      throw new ApiError(400, 'Please provide all required fields', {
        ...(name ? {} : { name: ['Project name is required'] }),
        ...(customer ? {} : { customer: ['Customer is required'] }),
        ...(accountManager ? {} : { accountManager: ['Account manager is required'] }),
        ...(startDate ? {} : { startDate: ['Start date is required'] }),
        ...(objectives ? {} : { objectives: ['At least one objective is required'] }),
      });
    }
    
    // Validate customer exists
    if (!mongoose.Types.ObjectId.isValid(customer)) {
      throw new ApiError(400, 'Invalid customer ID');
    }
    
    const customerExists = await Customer.findById(customer);
    if (!customerExists) {
      throw new ApiError(404, 'Customer not found');
    }
    
    // Create project
    const project = new Project({
      name,
      description,
      customer,
      accountManager: accountManager || req.user?._id,
      status: status || 'planning',
      phase: phase || 'discovery',
      startDate,
      targetCompletionDate,
      budget,
      objectives: Array.isArray(objectives) ? objectives : [objectives],
      keyResults: keyResults || [],
      businessValue: businessValue || '',
      stakeholders: stakeholders || [],
      documents: [],
      tags,
      createdBy: req.user?._id,
    });
    
    await project.save();
    
    // Log activity
    if (req.user) {
      await ActivityService.logActivity({
        description: `Project "${name}" created for customer "${customerExists.companyName}"`,
        entityType: 'user',
        entityId: (req.user as any)._id,
        action: 'create',
        status: 'completed',
        userId: (req.user as any)._id,
        metadata: { projectId: (project as any)._id, customerId: customer },
      });
    }
    
    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private
 */
export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as any;
    
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new ApiError(400, 'Invalid project ID');
    }
    
    // Find project
    const project = await Project.findById(projectId);
    
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }
    
    // Validate access rights (optional, depends on business logic)
    // For example, only project owner or account manager can update
    if (
      req.user && 
      !req.user?.role.includes('admin') && 
      project.accountManager.toString() !== (req.user as any)._id.toString() && 
      project.createdBy.toString() !== (req.user as any)._id.toString()
    ) {
      throw new ApiError(403, 'You do not have permission to update this project');
    }
    
    // Update project fields
    const updates = req.body;
    
    // Special handling for arrays and objects
    if (updates.objectives) {
      project.objectives = Array.isArray(updates.objectives) ? updates.objectives : [updates.objectives];
    }
    
    if (updates.keyResults) {
      project.keyResults = updates.keyResults;
    }
    
    if (updates.stakeholders) {
      project.stakeholders = updates.stakeholders;
    }
    
    // Apply other updates
    Object.keys(updates).forEach((key) => {
      if (
        key !== '_id' && 
        key !== 'createdBy' && 
        key !== 'createdAt' && 
        key !== 'objectives' && 
        key !== 'keyResults' && 
        key !== 'stakeholders'
      ) {
        (project as any)[key] = updates[key];
      }
    });
    
    // Special case: if status is being set to 'completed', set the actual completion date
    if (updates.status === 'completed' && project.status !== 'completed') {
      project.actualCompletionDate = new Date();
    }
    
    await project.save();
    
    // Log activity
    if (req.user) {
      await ActivityService.logActivity({
        description: `Project "${project.name}" updated`,
        entityType: 'user',
        entityId: (req.user as any)._id,
        action: 'update',
        status: 'completed',
        userId: (req.user as any)._id,
        metadata: { projectId: (project as any)._id, updates },
      });
    }
    
    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as any;
    
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new ApiError(400, 'Invalid project ID');
    }
    
    // Find project
    const project = await Project.findById(projectId);
    
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }
    
    // Check for dependent records
    // This would require importing related models
    // const dependentMilestones = await Milestone.countDocuments({ project: projectId });

// Authenticated request type
type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    organizationId: string;
    email?: string;
    role?: string;
  };
};
    // if (dependentMilestones > 0) {
    //   throw new ApiError(400, `Cannot delete project: ${dependentMilestones} milestone(s) are associated with this project`);
    // }
    
    // Store project name for activity log
    const projectName = project.name;
    
    // Delete project - using deleteOne instead of remove() as remove is deprecated
    await Project.deleteOne({ _id: projectId });
    
    // Log activity
    if (req.user) {
      await ActivityService.logActivity({
        description: `Project "${projectName}" deleted`,
        entityType: 'user',
        entityId: (req.user as any)._id,
        action: 'delete',
        status: 'completed',
        userId: (req.user as any)._id,
        metadata: { projectId },
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};

/**
 * @desc    Add document to project
 * @route   POST /api/projects/:id/documents
 * @access  Private
 */
export const addProjectDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as any;
    
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new ApiError(400, 'Invalid project ID');
    }
    
    // Find project
    const project = await Project.findById(projectId);
    
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }
    
    const { title, fileUrl, category } = req.body;
    
    if (!title || !fileUrl) {
      throw new ApiError(400, 'Please provide document title and file URL');
    }
    
    // Add document
    project.documents.push({
      title,
      fileUrl,
      category: category || 'other',
      uploadedBy: req.user?._id,
      uploadedAt: new Date(),
    });
    
    await project.save();
    
    // Log activity
    if (req.user) {
      await ActivityService.logActivity({
        description: `Document "${title}" added to project "${project.name}"`,
        entityType: 'user',
        entityId: (req.user as any)._id,
        action: 'create',
        status: 'completed',
        userId: (req.user as any)._id,
        metadata: { projectId, documentTitle: title },
      });
    }
    
    res.status(200).json({
      success: true,
      data: project.documents[project.documents.length - 1],
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};

/**
 * @desc    Remove document from project
 * @route   DELETE /api/projects/:id/documents/:documentId
 * @access  Private
 */
export const removeProjectDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: projectId, documentId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new ApiError(400, 'Invalid project ID');
    }
    
    // Find project
    const project = await Project.findById(projectId);
    
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }
    
    // Find document
    const documentIndex = project.documents.findIndex(
      doc => (doc as any)._id.toString() === documentId
    );
    
    if (documentIndex === -1) {
      throw new ApiError(404, 'Document not found in this project');
    }
    
    // Store document info for activity log
    const documentTitle = project.documents[documentIndex].title;
    
    // Remove document
    project.documents.splice(documentIndex, 1);
    await project.save();
    
    // Log activity
    if (req.user) {
      await ActivityService.logActivity({
        description: `Document "${documentTitle}" removed from project "${project.name}"`,
        entityType: 'user',
        entityId: (req.user as any)._id,
        action: 'delete',
        status: 'completed',
        userId: (req.user as any)._id,
        metadata: { projectId, documentId },
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Document removed successfully',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};

/**
 * @desc    Get project statistics
 * @route   GET /api/projects/stats
 * @access  Private
 */
export const getProjectStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get counts by status
    const statusCounts = await Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    
    // Get counts by phase
    const phaseCounts = await Project.aggregate([
      { $group: { _id: '$phase', count: { $sum: 1 } } },
    ]);
    
    // Get total budget
    const totalBudget = await Project.aggregate([
      { $match: { budget: { $exists: true, $ne: null } } },
      { $group: { _id: null, total: { $sum: '$budget' } } },
    ]);
    
    // Get recently started projects (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentProjectsCount = await Project.countDocuments({
      startDate: { $gte: thirtyDaysAgo },
    });
    
    // Get projects completing in next 90 days
    const today = new Date();
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(today.getDate() + 90);
    
    const upcomingCompletionsCount = await Project.countDocuments({
      targetCompletionDate: { $gte: today, $lte: ninetyDaysFromNow },
    });
    
    // Format response
    const stats = {
      totalProjects: await Project.countDocuments(),
      statusBreakdown: statusCounts.reduce((acc: any, curr) => {
        acc[(curr as any)._id] = curr.count;
        return acc;
      }, {}),
      phaseBreakdown: phaseCounts.reduce((acc: any, curr) => {
        acc[(curr as any)._id] = curr.count;
        return acc;
      }, {}),
      totalBudget: totalBudget.length > 0 ? totalBudget[0].total : 0,
      recentProjectsCount,
      upcomingCompletionsCount,
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