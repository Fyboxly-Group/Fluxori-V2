/**
 * Error handling utilities for frontend
 */
import { AxiosError } from 'axios';

/**
 * Error categories mapping to backend categories
 */
export enum ErrorCategory {
  // Technical errors
  NETWORK = 'network',                 // Network connectivity issues
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
  
  // UI errors
  UI = 'ui',                           // UI-specific errors
  UNEXPECTED = 'unexpected',           // Unexpected/unclassified errors
}

/**
 * Standardized error interface for frontend
 */
export interface AppError {
  // Unique error identifier
  id?: string;
  // HTTP status code if from API
  statusCode?: number;
  // Error message for display
  message: string;
  // Technical error message
  technicalMessage?: string;
  // Error code for lookup
  code?: string;
  // Error category
  category: ErrorCategory;
  // Field-level validation errors
  validationErrors?: Record<string, string[]>;
  // Original error that caused this
  originalError?: any;
  // Whether the error is retryable
  retryable?: boolean;
  // Suggested retry delay in ms
  retryAfter?: number;
  // User-friendly suggestion for fixing
  suggestion?: string;
  // Whether error comes from backend
  fromBackend?: boolean;
  // Request path if from API
  path?: string;
  // Reference tracking ID for support
  trackingId?: string;
  // Timestamp when error occurred
  timestamp: Date;
}

/**
 * Parse API error response into standardized format
 * 
 * @param error Error from API call
 * @returns Standardized AppError
 */
export function parseApiError(error: any): AppError {
  // Default values
  const appError: AppError = {
    message: 'An unexpected error occurred',
    category: ErrorCategory.UNEXPECTED,
    timestamp: new Date(),
    originalError: error,
  };
  
  // Handle Axios errors
  if (error?.isAxiosError) {
    const axiosError = error as AxiosError<any>;
    
    // Set basic properties
    appError.statusCode = axiosError.response?.status;
    appError.path = axiosError.config?.url;
    appError.fromBackend = true;
    
    // Network errors
    if (!axiosError.response) {
      appError.message = 'Network error: Unable to connect to the server';
      appError.category = ErrorCategory.NETWORK;
      appError.suggestion = 'Please check your internet connection and try again';
      appError.retryable = true;
      return appError;
    }
    
    // Get response data
    const responseData = axiosError.response.data;
    
    // Extract standardized error fields if available
    if (responseData) {
      if (responseData.message) {
        appError.message = responseData.message;
      }
      
      if (responseData.code) {
        appError.code = responseData.code;
      }
      
      if (responseData.category) {
        appError.category = mapBackendCategory(responseData.category);
      } else {
        // Map based on status code
        appError.category = mapHttpStatusToCategory(axiosError.response.status);
      }
      
      if (responseData.errors) {
        appError.validationErrors = responseData.errors;
      }
      
      if (responseData.suggestion) {
        appError.suggestion = responseData.suggestion;
      }
      
      if (responseData.retryable) {
        appError.retryable = responseData.retryable;
      }
      
      if (responseData.retryAfter) {
        appError.retryAfter = responseData.retryAfter;
      }
      
      if (responseData.trackingId) {
        appError.trackingId = responseData.trackingId;
      }
    } else {
      // Fallback for non-standardized responses
      appError.category = mapHttpStatusToCategory(axiosError.response.status);
      appError.message = axiosError.response.statusText || 'Server error';
    }
  } else if (error instanceof Error) {
    // Handle regular JS errors
    appError.message = error.message;
    appError.technicalMessage = error.stack;
    appError.category = ErrorCategory.CLIENT;
  }
  
  return appError;
}

/**
 * Map backend category to frontend category
 */
function mapBackendCategory(backendCategory: string): ErrorCategory {
  // Most categories map directly
  if (Object.values(ErrorCategory).includes(backendCategory as ErrorCategory)) {
    return backendCategory as ErrorCategory;
  }
  
  // Map database errors to internal
  if (backendCategory === 'database') {
    return ErrorCategory.INTERNAL;
  }
  
  return ErrorCategory.UNEXPECTED;
}

/**
 * Map HTTP status code to error category
 */
function mapHttpStatusToCategory(status: number): ErrorCategory {
  if (status === 401) {
    return ErrorCategory.AUTHENTICATION;
  }
  
  if (status === 403) {
    return ErrorCategory.AUTHORIZATION;
  }
  
  if (status === 404) {
    return ErrorCategory.RESOURCE;
  }
  
  if (status === 409) {
    return ErrorCategory.CONFLICT;
  }
  
  if (status === 422) {
    return ErrorCategory.BUSINESS;
  }
  
  if (status === 429) {
    return ErrorCategory.API_LIMIT;
  }
  
  if (status >= 400 && status < 500) {
    return ErrorCategory.CLIENT;
  }
  
  return ErrorCategory.INTERNAL;
}

/**
 * Get user-friendly message based on error category
 */
export function getFriendlyErrorMessage(error: AppError): string {
  // If the error already has a user-friendly message, use it
  if (error.message && error.message !== 'Internal Server Error') {
    return error.message;
  }
  
  // Otherwise generate based on category
  switch (error.category) {
    case ErrorCategory.NETWORK:
      return 'Unable to connect to the server. Please check your internet connection.';
    
    case ErrorCategory.AUTHENTICATION:
      return 'Your session has expired or you are not logged in. Please sign in again.';
    
    case ErrorCategory.AUTHORIZATION:
      return 'You don\'t have permission to perform this action.';
    
    case ErrorCategory.RESOURCE:
      return 'The requested resource could not be found.';
    
    case ErrorCategory.VALIDATION:
      return 'Please check the form for errors and try again.';
    
    case ErrorCategory.API_LIMIT:
      return 'Too many requests. Please try again later.';
    
    case ErrorCategory.MARKETPLACE:
      return 'There was an issue with the marketplace integration.';
    
    case ErrorCategory.CONFLICT:
      return 'A conflict occurred with existing data.';
    
    case ErrorCategory.INTERNAL:
      return 'An internal server error occurred. Our team has been notified.';
    
    default:
      return 'An unexpected error occurred. Please try again or contact support if the issue persists.';
  }
}

/**
 * Get action suggestion based on error
 */
export function getErrorSuggestion(error: AppError): string {
  // If the error already has a suggestion, use it
  if (error.suggestion) {
    return error.suggestion;
  }
  
  // Otherwise generate based on category
  switch (error.category) {
    case ErrorCategory.NETWORK:
      return 'Check your internet connection and try again.';
    
    case ErrorCategory.AUTHENTICATION:
      return 'Please sign in again to continue.';
    
    case ErrorCategory.AUTHORIZATION:
      return 'Contact your administrator if you need access to this feature.';
    
    case ErrorCategory.RESOURCE:
      return 'Check that the ID is correct or try navigating back to the previous page.';
    
    case ErrorCategory.VALIDATION:
      return 'Review the highlighted fields and correct any errors.';
    
    case ErrorCategory.API_LIMIT:
      return 'Please wait a few minutes before trying again.';
    
    case ErrorCategory.MARKETPLACE:
      return 'Check your marketplace connection settings and try again.';
    
    case ErrorCategory.CONFLICT:
      return 'Please review your data and try again with unique values.';
    
    case ErrorCategory.INTERNAL:
      if (error.trackingId) {
        return `Please contact support with reference ID: ${error.trackingId}`;
      }
      return 'Please try again or contact support if the issue persists.';
    
    default:
      return 'Try refreshing the page or contact support if the issue continues.';
  }
}

/**
 * Determine if error should be reported to monitoring
 */
export function shouldReportError(error: AppError): boolean {
  // Always report internal server errors
  if (error.category === ErrorCategory.INTERNAL) {
    return true;
  }
  
  // Always report unexpected errors
  if (error.category === ErrorCategory.UNEXPECTED) {
    return true;
  }
  
  // Don't report validation, authorization, or resource not found
  if (
    error.category === ErrorCategory.VALIDATION ||
    error.category === ErrorCategory.AUTHORIZATION ||
    error.category === ErrorCategory.RESOURCE
  ) {
    return false;
  }
  
  // Don't report 4xx client errors
  if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
    return false;
  }
  
  // Report all other errors
  return true;
}

/**
 * Create a custom application error
 */
export function createAppError(
  message: string,
  category: ErrorCategory = ErrorCategory.CLIENT,
  details?: Partial<AppError>
): AppError {
  return {
    message,
    category,
    timestamp: new Date(),
    ...details
  };
}