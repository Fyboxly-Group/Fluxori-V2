import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

/**
 * Template for a controller with TypeScript typing
 * Replace ResourceName with the actual resource name (e.g., User, Project, etc.)
 */

/**
 * Get all resources
 * @route GET /api/resource
 */
export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Implementation goes here
    // e.g., const resources = await ResourceModel.find({});
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: []
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get resource by ID
 * @route GET /api/resource/:id
 */
export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    next(error);
  }
};

/**
 * Create new resource
 * @route POST /api/resource
 */
export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resourceData = req.body;
    
    // Implementation goes here
    // e.g., const newResource = await ResourceModel.create(resourceData);
    
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: resourceData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update resource
 * @route PUT /api/resource/:id
 */
export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    next(error);
  }
};

/**
 * Delete resource
 * @route DELETE /api/resource/:id
 */
export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    next(error);
  }
};