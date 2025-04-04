/**
 * Error types for the application
 * These provide a consistent error handling approach with proper typing
 */

/**
 * Error codes for application-specific errors
 */
export enum ErrorCode {
  // Authentication and authorization errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  
  // Data validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_ID = 'INVALID_ID',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  
  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  QUERY_ERROR = 'QUERY_ERROR',
  
  // External service errors
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  API_ERROR = 'API_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // Business logic errors
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // File operations errors
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
  FILE_DELETE_ERROR = 'FILE_DELETE_ERROR',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE'
}

/**
 * HTTP status codes mapped to common error scenarios
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Base application error class
 */
export class ApplicationError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: HttpStatus;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  /**
   * Creates a new application error
   * @param message - Error message
   * @param code - Error code
   * @param statusCode - HTTP status code
   * @param details - Additional error details
   * @param isOperational - Whether the error is operational (vs programmer error)
   */
  constructor(
    message: string, 
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: unknown,
    isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * NotFound error for resource not found scenarios
 */
export class NotFoundError extends ApplicationError {
  constructor(message: string = 'Resource not found', details?: unknown) {
    super(message, ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, details, true);
  }
}

/**
 * Unauthorized error for authentication failures
 */
export class UnauthorizedError extends ApplicationError {
  constructor(message: string = 'Unauthorized access', details?: unknown) {
    super(message, ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, details, true);
  }
}

/**
 * Forbidden error for authorization failures
 */
export class ForbiddenError extends ApplicationError {
  constructor(message: string = 'Forbidden access', details?: unknown) {
    super(message, ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, details, true);
  }
}

/**
 * Validation error for input validation failures
 */
export class ValidationError extends ApplicationError {
  constructor(message: string = 'Validation error', details?: unknown) {
    super(
      message, 
      ErrorCode.VALIDATION_ERROR, 
      HttpStatus.UNPROCESSABLE_ENTITY, 
      details, 
      true
    );
  }
}

/**
 * Conflict error for resource conflicts
 */
export class ConflictError extends ApplicationError {
  constructor(message: string = 'Resource conflict', details?: unknown) {
    super(message, ErrorCode.CONFLICT, HttpStatus.CONFLICT, details, true);
  }
}

/**
 * Database error for database operation failures
 */
export class DatabaseError extends ApplicationError {
  constructor(message: string = 'Database error', details?: unknown) {
    super(
      message, 
      ErrorCode.DATABASE_ERROR, 
      HttpStatus.INTERNAL_SERVER_ERROR, 
      details, 
      true
    );
  }
}

/**
 * External service error for external API failures
 */
export class ExternalServiceError extends ApplicationError {
  constructor(message: string = 'External service error', details?: unknown) {
    super(
      message, 
      ErrorCode.EXTERNAL_SERVICE_ERROR, 
      HttpStatus.SERVICE_UNAVAILABLE, 
      details, 
      true
    );
  }
}

/**
 * Business error for business rule violations
 */
export class BusinessError extends ApplicationError {
  constructor(message: string = 'Business rule violation', details?: unknown) {
    super(
      message, 
      ErrorCode.BUSINESS_RULE_VIOLATION, 
      HttpStatus.BAD_REQUEST, 
      details, 
      true
    );
  }
}