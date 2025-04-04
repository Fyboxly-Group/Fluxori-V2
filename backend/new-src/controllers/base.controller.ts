/**
 * Base Controller Abstract Class
 * Provides a foundation for creating controllers with TypeScript support
 */
import { Request, Response, NextFunction } from 'express';
import { IApiResponse, IBaseEntity, ID, IPaginatedResult } from '../types/base.types';
import { HttpStatus, NotFoundError, ValidationError } from '../types/error.types';
import { IAuthenticatedRequest } from '../middlewares/auth.middleware';

/**
 * Base controller interface
 */
export interface IBaseController<T extends IBaseEntity> {
  getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
  getById(req: Request, res: Response, next: NextFunction): Promise<void>;
  create(req: Request, res: Response, next: NextFunction): Promise<void>;
  update(req: Request, res: Response, next: NextFunction): Promise<void>;
  delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Base controller abstract class
 * Provides common functionality for controllers
 */
export abstract class BaseController<T extends IBaseEntity> implements IBaseController<T> {
  /**
   * Gets all entities
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public abstract getAll(
    req: Request, 
    res: Response<IApiResponse<T[]>>, 
    next: NextFunction
  ): Promise<void>;

  /**
   * Gets entity by ID
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public abstract getById(
    req: Request, 
    res: Response<IApiResponse<T>>, 
    next: NextFunction
  ): Promise<void>;

  /**
   * Creates a new entity
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public abstract create(
    req: Request, 
    res: Response<IApiResponse<T>>, 
    next: NextFunction
  ): Promise<void>;

  /**
   * Updates an entity
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public abstract update(
    req: Request, 
    res: Response<IApiResponse<T>>, 
    next: NextFunction
  ): Promise<void>;

  /**
   * Deletes an entity
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public abstract delete(
    req: Request, 
    res: Response<IApiResponse<null>>, 
    next: NextFunction
  ): Promise<void>;

  /**
   * Sends a success response
   * @param res - Express response
   * @param data - Response data
   * @param statusCode - HTTP status code
   */
  protected sendSuccess<R>(
    res: Response<IApiResponse<R>>, 
    data: R, 
    statusCode: HttpStatus = HttpStatus.OK
  ): void {
    res.status(statusCode).json({
      success: true,
      data,
    });
  }

  /**
   * Sends a paginated success response
   * @param res - Express response
   * @param result - Paginated result
   * @param statusCode - HTTP status code
   */
  protected sendPaginatedSuccess<R>(
    res: Response<IApiResponse<R[]>>, 
    result: IPaginatedResult<R>, 
    statusCode: HttpStatus = HttpStatus.OK
  ): void {
    res.status(statusCode).json({
      success: true,
      data: result.items,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    });
  }

  /**
   * Gets ID from request parameters
   * @param req - Express request
   * @returns ID from request parameters
   */
  protected getIdParam(req: Request): ID {
    const { id } = req.params;
    
    if (!id) {
      throw new ValidationError('ID parameter is required');
    }
    
    return id as ID;
  }

  /**
   * Gets authenticated user from request
   * @param req - Express request
   * @returns Authenticated user
   */
  protected getAuthUser(req: Request): IAuthenticatedRequest['user'] {
    const user = (req as IAuthenticatedRequest).user;
    
    if (!user) {
      throw new ValidationError('Authentication required');
    }
    
    return user;
  }

  /**
   * Gets organization ID from authenticated user
   * @param req - Express request
   * @returns Organization ID
   */
  protected getOrganizationId(req: Request): ID {
    const user = this.getAuthUser(req);
    
    if (!user.organizationId) {
      throw new ValidationError('Organization ID is required');
    }
    
    return user.organizationId;
  }
}