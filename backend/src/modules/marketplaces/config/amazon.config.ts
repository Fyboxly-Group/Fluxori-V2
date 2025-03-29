/**
 * Amazon SP-API specific configuration
 */
export const amazonConfig = {
  // API endpoints
  apiBaseUrls: {
    na: 'https://sellingpartnerapi-na.amazon.com',
    eu: 'https://sellingpartnerapi-eu.amazon.com',
    fe: 'https://sellingpartnerapi-fe.amazon.com', // Far East
    default: 'https://sellingpartnerapi-na.amazon.com'
  },
  
  // Authentication configuration
  auth: {
    tokenUrl: 'https://api.amazon.com/auth/o2/token',
    tokenExpiryBufferMs: 300000, // 5 minutes buffer before actual expiry
    refreshTokenExpiryDays: 365, // Refresh tokens are valid for 1 year
  },
  
  // AWS Signature V4 configuration
  awsAuth: {
    service: 'execute-api',
    defaultRegion: 'us-east-1',
    signingAlgorithm: 'AWS4-HMAC-SHA256'
  },
  
  // Request configuration
  request: {
    timeout: 30000, // 30 seconds
    userAgent: 'Fluxori/1.0 (Language=TypeScript)',
    maxContentLength: 10485760, // 10MB
  },
  
  // Rate limiting configuration
  rateLimits: {
    // Rate limits are per seller account across all applications
    // These are conservative default values
    default: {
      restoreRatePerSecond: 0.5, // Token bucket refill rate
      burstCapacity: 5 // Token bucket max capacity
    },
    
    // Section-specific rate limits
    catalogItems: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5
    },
    listings: {
      restoreRatePerSecond: 0.5, 
      burstCapacity: 5
    },
    pricing: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 10
    },
    fbaInventory: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5
    },
    fbaOutbound: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5
    },
    orders: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5
    },
    reports: {
      restoreRatePerSecond: 0.1, // Lower rate for reports
      burstCapacity: 2
    }
  },
  
  // Retry configuration
  retry: {
    initialDelayMs: 100,
    maxDelayMs: 30000, // 30 seconds
    maxRetries: 5,
    retryableStatusCodes: [429, 500, 502, 503, 504]
  },
  
  // Batch processing configuration
  batch: {
    maxBatchSize: 20, // Maximum items per batch request
    defaultDelayBetweenBatchesMs: 200 // 200ms delay between batches
  },
  
  // Common marketplace IDs
  marketplaceIds: {
    US: 'ATVPDKIKX0DER',
    CA: 'A2EUQ1WTGCTBG2',
    MX: 'A1AM78C64UM0Y8',
    UK: 'A1F83G8C2ARO7P',
    DE: 'A1PA6795UKMFR9',
    FR: 'A13V1IB3VIYZZH',
    IT: 'APJ6JRA9NG5V4',
    ES: 'A1RKKUPIHCS9HS',
    IN: 'A21TJRUUN4KGV',
    JP: 'A1VC38T7YXB528',
    AU: 'A39IBJ37TRP1C6',
    AE: 'A2VIGQ35RCS4UG',
    defaultMarketplace: 'ATVPDKIKX0DER' // US marketplace as default
  },
  
  // API version information
  apiVersions: {
    catalogItems: '2022-04-01',
    listings: '2021-08-01',
    pricing: '2022-05-01',
    fbaInventory: '2022-05-01',
    fbaOutbound: '2020-07-01',
    orders: '2022-03-01',
    reports: '2021-06-30'
  }
};