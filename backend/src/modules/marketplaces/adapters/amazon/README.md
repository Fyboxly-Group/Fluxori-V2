# Amazon Marketplace Adapter

This adapter implements comprehensive integration with the Amazon Selling Partner API (SP-API) for the Fluxori platform. It provides standardized methods for product management, order processing, inventory planning, reporting, and feed submission.

## Features

- **Latest API Versions**: Uses the most current versions of Amazon's Selling Partner APIs
  - Catalog API: 2022-04-01
  - Orders API: v0
  - Listings API: 2021-08-01
  - Pricing API: 2022-05-01
  - FBA Inventory API: 2022-05-01
  - Reports API: 2021-06-30
  - Feeds API: 2021-06-30

- **Enhanced Catalog API Integration**:
  - Support for expanded `includedData` parameters
  - Comprehensive filtering with brand names, classification IDs, and keywords
  - Token-based pagination for efficient result handling

- **Advanced Orders API Implementation**:
  - Complete order status mapping
  - Advanced order filtering and search
  - Support for all Amazon order statuses
  - Order fulfillment feed submission
  - Order acknowledgment processing

- **Sophisticated Rate Limiting**:
  - Token bucket algorithm implementation
  - Per-endpoint rate limit tracking
  - Proactive rate limit management
  - Daily quota tracking

- **Reports Management**:
  - Report request and scheduling
  - Report status tracking
  - Report download and parsing
  - Support for all Amazon report types

- **Feed Submission**:
  - Inventory update feeds
  - Price update feeds
  - Order fulfillment feeds
  - Multiple feed format support (XML, TSV, CSV)

- **Inventory Planning and Optimization**:
  - Sales velocity analysis
  - Inventory level recommendations
  - Excess inventory identification
  - Low stock alerts
  - Reorder planning with constraints
  - Inventory health assessment

- **Type Safety**:
  - Generated TypeScript interfaces from official Amazon SP-API schemas
  - Strongly typed responses and requests

- **Error Handling**:
  - Specialized error types for all Amazon API operations
  - Comprehensive error mapping
  - Context-aware error reporting

- **Authentication**:
  - AWS Signature V4 implementation
  - Automatic token refresh
  - Login with Amazon (LWA) flow

## Usage

### Initialization

```typescript
import { AmazonAdapter } from './adapters/amazon/amazon.adapter';

// Create and initialize the adapter
const amazonAdapter = new AmazonAdapter();
await amazonAdapter.initialize({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  refreshToken: 'your-refresh-token',
  sellerId: 'your-seller-id',
  amazonMarketplaceId: 'ATVPDKIKX0DER', // US marketplace
  awsAccessKey: 'your-aws-access-key',
  awsSecretKey: 'your-aws-secret-key'
});
```

### Fetching Products

```typescript
// Simple product retrieval by SKU
const productResult = await amazonAdapter.getProductBySku('YOUR-SKU');

// Get multiple products by SKUs
const productsResult = await amazonAdapter.getProductsBySkus(['SKU1', 'SKU2']);

// Standard paginated product retrieval
const productsPage = await amazonAdapter.getProducts(0, 20);

// Advanced filtering
const filteredProducts = await amazonAdapter.getProducts(0, 20, {
  keywords: 'bluetooth headphones',
  brandNames: ['Sony', 'Bose'],
  status: 'active',
  minPrice: 19.99,
  maxPrice: 99.99,
  sortBy: 'price',
  sortOrder: 'asc'
});

// Using token-based pagination
let pageToken = null;
do {
  const page = await amazonAdapter.getProducts(0, 20, { pageToken });
  // Process page.data
  pageToken = page.pageToken;
} while (pageToken);
```

### Working with Orders

```typescript
// Get recent orders (legacy method)
const sinceDate = new Date();
sinceDate.setDate(sinceDate.getDate() - 14); // Last 14 days
const recentOrders = await amazonAdapter.getRecentOrders(sinceDate, 0, 20);

// Using the enhanced getOrders method with advanced filtering
const orders = await amazonAdapter.getOrders(0, 20, {
  // Date filters
  createdAfter: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
  
  // Status filters
  orderStatus: [OrderStatus.PROCESSING, OrderStatus.PARTIALLY_SHIPPED],
  
  // Fulfillment type
  fulfillmentType: 'seller_fulfilled', // Only merchant-fulfilled orders
  
  // Prime/Premium orders
  isPriority: true,
  
  // Filter by specific product
  productSku: 'YOUR-SKU',
  
  // Control whether to include order items
  includeOrderItems: true
});

// Using token-based pagination for orders
let orderPageToken = null;
do {
  const orderPage = await amazonAdapter.getOrders(0, 20, { 
    pageToken: orderPageToken,
    createdAfter: sinceDate
  });
  // Process orderPage.data
  orderPageToken = orderPage.pageToken;
} while (orderPageToken);

// Get order details
const orderDetails = await amazonAdapter.getOrderById('123-1234567-1234567');

// Acknowledge an order
const ackResult = await amazonAdapter.acknowledgeOrder('123-1234567-1234567');

// Update order status (for merchant-fulfilled orders)
const updateResult = await amazonAdapter.updateOrderStatus(
  '123-1234567-1234567',
  'shipped',
  {
    carrier: 'UPS',
    trackingNumber: '1Z999AA10123456789',
    shippedDate: new Date()
  }
);
```

### Inventory Management

```typescript
// Update stock levels
const stockResult = await amazonAdapter.updateStock([
  { sku: 'SKU1', quantity: 25 },
  { sku: 'SKU2', quantity: 10 }
]);

// Update prices
const priceResult = await amazonAdapter.updatePrices([
  { sku: 'SKU1', price: 29.99, currencyCode: 'USD' },
  { sku: 'SKU2', price: 19.99, currencyCode: 'USD' }
]);

// Update product status
const statusResult = await amazonAdapter.updateStatus([
  { sku: 'SKU1', status: ProductStatus.ACTIVE },
  { sku: 'SKU2', status: ProductStatus.INACTIVE }
]);
```

### Reports API

```typescript
// Request a specific report type
const reportRequest = await amazonAdapter.requestReport(
  AmazonReportType.INVENTORY_REPORT,
  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),  // 30 days ago
  new Date()  // Now
);

// Check report status
const recentReports = await amazonAdapter.getRecentReports(
  [AmazonReportType.INVENTORY_REPORT]
);

// Request a report and wait for completion
const completeReport = await amazonAdapter.requestAndWaitForReport(
  AmazonReportType.ORDER_REPORT,
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),  // 7 days ago
  new Date()  // Now
);

// Use the report data
if (completeReport.reportData) {
  // Parse CSV, TSV, or other report format
  const lines = completeReport.reportData.split('\n');
  console.log(`Report contains ${lines.length} lines`);
}
```

### Feed Submission

```typescript
// Submit inventory updates in bulk via feed
const inventoryFeed = await amazonAdapter.submitInventoryFeed([
  { sku: 'SKU1', quantity: 100, fulfillmentLatency: 1 },
  { sku: 'SKU2', quantity: 50, fulfillmentLatency: 2 },
  { sku: 'SKU3', quantity: 25, fulfillmentLatency: 3 }
]);

// Submit price updates in bulk via feed
const priceFeed = await amazonAdapter.submitPriceFeed([
  { sku: 'SKU1', price: 19.99 },
  { sku: 'SKU2', price: 29.99, salePrice: 24.99 },
  { 
    sku: 'SKU3', 
    price: 49.99, 
    salePrice: 39.99, 
    saleStartDate: new Date(), 
    saleEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  }
]);

// Submit order acknowledgments
const ackFeed = await amazonAdapter.submitOrderAcknowledgmentFeed([
  { amazonOrderId: '123-1234567-1234567', statusCode: 'Success' },
  { 
    amazonOrderId: '123-7654321-7654321', 
    statusCode: 'Failure',
    reasonCode: 'NoInventory',
    message: 'Out of stock'
  }
]);

// Submit order fulfillment data
const fulfillmentFeed = await amazonAdapter.submitOrderFulfillmentFeed([
  {
    amazonOrderId: '123-1234567-1234567',
    fulfillmentDate: new Date(),
    carrierCode: 'UPS',
    trackingNumber: '1Z999AA10123456789',
    shipMethod: 'Standard',
    items: [
      { orderItemId: '12345678901234', quantity: 1 }
    ]
  }
]);
```

### Inventory Planning and Optimization

```typescript
// Get inventory recommendations for specific SKUs
const recommendations = await amazonAdapter.getInventoryRecommendations(
  ['SKU1', 'SKU2', 'SKU3'], 
  { 
    targetDaysOfCoverage: 90,
    safetyStockDays: 14,
    leadTimeDays: 30,
    salesGrowthFactor: 1.1  // Expect 10% growth
  }
);

// Get sales velocity metrics
const salesMetrics = await amazonAdapter.getSalesVelocityMetrics(
  ['SKU1', 'SKU2', 'SKU3'],
  90  // 90 days of history
);

// Get inventory health assessment
const healthAssessment = await amazonAdapter.assessInventoryHealth(
  ['SKU1', 'SKU2', 'SKU3']
);

// Get low inventory alert report
const lowStockItems = await amazonAdapter.getLowInventoryItems(14);  // Low stock = less than 14 days of coverage

// Get excess inventory report
const excessInventory = await amazonAdapter.getExcessInventoryItems();

// Get optimal reorder plan with budget constraints
const reorderPlan = await amazonAdapter.getOptimalReorderPlan({
  targetDaysOfCoverage: 60,
  safetyStockDays: 14,
  leadTimeDays: 30,
  applyBudgetConstraints: true,
  maxBudget: 10000,  // $10,000 budget
  maxUnits: 1000     // 1,000 units maximum
});
```
```

## Implementation Notes

### Rate Limiting

The adapter implements a sophisticated token bucket algorithm for rate limiting:

1. Each API section has its own token bucket with specific refill rates
2. Tokens are consumed for each request
3. Tokens are replenished over time based on Amazon's rate limits
4. The adapter proactively delays requests when tokens are depleted
5. Implements automatic retry with exponential backoff

### Token Management

Amazon SP-API tokens are automatically refreshed:

1. Access tokens expire after 1 hour
2. The adapter automatically refreshes tokens before expiry
3. Refresh tokens are valid for 1 year
4. Failed auth requests are automatically retried with fresh tokens

### Error Handling

The adapter provides comprehensive error handling through the AmazonErrorUtil class:

1. Specialized error codes for different Amazon API error scenarios
2. Consistent error mapping from Amazon-specific errors to standardized formats
3. Detailed error information including API error codes and messages
4. Context-aware error handling for different operations
5. Automatic handling of common errors:
   - Rate limit errors (HTTP 429) trigger automatic backoff and retry
   - Network errors implement exponential backoff
   - Authentication errors trigger token refresh

### Batch Processing

For efficiency with Amazon's APIs, the adapter implements batch processing utilities:

1. Concurrent batch processing with controlable concurrency levels
2. Automatic retry logic for failed batch operations
3. Exponential backoff with jitter for robust error handling
4. Error isolation to prevent a single failure from affecting all operations
5. Batch size optimization based on Amazon's API limits

Example using the batch processor:

```typescript
// Import utilities
import { processBatches } from './utils/batch-processor';

// Process items in batches with full control
const result = await processBatches(
  itemsToProcess,
  async (batch, batchIndex) => {
    // Process each batch
    return processBatchItems(batch);
  },
  {
    batchSize: 10,                // 10 items per batch
    maxConcurrentBatches: 2,      // Run 2 batches concurrently
    delayBetweenBatchesMs: 500,   // 500ms delay between batches
    continueOnError: true,        // Continue if one batch fails
    maxRetries: 3                 // Retry failed batches up to 3 times
  }
);
```

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Check that your client ID, client secret, and refresh token are valid
   - Ensure your AWS credentials have the necessary permissions

2. **Rate Limiting**
   - If you see many 429 errors, you may need to reduce request frequency
   - Consider implementing client-side caching for frequently accessed data

3. **Inventory Updates Failing**
   - For FBA inventory, stock updates must be made through Seller Central
   - The adapter can only update stock for merchant-fulfilled inventory

4. **Missing Product Data**
   - Some ASIN/SKU combinations may not have complete data
   - Check that the product exists in your Amazon seller account

### Debugging

The adapter logs detailed information about rate limits, retries, and errors. Check the logs for clues about any issues you encounter.