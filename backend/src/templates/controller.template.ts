import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { {{ModelName}}Model } from '../models/{{modelName}}.model';

/**
 * {{ModelName}} Controller
 */
export class {{ModelName}}Controller {
  /**
   * Get all {{modelNamePlural}}
   */
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {{modelNamePlural}} = await {{ModelName}}Model.find({ isActive: true }).sort({ createdAt: -1 });
      
      res.status(200).json({
        success: true,
        data: {{modelNamePlural}}
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get {{modelName}} by ID
   */
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = new Types.ObjectId(req.params.id);
      const {{modelName}} = await {{ModelName}}Model.findById(id);
      
      if (!{{modelName}}) {
        return res.status(404).json({
          success: false,
          error: '{{ModelName}} not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: {{modelName}}
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Create {{modelName}}
   */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {{modelName}} = new {{ModelName}}Model(req.body);
      const result = await {{modelName}}.save();
      
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Update {{modelName}}
   */
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = new Types.ObjectId(req.params.id);
      const updates = req.body;
      
      const {{modelName}} = await {{ModelName}}Model.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      );
      
      if (!{{modelName}}) {
        return res.status(404).json({
          success: false,
          error: '{{ModelName}} not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: {{modelName}}
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Delete {{modelName}}
   */
  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = new Types.ObjectId(req.params.id);
      const {{modelName}} = await {{ModelName}}Model.findByIdAndDelete(id);
      
      if (!{{modelName}}) {
        return res.status(404).json({
          success: false,
          error: '{{ModelName}} not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: '{{ModelName}} deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
