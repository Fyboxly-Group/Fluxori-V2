import { Request, Response, NextFunction } from 'express';
import { container } from '../config/inversify';
import { AuthService, IAuthService, JwtTokenPayload } from '../services/auth.service';
import { AuthUser, AuthenticatedRequest } from '../types/express-extensions';
import { ApiError } from './error.middleware';
import { Types } from 'mongoose';
import User from '../models/user.model';

/**
 * Authentication middleware
 * Verifies the JWT token and attaches the user to the request object
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required. No token provided.');
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new ApiError(401, 'Authentication required. Invalid token format.');
    }
    
    // Get the auth service from container
    const authService = container.get<IAuthService>(AuthService);
    
    // Validate token
    const validationResult = authService.validateToken(token);
    
    if (!validationResult.valid || !validationResult.payload) {
      throw new ApiError(401, `Authentication failed. ${validationResult.error || 'Invalid token.'}`);
    }
    
    // Extract user ID from payload
    const userId = validationResult.payload.id;
    
    // Find user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      throw new ApiError(401, 'Authentication failed. User not found.');
    }
    
    if (!user.isActive) {
      throw new ApiError(403, 'Access denied. Your account has been deactivated.');
    }
    
    // Create authenticated user object
    const authUser: AuthUser = {
      _id: user._id,
      id: user._id.toString(),
      email: user.email,
      organizationId: (user as any).organizationId?.toString() || '',
      role: user.role,
    };
    
    // Attach auth user to request object
    (req as AuthenticatedRequest).user = authUser;
    
    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        errors: error.errors,
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Invalid token.',
    });
  }
};

/**
 * Role-based authorization middleware
 * Checks if the authenticated user has one of the required roles
 * @param roles Authorized roles
 * @returns Express middleware
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authReq = req as AuthenticatedRequest;
      
      if (!authReq.user) {
        throw new ApiError(401, 'Authentication required.');
      }
      
      if (roles.length > 0 && !roles.includes(authReq.user.role)) {
        throw new ApiError(403, 'Access denied. Insufficient permissions.');
      }
      
      next();
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
          errors: error.errors,
        });
      }
      
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }
  };
};

/**
 * Organization-based authorization middleware
 * Checks if the authenticated user belongs to the requested organization
 * @param paramName URL parameter name containing the organization ID
 * @returns Express middleware
 */
export const authorizeOrganization = (paramName: string = 'organizationId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authReq = req as AuthenticatedRequest;
      
      if (!authReq.user) {
        throw new ApiError(401, 'Authentication required.');
      }
      
      const organizationId = req.params[paramName];
      
      if (!organizationId) {
        throw new ApiError(400, `Organization ID parameter '${paramName}' is required.`);
      }
      
      // Admin users can access any organization
      if (authReq.user.role === 'admin') {
        return next();
      }
      
      // Check if user belongs to the requested organization
      if (authReq.user.organizationId !== organizationId) {
        throw new ApiError(403, 'Access denied. You cannot access this organization\'s resources.');
      }
      
      next();
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
          errors: error.errors,
        });
      }
      
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }
  };
};