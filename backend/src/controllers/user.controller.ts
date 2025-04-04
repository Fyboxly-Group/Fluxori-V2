import { Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { UserService } from '../services/user.service';
import { 
  AuthenticatedRequest, 
  IUserController, 
  ApiResponse,
  UserResponseData,
  filterUserData
} from '../types/user-management';
import { ApiError } from '../middleware/error.middleware';

/**
 * Controller for user management
 * Handles HTTP requests for user operations
 */
@injectable()
export class UserController implements IUserController {
  private userService: UserService;

  /**
   * Creates a new instance of UserController
   * @param userService Injected user service
   */
  constructor(@inject(UserService) userService: UserService) {
    this.userService = userService;
  }

  /**
   * Get all users
   * @route GET /api/users
   * @access Admin only
   */
  public async getAllUsers(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<UserResponseData[]>>,
    next: NextFunction
  ): Promise<void> {
    try {
      // Check if user is admin
      if (req.user?.role !== 'admin' && !req.user?.isSystemAdmin) {
        throw new ApiError(403, 'Not authorized to access this resource');
      }

      const users = await this.userService.getAllUsers();
      
      // Filter out sensitive information
      const filteredUsers = users.map(filterUserData);
      
      res.status(200).json({
        success: true,
        data: filteredUsers
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   * @route GET /api/users/:id
   * @access Admin or self only
   */
  public async getUserById(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<UserResponseData>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      
      // Check if user is admin or accessing own record
      if (req.user?.role !== 'admin' && req.user?.id !== id && !req.user?.isSystemAdmin) {
        throw new ApiError(403, 'Not authorized to access this resource');
      }

      const user = await this.userService.getUserById(id);
      
      if (!user) {
        throw new ApiError(404, 'User not found');
      }
      
      // Filter out sensitive information
      const filteredUser = filterUserData(user);
      
      res.status(200).json({
        success: true,
        data: filteredUser
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new user
   * @route POST /api/users
   * @access Admin only
   */
  public async createUser(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<UserResponseData>>,
    next: NextFunction
  ): Promise<void> {
    try {
      // Check if user is admin
      if (req.user?.role !== 'admin' && !req.user?.isSystemAdmin) {
        throw new ApiError(403, 'Not authorized to access this resource');
      }

      const { email, password, firstName, lastName, role } = req.body;
      
      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        throw new ApiError(400, 'Missing required fields', {
          details: {
            ...(email ? {} : { email: ['Email is required'] }),
            ...(password ? {} : { password: ['Password is required'] }),
            ...(firstName ? {} : { firstName: ['First name is required'] }),
            ...(lastName ? {} : { lastName: ['Last name is required'] })
          }
        });
      }
      
      // Validate password length
      if (password.length < 8) {
        throw new ApiError(400, 'Password must be at least 8 characters long', {
          details: {
            password: ['Password must be at least 8 characters long']
          }
        });
      }
      
      // Validate role if provided
      if (role && !['admin', 'user', 'guest'].includes(role)) {
        throw new ApiError(400, 'Invalid role', {
          details: {
            role: ['Role must be one of: admin, user, guest']
          }
        });
      }
      
      const user = await this.userService.createUser({
        email,
        password,
        firstName,
        lastName,
        role: role || 'user'
      });
      
      // Filter out sensitive information
      const filteredUser = filterUserData(user);
      
      res.status(201).json({
        success: true,
        data: filteredUser,
        message: 'User created successfully'
      });
    } catch (error) {
      // Handle duplicate email error
      if (error instanceof Error && error.message.includes('already exists')) {
        next(new ApiError(400, 'User with this email already exists', {
          details: {
            email: ['Email is already registered']
          }
        }));
        return;
      }
      
      next(error);
    }
  }

  /**
   * Update a user
   * @route PUT /api/users/:id
   * @access Admin or self only
   */
  public async updateUser(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<UserResponseData>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      
      // Check if user is admin or updating own record
      if (req.user?.role !== 'admin' && req.user?.id !== id && !req.user?.isSystemAdmin) {
        throw new ApiError(403, 'Not authorized to access this resource');
      }

      const { password, email, firstName, lastName, role } = req.body;
      
      // If regular user is updating their own record, don't allow role change
      if (req.user?.role !== 'admin' && !req.user?.isSystemAdmin && role) {
        throw new ApiError(403, 'Not authorized to change role');
      }
      
      // Validate role if provided
      if (role && !['admin', 'user', 'guest'].includes(role)) {
        throw new ApiError(400, 'Invalid role', {
          details: {
            role: ['Role must be one of: admin, user, guest']
          }
        });
      }
      
      // Validate password length if provided
      if (password && password.length < 8) {
        throw new ApiError(400, 'Password must be at least 8 characters long', {
          details: {
            password: ['Password must be at least 8 characters long']
          }
        });
      }
      
      const userData = {
        ...(email && { email }),
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(role && { role }),
        ...(password && { password })
      };
      
      const user = await this.userService.updateUser(id, userData);
      
      if (!user) {
        throw new ApiError(404, 'User not found');
      }
      
      // Filter out sensitive information
      const filteredUser = filterUserData(user);
      
      res.status(200).json({
        success: true,
        data: filteredUser,
        message: 'User updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a user
   * @route DELETE /api/users/:id
   * @access Admin only
   */
  public async deleteUser(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<null>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      
      // Check if user is admin
      if (req.user?.role !== 'admin' && !req.user?.isSystemAdmin) {
        throw new ApiError(403, 'Not authorized to access this resource');
      }
      
      // Prevent self-deletion
      if (req.user?.id === id) {
        throw new ApiError(400, 'Cannot delete your own account');
      }

      const success = await this.userService.deleteUser(id);
      
      if (!success) {
        throw new ApiError(404, 'User not found');
      }
      
      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Activate a user
   * @route PATCH /api/users/:id/activate
   * @access Admin only
   */
  public async activateUser(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<UserResponseData>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      
      // Check if user is admin
      if (req.user?.role !== 'admin' && !req.user?.isSystemAdmin) {
        throw new ApiError(403, 'Not authorized to access this resource');
      }

      const user = await this.userService.activateUser(id);
      
      if (!user) {
        throw new ApiError(404, 'User not found');
      }
      
      // Filter out sensitive information
      const filteredUser = filterUserData(user);
      
      res.status(200).json({
        success: true,
        data: filteredUser,
        message: 'User activated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deactivate a user
   * @route PATCH /api/users/:id/deactivate
   * @access Admin only
   */
  public async deactivateUser(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<UserResponseData>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      
      // Check if user is admin
      if (req.user?.role !== 'admin' && !req.user?.isSystemAdmin) {
        throw new ApiError(403, 'Not authorized to access this resource');
      }
      
      // Prevent self-deactivation
      if (req.user?.id === id) {
        throw new ApiError(400, 'Cannot deactivate your own account');
      }

      const user = await this.userService.deactivateUser(id);
      
      if (!user) {
        throw new ApiError(404, 'User not found');
      }
      
      // Filter out sensitive information
      const filteredUser = filterUserData(user);
      
      res.status(200).json({
        success: true,
        data: filteredUser,
        message: 'User deactivated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change a user's role
   * @route PATCH /api/users/:id/role
   * @access Admin only
   */
  public async changeUserRole(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<UserResponseData>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      // Check if user is admin
      if (req.user?.role !== 'admin' && !req.user?.isSystemAdmin) {
        throw new ApiError(403, 'Not authorized to access this resource');
      }
      
      // Validate role
      if (!role || !['admin', 'user', 'guest'].includes(role)) {
        throw new ApiError(400, 'Invalid role', {
          details: {
            role: ['Role must be one of: admin, user, guest']
          }
        });
      }
      
      // Prevent self-role-demotion from admin
      if (req.user?.id === id && req.user.role === 'admin' && role !== 'admin') {
        throw new ApiError(400, 'Cannot demote your own admin role');
      }

      const user = await this.userService.changeUserRole(id, role);
      
      if (!user) {
        throw new ApiError(404, 'User not found');
      }
      
      // Filter out sensitive information
      const filteredUser = filterUserData(user);
      
      res.status(200).json({
        success: true,
        data: filteredUser,
        message: `User role updated to ${role}`
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset a user's password
   * @route POST /api/users/:id/reset-password
   * @access Admin only
   */
  public async resetUserPassword(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<null>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { password } = req.body;
      
      // Check if user is admin
      if (req.user?.role !== 'admin' && !req.user?.isSystemAdmin) {
        throw new ApiError(403, 'Not authorized to access this resource');
      }
      
      // Validate password
      if (!password) {
        throw new ApiError(400, 'Password is required', {
          details: {
            password: ['Password is required']
          }
        });
      }
      
      if (password.length < 8) {
        throw new ApiError(400, 'Password must be at least 8 characters long', {
          details: {
            password: ['Password must be at least 8 characters long']
          }
        });
      }

      const success = await this.userService.resetUserPassword(id, password);
      
      if (!success) {
        throw new ApiError(404, 'User not found');
      }
      
      res.status(200).json({
        success: true,
        message: 'User password reset successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get organizations a user belongs to
   * @route GET /api/users/:id/organizations
   * @access Admin or self only
   */
  public async getUserOrganizations(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<any[]>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      
      // Check if user is admin or accessing own record
      if (req.user?.role !== 'admin' && req.user?.id !== id && !req.user?.isSystemAdmin) {
        throw new ApiError(403, 'Not authorized to access this resource');
      }

      const organizations = await this.userService.getUserOrganizations(id);
      
      res.status(200).json({
        success: true,
        data: organizations
      });
    } catch (error) {
      next(error);
    }
  }
}