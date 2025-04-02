# Product Ingestion & PIM Update Service

This service receives product/listing/inventory data from various marketplaces, maps it to Fluxori's internal Product/Inventory model, and performs basic updates to the central Fluxori records.

## Features

- Receives product data from the Sync Orchestrator
- Maps marketplace-specific product formats to Fluxori's standardized format
- Creates new products if they don't exist in Fluxori
- Updates stock levels from trusted sources (configurable)
- Logs differences between Fluxori and marketplace data for later reconciliation
- Supports multi-warehouse inventory management
- Configurable per-marketplace sync rules

## Architecture

### Core Components

- **Product Model**: Defines the standardized product schema with multi-warehouse support
- **Product Sync Config**: Manages sync configuration per marketplace
- **Warehouse Model**: Manages physical and virtual warehouses
- **Product Mappers**: Marketplace-specific converters for product data
- **Product Ingestion Service**: Processes, transforms, and stores products

### Product Sync Configuration

Each marketplace connection can be configured with:

- **Create Products**: Whether to create new products based on marketplace data
- **Stock Sync Direction**: Update stock levels from marketplace to Fluxori, vice versa, or both
- **Price Sync Direction**: Update prices from marketplace to Fluxori, vice versa, or both
- **Product Data Sync Direction**: Update product details from marketplace to Fluxori, vice versa, or both
- **Log Conflicts**: Whether to log differences for later reconciliation

## Usage

```typescript
import { productIngestionService, productSyncConfigService } from './modules/product-ingestion';

// Process products from a marketplace
await productIngestionService.processProducts(
  marketplaceProducts, // Array of marketplace products
  userId,
  organizationId,
  marketplaceId
);

// Get or update sync configuration
const syncConfig = await productSyncConfigService.getSyncConfig(
  userId,
  organizationId,
  marketplaceId
);
```

## Multi-Warehouse Support

The service supports multiple warehouses with:

- **Physical Warehouses**: Traditional storage locations
- **Virtual Warehouses**: For virtual inventory
- **Marketplace-Specific Warehouses**: Such as Amazon FBA
- **Default Warehouse**: For general product storage

Each product can have different stock levels in different warehouses, and stock updates are warehouse-specific.

## Conflict Handling

When differences are detected between Fluxori and marketplace data, they're logged as conflicts with:

- Field name
- Fluxori value
- Marketplace value
- Detection time
- Resolution status

These conflicts can be reviewed and resolved in future phases.

## Extension

### Adding Support for New Marketplaces

To add support for a new marketplace:

1. Create a new mapper class implementing `IProductMapper`
2. Register the mapper in `mappers/index.ts`
3. No changes needed to the ingestion service itself

### Adding New Sync Rules

To add new sync rules:

1. Extend the `ProductSyncConfig` model
2. Update the `processProduct` method in the ingestion service
3. Add UI controls for managing the new rules