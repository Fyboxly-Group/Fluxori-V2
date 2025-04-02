/**
 * Specialized fix script for the example.controller.ts file
 */

const fs = require('fs');
const path = require('path');

const CONTROLLER_FILE_PATH = path.join(__dirname, '../src/controllers/example.controller.ts');

// The correct content for the controller
const correctContent = `import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest, TypedResponse, getTypedResponse, ControllerMethod, AuthControllerMethod } from '../types/express-extensions';
import { StatusCodes } from 'http-status-codes';

/**
 * Template for a controller with TypeScript typing
 * Replace ExampleName with the actual example name(e.g., User, Project, etc.)
 */

/**
 * Get all examples
 * @route GET /api/example
 */
export const getAll = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Implementation goes here
    // e.g., const examples = await ExampleModel.find({});
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: []
    });
  } catch(error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    next(error);
  }
};

/**
 * Get example by ID
 * @route GET /api/example/:id
 */
export const getById = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Implementation goes here
    // e.g., const example = await ExampleModel.findById(id);
    
    // if(!example) {
    //   return res.status(StatusCodes.NOT_FOUND).json({
    //     success: false,
    //     message: 'Example not found',
    //   });
    // }
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: { id }
    });
  } catch(error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    next(error);
  }
};

/**
 * Create new example
 * @route POST /api/example
 */
export const create = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const exampleData = req.body;
    
    // Implementation goes here
    // e.g., const newExample = await ExampleModel.create(exampleData);
    
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: exampleData
    });
  } catch(error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    next(error);
  }
};

/**
 * Update example
 * @route PUT /api/example/:id
 */
export const update = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Implementation goes here
    // e.g., const updatedExample = await ExampleModel.findByIdAndUpdate(
    //   id,
    //   updateData,
    //   { new: true, runValidators: true }
    // );
    
    // if(!updatedExample) {
    //   return res.status(StatusCodes.NOT_FOUND).json({
    //     success: false,
    //     message: 'Example not found',
    //   });
    // }
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: { id, ...updateData }
    });
  } catch(error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    next(error);
  }
};

/**
 * Delete example
 * @route DELETE /api/example/:id
 */
export const remove = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Implementation goes here
    // e.g., const deletedExample = await ExampleModel.findByIdAndDelete(id);
    
    // if(!deletedExample) {
    //   return res.status(StatusCodes.NOT_FOUND).json({
    //     success: false,
    //     message: 'Example not found',
    //   });
    // }
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Example deleted successfully',
    });
  } catch(error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    next(error);
  }
};`;

console.log(`Fixing file: ${CONTROLLER_FILE_PATH}`);
fs.writeFileSync(CONTROLLER_FILE_PATH, correctContent);
console.log('Done!');