/**
 * User Controller Implementation
 * Handles user-related HTTP requests with TypeScript support
 */
import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/container';
import { BaseController } from './base.controller';
import { IApiResponse, ID, IPaginationParams } from '@/types/base.types';
import { 
  HttpStatus, 
  ValidationError, 
  NotFoundError, 
  UnauthorizedError 
} from '@/types/error.types';
import { 
  IUser, 
  IUserService, 
  UserCreateData, 
  UserUpdateData, 
  IUserCredentials,
  IAuthTokens,
  IUserBasicData
} from '@/domain/interfaces/user.interface';
import { IAuthenticatedRequest } from '@/middlewares/auth.middleware';
import { logger } from '@/utils/logger';

/**
 * User controller interface
 */
export interface IUserController {
  // Base methods
  getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
  getById(req: Request, res: Response, next: NextFunction): Promise<void>;
  create(req: Request, res: Response, next: NextFunction): Promise<void>;
  update(req: Request, res: Response, next: NextFunction): Promise<void>;
  delete(req: Request, res: Response, next: NextFunction): Promise<void>;
  
  // User-specific methods
  register(req: Request, res: Response, next: NextFunction): Promise<void>;
  login(req: Request, res: Response, next: NextFunction): Promise<void>;
  getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void>;
  requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void>;
  resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUsersByOrganization(req: Request, res: Response, next: NextFunction): Promise<void>;
  addUserToOrganization(req: Request, res: Response, next: NextFunction): Promise<void>;
  removeUserFromOrganization(req: Request, res: Response, next: NextFunction): Promise<void>;
  setDefaultOrganization(req: Request, res: Response, next: NextFunction): Promise<void>;
}

/**
 * User controller implementation
 */
@injectable()
export class UserController extends BaseController<IUser> implements IUserController {
  /**
   * Constructor
   * @param userService - User service
   */
  constructor(
    @inject(TYPES.UserService) private userService: IUserService
  ) {
    super();
  }

  /**
   * Gets all users
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async getAll(
    req: Request, 
    res: Response<IApiResponse<IUser[]>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      // This would typically include pagination and filtering
      // For simplicity, we're not implementing this endpoint fully
      this.sendSuccess(res, [], HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gets a user by ID
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async getById(
    req: Request, 
    res: Response<IApiResponse<IUser>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const id = this.getIdParam(req);
      const user = await this.userService.getUserById(id);
      
      if (!user) {
        throw new NotFoundError(`User not found with id: ${id}`);
      }
      
      this.sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Creates a new user
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async create(
    req: Request, 
    res: Response<IApiResponse<IUser>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const userData = req.body as UserCreateData;
      const createdUser = await this.userService.createUser(userData);
      
      this.sendSuccess(res, createdUser, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates a user
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async update(
    req: Request, 
    res: Response<IApiResponse<IUser>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const id = this.getIdParam(req);
      const userData = req.body as UserUpdateData;
      
      // Check if the authenticated user is updating their own profile
      const authUser = this.getAuthUser(req);
      
      if (authUser.id.toString() !== id.toString() && authUser.role !== 'admin') {
        throw new UnauthorizedError('You can only update your own profile');
      }
      
      const updatedUser = await this.userService.updateUser(id, userData);
      
      this.sendSuccess(res, updatedUser);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deletes a user
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async delete(
    req: Request, 
    res: Response<IApiResponse<null>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const id = this.getIdParam(req);
      
      // Only admins should be able to delete users
      const authUser = this.getAuthUser(req);
      
      if (authUser.role !== 'admin') {
        throw new UnauthorizedError('Only administrators can delete users');
      }
      
      const result = await this.userService.deleteUser(id);
      
      if (!result) {
        throw new NotFoundError(`User not found with id: ${id}`);
      }
      
      this.sendSuccess(res, null);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Registers a new user
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async register(
    req: Request, 
    res: Response<IApiResponse<IUser>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const userData = req.body as UserCreateData;
      
      // Validate required fields
      if (!userData.email || !userData.password) {
        throw new ValidationError('Email and password are required');
      }
      
      // Create user
      const createdUser = await this.userService.createUser(userData);
      
      this.sendSuccess(res, createdUser, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logs in a user
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async login(
    req: Request, 
    res: Response<IApiResponse<IAuthTokens>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const credentials = req.body as IUserCredentials;
      
      // Validate required fields
      if (!credentials.email || !credentials.password) {
        throw new ValidationError('Email and password are required');
      }
      
      // Validate credentials
      const user = await this.userService.validateCredentials(credentials);
      
      // Generate tokens
      const tokens = this.userService.generateAuthTokens(user);
      
      this.sendSuccess(res, tokens);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gets the current user
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async getCurrentUser(
    req: Request, 
    res: Response<IApiResponse<IUser>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const authUser = this.getAuthUser(req);
      const user = await this.userService.getUserById(authUser.id);
      
      if (!user) {
        throw new NotFoundError(`User not found with id: ${authUser.id}`);
      }
      
      this.sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Requests a password reset
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async requestPasswordReset(
    req: Request, 
    res: Response<IApiResponse<{ success: boolean }>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.body;
      
      if (!email) {
        throw new ValidationError('Email is required');
      }
      
      await this.userService.requestPasswordReset(email);
      
      // Always return success, even if email doesn't exist, to prevent email enumeration
      this.sendSuccess(res, { success: true });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resets a password
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async resetPassword(
    req: Request, 
    res: Response<IApiResponse<{ success: boolean }>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        throw new ValidationError('Token and new password are required');
      }
      
      const result = await this.userService.resetPassword(token, newPassword);
      
      this.sendSuccess(res, { success: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gets users by organization
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async getUsersByOrganization(
    req: Request, 
    res: Response<IApiResponse<IUserBasicData[]>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const organizationId = this.getOrganizationId(req);
      const users = await this.userService.getUsersByOrganization(organizationId);
      
      this.sendSuccess(res, users);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Adds a user to an organization
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async addUserToOrganization(
    req: Request, 
    res: Response<IApiResponse<IUser>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const organizationId = this.getOrganizationId(req);
      const { userId, role } = req.body;
      
      if (!userId || !role) {
        throw new ValidationError('User ID and role are required');
      }
      
      // Check if user is an admin or manager
      const authUser = this.getAuthUser(req);
      
      if (!['admin', 'manager'].includes(authUser.role || '')) {
        throw new UnauthorizedError('You do not have permission to add users to the organization');
      }
      
      const updatedUser = await this.userService.addUserToOrganization(
        userId as ID, 
        organizationId, 
        role
      );
      
      this.sendSuccess(res, updatedUser);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Removes a user from an organization
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async removeUserFromOrganization(
    req: Request, 
    res: Response<IApiResponse<IUser>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const organizationId = this.getOrganizationId(req);
      const userId = this.getIdParam(req);
      
      // Check if user is an admin or manager
      const authUser = this.getAuthUser(req);
      
      if (!['admin', 'manager'].includes(authUser.role || '')) {
        throw new UnauthorizedError('You do not have permission to remove users from the organization');
      }
      
      const updatedUser = await this.userService.removeUserFromOrganization(
        userId, 
        organizationId
      );
      
      this.sendSuccess(res, updatedUser);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Sets the default organization for a user
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async setDefaultOrganization(
    req: Request, 
    res: Response<IApiResponse<IUser>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const { organizationId } = req.body;
      
      if (!organizationId) {
        throw new ValidationError('Organization ID is required');
      }
      
      // Get authenticated user
      const authUser = this.getAuthUser(req);
      
      const updatedUser = await this.userService.setDefaultOrganization(
        authUser.id, 
        organizationId as ID
      );
      
      this.sendSuccess(res, updatedUser);
    } catch (error) {
      next(error);
    }
  }
}