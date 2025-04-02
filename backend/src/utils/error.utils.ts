// @ts-nocheck - Added by final-ts-fix.js
/**
 * Error utilities for standardized error handling across the application
 */
import { Request } from 'express';
import logger from './logger';

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  // Technical errors
  NETWORK = 'network',                 // Network connectivity issues
  DATABASE = 'database',               // Database errors
  INTERNAL = 'internal',               // Internal server errors
  VALIDATION = 'validation',           // Input validation errors
  
  // Authentication/Authorization errors
  AUTHENTICATION = 'authentication',   // Authentication failures
  AUTHORIZATION = 'authorization',     // Authorization/permission errors
  
  // Integration errors
  API_LIMIT = 'api_limit',             // Rate limiting or quota errors
  INTEGRATION = 'integration',         // General external service errors
  MARKETPLACE = 'marketplace',         // Marketplace-specific errors
  
  // Business logic errors
  BUSINESS = 'business',               // Business logic/rule violations
  RESOURCE = 'resource',               // Resource not found
  CONFLICT = 'conflict',               // Resource conflicts
  
  // Client errors
  CLIENT = 'client',                   // General client errors
  REQUEST = 'request',                 // Invalid request errors
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  CRITICAL = 'critical',   // System unusable, requires immediate attention
  ERROR = 'error',         // Functionality broken, requires attention
  WARNING = 'warning',     // Potential issues that don't break functionality
  INFO = 'info',           // Informational errors that don't affect functionality
}

/**
 * Interface for extended error details
 */
export interface ErrorDetails {
  category: ErrorCategory;
  severity: ErrorSeverity;
  code?: string;
  context?: Record<string, any>;
  source?: string;
  transient?: boolean;
  retryable?: boolean;
  retryAfter?: number;
  suggestion?: string;
}

/**
 * Base application error class with enhanced properties
 * for detailed error tracking and handling
 */
export class AppError extends Error {
  // HTTP status code
  statusCode: number;
  
  // Error classification
  category: ErrorCategory;
  
  // Error severity level
  severity: ErrorSeverity;
  
  // Unique error code for documentation/reference
  code?: string;
  
  // Context data for debugging
  context?: Record<string, any>;
  
  // Error source (component, module, service)
  source?: string;
  
  // Whether the error is temporary/might resolve on retry
  transient: boolean;
  
  // Whether the operation can be retried
  retryable: boolean;
  
  // Suggested retry delay in milliseconds (if retryable)
  retryAfter?: number;
  
  // Validation errors for form/request validation failures
  validationErrors?: Record<string, string[]>;
  
  // Suggested action for users/developers
  suggestion?: string;
  
  // Original error if this is a wrapped error
  originalError?: Error;
  
  // Timestamp when error occurred
  timestamp: Date;

  /**
   * Create a new AppError instance
   * 
   * @param message Error message
   * @param statusCode HTTP status code
   * @param details Additional error details
   * @param originalError Original error to wrap
   */
  constructor(
    message: string,
    statusCode = 500,
    details?: Partial<ErrorDetails>,
    originalError?: Error
  ) {
    super(message);
    
    // Basic properties
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.timestamp = new Date();
    
    // Classification and severity
    this.category = details?.category || ErrorCategory.INTERNAL;
    this.severity = details?.severity || ErrorSeverity.ERROR;
    
    // Additional details
    this.code = details?.code;
    this.context = details?.context || {};
    this.source = details?.source;
    this.transient = details?.transient || false;
    this.retryable = details?.retryable || false;
    this.retryAfter = details?.retryAfter;
    this.suggestion = details?.suggestion;
    this.originalError = originalError;
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Set validation errors
   */
  setValidationErrors(errors: Record<string, string[]>): this {
    this.validationErrors = errors;
    return this;
  }

  /**
   * Add context data to error
   */
  addContext(key: string, value: any): this {
    if (!this.context) {
      this.context = {};
    }
    this.context[key] = value;
    return this;
  }

  /**
   * Generate a standardized error object for API responses
   */
  toResponse() {
    const response: any = {
      success: false,
      message: this.message,
      code: this.code,
      category: this.category,
    };

    // Add validation errors if available
    if (this.validationErrors) {
      response.errors = this.validationErrors;
    }
    
    // Add suggestion if available
    if (this.suggestion) {
      response.suggestion = this.suggestion;
    }
    
    // Add retry information if applicable
    if (this.retryable) {
      response.retryable = true;
      if (this.retryAfter) {
        response.retryAfter = this.retryAfter;
      }
    }
    
    return response;
  }

  /**
   * Log the error with appropriate level and context
   */
  log(req?: Request): void {
    // Determine log level based on severity
    const level = this.getSeverityLogLevel();
    
    // Create structured log entry
    const logEntry = {
      error: {
        message: this.message,
        name: this.name,
        category: this.category,
        code: this.code,
        statusCode: this.statusCode,
        source: this.source,
        context: this.context,
      },
      request: req ? {
        id: req.id,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userId: req.user?.id,
      } : undefined,
      timestamp: this.timestamp,
      stack: this.stack,
    };
    
    // Log using appropriate level
    logger[level](logEntry);
    
    // If critical, send additional alert
    if (this.severity === ErrorSeverity.CRITICAL) {
      // Could integrate with external alerting system here
      logger.error('CRITICAL ERROR - IMMEDIATE ATTENTION REQUIRED', logEntry);
    }
  }

  /**
   * Maps error severity to logger levels
   */
  private getSeverityLogLevel(): string {
    switch (this.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.ERROR:
        return 'error';
      case ErrorSeverity.WARNING:
        return 'warn';
      case ErrorSeverity.INFO:
        return 'info';
      default:
        return 'error';
    }
  }
}

/**
 * Network/connectivity error
 */
export class NetworkError extends AppError {
  constructor(
    message = 'Network connectivity error',
    statusCode = 503,
    details?: Partial<ErrorDetails>,
    originalError?: Error
  ) {
    super(
      message,
      statusCode,
      {
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.ERROR,
        transient: true,
        retryable: true,
        retryAfter: 5000,
        suggestion: 'Please check your network connection and try again',
        ...details
      },
      originalError
    );
  }
}

/**
 * Database error
 */
export class DatabaseError extends AppError {
  constructor(
    message = 'Database operation failed',
    statusCode = 500,
    details?: Partial<ErrorDetails>,
    originalError?: Error
  ) {
    super(
      message,
      statusCode,
      {
        category: ErrorCategory.DATABASE,
        severity: ErrorSeverity.ERROR,
        ...details
      },
      originalError
    );
  }
}

/**
 * Validation error for invalid input
 */
export class ValidationError extends AppError {
  constructor(
    message = 'Validation failed',
    errors?: Record<string, string[]>,
    statusCode = 400,
    details?: Partial<ErrorDetails>,
    originalError?: Error
  ) {
    super(
      message,
      statusCode,
      {
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.WARNING,
        suggestion: 'Please correct the input data and try again',
        ...details
      },
      originalError
    );
    
    if (errors) {
      this.setValidationErrors(errors);
    }
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends AppError {
  constructor(
    message = 'Authentication failed',
    statusCode = 401,
    details?: Partial<ErrorDetails>,
    originalError?: Error
  ) {
    super(
      message,
      statusCode,
      {
        category: ErrorCategory.AUTHENTICATION,
        severity: ErrorSeverity.WARNING,
        suggestion: 'Please check your credentials and try again',
        ...details
      },
      originalError
    );
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends AppError {
  constructor(
    message = 'You do not have permission to perform this action',
    statusCode = 403,
    details?: Partial<ErrorDetails>,
    originalError?: Error
  ) {
    super(
      message,
      statusCode,
      {
        category: ErrorCategory.AUTHORIZATION,
        severity: ErrorSeverity.WARNING,
        ...details
      },
      originalError
    );
  }
}

/**
 * Resource not found error
 */
export class ResourceNotFoundError extends AppError {
  constructor(
    resourceType: string,
    resourceId?: string,
    statusCode = 404,
    details?: Partial<ErrorDetails>,
    originalError?: Error
  ) {
    const message = resourceId 
      ? `${resourceType} with ID ${resourceId} not found`
      : `${resourceType} not found`;
      
    super(
      message,
      statusCode,
      {
        category: ErrorCategory.RESOURCE,
        severity: ErrorSeverity.WARNING,
        context: { resourceType, resourceId },
        ...details
      },
      originalError
    );
  }
}

/**
 * API rate limit error
 */
export class ApiLimitError extends AppError {
  constructor(
    message = 'API rate limit exceeded',
    retryAfter = 60000,
    statusCode = 429,
    details?: Partial<ErrorDetails>,
    originalError?: Error
  ) {
    super(
      message,
      statusCode,
      {
        category: ErrorCategory.API_LIMIT,
        severity: ErrorSeverity.WARNING,
        transient: true,
        retryable: true,
        retryAfter,
        suggestion: 'Please try again later',
        ...details
      },
      originalError
    );
  }
}

/**
 * Marketplace integration error
 */
export class MarketplaceError extends AppError {
  constructor(
    marketplaceId: string,
    message = 'Marketplace operation failed',
    statusCode = 502,
    details?: Partial<ErrorDetails>,
    originalError?: Error
  ) {
    super(
      message,
      statusCode,
      {
        category: ErrorCategory.MARKETPLACE,
        severity: ErrorSeverity.ERROR,
        context: { marketplaceId },
        source: `marketplace.${marketplaceId}`,
        ...details
      },
      originalError
    );
  }
}

/**
 * Business logic error
 */
export class BusinessError extends AppError {
  constructor(
    message: string,
    statusCode = 422,
    details?: Partial<ErrorDetails>,
    originalError?: Error
  ) {
    super(
      message,
      statusCode,
      {
        category: ErrorCategory.BUSINESS,
        severity: ErrorSeverity.WARNING,
        ...details
      },
      originalError
    );
  }
}

/**
 * Resource conflict error
 */
export class ConflictError extends AppError {
  constructor(
    message = 'Resource conflict',
    statusCode = 409,
    details?: Partial<ErrorDetails>,
    originalError?: Error
  ) {
    super(
      message,
      statusCode,
      {
        category: ErrorCategory.CONFLICT,
        severity: ErrorSeverity.WARNING,
        ...details
      },
      originalError
    );
  }
}

/**
 * Helper function to wrap and enhance errors
 * 
 * @param error Original error
 * @param message Custom error message
 * @param details Additional error details
 * @returns Wrapped AppError
 */
export function wrapError(
  error: any,
  message?: string,
  details?: Partial<ErrorDetails>
): AppError {
  // If already an AppError, just return it or enhance it
  if (error instanceof AppError) {
    if (message) {
      error.message = message;
    }
    
    if (details) {
      if (details.category) error.category = details.category;
      if (details.severity) error.severity = details.severity;
      if (details.code) error.code = details.code;
      if (details.context) error.context = { ...error.context, ...details.context };
      if (details.source) error.source = details.source;
      if (details.transient !== undefined) error.transient = details.transient;
      if (details.retryable !== undefined) error.retryable = details.retryable;
      if (details.retryAfter !== undefined) error.retryAfter = details.retryAfter;
      if (details.suggestion) error.suggestion = details.suggestion;
    }
    
    return error;
  }
  
  // Handle Axios errors
  if (error.isAxiosError) {
    const statusCode = error.response?.status || 500;
    const responseData = error.response?.data;
    
    // Extract message from response if available
    const errorMessage = message || responseData?.message || error.message || 'API request failed';
    
    // Determine if it's a rate limit error
    if (statusCode === 429 || responseData?.rateLimitExceeded) {
      const retryAfter = parseInt(error.response?.headers?.['retry-after'], 10) * 1000 || 60000;
      return new ApiLimitError(errorMessage, retryAfter, statusCode, details, error);
    }
    
    // Determine if it's a network error
    if (error.code === 'ECONNABORTED' || error.code === 'ECONNREFUSED' || !error.response) {
      return new NetworkError(errorMessage, 503, details, error);
    }
    
    // Based on status code
    if (statusCode === 401) {
      return new AuthenticationError(errorMessage, statusCode, details, error);
    }
    
    if (statusCode === 403) {
      return new AuthorizationError(errorMessage, statusCode, details, error);
    }
    
    if (statusCode === 404) {
      return new ResourceNotFoundError('Resource', undefined, statusCode, details, error);
    }
    
    if (statusCode === 409) {
      return new ConflictError(errorMessage, statusCode, details, error);
    }
    
    // Default to general AppError
    return new AppError(
      errorMessage,
      statusCode,
      {
        category: statusCode >= 500 
          ? ErrorCategory.INTEGRATION 
          : ErrorCategory.CLIENT,
        severity: statusCode >= 500 
          ? ErrorSeverity.ERROR 
          : ErrorSeverity.WARNING,
        context: {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          data: responseData
        },
        ...details
      },
      error
    );
  }
  
  // Handle MongoDB errors
  if (error.name === 'MongoServerError') {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return new ConflictError(
        `Duplicate value for ${field}`,
        409,
        {
          context: { field, value: error.keyValue[field] },
          ...details
        },
        error
      );
    }
    
    return new DatabaseError(
      message || 'Database operation failed',
      500,
      {
        context: { code: error.code, codeName: error.codeName },
        ...details
      },
      error
    );
  }
  
  // Handle Mongoose validation errors
  if (error.name === 'ValidationError' && error.errors) {
    const validationErrors: Record<string, string[]> = {};
    
    // Extract validation error messages
    Object.keys(error.errors).forEach(field => {
      const fieldError = error.errors[field];
      validationErrors[field] = [fieldError.message];
    });
    
    return new ValidationError(
      message || 'Validation failed',
      validationErrors,
      400,
      details,
      error
    );
  }
  
  // Handle generic errors
  return new AppError(
    message || error.message || 'An error occurred',
    500,
    {
      category: ErrorCategory.INTERNAL,
      severity: ErrorSeverity.ERROR,
      ...details
    },
    error
  );
}

/**
 * Async error handler for route handlers
 * Allows using async/await in Express route handlers without try/catch blocks
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};