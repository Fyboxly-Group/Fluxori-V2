# Takealot Marketplace Adapter

This module implements the `IMarketplaceAdapter` interface for the Takealot marketplace, enabling Fluxori-V2 to interact with the Takealot Seller API v2.0.

## Features

The adapter provides comprehensive integration with Takealot's seller functionality:

- **Product Management**
  - Fetch products by SKU, ID, or in bulk
  - Update product stock levels (Leadtime SoH)
  - Update product prices (selling price and RRP)
  - Update product status (active/inactive)

- **Order Management**
  - Fetch recent orders with filtering and pagination
  - Retrieve order details by ID
  - Track order status changes (via webhooks)

- **Batch Operations**
  - Efficiently update multiple products in batches
  - Handle Takealot's batch processing workflow
  - Monitor batch completion status

- **Error Handling & Rate Limiting**
  - Intelligent retry logic with exponential backoff
  - Robust error handling and reporting
  - Automatic rate limit detection and compliance

- **Webhook Integration**
  - Process all Takealot webhook types:
    - New Leadtime Order
    - New Drop Ship Order
    - Sale Status Changed
    - Batch Completed
    - Offer Updated
    - Offer Created

## Implementation Details

### API Version

This adapter implements Takealot's Seller API v2.0, which includes several improvements over v1:

- Updated terminology (e.g., GTIN → barcode, price → selling_price)
- Improved offer status management via status_action
- Enhanced leadtime stock handling with warehouse-specific quantities

### Data Mapping

The adapter handles bidirectional mapping between Takealot's API data structures and Fluxori's standardized marketplace models:

- `TakealotOffer` ↔ `MarketplaceProduct`
- `TakealotSale` ↔ `MarketplaceOrder`
- Takealot status values ↔ standardized enums

### Authentication

Takealot uses API key authentication. The key is sent in the `X-API-KEY` header for all requests.

### Batch Processing

For bulk operations (updating multiple products), the adapter uses Takealot's batch API:
1. Create a batch with product updates
2. Poll for batch completion
3. Process batch results and report success/failures

### Rate Limiting

The adapter respects Takealot's rate limits (documented as 200 requests per minute), using:
- Rate limit information from response headers
- Automatic backoff when rate limited (429 status)
- Retry mechanism for transient errors

## Configuration

### Environment Variables

The adapter uses the following environment variables:

```
TAKEALOT_API_BASE_URL=https://seller-api.takealot.com
TAKEALOT_API_VERSION=v2
TAKEALOT_API_TIMEOUT=30000
TAKEALOT_API_MAX_RETRIES=3
TAKEALOT_API_RETRY_DELAY=1000
```

### Credentials

To use the adapter, you need to provide Takealot API credentials:

```typescript
const credentials: MarketplaceCredentials = {
  apiKey: "your-takealot-api-key" // Required
};
```

## Webhook Integration

Takealot uses webhooks to provide real-time updates for various events:

1. **Setup**: Configure your webhook URLs in the Takealot Seller Portal
2. **Security**: Takealot signs webhooks with HMAC - the handler verifies this signature
3. **Processing**: The `TakealotWebhookHandler` class processes incoming webhooks

Example Express route for handling webhooks:

```typescript
import { TakealotWebhookHandler } from './takealot-webhook-handler';

// Create webhook handler with your secret
const webhookHandler = new TakealotWebhookHandler('your-webhook-secret');

// Set up Express route
app.post('/webhooks/takealot', webhookHandler.handleWebhook);

// Register custom handlers if needed
webhookHandler.registerHandler('New Leadtime Order', async (payload) => {
  // Custom handling logic
});
```

## Usage Examples

### Initialization

```typescript
import { MarketplaceAdapterFactory } from '../../services/marketplace-adapter-factory.service';

// Get adapter factory
const factory = MarketplaceAdapterFactory.getInstance();

// Initialize credentials
const credentials = { apiKey: process.env.TAKEALOT_API_KEY };

// Create and initialize adapter
const takealotAdapter = await factory.createAdapter('takealot', credentials);
```

### Fetching Products

```typescript
// Get a product by SKU
const productResult = await takealotAdapter.getProductBySku('YOUR-SKU-123');

// Get multiple products
const productResults = await takealotAdapter.getProductsBySkus(['SKU1', 'SKU2', 'SKU3']);

// Get products with pagination
const paginatedProducts = await takealotAdapter.getProducts(0, 20);
```

### Updating Products

```typescript
// Update stock levels
const stockResult = await takealotAdapter.updateStock([
  { sku: 'SKU1', quantity: 100 },
  { sku: 'SKU2', quantity: 50 }
]);

// Update prices
const priceResult = await takealotAdapter.updatePrices([
  { sku: 'SKU1', price: 299.99, salePrice: 249.99 },
  { sku: 'SKU2', price: 149.99 }
]);

// Update product status
const statusResult = await takealotAdapter.updateStatus([
  { sku: 'SKU1', status: ProductStatus.ACTIVE },
  { sku: 'SKU2', status: ProductStatus.INACTIVE }
]);
```

### Working with Orders

```typescript
// Get recent orders
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
const recentOrders = await takealotAdapter.getRecentOrders(sevenDaysAgo, 0, 20);

// Get a specific order
const orderResult = await takealotAdapter.getOrderById('12345');
```

## Limitations

- **Category Data**: Takealot's API doesn't provide access to their category hierarchy or attributes
- **Order Status Updates**: Sellers cannot directly update order statuses via the API
- **Order Details**: Limited customer information is provided for privacy/security reasons
- **Image Uploads**: Product images must be managed through the Takealot Seller Portal