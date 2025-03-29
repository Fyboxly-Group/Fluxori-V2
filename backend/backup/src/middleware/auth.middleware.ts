import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUserDocument } from '../models/user.model';

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}

interface JwtPayload {
  userId?: string;  // Used in tests
  id?: string;      // Used in production
  role?: string;    // Role information
}

/**
 * Authentication middleware
 * Verifies the JWT token and attaches the user to the request object
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Invalid token format.',
      });
    }
    
    // Verify token
    const secret = process.env.JWT_SECRET || 'default_secret';
    const decoded = jwt.verify(
      token,
      secret
    ) as JwtPayload;
    
    // Find user by id (support both id and userId for tests)
    const userId = decoded.id || decoded.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Invalid token payload.',
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. User not found.',
      });
    }
    
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Your account has been deactivated.',
      });
    }
    
    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Invalid token.',
    });
  }
};

/**
 * Role-based authorization middleware
 * Checks if the authenticated user has the required role
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
    }
    
    next();
  };
};