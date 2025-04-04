/**
 * Authentication middleware with TypeScript support
 * Handles JWT token validation and user authentication
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/environment';
import { ID } from '../types/base.types';
import { ErrorCode, HttpStatus, UnauthorizedError } from '../types/error.types';
import { logger } from '../utils/logger';

/**
 * JWT payload interface
 */
export interface IJwtPayload {
  id: string;
  email: string;
  organizationId?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

/**
 * Extended Request interface with authenticated user data
 */
export interface IAuthenticatedRequest extends Request {
  user?: {
    id: ID;
    email: string;
    organizationId?: ID;
    role?: string;
  };
}

/**
 * Authentication options
 */
export interface IAuthOptions {
  requireOrganization?: boolean;
  requiredRoles?: string[];
}

/**
 * Default authentication options
 */
const DEFAULT_AUTH_OPTIONS: IAuthOptions = {
  requireOrganization: false,
  requiredRoles: [],
};

/**
 * Authentication middleware
 * @param options - Authentication options
 * @returns Express middleware function
 */
export function authMiddleware(
  options: IAuthOptions = DEFAULT_AUTH_OPTIONS
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Get authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        throw new UnauthorizedError('No authorization header provided');
      }
      
      // Get token
      const [type, token] = authHeader.split(' ');
      
      if (type !== 'Bearer' || !token) {
        throw new UnauthorizedError('Invalid authorization format');
      }
      
      // Verify token
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as IJwtPayload;
        
        // Assign user data to request
        (req as IAuthenticatedRequest).user = {
          id: decoded.id as ID,
          email: decoded.email,
          ...(decoded.organizationId && { organizationId: decoded.organizationId as ID }),
          ...(decoded.role && { role: decoded.role }),
        };
        
        // Check if organization is required
        if (options.requireOrganization && !decoded.organizationId) {
          throw new UnauthorizedError('Organization access required');
        }
        
        // Check if role is required
        if (options.requiredRoles?.length && 
            (!decoded.role || !options.requiredRoles.includes(decoded.role))) {
          throw new UnauthorizedError(
            `Required role not found. Required: ${options.requiredRoles.join(', ')}`
          );
        }
        
        next();
      } catch (error) {
        // Handle JWT verification errors
        if (error instanceof UnauthorizedError) {
          throw error;
        }
        
        if (error instanceof jwt.JsonWebTokenError) {
          throw new UnauthorizedError('Invalid token', { name: error.name });
        }
        
        if (error instanceof jwt.TokenExpiredError) {
          throw new UnauthorizedError('Token expired', { name: error.name });
        }
        
        // Other JWT errors
        logger.error('JWT verification error:', error);
        throw new UnauthorizedError('Invalid token');
      }
    } catch (error) {
      // Pass error to error handler
      next(error);
    }
  };
}

/**
 * Optional authentication middleware
 * Sets user if token is valid, but continues even without a token
 * @returns Express middleware function
 */
export function optionalAuthMiddleware(
  req: Request, 
  res: Response, 
  next: NextFunction
): void {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }
    
    // Get token
    const [type, token] = authHeader.split(' ');
    
    if (type !== 'Bearer' || !token) {
      return next();
    }
    
    // Verify token
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as IJwtPayload;
      
      // Assign user data to request
      (req as IAuthenticatedRequest).user = {
        id: decoded.id as ID,
        email: decoded.email,
        ...(decoded.organizationId && { organizationId: decoded.organizationId as ID }),
        ...(decoded.role && { role: decoded.role }),
      };
    } catch (error) {
      // Ignore JWT errors in optional auth
      logger.debug('Optional auth: Invalid token', { error });
    }
    
    next();
  } catch (error) {
    // Pass any other error to error handler
    next(error);
  }
}