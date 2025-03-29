// API client with Axios or Fetch

import { config } from '@/config'

// Function to get base API URL based on environment
const getApiBaseUrl = (): string => {
  return config.api.url
}

// Function to get stored authentication token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  
  return localStorage.getItem('auth_token')
}

// Define the default request headers
const getDefaultHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  // Add auth token if available
  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

// Generic fetch wrapper with error handling and authentication
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const url = `${getApiBaseUrl()}${endpoint}`
    const defaultOptions: RequestInit = {
      headers: getDefaultHeaders(),
    }
    
    // Merge default options with provided options
    const fetchOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options?.headers || {}),
      },
    }

    const response = await fetch(url, fetchOptions)

    // Handle unsuccessful responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMsg = errorData.message || response.statusText
      throw new Error(errorMsg)
    }

    // Handle empty responses
    if (response.status === 204) {
      return {} as T
    }

    // Parse JSON response
    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// API client object with convenience methods for different HTTP methods
export const apiClient = {
  /**
   * Perform a GET request to the API
   */
  get: <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    return fetchApi<T>(endpoint, { ...options, method: 'GET' })
  },

  /**
   * Perform a POST request to the API
   */
  post: <T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> => {
    return fetchApi<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  /**
   * Perform a PUT request to the API
   */
  put: <T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> => {
    return fetchApi<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  /**
   * Perform a PATCH request to the API
   */
  patch: <T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> => {
    return fetchApi<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  /**
   * Perform a DELETE request to the API
   */
  delete: <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    return fetchApi<T>(endpoint, { ...options, method: 'DELETE' })
  },
}