import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class with status code
 */
export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(statusCode: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not found error handler
 * This middleware handles 404 errors for routes that don't exist
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(404, `Not Found - ${req.originalUrl}`);
  next(error);
};

/**
 * Global error handler
 * This middleware handles all errors thrown in the application
 */
export const errorHandler = (
  err: ApiError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default values
  let statusCode = 500;
  let message = 'Server Error';
  let errors: Record<string, string[]> | undefined;

  // Check if error is an instance of ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err.name === 'ValidationError' && err instanceof Error) {
    // Mongoose validation error
    statusCode = 400;
    message = 'Validation Error';
    // Parse mongoose validation error
    if (err.message) {
      const matches = err.message.match(/Path `(\w+)` .+/g);
      if (matches) {
        errors = {};
        matches.forEach((match) => {
          const field = match.match(/Path `(\w+)`/)?.[1];
          if (field) {
            if (!errors![field]) {
              errors![field] = [];
            }
            errors![field].push(match.replace(/Path `\w+` /, ''));
          }
        });
      }
    }
  } else if (err.name === 'MongoServerError' && 'code' in err && (err as any).code === 11000) {
    // Mongo duplicate key error
    statusCode = 400;
    message = 'Duplicate Key Error';
    // Extract the field name from the error message
    const field = Object.keys((err as any).keyValue)[0];
    errors = {
      [field]: [`${field} already exists`],
    };
  } else if (err instanceof Error) {
    // Generic Error instance
    message = err.message;
  }

  // Log error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};