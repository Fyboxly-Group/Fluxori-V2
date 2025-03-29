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
    // Amazon uses a token bucket algorithm for rate limiting
    // These values are based on the SP-API documentation
    default: {
      restoreRatePerSecond: 0.5, // Token bucket refill rate
      burstCapacity: 5, // Token bucket max capacity
      maximumRequestQuota: 200 // Daily maximum requests
    },
    
    // Section-specific rate limits
    catalogItems: {
      restoreRatePerSecond: 0.5, // 1 request every 2 seconds
      burstCapacity: 5,
      maximumRequestQuota: 200
    },
    listings: {
      restoreRatePerSecond: 0.5, // 1 request every 2 seconds
      burstCapacity: 5,
      maximumRequestQuota: 200
    },
    pricing: {
      restoreRatePerSecond: 0.5, // 1 request every 2 seconds
      burstCapacity: 10,
      maximumRequestQuota: 400
    },
    fbaInventory: {
      restoreRatePerSecond: 0.5, // 1 request every 2 seconds
      burstCapacity: 5,
      maximumRequestQuota: 200
    },
    fbaOutbound: {
      restoreRatePerSecond: 0.5, // 1 request every 2 seconds
      burstCapacity: 5, 
      maximumRequestQuota: 200
    },
    orders: {
      restoreRatePerSecond: 0.0167, // 1 request per minute (0.0167 requests per second)
      burstCapacity: 20, // Based on Orders API documentation
      maximumRequestQuota: 144 // Maximum daily requests
    },
    reports: {
      restoreRatePerSecond: 0.0083, // Approximately 1 request every 2 minutes
      burstCapacity: 2,
      maximumRequestQuota: 60
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
    catalogItems: '2022-04-01', // Latest verified version
    listings: '2021-08-01',
    pricing: '2022-05-01',
    fbaInventory: '2022-05-01',
    fbaOutbound: '2020-07-01',
    orders: 'v0', // Using the latest version based on the repository
    reports: '2021-06-30'
  },
  
  // Catalog API specific configurations
  catalogApi: {
    // Supported includedData parameter values for different catalog item API versions
    includedData: {
      'v0': ['summaries', 'attributes', 'dimensions', 'images', 'productTypes', 'relationships', 'salesRanks'],
      '2020-12-01': ['summaries', 'attributes', 'dimensions', 'images', 'productTypes', 'relationships', 'salesRanks'],
      '2022-04-01': ['attributes', 'identifiers', 'images', 'productTypes', 'relationships', 'salesRanks', 'summaries', 'vendorDetails']
    },
    // Maximum number of items per page (limit) for each version
    maxPageSize: {
      'v0': 10,
      '2020-12-01': 10,
      '2022-04-01': 20
    }
  },
  
  // Orders API specific configurations
  ordersApi: {
    // Order status values supported by the API
    orderStatuses: [
      'PendingAvailability',
      'Pending',
      'Unshipped',
      'PartiallyShipped',
      'Shipped',
      'InvoiceUnconfirmed',
      'Canceled',
      'Unfulfillable'
    ],
    // Maximum number of results per page
    maxResultsPerPage: 100,
    // Maximum date range for order queries in days
    maxDateRangeInDays: 30
  }
};