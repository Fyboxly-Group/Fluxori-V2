import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Configuration options for the adapter
 */
interface AdapterConfig {
  apiKey: string;
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * Generic response type for adapter methods
 */
interface AdapterResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

/**
 * Template for a third-party API adapter with TypeScript typing
 */
export class ExternalApiAdapter {
  private readonly client: AxiosInstance;
  private readonly config: AdapterConfig;

  /**
   * Constructor for the adapter
   * @param config Configuration options for the adapter
   */
  constructor(config: AdapterConfig) {
    this.config = config;
    
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey,
        ...config.headers
      }
    });
    
    // Add request interceptor for logging or modifying requests
    this.client.interceptors.request.use(
      (config) => {
        // You can modify the request config here
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for handling common responses
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // Handle common error scenarios
        return Promise.reject(error);
      }
    );
  }

  /**
   * Make a GET request to the external API
   * @param endpoint API endpoint
   * @param params Query parameters
   * @param options Additional Axios request options
   */
  public async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    options?: AxiosRequestConfig
  ): Promise<AdapterResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.get(endpoint, {
        params,
        ...options
      });
      
      return {
        success: true,
        data: response.data,
        statusCode: response.status
      };
    } catch (error: any) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Make a POST request to the external API
   * @param endpoint API endpoint
   * @param data Request body data
   * @param options Additional Axios request options
   */
  public async post<T>(
    endpoint: string,
    data?: any,
    options?: AxiosRequestConfig
  ): Promise<AdapterResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.post(endpoint, data, options);
      
      return {
        success: true,
        data: response.data,
        statusCode: response.status
      };
    } catch (error: any) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Make a PUT request to the external API
   * @param endpoint API endpoint
   * @param data Request body data
   * @param options Additional Axios request options
   */
  public async put<T>(
    endpoint: string,
    data?: any,
    options?: AxiosRequestConfig
  ): Promise<AdapterResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.put(endpoint, data, options);
      
      return {
        success: true,
        data: response.data,
        statusCode: response.status
      };
    } catch (error: any) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Make a DELETE request to the external API
   * @param endpoint API endpoint
   * @param options Additional Axios request options
   */
  public async delete<T>(
    endpoint: string,
    options?: AxiosRequestConfig
  ): Promise<AdapterResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.delete(endpoint, options);
      
      return {
        success: true,
        data: response.data,
        statusCode: response.status
      };
    } catch (error: any) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Handle errors from the external API
   * @param error Error object from Axios
   */
  private handleError<T>(error: any): AdapterResponse<T> {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return {
        success: false,
        error: error.response.data?.message || 'API error',
        statusCode: error.response.status
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        success: false,
        error: 'No response received from the API',
        statusCode: 0
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      return {
        success: false,
        error: error.message || 'Unknown error',
        statusCode: 0
      };
    }
  }
}