# Shopify Marketplace Adapter

This adapter implements the `IMarketplaceAdapter` interface for interacting with the Shopify Admin API. It provides a standardized way to manage products, inventory, and orders on Shopify stores.

## Features

- Authentication using API access tokens or API key/secret pairs
- Product management (fetch, update stock, update prices, update status)
- Order management (fetch, acknowledge, update status)
- Rate limiting using the leaky bucket algorithm
- Data conversion between Shopify and Fluxori's standardized formats

## Configuration

The adapter uses the configuration from `shopifyConfig` in `/src/modules/marketplaces/config/shopify.config.ts`:

```typescript
interface ShopifyConfig {
  apiVersion: string;
  defaultTimeout: number;
  maxRetries: number;
  initialRetryDelay: number;
  callsPerSecond: number;
  bucketSize: number;
}
```

These values can be customized using environment variables:

- `SHOPIFY_API_VERSION` - Default: '2023-10'
- `SHOPIFY_API_TIMEOUT` - Default: 30000 (30 seconds)
- `SHOPIFY_API_MAX_RETRIES` - Default: 3
- `SHOPIFY_API_RETRY_DELAY` - Default: 1000 (1 second)
- `SHOPIFY_CALLS_PER_SECOND` - Default: 2
- `SHOPIFY_BUCKET_SIZE` - Default: 40

## Usage

### Initialize the Adapter

```typescript
import { ShopifyAdapter } from '../modules/marketplaces';

const shopifyAdapter = new ShopifyAdapter();

// Using access token (recommended)
await shopifyAdapter.initialize({
  shopDomain: 'your-store.myshopify.com',
  accessToken: 'your-shopify-access-token'
});

// OR using API key and secret
await shopifyAdapter.initialize({
  shopDomain: 'your-store.myshopify.com',
  apiKey: 'your-shopify-api-key',
  apiSecret: 'your-shopify-api-secret'
});
```

### Fetch Products

```typescript
// Get products with pagination
const products = await shopifyAdapter.getProducts(0, 50, {
  status: 'active',
  keywords: 'searchterm',
  updatedAfter: new Date('2023-01-01')
});

// Get a product by SKU
const product = await shopifyAdapter.getProductBySku('ABC123');

// Get multiple products by SKUs
const products = await shopifyAdapter.getProductsBySkus(['ABC123', 'XYZ789']);
```

### Update Products

```typescript
// Update inventory levels
const stockResult = await shopifyAdapter.updateStock([
  { sku: 'ABC123', quantity: 10 },
  { sku: 'XYZ789', quantity: 5, warehouseId: 'specific-location-id' }
]);

// Update prices
const priceResult = await shopifyAdapter.updatePrices([
  { sku: 'ABC123', price: 29.99 },
  { sku: 'XYZ789', price: 39.99, salePrice: 34.99 }
]);

// Update product status
const statusResult = await shopifyAdapter.updateStatus([
  { sku: 'ABC123', status: 'active' },
  { sku: 'XYZ789', status: 'inactive' }
]);
```

### Fetch Orders

```typescript
// Get orders with pagination
const orders = await shopifyAdapter.getOrders(0, 50, {
  orderStatus: 'processing',
  createdAfter: new Date('2023-01-01')
});

// Get an order by ID
const order = await shopifyAdapter.getOrderById('12345678');
```

### Manage Orders

```typescript
// Acknowledge an order
const ackResult = await shopifyAdapter.acknowledgeOrder('12345678');

// Fulfill an order with tracking information
const statusResult = await shopifyAdapter.updateOrderStatus(
  '12345678',
  'shipped',
  {
    carrier: 'USPS',
    trackingNumber: '1Z999AA10123456789',
    shippedDate: new Date()
  }
);

// Cancel an order
const cancelResult = await shopifyAdapter.updateOrderStatus('12345678', 'cancelled');
```

## Implementation Details

- The adapter uses the official `@shopify/admin-api-client` library for API interactions
- Rate limiting is implemented using a custom leaky bucket algorithm that respects Shopify's API limits
- Uses robust error handling and retry mechanisms for API calls
- Automatically detects and uses the primary location for inventory operations
- Mapping between Shopify-specific data structures and Fluxori's standardized marketplace models

## Dependencies

- `@shopify/admin-api-client`: Official Shopify Admin API client library
- Core Fluxori marketplace module interfaces and base classes