import axios, { AxiosInstance } from 'axios';
import { IMarketplaceAdapter } from '../interfaces/marketplace-adapter.interface';
import { MarketplaceCredentials } from '../../models/marketplace.models';
import { AmazonAdapter } from './amazon-adapter';

/**
 * Amazon API specific configuration options
 */
export interface AmazonApiConfig {
  region: string;
  refreshToken: string;
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  tokenExpiry?: Date;
  roleArn?: string;
  sellerId?: string;
  marketplaceIds?: string[];
  appId?: string;
  endpoint?: string;
  sandbox?: boolean;
}

/**
 * Supported Amazon regions
 */
export enum AmazonRegion {
  NA = 'na', // North America
  EU = 'eu', // Europe
  FE = 'fe', // Far East
  AU = 'au', // Australia
}

/**
 * Endpoint URLs for different Amazon regions
 */
export const AMAZON_ENDPOINTS = {
  [AmazonRegion.NA]: 'https://sellingpartnerapi-na.amazon.com',
  [AmazonRegion.EU]: 'https://sellingpartnerapi-eu.amazon.com',
  [AmazonRegion.FE]: 'https://sellingpartnerapi-fe.amazon.com',
  [AmazonRegion.AU]: 'https://sellingpartnerapi-au.amazon.com',
};

/**
 * Auth endpoint for Amazon Selling Partner API
 */
export const AMAZON_AUTH_ENDPOINT = 'https://api.amazon.com/auth/o2/token';

/**
 * Factory for creating Amazon marketplace adapters
 */
export class AmazonFactory {
  /**
   * Create an Amazon adapter instance for a given connection
   * @param connectionId - Unique identifier for this connection
   * @param credentials - Amazon marketplace credentials
   * @returns An initialized AmazonAdapter instance
   */
  static createAdapter(connectionId: string, credentials: MarketplaceCredentials): IMarketplaceAdapter {
    try {
      // Create HTTP client for the adapter to use
      const httpClient = this.createHttpClient(credentials);
      
      // Create and return a new adapter instance
      return new AmazonAdapter(connectionId, credentials, httpClient);
    } catch (error) {
      console.error('Error creating Amazon adapter:', error);
      throw new Error(`Failed to create Amazon adapter: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create and configure an Axios HTTP client with interceptors for token refresh and error handling
   * @param credentials - Amazon marketplace credentials
   * @returns Configured Axios instance
   */
  private static createHttpClient(credentials: MarketplaceCredentials): AxiosInstance {
    // Determine the base URL from region
    const region = (credentials.region as string) || AmazonRegion.NA;
    const baseURL = AMAZON_ENDPOINTS[region as AmazonRegion] || AMAZON_ENDPOINTS[AmazonRegion.NA];
    
    // Create the HTTP client with default config
    const client = axios.create({
      baseURL,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'FluxoriSellingPartnerClient/1.0',
      },
    });
    
    // Add request interceptor for authentication
    client.interceptors.request.use(async (config) => {
      // Add auth token to requests
      if (credentials.accessToken) {
        config.headers.Authorization = `Bearer ${credentials.accessToken}`;
      }
      
      return config;
    });
    
    // Add response interceptor for error handling
    client.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Handle rate limiting and auth errors
        if (error.response) {
          // Check for unauthorized errors (401)
          if (error.response.status === 401) {
            console.error('Amazon API authentication error:', error.response.data);
          }
          
          // Check for rate limit errors (429)
          if (error.response.status === 429) {
            console.error('Amazon API rate limit exceeded:', error.response.data);
            
            // Extract rate limit info from headers if available
            const resetTime = error.response.headers['x-amzn-ratelimit-reset'] 
              ? parseInt(error.response.headers['x-amzn-ratelimit-reset'], 10) * 1000 
              : 60000; // Default to 1 minute if not provided
              
            // Could implement automatic retry after reset time here
          }
        }
        
        // Rethrow the error to be handled by the adapter
        return Promise.reject(error);
      }
    );
    
    return client;
  }
  
  /**
   * Refresh the access token using the refresh token
   * @param refreshToken - Amazon refresh token
   * @param clientId - App client ID
   * @param clientSecret - App client secret
   * @returns New access token and expiry
   */
  static async refreshAccessToken(
    refreshToken: string, 
    clientId: string, 
    clientSecret: string
  ): Promise<{ accessToken: string; expiresAt: Date }> {
    try {
      const response = await axios.post(
        AMAZON_AUTH_ENDPOINT,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      const { access_token, expires_in } = response.data;
      
      // Calculate the expiry date
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);
      
      return {
        accessToken: access_token,
        expiresAt,
      };
    } catch (error) {
      console.error('Error refreshing Amazon access token:', error);
      throw new Error(`Failed to refresh Amazon access token: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Get available marketplace IDs for a specific region
   * @param region - Amazon region
   * @returns Array of marketplace IDs
   */
  static getMarketplaceIds(region: AmazonRegion): string[] {
    const marketplacesByRegion: Record<AmazonRegion, string[]> = {
      [AmazonRegion.NA]: [
        'ATVPDKIKX0DER',   // US
        'A2EUQ1WTGCTBG2',  // CA
        'A1AM78C64UM0Y8',  // MX
        'A2Q3Y263D00KWC',  // BR
      ],
      [AmazonRegion.EU]: [
        'A1PA6795UKMFR9',  // DE
        'A1RKKUPIHCS9HS',  // ES
        'A13V1IB3VIYZZH',  // FR
        'A1F83G8C2ARO7P',  // UK
        'APJ6JRA9NG5V4',   // IT
        'A1805IZSGTT6HS',  // NL
        'A2NODRKZP88ZB9',  // SE
        'A33AVAJ2PDY3EV',  // TR
        'A38D8NSA03LJTC',  // PL
        'ARBP9OOSHTCHU',   // EG
        'A17E79C6D8DWNP',  // SA
        'A1C3SOZRARQ6R3',  // BE
      ],
      [AmazonRegion.FE]: [
        'A19VAU5U5O7RUS',  // SG
        'A39IBJ37TRP1C6',  // AU
        'A1VC38T7YXB528',  // JP
        'A1805IZSGTT6HS',  // NL
      ],
      [AmazonRegion.AU]: [
        'A39IBJ37TRP1C6',  // AU
      ],
    };
    
    return marketplacesByRegion[region] || [];
  }
}

export default AmazonFactory;