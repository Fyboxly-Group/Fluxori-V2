import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
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
 * Controller for [Resource] operations
 * Handles API endpoints related to [Resource]
 */
export class ResourceController {
  /**
   * Get all resources
   * @route GET /api/resources
   */
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Implementation goes here
      // e.g., const resources = await ResourceModel.find({});
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: []
      });
    } catch (error) {
      console.error('Error getting resources:', error);
      next(error);
    }
  }
  
  /**
   * Get resource by ID
   * @route GET /api/resources/:id
   */
  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      // Implementation goes here
      // e.g., const resource = await ResourceModel.findById(id);
      
      // if (!resource) {
      //   return res.status(StatusCodes.NOT_FOUND).json({
      //     success: false,
      //     message: 'Resource not found'
      //   });
      // }
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: { id }
      });
    } catch (error) {
      console.error('Error getting resource:', error);
      next(error);
    }
  }
  
  /**
   * Create a new resource
   * @route POST /api/resources
   */
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const resourceData = req.body;
      
      // Implementation goes here
      // e.g., const newResource = await ResourceModel.create(resourceData);
      
      res.status(StatusCodes.CREATED).json({
        success: true,
        data: resourceData
      });
    } catch (error) {
      console.error('Error creating resource:', error);
      next(error);
    }
  }
  
  /**
   * Update a resource
   * @route PUT /api/resources/:id
   */
  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Implementation goes here
      // e.g., const updatedResource = await ResourceModel.findByIdAndUpdate(
      //   id,
      //   updateData,
      //   { new: true, runValidators: true }
      // );
      
      // if (!updatedResource) {
      //   return res.status(StatusCodes.NOT_FOUND).json({
      //     success: false,
      //     message: 'Resource not found'
      //   });
      // }
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: { id, ...updateData }
      });
    } catch (error) {
      console.error('Error updating resource:', error);
      next(error);
    }
  }
  
  /**
   * Delete a resource
   * @route DELETE /api/resources/:id
   */
  static async remove(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      // Implementation goes here
      // e.g., const deletedResource = await ResourceModel.findByIdAndDelete(id);
      
      // if (!deletedResource) {
      //   return res.status(StatusCodes.NOT_FOUND).json({
      //     success: false,
      //     message: 'Resource not found'
      //   });
      // }
      
      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Resource deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting resource:', error);
      next(error);
    }
  }
}

// Function-based controller template (alternative style used in many files)
/**
 * Get all resources
 * @route GET /api/resources
 */
export const getAllResources = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Implementation goes here
    // e.g., const resources = await ResourceModel.find({});
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Error getting resources:', error);
    next(error);
  }
};

/**
 * Get resource by ID
 * @route GET /api/resources/:id
 */
export const getResourceById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Implementation goes here
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: { id }
    });
  } catch (error) {
    console.error('Error getting resource:', error);
    next(error);
  }
};

/**
 * Create a new resource
 * @route POST /api/resources
 */
export const createResource = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resourceData = req.body;
    
    // Implementation goes here
    
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: resourceData
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    next(error);
  }
};

/**
 * Update a resource
 * @route PUT /api/resources/:id
 */
export const updateResource = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Implementation goes here
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: { id, ...updateData }
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    next(error);
  }
};

/**
 * Delete a resource
 * @route DELETE /api/resources/:id
 */
export const deleteResource = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Implementation goes here
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    next(error);
  }
};