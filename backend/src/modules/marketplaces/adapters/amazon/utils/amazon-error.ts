/**
 * Amazon API error utility classes
 */

import { MarketplaceError } from '../../../models/marketplace.models';
import { AmazonSPApi } from '../schemas/amazon.generated';

/**
 * Error codes specific to Amazon SP-API
 */
export enum AmazonErrorCode {
  // Authentication errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  
  // Rate limiting errors
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  THROTTLED = 'THROTTLED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  
  // Resource errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  ASIN_NOT_FOUND = 'ASIN_NOT_FOUND',
  SKU_NOT_FOUND = 'SKU_NOT_FOUND',
  
  // Validation errors
  INVALID_REQUEST = 'INVALID_REQUEST',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // System errors
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR',
  NOT_INITIALIZED = 'NOT_INITIALIZED',
  OPERATION_TIMEOUT = 'OPERATION_TIMEOUT',
  OPERATION_FAILED = 'OPERATION_FAILED',
  
  // Generic error
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Amazon error utility class
 * Handles error mapping from Amazon SP-API responses to standardized marketplace errors
 */
export class AmazonErrorUtil {
  /**
   * Maps an Amazon SP-API error to a standardized marketplace error
   * @param amazonError The Amazon API error object
   * @param context Additional context about the operation where the error occurred
   * @returns Standardized marketplace error
   */
  static mapApiError(
    amazonError: AmazonSPApi.Common.Error,
    context: string = 'Amazon SP-API operation'
  ): MarketplaceError {
    const timestamp = new Date();
    
    // Map Amazon error codes to our standardized error codes
    let errorCode = AmazonErrorCode.UNKNOWN_ERROR;
    
    // Amazon's error codes are inconsistent, so we need to check the error message as well
    const errorCodeLower = amazonError.code?.toLowerCase() || '';
    const errorMessageLower = amazonError.message?.toLowerCase() || '';
    
    // Determine the appropriate error code
    if (
      errorCodeLower.includes('throttl') || 
      errorMessageLower.includes('throttl') ||
      errorCodeLower.includes('rateli') || 
      errorMessageLower.includes('rate limit') ||
      errorCodeLower === '429'
    ) {
      errorCode = AmazonErrorCode.RATE_LIMIT_EXCEEDED;
    }
    else if (
      errorCodeLower.includes('quota') || 
      errorMessageLower.includes('quota')
    ) {
      errorCode = AmazonErrorCode.QUOTA_EXCEEDED;
    }
    else if (
      errorCodeLower.includes('auth') ||
      errorCodeLower.includes('token') ||
      errorCodeLower === '401'
    ) {
      errorCode = AmazonErrorCode.UNAUTHORIZED;
    }
    else if (
      errorCodeLower.includes('not_found') ||
      errorMessageLower.includes('not found') ||
      errorCodeLower === '404'
    ) {
      // Check for specific resource types in the error message
      if (errorMessageLower.includes('asin')) {
        errorCode = AmazonErrorCode.ASIN_NOT_FOUND;
      }
      else if (errorMessageLower.includes('order')) {
        errorCode = AmazonErrorCode.ORDER_NOT_FOUND;
      }
      else if (errorMessageLower.includes('sku')) {
        errorCode = AmazonErrorCode.SKU_NOT_FOUND;
      }
      else if (errorMessageLower.includes('product')) {
        errorCode = AmazonErrorCode.PRODUCT_NOT_FOUND;
      }
      else {
        errorCode = AmazonErrorCode.RESOURCE_NOT_FOUND;
      }
    }
    else if (
      errorCodeLower.includes('invalid') ||
      errorMessageLower.includes('invalid') ||
      errorCodeLower === '400'
    ) {
      errorCode = AmazonErrorCode.INVALID_INPUT;
    }
    else if (
      errorCodeLower.includes('service') ||
      errorMessageLower.includes('service') ||
      errorCodeLower === '503'
    ) {
      errorCode = AmazonErrorCode.SERVICE_UNAVAILABLE;
    }
    else if (
      errorCodeLower.includes('internal') ||
      errorMessageLower.includes('internal') ||
      errorCodeLower === '500'
    ) {
      errorCode = AmazonErrorCode.INTERNAL_ERROR;
    }
    
    return {
      code: errorCode,
      message: amazonError.message || 'Unknown Amazon API error',
      details: {
        amazonErrorCode: amazonError.code,
        amazonErrorDetails: amazonError.details,
        context
      },
      timestamp
    };
  }
  
  /**
   * Maps an HTTP error response to a standardized marketplace error
   * @param httpError The HTTP error (typically an Axios error)
   * @param context Additional context about the operation where the error occurred
   * @returns Standardized marketplace error
   */
  static mapHttpError(httpError: any, context: string = 'Amazon SP-API HTTP error'): MarketplaceError {
    const timestamp = new Date();
    let errorCode = AmazonErrorCode.UNKNOWN_ERROR;
    let message = httpError.message || 'Unknown HTTP error';
    
    // Try to extract Amazon's error details if they exist
    if (httpError.response?.data?.errors && Array.isArray(httpError.response.data.errors)) {
      const amazonError = httpError.response.data.errors[0];
      return this.mapApiError(amazonError, context);
    }
    
    // Otherwise, map based on HTTP status code
    const statusCode = httpError.response?.status;
    if (statusCode) {
      switch (statusCode) {
        case 400:
          errorCode = AmazonErrorCode.INVALID_REQUEST;
          message = httpError.response?.data?.message || 'Invalid request';
          break;
        case 401:
          errorCode = AmazonErrorCode.UNAUTHORIZED;
          message = 'Authentication failed or token expired';
          break;
        case 403:
          errorCode = AmazonErrorCode.UNAUTHORIZED;
          message = 'Not authorized to perform this operation';
          break;
        case 404:
          errorCode = AmazonErrorCode.RESOURCE_NOT_FOUND;
          message = 'Resource not found';
          break;
        case 429:
          errorCode = AmazonErrorCode.RATE_LIMIT_EXCEEDED;
          message = 'Rate limit exceeded';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorCode = AmazonErrorCode.SERVICE_UNAVAILABLE;
          message = `Amazon service unavailable (${statusCode})`;
          break;
        default:
          errorCode = AmazonErrorCode.UNKNOWN_ERROR;
          message = `HTTP error ${statusCode}`;
          break;
      }
    }
    
    return {
      code: errorCode,
      message,
      details: {
        httpStatus: statusCode,
        responseData: httpError.response?.data,
        context
      },
      timestamp
    };
  }
  
  /**
   * Creates a generic error for Amazon-specific error cases
   * @param message Error message
   * @param code Error code
   * @param details Additional error details
   * @returns Standardized marketplace error
   */
  static createError(
    message: string,
    code: AmazonErrorCode = AmazonErrorCode.UNKNOWN_ERROR,
    details?: any
  ): MarketplaceError {
    return {
      code,
      message,
      details,
      timestamp: new Date()
    };
  }
}