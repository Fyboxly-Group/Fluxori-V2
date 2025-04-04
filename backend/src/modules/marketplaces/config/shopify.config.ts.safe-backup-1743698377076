// TypeScript checked
/**
 * Configuration for Shopify API adapter
 */
export interface ShopifyConfig {
  apiVersion: string;
  defaultTimeout: number;
  maxRetries: number;
  initialRetryDelay: number;
  callsPerSecond: number;
  bucketSize: number
}

export const shopifyConfig: ShopifyConfig = {
  apiVersion: process.env.SHOPIFY_API_VERSION || '2023-10',
  defaultTimeout: parseInt(process.env.SHOPIFY_API_TIMEOUT || '30000', 10),
  maxRetries: parseInt(process.env.SHOPIFY_API_MAX_RETRIES || '3', 10),
  initialRetryDelay: parseInt(process.env.SHOPIFY_API_RETRY_DELAY || '1000', 10),
  callsPerSecond: parseInt(process.env.SHOPIFY_CALLS_PER_SECOND || '2', 10),
  bucketSize: parseInt(process.env.SHOPIFY_BUCKET_SIZE || '40', 10)
};