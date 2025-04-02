import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * API response type
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: any;
}

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  status?: number;
  details?: any;
  category?: ErrorCategory;
  retryAfter?: number;
  
  constructor(message: string, status?: number, details?: any, category?: ErrorCategory) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.details = details;
    this.category = category;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Error categories for better error handling
 */
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  MARKETPLACE = 'marketplace',
  API_LIMIT = 'api_limit',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}

/**
 * Determine error category based on error details
 */
const getErrorCategory = (error: AxiosError): ErrorCategory => {
  if (!error.response) {
    return ErrorCategory.NETWORK;
  }

  const status = error.response.status;
  const data = error.response.data as any;

  if (status === 401) {
    return ErrorCategory.AUTHENTICATION;
  }
  
  if (status === 403) {
    return ErrorCategory.AUTHORIZATION;
  }
  
  if (status === 422 || status === 400) {
    return ErrorCategory.VALIDATION;
  }
  
  if (status === 429) {
    return ErrorCategory.API_LIMIT;
  }
  
  if (status >= 500) {
    return ErrorCategory.SERVER;
  }
  
  // Check for marketplace-specific errors
  if (data?.error?.marketplace) {
    return ErrorCategory.MARKETPLACE;
  }
  
  return ErrorCategory.UNKNOWN;
};

// Configure axios defaults
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor to attach auth token
apiClient.interceptors.request.use((config) => {
  // Get token from local storage or other storage mechanism
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized error (token expired)
    if (error.response?.status === 401 && 
        originalRequest && 
        !(originalRequest as any)._retry &&
        originalRequest.url !== '/auth/login') {
      
      (originalRequest as any)._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, { 
            refreshToken 
          });
          
          if (response.data?.accessToken) {
            // Save the new tokens
            localStorage.setItem('accessToken', response.data.accessToken);
            if (response.data.refreshToken) {
              localStorage.setItem('refreshToken', response.data.refreshToken);
            }
            
            // Update header and retry
            originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // If token refresh fails, redirect to login
        console.error('Token refresh failed', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Only redirect to login if we're in a browser environment
        if (typeof window !== 'undefined') {
          window.location.href = '/login?session_expired=true';
        }
      }
    }
    
    // Handle other errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const data = error.response.data as any;
      const errorMessage = data?.message || 'An error occurred';
      const status = error.response.status;
      const details = data;
      const category = getErrorCategory(error);
      
      // Handle rate limiting
      let retryAfter: number | undefined = undefined;
      if (category === ErrorCategory.API_LIMIT) {
        const retryAfterHeader = error.response.headers['retry-after'];
        if (retryAfterHeader) {
          retryAfter = parseInt(retryAfterHeader, 10) * 1000; // Convert to ms
        }
      }
      
      const appError = new AppError(errorMessage, status, details, category);
      if (retryAfter) {
        appError.retryAfter = retryAfter;
      }
      
      return Promise.reject(appError);
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject(new AppError('No response received from server', 0, undefined, ErrorCategory.NETWORK));
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject(new AppError(error.message || 'Request configuration error', 0, undefined, ErrorCategory.UNKNOWN));
    }
  }
);

// API methods
export const api = {
  /**
   * GET request
   */
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await apiClient.get(url, config);
      return response.data;
    } catch (error) {
      throw error instanceof AppError ? error : new AppError((error as Error).message);
    }
  },

  /**
   * POST request
   */
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await apiClient.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error instanceof AppError ? error : new AppError((error as Error).message);
    }
  },

  /**
   * PUT request
   */
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await apiClient.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error instanceof AppError ? error : new AppError((error as Error).message);
    }
  },

  /**
   * PATCH request
   */
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await apiClient.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error instanceof AppError ? error : new AppError((error as Error).message);
    }
  },

  /**
   * DELETE request
   */
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await apiClient.delete(url, config);
      return response.data;
    } catch (error) {
      throw error instanceof AppError ? error : new AppError((error as Error).message);
    }
  }
};

export default api;