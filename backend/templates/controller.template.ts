import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as mongoose from 'mongoose';
import { ApiError } from '../../middleware/error.middleware';
import EntityName, { IEntityName, IEntityNameDocument } from '../models/entityName.model';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../config/inversify.types';
import { IEntityNameService } from '../services/entityName.service';

/**
 * Base request with authentication
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    organizationId: string;
    email?: string;
    role?: string;
  };
}

/**
 * API response interface for type safety
 */
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * EntityName controller interface
 */
export interface IEntityNameController {
  getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}

/**
 * EntityName controller implementation
 */
@injectable()
export class EntityNameController implements IEntityNameController {
  constructor(
    @inject(TYPES.EntityNameService) private entityNameService: IEntityNameService
  ) {}

  /**
   * Get all entityNames with pagination and filtering
   * 
   * @route GET /api/entityName
   * @param req Request object with query parameters
   * @param res Response object
   * @param next Next function
   */
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
      }

      const { organizationId } = req.user;
      
      const options = {
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        status: req.query.status as string,
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
        search: req.query.search as string
      };

      const result = await this.entityNameService.getAll(organizationId, options);

      res.status(StatusCodes.OK).json({
        success: true,
        data: result.items,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          pages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get entityName by ID
   * 
   * @route GET /api/entityName/:id
   * @param req Request object with id parameter
   * @param res Response object
   * @param next Next function
   */
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
      }

      const { id } = req.params;
      const { organizationId } = req.user;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid ID format');
      }

      const entityName = await this.entityNameService.getById(id, organizationId);

      res.status(StatusCodes.OK).json({
        success: true,
        data: entityName
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new entityName
   * 
   * @route POST /api/entityName
   * @param req Request object with entityName data
   * @param res Response object
   * @param next Next function
   */
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
      }

      const { id: userId, organizationId } = req.user;
      const entityNameData: Partial<IEntityName> = req.body;

      const createdEntityName = await this.entityNameService.create(
        entityNameData,
        userId,
        organizationId
      );

      res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'EntityName created successfully',
        data: createdEntityName
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an existing entityName
   * 
   * @route PUT /api/entityName/:id
   * @param req Request object with id parameter and update data
   * @param res Response object
   * @param next Next function
   */
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
      }

      const { id } = req.params;
      const { organizationId } = req.user;
      const updateData: Partial<IEntityName> = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid ID format');
      }

      const updatedEntityName = await this.entityNameService.update(
        id,
        updateData,
        organizationId
      );

      res.status(StatusCodes.OK).json({
        success: true,
        message: 'EntityName updated successfully',
        data: updatedEntityName
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an entityName
   * 
   * @route DELETE /api/entityName/:id
   * @param req Request object with id parameter
   * @param res Response object
   * @param next Next function
   */
  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
      }

      const { id } = req.params;
      const { organizationId } = req.user;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid ID format');
      }

      const deleted = await this.entityNameService.delete(id, organizationId);

      res.status(StatusCodes.OK).json({
        success: true,
        message: 'EntityName deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}