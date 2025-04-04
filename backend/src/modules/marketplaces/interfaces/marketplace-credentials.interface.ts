/**
 * Marketplace Credentials Interface
 * Defines the structure for marketplace authentication credentials
 */

/**
 * Base marketplace credentials interface
 */
export interface MarketplaceCredentials {
  /**
   * API key for the marketplace
   */
  apiKey?: string;
  
  /**
   * API secret for the marketplace
   */
  apiSecret?: string;
  
  /**
   * OAuth access token
   */
  accessToken?: string;
  
  /**
   * OAuth refresh token
   */
  refreshToken?: string;
  
  /**
   * OAuth token expiry timestamp
   */
  tokenExpiry?: Date;
  
  /**
   * Seller ID in the marketplace
   */
  sellerId?: string;
  
  /**
   * Marketplace store ID
   */
  storeId?: string;
  
  /**
   * Marketplace specific settings
   */
  settings?: Record<string, any>;
  
  /**
   * Allow any other marketplace-specific credentials
   */
  [key: string]: any;
}

/**
 * Amazon marketplace credentials
 */
export interface AmazonCredentials extends MarketplaceCredentials {
  /**
   * Amazon seller ID
   */
  sellerId: string;
  
  /**
   * Amazon marketplace ID
   */
  marketplaceId: string;
  
  /**
   * LWA refresh token
   */
  refreshToken: string;
  
  /**
   * LWA client ID
   */
  clientId: string;
  
  /**
   * LWA client secret
   */
  clientSecret: string;
  
  /**
   * AWS region (e.g., 'us-east-1')
   */
  region?: string;
  
  /**
   * AWS endpoint (e.g., 'https://sellingpartnerapi-na.amazon.com')
   */
  endpoint?: string;
  
  /**
   * AWS role ARN
   */
  roleArn?: string;
}

/**
 * Shopify marketplace credentials
 */
export interface ShopifyCredentials extends MarketplaceCredentials {
  /**
   * Shopify store domain (e.g., 'example.myshopify.com')
   */
  storeDomain: string;
  
  /**
   * Shopify API key
   */
  apiKey: string;
  
  /**
   * Shopify API secret
   */
  apiSecret: string;
  
  /**
   * Shopify access token (for private apps)
   */
  accessToken?: string;
  
  /**
   * Shopify API version (e.g., '2023-07')
   */
  apiVersion?: string;
}

/**
 * Takealot marketplace credentials
 */
export interface TakealotCredentials extends MarketplaceCredentials {
  /**
   * Takealot API key
   */
  apiKey: string;
  
  /**
   * Takealot API secret
   */
  apiSecret: string;
  
  /**
   * Takealot seller ID
   */
  sellerId: string;
  
  /**
   * Takealot environment (e.g., 'production', 'sandbox')
   */
  environment?: 'production' | 'sandbox';
}

/**
 * Creates marketplace credentials with defaults based on the marketplace type
 */
export function createCredentials(
  type: 'amazon' | 'shopify' | 'takealot' | string,
  data: Partial<MarketplaceCredentials>
): MarketplaceCredentials {
  const baseCredentials: MarketplaceCredentials = {
    settings: {}
  };
  
  switch (type) {
    case 'amazon':
      return {
        ...baseCredentials,
        region: 'us-east-1',
        endpoint: 'https://sellingpartnerapi-na.amazon.com',
        ...data
      };
    
    case 'shopify':
      return {
        ...baseCredentials,
        apiVersion: '2023-07',
        ...data
      };
    
    case 'takealot':
      return {
        ...baseCredentials,
        environment: 'production',
        ...data
      };
    
    default:
      return {
        ...baseCredentials,
        ...data
      };
  }
}