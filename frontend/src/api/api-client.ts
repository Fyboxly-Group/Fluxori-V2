/**
 * API Client Module
 * Generated automatically by fix-frontend-ts-errors.js
 */

import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';

// API response type
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: any;
}

// Error type
export class AppError extends Error {
  status?: number;
  details?: any;
  
  constructor(message: string, status?: number, details?: any) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.details = details;
  }
}

// Configure axios defaults
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor to attach auth token
apiClient.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
apiClient.interceptors.response.use((response: any) => response,
  (error: any) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage = error.response.data?.message || 'An error occurred';
      const status = error.response.status;
      const details = error.response.data;
      
      return Promise.reject(new AppError(errorMessage, status, details));
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject(new AppError('No response received from server', 0));
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject(new AppError(error.message || 'Request configuration error', 0));
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
      throw error instanceof AppError ? error : new AppError(error.message);
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
      throw error instanceof AppError ? error : new AppError(error.message);
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
      throw error instanceof AppError ? error : new AppError(error.message);
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
      throw error instanceof AppError ? error : new AppError(error.message);
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
      throw error instanceof AppError ? error : new AppError(error.message);
    }
  }
};

export default api;