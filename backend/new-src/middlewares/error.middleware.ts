/**
 * Error handling middleware for Express with TypeScript support
 */
import { Request, Response, NextFunction } from 'express';
import { 
  ApplicationError, 
  ErrorCode, 
  HttpStatus,
  ValidationError
} from '../types/error.types';
import { logger } from '../utils/logger';
import { env } from '../config/environment';

/**
 * Error response interface
 */
export interface IErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Error middleware function
 * @param err - Error object
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export function errorMiddleware(
  err: Error | ApplicationError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Default error values
  let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  let errorCode = ErrorCode.INTERNAL_ERROR;
  let message = 'An unexpected error occurred';
  let details: unknown = undefined;
  let isOperational = false;
  
  // Log the error
  logger.error(`${req.method} ${req.path} - Error:`, err, {
    ip: req.ip,
    path: req.path,
    method: req.method,
    query: req.query,
    userId: (req as any).user?.id,
  });
  
  // Handle specific error types
  if (err instanceof ApplicationError) {
    statusCode = err.statusCode;
    errorCode = err.code;
    message = err.message;
    details = err.details;
    isOperational = err.isOperational;
  } else if (err.name === 'ValidationError') {
    // Handle Mongoose validation errors
    statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
    errorCode = ErrorCode.VALIDATION_ERROR;
    message = 'Validation error';
    details = err;
  } else if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    // Handle MongoDB errors
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    errorCode = ErrorCode.DATABASE_ERROR;
    message = 'Database error';
    if ((err as any).code === 11000) {
      // Duplicate key error
      statusCode = HttpStatus.CONFLICT;
      errorCode = ErrorCode.CONFLICT;
      message = 'Duplicate entry';
    }
  } else if (err.name === 'JsonWebTokenError') {
    // Handle JWT errors
    statusCode = HttpStatus.UNAUTHORIZED;
    errorCode = ErrorCode.TOKEN_INVALID;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    // Handle JWT expiration
    statusCode = HttpStatus.UNAUTHORIZED;
    errorCode = ErrorCode.TOKEN_EXPIRED;
    message = 'Token expired';
  }
  
  // Construct error response
  const errorResponse: IErrorResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
    }
  };
  
  // Include error details in non-production environments or for operational errors
  if ((env.NODE_ENV !== 'production' || isOperational) && details) {
    errorResponse.error.details = details;
  }
  
  // Include stack trace in development
  if (env.NODE_ENV === 'development' && err.stack) {
    (errorResponse.error as any).stack = err.stack;
  }
  
  // Send response
  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found middleware
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export function notFoundMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const error = new ValidationError(`Not Found - ${req.originalUrl}`);
  res.status(HttpStatus.NOT_FOUND);
  next(error);
}

/**
 * Async route handler wrapper to avoid try/catch in each route
 * @param fn - Async route handler function
 * @returns Express middleware function
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}