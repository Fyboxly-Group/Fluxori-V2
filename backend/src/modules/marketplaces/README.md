# Marketplace Adapter Abstraction Layer

This module provides a common interface for integrating with various e-commerce marketplaces. It defines a set of standardized interfaces and data structures to ensure consistent interaction with different marketplace APIs.

## Directory Structure

```
marketplaces/
├── adapters/               # Marketplace-specific adapters
│   ├── common/             # Common adapter implementations
│   ├── interfaces/         # Interface definitions
│   └── takealot/           # Example adapter implementation
├── examples/               # Usage examples
├── models/                 # Common data models
├── services/               # Services for adapter management
└── utils/                  # Utility functions and classes
```

## Core Components

### Interfaces

The `IMarketplaceAdapter` interface defines the contract that all marketplace adapters must implement. It includes methods for:

- Authentication and connection
- Product operations (get, update)
- Order operations (fetch, acknowledge)
- Category and attribute operations

### Data Models

Common data structures for marketplace interactions, including:

- `MarketplaceProduct`: Standardized product representation
- `MarketplaceOrder`: Common order format
- `StockUpdatePayload`: Format for stock updates
- `PriceUpdatePayload`: Format for price updates
- `StatusUpdatePayload`: Format for product status updates

### Base Adapter

The `BaseMarketplaceAdapter` abstract class provides:

- Common error handling
- Utility methods for API responses
- Credential management
- Standardized result formatting

### Factory Service

The `MarketplaceAdapterFactory` manages adapter instances:

- Registration of adapter implementations
- Creation of adapter instances
- Lifecycle management of adapters

### Credential Management

The `CredentialManager` utility provides:

- Secure storage of API credentials
- Encryption/decryption of sensitive data
- Masking of credentials for logging

## Usage

### Registering an Adapter

```typescript
import { MarketplaceAdapterFactory } from './marketplaces';
import { CustomMarketplaceAdapter } from './adapters/custom-adapter';

const factory = MarketplaceAdapterFactory.getInstance();
factory.registerAdapter('custom-marketplace', CustomMarketplaceAdapter);
```

### Creating and Using an Adapter

```typescript
import { 
  MarketplaceAdapterFactory, 
  MarketplaceCredentials 
} from './marketplaces';

// Initialize credentials
const credentials: MarketplaceCredentials = {
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret'
};

// Create adapter instance
const adapter = await factory.createAdapter('takealot', credentials);

// Test connection
const status = await adapter.testConnection();
if (status.connected) {
  // Use adapter
  const product = await adapter.getProductBySku('SKU123');
  console.log(product);
}

// Close adapter when done
await adapter.close();
```

### Updating Product Information

```typescript
// Update stock levels
const stockUpdates = [
  { sku: 'SKU123', quantity: 100 },
  { sku: 'SKU456', quantity: 50 }
];

const result = await adapter.updateStock(stockUpdates);

if (result.success) {
  console.log('Updated SKUs:', result.data.successful);
  console.log('Failed SKUs:', result.data.failed);
}
```

## Implementing a New Adapter

To create a new marketplace adapter:

1. Create a new class that extends `BaseMarketplaceAdapter` or implements `IMarketplaceAdapter`
2. Implement all required methods for the specific marketplace
3. Register the adapter with the factory

Example:

```typescript
export class AmazonAdapter extends BaseMarketplaceAdapter {
  readonly marketplaceId: string = 'amazon';
  readonly marketplaceName: string = 'Amazon Marketplace';
  
  // Implement required methods
  async testConnection(): Promise<ConnectionStatus> {
    // Amazon-specific connection logic
  }
  
  async getProductBySku(sku: string): Promise<OperationResult<MarketplaceProduct>> {
    // Amazon-specific product retrieval
  }
  
  // ... other required methods
}
```

## Security Considerations

- API credentials are encrypted at rest
- Sensitive data is masked in logs
- Proper error handling prevents leaking sensitive information

## Error Handling

All methods return standardized `OperationResult` objects with:

- `success`: Boolean indicating success/failure
- `data`: Operation result data (when successful)
- `error`: Error information (when failed)

Example error handling:

```typescript
const result = await adapter.getProductBySku('SKU123');

if (result.success && result.data) {
  // Handle successful result
  console.log(result.data);
} else {
  // Handle error
  console.error(`Error: ${result.error.code} - ${result.error.message}`);
}
```