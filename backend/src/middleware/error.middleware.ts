import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
// Define types for MongoDB errors
interface MongoServerError extends Error {
  code?: number | string;
  keyValue?: Record<string, any>;
}

/**
 * Error type enum for categorizing errors
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  BAD_REQUEST = 'BAD_REQUEST',
  INTERNAL = 'INTERNAL',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE'
}

/**
 * Error structure for the API response
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  type?: ErrorType;
  code?: string;
  errors?: Record<string, string[]>;
  stack?: string;
}

/**
 * Custom error class with status code
 */
export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;
  type: ErrorType;
  code?: string;

  /**
   * Create a new API error
   * @param statusCode - HTTP status code
   * @param message - Error message
   * @param type - Error type
   * @param errors - Validation errors
   * @param code - Error code
   */
  constructor(
    statusCode: number,
    message: string,
    type: ErrorType = ErrorType.INTERNAL,
    errors?: Record<string, string[]>,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.type = type;
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert the error to an API response
   * @param includeStack - Whether to include the stack trace
   */
  toResponse(includeStack = false): ApiErrorResponse {
    return {
      success: false,
      message: this.message,
      type: this.type,
      code: this.code,
      errors: this.errors,
      stack: includeStack ? this.stack : undefined
    };
  }

  /**
   * Create a validation error
   * @param message - Error message
   * @param errors - Validation errors
   */
  static validation(message: string, errors?: Record<string, string[]>): ApiError {
    return new ApiError(400, message, ErrorType.VALIDATION, errors);
  }

  /**
   * Create an authentication error
   * @param message - Error message
   */
  static authentication(message = 'Authentication required'): ApiError {
    return new ApiError(401, message, ErrorType.AUTHENTICATION);
  }

  /**
   * Create an authorization error
   * @param message - Error message
   */
  static authorization(message = 'Permission denied'): ApiError {
    return new ApiError(403, message, ErrorType.AUTHORIZATION);
  }

  /**
   * Create a not found error
   * @param message - Error message
   * @param resource - Resource that was not found
   */
  static notFound(message = 'Resource not found', resource?: string): ApiError {
    const msg = resource ? `${resource} not found` : message;
    return new ApiError(404, msg, ErrorType.NOT_FOUND);
  }

  /**
   * Create a conflict error
   * @param message - Error message
   * @param errors - Optional validation errors
   */
  static conflict(message = 'Resource already exists', errors?: Record<string, string[]>): ApiError {
    return new ApiError(409, message, ErrorType.CONFLICT, errors);
  }

  /**
   * Create a bad request error
   * @param message - Error message
   */
  static badRequest(message = 'Bad request'): ApiError {
    return new ApiError(400, message, ErrorType.BAD_REQUEST);
  }

  /**
   * Create an internal error
   * @param message - Error message
   */
  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(500, message, ErrorType.INTERNAL);
  }

  /**
   * Create a service unavailable error
   * @param message - Error message
   */
  static serviceUnavailable(message = 'Service unavailable'): ApiError {
    return new ApiError(503, message, ErrorType.SERVICE_UNAVAILABLE);
  }

  /**
   * Create an external service error
   * @param message - Error message
   * @param service - External service name
   */
  static externalService(message: string, service: string): ApiError {
    return new ApiError(
      502,
      `Error from external service ${service}: ${message}`,
      ErrorType.EXTERNAL_SERVICE,
      undefined,
      `${service.toUpperCase()}_ERROR`
    );
  }
}

/**
 * Mongoose validation error interface
 */
interface MongooseValidationError extends Error {
  name: 'ValidationError';
  errors: Record<string, { message: string }>;
}

/**
 * Check if error is a Mongoose validation error
 * @param err - Error to check
 */
function isMongooseValidationError(err: any): err is MongooseValidationError {
  return err.name === 'ValidationError' && err.errors !== undefined;
}

/**
 * Not found error handler
 * This middleware handles 404 errors for routes that don't exist
 */
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = ApiError.notFound(`Not Found - ${req.originalUrl}`);
  next(error);
};

/**
 * Global error handler
 * This middleware handles all errors thrown in the application
 */
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default to internal server error
  let apiError: ApiError = ApiError.internal();

  // Determine the appropriate error type and create a proper ApiError
  if (err instanceof ApiError) {
    // Use the existing ApiError
    apiError = err;
  } else if (isMongooseValidationError(err)) {
    // Convert Mongoose validation error
    const errors: Record<string, string[]> = {};
    Object.keys(err.errors).forEach((field) => {
      errors[field] = [err.errors[field].message];
    });
    apiError = ApiError.validation('Validation Error', errors);
  } else if (err instanceof Error && 'code' in err && err.code === 11000 && 'keyValue' in err) {
    // Handle MongoDB duplicate key error
    const mongoError = err as MongoServerError;
    const field = Object.keys(mongoError.keyValue || {})[0];
    const errors = {
      [field]: [`${field} already exists`]
    };
    apiError = ApiError.conflict('Duplicate Entry', errors);
  } else if (err instanceof Error) {
    // Generic Error instance
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      apiError = ApiError.authentication(err.message);
    } else if (err.message.includes('ECONNREFUSED') || err.message.includes('ETIMEDOUT')) {
      apiError = ApiError.serviceUnavailable('External service connection failed');
    } else {
      // Use the original error message but keep it as an internal error
      apiError = ApiError.internal(err.message);
    }
  }

  // Log error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(
      `[ERROR] ${apiError.statusCode} - ${apiError.message}`,
      apiError.errors || '',
      err instanceof Error ? err.stack : ''
    );
  }

  // Send error response
  res
    .status(apiError.statusCode)
    .json(apiError.toResponse(process.env.NODE_ENV !== 'production'));
};