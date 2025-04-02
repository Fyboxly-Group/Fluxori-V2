/**
 * API utilities with enhanced error handling
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { parseApiError, AppError, ErrorCategory } from './error.utils';
import { config } from '@/config';

// Default request timeout
const DEFAULT_TIMEOUT = 30000; // 30 seconds

// Default retry configuration
const DEFAULT_RETRY_CONFIG = {
  retries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  retryableNetworkErrors: ['ECONNRESET', 'ETIMEDOUT', 'ECONNABORTED', 'EHOSTUNREACH']
};

/**
 * Create an enhanced API client with better error handling
 */
export function createApiClient(
  baseURL: string = config.api.url,
  timeout: number = DEFAULT_TIMEOUT,
  retryConfig: typeof DEFAULT_RETRY_CONFIG = DEFAULT_RETRY_CONFIG
): AxiosInstance {
  // Create base axios instance
  const client = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  // Request interceptor to add auth token
  client.interceptors.request.use((config: any) => {
      // Get auth token from storage (if available)
      const token = localStorage.getItem('auth_token');
      
      // Add auth token to headers if available
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Add request ID for tracking
      config.headers['X-Request-ID'] = `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      return config;
    },
    (error: any) => {
      return Promise.reject(parseApiError(error));
    }
  );
  
  // Response interceptor with retry logic
  client.interceptors.response.use((response: any) => response,
    async (error: any) => {
      // Extract request config
      const config = error.config;
      
      // Initialize retry count if not set
      if (!config.retryCount) {
        config.retryCount = 0;
      }
      
      // Check if we should retry
      const shouldRetry = shouldRetryRequest(error, config.retryCount, retryConfig);
      
      if (shouldRetry) {
        // Increment retry count
        config.retryCount++;
        
        // Calculate delay with exponential backoff
        const delay = calculateBackoffDelay(
          config.retryCount,
          retryConfig,
          getRetryAfterFromError(error)
        );
        
        // Wait for the delay
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry the request
        return client(config);
      }
      
      // If we're not retrying, parse the error and reject
      return Promise.reject(parseApiError(error));
    }
  );
  
  return client;
}

/**
 * Determine if a request should be retried
 */
function shouldRetryRequest(
  error: AxiosError,
  retryCount: number,
  retryConfig: typeof DEFAULT_RETRY_CONFIG
): boolean {
  // Don't retry if we've reached the max retries
  if (retryCount >= retryConfig.retries) {
    return false;
  }
  
  // Don't retry certain types of errors
  if (
    error.response?.status === 401 || // Unauthorized
    error.response?.status === 403 || // Forbidden
    error.response?.status === 404 || // Not found
    error.response?.status === 422    // Validation error
  ) {
    return false;
  }
  
  // Don't retry if the method is not idempotent
  if (
    error.config?.method?.toUpperCase() === 'POST' ||
    error.config?.method?.toUpperCase() === 'PATCH'
  ) {
    // Unless it's specifically marked as retryable
    if (!error.config?.__isRetryable) {
      return false;
    }
  }
  
  // Check if the status code is in the retryable list
  if (
    error.response?.status &&
    retryConfig.retryableStatusCodes.includes(error.response.status)
  ) {
    return true;
  }
  
  // Check network errors
  if (
    !error.response &&
    error.code &&
    retryConfig.retryableNetworkErrors.includes(error.code)
  ) {
    return true;
  }
  
  // Check if backend explicitly marked as retryable
  if (error.response?.data?.retryable === true) {
    return true;
  }
  
  return false;
}

/**
 * Calculate backoff delay for retries
 */
function calculateBackoffDelay(
  retryCount: number,
  retryConfig: typeof DEFAULT_RETRY_CONFIG,
  retryAfterMs?: number
): number {
  // If server specifies a retry-after, use that
  if (retryAfterMs) {
    return retryAfterMs;
  }
  
  // Otherwise calculate exponential backoff
  const exponentialDelay = retryConfig.initialDelayMs * Math.pow(2, retryCount - 1);
  
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 1000;
  
  // Cap at max delay
  return Math.min(exponentialDelay + jitter, retryConfig.maxDelayMs);
}

/**
 * Extract retry-after header from error response
 */
function getRetryAfterFromError(error: AxiosError): number | undefined {
  // Check for retry-after header
  const retryAfterHeader = error.response?.headers?.['retry-after'];
  
  if (retryAfterHeader) {
    // Retry-after can be seconds or a date
    if (/^\d+$/.test(retryAfterHeader)) {
      return parseInt(retryAfterHeader, 10) * 1000; // Convert to milliseconds
    } else {
      // Handle date format
      const retryDate = new Date(retryAfterHeader);
      if (!isNaN(retryDate.getTime())) {
        return retryDate.getTime() - Date.now(); // Time difference
      }
    }
  }
  
  // Check if backend specified a retry delay
  if (error.response?.data?.retryAfter) {
    return error.response.data.retryAfter;
  }
  
  return undefined;
}

// Create and export the default API client
export const apiClient = createApiClient();

/**
 * Make an API request with better error handling and retry logic
 * 
 * @param config Request configuration
 * @param options Additional options
 * @returns Promise with response data
 */
export async function apiRequest<T>(
  config: AxiosRequestConfig,
  options?: {
    retryable?: boolean;
    retries?: number;
    onRetry?: (retryCount: number, error: AppError) => void;
  }
): Promise<T> {
  try {
    // Mark POST/PATCH as retryable if specified
    if (
      options?.retryable && 
      (config.method?.toUpperCase() === 'POST' || 
       config.method?.toUpperCase() === 'PATCH')
    ) {
      config.__isRetryable = true;
    }
    
    // Set custom retry count if specified
    if (options?.retries !== undefined) {
      config.retries = options.retries;
    }
    
    // Add retry callback handler
    const originalAdapter = apiClient.defaults.adapter;
    if (options?.onRetry && originalAdapter) {
      config.adapter = async (config: any) => {
        try {
          // @ts-ignore
          return await originalAdapter(config);
        } catch (error) {
          const retryCount = config.retryCount || 0;
          if (retryCount > 0) {
            options.onRetry?.(retryCount, parseApiError(error));
          }
          throw error;
        }
      };
    }
    
    // Make the request
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    // All axios errors are already transformed to AppError by the interceptor
    throw error;
  }
}

/**
 * API hooks for common operations with consistent error handling
 */
export const API = {
  /**
   * GET request
   */
  get: <T>(url: string, config?: AxiosRequestConfig, options?: any): Promise<T> => {
    return apiRequest<T>(
      {
        ...config,
        method: 'GET',
        url
      },
      options
    );
  },
  
  /**
   * POST request
   */
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig, options?: any): Promise<T> => {
    return apiRequest<T>(
      {
        ...config,
        method: 'POST',
        url,
        data
      },
      options
    );
  },
  
  /**
   * PUT request
   */
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig, options?: any): Promise<T> => {
    return apiRequest<T>(
      {
        ...config,
        method: 'PUT',
        url,
        data
      },
      options
    );
  },
  
  /**
   * PATCH request
   */
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig, options?: any): Promise<T> => {
    return apiRequest<T>(
      {
        ...config,
        method: 'PATCH',
        url,
        data
      },
      options
    );
  },
  
  /**
   * DELETE request
   */
  delete: <T>(url: string, config?: AxiosRequestConfig, options?: any): Promise<T> => {
    return apiRequest<T>(
      {
        ...config,
        method: 'DELETE',
        url
      },
      options
    );
  }
};