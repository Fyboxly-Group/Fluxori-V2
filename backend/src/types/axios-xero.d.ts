// Type definitions to satisfy xero-node requirements
declare module 'axios' {
  export interface AxiosRequestConfig {
    headers?: any;
    params?: any;
    data?: any;
    method?: string;
    url?: string;
    baseURL?: string;
    responseType?: string;
    withCredentials?: boolean;
  }
  
  export interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: AxiosRequestConfig;
    request?: any;
  }
}

// Type definitions to help with xero-node XeroClient
declare module 'xero-node' {
  export interface XeroClient {
    buildConsentUrl(state: string): string;
  }
}
